// components/bannerSwiper/bannerSwiper.js
let flag = true;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    liveData: Object,
    banner: Array,
    area_id: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabUrls: [
      'pages/goodsIndex/goodsIndex',
      'pages/getTicket/getTicket',
      'pages/cloudShow/cloudShow',
      'pages/home/home',
      'pages/user/userHome'
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 判断url是否为tabbar
    isTab(url) {
      for (let item of this.data.tabUrls) {
        if (url.indexOf(item) > -1) {
          return true
        }
      }
    },
    // 运营位链接跳转
    swiperUrl(e) {
      // 友盟统计
      wx.uma.trackEvent('click_AD', {
        cityId: wx.getStorageSync('cityId'),
        ADID: this.data.area_id.toString(),
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis')
      });
      console.log('广告===》', {
        cityId: wx.getStorageSync('cityId'),
        ADID: this.data.area_id.toString(),
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis')
      })

      let item = e.currentTarget.dataset.item;
      let type = e.currentTarget.dataset.item.type;
      var url = e.currentTarget.dataset.item.url
      if (item.is_jump_live_broadcast == 1) {
        //跳转直播间
        if (flag) {
          flag = false;
          if (wx.openChannelsLive) {
            wx.openChannelsLive({
              finderUserName: "sphTgeTCjc7M4Ri",
              feedId: this.data.liveData?.feedId,
              nonceId: this.data.liveData?.nonceId,
              complete(res) {
                setTimeout(() => {
                  flag = true;
                }, 100);
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
          }
        }
      } else {
        if (item.url) {
          //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
          if (type == 1) {
            if (this.isTab(url)) {
              wx.switchTab({
                url
              })
            } else {
              wx.navigateTo({
                url
              })
            }
          } else if (type == 2) {
            wx.navigateToMiniProgram({
              appId: e.currentTarget.dataset.item.appid,
              path: e.currentTarget.dataset.item.url
            })
          } else {
            wx.navigateTo({
              url: '/pages/web/web?url=' + encodeURIComponent(e.currentTarget.dataset.item.url)
            })
          }
        }
      }
    },
  }
})