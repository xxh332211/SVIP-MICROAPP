// pages-abs/pages/productDetails/productDetails.js
import {
    absApi
} from '../../../common/api/absAPI'
import {
    svip,
} from '../../../common/api/svipApi'
import {
    marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
const AbsApi = new absApi();
const SvipApi = new svip();
const app = getApp()
let scrollTimer = Function;
import {
    util
} from "../../../common/util.js"
Page({
    /**
     * 页面的初始数据
     */
    data: {
        tabUrls: [
            'pages/goodsIndex/goodsIndex',
            'pages/getTicket/getTicket',
            'pages/cloudShow/cloudShow',
            'pages/home/home',
            'pages/user/userHome'
        ],
        kefupop: false,
        guizhepop: false,
        Entrance: 1,
        datas: {},
        favorites: false,
        goods_type: "",
        is_collect: false, // 是否收藏
        showNavigate: true,
        current: 1
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        if (options.src) {
            wx.setStorageSync('src', options.src)
        }
        if (options.uis) {
            wx.setStorageSync('uis', options.uis)
        }
        //广告投放参数
        if (options.gdt_vid) {
            wx.setStorageSync('gdt_vid', options.gdt_vid)
        }
        if (options.weixinadinfo) {
            wx.setStorageSync('weixinadinfo', options.weixinadinfo)
        }
        if (options.from == "share") {
            wx.setStorageSync('src', "YYXCX")
        }
        // Entrance == 1 :普通商品 
        // Entrance == 2 :秒光光商品
        // Entrance == 3 :兑换卡商品
        // Entrance == 4 :全款商品
        this.setData({
            option: options,
            navigateHeight: app.systemData.statusBarHeight,
            Entrance: Number(options.Entrance)
        })
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        if (options.from && options.from === 'btmGoodsDetail') {
            prevPage.setData({
                from: 'btmGoodsDetail'
            })
        }
    },
    onShow() {
        //获取授权登录code
        let that = this;
        wx.login({
            success(res) {
                if (res.code) {
                    that.setData({
                        wxcode: res.code
                    })
                } else {
                    console.log('登录失败！' + res.errMsg)
                }
            }
        })
        this.setData({
            showTicketPopup: false
        })
        let id = this.data.option.userCityId;
        if (id) {
            wx.setStorageSync('cityId', id)
            // 获取展届信息
            SvipApi.activityInfo({
                cityId: id
            }).then((res) => {
                wx.setStorageSync("activityInfo", app.disposeData(res))
                wx.setStorageSync("sessionId", res.session)
                wx.setStorageSync("activityId", res.activity_id)
                wx.setStorageSync("curUserCityText", res.city_name)
                this.checkHasTicket()
                this.Adv()
                this.initGoodsDetail(this.data.option)
            })
        } else {
            this.checkHasTicket()
            this.Adv()
            this.initGoodsDetail(this.data.option)
        }
    },
    //返回
    goBack() {
        if (this.data.isDiscount) {
            this.setData({
                showTipsPopup: true
            })
        } else {
            let pages = getCurrentPages();
            if (pages.length > 1) {
                wx.navigateBack()
            } else {
                wx.switchTab({
                    url: "/pages/home/home"
                })
            }
        }
    },
    swiperChange(e) {
        this.setData({
            current: e.detail.current + 1
        })
    },
    imgLoad() {
        wx.hideLoading({
            success: (res) => {},
        })
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
                if (res.data.change_is_alert == 1) {
                    //兑换卡结束弹窗是否可以弹出：1：可以;0：不可以
                    setTimeout(() => {
                        wx.showToast({
                            title: '不在兑换卡活动时间内',
                            icon: "none",
                            duration: 3000
                        })
                    }, 1000);
                } else if (res.data.activity_is_alert == 1) {
                    //秒光光活动结束弹窗是否可以弹出：1：可以;0：不可以
                    setTimeout(() => {
                        wx.showToast({
                            title: '活动已结束，该商品只支持原价购买',
                            icon: "none",
                            duration: 3000
                        })
                    }, 1000);
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
                    is_collect: res.data.is_collect == 1 ? true : false,
                    datas: res.data,
                    totalNum: res.data.main_image.video.length + res.data.main_image.image.length, //轮播总条数
                    goods_type: res.data.goods_type, // 商品类型 0：普通商品 1：秒光光商品  2：兑换卡商品
                    pay_way: res.data.pay_way // 支付方式1：定金商品2：全款商品
                })
                // 友盟统计
                wx.uma.trackEvent('enter_mgg_detail', {
                    userCityId: wx.getStorageSync('cityId'),
                    itemID: res.data.prerogative_id,
                    itemName: res.data.prerogative_name,
                    Entrance: options.Entrance,
                    src: wx.getStorageSync('src'),
                    uis: wx.getStorageSync('uis')
                });
            } else {
                let data = res;
                wx.showToast({
                    title: data.message,
                    icon: "none",
                    duration: 3000,
                    mask: true,
                    success() {
                        if (data.status == -3) {
                            if (getCurrentPages().length == 1) {
                                wx.switchTab({
                                    url: '/pages/goodsIndex/goodsIndex',
                                })
                            } else {
                                wx.navigateBack()
                            }
                        }
                    }
                })
            }
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
    // 兑换卡活动规则弹窗
    onguizhepop: function () {
        this.setData({
            guizhepop: !this.data.guizhepop
        })
    },
    // 返回顶部
    totop: function () {
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 100
        })
    },
    onPageScroll(e) {
        if (e.scrollTop > 500) {
            this.setData({
                showToTop: true
            })
        } else {
            this.setData({
                showToTop: false
            })
        }
    },
    switchStorePopup() {
        if (this.data.datas.supplier_stores_list.length > 1) {
            this.setData({
                storePopup: !this.data.storePopup
            })
        }
    },
    // 跳转客服
    toKefu: function () {
        wx.navigateTo({
            url: '../../../pages/expoPackage/tencentServe/tencentServe',
        })
        // tencentServe
    },
    // 跳转确认订单
    toConfirmOrder: function () {
        console.log(this.data.datas)
        if (this.data.goods_type == 2 && this.data.datas.use_status == 1) {
            return
        }
        if (this.data.datas.stock_count > 0) {
            // 友盟统计
            wx.uma.trackEvent('click_mgg_buy_btn', {
                itemID: this.data.datas.prerogative_id,
                itemName: this.data.datas.prerogative_name,
                price: Number(this.data.datas.newPrice)
            });
            wx.navigateTo({
                url: `../ConfirmOrder/ConfirmOrder?id=${this.data.option.id}&Entrance=${this.data.option.Entrance}&cardId=${this.data.option.cardId?this.data.option.cardId:""}&cardOrderId=${this.data.option.cardOrderId?this.data.option.cardOrderId:""}`
            })
        }
    },
    // 进入店铺
    toShop() {
        wx.navigateTo({
            url: '/pages-live/pages/storeDetail/storeDetail?supplier_id=' + this.data.datas.supplier_id + "&getPageBoolean=true",
        })
    },
    // 跳转线上订单列表
    toMggOrderList() {
        if (!wx.getStorageSync("isLogin")) {
            wx.navigateTo({
                url: '/pages/login/login',
            })
            return false
        }
        wx.navigateTo({
            url: '/pages-userInfo/pages/orderList/orderList'
        })
    },
    // 收藏&取消收藏
    Favorites() {
        if (!wx.getStorageSync("isLogin")) {
            wx.navigateTo({
                url: '/pages/login/login',
            })
            return false
        }
        const data = {
            prerogative_goods_id: this.data.datas.prerogative_id,
            type: this.data.is_collect ? 1 : 0
        }
        AbsApi.preCollect(data).then(res => {
            wx.hideLoading()
            wx.showToast({
                title: res.message,
            })
            this.setData({
                is_collect: !this.data.is_collect
            })
        })
    },
    // 判断url是否为tabbar
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

        const type = this.data.brandAdv[0].type;
        const url = this.data.brandAdv[0].url
        if (url) {
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
                    appId: this.data.brandAdv[0].appid,
                    path: this.data.brandAdv[0].url
                })
            } else {
                wx.navigateTo({
                    url: '/pages/web/web?url=' + encodeURIComponent(this.data.brandAdv[0].url)
                })
            }
        }
    },
    // 请求运营位
    Adv: function () {
        SvipApi.getAdvList({
            area_id: "59,63"
        }).then((res) => {
            if (res.status == 1) {
                this.setData({
                    kefu_img: res.data.adv59 || [],
                    brandAdv: res.data.adv63 || []
                })
            } else {
                this.setData({
                    kefu_img: [],
                    brandAdv: []
                })
            }
        })
    },
    //是否索票
    checkHasTicket() {
        if (wx.getStorageSync("src") == "pyqabs") {
            let outTime = new Date().getTime();
            marketingApi.getTicketsInfo().then((res) => {
                this.setData({
                    isLogin: res.status == 1 ? true : false
                })
                if (res.status == -1 || !res.data.hasGetTicket) {
                    SvipApi.activityInfo({
                        cityId: wx.getStorageSync('cityId')
                    }).then((res) => {
                        let resData = res;
                        // 是否首次弹层
                        marketingApi.recordTicketPopup({
                            activity_end_time: resData.end_date
                        }).then((res) => {
                            if (res.status == 1 && res.data.firstStatus == 1) {
                                let inTime = new Date().getTime();
                                setTimeout(() => {
                                    this.setData({
                                        showTicketPopup: true
                                    })
                                }, 3000 - (inTime - outTime));
                            }
                        })
                    })
                }
            })
        }
    },
    //授权手机号同时领取门票
    getPhoneNumber(e) {
        e.source = "mgg";
        util.authorizePhone(e, this.data.wxcode, () => {
            this.setData({
                isLogin: true
            })
            //索票
            this.freeGet()
        })
    },
    //免费索票
    freeGet() {
        wx.showLoading({
            title: '索票中...',
            mask: true
        })
        //索票接口
        let data = {
            source_id: "",
            src_id: "ticket",
            mobile: wx.getStorageSync("userInfo").mobile,
            invite: "",
            formId: "",
            'src': "pyqabs",
            'uis': wx.getStorageSync('uis'),
            'plan': wx.getStorageSync('plan'),
            'unit': wx.getStorageSync('unit')
        }
        marketingApi.postReserve(data).then((res) => {
            wx.hideLoading()
            this.setData({
                showTicketPopup: false
            })
            if (res.code == 200) {
                wx.setStorageSync("shareTicketId", res.ticket_id)
                wx.setStorageSync("nextActivity", res.activityInfo)
                wx.showToast({
                    title: res.message,
                    icon: "none"
                })
                //提交投放参数
                wx.request({
                    url: "https://api.51jiabo.com/youzan/wxAD/wxReported",
                    method: 'POST',
                    data: {
                        clickId: wx.getStorageSync("gdt_vid"),
                        weixinadinfo: wx.getStorageSync("weixinadinfo"),
                        type: 1,
                        cityId: wx.getStorageSync('cityId'),
                        session: wx.getStorageSync('sessionId'),
                        mobile: wx.getStorageSync("userInfo").mobile
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    complete: function (res) {
                        wx.removeStorageSync('gdt_vid');
                        wx.removeStorageSync('weixinadinfo')
                        console.log(res, "投放接口")
                    }
                })
            } else {
                wx.showToast({
                    title: res.message ? res.message : "请求出错了",
                    icon: "none"
                })
            }
        })
    },
    closeTicket() {
        this.setData({
            showTicketPopup: false
        })
    },
    onPageScroll(h) {
        if (h.scrollTop > 550) {
            this.setData({
                showTopBtn: true
            })
        } else {
            this.setData({
                showTopBtn: false
            })
        }
        if (h.scrollTop > 350) {
            this.setData({
                showBack: true
            })
        } else {
            this.setData({
                showBack: false
            })
        }
        this.setData({
            showNavigate: false
        })
        clearTimeout(scrollTimer)
        scrollTimer = setTimeout(this.scrollHandler, 600);
    },
    scrollHandler() {
        this.setData({
            showNavigate: true
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.datas.prerogative_name,
            imageUrl: "",
            path: `/pages-abs/pages/productDetails/productDetails?from=share&Entrance=${this.data.option.Entrance}&id=${this.data.option.id}&userCityId=${wx.getStorageSync('cityId')}&uis=${wx.getStorageSync('uis')}`
        }
    },
})