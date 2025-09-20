let appData = getApp();
import cryptoJs from '../../../utils/crypto.js';
import {
  liveApi
} from "../../../common/api/liveApi"
let LiveApi = new liveApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:5,
    page:0,
    pageSize:10,
    liveListAll:[]
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
    this.getname()
    this.liveList()
  },

  //去直播间
  toLiveRoom(e) {
    var status = e.currentTarget.dataset.status
    if(status == 2 || status == 3){    //直播中
      wx.navigateToMiniProgram({
        appId: 'wx8e0746fdfcbf770c',
        path: '/pages/liveRoom/liveRoom?token='+ wx.getStorageSync('token') + '&cityId=' + wx.getStorageSync('cityId') + '&liveId=' + e.currentTarget.dataset.liveid,
        envVersion: "trial"
      })
    }else if(status == 1){   //预告
      wx.navigateToMiniProgram({
        appId: 'wx8e0746fdfcbf770c',
        path: '/pages/yugao/yugao?token='+ wx.getStorageSync('token') + '&cityId=' + wx.getStorageSync('cityId') + '&liveId=' + e.currentTarget.dataset.liveid,
        envVersion: "trial"
      })
    }else if(status == 4){   //回放
      let liveId = e.currentTarget.dataset.liveid;
      let cityId = wx.getStorageSync('cityId');
      //判断环境跳转不同H5页面
      let url = "https://svip.51jiabo.com/livePlayback?liveId=" + liveId + "&cityId=" + cityId
      let version = __wxConfig.envVersion
      if (!version) version = __wxConfig.platform
      if (version == "release") {
        url = "https://svip.51jiabo.com/livePlayback?liveId=" + liveId + "&cityId=" + cityId
      }
      LiveApi.liveUserVideoCollection({
        liveId: liveId,
        cityId: cityId
      }).then(() => {
        wx.navigateToMiniProgram({
          appId: 'wx8e0746fdfcbf770c',
          path: '/pages/web/web?token='+ wx.getStorageSync('token') + '&url=' + encodeURIComponent(url),
          envVersion: "trial"
        })
      })
    }
    
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      page: ++this.data.page
    })
    this.liveList()
  },
  // 热门和频道列表接口（不包涵预约列表）
  liveList(){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    let data = {
      cityId:wx.getStorageSync('cityId'),
      channelId:0,
      page:this.data.page,
      pageSize:this.data.pageSize
    }
    LiveApi.liveList(data).then((res)=>{
      wx.hideLoading()
      if(res.status == 1){
        var liveList = []
        res.data.map((item,i)=>{
          let num = Number(item.look_count) + Number(item.init_count);
          console.log(num,item.look_count,item.init_count)

          liveList.push(item)
          liveList[i].lookLiveNum = num.toString()
        })
        this.setData({
          liveListAll:this.data.liveListAll.concat(liveList),
          total:Number(res.data.total)
        })
        if(res.data.length == 0){
          wx.showToast({
            title: '没有更多了',
            icon:'none'
          })
        }
      }else{
        wx.showToast({
          title: res.message,
          icon:'none'
        })
      }
    })
  },
  getname(){
    var that = this;
    this.name = setInterval(() => {
      if(this.data.num == 0){
        clearInterval(this.name)
        console.log(that.data.num)
      }else{
        that.data.num --;
        console.log(that.data.num)
        clearInterval(this.name)
        this.getname()
      }
    }, 1000);
  }

})