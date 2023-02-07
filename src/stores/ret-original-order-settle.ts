// stores/ret-original-order-settle.js
import REQ from '@/utils/http_wx'
import { defineStore } from 'pinia'
import { showToast } from '@/utils/interactions'
import { Pay } from '@/utils/interface'
import uniStorage from '@/utils/uniStorage'
import config from '@/config'

export const useRetOriginalOrderSettleStore = defineStore('retOriginalOrderSettle', {
    state: () => {
        const _obj: any = {}
        const _arr: any = []
        return{
            routerValue: _obj,
            totAmt: 0,
            payType: -1,
            payItems: _arr,
            payAmts: {..._obj},
            beAmts: {..._obj},
            isOpenVipStoredValue: false
        }
    },
    actions: {
        init(value: any) {
            this.routerValue = value
            console.log("🚀 ~ file: ret-original-order-settle.ts:26 ~ init ~ routerValue", this.routerValue)
            this.totAmt = this.routerValue.totAmt
            this.routerValue.pays.forEach((pay: Pay) => {
                const amt = (pay.payamount || 0) - (pay.tot_retamt || 0)
                this.beAmts[pay.payway_name] = Math.abs(amt)
            })
        },
        payItemClick({id, name, isrecharge}: {id: number, name: string, isrecharge: string}) {
            const payTypes = ['支付宝', '微信']
            if (payTypes.includes(name) && config.common.iszfborwx) {
                const orderData = this.getOrderData();
                const data = {
                    orderData: { ...orderData, rdocno: this.routerValue.rdocno, pays: this.routerValue.pays },
                    amt: this.amtinv,
                    name,
                    table: "ret_retail"
                };
                const str = JSON.stringify(data);
                uni.navigateTo({
                    url: `/pages/paymentPage/paymentPage?data=${str}`
                })
                return
            }
            if (isrecharge === 'Y') {
                console.log('点击会员储值卡')
                this.openVipStoredValue()
                return
            }
            const amt = this.amtinv > this.beAmts[name] ? this.beAmts[name] : this.amtinv
            if (this.payAllAmt == 0) this.payAmts[name] = amt
            if (this.payType == id && this.payAmts[name] == amt) {
                this.payType = -1
                this.payAmts[name] = 0
            } else {
                this.payType = id
            }
        },
        isPayShow(pay: any) {
            if (pay.is_vou === 'Y') return false;
            // if (pay.isrecharge === 'Y' && (this.routerValue.vip?.id === -1 || !this.routerValue.vip?.id)) return false
            const names = ["积分", "整单优惠"]
            if (names.includes(pay.name)) return false
            return true
        },
        payAmtsInput(e: any, key: string) {
            const be_amt = this.beAmts[key]
            const { value } = e.detail
            if (value > be_amt) {
                showToast('不得大于应退金额：' + be_amt, 'none')
                this.payAmts[key] = be_amt
                return
            }
            this.payAmts[key] = value
        },
        out(init: boolean) {
            if (init) {
                uni.reLaunch({
                    url: "/pages/retOriginalOrderList/retOriginalOrderList"
                })
            } else {
                uni.navigateBack()
            }
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
            const { totAmt, description, employeeId, vip, vipid, billdate, orderno, items, rdocno, doctype } = this.routerValue
            let payitem: any = []
            Object.keys(this.payAmts).forEach(key => {
                if (this.payAmts[key]) {
                    let value = {
                        name: key, //付款方式名称
                        voucher_no: '', //购物券券号
                        amt: this.payAmts[key] //金额
                    };
                    payitem.push(value);
                }
            })
            return {
                orderno, //单号，需要唯一
                billdate, //单据日期
                doctype,
                vipid: vip.id || vipid, //vipId
                empid: employeeId, //员工id
                remark: description, //备注
                totamt: totAmt, //总金额
                item: items.map((item: any) => {
                    let value = {
                        id: item.id,
                        sku: item.no,
                        qty: item.qty,
                        price: item.priceactual,
                        empid: employeeId,
                        ritemid: item.id,
                        rdocno
                    }
                    return value
                }),
                payitem
            }
        },
        uploadOrder(data: any) {
            REQ({
                url: 'pos/ret_retail/upload',
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
                uni.reLaunch({
                    url: "/pages/retOriginalOrderList/retOriginalOrderList"
                })
            })
        },
        vipStoredValueSave(amt: number) {
            console.log("🚀 ~ file: ret-original-order-settle.ts:166 ~ vipStoredValueSave ~ amt", amt)
            const pay = this.payItems.find((pay: any) => pay.isrecharge === 'Y')
            this.payAmts[pay.name] = amt
        },
        openVipStoredValue() {
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
                const keys = this.routerValue.pays.map((pay: any) => {return pay.payway_name})
                this.payItems = res.data.filter((data: any) => keys.includes(data.name))
            })
        }
    },
    getters: {
        /* 应付金额 */
        amtinv(): number {
            return this.totAmt
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