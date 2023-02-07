<template>
    <view class="ret-original-order-list container overflow-y-auto flex flex-col">
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
            <easy-input 
                class="w-full mt-2" 
                placeholder="请输入单据编号或会员手机号"
                isScan 
                :value="searchValue" 
                @input="searchInput" 
                @search="search" 
                @scan="scan"
            ></easy-input>
        </view>
        <!-- 列表区域 -->
        <view class="h-full overflow-hidden text-sm flex flex-col items-center px-2 py-4">
            <scroll-view 
				:scroll-top="scrollTop" 
				scroll-y="true" 
				class="overflow-auto" 
				:lower-threshold="200"
				@scrolltolower="lower"
				@scroll="scroll"
			>
                <template v-if="list.length">
                    <view class="mb-2 border-b bg-white py-4 rounded text-sm"  v-for="item in list" :key="item.id">
                        <!-- 单据信息 -->
                        <view class="px-2 border-bottom border-gray-100 pb-2">
                            <view class="flex justify-between text-gray-400">
                                <view>
                                    <text>单据编号：</text>
                                    <text class="text-black">{{ item.docno }}</text>
                                </view>
                                <text>{{ item.statustime }}</text>
                            </view>
                            <view class="flex justify-between text-gray-400 mt-2">
                                <view>
                                    <text>会员卡号：</text>
                                    <text class="text-black">{{ item.vip_phone || '' }}</text>
                                </view>
                                <view>
                                    <text>营业员：</text>
                                    <text class="text-black">{{ item.emp_name || '' }}</text>
                                </view>
                            </view>
                            <view class="flex justify-between text-gray-400 mt-2">
                                <view>
                                    <text>备注：</text>
                                    <text class="text-black">{{ item.remark || '' }}</text>
                                </view>
                            </view>						
                        </view>
                        <!-- 单据明细 -->
                        <view class="p-2 text-red-500 border-bottom border-gray-100">
                            <view class="flex mt-1" v-for="sonitem in item.items" :key="sonitem.id">
                                <view class="flex-2 w-56">
                                    {{ sonitem.name + ' ' + sonitem.color_name + ' ' + sonitem.size_name }}
                                </view>
                                <view class="flex-1">
                                    ￥{{ sonitem.tot_amt_actual }}
                                </view>
                                <view class="flex-1">
                                    <view class="" v-if="sonitem.type == 1">
                                        购买{{ sonitem.qty }}件
                                    </view>
                                    <view class="">
                                        已退{{ sonitem.rqty }}件
                                    </view>								
                                </view>
                            </view>
                        </view>
                        <!-- 合计 -->
                        <view class="flex items-center justify-between mt-3 px-2">
                            <view class="">
                                可退合计
                                <text class="text-red-500">{{ getItemsQty(item.items) }}</text>
                                件
                                <text class="text-red-500">{{ getItemsAmt(item.items) }}</text>
                                元
                            </view>
                            <view class="bg-red-500 text-white text-center px-3 py-1 rounded-full" @click="ret(item)">
                                <text>确认退货</text>
                            </view>
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
            <view class="go-top rounded-full p-2" @click="goTop" v-if="isGoTo">
				<image class="w-full h-full" src="/static/svg/zd.svg" mode=""></image>
			</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getDate } from '@/utils/utils'
import { showToast } from '@/utils/interactions'
import { debounce } from '@/utils/debounce'
import { $goto } from '@/utils/navigate'
import { RetOriginalOrderListApi, RetOriginalOrderListItems } from '@/utils/interface'
import REQ from '@/utils/http_wx'
import useList from '@/utils/useList'
import useScroll from '@/utils/useScroll'

const range = ref([getDate(true), getDate()])
const searchValue = ref('')

const usescroll = useScroll()
const { scrollTop, oldScrollTop, isGoTo, scroll, goTop } = usescroll

const getList = async (data: any) => {
    let value = await REQ({
        url: 'pos/retail/list',
		method: 'POST',
        data
    })
    return value
}
const options = ref({
    query: searchValue.value,
    dateBeg: range.value[0],
	dateEnd: range.value[1]
})
const inlist = useList<RetOriginalOrderListApi, Object>(getList, options)
// 参数
const { loading, list, total, curPage, isEnd } = inlist
// 方法
const { filter } = inlist

const listCover = () => {
    if (curPage.value !== 0) curPage.value = 0
        else filter()
}
const changeLog = (e: string[]) => {
    range.value = e
    options.value.dateBeg = range.value[0]
    options.value.dateEnd = range.value[1]
    listCover()
} 
const searchInput = (e: string) => {
    searchValue.value = e
}
const search = () => {
    options.value.query = searchValue.value
    listCover()
}
const scan = () => {
    console.log("输入框扫一扫");
    // #ifdef H5
    return showToast('H5页面只支持手工输入', 'none')
    // #endif
    uni.scanCode({
        scanType: ['barCode'],
        success: function (res) {
            searchValue.value = res.result
            search()
        }
    })
}
const lower = () => {
    if (isEnd.value) return
    console.log("🚀 ~ file: retOriginalOrderList.vue:195 ~ lower ~ 到达底部")
    debounce(() => {
        curPage.value = curPage.value + 1
    })
}
const getItemsQty = (items: RetOriginalOrderListItems[]) => {
    let value = 0
    items.forEach(item => {
        value = value + Number(item.rcanqty)
    });
    return value
}
const getItemsAmt = (items: RetOriginalOrderListItems[]) => {
    let value = 0
    items.forEach(item => {
        if (item.rcanqty) value = value + Number(item.tot_amt_actual)
    });
    return value
}
const ret = (item: RetOriginalOrderListApi) => {
    let value = { ...item }
    value.items = value.items.filter(item => item.rcanqty > 0)
    $goto({
        url: '/pages/retOriginalOrder/retOriginalOrder' + '?value=' + JSON.stringify(value)
    }, true)
}

onShow(() => {
    listCover()
})
</script>