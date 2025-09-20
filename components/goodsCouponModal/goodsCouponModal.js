// components/goodsCouponModal/goodsCouponModal.js
import apiService from '../../common/http/httpService_mall'
import utils from '../../utils/utils'
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    list: []
  },

  attached () {
    apiService('member/coupon/list', 'GET', {
      venueCityId: wx.getStorageSync('cityId') || 1
    }).then(rst => {
      if (rst) {
        for (let item of rst) {
          item.beginDate = utils.dateFormat(item.beginDate, 'YYYY.MM.DD')
          item.endDate = utils.dateFormat(item.endDate, 'YYYY.MM.DD')
        }
      }
      this.setData({
        list: rst || []
      })
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.triggerEvent('close', {}, {});
    },
    collect (evt) {
      let item = this.data.list[evt.currentTarget.dataset.idx]
      if (item.collected) {
        wx.showToast({
          title: '此券已领取了',
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showLoading()
        apiService('member/coupon/collect', 'POST', {
          couponId: item.couponId
        }).then(() => {
          wx.showToast({
            title: '领取成功',
            icon: 'success',
            duration: 2000
          })
          item.collected = true
          this.setData({
            list: this.data.list
          })
          wx.hideLoading()
        }).catch(() => {
          wx.hideLoading()
        })
      }
    }
  }
})
