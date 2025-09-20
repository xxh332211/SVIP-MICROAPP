import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
cacheOptions.setOptionsToCache({
  properties: {
    gap: {
      type: Number,
      value: 20,
    },
  },
  data: {
    leftList: [],
    rightList: [],
  },
  attached() {
    this._list = []
    this._leftIndex = 0
    this._rightIndex = 0
  },
  methods: {
    /**
     * public
     *
     * @param {*} list
     */
    render(list, isReset) {
      if (isReset) {
        this._list = []
        this._leftIndex = 0
        this._rightIndex = 0
        this.setData({
          leftList: [],
          rightList: [],
        })
      }
      this._list = list
      this._listLen = list.length
      this._listLast = this._list[this._list.length - 1]
      this._updateWaterfall()
    },
    /**
     * public
     *
     */
    reset() {
      this.setData({
        leftList: [],
        rightList: [],
      })
      this._leftIndex = 0
      this._rightIndex = 0
    },
    _updateWaterfall(list) {
      if (this._list.length) {
        // console.log("右：", this._rightIndex, this.data.rightList.length, "左：", this._leftIndex, this.data.leftList.length)
        const item = this._list.shift()
        this._createObserver().then((pos) => {
          // this._listLen %2 != 0 &&
          if (
            this._listLast.prerogative_goods_id == item.prerogative_goods_id
          ) {
            let leftH, rightH
            Taro.createSelectorQuery()
              .in(this)
              .select('.waterfall')
              .boundingClientRect((rect) => {
                leftH = rect.height
              })
              .exec()
            Taro.createSelectorQuery()
              .in(this)
              .select('.waterfall__right')
              .boundingClientRect((rect) => {
                rightH = rect.height
                pos = leftH > rightH ? 'right' : 'left'
                // console.log('高度',pos,leftH,rightH)
                const updateIndex = this[`_${pos}Index`]
                this.setData(
                  {
                    [`${pos}List[${updateIndex}]`]: item,
                  },
                  () => {
                    this[`_${pos}Index`] += 1
                    this._updateWaterfall()
                  }
                )
              })
              .exec()
          } else {
            const updateIndex = this[`_${pos}Index`]
            this.setData(
              {
                [`${pos}List[${updateIndex}]`]: item,
              },
              () => {
                this[`_${pos}Index`] += 1
                this._updateWaterfall()
              }
            )
          }
        })
      }
    },
    _createObserver() {
      return new Promise((resolve) => {
        this._observer && this._observer.disconnect()
        this._observer = this.createIntersectionObserver({
          observeAll: true,
        })
        this._observer
          .relativeTo('.waterfall__observer')
          .observe('.waterfall__view', ({ dataset: { nextposition = '' } }) => {
            // console.log(nextposition)
            resolve(nextposition)
          })
      })
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { gap, leftList, rightList } = this.data
    return (
      <View
        className="waterfall"
        style={{
          padding: '0 0.875rem',
        }}
      >
        <View
          className="waterfall__left waterfall__view"
          data-nextposition="right"
          style={{
            width: `calc(50% - ${gap / 2 / 40}rem)`,
            marginRight: `${gap / 2 / 40}rem`,
          }}
        >
          {leftList?.map((item, index) => {
            return <Layout key={index} itemData={item}></Layout>
          })}
        </View>
        <View
          className="waterfall__right waterfall__view"
          data-nextposition="left"
          style={{
            width: `calc(50% - ${gap / 2 / 40}rem)`,
            marginLeft: `${gap / 2 / 40}rem`,
          }}
        >
          {rightList?.map((item, index) => {
            return <Layout key={index} itemData={item}></Layout>
          })}
        </View>
        <View className="waterfall__observer"></View>
      </View>
    )
  }
}
export default _C
