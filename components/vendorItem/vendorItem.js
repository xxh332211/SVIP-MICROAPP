// components/vendorItem/vendorItem.js
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    vendorAct: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    reserveSuccess: false
  },
  pageLifetimes: {
    show: function () {
      // 页面被展示
      this.setData({
        activityInfo: wx.getStorageSync("activityInfo")
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //预约活动
    reserveAct(e) {
      let page = getCurrentPages();
      let currentRoute = page[page.length - 1].route;
      // 友盟统计
      wx.uma.trackEvent('click_getTicke', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '商户活动预约btn',
        SourcePage: currentRoute,
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis'),
      });
      if (wx.getStorageSync("isLogin")) {
        wx.showLoading({
          title: '预约中...',
          mask: true
        })
        let data = {
          source_id: (e.currentTarget.dataset.detailid + "," + e.currentTarget.dataset.supplierid),
          src_id: "supplier_active",
          mobile: wx.getStorageSync("userInfo").mobile,
          invite: "",
          'src': wx.getStorageSync('src'),
          'uis': wx.getStorageSync('uis'),
          'plan': wx.getStorageSync('plan'),
          'unit': wx.getStorageSync('unit')
        }
        marketingApi.postReserve(data).then((res) => {
          wx.hideLoading()
          if (res.code == 200) {
            for (let i of this.data.vendorAct) {
              if (e.currentTarget.dataset.detailid == i.detail_id) {
                i.button = "已预约";
              }
            }
            this.setData({
              reserveSuccess: true,
              vendorAct: this.data.vendorAct
            })
          } else {
            wx.showToast({
              title: res.message ? res.message:"请求出错了",
              icon: "none"
            })
          }
        })
      } else {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }
    },
    closeReserve() {
      this.setData({
        reserveSuccess: false
      })
    },
    cutDisplay(e){
      for (let i of this.data.vendorAct) {
        if (e.currentTarget.dataset.detailid == i.detail_id) {
          i.isHidden = !i.isHidden;
        }
      }
      this.setData({
        vendorAct: this.data.vendorAct
      })
    }
  }
})