import { ComponentInternalInstance, getCurrentInstance } from 'vue'
export default function useCurrentInstance() {
    // const { appContext, proxy } = getCurrentInstance() as ComponentInternalInstance
    const { appContext, proxy } = getCurrentInstance() as any
    const ctx = appContext.config.globalProperties
    return {
        proxy,
        ctx
    }
}