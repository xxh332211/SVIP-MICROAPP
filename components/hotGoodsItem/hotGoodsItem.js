// components/hotGoodsItem/hotGoodsItem.js
import {
  svip
} from "../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  absApi
} from "../../common/api/absAPI.js"
let AbsApi = new absApi()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hotGoods: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    reserveSuccess: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //预约爆品
    reverseBtn(e) {
      let page = getCurrentPages();
      let currentRoute = page[page.length - 1].route;
      // 友盟统计
      wx.uma.trackEvent('click_getTicke', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '爆品预约btn',
        SourcePage: currentRoute,
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis'),
      });
      if (wx.getStorageSync("isLogin")) {
        wx.showLoading({
          title: '预约中...',
          mask: true
        })
        let itemId = e.currentTarget.dataset.item.detail_id;
        let data = {
          source_id: itemId,
          src_id: "explosive",
          mobile: wx.getStorageSync("userInfo").mobile,
          invite: "",
          formId: "",
          'src': wx.getStorageSync('src'),
          'uis': wx.getStorageSync('uis'),
          'plan': wx.getStorageSync('plan'),
          'unit': wx.getStorageSync('unit')
        }
        marketingApi.postReserve(data).then((res) => {
          wx.hideLoading()
          if (res.code == 200) {
            for (let i of this.data.hotGoods) {
              if (itemId == i.detail_id) {
                i.is_get = "1";
                i.goods_stock = Number(i.goods_stock) - 1;
              }
            }
            this.setData({
              reserveSuccess: true,
              hotGoods: this.data.hotGoods,
              hotGoodsItem: e.currentTarget.dataset.item,
              shareData: {
                title: e.currentTarget.dataset.item.goods_name,
                path: "/pages/hotGoodsOrder/detail/detail?detail_id=" + e.currentTarget.dataset.item.detail_id + "&hotInviteMobile=" + wx.getStorageSync("userInfo").mobile + "&userCityId=" + (wx.getStorageSync('cityId') || 1) + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId"),
              }
            })
            AbsApi.addBrowseHistory({
              action_type: 2,
              goods_type: 1,
              goods_id: itemId,
              action_info: e.currentTarget.dataset.item.goods_name
            }).then(res => {

            })
            // 熊猫币弹框
            this.xmbModal();
          } else {
            wx.showToast({
              title: res.message ? res.message : "请求出错了",
              icon: "none"
            })
          }
        })
      } else {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }
    },
    closeReserve() {
      this.setData({
        reserveSuccess: false
      })
    },
    umengTj() {
      let page = getCurrentPages();
      let currentRoute = page[page.length - 1].route;
      // 友盟统计
      wx.uma.trackEvent('click_getTicke', {
        cityId: wx.getStorageSync('cityId'),
        ButtonName: '爆品点击区域',
        SourcePage: currentRoute,
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis'),
      });
    },

    // 熊猫币数量弹框
    xmbModal() {
      let data = {
        id: 3
      }
      SvipApi.xmbModal(data).then(res => {
        if (res.code == 200) {
          this.setData({
            showXmbTips: true,
            xmbPopupData:res.result
          })
          setTimeout(() => {
            this.setData({
              showXmbTips: false
            })
          }, 5000);
        }
      })
    },
  }
})