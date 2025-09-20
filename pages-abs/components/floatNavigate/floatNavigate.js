// pages-abs/components/floatNavigate/floatNavigate.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showNav:Boolean,
    showTopBtn: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showMore: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    moreLink(e){
      wx.switchTab({
        url: e.currentTarget.dataset.link,
      })
    },
    toggleMore() {
      this.setData({
        showMore: !this.data.showMore
      })
    },
    backTop() {
      wx.pageScrollTo({
        duration: 100,
        scrollTop: 0
      })
    }
  }
})