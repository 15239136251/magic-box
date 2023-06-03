<template>
  <view class="w-screen h-screen">
    <!-- 插画页 -->
    <view class="w-full h-2/5 bg overflow-hidden relative">
      <image class="w-full" src="/static/image/me/bg.png" mode="widthFix"></image>
      <view class="absolute left-10 bottom-10 text-white">
        <text class="font-bold" style="font-size: 48rpx;">{{ userinfo.name }}</text>
        <view>
          <text style="font-size: 24rpx;">{{ userinfo.school + '·' + userinfo.major }}</text>
        </view>
      </view>
      <!-- 修改图标 -->
      <view class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-900 absolute right-10 bottom-10"
        @click="showPopup">
        <van-icon name="edit" color="white" />
      </view>
    </view>
    <!-- 列表页 -->
    <view class="w-9/10 absolute top-4/11 right-0 h-96 bg-white py-3 overflow-y-auto rounded-tl-4xl rounded-tr-lg"
      style="font-size: 28rpx;">
      <van-cell :title="'列表' + item" icon="location-o" is-link v-for="item in 10" :key="item" />
    </view>

    <van-popup round closeable v-model:show="userinfoShow" @click-overlay="onClickOverlay" @close="onClickOverlay">
      <view class="w-500rpx bg-white flex items-center justify-center p-5">
        <van-form @submit="onSubmit">
          <van-cell-group>
            <van-field v-model="userform.name" name="用户名" label="用户名" placeholder="用户名"
              :rules="[{ required: true, message: '请填写用户名' }]" />
            <van-field v-model="userform.school" name="学校" label="学校" placeholder="学校"
              :rules="[{ required: true, message: '请填写学校' }]" />
            <van-field v-model="userform.major" name="专业" label="专业" placeholder="专业"
              :rules="[{ required: true, message: '请填写专业' }]" />
          </van-cell-group>
          <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
              提交
            </van-button>
          </div>
        </van-form>
      </view>
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
const userinfoShow = ref(false)
const userinfo = reactive({
  name: '没头脑',
  school: '河南某某职业学院',
  major: 'UI设计系'
})
const userform = reactive({
  name: '没头脑',
  school: '河南某某职业学院',
  major: 'UI设计系'
})

const showPopup = () => {
  userinfoShow.value = true
}
const onClickOverlay = (e: any) => {
  userinfoShow.value = false
}
const onSubmit = (values: any) => {
  console.log("🚀 ~ file: index.vue:62 ~ onSubmit ~ values:", values)
}
</script>

<style lang="scss" scoped>
.bg:after {
  content: '';
  position: absolute;
  // top: 0;
  left: 0;
  bottom: 0px;
  width: 100%;
  height: 25px;
  background: linear-gradient(rgba(255, 255, 255, 0.001), white);
  /* 溢出部分那显示渐变 */
  pointer-events: none;
}
</style>
