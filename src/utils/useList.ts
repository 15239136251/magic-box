import { Ref, ref, watch, onMounted } from 'vue'
import { showLoading, hideLoading, showToast } from './interactions'

export interface MessageType {
    GET_DATA_IF_FAILED?: string
    GET_DATA_IF_SUCCEED?: string
    EXPORT_DATA_IF_FAILED?: string
    EXPORT_DATA_IF_SUCCEED?: string
}

export interface OptionsType {
    requestError?: () => void
    requestSuccess?: () => void
    exportError?: () => void
    exportSuccess?: () => void
    message: MessageType
}

const DEFAULT_MESSAGE = {
    GET_DATA_IF_FAILED: '获取列表数据失败',
    EXPORT_DATA_IF_FAILED: '获取列表数据失败'
}

const DEFAULT_OPTIONS: OptionsType = {
    message: DEFAULT_MESSAGE
}

export default function useList<ItemType extends Object, FllterOption extends Object>(
    listRequestFnc: Function,
    fllterOption: Ref<Object>,
    exportRequestFn?: Function,
    options = DEFAULT_OPTIONS
) {
    // 加载状态
    const loading = ref(false)
    // 数据是否全部查询
    const isEnd = ref(false)
    // 当前页
    const curPage = ref(0)
    // 总数量
    const total = ref({
        all: 0,
        done: 0,
        undo: 0
    })
    // 分页大小
    const pageSize = ref(10)
    // 列表值
    const list = ref<ItemType[]>([])
    // 获取列表数据
    const loadData = async (page = curPage.value, isCover: boolean = true) => {
        // 设置加载状态为加载中
        loading.value = true
        if (isEnd.value) isEnd.value = false
        const params = {
            page,
            pageSize: pageSize.value
        }
        showLoading('正在查询...')
        try {
            const request = await listRequestFnc({ ...params, ...fllterOption.value })
            console.log("🚀 ~ file: useList.ts:62 ~ loadData ~ request", request)
            const { data } = request;
            if (data.length === 0) isEnd.value = true
            if (isCover) {
                list.value = data.map((item: ItemType) => {
                    return {
                        ...item,
                        isMore: false
                    }
                })
                total.value = {
                    all: request['total.all'] || 0,
                    done: request['total.done'] || 0,
                    undo: request['total.undo'] || 0
                }
            } else list.value = list.value.concat(data)
            // 执行成功
            options?.message?.GET_DATA_IF_SUCCEED && showToast(options.message.GET_DATA_IF_SUCCEED)
            options?.requestSuccess?.()
        } catch (error) {
            options?.message?.GET_DATA_IF_FAILED && showToast(options.message.GET_DATA_IF_FAILED)
            options?.requestError?.()
            console.log("🚀 ~ file: useList.ts:78 ~ loadData ~ error", error)
        } finally {
            // 关闭加载状态
            loading.value = false
            hideLoading()
        }
    }
    // 过滤数据
    const reload = () => {
        loadData()
    }
    const filter = () => {
        loadData()
    }

    // 重置
    const reset = () => {
        if (!fllterOption.value) return;
        const keys = Reflect.ownKeys(fllterOption.value)
        fllterOption.value = {} as FllterOption
        keys.forEach(key => {
            Reflect.set(fllterOption.value, key, undefined)
        })
        loadData()
    }
    // 导出
    const exportFile = async () => {
        if (!exportRequestFn) throw new Error('当前没有提供exportRequestFn函数')
        if (typeof exportRequestFn !== 'function') throw new Error('exportRequestFn必须是一个函数')
        try {
            const { data } = await exportRequestFn(fllterOption.value)
            // 执行成功
            options?.message?.EXPORT_DATA_IF_SUCCEED && showToast(options.message.EXPORT_DATA_IF_SUCCEED)
            options?.exportSuccess?.()
        } catch (error) {
            options?.message?.EXPORT_DATA_IF_FAILED && showToast(options.message.EXPORT_DATA_IF_FAILED)
            options?.exportError?.()
            console.log("🚀 ~ file: useList.ts:114 ~ exportFile ~ error", error)
        }
    }

    // 监听分页数据变化
    watch([curPage, pageSize], () => {
        console.log("🚀 ~ file: useList.ts:122 ~ watch ~ curPage", curPage)
        loadData(curPage.value, curPage.value === 0)
    })

    // 加载后调用
    onMounted(() => {
        // loadData(curPage.value)
    })

    // 返回
    return {
        list,
        total,
        isEnd,
        curPage,
        loading,
        pageSize,
        fllterOption,
        reset,
        reload,
        filter,
        loadData,
        exportFile
    }
}