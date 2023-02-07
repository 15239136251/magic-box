<template>
	<view class="bg-white h-screen relative text-sm">
		<!-- 顶部信息 -->
		<view class="p-2 h-20">
			<view class="h-8 flex items-center justify-between">
				<view class="" @click="editShelfOpen">
					<text>当前货架:</text>
					<text class="text-red">{{ detail.shelfValue }}</text>
					<uni-icons color="red" type="compose"></uni-icons>
				</view>
				<view class="">
					<text>总扫码数量:</text>
					<text>{{ totItemsQty }}</text>
				</view>
				<view class="" @click="subTotShelfOpen">
					<text class="text-red">货架小计</text>
					<uni-icons color="red" type="arrowright"></uni-icons>
				</view>
			</view>
			<search-sku-input @input="setSearchValue"></search-sku-input>
		</view>
		<!-- 中间表格 -->
		<view class="bg-white overflow-hidden" style="height: calc(100% - 9.5rem);">
			<scroll-view scroll-y="true" class="h-full">
				<uni-table border stripe class="w-full">
					<uni-tr>
						<uni-th align="center" width="120">货架</uni-th>
						<uni-th align="center" width="400">商品</uni-th>
						<uni-th align="center" width="120">扫描数量</uni-th>
					</uni-tr>
					<uni-tr v-for="item in detail.shelfItems" :key="item.id" @dbClick="editItemQtyOpen({item})">
						<uni-td align="center">{{ item.shelfno }}</uni-td>
						<uni-td align="">
							<view>
								<text>{{ item.no }}</text>
							</view>
							<view>
								<text>{{ item.pdt_name || item.name }}</text>
								<text class="ml-1">{{ item.pdt_value || item.value }}</text>
							</view>
						</uni-td>
						<uni-td align="center">{{ item.qty }}</uni-td>
					</uni-tr>
				</uni-table>
			</scroll-view>
		</view>
		<!-- 底部按钮 -->
		<view class="absolute bottom-2 left-0 w-full">
			<view class="px-2">
				<view class="rounded-full h-10 flex items-center justify-center bg-red-500 text-white" @click="refreshItem">
					<text>更新盘点明细</text>
				</view>
			</view>
		</view>
		<!-- 编辑货架 -->
		<van-popup v-model:show="editShelfDialog" @click-overlay="editShelfClose" position="center">
			<view class="w-64 h-64 bg-white rounded-xl">
				<!-- 标题 -->
				<view class="flex items-center justify-center h-10">
					<text class="font-weight-600">编辑货架号</text>
				</view>
				<!-- 内容 -->
				<view class="flex items-center h-8">
					<text class="w-16 text-right">货架号:</text>
					<input 
						class="border border-gray-400 border-solid py-1 px-2 rounded w-36 ml-1" 
						v-model="detail.shelfDialogValue" 
						type="text" 
						placeholder="请输入货架号"
					/>						
				</view>
				<view class="h-32 px-4">
					<!-- 货架列表 -->
					<scroll-view scroll-y="true" class="h-full">
						<view 
							class="p-1 border border-solid border-t-0 border-l-0 border-r-0" 
							v-for="item in shelfDialogList" 
							:key="item.no"
							@click="detail.shelfDialogValue = item.no"
						>
							<text>{{ item.no }}</text>
						</view>
					</scroll-view>
				</view>
				<!-- 按钮 -->
				<view class="h-12 flex items-center justify-around">
					<view class="flex items-center justify-center bg-gray-100 rounded-full w-24 h-8" @click="editShelfClose">
						<text>退出</text>
					</view>
					<view class="flex items-center justify-center bg-red-500 text-white rounded-full w-24 h-8" @click="editShelfSave">
						<text>确定</text>
					</view>
				</view>
			</view>
		</van-popup>
		<!-- 货架小计 -->
		<van-popup v-model:show="subTotShelfDialog" @click-overlay="subTotShelfClose" ref="subTotShelf" position="bottom">
			<view class="w-full bg-white rounded-xl overflow-hidden" style="height: 75vh;">
				<!-- 标题 -->
				<view class="flex items-center justify-center h-10 relative">
					<text class="font-weight-600">货架小计</text>
					<view class="absolute right-4 top-2" @click="subTotShelfClose">
						<uni-icons type="closeempty" size="20"></uni-icons>
					</view>
				</view>
				<!-- 内容 -->
				<view class="bg-white" style="height: calc(100% - 3rem);">
					<scroll-view scroll-y="true" class="h-full">
						<uni-table border stripe class="w-full">
							<uni-tr>
								<uni-th align="center" width="120">货架</uni-th>
								<uni-th align="center" width="120">扫描数量</uni-th>
							</uni-tr>
							<uni-tr v-for="shelf in detail.shelflist" :key="shelf.no">
								<uni-td align="center">{{ shelf.no }}</uni-td>
								<uni-td align="center">{{ shelf.qty }}</uni-td>
							</uni-tr>
							<uni-tr>
								<uni-td align="center">总计</uni-td>
								<uni-td align="center">{{ totShelfsQty }}</uni-td>
							</uni-tr>
						</uni-table>
					</scroll-view>
				</view>
			</view>
		</van-popup>
		<!-- 修改数量 -->
		<van-popup v-model:show="editItemQtyDialog" @click-overlay="editItemQtyClose" ref="editItemQty" position="center">
			<view class="w-64 h-54 bg-white rounded-xl">
				<!-- 标题 -->
				<view class="flex items-center justify-center h-10">
					<text class="font-weight-600">修改数量</text>
				</view>
				<!-- 内容 -->
				<view class="h-32">
					<view class="flex items-center mb-2">
						<text class="w-16 text-right">货架号:</text>
						<input class="border border-gray-400 border-solid py-1 px-2 rounded w-36 ml-1 bg-gray-100" :value="detail.itemDialogValue.shelf" type="text" disabled>
					</view>
					<view class="flex items-center mb-2">
						<text class="w-16 text-right">条码:</text>
						<input class="border border-gray-400 border-solid py-1 px-2 rounded w-36 ml-1 bg-gray-100" :value="detail.itemDialogValue.sku" type="text" disabled>
					</view>
					<view class="flex items-center mb-2">
						<text class="w-16 text-right">数量:</text>
						<input class="border border-gray-400 border-solid py-1 px-2 rounded w-36 ml-1" v-model="detail.itemDialogValue.qty" type="number">
					</view>
				</view>
				<!-- 按钮 -->
				<view class="h-10 flex items-center justify-around">
					<view class="flex items-center justify-center bg-gray-100 rounded-full w-24 h-8" @click="editItemQtyClose">
						<text>退出</text>
					</view>
					<view class="flex items-center justify-center bg-red-500 text-white rounded-full w-24 h-8" @click="editItemQtySave">
						<text>确定</text>
					</view>
				</view>
			</view>
		</van-popup>
	</view>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useInventoryStore } from '@/stores/store-inventory'

const inventoryStore = useInventoryStore()
// 参数
const { detail, totItemsQty, shelfDialogList, totShelfsQty, editShelfDialog, subTotShelfDialog, editItemQtyDialog } = toRefs(inventoryStore)
// 方法
const { editShelfOpen, subTotShelfOpen, setSearchValue, editItemQtyOpen, refreshItem, editShelfClose, editShelfSave, subTotShelfClose, editItemQtyClose, editItemQtySave, getShelfItems, getShelfList } = inventoryStore

onLoad((options: any) => {
    console.log("🚀 ~ file: storeInventoryAddItem.vue:168 ~ onLoad ~ options", options)
})

const init = async () => {
	await getShelfList(true)
	getShelfItems()
}
init()
</script>