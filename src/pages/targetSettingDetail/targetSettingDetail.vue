<template>
    <view class="target-setting-detail container overflow-y-auto flex flex-col text-sm bg-white">
        <view class="bg-white flex items-center h-10 border-b font-weight-600 ">
			<view class="w-48 text-center">
				<text>导购</text>
			</view>
			<view class="w-full text-center">
				<text>个人月指标</text>
			</view>
        </view>
        <view class="h-full overflow-hidden text-sm flex flex-col bg-white">
            <!-- 列表内容 -->
			<scroll-view scroll-y="true" class="text-sm font-weight-600 mb-20">
				<view class="flex items-center h-10 border-b" v-for="item in detail.list" :key="item.id">
					<view class="w-48 text-center">
						<text>{{ item.name }}</text>
					</view>
					<view class="w-full flex justify-center">
						<input class="text-sm" type="number" :value="item.tot_amt_mark" @input="empAmtInput($event, item)" placeholder="请输入个人月指标" />
					</view>
				</view>
			</scroll-view>
			<!-- 按钮 -->
			<view class="fixed left-0 bottom-0 w-full flex h-12">
				<view class="flex-1 flex-center flex bg-gray-100" @click="out">
					<text>取消</text>
				</view>
				<view class="flex-1 flex-center flex bg-red-500 text-white" @click="save">
					<text>确定</text>
				</view>
			</view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { useTargetSettingStore } from '@/stores/target-setting'

const targetSettingStore = useTargetSettingStore()
// 参数
const { detail } = toRefs(targetSettingStore)
// 方法
const { empAmtInput, out, save, getDetail } = targetSettingStore
getDetail()
</script>

<style scoped>
.border-b {
	border-bottom: 1px solid #ccc;
}
</style>