// components/goodsTimeLeftCounter/goodsTimLeftCounter.js
import utils from '../../utils/utils'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    end: {
      type: String,
      optionalTypes: [Number, String, Date],
      value: ''
    },
    autoHide: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    time: null
  },

  observers: {
    'end' () {
      this.restartCount()
    }
  },

  lifetimes: {
    attached: function() {
      // this.restartCount()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    restartCount () {
      if (this.handler) {
        clearInterval(this.handler)
      }
      if (!this.data.end) {
        this.setData({
          autoHide: !!this.data.autoHide,
          time: null
        })
        return
      }
      let endTime = utils.toDate(this.data.end)
      this.handler = setInterval(() => {
        let now = new Date()
        let ticks = endTime - now
        if (!(ticks > 0)){
          clearInterval(this.handler)
          this.handler = 0
          this.setData({
            autoHide: !!this.data.autoHide,
            time: null
          })
          this.triggerEvent('timeEnd')
        } else {
          this.setData({
            autoHide: !!this.data.autoHide,
            time: {
              days: Math.floor(ticks / 1000 / 60 / 60 / 24),
              hours: Math.floor(ticks % (1000 * 60 * 60 * 24) / 1000 / 60 / 60),
              minutes: Math.floor(ticks % (1000 * 60 * 60) / 1000 / 60),
              seconds: Math.floor(ticks % (1000 * 60) / 1000),
            }
          })
        }
      }, 1000)
    }
  }
})
