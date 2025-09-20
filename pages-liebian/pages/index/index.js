// pages-liebian/pages/index/index.js
import {
  util
} from "../../../common/util.js"
import {
  fission
} from "../../api/fissionApi";
const Api = new fission();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fromFriends: false,
    isZan: true,
    showFriendPop: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options:", options)
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }

    if (options.actId) {
      this.setData({
        queryActId: options.actId
      })
    }

    if (options.from && options.from === 'invite') {
      let inviteInfo = JSON.parse(options.inviteInfo);
      this.setData({
        inviteInfo,
        from: options.from,
        showFriendPop: true
      })
    }
    this.checkStatus()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const _this = this;
    let cityId = wx.getStorageSync('cityId');
    Api.checkToken().then((res) => {
      this.setData({
        isLogin: res.data.result == 1 ? true : false
      })
    })


    //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
    if (!cityId && wx.getStorageSync("isLocation")) {
      wx.navigateTo({
        url: '/pages/address/index?src=fisson',
      })
      return
    } else if (!cityId && !wx.getStorageSync("isLocation")) {
      //定位
      util.getPositionCity("fisson", () => {})
    }

    //获取授权登录code
    wx.login({
      success(res) {
        if (res.code) {
          _this.setData({
            code: res.code
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
    let timer = setTimeout(() => {
      wx.uma.trackEvent('enter_activityhome', {
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis'),
        activityID: this.data.queryActId ?? this.data.fission_act_id
      });
      clearTimeout(timer);
    }, 0);
  },

  //获取参与状态
  checkStatus() {
    wx.showLoading({
      title: '加载中...',
    })
    Api.fissionEntrance().then(res => {
      wx.hideLoading();
      if (res.status === 1) {
        let actStatus = res.data;
        this.setData({
          actStatus,
        })
        let params = {
          fission_act_id: this.data.queryActId ?? res.data.actId,
          initiate_user_id: wx.getStorageSync('userInfo').uid
        }
        Api.getUserActInfo(params).then(res => {
          if (res.status == 1) {
            if ((res.data.userFissionInfo.length > 0 && !this.data.inviteInfo) || (this.data.inviteInfo && this.data.inviteInfo.inviterId == wx.getStorageSync('userInfo').uid)) {
              //已参与 || 点击自己邀请链接进入 ，直接跳转主页
              wx.redirectTo({
                url: `/pages-liebian/pages/homePage/homePage?actId=${this.data.queryActId ?? this.data.actStatus.actId}`
              })
            }
          }
          this.getActInfo(this.data.queryActId ?? this.data.actStatus.actId);
        })
      }
    })
  },

  toHistory() {
    wx.navigateTo({
      url: '/pages-liebian/pages/historyList/historyList',
    })
  },

  toRules() {
    wx.navigateTo({
      url: `/pages-liebian/pages/rule/rule?actId=${this.data.queryActId ?? this.data.actStatus.actId}`,
    })
  },

  getActInfo(id) {
    wx.showLoading({
      title: '加载中...',
    })
    let params = {
      fission_act_id: id
    }
    Api.getActInfo(params).then(res => {
      wx.hideLoading();
      console.log('活动时间：', res);
      if (res.status === 1) {
        let s = new Date(res.data.end_time.replace(/-/g, "/"));
        let e = new Date(res.data.lottery_time.replace(/-/g, "/"));
        let sMon = (s.getMonth() + 1) < 10 ? '0' + (s.getMonth() + 1) : (s.getMonth() + 1);
        let sDay = s.getDate() < 10 ? '0' + s.getDate() : s.getDate();
        let sHour = s.getHours() < 10 ? '0' + s.getHours() : s.getHours();
        let sMin = s.getMinutes() < 10 ? '0' + s.getMinutes() : s.getMinutes();
        let eMon = (e.getMonth() + 1) < 10 ? '0' + (e.getMonth() + 1) : (e.getMonth() + 1);
        let eDay = e.getDate() < 10 ? '0' + e.getDate() : e.getDate();
        let eHour = e.getHours() < 10 ? '0' + e.getHours() : e.getHours();
        let eMin = e.getMinutes() < 10 ? '0' + e.getMinutes() : e.getMinutes();
        let tips = `${sMon}月${sDay}日${sHour}:${sMin}停止，${eMon}月${eDay}日${eHour}:${eMin}公布名单`;

        let btnText;
        switch (res.data.type) {
          case 2:
            btnText = '点击参与抽奖';
            break;
          case 3:
          case 4:
            btnText = '查看开奖结果';
            this.actEnd = true;
            break;
        }
        this.setData({
          actInfo: res.data,
          tips,
          btnText
        })
        this.timerInterval(res.data.end_time);
      }
    })
  },

  // 进入主页/点赞
  friendEnterReq(type) {
    // type === 'isEnter' 参与抽奖
    wx.showLoading({
      title: '加载中...',
    })
    let params = {
      fission_act_id: this.data.queryActId ?? this.data.actStatus.actId,
      initiate_user_id: type === 'isEnter' ? wx.getStorageSync('userInfo').uid : this.data.inviteInfo.inviterId,
      help_user_id: type === 'isEnter' ? 0 : wx.getStorageSync('userInfo').uid,
      city_id: wx.getStorageSync('cityId')
    }
    Api.friendEnter(params).then(res => {
      wx.hideLoading();
      console.log('好友：', res)
      if (res.status == 1) {
        if (type === 'isEnter' || (this.data.inviteInfo && wx.getStorageSync('userInfo').uid == this.data.inviteInfo.inviterId)) {
          let url = `/pages-liebian/pages/homePage/homePage?actId=${this.data.queryActId ?? this.data.actStatus.actId}`;
          if (this.data.btnText === '点击参与抽奖') {
            url = `/pages-liebian/pages/homePage/homePage?showTicketPopup=1&actId=${this.data.queryActId ?? this.data.actStatus.actId}`
          }
          wx.redirectTo({
            url
          })
          return;
        }
        if (res.data.code == 1) {
          this.setData({
            isZan: false
          })
        }
      } else {
        if (res.data.code == -3) {
          wx.redirectTo({
            url: `/pages-liebian/pages/homePage/homePage?actId=${this.data.queryActId ?? this.data.actStatus.actId}`
          })
        }
      }

      let timer = setTimeout(() => {
        wx.showToast({
          title: res.message,
          duration: 3000,
          icon: 'none'
        })
        clearTimeout(timer);
      }, 100);
    })
  },

  friendPopClose() {
    this.setData({
      showFriendPop: false
    })
  },

  //授权手机号
  getPhoneNumber(e) {
    const type = e.currentTarget.dataset.type;
    console.log(type)
    if (type === 'helpBtn' || type === 'friendZan') {
      wx.uma.trackEvent('click_inviteePopup', {
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis'),
        ButtonName: '帮好友点赞'
      });
    }
    // 友盟统计
    wx.uma.trackEvent('click_userHome', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: "登录btn",
      SourcePage: 'pages/user/userHome',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    util.authorizePhone(e, this.data.code, () => {
      this.setData({
        isLogin: true
      })
      if (type === 'historyBtn') {
        wx.navigateTo({
          url: '/pages-liebian/pages/historyList/historyList',
        })
      }
    })
  },

  // 获取头像昵称
  getUserInfo(e) {
    let type = e.currentTarget.dataset.type;
    let cityId = wx.getStorageSync('cityId');
    if (type === 'friendEnter') {
      wx.uma.trackEvent('click_inviteePopup', {
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis'),
        ButtonName: '我也要参与抽奖'
      });
      if (!cityId && wx.getStorageSync("isLocation")) {
        wx.navigateTo({
          url: '/pages/address/index?src=fisson',
        })
        return
      } else if (cityId) {
        this.friendEnterReq('isEnter');
      } else {
        //定位
        util.getPositionCity("fisson", () => {
          this.friendEnterReq('isEnter');
        })
      }
    } else {
      if (!wx.getStorageSync('userInfo').avatar || !wx.getStorageSync('userInfo').nick_name) {
        //没有头像昵称则必须授权
        this.getUserActInfo();
      } else {
        //发起活动/点赞
        if (type === "friendZan") {
          this.friendEnterReq();
        } else {
          if (this.actEnd) {
            //活动结束跳转主页
            wx.navigateTo({
              url: `/pages-liebian/pages/homePage/homePage?actId=${this.data.queryActId ?? this.data.actStatus.actId}`
            })
          } else {
            this.friendEnterReq('isEnter');
          }

        }
      }

    }
  },

  //获取用户参与活动信息
  getUserActInfo() {
    let _this = this;
    wx.getUserProfile({
      desc: '获取信息',
      lang: 'zh_CN',
      success(res) {
        console.log('用户信息：', res)
        let {
          avatarUrl,
          nickName
        } = res.userInfo;
        _this.setData({
          avatarUrl,
          nickName
        })
        let obj = wx.getStorageSync("userInfo");
        obj.avatar = avatarUrl;
        obj.nick_name = nickName;
        wx.setStorageSync('userInfo', obj);
        Api.updateUserInfo({
          avatar: avatarUrl,
          nick_name: nickName
        }).then(res => {
          console.log('更新头像昵称', res)
        })
      }
    })
  },


  // 倒计时
  timerInterval(actEndDate) {
    // let actEndDate = '2021-11-27 14:50:00';
    let nowTime = new Date().getTime();
    let endDate = new Date(actEndDate.replace(/-/g, "/")).getTime() - nowTime;
    if (endDate > 0) {
      this.setData({
        countOver: false
      })
      //倒计时
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
  },

  onShareAppMessage() {
    let userInfo = wx.getStorageSync('userInfo');
    let phone = this.data.phoneNum || userInfo.mobile;
    let actid = this.data.queryActId ?? this.data.actStatus.actId;
    let inviteInfo = {
      inviterId: userInfo.uid,
      inviterAvatar: userInfo.avatar || 'https://img.51jiabo.com/1a927c4f-1d8a-49a9-8720-c90ce2719f31.jpg',
      inviterName: userInfo.nick_name || phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
    }
    let path = `/pages-liebian/pages/index/index?src=${wx.getStorageSync('src')}&uis=${wx.getStorageSync('uis')}&actId=${actid}&from=invite&inviteInfo=${JSON.stringify(inviteInfo)}`
    console.log(path)
    return {
      title: this.data.actInfo.share_title,
      path
    }
  },

  onShareTimeline() {
    let title = this.data.actInfo.share_title;
    let userInfo = wx.getStorageSync('userInfo');
    let phone = userInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    let actid = this.data.queryActId ?? this.data.actStatus.actId;
    let inviteInfo = {
      inviterId: userInfo.uid,
      inviterAvatar: userInfo.avatar || 'https://img.51jiabo.com/1a927c4f-1d8a-49a9-8720-c90ce2719f31.jpg',
      inviterName: userInfo.nick_name || phone
    }
    wx.setClipboardData({
      data: title
    })
    return {
      title,
      query: `src=${wx.getStorageSync('src')}&uis=${wx.getStorageSync('uis')}&actId=${actid}&from=invite&inviteInfo=${JSON.stringify(inviteInfo)}`,
      // imageUrl: ''
    }
  },

})