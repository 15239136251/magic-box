<template>
    <view class="home container overflow-y-auto">
        <view class="h-8 bg-white flex items-center justify-between py-1 px-3">
            <view class="text-xs flex items-center">
                <image class="w-5 h-5" src="/static/svg/gwb.svg" mode=""></image>
                <text class="ml-2 mr-2" v-if="store.length < 20">{{ store }}</text>
                <text class="ml-2 mr-2" v-else>{{ store.slice(0, 19) + '...' }}</text>
            </view>
            <view class="text-xs flex items-center" @click="logout">
                <image class="w-5 h-5" src="/static/svg/tui_chu.svg" mode=""></image>
                <text v-if="user.length < 6">{{ user }}</text>
                <text v-else>{{ user.slice(0, 5) + '...' }}</text>
			</view>
        </view>
        <view class="w-full mb-10">
            <view class="bg-white">
                <dateTagPicker @change="dateTagChange"></dateTagPicker>
                <view class="p-4" style="font-size: 28rpx; border-bottom: 1px solid #E5E7EB;">
                    <view class="flex flex-wrap">
						<view class="w-1-2 flex mb-4">
							<view class="rounded-full w-12 h-12">
								<image class="w-full h-full" src="/static/img/jin_e2x.png" mode=""></image>
							</view>
							<view class="ml-2 w-28">
								<view>成交金额（元）</view>
								<view class="mt-2" style="font-weight: 600;">{{ totData.totamt }}</view>
							</view>
						</view>
						<view class="w-1-2 flex mb-4">
							<view class="rounded-full w-12 h-12">
								<image class="w-full h-full" src="/static/img/cheng_jiao_bi_shu2x.png" mode=""></image>
							</view>
							<view class="ml-2 w-28">
								<view>成交笔数</view>
								<view class="mt-2" style="font-weight: 600;">{{ totData.totcnt }}</view>
							</view>
						</view>
                        <view class="w-1-2 flex mb-4">
							<view class="rounded-full w-12 h-12">
								<image class="w-full h-full" src="/static/img/cheng_jiao_shu_liang2x.png" mode=""></image>
							</view>
							<view class="ml-2 w-28">
								<view>成交数量</view>
								<view class="mt-2" style="font-weight: 600;">{{ totData.totqty }}</view>
							</view>
						</view>
						<view class="w-1-2 flex mb-4">
							<view class="w-12 h-12">
								<image class="w-full h-full" src="/static/img/xin_zeng_hui_yuan2x.png" mode=""></image>
							</view>
							<view class="ml-2 w-28">
								<view>新增会员</view>
								<view class="mt-2" style="font-weight: 600;">{{ totData.totvip }}</view>
							</view>
						</view>
					</view>
                </view>
				<!-- top -->
				<view class="flex items-center flex-wrap p-1">
					<view 
						class="w-1-4 my-1 text-sm flex flex-center flex-col" 
						v-for="topButton in homelist.top" 
						:key="topButton.text" 
						@click="to(topButton.path)"
					>
						<view class="w-full h-full flex flex-center flex-col">
							<image class="w-9 h-9" :src="topButton.iconUrl" mode=""></image>
							<text>{{ topButton.text }}</text>							
						</view>	
					</view>
				</view>
            </view>
			<!-- homelist -->
			<view class="bg-white mt-3 w-full" v-for="home in homelist.data" :key="home.title">
				<view class="text-gray-400 text-xs py-2 px-3 border-b border-solid border-x-0 border-t-0 flex items-center">
					<text class="text-xl font-wei-600 mr-1" style="color: black">{{ home.title }}</text>
					<text v-if="home.info">{{ home.info }}</text>
				</view>
				<view class="flex items-center flex-wrap p-1">
					<view 
						class="w-1-4 my-1 text-sm flex flex-center flex-col" 
						v-for="button in home.list" 
						:key="button.text" 
						@click="to(button.path)"
					>
						<view class="w-full h-full flex flex-center flex-col">
							<image class="w-9 h-9" :src="button.iconUrl" mode=""></image>
							<text>{{ button.text }}</text>							
						</view>	
					</view>
				</view>
			</view>
        </view>
		<view style="opacity: 0;">占位</view>
		<view class="w-full h-5 bg-white text-xs text-gray-500 fixed left-0 bottom-0 border-t border-solid border-x-0 border-b-0 flex flex-center">
			<text>上海云欢网络科技有限公司提供技术支持</text>
		</view>
    </view>
</template>

<script setup lang="ts">
import { toRefs, onBeforeMount, onMounted } from 'vue'
import uniStorage from '@/utils/uniStorage'
import wxUpdate from '@/utils/wxUpdate'
import getHomeList from '@/utils/homelist'
import { useHomeStore } from '@/stores/home'

// 组件
import dateTagPicker from '@/components/date-tag-picker/date-tag-picker.vue'

wxUpdate()
onMounted(() => {
	const logininfo = uniStorage.getItem('logininfo')
    if (logininfo) console.log("🚀 ~ file: home.vue:115 ~ onBeforeMount ~ logininfo", logininfo)
    	else return out()
	if (store.value === '' || user.value === '') setStoreAndUser()
	getTotData()
	getOpenId()
	getSystemInfo()
})

const homelist = getHomeList({})
const homeStore = useHomeStore()

// 参数
const { store, user, billdateType, totData } = toRefs(homeStore)
// 方法
const { dateTagChange, setArticleUrl, to, getTotData, getOpenId, getSystemInfo, out, logout, setStoreAndUser } = homeStore
</script>

<style>
</style>