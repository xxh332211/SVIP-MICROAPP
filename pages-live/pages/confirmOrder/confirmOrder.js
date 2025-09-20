import {
  liveApi
} from "../../../common/api/liveApi"
let LiveApi = new liveApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:1,
    price:0,
    showFlag:false
  },
  // 加
  jia(){
    this.CheckPOrderNum('jia')
    // if(this.data.limit_buy_count && this.data.limit_buy_count <= this.data.num){
    //   wx.showToast({
    //     title: '已达到最大限购数量',
    //     icon:'none'
    //   })
    // }else{
    //   var num = this.data.num += 1
    //   if(this.data.pay_way == 1){
    //     var price = this.data.earnest
    //   }else if(this.data.exclusive_price){
    //     var price = this.data.exclusive_price
    //   }else{
    //     var price = this.data.market_price
    //   }
    //   this.setData({
    //     num:num,
    //     priceMore:num * price
    //   })
    // }
    
  },
  // 减
  jian(){
    this.CheckPOrderNum('jian')
    // console.log(this.data.num)
    // if(this.data.num <=1){
    //   wx.showToast({
    //     title: '已达到最小值',
    //     icon:'none'
    //   })
    // }else{
    //   var num = this.data.num -= 1
    // }
    // this.setData({
    //   num:num ,
    //   priceMore:num * this.data.price
    // })
  },
  // 点击好的
  goodBtn(){
    this.setData({
      showFlag:false
    })
  },
  // 获取备注
  remarksInput(e){
    this.setData({
      remarks:e.detail.value
    })
  },
  // 点击提交订单
  confirmOrder(){
    this.createOrder()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.src){
      wx.setStorageSync('src', options.src)
    }
    if(options.uis){
      wx.setStorageSync('uis', options.uis)
    }
    var shopDetail = JSON.parse(options.shopDetail)
    console.log(shopDetail)
    if(shopDetail.pay_way == 1){
      var price = shopDetail.earnest
    }else if(shopDetail.exclusive_price){
      var price = shopDetail.exclusive_price
    }else{
      var price = shopDetail.market_price
    }
    this.setData({
      liveId:options.liveId != 'undefined'?options.liveId:'',
      supplierShopInfo:shopDetail.supplierShopInfo,
      main_image:shopDetail.main_image,
      prerogative_name:shopDetail.prerogative_name,
      exclusive_price:shopDetail.exclusive_price,
      market_price:shopDetail.market_price,
      earnest:shopDetail.earnest,
      limit_buy_count:shopDetail.limit_buy_count,
      is_limit_purchase:shopDetail.is_limit_purchase,
      main_image:shopDetail.main_image,
      pay_way:shopDetail.pay_way,
      id:shopDetail.id,
      logo_url:shopDetail.supplierShopInfo.logo_url,
      priceMore:this.data.num * price,
      delivery_way:shopDetail.delivery_way
    })
    
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
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },


  // 检查剩余可购买数量
  CheckPOrderNum(name){
    if(name == 'jia'){
      if(this.data.num >= this.data.limit_buy_count && this.data.is_limit_purchase == 1){
        wx.showToast({
          title: '已达到限购值',
          icon:'none'
        })
        return false
      }else{
        var num = this.data.num += 1
        // ++ maxnum
      }
    }else{
      if(this.data.num <= 1){
        wx.showToast({
          title: '已达到最小值',
          mask:true,
          icon:'none'
        })
        return false
      }else{
        var num = this.data.num -= 1
      }
    }
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var data = {
      prerogative_id:this.data.id,
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token'),
      num:num
    }
    LiveApi.CheckPOrderNum(data).then((res)=>{
      wx.hideLoading()
      if(res.code == 200){
        if(this.data.num > res.result.num){
          wx.showToast({
            title: res.message,
            icon:'none'
          })
        }
        this.setData({
          num:parseInt(res.result.num),
          priceMore:res.result.totalMoney
        })
      }else if(res.message == '请登录后再试'){
        wx.showToast({
          title: res.message,
          mask:true,

          icon:'none'
        })
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }else{
        wx.showToast({
          title: res.message,
          mask:true,

          icon:'none'
        })
      }
      console.log(res)
    })
  },
  // 直播商品购买
  createOrder(){
    var that = this
    wx.showLoading({
      title: '支付中',
      mask:true
    })
    let data = {
      src:wx.getStorageSync('src')?wx.getStorageSync('src'):'YYXCX',
      uis:wx.getStorageSync('uis')?wx.getStorageSync('uis'):'dianpu',
      prerogative_id:this.data.id,
      buyCount:this.data.num,
      fromClient:'xcx',
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token'),
      remarks:this.data.remarks?this.data.remarks:'',
      room_id:this.data.liveId,
      user_name:wx.getStorageSync('userInfo').nick_name
    }
    LiveApi.createOrder(data).then((res)=>{
      wx.hideLoading()
      if(res.code == 200){
        var order_id = res.result.order_id
        wx.requestPayment({
          'timeStamp': res.result.time_stamp,
          'nonceStr': res.result.nonce_str,
          'package': res.result.package,
          'signType': "MD5",
          'paySign': res.result.pay_sign,
          'success': function (res) {
            that.getPreOrderDetail(order_id)
            // wx.showToast({
            //   title: '支付成功！',
            //   mask:true,
            //   complete() {
            //     setTimeout(()=>{
            //       wx.reLaunch({
            //         url: '../orderDetail/orderDetail?id='+order_id,
            //       })
            //     },1000)
            //   }
            // })
          },
          'fail':function(res){
            console.log(res)
            wx.hideLoading()
            wx.showToast({
              title: '取消支付',
              mask:true,

              icon:'none',
              duration: 1000,
              complete() {
                wx.redirectTo({
                  url: '../orderDetail/orderDetail?id='+order_id,
                })
              }
            })
          }
        })
      }else if(res.status == '-2'){
        wx.showToast({
          title: res.message,
          mask:true,

          icon:'none'
        })
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }else if(res.code == 400){
        this.setData({
          errorDetail:res.message,
          showFlag:true
        })
      }else{
        wx.showToast({
          title: res.message,
          mask:true,

          icon:'none'
        })
      }
      console.log(res)
    })
  },
  /*
    支付成功后调用订单详情来判断是否支付成功
    支付成功后后端拿到支付需要一定时间
    前端给1s的延时器也不行的  
  */ 
  getPreOrderDetail(order_id){
    var that = this
    wx.showLoading({
      title: '加载中'
    })
    var order_id = order_id
    let data = {
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token'),
      detail_id:order_id
    }
    LiveApi.PreOrderDetail(data).then((res)=>{
      console.log(res)
      if(res.result.order_status == '2'){
        wx.hideLoading()
        wx.redirectTo({
          url: '../orderDetail/orderDetail?id='+order_id,
        })
      }else{
        setTimeout(() => {
          that.getPreOrderDetail(order_id)
        }, 100);
      }
    })
  }
})