// stores/bill.js
import { defineStore } from 'pinia'
import uniStorage from '@/utils/uniStorage'
import { CommonData, BillItem, DealMarketing, HangList, Vip } from '@/utils/interface'
import REQ from '@/utils/http_wx'
import { getDate, getFilterArray, updateOrderNo, txtSlice, loanRate, toFixed } from '@/utils/utils'
import { showModal, showToast } from '@/utils/interactions'
import { $goto } from '@/utils/navigate'
import { debounce } from '@/utils/debounce'
import { deal_marketing, defaultMarketingRetail } from '@/utils/marketing'
import { useBillrSettleStore } from './bill-settle'

export const useBillStore = defineStore('bill', {
	state: () => {
		const commonlist: CommonData[] = []
		const items: BillItem[] = []
		const hanglist: HangList[] = []
		const vip: Vip = {
			id: -1,
			name: '-',
			price: 0,
			cardno: '',
			integral: 0
		}
		const obj: any = {}
		const arr: any = []
		const employeeIds: number[] = JSON.parse(uniStorage.getItem('employeeIds') || '[]') || []
		const itemEmployeeIds: number[] = []
		const retailtypelist: { name: string, code: string }[] = []
		const viptypelist: { id: number, name: string, code: string }[] = []
		return {
			/* 开单界面 */
			routerValue: obj,
			isOpenEmployee: false,
			employeeIds: employeeIds,
			employeeList: commonlist,
			isOpenHangReason: false,
			isOpenHangList: false,
			hanglist: hanglist,
			hangSelectId: -1,
			hangReasonValue: '',
			isOpenRetailType: false,
			retailtypelist: retailtypelist,
			retailtypecode: '',
			vip: vip,
			vipDialogValue: vip,
			vipPhone: '',
			isOpenVipDialog: false,
			isOpenVipAddDialog: false,
			addVipData: {
				birthday: getDate(),
				phone: '',
				type_id: -1 || '',
				empid: -1 || '',
				name: '',
				sex: '男'
			},
			viptypelist: viptypelist,
			items: items,
			sunItemId: 1,
			activityItems: [...arr],
			ticketItems: [...arr],
			integralDis: {...obj},
			totDisAmount: 0,
			freight: 0,
			giftTypes: ['商品满赠', '全场满赠'],
			giftDetail: {
				qty: 1,
				name: '',
				list: [...arr],
				selectlist: [...arr],
				old_selectlist: [...arr]
			},
			isOpenGiftDialog: false,
			isOpenItemEmployee: false,
			itemEmployeeIds: itemEmployeeIds,
			itemEmployeeKey: '',
			description: '',
			isOpenDescription: false,
			isOpenAmtDetail: false
		}
	},
	actions: {
		init() {
			const retailType = JSON.parse(uniStorage.getItem('retailtype') || '{}')
			if (retailType) {
				retailType.date != getDate() ? uniStorage.removeItem('retailtype') : this.retailtypecode = retailType.value
			}
			if (this.o2oEnable) {}
		},
		reset() {
			this.vip = {
				id: -1,
				name: '-',
				cardno: '',
				price: 0,
				integral: 0
			}
			this.items = []
			this.sunItemId = 1
			this.description = ''
		},
		newBill(func?: Function) {
			let that = this
			uni.showModal({
				title: '开新单',
				content: '是否删除当前单据明细?',
				success: function (res) {
					if (res.confirm) {
						console.log('用户点击确定')
						that.reset()
						if (func) func()
					} else if (res.cancel) {
						console.log('用户点击取消')
					}
				},
				fail: function (err) {
					console.log('模糊弹窗失败', err)
				}
			})
		},
		openEmployee() {
			this.isOpenEmployee = true
		},
		closeEmployee() {
			this.isOpenEmployee = false
		},
		employeeSave(ids: number[]) {
			this.employeeIds = ids
			uniStorage.setItem('employeeIds', JSON.stringify(this.employeeIds))
		},
		openHang() {
			if (this.items.length) {
				this.isOpenHangReason = true
			} else {
				const hanglist = uniStorage.getItem('bill-hanglist')
				if (hanglist) this.hanglist = JSON.parse(hanglist)
				this.isOpenHangList = true
			}
		},
		hangReasonInput(e: any) {
			this.hangReasonValue = e.detail.value
		},
		hangReasonSave() {
			const hangid = uniStorage.getItem('hangid')
			const hangdate = uniStorage.getItem('hangdate')
			const hanglist = uniStorage.getItem('bill-hanglist')
			const billdate = getDate()
			let newHanglist = []
			let newHangId = Number(hangid)
			/* 如果当前日期与本地缓存的不同，则重置挂单id */
			if (billdate !== hangdate) {
				newHangId = 0
				uniStorage.setItem('hangid', (newHangId + 1) + '')
				uniStorage.setItem('billdate', billdate)
			}
			/* 过滤掉非当天的挂单列表 */
			if (hanglist) {
				newHanglist = JSON.parse(hanglist).filter((hang: { billdate: string }) => hang.billdate === billdate)
			}
			const value = {
				id: newHangId + 1,
				vip: this.vip,
				employeeId: this.employeeIds,
				description: this.hangReasonValue,
				items: this.items,
				tot_qty: this.totQty,
				tot_amt: this.totAmt,
				docno: this.vip.cardno,
				billdate
			}
			newHanglist.push(value)
			/* 替换本地缓存 */
			uniStorage.setItem('bill-hanglist', JSON.stringify(newHanglist))
			this.reset()
			this.closeHang()
		},
		hanglistSave() {
			const value = this.hanglist.filter(hang => hang.id === this.hangSelectId)
			const { vip, employeeId, items } = value[0]
			this.vip = vip || this.vip
			this.employeeIds = employeeId
			this.items = items
			/* 去除已选的挂单 */
			const newlist = this.hanglist.filter(hang => hang.id !== this.hangSelectId)
			uniStorage.setItem('bill-hanglist', JSON.stringify(newlist))
			this.closeHang()
		},
		closeHang() {
			this.isOpenHangReason = false
			this.isOpenHangList = false
		},
		openRetailType() {
			this.isOpenRetailType = true
		},
		closeRetailType() {
			this.isOpenRetailType = false
		},
		retailTypeChange(e: any) {
			console.log("🚀 ~ file: ret-no-original-order.ts:168 ~ retailTypeChange ~ e", e)
			this.retailtypecode = e.code
			const data = {
				value: this.retailtypecode,
				date: getDate()
			}
			uniStorage.setItem('retailtype', JSON.stringify(data))
			this.closeRetailType()
		},
		openVipDialog() {
			this.vipDialogValue = {
				id: -1,
				type: '',
				cardno: '',
				name: '',
				type_name: '',
				birthday: '',
				integral: 0,
				price: 0,
				amount: 0
			}
			this.vipPhone = ''
			this.isOpenVipDialog = true
		},
		vipScan() {
			// #ifdef H5
			return uni.showToast({ title: "H5页面只支持手工输入", icon: "none" })
			// #endif
			let that = this;
			uni.scanCode({
				scanType: ['barCode'],
				success: function (res) {
					console.log('条码类型：' + res.scanType);
					console.log('条码内容：' + res.result);
					that.vipPhone = res.result
					that.vipSearch(true)
				}
			})
		},
		vipPhoneInput(e: string) {
			this.vipPhone = e
		},
		vipSearch(route = false) {
			if (!this.vipPhone) return showToast('请输入需要查询的卡号', 'none')
			REQ({
				url: 'pos/vip/list',
				method: 'POST',
				data: { name: this.vipPhone }
			}).then((res: any) => {
				const { data } = res
				if (data.length === 0) {
					showToast('没有符合该条件的会员', 'none')
				} else {
					if (route) this.vip = res.data[0]
					else this.vipDialogValue = res.data[0]
					this.vipPhone = ''
				}
			})
		},
		closeVipDialog() {
			this.isOpenVipDialog = false
		},
		async vipDialogSave() {
			if (this.vipDialogValue.id) {
				this.vip = this.vipDialogValue
				const vipIntegral: any = await REQ({
					url: 'pos/dy/load_vipintegralmin/func',
					method: 'POST',
					data: { vipId: this.vip.id}
				})
				this.vip = {
					...this.vip,
					...vipIntegral.data,
					dimitems: vipIntegral.data.dimitem
				}
				console.log("🚀 ~ file: bill.ts:271 ~ vipDialogSave ~ this.vip", this.vip)
				if (this.items.length) this.dealMarketing()
			}
			this.closeVipDialog()
		},
		openVipAddDialog() {
			if (this.viptypelist.length === 0) this.getVipTypeList()
			this.isOpenVipAddDialog = true
		},
		closeVipAddDialog() {
			this.addVipData = {
				birthday: getDate(),
				phone: '',
				type_id: -1,
				empid: -1,
				name: '',
				sex: '男'
			}
			this.isOpenVipAddDialog = false
		},
		vipBirthdayChange(e: string) {
			this.addVipData.birthday = e
		},
		vipSexChange(e: any) {
			this.addVipData.sex = e.detail.value
		},
		vipTypeIdChange(e: number) {
			console.log("🚀 ~ file: bill.ts:270 ~ vipTypeIdChange ~ e", e)
			this.addVipData.type_id = e
		},
		vipEmpIdChange(e: number) {
			this.addVipData.empid = e
		},
		vipAddDialogCheck() {
			let msg = ''
			const { name, phone, type_id, empid } = this.addVipData
			if (name === '' || !name) {
				msg = '会员名称未填写'
			} else if (phone === '' || !phone) {
				msg = '会员手机号未填写'
			} else if (type_id === -1 || !type_id) {
				msg = '会员卡类型未选择'
			} else if (empid === -1 || !empid) {
				msg = '开卡人未选择'
			}
			return msg
		},
		vipAddDialogSave() {
			const errMsg = this.vipAddDialogCheck()
			if (errMsg) return showToast(errMsg, 'none')
			const data = {
				id: -1,
				main: {
					...this.addVipData
				}
			}
			REQ({
				url: 'pos/dy/vip/curd',
				method: 'POST',
				data
			}).then(_ => {
				this.vipPhone = this.addVipData.phone
				this.vipSearch()
				this.closeVipAddDialog()
			})
		},
		getVipTypeList() {
			REQ({
				url: 'pos/dy/viptype/list',
				method: 'POST'
			}).then((res: any) => {
				this.viptypelist = res.data
			})
		},
		searchInput(e: any) {
			const data = e
			const noPush = this.items.some(item => {
				if (item.no === data.no) {
					item.qty = item.qty + 1
					this.dealMarketing()
					return true
				}
				return false
			})
			if (!noPush) this.addItem(data)
		},
		addItem(data: BillItem) {
			this.sunItemId = this.sunItemId + 1
			REQ({
				url: 'pos/stock',
				method: 'POST',
				data: { name: data.no }
			}).then((res: any) => {
				let item = {
					...data,
					qty: 1,
					isO2o: 'N',
					qtyCan: res.data.qty,
					id: this.sunItemId,
					empids: this.employeeIds,
					old_pricelist: data.pricelist
				}
				if (item.qtyCan <= 0) {
					const content = '当前条码库存不足' + (this.o2oEnable ? '，是否云仓下单' : '')
					const cancelText = this.o2oEnable ? '正常零售' : '取消'
					const confirmText = this.o2oEnable ? '云仓下单' : '正常零售'
					let that = this
					return uni.showModal({
						content,
						cancelText,
						confirmText,
						success:function(res){
							if (res.confirm) {
								console.log('用户点击确定', confirmText)
								if (that.o2oEnable) {
									item['isO2o'] = 'Y'
								} else {
									that.pdtinfoQuery(item)
								}
							} else if (res.cancel) {
								console.log('用户点击正常零售', cancelText)
							}
							if (that.o2oEnable) that.pdtinfoQuery(item)
						}
					})
				}
				this.pdtinfoQuery(item)
			})
		},
		pdtinfoQuery(item: any) {
			const { name } = item
			let _item = {...item}
			REQ({
				url: 'pos/dy/load_pdtinfo/func',
				method: 'POST',
				data: { name }
			}).then((res: any) => {
				_item.dims = res.data.dims
				this.items.push(_item)
				this.sunItemId = this.sunItemId + 1
				this.dealMarketing()
			})
		},
		dealMarketing() {
			const logininfo: any = uniStorage.getItem('logininfo')
			let totAmount = 0
			let totQty = 0
			let items = this.items.filter(item => item.isGift != 'Y')
			const _items = items.map(item => {
				totQty = totQty + Number(item.qty)
				totAmount = totAmount + (Number(item['old_pricelist'] || item.pricelist) * item.qty)
				return {
					good: {
						spuCode: item.name,
						skuCode: item.no,
						dims: item.dims || []
					},
					qty: item.qty,
					price: item.old_pricelist,
					subDocno: item.id
				}
			})
			let value = {
				...defaultMarketingRetail(),
				storeCode: logininfo["store_code"],
				totQty: totQty,
				totAmount: totAmount,
				totActAmount: 0, // 实际金额
				totDisAmount: 0, // 折扣金额
				totVipDisAmount: 0, //会员优惠
				items: _items,
				vip: this.vip.id !== -1 ? this.vip : null,
				employee: this.employeeIds
			}
			uniStorage.setItem('deal_marketing', JSON.stringify(value))
			deal_marketing(value).then((res: any) => {
				this.setValue(res)
			})
		},
		setValue(value: any) {
			const { activityItems = [], ticketItems = [], items, integralDis, tot_disamount, freight } = value
			this.activityItems = activityItems,
			this.ticketItems = ticketItems[0] ? [ticketItems[0]] : []
			this.integralDis = integralDis
			this.totDisAmount = tot_disamount
			this.freight = freight
			// 处理 items
			this.items = this.items.map(item => {
				const _value = items.find((_item: any) => _item.good.skuCode === item.no)
				if (!_value) return item
				// item.old_pricelist = _value.price;
				item.pricelist = _value.actPrice
				item.discount = _value.discount
				item.vipDisAmount = _value.vipDisAmount //促销-会员卡优惠金额
				item.activityDisAmt = _value.activityDisAmount //促销-优惠金额
				item.ticketDisAmt = _value.ticketDisAmount //促销-优惠券分摊金额（运费券优惠金额不分摊）
				item.integralDisAmt = _value.vipIntegralDisAmount  //促销-会员积分抵现分摊金额
				return item
			})
			/* 处理赠品数据 */
			this.giftValueChange()
		},
		giftValueChange() {
			let activityNames: any = []
			this.activityItems.forEach(item => {
				if (this.giftTypes.includes(item.activityType)) {
					activityNames.push({
						name: item.activityName,
						giftItem: item.giftItem
					})
				}
			})
			/* 如果没有满赠活动就清空所有已选赠品 */
			if (activityNames.length === 0) this.delGiftItems()
			/* 如果有满赠活动，就判断当前活动是否已选赠品 */
			for(let i = 0; i < activityNames.length; i++) {
				const { name, giftItem } = activityNames[i]
				const gift = this.items.filter(item => item.isGift === 'Y' && item.activityName === name)
				const skus = giftItem.giftSkuCode.split(',')
				/* 有赠品 判断条码是否对照，不一致就删除*/
				if (gift.length) {
					const no = gift[0].no
					let isDel = skus.includes(no)
					if (isDel) {
						this.items = this.items.filter(item => item.isGift !== 'Y' && item.no !== no)
					}
				} else {
					/* 如果赠品只有一个就新增进去 */
					if (skus.length === 1) {
						let params = {
							skus,
							name: name, 
							qty: giftItem.giftQty
						}
						this.giftDirectlyAdd(params)
					}
				}
			}
		},
		delGiftItems() {
			this.items = this.items.filter(item => item.isGift !== 'Y')
		},
		giftDirectlyAdd(data: {skus: string[], name: string, qty: number}) {
			const { skus, name, qty } = data
			REQ({
				url: 'pos/dy/sku_info/list',
				method: 'POST',
				data: {skus}
			}).then((res: any) => {
				this.giftDetail.list = res.data
				this.giftDetail.qty = qty
				this.giftDetail.name = name
				this.giftDetail.selectlist = res.data
				this.giftDetail.old_selectlist = []
				this.giftDialogSave()
			})
		},
		openGiftDialog(gift: {item: any, name: string, selecItems: BillItem[]}) {
			const { name, item:_item, selecItems } = gift
			const { giftSkuCode, giftQty } = _item
			const skus = giftSkuCode.split(',')
			this.getGiftInfo({ skus, name, qty: giftQty, selecItems})
			this.isOpenGiftDialog = true
		},
		closeGiftDialog() {
			this.giftDetail = {
				qty: 1,
				name: '',
				list: [],
				selectlist: [],
				old_selectlist: []
			}
			this.isOpenGiftDialog = false
		},
		getGiftInfo(data: {skus: string[], name: string, qty: number, selecItems: BillItem[]}) {
			const { skus, name, qty, selecItems } = data
			REQ({
				url: 'pos/dy/sku_info/list',
				method: 'POST',
				data: { skus }
			}).then((res: any) => {
				this.giftDetail.list = res.data
				this.giftDetail.qty = qty
				this.giftDetail.name = name
				const nos = selecItems.map(item => { return item.no })
				this.giftDetail.selectlist = nos
				this.giftDetail.old_selectlist = nos
			})
		},
		giftChange(e: any) {
			this.giftDetail.selectlist = e.detail.value
		},
		giftDialogSave() {
			const { qty, selectlist, name, list, old_selectlist } = this.giftDetail
			if (selectlist.length > qty) return showModal('提示',`当前赠品选择数量大于可选数量，可选：${qty} 件`, false)
			let _items = list.filter(item => selectlist.includes(item.no))
			_items = _items.map(item => {
				this.sunItemId = this.sunItemId + 1
				return {
					...item,
					pricelist: 0,
					old_pricelist: 0,
					isGift: 'Y',
					empids: this.employeeIds,
					qty: 1,
					qtyCan: 1,
					id: this.sunItemId,
					activityName: name
				}
			})
			/* 如果之前选择有赠品则清空 */
			this.items = this.items.filter(item => !old_selectlist.includes(item.no))
			this.items = [...this.items, ..._items]
			this.closeGiftDialog()
		},
		isSelectActivity(item: BillItem) {
			return item.selecItems.length !== 0
		},
		delItem(e: { item: BillItem, index: number }) {
			let that = this
			uni.showModal({
				content: "是否要删除明细?",
				success: function (res) {
					if (res.confirm) {
						console.log('用户点击确定');
						const { index, item } = e
						that.items = that.items.filter((_item, _index) => _index != index)
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			})
		},
		inputnumberChange(e: string, item: BillItem) {
			console.log("e", e)
			console.log("item", item)
			const index = this.items.findIndex(_item => _item.id === item.id)
			this.items[index]['qty'] = Number(e)
			if (this.items[index]['qty'] === 0) {
				this.items = this.items.filter(item => item.qty !== 0);
			}
			if (Number(e) !== 0) this.dealMarketing()
		},
		itemInput(e: any, item: BillItem) {
			const { value } = e.detail
			debounce(() => {
				const index = this.items.findIndex(_item => _item.id === item.id)
				this.items[index]['pricelist'] = Number(value)
				this.items[index]['old_pricelist'] = Number(value)
			})
		},
		openItemEmployee(e: { item: BillItem }) {
			console.log("🚀 ~ file: ret-no-original-order.ts:281 ~ openItemEmployee ~ e", e)
			this.isOpenItemEmployee = true
			this.itemEmployeeKey = e.item.no || ''
			this.itemEmployeeIds = e.item.empids || []
		},
		closeItemEmployee() {
			this.isOpenItemEmployee = false
		},
		itemEmployeeSave(ids: number[]) {
			this.itemEmployeeIds = ids
			this.items.some(item => {
				if (item.no === this.itemEmployeeKey) {
					item.empids = this.itemEmployeeIds
					return true
				}
				return false
			})
			console.log("🚀 ~ file: ret-no-original-order.ts:304 ~ itemEmployeeSave ~ this.items", this.items)
			this.closeItemEmployee()
		},
		openDescription() {
			this.isOpenDescription = true
		},
		descriptionInput(e: any) {
			this.description = e.detail.value
		},
		closeDescription() {
			this.isOpenDescription = false
		},
		descriptionSave() {
			this.closeDescription()
		},
		openAmtDetail() {
			this.isOpenAmtDetail = true
		},
		closeAmtDetail() {
			this.isOpenAmtDetail = false
		},
		billtxtSlice(name: string, no: string, step: number) {
			const string = `${name || ''}(${no || ''})`
			return txtSlice(string, step)
		},
		isSelectGift() {
			return this.activityItemList.length !== 0 && this.activityItemList.find(item => {
			    return item.isActivity === 'Y' && item.selecItems.length === 0
			})
		},
		to() {
			const isOpenGiftDialog = this.isSelectGift()
			console.log("🚀 ~ file: bill.ts:674 ~ to ~ isOpenGiftDialog", isOpenGiftDialog)
			let that = this
			if (isOpenGiftDialog) return uni.showModal({
				content: '有未选择的赠品，是否返回选择',
				cancelText: '返回',
				confirmText: '前往收银',
				success: function(res){
					if (res.confirm) {
						console.log('用户点击确定');
						that.gotoPage();
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				},
				fail: function(err) {
					console.log("模糊弹窗失败", err);
				}
			})
			this.gotoPage()
		},
		gotoPage() {
			const { items, vip, description, totQty, totAmt, employeeIds, retailtypecode, activityItems, ticketItems, integralDis, totDisAmount, freight } = this
			if (employeeIds.length === 0) return showToast('请选择营业员', 'none')
			if (retailtypecode === '') return showToast('请选择零售类型', 'none')
			if (items.length === 0) return showToast('请录入明细', 'none')
			const iso2o = this.items.find(item => {
			    return item.isO2o == 'Y'
			})
			if (iso2o) {
				/* 有云仓下单 */
				console.log('需要填写地址')
				return
			}
			const orderno = updateOrderNo()
			const value = {
				vip,
				items,
				description,
				totQty,
				totAmt,
				orderno,
				activityItems,
				ticketItems,
				integralDis,
				totDisAmount,
				freight,
				employeeIds,
				vipid: vip.id,
				billdate: getDate(),
				address: '',
				doctype: retailtypecode
			}
			const billSettle = useBillrSettleStore()
			billSettle.init(value)
			$goto({
				url: '/pages/billSettle/billSettle'
			}, true)
		},
		getEmployeeList() {
			this.employeeList = [] 
			REQ({
				url: 'pos/emp/list',
				method: 'POST'
			}).then((res: any) => {
				this.employeeList = getFilterArray([...res.data])
			})
		},
		getRetailTypeList() {
			this.retailtypelist = []
			REQ({
				url: 'pos/select/list',
				method: 'POST',
				data: { name: "RETAILBILLTYPE" }
			}).then((res: any) => {
				let list: { code: string, name: string }[] = []
				if (this.retailTypes.length === 0) {
					list = res.data.map((item: { value: string, description: string }) => {
						return {
							name: item.description,
							code: item.value
						}
					})
				} else {
					res.data.forEach((item: { value: string, description: string }) => {
						if (this.retailTypes.includes(item.value)) {
							list.push({
								name: item.description,
								code: item.value
							})
						}
					})
				}
				this.retailtypelist = list
			})
		}
	},
	getters: {
		employeeName(): string {
			const employee = this.employeeList.filter(employee => employee.id === this.employeeIds[0])
			return employee[0] ? employee[0].name : '营业员'
		},
		totQty() {
			let qty = 0
			this.items.forEach(item => qty = qty + Number(item.qty))
			return qty
		},
		totAmt() {
			let amt = 0
			this.items.forEach(item => amt = amt + Number(item.pricelist * item.qty))
			return Math.floor(amt * 100) / 100
		},
		retailTypes() {
			let filters = JSON.parse(uniStorage.getItem('params') || '{}').retailType
			let value = filters ? filters.split(',') : []
			value = value.filter((_val: any) => _val !== '')
			return value
		},
		retailTypeName(): string {
			const retailtype = this.retailtypelist.find(type => type.code === this.retailtypecode)
			return retailtype ? retailtype.name : '零售类型'
		},
		o2oEnable() {
			let params = JSON.parse(uniStorage.getItem('params') || '{}')
			const enable = params['o2o.enable']
			return enable === 'Y'
		},
		/* 通过优惠活动来过滤明细列表 */
		activityItemList() {
			let _activityItems: any[] = []
			let _ids: number[] = []
			this.activityItems.forEach((item) => {
				if (!this.giftTypes.includes(item.activityType)) return
				const subDocnos: number[] = item.goodItems.map((_item: {subDocno: string | number}) => { return Number(_item.subDocno) })
				let children: BillItem[] = []
				children = this.items.filter(_item => {
					if (item.activityType === '全场满赠') {
						return (subDocnos.includes(_item.id) && !_ids.includes(_item.id)) || _item.activityName === item.activityName
					}
					return subDocnos.includes(_item.id) || (_item.activityName === item.activityName)
				})
				_ids.push(...subDocnos)
				let giftIds: number[] = []
				let selecItems: BillItem[] = []
				children.forEach(_item => {
					if (_item.isGift === 'Y') {
						giftIds.push(_item.id)
						selecItems.push(_item)
					}
				})
				const value = {
					isActivity: 'Y',
					activityName: item.activityName,
					activityType: item.activityType,
					activityNo: item.activityNo,
					giftItem: item.giftItem,
					selecItems,
					subDocnos,
					children
				}
				_ids.push(...giftIds)
				_activityItems.push(value)
			})
			let list: BillItem[] = this.items.filter(_item => !_ids.includes(_item.id))
			list.push(..._activityItems)
			return list
		},
		// 商品总价
		totOldAmt() {
			let amt = 0;
			this.items.forEach(item => {
				amt = amt + Number(item.old_pricelist * item.qty)
			})
			let length = loanRate(amt)
			return length > 2 ? Math.floor( amt* 100) / 100 : amt
		},
		totAmtDiscount() {
			let integral = this.vipIntegralDisAmount ? Number(this.vipIntegralDisAmount) : 0
			const _activityAmt: number = this.activityAmt
			const _ticketAmt: number = this.ticketAmt
			const amt = _activityAmt + _ticketAmt + integral
			return Math.round(amt * 100) / 100
		},
		// 活动优惠金额
		activityAmt() {
			let amt = 0
			this.activityItems.forEach(item => {
				amt = amt + Number(item.activityDisAmount)
			});
			return amt
		},
		// 用券优惠金额
		ticketAmt() {
			let amt = 0
			this.ticketItems.forEach(item => {
				amt = amt + Number(item.ticketDisAmount)
			})
			return amt
		},
		// VIP折扣金额
		vipDisAmount() {
			let amt = 0
			this.items.forEach(item => {
				amt = amt + Number(item.vipDisAmount)
			})
			return amt ? toFixed(amt, 2) : amt
		},
		// vip总优惠金额
		vipIntegralDisAmount() {
			const amt: number = (Number(this.integralDis?.integralDisAmount || 0) || 0) + Number(this.vipDisAmount || 0)
			return toFixed(amt, 2)
		},
	}
})
