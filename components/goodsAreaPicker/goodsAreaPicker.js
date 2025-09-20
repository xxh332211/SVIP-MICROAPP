let area = require('../../utils/area.js')
let areaData = []
area.getAreaInfo(function (arr) {
  let provinces = [];
  for (let item of arr) {
    if (item.di === '00' && item.xian === '00') {
      item.children = []
      for (let city of arr) {
        if (item.sheng === city.sheng && city.di !== '00' && city.xian === '00') {
          city.children = []
          for (let area of arr) {
            if (item.sheng === area.sheng && area.di === city.di && area.xian !== '00') {
              city.children.push(area)
            }
          }
          city.children.length && item.children.push(city)
        }
      }
      item.children.length && provinces.push(item);
    }
  }
  areaData = provinces
});
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    initValue: Array
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
    provinces: [],
    cities: [],
    areas: [],
    value: []
  },

  observers: {
    initValue () {
      if (this.data.provinces.length) {
        this.value = []
        this.refresh()
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.triggerEvent('close', {}, {});
    },
    refresh (indexArray) {
      let idx = [0, 0, 0]
      if (indexArray) {
        idx[0] = indexArray[0]
      } else if (this.data.initValue && this.data.initValue.length > 0) {
        for (let i = 0; i < this.data.provinces.length; i++) {
          if (this.data.provinces[i].name === this.data.initValue[0]) {
            idx[0] = i
            break
          }
        }
      }
      let cities = this.data.provinces[idx[0]].children
      if (indexArray) {
        idx[1] = indexArray[1]
      } else if (this.data.initValue && this.data.initValue.length > 0) {
        for (let i = 0; i < cities.length; i++) {
          if (cities[i].name === this.data.initValue[1]) {
            idx[1] = i
            break
          }
        }
      }
      let areas = cities[idx[1]].children
      if (indexArray) {
        idx[2] = indexArray[2]
      } else if (this.data.initValue && this.data.initValue.length > 0) {
        for (let i = 0; i < areas.length; i++) {
          if (areas[i].name === this.data.initValue[2]) {
            idx[2] = i
            break
          }
        }
      }
      this.setData({
        cities,
        areas
      })
      setTimeout(() => {
        this.setData({
          value: idx
        })
      })
    },
    init () {
      this.setData({
        provinces: areaData
      })
      this.refresh()
    },
    bindChange (evt) {
      let val = evt.detail.value
      if (this.data.value.length) {
        let reset = false
        for (let i = 0; i < 3; i++) {
          if (reset) {
            val[i] = 0
          } else {
            if (this.data.value[i] !== val[i]) {
              reset = true
            }
          }
        }
      }
      this.data.value = val
      this.refresh(val)
    },
    submit () {
      let data = []
      if (this.data.value.length > 0) {
        data[0] = this.data.provinces[this.data.value[0]].name
        data[1] = this.data.cities[this.data.value[1]].name
        data[2] = this.data.areas[this.data.value[2]].name
      } else {
        data = this.data.initValue
      }
      this.triggerEvent('select', {value: data})
    }
  }
})
