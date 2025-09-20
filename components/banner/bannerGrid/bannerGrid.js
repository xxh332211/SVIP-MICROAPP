// components/banner/bannerDird.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dataList:Array
  },

  data: {
    dataArray: []
  },

  lifetimes: {
    ready() {}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    showRightsDialog(item) {
      let curItem = item.currentTarget.dataset.item
      this.triggerEvent('showDialog', curItem)
    }
  }
})