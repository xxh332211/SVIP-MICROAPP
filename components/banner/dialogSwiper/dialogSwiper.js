// components/banner/dialogSwiper/dialogSwiper.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dataList:Array
  },
  /**
   * 组件的初始数据
   */
  data: {
    swiperError: null,
    current: 0,
    animationData: {},
    animationDataShrink: {}
  },
  lifetimes: {
    ready() {
      // 动画有待添加
      // this.stretch()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    stop() {
      return
    },
    closedHandle() {
      this.triggerEvent('hideDialog')
    },
    change(e) {
      this.setData({
        current: e.detail.current
      })
      // this.stretch()
      // this.shrink()
    },
    changeErrSwip() {},
    // 展开 动画
    stretch(h, w) {
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'linear',
      })
      this.animation = animation
      animation.scale(1.1, 1.1).step()
      this.setData({
        animationData: animation.export(),
      })
    },
    // 收缩 动画
    shrink(h, w) {
      var animationShrink = wx.createAnimation({
        duration: 500,
        timingFunction: 'linear',
      })
      this.animationShrink = animationShrink
      animation.scale(0.9, 0.9).step()
      this.setData({
        animationDataShrink: animationShrink.export()
      })
    }
  }
})