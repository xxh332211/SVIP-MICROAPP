import {
  svip
} from "../../../common/api/svipApi.js"
const SvipApi = new svip()
let app = getApp()
var model = require('../../../components/cityPickerModel/model.js')
var show = false;
var item = {};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showActivity: true,
    showSelectbox: false,
    city: '',
    userInfo: {},
    province: '', //
    city: '',
    county: '',
    mobile: wx.getStorageSync('userInfo').mobile,
    item: {
      show: show
    },
    goodsId: 0,
    goodsInfo: {},
    activityInfo: null,
    showTrand: false,
    svipTips: false,
    isPayment: null, //支付中状态
    goodsOrderSn: "",
    isMoreChooseOneActivity: true,
    showMoreChooseOneTips: false,
    activity_type: 0, // n选1
    showMCO_svipTips: false
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
    if (!options.id) {
      wx.showToast({
        title: '无法获取商品信息!',
      })
      return
    }
    if (options.cityId) {
      wx.setStorageSync('cityId', options.cityId)
    }
    if (options.activityId) {
      wx.setStorageSync('activityId', options.activityId)
    }
    // 1 全款 2 定金
    console.log(options, '商品详情选项')
    let activityInfo = wx.getStorageSync('activityInfo')
    this.setData({
      goodsId: options.id,
      goodsOrderSn: options.orderSn ? options.orderSn : "",
      activityInfo: activityInfo,
      activity_type: options.activity_type == 1 ? 1 : 0,
      isMoreChooseOneActivity: options.activity_type == 1
    })
    // this.getTrade()
  },
  onReady: function (e) {
    var that = this;
    //请求数据
    model.updateAreaData(that, 0, e);
    setTimeout(() => {
      let _this = this
      wx.createSelectorQuery().select('.product').boundingClientRect(function (rect) {
        _this.setData({
          productHeight: rect.height
        })
      }).exec()
    }, 300)
  },
  showPicker(e) {
    model.animationEvents(this, 0, true, 400);
  },
  // 点击配送方式
  selectDistribution() {

    this.setData({
      showSelectbox: !this.data.showSelectbox
    })

  },
  // 点击到站提货
  pickbtn() {
    this.setData({
      showPickactivity: true,
      showPickAddress: false,
      showAddress: false,
      send_type: 1
    })
  },
  // 点击邮寄到家
  pickaddressbtn() {
    this.setData({
      showPickactivity: false,
      showPickAddress: true,
      showAddress: true,
      send_type: 2
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 友盟统计
    wx.uma.trackEvent('enter_paySvip', {
      cityId: wx.getStorageSync('cityId'),
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
    if (wx.getStorageSync("zeroUpgradeS")) {
      this.setData({
        orderType: wx.getStorageSync("zeroUpgradeType"),
        showUpdatePopup: true
      })
      wx.removeStorageSync("zeroUpgradeS")
    }

    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.getSvipStatus()
    this.getGoodsInfo()
    if (this.data.goodsOrderSn) {
      this.getOrderDetail()
    }
  },
  //获取svip状态
  getSvipStatus() {
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      if (res.status == 1) {
        let status = res.data.svip == 1 ? true : false
        this.setData({
          isSvip: status,
          isLogin: true
        })
        // svip是否需要0元升级
        SvipApi.zeroUpgrade({
          cityId: wx.getStorageSync('cityId') || 1
        }).then((res) => {
          if (res.status == 1) {
            this.setData({
              isUpgrade: res.data.is_upgrade
            })
          }
        })
      } else {
        this.setData({
          isSvip: false,
          isLogin: false
        })
      }
    })
  },
  //获取商品信息
  getGoodsInfo: function () {
    let _this = this;
    let page = getCurrentPages();
    let currentRoute = page[page.length - 1].route;
    let params = {
      goodsId: this.data.goodsId,
      activity_type: this.data.activity_type
    }
    SvipApi.goodsDetail(params).then((res) => {
      wx.hideLoading()
      let d = app.disposeData(res)
      let page2 = getCurrentPages();
      let currentRoute2 = page2[page2.length - 1].route;
      if (currentRoute == currentRoute2) {
        if (d[0].type == 4) {
          wx.setNavigationBarTitle({
            title: "预约商品"
          })
        } else if (d[0].type == 1) {
          wx.setNavigationBarTitle({
            title: "全款商品"
          })
          if (this.data.showMCO_svipTips) {
            wx.hideLoading()
            setTimeout(() => {
              wx.showToast({
                title: '恭喜您已成为超级会员，快去购买商品吧~',
                duration: 3000,
                icon: 'none',
                complete() {
                  _this.setData({
                    showMCO_svipTips: false
                  })
                }
              })
            }, 500);
          }
        } else if (d[0].type == 2) {
          wx.setNavigationBarTitle({
            title: "定金商品"
          })
          // 定金商品友盟统计
          wx.uma.trackEvent('enter_svipGoodsDetail', {
            itemID: this.data.goodsId,
            src: wx.getStorageSync('src'),
            uis: wx.getStorageSync('uis')
          });
        }
      }
      console.log(d[0])
      this.setData({
        goodsType: d[0].type,
        goodsInfo: d[0],
        send_type: d[0].send_type,
      })
    })
  },
  //获取svip商品待支付订单详情
  getOrderDetail: function () {
    let params = {
      orderSn: this.data.goodsOrderSn
    }
    SvipApi.getOrderDetail(params).then((res) => {
      console.log(res, 'res')
      // if(res.send_type == 1){
      //   showPickactivity = true
      //   showPickAddress = false
      // }else{
      //   showPickactivity = false
      //   showPickAddress = true
      // }
      this.setData({
        orderStatus: res.status,
        consignee: res.consignee,
        mobile: res.mobile,
        send_type_detail: res.send_type,
        send_type: res.send_type,
        showSelectbox: true,
        showPickactivity: res.send_type == 1,
        showPickAddress: res.send_type == 2,
        province: res.address.split("|")[0],
        city: res.address.split("|")[1],
        county: res.address.split("|")[2],
        address: res.address.split("|")[3]
      })
    })
  },
  inputMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  inputConsignee: function (e) {
    this.setData({
      consignee: e.detail.value
    })
  },
  inputAddress: function (e) {
    this.setData({
      address: e.detail.value
    })

  },
  closePopup(e) {
    let val = e.target.dataset.val;
    this.setData({
      [val]: false
    })
  },
  //去订单列表
  toOrderList() {
    this.setData({
      successTips: false
    })
    wx.navigateTo({
      url: "/pages-userInfo/pages/orderList/orderList?type=2"
    })
  },
  //去svip首页
  toSvipHome() {
    this.setData({
      successTips: false
    })
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  //预约商品非会员购买svip
  reserveBuySvip() {
    this.setData({
      notReserve: false,
      svipTips: false
    })
    wx.navigateTo({
      url: '/pages/svipPackage/paySvip/paySvip?origin=detailReserve',
    })
  },
  // 预约商品
  reserveGoods() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    if (this.data.isLogin && !this.data.isSvip) {
      //判断是否可以直接升级svip,2为直接升级
      if (this.data.isUpgrade == 2) {
        // svip 0元升级
        wx.showLoading({
          title: '加载中...',
          mask: true
        })
        SvipApi.svipUpgrade({
          cityId: wx.getStorageSync('cityId') || 1,
          activityId: wx.getStorageSync('activityId'),
          src: "0yuan",
          uis: wx.getStorageSync('uis')
        }).then((res) => {
          wx.hideLoading()
          if (res.status == 1) {
            this.setData({
              orderType: res.data.order_type,
              showUpdatePopup: true
            })
          } else {
            wx.showToast({
              title: res.message,
              icon: "none"
            })
          }
        })
      } else {
        //非会员提示弹层
        this.setData({
          notReserve: false,
          svipTips: true
        })
      }
      return
    }
    //调用预约接口
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.goodsReserve({
      goods_id: this.data.goodsId,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    }).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        this.data.goodsInfo.stock = this.data.goodsInfo.stock - 1;
        this.data.goodsInfo.user_id = "1";
        this.setData({
          reserveTips: true,
          goodsInfo: this.data.goodsInfo
        })
      } else if (res.code == -2) {
        //非会员提示弹层
        this.setData({
          notReserve: false,
          svipTips: true
        })
      } else {
        wx.showToast({
          title: res.message ? res.message : "请求出错了",
          icon: "none"
        })
      }
    })
  },
  closeUpdate() {
    this.setData({
      showUpdatePopup: false
    })
    this.onShow()
  },
  // 支付方法
  pay() {
    // 友盟统计
    wx.uma.trackEvent('click_Svip', {
      cityId: wx.getStorageSync('cityId'),
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });
    let type = this.data.goodsType
    let token = wx.getStorageSync('token')

    //定金商品友盟统计
    if (type == 2) {
      wx.uma.trackEvent('click_svipGoodsDetail', {
        itemID: this.data.goodsId,
        itemName: this.data.goodsInfo.goods_name,
        price: Number(this.data.goodsInfo.prepay_amount),
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis')
      });
    }

    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    // 判断是否为svip
    if (this.data.isLogin && !this.data.isSvip) {
      //判断是否可以直接升级svip,2为直接升级
      if (this.data.isUpgrade == 2) {
        // svip 0元升级
        wx.showLoading({
          title: '加载中...',
          mask: true
        })
        SvipApi.svipUpgrade({
          cityId: wx.getStorageSync('cityId') || 1,
          activityId: wx.getStorageSync('activityId'),
          src: "0yuan",
          uis: wx.getStorageSync('uis')
        }).then((res) => {
          wx.hideLoading()
          if (res.status == 1) {
            this.setData({
              orderType: res.data.order_type,
              showUpdatePopup: true
            })
          } else {
            wx.showToast({
              title: res.message,
              icon: "none"
            })
          }
        })
      } else {
        //非会员提示弹层
        this.setData({
          notReserve: true,
          svipTips: true
        })
      }
      return
    }
    if (type == 1 && (this.data.send_type == '1,2' || (!this.data.address && !this.data.province && !this.data.mobile && !this.data.consignee && this.data.send_type == '2'))) {
      this.setData({
        showSelectbox: true
      })
      wx.pageScrollTo({
        scrollTop: this.data.productHeight
      })
      if (this.data.send_type == '1,2') {
        wx.showToast({
          title: '请选择配送方式',
          icon: 'none',
          duration: 3000
        })
      } else if (this.data.send_type == '2') {
        wx.showToast({
          title: '请填写收货地址',
          icon: 'none',
          duration: 3000
        })
      }

      return
    }


    if (this.data.isPayment) return

    //如果是全款商品，判断填写的信息
    if (type == 1 && this.data.send_type == 2) {
      let reg = /[^\w\u4e00-\u9fa5]/g
      let val = this.data.consignee
      if (reg.test(val)) {
        return wx.showToast({
          icon: 'none',
          title: '姓名请填写中英文或者数字！',
          duration: 2000

        })
        return
      }
      if (!this.data.consignee || this.data.consignee.length == 0) {
        wx.pageScrollTo({
          scrollTop: this.data.productHeight
        })
        return wx.showToast({
          icon: 'none',
          title: '请填写姓名',
          duration: 2000
        })
      }

      let mobile = this.data.mobile
      var numreg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
      if (!numreg.test(mobile)) {
        wx.pageScrollTo({
          scrollTop: this.data.productHeight
        })
        wx.showToast({
          icon: "none",
          title: '请输入有效的手机号码！',
          duration: 2000

        })
        return
      }
      if (mobile.length == 0) {
        wx.pageScrollTo({
          scrollTop: this.data.productHeight
        })
        wx.showToast({
          icon: "none",
          title: '请填写手机号码！',
          duration: 2000

        })
        return
      }

      if (!this.data.province || !this.data.city) {
        wx.pageScrollTo({
          scrollTop: this.data.productHeight
        })
        wx.showToast({
          icon: "none",
          title: '请选择地址！',
          duration: 2000

        })
        return
      }
      if (!this.data.address) {
        wx.pageScrollTo({
          scrollTop: this.data.productHeight
        })
        wx.showToast({
          icon: "none",
          title: '请填写详细地址！',
          duration: 2000

        })
        return
      }
    } else {
      this.data.consignee = "";
      this.data.mobile = "";
      this.data.address = "";
    }

    let goodsId = this.data.goodsId;
    let activity_type = 0;
    let postGoodsOrderSn = "";
    if (this.data.goodsOrderSn) {
      postGoodsOrderSn = this.data.goodsOrderSn;
    }
    if (!this.data.province && !this.data.city && !this.data.county && !this.data.address) {
      this.address = ""
    } else {
      this.address = this.data.province + "|" + this.data.city + "|" + this.data.county + "|" + this.data.address
    }

    if (this.data.isMoreChooseOneActivity) { // n选1
      goodsId = this.data.goodsInfo.goods_id;
      postGoodsOrderSn = this.data.goodsInfo.order_sn;
      activity_type = 1;
    }
    let data = {
      goodsId,
      num: 1,
      payType: 3,
      consignee: this.data.consignee,
      mobile: this.data.mobile,
      orderSn: postGoodsOrderSn,
      address: this.address,
      send_type: this.data.send_type,
      activity_type,
      token: token,
      'src': wx.getStorageSync('src'),
      'uis': wx.getStorageSync('uis'),
      'plan': wx.getStorageSync('plan'),
      'unit': wx.getStorageSync('unit')
    }
    let that = this
    wx.showLoading({
      title: '加载中...',
    })
    //全款接口
    if (type == 1) {
      this.setData({
        isPayment: true,
        showMoreChooseOneTips: false
      })

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
              wx.showToast({
                title: '支付成功！',
                duration: 1000,
                complete() {
                  that.setData({
                    successTips: true
                  })
                  if (that.data.isMoreChooseOneActivity) {
                    that.getGoodsInfo();
                  }
                }
              })
            },
            'fail': function () {
              wx.showModal({
                title: '购买失败!',
                content: '购买出现问题，请尝试重新支付',
                confirmColor: "#E5002D",
                success(res) {
                  if (res.confirm) {
                    that.setData({
                      isPayment: true
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
                                that.setData({
                                  successTips: true
                                })
                                if (that.data.isMoreChooseOneActivity) {
                                  that.getGoodsInfo();
                                }
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
                            that.setData({
                              isPayment: false
                            })
                          }
                        })
                      }
                    }).catch(() => {
                      that.setData({
                        isPayment: false
                      })
                    })
                  }
                }
              })
            },
            'complete': function () {
              that.setData({
                isPayment: false
              })
            }
          })
        } else {
          that.setData({
            isPayment: false
          })
          setTimeout(() => {
            wx.showToast({
              title: res.message,
              icon: "none",
              duration: 3000
            })
          }, 400);
        }
      }).catch(() => {
        wx.hideLoading();
        that.setData({
          isPayment: false
        })
      })
    }
    if (type == 2) {
      this.setData({
        isPayment: true
      })
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
              wx.showToast({
                title: '支付成功！',
                duration: 1000,
                complete() {
                  that.setData({
                    successTips: true
                  })
                }
              })
            },
            'fail': function (res) {
              wx.showModal({
                title: '购买失败！',
                content: '购买出现问题，请尝试重新支付',
                confirmColor: "#E5002D",
                success(res) {
                  if (res.confirm) {
                    that.setData({
                      isPayment: true
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
                                that.setData({
                                  successTips: true
                                })
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
                            that.setData({
                              isPayment: false
                            })
                          }
                        })
                      }
                    }).catch(() => {
                      that.setData({
                        isPayment: false
                      })
                    })
                  }
                  if (res.cancel) {

                  }
                }
              })
            },
            'complete': function () {
              that.setData({
                isPayment: false
              })
            }
          })
        } else {
          that.setData({
            isPayment: false
          })
          setTimeout(() => {
            wx.showToast({
              title: res.message,
              icon: "none",
              duration: 3000
            })
          }, 400);
        }
      }).catch(() => {
        that.setData({
          isPayment: false
        })
      })
    }
  },
  //隐藏picker-view
  hiddenFloatView: function (e) {
    model.animationEvents(this, 200, false, 400);
    //点击确定按钮更新数据(id=444是背后透明蒙版 id=555是取消按钮)
    if (e.target.dataset.id == 666) {
      this.updateShowData()
    }
  },
  //滑动事件
  bindChange: function (e) {
    model.updateAreaData(this, 1, e);
    item = this.data.item;
    this.setData({
      province: item.provinces[item.value[0]].name,
      city: item.citys[item.value[1]].name,
      county: item.countys[item.value[2]].name
    });
  },
  //更新顶部展示的数据
  updateShowData: function (e) {
    item = this.data.item;
    this.setData({
      province: item.provinces[item.value[0]].name,
      city: item.citys[item.value[1]].name,
      county: item.countys[item.value[2]].name
    });
  },
  // 判断换购活动是否上线
  getTrade() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    tradeInApi.getTradeInRule({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId')
    }).then(res => {
      this.setData({
        showTrand: true
      })
    })
  },
  // 进入下单换购详情页
  trandDetail() {
    wx.navigateTo({
      url: '/pages/tradeInPackage/Detail/Index?detail_id=' + this.data.goodsInfo.redeemInfo.id + "&src=YYXCX&uis=SVIP定金详情",
    })
  },
  // 进入熊猫币换购确认页
  toTradeConfirm() {
    wx.setStorageSync('src', "YYXCX")
    wx.setStorageSync('uis', "SVIP定金详情")
    let page = getCurrentPages();
    let preRouter = page[page.length - 2] && page[page.length - 2].route;
    if (preRouter && preRouter == "pages-xmb/pages/tradeIn/Confirm/Confirm") {
      wx.navigateBack()
    } else {
      wx.navigateTo({
        url: '/pages-xmb/pages/tradeIn/Confirm/Confirm?goodsId=' + this.data.goodsInfo.redeemInfo.id
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let params = "?id=" + this.data.goodsInfo.goods_id + "&cityId=" + wx.getStorageSync("cityId") + "&src=SVIPshp&uis=" + this.data.goodsInfo.goods_id + "&activity_type=" + this.data.activity_type + "&activityId=" + wx.getStorageSync('activityId')
    return {
      title: this.data.goodsInfo.goods_name,
      path: "/pages/svipPackage/payProductDetail/payProductDetail" + params,
      imageUrl: this.data.goodsInfo.goods_image
    }
  },
  buyHandle() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }

    //判断是否可以直接升级svip,2为直接升级
    if (!this.data.isSvip && this.data.isUpgrade == 2) {
      // svip 0元升级
      SvipApi.svipUpgrade({
        cityId: wx.getStorageSync('cityId') || 1,
        activityId: wx.getStorageSync('activityId'),
        src: "0yuan",
        uis: wx.getStorageSync('uis')
      }).then((res) => {
        wx.hideLoading()
        if (res.status == 1) {
          this.setData({
            orderType: res.data.order_type,
            showUpdatePopup: true
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: "none"
          })
        }
      })
      return
    }

    this.setData({
      showMoreChooseOneTips: true
    })
  },
  toBuySvip() {
    this.setData({
      showMoreChooseOneTips: false
    })
    wx.navigateTo({
      url: '/pages/svipPackage/paySvip/paySvip?origin=mcoDetail',
    })
  },
  closeTips() {
    this.setData({
      showMoreChooseOneTips: false
    })
  },
})