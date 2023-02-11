<template>
    <view class="ret-non-original-order container overflow-y-auto flex flex-col">
        <!-- 操作区域 -->
        <view class="bg-white p-4">
            <view class="bg-white shadow-md rounded p-3 flex">
				<view class="w-14 mr-5 text-center" @click="newOrder">
					<image class="w-10 h-10" src="/static/svg/kai_dan.svg" mode=""></image>
					<view>开新单</view>
				</view>
				<view class="w-14 mr-5 text-center relative">
					<image class="w-10 h-10" src="/static/svg/ying_ye_yuan.svg" mode="" @click="openEmployee"></image>
					<view>{{ employeeName }}</view>
				</view>
				<view class="w-14 mr-5 text-center" @click="openHang">
					<image class="w-10 h-10" src="/static/svg/gua_dan.svg" mode=""></image>
					<view>挂单</view>
				</view>
				<view class="w-16 text-center relative">
					<image class="w-10 h-10" src="/static/svg/ying_ye_yuan.svg" mode="" @click="openRetailType"></image>
					<view>{{ retailTypeName }}</view>
					<view class="w-14 h-24 bg-white shadow p-1 absolute mt-1 overflow-y-auto h-24" v-if="isOpenRetailType">
						<view class="text-center text-sm mb-1 mt-1" v-for="retailtype in retailtypelist" :key="retailtype.code" @click="retailTypeChange(retailtype)">
							<text class="">{{ retailtype.name }}</text>
						</view>
					</view>
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
				<search-sku-input ref="SearchSkuInput" @input="searchInput"></search-sku-input>
			</view>
        </view>
        <!-- 明细 -->
        <view class="h-full flex flex-col items-center p-2 mb-2 overflow-hidden">
			<view class="w-full rounded-t bg-white border border-solid border-gray-200 border-x-0 border-t-0 flex items-center">
				<view class="w-full flex bg-white overflow-hidden border border-solid border-gray-200 border-x-0 border-t-0" style="border: none; font-size: 28rpx; height: 80rpx">
					<view class="flex flex-center w-2-3">
						<text style="font-weight: 600;">商品</text>
					</view>
					<view class="flex flex-center w-1-3">
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
					<view class="flex w-full">
						<view class="w-3-6 overflow-hidden">
							<view class="">
								<text>{{ item.name + ' ' }}</text>
								<text>{{ item.value.length > 5 ? item.value.slice(0, 5) + '..' : item.value }}</text>
							</view>
							<view class="flex items-center mt-2">
								<text>规格:{{ item.value1 + '-' + item.value2 }}</text>
								<image v-if="item.isO2o == 'N'" class="w-4 h-4" src="/static/svg/ling_shou.svg" mode=""></image>
								<image v-else-if="item.isO2o === 'Y'" class="w-4 h-4" src="/static/svg/yun_cang.svg" mode=""></image>
							</view>
							<view class="flex mt-2">
								<text>条码:{{ item.no || '' }}</text>
							</view>
						</view>
						<view class="w-2-6">
							<uni-number-box style="width: 100%;" :value="item.qty" @change="inputnumberChange($event, index)"></uni-number-box>
							<view class="h-12 mt-2 border-notice flex flex-col" style="box-sizing: border-box; width: 100%;">
								<view class="flex-1 flex flex-center" style="box-sizing: border-box; border-bottom: 1px solid #ccc; height: 50%">
									<view class="w-full text-center">
										<input type="text" :value="item.pricelist" @input="itemInput($event, index)" />
									</view>
								</view>
								<view class="flex-1 flex flex-center" style="height: 50%">
									<view class="w-full text-center">
										<text class="text-gray-200" style="text-decoration: line-through;">￥{{ item.old_pricelist }}</text>
									</view>
								</view>
							</view>
						</view>
						<view class="w-1-6 text-center flex flex-col items-center justify-around">
							<view 
								class="border border-solid rounded p-1 text-sm w-4 h-4 flex items-center bg-white" 
								style="border-color: #c5c5c5;" 
								@click="delItem({ index, item})"
							>
								<image class="w-4 h-4" src="/static/svg/delete.svg" mode=""></image>
							</view>
							<view 
								class="border border-solid rounded p-1 text-sm w-4 h-4 flex items-center bg-white" 
								style="border-color: #c5c5c5;"
								@click="openItemEmployee({item})"
							>
								<text>营</text>
							</view>
						</view>
					</view>
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
		<!-- 营业员弹窗 -->
		<employee-dialog :isopen="isOpenEmployee" :list="employeeList" :value="employeeIds" @close="closeEmployee" @save="employeeSave"></employee-dialog>
		<!-- 明细营业员弹窗 -->
		<employee-dialog :isopen="isOpenItemEmployee" :list="employeeList" :value="itemEmployeeIds" @close="closeItemEmployee" @save="itemEmployeeSave"></employee-dialog>
    </view>
</template>

<script setup lang="ts">
import { toRefs, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useRetNoOriginalOrderStore } from '@/stores/ret-no-original-order'
import searchSkuInput from '@/components/search-sku-input/search-sku-input.vue'

const retNoOriginalOrderStore = useRetNoOriginalOrderStore()
// 参数
const { 
	employeeName, 
	isOpenEmployee, 
	employeeIds,
	employeeList, 
	isOpenHangReason, 
	isOpenHangList, 
	hanglist, 
	hangSelectId, 
	hangReasonValue, 
	retailTypeName,
	isOpenRetailType,
	retailtypelist,
	vip, 
	isOpenVipDialog, 
	vipPhone, 
	vipDialogValue, 
	totQty, 
	totAmt, 
	items, 
	isOpenItemEmployee,
	itemEmployeeIds,
	isOpenDescription,
	description
} = toRefs(retNoOriginalOrderStore)
// 方法
const { 
	init, 
	newBill, 
	getEmployeeList, 
	openEmployee, 
	closeEmployee,
	employeeSave, 
	openHang, 
	closeHang, 
	hangReasonInput, 
	hangReasonSave, 
	hanglistSave, 
	openRetailType,
	retailTypeChange,
	getRetailTypeList,
	openVipDialog, 
	vipPhoneInput, 
	vipSearch, 
	closeVipDialog, 
	vipDialogSave, 
	searchInput,
	delItem,
	inputnumberChange,
	itemInput,
	openItemEmployee,
	closeItemEmployee,
	itemEmployeeSave,
	openDescription,
	descriptionInput,
	descriptionSave,
	closeDescription,
	to
} = retNoOriginalOrderStore
const SearchSkuInput = ref()
const newOrder = () => {
	newBill(() => {
		SearchSkuInput.value?.clearInputValue()
	})
}
onLoad((options) => {
	if (options.init) {
		retNoOriginalOrderStore.$reset()
	}
})
onMounted(() => {
	init()
	getEmployeeList()
	getRetailTypeList()
})
</script>

<style scoped>

</style>