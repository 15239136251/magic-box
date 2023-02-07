<template>
    <view class="vip-query-detail container flex flex-col text-sm">
        <!-- 日期选择 -->
        <view class="pb-3 bg-white">
			<date-tag-picker @change="detailDateTagChange"></date-tag-picker>
			<view class="px-2 mt-2">
				<uni-datetime-picker
					class="datetime"
					type="daterange"
					rangeSeparator="至"
					returnType="number"
					:value="detail.range"
					@change="detailChangeLog"
				/>
			</view>
		</view>
        <!-- 标签区域 -->
		<view class="flex h-10" style="border-collapse: collapse;border-spacing: 0;">
			<view 
				class="flex-1 flex flex-center border border-solid border-gray-300 border-l-0" 
				@click="tagChange('基础资料')"
				:class="isTag('基础资料') ? 'bg-white border-b-0' : 'bg-gray-50'"
			>
				<text>基础资料</text>
			</view>
			<view 
				class="flex-1 flex flex-center border border-solid border-gray-300 border-l-0" 
				@click="tagChange('统计信息')"
				:class="isTag('统计信息') ? 'bg-white border-b-0' : 'bg-gray-50'"
			>
				<text>统计信息</text>
			</view>
			<view 
				class="flex-1 flex flex-center border border-solid border-gray-300 border-l-0 border-r-0" 
				@click="tagChange('消费记录')"
				:class="isTag('消费记录') ? 'bg-white border-b-0' : 'bg-gray-50'"
			>
				<text>消费记录</text>
			</view>
		</view>
        <!-- 基础资料 -->
        <view class="h-full bg-white" v-if="isTag('基础资料')">
			<scroll-view scroll-y="true" class="h-full">
				<view class="border-gray-300 h-10 flex items-center justify-between px-4 border border-b border-solid border-x-0 border-t-0" v-for="basic in basicdata" :key="basic.label">
					<text>{{ basic.label }}</text>
					<text v-if="basic.prop === 'sex'">{{ detail.basicinfo[basic.prop] == "W" ? '女' : detail.basicinfo[basic.prop] == "M" ? '男' : '' }}</text>
					<text v-else>{{ detail.basicinfo[basic.prop] != null ? detail.basicinfo[basic.prop] : ""}}</text>
				</view>
			</scroll-view>
		</view>
        <!-- 统计信息 -->
        <view class="h-full bg-white" v-if="isTag('统计信息')">
            <scroll-view scroll-y="true" class="h-full">
                <view class="h-full grid-container">
                    <view class="grid-item flex flex-center flex-col" v-for="total in totallist" :key="total.label">
                        <view class="">
                            <text>{{ total.label }}</text>
                        </view>
                        <view class="text-red-400 mt-1">
                            <text>{{ detail.total[total.prop] || 0 }}</text>
                        </view>
                    </view>
                </view>
			</scroll-view>
        </view>
        <!-- 消费记录 -->
        <view class="h-full bg-white" v-if="isTag('消费记录')">
            <scroll-view 
				scroll-y="true" 
				class="h-full"
				:scroll-top="scrollTop"
				:lower-threshold="200"
				@scrolltolower="logsLower"
				@scroll="scroll"
				v-if="detail.logs.length"
			>
                <view class="flex flex-col" v-for="log in detail.logs" :key="log.docno">
                    <view class="h-10 bg-white flex items-center justify-between px-4">
						<view class="storelist">
							<uni-icons type="shop"></uni-icons>
							<text>{{ log.store_name }}</text>
							<uni-icons type="forward"></uni-icons>
						</view>
						<view class="">
							<text>{{ log.statustime}}</text>
						</view>
					</view>
                    <view class="h-full bg-white overflow-hidden">
						<view class="flex p-4 border border-b border-solid border-x-0 border-t-0 border-gray-100" v-for="(item, index) in log.items" :key="item.no + index">
							<view class="w-24 h-20 bg-white">
								<image class="w-full h-full" :src="item.imageurl || '/static/img/default_product.png'" @error="imageError($event, index)" mode="aspectFit"></image>
							</view>
							<view class="w-full flex">
								<view class="w-full h-full ml-4">
									<view class="">
										<text>款号：{{ item.name }}</text>
									</view>
									<view class="mt-2">
										<text>颜色：{{ item.color_name || "" }}</text>
										<text class="ml-1">尺码：{{ item.size_name || "" }}</text>
									</view>
								</view>
								<view class="w-20 h-full">
									<view class="text-center">
										<text>￥{{ item.priceactual || 0}}</text>
									</view>
									<view class="mt-2 text-center">
										{{ 'x' + (item.qty || 0) }}
									</view>
								</view>
							</view>
						</view>
					</view>
                    <view class="border border-b border-solid border-x-0 border-t-0 border-gray-200 px-4 bg-white" v-if="log.payitems.length">
						<view class="text-base font-weight-600 h-10 flex items-center">
							<text class="">支付明细</text>
						</view>
						<view class="flex items-center justify-between mt-1 mb-1" v-for="payitem in log.payitems" :key="payitem.pay_name">
							<text>{{ payitem.pay_name }}</text>
							<text>￥{{ payitem.payamount }}</text>
						</view>
					</view>
                </view>
            </scroll-view>
            <view v-else class="flex flex-col flex-center py-10">
				<text>暂无消费记录</text>
			</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import useScroll from '@/utils/useScroll'
import { useVipQueryStore } from '@/stores/vip-query'
const vipQueryStore = useVipQueryStore()
/* 参数 */
const { detail } = toRefs(vipQueryStore)
/* 方法 */
const { detailDateTagChange, detailChangeLog, setDetailOptions, tagChange, isTag, logsLower, imageError, detailInit } = vipQueryStore
const usescroll = useScroll()
const { scrollTop, oldScrollTop, isGoTo, scroll, goTop } = usescroll

const basicdata = ref([{
    label: "手机号",
    prop: "phone"
}, {
    label: "性别",
    prop: "sex"
}, {
    label: "生日",
    prop: "birthday"
}, {
    label: "积分",
    prop: "integral"
}, {
    label: "余额",
    prop: "amount"
}, {
    label: "卡券",
    prop: "vou_cnt"
}, {
    label: "开卡日期",
    prop: "open_date"
}, {
    label: "开卡门店",
    prop: "open_store_name"
}, {
    label: "开卡人",
    prop: "open_user"
}, {
    label: "服务门店",
    prop: "servicestore"
}, {
    label: "服务导购",
    prop: "serviceguide"
}])

const totallist = ref([{
    label: '消费总额',
    prop: 'total_amt'
}, {
    label: '消费笔数',
    prop: 'tot_cnt'
}, {
    label: '购买数量',
    prop: 'tot_qty'
}, {
    label: '件单价',
    prop: 'pdt_avg_price'
}, {
    label: '客单价',
    prop: 'order_avg_price'
}, {
    label: '连带率',
    prop: 'jpn'
}, {
    label: '最高单笔',
    prop: 'order_max_amt'
}, {
    label: '平均折扣',
    prop: 'avg_dis'
}, {
    label: '平均消费周期',
    prop: 'avg_days'
}, {
    label: '最近消费日期',
    prop: 'last_day'
}])

onLoad((options: any) => {
    setDetailOptions(options)
})
onMounted(() => {
    detailInit()
})
</script>

<style scoped lang="scss">
.grid-container {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 140rpx 140rpx 140rpx 140rpx;
	justify-content: space-evenly;
    .grid-item {
	    height: 140rpx;
    }
}

</style>