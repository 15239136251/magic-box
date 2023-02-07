// stores/login.js
import { defineStore } from 'pinia'
import uniStorage from '@/utils/uniStorage'
import { Md5 } from 'ts-md5'
import REQ from '@/utils/http_wx'
import DateFormat from '@/utils/date'
import useLoginInit from '@/utils/useLoginInit'

interface LoginIofo {
	user: string,
	pwd?: string,
	captcha?: string
}

interface baseReq {
	u?: string,
	phone?: string,
	_t: string,
	sign: string
}

export const useLoginStore = defineStore('login', {
    state: () => {
        return {
            logininfo: uniStorage.getItem('logininfo') || '',
            type: 'password',
            username: '',
            password: '',
            captcha: '',
            captchaTxt: '获取验证码',
            isPrivacy: false,
            isLogin: false
        }
    },
    getters: { },
    actions: { 
        setIsPrivacy(e: any) {
            const { value } = e.detail
            return this.isPrivacy = value.length > 0
        },

        loginCheck() {
            let errMsg = ''
            let checks = [{
                value: this.username,
                msg: '账号未填写'
            }, {
                value: this.password,
                msg: '密码未填写'
            }, {
                value: this.isPrivacy,
                msg: '未同意用户协议和隐私政策'
            }]

            for (const check of checks) {
                if (!check.value) {
                    errMsg = check.msg
                    break
                }
            }
            
            if (errMsg) uni.showToast({ title: errMsg, icon: "none" })
            return errMsg === ''
        },

        clearLogin() {
            this.captcha = ''
            this.username = uniStorage.getItem('username') || ''
            this.password = ''
            this.isPrivacy = false
        },

        geBaseReq(data: LoginIofo) {
            const flag = "wxsg";
            const _t = new DateFormat().Format("yyyy-MM-dd hh:mm:ss.S")
            let req: baseReq = { _t: '', sign: ''}
            if (data.pwd) {
                const u = data.user
                const p = Md5.hashStr(data.pwd)
                const sign = Md5.hashStr(flag + p + flag + _t + flag)
                req = {
                    u,
                    _t,
                    sign
                }
            } else if (data.captcha) {
                const phone = data.user
                const p = Md5.hashStr(data.user)
                const sign = Md5.hashStr(flag + p + flag + _t + flag)
                req = {
                    phone,
                    _t,
                    sign
                }
            }
            return req
        },

        loginUser() {
            this.isLogin = this.loginCheck()
            if (!this.isLogin) return
            const params = {
                user: this.username,
                pwd: this.password
            }
            console.log("🚀 ~ file: login.ts:105 ~ loginUser ~ params", params)
            uniStorage.setItem('username', this.username);
            // --暂时不用
            // uniStorage.setItem('type', this.type);
            const data = this.geBaseReq(params)
            const { u, sign, _t } = data
            uniStorage.setItem('sign', sign)
            const url = `pos/login?u=${u}&sign=${sign}&_t=${_t}`
            console.log("🚀 ~ file: login.ts:113 ~ loginUser ~ url", url)
            REQ({
                url,
                data,
                method: 'POST'
            }).then((res: any) => {
                console.log('res', res)
                const { data } = res
                if (data) this.logininfo = JSON.parse(JSON.stringify(data))
                uniStorage.setItem('logininfo', this.logininfo)
                this.clearLogin()
                useLoginInit()
                uniStorage.setItem('login-status', '1')
                uni.redirectTo({
                    url: '../home/home'
                });
            })
        }
    }
})