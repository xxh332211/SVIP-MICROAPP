// pages/user/selfHelp/Detail/Detail.js
import {
  svip
} from "../../../../common/api/svipApi.js"

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
    console.log(options)
    if (options.status == 5) {
      this.setData({
        type: 5
      })
    }

    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let orderId = options.orderId;
    let status = options.status;
    SvipApi.getSelfOrderDetail({
      orderId: orderId
    }).then((res) => {
      if (res.infoMap.statusCode == 200) {
        this.setData({
          data: res.infoMap.sfInputOrder
        })
        this.setData({
          auditPass: res.infoMap.sfInputOrder.isRemind == -1 ? true : false
        })
        wx.hideLoading()
      }
    })
  },

  //
  confirm() {
    SvipApi.selfConfirmPopup({
      isRemind: 1,
      orderId: this.data.data.orderId
    }).then((res) => {

    })
    this.setData({
      auditPass: false
    })
  },

  //查看大图
  bigImg(e) {
    let imgList = this.data.data.orderImages.map((v, i) => {
      return v.imageUrl
    })
    wx.previewImage({
      current: e.currentTarget.dataset.img,
      urls: imgList
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
  onShareAppMessage: function () {

  }
})