//动态数据的轮播
Component({
  properties: {
    dataList: {
      type: Array,
      value: [{
          image_url: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3673191535,4025234405&fm=27&gp=0.jpg',
          title: '权益项'
        },
        {
          image_url: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=965139422,648637599&fm=27&gp=0.jpg',
          title: '权益项2'
        },
        {
          image_url: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3673191535,4025234405&fm=27&gp=0.jpg',
          title: '权益项'
        }
      ]
    }
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