import cryptoJs from '../../../utils/crypto.js';
import {
  liveApi
} from "../../../common/api/liveApi"
let LiveApi = new liveApi()
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  marketing
} from "../../../common/api/marketingApi"
let MarketApi = new marketing()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLive:true,
    showFlag:false,
    showPopup:false,
    showTop:false,
    imgheights:[],    //所有图片的高度  
    current:0
  },
  imageLoad(e){
    //当图片载入完毕时
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
      // 计算的高度值
    var viewHeight = 750 / ratio;
    var imgheight = viewHeight;
    var imgheights = this.data.imgheights;
    //把每一张图片的对应的高度记录到数组里  
    imgheights[e.target.dataset.id] = imgheight;
    this.setData({
      imgheights: imgheights
    })
  },
  bindchange: function (e) {// current 改变时会触发 change 事件
    this.setData({ current: e.detail.current })
  },
  // 点击返回顶部
  top(){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  // 进入店铺
  open_shop(){
    var supplier_id = this.data.supplierShopInfo.supplier_id
    wx.redirectTo({
      url: '../storeDetail/storeDetail?supplier_id='+supplier_id + "&getPageBoolean=true",
    })
  },
  // 领取优惠券
  getCoupon(e){
    if(wx.getStorageSync('token')){
      var coupon_id =  e.currentTarget.dataset.coupon_id
      var user_id =  e.currentTarget.dataset.user_id
      if(user_id > 0){
        return 
      }else{
        this.setData({
          coupon_id:coupon_id
        })
        this.MarketApi()
      }
    }else{
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
    
  },
  // 关闭优惠券
  hideTickek(){
    this.setData({
      showFlag:false,
      showPopup:false
    })
  },
  showTicket(){
    this.setData({
      showFlag:true,
      showPopup:true
    })
  },
  // 点击直播小窗口
  forkBtn(){
    this.setData({
      showLive:false
    })
  },
  // 点击直播间图片进入直播小程序
  navLive(e){
    wx.navigateToMiniProgram({
      appId: 'wx8e0746fdfcbf770c',
      path: '/pages/liveRoom/liveRoom?token='+ wx.getStorageSync('token') + '&cityId=' + wx.getStorageSync('cityId') + '&liveId=' + e.currentTarget.dataset.liveid,
      envVersion: "trial"
    })
  },
  // 点击进入我的
  mineBtn(){
    if(!wx.getStorageSync('token')){
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }else{
      wx.navigateTo({
        url:"/pages/user/myOrder/myOrder"
      })
    }
  },
  // 点击蒙版关闭优惠券
  showFlag(){
    this.setData({
      showFlag:false,
      showPopup:false
    })
  },
  // 立即购买
  payBtn(){
    if(!wx.getStorageSync('token')){
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }else{
      var shopDetail = JSON.stringify(this.data.shopDetail)
      wx.navigateTo({
        url: '../confirmOrder/confirmOrder?shopDetail='+shopDetail + '&liveId=' +this.data.liveId,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      liveId:options.liveId,
      liveImg:options.liveImg,
      options:options
    })
    if(options.token){
      wx.setStorageSync('token', options.token)
      this.getCode()
    }
    if (options.cityId) {
      wx.setStorageSync('cityId', options.cityId)
      SvipApi.activityInfo({
        cityId:options.cityId
      }).then((res) => {
        wx.setStorageSync("activityId", res.activity_id)
      })
      this.getPrivilegeDetail(options)
    }else{
      this.getPrivilegeDetail(options)
    }
    
  },
  // 获取滚动条的高度
  onPageScroll: function(e) {
    if(e.scrollTop >= this.data.imgheights[this.data.current]/2){
      this.setData({
        showTop:true
      })
    }else{
      this.setData({
        showTop:false
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from == 'button') {
      console.log(res.target, res)
    }
    return {
      title:this.data.prerogative_name,
      path:'/pages-live/pages/shopDetail/shopDetail?id='+this.data.id ,//这里是被分享的人点击进来之后的页面
      imageUrl: this.data.main_image[0].image_url //这里是图片的路径
    }
  },
   // 领取优惠券
   MarketApi(){
    var that = this
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    let data = {
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token'),
      src:wx.getStorageSync('src'),
      uis:wx.getStorageSync('uis'),
      'From-Client':'wx-xcx',
      mobile:wx.getStorageSync('userInfo').mobile,
      source_id:this.data.coupon_id,
      src_id:'coupon',
      invite:'',
      isSendSms:0
    }
    MarketApi.postReserve(data).then((res)=>{
      console.log(res)

      wx.hideLoading()
      if(res.code == 200){
        that.getPrivilegeDetail(that.data.options)
      }else{
        wx.showToast({
          title: res.message,
          mask:true,
          icon:'none'
        })
      }
    })
  },
  // 获取商品信息
  getPrivilegeDetail(options){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var data = {
      prerogative_id:options.id,
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityId'),
      Token:wx.getStorageSync('token')
    }
    LiveApi.privilegeDetail(data).then((res)=>{
      wx.hideLoading()
      if(res.code == 200){
        wx.setNavigationBarTitle({
          title:res.result.description
        })
        var SelectDate = new Date().getTime()
        var begin_time = new Date(res.result.begin_time.replace(/-/g,'/')).getTime()
        var end_time = new Date(res.result.end_time.replace(/-/g,'/')).getTime()
        console.log(SelectDate,begin_time,end_time,'时间')
        if(SelectDate >= begin_time && SelectDate <= end_time && res.result.stock_count > 0){
          this.setData({
            showDatePay:true
          })
        }else if(SelectDate >= begin_time && SelectDate <= end_time && res.result.stock_count <= 0){
          this.setData({
            showDatePay:false,
            payName:'已抢光'
          })
        }else{
          this.setData({
            showDatePay:false,
            payName:'商品已下架'
          })
        }
        this.setData({
          prerogative_name:res.result.prerogative_name,
          description:res.result.description,
          model_number:res.result.model_number,
          exclusive_price:res.result.exclusive_price,
          market_price:res.result.market_price,
          sold_stock_count:res.result.sold_stock_count,
          main_image:res.result.main_image,
          detail_images:res.result.detail_images,
          supplierShopInfo:res.result.supplierShopInfo,
          coupon:res.result.coupon,
          earnest:res.result.earnest,
          define_price:res.result.define_price,
          shopDetail:res.result,
          pay_way:res.result.pay_way,
          id:res.result.id,
          supplier_id:res.result.supplier_id,
          price_unit:res.result.price_unit,
          is_openprice:res.result.is_openprice
        })
      }else{
        wx.showToast({
          title: res.message,
          mask:true,
          icon:'none'
        })
      }
    })
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
        console.log(res)
        wx.hideLoading()
        if(res.status == -2 || res.status == 0){
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }else if(res.status == 1){
          wx.setStorageSync('isAuth',true)
          wx.setStorageSync('userInfo', res.data.user_info)
          wx.setStorageSync('token', res.data.token)
        }else if(res.status == -1){
          wx.showToast({
            title: res.message,
            mask:true,
            icon:'none'
          })
        }
      })
    })
  },
})