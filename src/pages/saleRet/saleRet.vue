<template>
	<view class="sale-ret container overflow-y-auto flex flex-col">
		<!-- 顶部筛选 -->
		<view class="bg-white p-2 flex flex-col items-center">
			<uni-datetime-picker
				class="datetime"
				type="daterange"
				rangeSeparator="至"
				returnType="number"
				:value="range"
				@change="changeLog"
			/>	
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
								<text>收货门店：</text>
								<text>{{ item.destname || '' }}</text>
							</view>
							<view class="flex-auto">
								<text>运单号：</text>
								<text>{{ item.logis_no || '' }}</text>
							</view>
						</view>
						<view class="flex mb-2">
							<view class="flex-auto">
								<text>快递公司：</text>
								<text>{{ item.logis_name }}</text>
							</view>
						</view>
						<view class="flex mb-2">
							<view class="flex-auto flex">
								<text class="">备注：</text>
								<text style="width: 65%; word-break:break-word">{{ item.remark || item.description || '' }}</text>
							</view>
						</view>
						<view class="flex mb-2">
							<view class="flex-auto">
								<text>修改时间：</text>
								<text>{{ item.modifieddate }}</text>
							</view>
						</view>
						<view class="flex mb-2">
							<view class="flex-auto">
								<text>工作流阶段：</text>
								<text>{{ item.au_state }}</text>
							</view>
						</view>
						<view class="flex items-center justify-between pt-2 border-t border-solid border-x-0 border-b-0 border-gray-200">
                            <view class="">
                                <text>共计{{ item.tot_qty || 0 }}件</text>
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
					<view class="w-full rounded bg-red-500 flex flex-center text-white" style="height: 60rpx; line-height: 60rpx;" @click="toAdd">新增销售退货</view>
				</view>
			</view>
            <view class="go-top rounded-full p-2" @click="goTop" v-if="isGoTo">
				<image class="w-full h-full" src="/static/svg/zd.svg" mode=""></image>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { debounce } from '@/utils/debounce'
import useList from '@/utils/useList'
import useScroll from '@/utils/useScroll'
import REQ from '@/utils/http_wx'

import { useSaleRetStore } from '@/stores/sale-ret'

onShow(() => {
    console.log('saleRet ---> onShow')
    listCover()
})

const saleRetStore = useSaleRetStore()
// 参数
const { range, searchValue, status, filterOptions } = toRefs(saleRetStore)
// 方法
const { searchInput, goto, toAdd } = toRefs(saleRetStore)

const usescroll = useScroll()
const { scrollTop, oldScrollTop, isGoTo, scroll, goTop } = usescroll

const getList = async (data: any) => {
    let value = await REQ({
        url: 'pos/retsale/list',
		method: 'POST',
        data
    })
    return value
}
interface saleRetStoreApi {
    id: number
    docno: string
    billdate: number
	destname: string
    au_state: string | null
	logis_no: string
	logis_name: string
    remark: string
    description: string
    modifieddate: string
    status: number | string
	tot_qty: number
}
const saleRetlist = useList<saleRetStoreApi, Object>(getList, filterOptions)
// 参数
const { loading, list, total, curPage, isEnd } = saleRetlist
// 方法
const { filter } = saleRetlist

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
    console.log("🚀 ~ file: saleRet.vue:196 ~ search ~ filterOptions", filterOptions.value)
    debounce(listCover, {})
}

const statusQuery = ({ status: newStatus }: { status: number }) => {
    status.value = newStatus
    filterOptions.value.status = status.value
    debounce(listCover, {})
}

const lower = () => {
    if (isEnd.value) return
    console.log("🚀 ~ file: saleRet.vue:208 ~ lower ~ 到达底部")
    debounce(() => {
        curPage.value = curPage.value + 1
    }, {})
}
</script>