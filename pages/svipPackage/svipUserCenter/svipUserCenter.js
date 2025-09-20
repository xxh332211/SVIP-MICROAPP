var QRCode = require('../../../utils/qrcode.js')
import {
  svip
} from '../../../common/api/svipApi.js'
let SvipApi = new svip()
let app = getApp()
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome'
]
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cityId: null,
    activityId: null,
    order_sn: null, // 退款单号
    user_info: null,
    ticket_info: null,
    invite_url: null,
    coupon: null,
    hotGoods: {}, // 火爆商品
    showExplain: false,
    showPayPop: false,
    canClick: false,
    showCode: null,
    codeVal: null,
    lPLength: null,
    lALength: null,
    openShare: false,
    openSharePop: false,
    isPlay: false,
    signPopup: false,
    codeType: 0,
    giftCurrent: 0,
    activityInfo: {},
    advList: [],
    couponsData: [{
      smemo: "优惠券描述",
      coupon_value: 100,
      consume_amount: 3000,
      begin_date: "02.12",
      end_date: "02.13"
    }]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断是否为支付成功跳转 测试代码：&& wx.getStorageSync('closePayPop') !== wx.getStorageSync('cityId')
    if (options && (options.preFrom == "svipPay" || options.preFrom == "zeroUpgrade")) {
      this.setData({
        showPayPop: true
      })
    }
    if (options && options.preFrom == "zeroUpgrade") {
      this.setData({
        orderType: options.type,
        showUpdatePopup: true
      })
    }
    this.setData({
      options: options
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu({
      complete() {}
    })
    this.setData({
      activityInfo: wx.getStorageSync('activityInfo'),
      activityId: wx.getStorageSync('activityId'),
      cityId: wx.getStorageSync('cityId'),
      prepaygoodsIndex: 0, //下标
      allgoodsIndex: 0 //下标
    })
    if (!wx.getStorageSync('cityId')) {
      wx.showToast({
        title: '请选择城市！',
      })
      wx.navigateTo({
        url: '/pages/address/index',
      })
      return false
    }

    wx.showLoading({
      title: '数据加载中..',
      mask: true
    })
    //先判断当届是否是svip，如果不是则判断上届是否为过期svip
    SvipApi.isSvip({
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: wx.getStorageSync('activityId')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        this.setData({
          userInfo: res.data
        })
        if (res.data.svip == 1) {
          if (res.data.is_draw == -1) {
            //未抽奖显示抽奖弹层
            this.setData({
              notLotteryPopup: true
            })
          }
          //当届为svip
          let params = {
            activityId: wx.getStorageSync('activityId'),
            cityId: wx.getStorageSync('cityId') || 1,
          }
          this.getData(params)
        } else {
          //上届活动id
          SvipApi.getUserSvipInfo({
            cityId: wx.getStorageSync('cityId') || 1
          }).then((res) => {
            console.log(res)
            if (res.svip == 1) {
              wx.setStorageSync("activityId", res.last_activity_id)
              let params = {
                activityId: wx.getStorageSync('activityId'),
                cityId: wx.getStorageSync('cityId') || 1,
              }
              this.getData(params)
            } else {
              wx.switchTab({
                url: '/pages/home/home'
              })
            }
          })
        }
      }
    })
  },
  // 拉数据
  getData(params) {
    SvipApi.lastSvipUserCenterInfo(params).then((data) => {
      let res = data.data;
      console.log(res, '个人中心数据')
      wx.hideLoading()
      //判断是否为svip，不是则跳回首页
      if (data.message == "你没门票" || (res.user_info && res.user_info.svip == 0)) {
        wx.switchTab({
          url: '/pages/home/home'
        })
        return false
      }
      let a = new Date().getTime()
      let b = new Date(res.ticket_info.end_date.replace(/-/g, "/")).getTime()
      let isOut = a > b ? true : false

      let actEndDate = res.ticket_info.begin_date;
      let endDate = new Date(actEndDate.replace(/-/g, "/")).getTime() - a;
      this.setData({
        isOut: isOut,
        countOver: endDate > 0 ? false : true
      })
      //会员说明
      wx.setStorageSync("pageGuideList", res.page_guide_list);
      let universalCoupon = [];
      if (res.couponUniversalInfo && res.couponUniversalInfo.length > 0) {
        universalCoupon = res.couponUniversalInfo.map((v) => {
          v.isUniversal = true;
          return v
        })
      }
      this.setData({
        centerInfo: res,
        topText: res.base_svip_info.qrcode_program ? res.base_svip_info.qrcode_program : "", //顶部文案
        showCoupon: res.base_svip_info.is_exh_buy_coupons, //展中是否显示平台券1显示
        showGift: res.base_svip_info.is_exh_buy_gift, //展中是否显示签到礼1显示
        order_sn: res.user_info.order_sn, // 订单号
        user_info: res.user_info,
        ticket_info: res.ticket_info ? app.disposeData(res.ticket_info) : {},
        invite_url: res.invite_url, // 分享
        coupon: app.disposeData(res.coupon).concat(app.disposeData(universalCoupon)),
        check_baopin: res.check_baopin_info, // 爆品
        refundBtn: res.refund_but_show, //退款按钮
        canClick: true
      })
      //授权定位
      this.getLocation()
      //商户优惠券获取
      this.getVendorCoupon()
      //获取运营位
      this.getAdvImg()
      //获取商品数据
      this.getGoodsData('1,2,3,4', 100)
      //商品标题描述字段
      this.svipImage({
        type: '2,3,7',
        cityId: wx.getStorageSync('cityId'),
        activityId: wx.getStorageSync('activityId')
      })
      //获取签到礼信息
      this.getSignInfo()
      // n选1
      this.moreChooseOneGoodsListReq();
      // 熊猫币弹框
      this.xmbModal();
    })
  },
  getLocation() {
    //授权地理位置判断当前位置是否在展馆中，只有在展馆中才能展示核销码
    const that = this;
    wx.authorize({
      scope: 'scope.userLocation',
      complete(e) {
        wx.getLocation({
          complete(e) {
            const {
              longitude = "",
                latitude = ""
            } = e;
            SvipApi.juegeQRCodePop({
              longitude,
              latitude
            }).then((res) => {
              if (res.status === 1 && res.data.is_pop === 1) {
                that.setData({
                  isShowCode: true
                })
              } else {
                that.setData({
                  qrCodePop: res.message
                })
              }
            })
          },
        })
      },
      fail() {
        wx.showModal({
          title: '定位失败了！',
          content: '请设置允许授权定位',
          confirmText: "去设置",
          success(res) {
            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  console.log(res)
                },
                complete(res) {
                  console.log(res)
                }
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
  },
  getSignInfo() {
    this.setData({
      giftConfigImg: "",
      entityGift: "",
      couponGift: ""
    })
    //获取签到礼信息
    SvipApi.getSignGiftInfo().then((res) => {
      if (res.status == 1 && res.data) {
        //1=未登录；2=已登录，用户非会员；3=已登录，未抽签到礼；4=已登录，抽实物签到礼；5=已登录，抽优惠券签到礼；6=现代家博会广州无需抽直接显示实物
        if (res.data.mode == 1 || res.data.mode == 2 || res.data.mode == 3) {
          this.setData({
            giftConfigImg: res.data.giftInfo.giftConfigImg.length > 0 ? res.data.giftInfo.giftConfigImg : ""
          })
        } else if (res.data.mode == 4 || res.data.mode == 6) {
          let gData = res.data.giftInfo.master_img;
          if (gData[0]?.type == 4) {
            gData[0].cover_img_url = gData[1].image_url;
            gData.splice(1, 1)
          }
          res.data.giftInfo.master_img = gData;
          this.setData({
            entityGift: res.data.giftInfo
          })
        } else {
          this.setData({
            couponGift: app.disposeData(res.data.giftInfo?.couponsInfo)
          })
          if (this.data.options.scroll && this.data.options.scroll == "sign") {
            setTimeout(() => {
              wx.pageScrollTo({
                selector: "#signGift",
                duration: 300,
                complete(res) {}
              })
            }, 1000);
          }
        }
      }
    })
  },
  //抽取签到礼
  lottery() {
    wx.showLoading({
      title: "加载中...",
      mask: true
    })
    SvipApi.giftLottery().then((res) => {
      if (res.status == 1) {
        this.setData({
          signGiftGif: res.data.image_url,
          signPopup: true,
          notLotteryPopup: false
        })
        this.getSignInfo()
      }
      wx.hideLoading()
    })
  },
  closeSignPopup() {
    this.setData({
      signPopup: false,
      notLotteryPopup: false
    })
  },
  //商品标题描述字段
  svipImage(params) {
    SvipApi.svipImage(params).then((res) => {
      //type : 2=定金商品描述 3=全款商品描述 7=预约商品描述
      if (res.image_2) {
        this.setData({
          prepaygoodsDes: res.image_2[0] ? res.image_2[0].description : ''
        })
      }
      if (res.image_3) {
        this.setData({
          allGoodsDes: res.image_3[0] ? res.image_3[0].description : ''
        })
      }
      if (res.image_7) {
        this.setData({
          reserveGoodsDes: res.image_7[0] ? res.image_7[0].description : ''
        })
      }
    })
  },
  //商户优惠券获取
  getVendorCoupon(arg) {
    SvipApi.getVendorCoupon().then((res) => {
      if (res.status == 1) {
        this.setData({
          vendorCouponData: app.disposeData(res.data.couponInfo)
        })
        if (arg == "refresh") {
          wx.stopPullDownRefresh()
          wx.hideLoading()
        }
      }
    })
  },
  // 点击查看更多按钮优惠券列表全部显示
  chakanBtn() {
    if (this.data.moreData) {
      this.setData({
        moreData: false
      })
    } else {
      this.setData({
        moreData: true
      })
    }
  },
  //获取全部运营位图片
  getAdvImg() {
    SvipApi.getAdvList({
      area_id: "19,20,22,23,30"
    }).then((res) => {
      // 19:优惠券下方运营位 20:签到礼下方运营位 22:定金商品下方运营位 23:全款商品下方运营位 30:svip分享图片
      if (res.status == 1) {
        this.setData({
          couponAdv: res.data.adv19 || [],
          signAdv: res.data.adv20 || [],
          prePayAdv: res.data.adv22 || [],
          totalAdv: res.data.adv23 || [],
          svipShareAdv: res.data.adv30 || "",
        })
        wx.showShareMenu()
      }
    })
  },
  //提交formId
  pushFormId(e) {
    SvipApi.pushFormId({
      formId: e.detail.formId
    }).then((res) => {})
  },
  toOrderList() {
    wx.navigateTo({
      url: "/pages-userInfo/pages/orderList/orderList?type=2"
    })
  },
  toSignDetail() {
    wx.navigateTo({
      url: '/pages/svipPackage/signDetail/Index',
    })
  },
  // 商品列表
  goodsList(e) {
    wx.navigateTo({
      url: '/pages/goodsList/goodsList?type=' + e.target.dataset.type,
    })
  },
  setCode(e) {
    const {
      id
    } = e.currentTarget;
    if (this.data.canClick) {
      if (this.data.isShowCode || id == 1) {
        //记录屏幕亮度
        wx.getScreenBrightness({
          success: function (e) {
            wx.setStorageSync("screenLight", e.value)
          }
        })
        //屏幕调整为最亮
        wx.setScreenBrightness({
          value: 1
        })
        this.setData({
          showCode: true
        })
        let num = null
        if (id == 1) {
          num = this.data.ticket_info.ticket_num
          this.setData({
            codeType: 1,
            codeVal: this.data.ticket_info.ticket_num
          })
        }
        if (id == 0) {
          num = this.data.user_info.mobile
          this.setData({
            codeType: 2,
            codeVal: `有效期：${this.data.ticket_info.buy_time}-${this.data.ticket_info.end_date}`
          })
        }
        var qrcode = new QRCode('qrcode', {
          text: num,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });
      } else {
        wx.showToast({
          title: this.data.qrCodePop,
          icon: "none",
          duration: 3000
        })
      }
    }
  },
  hideCode() {
    //屏幕亮度还原
    wx.setScreenBrightness({
      value: wx.getStorageSync('screenLight')
    })
    this.setData({
      showCode: false
    })
  },
  // 判断url是否为tabbar
  isTab(url) {
    for (let item of tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },
  //运营位链接跳转
  advUrl(e) {
    let type = e.currentTarget.dataset.item.type;
    var url = e.currentTarget.dataset.item.url
    //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
    if (type == 1) {
      if (this.isTab(url)) {
        wx.switchTab({
          url
        })
      } else {
        wx.navigateTo({
          url
        })
      }
    } else if (type == 2) {
      wx.navigateToMiniProgram({
        appId: e.currentTarget.dataset.item.appid,
        path: e.currentTarget.dataset.item.url,
        complete(res) {

        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(e.currentTarget.dataset.item.url)
      })
    }
  },

  // n选1活动商品列表
  moreChooseOneGoodsListReq() {
    SvipApi.moreChooseOneGoodsList().then(res => {
      if (res.status == 1 && res.data.goods_list && res.data.goods_list.length > 0) {
        let hasBuyFinish = res.data.goods_list.some(item => {
          return item.order_id > 0
        })
        this.setData({
          moreChooseOneGoodsData: res.data,
          hasBuyFinish
        })
      } else {
        this.setData({
          moreChooseOneGoodsData: null,
        })
      }
      this.setData({
        moreChooseOneGoodsListData: res
      })
    })
  },
  toogleHandle() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  //轮播change
  swiperChange(e) {
    this.setData({
      giftCurrent: e.detail.current
    })
  },
  //播放视频
  playVideo() {
    if (this.data.isPlay) {
      this.setData({
        isPlay: false
      })
      wx.createVideoContext('video').pause()
    } else {
      this.setData({
        isPlay: true
      })
      wx.createVideoContext('video').play()
    }
  },
  //视频播放完
  videoPause() {
    this.setData({
      isPlay: false
    })
  },
  toSignGift() {
    wx.navigateTo({
      url: '/pages/svipPackage/signGift/signGift',
    })
  },
  //关闭svip权益弹窗
  closePayPop() {
    this.setData({
      showPayPop: false
    })
    wx.setStorageSync('closePayPop', wx.getStorageSync('cityId'));
  },
  //查看券码
  checkCode(e) {
    let v = e.currentTarget.dataset.info;
    if (this.data.isOut && v.status == 0) {
      //华为手机二维码出不来要调用两次才可以🙂
      new QRCode("couponCode", {
        text: v.verify_code,
        width: 170,
        height: 170,
        colorDark: "#7F7F7F",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      new QRCode("couponCode", {
        text: v.verify_code,
        width: 170,
        height: 170,
        colorDark: "#7F7F7F",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    } else {
      new QRCode("couponCode", {
        text: v.verify_code,
        width: 170,
        height: 170,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      new QRCode("couponCode", {
        text: v.verify_code,
        width: 170,
        height: 170,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
    this.setData({
      beginDate: v.begin_date,
      endDate: v.end_date,
      isUsed: v.status,
      couCode: v.verify_code,
      showCouponCode: true
    })
  },
  closeCode() {
    this.setData({
      showCouponCode: false
    })
  },
  //会员退费
  refundHandle() {
    let that = this
    wx.showModal({
      title: '您正在退款',
      content: that.data.user_info.is_use_svip_coupon == 1 ? "退款后您使用过的抵扣券将不再返还，您确定要退华夏家博SVIP会员吗？" : "您确定要退华夏家博SVIP会员吗？",
      confirmColor: '#3AA0FF',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '退款中',
            mask: true,
            success: function (res) {},
            fail: function (res) {},
            complete: function (res) {},
          })
          let params = {
            orderSn: that.data.order_sn
          }
          SvipApi.svipRefund(params).then((res) => {
            wx.hideLoading()
            if (res.status == 1) {
              wx.setStorageSync('isSvip', false)
              wx.showModal({
                title: 'SVIP会员费用退款成功',
                content: res.data.is_zerobuy == 1 ? "您是使用抵扣券0元购买升级为会员，不存在退款费用" : "24小时内退回到您的支付账户",
                showCancel: false,
                confirmColor: '#3AA0FF',
                success(res) {
                  if (res.confirm) {
                    wx.reLaunch({
                      url: '/pages/home/home',
                    })
                  }
                }
              })
            } else {
              wx.showToast({
                title: res.message ? res.message : "请求出错了",
                icon: "none"
              })
            }
          }).catch((err) => {

          })
        }
      }
    })
  },
  closeUpdate() {
    this.setData({
      showUpdatePopup: false
    })
  },
  // 切换账号
  switchAccount() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  // 获取商品数据
  getGoodsData(type, size) {
    let params = {
      cityId: wx.getStorageSync('cityId') || 1,
      activityId: wx.getStorageSync('activityId'),
      pageSize: size,
      type: type
    }
    SvipApi.refureshGoods(params).then((res) => {
      res = app.disposeData(res)
      // 预约商品
      if (res.goods_4) {
        let reserveList = [];
        if (res.goods_4.length > 1) {
          reserveList = res.goods_4
            .map(function (v, i) {
              return i % 2 ? null : [res.goods_4[i], res.goods_4[i + 1]];
            })
            .filter(Boolean);
        } else {
          reserveList = res.goods_4;
        }
        this.setData({
          allReserveList: res.goods_4,
          reserveList: reserveList,
          current: 0
        })
      } else {
        this.setData({
          allReserveList: null,
          reserveList: null,
        })
      }
      // 全款商品
      if (res.goods_1) {
        let totalList = [];
        if (res.goods_1.length > 1) {
          totalList = res.goods_1
            .map(function (v, i) {
              return i % 2 ? null : [res.goods_1[i], res.goods_1[i + 1]];
            })
            .filter(Boolean);
        } else {
          totalList = res.goods_1;
        }
        this.setData({
          allTotalList: res.goods_1,
          totalList: totalList,
          current: 0
        })
      } else {
        this.setData({
          allTotalList: null,
          totalList: null,
        })
      }
      // 定金商品
      if (res.goods_2) {
        let prepayList = [];
        if (res.goods_2.length > 1) {
          prepayList = res.goods_2
            .map(function (v, i) {
              return i % 2 ? null : [res.goods_2[i], res.goods_2[i + 1]];
            })
            .filter(Boolean);
        } else {
          prepayList = res.goods_2;
        }
        this.setData({
          allPrepayList: res.goods_2,
          prepayList: prepayList,
          current: 0
        })
      } else {
        this.setData({
          allPrepayList: null,
          prepayList: null,
        })
      }
      // 爆品
      if (res.goods_3) {
        this.setData({
          hotGoods: res.goods_3
        })
      } else {
        this.setData({
          hotGoods: null,
        })
      }
    })
  },
  //去商品详情
  goodsDetail(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/svipPackage/payProductDetail/payProductDetail?id=' + id,
    })
  },
  closePopup(e) {
    let val = e.target.dataset.val;
    this.setData({
      [val]: false
    })
  },
  // 预约商品
  reserveGoods(e) {
    let id = e.currentTarget.dataset.id
    //调用预约接口
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    SvipApi.goodsReserve({
      goods_id: id,
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    }).then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        this.setData({
          reserveTips: true
        })
        this.getGoodsData(4, 100)
      } else if (res.code == -2) {
        //非会员提示弹层
        this.setData({
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

  // 熊猫币数量弹框
  xmbModal() {
    let data = {
      id: 5
    }
    SvipApi.xmbModal(data).then(res => {
      if (res.code == 200) {
        this.setData({
          showXmbTips: true,
          xmbPopupData: res.result
        })
        setTimeout(() => {
          this.setData({
            showXmbTips: false
          })
        }, 5000);
      }
    })
  },
  // 平台券信息展开
  platformSpread(e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    this.setData({
      curId: id,
      curIndex: index
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.data.isPlay) {
      this.setData({
        isPlay: false
      })
      wx.createVideoContext('video').pause()
    }
    if (wx.getStorageSync('screenLight')) {
      //屏幕亮度还原
      wx.setScreenBrightness({
        value: wx.getStorageSync('screenLight')
      })
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (wx.getStorageSync('screenLight')) {
      //屏幕亮度还原
      wx.setScreenBrightness({
        value: wx.getStorageSync('screenLight')
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '数据加载中..',
      mask: true
    })
    this.closeCode()
    //商户优惠券获取
    this.getVendorCoupon("refresh")
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  stop() {
    return false
  },
  shareHandle() {
    this.setData({
      openShare: true,
    })
  },
  shareHandlePop() {
    this.setData({
      openSharePop: true,
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: '您的好友邀请您购买超值svip,点击查看',
      imageUrl: this.data.svipShareAdv ? this.data.svipShareAdv[0].wap_image_url : "https://img.51jiabo.com/a4b4d8d1-9946-43a8-ae4d-6a69e5a72812.png",
      path: '/pages/home/home?svipInviteMobile=' + wx.getStorageSync("userInfo").mobile + "&userCityId=" + (wx.getStorageSync('cityId') || 1)
    }
  }
})