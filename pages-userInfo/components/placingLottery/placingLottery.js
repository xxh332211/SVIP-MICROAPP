// pages-userInfo/components/placingLottery/placingLottery.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showReport: Boolean,
    zhanzhong: Boolean,
    lotteryReport: Array,
    lotteryRule: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    cityId: wx.getStorageSync('cityId')
  },
  /**
   * 组件的方法列表
   */
  methods: {

    toggleRule() {
      this.setData({
        rulePopup: !this.data.rulePopup
      })
    },
    toSelfHelp() {
      wx.navigateTo({
        url: '/pages/user/selfHelp/Index/Index',
      })
    },
  }
})