<template>
    <view class="store-inventory-list container overflow-y-auto flex flex-col">
        <!-- 顶部筛选 -->
        <view class="bg-white p-2 flex flex-col items-center">
            <uni-datetime-picker
                class="datetime"
                type="daterange"
                rangeSeparator="至"
                returnType="number"
                :value="range"
                @change="changeLog"
            ></uni-datetime-picker>
            <easy-input class="w-full mt-2" :value="searchValue" @input="searchInput" @search="search"></easy-input>
            <view class="mt-2 text-sm w-full flex items-center justify-around">
				<view 
					class="head-info flex flex-col items-center" 
					:class="{'text-red': status === 1}" 
					@click="statusQuery({status: 1})"
				>
					<text>待提交</text>
					<text class="mt-1">{{ total.undo }}</text>
				</view>
				<view 
					class="head-info flex flex-col items-center" 
					:class="{'text-red': status === 2}" 
					@click="statusQuery({status: 2})"
				>
					<text>已提交</text>
					<text class="mt-1">{{ total.done }}</text>
				</view>
				<view class="head-info flex flex-col items-center" :class="{'text-red': status === 0}" @click="statusQuery({status: 0})">
					<text>全部</text>
					<text class="mt-1">{{ total.all }}</text>
				</view>
			</view>
        </view>
        <!-- 列表区域 -->
        <view class="h-full overflow-hidden text-sm flex flex-col items-center px-2 py-4">
            <scroll-view 
				:scroll-top="scrollTop" 
				scroll-y="true" 
				class="overflow-auto text-xs" 
				:lower-threshold="200"
				@scrolltolower="lower"
				@scroll="scroll"
			>
                <template v-if="list.length">
                    <view class="bg-white rounded overflow-hidden relative p-3 mb-2"  v-for="item in list" :key="item.id">
                        <view class="flex mb-2">
                            <view class="flex-auto">
                                <text>单据编号：</text>
                                <text>{{ item.docno }}</text>
                            </view>
                            <view class="flex-auto">
                                <text>单据日期：</text>
                                <text>{{ item.billdate }}</text>
                            </view>
                        </view>
                        <view class="flex mb-2">
                            <view class="flex-auto">
                                <text>盘点类型：</text>
                                <text>{{ item.doctype_name || item.doctype || '' }}</text>
                            </view>
                            <view class="flex-auto">
                                <text>工作流阶段：</text>
                                <text>{{ item.au_state || '' }}</text>
                            </view>
                        </view>
                        <view class="flex mb-2">
                            <view class="flex-auto flex">
                                <text class="">备注：</text>
                                <text style="width: 65%; word-break:break-word">{{ item.description || '' }}</text>
                            </view>
                        </view>
                        <view class="flex mb-2">
                            <view class="flex-auto">
                                <text>修改时间：</text>
                                <text>{{ item.modifieddate }}</text>
                            </view>
                        </view>
                        <view class="flex items-center justify-between pt-2 border-t border-solid border-x-0 border-b-0 border-gray-200">
                            <view class="relative">
                                <text @click="openStockMore({item: item})">更多</text>
                                <!-- 更多弹窗 -->
                                <view 
                                    class="w-24 h-8 bg-white absolute left-0 flex items-center justify-center rounded shadow" 
                                    style="top: -2rem"
                                    v-show="item.isMore"
                                >
                                    <text @click="toMore(item.id)">差异明细</text>
                                </view>
						    </view>
                            <view class="">
                                <text>共实盘{{ item.tot_qtycount || 0 }}件</text>
                            </view>
                            <view class="bg-red-500 text-white px-3 py-1 rounded-full" @click="goto(item.id)">
                                查看详情
                            </view>
                        </view>
                        <view class="status-list py-1 px-2 status-undo" v-if="item.status === 1">
                            <text>待提交</text>
                        </view>
                        <view class="status-list py-1 px-2 status-daipi" v-else-if="item.status === '待批'">
                            <text>待审批</text>
                        </view>
                        <view class="status-list py-1 px-2 status-done" v-else-if="item.status === 2">
                            <text>已提交</text>
                        </view>
                    </view>
                    <view v-if="loading" class="flex items-center">
                        <svg  class="animate-spin ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<text>正在加载</text>
                    </view>
                    <view v-else-if="isEnd" class="flex flex-center py-2">
                        <text>已经没有数据了!</text>
                    </view>
                </template>
                <template v-else>
                    <view class="flex flex-center p-3">
                        <text>暂无更多数据!</text>
                    </view>
                </template>
            </scroll-view>
            <view class="w-full h-8 fixed left-0 bottom-0 bg-white flex flex-center py-2">
				<view class="flex flex-center px-2 w-full">
					<view class="w-full rounded bg-red-500 flex flex-center text-white" style="height: 60rpx; line-height: 60rpx;" @click="toAdd">新增盘点</view>
				</view>
			</view>
            <view class="go-top rounded-full p-2" @click="goTop" v-if="isGoTo">
				<image class="w-full h-full" src="/static/svg/zd.svg" mode=""></image>
			</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { debounce } from '@/utils/debounce'
import useList from '@/utils/useList'
import useScroll from '@/utils/useScroll'
import REQ from '@/utils/http_wx'

import { useInventoryStore } from '@/stores/store-inventory'

onShow(() => {
    console.log('storeInventoryList ---> onShow')
    listCover()
})

const inventoryStore = useInventoryStore()
// 参数
const { range, searchValue, status, filterOptions } = toRefs(inventoryStore)
// 方法
const { searchInput, goto, toAdd, toMore } = toRefs(inventoryStore)

const getList = async (data: any) => {
    let value = await REQ({
        url: 'pos/pandian/list',
		method: 'POST',
        data
    })
    return value
}
interface inventoryStoreApi {
    id: number
    docno: string
    billdate: number
    doctype_name: string
    doctype: number
    au_state: string | null
    description: string,
    modifieddate: string
    tot_qtycount: number
    status: number | string
    isMore: boolean
}
const inventorylist = useList<inventoryStoreApi, Object>(getList, filterOptions)
// 参数
const { loading, list, total, curPage, isEnd } = inventorylist
// 方法
const { filter } = inventorylist

const usescroll = useScroll()
const { scrollTop, oldScrollTop, isGoTo, scroll, goTop } = usescroll

const listCover = () => {
    if (curPage.value !== 0) curPage.value = 0
        else filter()
}

const changeLog = (e: [string, string]) => {
    if (e[0] == range.value[0] && e[1] == range.value[1]) return
    range.value[0] = e[0]
    range.value[1] = e[1]
    filterOptions.value.dateBeg = range.value[0]
    filterOptions.value.dateEnd = range.value[1]
    listCover()
}

const search = () => {
    filterOptions.value.query = searchValue.value
    console.log("🚀 ~ file: storeOutList.vue:196 ~ search ~ filterOptions", filterOptions.value)
    debounce(listCover, {})
}

const statusQuery = ({ status: newStatus }: { status: number }) => {
    status.value = newStatus
    filterOptions.value.status = status.value
    debounce(listCover, {})
}

const lower = () => {
    if (isEnd.value) return
    console.log("🚀 ~ file: storeOutList.vue:208 ~ lower ~ 到达底部")
    debounce(() => {
        curPage.value = curPage.value + 1
    }, {})
}

const openStockMore = ({ item }: {item: inventoryStoreApi}) => {
    let _item: any = list.value.find(_item => _item.id === item.id)
    _item.isMore = !_item.isMore
}
</script>

<style scoped>
.datetime .uni-date-x {
    background-color: #D1D5DB !important;
}
</style>