<template>
	<view class="date-tag-picker">
		<view class="date-tag-picker-content">
			<view class="date-tag-picker-content_tag" :class="{isActive : day.isActive}" v-for="day in days" :key="day.id" @click="onChange(day.id)">
				<text>{{ day.name }}</text>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	import { getDate, getDateDay, getDateMonth } from '@/utils/utils'
	export default {
		name:"date-tag-picker",
		data() {
			return {
				days: [{
					id: 0,
					name: "今日",
					isActive: true
				}, {
					id: 1,
					name: "昨日",
					isActive: false
				}, {
					id: 2,
					name: "本周",
					isActive: false
				}, {
					id: 3,
					name: "上周",
					isActive: false
				}, {
					id: 4,
					name: "本月",
					isActive: false
				}, {
					id: 5,
					name: "上月",
					isActive: false
				}]
			};
		},
		methods: {
			onChange(id: number) {
				this.days.forEach(day => day.id == id ? day.isActive = true : day.isActive = false);
				let value = [getDate(), getDate()];
				let type = "day";
				switch (id){
					case 1:
						value = [getDate(1), getDate(1)]
						type = 'yesterday'
						break
					case 2:
						value = [getDateDay(0), getDateDay(-6)]
						type = 'week';
						break
					case 3:
						value = [getDateDay(7), getDateDay(1)]
						type = 'last_week'
						break
					case 4:
						value = getDateMonth()
						type = 'month'
						break
					case 5:
						value = getDateMonth(true)
						type = 'last_month'
						break
					default:
						break
				}
				const data = {
					index: id,
					type,
					value
				}
				console.log("🚀 ~ file: date-tag-picker.vue:78 ~ onChange ~ data", data)
				this.$emit('change', data);
			}
		},
	}
</script>

<style lang="scss">
.date-tag-picker {
	width: 100%;
	.date-tag-picker-content {
		display: flex;
		&_tag {
			text-align: center;
			flex: 1;
			background-color: #F3F4F6;
			margin-right:2px;
			padding: 4px 0;
		}
		&_tag:last-child {
			margin-right: 0;
		}
	}
}
.isActive {
	border: 2px solid red;
	margin-right: 0;
}
</style>
