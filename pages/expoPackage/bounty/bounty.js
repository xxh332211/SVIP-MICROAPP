// pages/expoPackage/bounty/bounty.js
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
    cityId:null
  },
  attached() {
    this.setData({
      bountyNum: wx.getStorageSync("bountyNum"),
      cityId: wx.getStorageSync('cityId'),
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})
