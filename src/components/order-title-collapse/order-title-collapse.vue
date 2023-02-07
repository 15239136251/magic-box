<template>
	<view class="order-title-collapse" :style="collapseStyle">
		<view class="order-title-collapse-content">
			<slot></slot>
		</view>
		<view class="order-title-collapse-bottom" @click="collapseClick">
			<text>{{ openName }}</text>
		</view>
	</view>
</template>

<script lang="ts">
	export default {
		name:"order-title-collapse",
		props: {
			minHeight: {
				type: Number,
				default: 50
			},
		},
		computed: {
			openName(): string {
				return this.open ? '收起' : '展开'; 
			}
		},
		data() {
			return {
				collapseStyle: {
					
				},
				open: true
			};
		},
		methods: {
			collapseClick() {
				this.open = !this.open;
				if (this.open) {
					this.collapseStyle = {}
				} else {
					this.collapseStyle = {
						height: this.minHeight + 'px',
						overflow: "hidden"
					}
				}
			}
		},
	}
</script>

<style lang="scss">
.order-title-collapse {
	position: relative;
	.order-title-collapse-content {
		height: 100%;
		background-color: white;
	}
	.order-title-collapse-bottom {
		width: 50rpx;
		height: 50rpx;
		background-color: white;
		text-align: center;
		line-height: 50rpx;
		font-size: 24rpx;
		color: #007AFF;
		z-index: 10;
		position: absolute;
		top: 5rpx;
		right: 20rpx;
		border-radius: 50%;
		padding: 10px;
		border: 1px solid #DCDCDC;
	}
}
</style>
