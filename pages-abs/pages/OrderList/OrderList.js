// pages-abs/pages/OrderList/OrderList.js
import {
    absApi
} from '../../../common/api/absAPI'
const AbsApi = new absApi();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pop1: false,
        pop2: false,
        list: []
    },
    // 生命周期函数--监听页面加载
    onLoad: function (options) {
        this.initGetExchangeOrder()
    },
    // 去兑换
    ToExchange: function (e) {
        let id = e.currentTarget.dataset.id,
            cid = e.currentTarget.dataset.corderid;
        wx.navigateTo({
            url: '../exchangeList/exchangeList?cardId=' + id + "&cardOrderId=" + cid,
        })
    },
    // 退款
    Refund: function (e) {
        wx.showLoading({
            title: '退款中...',
            mask: true
        })
        const data = {
            uid: wx.getStorageSync('userInfo').uid,
            card_order_sn: this.data.order_sn
        }
        AbsApi.cardOrderRefund(data).then(res => {
            wx.hideLoading()
            this.setData({
                pop1: false
            })
            if (res.status == 1) {
                this.setData({
                    pop2: true
                })
            } else {
                wx.showToast({
                    title: res.message,
                    icon: "none"
                })
            }
        })
    },
    // 关闭&开启弹窗
    popUnShow: function (e) {
        const order_sn = e.currentTarget.dataset.ordersn
        const name = e.currentTarget.dataset.name
        if (name == "pop2") {
            this.initGetExchangeOrder()
        }
        this.setData({
            [name]: !this.data[name]
        })
        if (order_sn) {
            this.setData({
                order_sn: order_sn
            })
        }
    },
    // 数据初始化
    initGetExchangeOrder: function () {
        const that = this;
        AbsApi.getExchangeOrder().then(res => {
            wx.hideLoading()
            res.data.map(v => {
                let eTime = v.use_end_time.replace(/-/g, "/"),
                    now = +new Date();
                if (now > +new Date(eTime)) {
                    v.isOut = true;
                } else {
                    v.isOut = false;
                }
                v.use_begin_time = v.use_begin_time.slice(0, 11).replace(/-/g, ".")
                v.use_end_time = v.use_end_time.slice(0, 11).replace(/-/g, ".")
            })
            console.log(res.data)
            that.setData({
                list: res.data
            })
            // console.log(res);
        })
    },
    // 查看商品
    toProductDetails: function (e) {
        const prerogative_order_id = e.currentTarget.dataset.orderid;
        wx.navigateTo({
            url: '/pages-live/pages/orderDetail/orderDetail?order_id=' + prerogative_order_id
        })
    },
})