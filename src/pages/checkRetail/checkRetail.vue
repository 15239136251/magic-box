<template>
    <view class="check-retail container flex flex-col overflow-hidden">
        <!-- 日期事件选择 -->
        <view class="bg-white h-48">
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
                <view class="mt-2 flex h-10">
					<view 
						class="flex-1 flex flex-center rounded-l-md" 
						:class="isTag('零售汇总') ? 'text-red-400 border border-solid border-red-400' : 'bg-gray-100'" 
						@click="tagChange('零售汇总')"
					>
						<text>零售汇总</text>
					</view>
					<view 
						class="flex-1 flex flex-center rounded-r-md" 
						:class="isTag('零售明细') ? 'text-red-400 border border-solid border-red-400' : 'bg-gray-100'" 
						@click="tagChange('零售明细')"
					>
						<text>零售明细</text>
					</view>
				</view>
                <view class="mt-2 pb-2 flex text-sm">
					<view class="text-center flex-1">
						<view>成交金额</view>
						<view class="text-red-400">{{ total.totamt }}</view>
					</view>
					<view class="text-center flex-1">
						<view>成交数量</view>
						<view class="text-red-400">{{ total.totqty }}</view>
					</view>
					<view class="text-center flex-1">
						<view>成交笔数</view>
						<view class="text-red-400">{{ total.totcnt }}</view>
					</view>
					<view class="text-center flex-1">
						<view>平均折扣</view>
						<view class="text-red-400">{{ total.avg_dis }}</view>
					</view>
				</view>
            </view>
        </view>
        <!-- 零售汇总 -->
        <view class="bg-white mt-2" style="height: calc(100% - 12.5rem)" v-if="isTag('零售汇总')">
            <!-- 单选 -->
            <view class="h-10 px-2 text-sm">
				<radio-group @change="radioChange" class="flex items-center h-10">
					<label class="flex flex-1" v-for="radio in radios" :key="radio.value">
						<view>
							<radio :value="radio.value" :checked="radio.value === current" />
						</view>
						<view>{{radio.name}}</view>
					</label>
				</radio-group>
			</view>
            <!-- 搜索 -->
            <view class="h-10 px-2 pb-1 flex flex-center" v-if="isPdtOrSku">
				<input 
					class="h-8 w-full bg-gray-100 rounded px-2 text-sm" 
					type="text" 
					:value="pdtOrSkuValue" 
					@input="pdtOrSkuInput" 
					:placeholder="'请输入' + (current == 'pdt' ? '款号' : '条码')" 
					@confirm="pdtOrSkuSearch"
				/>
				<text class="w-20 text-sm text-center" @click="pdtOrSkuSearch">搜索</text>
			</view>
            <!-- 表格区域 -->
			<view class="overflow-hidden" :style="retailSumStyle">
                <view class="overflow-auto h-full">
                    <uni-table border>
                        <uni-tr>
                            <uni-th align="center" width="300">{{ radioName }}</uni-th>
                            <uni-th align="center">数量</uni-th>
                            <uni-th align="center">成交金额</uni-th>
                            <uni-th align="center">零售金额</uni-th>
                        </uni-tr>
                        <uni-tr v-for="item in sumItems" :key="item.name">
                            <uni-td align="center">{{ item.name }}</uni-td>
                            <uni-td align="center">{{ item.tot_qty }}</uni-td>
                            <uni-td align="center">{{ item.tot_amt }}</uni-td>
                            <uni-td align="center">{{ item.amt_list }}</uni-td>
                        </uni-tr>
                    </uni-table>
                </view>
			</view>
            <!-- 零售汇总分页 -->
            <view class="flex w-full h-10 bg-white fixed bottom-0 left-0">
				<view class="flex-1 flex flex-center" style="border-right: 1px solid #F3F4F6; box-sizing: border-box;" @click="sumItemPre">
					上一页
				</view>
				<view class="flex-1 flex flex-center" @click="sumItemNext">
					下一页
				</view>
			</view>
        </view>
        <!-- 零售明细 -->
        <view class="bg-white mt-2" style="height: calc(100% - 12.5rem)" v-if="isTag('零售明细')">
            <view class="px-2 h-full">
                <scroll-view
					:scroll-top="scrollTop" 
					scroll-y="true" 
					class="h-full py-4" 
					:lower-threshold="200"
					@scrolltolower="detailLower"
					@scroll="scroll"
				>
					<view class="mb-2 border-b bg-white py-4 rounded text-sm"  v-for="item in retailItems" :key="item.docno">
						<!-- 单据信息 -->
						<view class="px-2 border-bottom border-gray-100 pb-2">
							<view class="flex justify-between text-gray-400">
								<view>
									<text>单据编号：</text>
									<text class="text-black">{{ item.docno  || ''}}</text>
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
									<text class="text-black">{{ item.description || '' }}</text>
								</view>
							</view>						
						</view>
						<!-- 单据明细 -->
						<view class="p-2 text-red-500 border-bottom border-gray-100">
							<view class="flex mt-1" v-for="value in item.items" :key="value.id">
								<view class="flex-2 w-56">
									{{ value.name + ' ' + value.color_name + ' ' + value.size_name }}
								</view>
								<view class="flex-1 mr-1">
									￥{{ (value.priceactual * value.qty).toFixed(2) }}
								</view>
								<view class="flex-1">
									{{ value.qty }}件
								</view>
							</view>
						</view>
						<!-- 合计 -->
						<view class="flex items-center justify-between px-2 mt-3">
							<view class="">
								合计<text class="text-red-500">{{ getDocnoQty(item.items) }}</text>件
								<text class="text-red-500">{{ getDocnoAmt(item.items) }}</text>元
							</view>
							<view class="flex">
								<view class="bg-red-500 text-white text-center px-3 py-1 rounded-full mr-2" @click="print(item)">
									<text>打印</text>
								</view>			
								<view class="bg-red-500 text-white text-center px-3 py-1 rounded-full" @click="amtDetailDialogOpen(item)">
									<text>金额详情</text>
								</view>
							</view>
						</view>
					</view>
                    <view v-if="retailItems.length === 0" class="flex flex-center h-10 text-sm">
                        <text>当前暂无数据!</text>
                    </view>
				</scroll-view>
            </view>
        </view>
        <!-- 金额详情 -->
        <van-popup v-model:show="amtDetailDialog" @click-overlay="amtDetailDialogClose" position="bottom">
            <view class="bg-white w-full overflow-hidden">
                <view class="w-full h-8 flex items-center justify-center relative">
                    <text class="font-weight-600">金额详情</text>
                    <uni-icons class="absolute right-2 top-1" type="closeempty" size="20" @click="amtDetailDialogClose"></uni-icons>
                </view>
                <scroll-view
                    scroll-y="true"
                    class="bg-white" 
                    style="max-height: 24rem;"
                    :lower-threshold="200"
                >
                    <view class="">
                        <view class="flex items-center justify-between h-8 px-2">
                            <text>商品总价</text>
                            <text>￥{{ amountDetail.totOldAmt }}</text>
                        </view>
                        <view class="flex items-center justify-between h-8 px-2">
                            <text>优惠总计</text>
                            <text class="text-red">减￥{{ amountDetail.totAmtDiscount }}</text>
                        </view>
                        <uni-collapse ref="collapse" class="text-sm">
                            <uni-collapse-item titleBorder="none" :show-animation="true" v-if="amountDetail.activityItems.length">
                                <template v-slot:title>
                                    <view class="flex items-center justify-between h-8 px-2">
                                        <text>活动优惠</text>
                                        <text class="text-red">减￥{{ amountDetail.activityAmt }}</text>
                                    </view>
                                </template>
                                <view class="content p-2">
                                    <view class="bg-gray-50 rounded text-gray-400 px-2" v-for="activityItem in amountDetail.activityItems" :key="activityItem.activityName">
                                        <view class="h-8 flex items-center justify-between">
                                            <text>{{ activityItem.activity_name }}</text>
                                            <text>减￥{{ activityItem.activity_dis_amount }}</text>
                                        </view>
                                    </view>
                                </view>
                            </uni-collapse-item>
                            <uni-collapse-item titleBorder="none" :show-animation="true" v-if="amountDetail.integralDis != null">
                                <template v-slot:title>
                                    <view class="flex items-center justify-between h-8 px-2">
                                        <text>VIP优惠</text>
                                        <text class="text-red">减￥{{ amountDetail.vipIntegralDisAmount }}</text>
                                    </view>
                                </template>
                                <view class="content p-2">
                                    <view class="bg-gray-50 rounded text-gray-400 px-2">
                                        <view class="h-8 flex items-center justify-between" v-if="amountDetail.vipDisAmount">
                                            <text>VIP折扣</text>
                                            <text>减￥{{ amountDetail.vipDisAmount }}</text>
                                        </view>
                                        <view class="h-8 flex items-center justify-between">
                                            <text>VIP积分抵现</text>
                                            <text>减￥{{ amountDetail.integralDis.integralDisAmount }}</text>
                                        </view>
                                        <view class="h-8 flex items-center justify-between">
                                            <text class="text-red">使用{{ amountDetail.integralDis.useIntegral }}积分，抵扣￥{{ amountDetail.integralDis.integralDisAmount }}</text>
                                        </view>
                                    </view>
                                </view>
                            </uni-collapse-item>
                            <uni-collapse-item titleBorder="none" :show-animation="true"  v-if="amountDetail.ticketItems.length">
                                <template v-slot:title>
                                    <view class="flex items-center justify-between h-8 px-2">
                                        <text>券优惠</text>
                                        <text class="text-red">减￥{{ amountDetail.ticketAmt }}</text>
                                    </view>
                                </template>
                                <view class="content p-2">
                                    <view class="bg-gray-50 rounded text-gray-400 px-2" v-for="ticketItem in amountDetail.ticketItems" :key="ticketItem.activityName">
                                        <view class="h-8 flex items-center justify-between">
                                            <text>{{ ticketItem.ticket_name }}</text>
                                            <text>减￥{{ ticketItem.ticket_dis_amount }}</text>
                                        </view>
                                    </view>
                                </view>
                            </uni-collapse-item>
                        </uni-collapse>
                        <view class="flex items-center justify-between h-8 px-2">
                            <text>合计</text>
                            <text>￥{{ amountDetail.totAmt }}</text>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </van-popup>
    </view>
</template>

<script setup lang="ts">
import { toRefs, onMounted } from 'vue'
import useScroll from '@/utils/useScroll'

import { useCheckRetailStore } from '@/stores/check-retail'
import { onUnload } from '@dcloudio/uni-app'

const checkRetailStore = useCheckRetailStore()
// 零售汇总参数
const { range, total, radios, current, isPdtOrSku, pdtOrSkuValue, retailSumStyle, radioName, sumItems } = toRefs(checkRetailStore)
// 零售明细参数
const { retailItems, amtDetailDialog, amountDetail } = toRefs(checkRetailStore)
// 零售汇总方法
const { init, dateTagChange, changeLog, isTag, tagChange, radioChange, pdtOrSkuInput, pdtOrSkuSearch, sumItemPre, sumItemNext } = checkRetailStore
// 零售明细方法
const { detailLower, getDocnoQty, getDocnoAmt, print, amtDetailDialogOpen, amtDetailDialogClose } = checkRetailStore

const usescroll = useScroll()
const { scrollTop, scroll } = usescroll

onMounted(() => { init() })
onUnload(() => {
	checkRetailStore.$reset()
})
</script>

<style scoped>

</style>