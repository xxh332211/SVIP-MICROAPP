// pages-xmb/pages//luckyDraw/luckyDraw.js
import {
  xmb
} from "../../api/xmbApi.js";
const xmbApi = new xmb()
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  util
} from "../../../common/util.js"
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: false,
    isList: true,
    awardLevel: ["一等奖", "二等奖", "三等奖", "四等奖", "五等奖", "六等奖"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navigateHeight: app.systemData.statusBarHeight
    })
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.getRequest()
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
    if (this.data.flag) {
      //有flag标记则表示是返回页面
      this.setData({
        luckyAddress: wx.getStorageSync('luckyAddress'),
        flag: false
      })
      if (wx.getStorageSync('luckyAddress')) {
        wx.removeStorageSync('luckyAddress')
        this.setData({
          selectedAddress: this.data.addressInfo ? false : true
        })
        setTimeout(() => {
          //加延迟保证地址更新
          this.getRecord(this.data.luckyId)
        }, 500);
      } else {
        this.getRequest()
      }
    }
    //获取授权登录code
    let that = this;
    wx.login({
      success(res) {
        if (res.code) {
          that.setData({
            wxcode: res.code
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  getRequest() {
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      if (res.status == 1) {
        this.setData({
          isLogin: true,
          totalXmb: res.data.panda_coin
        })
      } else {
        this.setData({
          isLogin: false,
          totalXmb: 0
        })
      }
      xmbApi.getLotteryInfo().then((res) => {
        wx.hideLoading()
        if (res.code == 200 && res.data.id) {
          let length = res.data.prize?.length;
          if (res.data.prize?.length > 6) {
            res.data.prize = res.data.prize.slice(0, 6)
          }
          if (res.data.prize?.length < 6) {
            //小于6个则填充够6个
            let len = res.data.prize.length;
            for (let i = 0; i < 6 - len; i++) {
              res.data.prize.push(res.data.prize[i])
            }
          }
          for (let i = 0; i < 6; i++) {
            if (res.data.big_award == (i + 1)) {
              res.data.big_award = this.data.awardLevel[i]
            }
            for (let j = 0; j < 6; j++) {
              let item = res.data.prize[j];
              if (item.level == (i + 1)) {
                item.level = this.data.awardLevel[i];
              }
            }
          }
          this.setData({
            luckyId: res.data.id,
            countNum: parseInt(this.data.totalXmb / res.data.panda_coin),
            jackpot: res.data.prize.slice(0, length),
            lotteryInfo: res.data
          })
          this.getRecord(res.data.id)
        }
        if (res.code == 4003) {
          this.setData({
            freezePopup: true
          })
        }
        if (res.code == 200 && !res.data.id) {
          wx.showModal({
            content: "活动未上线",
            showCancel: false
          })
        }
      })
    })
  },
  //获取中奖名单和中奖记录
  getRecord(id) {
    xmbApi.getLotteryRecord({
      lottery_id: id
    }).then((res) => {
      if (res.code == 200) {
        this.setData({
          recordList: res.data
        })
      }
    })
    xmbApi.getSelfRecord({
      lottery_id: id
    }).then((res) => {
      if (res.code == 200) {
        if (this.data.addressInfo) {
          //如果是从选择地址返回，则显示选中地址的记录信息
          res.data.map((v) => {
            if (this.data.addressInfo.record_id == v.record_id) {
              this.setData({
                addressInfo: v
              })
            }
          })
        }
        this.setData({
          selfRecordList: res.data
        })
      }
    })
  },
  //授权手机号
  getPhoneNumber(e) {
    util.authorizePhone(e, this.data.wxcode, () => {
      this.setData({
        isLogin: true
      })
      //获取页面所有接口信息
      this.getRequest()
    })
  },
  switchTab(e) {
    let name = e.currentTarget.dataset.name;
    if (name == "isList") {
      this.setData({
        isList: true,
        isLog: false
      })
    } else {
      this.setData({
        isList: false,
        isLog: true
      })
    }
  },
  getCount(e) {
    this.setData({
      countNum: e.detail
    })
  },
  getFreeze() {
    this.setData({
      freezePopup: true
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
  checkJackpot() {
    this.setData({
      showJackpot: !this.data.showJackpot
    })
  },
  closePopup(e) {
    let name = e.currentTarget.dataset.name;
    this.setData({
      [name]: false
    })
  },
  checkStatus(e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      addressInfo: item,
      addressPopup: true
    })
  },
  toAddress() {
    wx.navigateTo({
      url: `/pages-userInfo/pages/userCenter/receiverAddress/receiverAddress?lotteryLogId=${this.data.addressInfo.record_id}`,
    })
  },
  copy(e) {
    let num = e.currentTarget.dataset.num;
    wx.setClipboardData({
      data: num
    })
  },
  getAngel(e) {
    let that = this;
    let lotteryNum = that.data.lotteryNum;
    if (lotteryNum > 0) {
      this.setData({
        angel: Math.floor(Math.random(1) * 360) /**传入的角度 */
      })
    } else {
      wx.showToast({
        title: '暂无抽奖机会啦~',
        icon: 'none'
      })
    }
  },
  getPrize(e) {
    let that = this;
    let options = that.data.rouletteData;
    let index = parseInt(that.data.angel / 60);
    let lotteryNum = that.data.lotteryNum;
    lotteryNum--;
    wx.showModal({
      title: '恭喜你',
      content: options.award[index].level,
      success: function (res) {
        that.setData({
          index: index,
          lotteryNum: lotteryNum
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      flag: true
    })
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