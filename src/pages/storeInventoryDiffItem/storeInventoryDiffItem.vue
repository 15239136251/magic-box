<template>
	<view class="bg-white h-screen relative text-sm">
		<!-- 顶部信息 -->
		<view class="p-2 h-20">
			<view class="h-8 flex items-center justify-between">
				<view class="">
					<text>账面总数:</text>
					<text>{{ totQtyBook }}</text>
				</view>
				<view class="">
					<text>实盘总数:</text>
					<text>{{ totQty }}</text>
				</view>
				<view class="">
					<text>差异总数</text>
					<text>{{ totQtyBook - totQty }}</text>
				</view>
			</view>
			<view class="bg-gray-100 rounded px-3 flex h-10">
				<view class="flex items-center">
					<image class="w-5 h-5" src="/static/svg/search.svg" mode=""></image>
				</view>
				<view class="w-full p-2">
					<input type="text" v-model="diffItem.inputVal" placeholder="请输入商品款号或条码" @confirm="diffItemSearch" />
				</view>
				<text class="flex flex-center w-18" @click="diffItemSearch">搜索</text>			
			</view>
		</view>
		<!-- 中间表格 -->
		<view class="bg-white overflow-hidden" style="height: calc(100% - 9.5rem);">
			<scroll-view scroll-y="true" class="h-full">
				<uni-table border stripe class="w-full">
					<uni-tr>
						<uni-th align="center" width="300">商品</uni-th>
						<uni-th align="center">账面数</uni-th>
						<uni-th align="center">实盘数</uni-th>
						<uni-th align="center">差异数</uni-th>
					</uni-tr>
					<uni-tr v-for="item in diffItem.items" :key="item.id" @dbClick="diffItemDetailOpen({item})">
						<uni-td align="">
							<view>
								<text>{{ item.pdt_name }}</text>
							</view>
							<view>
								<text>{{ item.pdt_value }}</text>
							</view>
						</uni-td>
						<uni-td align="center">{{ item.qtybook }}</uni-td>
						<uni-td align="center">{{ item.qty }}</uni-td>
						<uni-td align="center">{{ Math.abs(item.qtybook - item.qty) }}</uni-td>
					</uni-tr>
				</uni-table>
			</scroll-view>
		</view>
		<!-- 底部按钮 -->
		<!-- <view class="absolute bottom-0 left-0 w-full">
			<view class="flex h-10">
				<view class="flex-1 flex items-center justify-center bg-gray-200" @click="prePage">
					<text>上一页</text>
				</view>
				<view class="flex-1 flex items-center justify-center bg-red-500 text-white" @click="nextPage">
					<text>下一页</text>
				</view>
			</view>
		</view> -->
		<!-- 查看详情 -->
		<van-popup v-model:show="diffItemDetailDialog" @click-overlay="diffItemDetailClose" ref="diffItemDetail" position="bottom">
			<view class="w-full bg-white rounded-xl overflow-hidden" style="height: 75vh;">
				<!-- 颜色区域 -->
				<view class="h-10 relative">
					<scroll-view scroll-x="true" style="white-space: nowrap; width: 80%;">
						<view 
							class="h-8 mt-2 w-16 ml-1 bg-gray-200 rounded-tl rounded-tr text-center" 
							style="display: inline-block; line-height: 2rem;"
							v-for="color in diffItem.colorlist" 
							:class="{'bg-red-400 text-white': color.code == diffItem.selectColorCode}"
							:key="color.id"
							@click="selectDiffItemColor({code: color.code, name: diffItem.pdtName})"
						>
							{{ color.name }}
						</view>
					</scroll-view>
					<!-- <text class="font-weight-600">货架小计</text> -->
					<view class="absolute right-4 top-2" @click="diffItemDetailClose">
						<uni-icons type="closeempty" size="20"></uni-icons>
					</view>
				</view>
				<!-- 表格 -->
				<view class="bg-white" style="height: calc(100% - 3rem);">
					<scroll-view scroll-y="true" class="h-full">
						<uni-table border stripe class="w-full">
							<uni-tr>
								<uni-th align="center" width="120">尺码</uni-th>
								<uni-th align="center" width="120">账面数</uni-th>
								<uni-th align="center" width="120">实盘数</uni-th>
								<uni-th align="center" width="120">差异数</uni-th>
							</uni-tr>
							<uni-tr v-for="sku in diffItem.skulist" :key="sku.no">
								<uni-td align="center">{{ sku.no }}</uni-td>
								<uni-td align="center">{{ sku.qtybook }}</uni-td>
								<uni-td align="center">{{ sku.qty }}</uni-td>
								<uni-td align="center">{{ sku.qtybook - sku.qty }}</uni-td>
							</uni-tr>
							<uni-tr>
								<uni-td align="center">合计</uni-td>
								<uni-td align="center">{{ totSkuQtyBook }}</uni-td>
								<uni-td align="center">{{ totSkuQty }}</uni-td>
								<uni-td align="center">{{ totSkuQtyBook - totSkuQty }}</uni-td>
							</uni-tr>
						</uni-table>
					</scroll-view>
				</view>
			</view>
		</van-popup>
	</view>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useInventoryStore } from '@/stores/store-inventory'

const inventoryStore = useInventoryStore()
// 参数
const { diffItem, diffItemDetailDialog, totQtyBook, totQty, totSkuQtyBook, totSkuQty  } = toRefs(inventoryStore)
// 方法
const { getDiffItem, diffItemSearch, diffItemDetailOpen, diffItemDetailClose, selectDiffItemColor  } = inventoryStore

onLoad((options: any) => {
    console.log("🚀 ~ file: storeInventoryAddItem.vue:168 ~ onLoad ~ options", options)
})

const init = () => {
    getDiffItem()
}
init()
</script>