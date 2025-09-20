// components/xmbPopup/xmbPopup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showXmbTips: {
      type: Boolean,
      value: false
    },
    xmbPopupData: {
      type: Object,
      value: {}
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 熊猫币中心跳转
    toXmbCenter() {
      wx.navigateTo({
        url: '/pages-xmb/pages/xmbCenter/index/index',
      })
    },

    // 熊猫币抽奖跳转
    toXmbLottery() {
      wx.navigateTo({
        url: '/pages-xmb/pages/luckyDraw/luckyDraw',
      })
    },
  }
})