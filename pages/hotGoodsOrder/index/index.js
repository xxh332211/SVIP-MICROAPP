// pages/hotGoodsOrder/index/index.js
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: true
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
        this.setData({
          activityInfo: wx.getStorageSync("activityInfo")
        })
        this.getAllData()
      })
    } else {
      // 获取展届信息
      SvipApi.activityInfo({
        cityId: wx.getStorageSync('cityId') || 1
      }).then((res) => {
        wx.setStorageSync("activityInfo", app.disposeData(res))
        wx.setStorageSync("sessionId", res.session)
        wx.setStorageSync("activityId", res.activity_id)
        wx.setStorageSync("curUserCityText", res.city_name)
        this.setData({
          activityInfo: wx.getStorageSync("activityInfo")
        })
        this.getAllData()
      })
    }
    if (options.from == "share" && !wx.getStorageSync("src")) {
      wx.setStorageSync('src', "YYXCX")
    }
    if (options.from == "share" && !wx.getStorageSync("uis")) {
      wx.setStorageSync('uis', "爆品列表")
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
    if (options.categoryId) {
      this.setData({
        categoryId: options.categoryId
      })
    }
    if (!wx.getStorageSync('cityId')) {
      wx.navigateTo({
        url: '/pages/address/index'
      })
      return
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 友盟统计
    wx.uma.trackEvent('enter_hotGoodsOrder', {
      cityId: wx.getStorageSync('cityId'),
      categoryId: this.data.categoryId ? this.data.categoryId : "0",
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
  },
  /**
   * 方法start
   */
  //
  getAllData() {
    //获取爆品组
    marketingApi.getGoodsGroup().then((res) => {
      if (res.status == 1) {
        this.setData({
          goodsGroup: res.data
        })
      }
    })
    //获取banner
    SvipApi.getAdvList({
      area_id: "16,29"
    }).then((res) => {
      // 16:banner 29:爆品分享图片
      if (res.status == 1) {
        this.setData({
          banner: res.data.adv16 || "",
          hotShareAdv:res.data.adv29 || "",
        })
      }
    })
    this.setData({
      activityInfo: wx.getStorageSync("activityInfo"),
      reachTips: "下拉继续加载",
      pageIndex: 0,
      hasData: true
    })
    wx.showLoading({
      title: '加载中...',
    })
    //商户分类列表
    marketingApi.getVendorList().then((res) => {
      if (res.code == 200) {
        res.result.unshift({
          category_name: "全部",
          id: 0
        })
        this.setData({
          vendorList: res.result,
          currentCategoryId: res.result[0].id,
          hotGoods: []
        })
        //获取爆品列表
        let id = res.result[0].id,
          index = 0;
        if (this.data.categoryId) {
          id = this.data.categoryId;
          for (let i in res.result) {
            if (res.result[i].id == this.data.categoryId) {
              this.setData({
                shareCategory: res.result[i]
              })
              index = i;
            }
          }
          if (index == 0) {
            id = res.result[0].id;
          }
        }
        this.initCutKind(index, id)
      }
    })
  },
  //获取爆品列表
  getHotGoods(id, page = 0, pageSize = 10) {
    marketingApi.getHotGoodsList({
      id: id,
      page: page,
      pageSize: pageSize,
      is_recommend: ""
    }).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        if (res.result && res.result.length > 0) {
          //格式化价格
          for (let i of res.result) {
            i.market_price = Number(i.market_price)
            i.special_price = Number(i.special_price)
          }
          this.data.hotGoods = this.data.hotGoods.concat(res.result);
          this.setData({
            hotGoods: this.data.hotGoods
          })
        }
        if (res.result.length < 10) {
          this.setData({
            hasData: false,
            reachTips: "没有更多了"
          })
        }
        this.data.flag = true;
      }
    })
  },
  //切换类型
  cutKind(e) {
    if (this.data.flag) {
      this.data.flag = false;
      let nums = Number(e.currentTarget.dataset.num) + 1;
      let menuIndex = 0;
      let item = e.currentTarget.dataset.item;
      //current
      if (this.data.vendorList.length == nums) {
        menuIndex = 0.5 + nums - 5
      } else if (this.data.vendorList.length > 5 && nums >= 5) {
        menuIndex = nums - 4
      }
      this.setData({
        hotGoods: [],
        hasData: true,
        reachTips: "下拉继续加载",
        pageIndex: 0,
        menuIndex: menuIndex,
        shareCategory: item,
        currentCategoryId: item.id
      })
      //获取爆品列表
      this.getHotGoods(item.id)
    }
  },
  // 初始化选中类别
  initCutKind(index, id) {
    if (this.data.flag) {
      this.data.flag = false;
      let nums = Number(index) + 1;
      let menuIndex = 0;
      //current
      if (this.data.vendorList.length == nums) {
        menuIndex = 0.5 + nums - 5
      } else if (this.data.vendorList.length > 5 && nums >= 5) {
        menuIndex = nums - 4
      }
      this.setData({
        hotGoods: [],
        hasData: true,
        reachTips: "下拉继续加载",
        pageIndex: 0,
        menuIndex: menuIndex,
        currentCategoryId: id
      })
      //获取爆品列表
      this.getHotGoods(id)
    }
  },
  /**
   * 方法end
   */

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //加载爆品列表
    if (this.data.hasData) {
      this.data.pageIndex++
      this.getHotGoods(this.data.currentCategoryId, this.data.pageIndex)
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: res.target.dataset.sharedata.title,
        path: res.target.dataset.sharedata.path,
        imageUrl: this.data.hotShareAdv ? this.data.hotShareAdv[0].wap_image_url : "https://img.51jiabo.com/39dc30d1-9ca7-411d-bfa9-fdfac1608258.png"
      }
    } else {
      // 来自右上角转发菜单
      if (!this.data.shareCategory || this.data.shareCategory.id == 0) {
        return {
          title: "精选推荐 比全网便宜20%",
          path: `/pages/hotGoodsOrder/index/index?from=share&userCityId=${(wx.getStorageSync('cityId') || 1)}&categoryId=${this.data.currentCategoryId}`,
          // imageUrl: this.data.hotShareAdv ? this.data.hotShareAdv[0].wap_image_url : "https://img.51jiabo.com/39dc30d1-9ca7-411d-bfa9-fdfac1608258.png"
          imageUrl: "https://img.51jiabo.com/effe3206-128e-42d5-9aef-09dfa43fd251.png"
        }
      } else {
        return {
          title: `${this.data.shareCategory.category_name} 比全网便宜20%`,
          path: `/pages/hotGoodsOrder/index/index?from=share&userCityId=${(wx.getStorageSync('cityId') || 1)}&categoryId=${this.data.currentCategoryId}`,
          imageUrl: this.data.shareCategory.baopin_share_img
        }
      }
    }
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
})