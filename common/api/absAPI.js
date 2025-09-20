import {
    httpAsync
} from '../http/http-async.js'

class absApi extends httpAsync {
    // 加载
    loading() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
    }
    // 秒光光商品详情接口
    preGoodsDetail(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/preGoodsDetail',
            data,
        })
    }
    // 兑换卡退款接口
    cardOrderRefund(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/cardOrderRefund',
            data,
        }, 'POST')
    }
    // 兑换卡商品详情页
    exchangeCardDetail(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/exchangeCardDetail',
            data
        }, 'POST')
    }
    // 线上订单列表
    PreOrder(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/preOrderList',
            data,
        }, 'POST')
    }
    // 秒光光商品 订单 详情
    preOrderDetail(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/preOrderDetail',
            data
        }, 'POST')
    }
    // 新版线上订单详情
    onlineOrderDetail(data) {
        this.loading()
        return this.requestNew({
            url: '/shopmall/prerogativeOrderDetail',
            data
        }, 'POST')
    }
    //展会订单详情
    expoOrderDetail(data) {
        this.loading()
        return this.requestNew({
            url: '/shopmall/order/orderDetail',
            data
        }, 'POST')
    }
    //新删除订单
    deleteOrder(data) {
        return this.requestNew({
            url: "/shopmall/order/deleteXcxOrder",
            data
        }, 'POST')
    }
    //新线上商品订单退款接口
    onlineOrderRefund(data) {
        return this.requestNew({
            url: "/shopmall/prerogativeOrderRefund",
            data
        }, 'POST')
    }
    // 秒光光商品取消订单接口
    cancelPreOrder(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/cancelPreOrder',
            data
        }, 'POST')
    }
    // 获取秒光光品牌列表
    getBrandList(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/getBrandList',
            data
        })
    }
    // 秒光光商品确认订单支付接口
    preGoodsPayment(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/preGoodsPayment',
            data
        }, 'POST')
    }
    // 兑换卡兑换商品
    exchangeGoodsDo(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/exchangeGoodsDo',
            data
        }, 'POST')
    }
    // 秒光光商品删除订单接口
    deletePreOrder(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/deletePreOrder',
            data
        }, 'POST')
    }
    // 秒光光商品退款接口
    refundPreOrder(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/refundPreOrder',
            data
        }, 'POST')
    }
    // 特权商品收藏&取消收藏接口接口
    preCollect(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/preCollect',
            data
        }, 'POST')
    }
    // 秒光光商品根据订单号支付接口
    prePay(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/prePay',
            data
        }, 'POST')
    }
    // 获取兑换卡订单列表
    getExchangeOrder(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/getExchangeOrder',
            data
        })
    }
    // 商品详情页
    goodsDetail(data) {
        this.loading()
        return this.requestNew({
            url: '/abs/goodsDetail',
            data
        }, 'POST')
    }


    // 添加购买意向
    addBuyPurpose(data) {
        return this.requestNew({
            url: "/ticket/addBuyPurpose",
            data: data
        }, "POST")
    }
    // 获取秒光光商品列表
    // getAbsGoodsList(data) {
    //     return this.requestNew({
    //         url: "/abs/getGoodsList",
    //         data: data
    //     }, "POST")
    // }
    getAbsGoodsList(data) {
        return this.requestNew({
            url: "/abs/getGoodsListNew",
            data: data
        }, "POST")
    }
    //添加用户浏览商品/店铺记录
    addBrowseHistory(data) {
        return this.requestNew({
            url: "/abs/addAction",
            data: data
        }, "POST")
    }
    //获取浏览记录
    getBrowseHistory() {
        return this.requestNew({
            url: "/abs/getAction"
        })
    }
    //提交吐槽箱意见
    addOpinion(data) {
        return this.requestNew({
            url: "/abs/addFeedback",
            data: data
        }, "POST")
    }
    //获取分享id
    getInviteId() {
        return this.requestNew({
            url: "/abs/addShare"
        }, "POST")
    }
    //加入分享
    joinShare(data) {
        return this.requestNew({
            url: "/abs/joinShare",
            data: data
        }, "POST")
    }
    //获取分享商品
    getShareGoods(data) {
        return this.requestNew({
            url: "/abs/getShare",
            data: data
        })
    }
    //获取兑换卡商品列表
    getExchangeGoods(data) {
        return this.requestNew({
            url: "/abs/getExchangeGoods",
            data: data
        })
    }
    // 添加abs弹框日志
    addBouncedLog(data) {
        return this.requestNew({
            url: "/abs/addBouncedLog",
            data: data
        })
    }
    //获取abs弹窗日志
    getBouncedLog(data) {
        return this.requestNew({
            url: "/abs/getBouncedLog",
            data: data
        })
    }
    //我的收藏接口
    myCollection() {
        return this.requestNew({
            url: "/shopmall/myCollection"
        })
    }
    //首页模块数据请求
    mallPage(data) {
        return this.requestNew({
            url: "/shopmall/mallPage",
            data
        },'POST')
    }
    //首页下方商品列表
    mallPageCategoryList(data) {
        return this.requestNew({
            url: "/shopmall/preGoodsList",
            data
        },'POST')
    }
}

export {
    absApi
}