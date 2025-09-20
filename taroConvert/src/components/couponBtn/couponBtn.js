import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import './couponBtn.scss'
// components/popupCoupon/popupCoupon.js
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {},
  /**
   * 组件的初始数据
   */
  data: {},
  /**
   * 组件的方法列表
   */
  methods: {
    toSvipPay() {
      Taro.navigateTo({
        url: '/pages/svipPackage/paySvip/paySvip',
      })
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    return <View className="coupon-popup" onClick={this.toSvipPay}></View>
  }
}
export default _C
