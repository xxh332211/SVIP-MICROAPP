import cryptoJs from '../../../utils/crypto.js';
import {
  liveApi
} from "../../../common/api/liveApi"
let LiveApi = new liveApi()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:0,
    qiehuan: [{
      txt: '全部',
      id: 0
    }, {
      txt: '待付款',
      id: 1
    }, {
      txt: '待提货',
      id: 2
    },{
      txt: '已完成',
      id: 3
    }],
    isTotalTab: 0, //默认预约商品为红色
    liveOrderList0:[
      {
        "order_status": "4",
        "brand_name": "科勒卫浴",
        "prerogative_name": "限购10",
        "prerogative_description": "限购10",
        "model_number": "xxx10",
        "exclusive_price": "9.00",
        "market_price": "10.00",
        "use_begin_time": "2020-07-01 09:03:47",
        "use_end_time": "2020-07-31 09:03:49",
        "price_unit": "元/踏步",
        "image_url": "https://img.51jiabo.com/8f70138a-eed0-405c-be59-f7d8c265171d.png",
        "earnest": "0.01",
        "buy_count": "3",
        "buy_amount": "0.03",
        "use_status_list": "-1,-1,-1",
        "num": "0",
        "order_id": "4910",
        "isHaveRefund": 0,
        "isCanDel": 1,
        "order_status_text": "订单已取消"
      }
    ],
  },
  // tabbar点击切换
  tabClick(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      isTotalTab: index,
      page:0
    })
    this.PreOrderAll()
  },
  // 点击详情
  detailBtn(e){
    wx.navigateTo({
      url: '../orderDetail/orderDetail?id='+e.detail.id,
    })
  },
  // 点击刪除
  removeBtn(e){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    console.log(e,e.detail.order_id)
    let data = {
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token'),
      order_id:e.detail.order_id
    }
    LiveApi.cancelOrder(data).then((res)=>{
      wx.hideLoading()
      console.log(res)
      if(res.code == 200){
        wx.showToast({
          title: res.message,
          icon:'none'
        })
        this.PreOrderAll()
        this.noCargo()
        this.noOrder()
      }else{
        wx.showToast({
          title: res.message,
          icon:'none'
        })
      }
    })
    console.log('删除订单')
  },
  // 去支付
  payBtn(e){
    var that = this
    wx.showLoading({
      title: '支付中',
      mask:true
    })
    let data = {
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token'),
      orderNum:e.detail.order_num
    }
    LiveApi.ToPay(data).then((res)=>{
      if(res.code == 200){
        wx.requestPayment({
          'timeStamp': res.result.time_stamp,
          'nonceStr': res.result.nonce_str,
          'package': res.result.package,
          'signType': "MD5",
          'paySign': res.result.pay_sign,
          'success': function (res) {
            wx.hideLoading()
            setTimeout(()=>{
              that.PreOrderAll()
            },2000)
          },
          'fail':function(res){
            wx.hideLoading()
            wx.showToast({
              title: '取消支付',
              icon:'none'
            })
          }
        })
      }else{
        wx.hideLoading()
        wx.showToast({
          title: res.message,
          icon:'none'
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.token){
      wx.setStorageSync('token',options.token )
      this.getCode()
    }
    if(options.cityId){
      wx.setStorageSync('cityId',options.cityId)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.noCargo()
    this.noOrder()
    // this.PreOrderAll()
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
    this.setData({
      page: ++this.data.page
    })
    this.PreOrderAll()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
   // 获取code
   getCode(){
    var that = this
    wx.login({
      success(res) {
        if (res.code) {
          that.setData({
            wxcode: res.code
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
        that.login()
      }
    })
  },
  // 同步登录接口
  login(){
    cryptoJs.getAccessToken()
    .then(()=>{
      wx.showLoading({
        title: '加载中',
        mask:true

      })
      var data = {
        ds: cryptoJs.tokenAES(),
        tk: wx.getStorageSync('accessToken'),
        liveToken:wx.getStorageSync('token'),
        wxcode:this.data.wxcode
      }
      LiveApi.synchroLogin(data,'POST').then((res)=>{
        wx.hideLoading()
        console.log(res)
        if(res.status == -2 || res.status == 0){
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }else if(res.status == 1){
          wx.setStorageSync('token', res.data.token)
          wx.setStorageSync('isAuth',true)
          wx.setStorageSync('userInfo', res.data.user_info)
        }else if(res.status == -1){
          wx.showToast({
            title: res.message,
            icon:'none'
          })
          // this.getCode()
        }
      })
    })
  },
  // 直播间订单----全部
  PreOrderAll(){
    var that = this
    wx.showLoading({
      title:'加载中',
      mask:true
    })
    let data = {
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token'),
      pageSize:15,
      page:this.data.page,
      order_status:this.data.isTotalTab
    }
    let test = [
      {
        "order_status": "4",
        "brand_name": "科勒卫浴",
        "prerogative_name": "限购10",
        "prerogative_description": "限购10",
        "model_number": "xxx10",
        "exclusive_price": "9.00",
        "market_price": "10.00",
        "use_begin_time": "2020-07-01 09:03:47",
        "use_end_time": "2020-07-31 09:03:49",
        "price_unit": "元/踏步",
        "image_url": "https://img.51jiabo.com/8f70138a-eed0-405c-be59-f7d8c265171d.png",
        "earnest": "0.01",
        "buy_count": "3",
        "buy_amount": "0.03",
        "use_status_list": "-1,-1,-1",
        "num": "0",
        "order_id": "4910",
        "isHaveRefund": 0,
        "isCanDel": 1,
        "order_status_text": "订单已取消"
      }
    ]
    console.log(that.data.isTotalTab,that.data.page)
    LiveApi.PreOrder(data).then((res)=>{
      wx.hideLoading()
      console.log(res)
      if(res.code == 200){
        if(that.data.isTotalTab == 0 && that.data.page == 0){
          that.setData({
            liveOrderList0:res.result.order
          })
        }else if(that.data.isTotalTab == 0 && that.data.page > 0){
          if(res.result.order.length == 0){
            wx.showToast({
              title: '没有数据了',
              icon: 'none',
              duration: 1000
            })
          }else{
            that.setData({
              liveOrderList0:that.data.liveOrderList0.concat(res.result.order)
            })
          }
        }
        
        if(that.data.isTotalTab == 1 && that.data.page == 0 ){
          that.setData({
            liveOrderList1:res.result.order
          })
        }else if(that.data.isTotalTab == 1 && that.data.page > 0){
          if(res.result.order.length == 0){
            wx.showToast({
              title: '没有数据了',
              icon: 'none',
              duration: 1000
            })
          }else{
            that.setData({
              liveOrderList1:that.data.liveOrderList1.concat(res.result.order)
            })
          }
        }

        if(that.data.isTotalTab == 2 && that.data.page == 0){
          that.setData({
            liveOrderList2:res.result.order
          })
        }else if(that.data.isTotalTab == 2 && that.data.page > 0){
          if(res.result.order.length == 0){
            wx.showToast({
              title: '没有数据了',
              icon: 'none',
              duration: 1000
            })
          }else{
            that.setData({
              liveOrderList2:that.data.liveOrderList2.concat(res.result.order)
            })
          }
        }
      }else{
        wx.navigateTo({
          url: '/pages/login/login',
        })
        wx.showToast({
          title: res.message,
          icon:'none'
        })
      }
    })
  },
  // 直播间订单----待付款
  noOrder(){
    var that = this
    wx.showLoading({
      title:'加载中',
      mask:true
    })
    let data = {
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token'),
      pageSize:15,
      page:this.data.page,
      order_status:1
    }
    LiveApi.PreOrder(data).then((res)=>{
      wx.hideLoading()
      console.log(res)
      if(res.code == 200){
        var a1 = res.result.total;
        var num1 = 'qiehuan[' + 1 + '].num'
        this.setData({
          [num1]:a1,
        })
      }
    })
  },
  // 直播间订单----待提货
  noCargo(){
    var that = this
    wx.showLoading({
      title:'加载中',
      mask:true

    })
    let data = {
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token'),
      pageSize:15,
      page:this.data.page,
      order_status:2
    }
    LiveApi.PreOrder(data).then((res)=>{
      wx.hideLoading()
      if(res.code == 200){
        var a2 = res.result.total;
        var num2 = 'qiehuan[' + 2 + '].num'
        this.setData({
          [num2]:a2,
        })
      }
    })
  },
})