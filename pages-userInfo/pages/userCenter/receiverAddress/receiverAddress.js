// pages/userCenter/receiverAddress/receiverAddress.js
import apiService from '../../../../common/http/httpService_mall'
import {
  xmb
} from "../../../../pages-xmb/api/xmbApi.js";
const xmbApi = new xmb()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    leaving: false,
    receiverAddresses: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      origin: options.origin,
      lotteryLogId: options.lotteryLogId
    })
    this.fetchData()
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
    if (this.data.leaving) {
      this.fetchData()
      this.setData({
        leaving: false
      })
    }
  },
  chooseAddress(e) {
    if (this.data.origin == "order") {
      //如果从下单页面进入，则点击选择并返回下单页
      let item = e.currentTarget.dataset.item;
      wx.setStorageSync('chooseAddressId', item.id)
      wx.navigateBack()
    }
    if (this.data.lotteryLogId) {
      //如果从抽奖页面进入，则点击选择并返回抽奖页
      let item = e.currentTarget.dataset.item;
      let address = item.provinceName + item.cityName + item.districtName + item.address;
      this.addPrizeAddress(item.id)
      wx.setStorageSync('luckyAddress', address)
      wx.navigateBack()
    }
  },
  //提交抽奖收货地址
  addPrizeAddress(addressId) {
    xmbApi.addPrizeAddress({
      record_id: this.data.lotteryLogId,
      address_id: addressId
    }).then((res) => {
      console.log(res)
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      leaving: true
    })
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

  },

  /**
   * 默认地址选择
   */
  onDefaultSelect: function (ev) {
    let addressId = ev.currentTarget.dataset.id
    let toUpdate
    var newAddress = this.data.receiverAddresses.map((item) => {
      if (item.id === addressId) {
        item.isDefault = true
        item.status = 2
        toUpdate = item
      } else {
        item.isDefault = false
        item.status = 1
      }
      return item
    })
    this.setData({
      receiverAddresses: newAddress
    })
    toUpdate.province = toUpdate.provinceName
    toUpdate.city = toUpdate.cityName
    toUpdate.district = toUpdate.districtName
    apiService('member/address/update', 'PUT', toUpdate).then(() => {
      this.fetchData()
    })
  },

  /***
   * 删除某条地址
   */
  onToDeleteAddress: function (ev) {
    let item = ev.currentTarget.dataset.item
    if (!item.isDefault) {
      let that = this
      wx.showModal({
        title: '确定删除该地址？',
        content: '该操作无法撤回！是否继续删除',
        success(res) {
          if (res.confirm) {
            apiService(`member/address/delete?id=${item.id}`, 'delete').then((res) => {
              that.fetchData()
            }).catch(() => {
              wx.showToast({
                title: '网络错误',
              })
              that.fetchData()
            })
          }
        }
      })
    }
  },

  /**
   * 加载用户地址数据
   */
  fetchData: function () {
    wx.showLoading()
    apiService('member/address/list').then((addresses) => {
      let defaultItem = {};
      addresses.forEach((item, i) => {
        if (item.status === 2) {
          item.isDefault = true;
          defaultItem = addresses.slice(i, i + 1);
          addresses.splice(i, 1);
          addresses = defaultItem.concat(addresses)
        }
      })
      this.setData({
        receiverAddresses: addresses
      })
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
    })
  },

  naviToAddressEdit: function (ev) {
    let addressId = ev.currentTarget.dataset.id
    if (addressId) {
      wx.navigateTo({
        url: `/pages-userInfo/pages/userCenter/receiverAddress/addressEdit?addressId=${addressId}`
      })
    } else {
      wx.navigateTo({
        url: `/pages-userInfo/pages/userCenter/receiverAddress/addressEdit?origin=${this.data.origin}&lotteryLogId=${this.data.lotteryLogId}`
      })
    }
  }
})