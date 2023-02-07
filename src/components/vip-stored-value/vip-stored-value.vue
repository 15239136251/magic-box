<template>
    <view>
        <van-popup v-model:show="isopen" @click-overlay="isopen = false" position="center" title="会员储值卡" on-click-overlay>
            <view class="vip-stored-value">
                <view class="vip-stored-value-title">
                    <text>会员储值卡</text>
                </view>
                <view class="vip-stored-value-content">
                    <view class="vip-stored-value-content-row">
                        <text class="row-title" style="width: 190rpx;">姓名</text>
                            <input 
                                class="row-input row-input--disabled" 
                                type="text"
                                disabled 
                                :value="data.name" 
                            >
                    </view>
                    <view class="vip-stored-value-content-row">
                        <text class="row-title" style="width: 190rpx;">手机号</text>
                            <input 
                                class="row-input row-input--disabled" 
                                type="text"
                                disabled 
                                :value="data.phone" 
                            >
                    </view>
                    <view class="vip-stored-value-content-row">
                        <text class="row-title" style="width: 190rpx;">可用余额</text>
                            <input 
                                class="row-input row-input--disabled" 
                                type="text"
                                disabled 
                                :value="data.amtcan" 
                            >
                    </view>
                    <view class="vip-stored-value-content-row">
                        <text class="row-title" style="width: 190rpx;">应付金额</text>
                            <input 
                                class="row-input" 
                                type="digit"
                                v-model="data.amt" 
                                placeholder="请输入支付金额"
                            >
                    </view>
                    <view class="vip-stored-value-content-row" v-if="false">
                        <text class="row-title" style="width: 190rpx;">支付密码</text>
                            <input 
                                class="row-input" 
                                type="password"
                                v-model="data.password" 
                                placeholder="请输入支付密码"
                            >
                    </view>
                    <view class="vip-stored-value-content-row">
                        <text class="row-title" style="width: 160rpx;">短信验证码</text>
                        <input 
                            class="row-input row-codeinput" 
                            type="number"
                            v-model="data.code" 
                            placeholder="请输入验证码"
                        >
                        <button class="rot-codebutton" :loading="time != 0" :disabled="time != 0" @click="getCode">
                            <text>{{ time ? time : '发送验证码' }}</text>
                        </button>
                    </view>
                </view>
                <view class="vip-stored-value-bottom">
                    <view class="vip-stored-value-bottom-button left" @click="close">取消</view>
                    <view class="vip-stored-value-bottom-button right" @click="save">确定</view>
                </view>
            </view>
        </van-popup>
    </view>
</template>

<script setup lang="ts" name="vip-stored-value">
import { ref, reactive, toRefs, watch } from 'vue'
import { getRandomNumber } from '@/utils/utils'
import uniStorage from '@/utils/uniStorage'
import { showModal } from '@/utils/interactions'
import REQ from '@/utils/http_wx'

const props = defineProps({
    beAmt: {
        type: Number,
        default: 0
    },
    vip: {
        type: Object,
        default: {
            id: -1,
            name: '',
            amount: 0,
            cardno: ''
        }
    },
    isopen: Boolean
})
const { isopen } = toRefs(props)
const beAmt = ref(props.beAmt)
const vip = ref(props.vip)
const emit = defineEmits(['save', 'close'])
const data = reactive({
    name: props.vip.name,
    phone: props.vip.cardno,
    amtcan: props.vip.amount,
    password: '',
    amt: 0,
    code: ''
})
const time = ref(0)

const close = () => {
    emit('close')
}
const getCode = () => {
    setCodeStorage()
    time.value = 60
    let _time = 0
    _time = setInterval(() => {
        time.value = time.value - 1
        if (time.value <= 0) clearInterval(_time)
    }, 1000)
}
const setCodeStorage = () => {
    const code = getRandomNumber()
    const time = 180000
	const step = 10000
    uniStorage.setItem('vipstored-code', JSON.stringify({ code, time }))
    uploadCode(code)
    let codeTime = 0
    let isclear = 0
    codeTime = setInterval(() => {
        isclear = isclear + step
        if (isclear >= time) {
            uniStorage.removeItem('vipstored-code')
            clearInterval(codeTime)
        }
    }, step)
}
const uploadCode = (code: number) => {
    const { id } = vip.value
    const data = {
        main: {
            vipId: id,
            msg: '验证码',
            code
        }
    }
    console.log("🚀 ~ file: vip-stored-value.vue:148 ~ uploadCode ~ data", data)
    REQ({
        url: 'pos/dy/vip_message/curd',
        method: 'POST',
        data
    }).catch(err => {
        console.log("🚀 ~ file: vip-stored-value.vue:156 ~ uploadCode ~ err", err)
    })
}
const save = () => {
    if (data.code === '') return showModal('提示', '验证码未填写', false)
    let _code = uniStorage.getItem('vipstored-code')
    if (_code) _code = JSON.parse(_code).code
    if (!_code) return showModal('提示', '验证码已过期', false)
    if (_code != data.code) return showModal('提示', '验证码输入错误', false)
    if (data.amt > Number(props.beAmt)) return showModal('提示', '当前应付金额大于剩余应付', false)
    if (data.amt > data.amtcan) return showModal('提示', '当前应付金额大于可用金额', false)
    uniStorage.removeItem('vipstored-code')
    emit('save', data.amt)
    time.value = 3
    data.code = ''
    close()
}


watch(props, (newVal) => {
    console.log("🚀 ~ file: q-vip-stored-value.vue:97 ~ watch ~ newVal", newVal)
    beAmt.value = newVal.beAmt
    console.log("🚀 ~ file: q-vip-stored-value.vue:97 ~ watch ~ newVal", newVal.beAmt, beAmt.value)
    vip.value = newVal.vip
    data.name = vip.value.name
    data.phone = vip.value.cardno
    data.amtcan = vip.value.amount
})
</script>

<style lang="scss" scoped>
.vip-stored-value {
    background-color: white;
    overflow: hidden;
    position: relative;
    font-size: 26rpx;
    padding: 16rpx;
    border-radius: 8rpx;
    width: 70vw;
    min-height: 300rpx;
    &-title {
        text-align: center;
        font-weight: 600;
    }
    &-content {
        padding: 16rpx 0;
        &-row {
            display: flex;
            margin-bottom: 16rpx;
            align-items: center;
            .row-title {
                text-align: right;
            }
            .row-input {
                width: 80%;
                height: 64rpx;
                margin-left: 8rpx;
                padding: 0 16rpx;
                border-radius: 8rpx;
                --tw-border-opacity: 1;
                border: 1px solid rgba(209, 213, 219, var(--tw-border-opacity));
                &--disabled {
                    --tw-bg-opacity: 1;
                    background-color: rgba(243, 244, 246, var(--tw-bg-opacity));
                }
            }
            .row-codeinput {
                width: 33%;
            }
            .rot-codebutton {
                margin-left: 8rpx;
                width: 33%;
                height: 64rpx;
                color: white;
                font-size: 26rpx;
                text-align: center;
                line-height: 64rpx;
                background-color: #EF4444;
            }
        }
    }
    &-bottom {
        width: 100%;
        height: 80rpx;
        display: flex;
        align-items: center;
	    justify-content: center;
        &-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16rpx 48rpx;
            border-radius: 9999px;
        }
        .left {
            background-color: #F3F4F6;
        }
        .right {
            color: white;
            margin-left: 32rpx;
            background-color: #EF4444;
        }
    }
}
</style>