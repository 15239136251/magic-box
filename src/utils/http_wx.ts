/* eslint-disable require-atomic-updates */

import { showLoading, hideLoading, showToast } from './interactions'

import uniStorage from './uniStorage'
// import { querystringToObj } from '@/utils/url'
let { VITE_BASE_URL } = import.meta.env

// #ifdef MP-WEIXIN
// 如果是小程序需要固定接口地址
import config from '@/config'
VITE_BASE_URL = config.api.weixin
// #endif
console.log('VITE_BASE_URL', VITE_BASE_URL)
// 请求进入失败回调的函数，比如：域名校验不通过
const reqError = (err: any, res: any, msg = '请求发生错误') =>
  new Promise((resolve, reject) => {
    if (err) {
      showToast(msg)
      reject(err)
      return
    }
    resolve(res)
  })

// 请求发生错误的函数， 用于判断 statusCode 是否成功（2xx）
const resError = (res: any, msg = '响应发生错误') =>
  new Promise((resolve, reject) => {
    const {
      statusCode,
      data: { error = {} },
    } = res
    if (statusCode == 200) {
      resolve(res)
      return
    }
    // 请求响应 401 表示需要登录
    if (+res.statusCode === 401) {
      console.log('TODO: 此处需补充逻辑')
      return
    }
    const { message = msg } = error
    showToast(`${message}（${statusCode}）`)
    reject(new Error(message))
  })

// 响应拦截函数，接收响应对象为参数，用于根据响应结果做出相应操作
// 响应成功(status === 2xx)时会被调用
const resFn = (res: any) =>
  new Promise((resolve, reject) => {
    const { code, data, result, msg, message, success, token } = res.data
    if (token) uniStorage.setItem('token', token)
    if (success || +code === 0) {
      // resolve(data || result)
      // TODO 因小程序列表接口统计信息与data并列，需将res.data返回
      resolve(res.data)
      return
    }
    showToast(msg || message)
    const LOGIN_STATUS = uniStorage.getItem('login-status')
    if (code === -1 && (msg || message).indexOf('用户或者密码不对') != -1 && LOGIN_STATUS === '1') {
      console.log('需要退出登录')
      uniStorage.clear()
      uniStorage.setItem('login-status', '0')
      uni.reLaunch({
        url: '/pages/login/login'
      })
    }
    reject(new Error(msg || message))
    // reject(res)
  })

// 正在请求的列表
const pendingList: string[] = []

interface ReqData {
  url: string
  data?: Object
  method?:
    | 'OPTIONS'
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'TRACE'
    | 'CONNECT'
  baseURL?: string
  isShowLoading?: boolean
}

const REQ = async (
  reqData: ReqData = {
    url: '',
    data: {},
    method: 'POST',
    baseURL: VITE_BASE_URL,
    isShowLoading: true,
  }
) => {
  const reqDataJSON = JSON.stringify(reqData)
  if (pendingList.includes(reqDataJSON)) {
    throw new Error('重复请求...')
  }
  pendingList.push(reqDataJSON)
  const { url, data, method, baseURL = VITE_BASE_URL, isShowLoading } = reqData
  // 获取 token
  const timestamp = Date.now()
  const headerToken = {
    'x-timestamp': timestamp,
    "Content-Type": "application/json",
    // #ifdef MP-WEIXIN
    'wx.token': uniStorage.getItem('token')
    // #endif
  }
  isShowLoading && showLoading()
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseURL + url,
      method,
      data,
      header: headerToken,
      success: (res) => {
        resError(res).then(resFn).then(resolve).catch(reject)
      },
      fail: function (err) {
        reject(err)
      },
      complete: () => {
        isShowLoading && hideLoading()
        const i = pendingList.findIndex((v) => v === reqDataJSON)
        i >= 0 && pendingList.splice(i, 1)
      },
    })
  })
}
// }

export default REQ
