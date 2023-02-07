<template>
    <view class="target-setting container overflow-y-auto flex flex-col text-sm">
        <view class="p-2 bg-white">
            <easy-input class="w-full" :value="searchValue" @input="searchInput" @search="search"></easy-input>
        </view>
        <view class="h-full overflow-hidden text-sm flex flex-col bg-white">
            <!-- 列表标题 -->
			<view class="flex items-center h-10 border-b font-weight-600">
				<view class="w-32 text-center">
					<text>年月</text>
				</view>
				<view class="w-full text-center">
					<text>门店月指标</text>
				</view>
				<view class="w-32 text-center">
					<text></text>
				</view>
			</view>
			<!-- 列表内容 -->
			<scroll-view scroll-y="true" class="h-full">
				<view class="flex items-center h-10 border-b" v-for="item in list" :key="item.id" @click="goto(item.id)">
					<view class="w-32 text-center">
						<text>{{ item.yearmonth }}</text>
					</view>
					<view class="w-full text-center">
						<text>{{ item.tot_amt_mark }}</text>
					</view>
					<view class="w-32 text-center">
						<uni-icons type="forward"></uni-icons>
					</view>
				</view>
			</scroll-view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { useTargetSettingStore } from '@/stores/target-setting'

const targetSettingStore = useTargetSettingStore()
// 参数
const { searchValue, list } = toRefs(targetSettingStore)
// 方法
const { searchInput, search, goto, getSettingList  } = targetSettingStore
getSettingList()
</script>

<style scoped>
.border-b {
	border-bottom: 1px solid #ccc;
}
</style>