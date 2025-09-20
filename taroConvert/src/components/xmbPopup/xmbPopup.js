import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Image } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import './xmbPopup.scss'
// components/xmbPopup/xmbPopup.js
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {
    showXmbTips: {
      type: Boolean,
      value: false,
    },
    xmbPopupData: {
      type: Object,
      value: {},
    },
  },
  /**
   * 组件的初始数据
   */
  data: {},
  /**
   * 组件的方法列表
   */
  methods: {
    // 熊猫币中心跳转
    toXmbCenter() {
      Taro.navigateTo({
        url: '/pages-xmb/pages/xmbCenter/index/index',
      })
    },
    // 熊猫币抽奖跳转
    toXmbLottery() {
      Taro.navigateTo({
        url: '/pages-xmb/pages/luckyDraw/luckyDraw',
      })
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { showXmbTips, xmbPopupData } = this.data
    return (
      showXmbTips && (
        <View className="xmb-tips">
          <View className="xmb-left">
            <Image
              className="xmb-icon"
              src="https://img.51jiabo.com/983e9af2-b384-4f5d-930c-d56f788699d9.png"
            ></Image>
            <View>
              <View>{'恭喜获得' + xmbPopupData.total_coin + '熊猫币!'}</View>
              {xmbPopupData.activity_status != 3 && (
                <View className="xmb-desc">{xmbPopupData.message}</View>
              )}
            </View>
          </View>
          <View className="xmb-right">
            {xmbPopupData.activity_status == 0 ||
            xmbPopupData.activity_status == 3 ? (
              <View onClick={this.toXmbCenter}>
                {xmbPopupData.activity_status == 0 ? '去领取' : '点击查看'}
              </View>
            ) : (
              (xmbPopupData.activity_status == 1 ||
                xmbPopupData.activity_status == 2) && (
                <View onClick={this.toXmbLottery}>
                  {xmbPopupData.activity_status == 1 ? '去抽奖' : '查看抽奖'}
                </View>
              )
            )}
            <Image
              className="xmb-arrow"
              src={require('../../imgs/index-arrow.png')}
            ></Image>
          </View>
        </View>
      )
    )
  }
}
export default _C
