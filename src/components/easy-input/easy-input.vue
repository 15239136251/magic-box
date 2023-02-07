<template>
    <view class="search-input">
        <view class="search-input-icon">
            <image class="icon" src="/static/svg/search.svg" mode=""></image>
        </view>
        <input 
            type="text"
            :placeholder="placeholder"
            v-model="inputValue"
            @input="input"
            @confirm="search"
            :disabled="disabled"
        />
        <view class="search-input-icon" v-if="isScan" @click="scan">
            <image class="icon" src="/static/svg/scan.svg" mode=""></image>
        </view>
        <text class="search-input-text" @click="search">搜索</text>
    </view>
</template>

<script lang="ts">
export default {
    name:"easy-input",
    props: {
        value: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: '请输入单据编号'
        },
        isScan: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            inputValue: ''
        }
    },
    created() {
        this.inputValue = this.value
    },
    watch: {
        value(val: string) {
            this.inputValue = val;
        },
        inputValue(newVal, oldVal) {
            this.$emit("change", newVal);
        }
    },
    methods: {
        input(e: any) {
            this.inputValue = e.detail.value
            this.$emit('input', this.inputValue)
        },
        search() {
            if (this.disabled) return
            this.$emit('search')
        },
        scan() {
            if (this.disabled) return
            this.$emit('scan')
        }
    }
}
</script>

<style lang="scss" scoped>
.search-input {
    width: 100%;
    height: 60rpx;
    padding: 10rpx 0;
    overflow: hidden;
    background-color: #F3F4F6;
    border: 1px solid #F3F4F6;
    border-radius: 4px;
    font-family: sans-serif;
    display: flex;
    align-items: center;
    &-icon {
        width: 60rpx;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .icon {
            width: 40rpx;
            height: 40rpx;
        }
    }
    &-text {
        font-size: 28rpx;
        width: 80rpx;
        font-weight: 600;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    input {
        flex-grow: 1;
        font-size: 28rpx;
        width: 60%;
        height: 60rpx;
        border: none;
        outline: none;
    }
}
.search-input:focus-within {
    border-color: #777;
}
</style>