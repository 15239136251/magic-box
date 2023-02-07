// stores/store-out.js
import { defineStore } from 'pinia'
import { $goto } from '@/utils/navigate'
import { getDate } from '@/utils/utils'
import REQ from '@/utils/http_wx'

export const useOutStore = defineStore('out', {
    state: () => {
        interface Detail {
            docno: string
            destname: string
            description: string
            dest_address: string
            status: number
            items: any[]
            jd_status?: string
            sf_status?: string
            origtype?: string
        }
        const detail: Detail = {
            docno: '',
            destname: '',
            description: '',
            dest_address: '',
            status: 1,
            items: []
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
            expcomlist: expcomlist,
            detailId: -1
        }
    },
    actions: {
        searchInput(e: string) {
            this.searchValue = e
        },
        goto(id: number) {
            console.log("🚀 ~ file: store-out.ts:39 ~ detail ~ id", id)
            this.detailId = id
            $goto({
                url: '/pages/storeOutDetail/storeOutDetail?id=' + id
            }, true)
        },
        copy(data: string) {
            uni.setClipboardData({
                data,
                success: function (e) {
                   uni.showToast({
                        title: '复制成功'
                   })
                }
            });
        },
        setSearchValue(e: any) {
            console.log("🚀 ~ file: store-out.ts:63 ~ setSearchValue ~ e", e)
            this.detail.items.forEach((item: any) => {
                if (item.no == e.no) {
                    let qtyout = item.qtyout + 1
                    if (qtyout <= item.qty) {
                        this.itemSave({...item, qtyout}, "M").then(() => item.qtyout = qtyout)
                    } else {
                        uni.showModal({ content: '超出了通知数量，通知数量为：' + item.qty + '，当前数量为：' + item.qtyout, showCancel: false });
                    }
                }
            })
        },
        inputnumberChange(e: any, index: number) {
            let row = this.detail.items[index]
            if(e == row.qtyout) return
            let isAdd = row.qtyout < e
            if (e > row.qty)  row.qtyout = row.qty
                else row.qtyout = e
            this.itemSave(this.detail.items[index], "M").then(() => {
                this.detail.items[index] = row
            }).catch(() => {
                if (isAdd) row.qtyout = row.qtyout -1;
                    else row.qtyout = row.qtyout + 1;
                this.detail.items[index] = row
            });
        },
        itemSave(data: any, action: string) {
            let dt = {
                id: this.detailId,
                item: [{
                    action,
                    data: {
                        sku: data.no || data.sku,
                        qty: data.qtyout
                    }
                }]
            }
            console.log("🚀 ~ file: store-out.ts:114 ~ returnnewPromise ~ dt", dt)
            return new Promise((resovle, reject) => {
                REQ({
                    url: 'pos/out/upload',
                    method: 'POST',
                    data: dt
                }).then(resovle).catch(reject)
            })
        },
        saveApi(id: number) {
            let data = { id }
            REQ({
                url: 'pos/out/upload',
                method: 'POST',
                data
            }).then(() => {
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
        autoMatchingAction(id: number) {
            const data = { id, webaction: "M_OUT_QTYCOP"}
            REQ({
                url: 'pos/rest/action',
                method: 'POST',
                data
            }).then(_ => {
                this.getDetail(id)
            }).catch(e => {
                console.log("动作定义失败", e);
                if (e?.content?.message.indexOf('已根据单据数量  自动填充出库数量') != -1) this.getDetail(id)
            })
        },
        saveAndSubmit(data: { id: number, main: any}) {
            REQ({
                url: 'pos/out/upload',
                method: 'POST',
                data
            }).then(() => {
                const params = {
                    id: data.id,
                    fastCompCode: data.main.fastCompCode,
                }
                this.submitApi(params)
            })
        },
        submitApi({id, fastCompCode}: { id: number, fastCompCode: number}) {
            const { jd_status, sf_status, origtype } = this.detail
            let expcom = this.expcomlist.find(expcom => expcom.id == fastCompCode)
            if (expcom && (expcom.name == '京东快递' || expcom.name === '京东快运') && jd_status == 'N' && origtype != 'O2O_SO') {
                console.log("京东")
                this.restAction({ id, webaction: "OUT_JD_WAYBILL_CREATE"});
            } else if (expcom && expcom.name == '顺丰速运' && sf_status == 'N' && origtype != 'O2O_SO') {
                console.log("顺丰")
                this.restAction({ id, webaction: "M_OUT_SF"});
            } else {
                console.log("其他")
                REQ({
                    url: 'pos/rest/submit',
                    method: 'POST',
                    data: {
                        id,
                        table: 'm_out'
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
        async getDetail(id: number) {
            let request: any = await REQ({
                url: 'pos/out/detail',
                method: 'POST',
                data: { id }
            })
            this.detail = request.data;
            console.log("🚀 ~ file: store-out.ts:69 ~ getDetail ~ data", request)
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
        noticeCount() {
            let count = 0
            this.detail.items.forEach(item => {
                count = count + Number(item.qty)
            })
            return count
        },
        scanCount() {
            let count = 0
            this.detail.items.forEach(item => {
                count = count + Number(item.qtyout)
            })
            return count
        }
    }
  })