// pages-userInfo/components/onlineOrder/onlineOrder.js
import {
  absApi
} from "../../../common/api/absAPI";
const AbsApi = new absApi();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object
  },
  observers: {
    item(val) {
      if (val.create_time) {
        let nowTime = val.now_time;
        let b = new Date(val.create_time.replace(/-/g, "/")).getTime() + 15 * 60 * 1000
        let endDate = b - nowTime;
        let that = this;
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
        } else {
          // that.triggerEvent("getList")
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
    // 复制单号
    copy(e) {
      wx.setClipboardData({
        //准备复制的数据
        data: e.currentTarget.dataset.order,
        success: function () {
          wx.showToast({
            title: '复制成功',
            icon: 'none',
            duration: 3000
          });
        }
      });
    },
    toCommonDetail(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("toCommonDetail", item)
    },
    deleteOrder(e) {
      let item = e.currentTarget.dataset.item;
      this.triggerEvent("deleteOrder", item)
    },
    // 取消 
    cancelPop(e) {
      this.setData({
        orderId: e.currentTarget.dataset.order_id,
        pop6: true
      })
    },
    cancelPreOrder() {
      const data = {
        order_id: this.data.orderId
      }
      AbsApi.cancelPreOrder(data).then(res => {
        wx.hideLoading()
        this.setData({
          pop6: false
        })
        if (res.status == 1) {
          this.triggerEvent("getList")
        } else {
          wx.showToast({
            title: res.message,
            icon: "none"
          })
        }
      }).catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: err.message,
        })
      })
    },
    popUnShow(e) {
      if (e.currentTarget.dataset.id) {
        this.setData({
          delOrderId: e.currentTarget.dataset.id
        })
      }
      let popup = e.currentTarget.dataset.name;
      this.setData({
        [popup]: !this.data[popup]
      })
    },
    // 支付 15:00
    payBtn(e) {
      let orderid = e.currentTarget.dataset.orderid;
      wx.showLoading({
        title: '支付中',
        mask: true
      })
      const data = {
        orderNum: e.currentTarget.dataset.ordernum
      }
      AbsApi.prePay(data).then((res) => {
        wx.hideLoading()
        if (res.status == 1) {
          wx.requestPayment({
            'timeStamp': res.data.time_stamp,
            'nonceStr': res.data.nonce_str,
            'package': res.data.package,
            'signType': "MD5",
            'paySign': res.data.pay_sign,
            'success': function (res) {
              wx.showLoading({
                title: '加载中...',
              })
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages-abs/pages/orderDetail/orderDetail?order_id=' + orderid,
                })
              }, 1000)
            },
            'fail': function (res) {
              wx.showToast({
                title: '取消支付',
                icon: 'none'
              })
            }
          })
        } else {
          this.setData({
            pop2Text: res.message,
            pop2: true
          })
          // wx.showToast({
          //   title: res.message,
          //   icon: 'none'
          // })
        }
      }).catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: err.message,
        })
      })
    },
  }
})