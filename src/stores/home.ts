// stores/home.js
import { defineStore } from 'pinia'
import { $goto } from '@/utils/navigate'
import uniStorage from '@/utils/uniStorage'
import REQ from '@/utils/http_wx'
import config from '@/config'

export const useHomeStore = defineStore('home', {
    state: () => {
      return { 
        store: '',
        user: '',
        billdateType: 'day',
        totData: {
          totcnt: 0, //成交笔数
          totamt: 0, //成交金额
          totqty: 0, //成交数量
          totvip: 0 //新增会员
        },
        openid: null,
        articleUrl: ''
      }
    },
    actions: {
      setStoreAndUser() {
        const logininfo: any = uniStorage.getItem('logininfo')
        this.store = logininfo.store_name
        this.user = logininfo.nick_name
      },
      setArticleUrl(url: string) {
        this.articleUrl = url
      },
      dateTagChange(value: {index: number, type: string, value: string[]}) {
        console.log("🚀 ~ file: home.ts:29 ~ dateTagChange ~ value", value)
        this.billdateType = value.type
        this.getTotData()
      },
      to(url: string) {
        $goto({ url }, true)
      },
      async getTotData() {
        let request: any = await REQ({
          url: 'pos/index',
          method: 'POST',
          data: {
            type: this.billdateType
          }
        })
        console.log("🚀 ~ file: home.ts:52 ~ getTotData ~ request", request)
        this.totData = request.data
      },
      async getOpenId() {
        uni.login({
          provider: "weixin",
          success: function (res) {
            let url = config.api.web
            // #ifdef MP-WEIXIN
            url = config.api.weixin
            // #endif
            uni.request({
              url: url + 'pos/wx/code2Session?code=' + res.code,
              method: 'GET',
              async success(result) {
                  const data: any = result.data
                  let deviceno: any = await REQ({
                    url: 'pos/retail/deviceno',
                    method: 'POST',
                    data: { openid: data.openid }
                  })
                  uniStorage.setItem('deviceno', deviceno.deviceno)
              },
            })
          },
          fail: function (err) {
            console.log("🚀 ~ file: home.ts:77 ~ getOpenId ~ err", err)
          }
        })
      },
      getSystemInfo() {
        uni.getSystemInfo({
          success:function(res){
            console.log('系统设备信息', res)
            const deviceTypeKey = {
              'phone': '1',
              'pc': '2',
              'pad': '3'
            }
            type DType = keyof typeof deviceTypeKey
            let key = deviceTypeKey[res.deviceType as DType] || 4
            uniStorage.setItem('devicetype', key as string)
          }
        })
      },
      logout() {
        let that = this
        uni.showModal({
          content: '是否退出当前用户?',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.outApi()
            } else if (res.cancel) {
              console.log('用户点击取消');
            }
          }
        })
      },
      outApi() {
        REQ({
          url: 'pos/logout',
          method: 'POST'
        }).then(_ => {
          this.out()
        }).catch(e => {
          console.log("🚀 ~ file: home.ts:102 ~ outApi ~ e", e)
        })
      },
      out() {
        uniStorage.clear()
        this.openid = null
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    },
  })