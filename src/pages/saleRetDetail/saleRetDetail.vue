<template>
    <view class="sale-ret-detail container overflow-y-auto flex flex-col">
        <!-- 单头 -->
        <view class="w-full bg-white text-sm relative">
			<order-title-collapse>
				<view class="p-2 w-full">
					<view class="flex mb-3 pb-3 items-center border-bottom">
						<text class="w-28">单据编号：</text>
						<text>{{ detail.docno || '系统自动生成' }}</text>
					</view>
					<view class="flex mb-3 pb-3 items-center border-bottom">
						<text class="w-28 required">收货门店：</text>
						<view class="">
							<uni-combox
								class="w-full" 
								placeholder="请选择店仓"
								:value="detail.dest_name || detail.dest_code" 
								:candidates="detail.storelist" 
								:type="'id'"
								:disabled="disabled"
								@input="storeInput"
							></uni-combox>
						</view>
					</view>	
					<view class="flex mb-3 pb-3 items-center border-bottom">
						<text class="w-28 required">退货类型：</text>
						<view class="">
							<uni-combox
								class="w-full" 
								placeholder="请选择退货类型(必填)"
								:value="detail.rettype_name || detail.rettype" 
								:candidates="detail.rettypelist" 
								:type="'value'"
								:name="'description'"
								:noFilter="true"
								:disabled="disabled"
								@input="rettypeInput"
							></uni-combox>
						</view>
					</view>	
					<view class="flex pb-3 items-center border-bottom">
						<text class="w-28 required">退货折扣类型：</text>
						<view class="">
							<uni-combox
								class="w-full" 
								placeholder="请选择退货折扣类型(必填)"
								:value="detail.retdistype_name || detail.retdistype" 
								:candidates="detail.retdistypelist" 
								:disabled="disabled"
								@input="retdistypeInput"
							></uni-combox>
						</view>
					</view>	
					<view class="flex items-center border-bottom">
						<text class="w-28">备注：</text>
						<input :disabled="disabled" :value="detail.remark" @input="remarkInput" placeholder="请输入备注信息,最多100个汉字" maxlength="100" class="w-48 h-10 p-1 text-sm" />
					</view>
				</view>
			</order-title-collapse>
            <view class="p-2">
				<search-sku-input :disabled="disabled" @input="setSearchValue"></search-sku-input>
			</view>
            <text class="status-detail py-1 px-2 status-undo" v-if="detail.status === 1 && detail.id !== -1">
				<text>待提交</text>
			</text>
			<text class="status-detail py-1 px-2 status-done" v-else-if="detail.status === 2">
				<text>已提交</text>
			</text>
			<text class="status-detail py-1 px-2 status-done" v-else-if="detail.status === 3">
				<text>待审批</text>
			</text>
        </view>
        <view class="h-full flex flex-col items-center p-2 mb-2 overflow-hidden">
            <view class="w-full rounded-t bg-white border border-solid border-gray-200 border-x-0 border-t-0 flex items-center">
				<view class="w-full flex bg-white overflow-hidden border border-solid border-gray-200 border-x-0 border-t-0" style="border: none; font-size: 28rpx; height: 80rpx;">
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
				:scroll-top="scrollTop" 
				:lower-threshold="200"
				@scroll="scroll"
			>
                <view 
					class="bg-white border border-solid border-gray-200 border-x-0 border-t-0 overflow-hidden p-3 mb-2 flex" 
					style="font-size: 26rpx;" 
					v-show="item.noShow != true"
					v-for="(item, index) in detail.items" 
					:key="item.no" 
				>
					<q-del-slide-left :item="item" :data_transit="{index:index,item:item}" @delItem="delItem" class="w-full text-sm">
						<view class="flex">
							<view style="width: 70%">
								<view class="" v-if="item.dim3name != '赠品'">
									<text>{{ item.name + ' ' + item.no }}</text>
								</view>
								<view class="" v-else>
									<text>{{ item.value }}</text>
								</view>
								<view class="flex justify-between mt-2">
									<view class="">
										<text>{{ item.value1 + `(${item.value1_code})` + ' ' + item.value2 }}</text>
									</view>
								</view>
							</view>
							<view style="width: 30%">
								<view class="search-input flex items-center px-1" v-if="disabled">
									<input 
										type="text"
										ref="inputMultiple" 
										style="text-align: center;"
										placeholder=""
										disabled
										:value="item.qty"
									/>
								</view>
								<uni-number-box :value="item.qty" :max="item.qtycan" @change="inputnumberChange($event, index)" v-else></uni-number-box>
								<view class="flex flex-center mt-2">
									<image class="w-5 h-5" src="/static/svg/ke_pei.svg" mode=""></image>
									<view class="ml-1">
										<text>{{ item.qtycan }}</text>
									</view>
								</view>
							</view>
						</view>
					</q-del-slide-left>
                </view>
            </scroll-view>
            <view class="go-top rounded-full p-2" @click="goTop" v-if="isGoTo">
				<image class="w-full h-full" src="/static/svg/zd.svg" mode=""></image>
			</view>
        </view>
        <!-- 底部按钮 -->
        <view class="detail-button w-full flex items-center justify-around" style="z-index: 99;">
			<view class="text-red-500">
				<text class="font-weight-600">合计：</text>
				<text>{{ totQty }}</text>
			</view>
			<view class="flex detail-button-wrap py-3 mr-2" >
				<button plain="true" size="mini" class="rounded-full mr-2" @click="out">退出</button>
				<button plain="true" size="mini" class="rounded-full mr-2" :disabled="disabled" @click="save">仅保存</button>
				<button plain="true" size="mini" class="rounded-full" :disabled="disabled" @click="submit">保存并提交</button>
			</view>
		</view>
        <!-- 保存并提交弹窗 -- 物流 -->
        <van-popup v-model:show="submitDialog" @click-overlay="submitDialog = false" position="center" title="保存并提交">
            <view class="bg-white p-4 w-64" style="font-size: 26rpx;">
				<view class="flex items-center mt-1">
					<view class="head-title">
						<text>物流公司：</text>
					</view>
					<view class="head-content">
						<uni-combox :value="detail.fastCompCode" @input="expcomInput" :type="'id'" :noFilter="true" :candidates="expcomlist || []" class="w-48" placeholder="请选择物流公司"></uni-combox>
					</view>
				</view>
				<view class="flex items-center mt-1">
					<view class="head-title">
						<text>运单号：</text>
					</view>
					<view class="head-content">
						<view class="w-full flex items-center" style="background-color: #F3F4F6;">
							<input
								type="text"
								class="w-full px-2 py-1"
								style="font-size: 26rpx;"
								placeholder="请填写运单号"
								:value="detail.fastNo"
								@input="fastNoInput"
							/>
							<view class="flex flex-center submit-icon mr-1" @click="fastNoScan">
								<image class="icon w-full h-full" src="/static/svg/scan.svg" mode=""></image>
							</view>
						</view>
					</view>
				</view>
				<view class="px-2 flex flex-center mt-2">
					<view class="border border-solid rounded-full px-3 py-1 flex items-center" @click="submitDialogClose">
						退出
					</view>
					<view class="ml-3 border border-solid rounded-full px-3 py-1 flex items-center" @click="submitDialogOk">
						确定
					</view>
				</view>
			</view>
        </van-popup>
    </view>
</template>

<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useSaleRetStore } from '@/stores/sale-ret'
import useScroll from '@/utils/useScroll'
import qDelSlideLeft from '@/components/q-del-slide-left/q-del-slide-left.vue'

onLoad((options) => {
    id.value = Number(options.id)
})
onMounted(() => {
	if (id.value != -1) getDetail(id.value)
	init()
})

const id = ref(-1)
const saleRetStore = useSaleRetStore()
// 参数
const { detail, expcomlist, disabled, totQty, submitDialog } = toRefs(saleRetStore)
// 方法
const { getDetail, getStoreList, getRettypeList, getRetdistypeList, storeInput, remarkInput, rettypeInput, retdistypeInput,  setSearchValue, delItem, inputnumberChange, expcomInput, fastNoInput, fastNoScan, out, save, submit, submitDialogOk, submitDialogClose, getExpcom } = saleRetStore
const init = () => {
	getStoreList()
	getRettypeList()
	getRetdistypeList()
}

const usescroll = useScroll()
const { scrollTop, oldScrollTop, isGoTo, scroll, goTop } = usescroll
</script>

<style scoped>
button {
	padding-left: 10px;
	padding-right: 10px;
}
.search-input {
    background: #F3F4F6;
    min-width: 160rpx;
    height: 30px;
    border: 1px solid #F3F4F6;
    border-radius: 4px;
    overflow: hidden;
    padding: 10rpx 0 ;
    font-family: sans-serif;
}

.search-input input {
    flex-grow: 1;
    font-size: 28rpx;
    width: 60%;
    height: 60rpx;
    border: none;
    outline: none;
}

.search-input:focus-within {
    border-color: #777;
}

.border-notice {
    border: 1px solid #ccc;
    width: 90%;
    border-radius: 10rpx;
}
	
.border-diff {
    border: 1px solid red;
    width: 90%;
    color: red;
    border-radius: 10rpx;
}

.go-top {
    width: 40rpx;
    height: 40rpx;
    background-color: white;
    border: 1px solid black;
    position: fixed;
    right: 30rpx;
    bottom: 130rpx;
}

.detail-button {
    position: fixed;
    left: 0;
    bottom: 0;
    background-color: white;
    font-size: 28rpx;
}

.detail-button-wrap {
    float: right;
}

.head-title {
    width: 130rpx;
    /* background-color: #e5e6e7; */
}

.head-content {
    background-color: #F3F4F6;
}

.head-content > .input {
    padding-left: 10rpx;
    padding-right: 10rpx;
    font-size: 26rpx;
}
</style>