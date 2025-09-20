// pages/tradeInPackage//Detail/Index.js
import {
  svip
} from "../../../common/api/svipApi.js"
const SvipApi = new svip()
import {
  tradeIn
} from "../../../common/api/tradeInApi.js"
let tradeInApi = new tradeIn()
import {
  util
} from "../../../common/util"
const app = getApp()
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome'
]
Page({

  /**
   * 页面的初始数据
   */
  data: {
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }
    if (options.detail_id) {
      this.goodsId = options.detail_id;
    }
    if (options.cityId) {
      wx.setStorageSync('cityId', options.cityId)
    }
    if (!wx.getStorageSync('uis')) {
      wx.setStorageSync('uis', "换购商品详情页")
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
      if(!wx.getStorageSync('token')){
        this.setData({
          isToken:true
        })
      }else{
        this.setData({
          isToken:false
        })
      }
    if (!wx.getStorageSync('cityId')) {
      wx.navigateTo({
        url: '/pages/address/index?src=tradeDetail',
      })
      return
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //判断有无开放售卖svip
    SvipApi.activityInfo({
      cityId: wx.getStorageSync('cityId')
    }).then((res) => {
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      if (res.is_active == 0) {
        this.setData({
          disableBuySvip: true
        })
      }
      //获取商品详情
      this.getGoodsDetail()
      // 获取用户是否已经有门票
      this.hasGetTicket()
      // 判断是否为展中
      this.getActivityInfo()
    })
  },

  //获取商品详情
  getGoodsDetail() {
    let that = this
    tradeInApi.getTradeInDetail({
      goodsId: this.goodsId
    }).then(res => {
      if (res.status == 1) {
        wx.hideLoading()
        this.setData({
          goodsDetail: res.data
        })
            //获取弹层运营位
          SvipApi.getAdvList({
            area_id: "52"
          }).then((res) => {
            if (res.status == 1) {
              that.setData({
                tradeAdv: res.data.adv52 || [],
              })
            } else {
              that.setData({
                tradeAdv: []
              })
            }
          })
        if (this.stop) {
          clearInterval(this.stop);
        }
        // 换购开始倒计时
        let begDate = new Date(this.data.goodsDetail.begin_time.replace(/-/g, "/")).getTime();
        let endDate = new Date(this.data.goodsDetail.stop_time.replace(/-/g, "/")).getTime();
        let nowTime = new Date().getTime();
        let countTime = 0;

        let startTime = new Date(this.data.goodsDetail.begin_time.replace(/-/g, "/")).getTime();
        let endTime = new Date(this.data.goodsDetail.stop_time.replace(/-/g, "/")).getTime();
        if (nowTime < startTime) {
          //未开始
          countTime = begDate - nowTime;
          this.setData({
            notBegin: true,
            isEnd: true
          })
        } else if (nowTime > endTime) {
          //已结束
          this.setData({
            isEnd: true
          })
        } else {
          //已开始
          countTime = endDate - nowTime;
          this.setData({
            isBegin: true
          })
        }
        if (countTime > 0) {
          //倒计时
          this.stop = setInterval(() => {
            let days = Math.floor(countTime / 1000 / 60 / 60 / 24);
            let hours = Math.floor(countTime / 1000 / 60 / 60 % 24);
            let minute = Math.floor((countTime / 1000 / 60) % 60);
            let second = Math.floor((countTime / 1000) % 60);
            this.setData({
              days: days < 10 ? "0" + days : days,
              hours: hours < 10 ? "0" + hours : hours,
              minute: minute < 10 ? "0" + minute : minute,
              second: second < 10 ? "0" + second : second
            })
            if (countTime <= 0) {
              this.setData({
                days: "00",
                hours: "00",
                minute: "00",
                second: "00"
              })
              clearInterval(this.stop);
              return false;
            } else {
              countTime -= 1000;
            }
          }, 1000);
        } else {
          this.setData({
            days: "00",
            hours: "00",
            minute: "00",
            second: "00"
          })
        }
      } else {
        wx.showToast({
          title: res.message ? res.message : "请求出错了",
          icon: "none"
        })
      }
    })
  },
  // 判断url是否为tabbar
  isTab(url) {
    for (let item of tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },
    //运营位链接跳转
    swiperUrl(e) {
      wx.setStorageSync('src', 'YYXCX')
      wx.setStorageSync('uis', '换购详情页')
      
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
        if(this.isTab(url)){
          wx.switchTab({
            url
          })
          
        }else{
          wx.navigateTo({
            url
          })
        }
      } else if (type == 2) {
        wx.navigateToMiniProgram({
          appId: e.currentTarget.dataset.item.appid,
          path: e.currentTarget.dataset.item.url,
          complete(res) {
  
          }
        })
      } else {
        wx.navigateTo({
          url: '/pages/web/web?url=' + encodeURIComponent(e.currentTarget.dataset.item.url)
        })
      }
    },
  toSvipHome() {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },

  toSaleBuy(e) {
    let id = e.currentTarget.dataset.id
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        //限制svip直接购买
        if (res.data.svip == 1) {
          //是svip跳转svip商品购买页
          wx.navigateTo({
            url: '/pages/svipPackage/payProductDetail/payProductDetail?id=' + id,
          })
        } else {
          this.setData({
            phoneNum: wx.getStorageSync('userInfo').mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
            showBuySvip: true
          })
        }
      } else {
        if (res.status == -2) {
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  },

  //授权手机号
  getPhoneNumber(e) {
    let that = this
      util.authorizePhone(e, this.data.wxcode , () => {
        that.setData({
          isAuth: true
        })
        //获取页面所有接口信息
        that.onShow()
      })
  

  },

  toTradeBuy(e) {
    console.log(e)
    let that = this
    let id = e.currentTarget.dataset.id
    if(!wx.getStorageSync('token')){
      return
    }
    // 换购未开始，弹出弹框
    if(this.data.isEnd){
      this.setData({
        showTicket:true
      })
      return
    }



    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        //已登录
        if (this.data.goodsDetail.limit_svip == 1) {
          //限制svip换购
          if (res.data.svip == 1) {
            wx.navigateTo({
              url: '/pages/tradeInPackage/Confirm/Index?redeemGoodsId=' + id,
            })
          } else {
            this.setData({
              phoneNum: wx.getStorageSync('userInfo').mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
              showBuySvip: true
            })
          }
        } else {
          wx.navigateTo({
            url: '/pages/tradeInPackage/Confirm/Index?redeemGoodsId=' + id,
          })
        }
      } else {
        if (res.status == -2) {
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  },
  cancel() {
    this.setData({
      showBuySvip: false
    })
  },
  buySvip() {
    this.setData({
      showBuySvip: false
    })
    wx.navigateTo({
      url: '/pages/svipPackage/paySvip/paySvip?origin=tradeInDetail',
    })
  },

  // 关闭换购弹窗
  fork(){
    this.setData({
      showTicket:false
    })
  },

  // 免费索票
  redTicket(){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    tradeInApi.getRequestTicket({
      cityId:wx.getStorageSync('cityId'),
      userId:wx.getStorageSync("userInfo").uid,
      src:'YYXCX',
      uis:'换购按钮'
    }).then((res) => {
      wx.hideLoading()
      console.log(res)
      if(res.status == 1){
        this.setData({
          showTicket:false
        })
        wx.navigateTo({
          url: '/pages/expoPackage/getTicketSuccess/getTicketSuccess?type=1',
        })
      }
    })
  },

  // 判断是否已索票
  hasGetTicket(){
    tradeInApi.hasGetTicket({
      userId:wx.getStorageSync('userInfo').uid,
      activityId:wx.getStorageSync("activityId")
    }).then((res) => {
      if(res.status == 1){
        this.setData({
          isTicket:res.data.hasTicket
        })
      }
    })
  },

  // 获取展届信息
  getActivityInfo(){
    SvipApi.activityInfo({cityId:wx.getStorageSync('cityId')}).then((res)=>{
      wx.setStorageSync("nextActivity", res)
      if (res.begin_date <= res.buy_time && res.end_date >= res.buy_time) {
        // 展中
        this.setData({
          isActive:true,
        })
      }
      this.setData({
        begin_date:res.begin_date,
        end_date:res.end_date,
        venue_name:res.venue_name,
      })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.stop) {
      clearInterval(this.stop);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.stop) {
      clearInterval(this.stop);
    }
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
    return {
      title: this.data.goodsDetail.goods_name,
      path: "/pages/tradeInPackage/Detail/Index?detail_id=" + this.data.goodsDetail.red_goods_id + "&cityId=" + wx.getStorageSync("cityId") ,
      imageUrl: this.data.goodsDetail.goods_image
    }
  }
})