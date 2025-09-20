// pages-userInfo/components/totalOrder/totalOrder.js
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
    refundInterval: 3,
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
    // 退款失败按钮
    refundFail(e) {
      let item = e.currentTarget.dataset.item;
      this.setData({
        curItem: item,
        refundFailReason: item.refund_reason,
        showRefundPopup: true,
      })
    },
    closeSure() {
      this.setData({
        sureRefund: false
      })
    },
    goodsRefund(e) {
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
                this.triggerEvent("getList")
                this.setData({
                  showMoreChooseOneTips: true,
                  isMCOChoose: false,
                  showMoreChooseOnePopup: false,
                })
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
          this.timer = setInterval(() => {
            this.setData({
              refundInterval: this.data.refundInterval - 1
            })
            if (this.data.refundInterval === 0) {
              this.setData({
                canClickConfirmRefund: true,
                refundInterval: 3
              })
              clearInterval(this.timer);
            }
          }, 1000);
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
        refundInterval: 3,
        showRefundPopup: false,
        refundFailReason: ''
      })
      if (this.timer) {
        clearInterval(this.timer);
      }
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
          this.triggerEvent("getList")
        }
      })
    },
    // 关闭n选1退款弹层
    close_MCOP() {
      this.setData({
        showMoreChooseOnePopup: false
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
    reFundTips() {
      this.triggerEvent("reFundTips")
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
        if (res.status == 1) {
          this.setData({
            price: Number(this.data.curData.currentTarget.dataset.price),
            sureRefund: false,
          })
          if (e.currentTarget.dataset.type == 'expo') {
            this.setData({
              showMoreChooseOneTips: true,
              isMCOChoose: false,
              showMoreChooseOnePopup: false,
            })
            this.triggerEvent("getList")
          } else {
            this.setData({
              showRefundPopup: false,
              canClickConfirmRefund: false,
              refundFailReason: '',
              showTips: true,
              tipsText: "退款申请已提交"
            })
            let that = this;
            setTimeout(function () {
              that.setData({
                showTips: false,
              })
            }, 3000)
            this.triggerEvent("getList")
          }
        } else {
          wx.showToast({
            icon: 'none',
            title: res.message ? res.message : "请求失败"
          })
        }
      })
    },
  }
})