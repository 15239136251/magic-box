<template>
	<!-- 云仓发货 -->
	<view class="o2oSoout overflow-hidden">
		<view class="h-16 flex border-bottom bg-white">
			<view class="flex-1 flex flex-col flex-center border-r">
				<view class="font-weight-600">
					<text>{{ topInfo.readyBills }}</text>
				</view>
				<view class="text-gray-500 text-sm mt-1">
					<text>待发货订单</text>
				</view>
			</view>
			<view class="flex-1 flex flex-col flex-center border-r">
				<view class="font-weight-600">
					<text>{{ topInfo.readyQty }}</text>
				</view>
				<view class="text-gray-500 text-sm mt-1">
					<text>待发数量</text>
				</view>
			</view>
			<view class="flex-1 flex flex-col flex-center border-r">
				<view class="font-weight-600">
					<text>{{ topInfo.today }}</text>
				</view>
				<view class="text-gray-500 text-sm mt-1">
					<text>今日已发</text>
				</view>
			</view>
			<view class="flex-1 flex flex-col flex-center">
				<view class="font-weight-600">
					<text>{{ topInfo.in7Days }}</text>
				</view>
				<view class="text-gray-500 text-sm mt-1">
					<text>7日内已发</text>
				</view>
			</view>
		</view>
		<!-- 标签切换 -->
		<view class="h-8 flex border-bottom text-sm font-weight-600 text-gray-500 bg-white">
			<view class="flex-1 flex flex-center" :class="{'tag-bottom': isTag('待发货')}" @click="tagChange('待发货')">
				<text>待发货</text>
			</view>
			<view class="flex-1 flex flex-center" :class="{'tag-bottom': isTag('已发货')}" @click="tagChange('已发货')">
				<text>已发货</text>
			</view>
			<view class="flex-1 flex flex-center" :class="{'tag-bottom': isTag('已结束')}" @click="tagChange('已结束')">
				<text>已结束</text>
			</view>
			<view class="flex-1 flex flex-center" :class="{'tag-bottom': isTag('我发起的')}" @click="tagChange('我发起的')">
				<text>我发起的</text>
			</view>
		</view>
		<!-- 列表区域 -->
		<view class="o2oSoout-list text-xs">
			<scroll-view 
				:scroll-top="scrollTop"
				scroll-y="true" 
				class="h-full py-2" 
				:lower-threshold="200"
				@scroll="scroll"
			>
				<view class="border border-solid rounded border-gray-300 p-2 bg-white mb-2 relative" v-for="item in list" :key="item.id">
					<view class="flex">
						<view class="w-20">
							<text>订单号：</text>
						</view>
						<view class="">
							<text>{{ item.docno }}</text>
						</view>
						<view class="bg-red-500 ml-1 text-white px-2 text-center" v-if="item.isZT == 'Y'">
							<text>自提</text>
						</view>
					</view>
					<view class="flex mt-2">
						<view class="w-20">
							<text>下单店仓：</text>
						</view>
						<view class="w-full">
							<text>{{ item.store || "" }}</text>
						</view>
					</view>
					<view class="flex mt-2">
						<view class="flex-1 flex">
							<view class="w-16">
								<text>运单号：</text>
							</view>
							<view class="">
								<text>{{ item.yunno || "" }}</text>
							</view>
						</view>
						<view class="flex-2 flex mr-2">
							<view class="w-16">
								<text>快递公司：</text>
							</view>
							<view class="">
								<text>{{ item.yuncompname || "" }}</text>
							</view>
						</view>
					</view>
					<view class="flex mt-2" v-if="isTag('我发起的')">
						<view class="flex-1 flex">
							<view class="w-16">
								<text>物流信息：</text>
							</view>
							<view class="">
								<text>{{ item.kd100_lastest_info || "" }}</text>
							</view>
						</view>
					</view>
					<view class="flex mt-2">
						<view class="flex-1 flex">
							<view class="w-16">
								<text>买家备注：</text>
							</view>
							<view class="">
								<text>{{ item.buyer_memo || "" }}</text>
							</view>
						</view>
					</view>
					<view class="itemlist-item border border-solid mt-2 border-gray-300 py-2 text-red">
						<view class="" v-for="skuItem in item.sku_items" :key="skuItem.id">
							<text>{{ skuItem.sku }}</text>
							<text class="ml-2">订单数量 {{ skuItem.qty }}</text>
							<text class="ml-2">退款数量 {{ skuItem.returnqty }}</text>
						</view>
					</view>
					<view class="itemlist-button flex items-center justify-between mt-2">
						<view class="font-weight-600">
							共计{{ skuItemTotQty(item.sku_items) }}件
						</view>
						<view class="flex items-center">
							<text 
								class="text-blue-400 mr-3" @click="toDetail(item)">查看详情</text>
							<text 
								class="border border-solid border-black text-sm rounded px-3 py-1 mr-3" 
								@click="ret(item)"
								v-if="!isTag('我发起的') && item.status == 1"
							>
								退回
							</text>
							<text 
								class="border border-solid text-sm text-white rounded px-3 py-1 button" 
								@click="pickUpStatus(item)"
								v-if="item.is_pickup == 'Y' && item.pickup_status == 0 && !isTag('我发起的') && item.status == 1"
							>
								备货确认
							</text>
							<text
								class="border border-solid button text-sm text-white rounded px-3 py-1" 
								@click="pickedUp(item)"
								v-else-if="item.is_pickup == 'Y' && item.is_check == 'N' && item.pickup_status == 1 && !isTag('我发起的') && item.status != 2"
							>
								自提确认
							</text>
							<!-- <text 
								v-else-if="!isTag('我发起的') && item.status == 1"
								class="border border-solid button text-sm text-white rounded px-3 py-1" 
								@click="oneClickDeliver(item)"
							>
								一键发货
							</text> -->
							<text
								class="border border-solid button text-sm text-white rounded px-3 py-1" 
								@click="makePhone(item.origMobile)"
								v-if="isTag('我发起的') && item.origMobile"
							>
								联系发货店铺
							</text>
							<text
								class="border border-solid button text-sm text-white rounded px-3 py-1" 
								@click=""
								v-if="isTag('我发起的') && !item.origMobile"
							>
								电话未维护
							</text>
						</view>
					</view>
					<!-- 状态 -->
					<view class="itemlist-status" v-if="item.status == 1">
						<text class="text-red">待出库</text>
					</view>
					<view class="itemlist-status" v-else-if="item.status == 2">
						<text class="text-red">已出库</text>
					</view>
					<view class="itemlist-status" v-else-if="item.status == 3">
						<text class="text-red">已结束</text>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 底部分页按钮 -->
		<view class="o2oSoout-bottom-btn flex h-10 font-weight-600">
			<view class="flex-1 flex-center flex bg-white" @click="pre">
				<text>上一页</text>
			</view>
			<view class="flex-1 flex-center flex bg-gray-400 text-white" @click="next">
				<text>下一页</text>
			</view>
		</view>
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
		<!-- 自提确认弹窗 -->
		<uni-popup ref="pickedUpDialog" type="center">
			<view class="bg-white w-full overflow-hidden w-72">
				<view class="p-3">
					<view class="w-full text-center">
						自提确认
					</view>
					<view class="text-sm flex py-4 items-center">
						<text class="w-16 font-weight-600">自提码：</text>
						<view>
							<input class="border border-solid border-gray-100 px-2 py-1" type="text" v-model="pickedUpValue" />
						</view>
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="bg-white border border-solid border-gray-300 rounded px-4 py-1 flex items-center" @click="pickedUpDialogClose">
							<text>取消</text>
						</view>
						<view class="bg-white bg-red-500 text-white rounded px-4 py-1 flex items-center ml-2" @click="pickedUpDialogOk">
							<text>确认</text>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
		<!-- 退回弹窗 -->
		<uni-popup ref="retDialog" type="center">
			<view class="bg-white w-full overflow-hidden w-72">
				<view class="p-3">
					<view class="w-full text-center font-weight-600">
						退回确认
					</view>
					<view class="text-sm flex py-2 items-center" v-for="backReason in backReasons" :key="backReason.id" @click="backReasonClick(backReason)">
						<view>
							<radio value="" color="red" :checked="retValue == backReason.id" />
						</view>
						<text class="w-20 font-weight-600 ml-2">{{ backReason.name }}：</text>
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="bg-white border border-solid border-gray-300 rounded px-4 py-1 flex items-center" @click="retDialogClose">
							<text>取消</text>
						</view>
						<view class="bg-white bg-red-500 text-white rounded px-4 py-1 flex items-center ml-2" @click="retDialogOk">
							<text>确认</text>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
		<!-- 退回原因弹窗 -->
		<uni-popup ref="retRemarkDialog" type="center">
			<view class="bg-white w-full overflow-hidden w-72">
				<view class="p-3">
					<view class="w-full text-center font-weight-600">
						退回原因
					</view>
					<view class="text-sm flex py-2 items-center">
						<textarea class="h-40 border border-solid" style="padding: 3px;" v-model="retValue" placeholder="请输入退货原因" />
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="bg-white border border-solid border-gray-300 rounded px-4 py-1 flex items-center" @click="retRemarkDialogClose">
							<text>取消</text>
						</view>
						<view class="bg-white bg-red-500 text-white rounded px-4 py-1 flex items-center ml-2" @click="retRemarkDialogOk">
							<text>确认</text>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from "../../components/uni-popup/uni-popup.vue";
	export default {
		components: { uniPopup },
		data() {
			return {
				topInfo: {
					"in7Days": 0,
					"today": 0,
					"readyQty": 0,
					"readyBills": 0
				},
				tag: "待发货",
				scrollTop: 0,
				listtype: "ready",
				old: {
					scrollTop: 0
				},
				list: [],
				pickedUpValue: "",
				pickedUpId: -1,
				page: 1,
				logistics: {
					id: null,
					data: []
				},
				retValue: "",
				backReasons: [],
				backReasonDocnoId: null,
				retRemark: "",
				show: false
			}
		},
		onShow() {
			if (this.show) {
				this.query();
				this.queryTotal();
			}
		},
		mounted() {
			this.query();
			this.queryTotal();
			this.queryBackReason();
			this.show = true;
		},
		methods: {
			// 判断是否为当前标签
			isTag(tag) {
				return tag === this.tag;
			},
			
			// 改变当前标签
			tagChange(tag) {
				this.tag = tag;
				if (this.tag === '待发货') this.listtype = "ready"
					else if (this.tag === '已发货') this.listtype = "done"
						else if (this.tag === '已结束') this.listtype = "close"
							else if (this.tag === '我发起的') this.listtype = "me"
				this.page = 1;
				this.query();
			},
			
			// 查询列表
			query() {
				this.$axios.post("wxo2o", { m: "o2o_so_list_query", d: { page: this.page, type: this.listtype } }).then(res => {
					console.log("云仓列表查询成功", res);
					this.list = res.data;
					// is_pickup 是否自提，Y自提，N逻辑
					// pickup_status，is_ready，意义相同，都是是否备货。建议用pickup_status
					// is_check 是否核销。N 未核销，Y已经核销。
				}).catch(e => {
					console.log("云仓列表查询失败", e);
				});
			},
			
			// 查询统计信息
			queryTotal() {
				this.$axios.post("wxo2o", { m: "o2o_so_summary_query", d: "" }).then(res => {
					console.log("云仓统计查询成功", res);
					this.topInfo = res.data;
				}).catch(e => {
					console.log("云仓统计查询失败", e);
				});
			},
			
			// 得到明细的总数量
			skuItemTotQty(array = []) {
				let qty = 0;
				array.forEach(item => {
					qty = qty + item.qty;
				})
				return qty;
			},
			
			// 获取下滑位置
			scroll(e) {
				this.old.scrollTop = e.detail.scrollTop;
			},
			
			// 前往详情页
			toDetail(item) {
				console.log("前往详情页，单据id：" + item.id);
				uni.navigateTo({
				    url: "/pages/o2oSooutDetail/o2oSooutDetail?id=" + item.id
				});
			},
			
			// 查询退回原因
			queryBackReason() {
				this.$axios.post("wxo2o", { m: "o2o_soout_type_loading", d: "back_reason" }).then(res => {
					console.log("退货原因查询成功", res);
					this.backReasons = res.data;
				}).catch(e => {
					console.log("退货原因查询失败", e);
				})
			},
			
			// 退回
			ret(item) {
				console.log("退回单据，单据id：" + item.id);
				this.backReasonDocnoId = item.id;
				// this.$refs.retDialog.open();
				this.$refs.retRemarkDialog.open();
			},
			
			// 选择退回原因
			backReasonClick(backReason) {
				this.retValue = backReason.id;
			},

			// 退回弹窗确认
			retDialogOk() {
				const backReason = this.backReasons.find(backReason => backReason.id == this.retValue);
				let d = {
					id: this.backReasonDocnoId,
					action: "back",
					reaid: backReason.id,
					rearemark: backReason.name
				};
				this.$axios.post("wxo2o", { m: "o2o_soout_action", d }, {loadingTitle: "正在提交..."}).then(res => {
					console.log("退回成功", res);
					uni.showToast({
						title: "退回成功"
					})
					this.retValue = ""
					this.query();
					this.queryTotal();
					this.retDialogClose();
				}).catch(e => {
					console.log("退回失败", e);
				});
			},
			
			// 退回弹窗关闭
			retDialogClose() {
				this.$refs.retDialog.close();
			},
			
			// 退回原因弹窗关闭
			retRemarkDialogClose() {
				this.$refs.retRemarkDialog.close();
			},
			
			// 退回原因弹窗确定
			retRemarkDialogOk() {
				let d = {
					id: this.backReasonDocnoId,
					action: "back",
					// reaid: null,
					rearemark: this.retValue
				};
				this.$axios.post("wxo2o", { m: "o2o_soout_action", d }, {loadingTitle: "正在提交..."}).then(res => {
					console.log("退回成功", res);
					uni.showToast({
						title: "退回成功"
					})
					this.retValue = ""
					this.query();
					this.queryTotal();
					this.retRemarkDialogClose();
				}).catch(e => {
					console.log("退回失败", e);
				});
			},
			
			// 点击备货
			pickUpStatus(item) {
				let that = this;
				let id = item.id;
				uni.showModal({
					content: "确认备货？",
					success:function(res){
						if (res.confirm) {
							console.log('用户点击确定');
							let params = { id, action: "pickup_ready" };
							that.pickUpStatusApi(params);
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					},
					fail:function(e){
						console.log("点击备货弹窗失败", e);
					}
				})
			},
			
			// 备货接口
			pickUpStatusApi(params) {
				this.$axios.post("o2o/pickup/upload", params).then(res => {
					console.log("备货成功", res);
					this.query();
					this.queryTotal();
				}).catch(e => {
					console.log("备货失败", e);
				});
			},
			
			// 自提确认
			pickedUp(item) {
				console.log("自提单据，单据id：" + item.id);
				this.pickedUpId = item.id;
				this.$refs.pickedUpDialog.open();
			},
			
			// 自提弹窗取消
			pickedUpDialogClose() {
				this.pickedUpId = -1;
				this.$refs.pickedUpDialog.close();
			},
			
			// 自提弹窗确认
			pickedUpDialogOk() {
				if (!this.pickedUpValue) return uni.showToast({
					title: "请输入自提码",
					icon: "none"
				});
				this.pickedUpApi();
			},
			
			// 自提接口
			pickedUpApi() {
				let params = {
					id: this.pickedUpId,
					action: "upcheckcode",
					checkcode: this.pickedUpValue
				};
				this.$axios.post("o2o/pickup/action", params).then(res => {
					console.log("自提成功", res);
					this.query();
					this.queryTotal();
					this.pickedUpDialogClose();
				}).catch(e => {
					console.log("自提失败", e);
				});
			},
			
			// 一键发货
			oneClickDeliver(item) {
				// console.log("一键发货，选择物流公司，单据id：" + item.id);
				this.logistics.data = item.logistics;
				this.logistics.id = item.id;
				this.$refs.comDialog.open();
			},
			
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
			},
			
			// 快递接口
			comApi(com, id) {
				let d = {
					id,
					fastno: com.fastno,
					sendcode: com.sendcode,
					type: com.comno
				};
				if (com.comname === '顺丰速运') d["type"] = 'sf';
					else if (com.comname === 'EMS快递') d["type"] = 'ems';
						else if (com.comname === '京东快递' || com.comname === '京东快运') d["type"] = 'jd';
				console.log("一键发货", d, com.comname);
				this.$axios.post("wxo2o", { web_action: "express_delivery", d }).then(res => {
					this.comDialogClose();
					this.query();
					this.queryTotal();
					console.log("一键发货成功", res);
				}).catch(err => {
					console.log("一键发货失败", err);
				});
			},
			
			// 物流公司弹窗关闭
			comDialogClose() {
				this.$refs.comDialog.close();
			},
			
			// 拨打电话
			makePhone(phoneNumber) {
				uni.makePhoneCall({
					phoneNumber,
					success:function(res){
						console.log("拨打电话成功", res);
					},
					fail:function(err){
						console.log("拨打电话失败", err);
					}
				});
			},
			
			// 上一页
			pre() {
				console.log("上一页");
				if (this.page == 1) return;
				this.page = this.page - 1;
				this.query();
			},
			
			// 下一页
			next() {
				console.log("下一页");
				this.page = this.page + 1;
				this.query();
			}
		}
	}
</script>

<style scoped>
.o2oSoout {
	width: 100vw;
	height: 100vh;
}
.border-r {
	border-right: 1px solid #6b7280;
}
.border-bottom {
	border-bottom: 1px solid #6b7280;
}
.tag-bottom {
	border-bottom: 3px solid red;
}
.o2oSoout-bottom-btn {
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 1999;
	width: 100%;
}
.o2oSoout-list {
	height: calc(100vh - 10.5rem);
}
.itemlist-item {
	border-left-width: 0;
	border-right-width: 0;
}
.itemlist-status {
	position: absolute;
	right: 20px;
	top: 10px;
}

.button {
	background-color: red;
	border-color: red;
}
</style>
