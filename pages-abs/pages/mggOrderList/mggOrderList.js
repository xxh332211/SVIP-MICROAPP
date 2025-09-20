// pages-abs/pages/mggOrderList/mggOrderList.js
import {
    absApi
} from "../../../common/api/absAPI";
import {
    svip,
} from "../../../common/api/svipApi";
const SvipApi = new svip()
const AbsApi = new absApi()
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // list + i => 数据容器 0：全部；1：待付款；2：待提货；3：已完成
        // page + i => 分页请求 0：全部；1：待付款；2：待提货；3：已完成
        swiperCurrent: 0,
        page0: 1,
        page1: 1,
        page2: 1,
        page3: 1,
        list0: [],
        list1: [],
        list2: [],
        list3: [],
        total0: '',
        total1: '',
        total2: '',
        total3: '',
        tabUrls: [
            'pages/goodsIndex/goodsIndex',
            'pages/getTicket/getTicket',
            'pages/cloudShow/cloudShow',
            'pages/home/home',
            'pages/user/userHome'
        ]
    },
    // 生命周期函数--监听页面加载
    onLoad: function (options) {
        // 获取福袋弹窗
        SvipApi.getAdvList({
            area_id: "63"
        }).then((res) => {
            if (res.status == 1) {
                this.setData({
                    brandAdv: res.data.adv63?.[0] || {}
                })
            } else {
                this.setData({
                    brandAdv: {}
                })
            }
        })
    },
    onShow: function () {
        const that = this
        that.initData(0, 0, res => { // 全部
            let data = res.data.order.map((item) => {
                // item.create_time = "2021-01-05 17:56:10"
                let a = new Date().getTime()
                let b = new Date(item.create_time.replace(/-/g, "/")).getTime() + 15 * 60 * 1000
                item.isOut = a < b ? true : false
                item.codeTime = item.create_time
                item = app.disposeData(item)
                return item
            })
            that.setData({
                list0: data,
                total0: res.data.total
            })
            res.data.order.find((v) => {
                let nowTime = new Date().getTime();
                let b = new Date(v.create_time.replace(/-/g, "/")).getTime() + 15 * 60 * 1000
                let endDate = b - nowTime;
                // let endDate = 10000;
                // console.log(endDate);
                if (endDate > 0) {
                    //倒计时
                    let stop = setInterval(() => {
                        let minute = Math.floor((endDate / 1000 / 60) % 60);
                        let second = Math.floor((endDate / 1000) % 60);
                        let min = minute < 10 ? "0" + minute : minute;
                        let sec = second < 10 ? "0" + second : second;
                        if (endDate <= 0) {
                            v.status = -1;
                            that.setData({
                                list0: that.data.list0
                            })
                            clearInterval(stop);
                            return false;
                        } else {
                            endDate -= 1000;
                        }
                        v.goods_time = min + ":" + sec;
                        that.setData({
                            list0: that.data.list0
                        })
                    }, 1000);
                } else {
                    if (v.status == 0) {
                        v.status = -1;
                        that.setData({
                            list0: that.data.list0
                        })
                    }
                }
            })
            console.log(this.data.list0);
        })
        that.initData(0, 1, res => { // 待付款
            let data = res.data.order.map((item) => {
                // item.create_time = "2021-01-05 18:04:10"
                let a = new Date().getTime()
                let b = new Date(item.create_time.replace(/-/g, "/")).getTime() + 15 * 60 * 1000
                item.isOut = a < b ? true : false
                item.codeTime = item.create_time
                item = app.disposeData(item)
                return item
            })
            that.setData({
                list1: res.data.order,
                total1: res.data.total
            })
            res.data.order.find((v) => {
                let nowTime = new Date().getTime();
                let b = new Date(v.create_time.replace(/-/g, "/")).getTime() + 15 * 60 * 1000
                let endDate = b - nowTime;
                // let endDate = 10000;
                // console.log(endDate);
                if (endDate > 0) {
                    //倒计时
                    let stop = setInterval(() => {
                        let minute = Math.floor((endDate / 1000 / 60) % 60);
                        let second = Math.floor((endDate / 1000) % 60);
                        let min = minute < 10 ? "0" + minute : minute;
                        let sec = second < 10 ? "0" + second : second;
                        if (endDate <= 0) {
                            v.status = -1;
                            that.setData({
                                total1: (that.data.total1 - 1) >= 0 ? (that.data.total1 - 1) : 0,
                                list1: that.data.list1
                            })
                            clearInterval(stop);
                            return false;
                        } else {
                            endDate -= 1000;
                        }
                        v.goods_time = min + ":" + sec;
                        that.setData({
                            list1: that.data.list1
                        })
                    }, 1000);
                } else {
                    if (v.status == 0) {
                        v.status = -1;
                        that.setData({
                            list1: that.data.list1
                        })
                    }
                }
            })
            console.log(this.data.list1);
        })
        that.initData(0, 2, res => { // 待提货
            that.setData({
                list2: res.data.order,
                total2: res.data.total
            })
            console.log(this, data.list2);
        })
        that.initData(0, 3, res => { // 已完成
            that.setData({
                list3: res.data.order,
                total3: res.data.total
            })
        })
    },
    // 数据初始化
    initData: function (page, order_status, callback) {
        const data = {
            pageSize: 100,
            page,
            order_status
        }
        AbsApi.PreOrder(data).then(res => {
            wx.hideLoading()
            callback(res)
        }).catch(err => {
            wx.hideLoading()
            // wx.showToast({
            //     title: err.message,
            // })
        })
    },
    // 倒计时
    countDown(maxtime) {
        let msg;
        if (maxtime >= 0) {
            var minutes = Math.floor(maxtime / 60);
            if (minutes < 10) {
                minutes = '0' + minutes
            }
            var seconds = Math.floor(maxtime % 60);
            if (seconds < 10) {
                seconds = '0' + seconds
            }
            msg = minutes + ":" + seconds;
            --maxtime;
            this.setData({
                maxtime: maxtime,
                msg: msg
            })
            return msg
        }
    },
    // swiper滑动
    swiperBindChange: function (e) {
        this.setData({
            swiperCurrent: e.detail.current
        })
    },
    // 点击头部导航
    hoverBar: function (e) {
        const inx = e.currentTarget.dataset.inx
        this.setData({
            swiperCurrent: inx
        })
    },
    // 触底
    scrollStop: function (e) {
        const that = this
        const id = e.currentTarget.dataset.id
        const page = "page" + id // 分页
        const list = "list" + id // 数据
        const total = "total" + id // 该分页总条数
        if (this.data[total] == this.data[list].length) return
        that.initData(that.data[page], id, res => {
            that.data[page]++
            that.setData({
                // [list]: that.data[list].push(...res.data.order),
                [list]: that.data[list].concat(res.data.order),
            })
        })
    },
    // 跳转详情
    toOrderDetail: function (e) {
        console.log(e);
        const order_id = e.currentTarget.dataset.order_id
        wx.navigateTo({
            url: '../../../pages-live/pages/orderDetail/orderDetail?order_id=' + order_id,
        })
    },
    // 取消 
    cancelPop(e) {
        this.setData({
            orderId: e.currentTarget.dataset.order_id,
            pop6: true
        })
    },
    cancelPreOrder() {
        const data = {
            order_id: this.data.orderId
        }
        AbsApi.cancelPreOrder(data).then(res => {
            wx.hideLoading()
            this.setData({
                pop6: false
            })
            this.onShow()
        }).catch(err => {
            wx.hideLoading()
            wx.showToast({
                title: err.message,
            })
        })
    },
    popUnShow(e) {
        if (e.currentTarget.dataset.id) {
            this.setData({
                delOrderId: e.currentTarget.dataset.id
            })
        }
        let popup = e.currentTarget.dataset.name;
        this.setData({
            [popup]: !this.data[popup]
        })
    },
    // 删除订单
    deleteOrder() {
        const that = this;
        AbsApi.deletePreOrder({
            order_id: that.data.delOrderId
        }).then(res => {
            if (res.status != 1) {
                wx.showToast({
                    title: res.message,
                    icon: 'none',
                })
                return
            }
            this.setData({
                pop3: false
            })
            wx.showToast({
                title: '删除成功',
                icon: 'none',
            })
            setTimeout(() => {
                that.onShow()
            }, 100)
        })
    },
    // 支付 15:00
    payBtn(e) {
        let orderid = e.currentTarget.dataset.orderid;
        const that = this
        wx.showLoading({
            title: '支付中',
            mask: true
        })
        const data = {
            orderNum: e.currentTarget.dataset.ordernum
        }
        AbsApi.prePay(data).then((res) => {
            wx.hideLoading()
            if (res.status == 1) {
                wx.requestPayment({
                    'timeStamp': res.data.time_stamp,
                    'nonceStr': res.data.nonce_str,
                    'package': res.data.package,
                    'signType': "MD5",
                    'paySign': res.data.pay_sign,
                    'success': function (res) {
                        wx.showLoading({
                            title: '加载中...',
                        })
                        setTimeout(() => {
                            //弹福袋
                            AbsApi.getBouncedLog({
                                type: 2
                            }).then(res => {
                                wx.hideLoading()
                                if (res.status == -1) {
                                    //没弹过福袋
                                    const d = {
                                        type: "2",
                                        activity_id: wx.getStorageSync('activityId')
                                    }
                                    AbsApi.addBouncedLog(d).then(r => {
                                        console.log(r);
                                    })
                                    that.setData({
                                        fudaiId: orderid
                                    })
                                    that.onShow()
                                    that.onfudai()
                                } else {
                                    //已弹过 去详情
                                    wx.navigateTo({
                                        url: '/pages-live/pages/orderDetail/orderDetail?order_id=' + orderid,
                                    })
                                }
                            })
                        }, 1000)
                    },
                    'fail': function (res) {
                        wx.showToast({
                            title: '取消支付',
                            icon: 'none'
                        })
                    }
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: 'none'
                })
            }
        }).catch(err => {
            wx.hideLoading()
            wx.showToast({
                title: err.message,
            })
        })
    },
    // 福袋弹窗
    onfudai: function () {
        this.setData({
            fudaipop: !this.data.fudaipop
        })
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
        var url = e.currentTarget.dataset.item.url
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
})