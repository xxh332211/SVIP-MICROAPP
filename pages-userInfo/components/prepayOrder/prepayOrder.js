// pages-userInfo/components/prepayOrder/prepayOrder.js
import {
  svip
} from '../../../common/api/svipApi.js'
let SvipApi = new svip();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object
  },
  observers: {
    item(val) {
      if (val.expire_time) {
        let that = this;
        let nowTime = val.now_time;
        let endDate = val.expire_time * 1000 - nowTime;
        // let endDate = 10000;
        let time = {};
        if (endDate > 0) {
          if (this.stop) {
            clearInterval(this.stop);
          }
          this.stop = setInterval(() => {
            let minute = Math.floor((endDate / 1000 / 60) % 60);
            let second = Math.floor((endDate / 1000) % 60);
            time.m = minute < 10 ? "0" + minute : minute;
            time.s = second < 10 ? "0" + second : second;
            if (endDate <= 0) {
              clearInterval(this.stop);
              that.triggerEvent("getList");
              return false;
            } else {
              endDate -= 1000;
            }
            that.setData({
              lastTime: time.m + ":" + time.s
            })
          }, 1000);
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lastTime: ""
  },

  pageLifetimes: {
    hide: function () {
      // 页面被隐藏
      clearInterval(this.stop);
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toDetail(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("toDetail", item)
    },
    // 取消
    toCancel(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("toCancel", item)
    },
    toPay(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("toPay", item)
    },
    deleteOrder(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("deleteOrder", item)
    },
    checkCode(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("checkCode", item)
    },
    reFundTips() {
      this.triggerEvent("reFundTips")
    },
    goodsRefund(e) {
      this.setData({
        curData: e,
        sureRefund: true
      })
    },
    reFund(e) {
      wx.showLoading({
        title: '退款中',
        mask: true
      })
      let params = {
        orderSn: this.data.curData.currentTarget.id
      }
      SvipApi.svipGoodsRefund(params).then((res) => {
        wx.hideLoading()
        this.setData({
          sureRefund: false
        })
        if (res.status == 1) {
          this.setData({
            price: Number(this.data.curData.currentTarget.dataset.price),
            showSuccessTip: true
          })
          this.triggerEvent("getList")
        } else {
          wx.showToast({
            icon: 'none',
            title: res.message ? res.message : "请求失败"
          })
        }
      })
    },
    closeSure() {
      this.setData({
        sureRefund: false
      })
    },
    // 退款成功提示框关闭
    closeTips() {
      this.setData({
        showSuccessTip: false
      })
    },
  }
})