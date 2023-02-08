<template>
    <view id="paymentpage" class="container text-sm">
        <van-popup v-model:show="isopen" position="center" round :close-on-click-overlay="false" title="支付页面">
            <view class="bg-white w-64 h-44 rounded">
				<view class="w-full h-full flex flex-center">
					<!-- 支付中 -->
					<view class="pay-in text-center" v-if="payIn">
						<image class="w-12 h-12" :src="loopPayInUrl" mode=""></image>
						<view class="text-center">
							<text>支付中</text>
						</view>
						<view 
							class="pay-in-button py-2 w-24 rounded-full text-center text-red-400 border border-red-400 border-solid mt-2"
							@click="cancel"
						>
							取消支付
						</view>
					</view>
					<!-- 支付成功 -->
					<view class="pay-success text-center" v-if="paySuccess">
						<image class="w-12 h-12" src="/static/gif/pay-success.gif" mode=""></image>
						<view class="text-center">
							<text>支付成功</text>
						</view>
						<view 
							class="pay-success-button py-2 w-24 rounded-full text-center text-red-400 border border-red-400 border-solid mt-2"
							@click="success"
						>
							确定
						</view>
					</view>
					<!-- 支付失败 -->
					<view class="pay-error text-center" v-if="payError">
						<!-- <image class="w-12 h-12" src="./static/gif/pay-success.gif" mode=""></image> -->
						<view class="flex flex-center">
							<!-- <view class="w-12 h-12 text-white bg-red-400 rounded-full flex flex-center">
							</view> -->
							<uni-icons color="red" size="45" type="clear"></uni-icons>
						</view>
						<view class="text-center w-48 overflow-hidden">
							<text>支付失败: {{ errMsg }}</text>
						</view>
						<view class="flex flex-center">
							<view 
								class="pay-error-button py-2 w-24 rounded-full text-center text-red-400 border border-red-400 border-solid mt-2"
								@click="error"
							>
								确定
							</view>							
						</view>
					</view>
				</view>
			</view>
        </van-popup>
    </view>
</template>

<script setup lang="ts">
import REQ from '@/utils/http_wx'
import base64 from 'base64-ts'
import config from '@/config'
import { onLoad } from '@dcloudio/uni-app'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Md5 } from 'ts-md5'
import uniStorage from '@/utils/uniStorage'
import { $goto } from '@/utils/navigate'

const isopen = ref(true)
const payIn = ref(true)
const paySuccess = ref(false)
const payError = ref(false)
const loopPayInUrl = ref('/static/gif/pay-in.gif')
const errMsg = ref('')
const looptime = ref(0)
const paytype = ref('')
const payamt = ref(0)
const table = ref('')
const orderdata:any = ref({})
const payparams:any = ref({})
const paydata:any = ref({})
const loopPayQueryTime = ref(0)

const infinityLoop = () => {
    clearLoopTime()
    if (payIn.value && looptime.value === 0) {
        looptime.value = setInterval(() => {
            // 通过拼接时间戳来实现无限播放
            loopPayInUrl.value = `/static/gif/pay-in.gif?${new Date().getTime()}`
            // 支付成功或失败就清除无限播放
            if (!payIn.value) clearLoopTime()
        }, 1500)
    }
}
const clearLoopTime = () => {
    clearInterval(looptime.value)
    looptime.value = 0
}
const getPayParams = () => {
    const data = {
        name: paytype.value,
        amt: payamt.value
    }
    REQ({
        url: 'pos/index/pay',
        method: 'POST',
        data
    }).then((res: any) => {
        payparams.value = {
            timestamp: JSON.stringify(new Date().getTime()),
            requestId: '',
            ...payparams.value,
            ...res.data
        }
        if (table.value === 'retail') callPayApi()
            else if (table.value === 'ret_retail') callRetPayApi()
    })
}
const getSign = (data: any) => {
    let sign = `appId=${base64.encode(data.app_id)}&appSecret=${base64.encode(data.app_key)}&version=${base64.encode(data.version)}&method=${base64.encode(data.method)}&timestamp=${base64.encode(data.timestamp)}`
    if (data.requestId) sign = sign + `&requestId=${base64.encode(data.requestId)}`
    sign = Md5.hashStr(sign)
    return sign.toUpperCase()
}
const getPayData = (method: string) => {
    const { data, merchant, timestamp, requestId } = payparams.value
    const sign = getSign({ ...merchant, timestamp, requestId, method, version: "3.1" })
    const logininfo:any = uniStorage.getItem('logininfo')
    const param = {
        customerId: data.customerid, // 商户号
        outTradeNo: orderdata.value.orderno, // 商户订单号
        payWay: paytype.value == "支付宝" ? "ALIPAY" : "WEIXINPAY", // ALIPAY:支付宝、WEIXINPAY:微信支付
        storeCode: logininfo.store_code, // 门店编号
        deviceInfo: "webpos", // 设备号
        operatorId: uniStorage.getItem("username")
    }
    const params = {
        appId: merchant.app_id, // 应用ID
        version: "3.1",
        method, // Sungeon.Pay.MicroPay
        timestamp, // 时间戳或yyyy-mm-dd HH:mi:ss
        sign, // 签名
        param,
        requestId
    }
    return params
}
const callPayApi = () => {
    let data:any = getPayData('Sungeon.Pay.MicroPay')
    data.param = {
        ...data.param,
        authCode: orderdata.value.auth_code, // 付款码
        totalAmount: (payamt.value * 100), // 支付金额，单位分；￥368.00—传36800
    }
    REQ({
        url: config.api.pay + 'MicroPay',
        method: 'POST',
        data
    }).then((res: any) => {
        console.log("🚀 ~ file: paymentPage.vue:158 ~ callPayApi ~ res", res)
        const { data, code } = res
        if (data && code == 100) {
            const { tradeState, errMsg: msg } = data
            if (tradeState === 'WAIT_BUYER_PAY') {
                payIn.value = true
                loopCallPayQuery()
            } else if (tradeState === 'TRADE_SUCCESS') {
                payIn.value = false
                paySuccess.value = true
                upload()
            } else if (tradeState === 'TRADE_FAIL') {
                payIn.value = false
                payError.value = true
                errMsg.value = msg || "用户取消输入密码或余额不足"
            }
        }
    }).catch(err => {
        uni.hideLoading()
        console.log("🚀 ~ file: paymentPage.vue:171 ~ callPayApi ~ err", err)
    })
}
/* 一分钟内循环调用支付查询 */
const loopCallPayQuery = () => {
    let loopTime = 60000
    const TIME = 3000
    if (loopPayQueryTime.value !== 0) return
    loopPayQueryTime.value = setInterval(() => {
        if (paySuccess.value || payError.value) {
            clearLoopPayQueryTime()
        } else if (loopTime <= 0) {
            if (!paySuccess.value) {
                payError.value = true
                payIn.value = false
                errMsg.value = "超时"
                cancelPayApi()
            }
            clearLoopPayQueryTime()
        } else {
            loopTime = loopTime - TIME
            callPayQueryApi()
        }
    }, TIME)
}
const clearLoopPayQueryTime = () => {
    clearInterval(loopPayQueryTime.value)
    loopPayQueryTime.value = 0
}
const cancelPayApi = () => {
    let data:any = getPayData('Sungeon.Pay.Reverse')
    data.param = {
        ...data.param,
        outRefundNo: orderdata.value.orderno
    }
    REQ({
        url: config.api.pay + 'Reverse',
        method: 'POST',
        data
    }).catch(err => {
        console.log("🚀 ~ file: paymentPage.vue:217 ~ cancelPayApi ~ err", err)
    })
}
const callPayQueryApi = () => {
    let data:any = getPayData('Sungeon.Pay.Query')
    REQ({
        url: config.api.pay + 'Query',
        method: 'POST',
        data
    }).then((res: any) => {
        console.log("🚀 ~ file: paymentPage.vue:213 ~ callPayQueryApi ~ res", res)
        if (res.code == 100) {
            const { tradeState, errMsg: msg } = res.data
             if (tradeState === 'TRADE_SUCCESS') {
                paySuccess.value = true
                payError.value = false
                payIn.value = false
                paydata.value = res.data
                upload()
            } else if (tradeState === 'TRADE_FAIL') {
                payError.value = true
                paySuccess.value = false
                payIn.value = false
                errMsg.value = msg || "用户取消输入密码或余额不足"
            }
        } else {
            console.log('支付查询失败', res.data)
        }
    }).catch(err => {
        clearLoopPayQueryTime()
        console.log("🚀 ~ file: paymentPage.vue:171 ~ callPayApi ~ err", err)
    })
}
const upload = () => {
    const { orderno, billdate, doctype, vipid, empid, remark, totamt, item, payitem, rdocno } = orderdata
    const { sysSeq: sys_seq, tradeNo: trade_no, posSeq: pos_seq, platformNo: platform_no } = paydata
    const value = {
        name: paytype.value,
        amt: payamt.value,
        realtype: paytype.value === '支付宝' ? 'ALIPAY' : 'WEIXINPAY',
        mobilepayno: orderno,
        refundno: rdocno ? rdocno : '',
        sys_seq,
        trade_no,
        pos_seq,
        platform_no
    }
    const data = {
        orderno, billdate, doctype, vipid, empid, remark, totamt, item,
        payitem: [...payitem, value]
    }
    REQ({
        url: 'pos/' + table.value + '/upload',
        method: 'POST',
        data
    }).catch(err => {
        console.log("🚀 ~ file: paymentPage.vue:274 ~ upload ~ err", err)
    })
}
const callRetPayApi = () => {
    let data:any = getPayData('Sungeon.Pay.Refund')
    const order = orderdata.value.pays.find((pay: any) => pay.payway_name == paytype.value);
    data.param = {
        ...data.param,
        outRefundNo: order.refundno || orderdata.value.rdocno,  // 退款单号
        outTradeNo: order.mobilepayno, // 原商户订单号
        totalAmount: (payamt.value * 100), // 支付金额，单位分；￥368.00—传36800
        refundAmount: (payamt.value * 100) // 退款总金额，单位分；￥368.00—传36800
    }
    REQ({
        url: config.api.pay + 'Reverse',
        method: 'POST',
        data
    }).then((res: any) => {
        console.log("🚀 ~ file: paymentPage.vue:292 ~ callRetPayApi ~ res", res)
        if (res.code == 100) {
            const { resultCode, errMsg: msg } = res.data
             if (resultCode === 'SUCCESS') {
                paySuccess.value = true
                payError.value = false
                payIn.value = false
                paydata.value = res.data
                upload()
            } else if (resultCode === 'FAIL') {
                payError.value = true
                paySuccess.value = false
                payIn.value = false
                errMsg.value = msg || "用户余额不足"
            }
        } else {
            console.log('支付查询失败', res.data)
            payError.value = true
            paySuccess.value = false
            payIn.value = false
            errMsg.value = res.data != null ? res.data.errMsg || res.data.code : res.message
        }
    }).catch(err => {
        console.log("🚀 ~ file: paymentPage.vue:217 ~ cancelPayApi ~ err", err)
    })
}
const cancel = () => {
    console.log("🚀 ~ file: paymentPage.vue:68 ~ cancel ~ cancel")
    if (table.value === 'retail') cancelPayApi()
    uni.navigateBack()
}
const success = () => {
    console.log("🚀 ~ file: paymentPage.vue:71 ~ success ~ success")
    if (table.value === 'retail') {
        $goto({
            url: '/pages/bill/bill?init=' + true
        })
    } else if (table.value === 'ret_retail') {
        $goto({
            url: '/pages/retOriginalOrderList/retOriginalOrderList'
        })
    }
}
const error = () => {
    console.log("🚀 ~ file: paymentPage.vue:74 ~ error ~ error")
    uni.navigateBack()
}

onLoad((options) => {
    const { orderData, name, amt, table: _table } = JSON.parse(options.data || '{}')
    orderdata.value = orderData
    paytype.value = name
    payamt.value = amt
    table.value = _table
})
onMounted(() => {
    infinityLoop()
    getPayParams()
})
onBeforeUnmount(() => {
    clearLoopTime()
})
</script>

<style scoped>

</style>