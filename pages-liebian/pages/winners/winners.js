// pages-liebian/pages/winners/winners.js
import {
  fission
} from "../../api/fissionApi.js";
const fissionApi = new fission()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    showMore: true,
    winnerList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.actId = options.actId;
    //获取中奖名单
    this.getList()
  },

  getList(page = 1) {
    fissionApi.getWinnerList({
      actId: this.actId,
      page: page,
      pageSize: 30
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          winnerList: this.data.winnerList.concat(res.data)
        })
        if (res.data?.length < 30) {
          this.setData({
            showMore: false
          })
        }
      }
    })
  },

  loadMore() {
    //获取更多中奖名单
    this.data.page++;
    this.getList(this.data.page)
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
  // onShareAppMessage: function () {

  // }
})