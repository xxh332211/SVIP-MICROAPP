// components/xmbCenterComponent/lotteryLoop/lotteryLoop.js
import {
  xmb
} from '../../../pages-xmb/api/xmbApi';
const Api = new xmb();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    origin: String,
    lotteryLoopList: {
      type: Object,
      value: {}
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    showCover: false,
    showFreezeBox: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toLottery() {
      if (!wx.getStorageSync("isLogin")) {
        wx.showToast({
          icon: 'none',
          title: '请您先登录哦',
        })
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }, 600)
        return false
      }
      console.log(this.data.origin)
      if(this.data.origin === 'xmbCenter'){
        wx.showLoading();
        Api.checkFreeze().then(res => {
          wx.hideLoading();
          if (res.code == 4003) {
            this.setData({
              showCover: true,
              showFreezeBox: true
            })
            return false;
          } else {
            wx.navigateTo({
              url: '/pages-xmb/pages/luckyDraw/luckyDraw',
            })
          }
        })
      }else{
        wx.navigateTo({
          url: '/pages-xmb/pages/luckyDraw/luckyDraw',
        })
      }
    },
  }
})