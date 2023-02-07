import config from "@/config"
const uniStorage: Storage = {
  length: 0,
  clear: function (): void {
    uni.clearStorage()
  },
  getItem: function (key: string): string | null {
    const _key = config.common.storageKey + '-' + key
    return uni.getStorageSync(_key)
  },
  key: function (index: number): string | null {
    const res = uni.getStorageInfoSync()
    return res.keys[index]
  },
  removeItem: function (key: string): void {
    const _key = config.common.storageKey + '-' + key
    uni.removeStorageSync(_key)
  },
  setItem: function (key: string, value: string): void {
    const _key = config.common.storageKey + '-' + key
    uni.setStorageSync(_key, value)
  },
}
export default uniStorage
