<template>
    <view class="store-in-detail container overflow-y-auto flex flex-col">
        <!-- 单头 -->
        <view class="w-full bg-white text-sm relative">
            <view class="p-2">
				<view class="flex mb-3">
					<view class="flex-auto">
						<text>单据编号：</text>
						<text>{{ detail.docno || "" }}</text>
					</view>
				</view>
				<view class="flex mb-3">
					<view class="flex-auto">
						<text>发货门店：</text>
						<text>{{ detail.origname || "" }}</text>
					</view>
				</view>	
				<view class="flex mb-3">
					<view class="flex-auto flex">
						<text class="">运单号：</text>
						<text>{{ detail.tranwayno || "" }}</text>
					</view>
				</view>	
				<view class="flex mb-3">
					<view class="flex-auto flex">
						<text class="">备注：</text>
						<text style="width: 65%; word-break:break-word">{{ detail.description || "" }}</text>
					</view>
				</view>
			</view>
            <view class="py-1 flex items-center justify-around border border-solid border-x-0 border-gray-200">
				<view class="info flex flex-col items-center">
					<text>通知数量</text>
					<text class="num">{{ noticeCount }}</text>
				</view>
				<view class="info flex flex-col items-center">
					<text>已扫描</text>
					<text class="num">{{ scanCount }}</text>
				</view>
				<view class="info flex flex-col items-center text-red-500" @click="diffFilter">
					<text>差异数量</text>
					<text class="num">{{ noticeCount - scanCount }}</text>
				</view>
			</view>
            <view class="p-2">
				<search-sku-input :disabled="detail.status == 2" @input="setSearchValue"></search-sku-input>
			</view>
            <view class="status-detail py-1 px-2 status-undo" v-if="detail.status == 1">
				<text>待入库</text>
			</view>
			<view class="status-detail py-1 px-2 status-done" v-else-if="detail.status == 2">
				<text>已入库</text>
			</view>
        </view>
        <view class="h-full flex flex-col items-center p-2 mb-2 overflow-hidden">
            <view class="w-full rounded-t bg-white border border-solid border-gray-200 border-x-0 border-t-0 flex items-center">
				<view class="w-full flex bg-white overflow-hidden border border-solid border-gray-200 border-x-0 border-t-0" style="border: none; font-size: 28rpx; height: 80rpx">
					<view class="flex flex-center" style="width: 70%">
						<text style="font-weight: 600;">商品</text>
					</view>
					<view class="flex flex-center" style="width: 30%">
						<text style="font-weight: 600;">数量</text>
					</view>					
				</view>
			</view>
            <scroll-view
                scroll-y="true" 
                class="overflow-auto text-xs rounded-b bg-white" 
                style="margin-bottom: 90rpx"
				:scroll-top="scrollTop" 
				:lower-threshold="200"
				@scroll="scroll"
			>
                <view 
					class="bg-white border border-solid border-gray-200 border-x-0 border-t-0 overflow-hidden p-3 mb-2 flex" 
					style="font-size: 26rpx;" 
					v-show="item.noShow != true"
					v-for="(item, index) in detail.items" 
					:key="item.no" 
				>
                    <view style="width: 70%">
						<view class="" v-if="item.dim3name != '赠品'">
							<text>{{ item.name + ' ' + item.no }}</text>
						</view>
						<view class="" v-else>
							<text>{{ item.value }}</text>
						</view>
						<view class="flex justify-between mt-2">
							<view class="">
								<text>{{ item.value1 + `(${item.value1_code})` + ' ' + item.value2 }}</text>
							</view>
						</view>
					</view>
                    <view style="width: 30%">
						<view class="search-input flex items-center px-1" v-if="detail.status == 2">
							<input 
								type="text"
								ref="inputMultiple" 
								style="text-align: center;"
								placeholder=""
								disabled
								:value="item.qtyin"
							/>
						</view>
						<uni-number-box :value="item.qtyin" :max="item.qtyout" @change="inputnumberChange($event, index)" v-else></uni-number-box>
						<view class="flex">
							<view class="flex-1 py-2">
								<view class="flex flex-center">
									<image class="w-5 h-5" src="/static/svg/tong_zhi.svg" mode=""></image>
									<view class="ml-1">
										<text>{{ item.qtyout }}</text>
									</view>
								</view>
							</view>
							<view class="flex-1 py-2 flex flex-center">
								<view class="flex flex-center">
									<image class="w-5 h-5" src="/static/svg/cha_yi.svg" mode=""></image>
									<view class="ml-1">
										<text>{{ item.qtyout - item.qtyin }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
                </view>
            </scroll-view>
            <view class="go-top rounded-full p-2" @click="goTop" v-if="isGoTo">
				<image class="w-full h-full" src="/static/svg/zd.svg" mode=""></image>
			</view>
        </view>
        <!-- 底部按钮 -->
        <view class="detail-button w-full">
			<view class="flex detail-button-wrap py-3 mr-2" >
				<button plain="true" size="mini" class="rounded-full mr-2" @click="out">退出</button>
				<button plain="true" size="mini" class="rounded-full mr-2" :disabled="detail.status == 2" v-if="detail.status != 2" @click="autoMatching">自动匹配</button>
				<button plain="true" size="mini" class="rounded-full mr-2" :disabled="detail.status == 2" @click="save">仅保存</button>
				<button plain="true" size="mini" class="rounded-full" :disabled="detail.status == 2" @click="submit">保存并提交</button>
			</view>
		</view>
        <!-- 保存并提交弹窗 -- 物流 -->
        <van-popup v-model:show="submitDialog" @click-overlay="submitDialog = false" position="center" title="保存并提交">
            <view class="bg-white p-4 w-64" style="font-size: 26rpx;">
				<view class="flex items-center">
					<view class="head-title">
						<text>差异备注：</text>
					</view>
					<view class="head-content">
						<input
							type="text"
							class="w-full px-2 py-1"
							placeholder="请填写差异备注"
							style="background-color: #F3F4F6; font-size: 26rpx;"
							v-model="diffRemarks"
						/>
					</view>
				</view>
				<view class="px-2 flex flex-center mt-2">
					<view class="border border-solid rounded-full px-3 py-1 flex items-center" @click="submitDialog = false">
						退出
					</view>
					<view class="ml-3 border border-solid rounded-full px-3 py-1 flex items-center" @click="submitDialogOk">
						确定
					</view>
				</view>
			</view>
        </van-popup>
    </view>
</template>

<script setup lang="ts">
import { ref, toRefs, onMounted, nextTick, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useInStore } from '@/stores/store-in'
import { debounce } from '@/utils/debounce'
import { getDate } from '@/utils/utils'

onLoad((options) => {
    id.value = Number(options.id) || 4265
})
onMounted(() => {
    getDetail(id.value)
})

const id = ref(-1)
const scrollTop = ref(0)
const oldScrollTop = ref(0)
const diffRemarks = ref('')
const submitDialog = ref(false)
const inStore = useInStore()
// 参数
const { detail, expcomlist, detailId } = toRefs(inStore)
// 方法
const { copy, getDetail, setSearchValue, inputnumberChange, autoMatchingAction, saveApi, saveAndSubmit, getExpcom } = inStore

const noticeCount = computed(() => {
    let count = 0
    detail.value.items.forEach(item => {
        count = count + Number(item.qtyout)
    })
    return count
})

const scanCount = computed(() => {
    let count = 0
    detail.value.items.forEach(item => {
        count = count + Number(item.qtyin)
    })
    return count
})

const diffFilter = () => {
    detail.value.items.forEach(item => {
        if((item.qtyout - item.qtyin) <= 0) {
            item.noShow = true
        }
    })
}

const scroll = (e: any) => {
	oldScrollTop.value = e.detail.value
}

const isGoTo = computed(() => scrollTop.value > 200)
const goTop = () => {
	scrollTop.value = oldScrollTop.value
    nextTick(() => {
        scrollTop.value = 0
    })
}

const out = () => {
    if (detail.value.status == 2) return uni.navigateBack()
    uni.showModal({
        title: '退出',
        content: '确认要退出吗？',
        success: function (res) {
            if (res.confirm) {
                uni.navigateBack()
            }
        }
    });
}

const autoMatching = () => {
    uni.showModal({
        title: '自动匹配',
        content: '确认要清空当前扫描数量，自动匹配入库数量吗',
        success: function (res) {
            if (res.confirm) {
                autoMatchingAction(id.value)
            }
        }
    })
}

const save = () => {
    debounce(saveApi, id.value)
}

const submit = () => {
    if (detail.value.items.length < 1) return uni.showToast({ title: '没有明细，不允许提交', icon: 'none' })
	let submit = true;
	detail.value.items.forEach(item => {
		if (item.qtyin != item.qtyout) {
			submit = false
		}
	});
	if (submit) {
		uni.showModal({
			content: "确认提交？",
			success:function(res){
				if (res.confirm) {
					console.log('用户点击确定');
					saveAndSubmit({ id: id.value, main: {}})
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			},
			fail:function(e){
				console.log("入库提交确认弹窗失败", e);
			}
		})
	} else {
		submitDialog.value = true
	}
}

const submitDialogOk = () => {
	const data = {
		id: id.value,
		main: {
			diffRemarks: diffRemarks.value,
			datein: getDate()
		}
	}
	console.log("🚀 ~ file: storeOutDetail.vue:349 ~ submitDialogOk ~ data", data)
	debounce(saveAndSubmit, data)
	submitDialog.value = false
}
</script>

<style scoped>
.search-input {
    background: #F3F4F6;
    min-width: 160rpx;
    height: 30px;
    border: 1px solid #F3F4F6;
    border-radius: 4px;
    overflow: hidden;
    padding: 10rpx 0 ;
    font-family: sans-serif;
}

.search-input input {
    flex-grow: 1;
    font-size: 28rpx;
    width: 60%;
    height: 60rpx;
    border: none;
    outline: none;
}

.search-input:focus-within {
    border-color: #777;
}

.border-notice {
    border: 1px solid #ccc;
    width: 90%;
    border-radius: 10rpx;
}
	
.border-diff {
    border: 1px solid red;
    width: 90%;
    color: red;
    border-radius: 10rpx;
}

.go-top {
    width: 40rpx;
    height: 40rpx;
    background-color: white;
    border: 1px solid black;
    position: fixed;
    right: 30rpx;
    bottom: 130rpx;
}

.detail-button {
    position: fixed;
    left: 0;
    bottom: 0;
    background-color: white;
    font-size: 30rpx;
}

.detail-button-wrap {
    float: right;
}

.head-title {
    width: 130rpx;
    /* background-color: #e5e6e7; */
}

.head-content {
    background-color: #F3F4F6;
}

.head-content > .input {
    padding-left: 10rpx;
    padding-right: 10rpx;
    font-size: 26rpx;
}
</style>