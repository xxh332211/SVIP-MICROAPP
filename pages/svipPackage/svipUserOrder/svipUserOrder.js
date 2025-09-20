// pages/svipPackage/svipUserOrder/svipUserOrder.js
let QRCode = require('../../../utils/qrcode.js')
import {
  svip
} from '../../../common/api/svipApi.js'
let SvipApi = new svip()
let app = getApp()
var sliderWidth = 35; // 需要设置slider的宽度，用于计算中间位置
Page({
  data: {
    qiehuan: [{
      txt: '预约商品',
      id: 4
    }, {
      txt: '定金商品',
      id: 2
    }, {
      txt: '全款商品',
      id: 1
    }],
    activeIndex: 4,
    oriderList: [],
    oriderList2: [],
    oriderList4: [],
    no_ticket1_data: false,
    no_ticket2_data: false,
    no_ticket4_data: false,
    success: false, // 退款成功
    price: '',
    ticket_notice: {
      notice_img: "https://img.51jiabo.com/6ac4653f-ff51-4834-a5ac-c5a3b79d9b36.png",
      notice_msg: "没有订单信息~",
      notice_btn: ""
    },
    showMoreChooseOnePopup: false,
    showMoreChooseOneTips: false,
    isMCOChoose: false,
    showRefundPopup: false,
    canClickConfirmRefund: false,
    refundFailReason: '',
    refundInterval: 3,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //如果是商品支付页跳过来的，根据type判断
    let type = 4;
    if (options && options.type) {
      type = options.type;
      this.setData({
        activeIndex: options.type
      })
    }
    let params = {
      type: type
    }
    this.getDataList(params)
  },
  // 获取订单信息
  getDataList(data, noHide) {
    if (this.stop1) {
      clearInterval(this.stop1)
    };
    if (this.stop2) {
      clearInterval(this.stop2)
    };
    // type：商品类型：1=全款商品，2=定金商品，3=会员爆品，4=预约商品
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.goodsOrderList(data, "POST").then((res) => {
      if (!noHide) wx.hideLoading()
      wx.stopPullDownRefresh()
      if (data.type == 4) {
        // res = [
        //   {
        //     goods_id: 82,
        //     type: 2,
        //     goods_sn: "",
        //     order_sn: "T201904161537090058",
        //     goods_price: 10,
        //     num: 1,
        //     amount: 0.03,
        //     status: 1,
        //     delivered: 0,
        //     logistics_sn: "",
        //     goods_name: "上海：龙凤真皮软床头层黄牛皮木等等",
        //     goods_image: "https://img.51jiabo.com/20190211144103119.jpg",
        //     origin_price: 2600,
        //     expire_time: 1557644133,
        //     create_date: "2019-05-09 16:42:40",
        //     prepay_amount: 0.03,
        //     begin_date: "2019-04-25 00:00:00",
        //     end_date: "2019-10-30 23:59:59",
        //     venue_name: "世博展览馆",
        //     verify_code: "11212121212121212",
        //     is_check: 0
        //   },
        //   {
        //     goods_id: 4,
        //     type: 2,
        //     goods_sn: "",
        //     order_sn: "T201901151155100020",
        //     goods_price: 0.01,
        //     num: 2,
        //     amount: 0.02,
        //     status: 1,
        //     delivered: 0,
        //     logistics_sn: "asdfghasdf",
        //     goods_name: "电饭煲",
        //     goods_image: "https://img.51jiabo.com/20181227164655173.jpg",
        //     origin_price: 1,
        //     prepay_amount: 0,
        //     expire_time: 1557643333,
        //     create_date: "2019-05-09 16:12:40",
        //     begin_date: "2019-10-01 00:00:00",
        //     end_date: "2019-10-03 23:59:59",
        //     venue_name: "世博展览馆",
        //     verify_code: "11212121212121213",
        //     is_check: 1
        //   }
        // ];
        if (res.length == 0) {
          this.setData({
            no_ticket4_data: true
          })
        } else {
          this.setData({
            no_ticket4_data: false
          })
        }
        let data = res.map((item) => {
          let a = new Date().getTime()
          let b = new Date(item.end_date).getTime()
          item.isOut = a > b ? true : false
          item.codeTime = item.end_date
          item = app.disposeData(item)
          return item
        })
        this.setData({
          oriderList4: data
        })
        return
      }
      if (data.type == 1) {
        // 1=全款商品
        if (res.length == 0) {
          this.setData({
            no_ticket1_data: true
          })
        } else {
          this.setData({
            no_ticket1_data: false
          })
        }
        let data = res.map((item) => {
          let a = new Date().getTime()
          let b = new Date(item.end_date).getTime()
          item.isOut = a > b ? true : false
          item.codeTime = item.end_date
          item = app.disposeData(item)
          return item
        })
        this.setData({
          oriderList: data
        })
        //添加倒计时参数
        res.find((v) => {
          let nowTime = new Date().getTime();
          let endDate = v.expire_time * 1000 - nowTime;
          if (endDate > 0 && v.status == 0) {
            //倒计时
            this.stop1 = setInterval(() => {
              let minute = Math.floor((endDate / 1000 / 60) % 60);
              let second = Math.floor((endDate / 1000) % 60);
              let min = minute < 10 ? "0" + minute : minute;
              let sec = second < 10 ? "0" + second : second;
              if (endDate <= 0) {
                v.status = -1;
                this.setData({
                  oriderList: this.data.oriderList
                })
                clearInterval(this.stop1);
                return false;
              } else {
                endDate -= 1000;
              }
              v.goods_time = min + ":" + sec;
              this.setData({
                oriderList: this.data.oriderList
              })
            }, 1000);
          } else {
            if (v.status == 0) {
              v.status = -1;
              this.setData({
                oriderList: this.data.oriderList
              })
            }
          }
        })
        return
      }
      if (data.type == 2) {
        // 1=定金商品
        if (res.length == 0) {
          this.setData({
            no_ticket2_data: true
          })
        } else {
          this.setData({
            no_ticket2_data: false
          })
        }
        let data = res.map((item) => {
          let a = new Date().getTime()
          let b = new Date(item.end_date).getTime()
          item.isOut = a > b ? true : false
          item.codeTime = item.end_date
          item = app.disposeData(item)
          return item
        })
        this.setData({
          oriderList2: data
        })
        //添加倒计时参数
        res.find((v) => {
          let nowTime = new Date().getTime();
          let endDate = v.expire_time * 1000 - nowTime;
          // let endDate = 10000;
          if (endDate > 0 && v.status == 0) {
            //倒计时
            this.stop2 = setInterval(() => {
              let minute = Math.floor((endDate / 1000 / 60) % 60);
              let second = Math.floor((endDate / 1000) % 60);
              let min = minute < 10 ? "0" + minute : minute;
              let sec = second < 10 ? "0" + second : second;
              if (endDate <= 0) {
                v.status = -1;
                this.setData({
                  oriderList2: this.data.oriderList2
                })
                clearInterval(this.stop2);
                return false;
              } else {
                endDate -= 1000;
              }
              v.goods_time = min + ":" + sec;
              this.setData({
                oriderList2: this.data.oriderList2
              })
            }, 1000);
          } else {
            if (v.status == 0) {
              v.status = -1;
              this.setData({
                oriderList2: this.data.oriderList2
              })
            }
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},
  onReady: function () {},
  goodsRefund(e) {
    console.log(e)
    let item = e.currentTarget.dataset.item;
    this.setData({
      curData: e,
      curItem: item
    })
    if (item.activity_type == 1) {
      // n选1
      this.moreChooseOneGoodsListReq(item.order_sn)
    } else {
      if (item.send_type == 2) {
        // 邮寄
        this.getCityConfig();
      } else {
        // 到展
        this.setData({
          sureRefund: true
        })
      }
    }


  },
  reFund(e) {
    wx.showLoading({
      title: '退款中',
    })
    let params = {
      orderSn: this.data.curData.currentTarget.id
    }
    SvipApi.svipGoodsRefund(params).then((res) => {
      console.log(res)
      if (res.status == 1) {
        // wx.hideLoading()
        this.setData({
          price: Number(this.data.curData.currentTarget.dataset.price),
          sureRefund: false,
        })
        if (this.data.activeIndex == 1) {
          let params = {
            type: 1
          }
          let needHide = 0;
          if (e.currentTarget.dataset.type == 'mco') { // n选一
            this.setData({
              showMoreChooseOneTips: true,
              isMCOChoose: false,
              showMoreChooseOnePopup: false,
            })
            this.getDataList(params, needHide)
          } else {
            needHide = 1;
            this.setData({
              showRefundPopup: false,
              canClickConfirmRefund: false,
              refundFailReason: ''
            })
            setTimeout(() => {
              wx.showToast({
                title: '退款申请已提交',
                duration: 3000
              })
            }, 300)
            this.getDataList(params, needHide)
          }
        }
        if (this.data.activeIndex == 2) {
          let params = {
            type: 2
          }
          this.setData({
            success: true,
            refundTypeText: '商品定金退款成功'
          })
          this.getDataList(params)
        }
        if (this.data.activeIndex == 4) {
          let params = {
            type: 4
          }
          this.getDataList(params)
          this.setData({
            success: true
          })
        }
      } else {
        wx.showToast({
          icon: 'none',
          title: res.message ? res.message : "请求失败"
        })
      }
    })
  },
  //查看券码
  checkCode(e) {
    let v = e.currentTarget.dataset.info;
    let nowTime = new Date().getTime();
    let endTime = v.codeTime.replace(/-/g, "/");
    let endTimeMs = new Date(endTime).getTime();
    if ((nowTime > endTimeMs) && v.is_check == 0) {
      //华为手机二维码出不来要调用两次才可以🙂
      new QRCode("qrcode", {
        text: v.verify_code,
        width: 170,
        height: 170,
        colorDark: "#7F7F7F",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      new QRCode("qrcode", {
        text: v.verify_code,
        width: 170,
        height: 170,
        colorDark: "#7F7F7F",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      this.setData({
        pastDue: true
      })
    } else {
      new QRCode("qrcode", {
        text: v.verify_code,
        width: 170,
        height: 170,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      new QRCode("qrcode", {
        text: v.verify_code,
        width: 170,
        height: 170,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      this.setData({
        pastDue: false
      })
    }
    this.setData({
      beginDate: v.begin_date,
      endDate: v.codeTime.split(' ')[0].split(/[-.]/).slice(1).join('.'),
      isCheck: v.is_check,
      couCode: v.verify_code,
      showCode: true
    })
  },
  //去详情页
  toDetail(e) {
    var itemOrder = e.currentTarget.dataset.item

    console.log(itemOrder)
    if (itemOrder.activity_type == 1) {
      return
    }
    //判断商品是否已下线
    if (e.currentTarget.dataset.item.is_offline == 1) {
      this.setData({
        offLinePopup: true
      })
    } else {
      let id = e.currentTarget.dataset.item.goods_id;
      let orderSn = e.currentTarget.dataset.item.order_sn;
      //全款商品带订单号跳转
      if ((itemOrder.type == 1 || itemOrder.type == 2) && itemOrder.status == 0) {
        wx.navigateTo({
          url: '/pages/svipPackage/payProductDetail/payProductDetail?id=' + id + '&orderSn=' + orderSn
        })
      } else {
        wx.navigateTo({
          url: '/pages/svipPackage/payProductDetail/payProductDetail?id=' + id
        })
      }
    }
  },
  //去支付
  toPay(v) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this
    var itemOrder = v.currentTarget.dataset.item
    console.log(v.currentTarget.dataset.item)
    // wx.navigateTo({
    //   url: '/pages/svipPackage/payProductDetail/payProductDetail?id=' + id + '&orderSn=' + orderSn,
    // })
    let type = this.data.activeIndex
    let data = {
      goodsId: itemOrder.goods_id,
      num: 1,
      payType: 3,
      consignee: itemOrder.consignee,
      mobile: itemOrder.mobile,
      orderSn: itemOrder.order_sn,
      address: itemOrder.address,
      send_type: itemOrder.send_type,
      token: wx.getStorageSync('token'),
      'src': wx.getStorageSync('src'),
      'uis': wx.getStorageSync('uis'),
      'plan': wx.getStorageSync('plan'),
      'unit': wx.getStorageSync('unit')
    }
    // 定金商品支付
    if (type == 2) {
      SvipApi.svipBookingGoodsOrderSubmit(data, "POST").then((res) => {
        wx.hideLoading()
        wx.requestPayment({
          'timeStamp': res.time_stamp,
          'nonceStr': res.nonce_str,
          'package': res.package,
          'signType': "MD5",
          'paySign': res.pay_sign,
          'success': function (res) {
            wx.showLoading({
              title: '加载中',
              mask: true
            })
            setTimeout(() => {
              wx.hideLoading()
              let params = {
                type: 2
              }
              that.getDataList(params)
            }, 2000)
          },
          'fail': function (res) {
            wx.showModal({
              title: '购买失败！',
              content: '购买出现问题，请尝试重新支付',
              confirmColor: "#E5002D",
              success(res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '加载中',
                    mask: true
                  })
                  SvipApi.svipBookingGoodsOrderSubmit(data, 'POST').then((res) => {
                    wx.requestPayment({
                      'timeStamp': res.time_stamp,
                      'nonceStr': res.nonce_str,
                      'package': res.package,
                      'signType': "MD5",
                      'paySign': res.pay_sign,
                      success(res) {
                        wx.hideLoading()
                        wx.showToast({
                          title: '支付成功！',
                          duration: 1000,
                          complete() {
                            setTimeout(() => {
                              let params = {
                                type: 2
                              }
                              that.getDataList(params)
                            }, 2000)
                          }
                        })
                      },
                      fail(res) {
                        wx.showToast({
                          title: '支付失败！',
                          duration: 1000,
                          complete() {}
                        })
                      }
                    })
                  })
                }
              }
            })
          }
        })
      })
    }
    // 全款商品支付
    if (type == 1) {
      SvipApi.svipGoodsOrderSubmit(data, "POST").then((res) => {
        wx.hideLoading()
        wx.requestPayment({
          'timeStamp': res.time_stamp,
          'nonceStr': res.nonce_str,
          'package': res.package,
          'signType': "MD5",
          'paySign': res.pay_sign,
          'success': function (res) {
            wx.showLoading({
              title: '加载中',
              mask: true
            })
            setTimeout(() => {
              wx.hideLoading()
              let params = {
                type: 1
              }
              that.getDataList(params)
            }, 2000)
          },
          'fail': function (res) {
            wx.showModal({
              title: '购买失败！',
              content: '购买出现问题，请尝试重新支付',
              confirmColor: "#E5002D",
              success(res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '加载中',
                    mask: true
                  })
                  SvipApi.svipBookingGoodsOrderSubmit(data, 'POST').then((res) => {
                    wx.requestPayment({
                      'timeStamp': res.time_stamp,
                      'nonceStr': res.nonce_str,
                      'package': res.package,
                      'signType': "MD5",
                      'paySign': res.pay_sign,
                      success(res) {
                        wx.hideLoading()
                        wx.showToast({
                          title: '支付成功！',
                          duration: 1000,
                          complete() {
                            setTimeout(() => {
                              let params = {
                                type: 2
                              }
                              that.getDataList(params)
                            }, 2000)
                          }
                        })
                      },
                      fail(res) {
                        wx.showToast({
                          title: '支付失败！',
                          duration: 1000,
                          complete() {}
                        })
                      }
                    })
                  })
                }
              }
            })
          }
        })
      })
    }
  },
  // 取消
  toCancel(e) {
    this.setData({
      sureCancel: true,
      cancel_id: e.currentTarget.dataset.item.order_id
    })
  },
  cancelSure() {
    this.setData({
      sureCancel: false
    })
  },
  // 订单取消
  cancelRefund() {
    wx.showLoading({
      title: '取消中',
    })
    let params = {
      token: wx.getStorageSync('token'),
      orderId: this.data.cancel_id
    }
    SvipApi.svipGoodsCancel(params).then((res) => {
      console.log(res)
      if (res.status == 1) {
        wx.hideLoading()
        this.setData({
          sureCancel: false
        })
        if (this.data.activeIndex == 1) {
          let params = {
            type: 1
          }
          this.getDataList(params)
        }
        if (this.data.activeIndex == 2) {
          let params = {
            type: 2
          }
          this.getDataList(params)
        }
      } else {
        wx.showToast({
          icon: 'none',
          title: res.message ? res.message : "请求失败"
        })
      }
    })



    // wx.hideLoading()

  },

  confirmHandle() {
    this.setData({
      success: false
    })
  },
  tabClick(e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      activeIndex: id
    })
    let params = {
      type: id
    }
    this.getDataList(params)
  },
  reFundTips() {
    this.setData({
      unRefund: true,
      unRefundText: '该商品已领取，不可退款。'
    })
  },
  drawTips() {
    this.setData({
      unRefund: true,
      unRefundText: '该商品已发货，不可退款。'
    })
  },
  closeCode() {
    this.setData({
      showCode: false
    })
  },
  closeSure() {
    this.setData({
      sureRefund: false
    })
  },
  closeUn() {
    this.setData({
      unRefund: false
    })
  },
  offLine() {
    this.setData({
      offLinePopup: false
    })
  },
  // 复制单号
  copy(e) {
    wx.setClipboardData({
      //准备复制的数据
      data: e.currentTarget.dataset.order,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'none',
          duration: 3000
        });
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.closeCode()
    if (this.data.activeIndex == 1) {
      let params = {
        type: 1
      }
      this.getDataList(params)
    }
    if (this.data.activeIndex == 2) {
      let params = {
        type: 2
      }
      this.getDataList(params)
    }
    if (this.data.activeIndex == 4) {
      let params = {
        type: 4
      }
      this.getDataList(params)
    }
  },

  // 关闭n选1退款弹层
  close_MCOP() {
    this.setData({
      showMoreChooseOnePopup: false
    })
  },

  // n选1退款弹层选择
  MCO_choose(e) {
    wx.showLoading({
      title: '加载中...',
    })
    let order_sn;
    this.data.moreChooseOneGoodsAllListData.goods_list.forEach(item => {
      if (item.order_id != 0) order_sn = item.order_sn;
    })
    let params = {
      order_sn,
      goods_id: e.currentTarget.dataset.goods_id
    }
    SvipApi.chooseChangeOrder(params).then(res => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          showMoreChooseOneTips: true,
          isMCOChoose: true,
          showMoreChooseOnePopup: false
        })
        let params = {
          type: 1
        }
        this.getDataList(params)
      }
    })

  },

  // n选1提示框关闭
  MCO_closeTips() {
    this.setData({
      showMoreChooseOneTips: false
    })
  },

  // 关闭退款须知/失败 弹框
  closeRefundPopup() {
    this.setData({
      showRefundPopup: false,
      refundFailReason: ''
    })
  },

  // n选1活动商品列表
  moreChooseOneGoodsListReq(order) {
    wx.showLoading({
      title: '加载中...',
    })
    SvipApi.moreChooseOneGoodsList().then(res => {
      wx.hideLoading()
      if (res.status == 1) {
        if (res.data.goods_list) {
          let moreChooseOneGoodsListData = res.data.goods_list.filter(item => {
            return item.order_id <= 0
          })

          this.setData({
            moreChooseOneGoodsAllListData: res.data,
            moreChooseOneGoodsListData,
            showMoreChooseOnePopup: true
          })
        } else {
          wx.showLoading({
            title: '退款中',
          })
          let params = {
            orderSn: order
          }
          SvipApi.svipGoodsRefund(params).then((res) => {
            if (res.status == 1) {
              wx.hideLoading()
              this.setData({
                price: Number(this.data.curData.currentTarget.dataset.price),
                sureRefund: false,
              })
              if (this.data.activeIndex == 1) {
                let params = {
                  type: 1
                }
                this.getDataList(params)
                if (e.currentTarget.dataset.type == 'mco') { // n选一
                  this.setData({
                    showMoreChooseOneTips: true,
                    isMCOChoose: false,
                    showMoreChooseOnePopup: false,
                  })
                }
              }
              if (this.data.activeIndex == 2) {
                let params = {
                  type: 2
                }
                this.setData({
                  success: true,
                  refundTypeText: '商品定金退款成功'
                })
                this.getDataList(params)
              }
              if (this.data.activeIndex == 4) {
                let params = {
                  type: 4
                }
                this.getDataList(params)
                this.setData({
                  success: true
                })
              }
            } else {
              wx.showToast({
                icon: 'none',
                title: res.message ? res.message : "请求失败"
              })
            }
          })
        }
      }
    })
  },

  // 获取退款须知文字
  getCityConfig() {
    this.setData({
      canClickConfirmRefund: false
    })
    SvipApi.getCityConfig().then(res => {
      if (res.status == 1) {
        this.setData({
          sendingRefundNotice: res.data.pending_notice,
          sentRefundNotice: res.data.paid_notice,
          showRefundPopup: true
        })
        let timer = setInterval(() => {
          this.setData({
            refundInterval: this.data.refundInterval - 1
          })
          if (this.data.refundInterval === 0) {
            this.setData({
              canClickConfirmRefund: true,
              refundInterval: 3
            })
            clearInterval(timer);
          }
        }, 1000);
      }
    })
  },

  // 退款失败按钮
  refundFail(e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      curItem: item,
      refundFailReason: item.refund_reason,
      showRefundPopup: true,
    })
  },
})