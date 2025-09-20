// pages/brandList/brandList.js
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //商户分类列表
    marketingApi.getVendorList().then((res) => {
      if (res.code == 200) {
        res.result.unshift({ category_name: "全部", id: "" })
        this.setData({
          vendorList: res.result,
          currentCategoryId: res.result[0].id
        })
        //获取品牌列表
        this.getBrandList(this.data.currentCategoryId)
      }
    })
  },
  /**
   * 方法start
   */
  //品牌列表
  getBrandList(id) {
    marketingApi.getBrandList({
      id: id,
      pageSize:""
    }).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        this.setData({
          brandList: res.result
        })
      }
    })
  },
  //切换分类
  cutKind(e) {
    let nums = Number(e.currentTarget.dataset.num) + 1;
    let menuIndex = 0;
    //current
    if (this.data.vendorList.length == nums) {
      menuIndex = 0.5 + nums - 5
    } else if (this.data.vendorList.length > 5 && nums >= 5) {
      menuIndex = nums - 4
    }
    this.setData({
      menuIndex: menuIndex,
      curNum: Number(e.currentTarget.dataset.num),
      currentCategoryId: e.currentTarget.dataset.id
    })
    //获取品牌分类
    this.getBrandList(e.currentTarget.dataset.id)
  },
  /**
   * 方法end
   */
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
})