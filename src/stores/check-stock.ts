// stores/check-stock.js
import { defineStore } from 'pinia'
import uniStorage from '@/utils/uniStorage'
import { CheckStockOurStock, CheckStockOurItem, CheckStockOurPdtFind, CommonData, CheckStockOtherStock } from '@/utils/interface'
import REQ from '@/utils/http_wx'
import { showToast } from '@/utils/interactions'

export const useCheckStockStore = defineStore('checkStock', {
  state: () => {
    const itemList: CheckStockOurItem[] = []
    const stocklist: CheckStockOurStock[] = []
    const ourPdtFind: CheckStockOurPdtFind = {
      colors: [],
      sizes: [],
      skus: [],
      value: ''
    }
    const otherStorelist: CommonData[] = []
    const otherStocklist: CheckStockOtherStock[] = []
    return { 
      tag: '本店库存',
      /* 本店库存 */
      ourSearchValue: '',
      ourItemList: itemList,
      ourItemId: -1,
      ourStocklist: stocklist,
      ourPage: 0,
      ourPdtColorId: -1,
      ourPdtSizeId: -1,
      ourPdtFindDialog: false,
      ourPdtFind: ourPdtFind,
      /* 邻店库存 */
      otherSearchValue: '',
      otherStoreValue: '',
      otherStorelist: otherStorelist,
      otherStocklist: otherStocklist,
      otherPage: 0
     }
  },
  actions: {
    isTag(tag: string) {
      return tag === this.tag
    },
    tagChange(tag: string) {
      this.tag = tag
    },
    init() {
      this.getOurStoreList(false)
      this.getStroreList()
    },
    /* 本店库存 */
    ourSearchInput(e: {no: string}) {
      this.ourSearchValue = e.no
      this.ourSearch()
    },
    ourSearch() {
      this.ourPage = 0
      this.getOurStoreList(false)
    },
    ourReset() {
      this.ourSearchValue = ''
      this.ourSearch()
      this.ourPdtColorId = -1
      this.ourPdtSizeId = -1
      this.ourItemId = -1
    },
    async ourItemFilter() {
      if (this.ourItemId === -1) return showToast('请选择款号', 'error')
      const ourItem = this.ourItemList.find(ourItem => ourItem.id === this.ourItemId)
      const request: any = await REQ({
        url: 'pos/pdt/find',
        method: 'POST',
        data: { name: ourItem?.name}
      })
      console.log("🚀 ~ file: check-stock.ts:63 ~ ourItemFilter ~ request", request)
      this.ourPdtFind = request.data
      this.ourPdtFindDialog = true
    },
    ourPdtFindDialogClose() {
      this.ourPdtColorId = -1;
			this.ourPdtSizeId = -1;
      this.ourPdtFindDialog = false
    },
    ourPdtFindSelectSku(colorId: number, sizeId: number) {
      this.ourPdtColorId = colorId
      this.ourPdtSizeId = sizeId
    },
    ourPdtFindSave() {
      const sku = this.ourPdtFind.skus.find(sku => sku.col_id === this.ourPdtColorId && sku.size_id === this.ourPdtSizeId)
      if (sku) {
        this.ourSearchValue = sku.no
        this.ourPage = 0
        this.getOurStoreList(true)
      }
      this.ourPdtFindDialogClose()
    },
    getOurSku(ourItem: CheckStockOurItem) {
      this.ourItemId = ourItem.id
      this.getOurStoreSkuList(ourItem)
    },
    getOurStoreList(isFilter: boolean) {
      const data = {
        query: this.ourSearchValue
      }
      REQ({
        url: 'pos/report/stock_local_pdt',
        method: 'POST',
        data
      }).then((res:any) => {
        console.log("🚀 ~ file: check-stock.ts:56 ~ getOurStoreList ~ res", res)
        this.ourStocklist = []
        this.ourItemList = res.data
        if (this.ourItemList.length === 1) {
          if (isFilter) this.getOurStoreSkuList(this.ourItemList[0], this.ourSearchValue)
            else this.getOurStoreSkuList(this.ourItemList[0])
          this.ourItemId = this.ourItemList[0].id
        }
      })
    },
    getOurStoreSkuList(ourItem: CheckStockOurItem, ourSearchValue?: string) {
      const data = {
        pdtId: ourItem.id
      }
      REQ({
        url: 'pos/report/stock_local',
        method: 'POST',
        data
      }).then((res: any) => {
        console.log("🚀 ~ file: check-stock.ts:75 ~ getOurStoreSkuList ~ res", res)
        this.ourStocklist = res.data
        if (ourSearchValue) {
          let newObj: CheckStockOurStock = {}
          this.ourStocklist.forEach((ourStock, index) => {
            if (ourStock.no === ourSearchValue) {
              newObj = {
                ...ourStock,
                select: true
              }
              this.ourStocklist.splice(index, 1)
            } else {
              ourStock.select = false
            }
          })
          this.ourStocklist.unshift(newObj)
        }
      })
    },
    /* 邻店库存 */
    otherSearchInput(e: {multiple: true, value: string[], no: string}) {
      console.log("🚀 ~ file: check-stock.ts:149 ~ otherSearchInput ~ e", e)
      if (e.multiple) {
        let skus = e.value;
        this.otherSearchValue = ''
        this.getOtherStoreList(skus)
      } else {
        this.otherSearchValue = e.no || ''
        if (this.otherSearchValue === '') return showToast('请录入款号或条码', 'none')
        this.otherSearch();
      }
    },
    otherStoreInput(e: string) {
      console.log("🚀 ~ file: check-stock.ts:160 ~ otherStoreInput ~ e", e)
      this.otherStoreValue = e
    },
    otherSearch() {
      this.otherPage = 0
      this.getOtherStoreList()
    },
    otherPageNext() {
      this.otherPage = this.otherPage + 1
      this.getOtherStoreList()
    },
    otherPagePre() {
      console.log("🚀 ~ file: check-stock.ts:173 ~ otherPagePre ~ 上一页")
      if (this.otherPage === 0) return showToast('已在第一页', 'none')
      this.otherPage = this.otherPage - 1
      this.getOtherStoreList()
    },
    getOtherStoreList(skus?: string[]) {
      const data = {
        query: this.otherSearchValue,
        destId: this.otherStoreValue,
        page: this.otherPage,
        skus: skus ? skus : []
      }
      REQ({
        url: 'pos/report/stock_near',
        method: 'POST',
        data
      }).then((res:any) => {
        console.log("🚀 ~ file: check-stock.ts:180 ~ getOtherStoreList ~ res", res)
        this.otherStocklist = res.data
      })
    },
    getStroreList() {
      REQ({
        url: 'pos/store/list',
        method: 'POST',
      }).then((res:any) => {
        console.log("🚀 ~ file: check-stock.ts:189 ~ getStroreList ~ res", res)
        this.otherStorelist = res.data
      })
    }
  },
  getters: {
    /* 本店库存 */
    getListTotQty() {
      let totQty = 0
      this.ourStocklist.forEach(stock => {
        totQty = totQty + (Number(stock.qty) || 0)
      })
      return totQty
    },
    getListTotQtyCan() {
      let totQtyCan = 0
      this.ourStocklist.forEach(stock => {
        totQtyCan = totQtyCan + (Number(stock.qtycan) || 0)
      })
      return totQtyCan
    },
    /* 邻店库存 */
  }
})
