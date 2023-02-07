// stores/store-inventory.js
import { defineStore } from 'pinia'
import { $goto } from '@/utils/navigate'
import { getDate } from '@/utils/utils'
import { debounce } from '@/utils/debounce'
import uniStorage from '@/utils/uniStorage'
import REQ from '@/utils/http_wx'

const logininfo: any = uniStorage.getItem('logininfo')
const params: any = uniStorage.getItem('params')
type DiffItemItems = {
    id: number | string
    pdt_name: string
    pdt_value: string
    qty: number
    qtybook: number
}
export const useInventoryStore = defineStore('inventory', {
    state: () => {
        interface Detail {
            id: number
            typeId: string | number
            typelist: any
            storeId: string | number,
            storelist: any
            billdate: string
            description: string,
            shelfValue: string
            shelfDialogValue: string
            shelflist: any
            shelfItems: any
            itemDialogValue: {
                id: string | number
                shelf: string
                sku: string
                qty: number
            }
            status: number
        }
        interface DiffItem {
            id: number | string
            inputVal: string
            items: DiffItemItems[]
            diffItems: DiffItemItems[]
            selectColorCode: number | string
            colorlist: any
            pdtName: string
            skulist: any
        }
        const detail: Detail = {
            id: -1,
            typeId: '',
            typelist: [],
            storeId: logininfo.store_id || '',
            storelist: [],
            billdate: getDate(),
            description: '',
            shelfValue: '101',
            shelfDialogValue: '',
            shelflist: [],
            shelfItems: [],
            itemDialogValue: {
                id: '',
                shelf: '',
                sku: '',
                qty: 0
            },
            status: 1
        }
        const diffItem: DiffItem = {
            id: -1,
            inputVal: '',
            items: [],
            diffItems: [],
            selectColorCode: -1,
            colorlist: [],
            pdtName: '',
            skulist: []
        }
        return { 
            /* 新增表头 */
            range: [getDate(true), getDate()],
            status: 1,
            searchValue: '',
            filterOptions: {
                dateBeg: getDate(true),
                dateEnd: getDate(),
                status: 1,
                query: ''
            },
            /* 添加明细 */
            detail: detail,
            editShelfDialog: false,
            subTotShelfDialog: false,
            editItemQtyDialog: false,
            /* 差异明细 */
            diffItem: diffItem,
            diffItemDetailDialog: false
        }
    },
    actions: {
        searchInput(e: string) {
            this.searchValue = e
        },
        toMore(id: number) {
            console.log("🚀 ~ file: store-inventory.ts:45 ~ toMore ~ id", id)
            this.diffItem.id = id
            $goto({
                url: '/pages/storeInventoryDiffItem/storeInventoryDiffItem?id=' + id
            }, true)
        },
        toAdd() {
            this.detail.id = -1
            $goto({
                url: '/pages/storeInventoryAddTable/storeInventoryAddTable'
            }, true)
        },
        goto(id: number) {
            console.log("🚀 ~ file: store-inventory.ts:45 ~ goto ~ id", id)
            this.detail.id = id
            $goto({
                url: '/pages/storeInventoryAddItem/storeInventoryAddItem?id=' + id
            }, true)
        },

        /* 新增表头方法  */
        billdateChange(e: string) {
            this.detail.billdate = e
        },
        storeInput(e: number) {
            this.detail.storeId = e
        },
        typeInput(e: string) {
            this.detail.typeId = e
        },
        addTable() {
            const data = {
                id: Number(this.detail.id) || -1,
                main: {
                    doctype: this.detail.typeId,
                    storeId: this.detail.storeId,
                    billdate: this.detail.billdate || getDate(),
                    description: this.detail.description
                }
            }
            debounce(() => {this.addTableApi(data)}, data)
        },
        addTableApi(data: object) {
            console.log("🚀 ~ file: store-inventory.ts:92 ~ addTableApi ~ data", data)
            REQ({
                url: 'pos/pandian/upload',
                method: 'POST',
                data
            }).then((res: any) => {
                console.log("🚀 ~ file: store-inventory.ts:98 ~ addTableApi ~ res", res)
                if (this.detail.id === -1) this.detail.id = Number(res.main.id)
                let that = this
                uni.showModal({
                    title: '仅保存',
                    content: '保存成功',
                    cancelText: "返回列表",
                    confirmText: "添加明细",
                    success: function (res) {
                        if (res.confirm) {
                            console.log('添加明细')
                            $goto({
                                url: '/pages/storeInventoryAddItem/storeInventoryAddItem?id=' + that.detail.id
                            }, true)
                        } else if (res.cancel) {
                            uni.navigateBack()
                        }
                    }
                })
            }).catch(e => {
                console.log("🚀 ~ file: store-inventory.ts:119 ~ addTableApi ~ e", e)
            })
        },
        async getStoreList() {
            const requset: any = await REQ({
                url: 'pos/store/list',
                method: 'POST'
            })
            this.detail.storelist = requset.data
        },
        async getTypeList() {
            let requset: any = await REQ({
                url: 'pos/select/list',
                method: 'POST',
                data: { name: "IVDOCTYPE" }
            })
            let list = []
            if (this.pandianTypeFilter.length === 0) {
                list = requset.data.map((_item: { value: string, description: string}) => {
                    return {
                        name: _item.description,
                        code: _item.value
                    }
                })
            } else {
                requset.data.forEach((_item: { value: string, description: string}) => {
                    if (this.pandianTypeFilter.includes(_item.value)) {
                        list.push({
                            name: _item.description,
                            code: _item.value
                        })
                    }
                })
            }
            this.detail.typelist = list
        },

        /* 添加明细方法 */
        editShelfOpen() {
            this.detail.shelfDialogValue = this.detail.shelfValue
            this.editShelfDialog = true
        },
        editShelfClose() {
            this.detail.shelfDialogValue = ''
            this.editShelfDialog = false
        },
        editShelfSave() {
            this.detail.shelfValue = this.detail.shelfDialogValue
            this.getShelfItems()
            this.editShelfClose()
        },
        subTotShelfOpen() {
            this.getShelfList()
            this.subTotShelfDialog = true
        },
        subTotShelfClose() {
            this.subTotShelfDialog = false
        },
        setSearchValue(e: any) {
            if (this.status === 2)  return uni.showToast({ title: "单据已提交，无法修改", icon: "none", duration: 2000 })
            const value = this.detail.shelfItems.find((item: {no: string, shelfno: string}) => item.no === e.no && item.shelfno === this.detail.shelfValue)
            if (value) {
                this.detail.shelfItems.forEach((item: {no: string, shelfno: string, qty: number, impQty: number}) => {
                    if (item.no == e.no && item.shelfno == this.detail.shelfValue) {
                        console.log("item", item);
                        if (item.qty == null) item.qty = 0;
                        if (item.impQty === null || Number.isNaN(item.impQty)) item.impQty = 0;
                        item.qty = item.qty + 1;
                        // 保存明细 -- 修改
                        let action = "M";
                        this.itemSave({...item, impQty: item.qty}, action).then(() => {
                            item.impQty = item.impQty + 1
                        }).catch(e => {
                            item.qty = item.qty - 1;
                        });
                    }
                });
            } else {
                let item = {
                    ...e,
                    qty: 1,
                    impQty: 1,
                    shelfno: this.detail.shelfValue
                };
                // 保存明细 -- 新增
                this.itemSave(item, "A").then(() => {
                    this.detail.shelfItems.push(item);
                    const shelfs = this.detail.shelflist.map((shelf: {no: string}) => { return shelf.no})
                    if (!shelfs.includes(this.detail.shelfValue)) {
                        this.getShelfList()
                    }
                });	
            }
        },
        editItemQtyOpen({item}: {item: {id: number | string, shelfno: string, no: string, qty: number}}) {
            console.log("🚀 ~ file: store-inventory.ts:206 ~ editItemQtyOpen ~ item", item)
            this.detail.itemDialogValue = {
                id: item.id,
                shelf: item.shelfno,
                sku: item.no,
                qty: item.qty
            }
            this.editItemQtyDialog = true
        },
        editItemQtyClose() {
            this.detail.itemDialogValue = {
                id: '',
                shelf: '',
                sku: '',
                qty: 0
            }
            this.editItemQtyDialog = false
        },
        editItemQtySave() {
            let item = this.detail.shelfItems.find((item: {no: string}) => item.no === this.detail.itemDialogValue.sku);
            const qty = this.detail.itemDialogValue.qty;
            this.itemSave({...item, impQty: qty, }, 'M').then(() => {
                item.qty = qty;
            }).catch(e => {
                console.log("🚀 ~ file: store-inventory.ts:229 ~ this.itemSave ~ e", e)
            })
            this.editItemQtyClose()
        },
        refreshItem() {
            REQ({
                url: 'pos/pandian/action',
                method: 'POST',
                data: { id: this.detail.id, action: 'shelfitem_update' }
            }).then(_ => {
                console.log("🚀 ~ file: store-inventory.ts:239 ~ refreshItem ~ _", _)
            }).catch(e => {
                console.log("🚀 ~ file: store-inventory.ts:241 ~ refreshItem ~ e", e)
            })
        },
        itemSave(item: any, action: string, isArray?: boolean) {
            let dt = {
                id: Number(this.detail.id),
                item: [{
                    action,
                    data: {
                        sku: item.no || item.sku,
                        shelfno: item.shelfno,
                        qty: item.impQty
                    }
                }]
            }
            console.log("🚀 ~ file: store-inventory.ts:114 ~ returnnewPromise ~ dt", dt)
            if (isArray) {
                console.log("item", item);
                let items = item.map((value: {no: string, sku: string, shelfno: string, impQty: number}) => {
                    return {
                        action,
                        data: {
                            sku: value.no || value.sku,
                            shelfno: value.shelfno,
                            qty: value.impQty
                        }
                    };
                });
                dt.item = items;
            }
            return new Promise((resovle, reject) => {
                REQ({
                    url: 'pos/pandian/upload',
                    method: 'POST',
                    data: dt
                }).then(_ => {
                    this.refreshItem()
                    resovle(_)
                }).catch(reject)
            })
        },
        async getShelfItems() {
            const request: any = await REQ({
                url: 'pos/pandian/item_by_shelf',
                method: 'POST',
                data: { id: this.detail.id, no: this.detail.shelfValue || '' }
            })
            console.log("🚀 ~ file: store-inventory.ts:238 ~ getShelfItems ~ request", request)
            this.detail.shelfItems = request.data
        },
        async getShelfList(setShelfValue?: boolean) {
            return new Promise((resolve, reject) => {
                REQ({
                    url: 'pos/pandian/list_shelf',
                    method: 'POST',
                    data: { id: this.detail.id }
                }).then((res: any) => {
                    console.log("🚀 ~ file: store-inventory.ts:251 ~ returnnewPromise ~ res", res)
                    this.detail.shelflist = res.data
	                if (this.detail.shelflist.length && setShelfValue) this.detail.shelfValue = this.detail.shelflist[0].no
                    resolve(res.data)
                }).catch(e => {
                    reject(e)
                })
            });
        },

        /* 差异明细 */
        getDiffItemsFilter() {
            this.diffItem.items = this.diffItem.diffItems.filter((item: {pdt_name: string}) => item.pdt_name.indexOf(this.diffItem.inputVal) != -1)
        },
        async diffItemSearch() {
            let request: any = await REQ({
                url: 'pos/pandian/pdtitem_diff',
                method: 'POST',
                data: { id: this.diffItem.id, query: this.diffItem.inputVal }
            })
            this.diffItem.diffItems = request.data
            this.getDiffItemsFilter()
        },
        getColorlist({name}: {name:string}) {
            return new Promise((resolve, reject) => {
                REQ({
                    url: 'pos/pdt/colors/list',
                    method: 'POST',
                    data: { name }
                }).then((res: any) => {
                    console.log('查询颜色列表成功', res);
                    resolve(res.data);
                }).catch(e => {
                    console.log('查询颜色列表失败', e);
                    reject(e);
                });
            })
        },
        async diffItemDetailOpen({item}: {item: DiffItemItems}) {
            this.diffItem.pdtName = item.pdt_name;
            this.diffItem.colorlist = await this.getColorlist({ name: this.diffItem.pdtName });
            console.log('colorlist', this.diffItem.colorlist);
            if (this.diffItem.colorlist.length) this.selectDiffItemColor({ code: this.diffItem.colorlist[0].code, name: this.diffItem.pdtName })
            this.diffItemDetailDialog = true
        },
        diffItemDetailClose() {
            this.diffItemDetailDialog = false
        },
        selectDiffItemColor({ code, name }: { code: string, name: string}) {
            this.diffItem.selectColorCode = code
            this.getSkuList({ id: this.diffItem.id, name, color: this.diffItem.selectColorCode })
        },
        getSkuList(data: {id: number | string, name: string, color: string}) {
            REQ({
                url: 'pos/pandian/item_diff',
                method: 'POST',
                data
            }).then((res: any) => {
                console.log("🚀 ~ file: store-inventory.ts:417 ~ getSkuList ~ res", res)
                this.diffItem.skulist = res.data
            })
        },
        getDiffItem() {
            console.log('查询差异商品详情', this.diffItem.id)
            REQ({
                url: 'pos/pandian/pdtitem_diff',
                method: 'POST',
                data: { id: this.diffItem.id }
            }).then((res: any) => {
                this.diffItem.diffItems = res.data
                this.getDiffItemsFilter()
            }).catch(e => {
                console.log("🚀 ~ file: store-inventory.ts:431 ~ getDiffItem ~ e", e)
            })
        }
    },
    getters: {
        disabled(): boolean {
            return this.detail.id != -1
        },
        pandianTypeFilter(): string[] {
            const pandianType = JSON.parse(params).pandianType || ''
            let value = pandianType.split(',')
            value = value.filter((_item: string) => _item !== '')
            return value
        },

        /* 新增明细 */
        totItemsQty(): number {
            let qty = 0;
            this.detail.shelfItems.forEach((item: {qty: number}) => {
                qty = Number(item.qty) + qty
            })
            return qty
        },
        shelfDialogList(): any {
            return this.detail.shelflist
            // return this.detail.shelflist.filter((list: { no: string }) => list.no.indexOf(this.detail.shelfDialogValue) != -1)
        },
        totShelfsQty() {
            let qty = 0;
            this.detail.shelflist.forEach((item: {qty: number}) => {
                qty = qty + Number(item.qty);
            });
            return qty;
        },

        /* 差异明细 */
        totQtyBook() {
            let qtybook = 0
            this.diffItem.items.forEach((item: {qtybook: number}) => {
                qtybook = qtybook + Number(item.qtybook)
            })
            return qtybook
        },
        totQty() {
            let qty = 0;
            this.diffItem.items.forEach((item: {qty: number}) => {
                qty = qty + Number(item.qty);
            });
            return qty;
        },
        totSkuQtyBook() {
            let qtybook = 0;
            this.diffItem.skulist.forEach((sku: {qtybook: number}) => {
                qtybook = qtybook + Number(sku.qtybook);
            });
            return qtybook;
        },
        totSkuQty() {
            let qty = 0;
            this.diffItem.skulist.forEach((sku: {qty: number}) => {
                qty = qty + Number(sku.qty);
            });
            return qty;
        }
    }
  })