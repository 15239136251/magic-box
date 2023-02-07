// stores/target-setting.js
import { defineStore } from 'pinia'
import { $goto } from '@/utils/navigate'
import REQ from '@/utils/http_wx'
import { debounce } from '@/utils/debounce'

export const useTargetSettingStore = defineStore('targetSetting', {
    state: () => {
        interface List {
            id: number
            yearmonth: number | string
            tot_amt_mark: number | string
        }
        const list: List[] = []
        interface Detail {
            id: number
            list: any[]
        }
        const detail: Detail = {
            id: -1,
            list: []
        }
      return {
        searchValue: '',
        list: list,
        detail: detail
      }
    },
    actions: {
        searchInput(e: string) {
            this.searchValue = e
        },
        search() {
            this.getSettingList()
        },
        goto(id: number) {
            this.detail.id = id
            $goto({
                url: '/pages/targetSettingDetail/targetSettingDetail?id=' + id
            }, true)
        },
        async getSettingList() {
            const data = {
                query: this.searchValue
            }
            const requset: any = await REQ({
                url: 'pos/target/store',
                method: 'POST',
                data
            })
            this.list = requset.data
        },

        /* 详情 */
        empAmtInput(e: any, item: {id: number, tot_amt_mark: number | string}) {
            debounce(() => {
                item.tot_amt_mark = e.detail.value
                const data = {
                    id: item.id,
                    main: {
                        amt: item.tot_amt_mark
                    }
                }
                REQ({
                    url: 'pos/target/upload',
                    method: 'POST',
                    data
                })
            }, {})
        },
        out() {
            uni.showModal({
                title: '取消',
                content: '确认要取消吗？',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定');
                        uni.navigateBack();
                    } else if (res.cancel) {
                        console.log('用户点击取消');
                    }
                }
            })
        },
        save() {
            uni.navigateBack()
        },
        async getDetail() {
            const requset: any = await REQ({
                url: 'pos/target/emp',
                method: 'POST',
                data: {storemarkId: this.detail.id}
            })
            this.detail.list = requset.data
        }
    },
  })