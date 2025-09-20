Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsInfo: Object,
    tuangou: Boolean,
    seckill: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    count: 1,
    image: '',
    isSvip: false
  },

  observers: {
    'goodsInfo' (val) {
      let imgs = val.images.filter(e => e.imageType === 2)
      if (imgs.length === 0) {
        imgs = val.images.filter(e => e.imageType === 4)
      }
      this.setData({
        isSvip: wx.getStorageSync('isSvip'),
        image: imgs && imgs[0] && imgs[0].imageUrl || ''
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.triggerEvent(
        'close',
        {},
        {}
      )
    },
    next () {
      this.triggerEvent(
        'next',
        {
          value: this.data.count
        },
        {}
      )
    },
    minus () {
      if (this.data.count > 1) {
        this.setData({
          count: this.data.count - 1
        })
      }
    },
    plus () {
      if (!this.data.goodsInfo.product.unlimitStock && this.data.count >= this.data.goodsInfo.product.stock) {
        wx.showToast({
          title: '库存不足',
          icon: 'none',
          duration: 2000
        })
        return
      } else if (this.data.goodsInfo.product.orderLimit && this.data.count >= this.data.goodsInfo.product.orderLimit) {
        wx.showToast({
          title: '限购' + this.data.goodsInfo.product.orderLimit + '个',
          icon: 'none',
          duration: 2000
        })
        return
      }
      this.setData({
        count: this.data.count + 1
      })
    }
  }
})
