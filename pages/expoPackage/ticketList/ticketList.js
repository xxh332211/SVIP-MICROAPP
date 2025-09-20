// pages/expoPackage/ticketList/ticketList.js

let QRCode = require('../../../utils/qrcode.js')
import {
  ticketApi
} from "../../../common/api/ticketApi.js";
let Api = new ticketApi()
const app = getApp()
Page({
  data: {
    isGet: false,
    ticketList: null,
    no_ticket1_data: false,
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this;
    //记录屏幕亮度
    wx.getScreenBrightness({
      success: function(e) {
        wx.setStorageSync("screenLight", e.value)
      }
    })
    let params = {
      status: '1',
      page: '1',
      limit: '10',
      token: wx.getStorageSync('token')
    }
    Api.getTicketList(params, (res) => {
      console.log(res, '门票列表')
      if (res.data.status == 1) {
        //只有一张门票直接跳转门票详情页
        if (res.data.data.length == 1) {
          wx.hideLoading()
          wx.redirectTo({
            url: '/pages/expoPackage/ticketDetail/ticketDetail?ticketId=' + res.data.data[0].ticket_id
          })
        }
        for (let i of res.data.data){
          new QRCode(i.ticket_id, {
            text: i.ticket_num,
            width: 60,
            height: 60,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
          i.days = ((new Date(i.end_date.replace(/\./g, "/")) - new Date(i.begin_date.replace(/\./g, "/"))) / 1000 / 60 / 60 / 24) + 1;
          i.years = i.begin_date.split(".")[0];
        }
        
        this.setData({
          no_ticket1_data: false,
          ticketList: app.disposeData(res.data.data)
        })
        if (this.data.ticketList.length == 0) {
          this.setData({
            no_ticket1_data: true
          })
        }
      }
      wx.hideLoading()
    })
  },
  // 去详情页面
  goTicketDetail: function (e) {
    let ticketId = e.currentTarget.id
    let ticketCityId = e.currentTarget.dataset.city_id
    wx.navigateTo({
      url: '/pages/expoPackage/ticketDetail/ticketDetail?ticketId=' + ticketId
    })
  },
})