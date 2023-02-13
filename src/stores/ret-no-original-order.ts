// stores/ret-no-original-order.js
import { defineStore } from 'pinia'
import uniStorage from '@/utils/uniStorage'
import { CommonData, RetOriginalOrde, RetNoOriginalOrderListItems, HangList, Vip } from '@/utils/interface'
import REQ from '@/utils/http_wx'
import { getDate, getFilterArray, updateOrderNo } from '@/utils/utils'
import { showModal, showToast } from '@/utils/interactions'
import { $goto } from '@/utils/navigate'
import { debounce } from '@/utils/debounce'

export const useRetNoOriginalOrderStore = defineStore('retNoOriginalOrder', {
  state: () => {
    const commonlist: CommonData[] = []
    const items: RetNoOriginalOrderListItems[] = []
    const hanglist: HangList[] = []
    const vip: Vip = {
        id: -1,
        name: '-',
        price: 0,
        cardno: '',
        integral: 0
    }
    const obj: any = {}
    const employeeIds: number[] = JSON.parse(uniStorage.getItem('employeeIds') || '[]') || []
    const itemEmployeeIds: number[] = []
    const retailtypelist: {name: string, code: string}[] = []
    return {
        /* 开单界面 */
        routerValue: obj,
        isOpenEmployee: false,
        employeeIds: employeeIds,
        employeeList: commonlist,
        isOpenHangReason: false,
        isOpenHangList: false,
        hanglist: hanglist,
        hangSelectId: -1,
        hangReasonValue: '',
        isOpenRetailType: false,
        retailtypelist: retailtypelist,
        retailtypecode: '',
        vip: vip,
        vipDialogValue: vip,
        vipPhone: '',
        isOpenVipDialog: false,
        items: items,
        isOpenItemEmployee: false,
        itemEmployeeIds: itemEmployeeIds,
        itemEmployeeKey: '',
        description: '',
        isOpenDescription: false
    }
  },
  actions: {
    init() {
        const retailType = JSON.parse(uniStorage.getItem('retailtype') || '{}')
        if (retailType) {
            retailType.date != getDate() ? uniStorage.removeItem('retailtype') : this.retailtypecode = retailType.value
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
        this.employeeIds = []
        this.description = ''
    },
    newBill(func?:Function) {
        let that = this
        uni.showModal({
            title: '开新单',
            content: '是否删除当前单据明细?',
            success: function(res){
                if (res.confirm) {
                    console.log('用户点击确定')
                    that.reset()
                    if (func) func()
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
    employeeSave(ids: number[]) {
        this.employeeIds = ids
        uniStorage.setItem('employeeIds', JSON.stringify(this.employeeIds))
    },
    openHang() {
        if (this.items.length) {
            this.isOpenHangReason = true
        } else {
            const hanglist = uniStorage.getItem('ret-np-original-hanglist')
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
        const hanglist = uniStorage.getItem('ret-np-original-hanglist')
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
            employeeId: this.employeeIds,
            description: this.hangReasonValue,
            items: this.items,
            tot_qty: this.totQty,
            tot_amt: this.totAmt,
            docno: this.vip.cardno,
            billdate
        }
        newHanglist.push(value)
        /* 替换本地缓存 */
        uniStorage.setItem('ret-np-original-hanglist', JSON.stringify(newHanglist))
        this.reset()
        this.closeHang()
    },
    hanglistSave() {
        const value = this.hanglist.filter(hang => hang.id === this.hangSelectId)
        const { vip, employeeId, items } = value[0]
        this.vip = vip || this.vip
        this.employeeIds = employeeId
        this.items = items
        /* 去除已选的挂单 */
        const newlist = this.hanglist.filter(hang => hang.id !== this.hangSelectId)
        uniStorage.setItem('ret-np-original-hanglist', JSON.stringify(newlist))
        this.closeHang()
    },
    closeHang() {
        this.isOpenHangReason = false
        this.isOpenHangList = false
    },
    openRetailType() {
        this.isOpenRetailType = true
    },
    closeRetailType() {
        this.isOpenRetailType = false
    },
    retailTypeChange(e: any) {
        console.log("🚀 ~ file: ret-no-original-order.ts:168 ~ retailTypeChange ~ e", e)
        this.retailtypecode = e.code
        const data = {
            value: this.retailtypecode,
            date: getDate()
        }
        uniStorage.setItem('retailtype', JSON.stringify(data))
        this.closeRetailType()
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
                item.qty = item.qty + 1
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
                qtyCan: res.data.qty,
                empids: this.employeeIds,
                old_pricelist: data.pricelist
            }
            this.items.push(value)
        })
    },
    delItem(e: {item: RetNoOriginalOrderListItems, index: number}) {
        let that = this
        uni.showModal({
            content: "是否要删除明细?",
            success:function(res){
                if (res.confirm) {
                    console.log('用户点击确定');
                    const { index, item } = e
                    that.items = that.items.filter((_item, _index) => _index != index)
                } else if (res.cancel) {
                    console.log('用户点击取消');
                }
            }
        })
    },
    inputnumberChange(e: string, index: number) {
        console.log("e", e);
        console.log("index", index);
        this.items[index]['qty'] = Number(e);
        if (this.items[index]['qty'] === 0) {
            this.items = this.items.filter(item => item.qty != 0);
        }
    },
    itemInput(e: any, index: number) {
        const { value } = e.detail
        debounce(() => {
            if (!this.items[index]['old_pricelist']) this.items[index]['old_pricelist'] = this.items[index]['pricelist']
            let oldprice = this.items[index]['pricelist']
            this.items[index]['pricelist'] = value
            if (value > this.items[index]['old_pricelist']) {
                setTimeout(() => {
                    this.items[index]['pricelist'] = oldprice
                }, 100);
                return showToast("不能大于零售价格：" + this.items[index]['old_pricelist'], 'none')
            }
        })
    },
    openItemEmployee(e: {item: RetNoOriginalOrderListItems}) {
        console.log("🚀 ~ file: ret-no-original-order.ts:281 ~ openItemEmployee ~ e", e)
        this.isOpenItemEmployee = true
        this.itemEmployeeKey = e.item.no || ''
        this.itemEmployeeIds = e.item.empids || []
    },
    closeItemEmployee() {
        this.isOpenItemEmployee = false
    },
    itemEmployeeSave(ids: number[]) {
        this.itemEmployeeIds = ids
        this.items.some(item => {
            if (item.no === this.itemEmployeeKey) {
                item.empids = this.itemEmployeeIds
                return true
            }
        })
        console.log("🚀 ~ file: ret-no-original-order.ts:304 ~ itemEmployeeSave ~ this.items", this.items)
        this.closeItemEmployee()
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
        const { items, vip, description, totQty, totAmt, employeeIds } = this
        if (items.length === 0) return showToast('请录入明细', 'none')
        const { vip_id, docno, emp_id, id, pays } = this.routerValue
        const value = {
            id,
            items,
            description,
            vip,
            totQty,
            totAmt,
            employeeId: employeeIds,
            orderno,
            pays,
            ritemid: emp_id,
            rdocno: docno,
            vipid: vip.id || vip_id,
            billdate: getDate()
        }
        $goto({
            url: '/pages/retNonOriginalOrderSettle/retNonOriginalOrderSettle' + '?value=' + JSON.stringify(value)
        }, true)
    },
    getEmployeeList() {
        this.employeeList = []
        REQ({
            url: 'pos/emp/list',
            method: 'POST'
        }).then((res: any) => {
            this.employeeList = getFilterArray([...res.data])
        })
    },
    getRetailTypeList() {
        this.retailtypelist = []
        REQ({
            url: 'pos/select/list',
            method: 'POST',
            data: { name: "RETAILBILLTYPE" }
        }).then((res: any) => {
            let list: {code: string, name: string}[] = []
            if (this.retailTypes.length === 0) {
                list = res.data.map((item: {value: string, description: string}) => {
                    return {
                        name: item.description,
                        code: item.value
                    }
                })
            } else {
                res.data.forEach((item: {value: string, description: string}) => {
                    if (this.retailTypes.includes(item.value)) {
                        list.push({
                            name: item.description,
                            code: item.value
                        })					
                    }
                })
            }
            this.retailtypelist = list
        })
    }
  },
  getters: {
    employeeName(): string {
        const employee = this.employeeList.filter(employee => employee.id === this.employeeIds[0])
        return employee[0] ? employee[0].name : '营业员'
    },
    totQty() {
        let qty = 0
        this.items.forEach(item => qty = qty + Number(item.qty))
        return qty
    },
    totAmt() {
        let amt = 0
        this.items.forEach(item => amt = amt + Number(item.pricelist * item.qty))
        return Math.floor(amt * 100) / 100
    },
    retailTypes() {
        let filters = JSON.parse(uniStorage.getItem('params') || '{}').retailType
        let value = filters ? filters.split(',') : []
        value = value.filter((_val: any) => _val !== '')
        return value
    },
    retailTypeName(): string {
        const retailtype = this.retailtypelist.find(type => type.code === this.retailtypecode)
        return retailtype ? retailtype.name : '零售类型'
    }
  }
})
