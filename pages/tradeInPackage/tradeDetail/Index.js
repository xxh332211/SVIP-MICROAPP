import {
  tradeIn
} from "../../../common/api/tradeInApi.js"
let tradeInApi = new tradeIn()
let QRCode = require('../../../utils/qrcode.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showCode:false,
    confirmPoke:false,
    refundPoke:false,
  },
  // 跳转到活动规则
  tradeRule(){
    wx.navigateTo({
      url: '../Rule/Index',
    })
  },
  // 关闭卷码弹窗
  closeCode() {
    this.getTradeOrderDetail({payenter:false})
    this.setData({
      showCode: false
    })
  },
  // 查看卷码
  getCode(){
    this.setData({
      showCode:true
    })
  },
  // 退款
  getRefund(){
    this.getRedeemGoodsRefund()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      orderSn:options.orderSn
    })
    this.getTradeOrderDetail({payenter:options.payenter})
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 换购商品详情页
  getTradeOrderDetail(payenter){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    let data = {
      token:wx.getStorageSync('token'),
      orderSn:this.data.orderSn
    }
    tradeInApi.getTradeOrderDetail(data).then((res)=>{
      wx.hideLoading()
      if(res.status == 1){
        this.setData({
          mobile:res.data.user_info.mobile,
          goods_order_info:res.data.goods_order_info,
          goods_info:res.data.goods_info,
          hxjb_order_info:res.data.hxjb_order_info,
          goods_refund_info:res.data.goods_refund_info,
          redeem_info:res.data.redeem_info
        })
        var beginDate = new Date(res.data.redeem_info.begin_time.replace(/-/g,'/')).getTime()
        var stopDate = new Date(res.data.redeem_info.stop_time.replace(/-/g,'/')).getTime()
        var dataTime = new Date().getTime()

        if(beginDate<dataTime && stopDate > dataTime){
          this.setData({
            isActivetyTime:true
          })
        }
        if(beginDate<dataTime && stopDate > dataTime){
          // 一进入页面显示二维码，网速慢容易显示不出来
            new QRCode("qrcode", {
              text: res.data.goods_order_info.verify_code,
              width: 170,
              height: 170,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H,
            });
            new QRCode("qrcode", {
              text: res.data.goods_order_info.verify_code,
              width: 170,
              height: 170,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H,
            });
        }else{
          new QRCode("qrcode", {
            text: res.data.goods_order_info.verify_code,
            width: 170,
            height: 170,
            colorDark: "#7F7F7F",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
          new QRCode("qrcode", {
            text: res.data.goods_order_info.verify_code,
            width: 170,
            height: 170,
            colorDark: "#7F7F7F",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
        }
        console.log(payenter)
        if(this.data.goods_order_info.delivered == 0 && this.data.isActivetyTime && payenter.payenter){
          this.setData({
            showCode:true
          })
        }
      }else{
        wx.showToast({
          title: res.message,
          icon:'none'
        })
      }
    })
  },
  // 换购订单退款接口
  getRedeemGoodsRefund(){
    wx.showLoading({
      title: '退款中',
      mask:true
    })
    let data = {
      token:wx.getStorageSync('token'),
      orderSn:this.data.orderSn,
      cityId:wx.getStorageSync('cityId')
    }
    tradeInApi.getRedeemGoodsRefund(data).then(res=>{
      wx.hideLoading()
      if(res.status == 1){
        this.getTradeOrderDetail({payenter:false})
      }else{
        wx.showToast({
          title: res.message,
          icon:'none',
          mask:true
        })
      }
      console.log(res)
    })
  }

})