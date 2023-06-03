<template>
  <view class="flex flex-col items-center justify-center">
    <text>首页</text>
    <van-cell is-link @click="showPopup">展示弹出层</van-cell>
    <van-popup v-model:show="show" @click-overlay="onClickOverlay">
      <view class="w-300rpx h-300rpx bg-white flex items-center justify-center">
        <view>内容</view>
      </view>
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCounterStore } from '@/stores/counter'

const show = ref(false)

const onClickOverlay = (e: any) => {
  show.value = false
}
const showPopup = () => {
  show.value = true
}
</script>

<style lang="scss" scoped></style>
