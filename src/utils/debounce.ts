// 防抖
let timeout = 0
export let debounce = (fnc: Function, params?: any) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        fnc(params)
    }, 500)
}