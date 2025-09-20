// pages-userInfo/pages/orderList/orderList.js
let QRCode = require('../../../utils/qrcode.js')
let app = getApp();
let ctx = Object;
const createRecycleContext = require('miniprogram-recycle-view')
import {
  svip
} from "../../../common/api/svipApi"
let SvipApi = new svip()
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectType: 0,
    selTypeText: "订单类型",
    typeDetail: false,
    typeList: [{
      name: "全部类型",
      id: 0
    }, {
      name: "展会订单",
      id: 1
    }, {
      name: "SVIP订单",
      id: 2
    }, {
      name: "线上订单",
      id: 3
    }, {
      name: "换购订单",
      id: 4
    }, {
      name: "兑换卡",
      id: 5
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type,
      statusId: options.status ?? "all",
      activityInfo: wx.getStorageSync('activityInfo'),
      isOnload: true
    })
    if (options.type) {
      for (let i of this.data.typeList) {
        if (i.id == options.type) {
          this.setData({
            selTypeText: i.name,
            selectType: i.id
          })
        }
      }
    }
    ctx = createRecycleContext({
      id: 'recycleId',
      dataKey: 'recycleList',
      page: this,
      // 这个参数也可以直接传下面定义的this.itemSizeFunc函数
      itemSize: function () {
        return {
          width: this.transformRpx(750),
          height: 150
        }
      }
    })
    //苏州
    if (wx.getStorageSync('cityId') == 6) {
      // 获取展届信息
      SvipApi.activityInfo({
        cityId: wx.getStorageSync("cityId")
      }).then((res) => {
        if (res.begin_date <= res.buy_time && res.end_date >= res.buy_time) {
          //展中
          this.setData({
            zhanzhong: true
          })
        }
        marketingApi.prizeRule({
          city_id: wx.getStorageSync('cityId')
        }).then((res) => {
          if (res.status == 1) {
            if (!res.data.lottery_info || res.data.lottery_info.length == 0 || res.data.award_list.length == 0) {
              //活动规则 || 奖励播报列表 为空整条不显示
              this.setData({
                showReport: false
              })
            } else {
              this.setData({
                showReport: true,
                lotteryReport: res.data.award_list,
                lotteryRule: res.data.lottery_info.rule_name
              })
            }
          }
          let height = app.systemData.windowHeight - ctx.transformRpx(160);
          if (this.data.showReport && this.data.selectType == 1) {
            height = height - ctx.transformRpx(88)
          }
          if (this.data.zhanzhong && this.data.selectType == 1) {
            height = height - ctx.transformRpx(90)
          }
          this.setData({
            recycleHeight: height
          })
        })
      })
    } else {
      this.setData({
        recycleHeight: app.systemData.windowHeight - ctx.transformRpx(160)
      })
    }
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
    let update = this.data.isOnload ? 0 : 1;
    //获取订单列表
    this.getList(update, this.data.selectType)
    this.setData({
      isOnload: false
    })
  },
  getList(update = 1, type = this.data.type ?? 0) {
    if (typeof update == "object") {
      //如果update参数是对象则是从组件调用，强制刷新接口数据
      update = 1
    };
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //order_list_type 0：全部；1，展会订单；2，SVIP订单 预约商品 全款商品 定金商品；3，线上订单；4，换购订单；5，兑换卡订单
    SvipApi.getOrderList({
      order_list_type: type,
      is_update: update //update 0:不强制刷新数据；1:强制刷新数据
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        // all：全部，unpaid：待付款，ongoing：进行中，paid：已完成
        this.initAllOrder = res.data;
        let copyAllOrder = JSON.parse(JSON.stringify(res.data));
        this.setData({
          unpaidLength: res.data.unpaid?.length ?? 0,
          ongoingLength: res.data.ongoing?.length ?? 0,
          orderList: res.data[this.data.statusId] ?? []
        })
        ctx.splice(0, 10000, copyAllOrder[this.data.statusId] ?? [])
      }
    })
  },
  toSearch() {
    wx.navigateTo({
      url: '/pages-userInfo/pages/searchOrder/searchOrder',
    })
  },
  switchType() {
    this.setData({
      typeDetail: !this.data.typeDetail
    })
  },
  chooseType(e) {
    let item = e.currentTarget.dataset.item;
    this.getList(0, item.id)
    this.setData({
      typeDetail: false,
      selTypeText: item.name,
      selectType: item.id
    })
    this.changeRecycleHeight(item.id)
  },
  closeType() {
    this.setData({
      typeDetail: false
    })
  },
  //切换状态
  switchStatus(e) {
    let id = e.currentTarget.dataset.id;
    ctx.splice(0, 10000, this.initAllOrder[id] ?? [])
    this.setData({
      statusId: id,
      orderList: this.initAllOrder[id]
    })
  },
  changeRecycleHeight(id) {
    let height = app.systemData.windowHeight - ctx.transformRpx(160);
    if (this.data.showReport && id == 1) {
      height = height - ctx.transformRpx(88)
    }
    if (this.data.zhanzhong && id == 1) {
      height = height - ctx.transformRpx(90)
    }
    this.setData({
      recycleHeight: height
    })
  },
  deleteOrder(e) {
    this.setData({
      deleteData: e.currentTarget.dataset.item ?? e.detail,
      sureDelete: true
    })
  },
  confirmDelete() {
    let item = this.data.deleteData;
    SvipApi.deleteOrder({
      order_sn: item.order_sn ?? item.order_num,
      order_list_type: item.order_list_type
    }).then((res) => {
      if (res.status == 1) {
        this.getList()
      }
      this.setData({
        sureDelete: false
      })
      wx.showToast({
        title: res.message,
        icon: "none"
      })
    })
  },
  // 抽奖按钮
  getLottery(e) {
    let item = e.detail;
    this.setData({
      loading: true
    })
    new QRCode("qrcode2", {
      text: item.order_num,
      width: 130,
      height: 130,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
    marketingApi.orderLottery({
      orderNum: item.order_num
    }).then((res) => {
      this.setData({
        loading: false
      })
      if (res.status == 1) {
        this.getList()
        this.setData({
          prizeInfo: res.data,
          showLottery: true
        })
      } else if (res.status == 2) {
        this.setData({
          showNotPrize: true
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: "none"
        })
      }
    })
  },
  // 兑奖按钮
  redeemPrize(e) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let item = e.detail;
    new QRCode("qrcode2", {
      text: item.order_num,
      width: 130,
      height: 130,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
    marketingApi.getLotteryResult({
      orderNum: item.order_num
    }).then((res) => {
      wx.hideLoading({
        success: (res) => {},
      })
      if (res.status == 1) {
        this.setData({
          prizeInfo: res.data,
          showLottery: true
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: "none"
        })
      }
    })
  },
  stop() {
    return false
  },
  closeLottery() {
    this.setData({
      showNotPrize: false,
      showLottery: false
    })
  },
  // 线上商品||展会订单详情页
  toCommonDetail(e) {
    let item = e.detail;
    wx.navigateTo({
      url: `/pages-abs/pages/orderDetail/orderDetail?order_id=${item.order_id ?? item.order_num}&orderType=${item.order_list_type}`,
    })
  },
  //svip商品去详情页
  toDetail(e) {
    let item = e.detail;
    if (item.activity_type == 1) {
      return
    }
    //判断商品是否已下线
    if (item.is_offline == 1) {
      this.setData({
        offLinePopup: true
      })
    } else {
      let id = item.goods_id;
      let orderSn = item.order_sn;
      //全款商品带订单号跳转
      if ((item.type == 1 || item.type == 2) && item.status == 0) {
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
  // svip订单取消
  toCancel(e) {
    let item = e.detail;
    this.setData({
      sureCancel: true,
      cancel_id: item.order_id
    })
  },
  cancelSure(e) {
    let tips = e.currentTarget.dataset.tips;
    this.setData({
      [tips]: false
    })
  },
  // 订单取消
  cancelRefund() {
    wx.showLoading({
      title: '取消中',
      mask: true
    })
    let params = {
      token: wx.getStorageSync('token'),
      orderId: this.data.cancel_id
    }
    SvipApi.svipGoodsCancel(params).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          sureCancel: false
        })
        this.getList()
      } else {
        wx.showToast({
          icon: 'none',
          title: res.message ? res.message : "请求失败"
        })
      }
    })
  },
  //去支付
  toPay(e) {
    let that = this,
      item = e.detail;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let type = item.type,
      data = {
        goodsId: item.goods_id,
        num: 1,
        payType: 3,
        consignee: item.consignee,
        mobile: item.mobile,
        orderSn: item.order_sn,
        address: item.address,
        send_type: item.send_type,
        token: wx.getStorageSync('token'),
        'src': wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit')
      }
    // 定金商品支付
    if (type == 2) {
      SvipApi.svipBookingGoodsOrderSubmit(data).then((res) => {
        wx.hideLoading();
        if (res.status == 1) {
          wx.requestPayment({
            'timeStamp': res.data.time_stamp,
            'nonceStr': res.data.nonce_str,
            'package': res.data.package,
            'signType': "MD5",
            'paySign': res.data.pay_sign,
            'success': function (res) {
              wx.showLoading({
                title: '加载中',
                mask: true
              })
              setTimeout(() => {
                wx.hideLoading()
                that.getList()
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
                    SvipApi.svipBookingGoodsOrderSubmit(data).then((res) => {
                      if (res.status == 1) {
                        wx.requestPayment({
                          'timeStamp': res.data.time_stamp,
                          'nonceStr': res.data.nonce_str,
                          'package': res.data.package,
                          'signType': "MD5",
                          'paySign': res.data.pay_sign,
                          success(res) {
                            wx.showToast({
                              title: '支付成功！',
                              duration: 1000,
                              complete() {
                                setTimeout(() => {
                                  that.getList()
                                }, 2000)
                              }
                            })
                          },
                          fail(res) {
                            wx.showToast({
                              title: '支付失败！',
                              duration: 1000,
                              complete() {

                              }
                            })
                          },
                          complete() {
                            wx.hideLoading()
                          }
                        })
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          setTimeout(() => {
            wx.showToast({
              title: res.message,
              icon: "none",
              duration: 3000
            })
          }, 400);
        }
      })
    }
    // 全款商品支付
    if (type == 1) {
      SvipApi.svipGoodsOrderSubmit(data).then((res) => {
        wx.hideLoading();
        if (res.status == 1) {
          wx.requestPayment({
            'timeStamp': res.data.time_stamp,
            'nonceStr': res.data.nonce_str,
            'package': res.data.package,
            'signType': "MD5",
            'paySign': res.data.pay_sign,
            'success': function () {
              wx.showLoading({
                title: '加载中',
                mask: true
              })
              setTimeout(() => {
                wx.hideLoading()
                that.getList()
              }, 2000)
            },
            'fail': function () {
              wx.showModal({
                title: '购买失败!',
                content: '购买出现问题，请尝试重新支付',
                confirmColor: "#E5002D",
                success(res) {
                  if (res.confirm) {
                    wx.showLoading({
                      title: '加载中',
                      mask: true
                    })
                    SvipApi.svipGoodsOrderSubmit(data).then((res) => {
                      if (res.status == 1) {
                        wx.requestPayment({
                          'timeStamp': res.data.time_stamp,
                          'nonceStr': res.data.nonce_str,
                          'package': res.data.package,
                          'signType': "MD5",
                          'paySign': res.data.pay_sign,
                          success(res) {
                            wx.showToast({
                              title: '支付成功！',
                              duration: 1000,
                              complete() {
                                setTimeout(() => {
                                  that.getList()
                                }, 2000)
                              }
                            })
                          },
                          fail(res) {
                            wx.showToast({
                              title: '支付失败！',
                              duration: 1000,
                              complete() {

                              }
                            })
                          },
                          complete() {
                            wx.hideLoading()
                          }
                        })
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          setTimeout(() => {
            wx.showToast({
              title: res.message,
              icon: "none",
              duration: 3000
            })
          }, 400);
        }
      })
    }
  },
  //查看券码
  checkCode(e) {
    let v = e.detail;
    let nowTime = new Date().getTime();
    let endTime = v.end_date.replace(/-/g, "/");
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
      beginDate: v.begin_date.split(' ')[0].split(/[-.]/).slice(1).join('.'),
      endDate: v.end_date.split(' ')[0].split(/[-.]/).slice(1).join('.'),
      isCheck: v.is_check,
      couCode: v.verify_code,
      showCode: true
    })
  },
  reFundTips() {
    this.setData({
      unRefund: true,
      unRefundText: '您已领取该商品，不可退款。'
    })
  },
  closeUn() {
    this.setData({
      unRefund: false
    })
  },
  closeCode() {
    this.setData({
      showCode: false
    })
  },
  offLine() {
    this.setData({
      offLinePopup: false
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

  },
})