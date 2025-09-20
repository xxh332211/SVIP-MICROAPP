// components/goodsDatePicker/goodsDatePicker.js
let months = []
for (let i = 0; i < 12; i++) {
  months.push({
    id: i + 1,
    name: (i + 1 < 10 ? '0' : '') + (i + 1)
  })
}
let years = []
for (let i = 0; i < 80; i++) {
  let year = +(new Date().getFullYear()) - i
  years.push({
    id: year,
    name: year + ''
  })
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    initValue: String
  },

  lifetimes: {
    attached () {
      this.init()
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    years,
    months,
    days: [],
    value: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.triggerEvent('close', {}, {});
    },
    getLastDay (year, month) {
      let d = new Date(year + '/' + month + '/1')
      d.setMonth(d.getMonth() + 1)
      d.setDate(0)
      return d.getDate()
    },
    refresh (indexArray) {
      let idx = [0, 0, 0]
      let val = []
      if (this.data.initValue) {
        let d = new Date(this.data.initValue)
        val[0] = d.getFullYear
        val[1] = d.getMonth()
        val[2] = d.getDate()
      }
      if (indexArray) {
        idx[0] = indexArray[0]
      } else if (val.length) {
        for (let i = 0; i < this.data.years; i++) {
          if (this.data.years[i].name === val[0] + '') {
            idx[1] = i
            break
          }
        }
      }
      if (indexArray) {
        idx[1] = indexArray[1]
      } else if (val.length) {
        idx[1] = val[1]
      }

      let year = this.data.years[idx[0]]
      let maxDate = this.getLastDay(year.id, idx[1] + 1)

      if (indexArray) {
        idx[2] = indexArray[2]
      } else if (val.length) {
        idx[2] = val[2]
      }
      if (idx[2] + 1 > maxDate) {
        idx[2] = maxDate - 1
      }

      let days = []
      for (let i = 0; i < maxDate; i++) {
        days.push({
          id: i + 1,
          name: ((i + 1) > 9 ? '' : '0') + (i + 1)
        })
      }

      this.setData({
        days
      })
      setTimeout(() => {
        this.setData({
          value: [idx[0], 0, idx[1], 0, idx[2]]
        })
      })
      return idx
    },
    init () {
      this.refresh()
    },
    bindChange (evt) {
      let val = evt.detail.value
      val = [val[0], val[2], val[4]]
      this.data.value = this.refresh(val)
    },
    submit () {
      let data
      if (this.data.value.length > 0) {
        let val = this.data.value
        data = this.data.years[val[0]].name + '/' + this.data.months[val[2]].name + '/' + this.data.days[val[4]].name
      } else {
        data = this.data.initValue
      }
      this.triggerEvent('select', {value: data})
    }
  }
})
