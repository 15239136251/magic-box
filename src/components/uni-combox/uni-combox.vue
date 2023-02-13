<template>
	<view class="uni-combox" :class="{'border-0': isBorder }">
		<view v-if="label" class="uni-combox__label" :style="labelStyle">
			<text>{{label}}</text>
		</view>
		<view class="uni-combox__input-box">
			<input class="uni-combox__input" type="text" :disabled="disabled" :placeholder="placeholder" v-model="inputVal" @input="onInput"
			 @focus="onFocus" @blur="onBlur" />
			<uni-icons class="uni-combox__input-arrow" type="arrowdown" size="14" @click="toggleSelector" v-if="!inputVal"></uni-icons>
			<uni-icons class="uni-combox__input-arrow" type="clear" size="14" @click="clear" v-else></uni-icons>
			<view class="uni-combox__selector uni-combox__selector-bottom" v-if="showSelector" style="z-index: 999;">
				<scroll-view scroll-y="true" class="uni-combox__selector-scroll">
					<view class="uni-combox__selector-empty" v-if="filterCandidatesLength === 0">
						<text>{{emptyTips}}</text>
					</view>
					<view class="uni-combox__selector-item" v-for="(item,index) in filterCandidates" :key="index" @click="onSelectorClick(index)">
						<text>{{item[name]}}</text>
					</view>
				</scroll-view>
				<!-- <view class="py-2 px-10 flex items-center justify-between" v-if="this.bigCandidates.length">
					<view class="">
						<text @click="pre">上一页</text>
					</view>
					<view class="">
						<text @click="next">下一页</text>
					</view>
				</view> -->
			</view>
			<view class="uni-combox__selector uni-combox__selector-top" v-if="showSelector2" style="z-index: 999;">
				<scroll-view scroll-y="true" class="uni-combox__selector-scroll">
					<view class="uni-combox__selector-empty" v-if="filterCandidatesLength === 0">
						<text>{{emptyTips}}</text>
					</view>
					<view class="uni-combox__selector-item" v-for="(item,index) in filterCandidates" :key="index" @click="onSelectorClick(index)">
						<text>{{item[name]}}</text>
					</view>
				</scroll-view>
				<!-- <view class="py-2 px-10 flex items-center justify-between" v-if="this.bigCandidates.length">
					<view class="">
						<text @click="pre">上一页</text>
					</view>
					<view class="">
						<text @click="next">下一页</text>
					</view>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	import uniIcons from '../uni-icons/uni-icons.vue'
	import { bigArraySlice } from "@/utils/utils"
	export default {
		name: 'uniCombox',
		components: {
			uniIcons
		},
		props: {
			disabled: {
				type: Boolean,
				default: false
			},
			isBorder: {
				type: Boolean,
				default: false
			},
			label: {
				type: String,
				default: ''
			},
			labelWidth: {
				type: String,
				default: 'auto'
			},
			placeholder: {
				type: String,
				default: ''
			},
			candidates: {
				type: Array,
				default () {
					return []
				}
			},
			emptyTips: {
				type: String,
				default: '无匹配项'
			},
			value: {
				type: [String, Number],
				default: ''
			},
			type: {
				type: String,
				default: 'code'
			},
			name: {
				type: String,
				default: 'name'
			},
			remote: {
				type: Boolean,
				default: false
			},
			noFilter: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				showSelector: false,
				showSelector2: false,
				inputVal: '',
				listIndex: 0
			}
		},
		computed: {
			labelStyle() {
				if (this.labelWidth === 'auto') {
					return {}
				}
				return {
					width: this.labelWidth
				}
			},
			bigCandidates() {
				let list = []
				if (this.candidates.length > 200) {
					list = bigArraySlice(this.candidates, 200)
				}
				return list
			},
			filterCandidates() {
				if (this.noFilter || this.remote) return this.candidates
				if (this.bigCandidates.length) {
					if (this.inputVal) {
						let newList = this.getArray(this.bigCandidates, this.inputVal);
						return newList						
					} else {
						return this.bigCandidates[this.listIndex]
					}
				}
				let list = this.candidates.filter(candidate => {
					let type = candidate[this.type] + '';
					let name =  candidate[this.name] + '';
					if (!this.inputVal) this.inputVal = "";
					if (this.type == 'id') {
						return name.indexOf(this.inputVal) > -1
					} else {
						return JSON.stringify(type).indexOf(this.inputVal) > -1 || name.indexOf(this.inputVal) > -1
					}
				})
				return list
			},
			filterCandidatesLength() {
				return this.filterCandidates.length
			}
		},
		watch: {
			value: {
				handler(newVal) {
					let val = this.candidates.filter(data => data[this.type] == newVal)[0] || {};
					if (val[this.name]) {
						this.inputVal = val[this.name]
					} else {
						this.inputVal = this.value === -1 ? '' : this.value
					}	
				},
				immediate: true
			},
			candidates: {
				handler(newVal) {
					let val = this.candidates.filter(data => data[this.type] == this.value)[0] || {};
					if (val[this.name]) {
						this.inputVal = val[this.name]
					} else {
						this.inputVal = this.value === -1 ? '' : this.value
					}
				},
				immediate: true
			}
		},
		methods: {
			getTag() {
				const query = uni.createSelectorQuery().in(this);
				let that = this;
				query.select('.uni-combox').boundingClientRect(data => {
					console.log("得到布局位置信息" + JSON.stringify(data));
					console.log("节点离页面顶部的距离为" + data.top);
					if (data.top > 260) {
						console.log("下拉框在上面")
						this.showSelector2 = !this.showSelector2
					} else {
						// 下拉框在下面
						console.log("下拉框在下面")
						this.showSelector = !this.showSelector
					}
				}).exec();
			},
			toggleSelector() {
				if (this.disabled) return
				// this.showSelector = !this.showSelector
				console.log("this.showSelector", this.showSelector)
				this.getTag();
			},
			onFocus() {
				// this.showSelector = true;
				this.getTag();
			},
			onBlur() {
				setTimeout(() => {
					this.showSelector = false
					this.showSelector2 = false
				},50)
			},
			onSelectorClick(index) {
				let inputValue = this.filterCandidates[index][this.type]
				this.inputVal = this.filterCandidates[index][this.name]
				this.showSelector = false
				this.showSelector2 = false
				console.log("input -->", inputValue);
				this.$emit('input', inputValue)
			},
			onInput() {
				setTimeout(() => {
					this.$emit('input', this.inputVal)
				})
			},
			clear() {
				if (this.disabled) return
				this.inputVal = ""
				this.$emit('input', this.inputVal)
			},
			pre() {
				if (this.listIndex <= 0) {
					return uni.showToast({ title: "已经是第一页了", icon: "none"})
				}
				this.listIndex = this.listIndex - 1
			},
			next() {
				let num = this.bigCandidates.length
				if (this.listIndex < num) {
					this.listIndex = this.listIndex + 1
				} else {
					this.listIndex = num
					return uni.showToast({ title: "已经是最后一页了", icon: "none"})
				}
			},
			getArray(array, value) {
				let newArray = []
				array.forEach(arr => {
					let lists = arr.filter(list => {
						if (this.type == 'id') {
							return list[this.name].indexOf(value) > -1
						} else {
							return list[this.type].indexOf(value) > -1 || list[this.name].indexOf(value) > -1
						}
					})
					newArray = [...newArray, ...lists]
				})
				return newArray
			}
		}
	}
</script>

<style lang="scss" scoped>
	.uni-combox {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		height: 60rpx;
		flex-direction: row;
		align-items: center;
		border: solid 1px #DDDDDD;
		padding-left: 10rpx;
	}

	.uni-combox__label {
		font-size: 26rpx;
		line-height: 22px;
		padding-right: 10px;
		color: #999999;
	}

	.uni-combox__input-box {
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex: 1;
		flex-direction: row;
		align-items: center;
	}

	.uni-combox__input {
		flex: 1;
		font-size: 26rpx;
		height: 22rpx;
		line-height: 22rpx;
	}

	.uni-combox__input-arrow {
		padding: 10px;
	}

	.uni-combox__selector {
		box-sizing: border-box;
		// position: absolute;
		// top: 42px;
		// left: 0;
		width: 100%;
		background-color: #FFFFFF;
		border-radius: 6px;
		box-shadow: #DDDDDD 4px 4px 8px, #DDDDDD -4px -4px 8px;
		z-index: 2;
	}

	.uni-combox__selector-scroll {
		max-height: 200px;
		box-sizing: border-box;
	}
	
	.uni-combox__selector-bottom {
		position: absolute;
		top: 42px;
		left: 0;
	}
	
	.uni-combox__selector-bottom::before {
		content: '';
		position: absolute;
		width: 0;
		height: 0;
		border-bottom: solid 6px #FFFFFF;
		border-right: solid 6px transparent;
		border-left: solid 6px transparent;
		left: 50%;
		top: -6px;
		margin-left: -6px;
	}
	
	.uni-combox__selector-top {
		position: absolute;
		bottom: 42px;
		left: 0;
	}

	.uni-combox__selector-top::before {
		content: '';
		position: absolute;
		width: 0;
		height: 0;
		border-top: solid 6px #FFFFFF;
		border-right: solid 6px transparent;
		border-left: solid 6px transparent;
		left: 50%;
		top: 73px;
		margin-left: -6px;
	}

	.uni-combox__selector-empty,
	.uni-combox__selector-item {
		/* #ifdef APP-NVUE */
		display: flex;
		/* #endif */
		line-height: 36px;
		font-size: 26rpx;
		text-align: center;
		border-bottom: solid 1px #DDDDDD;
		margin: 0px 10px;
	}

	.uni-combox__selector-empty:last-child,
	.uni-combox__selector-item:last-child {
		border-bottom: none;
	}
	
	.uni-icon {
	    font-family: uniicons;
	    font-size: 24px;
	    font-weight: normal;
	    font-style: normal;
	    width: 24px;
	    height: 24px;
	    line-height: 24px;
	    color: #999999;
	}
</style>
