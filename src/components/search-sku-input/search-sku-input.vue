<template>
	<view class="search-sku-input">
		<!-- 搜索框 -->
		<view class="bg-gray-100 rounded px-3 flex h-10">
			<view class="flex items-center">
				<image class="w-5 h-5" src="/static/svg/search.svg" mode=""></image>
			</view>
			<view class="w-full p-2">
				<input type="text" :disabled="disabled" :value="inputVal" @input="searchInput" placeholder="请输入商品条码" @confirm="search" />
			</view>
			<view class="flex flex-center search-icon" @click="inputVal = ''" v-show="inputVal != '' && isStock" >
				<uni-icons type="closeempty"></uni-icons>
			</view>
			<view class="flex items-center" @click="skuScan">
				<image class="w-5 h-5" src="/static/svg/scan.svg" mode=""></image>
			</view>
			<text class="flex flex-center w-18" @click="search">搜索</text>			
		</view>
		<!-- 下拉框 -->
		<view class="shadow h-32 bg-white down-dialog" v-show="isDown">
			<view class="h-full p-2">
				<view class="item-list p-2" v-for="item in itemlist" :key="item.name" @click="itemClick(item)">
					<text>{{ item.name }}</text>
					<view class="text-xs text-gray-300 mt-1">
						<text>{{ item.value || '' }}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 商品矩阵弹窗 -- 单选 -->
		<van-popup v-model:show="pdtFindDialog" @click-overlay="pdtFindDialog = false" position="bottom">
			<view class="bg-white w-full" style="height: 75vh;">
				<view class="" style="height: calc(100% - 2.5rem);">
					<view class="w-full py-1 text-center font-weight-600">
						选择尺码颜色
					</view>
					<scroll-view
						scroll-y="true"
						style="height: calc(100% - 2.5rem)"
						:lower-threshold="200"
					>
						<view class="" v-for="(color, index) in pdtFind.colors" :key="color.name + index">
							<view class="text-sm bg-gray-100 text-center py-1">
								<text>{{ color.name + '[' + color.code + ']' }}</text>
							</view>
							<view class="bg-white flex flex-wrap p-2">
								<view 
									class="text-center w-20 py-1 m-1 rounded-full bg-gray-100" 
									:class="{'pdtFindSelect': pdtColorId == color.id && pdtSizeId == size.id}" 
									v-for="(size, sIndex) in pdtFind.sizes"
									:key="size.name + sIndex"
									@click="selectSku({colorId: color.id, sizeId: size.id})"
								>
									{{ size.name }}
									<text v-if="pdtColorId == color.id && pdtSizeId == size.id && iso2o">{{ ' (' +  getSkuQty + ') ' }}</text>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
				<view class="flex mt-2 bg-red-400 h-10" v-if="iso2o">
					<view class="flex-1 bg-white flex flex-center" @click="pdtClose">
						<text>取消</text>
					</view>
					<view class="flex-1 text-white flex flex-center" @click="pdtFindOk">
						<text>确定</text>
					</view>
				</view>
				<view class="px-2 flex flex-center mt-2 text-white bg-red-400 h-10" v-else @click="pdtFindOk">
					<text>确定</text>
				</view>
			</view>
		</van-popup>
		<!-- 商品矩阵弹窗 -- 多选 -->
		<van-popup v-model:show="pdtFindMultipleDialog" @click-overlay="pdtFindMultipleDialog = false" position="bottom" v-if="isMultiple">
			<view class="bg-white w-full" style="height: 75vh;">
				<view class="" style="height: calc(100% - 2.5rem);">
					<view class="w-full py-1 text-center font-weight-600">
						选择尺码颜色
					</view>
					<scroll-view
						scroll-y="true"
						style="height: calc(100% - 2.5rem)"
						:lower-threshold="200"
					>
						<view class="" v-for="(color, index) in pdtFind.colors" :key="color.name + index">
							<view class="text-sm bg-gray-100 text-center py-1">
								<text>{{ color.name + '[' + color.code + ']' }}</text>
							</view>
							<view class="bg-white flex flex-wrap p-2">
								<view 
									class="text-center w-20 py-1 m-1 rounded-full bg-gray-100" 
									:class="{'pdtFindSelect': isSelectMultiple(color.id, size.id)}" 
									v-for="(size, sIndex) in pdtFind.sizes"
									:key="size.name + sIndex"
									@click="selectSkuMultiple({colorId: color.id, sizeId: size.id})"
								>
									{{ size.name }}
									<text v-if="pdtColorId == color.id && pdtSizeId == size.id && iso2o">{{ ' (' +  getSkuQty + ') ' }}</text>
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
				<view class="flex mt-2 bg-red-400 h-10" v-if="iso2o">
					<view class="flex-1 bg-white flex flex-center" @click="pdtClose">
						<text>取消</text>
					</view>
					<view class="flex-1 text-white flex flex-center" @click="multipleOk">
						<text>确定</text>
					</view>
				</view>
				<view class="px-2 flex flex-center mt-2 text-white bg-red-400 h-10" v-else @click="multipleOk">
					<text>确定</text>
				</view>
			</view>
		</van-popup>
	</view>
</template>

<script lang="ts">
	import { debounce } from '@/utils/debounce'
	import REQ from '@/utils/http_wx';
	/**
	 * SearchSkuInput 条码矩阵选择组件
	 * @description 用户选择条码矩阵
	 * @property {String} iso2o = [true/false] 是否云仓下单
	 * @property {String} isStock = [true/false] 是否库存查询
	 * @property {String} isMultiple = [true/false] 是否库多选
	 * @property {String} disabled = [true/false] 是否禁用
	 * @property {Boolean} employeeId = [-1] 营业员id
	 * @property {Boolean} leh = [3] 输入框值长度达到多少进行查询
	 * @property {Boolean} value = string 输入框值值
	 * @event {Function} input 弹窗选择完毕返回条码信息
	 */
	export default {
		name:"search-sku-input",
		props: {
			iso2o: {
				type: Boolean,
				default: false
			},
			employeeId: {
				type: [String, Number],
				default: -1
			},
			leh: {
				type: Number,
				default: 3
			},
			isStock: {
				type: Boolean,
				default: false
			},
			isMultiple: {
				type:Boolean,
				default: false
			},
			value: {
				type: String,
				default: ""
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			// 根据颜色和尺码id得到条码的可用数量
			getSkuQty(): number | string {
				let sku = this.pdtFind.skus.find(sku => sku.col_id == this.pdtColorId && sku.size_id == this.pdtSizeId);
				if (sku) {
					return sku.qtyCan || "";
				} else {
					return 0;
				}
			},
			
			// 下拉框是否展示
			isDown(): boolean {
				return this.itemlist.length > 0 && this.inputVal.length > this.leh;
			}
		},
		data() {
			interface PdtFind {
				colors: any[]
				sizes: any[]
				skus: any[]
				value: string
				pricelist?: string | number
			}
			let pdtFind: PdtFind = {
				colors: [],
				sizes: [],
				skus: [],
				value: '',
			}
			let itemlist: any[] = []
			let pdtMultiple: any[] = []
			return {
				inputVal: '',
				pdtColorId: -1,
				pdtSizeId: -1,
				// 矩阵数据
				pdtFind: pdtFind,
				itemlist: itemlist,
				pdtFindDialog: false,
				// 多选
				pdtMultiple: pdtMultiple,
				pdt: {},
				pdtFindMultipleDialog: false
			};
		},
		watch: {
			value(newVal) {
				this.inputVal = this.value
			}
		},
		methods: {
			// 清空
			clearInputValue() {
				this.inputVal = ''
			},
			
			// 输入框input事件
			searchInput(e: any) {
				this.inputVal = e.detail.value.toUpperCase()
				if (this.inputVal.length > this.leh) {
					debounce(this.queryPdtList, this.inputVal)
				}
			},

			// 输入框扫一扫
			skuScan() {
				if (this.disabled) return
				console.log("输入框扫一扫");
				// #ifdef H5
				return uni.showToast({title: "H5页面只支持手工输入", icon: "none"})
				// #endif
				let that = this;
				uni.scanCode({
				    scanType: ['barCode'],
				    success: function (res) {
				        console.log('条码类型：' + res.scanType);
				        console.log('条码内容：' + res.result);
						that.inputVal = res.result.replace(/\s*/g,"");
						that.search();
				    }
				})
			},

			// 输入框搜索
			async search(params = {}) {
				if (this.disabled) return
				console.log("🚀 ~ file: search-sku-input.vue:222 ~ search ~ this.inputVal", this.inputVal)
				if (this.isMultiple) {
					this.pdtQuery(this.inputVal);
					this.itemlist = [];
					console.log('多选点击搜索按钮')
					return
				}
				if (this.isStock) {
					this.$emit("input", {no:this.inputVal});
					return 
				}
				if (!this.inputVal) return uni.showToast({
					title: '请输入需要录入的条码',
					icon: 'none'
				});
				let data = {
					name: this.inputVal, 
					scan_type: 2,
					...params,
				};
				REQ({
					url: 'pos/sku',
					method: 'POST',
					data
				}).then((res: any) => {
					console.log("🚀 ~ file: search-sku-input.vue:247 ~ search ~ res", res)
					if (this.iso2o) {
						this.skuStockQty(res.data.no, res.data.name)
					} else {
						this.$emit("input", res.data)
					}
				}).catch(e => {
					console.log("🚀 ~ file: search-sku-input.vue:247 ~ search ~ e", e)
					if (e.data.msg.indexOf('找不到商品') != -1) this.queryPdtList(this.inputVal, true)
				})
			},

			// 查询条码库存数量
			skuStockQty(name: string, pdtname: string) {
				REQ({
					url: 'pos/stock',
					method: 'POST',
					data: { name }
				}).then((res: any) => {
					console.log("🚀 ~ file: search-sku-input.vue:266 ~ skuStockQty ~ res", res)
					if (res.data.qty > 0) {
						return uni.showModal({
							content: '当前条码库存充足，库存：' + res.data.qty,
							showCancel: false
						});
					} else {
						this.pdtQuery(pdtname);
					}
				})
			},

			// 模糊查询款号
			queryPdtList(name: string, isErr: boolean) {
				REQ({
					url: 'pos/pdt/list',
					method: 'POST',
					data: { name }
				}).then((res: any) => {
					if (res.data.length == 0 && isErr) {
						uni.showModal({
							content: '查询不到商品：' + name,
							showCancel:false
						})
					}
					this.itemlist = res.data
				}).catch(e => {
					console.log("🚀 ~ file: search-sku-input.vue:293 ~ queryPdtList ~ e", e)
				})
			},

			// 点击款号
			itemClick(item: any) {
				if (this.isMultiple) {
					this.pdt = item;
					this.pdtQuery(item.name);
					this.inputVal = item.name;
					this.itemlist = [];
					return
				}
				if (this.isStock) {
					this.inputVal = item.name;
					this.$emit("input", {no:this.inputVal});
					this.itemlist = [];
					return;
				}
				this.inputVal = item.name;
				this.itemlist = [];
				this.pdtQuery(item.name);
			},

			// 查询商品矩阵
			pdtQuery(name: string) {
				REQ({
					url: 'pos/pdt/find',
					method: 'POST',
					data: { name }
				}).then((res: any) => {
					console.log("款号矩阵数据", res.data)
					this.pdtFind = res.data;
					if (this.iso2o) this.queryPdtPrice()
					if (this.isMultiple) {
						// 多选弹窗打开
						this.pdtFindMultipleDialog = true
					} else {
						// 单选弹窗打开
						this.pdtFindDialog = true
					}
				}).catch(e => {
					console.log("查询款号矩阵错误", e)
				});
			},

			// 查询矩阵内条码的零售价格
			queryPdtPrice() {
				let params = this.pdtFind.skus.map(sku => {
					return {
						sku: sku.no
					}
				});
				REQ({
					url: 'pos/retail/price',
					method: 'POST',
					data: params
				}).then((res: any) => {
					const price = res.data;
					Object.keys(price).forEach(key => {
						this.pdtFind.skus.forEach(sku => {
							if (sku.no === key) {
								sku["pricelist"] = price[key]
							}
						})
					})
				}).catch(e => {
					console.log("🚀 ~ file: search-sku-input.vue:338 ~ queryPdtPrice ~ e", e)
				})
			},
			
			// 商品矩阵选择条码
			selectSku({colorId, sizeId}: {colorId: number, sizeId: number}) {
				this.pdtColorId = colorId
				this.pdtSizeId = sizeId
				// 如果是云仓下单，则查询云仓库存接口
				if (this.iso2o) this.o2oStockQty()
			},
			
			// 查询云仓库存数量
			o2oStockQty() {
				let sku = this.pdtFind.skus.find(sku => {
				    return sku.col_id == this.pdtColorId && sku.size_id == this.pdtSizeId
				})
				console.log("🚀 ~ file: search-sku-input.vue:375 ~ o2oStockQty ~ sku", sku)
				let params = [{sku: sku.no, empid: this.employeeId, qty: 1, price: sku.pricelist}];
				REQ({
					url: 'pos/retail/o2o/storage',
					method: 'POST',
					data: params
				}).then((res: any) => {
					let data: any = {}
					res.barcodes.forEach((barcode: string, index: number) => {
						if (!data[barcode]) data[barcode] = 0
						if(res.disable[index] == 'false') data[barcode] = data[barcode] + res.storestock[index]
					})
					Object.keys(data).forEach(key => {
						this.pdtFind.skus.find((sku, index) => {
							if (sku.no == key) {
								this.pdtFind.skus[index] = { ...sku, qtyCan: data[key] }
								return true
							}
							return false
						})
					})
				})
			},

			// 多选选中
			isSelectMultiple(colorId: number, sizeId: number) {
				let item = this.pdtMultiple.find(sku => sku.col_id == colorId && sku.size_id == sizeId)
				if (item) return true
				return false
			},
			
			// 商品矩阵多选选择条码
			selectSkuMultiple({colorId, sizeId}: {colorId: number, sizeId: number}) {
				console.log("🚀 ~ file: search-sku-input.vue:410 ~ selectSkuMultiple ~ sizeId", sizeId)
				console.log("🚀 ~ file: search-sku-input.vue:410 ~ selectSkuMultiple ~ colorId", colorId)
				console.log("🚀 ~ file: search-sku-input.vue:415 ~ selectSkuMultiple ~ this.pdtMultiple", this.pdtMultiple)
				// 查看是否已选择
				let noPush = this.pdtMultiple.find(sku => sku.col_id == colorId && sku.size_id == sizeId);
				if (noPush) {
					// 如果有，则删除
					this.pdtMultiple = this.pdtMultiple.filter(sku => sku.col_id != colorId || sku.size_id != sizeId);
				} else {
					// 拿到选择的条码
					let item = this.pdtFind.skus.find(sku => sku.col_id == colorId && sku.size_id == sizeId);
					console.log("🚀 ~ file: search-sku-input.vue:422 ~ selectSkuMultiple ~ this.pdtFind.skus", this.pdtFind.skus)
					console.log("🚀 ~ file: search-sku-input.vue:424 ~ selectSkuMultiple ~ item", item)
					if (item) this.pdtMultiple.push(item)
						else uni.showToast({ title: '当前颜色尺寸暂无条码', icon: 'none' })
				}
			},
			
			// 商品矩阵点击确定
			pdtFindOk() {
				let value = this.pdtFind.skus.find(sku => sku.col_id == this.pdtColorId && sku.size_id == this.pdtSizeId)
				console.log("🚀 ~ file: search-sku-input.vue:446 ~ pdtFindOk ~ value", value)
				if (!value) return uni.showToast({
					title: '未选择条码',
					icon: 'none'
				})
				if (this.iso2o) return this.o2oFindOk(value)
				this.noO2oFindOk(value)
				this.inputVal = ''
			},
			
			// 非云仓状态下的矩阵确定
			noO2oFindOk(value: any) {
				this.search({name: value.no})
				this.pdtClose();
			},
			
			// 云仓状态下的矩阵确定
			o2oFindOk(value: any) {
				if (!value.qtyCan || value.qtyCan === 0) return uni.showToast({ title: '当前可用云库存不足', icon: 'none' })
				if (value.qtycan > 0) return uni.showToast({ title: '当前可用库存充足，无需云仓下单', icon: 'none' })
				let item = {
					pricelist: this.pdtFind.pricelist,
					qty: 1,
					...value
				};
				this.$emit('input', item)
				this.pdtClose();
			},

			// 商品矩阵点击取消
			pdtClose() {
				this.pdtColorId = -1
				this.pdtSizeId = -1
				this.pdtMultiple = []
				this.pdt = {}
				if (this.isMultiple) {
					// 多选弹窗关闭
					this.pdtFindMultipleDialog = false
				} else {
					// 单选弹窗关闭
					this.pdtFindDialog = false
				}
			},
			
			// 多选下点击确定
			multipleOk() {
				let value = this.pdtMultiple.map((sku: any) => {
					return sku.no;
				});
				console.log("🚀 ~ file: search-sku-input.vue:480 ~ value ~ value", value)
				if (value.length == 0) return uni.showToast({
					title: '请选择颜色尺码!',
					icon: 'none'
				})
				this.$emit('input', {
					multiple: true,
					value,
					pdt: this.pdt
				});
				this.inputVal = '';
				this.pdtClose();
			}
		},
	}
</script>

<style lang="scss">
.search-sku-input {
	position: relative;
	.down-dialog {
		position: absolute;
		width: 100%;
		overflow-y: auto;
		top: calc(2.5rem + 5px);
		z-index: 10;
		.item-list {
			border-bottom: 1px solid #ccc;
		}
	}
}
</style>
