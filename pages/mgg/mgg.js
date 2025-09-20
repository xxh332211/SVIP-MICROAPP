// pages/mgg/mgg.js
import {
  svip
} from "../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  absApi
} from "../../common/api/absAPI.js"
let AbsApi = new absApi()
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  util
} from "../../common/util.js"
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.from == "share") {
      wx.setStorageSync('src', "YYXCX")
    }
    if (options.userCityId) {
      wx.setStorageSync('cityId', options.userCityId)
    }
    let cityId = wx.getStorageSync('cityId');
    if (cityId != 1 && cityId != 2 && cityId != 3 && cityId != 6 && cityId != 7 && cityId != 8 && cityId != 14 && cityId != 15 && cityId != 17 && cityId != 19 && cityId != 23 && cityId != 54) {
      wx.switchTab({
        url: '/pages/cloudShow/cloudShow',
      })
      return
    }
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
    this.setData({
      navigateHeight: app.systemData.statusBarHeight,
      selected: 2,
      actOffLine: false
    })
    this.detailTop = []
    //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
    if (!cityId && wx.getStorageSync("isLocation")) {
      wx.navigateTo({
        url: '/pages/address/index?src=mgg',
      })
      return
    } else if (cityId) {
      //获取页面所有接口信息
      this.getRequestInfo()
    } else {
      //定位
      util.getPositionCity("mgg", () => {
        this.setData({
          curUserCityText: wx.getStorageSync('curUserCityText')
        })
        //定位成功请求数据
        this.getRequestInfo()
      })
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
    this.setData({
      showTicketPopup: false,
      showCouponPopup: false,
      showCouponBtn: false,
      isLogin: wx.getStorageSync("isLogin")
    })
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
    // 友盟统计
    wx.uma.trackEvent('enter_mgg_list', {
      userCityId: wx.getStorageSync('cityId'),
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
    this.checkHasTicket()
    this.getSvipCoupon()
  },

  getSvipCoupon(detail) {
    //已登录&&当天首次登录&&有抵扣券 || 未登录&&有抵扣券 ，显示抵扣券弹层
    SvipApi.firstLoginCheck().then((res) => {
      if (res.status == 1) {
        if (res.data.firstStatus == 1 && !detail) {
          //获取svip抵扣券列表
          this.svipCouponData()
        } else {
          this.setData({
            showCouponPopup: false
          })
        }
        //判断用户是否有未使用svip抵扣券并且非svip，有则弹优惠券按钮
        SvipApi.userSvipCouponData().then((res) => {
          if (res.status == 1 && res.data.is_show == 1) {
            this.setData({
              showCouponBtn: true
            })
          }
        })
      } else {
        //获取svip抵扣券列表
        this.svipCouponData()
      }
    })
  },

  getRequestInfo() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.activityInfo({
      cityId: wx.getStorageSync('cityId')
    }).then((res) => {
      this.setData({
        expoEndTime: res.end_date,
        curUserCityText: res.city_name
      })
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      //获取视频号信息
      let that = this;
      if (wx.getChannelsLiveInfo){
        wx.getChannelsLiveInfo({
          finderUserName: "sphTgeTCjc7M4Ri",
          success(res) {
            that.setData({
              liveData: res
            })
          },
          fail(res) {
            console.log(res)
          }
        })
      }
      //获取运营位
      SvipApi.getAdvList({
        area_id: "61,62,78"
      }).then((res) => {
        // 61:获取banner 61:品牌列表入口运营位
        if (res.status == 1) {
          this.setData({
            banner: res.data.adv61 || [],
            brandAdv: res.data.adv62 || [],
            liveAdv: res.data.adv78 || []
          })
        } else {
          this.setData({
            banner: [],
            brandAdv: [],
            liveAdv: [],
          })
        }
        //获取秒杀档位及对应商品
        AbsApi.getAbsGoodsList().then((res) => {
          if (res.status == 1) {
            let data = res.data.map((v) => {
              v.id = `level-${v.id}`;
              v.type = "number";
              return v
            })
            let tData = JSON.parse(JSON.stringify(data));
            tData.push({
                level_content: "采购清单",
                id: "shoppingList",
                type: "string"
              },
              // {
              //   level_content: "主题馆",
              //   id: "themePavilion",
              //   type: "string"
              // }, 
              {
                level_content: "最近浏览",
                id: "browseHistory",
                type: "string"
              }, {
                level_content: "吐槽箱",
                id: "opinion",
                type: "string"
              })
            let endDate = +new Date(res.data[0].activity_end_time.replace(/-/g, "/")),
              now = +new Date();
            this.setData({
              tabData: tData,
              goodsList: data,
              actEnd: now > endDate ? true : false
            })
            //获取爆品组
            marketingApi.getGoodsGroup().then((res) => {
              if (res.status == 1) {
                this.setData({
                  goodsGroup: res.data
                })
              }
              //获取浏览记录
              AbsApi.getBrowseHistory().then((res) => {
                if (res.status == 1) {
                  this.setData({
                    historyData: res.data
                  })
                }
                setTimeout(() => {
                  this.getHeadTop()
                }, 1000);
              })
            })
          } else {
            wx.hideLoading()
            this.setData({
              goodsList: [],
              actOffLine: true
            })
          }
        })
      })
    })
  },
  //svip抵扣券列表
  svipCouponData() {
    let that = this;
    SvipApi.svipCouponData().then((res) => {
      if (res.status == 1 && res.data.coupon_list && res.data.coupon_list.length > 0) {
        that.setData({
          couponInfo: res.data.coupon_list,
          showCouponPopup: true
        })
      }
    })
  },
  closeCouponPopup() {
    this.setData({
      showCouponPopup: false
    })
  },
  //授权手机号回调
  getPhoneBack(e) {
    let detail = e.detail;
    this.setData({
      isAuth: true,
      isLogin: true
    })
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getSvipCoupon(detail)
  },
  //是否索票
  checkHasTicket() {
    if (wx.getStorageSync("src") == "pyqabs") {
      let outTime = new Date().getTime();
      marketingApi.getTicketsInfo().then((res) => {
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
        isAuth: true,
        isLogin: true
      })
      this.getSvipCoupon()
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
  getHeadTop() {
    const that = this;
    const query = wx.createSelectorQuery();
    query.select('#navigate').boundingClientRect(rect => {
      this.setData({
        top: rect ? rect.height : 62
      })
    }).exec();
    query.select('.tab-box').boundingClientRect(rect => {
      this.setData({
        height: app.systemData.screenHeight - rect.height,
        marginTop: rect.height + this.data.top
      })
      for (let i of that.data.tabData) {
        const query2 = wx.createSelectorQuery();
        query2.select(`#${i.id}-detail`).boundingClientRect()
        query2.selectViewport().scrollOffset()
        query2.exec(function (res) {
          if (res[0]) {
            that.detailTop.push({
              id: i.id,
              height: res[0] && res[0].height,
              top: Math.floor(res[0].top - that.data.marginTop)
            })
          }
        })
      }
      wx.hideLoading()
      console.log(that.detailTop)
    }).exec();
  },

  //选择城市
  chooseCity() {
    wx.navigateTo({
      url: '/pages/address/index?src=mgg',
    })
  },

  toGoodsDetail(e) {
    let item = e.currentTarget.dataset.item;
    if (!wx.getStorageSync('uis')) {
      wx.setStorageSync('uis', "推荐页购买")
    }
    // 活动未过期跳转秒光光商品详情，已过期跳转普通商品详情
    wx.navigateTo({
      url: '/pages-abs/pages/productDetails/productDetails?Entrance=2&id=' + item.prerogative_id,
    })
    AbsApi.addBrowseHistory({
      action_type: 2,
      goods_type: 2,
      goods_id: item.prerogative_id,
      action_info: item.prerogative_name
    }).then(res => {

    })
  },

  selTab(e) {
    let item = e.currentTarget.dataset.item;
    let scrollTop = 0;
    let top = 0;
    let that = this;
    // that.setData({
    //   currentView: item.id
    // })
    const query = wx.createSelectorQuery()
    query.select(`#${item.id}-detail`).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      top = res[0].top; // #the-id节点的上边界坐标
      scrollTop = res[1].scrollTop; // 显示区域的竖直滚动位置
      wx.pageScrollTo({
        scrollTop: top + scrollTop - that.data.marginTop,
        complete(res) {
          setTimeout(() => {
            if (that.isTouchBottom) {
              that.setData({
                currentView: item.id
              })
            }
          }, 100);
          // console.log(res)
        }
      })
    })

  },
  onPageScroll(e) {
    const that = this;
    for (let i of that.detailTop) {
      if (e.scrollTop >= i.top && e.scrollTop < (i.top + i.height)) {
        that.setData({
          currentView: i.id
        })
      }
    }
  },
  toShoppingList() {
    wx.navigateTo({
      url: '/pages-abs/pages/shoppingList/shoppingList',
    })
  },
  toOpinion() {
    wx.navigateTo({
      url: '/pages-abs/pages/opinion/opinion',
    })
  },
  toTheme(e) {
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages-live/pages/theme/theme?pid=' + type,
    })
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
    this.isTouchBottom = true;
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      imageUrl: "",
      path: `/pages/mgg/mgg?from=share&userCityId=${wx.getStorageSync('cityId')}&uis=${wx.getStorageSync('uis')}`
    }
  },
  // 跳转品牌列表
  toBrandList: function () {
    wx.navigateTo({
      url: '/pages-abs/pages/brandList/brandList',
    })
  },
})