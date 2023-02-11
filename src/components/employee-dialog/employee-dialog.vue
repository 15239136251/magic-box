<template>
    <view>
        <van-popup v-model:show="isopen" @click-overlay="close" position="center" title="营业员" on-click-overlay>
            <view class="emplpyee-dialog">
                <view class="emplpyee-dialog-title">
                    <text>选择营业员</text>
                </view>
                <view class="emplpyee-dialog-content">
                    <radio-group @change="employeeChange" v-if="!multiple">
                        <label 
                            class="emplpyee-dialog-content-label"
                            v-for="employee in employeelist"
                            :key="employee.id"
                        >
                            <radio color="#f87171" :value="employee.id" :checked="employee.id == selectValue[0]" />
                            <text>{{ employee.name }}</text>
                        </label>
                    </radio-group>
                    <checkbox-group @change="employeeChange" v-else>
                        <label
                            class="emplpyee-dialog-content-label"
                            v-for="employee in employeelist"
                            :key="employee.id"
                        >
                            <checkbox 
                                style="transform:scale(0.7)" 
                                color="#f87171"
                                :value="employee.id" 
                                :checked="selectValue.includes(employee.id)" 
                            />
                            <text>{{ employee.name }}</text>
                        </label>
                    </checkbox-group>
                </view>
                <view class="emplpyee-dialog-bottom">
                    <view class="emplpyee-dialog-bottom-button left" @click="close">
                        退出
                    </view>
                    <view class="emplpyee-dialog-bottom-button right" @click="save">
                        确定
                    </view>
                </view>
            </view>
        </van-popup>
    </view>
</template>

<script setup lang="ts" name="employee-dialog">
import { ref, toRefs, watch, PropType, computed } from 'vue'
import { CommonData } from '@/utils/interface'
import uniStorage from '@/utils/uniStorage'
const props = defineProps({
    isopen: {
        type: Boolean,
        default: false
    },
    list: {
        type: Array as PropType<CommonData[]>,
        default: []
    },
    value: {
        type: Array as PropType<number[]>,
        default: []
    }
})
const emits = defineEmits(['save', 'close'])

const { isopen } = toRefs(props)
const selectValue = ref<number[]>([])

/* 计算属性 */
const employeelist = computed(() => {
    return props.list
})
const multiple = computed(() => {
    const params = uniStorage.getItem('params')
    return params ? JSON.parse(params).isMoreEmp === 'Y' : false
})

const employeeChange = (e: any) => {
    const { value } = e.detail
    if (typeof value === 'string') selectValue.value = [Number(value)]
        else selectValue.value = value.map((_val: string) => {return Number(_val)})
}
const close = () => {
    selectValue.value = []
    emits('close')
}
const save = () => {
    emits('save', selectValue.value)
    close()
}
watch(props, (newVal) => {
    if (selectValue.value != newVal.value) selectValue.value = newVal.value
})
</script>

<style scoped lang="scss">
.emplpyee-dialog {
    background-color: white;
    overflow: hidden;
    position: relative;
    font-size: 26rpx;
    padding: 16rpx;
    border-radius: 8rpx;
    width: 70vw;
    min-height: 300rpx;
    &-title {
        text-align: center;
        font-weight: 600;
    }
    &-content {
        padding: 16rpx 0;
        max-height: 400rpx;
        overflow-y: auto;
        &-label {
            width: 100%;
            display: block;
            margin-top: 16rpx;
        }
    }
    &-bottom {
        width: 100%;
        height: 80rpx;
        display: flex;
        align-items: center;
	    justify-content: center;
        &-button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16rpx 48rpx;
            border-radius: 9999px;
        }
        .left {
            background-color: #F3F4F6;
        }
        .right {
            color: white;
            margin-left: 32rpx;
            background-color: #EF4444;
        }
    }
}
</style>