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
    selectAddrVisible: false,
    address: {
      id: undefined,
      province: undefined,
      city: undefined,
      district: undefined,
      address: undefined,
      status: 1,
      recipients: undefined,
      mobile: undefined,
    },
    region: [],
    isDefault: false,
    disableBtn: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      lotteryLogId: options.lotteryLogId,
      origin: options.origin
    })
    if (options.addressId) {
      wx.setNavigationBarTitle({
        title: "编辑地址"
      })
      this.fetchData(options.addressId)
    } else {
      wx.setNavigationBarTitle({
        title: '添加地址',
      })
    }
    apiService('member/address/list').then((addresses) => {
      if (addresses.length == 0) {
        //新增第一条地址 || 编辑的地址为默认地址，默认地址必选并且不可反选
        this.setData({
          isDefault: true,
          disableBtn: true
        })
      }
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
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

  },

  /***
   * loading address data
   */
  fetchData(id) {
    wx.showLoading()
    if (id) {
      apiService(`member/address?id=${id}`).then((res) => {
        if (res) {
          let isDefault = res.status === 2
          let region = [res.provinceName, res.cityName, res.districtName]
          this.setData({
            region,
            isDefault,
            address: res,
            disableBtn: isDefault
          })
        }
        wx.hideLoading()
      }).catch(() => {
        wx.hideLoading()
      })
    }
  },
  userNameChange(ev) {
    var data = {
      ...this.data.address
    }
    data.recipients = ev.detail.value
    console.log(this.data)
    this.setData({
      address: data
    })
  },
  mobileChange(ev) {
    var data = {
      ...this.data.address
    }
    var isDefault = this.data.isDefault
    data.mobile = ev.detail.value
    this.setData({
      address: data,
      isDefault
    })
  },
  addressChange(ev) {
    var data = {
      ...this.data.address
    }
    var isDefault = this.data.isDefault
    data.address = ev.detail.value
    this.setData({
      address: data,
      isDefault
    })
  },
  defaultValueChange(ev) {
    this.setData({
      isDefault: ev.detail.value
    })
  },
  openAddrSelector: function (e) {
    this.setData({
      selectAddrVisible: true
    })
  },
  closeAddrSelector() {
    this.setData({
      selectAddrVisible: false
    })
  },
  selectAddr(evt) {
    this.setData({
      region: evt.detail.value
    })
    this.closeAddrSelector()
  },
  handleSaveAddress(evt) {
    const {
      isDefault,
      region
    } = this.data
    let nameReg = /^[a-zA-Z\u4e00-\u9fa5]+$/;
    let phoneReg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    let errorMsg = ''
    var toPost = {
      ...this.data.address
    }
    toPost.province = region[0]
    toPost.city = region[1]
    toPost.district = region[2]
    if (!toPost.recipients) {
      errorMsg = '姓名不能为空'
    } else if (!nameReg.test(toPost.recipients)) {
      errorMsg = '请正确填写姓名'
    } else if (!toPost.mobile) {
      errorMsg = '手机号码不能为空'
    } else if (toPost.mobile.length != 11 || !phoneReg.test(toPost.mobile)) {
      errorMsg = '请正确填写手机号'
    } else if (!region || region.length !== 3) {
      errorMsg = '所在地区不能为空'
    } else if (!toPost.address) {
      errorMsg = '详细地址不能为空'
    }
    if (errorMsg) {
      wx.showToast({
        title: errorMsg,
        icon: 'none'
      })
      return
    }
    toPost.status = isDefault ? 2 : 1
    wx.showLoading()
    if (toPost.id) {
      apiService('member/address/update', 'PUT', toPost).then((res) => {
        wx.hideLoading()
        wx.navigateBack()
      })
    } else {
      apiService('member/address/create', 'POST', toPost).then((res) => {
        wx.hideLoading()
        if (this.data.origin == "order") {
          wx.setStorageSync('chooseAddressId', res.id)
        }
        if (this.data.lotteryLogId) {
          this.addPrizeAddress(res.id)
        }
        if (this.data.origin == "order" || this.data.lotteryLogId) {
          wx.navigateBack({
            delta: 2
          })
        } else {
          wx.navigateBack({
            delta: 1
          })
        }
      })
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
  }
})