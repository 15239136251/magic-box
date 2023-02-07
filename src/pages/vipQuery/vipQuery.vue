<template>
    <view class="vip-query container overflow-y-auto flex flex-col">
        <!-- 顶部区域 -->
        <view class="bg-white">
            <date-tag-picker @change="dateTagChange"></date-tag-picker>
            <view class="p-2">
                <uni-datetime-picker
                    class="datetime"
                    type="daterange"
                    rangeSeparator="至"
                    returnType="number"
                    :value="range"
                    @change="changeLog"
                ></uni-datetime-picker>
                <view class="amt mt-2 pb-2 flex text-sm">
					<view class="text-center flex-1">
						<view>会员总数</view>
						<view class="text-red-400">{{ total.total }}</view>
					</view>
					<view class="text-center flex-1">
						<view>新增会员</view>
						<view class="text-red-400">{{ total.total_at }}</view>
					</view>
					<view class="text-center flex-1">
						<view>会销金额</view>
						<view class="text-red-400">{{ total.total_vip_amt }}</view>
					</view>
					<view class="text-center flex-1">
						<view>会销占比</view>
						<view class="text-red-400">{{ total.vip_occupy }}</view>
					</view>
				</view>
                <easy-input class="w-full mt-2" placeholder="请输入会员手机号查询" :value="searchValue" @input="searchInput" @search="search"></easy-input>
            </view>
        </view>
        <!-- 列表区域 -->
        <view class="h-full overflow-hidden flex flex-col items-center px-2 py-4">
            <scroll-view 
				:scroll-top="scrollTop" 
				scroll-y="true" 
				class="overflow-auto text-xs" 
				:lower-threshold="200"
				@scrolltolower="lower"
				@scroll="scroll"
			>
                <template v-if="viplist.length">
                    <view 
                        class="bg-white rounded overflow-hidden relative p-3 mb-2 border border-red-400" 
                        v-for="vip in viplist" 
                        :class="{'border-solid': touchStartId == vip.id}" 
                        :key="vip.id"
                        @click="goto(vip)"
                    >
                        <view class="flex justify-between mb-2">
                            <view class="">
                                <text class="text-gray-400">会员卡号：</text>
                                <text>{{ vip.cardno || '' }}</text>
                            </view>
                            <view class="">
                                <text>手机号：</text>
                                <text>{{ vip.phone || '' }}</text>
                            </view>
                        </view>
                        <view class="flex justify-between mb-2">
                            <view class="">
                                <text class="text-gray-400">会员姓名：</text>
                                <text>{{ vip.name || '' }}</text>
                            </view>
                            <view class="">
                                <!-- <text>性别：</text> -->
                                <text>{{ vip.sex === 'W' ? '女' : vip.sex === 'M' ? '男' : '' }}</text>
                            </view>
                        </view>
                        <view class="flex justify-between mb-2">
                            <view class="">
                                <text class="text-gray-400">开卡日期：</text>
                                <text>{{ vip.creationdate || '' }}</text>
                            </view>
                            
                            <view class="">
                                <!-- <text>类型：</text> -->
                                <text>{{ vip.type_name || '' }}</text>
                            </view>
                        </view>
                        <view class="flex mb-2">
                            <view class="">
                                <text class="text-gray-400">服务门店：</text>
                                <text>{{ vip.store_name || '' }}</text>
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
import { toRefs } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import useScroll from '@/utils/useScroll'

import { useVipQueryStore } from '@/stores/vip-query'
const vipQueryStore = useVipQueryStore()
/* 参数 */
const { range, searchValue, total, viplist, touchStartId, loading, isEnd } = toRefs(vipQueryStore)
/* 方法 */
const { dateTagChange, changeLog, searchInput, search, lower, goto, init } = vipQueryStore
init()

const usescroll = useScroll()
const { scrollTop, oldScrollTop, isGoTo, scroll, goTop } = usescroll

onShow(() => {
    console.log('vipQuery ---> onShow')
})
</script>

<style scoped>

</style>