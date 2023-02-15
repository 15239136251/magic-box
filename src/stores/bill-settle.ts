// stores/bill-settle.js
import REQ from '@/utils/http_wx'
import config from '@/config'
import uniStorage from '@/utils/uniStorage'
import { defineStore } from 'pinia'
import { showToast } from '@/utils/interactions'
import { useBillStore } from './bill'
import { roundToCorner } from '@/utils/utils'

export const useBillrSettleStore = defineStore('billSettle', {
    state: () => {
        const _obj: any = {}
        const _arr: any = []
        return{
            routerValue: _obj,
            totAmt: 0,
            wholeOrderAmt: 0,
            wholeOrderDailogValue: 0,
            isOpenWholeOrderAmtDialog: false,
            payType: -1,
            payItems: _arr,
            payAmts: {..._obj},
            isOpenVipStoredValue: false
        }
    },
    actions: {
        init(value: any) {
            this.routerValue = value
            console.log("🚀 ~ file: ret-original-order-settle.ts:26 ~ init ~ routerValue", this.routerValue)
            this.totAmt = this.routerValue.totAmt
        },
        
        /*
            根据进位方式来过滤价格
            1:保留小数位
            2:四舍五入取整
            3:直接取整
            4:进位取整
            5:四舍五入到角
            6:取整到角
        */
        calculation() {
            const calculation = JSON.parse(uniStorage.getItem('params') || '{}').calculation
            let _amt = this.totAmt
            if (calculation === '2') {
                _amt = Math.round(_amt)
            } else if (calculation === '3' || calculation === '4') {
                _amt = Math.floor(_amt)
            } else if (calculation === '5'){
                _amt = Math.round(_amt * 10) / 10
            } else if (calculation === '6'){
                _amt = roundToCorner(_amt)
            }
            this.wholeOrderAmt = Math.round((this.totAmt - _amt) * 100) / 100
        },
        openWholeOrderAmtDialog() {
            this.wholeOrderDailogValue = this.wholeOrderAmt
            this.isOpenWholeOrderAmtDialog = true
        },
        wholeOrderDailogValueInput(e: any) {
            this.wholeOrderDailogValue = e.detail.value
        },
        closeWholeOrderAmtDialog() {
            this.wholeOrderDailogValue = 0
            this.isOpenWholeOrderAmtDialog = false
        },
        wholeOrderAmtDialogSave() {
            this.wholeOrderAmt = this.wholeOrderDailogValue
            this.closeWholeOrderAmtDialog()
        },
        payItemClick({id, name, isrecharge}: {id: number, name: string, isrecharge: string}) {
            const payTypes = ['支付宝', '微信']
            if (payTypes.includes(name) && config.common.iszfborwx) {
                this.clickPayOrWX(name)
                return 
            }
            if (isrecharge === 'Y') {
                console.log('点击会员储值卡')
                this.openVipStoredValue()
                return
            }
            const amt = this.amtinv
            if (this.payAllAmt == 0) this.payAmts[name] = amt
            if (this.payType == id && this.payAmts[name] == amt) {
                this.payType = -1
                this.payAmts[name] = 0
            } else {
                this.payType = id
                if (this.beAmtinv > 0) this.payAmts[name] = this.beAmtinv
            }
        },
        clickPayOrWX(name: string) {
            let that = this;
            uni.scanCode({
                scanType: ['barCode', 'qrCode'],
                success: function (res) {
                    console.log('条码类型：' + res.scanType)
                    console.log('条码内容：' + res.result)
                    const orderData = that.getOrderData()
                    const data = {
                        orderData: { ...orderData, auth_code: res.result },
                        amt: Number(that.beAmtinv),
                        name,
                        table: "retail"
                    }
                    const str = JSON.stringify(data)
                    uni.navigateTo({
                        url: `/pages/paymentPage/paymentPage?data=${str}`
                    })
                },
                fail:function(err){
                    console.log("扫码失败", err);
                }
            });
        },
        isPayShow(pay: any) {
            if (pay.is_vou === 'Y') return false;
            if (pay.isrecharge === 'Y' && (this.routerValue.vip?.id === -1 || !this.routerValue.vip?.id)) return false
            const names = ["积分", "整单优惠"]
            if (names.includes(pay.name)) return false
            return true
        },
        payAmtsInput(e: any, key: string) {
            const { value } = e.detail
            this.payAmts[key] = value
        },
        out(init: boolean) {
            if (init) {
                const bill = useBillStore()
                bill.reset()
            }
            uni.navigateBack()
        },
        rePay() {
            Object.keys(this.payAmts).forEach(key =>  {
                this.payAmts[key] = ''
            })
        },
        save() {
            if (this.payAllAmt != this.amtinv) return showToast(`当前付款金额${this.payAllAmt > this.amtinv ? '大' : '小'}于应付金额，无法提交`, 'none')
            const data = this.getOrderData()
            console.log("🚀 ~ file: ret-original-order-settle.ts:81 ~ save ~ data", data)
            this.uploadOrder(data)
        },
        getOrderData() {
            const { totAmt, description, employeeIds, vip = {}, billdate, orderno, items, doctype, activityItems, ticketItems, integralDis, totDisAmount, freight } = this.routerValue
            let payitem: any = []
            const keys = ["积分", "整单优惠"]
            Object.keys(this.payAmts).forEach(key => {
                if (this.payAmts[key] && !keys.includes(key)) {
                    let value = {
                        name: key, //付款方式名称
                        voucher_no: '', //购物券券号
                        amt: this.payAmts[key] //金额
                    };
                    payitem.push(value)
                }
            })
            return {
                orderno, //单号，需要唯一
                billdate, //单据日期
                doctype,
                integral_use: this.payAmts["积分"] ? 0 : 0, // 积分付款使用的积分
                integral_amt: this.payAmts["积分"] || 0, // 积分付款的金额
                use_integral: integralDis ? integralDis.useIntegral : 0,
                integral_dis_amt: integralDis ? integralDis.integralDisAmount : 0,
                vipid: vip.id, //vipId
                remark: description, //备注
                totamt: totAmt, //总金额
                zd_amt: Number(this.wholeOrderAmt), // 整单抹零
				tot_dis_amt: totDisAmount, //促销-优惠金额，含促销、会员、积分和优惠券
                freight, // 运费
                item: items.map((item: any) => {
                    let value = {
                        sku: item.no,
                        qty: item.qty,
                        price: item.pricelist,
                        empid: item.empids ? item.empids.join(',') : employeeIds.join(','),
                        retailtype: item.isGift === 'Y' ? 3 : 1,
                        activity_dis_amt: item.activityDisAmt, //促销-优惠金额
                        ticket_dis_amt: item.ticketDisAmt, // 促销-优惠券分摊金额（运费券优惠金额不分摊）
                        vip_dis_amt: item.vipDisAmount, // 促销-会员卡优惠金额
                        integral_dis_amt: item.integralDisAmt, //促销-会员积分抵现分摊金额
                        numeb: item.isO2o === 'Y' ? item.qty : 0
                    }
                    return value
                }),
                payitem,
                actitem: activityItems.map((item: any) => {
                    return {
                        ...item,
                        goodItems: JSON.stringify(item.goodItems),
                        giftItem: item.giftItem != null ? JSON.stringify(item.giftItem) : ""
                    }
                }), 
                tickitem: ticketItems.map((item: any) => {
                    return {
                        ...item,
                        goodItems: JSON.stringify(item.goodItems),
                        giftItem: item.giftItem != null ? JSON.stringify(item.giftItem) : ""
                    }
                }),
            }
        },
        uploadOrder(data: any) {
            REQ({
                url: 'pos/retail/upload',
                method: 'POST',
                data
            }).then((res: any) => {
                if (res.code === 0) {
                    const that = this
                    const { docid } = res
                    uni.showModal({
                        title: '提交',
                        content: '零售单提交成功',
                        cancelText: "返回",
                        confirmText: "打印小票",
                        success: function (res) {
                            if (res.confirm) {
                                console.log('打印小票')
                                that.print(docid);
                            } else if (res.cancel) {
                                console.log('返回列表')
                                that.out(true)
                            }
                        }
                    })
                } else {
                    console.log("🚀 ~ file: ret-original-order-settle.ts:126 ~ uploadOrder ~ res", res)
                }
            })
        },
        print(docid: number) {
            const logininfo: any = uniStorage.getItem('logininfo')
            const data = {
                name: "零售单",
                deviceno: logininfo.store_code,
                userId: logininfo.user_id,
                reportName: logininfo.retail_temp_name,
                reportParam: { objectid: docid },
                remark: this.routerValue.description
            }
            REQ({
                url: 'print/job/add2',
                method: 'POST',
                data
            }).finally(() => {
                this.out(true)
            })
        },
        vipStoredValueSave(amt: number) {
            console.log("🚀 ~ file: ret-original-order-settle.ts:166 ~ vipStoredValueSave ~ amt", amt)
            const pay = this.payItems.find((pay: any) => pay.isrecharge === 'Y')
            this.payAmts[pay.name] = amt
        },
        openVipStoredValue() {
            this.getVipAmount()
            this.vipStoredValueSave(0)
            this.isOpenVipStoredValue = true
        },
        closeVipStoredValue() {
            this.isOpenVipStoredValue = false
        },
        getPays() {
            REQ({
                url: 'pos/pay/list',
                method: 'POST'
            }).then((res: any) => {
                this.payItems = res.data
            })
        },
        getVipAmount() {
            REQ({
                url: 'pos/vip/list',
                method: 'POST',
                data: { name: this.routerValue.vip.cardno }
            }).then((res: any) => {
                this.routerValue.vip.amount = res.data[0].amount
            })
        }
    },
    getters: {
        /* 应付金额 */
        amtinv(): number {
            let amt = this.totAmt - this.wholeOrderAmt
            return Number(amt.toFixed(2))
        },
        /* 剩余应付 */
        beAmtinv(): number {
            let amt =  this.amtinv
            Object.keys(this.payAmts).forEach(key =>  {
                amt = amt - Number(this.payAmts[key])
            })
            amt < 0 ? amt = 0 : amt
            return amt
        },
        payAllAmt(): number {
            let amt = 0
            Object.keys(this.payAmts).forEach(key => {
                if (this.payAmts[key]) amt = amt + Number(this.payAmts[key])
            })
            return amt
        }
    }
})