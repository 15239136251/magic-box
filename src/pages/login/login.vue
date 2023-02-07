<template>
	<view class="login container overflow-hidden">
		<view class="pt-10 flex items-center flex-col">
			<view class="w-24 h-24 bg-red-400 overflow-hidden flex flex-center rounded-full">
				<image style="width: 200rpx; height: 200rpx;filter: grayscale(100%) brightness(200%);" src="/static/logo.png" mode=""></image>
			</view>
			<view class="mt-3">
				欢迎使用门店POS
			</view>
		</view>
		<view class="pt-10 px-4 text-sm">
			<view class="bg-white rounded px-2 py-3">
				<view class="border-b border-x-0 border-t-0 border-gray-300 border-solid pb-3 flex items-center">
					<image class="w-5 h-5" src="/static/svg/username.svg" mode=""></image>
					<input class="w-full text-sm px-2 ml-1" placeholder="请输入账号" type="text" v-model="username" />
				</view>
				<view class="pt-3 flex items-center" v-if="type == 'password'">
					<image class="w-5 h-5" src="/static/svg/password.svg" mode=""></image>
					<input class="w-full text-sm px-2 ml-1" placeholder="请输入密码" type="password" v-model="password" />
				</view>
			</view>
			<view class="py-3 w-full flex flex-center">
				<checkbox-group @change="setIsPrivacy">
					<label>
						<checkbox class="transform scale-75" :checked="isPrivacy" value="true"/>
					</label>
					我已同意
					<text class="text-red-400" @click.stop="showPopup">《用户协议》<text class="text-black">和</text>《隐私权限政策》</text>
				</checkbox-group>
			</view>
			<view class="py-3 mt-4 w-full flex flex-center text-white bg-red-400 rounded-full" @click="loginUser">
				<text>登录</text>
			</view>
		</view>
		<!-- 用户协议和隐私权限政策 -->
		<van-popup v-model:show="show" @click-overlay="onClickOverlay">
			<view class="overflow-hidden bg-white" style="width: 80vw; height: 60vh;">
				<scroll-view scroll-y="true" class="w-full h-full">
					<agreement />
				</scroll-view>
			</view>
    	</van-popup>
	</view>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { useLoginStore } from '@/stores/login'
import agreement from './agreement.vue'

const loginStore = useLoginStore();

const { username, password, isPrivacy, type, setIsPrivacy, loginUser } = toRefs(loginStore)

const show = ref(false)

const onClickOverlay = (e: any) => {
  show.value = false
}

const showPopup = () => {
  show.value = true
}
</script>
