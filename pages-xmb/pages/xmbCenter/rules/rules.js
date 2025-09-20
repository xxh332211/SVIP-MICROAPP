// pages-xmb/pages/xmbCenter/rules/rules.js
import {
  xmb
} from '../../../api/xmbApi';
const Api = new xmb();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rulesData:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.xmbCenterRules();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  xmbCenterRules(){
    wx.showLoading({
      title: '加载中...',
    })
    Api.xmbCenterRules().then(res=>{
      wx.hideLoading();
      if(res.code === 200){
        this.setData({
          rulesData:res.result.panda_coin_rule
        })
      }
    })
  }
})