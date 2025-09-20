// components/hotGoodsGroup/hotGoodsGroup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    groupItem: Object
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
    toGroupList(e) {
      let id = e.currentTarget.dataset.groupid;
      wx.navigateTo({
        url: '/pages/expoPackage/hotGoodsGroup/hotGoodsGroup?groupId=' + id,
      })
    },
    toHotGoodsDetail(e) {
      let item = e.currentTarget.dataset.item;
      wx.navigateTo({
        url: '/pages/hotGoodsOrder/detail/detail?detail_id=' + item.detail_id,
      })
    }
  }
})