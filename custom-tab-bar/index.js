// /custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    selected: Number
  },
  data: {
    color: '#CDCDCF',
    selectedColor: '#E6002D',
    list: [{
        pagePath: '/pages/goodsIndex/goodsIndex',
        iconPath: 'https://img.51jiabo.com/imgs-mall/tabbar01.svg',
        selectedIconPath: 'https://img.51jiabo.com/imgs-mall/tabbar01.svg',
        text: '首页'
      },
      {
        pagePath: '/pages/getTicket/getTicket',
        iconPath: 'https://img.51jiabo.com/imgs-mall/tabbar02.svg',
        selectedIconPath: 'https://img.51jiabo.com/imgs-mall/tabbar02.svg',
        text: '家博会'
      },
      // {
      //   pagePath: '/pages/cloudShow/cloudShow',
      //   iconPath: 'https://img.51jiabo.com/c0af6eb7-f15e-43c2-af62-b1b09cb562dd.png',
      //   selectedIconPath: 'https://img.51jiabo.com/c0af6eb7-f15e-43c2-af62-b1b09cb562dd.png',
      //   text: '推荐'
      // },
      {
        pagePath: '/pages/home/home',
        iconPath: 'https://img.51jiabo.com/imgs-mall/tabbar03.svg',
        selectedIconPath: 'https://img.51jiabo.com/imgs-mall/tabbar03.svg',
        text: '会员'
      },
      {
        pagePath: '/pages/user/userHome',
        iconPath: 'https://img.51jiabo.com/imgs-mall/tabbar04.svg',
        selectedIconPath: 'https://img.51jiabo.com/imgs-mall/tabbar04.svg',
        text: '我的'
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      wx.uma.trackEvent('click_BottomNavi', {
        Um_Key_ButtonName: data.item.text,
      });
      let page = getCurrentPages();
      let cityId = wx.getStorageSync('cityId');
      if ((page[page.length - 1].route == "pages/reserve/reserveTicket" && data.path == "/pages/home/home") || (page[page.length - 1].route == "pages/mgg/mgg" && data.path == "/pages/cloudShow/cloudShow")) {

      } else {
        // 
        if ((cityId == 1 || cityId == 2 || cityId == 3 || cityId == 6 || cityId == 7 || cityId == 8 || cityId == 14 || cityId == 15 || cityId == 17 || cityId == 19 || cityId == 23 || cityId == 54) && data.path == "/pages/cloudShow/cloudShow") {
          wx.reLaunch({
            url: "/pages/mgg/mgg"
          })
        } else {
          wx.switchTab({
            url: data.path
          })
        }
      }
    }
  }
})