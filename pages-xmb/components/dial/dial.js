// pages-xmb/components/dial/dial.js
import {
  xmb
} from "../../api/xmbApi.js";
const xmbApi = new xmb()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLogin: Boolean,
    awards: Object,
    countNum: Number,
    selectedAddress: Boolean
  },
  observers: {
    selectedAddress(val) {
      this.setData({
        submitAddress: val
      })
    },
    awards(val) {
      if (val) {
        let that = this;
        let awards = val.prize,
          len = awards.length,
          html = [],
          turnNum = 1 / len, // 文字旋转 turn 值
          halfTurnNum = 1 / (len * 2);
        for (let i = 0; i < len; i++) {
          // 奖项列表
          html.push({
            turn: halfTurnNum + i * turnNum + 'turn',
            name: awards[i].name,
            awardImg: awards[i].image_url
          });
        }
        that.setData({
          awardsList: html
        });
      }
    },
    countNum(val) {
      this.setData({
        countNumber: val
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    submitAddress: false,
    virtual: false,
    awardsList: {},
    animationData: {},
    chance: true,
    runDegs: 0,
    duration: 6000,
    runNum: 10,
    countNumber: 0,
    recordId: 0
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //授权手机号
    getPhoneNumber(e) {
      this.triggerEvent("getPhoneNumber", e.detail)
    },
    getLottery() {
      let that = this;
      if (that.data.countNumber < 1) {
        //熊猫币不足提示
        that.setData({
          lackofPopup: true
        })
        return
      }
      if (!that.data.chance) {
        return false
      }
      that.setData({
        chance: false,
        submitAddress: false,
        prizePopup: false
      })
      xmbApi.getLotteryPrize({
        lottery_id: that.data.awards?.id
      }).then((res) => {
        if (res.code == 200) {
          that.setData({
            surNum: res.data.surplus_num,
            recordId: res.data.record_id,
            prizeId: res.data.prize_id
          })
          let Index = 0,
            list = that.data.awards.prize;
          for (let i = 0; i < list.length; i++) {
            if (res.data.prize_id == list[i].id) {
              Index = i;
              break;
            }
          }
          that.lotteryEvent(Index)
        } else if (res.code == 4003) {
          //熊猫币冻结
          that.triggerEvent("getFreeze")
        } else {
          that.setData({
            chance: true
          })
          wx.showToast({
            title: res.message,
            icon: "none"
          })
        }
      })
    },
    //抽奖前端动效
    lotteryEvent(awardIndex) {
      let that = this,
        deg = that.data.runDegs,
        awards = that.data.awards.prize,
        runNum = that.data.runNum; //设置转动次数
      // 旋转抽奖
      // console.log('deg', deg)
      deg = deg + (360 - deg % 360) + (360 * runNum - awardIndex * (360 / 6)) - 30;
      that.data.runDegs = deg;
      // console.log('deg', deg)

      let animationRun = wx.createAnimation({
        duration: that.data.duration,
        timingFunction: 'ease'
      })
      animationRun.rotate(deg).step()
      that.setData({
        animationData: animationRun.export()
      })

      // 中奖提示
      setTimeout(function () {
        that.data.countNumber--;
        that.triggerEvent("getRequest");
        that.triggerEvent("getCount", that.data.countNumber)
        that.setData({
          prizeName: awards[awardIndex].name,
          prizeImg: awards[awardIndex].image_url,
          prizeType: awards[awardIndex].type,
          prizePopup: true
        })
        xmbApi.getPrizeSendMsg({
          prize_id: that.data.prizeId
        })
        setTimeout(() => {
          that.setData({
            chance: true
          })
        }, 10);
      }, that.data.duration + 100);
    },
    closePopup(e) {
      let popup = e.currentTarget.dataset.popup;
      this.setData({
        [popup]: false
      })
    },
    toAddress() {
      this.setData({
        prizePopup: false
      })
      wx.navigateTo({
        url: `/pages-userInfo/pages/userCenter/receiverAddress/receiverAddress?lotteryLogId=${this.data.recordId}`,
      })
    },
    getCoin() {
      this.setData({
        prizePopup: false,
        submitAddress: false,
        lackofPopup: false
      })
      wx.navigateTo({
        url: '/pages-xmb/pages/xmbCenter/index/index',
      })
    }
  }
})