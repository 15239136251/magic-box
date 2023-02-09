// stores/ret-original-order.js
import { defineStore } from 'pinia'
import uniStorage from '@/utils/uniStorage'
import { CommonData, RetOriginalOrde, RetOriginalOrderListItems, HangList, Vip } from '@/utils/interface'
import REQ from '@/utils/http_wx'
import { getDate, getFilterArray, updateOrderNo } from '@/utils/utils'
import { showToast } from '@/utils/interactions'
import { $goto } from '@/utils/navigate'

export const useRetOriginalOrderStore = defineStore('retOriginalOrder', {
  state: () => {
    const commonlist: CommonData[] = []
    const items: RetOriginalOrderListItems[] = []
    const hanglist: HangList[] = []
    const vip: Vip = {
        id: -1,
        name: '-',
        price: 0,
        cardno: '',
        integral: 0
    }
    const obj: any = {}
    return {
        /* 开单界面 */
        routerValue: obj,
        isOpenEmployee: false,
        employeeId: -1,
        employeeList: commonlist,
        isOpenHangReason: false,
        isOpenHangList: false,
        hanglist: hanglist,
        hangSelectId: -1,
        hangReasonValue: '',
        vip: vip,
        vipDialogValue: vip,
        vipPhone: '',
        isOpenVipDialog: false,
        items: items,
        description: '',
        isOpenDescription: false
    }
  },
  actions: {
    init(value: RetOriginalOrde) {
        this.routerValue = value
        this.items = value.items.map(item => {
            return {
                ...item,
                qty: item.rcanqty,
                qtyCan: item.rcanqty
            }
        })

        if (value.vip_phone) {
            this.vipPhone = value.vip_phone
            this.vipSearch(true)
        }
    },
    reset() {
        this.vip = {
            id: -1,
            name: '-',
            cardno: '',
            price: 0,
            integral: 0
        }
        this.items = []
        this.employeeId = -1
        this.description = ''
    },
    newBill() {
        let that = this
        uni.showModal({
            title: '开新单',
            content: '是否删除当前单据明细?',
            success: function(res){
                if (res.confirm) {
                    console.log('用户点击确定')
                    that.reset()
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            },
            fail: function(err) {
                console.log('模糊弹窗失败', err)
            }
        })
    },
    openEmployee() {
        this.isOpenEmployee = true
    },
    closeEmployee() {
        this.isOpenEmployee = false
    },
    employeeChange(employee: CommonData) {
        this.employeeId = employee.id
        this.closeEmployee()
    },
    openHang() {
        if (this.items.length) {
            this.isOpenHangReason = true
        } else {
            const hanglist = uniStorage.getItem('ret-original-hanglist')
            if (hanglist) this.hanglist = JSON.parse(hanglist)
            this.isOpenHangList = true
        }
    },
    hangReasonInput(e: any) {
        this.hangReasonValue = e.detail.value
    },
    hangReasonSave() {
        const hangid = uniStorage.getItem('hangid')
        const hangdate = uniStorage.getItem('hangdate')
        const hanglist = uniStorage.getItem('ret-original-hanglist')
        const billdate = getDate()
        let newHanglist = []
        let newHangId = Number(hangid)
        /* 如果当前日期与本地缓存的不同，则重置挂单id */
        if (billdate !== hangdate) {
            newHangId = 0
            uniStorage.setItem('hangid', (newHangId + 1) + '')
            uniStorage.setItem('billdate', billdate)
        }
        /* 过滤掉非当天的挂单列表 */
        if (hanglist) {
            newHanglist = JSON.parse(hanglist).filter((hang: {billdate: string}) => hang.billdate === billdate)
        }
        const value = {
            id: newHangId + 1,
            vip: this.vip,
            employeeId: this.employeeId,
            description: this.hangReasonValue,
            items: this.items,
            tot_qty: this.totQty,
            tot_amt: this.totAmt,
            docno: this.vip.cardno,
            billdate
        }
        newHanglist.push(value)
        /* 替换本地缓存 */
        uniStorage.setItem('ret-original-hanglist', JSON.stringify(newHanglist))
        this.reset()
        this.closeHang()
    },
    hanglistSave() {
        const value = this.hanglist.filter(hang => hang.id === this.hangSelectId)
        const { vip, employeeId, items } = value[0]
        this.vip = vip || this.vip
        this.employeeId = employeeId
        this.items = items
        /* 去除已选的挂单 */
        const newlist = this.hanglist.filter(hang => hang.id !== this.hangSelectId)
        uniStorage.setItem('ret-original-hanglist', JSON.stringify(newlist))
        this.closeHang()
    },
    closeHang() {
        this.isOpenHangReason = false
        this.isOpenHangList = false
    },
    openVipDialog() {
        this.vipDialogValue = {
            id: -1,
            type: '',
            cardno: '',
            name: '',
            type_name: '',
            birthday: '',
            integral: 0,
            price: 0,
            amount: 0
        }
        this.vipPhone = ''
        this.isOpenVipDialog = true
    },
    vipPhoneInput(e: string) {
        this.vipPhone = e
    },
    vipSearch(route = false) {
        if (!this.vipPhone) return showToast('请输入需要查询的卡号', 'none')
        REQ({
            url: 'pos/vip/list',
            method: 'POST',
            data: { name: this.vipPhone }
        }).then((res: any) => {
            const { data } = res
            if (data.length === 0) {
                showToast('没有符合该条件的会员', 'none')
            } else {
                if (route) this.vip = res.data[0]
					else this.vipDialogValue = res.data[0]
                this.vipPhone = ''
            }
        })
    },
    closeVipDialog() {
        this.isOpenVipDialog = false
    },
    vipDialogSave() {
        if (this.vipDialogValue.id) {
            this.vip = this.vipDialogValue
        }
        this.closeVipDialog()
    },
    searchInput(e: any) {
        const data = e
        const noPush = this.items.some(item => {
            if (item.no === data.no) {
                item.qty = item.qty + 1 > item.qtyCan ? item.qty : item.qty + 1
                return true
            }
        })
        if (!noPush) this.addItem(data)
    },
    addItem(data: any) {
        REQ({
            url: 'pos/stock',
            method: 'POST',
            data: { name: data.no }
        }).then((res: any) => {
            const value = {
                ...data,
                qty: 1,
                qtyCan: res.data.qty
            }
            this.items.push(value)
        })
    },
    delItem(e: {data: any}) {
        const { index, item } = e.data
        this.items = this.items.filter((_item, _index) => _index != index && _item.id != item.id)
    },
    inputnumberChange(e: string, index: number) {
        console.log("e", e);
        console.log("index", index);
        this.items[index]['qty'] = Number(e);
        if (this.items[index]['qty'] === 0) {
            this.items = this.items.filter(item => item.qty != 0);
        }
    },
    openDescription() {
        this.isOpenDescription = true
    },
    descriptionInput(e: any) {
        this.description = e.detail.value
    },
    closeDescription() {
        this.isOpenDescription = false
    },
    descriptionSave() {
        this.closeDescription()
    },
    to() {
        const orderno = updateOrderNo("R")
        const { items, vip, description, totQty, totAmt, employeeId } = this
        if (items.length === 0) return showToast('请录入明细', 'none')
        const { vip_id, docno, emp_id, id, pays } = this.routerValue
        const value = {
            id,
            items,
            description,
            vip,
            totQty,
            totAmt,
            employeeId,
            orderno,
            pays,
            ritemid: emp_id,
            rdocno: docno,
            vipid: vip.id || vip_id,
            billdate: getDate()
        }
        $goto({
            url: '/pages/retOriginalOrderSettle/retOriginalOrderSettle' + '?value=' + JSON.stringify(value)
        }, true)
    },
    getEmployeeList() {
        this.employeeList = []
        REQ({
            url: 'pos/emp/list',
            method: 'POST'
        }).then((res: any) => {
            let data = [...res.data]
            const value = this.routerValue as RetOriginalOrde
            if (value.emp_id) {
                this.employeeId = value.emp_id
                data.unshift({
                    id: value.emp_id,
                    name: value.emp_name
                })
            }
            this.employeeList = getFilterArray(data)
        })
    }
  },
  getters: {
    employeeName(): string {
        let employee = this.employeeList.filter(employee => employee.id === this.employeeId)
        return employee[0] ? employee[0].name : '营业员'
    },
    totQty() {
        let qty = 0
        this.items.forEach(item => qty = qty + Number(item.qty))
        return qty
    },
    totAmt() {
        let amt = 0
        this.items.forEach(item => amt = amt + Number(item.priceactual * item.qty))
        return Math.floor(amt * 100) / 100
    }
  }
})
