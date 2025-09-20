// pages/goodsList/goodsList.js
import {
  svip
} from '../../common/api/svipApi.js'
let SvipApi = new svip()
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reachTips: "没有更多了"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    // 推广链接带参 cityId src uis plan unit
    if (options.userCityId) {
      wx.setStorageSync('cityId', options.userCityId)
      // 获取展届信息
      SvipApi.activityInfo({
        cityId: options.userCityId
      }).then((res) => {
        wx.setStorageSync("activityInfo", app.disposeData(res))
        wx.setStorageSync("sessionId", res.session)
        wx.setStorageSync("activityId", res.activity_id)
        wx.setStorageSync("curUserCityText", res.city_name)
        //获取商品数据 4=预约商品 2=定金商品 1=全款商品
        this.getGoodsData(this.data.type, 100)
        //获取svip状态
        this.getSvipStatus()
      })
    }
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }
    if (options.plan) {
      wx.setStorageSync('plan', options.plan)
    }
    if (options.unit) {
      wx.setStorageSync('unit', options.unit)
    }
    // if (!wx.getStorageSync('cityId')) {
    //   wx.navigateTo({
    //     url: '/pages/address/index'
    //   })
    //   return
    // }
    this.setData({
      type: options.type
    })
    if (options.type == 1) {
      wx.setNavigationBarTitle({
        title: "全款商品"
      })
    } else if (options.type == 2) {
      wx.setNavigationBarTitle({
        title: "定金商品"
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
    if (wx.getStorageSync("zeroUpgradeS")) {
      this.setData({
        orderType: wx.getStorageSync("zeroUpgradeType"),
        showUpdatePopup: true
      })
      wx.removeStorageSync("zeroUpgradeS")
    }

    // 友盟统计
    wx.uma.trackEvent('enter_goodsList', {
      cityId: wx.getStorageSync('cityId'),
      type: this.data.type,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });

    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    //获取商品数据 4=预约商品 2=定金商品 1=全款商品
    this.getGoodsData(this.data.type, 100)
    //获取svip状态
    this.getSvipStatus()
  },
  //获取svip状态
  getSvipStatus() {
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      if (res.status == 1) {
        let status = res.data.svip == 1 ? true : false
        this.setData({
          isSvip: status,
          isLogin: true
        })
        // svip是否需要0元升级
        SvipApi.zeroUpgrade({
          cityId: wx.getStorageSync('cityId')
        }).then((res) => {
          if (res.status == 1) {
            this.setData({
              isUpgrade: res.data.is_upgrade
            })
          }
        })
      } else {
        this.setData({
          isSvip: false,
          isLogin: false
        })
      }
    })
  },
  // 获取商品数据
  getGoodsData(type, size) {
    let params = {
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId'),
      pageSize: size,
      type: type
    }
    SvipApi.refureshGoods(params).then((res) => {
      res = app.disposeData(res)
      // 预约商品
      if (res.goods_4) {
        this.setData({
          reserveList: res.goods_4
        })
      }else{
        this.setData({
          reserveList: null
        })
      }
      // 定金商品
      if (res.goods_2) {
        this.setData({
          prepayList: res.goods_2
        })
      }else{
        this.setData({
          prepayList: null
        })
      }
      // 全款商品
      if (res.goods_1) {
        this.setData({
          totalList: res.goods_1
        })
      }else{
        this.setData({
          totalList: null
        })
      }
      wx.hideLoading()
    })
  },
  //去商品详情
  goodsDetail(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/svipPackage/payProductDetail/payProductDetail?id=' + id,
    })
  },
  // 预约商品
  reserveGoods(e) {
    let id = e.currentTarget.dataset.id
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    if (this.data.isLogin && !this.data.isSvip) {
      //判断是否可以直接升级svip,2为直接升级
      if (this.data.isUpgrade == 2) {
        // svip 0元升级
        wx.showLoading({
          title: '加载中...',
          mask: true
        })
        SvipApi.svipUpgrade({
          cityId: wx.getStorageSync('cityId'),
          activityId: wx.getStorageSync('activityId'),
          src: "0yuan",
          uis: wx.getStorageSync('uis')
        }).then((res) => {
          wx.hideLoading()
          if (res.status == 1) {
            this.setData({
              orderType: res.data.order_type,
              showUpdatePopup: true
            })
          } else {
            wx.showToast({
              title: res.message,
              icon: "none"
            })
          }
        })
      } else {
        //非会员提示弹层
        this.setData({
          svipTips: true
        })
      }
      return
    }
    //调用预约接口
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.goodsReserve({
      goods_id: id,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    }).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        this.setData({
          reserveTips: true
        })
        this.getGoodsData(4, 100)
      } else if (res.code == -2) {
        //非会员提示弹层
        this.setData({
          svipTips: true
        })
      } else {
        wx.showToast({
          title: res.message ? res.message : "请求出错了",
          icon: "none"
        })
      }
    })
  },
  closeUpdate() {
    this.setData({
      showUpdatePopup: false
    })
    this.onShow()
  },
  //预约商品非会员购买svip
  reserveBuySvip() {
    this.setData({
      svipTips: false
    })
    wx.navigateTo({
      url: '/pages/svipPackage/paySvip/paySvip?origin=listReserve',
    })
  },
  closePopup(e) {
    let val = e.target.dataset.val;
    this.setData({
      [val]: false
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var uis, title, type
    // 4=预约商品 2=定金商品 1=全款商品
    if (this.data.type == 1) {
      title = "华夏家博SVIP全款商品"
      uis = '全款'
      type = 1
    } else if (this.data.type == 2) {
      title = "华夏家博SVIP定金商品"
      uis = '定金'
      type = 2
    } else if (this.data.type == 4) {
      title = "华夏家博SVIP预约商品"
      uis = '预约'
      type = 4
    }
    return {
      title: title,
      path: '/pages/goodsList/goodsList?userCityId=' + wx.getStorageSync('cityId') + "&type=" + type + "&src=SVIPshplb&uis=" + uis
    }
  }
})