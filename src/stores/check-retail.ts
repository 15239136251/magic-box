// stores/check-retail.js
import { defineStore } from 'pinia'
import uniStorage from '@/utils/uniStorage'
import { DateTag, CheckRetailSumItem, CheckRetailItem, CheckRetailItems } from '@/utils/interface'
import { getDate } from '@/utils/utils'
import { showToast } from '@/utils/interactions'
import { debounce } from '@/utils/debounce'
import REQ from '@/utils/http_wx'

export const useCheckRetailStore = defineStore('checkRetail', {
  state: () => {
    const sumItems: CheckRetailSumItem[] = []
    const retailItems: CheckRetailItem[] = []
    const anylist: any[] = []
    const any: any = null
    return { 
        /* 通用 */
        range: [getDate(), getDate()],
        tag: '零售汇总',
        total: {
            totamt: 0,
            totqty: 0,
            totcnt: 0,
            avg_dis: 1
        },
        /* 零售汇总 */
        radios: [{
            value: 'pdt',
            name: '款号'
        }, {
            value: 'sku',
            name: '条码'
        }, {
            value: 'dim2',
            name: '年份'
        }, {
            value: 'dim3',
            name: '类别'
        }, {
            value: 'billdate',
            name: '日期'
        }],
        current: 'pdt',
        pdtOrSkuValue: '',
        sumItems: sumItems,
        sumItemPage: 0,
        /* 零售明细 */
        retailItems: retailItems,
        retailItemPage: 0,
        lowerEnd: false,
        amtDetailDialog: false,
        amountDetail: {
            // 活动优惠
            activityItems: anylist,
            // 活动金额
            activityAmt: 0,
            // 优惠券优惠
            ticketItems: anylist,
            // 优惠金额
            ticketAmt: 0,
            // 折扣
            integralDis: any,
            // 会员折扣金额
            vipDisAmount: 0,
            // 会员积分抵现金额
            vipIntegralDisAmount: 0,
            // 优惠金额
            totAmtDiscount: 0,
            // 原价
            totOldAmt: 0,
            // 合计
            totAmt: 0,
        }
    }
  },
  actions: {
    /* 通用 */
    dateTagChange(value: DateTag) {
        console.log("🚀 ~ file: check-retail.ts:19 ~ dateTagChange ~ value", value)
        this.range = value.value
        this.init()
    },
    changeLog(e: string[]) {
        if (e[0] === this.range[0] && e[1] === this.range[1]) return
        this.range = e
        this.init()
    },
    tagChange(tag: string) {
        this.tag = tag
    },
    isTag(tag: string): boolean {
        return this.tag === tag
    },
    init() {
        this.getTotal()
        this.getSumItems()
        this.getRetailItems()
    },
    /* 零售汇总 */
    radioChange(e: any) {
        for (let i = 0; i < this.radios.length; i++) {
            if (this.radios[i].value === e.detail.value) {
                this.current = e.detail.value
                this.pdtOrSkuValue = ""
                this.sumItemPage = 0
                this.getSumItems()
                break;
            }
        }
    },
    pdtOrSkuInput(e: any) {
        this.pdtOrSkuValue = e.detail.value.toUpperCase()
    },
    pdtOrSkuSearch() {
        this.getSumItems()
    },
    sumItemPre() {
        if (this.sumItemPage === 0) return showToast('当前已经是第一页了', 'none')
        debounce(() => {
            this.sumItemPage = this.sumItemPage - 1
            this.getSumItems()
        }, {})
    },
    sumItemNext() {
        debounce(() => {
            this.sumItemPage = this.sumItemPage + 1
            this.getSumItems()
        }, {})
    },
    async getTotal() {
        const data = {
            dateBeg: this.range[0],
            dateEnd: this.range[1]
        }
        const request: any = await REQ({
            url: 'pos/report/retail_total',
            method: 'POST',
            data
        })
        console.log("🚀 ~ file: check-retail.ts:107 ~ getTotal ~ request", request)
        this.total = request.data
    },
    async getSumItems() {
        const data = {
            dateBeg: this.range[0],
            dateEnd: this.range[1],
            type: this.current,
            page: this.sumItemPage,
            query: this.isPdtOrSku ? this.pdtOrSkuValue : ''
        }
        const request: any = await REQ({
            url: 'pos/report/retail_sum',
            method: 'POST',
            data
        })
        if (request.data.length === 0 && this.sumItemPage !== 0) {
            this.sumItemPage = this.sumItemPage - 1
            return showToast('当前已经是最后一页', 'none')
        }
        console.log("🚀 ~ file: check-retail.ts:103 ~ getSumItems ~ request", request)
        this.sumItems = request.data
    },
    /* 零售明细 */
    detailLower() {
        if (this.lowerEnd) return
        debounce(() => {
            this.retailItemPage = this.retailItemPage + 1
            this.getRetailItems()
        }, {})
    },
    getDocnoQty(items: CheckRetailItems[]) {
        let qty = 0;
        items.forEach(item => {
            qty = qty + item.qty
        });
        return qty
    },
    getDocnoAmt(items: CheckRetailItems[]) {
        let amt = 0;
        items.forEach(item => {
            amt = amt + (item.priceactual * item.qty)
        });
        return amt.toFixed(2)
    },
    print(item: CheckRetailItem) {
        console.log("🚀 ~ file: check-retail.ts:161 ~ print ~ print")
        const logininfo:any = uniStorage.getItem('logininfo')
        const data = { 
            name: "零售单",
            deviceno: logininfo.store_code,
            userId: logininfo.user_id,
            reportName: "m_retail_wx",
            reportParam: { objectid: item.id },
            remark: item.description
        }
        console.log("🚀 ~ file: check-retail.ts:172 ~ print ~ data", data)
        REQ({
            url: 'print/job/add2',
            method: 'GET',
            data
        }).then(_ => {
            showToast('打印成功')
        }).catch(_ => {
            showToast('打印失败', 'error')
        })
    },
    amtDetailDialogOpen(item: CheckRetailItem) {
        const { items, actitems, tickitems } = item
        let totOldAmt = 0
        let totAmtDiscount = 0
        if (items.length) {
            items.forEach(item => {
                totOldAmt = totOldAmt + (item.pricelist * item.qty)
                totAmtDiscount = totAmtDiscount + ((item.pricelist * item.qty) - (item.priceactual * item.qty))
            })
        }
        this.amountDetail.totAmt = Number(this.getDocnoAmt(items));
        this.amountDetail.totOldAmt = totOldAmt;
        this.amountDetail.totAmtDiscount = Number(totAmtDiscount.toFixed(2))
        this.amountDetail.activityItems = actitems

        let activityAmt = 0;
        actitems.forEach(item => {
            activityAmt = activityAmt + Number(item.activity_dis_amount)
        });
        this.amountDetail.activityAmt = activityAmt
        this.amountDetail.ticketItems = tickitems
        let ticketAmt = 0
        tickitems.forEach(item => {
            ticketAmt = ticketAmt + Number(item.ticket_dis_amount)
        });
        this.amountDetail.ticketAmt = ticketAmt
        if (item.integral_dis_amt) {
            this.amountDetail.integralDis = {
                integralDisAmount: item.integral_dis_amt,
                useIntegral: item.use_integral
            }					
        }
        this.amountDetail.vipDisAmount = 0
        this.amountDetail.vipIntegralDisAmount = item.tot_vip_dis_amt || 0

        this.amtDetailDialog = true
    },
    amtDetailDialogClose() {
        this.amtDetailDialog = false
    },
    async getRetailItems() {
        const data = {
            dateBeg: this.range[0],
            dateEnd: this.range[1],
            page: this.retailItemPage
        }
        if (this.lowerEnd) this.lowerEnd = false
        try {
            const request: any = await REQ({
                url: 'pos/retail/list',
                method: 'POST',
                data
            })
            console.log("🚀 ~ file: check-retail.ts:170 ~ getRetailItems ~ request", request)
            if (request.data.length === 0) this.lowerEnd = true
            if (this.retailItemPage === 0) this.retailItems = request.data
              else this.retailItems = this.retailItems.concat(request.data)
        } catch (error) {
            console.log("🚀 ~ file: check-retail.ts:164 ~ getRetailItems ~ error", error)
        }
    }
  },
  getters: {
    /* 通用 */
    /* 零售汇总 */
    isPdtOrSku() : boolean{
        return ['pdt', 'sku'].includes(this.current)
    },
    retailSumStyle() {
        if (this.isPdtOrSku) return { height: 'calc(100% - 7.5rem)'}
        return { height: 'calc(100% - 5rem)'}
    },
    radioName(): string {
        let value = this.radios.find(radio => radio.value == this.current)
        return value?.name || '款号'
    }
    /* 零售明细 */
  }
})
