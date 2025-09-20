// pGoods/pages/goodsOrderDetail/goodsOrderDetail.js
import apiService from '../../../common/http/httpService_mall'
import utils from '../../../utils/utils'
const QRCode = require('../../../utils/qrcode.js')
let qrcode

const rate = wx.getSystemInfoSync().windowWidth / 750
function rpx2px (rpx) {
  return rate * rpx
}

let qrWidth = rpx2px(220)

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    info: {},
    stateObject: {},
    deliveryWay: '',
    orderTypeName: '',
    qrWidth,
    curUserId: +wx.getStorageSync('mall_token').id,
    tuangouEnded: false,
    grouponStatusName: '',
    grouponStatus: -1,
    grouponOrderId: 0,
    grouponProductId: 0,    
    shareModalVisible: false,
    shareModalData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.id = options.id || 308
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (this.data.grouponStatus === 0) {
      return {
        title: '您的好友邀请你一起来拼单，快来参加吧！',
        path:
          '/pGoods/pages/goodsTuangouDetail/goodsTuangouDetail?id=' +
          this.data.grouponProductId +
          '&orderId=' +
          this.data.info.groupon[0].grouponOrderId +
          '&couponInviteMobile=' +
          wx.getStorageSync('userInfo').mobile +
          '&cityId=' +
          (wx.getStorageSync('cityId') || 1)+
          '&activityId=' +
          wx.getStorageSync('activityId') +
          '&sessionId=' +
          wx.getStorageSync('sessionId'),
        imageUrl: this.data.info.productImageUrl
      }
    } else {
      return null
    }
  },

  loadData () {
    wx.showLoading()
    apiService('order/get', 'GET', {
      id: this.data.id
    })
      .then(rst => {
        let fmt = 'YYYY/MM/DD HH:mm'
        rst.createTime = utils.dateFormat(rst.createTime, fmt)
        if (rst.refundTime) {
          rst.refundTime = utils.dateFormat(rst.refundTime, fmt)
        }
        rst.payTime = utils.dateFormat(rst.payTime, fmt)
        rst.verifiedTime = utils.dateFormat(rst.verifiedTime, fmt)
        let tuangouEnded = false
        let grouponStatusName = ''
        let grouponStatus = -1
        let grouponOrderId = 0
        let grouponProductId = 0
        
        if (rst.groupon) {
          // 已经在后端构造了，不需要前端处理
          // if (rst.groupon[0].grouponCount > rst.groupon[0].buyerCount) {  
          //   let allIn = rst.groupon && rst.groupon.length || 0
          //   let virturalBuyer = rst.groupon && rst.groupon.length && rst.groupon[0].virtualCount || 0
          //   let virtualIn = rst.groupon.filter(t => t.buyerId <= 0).length
          //   rst.groupon.length = rst.groupon[0].grouponCount
          //   for(var i = 0; i < (virturalBuyer - virtualIn); i++) {
          //     let vb = { ...rst.groupon[0] }
          //     vb.buyerId = -1
          //     vb.buyerIcon = ''
          //     rst.groupon[allIn + i] = vb
          //   }
          // }
          if (utils.toDate(rst.groupon[0].grouponEndTime) < new Date()) {
            tuangouEnded = true
          }
          grouponStatus = rst.groupon[0].grouponStatus
          grouponOrderId = rst.groupon[0].grouponOrderId
          grouponProductId = rst.groupon[0].grouponProductId
          if (grouponStatus === 0) {
            grouponStatusName = '拼单中'
          } else if (grouponStatus === 1) {
            grouponStatusName = '拼单成功'
          } else if (grouponStatus === 2) {
            grouponStatusName = '拼单失败'
          }
        }
        let orderTypeName = (() => {
          switch (rst.orderType) {
            case 1:
              return '线上特卖'
            case 2:
              return '团购'
            case 3:
              return '秒杀'
            case 4:
              return '虚拟商品'
            default:
              return ''
          }
        })()
        let deliveryWay = (() => {
          switch (rst.deliveryWay) {
            case 1:
              return '送货到家'
            case 2:
              return '送货到楼下'
            case 3:
              return '消费者自提'
            case 4:
              return '快递'
            case 4:
              return '其他'
            default:
              return ''
          }
        })()
        let stateObject = (() => {
          switch (rst.orderStatus) {
            case 0:
              return {
                icon: 'order-detail-pay.svg',
                name: '待支付',
                subName: '请尽快支付',
                desc: '如果未支付, 订单会在下单半小时后自动取消',
                hasNotice: false
              }
            case 1:
              return {
                icon: 'order-detail-cancel.svg',
                name: '已取消',
                subName:
                  '订单已取消' +
                  (rst.payStatus === 2
                    ? '(退款中)'
                    : rst.payStatus === 3
                    ? ''
                    : ''),
                desc: '您主动取消了此订单',
                hasNotice: false
              }
            case 2:
              return {
                icon: 'order-detail-cancel.svg',
                name: '已取消',
                subName: '订单已取消',
                desc: '由于支付超时, 订单自动取消',
                hasNotice: false
              }
            case 3:
              let t = utils.dateFormat(rst.activityBeginDate, 'MM.DD')
              let t1 = utils.dateFormat(rst.activityEndDate, 'MM.DD')
              return {
                icon: 'order-detail-shipping.png',
                name: grouponStatus === 0 ? '待分享' : '待提货',
                subName:
                  grouponStatus === 0
                    ? '需拼团完成后现场取货!'
                    : '该商品须到展会现场取货!',
                desc:
                  grouponStatus === 0
                    ? `成团后于${t}-${t1}到${rst.venueAddress || ''}领取`
                    : `请您于${t}-${t1}到${rst.venueAddress || ''}领取`,
                hasNotice: true
              }
            case 4:
              let t2 = utils.dateFormat(rst.closeTime, 'YYYY/MM/DD HH:mm')
              return {
                icon: 'order-detail-complete.svg',
                name: rst.payStatus === 3 ? '已取消' : '已完成',
                subName:
                  grouponStatus === 2
                    ? '哎，拼团失败!'
                    : rst.payStatus === 3
                    ? '订单已取消'
                    : '商品已完成!',
                desc:
                  grouponStatus === 2
                    ? '很遗憾规定时间内未成团，费用已退回请注意查收'
                    : rst.payStatus === 3
                    ? '您主动取消了此订单'
                    : `该商品于${t2}完成现场取货!`,
                hasNotice: true
              }
            default:
              return {
                icon: '',
                name: '',
                subName: '',
                desc: '',
                hasNotice: false
              }
          }
        })()
        this.setData({
          info: rst,
          orderTypeName,
          deliveryWay,
          stateObject,
          tuangouEnded,
          grouponStatusName,
          grouponStatus,
          grouponOrderId,
          grouponProductId
        })
        if (rst.orderStatus === 3) {
          setTimeout(() => {
            qrcode = new QRCode('canvas', {
              text: rst.verificationCode,
              width: qrWidth,
              height: qrWidth,
              colorDark: '#222222',
              colorLight: '#ffffff',
              correctLevel: QRCode.CorrectLevel.H
            })
          }, 100)
        }
        wx.stopPullDownRefresh()
        wx.hideLoading()
      })
      .catch(() => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
      })
  },

  remove () {
    let ctx = this
    wx.showModal({
      title: '删除确认',
      content: '确定删除此订单吗?',
      showCancel: true,
      confirmColor: '#E6001B',
      success (res) {
        if (res.confirm) {
          wx.showLoading()
          apiService('order/delete?id=' + ctx.data.info.id, 'DELETE')
            .then(() => {
              wx.navigateBack()
              wx.hideLoading()
            })
            .catch(() => {
              wx.wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
              wx.hideLoading()
            })
        }
      }
    })
  },
  cancel () {
    let ctx = this
    if (ctx.data.info.orderStatus === 0) {
      wx.showModal({
        title: '取消确认',
        content: '确定取消此订单吗?',
        showCancel: true,
        confirmColor: '#E6001B',
        success (res) {
          if (res.confirm) {
            wx.showLoading()
            apiService('order/cancel', 'PUT', {
              id: ctx.data.info.id
            })
              .then(() => {
                ctx.loadData()
              })
              .catch(() => {
                wx.wx.showToast({
                  title: '取消失败',
                  icon: 'none'
                })
                wx.hideLoading()
              })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pGoods/pages/goodsReturns/goodsReturns?id=' + ctx.data.info.id
      })
    }
  },
  pay () {
    let ctx = this
    wx.showLoading()
    apiService('order/payment/orderInfo', 'GET', {
      orderId: this.data.info.id
    })
      .then(rst => {
        if (rst.nonceStr) {
          wx.requestPayment({
            timeStamp: rst.timeStamp + '',
            nonceStr: rst.nonceStr,
            package: rst.package,
            signType: rst.signType,
            paySign: rst.paySign,
            success: function (res) {
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                complete () {
                  ctx.loadData()
                }
              })
            },
            fail: function (res) {
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                complete () {
                  ctx.loadData()
                }
              })
            }
          })
        }
        wx.hideLoading()
      })
      .catch(() => {
        wx.hideLoading()
      })
  },
  returns () {},
  confirm () {
    let ctx = this
    wx.showModal({
      title: '提货确认',
      content: '确定提货操作吗?',
      showCancel: true,
      confirmColor: '#E6001B',
      success (res) {
        if (res.confirm) {
          wx.showLoading()
          apiService('order/close', 'PUT', {
            id: ctx.data.info.id
          })
            .then(() => {
              ctx.loadData()
            })
            .catch(() => {
              wx.wx.showToast({
                title: '操作失败',
                icon: 'none'
              })
              wx.hideLoading()
            })
        }
      }
    })
  },
  onTuangouEnd () {
    this.setData({
      tuangouEnded: true
    })
  },
  toTuangouDetail () {
    wx.navigateTo({
      url:
        '/pGoods/pages/goodsTuangouDetail/goodsTuangouDetail?id=' +
        this.data.info.groupon[0].grouponProductId
    })
  },

  toShareGroup () {
    console.log('toShare')
  },
  makeCall () {
    wx.makePhoneCall({
      phoneNumber: '400-6188-555'
    })
  }
})
