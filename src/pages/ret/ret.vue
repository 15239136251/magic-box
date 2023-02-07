<template>
	<view class="p-5 bg-white">
		<view 
			class="w-full h-32 rounded-xl flex items-center bg-white border border-solid border-red-500" 
			@click="to('/pages/retOriginalOrderList/retOriginalOrderList')">
			<view class="bg-gray-300 w-28 h-28 flex flex-center ml-2 rounded-xl">
				<image src="../../static/img/yuan_dan.png" class="w-20 h-20" mode=""></image>
			</view>
			<view class="ml-2 w-48">
				<view class="font-weight-600">原单退货</view>
				<text class="text-sm text-gray-400">需要通过原单号，消费日期，顾客手机号等信息退货</text>
			</view>
		</view>
		<view 
			class="w-full mt-5 h-32 rounded-xl flex items-center font-weight-600 bg-white border border-solid border-red-500" 
			@click="to('/pages/retNonOriginalOrder/retNonOriginalOrder')">
			<view class="bg-gray-300 w-28 h-28 flex flex-center ml-2 rounded-xl">
				<image src="../../static/img/fei_yuan_dan.png" class="w-20 h-20" mode=""></image>
			</view>
			<view class="ml-2 w-48">
				<view class="font-weight-600">非原单退货</view>
				<text class="text-sm text-gray-400">无需提供原购买信息，直接录入商品退货</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { $goto } from '@/utils/navigate';
// 跳转退货页面
const to = (url: string) => {
    $goto({
        url
    }, true)
}
</script>
