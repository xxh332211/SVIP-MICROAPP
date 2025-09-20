import apiService from '../../common/http/httpService_mall'
import utils from '../../utils/utils'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    score: 238,
    earned: 0,
    spent: 0,
    cur: 0,
    pagination: {
      pageSize: 20,
      pageIndex: 1,
      totalCount: 0
    },
    list: [],
    loading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    apiService('member/score/total', 'GET').then(rst => {
      this.setData({
        score: rst.total,
        spent: Math.abs(rst.spent),
        earned: rst.earned
      })
    })
    this.data.pagination.totalCount = 0
    this.data.list = []
    this.loadData(1)
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

  loadMore () {
    if (this.data.loading) {
      return
    }
    this.loadData(this.data.pagination.pageIndex + 1)
  },

  loadData (pageIndex) {
    let index = +pageIndex || 1
    if (
      this.data.pagination.totalCount > 0 &&
      this.data.list.length >= this.data.pagination.totalCount
    ) {
      return
    }
    wx.showLoading()
    this.setData({
      loading: true
    })
    apiService('member/score/list', 'GET', {
      pageSize: this.data.pagination.pageSize,
      pageIndex: index,
      income: this.data.cur ? false : true
    })
      .then(rst => {
        for (let item of rst.items) {
          item.createTime = utils.dateFormat(item.createTime, 'YYYY/MM/DD')
        }
        if (index === 1) {
          this.data.list = rst.items || []
        } else {
          this.data.list = [...this.data.list, ...rst.items]
        }
        this.data.pagination = rst.pagination
        this.setData({
          list: this.data.list,
          loading: false
        })
        wx.hideLoading()
      })
      .catch(() => {
        wx.hideLoading()
        this.setData({
          loading: false
        })
      })
  },

  switchType (evt) {
    let e = evt.currentTarget.dataset.id
    if (e !== this.data.cur) {
      this.setData({
        cur: e
      })
      this.data.pagination.totalCount = 0
      this.data.list = []
      this.loadData(1)
    }
  }
})