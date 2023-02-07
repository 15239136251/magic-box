<template>
    <view class="ret-non-original-order container overflow-y-auto flex flex-col">
        <!-- 操作区域 -->
        <view class="bg-white p-4">
            <view class="bg-white shadow-md rounded p-3 flex">
				<view class="w-14 mr-5 text-center" @click="newBill">
					<image class="w-10 h-10" src="/static/svg/kai_dan.svg" mode=""></image>
					<view>开新单</view>
				</view>
				<view class="w-14 mr-5 text-center relative">
					<image class="w-10 h-10" src="/static/svg/ying_ye_yuan.svg" mode="" @click="openEmployee"></image>
					<view>{{ employeeName }}</view>
					<view class="w-14 h-24 bg-white shadow p-1 absolute mt-1 overflow-y-auto h-24" v-if="isOpenEmployee">
						<view class="text-center text-sm mb-1 mt-1" v-for="employee in employeeList" :key="employee.id" @click="employeeChange(employee)">
							<text class="">{{ employee.name }}</text>
						</view>
					</view>
				</view>
				<view class="w-14 text-center" @click="openHang">
					<image class="w-10 h-10" src="/static/svg/gua_dan.svg" mode=""></image>
					<view>挂单</view>
				</view>
			</view>
			<view class="mt-3 bg-gray-100 rounded p-3 flex h-16">
				<view class="flex-1 flex items-center text-sm">
					<view class="text-center flex-1">
						<view class="">会员</view>
						<view class="text-red font-weight-600">{{ vip.name || vip.cardno || '' }}</view>
					</view>
					<view class="text-center flex-1">
						<view class="">积分</view>
						<view class="text-red font-weight-600">{{ vip.integral }}</view>
					</view>
				</view>
				<view class="flex-2 flex items-center justify-center">
					<view class="px-3 py-1 mr-2 border border-solid border-red-500 text-red-500 rounded-full bg-white" @click="openVipDialog">
						查询
					</view>
				</view>
			</view>
			<view class="mt-3">
				<search-sku-input @input="searchInput"></search-sku-input>
			</view>
        </view>
        <!-- 明细 -->
        <view class="h-full flex flex-col items-center p-2 mb-2 overflow-hidden">
			<view class="w-full rounded-t bg-white border border-solid border-gray-200 border-x-0 border-t-0 flex items-center">
				<view class="w-full flex bg-white overflow-hidden border border-solid border-gray-200 border-x-0 border-t-0" style="border: none; font-size: 28rpx; height: 80rpx">
					<view class="flex flex-center" style="width: 70%">
						<text style="font-weight: 600;">商品</text>
					</view>
					<view class="flex flex-center" style="width: 30%">
						<text style="font-weight: 600;">数量</text>
					</view>					
				</view>
			</view>
			<scroll-view
                scroll-y="true" 
                class="overflow-auto text-xs rounded-b bg-white" 
                style="margin-bottom: 90rpx"
				:lower-threshold="200"
			>
				<view 
					class="bg-white border border-solid border-gray-200 border-x-0 border-t-0 overflow-hidden p-3 mb-2 flex" 
					style="font-size: 26rpx;"
					v-for="(item, index) in items"
					:key="item.id" 
				>
					<q-del-slide-left :item="item" :data_transit="{index:item.id,item:item}" @delItem="delItem" class="w-full text-sm">
						<view class="flex">
							<view style="width: 70%">
								<view class="">
									<text>{{ item.name + ' ' + item.no }}</text>
								</view>
								<view class="flex justify-between mt-2">
									<text>{{ item.color_name + `(${item.color_code})` + ' ' + item.size_name }}</text>
								</view>
							</view>
							<view style="width: 30%">
								<uni-number-box :value="item.qty" :max="item.qtycan" @change="inputnumberChange($event, index)"></uni-number-box>
								<view class="flex flex-center border-notice py-2 mt-1" style="width: 100%;">
									<view class="w-full text-center py-1">
										{{ '￥' + (item.priceactual || '') }}
									</view>
								</view>
							</view>
						</view>
					</q-del-slide-left>
				</view>
			</scroll-view>
        </view>
        <!-- 结算区域 -->
		<view class="bg-white w-full flex items-center justify-between h-10 fixed left-0 bottom-0">
			<view class="ml-4" style="font-weight: 500;">
				合计<text class="text-red">{{ totQty }}</text>件<text class="text-red">{{ totAmt }}</text>元
			</view>
			<view class="mr-4">
				<text class="bg-white border border-solid border-red-400 text-red rounded-full px-4 py-1 mr-2" style="border-color: red;" @click="openDescription">备注</text>
				<text class="rounded-full px-4 py-1 bg-red-400 text-white" @click="to">收银</text>
			</view>
		</view>
		<!-- 挂单原因弹窗 -->
		<van-popup v-model:show="isOpenHangReason" @click-overlay="isOpenHangReason = false" position="center" title="挂单原因">
			<view class="bg-white w-full overflow-hidden">
				<view class="p-3">
					<view class="w-full text-center">
						挂单原因
					</view>
					<view class="w-full p-2">
						<textarea class="border border-solid p-2 w-62 h-32" :value="hangReasonValue" @input="hangReasonInput" placeholder="请输入挂单原因" />
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="bg-gray-100 rounded-full px-4 py-1 flex items-center" @click="closeHang">
							退出
						</view>
						<view class="ml-3 bg-red-400 text-white rounded-full px-4 py-1 flex items-center" @click="hangReasonSave">
							确定
						</view>
					</view>
				</view>
			</view>
		</van-popup>
		<!-- 挂单列表弹窗 -->
		<van-popup v-model:show="isOpenHangList" @click-overlay="isOpenHangList = false" position="bottom" title="挂单列表">
			<view class="bg-gray-100 w-full overflow-hidden">
				<view class="w-full text-center py-1">
					挂单列表
				</view>
				<scroll-view
					scroll-y="true"
					class="py-4 h-96" 
					:lower-threshold="200"
				>
					<view 
						class="bg-white mb-2 ml-2 mr-2 p-2 rounded text-sm" 
						style="color: #c5c5c5;" 
						v-for="hangValue in hanglist" 
						:class="{'hangSelect': hangSelectId === hangValue.id }" 
						:key="hangValue.id"
						@click="hangSelectId = hangValue.id"
					>
						<view class="flex items-center justify-between" >
							<text class="font-weight-600 text-black">VIP卡号：{{ hangValue.docno }}</text>
							<text>{{ hangValue.billdate }}</text>
						</view>
						<view class="mt-2">
							<text>总数量：{{ hangValue.tot_qty }}</text>
							<text class="ml-4">总金额：{{ '￥' + hangValue.tot_amt }}</text>
						</view>
						<view class="mt-2">
							<text>备注：{{ hangValue.description }}</text>
						</view>
					</view>
				</scroll-view>
				<view class="flex flex-center mt-2 h-8">
					<view class="h-full flex flex-1 flex-center bg-white" @click="closeHang">
						退出
					</view>
					<view class="h-full flex flex-1 flex-center bg-red-400 text-white" @click="hanglistSave">
						确定
					</view>
				</view>
			</view>
		</van-popup>
		<!-- 会员查询弹窗 -->
		<van-popup v-model:show="isOpenVipDialog" @click-overlay="isOpenVipDialog = false" position="center" title="会员查询">
			<view class="bg-white w-80 overflow-hidden">
				<view class="p-3">
					<view class="w-full text-center mb-3">
						会员查询
					</view>
					<easy-input :value="vipPhone" @input="vipPhoneInput" placeholder="请输入VIP卡号" @search="vipSearch"></easy-input>
					<view class="vip-info text-sm">
						<view class="w-full flex mt-2">
							<view class="w-18 text-gray-400">会员卡号</view>
							<view>{{ vipDialogValue.cardno }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">卡类型</view>
							<view>{{ vipDialogValue.type_name }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">积分</view>
							<view>{{ vipDialogValue.integral }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">姓名</view>
							<view>{{ vipDialogValue.name }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">生日</view>
							<view>{{ vipDialogValue.birthday }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">余额</view>
							<view>{{ vipDialogValue.amount ? '￥' + vipDialogValue.amount : '' }}</view>
						</view>
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="bg-gray-100 rounded-full px-4 py-1 flex items-center" @click="closeVipDialog">
							退出
						</view>
						<view class="ml-3 bg-red-400 text-white rounded-full px-4 py-1 flex items-center" @click="vipDialogSave">
							确定
						</view>
					</view>
				</view>
			</view>
		</van-popup>
		<!-- 备注弹窗 -->
		<van-popup v-model:show="isOpenDescription" @click-overlay="isOpenDescription = false" position="center" title="备注">
			<view class="bg-white w-full overflow-hidden">
				<view class="p-3">
					<view class="w-full text-center">
						备注
					</view>
					<view class="w-full p-2">
						<textarea class="border border-solid p-2 w-62 h-32" :value="description" @input="descriptionInput" placeholder="请输入备注" />
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="bg-gray-100 rounded-full px-4 py-1 flex items-center" @click="closeDescription">
							退出
						</view>
						<view class="ml-3 bg-red-400 text-white rounded-full px-4 py-1 flex items-center" @click="descriptionSave">
							确定
						</view>
					</view>
				</view>
			</view>
		</van-popup>
    </view>
</template>

<script setup lang="ts">
import { toRefs, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useRetOriginalOrderStore } from '@/stores/ret-original-order'

const retOriginalOrderStore = useRetOriginalOrderStore()
// 参数
const { 
	employeeName, 
	isOpenEmployee, 
	employeeList, 
	isOpenHangReason, 
	isOpenHangList, 
	hanglist, 
	hangSelectId, 
	hangReasonValue, 
	vip, 
	isOpenVipDialog, 
	vipPhone, 
	vipDialogValue, 
	totQty, 
	totAmt, 
	items, 
	isOpenDescription,
	description
} = toRefs(retOriginalOrderStore)
// 方法
const { 
	init, 
	newBill, 
	getEmployeeList, 
	openEmployee, 
	employeeChange, 
	openHang, 
	closeHang, 
	hangReasonInput, 
	hangReasonSave, 
	hanglistSave, 
	openVipDialog, 
	vipPhoneInput, 
	vipSearch, 
	closeVipDialog, 
	vipDialogSave, 
	searchInput,
	delItem,
	inputnumberChange,
	openDescription,
	descriptionInput,
	descriptionSave,
	closeDescription,
	to
} = retOriginalOrderStore

onLoad((option) => {
    if (option.value) init(JSON.parse(option.value))
})
onMounted(() => {
    getEmployeeList()
})
</script>

<style scoped>

</style>