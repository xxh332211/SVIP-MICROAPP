// components/service/service.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cityConfig: Object,
    cityId: String
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
    calling() {
      let cityId = wx.getStorageSync('cityId');
      if (cityId != 65) {
        wx.makePhoneCall({
          phoneNumber: '400-6188-555',
        })
      } else {
        wx.makePhoneCall({
          phoneNumber: '400-618-3555',
        })
      }
    },
    attentionBtn() {
      // 友盟统计
      wx.uma.trackEvent('click_SVIPhome', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '点击关注',
        SourcePage: this.data.curPage
      });
    },
    copy(e) {
      wx.setClipboardData({
        //准备复制的数据
        data: e.currentTarget.dataset.order,
        success: function (res) {
          wx.showToast({
            title: '复制成功',
            icon: 'none',
            duration: 3000
          });
        }
      });
    }
  }
})