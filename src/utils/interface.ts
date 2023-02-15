/* 通用返回 */
export interface DateTag {
    index: number
    type: string
    value: string[]
}

export interface CommonData {
    id: number
    name: string
    code: string
    qty: number
}

export interface CommonSku {
    id: number
    no: string
    col_code: string
    col_id: number
    col_name: string
    size_code: string
    size_id: number
    size_name: string
    qty: number
    qtycan: number
}

export interface Pay {
    id: number
    is_vou: string
    payway_code: string
    payway_name: string
    realtype: string
    tot_retamt?: number
    payamount?: number
}

export interface HangList {
    id: number
    docno: string
    billdate: number
    tot_qty: number
    tot_amt: number
    description: number
    vip?: Vip
    employeeId?: number | any
    items?: any
}

export interface Vip {
    name: string
    cardno: string
    price: number
    integral: number
    id: number
    type?: number | string
    type_name?: string
    birthday?: string
    amount?: number
    dimitems?: any
}

/* 会员查询 */
export interface VipList {
    id: number
    cardno: string
    phone: string
    name: string
    sex: string
    creationdate: string
    type_name: string
    store_name: string
}
export interface VipDetailOptions {
    id: number
    name: string
    dateBeg: string
    dateEnd: string
}
export type VipDetailTotal = {
    total_amt: number
    tot_cnt: number
    tot_qty: number
    jpn: number
    pdt_avg_price: number
    order_avg_price: number
    avg_dis: number
    order_max_amt: number
    avg_days: number
    last_day: string
}
export interface VipDetail {
    id: number,
    range: string[]
    name: string
    dateBeg: string
    dateEnd: string
    tag: string
    basicinfo: any
    total: any | VipDetailTotal
    logs: any[]
    isEnd: boolean
    page: number
}

/* 查库存 */
export interface CheckStockOurItem {
    id: number
    name: string
}
export interface CheckStockOurStock {
    id?: number
    no?: string
    select?: boolean
    value1?: string
    value1_code?: string
    value2?: string
    qty?: number
    qtycan?: number
}
export interface CheckStockOurPdtFind {
    colors: CommonData[]
    sizes: CommonData[]
    skus: CommonSku[]
    value: string
}
export interface CheckStockOtherStock {
    id?: number
    no?: string
    name?: string
    select?: boolean
    value1?: string
    value1_code?: string
    value2?: string
    qty?: number
    qtycan?: number
    pricelist: number
    items: {store_name: string, qtycan: number, id: number}[]
}

/* 查零售 */
export interface CheckRetailSumItem {
    name: string
    tot_qty: number
    tot_amt: number
    amt_list: number
}
export interface CheckRetailItems {
    id: number
    name: string
    color_name: string
    size_name: string
    priceactual: number
    pricelist: number
    qty: number
}
export interface CheckRetailItem {
    id: number
    docno: string
    statustime: string
    vip_phone: string
    emp_name: string
    description: string
    items: CheckRetailItems[]
    actitems: any[]
    tickitems: any[]
    integral_dis_amt: number
    use_integral: number
    tot_vip_dis_amt: number
}

/* 原单退货 */
export interface RetOriginalOrderListItems extends CommonData {
    color_name: string
    color_code: string
    size_name: string
    tot_amt_actual: number
    type: number
    rqty: number
    rcanqty: number
    qtyCan: number
    qtycan: number
    no?: string
    priceactual: number
}
export interface RetOriginalOrderListApi {
    id: number
    billdate: number
    statustime: number
    docno: string
    doctype: string
    emp_id: number
    emp_name: string
    vip_id: number
    vip_phone: string
    remark: string
    freight: number
    integral_dis_amt: number
    use_integral: number
    pays: Pay[]
    items: RetOriginalOrderListItems[]
    msitems: any
    actitems: any
    tickitems: any
}
export interface RetOriginalOrde extends RetOriginalOrderListApi {
}
/* 非原单退货 */
export interface RetNoOriginalOrderListItems extends CommonData  {
    no?: string
    value: string
    value1: string
    value2: string
    isO2o?: string
    pricelist: number
    old_pricelist: number
    empids?: number[]
}

/* 开单 */
export interface BillItem extends CommonData {
    no?: string
    value: string
    value1: string
    value2: string
    isO2o?: string
    pricelist: number
    old_pricelist: number
    empids?: number[]
    dims?: any
    isGift: string
    isActivity: string
    discount: number
    vipDisAmount: number
    activityDisAmt: number
    ticketDisAmt: number
    integralDisAmt: number
    activityName: string
    giftItem?: any
    selecItems?: any
    children?: BillItem[]
}
export interface DealMarketing {

}