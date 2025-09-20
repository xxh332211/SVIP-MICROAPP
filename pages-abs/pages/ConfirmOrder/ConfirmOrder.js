// pages-abs/pages/ConfirmOrder/ConfirmOrder.js
import apiService from '../../../common/http/httpService_mall'
import {
    absApi
} from "../../../common/api/absAPI";
import {
    svip,
} from "../../../common/api/svipApi";
import {
    liveApi
} from "../../../common/api/liveApi"
const AbsApi = new absApi()
const SvipApi = new svip()
const LiveApi = new liveApi()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        addressId: "",
        kefupop: false,
        fudaipop: false,
        errpop: false,
        datas: {},
        num: 1,
        remarks: "",
        tabUrls: [
            'pages/goodsIndex/goodsIndex',
            'pages/getTicket/getTicket',
            'pages/cloudShow/cloudShow',
            'pages/home/home',
            'pages/user/userHome'
        ]
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        //无data为兑换卡商品列表进入
        this.initGoodsDetail(options)
        // 获取运营位
        SvipApi.getAdvList({
            area_id: "59,63"
        }).then((res) => {
            // 59:客服弹窗运营数据 63:获取福袋弹窗
            if (res.status == 1) {
                this.setData({
                    kefu_img: res.data.adv59 || [],
                    brandAdv: res.data.adv63?.[0] || {}
                })
            } else {
                this.setData({
                    kefu_img: [],
                    brandAdv: {}
                })
            }
        })
    },
    onShow() {
        setTimeout(() => {
            apiService('member/address/list').then((addresses) => {
                this.setData({
                    selectedAddress: ""
                })
                for (let i of addresses) {
                    if (wx.getStorageSync('chooseAddressId')) {
                        if (i.id == wx.getStorageSync('chooseAddressId')) {
                            //有chooseAddressId则显示选中的地址
                            this.setData({
                                selectedAddress: i,
                                addressId: i.id
                            })
                            break;
                        }
                    } else {
                        //没地址选默认地址
                        if (i.status == 2) {
                            //status = 2 为默认地址
                            this.setData({
                                selectedAddress: i,
                                addressId: i.id
                            })
                            break;
                        }
                    }
                }
                wx.removeStorageSync('chooseAddressId')
            }).catch(() => {})
        }, 1000);
    },
    // 初始化商品详情
    initGoodsDetail(options) {
        const en = Number(options.Entrance)
        const data = {
            card_id: options.cardId ? options.cardId : "",
            prerogative_id: options.id,
            goods_type: en == 1 ? 0 : en == 2 ? 1 : en == 3 ? 2 : 0,
            card_order_id: options.cardOrderId ? options.cardOrderId : ""
        }
        AbsApi.goodsDetail(data).then(res => {
            wx.hideLoading()
            if (res.status == 1) {
                // 全款商品
                if (Number(res.data.pay_way) == 2) {
                    if (res.data.goods_type == 1) { // 秒光光 用activity_price
                        res.data.newPrice = res.data.activity_price
                    } else { // 否则 用 exclusive_price
                        res.data.newPrice = res.data.exclusive_price
                    }
                } else { // 订金商品
                    res.data.newPrice = res.data.earnest
                }
                if (res.data.delivery_address.begin_date) {
                    res.data.delivery_address.begin_date = res.data.delivery_address.begin_date.split(" ")[0].substr(5).replace(/-/g, ".");
                }
                if (res.data.delivery_address.end_date) {
                    res.data.delivery_address.end_date = res.data.delivery_address.end_date.split(" ")[0].substr(5).replace(/-/g, ".");
                }
                this.setData({
                    itemID: res.data.prerogative_id, //小程序后台分析统计使用字段
                    itemName: res.data.prerogative_name, //小程序后台分析统计使用字段
                    price: res.data.newPrice, //小程序后台分析统计使用字段
                    datas: res.data
                })
            } else {
                let data = res;
                wx.showToast({
                    title: data.message,
                    icon: "none",
                    duration: 3000,
                    mask: true,
                    success() {
                        if (data.status == -3) {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }
                    }
                })
            }
        })
    },
    chooseAddress() {
        wx.navigateTo({
            url: '/pages-userInfo/pages/userCenter/receiverAddress/receiverAddress?origin=order',
        })
    },
    imgLoad() {
        wx.hideLoading({
            success: (res) => {},
        })
    },
    // 客服弹窗
    onkefupop: function () {
        if (this.data.kefupop == false) {
            wx.showLoading({
                title: '加载中'
            })
        }
        this.setData({
            kefupop: !this.data.kefupop
        })
    },
    // 福袋弹窗
    onfudai: function () {
        this.setData({
            fudaipop: !this.data.fudaipop
        })
    },
    // 关闭失败付款弹窗
    onclose: function () {
        this.setData({
            errpop: !this.data.errpop
        })
    },
    // 跳转客服
    toKefu: function () {
        wx.navigateTo({
            url: '../../../pages/expoPackage/tencentServe/tencentServe',
        })
        // tencentServe
    },
    // 减号
    jian: function () {
        if (this.data.num <= 1) return
        this.setData({
            num: this.data.num -= 1
        })
    },
    // 加号
    jia: function () {
        if (this.data.datas.goods_type != 2) {
            //兑换卡商品限购一件
            if (this.data.datas.is_limit_purchase == 1) {
                //限购
                if (this.data.num >= this.data.datas.limit_buy_count) return
                this.setData({
                    num: this.data.num += 1
                })
            } else {
                //不限购
                this.setData({
                    num: this.data.num += 1
                })
            }
        }
    },
    // 获取备注
    getRemarks: function (e) {
        const val = e.detail.value
        this.setData({
            remarks: val
        })
    },
    toOrderDetail() {
        if (this.data.orderId) {
            wx.navigateTo({
                url: '/pages-abs/pages/orderDetail/orderDetail?order_id=' + this.data.orderId,
            })
        }
    },
    isTab(url) {
        for (let item of this.data.tabUrls) {
            if (url.indexOf(item) > -1) {
                return true
            }
        }
    },
    // 运营位链接跳转
    swiperUrl(e) {
        // 友盟统计
        wx.uma.trackEvent('click_AD', {
            cityId: wx.getStorageSync('cityId'),
            ADID: e.currentTarget.dataset.area_id,
            src: wx.getStorageSync('src'),
            uis: wx.getStorageSync('uis')
        });

        let type = e.currentTarget.dataset.item.type;
        let url = e.currentTarget.dataset.item.url;
        //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
        if (type == 1) {
            if (this.isTab(url)) {
                wx.switchTab({
                    url
                })
            } else {
                wx.navigateTo({
                    url
                })
            }
        } else if (type == 2) {
            wx.navigateToMiniProgram({
                appId: e.currentTarget.dataset.item.appid,
                path: e.currentTarget.dataset.item.url
            })
        } else {
            wx.navigateTo({
                url: '/pages/web/web?url=' + encodeURIComponent(e.currentTarget.dataset.item.url)
            })
        }
    },
    // 提交订单
    payBtn() {
        // 友盟统计
        wx.uma.trackEvent('click_mgg_confirm_btn', {
            itemID: this.data.datas.prerogative_id,
            itemName: this.data.datas.prerogative_name
        });
        if (!wx.getStorageSync("isLogin")) {
            wx.navigateTo({
                url: '/pages/login/login',
            })
            return false
        }
        const that = this
        wx.showLoading({
            title: '支付中',
            mask: true
        })
        switch (Number(this.data.datas.goods_type)) {
            case 1: // 秒光光 提交订单
                this.payapi1()
                break;
            case 2: // 兑换卡 提交订单
                this.payapi2()
                break;
            default: // 普通 提交订单
                this.payapi0()
                break;
        }
    },
    payapi0: function () {
        if (this.data.datas.delivery_way == 3 && !this.data.addressId) {
            wx.showToast({
                title: '请填写收货地址',
                icon: "none"
            })
            return
        }
        const that = this;
        const data = {
            buyCount: this.data.num,
            remarks: this.data.remarks,
            prerogative_id: this.data.datas.prerogative_id,
            fromClient: "XCX",
            room_id: "",
            user_address_id: this.data.addressId,
            src: wx.getStorageSync('src'),
            uis: wx.getStorageSync('uis')
        }
        LiveApi.createOrder(data).then(res => {
            let resData = res;
            wx.hideLoading()
            if (resData.code == 200) {
                wx.requestPayment({
                    'timeStamp': resData.result.time_stamp,
                    'nonceStr': resData.result.nonce_str,
                    'package': resData.result.package,
                    'signType': "MD5",
                    'paySign': resData.result.pay_sign,
                    complete() {
                        setTimeout(() => {
                            wx.navigateTo({
                                url: '/pages-abs/pages/orderDetail/orderDetail?order_id=' + resData.result.order_id,
                            })
                        }, 1500);
                    }
                })
            } else {
                that.setData({
                    errmsg: res.message,
                    errpop: true
                })
            }
        }).catch(err => {
            wx.hideLoading()
            console.log(err);
        })
    },
    payapi1: function () {
        if (this.data.datas.delivery_way == 3 && !this.data.addressId) {
            wx.showToast({
                title: '请填写收货地址',
                icon: "none"
            })
            return
        }
        const that = this
        let data = {
            num: this.data.num,
            remarks: this.data.remarks,
            goods_id: this.data.datas.activity_goods_id,
            fromClient: "WAP",
            user_address_id: this.data.addressId,
            src: wx.getStorageSync('src'),
            uis: wx.getStorageSync('uis')
        }
        AbsApi.preGoodsPayment(data).then((res) => {
            wx.hideLoading()
            if (res.status == 1) {
                that.setData({
                    orderId: res.data.order_id
                })
                wx.requestPayment({
                    'timeStamp': res.data.time_stamp,
                    'nonceStr': res.data.nonce_str,
                    'package': res.data.package,
                    'signType': "MD5",
                    'paySign': res.data.pay_sign,
                    'success': function () {
                        setTimeout(() => {
                            wx.showToast({
                                title: '支付成功！',
                                icon: 'none',
                                duration: 3000
                            })
                        }, 10);
                        AbsApi.getBouncedLog({
                            type: 2
                        }).then(res => {
                            if (res.status == -1) {
                                //没弹过福袋
                                const d = {
                                    type: "2",
                                    activity_id: wx.getStorageSync('activityId')
                                }
                                AbsApi.addBouncedLog(d).then(r => {
                                    console.log(r);
                                })
                                that.onfudai()
                            } else {
                                //已弹过福袋，支付成功状态返回延时，加个定时器
                                setTimeout(() => {
                                    wx.navigateTo({
                                        url: '/pages-abs/pages/orderDetail/orderDetail?order_id=' + that.data.orderId,
                                    })
                                }, 1000);
                            }
                        })
                    },
                    'fail': function () {
                        wx.navigateTo({
                            url: '/pages-abs/pages/orderDetail/orderDetail?order_id=' + that.data.orderId,
                        })
                    }
                })
            } else {
                that.setData({
                    errmsg: res.message,
                    errpop: true
                })
                return
            }
        }).catch(err => {
            wx.hideLoading()
            wx.showToast({
                title: err.message,
            })
        })
    },
    payapi2: function () {
        const that = this
        let data = {
            prerogative_id: this.data.datas.prerogative_id,
            card_order_id: this.data.datas.card_order_id,
            src: wx.getStorageSync('src'),
            uis: wx.getStorageSync('uis'),
            uid: wx.getStorageSync('userInfo').uid,
            remarks: this.data.remarks
        }
        AbsApi.exchangeGoodsDo(data).then(res => {
            wx.hideLoading()
            if (res.status == -1) {
                that.setData({
                    errmsg: res.message,
                    errpop: true
                })
                return
            }
            if (res.status == 1) {
                wx.showToast({
                    title: '兑换成功！',
                    icon: 'none',
                    duration: 3000
                })
                that.setData({
                    orderId: res.data.order_id
                })
                AbsApi.getBouncedLog({
                    prerogative_id: that.data.datas.prerogative_id,
                    type: 2
                }).then(res => {
                    if (res.status == -1) {
                        //没弹过福袋
                        const d = {
                            prerogative_id: that.data.datas.prerogative_id,
                            type: "2",
                            activity_id: wx.getStorageSync('activityId')
                        }
                        AbsApi.addBouncedLog(d).then(r => {
                            console.log(r);
                        })
                        that.onfudai()
                    } else {
                        //已弹过福袋
                        wx.navigateTo({
                            url: '/pages-abs/pages/orderDetail/orderDetail?order_id=' + that.data.orderId,
                        })
                    }
                })
            }
        }).catch(err => {
            wx.hideLoading()
            wx.showToast({
                title: err.message,
            })
        })
    },
})