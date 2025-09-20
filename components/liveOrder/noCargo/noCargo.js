import {
  liveApi
} from "../../../common/api/liveApi"
let LiveApi = new liveApi()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderAllList:Array
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击整个详情
    detailBtn(e){
      this.triggerEvent("detailBtn", { 'id':e.currentTarget.dataset.id })
    },
    // 删除
    removeBtn(e){
      this.triggerEvent("removeBtn",{'order_id':e.currentTarget.dataset.order_id})
    },
    // 支付
    payBtn(e){
      this.triggerEvent("payBtn",{'order_num':e.currentTarget.dataset.order_num})
    }
  }
})
