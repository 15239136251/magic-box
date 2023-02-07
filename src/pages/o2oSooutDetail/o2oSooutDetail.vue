<template>
	<!-- 云仓发货详情 -->
	<view class="o2oSooutDetail bg-white text-sm">
		<!-- 订单信息 -->
		<view class="relative border-b px-2 pb-3">
			<view class="title font-weight-600">
				<text>订单信息</text>
			</view>
			<view class="mt-2 text-xs">
				<view class="flex">
					<text class="item-title w-20">订单号：</text>
					<text class="w-full">{{ detail.docno }}</text>
				</view>
				<view class="flex mt-2">
					<text class="item-title w-20">下单店仓：</text>
					<text class="w-full">{{ detail.store }}</text>
				</view>
				<view class="flex mt-2">
					<text class="item-title w-20">买家备注：</text>
					<text class="w-full">{{ detail.buyer_remark }}</text>
				</view>
				<view class="flex mt-2">
					<text class="item-title w-20">下单时间：</text>
					<text class="w-full">{{ detail.cdate }}</text>
				</view>
			</view>
			<view class="detail-status">
				<text class="text-red" v-if="detail.status == 1">待出库</text>
				<text class="text-red" v-else-if="detail.status == 2">已出库</text>
				<text class="text-red" v-else-if="detail.status == 3">已结束</text>
			</view>
		</view>
		<!-- 收件人信息 -->
		<view class="relative border-b px-2 pb-3 mt-2">
			<view class="title font-weight-600">
				<text>收件人信息</text>
			</view>
			<view class="mt-2 text-xs">
				<view class="flex">
					<text class="item-title w-20">姓名：</text>
					<text class="w-full">{{ detail.buyer_name }}</text>
				</view>
				<view class="flex mt-2">
					<text class="item-title w-20">手机号：</text>
					<text class="w-full">{{ detail.buyer_mobile }}</text>
				</view>
				<view class="flex mt-2">
					<text class="item-title w-20">地址：</text>
					<text class="w-full">{{ detail.buyer_address }}</text>
				</view>
			</view>
		</view>
		<!-- 物流信息 -->
		<view class="relative border-b px-2 pb-3 mt-2">
			<view class="title font-weight-600 flex justify-between">
				<text>物流信息</text>
				<text class="text-white bg-gray-400 px-1 py-1 rounded" @click="copy">复制</text>
			</view>
			<view class="text-xs">
				<view class="flex">
					<text class="item-title w-20">物流公司：</text>
					<text class="w-full">{{ detail.delivery_com }}</text>
				</view>
				<view class="flex mt-2">
					<text class="item-title w-20">运单号：</text>
					<text class="w-full">{{ detail.delivery_no }}</text>
				</view>
				<view class="flex mt-2">
					<text class="item-title w-20">寄件码：</text>
					<text class="w-full"></text>
				</view>
			</view>
		</view>
		<!-- 商品信息 -->
		<view class="relative px-2 pb-3 mt-2">
			<view class="title font-weight-600 flex justify-between">
				<text>商品信息</text>
			</view>
			<view class="py-2">
				<search-sku-input :disabled="detail.status == 2" @input="setSearchValue"></search-sku-input>
			</view>
			<scroll-view
				scroll-y="true" 
				class="text-sm"
				style="max-height: 400rpx;"
			>
				<view class="itemlist-item py-2 border-b">
					<view class="flex" v-for="(skuItem, index) in detail.sku_items" :key="skuItem.id">
						<view class="" style="width: 65%;">
							<view class="">
								<text>{{ skuItem.sku }}</text>
							</view>
							<view class="flex mt-2">
								<text class="bg-red-500 text-white px-2 py-1 rounded-full" v-if="skuItem.batchitem" @click="batch(skuItem)">
									批次明细
								</text>
								<text class="bg-red-500 text-white px-2 py-1 rounded-full" v-if="skuItem.msitems && skuItem.msitems.length > 0" @click="only({item: skuItem})">
									唯一码明细
								</text>
							</view>
						</view>
						<view class="flex-1">
							<view class="search-input flex items-center px-1" v-if="(skuItem.msitems && skuItem.msitems.length > 0) || skuItem.batchitem || detail.status == 2">
								<input 
									type="text"
									ref="inputMultiple" 
									style="text-align: center;"
									placeholder=""
									disabled=""
									:value="skuItem.qtyout || 0"
								/>
							</view>
							<input-number :value="skuItem.qtyout" :max="skuItem.qty_doc" @change="inputnumberChange($event, index)" v-else></input-number>
							<view class="flex">
								<view class="border border-solid border-gray-400 text-center rounded mt-2">
									<view class="">
										<text>{{ skuItem.qty }}</text>
									</view>
									<view class="">
										<text>订单数量</text>
									</view>
								</view>
								<view class="border border-solid border-gray-400 text-center rounded mt-2 ml-2">
									<view class="">
										<text>{{ skuItem.returnqty }}</text>
									</view>
									<view class="">
										<text>退货数量</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 底部操作按钮 -->
		<view class="o2oSooutDetail-bottom-btn flex h-10 font-weight-600">
			<view class="flex-1 flex-center flex bg-white" @click="ret">
				<text>返回</text>
			</view>
			<view class="flex-1 flex-center flex bg-gray-400 text-white" @click="oneClickDeliver">
				<text>一键发货</text>
			</view>
		</view>
		<!-- 唯一码弹窗 -->
		<uni-popup ref="onlyDialog" type="bottom" style="z-index: 2001;">
			<view class="bg-white w-full batchDialog overflow-hidden">
				<view class="p-3">
					<view class="w-full text-center">
						唯一码明细
					</view>
					<view class="mt-3 overflow-auto pr-1" style="height: 45vh;">
						<uni-table border class="w-full">
							<uni-tr>
								<uni-th align="center">唯一码</uni-th>
								<uni-th align="center">操作</uni-th>
							</uni-tr>
							<uni-tr v-for="(item, onlyIndex) in getOnly.data" :key="item.mastercode">
								<uni-td style="text-align: center;">{{ item['mastercode'] }}</uni-td>
								<uni-td style="text-align: center;"> 
									<text style="color: red;" @click="deleteOnlyItem({value: item, index: onlyIndex})">删除</text>
								</uni-td>
							</uni-tr>
						</uni-table>
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="border rounded-full px-3 py-1 flex items-center" @click="onlyDialogOut">
							退出
						</view>
						<view class="ml-3 border rounded-full px-3 py-1 flex items-center" @click="onlyDialogOk">
							确定
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
		<!-- 物流公司弹窗 -->
		<uni-popup ref="comDialog" type="center">
			<view class="bg-white w-full overflow-hidden w-72">
				<view class="p-3">
					<view class="w-full text-center">
						物流公司
					</view>
					<view class="text-sm">
						<view 
							class="border border-solid border-gray-200 rounded text-center mt-2 py-1" 
							@click="selectCom({com: logistic, id: logistics.id})" 
							v-for="logistic in logistics.data"
							:key="logistic.comname"
						>
							<view class="font-weight-600">
								<text>{{ logistic.comname }}</text>
							</view>
							<view class="text-gray-400 text-white">
								需要扫码
							</view>
						</view>
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="bg-white border border-solid border-gray-300 rounded px-4 py-1 flex items-center" @click="comDialogClose">
							<text>取消</text>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from "../../components/uni-popup/uni-popup.vue";
	import searchSkuInput from "../../components/search-sku-input/search-sku-input.vue";
	import inputNumber from "../../components/uni-number-box/uni-number-box.vue";
	export default {
		components: { uniPopup, searchSkuInput, inputNumber },
		data() {
			return {
				id: null,
				detail: {},
				logistics: {
					id: null,
					data: []
				},
				getOnly: {
					data: []
				},
			}
		},
		onLoad: function (option) {
			this.id = Number(option.id);
		},
		mounted() {
			this.query();
		},
		methods: {
			// 查询详情
			query() {
				console.log("查询详情：" + this.id);
				let params = {
					m: "o2o_so_detail_query",
					d: {
						id: Number(this.id)
					}
				};
				this.$axios.post("wxo2o", params).then(res => {
					console.log("云仓发货详情", res);
					this.detail = res.data;
					// ms_items
					this.detail.sku_items.forEach(item => {
						this.detail.ms_items.forEach(msitem => {
							if (item.sku_no == msitem.no) {
								if(!item.msitems) item.msitems = []
								item.msitems.push(msitem)
							}
						});
					});
				}).catch(e => {
					console.log("云仓发货详情失败", e);
				});
			},
			
			// 复制
			copy() {
				let data = `${this.detail.delivery_com} ${this.detail.delivery_no}`;
				uni.setClipboardData({
					data,
					success: function () {
						console.log('success');
					}
				});
			},
			
			// 录入明细事件
			setSearchValue(e) {
				if (this.detail.status == 2) return
				console.log("e", e);
				const { no, name, scan_type, value1, value2, mastercode } = e;
				this.detail.sku_items.forEach(skuItem => {
					if (skuItem.sku_no == no) {
						let qtyout = (Number(skuItem.qtyout) || 0) + 1;
						const MAX_COUNT = skuItem.qty_doc;
						if (qtyout <= MAX_COUNT) {
							if (scan_type == 2) {
								if ((!skuItem["msitems"] || skuItem["msitems"].length == 0) && skuItem.qtyout > 0) return uni.showToast({
									title: "当前已有条码，不能添加唯一码",
									icon: "none"
								})
								if (!skuItem["msitems"]) skuItem["msitems"] = [];
								let noPush = skuItem["msitems"].find(msitem => msitem.mastercode == mastercode);
								if (noPush) return uni.showToast({
									title: "已有当前唯一码：" + mastercode,
									icon: "none"
								});
								this.msItemSave(mastercode, "A").then(() => skuItem["msitems"].push({ mastercode }));
							}
							if (scan_type == 1 && skuItem["msitems"] && skuItem["msitems"].length > 0) {
								return uni.showToast({
									title: "当前已有唯一码，不能录入条码",
									icon: "none"
								})
							}
							this.itemSave({...skuItem, qtyout, no: skuItem.sku_no}, "M").then(() => skuItem.qtyout = Number(qtyout));
						} else {
							uni.showModal({ content: "扫描数量超过订单数量减退货数量：" + skuItem.qtyout, showCancel: false });
						}
					}
				});
			},
			
			// 点击唯一码按钮
			only({item}) {
				console.log("item", item);
				this.getOnly["delMsCodes"] = [];
				this.getOnly.no = item.sku_no;
				this.getOnly.qty = item.qty_doc;
				if (item && item.msitems) {
					this.getOnly.data = JSON.parse(JSON.stringify(item.msitems));
				}
				this.$refs.onlyDialog.open();
				console.log("打开唯一码弹窗");
			},
			
			// 删除唯一码
			deleteOnlyItem({value, index}) {
				if (this.detail.status == 2) return;
				console.log("删除当前唯一码明细", value);
				this.getOnly.delMsCodes.push(value["mastercode"]);
				let { data } = this.getOnly;
				data = data.filter((item, ind) => ind != index);
				this.$set(this.getOnly, 'data', data);
			},
			
			// 唯一码弹窗关闭
			onlyDialogOut() {
				console.log("点击退出");
				this.$refs.onlyDialog.close();
			},
			
			// 唯一码弹窗确定
			onlyDialogOk() {
				if (this.detail.status == 2) return this.$refs.onlyDialog.close();
				console.log("点击确定", this.getOnly);
				const { data, no, qty } = this.getOnly;
				let qtyout = data.length;
				if (qtyout > qty) {
					return uni.showToast({
						title: "超出了可出库数量，可出库数量为：" + qty + "，当前数量为：" + qtyout,
						icon: "none"
					});
				}
				let delQty = this.getOnly.delMsCodes.length;
				this.detail.sku_items.forEach(item => {
					if (item.sku_no == no) {
						if (delQty > 0) {
							this.msItemSave(this.getOnly.delMsCodes, "D", true).then(() => {
								item.msitems = data;
								item.qtyout = item.qtyout - delQty;
								this.itemSave({...item, no: item.sku_no}, "M");
							});
						}
					}
				})
				this.$refs.onlyDialog.close();
			},
			
			// 手工修改数量
			inputnumberChange(e, index) {
				console.log("e", e);
				console.log("index", index);
				let row = this.detail.sku_items[index];
				if(e == row.qtyout) return;
				const MAX_COUNT = row.qty_doc;
				let isadd = row.qtyout < e;
				if (e >= MAX_COUNT) {
					row.qtyout = MAX_COUNT;
				} else {
					row.qtyout = e;
				}
				this.itemSave({...this.detail.sku_items[index], no: row.sku_no}, "M").then(() => {
					this.$set(this.detail.sku_items, index, row)
				}).catch(() => {
					if (isadd) row.qtyout = row.qtyout -1;
						else row.qtyout = row.qtyout + 1;
					this.$set(this.detail.sku_items, index, row);
				});
			},
			
			/**
			 * 录入明细是进行保存
			 * @param {Object} item 明细信息
			 * @param {String} action 上传类型，A 新增, M 修改, D 删除， 默认 A
			 * */
			itemSave(item, action = "M") {
				let dt = {
					id: this.id,
					item: [{
						action,
						data: {
							sku: item.no || item.sku,
							qty: item.qtyout
						}
					}]
				}
				console.log("录入明细保存",dt);
				return new Promise((resolve, reject) => {
					this.$axios.post("o2oout/upload", dt, {loadingTitle: "正在保存..."}).then(res => {
						console.log("云仓发货明细保存成功", res)
						if (!this.id) this.id = res.main.id
						resolve()
					}).catch(e => {
						console.log("云仓发货明细保存失败", e);
						reject(e)
					})
				});
			},
			
			/**
			 * 录入唯一码明细是进行保存
			 * @param {Object} msItem 唯一码
			 * @param {String} action 上传类型，A 新增, M 修改, D 删除， 默认 A
			 * @param {Boolean} isArray 是否唯一码数组  
			 * */
			msItemSave(mscode, action = "M", isArray) {
				let dt = {
					id: this.id,
					msitem: [{
						action,
						data: {
							mscode
						}
					}]
				}
				if (isArray) {
					let msitem = mscode.map(ms => {
						return {
							action,
							data: {
								mscode: ms
							}
						}
					});
					dt.msitem = msitem;
				}
				console.log("录入唯一码保存",dt);
				return new Promise((resolve, reject) => {
					this.$axios.post("o2oout/upload", dt, {loadingTitle: "正在保存..."}).then(res => {
						console.log("云仓发货唯一码保存成功", res)
						if (!this.id) this.id = res.main.id
						resolve()
					}).catch(e => {
						console.log("云仓发货唯一码保存失败", e);
						reject(e)
					})
				});
			},
			
			// 返回
			ret() {
				if (this.detail.status == 2) return uni.navigateBack();
				uni.showModal({
				    title: '返回',
				    content: '现在确认要返回吗？',
				    success: function (res) {
				        if (res.confirm) {
				            console.log('用户点击确定');
							uni.navigateBack();
				        } else if (res.cancel) {
				            console.log('用户点击取消');
				        }
				    }
				});
			},
			
			// 一键发货
			oneClickDeliver() {
				if (this.detail.status == 2) return uni.showToast({
					title: "单据已发货",
					icon: "none"
				});
				if (this.detail.status == 3) return uni.showToast({
					title: "单据已结束",
					icon: "none"
				});
				console.log("一键发货，单据id：" + this.id);
				this.logistics.id = this.id;
				this.logistics.data = this.detail.logistics;
				this.$refs.comDialog.open();
			},
			
			// 查询物流公司
			
			// 选择物流公司
			selectCom({com, id}) {
				console.log("选择的物流公司：" + com.comname);
				let that = this;
				uni.scanCode({
				    scanType: ['barCode'],
				    success: function (res) {
				        console.log('条码类型：' + res.scanType);
				        console.log('条码内容：' + res.result);
						let value = res.result;
						that.comApi({...com, fastno: value, sendcode: value}, id);
				    }
				});
				// 京东 -- 测试
				// that.comApi({...com, fastno: "JD123123123123", sendcode: "JD123123123123"}, id);
			},
			
			// 快递接口
			comApi(com, id) {
				let d = {
					id: this.id,
					fastno: com.fastno,
					sendcode: com.sendcode,
					type: com.comno
				};
				if (com.comname === '顺丰速运') d["type"] = 'SF07';
					else if (com.comname === 'EMS快递') d["type"] = 'ems';
						else if (com.comname === '京东快递' || com.comname === '京东快运') d["type"] = 'JDKD';
				console.log("一键发货", d, com.comname);
				let dt = {
					fastno: d.fastno,
					comno: d.type
				};
				if (com.comname && (com.comname == '京东快递' || com.comname === '京东快运')) {
					console.log("京东", dt)
					this.save(dt).then(() => {
						this.restAction({ id, webaction: "SOOUT_JD_WAYBILL_CREATE"});
					});
				} else if (com && com.comname == '顺丰速运') {
					console.log("顺丰",dt)
					this.save(dt).then(() => {
						this.restAction({ id, webaction: "O2O_SOOUT_SF"});
					});
				} else {
					console.log("其他")
					this.$axios.post("wxo2o", { web_action: "express_delivery", d }).then(res => {
						this.comDialogClose();
						console.log("一键发货成功", res);
						this.query();
					}).catch(err => {
						console.log("一键发货失败", err);
					});					
				}
			},
			
			// 保存单据
			save(main) {
				let dt = {
					id: this.id,
					main
				};
				return new Promise((resolve, reject) => {
					this.$axios.post("o2oout/upload", dt, {loadingTitle: "正在保存..."}).then(res => {
						console.log("云仓发货保存成功", res)
						if (!this.id) this.id = res.main.id
						resolve()
					}).catch(e => {
						console.log("云仓发货保存失败", e);
						reject(e)
					})
				});
			},
			
			// 动作定义
			restAction(data) {
				this.$axios.post("rest/action", data, {loadingTitle: "正在提交..."}).then(res => {
					console.log("动作定义成功");
					this.comDialogClose();
					this.query();
				}).catch(e => {
					console.log("动作定义失败");
				});	
			},
			
			// 物流公司弹窗关闭
			comDialogClose() {
				this.$refs.comDialog.close();
			},
		}
	}
</script>

<style scoped>
.o2oSooutDetail {
	width: 100vw;
	height: 100vh;
}
.border-b {
	border-bottom: 1px solid rgba(209, 213, 219);
}
.item-title {
	text-align: right;
}
.detail-status {
	position: absolute;
	top: 10px;
	right: 20px;
}
.o2oSooutDetail-bottom-btn {
	position: fixed;
	left: 0;
	bottom: 0;
	/* z-index: 1999; */
	width: 100%;
}
</style>
