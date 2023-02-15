<template>
    <view class="ret-non-original-order container overflow-y-auto flex flex-col">
        <!-- 操作区域 -->
        <view class="bg-white p-4">
            <view class="bg-white shadow-md rounded p-3 flex">
				<view class="w-14 mr-5 text-center" @click="newOrder">
					<image class="w-10 h-10" src="/static/svg/kai_dan.svg" mode=""></image>
					<view>开新单</view>
				</view>
				<view class="w-14 mr-5 text-center relative">
					<image class="w-10 h-10" src="/static/svg/ying_ye_yuan.svg" mode="" @click="openEmployee"></image>
					<view>{{ employeeName }}</view>
				</view>
				<view class="w-14 mr-5 text-center" @click="openHang">
					<image class="w-10 h-10" src="/static/svg/gua_dan.svg" mode=""></image>
					<view>挂单</view>
				</view>
				<view class="w-16 text-center relative">
					<image class="w-10 h-10" src="/static/svg/ying_ye_yuan.svg" mode="" @click="openRetailType"></image>
					<view>{{ retailTypeName }}</view>
					<view class="w-14 h-24 bg-white shadow p-1 absolute mt-1 overflow-y-auto h-24" v-if="isOpenRetailType">
						<view class="text-center text-sm mb-1 mt-1" v-for="retailtype in retailtypelist" :key="retailtype.code" @click="retailTypeChange(retailtype)">
							<text class="">{{ retailtype.name }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="mt-3 bg-gray-100 rounded p-3 flex h-16">
				<view class="flex-1 flex items-center text-sm">
					<view class="text-center flex-1">
						<view class="">会员</view>
						<view class="text-red font-weight-600">{{ vip.name || vip.cardno || '' }}</view>
					</view>
					<view class="text-center flex-1">
						<view class="">余额</view>
						<view class="text-red font-weight-600">{{ vip.amount || 0 }}</view>
					</view>
					<view class="text-center flex-1">
						<view class="">积分</view>
						<view class="text-red font-weight-600">{{ vip.integral || 0 }}</view>
					</view>
				</view>
				<view class="flex-2 flex items-center justify-center">
					<view class="px-3 py-1 mr-2 border border-solid border-red-500 text-red-500 rounded-full bg-white" @click="openVipDialog">
						查询
					</view>
					<view class="px-3 py-1 mr-2 border border-solid border-red-500 text-red-500 rounded-full bg-white" @click="vipScan">
						扫一扫
					</view>
				</view>
			</view>
			<view class="mt-3">
				<search-sku-input ref="SearchSkuInput" @input="searchInput"></search-sku-input>
			</view>
        </view>
        <!-- 明细 -->
        <view class="h-full flex flex-col items-center p-2 mb-2 overflow-hidden">
			<view class="w-full rounded-t bg-white border border-solid border-gray-200 border-x-0 border-t-0 flex items-center">
				<view class="w-full flex bg-white overflow-hidden border border-solid border-gray-200 border-x-0 border-t-0" style="border: none; font-size: 28rpx; height: 80rpx">
					<view class="flex flex-center w-3-6">
						<text style="font-weight: 600;">商品</text>
					</view>
					<view class="flex flex-center w-2-6">
						<text style="font-weight: 600;">数量</text>
					</view>
					<view class="flex flex-center w-1-6">
						<text style="font-weight: 600;">操作</text>
					</view>
				</view>
			</view>
			<scroll-view
                scroll-y="true" 
                class="overflow-auto text-xs rounded-b bg-white" 
                style="margin-bottom: 90rpx"
				:lower-threshold="200"
			>
				<view 
					class="bg-white border border-solid border-gray-200 border-x-0 border-t-0 overflow-hidden p-3 mb-2 flex" 
					style="font-size: 26rpx;"
					v-for="(item, index) in activityItemList"
					:key="item.id" 
				>
					<view class="w-full" v-if="item.isActivity === 'Y'">
						<!-- 活动标题 -->
						<view class="flex h-6 items-center justify-between border-b border-gray-300">
							<text>{{ item.activityName}}</text>
							<view class="text-gray-300" @click="openGiftDialog({item: item.giftItem, name: item.activityName, selecItems: item.selecItems})">
								<text>{{ isSelectActivity(item) ? '已选择' : '请选择'}}</text>
								<uni-icons color="rgba(156, 163, 175, var(--tw-text-opacity))" type="forward"></uni-icons>
							</view>
						</view>
						<!--  -->
						<view class="flex py-2 border-b border-gray-300" v-for="activityItem in item.children" :key="activityItem.id">
							<!-- 商品 -->
							<view class="w-3-6 overflow-hidden">
								<view class="">
									<text>{{ activityItem.name + ' ' }}</text>
									<text>{{ activityItem.value.length > 5 ? activityItem.value.slice(0, 5) + '..' : activityItem.value }}</text>
								</view>
								<view class="flex mt-2">
									<view class="flex items-center">
										<text>规格:{{ activityItem.value1 + '-' + activityItem.value2 }}</text>
										<image v-if="activityItem.isO2o == 'N'" class="w-5 h-5" src="/static/svg/ling_shou.svg" mode=""></image>
										<image v-else-if="activityItem.isO2o == 'Y'" class="w-5 h-5" src="/static/svg/yun_cang.svg" mode=""></image>
										<!-- <image class="w-4 h-4" src="/static/svg/cu_xiao.svg" mode=""></image> -->
										<image v-if="activityItem.isGift === 'Y'" class="w-5 h-5" src="/static/svg/zeng_pin.svg" mode=""></image>
									</view>
								</view>
								<view class="flex mt-2">
									<view class="">
										<text>条码:{{ activityItem.no || '' }}</text>
									</view>
								</view>
							</view>
							<!-- 数量 -->
							<view class=""  style="width: 110px;">
								<input class="text-center bg-gray-100" type="text" v-if="activityItem.isGift === 'Y'" :value="activityItem.qty" disabled />
								<input-number v-else style="width: 100%;" :value="activityItem.qty" @change="inputnumberChange($event, activityItem)"></input-number>
								<view class="h-12 mt-2 border-notice flex flex-col" style="box-sizing: border-box;">
									<view class="flex-1 flex flex-center" style="box-sizing: border-box; border-bottom: 1px solid #ccc; height: 50%">
										<view class="w-full text-center">
											<input type="text" disabled :value="activityItem.pricelist" />
										</view>
									</view>
									<view class="flex-1 flex flex-center" style="height: 50%">
										<view class="w-full text-center">
											<text class="text-gray-200" style="text-decoration: line-through;">￥{{ activityItem.old_pricelist }}</text>
										</view>
									</view>
								</view>
							</view>
							<!-- 操作区域 -->
							<view class="w-1-6 text-center flex flex-col items-center justify-around">
								<view 
									class="border rounded p-1 text-sm w-4 h-4 flex items-center bg-white" 
									style="border-color: #c5c5c5;" 
									@click="delItem({ index, item: activityItem})"
								>
									<image class="w-4 h-4" src="/static/svg/delete.svg" mode=""></image>
								</view>
								<view 
									class="border rounded p-1 text-sm w-4 h-4 flex items-center bg-white" 
									style="border-color: #c5c5c5;"
									@click="openItemEmployee({item: activityItem})"
								>
									<text>营</text>
								</view>
							</view>
						</view>
					</view>
					<view class="flex w-full" v-else>
						<view class="w-3-6 overflow-hidden">
							<view class="">
								<text>{{ item.name + ' ' }}</text>
								<text>{{ item.value.length > 5 ? item.value.slice(0, 5) + '..' : item.value }}</text>
							</view>
							<view class="flex items-center mt-2">
								<text>规格:{{ item.value1 + '-' + item.value2 }}</text>
								<image v-if="item.isO2o == 'N'" class="w-5 h-5" src="/static/svg/ling_shou.svg" mode=""></image>
								<image v-else-if="item.isO2o === 'Y'" class="w-5 h-5" src="/static/svg/yun_cang.svg" mode=""></image>
								<image v-if="item.isGift === 'Y'" class="w-5 h-5" src="/static/svg/zeng_pin.svg" mode=""></image>
							</view>
							<view class="flex mt-2">
								<text>条码:{{ item.no || '' }}</text>
							</view>
						</view>
						<view class="w-2-6">
							<uni-number-box style="width: 100%;" :value="item.qty" @change="inputnumberChange($event, item)"></uni-number-box>
							<view class="h-12 mt-2 border-notice flex flex-col" style="box-sizing: border-box; width: 100%;">
								<view class="flex-1 flex flex-center" style="box-sizing: border-box; border-bottom: 1px solid #ccc; height: 50%">
									<view class="w-full text-center">
										<input type="text" :value="item.pricelist" @input="itemInput($event, item)" />
									</view>
								</view>
								<view class="flex-1 flex flex-center" style="height: 50%">
									<view class="w-full text-center">
										<text class="text-gray-200" style="text-decoration: line-through;">￥{{ item.old_pricelist }}</text>
									</view>
								</view>
							</view>
						</view>
						<view class="w-1-6 text-center flex flex-col items-center justify-around">
							<view 
								class="border border-solid rounded p-1 text-sm w-4 h-4 flex items-center bg-white" 
								style="border-color: #c5c5c5;" 
								@click="delItem({ index, item})"
							>
								<image class="w-4 h-4" src="/static/svg/delete.svg" mode=""></image>
							</view>
							<view 
								class="border border-solid rounded p-1 text-sm w-4 h-4 flex items-center bg-white" 
								style="border-color: #c5c5c5;"
								@click="openItemEmployee({item})"
							>
								<text>营</text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
        </view>
        <!-- 结算区域 -->
		<view class="bg-white w-full flex items-center justify-between h-10 fixed left-0 bottom-0">
			<view class="ml-4" style="font-weight: 500;">
				合计<text class="text-red">{{ totQty }}</text>件
				<text class="text-red" :class="{ 'text-sm': JSON.stringify(totAmt).length > 5 }">{{ totAmt }}</text>元
				<view class="text-xs text-gray-300" @click="openAmtDetail">
					<text>优惠合计:</text>
					<text class="text-red">￥{{ totAmtDiscount }}</text>
					<uni-icons class="" type="arrowup" size="14"></uni-icons>
				</view>
			</view>
			<view class="mr-4">
				<text class="bg-white border border-solid border-red-400 text-red rounded-full px-4 py-1 mr-2" style="border-color: red;" @click="openDescription">备注</text>
				<text class="rounded-full px-4 py-1 bg-red-400 text-white" @click="to">收银</text>
			</view>
		</view>
		<!-- 挂单原因弹窗 -->
		<van-popup v-model:show="isOpenHangReason" @click-overlay="closeHang" position="center" title="挂单原因">
			<view class="bg-white w-full overflow-hidden">
				<view class="p-3">
					<view class="w-full text-center">
						挂单原因
					</view>
					<view class="w-full p-2">
						<textarea class="border border-solid p-2 w-62 h-32" :value="hangReasonValue" @input="hangReasonInput" placeholder="请输入挂单原因" />
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="bg-gray-100 rounded-full px-4 py-1 flex items-center" @click="closeHang">
							退出
						</view>
						<view class="ml-3 bg-red-400 text-white rounded-full px-4 py-1 flex items-center" @click="hangReasonSave">
							确定
						</view>
					</view>
				</view>
			</view>
		</van-popup>
		<!-- 挂单列表弹窗 -->
		<van-popup v-model:show="isOpenHangList" @click-overlay="closeHang" position="bottom" title="挂单列表">
			<view class="bg-gray-100 w-full overflow-hidden">
				<view class="w-full text-center py-1">
					挂单列表
				</view>
				<scroll-view
					scroll-y="true"
					class="py-4 h-96" 
					:lower-threshold="200"
				>
					<view 
						class="bg-white mb-2 ml-2 mr-2 p-2 rounded text-sm" 
						style="color: #c5c5c5;" 
						v-for="hangValue in hanglist" 
						:class="{'hangSelect': hangSelectId === hangValue.id }" 
						:key="hangValue.id"
						@click="hangSelectId = hangValue.id"
					>
						<view class="flex items-center justify-between" >
							<text class="font-weight-600 text-black">VIP卡号：{{ hangValue.docno }}</text>
							<text>{{ hangValue.billdate }}</text>
						</view>
						<view class="mt-2">
							<text>总数量：{{ hangValue.tot_qty }}</text>
							<text class="ml-4">总金额：{{ '￥' + hangValue.tot_amt }}</text>
						</view>
						<view class="mt-2">
							<text>备注：{{ hangValue.description }}</text>
						</view>
					</view>
				</scroll-view>
				<view class="flex flex-center mt-2 h-8">
					<view class="h-full flex flex-1 flex-center bg-white" @click="closeHang">
						退出
					</view>
					<view class="h-full flex flex-1 flex-center bg-red-400 text-white" @click="hanglistSave">
						确定
					</view>
				</view>
			</view>
		</van-popup>
		<!-- 会员查询弹窗 -->
		<van-popup v-model:show="isOpenVipDialog" @click-overlay="closeVipDialog" position="center" title="会员查询">
			<view class="bg-white w-80 overflow-hidden">
				<view class="p-3">
					<view class="w-full text-center mb-3">
						会员查询
					</view>
					<easy-input :value="vipPhone" @input="vipPhoneInput" placeholder="请输入VIP卡号" @search="vipSearch"></easy-input>
					<view class="vip-info text-sm">
						<view class="w-full flex mt-2">
							<view class="w-18 text-gray-400">会员卡号</view>
							<view>{{ vipDialogValue.cardno }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">卡类型</view>
							<view>{{ vipDialogValue.type_name }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">积分</view>
							<view>{{ vipDialogValue.integral }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">姓名</view>
							<view>{{ vipDialogValue.name }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">生日</view>
							<view>{{ vipDialogValue.birthday }}</view>
						</view>
						<view class="w-full flex mt-1">
							<view class="w-18 text-gray-400">余额</view>
							<view>{{ vipDialogValue.amount ? '￥' + vipDialogValue.amount : '' }}</view>
						</view>
					</view>
					<view class="px-2 flex flex-center mt-2">
                        <view class="mr-3 bg-red-400 text-white rounded-full px-4 py-1 flex items-center" @click="openVipAddDialog">
							新增
						</view>
						<view class="bg-gray-100 rounded-full px-4 py-1 flex items-center" @click="closeVipDialog">
							退出
						</view>
						<view class="ml-3 bg-red-400 text-white rounded-full px-4 py-1 flex items-center" @click="vipDialogSave">
							确定
						</view>
					</view>
				</view>
			</view>
		</van-popup>
        <van-popup v-model:show="isOpenVipAddDialog" @click-overlay="closeVipAddDialog" position="bottom" title="会员新增">
            <view class="bg-white overflow-hidden p-3">
                <view class="w-full text-center">
                    <text>会员新增</text>
                </view>
                <view class="vip-info text-sm">
                    <view class="w-full flex mt-2 items-center">
                        <view class="w-18 text-gray-400">生日</view>
                        <uni-datetime-picker
                            type="date"
                            no-bg
                            returnType="number"
                            :value="addVipData.birthday"
                            @change="vipBirthdayChange"
                            style="z-index: 99999"
                        />
                    </view>
                    <view class="w-full flex mt-2">
                        <view class="w-18 text-gray-400">姓名</view>
                        <view>
                            <input class="border-b border-gray-300" type="text" v-model="addVipData.name" placeholder="请输入会员名称" />
                        </view>
                    </view>
                    <view class="w-full flex mt-2">
                        <view class="w-18 text-gray-400">手机号</view>
                        <view>
                            <input class="border-b border-gray-300" type="text" v-model="addVipData.phone" placeholder="请输入会员手机号" />
                        </view>
                    </view>
                    <view class="w-full flex mt-2">
                        <view class="w-18 text-gray-400">性别</view>
                        <view>
                            <radio-group name="" @change="vipSexChange">
                                <label>
                                    <radio value="男" :checked="addVipData.sex === '男'" /><text>男</text>
                                </label>
                                <label class="ml-2">
                                    <radio value="女" :checked="addVipData.sex === '女'" /><text>女</text>
                                </label>
                            </radio-group>
                        </view>
                    </view>
                    <view class="w-full flex mt-2">
                        <view class="w-18 text-gray-400">卡类型</view>
                        <uni-combox :value="addVipData.type_id" @input="vipTypeIdChange" type="id" placeholder="请选择卡类型" :candidates="viptypelist"></uni-combox>
                    </view>
                    <view class="w-full flex mt-2">
                        <view class="w-18 text-gray-400">开卡人</view>
                        <uni-combox :value="addVipData.empid" @input="vipEmpIdChange" type="id" placeholder="请选择开卡人" :candidates="employeeList"></uni-combox>
                    </view>
                </view>
                <view class="px-2 flex flex-center mt-2">
                    <view class="bg-gray-100 rounded-full px-4 py-1 flex items-center" @click="closeVipAddDialog">
                        取消
                    </view>
                    <view class="ml-3 bg-red-400 text-white rounded-full px-4 py-1 flex items-center" @click="vipAddDialogSave">
                        确定
                    </view>
                </view>
            </view>
        </van-popup>
		<!-- 备注弹窗 -->
		<van-popup v-model:show="isOpenDescription" @click-overlay="closeDescription" position="center" title="备注">
			<view class="bg-white w-full overflow-hidden">
				<view class="p-3">
					<view class="w-full text-center">
						备注
					</view>
					<view class="w-full p-2">
						<textarea class="border border-solid p-2 w-62 h-32" :value="description" @input="descriptionInput" placeholder="请输入备注" />
					</view>
					<view class="px-2 flex flex-center mt-2">
						<view class="bg-gray-100 rounded-full px-4 py-1 flex items-center" @click="closeDescription">
							退出
						</view>
						<view class="ml-3 bg-red-400 text-white rounded-full px-4 py-1 flex items-center" @click="descriptionSave">
							确定
						</view>
					</view>
				</view>
			</view>
		</van-popup>
		<!-- 赠品弹窗 -->
		<van-popup v-model:show="isOpenGiftDialog" @click-overlay="closeGiftDialog" position="bottom" title="赠品">
			<view class="bg-gray-100 p-2 overflow-hidden">
				<view class="w-full h-8 flex items-center relative">
					<text class="font-weight-600">选择赠品</text>
					<text class="text-gray-300 text-sm ml-1">可选{{ giftDetail.qty }}件/已选{{ giftDetail.selectlist.length }}件</text>
					<uni-icons class="absolute right-2 top-1" type="closeempty" size="20" @click="closeGiftDialog"></uni-icons>
				</view>
				<scroll-view
					scroll-y="true"
					class="h-96"
					:lower-threshold="200"
				>
					<checkbox-group name="item" class="text-sm" @change="giftChange">
						<label
							class="flex bg-white mt-2 p-2 rounded text-sm"
							v-for='item in giftDetail.list'
							:key="item.no"
						>
							<!-- 单选框 -->
							<view class="w-1-6 flex items-center justify-center">
								<checkbox :value="item.no" :checked="giftDetail.selectlist.includes(item.no)" /><text></text>
							</view>
							<!-- 商品 -->
							<view class="w-3-6 overflow-hidden">
								<view class="">
									<text>{{ item.name + ' ' }}</text>
									<text>{{ item.value.length > 5 ? item.value.slice(0, 5) + '..' : item.value }}</text>
								</view>
								<view class="flex mt-2">
									<view class="flex items-center">
										<text>规格:{{ item.value1 + '-' + item.value2 }}</text>
										<image class="w-4 h-4" src="/static/svg/zeng_pin.svg" mode=""></image>
									</view>
								</view>
								<view class="flex mt-2">
									<view class="">
										<text>条码:{{ item.no || '' }}</text>
									</view>
								</view>
							</view>
							<!-- 数量 -->
							<view class="w-2-6">
								<input class="text-center bg-gray-100" type="text" :value="1" disabled />
								<view class="h-14">
									<view class="h-10 mt-2 flex flex-center flex-col border-notice py-3" style="box-sizing: border-box;">
										<view class="w-full text-center py-1">
											<input type="text" :value="0" disabled />
										</view>
									</view>
								</view>
							</view>
						</label>
					</checkbox-group>
				</scroll-view>
				<view class="px-2 flex flex-center mt-2">
					<view class="bg-red-400 text-white rounded-full px-4 py-1 flex items-center" @click="giftDialogSave">
						选好了
					</view>
				</view>
			</view>
		</van-popup>
		<!-- 金额详情 -->
		<van-popup v-model:show="isOpenAmtDetail" @click-overlay="isOpenAmtDetail = false" position="bottom" title="金额详情">
			<view class="bg-white w-full overflow-hidden">
				<view class="w-full h-8 flex items-center justify-center relative">
					<text class="font-weight-600">金额详情</text>
					<uni-icons class="absolute right-2 top-1" type="closeempty" size="20" @click="closeAmtDetail"></uni-icons>
				</view>
				<scroll-view
					scroll-y="true"
					class="bg-white" 
					style="max-height: 24rem;"
					:lower-threshold="200"
				>
					<view class="">
						<view class="flex items-center justify-between h-8 px-2">
							<text>商品总价</text>
							<text>￥{{ totOldAmt }}</text>
						</view>
						<view class="flex items-center justify-between h-8 px-2">
							<text>优惠总计</text>
							<text class="text-red">减￥{{ totAmtDiscount }}</text>
						</view>
						<uni-collapse ref="collapse" class="text-sm">
							<uni-collapse-item titleBorder="none" :show-animation="true" v-if="activityItems.length">
								<template v-slot:title>
									<view class="flex items-center justify-between h-8 px-2">
										<text>活动优惠</text>
										<text class="text-red">减￥{{ activityAmt }}</text>
									</view>
								</template>
								<view class="content p-2">
									<view class="bg-gray-50 rounded text-gray-400 px-2" v-for="activityItem in activityItems" :key="activityItem.activityName">
										<view class="h-8 flex items-center justify-between">
											<text>{{ activityItem.activityName }}</text>
											<text>减￥{{ activityItem.activityDisAmount }}</text>
										</view>
									</view>
								</view>
							</uni-collapse-item>
							<uni-collapse-item titleBorder="none" :show-animation="true" v-if="integralDis != null">
								<template v-slot:title>
									<view class="flex items-center justify-between h-8 px-2">
										<text>VIP优惠</text>
										<text class="text-red">减￥{{ vipIntegralDisAmount }}</text>
									</view>
								</template>
								<view class="content p-2">
									<view class="bg-gray-50 rounded text-gray-400 px-2">
										<view class="h-8 flex items-center justify-between" v-if="vipDisAmount">
											<text>VIP折扣</text>
											<text>减￥{{ vipDisAmount || 0 }}</text>
										</view>
										<view class="h-8 flex items-center justify-between">
											<text>VIP积分抵现</text>
											<text>减￥{{ integralDis.integralDisAmount || 0 }}</text>
										</view>
										<view class="h-8 flex items-center justify-between">
											<text class="text-red">使用{{ integralDis.useIntegral || 0 }}积分，抵扣￥{{ integralDis.integralDisAmount || 0 }}</text>
										</view>
									</view>
								</view>
							</uni-collapse-item>
							<uni-collapse-item titleBorder="none" :show-animation="true"  v-if="ticketItems.length">
								<template v-slot:title>
									<view class="flex items-center justify-between h-8 px-2">
										<text>券优惠</text>
										<text class="text-red">减￥{{ ticketAmt }}</text>
									</view>
								</template>
								<view class="content p-2">
									<view class="bg-gray-50 rounded text-gray-400 px-2" v-for="ticketItem in ticketItems" :key="ticketItem.activityName">
										<view class="h-8 flex items-center justify-between">
											<text>{{ billtxtSlice(ticketItem.ticketName, ticketItem.ticketNo, 35) }}</text>
											<text>减￥{{ ticketItem.ticketDisAmount }}</text>
										</view>
									</view>
								</view>
							</uni-collapse-item>
						</uni-collapse>
						<view class="flex items-center justify-between h-8 px-2">
							<text>合计</text>
							<text>￥{{ totAmt }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</van-popup>
		<!-- 营业员弹窗 -->
		<employee-dialog :isopen="isOpenEmployee" :list="employeeList" :value="employeeIds" @close="closeEmployee" @save="employeeSave"></employee-dialog>
		<!-- 明细营业员弹窗 -->
		<employee-dialog :isopen="isOpenItemEmployee" :list="employeeList" :value="itemEmployeeIds" @close="closeItemEmployee" @save="itemEmployeeSave"></employee-dialog>
    </view>
</template>

<script setup lang="ts">
import { toRefs, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useBillStore } from '@/stores/bill'
import searchSkuInput from '@/components/search-sku-input/search-sku-input.vue'

const billStore = useBillStore()
// 参数
const { 
	employeeName, 
	isOpenEmployee, 
	employeeIds,
	employeeList, 
	isOpenHangReason, 
	isOpenHangList, 
	hanglist, 
	hangSelectId, 
	hangReasonValue, 
	retailTypeName,
	isOpenRetailType,
	retailtypelist,
	vip, 
	isOpenVipDialog, 
	vipPhone, 
	vipDialogValue, 
    isOpenVipAddDialog,
    addVipData,
    viptypelist,
	totQty, 
	totAmt, 
	items, 
	activityItemList,
	isOpenGiftDialog,
	giftDetail,
	isOpenItemEmployee,
	itemEmployeeIds,
	isOpenDescription,
	description,
	isOpenAmtDetail,
	activityItems,
	ticketItems,
	integralDis,
	ticketAmt,
	totOldAmt,
	totAmtDiscount,
	activityAmt,
	vipIntegralDisAmount,
	vipDisAmount
} = toRefs(billStore)
// 方法
const { 
	init, 
	newBill, 
	getEmployeeList, 
	openEmployee, 
	closeEmployee,
	employeeSave, 
	openHang, 
	closeHang, 
	hangReasonInput, 
	hangReasonSave, 
	hanglistSave, 
	openRetailType,
	retailTypeChange,
	getRetailTypeList,
	openVipDialog, 
    vipScan,
	vipPhoneInput, 
	vipSearch, 
	closeVipDialog, 
	vipDialogSave, 
    openVipAddDialog,
    closeVipAddDialog,
    vipBirthdayChange,
    vipSexChange,
    vipTypeIdChange,
    vipEmpIdChange,
    vipAddDialogSave,
	searchInput,
	openGiftDialog,
	isSelectActivity,
	giftChange,
	giftDialogSave,
	closeGiftDialog,
	delItem,
	inputnumberChange,
	itemInput,
	openItemEmployee,
	closeItemEmployee,
	itemEmployeeSave,
	openDescription,
	descriptionInput,
	descriptionSave,
	closeDescription,
	openAmtDetail,
	closeAmtDetail,
	billtxtSlice,
	to
} = billStore
const SearchSkuInput = ref()
const newOrder = () => {
	newBill(() => {
		SearchSkuInput.value?.clearInputValue()
	})
}
onLoad((options) => {
	if (options.init) {
		billStore.$reset()
	}
})
onMounted(() => {
	init()
	getEmployeeList()
	getRetailTypeList()
})
</script>

<style scoped>

</style>