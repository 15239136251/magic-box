<template>
  <view>
    <web-view
      :webview-styles="webviewStyles"
      :src="url"
    ></web-view>
  </view>

</template>

<script lang="ts">
  export default {
    onLoad({url}: {url: string}) {
      if (url === '' || !url) {
        return uni.showModal({
          content: '当前页面未配置，请先配置',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              uni.navigateBack()
            }
          }
        })
      }
      this.url = url;
      console.log("🚀 ~ file: H5Page.vue:15 ~ onLoad ~ this.url", this.url)
    },
    data() {
      return {
        url: '',
        webviewStyles: {
          progress: {
            color: '#FF3333',
          },
        }
      }
    }
  }
</script>

<style scoped>

</style>