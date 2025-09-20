// pages/user/myReserve/myReserve.js
import {
  marketing
} from "../../../common/api/marketingApi.js"
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
    isHot:true
  },
  /**	在组件实例刚刚被创建时执行 */
  created() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //爆品列表
    marketingApi.getMyReserveHot().then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        this.setData({
          hotGoodsList:res.result
        })
      }
    })
    //商户活动列表
    marketingApi.getMyReserveAct().then((res) => {
      wx.hideLoading()
      if (res.code == 200) {
        let resData = [];
        if (res.result && res.result.length > 0){
          for (let i of res.result) {
            i.begin_time = i.begin_time.split(' ')[0].replace(/-/g,".").substr(5)
            i.end_time = i.end_time.split(' ')[0].replace(/-/g, ".").substr(5)
            resData.push(i)
          }
        }
        this.setData({
          vendorActList: resData
        })
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //切换预约类型
    switchTab(e) {
      if (e.currentTarget.dataset.id == "Hot") {
        this.setData({
          isHot: true
        })
      } else {
        this.setData({
          isHot: false
        })
      }
    },
  }
})
