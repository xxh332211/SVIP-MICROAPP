// components/explain/explain.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // datalist: {
    //   type: Array,
    //   value: [],
    //   observer() {}
    // }
  },
  data: {
    
  },
  attached(){
    this.setData({
      datalist: wx.getStorageSync("pageGuideList")
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})