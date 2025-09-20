// pages-liebian/pages/homePage/homePage.js
import {
  fission
} from "../../api/fissionApi.js";
const fissionApi = new fission()
import {
  svip
} from '../../../common/api/svipApi.js'
let SvipApi = new svip()
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasTicket: true,
    checked: true,
    count: 5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }
    if (options.showTicketPopup) {
      this.setData({
        ticketPopup: true
      })
      //获取是否索票
      this.getTicketsInfo()
    }
    this.setData({
      navigateHeight: app.systemData.statusBarHeight
    })
    wx.hideShareMenu({
      complete() {}
    })
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    // 获取活动id
    this.actId = options.actId;
    wx.showShareMenu()
    //获取活动信息
    this.getActInfo()
    //中奖名单
    fissionApi.getWinnerList({
      actId: this.actId,
      page: 1,
      pageSize: 15
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          winnerList: res.data
        })
      }
    })
    //用户参与活动信息
    this.getUserInfo()
    // fissionApi.userJoinAct({fission_act_id: this.actId,initiate_user_id:wx.getStorageSync('userInfo').uid})
    //获取客服二维码
    fissionApi.getCityConfig().then((res) => {
      if (res.status == 1) {
        this.setData({
          cityConfig: res.data
        })
      }
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
    if (this.isFromShare && !wx.getStorageSync('firstShareFission')) {
      this.setData({
        sharePopup: true
      })
      wx.setStorageSync('firstShareFission', 1);
      this.isFromShare = false;
    }
  },
  //获取活动信息
  getActInfo() {
    //获取活动信息
    fissionApi.getActInfo({
      fission_act_id: this.actId
    }).then((res) => {
      if (res.status == 1) {
        // res.data.background_color = "#F03152";
        let end_time = res.data.end_time,
          lottery_time = res.data.lottery_time;
        this.setData({
          actInfo: res.data,
          endTime: `${end_time?.substr(5,2)}月${end_time?.substr(8,2)}日 ${end_time?.substr(11,5)}`,
          lotteryTime: `${lottery_time?.substr(5,2)}月${lottery_time?.substr(8,2)}日 ${lottery_time?.substr(11,5)}`
        })
        //活动结束倒计时
        let nowTime = new Date().getTime();
        let endDate = new Date(end_time?.replace(/-/g, "/")).getTime() - nowTime;
        if (endDate > 0) {
          this.setData({
            countOver: false
          })
          //倒计时
          clearInterval(this.data.stop);
          this.data.stop = setInterval(() => {
            let days = Math.floor(endDate / 1000 / 60 / 60 / 24);
            let hours = Math.floor(endDate / 1000 / 60 / 60 % 24);
            let minute = Math.floor((endDate / 1000 / 60) % 60);
            let second = Math.floor((endDate / 1000) % 60);
            this.setData({
              days: days,
              hours: hours < 10 ? "0" + hours : hours,
              minute: minute < 10 ? "0" + minute : minute,
              second: second < 10 ? "0" + second : second
            })
            if (endDate <= 0) {
              this.setData({
                countOver: true
              })
              clearInterval(this.data.stop);
              return false;
            } else {
              endDate -= 1000;
            }
          }, 1000);
        } else {
          this.setData({
            countOver: true
          })
        }
      }
    })
  },
  //用户参与活动信息
  getUserInfo() {
    fissionApi.getUserActInfo({
      fission_act_id: this.actId,
      initiate_user_id: wx.getStorageSync('userInfo').uid
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          ticketList: res.data.userFissionInfo,
          helperList: res.data.userFissionHelpInfo,
          isWin: res.data.userFissionInfo.some((v) => {
            return v.is_drawaward > 0
          }),
          isJoin: res.data.userFissionInfo.length > 0 ? true : false
        })
        let ticketLen = res.data.userFissionInfo.length;
        if (ticketLen < 9) {
          this.setData({
            ticketAllList: res.data.userFissionInfo.concat(new Array(9 - ticketLen).fill({
              is_drawaward: ""
            }))
          })
        } else {
          this.setData({
            ticketAllList: res.data.userFissionInfo.slice(0, 10)
          })
        }
      }
    })
  },

  //返回
  goBack() {
    let pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: "/pages/getTicket/getTicket"
      })
    }
  },

  jumpLink(e) {
    let link = e.currentTarget.dataset.link;
    let name;
    switch (link) {
      case 'historyList/historyList':
        name = '参与记录';
        break;
      case 'rule/rule':
        name = '规则';
        break;
    }
    wx.uma.trackEvent('click_activity', {
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
      ButtonName: name
    });
    wx.navigateTo({
      url: `/pages-liebian/pages/${link}?actId=${this.actId}`
    })
  },

  checkAll() {
    wx.navigateTo({
      url: `/pages-liebian/pages/winners/winners?actId=${this.actId}`,
    })
  },

  serviceToggle() {
    wx.uma.trackEvent('click_activity', {
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
      ButtonName: '添加客服微信'
    });
    this.setData({
      servicePopup: !this.data.servicePopup
    })
  },

  shareToggle() {
    this.setData({
      sharePopup: !this.data.sharePopup
    })
  },

  checkTicket() {
    wx.uma.trackEvent('click_inviterPopup', {
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
      ButtonName: '勾选门票'
    });
    this.setData({
      checked: !this.data.checked
    })
  },
  closeTicket() {
    wx.uma.trackEvent('click_inviterPopup', {
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
      ButtonName: '好的'
    });
    clearInterval(this.data.timer)
    this.setData({
      ticketPopup: false
    })
    if (!this.data.hasTicket && this.data.checked) {
      this.getTicket()
    }
  },

  //判断是否索票
  getTicketsInfo() {
    SvipApi.activityInfo({
      cityId: wx.getStorageSync('cityId')
    }).then((res) => {
      wx.setStorageSync("activityId", res.activity_id)
      fissionApi.getTicketsInfo().then((res) => {
        if (res.status == 1) {
          this.setData({
            hasTicket: res.data.hasGetTicket //是否索取过门票
          })
        }
        //弹层5s倒计时
        this.data.timer = setInterval(() => {
          this.setData({
            count: --this.data.count
          })
          if (this.data.count == 0) {
            clearInterval(this.data.timer)
            this.setData({
              ticketPopup: false
            })
            if (!this.data.hasTicket && this.data.checked) {
              this.getTicket()
            }
          }
        }, 1000);
      })
    })
  },

  //索票接口
  getTicket() {
    let data = {
      source_id: "",
      src_id: "ticket",
      mobile: wx.getStorageSync("userInfo").mobile,
      invite: "",
      formId: "",
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis') || "抽奖裂变活动",
      plan: `抽奖裂变活动${this.actId}`,
      unit: wx.getStorageSync('unit')
    }
    fissionApi.postReserve(data).then((res) => {
      if (res.code == 200) {

      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.timer)
    clearInterval(this.data.stop);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timer)
    clearInterval(this.data.stop);
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
  onShareAppMessage: function (e) {
    wx.uma.trackEvent('click_activity', {
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
      ButtonName: e.target?.dataset?.name || '右上角分享'
    });
    this.isFromShare = true;
    wx.setClipboardData({
      data: this.data.actInfo.share_title
    })
    let inviterAvatar = wx.getStorageSync('userInfo')?.avatar || 'https://img.51jiabo.com/1a927c4f-1d8a-49a9-8720-c90ce2719f31.jpg',
      inviterName = wx.getStorageSync('userInfo')?.nick_name || wx.getStorageSync('userInfo')?.mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
      inviteInfo = JSON.stringify({
        inviterId: wx.getStorageSync('userInfo')?.uid,
        inviterAvatar: inviterAvatar,
        inviterName: inviterName
      });
    return {
      title: this.data.actInfo.share_title,
      path: `/pages-liebian/pages/index/index?src=${wx.getStorageSync('src')}&uis=${wx.getStorageSync('uis')}&actId=${this.actId}&from=invite&inviteInfo=${inviteInfo}`
    }

  },
  /**
   * 用户点击右上角分享朋友圈
   */
  // onShareTimeline() {
  //   wx.setClipboardData({
  //     data: this.data.actInfo.share_title
  //   })
  //   return {
  //     title: this.data.actInfo.share_title,
  //     path: ""
  //   }
  // }
})