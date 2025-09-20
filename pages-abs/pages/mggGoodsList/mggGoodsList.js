// pages-abs/pages/mggGoodsList/mggGoodsList.js
import {
  absApi
} from "../../../common/api/absAPI.js"
let AbsApi = new absApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: null,
    curTab: 0,
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
    this.getList();
  },

  getList(){
    wx.showLoading({
      title: '加载中',
    })
    AbsApi.getAbsGoodsList().then(res=>{
      wx.hideLoading();
      if(res.status === 1){
        let title = res.data.activity_name;
        if (title.length > 8) {
          title = title.substring(0, 8) + '...'
        }
        this.setData({
          list:res.data
        })
        wx.setNavigationBarTitle({title})
      }
    })
  },

  toggleMggTab(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    this.setData({
      mggCurList: item.goods_list,
      curTab: index
    })
  },

  toMggDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages-abs/pages/productDetails/productDetails?Entrance=2&id=' + id,
    })
  },
})