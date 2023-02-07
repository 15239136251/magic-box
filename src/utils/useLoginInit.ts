import { ref } from 'vue'
import REQ from './http_wx'
import uniStorage from './uniStorage'

export default function useLoginInit() {
    /* 查询省份 */
    const provincelist = ref([])
    const getProvince = () => {
        REQ({
            url: 'pos/province/list',
            method: 'POST'
        }).then((res: any) => {
            provincelist.value = res.data
            uniStorage.setItem('provinces', JSON.stringify(provincelist.value))
        })
    }

    /* 查询城市 */
    const citylist = ref([])
    const getCity = () => {
        REQ({
            url: 'pos/city/list',
            method: 'POST'
        }).then((res: any) => {
            citylist.value = res.data
            uniStorage.setItem('citys', JSON.stringify(citylist.value))
        })
    }

    /* 查询区域 */
    const districtlist = ref([])
    const getDistrict = () => {
        REQ({
            url: 'pos/district/list',
            method: 'POST'
        }).then((res: any) => {
            districtlist.value = res.data
            uniStorage.setItem('districts', JSON.stringify(districtlist.value))
        })
    }

    /* 查询系统参数 */
    const params = ref({})
    const getParam = () => {
        REQ({
            url: 'pos/dy/index_param/func',
            method: 'POST'
        }).then((res: any) => {
            params.value = res.data
            uniStorage.setItem('params', JSON.stringify(params.value))
        })
    }

    /* 初始化 */
    const init = () => {
        getProvince()
        getCity()
        getDistrict()
        getParam()
    }
    init()

    return {
        provincelist,
        citylist,
        districtlist,
        params
    }
}