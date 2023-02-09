// 防抖
let timeout = 0
export const debounce = (fnc: Function, params?: any) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        fnc(params)
    }, 500)
}

// 节流
let throttleTime = 0
export const throttle = (fnc: Function, time: number = 300) => {
    if (throttleTime) return
    throttleTime = setTimeout(() => {
        fnc()
        throttleTime = 0
    }, time)
}