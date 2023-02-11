<template>
  <view class="ret-original-order-settle container overflow-y-auto flex flex-col">
      <!-- 金额信息 -->
      <view class="rounded shadow-2xl h-20 bg-white ml-4 mr-4 p-4 mt-4">
    <view class="flex h-16 border border-solid border-gray-400 border-l-0 border-r-0 border-t-0">
      <view class="flex-1 text-center">
        <view class="text-gray-400">
          <text>商品金额</text>
        </view>
        <view class="text-red font-weight-600 mt-1">
          {{ '￥' + totAmt }}
        </view>
      </view>
      <view class="flex-1 text-center">
        <view class="text-gray-400">
          <text>应付金额</text>
        </view>
        <view class="text-red font-weight-600 mt-1">
          {{ '￥' + amtinv }}
        </view>
      </view>
      <view class="flex-1 text-center">
        <view class="text-gray-400">
          <text>剩余应付</text>
        </view>
        <view class="text-red font-weight-600 mt-1">
          {{ '￥' + beAmtinv }}
        </view>
      </view>				
    </view>
  </view>
  <!-- 支付列表 -->
  <view class="h-full overflow-hidden p-4 mb-4">
    <scroll-view
      scroll-y="true" 
      class="h-full py-2 bg-white" 
      :lower-threshold="200"
    >
      <view
        class="flex h-14 p-2 rounded-xl mb-4" 
        v-for="pay in payItems"
        :class="{'border border-solid border-red-400': payType == pay.id}" 
        :key="pay.id"
        @click="payItemClick({id: pay.id, name: pay.name, isrecharge: pay.isrecharge })"
        v-show="isPayShow(pay)"
      >
        <view class="w-14 h-14 rounded overflow-hidden">
          <image class="w-14 h-14 " :src="pay.icon" mode=""></image>
        </view>
        <view class="flex flex-col justify-between ml-4 flex-1 w-32">
          <view class="">
            <text class="font-weight-600">{{ pay.name }}</text>
          </view>
          <view class="w-16">
            <text class="text-red w-16" v-if="payType != pay.id">{{ payAmts[pay.name] ? '￥' + payAmts[pay.name] : '' }}</text>
            <input 
              v-else
              class="w-16 px-2 py-1" 
              type="digit" 
              :value="payAmts[pay.name]"
              @input="payAmtsInput($event, pay.name)"
              :focus="payType == pay.id"
              :class="{'bg-gray-100': payType == pay.id}"
              :disabled="payAllAmt >= amtinv && !payAmts[pay.name]"
            />
          </view>
        </view>
        <view class="flex items-center justify-end ">
          <radio value="" color="red" :checked="payAmts[pay.name] || false"  :disabled="payAllAmt >= amtinv && !payAmts[pay.name]" />
        </view>
      </view>
    </scroll-view>
  </view>
  <!-- 底部按钮 -->
  <view class="h-16 bg-white w-full flex items-center justify-between">
    <view class="bg-gray-200 border border-solid border-gray-200 text-black px-4 py-2 rounded-full ml-4" @click="out(false)">
      <text>取消</text>
    </view>
    <view class="bg-white border border-solid border-red-400 text-red-400 px-4 py-2 rounded-full" @click="rePay">
      <text>重付</text>
    </view>
    <view class="bg-red-400 border border-solid border-red-400 text-white px-4 py-2 rounded-full mr-4" @click="save">
      <text>确定</text>
    </view>
  </view>
  <!-- 会员储值卡弹窗 -->
  <vip-stored-value :isopen="isOpenVipStoredValue" :beAmt="beAmtinv" :vip="routerValue.vip" @save="vipStoredValueSave" @close="closeVipStoredValue"></vip-stored-value>
  </view>
</template>

<script setup lang="ts">
import { onMounted, toRefs, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useRetNoOriginalOrderSettleStore } from '@/stores/ret-no-original-order-settle'

const retNoOriginalOrderSettleStore = useRetNoOriginalOrderSettleStore()

/* 参数 */
const { totAmt, amtinv, beAmtinv, payItems, payType, payAmts, payAllAmt, routerValue, isOpenVipStoredValue } = toRefs(retNoOriginalOrderSettleStore)
/* 方法 */
const { init, payItemClick, isPayShow, payAmtsInput, out, rePay, save, getPays, vipStoredValueSave, closeVipStoredValue } = retNoOriginalOrderSettleStore

onLoad((option) => {
  if (option.value) init(JSON.parse(option.value))
})
onMounted(() => {
  getPays()
})
</script>

<style scoped>

</style>