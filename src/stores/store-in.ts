// stores/store-in.js
import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { $goto } from '@/utils/navigate'
import { getDate } from '@/utils/utils'
import REQ from '@/utils/http_wx'

export const useInStore = defineStore('in', {
    state: () => {
        interface Detail {
            docno: string
            origname: string
            description: string
            tranwayno: string
            status: number
            items: any[]
            origtype?: string
        }
        const detail: Detail = {
            docno: '',
            origname: '',
            description: '',
            tranwayno: '',
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
            console.log("🚀 ~ file: store-in.ts:58 ~ goto ~ id", id)
            this.detailId = id
            $goto({
                url: '/pages/storeInDetail/storeInDetail?id=' + id
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
            console.log("🚀 ~ file: store-in.ts:63 ~ setSearchValue ~ e", e)
            this.detail.items.forEach((item: any) => {
                if (item.no == e.no) {
                    let qtyin = item.qtyin + 1
                    if (qtyin <= item.qtyout) {
                        this.itemSave({...item, qtyin}, "M").then(() => item.qtyin = qtyin)
                    } else {
                        uni.showModal({ content: '扫描数量超过出库数量，出库数量：' +  item.qtyout, showCancel: false });
                    }
                }
            })
        },
        inputnumberChange(e: any, index: number) {
            let row = this.detail.items[index]
            if(e == row.qtyin) return
            let isAdd = row.qtyin < e
            if (e > row.qtyout)  row.qtyin = row.qtyout
                else row.qtyin = e
            this.itemSave(this.detail.items[index], "M").then(() => {
                this.detail.items[index] = row
            }).catch(() => {
                if (isAdd) row.qtyin = row.qtyin -1;
                    else row.qtyin = row.qtyin + 1;
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
                        qty: data.qtyin
                    }
                }]
            }
            console.log("🚀 ~ file: store-in.ts:103 ~ returnnewPromise ~ dt", dt)
            return new Promise((resovle, reject) => {
                REQ({
                    url: 'pos/in/upload',
                    method: 'POST',
                    data: dt
                }).then(resovle).catch(reject)
            })
        },
        saveApi(id: number) {
            let data = { id }
            REQ({
                url: 'pos/in/upload',
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
            const data = { id, webaction: "M_IN_QTYCOP"}
            REQ({
                url: 'pos/rest/action',
                method: 'POST',
                data
            }).then(_ => {
                this.getDetail(id)
            }).catch(e => {
                console.log("动作定义失败", e);
                if (e?.content?.message.indexOf('已根据单据数量  自动填充入库数量') != -1) this.getDetail(id)
            })
        },
        saveAndSubmit(data: { id: number, main: any}) {
            REQ({
                url: 'pos/in/upload',
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
        submitApi({id}: { id: number}) {
            REQ({
                url: 'pos/rest/submit',
                method: 'POST',
                data: {
                    id,
                    table: 'm_in'
                }
            }).then(_ => uni.navigateBack())	
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
                url: 'pos/in/detail',
                method: 'POST',
                data: { id }
            })
            this.detail = request.data;
            console.log("🚀 ~ file: store-in.ts:69 ~ getDetail ~ data", request)
        },
        async getExpcom() {
            let request: any = await REQ({
                url: 'pos/logis/list',
                method: 'POST'
            })
            this.expcomlist = request
        }
    },
  })