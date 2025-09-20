// pages/user/myCoupon/myCoupon.js
var QRCode = require('../../../utils/qrcode.js')
import {
  marketing
} from "../../../common/api/marketingApi.js"
import apiService from '../../../common/http/httpService_mall'
import utils from '../../../utils/utils'
let marketingApi = new marketing()
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    curNum: 0,
    canUse: true,
    isCommon: false,
    commonCouponList: [],
    curId: 0,
    curIndex: 0,
  },
  /**	在组件实例进入页面节点树时执行 */
  attached() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //商户分类列表
    marketingApi.getVendorList().then((res) => {
      if (res.code == 200) {
        // res.result.unshift({
        //   category_name: "通用",
        //   id: "-1"
        // })
        res.result.unshift({
          category_name: "全部",
          id: ""
        })
        this.setData({
          vendorList: res.result
        })
        //获取已使用优惠券列表
        marketingApi.getMyCoupon({
          id: "",
          status: 1
        }).then((res) => {
          wx.hideLoading()
          if (res.code == 200) {
            for (let i of res.result) {
              i.begin_date = i.begin_date.split(".").slice(1).join(".");
            }
            this.setData({
              usedCouponList: res.result
            })
          }
        })
        //获取未使用优惠券列表
        this.getCoupon(res.result[0].id)
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //未使用优惠券列表
    getCoupon(id) {
      marketingApi.getMyCoupon({
        id: id,
        status: 0
      }).then((res) => {
        wx.hideLoading()
        if (res.code == 200) {
          this.setData({
            useCouponList: res.result
          })
        }
      })
    },
    loadCommonCoupon() {
      wx.showLoading()
      this.setData({
        commonCouponList: []
      })
      apiService('member/list/coupons', 'GET', {
        used: this.data.canUse ? false : true
      }).then(rst => {
        this.setData({
          commonCouponList: (rst || []).filter(e => {
            e.beginDate = utils.dateFormat(e.beginDate, 'YYYY.MM.DD')
            e.endDate = utils.dateFormat(e.endDate, 'YYYY.MM.DD')
            if (e.couponType !== 1) {
              e.couponValue = Math.round(e.couponValue * 10) / 100
            }
            return true
          })
        })
        wx.hideLoading()
      }).catch(() => {
        wx.hideLoading()
      })
    },
    //切换优惠券类型（已使用、未使用）
    switchTab(e) {
      if (e.currentTarget.dataset.id == "canUse") {
        //未使用
        this.setData({
          canUse: true
        })
        this.loadData('')
      } else {
        //已使用
        this.setData({
          canUse: false
        })
        //外包已使用接口
        // this.loadData('-1')
      }
    },
    loadData(vendorId) {
      // if (vendorId === "-1") {
      //   this.setData({
      //     isCommon: true
      //   })
      //   this.loadCommonCoupon()
      // } else {
      this.setData({
        isCommon: false
      })
      //获取优惠券列表
      this.getCoupon(vendorId)
      // }
      if (this.data.canUse) {
        let idx = 0
        for (let i = 0; i < this.data.vendorList.length; i++) {
          if (this.data.vendorList[i].id === vendorId) {
            idx = i
            break
          }
        }
        let nums = idx + 1
        let menuIndex = 0
        if (this.data.vendorList.length == nums) {
          menuIndex = 0.5 + nums - 5
        } else if (this.data.vendorList.length > 5 && nums >= 5) {
          menuIndex = nums - 4
        }
        this.setData({
          menuIndex,
          curNum: idx
        })
      }
    },
    //切换分类
    cutKind(e) {
      let id = e.currentTarget.dataset.id
      this.loadData(id)
    },
    //去sivp支付页
    toSvipPay() {
      wx.navigateTo({
        url: '/pages/svipPackage/paySvip/paySvip',
      })
    },
    //查看券码
    checkCode(e) {
      let v = e.currentTarget.dataset.item;
      new QRCode("couponCode", {
        text: v.coupon_code,
        width: 170,
        height: 170,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      this.setData({
        beginDate: v.begin_date_new,
        endDate: v.end_date,
        couCode: v.coupon_code,
        showCouponCode: true
      })
    },
    closeCode() {
      this.setData({
        showCouponCode: false
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
    toCouponDetail(e) {
      let params = e.currentTarget.dataset;
      if (params.type != 4) {
        wx.navigateTo({
          url: '/pages/expoPackage/couponDetail/couponDetail?from=couponList&couponId=' + params.id,
        })
      }
    },
  }
})