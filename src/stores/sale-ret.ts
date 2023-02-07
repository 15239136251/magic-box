// stores/sale-ret.js
import { defineStore } from 'pinia'
import { $goto } from '@/utils/navigate'
import { getDate } from '@/utils/utils'
import { debounce } from '@/utils/debounce'
import REQ from '@/utils/http_wx'
import config from '@/config'

export const useSaleRetStore = defineStore('saleRet', {
    state: () => {
        interface Detail {
            id: number
            docno: string
            dest_code: number | string
            dest_name: string
            rettype: string
            rettype_name: string
            rettypelist: any[]
            retdistype: string
            retdistype_name: string
            retdistypelist: any[]
            remark: string
            status: number
            billdate: number | string
            items: any[]
            storelist: any[]
            fastCompCode: string | number
            fastNo: string
            jd_status?: string,
            sf_status?: string
        }
        const detail: Detail = {
            id: -1,
            docno: '',
            dest_code: '',
            dest_name: '',
            rettype: '',
            rettype_name: '',
            rettypelist: [],
            retdistype: '',
            retdistype_name: '',
            retdistypelist: [],
            remark: '',
            billdate: getDate(),
            status: 1,
            items: [],
            storelist: [],
            fastCompCode: '',
            fastNo: ''
        }
        const expcomlist: {id: number, name: string, code: string}[] = []
        return { 
            range: [getDate(true), getDate()],
            status: 1,
            searchValue: '',
            filterOptions: {
                dateBeg: getDate(true),
                dateEnd: getDate(),
                status: 1,
                query: ''
            },
            detail: detail,
            submitDialog: false,
            expcomlist: expcomlist
        }
    },
    actions: {
        searchInput(e: string) {
            this.searchValue = e
        },
        detailInit() {
            console.log('初始化')
            this.detail= {
                id: -1,
                docno: '',
                dest_code: '',
                dest_name: '',
                rettype: '',
                rettype_name: '',
                rettypelist: [],
                retdistype: '',
                retdistype_name: '',
                retdistypelist: [],
                remark: '',
                billdate: getDate(),
                status: 1,
                items: [],
                storelist: [],
                fastCompCode: '',
                fastNo: ''
            }
        },
        toAdd() {
            this.detailInit()
            $goto({
                url: '/pages/saleRetDetail/saleRetDetail?id=' + this.detail.id
            }, true)
        },
        goto(id: number) {
            console.log("🚀 ~ file: sale-ret.ts:52 ~ goto ~ id", id)
            this.detail.id = id
            $goto({
                url: '/pages/saleRetDetail/saleRetDetail?id=' + id
            }, true)
        },
        storeInput(e: number) {
            this.detail.dest_code = e
        },
        remarkInput(e: any) {
            this.detail.remark = e.detail.value
        },
        rettypeInput(e: any) {
            this.detail.rettype = e
            this.getRetdistypeList()
        },
        retdistypeInput(e: any) {
            this.detail.retdistype = e
        },
        setSearchValue(e: any) {
            console.log("🚀 ~ file: sale-ret.ts:63 ~ setSearchValue ~ e", e)
            const noPush = this.detail.items.find(item => item.no == e.no)
            if (noPush) {
                this.detail.items.forEach(item => {
                    if (item.no == e.no) {
                        item.qty = item.qty + 1
                        // 保存明细 -- 修改
                        this.itemSave({...item, qty: item.qty}, "M").then().catch(e => {
                            item.qty = item.qty - 1
                        })
                    }
                })
            } else {
                REQ({
                    url: 'pos/stock',
                    method: 'POST',
                    data: {name: e.no}
                }).then((res: any) => {
                    console.log("🚀 ~ file: sale-ret.ts:86 ~ setSearchValue ~ res.data", res.data)
                    if (res.data.qty < 1) return uni.showModal({
                        content: "当前条码库存不足，库存：" + res.data.qty,
                        showCancel: false
                    });
                    let item = {
                        ...e,
                        qty: 1,
                        qtycan: res.data.qty
                    };
                    this.itemSave(item, "A").then(() => this.detail.items.push(item))
                })
            }
        },
        delItem(e: {data: any}) {
            if (this.detail.status && this.detail.status != 1) return uni.showToast({title: "单据已提交，无法删除", icon: "none"})
            const { index, item } = e.data
            let newItem = this.detail.items.filter((detail, ind) => {
                if (ind != index && detail.no != item.no) {
                    return true
                } else {
                    // 保存明细 -- 删除
                    this.itemSave(item, "D")
                    return false
                } 
            })
            this.detail.items = newItem
        },
        inputnumberChange(e: any, index: number) {
            debounce(() => {
                let row = this.detail.items[index]
                const value = Number(e)
                const isAdd = value > row.qty
                if (value === row.qty) return
                if (!row.qtycan && row.qtycan != 0) row.qtycan = row.qty
                if (value >= row.qtycan)  row.qty = row.qtycan
                 else row.qty = value
                this.itemSave(this.detail.items[index], "M").then(() => {
                    this.detail.items[index] = row
                }).catch(() => {
                    if (isAdd) row.qty = row.qty -1
                        else row.qty = row.qty + 1
                    this.detail.items[index] = row
                })
            }, {})
        },
        expcomInput(e: string) {
            this.detail.fastCompCode = e
        },
        fastNoInput(e: any) {
            this.detail.fastNo = e.detail.value
        },
        fastNoScan() {
            // #ifdef H5
            return uni.showToast({title: "H5页面只支持手工输入", icon: "none"})
            // #endif
            let that = this
            uni.scanCode({
                scanType: ['barCode'],
                success: function (res) {
                    console.log('条码类型：' + res.scanType);
                    console.log('条码内容：' + res.result);
                    let value = res.result
                    if (value.length > 20) value = value.slice(value.length - 20, value.length)
                    that.detail.fastNo = value
                }
            })
        },
        out() {
            if (this.detail.status == 2) return uni.navigateBack()
            uni.showModal({
                title: '退出',
                content: '确认要退出吗？',
                success: function (res) {
                    if (res.confirm) {
                        uni.navigateBack()
                    }
                }
            });
        },
        itemSave(data: any, action: string) {
            let dt = {
                id: this.detail.id,
                item: [{
                    action,
                    data: {
                        sku: data.no || data.sku,
                        qty: data.qty
                    }
                }],
                main: {}
            }
            if (!this.detail.id || this.detail.id === -1) {
                let main = this.getSaveData();
                dt = { ...dt, ...main };
            }
            console.log("🚀 ~ file: sale-ret.ts:114 ~ returnnewPromise ~ dt", dt)
            return new Promise((resovle, reject) => {
                REQ({
                    url: 'pos/retsale/upload',
                    method: 'POST',
                    data: dt
                }).then((res: any) => {
                    if (!this.detail.id || this.detail.id === -1) this.detail.id = res.main.id
                    resovle(res)
                }).catch(reject)
            })
        },
        getSaveData() {
            let dt = {
                id: this.detail.id || -1,
                main: {
                    billdate: this.detail.billdate || getDate(),
                    remark: this.detail.remark || "",
                    destId: this.detail.dest_code,
                    logisId: this.detail.fastCompCode,
                    fastno: this.detail.fastNo,
                    retDisCode: this.detail.retdistype, 
					retType: this.detail.rettype
                }
            }
            return dt
        },
        save() {
            if (this.detail.status === 2 || this.detail.status === 3) return
            debounce(this.saveApi, {})
        },
        saveApi() {
            const data = this.getSaveData()
            REQ({
                url: 'pos/retsale/upload',
                method: 'POST',
                data
            }).then((res: any) => {
                if (!this.detail.id || this.detail.id === -1) this.detail.id = res.main.id
                uni.showModal({
                    title: '仅保存',
                    content: '保存成功',
                    cancelText: "返回列表",
                    confirmText: "继续扫描",
                    success: function (res) {
                        if (res.cancel) uni.navigateBack()
                    }
                })
            })
        },
        submit() {
            if (this.detail.status == 2 || this.detail.status == 3) return
			if (this.detail.items.length < 1) return uni.showToast({ title: "没有明细，不允许提交", icon: "none" })
            if (config.common.isSubmiteExpcom) {
                console.log('打开保存并提交弹窗，输入地址')
                this.submitDialog = true
                this.getExpcom()
            } else {
                let that = this
                uni.showModal({
					title: "提交",
					content: "确定提交？",
					confirmText: "提交",
					success: function (res) {
						if (res.confirm) {
							console.log('提交')
							that.saveAndSubmit()
						} else if (res.cancel) {
							console.log('取消')
						}
					}
				})
            }
        },
        saveAndSubmit() {
            const data = this.getSaveData()
            REQ({
                url: 'pos/retsale/upload',
                method: 'POST',
                data
            }).then((res: any) => {
                if (!this.detail.id || this.detail.id === -1) this.detail.id = res.main.id
                this.submitApi({ id: this.detail.id })
            })
        },
        submitApi({id}: { id: number}) {
            const { jd_status, sf_status } = this.detail
            let expcom = this.expcomlist.find(expcom => expcom.id == this.detail.fastCompCode)
            if (expcom && (expcom.name == '京东快递' || expcom.name === '京东快运') && jd_status == 'N') {
                console.log("京东")
                this.restAction({ id, webaction: "RET_SALE_JD_WAYBILL_CREATE"});
            } else if (expcom && expcom.name == '顺丰速运' && sf_status == 'N') {
                console.log("顺丰")
                this.restAction({ id, webaction: "M_RET_SALE_FAST_SF"});
            } else {
                console.log("其他")
                REQ({
                    url: 'pos/rest/submit',
                    method: 'POST',
                    data: {
                        id,
                        table: 'M_RET_SALE'
                    }
                }).then(_ => uni.navigateBack())					
            }
        },
        restAction(data: {id: number, webaction: string}) {
            REQ({
                url: 'pos/rest/action',
                method: 'POST',
                data
            }).then(_ => uni.navigateBack())
        },
        submitDialogClose() {
            this.submitDialog = false
        },
        submitDialogOk() {
            this.saveAndSubmit()
            this.submitDialogClose()
        },
        async getDetail(id: number) {
            this.detail.id = id
            let request: any = await REQ({
                url: 'pos/retsale/detail',
                method: 'POST',
                data: { id }
            })
            this.detail = {...this.detail, ...request.data}
            this.queryQtyCan()
            if (this.detail.rettype) this.getRetdistypeList()
            console.log("🚀 ~ file: sale-ret.ts:69 ~ getDetail ~ data", request)
        },
        queryQtyCan() {
            const skus = this.detail.items.map(item => item.no)
            REQ({
                url: 'pos/stocks',
                method: 'POST',
                data: {skus}
            }).then((res: any) => {
                this.detail.items.forEach((item, index) => {
                    let value = res.data.find((data: {sku_no: string}) => data.sku_no == item.no);
                    if (value) {
                        item.qtycan = value.qty
                        this.detail.items[index] = {...item, qtycan: value.qty}
                    };
                })
            })
        },
        async getStoreList() {
            const requset: any = await REQ({
                url: 'pos/store/list',
                method: 'POST'
            })
            this.detail.storelist = requset.data
        },
        async getRettypeList() {
            const requset: any = await REQ({
                url: 'pos/select/list',
                method: 'POST',
                data: {name: 'RETSALETYPE(ADD)'}
            })
            this.detail.rettypelist = requset.data
        },
        async getRetdistypeList() {
            const requset: any = await REQ({
                url: 'pos/saledistype/list',
                method: 'POST',
                data: {saletype: this.detail.rettype, type: 'ret'}
            })
            this.detail.retdistypelist = []
            if (this.detail.rettype == "") {
                this.detail.retdistype = ""
                this.detail.retdistypelist = []
            } else {
                this.detail.retdistypelist = requset.data
            }
        },
        async getExpcom() {
            let request: any = await REQ({
                url: 'pos/logis/list',
                method: 'POST'
            })
            this.expcomlist = request
        }
    },
    getters: {
        disabled(): boolean {
            return this.detail.status === 2
        },
        totQty() {
            let count = 0
            this.detail.items.forEach(item => {
                count = count + item.qty
            })
            return count
        }
    }
  })