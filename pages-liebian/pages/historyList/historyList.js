// pages-liebian/pages/historyList/historyList.js
import {
  fission
} from "../../api/fissionApi";
const Api = new fission();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    tabs: [{
        id: 1,
        text: '进行中'
      },
      {
        id: 2,
        text: '已中奖'
      },
      {
        id: 3,
        text: '未中奖'
      },
    ],
    curTab: 1,
    pageNum: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      list: [],
      noMore: false,
      pageNum: 1
    })
    this.historyList();
  },

  onReachBottom() {
    if (!this.data.noMore) {
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.historyList();
    }
  },


  toggleTab(e) {
    let index = e.currentTarget.dataset.index + 1;
    this.setData({
      pageNum: 1,
      list: [],
      curTab: index
    })
    this.setData({
      noMore: false
    })
    this.historyList();
  },

  toIndex(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages-liebian/pages/index/index?actId=${id}`
    })
    // let page = getCurrentPages();
    // let preRouter = page[page.length - 2] && page[page.length - 2].route;
    // if (preRouter && preRouter == "pages-liebian/pages/index/index") {
    //   wx.navigateBack()
    // } else {

    // }
  },

  historyList() {
    wx.showLoading({
      title: '加载中...',
    })
    const params = {
      type: this.data.curTab,
      page: this.data.pageNum,
      pageSize: 10
    }
    Api.historyList(params).then(res => {
      wx.hideLoading();
      if (res.status === 1) {
        if (res.data.length < 10) {
          this.setData({
            noMore: true
          })
        }
        this.setData({
          list: this.data.list.concat(res.data)
        })
      }
    })
  },

})