// components/hotGoodsItem/hotGoodsPopup/hotGoodsPopup.js
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hotGoodsItem: Object,
    shareData: Object
  },
  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 在组件实例进入页面节点树时执行
   */
  attached() {
    this.setData({
      marketPrice: Number(this.data.hotGoodsItem.market_price),
      specialPrice: Number(this.data.hotGoodsItem.special_price),
      stock: Number(this.data.hotGoodsItem.goods_stock) - 1,
      activityInfo: wx.getStorageSync("activityInfo")
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onClose() {
      this.triggerEvent("closeReserve")
    }
  }
})