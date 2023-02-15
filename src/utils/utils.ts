import uniStorage from "./uniStorage";
// 拿到当前日期 yyyymmdd
export const getDate = (last?: boolean | number) => {
	let date = new Date();
	if (last === true) {
		date = new Date(date.getTime() - 168 * 60 * 60 * 1000);
	} else if (typeof(last) === 'number') {
		date = new Date(date.getTime() - (last * 24) * 60 * 60 * 1000);
	}
	let year = date.getFullYear();
	let month: number | string = date.getMonth() + 1;
	let day: number | string = date.getDate();

	month = month > 9 ? month : '0' + month;;
	day = day > 9 ? day : '0' + day;

	return `${year}${month}${day}`;
}

// 拿到本周，上周 日期 yyyymmdd
export const getDateDay = (n: number) => {
	let now = new Date();
	let year = now.getFullYear();
	let month: number | string = now.getMonth() + 1;
	let date: number | string = now.getDate();
	let day = now.getDay();
	//判断是否为周日,如果不是的话,就让今天的day-1(例如星期二就是2-1)
	if (day !== 0) {
		n = n + (day - 1)
	} else {
		n = n + day
	}
	if (day) {
		//这个判断是为了解决跨年的问题
		if (month > 1) {
			month = month;
		}
		//这个判断是为了解决跨年的问题,月份是从0开始的
		else {
			year = year - 1;
			month = 12;
		}
	}
	now.setDate(now.getDate() - n);
	year = now.getFullYear();
	month = now.getMonth() + 1;
	date = now.getDate();
	month = month > 9 ? month : '0' + month;;
	date = date > 9 ? date : '0' + date;
	return `${year}${month}${date}`;
}

// 拿到本月,上月日期
export const getDateMonth = (last?: boolean) => {
	let now = new Date();
	let year = now.getFullYear();
	let month = now.getMonth() + 1;
	if (last) {
		month = Math.abs(month -1);
		if (month == 0) {
			month = 12
			year = Number(year) - 1
		}
	}
	const isLeapYear = ((year % 4) == 0) && ((year % 100) != 0) || ((year % 400) == 0)
	const maxDays = [1, 3, 5, 7, 8, 10, 12]
	const middleDays = [4, 6, 9, 11]
	let newMonth = month > 9 ? month : '0' + month;
	let lastDay = 31;
	if (month == 2) lastDay = isLeapYear ? 29 : 28
		else if (maxDays.includes(month)) lastDay = 31
			else if (middleDays.includes(month)) lastDay = 30
	return [`${year}${newMonth}01`, `${year}${newMonth}${lastDay}`]
}

// 将数组分割
export const bigArraySlice = (array: object[], size: number) => {
	const arrNum = Math.ceil(array.length / size)
	let index = 0
	let resIndex = 0
	let result = []
	while (index < arrNum) {
		result[index] = array.slice(resIndex, size + resIndex)
		resIndex += size
		index++
	}
	return result
}

// 双击
var touchStartTime = 0
export const dbClick = (fnc: Function, params?: any) => {
	const _now = new Date().getTime()
	if (_now - touchStartTime <= 300) {
		fnc(params)
	} else {
		touchStartTime = _now
	}
}

// 根据某个字段来去重
export const getFilterArray = (arr: any, key = 'id') => {
	let map = new Map()
	for (let item of arr) {
		if (!map.has(item[key])) {
			map.set(item[key], item);
		}
	}
	return [...map.values()]
}

// 生成单据编码
export const updateOrderNo = (prefix = "S") => {
	const date = getDate()
	const newDate = date.substring(date.length - 6)
	const storeId: any = uniStorage.getItem('logininfo')
	const orderNo = uniStorage.getItem('deviceno')
	const deviceType = uniStorage.getItem('devicetype')
	// 获得当前单据的流水号
	function getSerialNum() {
		let count = Number(uniStorage.getItem('serialnum') || 1)
		// 得到本地存储的日期，来判断是否重置流水号
		const storeDate = uniStorage.getItem('serialdate')
		/* 如果当前日期与本地储存日期不一致，则重置，并将本地储存日期改为当前日期
		   如果等于则加一 */
		if (storeDate != date) {
			count = 1;
			uniStorage.setItem('serialdate', date)
		} else if (storeDate == date) {
			count = count + 1;
		}
		// 将修改后的流水号存到本地
		uniStorage.setItem('serialnum', count + '')
		// 如果count长度低于三位数则补零，超过则返回原值
		let str = count < 1000 ? (Array(3).join("0") + count).slice(-3) : count;
		return str;
	}
	let num = getSerialNum()
	console.log("🚀 ~ file: utils.ts:141 ~ updateOrderNo ~ num", num)
	return `${prefix}${newDate}${storeId.store_id}${orderNo}${deviceType}${num}`
}

// 随机数字 默认 6 位
export const getRandomNumber = (step: number = 6) => {
	const max = Number(new Array(step).fill(9).join(''))
	const index = Number('1' + new Array(step - 1).fill(0).join(''))
	return Math.floor(Math.random()*(max-index))+index
}

/* 超出部分改为省略 */
export const txtSlice = (string: string, step: number) => {
	if (string.length < step) return string
	return string.slice(0, step) + '...'
}

// 计算小数点后面有几位小数
export const loanRate = (num: number) => {
	let x = String(num).indexOf('.') + 1;
	let y = String(num).length - x;
	return y;
};

// 保留小数
export const toFixed = (value: string | number, num = 2) => {
	let _value = Number(value)
	return Number(_value.toFixed(num))
}

// 取整到角
export const roundToCorner = (value: string | number) => {
	return toFixed(value, 1)
}

// 取整到元
export const roundToYuan = (value: string | number) => {
	return toFixed(value, 0)
}