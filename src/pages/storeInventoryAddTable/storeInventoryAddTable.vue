<template>
    <view class="store-inventory-addtable bg-white h-screen relative">
        <!-- 信息 -->
		<view class="h-64 text-sm px-2">
			<!-- 店仓 -->
			<view class="border-b border-gray-300 h-10 border-solid border-t-0 border-l-0 border-r-0 flex items-center">
				<!-- 名称 -->
				<view class="w-32">
					<text>盘点店仓:</text>
				</view>
				<!-- 组件 -->
				<uni-combox
					class="w-full" 
					placeholder="请选择店仓"
					is-border
					:value="detail.storeId" 
					:candidates="detail.storelist || []" 
					:type="'id'"
					:disabled="disabled"
					@input="storeInput"
				></uni-combox>
			</view>
			<!-- 类型 -->
			<view class="border-b border-gray-300 h-10 border-solid border-t-0 border-l-0 border-r-0 flex items-center">
				<!-- 名称 -->
				<view class="required w-32">
					<text>盘点类型:</text>
				</view>
				<!-- 组件 -->
				<uni-combox 
					class="w-full"
					placeholder="请选择盘点类型(必填)"
					no-filter
					is-border
					:value="detail.typeId" 
					:candidates="detail.typelist" 
					:disabled="disabled"
					@input="typeInput" 
				></uni-combox>
			</view>
			<!-- 单据日期 -->
			<view class="border-b border-gray-300 h-10 border-solid border-t-0 border-l-0 border-r-0 flex items-center">
				<!-- 名称 -->
				<view class="w-32">
					<text>单据日期:</text>
				</view>
				<!-- 组件 -->
				<uni-datetime-picker
					class="w-full"
					type="date"
					returnType="number"
					no-bg
					:border="false"
					:value="detail.billdate"
					:disabled="disabled"
					@change="billdateChange"
				/>	
			</view>
			<!-- 备注 -->
			<view class="border-b border-gray-300 h-10 border-solid border-t-0 border-l-0 border-r-0 flex items-center">
				<!-- 名称 -->
				<view class="w-32">
					<text>备注:</text>
				</view>
				<!-- 组件 -->
				<view class="w-full px-2">
					<input type="text" v-model="detail.description" placeholder="请输入备注信息,最多100个汉字" maxlength="100" :disabled="disabled">
				</view>
			</view>
		</view>
        <!-- 底部按钮 -->
		<view class="absolute bottom-4 left-0 w-full">
			<view class="px-2">
				<view class="rounded-full h-10 flex items-center justify-center bg-red-500 text-white" @click="addTable">
					<text>新增</text>
				</view>
			</view>
		</view>
    </view>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { useInventoryStore } from '@/stores/store-inventory'

const inventoryStore = useInventoryStore()
// 参数
const { detail, disabled } = toRefs(inventoryStore)
// 方法
const { billdateChange, storeInput, typeInput, addTable, getStoreList, getTypeList } = inventoryStore
getStoreList()
getTypeList()
</script>

<style scoped>

</style>