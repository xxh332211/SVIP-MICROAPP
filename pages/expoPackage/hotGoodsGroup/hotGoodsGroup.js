// pages/expoPackage//hotGoodsGroup/hotGoodsGroup.js
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      groupId: options.groupId
    })
    wx.showLoading({
      title: '加载中...'
    })
    //获取爆品分享图片
    SvipApi.getAdvList({
      area_id: "29"
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          hotShareAdv: res.data.adv29 || ""
        })
      }
    })
    //获取爆品列表
    let page = getCurrentPages();
    let currentRoute = page[page.length - 1].route;
    marketingApi.getGoodsGroup({
      baopinId: options.groupId
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        let page2 = getCurrentPages();
        let currentRoute2 = page2[page2.length - 1].route;
        if (currentRoute == currentRoute2) {
          wx.setNavigationBarTitle({
            title: res.data[0].group_info.goods_group_name,
            fail() {}
          })
        }
        //格式化价格
        for (let i of res.data[0].goods_info) {
          i.market_price = Number(i.market_price)
          i.special_price = Number(i.special_price)
        }
        let banner = res.data[0].group_info.banner_images;
        banner = banner.map((v) => {
          v = {
            wap_image_url: v
          }
          return v
        })
        this.setData({
          hotGoods: res.data[0].goods_info,
          banner: banner
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: res.target.dataset.sharedata.title,
        path: res.target.dataset.sharedata.path,
        imageUrl: this.data.hotShareAdv ? this.data.hotShareAdv[0].wap_image_url : "https://img.51jiabo.com/39dc30d1-9ca7-411d-bfa9-fdfac1608258.png"
      }
    }
  }
})