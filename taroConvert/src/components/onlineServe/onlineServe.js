import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, MovableArea, MovableView } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
// components/onlineServe/onlineServe.js
// var myPluginInterface = requirePlugin('myPlugin');
import { marketing } from '../../common/api/marketingApi.js'
import './onlineServe.scss'
let marketingApi = new marketing()
const app = Taro.getApp()
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {
    from: String,
  },
  /**
   * 组件的初始数据
   */
  data: {
    cityId: null,
  },
  pageLifetimes: {
    show: function () {
      let H = app.systemData.statusBarHeight + 42,
        Y = (app.systemData?.safeArea?.height ?? 0) - 140
      this.setData({
        y: this.data.from ? H + Y : Y,
        cityId: Taro.getStorageSync('cityId'),
      })
      // 页面被展示
      marketingApi
        .getQyUserId({
          mobile: Taro.getStorageSync('userInfo')
            ? Taro.getStorageSync('userInfo').mobile
            : '',
          city_id: Taro.getStorageSync('cityId'),
          qyuser_id: Taro.getStorageSync('qyuser_id'),
          type: 2,
          src: Taro.getStorageSync('src'),
          uis: Taro.getStorageSync('uis'),
        })
        .then((res) => {
          // console.log(res)
          if (res.code == 200) {
            Taro.setStorageSync('qyuser_id', res.result.qyuser_id)
            Taro.setStorageSync('qyUserInfo', res.result.info)
          }
        })
    },
  },
  ready() {},
  /**
   * 组件的方法列表
   */
  methods: {
    toServe() {
      Taro.navigateTo({
        url: '/pages-qy/pages/onlineServe/onlineServe',
      })
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { cityId, y } = this.data
    return (
      cityId != 60 && (
        <MovableArea className="area">
          <MovableView
            className="tencent-serve"
            direction="vertical"
            y={y}
            animation={false}
            onClick={this.toServe}
          ></MovableView>
        </MovableArea>
      )
    )
  }
}
export default _C
