// pages-abs/pages/orderDetail/orderDetail.js
import {
  absApi
} from "../../../common/api/absAPI";
const AbsApi = new absApi()
import {
  svip
} from "../../../common/api/svipApi.js"
let SvipApi = new svip()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refundNum: 1,
    maxtime: 0,
    showMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // orderType 1:展会订单；3:线上订单；
    this.setData({
      type: options.orderType ?? 3,
      order_id: options.order_id
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
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.initData()
  },
  // 初始化数据
  initData() {
    const that = this
    const data = {
      order_id: this.data.order_id,
    }
    if (this.data.type == 1) {
      AbsApi.expoOrderDetail(data).then((res) => {
        wx.hideLoading()
        if (res.status == 1) {
          if (res.data.goods.length > 0) {
            res.data.goods = res.data.goods.map((v) => {
              v.image_url = v.image_url ?? res.data.logo_url;
              return v
            })
          } else {
            res.data.goods.push({
              image_url: res.data.logo_url
            })
          }
          that.setData({
            order: res.data
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: "none"
          })
        }
      })
    } else {
      AbsApi.onlineOrderDetail(data).then(res => {
        wx.hideLoading()
        if (res.status == 1) {
          let newDares = new Date().getTime(),
            endTime = new Date(res.data.expo_end_time.replace(/-/g, '/')).getTime();
          res.data.expo_begin_time = res.data.expo_begin_time.split(" ")[0].substr(5).replace(/-/g, '.');
          res.data.expo_end_time = res.data.expo_end_time.split(" ")[0].substr(5).replace(/-/g, '.');
          that.setData({
            expoEnd: newDares > endTime ? true : false,
            order: res.data
          })
          if (res.data.order_status_text == '待付款') {
            this.countDown(res.data.create_time)
          }
          if (res.data.supplier_stores_list.length > 0) {
            this.setData({
              storeList: res.data.supplier_stores_list.slice(0, 1)
            })
          }
        } else {
          wx.showToast({
            title: res.message,
            icon: "none"
          })
        }
      })
    }
  },
  //订单详情操作订单，需要强制更新订单列表，否则会出现状态不一致
  getAllOrder() {
    SvipApi.getOrderList({
      order_list_type: this.data.type,
      is_update: 1
    })
  },
  //查看全部店铺
  moreStore() {
    this.setData({
      showMore: !this.data.showMore
    }, () => {
      this.setData({
        storeList: this.data.showMore ? this.data.order.supplier_stores_list : this.data.order.supplier_stores_list.slice(0, 1)
      })
    })
  },
  // 倒计时
  countDown(date) {
    // date = "2021-08-25 15:25:00";
    let that = this;
    let nowTime = this.data.order.now_time;
    let b = new Date(date.replace(/-/g, "/")).getTime() + 15 * 60 * 1000
    let endDate = b - nowTime;
    let time = {};
    if (endDate > 0) {
      let stop = setInterval(() => {
        let minute = Math.floor((endDate / 1000 / 60) % 60);
        let second = Math.floor((endDate / 1000) % 60);
        time.m = minute < 10 ? "0" + minute : minute;
        time.s = second < 10 ? "0" + second : second;
        if (endDate <= 0) {
          clearInterval(stop);
          that.initData();
          that.getAllOrder();
          return false;
        } else {
          endDate -= 1000;
        }
        that.setData({
          minute: time.m,
          second: time.s,
          msg: time.m + ":" + time.s
        })
      }, 1000);
    }
  },
  applyRefund() {
    if (this.data.order.buy_count == 1) {
      this.setData({
        pop1: true
      })
    } else {
      this.setData({
        refundPopup: true
      })
    }
  },
  minus() {
    if (this.data.refundNum > 1) {
      this.setData({
        refundNum: --this.data.refundNum
      })
    }
  },
  plus() {
    if (this.data.refundNum < Number(this.data.order.buy_count)) {
      this.setData({
        refundNum: ++this.data.refundNum
      })
    }
  },
  closePopup(e) {
    let name = e.currentTarget.dataset.name;
    this.setData({
      [name]: !this.data[name]
    })
  },
  refundTips() {
    this.setData({
      refundPopup: false,
      pop1: true
    })
  },
  // 退款
  confirmRefund() {
    wx.showLoading({
      title: '退款中...',
      mask: true
    })
    AbsApi.onlineOrderRefund({
      order_id: this.data.order_id,
      refund_num: this.data.refundNum
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          pop2Text: "退款申请已提交，1~2工作日为您处理",
          pop1: false,
          pop2: true,
          refundNum: 1
        })
        this.initData();
        this.getAllOrder();
      } else {
        this.setData({
          pop1: false,
          pop4Text: res.message ? res.message : "服务器异常",
          pop4: true
        })
        // wx.showToast({
        //   title: res.message ? res.message : "服务器异常",
        //   icon: "none"
        // })
      }
    })
  },
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
  // 删除订单
  deleteOrder() {
    AbsApi.deleteOrder({
      order_sn: this.data.order.order_num,
      order_list_type: this.data.type
    }).then((res) => {
      if (res.status != 1) {
        wx.showToast({
          title: res.message,
          icon: 'none',
        })
        return
      }
      wx.showToast({
        title: '删除成功',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        })
      }, 1000)
    })
  },
  // 取消订单 
  cancelOrder() {
    let that = this;
    const data = {
      order_id: this.data.order.order_id
    }
    AbsApi.cancelPreOrder(data).then(res => {
      wx.showToast({
        title: res.message,
        icon: 'none',
        success() {
          that.setData({
            pop6: false
          })
          that.initData();
          that.getAllOrder();
        }
      })
    })
  },
  // 线上订单待支付
  payBtn() {
    const that = this
    wx.showLoading({
      title: '支付中...',
      mask: true
    })
    const data = {
      orderNum: this.data.order.order_num
    }
    AbsApi.prePay(data).then((res) => {
      if (res.status == 1) {
        wx.requestPayment({
          'timeStamp': res.data.time_stamp,
          'nonceStr': res.data.nonce_str,
          'package': res.data.package,
          'signType': "MD5",
          'paySign': res.data.pay_sign,
          'success': function (res) {
            wx.hideLoading()
            wx.showToast({
              title: '支付成功',
            })
            setTimeout(() => {
              that.initData();
              that.getAllOrder();
            }, 1000)
          },
          'fail': function (res) {
            wx.hideLoading()
            wx.showToast({
              title: '取消支付',
              icon: 'none'
            })
          }
        })
      } else {
        wx.hideLoading()
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
    })
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})