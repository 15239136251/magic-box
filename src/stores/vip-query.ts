// stores/target-setting.js
import { defineStore } from 'pinia'
import { $goto } from '@/utils/navigate'
import REQ from '@/utils/http_wx'
import { debounce } from '@/utils/debounce'
import { getDate, dbClick } from '@/utils/utils'
import { DateTag, VipList, VipDetail, VipDetailOptions } from '@/utils/interface'

export const useVipQueryStore = defineStore('vipQuery', {
    state: () => {     
      const viplist: VipList[] = []
      const detail: VipDetail = {
        id: -1,
        range: [],
        name: "",
				dateBeg: "",
				dateEnd: "",
        tag: '基础资料',
        basicinfo: {},
        total: {
					total_amt: 0,
					tot_cnt: 0,
					tot_qty: 0,
					jpn: 0,
					pdt_avg_price: 0,
					order_avg_price: 0,
					avg_dis: 0,
					order_max_amt: 0,
					avg_days: 0,
					last_day: ''
				},
        logs: [],
        isEnd: false,
        page: 0
      }
      return {
        range: [getDate(), getDate()],
        searchValue: '',
        total: {
          total: 0,
					total_amt: 0,
          total_at: 0,
					total_vip_amt: 0,
					vip_occupy: 0
        },
        touchStartId: -1,
        viplist: viplist,
        page: 0,
        loading: false,
        isEnd: false,
        detail: detail
      }
    },
    actions: {
        dateTagChange(value: DateTag) {
            console.log("🚀 ~ file: vip-query.ts:56 ~ dateTagChange ~ value", value)
            this.range = value.value
            this.getVipTotal()
        },
        changeLog(e: string[]) {
          if (e[0] === this.range[0] && e[1] === this.range[1]) return
          this.range = e
          this.getVipTotal()
        },
        searchInput(e: string) {
          this.searchValue = e
        },
        search() {
          this.page = 0
          this.getVipList()
        },
        lower() {
          if (this.isEnd) return
          console.log("🚀 ~ file: vip-query.ts:74 ~ lower ~ 到达底部")
          debounce(() => {
            this.page = this.page + 1
            this.getVipList()
          }, {})
        },
        goto(vip: VipList) {
          this.touchStartId = vip.id
          dbClick(() => {
            console.log("🚀 ~ file: vip-query.ts:83 ~ goto ~ vip", vip)
            const data: VipDetailOptions = {
              id: vip.id,
              name: vip.name,
              dateBeg: this.range[0],
              dateEnd: this.range[1]
            }
            type DataType = keyof typeof data
            const params: string = Object.keys(data).map(param => {
              return `${param}=${data[param as DataType]}`
            }).join("&")
            console.log("🚀 ~ file: vip-query.ts:94 ~ constparams:string=Object.keys ~ params", params)
            $goto({
              url: '/pages/vipQueryDetail/vipQueryDetail?' + params
          }, true)
          }, {})
        },
        init() {
          this.getVipTotal()
          this.getVipList()
        },
        async getVipTotal() {
          const data = {
            dateBeg: this.range[0],
            dateEnd: this.range[1]
          }
          const request: any = await REQ({
            url: 'pos/tools/vip/list/total',
            method: 'POST',
            data
          })
          console.log("🚀 ~ file: vip-query.ts:72 ~ getVipTotal ~ request", request)
          this.total = request.data
        },
        async getVipList() {
          this.loading = true
          if (this.isEnd) this.isEnd = false
          const data: {
            page: number,
            query: string
          } = {
            page: this.page,
            query: this.searchValue
          }
          try {
            const request: any = await REQ({
              url: 'pos/tools/vip/list',
              method: 'POST',
              data
            })
            console.log("🚀 ~ file: vip-query.ts:133 ~ getVipList ~ request", request)
            if (request.data.length === 0) this.isEnd = true
            if (this.page === 0) this.viplist = request.data
              else this.viplist = this.viplist.concat(request.data)
          } catch (error) {
            console.log("🚀 ~ file: vip-query.ts:138 ~ getVipList ~ error", error)
          } finally {
            // 关闭加载状态
            this.loading = false
          }
        },
        /* 详情 */
        setDetailOptions(options: VipDetailOptions) {
          this.detail.id = Number(options.id)
          this.detail.name = options.name
          this.detail.dateBeg = options.dateBeg
          this.detail.dateEnd = options.dateEnd
          this.detail.range = [options.dateBeg, options.dateEnd]
        },
        detailDateTagChange(value: DateTag) {
          console.log("🚀 ~ file: vip-query.ts:153 ~ dateTagChange ~ value", value)
          this.detail.range = value.value
          this.detail.page = 0
          this.getVipDetailLogs()
        },
        detailChangeLog(e: string[]) {
          if (e[0] === this.range[0] && e[1] === this.range[1]) return
          this.detail.range = e
          this.detail.page = 0
          this.getVipDetailLogs()
        },
        tagChange(tag: string) {
          this.detail.tag = tag
        },
        isTag(tag: string): boolean {
          return this.detail.tag === tag
        },
        logsLower() {
          if (this.detail.isEnd) return
          console.log("🚀 ~ file: vip-query.ts:172 ~ logsLower ~ 到达底部")
          debounce(() => {
            this.detail.page = this.detail.page + 1
            this.getVipDetailLogs()
          }, {})
        },
        imageError(e: any, index: number) {

        },
        detailInit() {
          this.getVipDetailInfo()
          this.getVipDetailTotal()
          this.getVipDetailLogs()
        },
        async getVipDetailInfo() {
          const request: any = await REQ({
            url: 'pos/tools/vip/detail/info',
            method: 'POST',
            data: { id: this.detail.id }
          })
          this.detail.basicinfo = request.data
        },
        async getVipDetailTotal() {
          const request: any = await REQ({
            url: 'pos/tools/vip/detail/total',
            method: 'POST',
            data: { id: this.detail.id }
          })
          this.detail.total = request.data
        },
        async getVipDetailLogs() {
          if (this.detail.isEnd) this.detail.isEnd = false
          try {
            const data = {
              id: this.detail.id,
              dateBeg: this.detail.dateBeg,
              dateEnd: this.detail.dateEnd,
              page: this.detail.page
            }
            const request: any = await REQ({
              url: 'pos/tools/vip/detail/logs',
              method: 'POST',
              data
            })
            if (request.data.length === 0) this.detail.isEnd = true
            if (this.detail.page === 0) this.detail.logs = request.data
              else this.detail.logs = this.detail.logs.concat(request.data)
          } catch (error) {
            console.log("🚀 ~ file: vip-query.ts:220 ~ getVipDetailLogs ~ error", error)
          }
        }
    },
  })