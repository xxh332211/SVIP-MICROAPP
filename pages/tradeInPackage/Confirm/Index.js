import {
  tradeIn
} from "../../../common/api/tradeInApi.js"
let tradeInApi = new tradeIn()
Page({

  /**
   * 页面的初始数据
   */
  data: {},
  // 点击订单进度浮框进入活动规则页面
  toTradeInRule() {
    wx.navigateTo({
      url: '../Rule/Index',
    })
  },

  trandTextBtn() {
    wx.navigateTo({
      url: '../Rule/Index',
    })
  },
  //支付
  confirmPay() {
    this.getPay()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      redeemGoodsId: options.redeemGoodsId
    })
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getConfirmTrade()
    this.getUserOrderNum()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 支付
  getPay() {
    var that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    tradeInApi.getTradePayment({
      payType: 3,
      redeemPrice: this.data.redeem_price,
      redeemGoodsId: this.data.redeem_goods_id,
      goodsId: this.data.goods_id,
      usableSupOrderId: JSON.stringify(this.data.newArr),
      // needOrders:this.data.need_orders,
      token: wx.getStorageSync('token'),
      src: wx.getStorageSync('src') ? wx.getStorageSync('src') : 'YYXCX',
      uis: wx.getStorageSync('uis') ? wx.getStorageSync('uis') : 'huangou'
    }).then((res) => {
      var orderSn = res.data.order_id
      console.log(res)
      if (res.status == 1) {
        wx.requestPayment({
          'timeStamp': res.data.time_stamp,
          'nonceStr': res.data.nonce_str,
          'package': res.data.package,
          'signType': "MD5",
          'paySign': res.data.pay_sign,
          'success': function (res) {
            wx.showToast({
              title: '支付成功！',
              icon: 'none',
              duration: 1000
            })
            setTimeout(() => {
              wx.hideLoading()
              wx.redirectTo({
                url: '../tradeDetail/Index?orderSn=' + orderSn + "&payenter=true",
              })
            }, 1000)
          },
          'fail': function (res) {
            wx.showModal({
              title: '购买失败!',
              content: '购买出现问题，请尝试重新支付',
              confirmColor: "#E5002D",
              success(res) {
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          },
          'complete': function (res) {
            wx.hideLoading()
          }
        })
      } else {
        console.log('err')
        wx.hideLoading()
        wx.showModal({
          title: '购买失败!',
          content: res.message ? res.message : "请求支付出错",
          confirmColor: "#E5002D",
          success(res) {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }
    })
  },
  // 订单进度条
  getUserOrderNum() {
    let data = {
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId'),
      userId: wx.getStorageSync('userInfo').uid
    }
    tradeInApi.getUserOrderNum(data).then(res => {
      if (res.status == 1) {
        let number = res.data.orderNum;
        let newNumber = 0;
        let redeemConf = res.data.redeemConf;
        for (let i in redeemConf) {
          if (number >= Number(redeemConf[i])) {
            newNumber = Number(redeemConf[i])
          }
        }
        this.setData({
          orderNum: newNumber,
          trandInNum: redeemConf
        })
      }
    })
  },
  // 确认换购
  getConfirmTrade() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var data = {
      redeemGoodsId: this.data.redeemGoodsId,
      activityId: wx.getStorageSync('activityId')
    }
    tradeInApi.getConfirmTrade(data).then(res => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          redeem_goods_id: res.data.redeem_goods_id,
          goods_id: res.data.goods_id,
          usableSupplierOrder: res.data.usableSupplierOrder,
          need_orders: res.data.need_orders,
          need_orders_amount: res.data.need_orders_amount,
          goods_name: res.data.goods_name,
          goods_image: res.data.goods_image,
          origin_price: res.data.origin_price,
          redeem_price: res.data.redeem_price,
          usableSupplierOrder: res.data.usableSupplierOrder,
          mobile: res.data.mobile
        })
        var newArr = []
        res.data.usableSupplierOrder.map((item, i) => {
          newArr.push({
            "hx_order_id": item.hx_order_id,
            "supplier_id": item.supplier_id
          })
        })
        this.setData({
          newArr
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none',
          mask: true
        })
      }
    })
  }
})