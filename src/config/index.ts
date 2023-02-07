export default {
    api: {
        web: import.meta.env.VITE_BASE_URL,
        weixin: 'https://app.burgeonerp.cn:22986/',
        pay: 'https://pay.burgeonerp.cn/Rest/Pay/'
    },
    common: {
        isSubmiteExpcom: false,
        iszfborwx: false,
        storageKey: 'wxpos'
    }
}