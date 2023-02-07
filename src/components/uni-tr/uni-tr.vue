<template>
    <view class="uni-table-tr" :class="{ 'bg-red-100': select }" @click="click">
        <checkbox-group v-if="selection === 'selection'" class="checkbox" :class="{'tr-table--border':border}" @change="change">
            <label>
                <checkbox value="check" :checked="value"/>
            </label>
        </checkbox-group>
        <slot></slot>
    </view>
</template>

<script>
	/**
	 * Tr 表格行组件
	 * @description 表格行组件 仅包含 th,td 组件
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=
	 */
    export default {
		props: ["select"],
        name: 'uniTr',
        options: {
            virtualHost: true
        },
        data() {
            return {
                value: false,
                border: false,
                selection:false,
                widthThArr:[],
				touchStartTime: 0
            };
        },
        created() {
            this.root = this.getTable()
            this.border = this.root.border
            this.selection = this.root.type
            this.root.trChildren.push(this)
            this.root.isNodata()
        },
        mounted() {
            if(this.widthThArr.length > 0){
                const selectionWidth = this.selection === 'selection'? 50:0
                this.root.minWidth =  this.widthThArr.reduce((a,b)=> Number(a) + Number(b)) + selectionWidth
            }
        },
        destroyed() {
            const index = this.root.trChildren.findIndex(i=>i===this)
            this.root.trChildren.splice(index,1)
            this.root.isNodata()
        },
        methods: {
            minWidthUpdate(width){
                this.widthThArr.push(width)
            },
            change(e) {
                this.root.trChildren.forEach((item) => {
                    if (item === this) {
                        this.root.check(this,e.detail.value.length > 0 ? true : false)
                    }
                })
            },
            /**
             * 获取父元素实例
             */
            getTable() {
                let parent = this.$parent;
                let parentName = parent.$options.name;
                while (parentName !== 'uniTable') {
                    parent = parent.$parent;
                    if (!parent) return false;
                    parentName = parent.$options.name;
                }
                return parent;
            },
			click() {
				const _now = new Date().getTime()
				if (_now - this.touchStartTime <= 300) {
					this.$emit("dbClick");
				} else {
					this.touchStartTime = _now
				}
			}
        }
    }
</script>

<style lang="scss">
    .uni-table-tr {
        display: table-row;
        transition: all .3s;
        box-sizing: border-box;
    }

    .checkbox {
        padding: 12rpx 8rpx;
        width: 26rpx;
        padding-left: 12rpx;
        display: table-cell;
        // text-align: center;
        vertical-align: middle;
        color: #333;
        font-weight: 500;
        border-bottom: 1rpx #ddd solid;
        font-size: 26rpx;
    }

    .tr-table--border {
        border-right: 1rpx #ddd solid;
    }

    .uni-table-tr {
        ::v-deep .uni-table-th {
            &.table--border:last-child {
                border-right: none;
            }
        }
        ::v-deep .uni-table-td {
            &.table--border:last-child {
                border-right: none;
            }
        }
    }




</style>
