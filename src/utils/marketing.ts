import REQ from "./http_wx"

function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (
        S4() +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        '-' +
        S4() +
        S4() +
        S4()
    )
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")   ==> 2006-7-2 8:9:4.18
Date.prototype.format = function (fmt) {
    //author: meizz
    var o = {
        'M+': this.getMonth() + 1, //月份
        'd+': this.getDate(), //日
        'h+': this.getHours(), //小时
        'm+': this.getMinutes(), //分
        's+': this.getSeconds(), //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        S: this.getMilliseconds(), //毫秒
    }
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(
            RegExp.$1,
            (this.getFullYear() + '').substr(4 - RegExp.$1.length)
        )
    for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
            )
    return fmt
}

export let defaultMarketingRetail = () => ({
    source: 'store',
    docno: guid(),
    billdate: new Date().format('yyyy-MM-dd'),
    storeCode: null,
    salesrepId: null,
    employee: null,
    totQty: 0,
    totAmount: 0,
    totActAmount: 0, // 实际金额
    totDisAmount: 0, // 折扣金额
    totVipDisAmount: 0, //会员优惠
    freight: 0,
    vip: null,
    integralDis: {},
    items: [],
    activityItems: [],
    ticketItems: [],
})

/**
* 调用促销执行 示例

let data = await deal_marketing({
...defaultMarketingRetail(),
storeCode: '888888',
items: [
  {
    good: {
      spuCode: '2D07-77511',
      skuCode: '2D07-77511008',
    },
    qty: 1,
    price: 100
  }
]
});

* @param {单据} data 
* @returns 
*/
export async function deal_marketing(data: any) {
    let requireds = ['source', 'billdate', 'storeCode']
    for (const key of requireds) {
        console.log('🚀 ~ file: marketing.js ~ line 75 ~ deal_marketing ~ key', key)
        console.log(data[key]);
        if (!data[key] && data[key] != 0) {
            uni.showToast({
                icon: 'none',
                title: `${key} 必填`,
            })
            console.error(`${key} 必填`)
            return
        }
    }
    let itemRequireds = ['good.spuCode', 'good.skuCode', 'qty', 'price']

    for (const item of data.items) {
        for (const key of itemRequireds) {
            if (key.includes('.')) {
                let keys = key.split('.')
                let target = item
                for (let k of keys) {
                    if (!target[k] && target[k] != 0) {
                        uni.showToast({
                            icon: 'none',
                            title: `item.${key} 必填`,
                        })
                        console.error(`item.${key} 必填`)
                        return
                    }
                    target = target[k]
                }
            } else {
                if (!item[key] && item[key] != 0) {
                    uni.showToast({
                        icon: 'none',
                        title: `item.${key} 必填`,
                    })
                    console.error(`item.${key} 必填`)
                    return
                }
            }
        }
    }

    return new Promise((resolve, reject) => {
        REQ({
            url: 'pos/deal-marketing',
            method: 'POST',
            data
        }).then((res: any) => {
            if (res.statusCode == 200) {
                resolve(res.data)
            } else {
                reject(null)
            }
        }).catch(reject)
    })
}