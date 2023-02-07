<template>
    <view class="check-stock container flex flex-col overflow-hidden text-sm">
        <!-- 标签切换 -->
        <view class="w-full bg-white pt-2">
			<view class="px-2">
				<view class="flex h-10">
					<view 
						class="flex-1 flex flex-center rounded-l-md" 
						:class="isTag('本店库存') ? 'text-red-400 border border-solid border-red-400' : 'bg-gray-100'" 
						@click="tagChange('本店库存')"
					>
						<text>本店库存</text>
					</view>
					<view 
						class="flex-1 flex flex-center rounded-r-md" 
						:class="isTag('邻店库存') ? 'text-red-400 border border-solid border-red-400' : 'bg-gray-100'" 
						@click="tagChange('邻店库存')"
					>
						<text>邻店库存</text>
					</view>
				</view>
			</view>
		</view>
        <!-- 本店库存 -->
        <view class="h-full flex flex-col" v-if="isTag('本店库存')">
            <view class="w-full bg-white py-2 h-auto">
				<view class="px-2 flex">
					<search-sku-input class="w-72" :value="ourSearchValue" :isStock="true" @input="ourSearchInput"></search-sku-input>
					<view class="w-10 flex-1 flex flex-center text-xs w-10 font-weight-600 mr-1" @click="ourReset">
						重置
					</view>
					<view class="w-10 flex-1 flex flex-center text-xs w-10 font-weight-600" @click="ourItemFilter">
						筛选
					</view>
				</view>
			</view>
            <view class="h-full overflow-hidden pb-10 mb-10 flex">
                <view class="bg-gray-100 w-60">
					<view 
						class="h-8 w-full flex flex-center" 
						style="background-color: #efefef; box-sizing: border-box; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;"
					>
						款号
					</view>
					<view class="w-full bg-gray-100 overflow-hidden text-xs" style="height: calc(100% - 2rem);">
						<scroll-view scroll-y="true" class="h-full">
							<view 
								class="h-8 w-full flex flex-center overflow-hidden bg-gray-100" 
								style="border-bottom: 1px solid #ddd; box-sizing: border-box;"
								:style="{'background-color': item.id == ourItemId ? 'white' : ''}"
								v-for="item in ourItemList" 
								:key="item.id"
								@click="getOurSku(item)"
							>
								{{ item.name }}
							</view>
						</scroll-view>
					</view>
				</view>
                <view class="bg-gray-100 w-full h-full overflow-auto">
					<uni-table border class="w-full">
						<uni-tr>
							<uni-th align="center" width="190">颜色</uni-th>
							<uni-th align="center" width="90">尺寸</uni-th>
							<uni-th align="center" width="90">库存</uni-th>
							<uni-th align="center" width="90">可配</uni-th>
							<!-- <uni-th align="center"  width="200">吊牌价</uni-th> -->
						</uni-tr>
						<uni-tr v-for="stock in ourStocklist" :key="stock.id" :select="stock.select">
							<uni-td align="center">{{ stock.value1 + "(" + stock.value1_code + ")" }}</uni-td>
							<uni-td align="center">{{ stock.value2 }}</uni-td>
							<uni-td align="center">{{ stock.qty }}</uni-td>
							<uni-td align="center">{{ stock.qtycan }}</uni-td>
							<!-- <uni-td align="center">{{ stock.pricelist }}</uni-td> -->
						</uni-tr>
						<uni-tr v-if="ourStocklist.length">
							<uni-td align="center">合计</uni-td>
							<uni-td align="center"></uni-td>
							<uni-td align="center">{{ getListTotQty }}</uni-td>
							<uni-td align="center">{{ getListTotQtyCan }}</uni-td>
						</uni-tr>
					</uni-table>
				</view>
            </view>
        </view>
        <!-- 邻店库存 -->
        <view class="h-full flex flex-col" v-if="isTag('邻店库存')">
            <view class="w-full bg-white py-2 h-auto">
				<view class="px-2">
					<search-sku-input :value="otherSearchValue" :isStock="true" @input="otherSearchInput" :isMultiple="true"></search-sku-input>
					<view class="mt-2 bg-gray-100 flex items-center ">
						<view class="flex flex-center w-10 h-full">
							<image class="w-5 h-5" src="/static/svg/search.svg" mode=""></image>
						</view>
						<uni-combox 
                            placeholder="请输入店码名称" 
                            class="w-full" 
                            type="id" 
                            style="border: none"
                            :value="otherStoreValue" 
                            :candidates="otherStorelist" 
                            @input="otherStoreInput" 
                        ></uni-combox>
					</view>
				</view>
			</view>
            <view class="h-full p-2 overflow-hidden pb-10 mb-12 flex flex-col">
                <view class="w-full rounded-t bg-white border border-solid border-gray-200 border-x-0 border-t-0 flex items-center">
					<view class="w-full flex bg-white overflow-hidden border border-solid border-gray-200 border-x-0 border-t-0" style="border: none; font-size: 28rpx; height: 80rpx;">
						<view class="w-2-3 flex flex-center">
							<text style="font-weight: 600;">商品</text>
						</view>
						<view class="w-1-3 flex flex-center">
							<text style="font-weight: 600;">数量</text>
						</view>					
					</view>
				</view>
                <scroll-view
					:scroll-top="scrollTop" 
					scroll-y="true" 
					class="overflow-auto text-xs rounded-b bg-white" 
					:lower-threshold="200"
					@scroll="scroll"
				>
                    <view class="flex w-full flex-center py-2" v-if="otherStocklist.length === 0">
						<text>暂无数据</text>
						<text v-if="otherPage > 1">，请返回上一页</text>
					</view>
					<template v-else>
						<view 
							class="bg-white border border-solid border-gray-200 border-x-0 border-t-0 overflow-hidden p-3 mb-2" 
							style="font-size: 26rpx;" 
							v-for="otherStock in otherStocklist" 
							:key="otherStock.id" 
						>
						<view class="flex">
							<view class="w-2-3">
								<view class="mb-1">
									<text>{{ otherStock.name + ' ' + otherStock.no }}</text>
								</view>
								<view class="mb-1 flex">
									<text>{{ otherStock.value1 + `(${otherStock.value1_code})` + ' ' + otherStock.value2 }}</text>
								</view>
								<view class="mb-1 flex">
									<view class="mr-2">
										<text>{{ '￥' +  otherStock.pricelist || 0 }}</text>
									</view>
								</view>
							</view>
							<view class="w-1-3">
								<view class="flex">
									<view class="flex-1 py-2 flex justify-end">
										<view class="flex flex-center flex-col py-2" :class="otherStock.items && otherStock.items.length ? 'border-batch' : 'border-notice'">
											<view>
												{{ otherStock.qtycan }}
											</view>
											<view class="mt-2">
												可配
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
						<uni-table border class="w-full" v-if="otherStock.items && otherStock.items.length">
							<uni-tr>
								<uni-th align="center">门店</uni-th>
								<uni-th align="center" width="220">可用库存</uni-th>
							</uni-tr>
							<uni-tr v-for="item in otherStock.items" :key="item.id">
								<uni-td align="center">{{ item.store_name }}</uni-td>
								<uni-td align="center">{{ item.qtycan }}</uni-td>
							</uni-tr>
						</uni-table>
						</view>
					</template>
                </scroll-view>
            </view>
			<view class="flex w-full h-10 bg-white fixed left-0 bottom-0">
				<view class="flex-1 flex flex-center" style="border-right: 1px solid #F3F4F6;" @click="otherPagePre">
					上一页
				</view>
				<view class="flex-1 flex flex-center" @click="otherPageNext">
					下一页
				</view>
			</view>
        </view>
        <!-- 本店库存 商品矩阵弹窗 -->
        <van-popup v-model:show="ourPdtFindDialog" @click-overlay="ourPdtFindDialogClose" position="bottom">
            <view class="bg-white w-full overflow-hidden">
                <view class="" style="height: calc(100% - 2.5rem);">
					<view class="w-full py-1 text-center font-weight-600">
						选择尺码颜色
					</view>
					<view class="overflow-auto" style="height: 75vh;">
						<view class="" v-for="color in ourPdtFind.colors" :key="color.id">
							<view class="text-sm bg-gray-100 text-center py-1">
								<text>{{ color.name + '[' + color.code + ']' }}</text>
							</view>
							<view class="bg-white flex flex-wrap p-2">
								<view 
									class="text-center w-20 py-1 m-1 rounded-full bg-gray-100" 
									:class="{'pdtFindSelect': ourPdtColorId == color.id && ourPdtSizeId == size.id}" 
									v-for="size in ourPdtFind.sizes"
									:key="size.id"
									@click="ourPdtFindSelectSku(color.id, size.id)"
								>
									{{ size.name }}
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="px-2 flex flex-center mt-2 text-white bg-red-400 h-10" @click="ourPdtFindSave">
					<text>确定</text>
				</view>
            </view>
        </van-popup>
    </view>
</template>

<script setup lang="ts">
import { toRefs, onMounted } from 'vue'
import useScroll from '@/utils/useScroll'

import { useCheckStockStore } from '@/stores/check-stock'
import { onUnload } from '@dcloudio/uni-app'

const checkStockStore = useCheckStockStore()
// 本店库存参数
const { ourSearchValue, ourItemList, ourItemId, ourStocklist, ourPdtFindDialog, getListTotQty, getListTotQtyCan, ourPdtFind, ourPdtColorId, ourPdtSizeId } = toRefs(checkStockStore)
// 本店库存方法
const { init, isTag, tagChange, ourSearchInput, ourReset, ourItemFilter, getOurSku, ourPdtFindDialogClose, ourPdtFindSelectSku, ourPdtFindSave } = checkStockStore
// 邻店库存参数
const { otherSearchValue, otherStoreValue, otherStorelist, otherStocklist, otherPage } = toRefs(checkStockStore)
// 邻店库存方法
const { otherSearchInput, otherStoreInput, otherPagePre, otherPageNext } = checkStockStore

const usescroll = useScroll()
const { scrollTop, scroll } = usescroll
onMounted(() => { init() })
onUnload(() => {
	checkStockStore.$reset()
})
</script>

<style scoped>

</style>