// pages-sh/pages/shDetail/shDetail.js
import {
  shApply
} from "../../../common/api/shApi.js"
let shApplyApi = new shApply()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reasonList: [{
      id: 1,
      text: "不合适不喜欢"
    }, {
      id: 2,
      text: "产品价格因素"
    }, {
      id: 3,
      text: "服务态度"
    }, {
      id: 4,
      text: "商品配送或安装服务因素"
    }, {
      id: 5,
      text: "商品与描述不符"
    }, {
      id: 6,
      text: "质量问题"
    }, {
      id: 7,
      text: "发错货"
    }, {
      id: 8,
      text: "收到商品破损"
    }, {
      id: 9,
      text: "认为假货"
    }, {
      id: 10,
      text: "其他"
    }],
    typeList: [{
      id: 1,
      text: "仅退款（未收到货或未签收）"
    }, {
      id: 2,
      text: "退货退款（已收到货）"
    }, {
      id: 3,
      text: "协商解决"
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
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
    this.getDetailInfo()
  },
  getDetailInfo() {
    shApplyApi.getApplyDetail({
      id: this.data.id
    }).then((res) => {
      if (res.status == 1) {
        // 退款原因 1=不合适不喜欢 2=产品价格因素 3=服务态度 4=商品配送或安装服务因素 5=商品与描述不符 6=质量问题 7=发错货 8=收到商品破损 9=认为假货 10=其他
        // 退款类型：1.仅退款 2.退货退款 3.协商退款
        for (let i of this.data.reasonList) {
          if (i.id == res.data.refund_reason) {
            res.data.reason_text = i.text;
          }
        }
        for (let i of this.data.typeList) {
          if (i.id == res.data.refund_type) {
            res.data.type_text = i.text;
          }
        }
        this.setData({
          data: res.data
        })
      }
    })
  },
  repealApply() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    shApplyApi.postApply({
      id: this.data.data.id,
      buyer_mobile: this.data.data.buyer_mobile,
      city_id: this.data.data.city_id,
      order_images: this.data.data.order_images,
      refund_type: this.data.data.refund_type,
      refund_reason: this.data.data.refund_reason,
      status: 3
    }).then((res) => {
      wx.hideLoading({
        success: (res) => {},
      })
      if (res.status == 1) {
        this.getDetailInfo()
      }
    })
  },
  toAmend() {
    wx.navigateTo({
      url: `/pages-sh/pages/shForm/shForm?modifyId=${this.data.id}&submitStatus=${this.data.data.status}`,
    })
  },

  showBig() {
    wx.previewImage({
      urls: [this.data.data.order_images],
    })
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
    return {
      title: "华夏家博",
      path: "/pages/user/userHome",
      imageUrl: "https://img.51jiabo.com/d7786862-b319-4e95-ada2-9d808fc182a0.png"
    }
  }
})