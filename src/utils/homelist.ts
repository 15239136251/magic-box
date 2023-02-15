import uniStorage from './uniStorage'
const params: any = uniStorage.getItem('params')
const param: { reportUrl: string, issueUrl: string, 'o2o.enable': string } = params ? JSON.parse(params) : {}
const homelist = {
	"data": [
		{   "key": "stock",
			"title": "库存管理",
			"info": "门店库存业务相关功能",
			"list": [{
				"iconUrl": "/static/svg/dbck.svg",
				"text": "出库",
				"path": "/pages/storeOutList/storeOutList"
			},
			{
				"iconUrl": "/static/svg/dbrk.svg",
				"text": "入库",
				"path": "/pages/storeInList/storeInList"
			},
			{
				"iconUrl": "/static/svg/kcpd.svg",
				"text": "盘点",
				"path": "/pages/storeInventoryList/storeInventoryList"
			},
			{
				"iconUrl": "/static/svg/hpdb.svg",
				"text": "快速调拨",
				"path": "/pages/storeAllocationList/storeAllocationList"
			},
			{
				"iconUrl": "/static/svg/kuai_su_diao_huo.svg",
				"text": "快速调货",
				"path": "/pages/quickTransfer/quickTransfer"
			},
			{
				"iconUrl": "/static/svg/xiao_shou_tui_huo.svg",
				"text": "销售退货",
				"path": "/pages/saleRet/saleRet"
			},
			{
				"iconUrl": "/static/svg/yun_cang_fa_huo.svg",
				"text": "云仓发货",
				"path": "/pages/o2oSoout/o2oSoout"
			},
			{
				"iconUrl": "/static/svg/yun_cang_xia_dan.svg",
				"text": "云仓下单",
				"path": "/pages/o2oStoreOrder/o2oStoreOrder"
			}]
		},
		{
            "key": "tool",
			"title": "日常工具",
			"list": [{
				"iconUrl": "/static/svg/kccx.svg",
				"text": "库存查询",
				"path": "/pages/storeStockQuery/storeStockQuery"
			},
			{
				"iconUrl": "/static/svg/zhspkc.svg",
				"text": "组合商品库存",
				"path": "/pages/combinationProductStockQuery/combinationProductStockQuery"
			},
			{
				"iconUrl": "/static/svg/klcx.svg",
				"text": "库龄查询",
				"path": "/pages/storeAgeQuery/storeAgeQuery"
			},
			{
				"iconUrl": "/static/svg/jxccx.svg",
				"text": "进销存查询",
				"path": "/pages/storeReQuery/storeReQuery"
			},
			{
				"iconUrl": "/static/svg/kuai_di_xia_dan.svg",
				"text": "快递下单",
				"path": "/pages/expressOrder/expressOrder"
			},
			{
				"iconUrl": "/static/svg/mu_biao_she_zhi.svg",
				"text": "目标设置",
				"path": "/pages/targetSetting/targetSetting"
			},
			{
				"iconUrl": "/static/svg/hui_yuan_cha_xun.svg",
				"text": "会员查询",
				"path": "/pages/vipQuery/vipQuery"
			},
			{
				"iconUrl": "/static/svg/kuai_di_xiu_gai.svg",
				"text": "快递修改",
				"path": "/pages/expressEdit/expressEdit"
			},
			{
				"iconUrl": "/static/svg/bao_xian_ti_bao.svg",
				"text": "保险提报",
				"path": "/pages/safeday/safeday"
			},
			{
				"iconUrl": "/static/svg/cjwt.svg",
				"text": "用户手册",
				"path": "/pages/H5Page/H5Page?url=" + param.issueUrl
			},
			{
				"iconUrl": "/static/svg/cjwt.svg",
				"text": "数据分析",
				"path": param.reportUrl ? "/pages/H5Page/H5Page?url=" + param.reportUrl + "/index" : "/pages/H5Page/H5Page?url="
			}]
		}
	],
	"topData": [{
		"iconUrl": "/static/svg/kai_dan.svg",
		"text": "开单",
		"path": "/pages/bill/bill"
	}, {
		"iconUrl": "/static/svg/tui_huo.svg",
		"text": "退货",
		"path": "/pages/ret/ret"
	}, {
		"iconUrl": "/static/svg/cha_ku_cun.svg",
		"text": "查库存",
		"path": "/pages/checkStock/checkStock"
	}, {
		"iconUrl": "/static/svg/cha_ding_dan.svg",
		"text": "查零售",
		"path": "/pages/checkRetail/checkRetail"
	}]
}

let stock = ['快速调货', '云仓下单']
if (param['o2o.enable'] === 'N') stock.push('云仓发货')
const tool = ['库存查询', '组合商品库存', '库龄查询', '进销存查询', '快递下单', '快递修改', '保险提报']
const topData = ['']

interface FilterKey {
    stock?: string[],
    tool?: string[],
    topData?: string[]
}

export default (keys: FilterKey) => {
    type stringKey = Record<string, string[]>
    const filterKeys: stringKey = { 
    	stock: keys.stock ? [...keys.stock, ...stock] : stock, 
        tool: keys.tool ? [...keys.tool, ...tool] : tool,
        top: keys.topData ? [...keys.topData, ...topData] : topData
    }
    const { data, topData: top } = homelist;
    const _data = data.map(_value => {
        const keys = filterKeys[_value.key]
        return {
            ..._value,
            list: _value.list.filter(_list => !keys.includes(_list.text))
        }
    })
    const _top = top.filter(_list => !filterKeys.top.includes(_list.text))
    const value = {
        top: _top,
        data: _data
    }
    console.log("🚀 ~ file: homelist.ts:160 ~ value", value)
    return value
}