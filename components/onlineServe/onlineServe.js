// components/onlineServe/onlineServe.js
// var myPluginInterface = requirePlugin('myPlugin');
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    from: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    cityId: null
  },

  pageLifetimes: {
    show: function () {
      let H = app.systemData.statusBarHeight + 42,
        Y = (app.systemData?.safeArea?.height ?? 0) - 140;
      this.setData({
        y: this.data.from ? (H + Y) : Y,
        cityId: wx.getStorageSync('cityId')
      })
      // 页面被展示
      marketingApi.getQyUserId({
        mobile: wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').mobile : "",
        city_id: wx.getStorageSync('cityId'),
        qyuser_id: wx.getStorageSync('qyuser_id'),
        type: 2,
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis')
      }).then((res) => {
        // console.log(res)
        if (res.code == 200) {
          wx.setStorageSync('qyuser_id', res.result.qyuser_id)
          wx.setStorageSync('qyUserInfo', res.result.info)
        }
      })
    }
  },

  ready() {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    toServe() {
      wx.navigateTo({
        url: '/pages-qy/pages/onlineServe/onlineServe',
      })
    }
  }
})