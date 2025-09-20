import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Slot, Image } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import './goodsCenterCommonModal.scss'
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
    close() {
      console.log('close')
      this.triggerEvent('close', {}, {})
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    return (
      <View className="modal-wrap" onTouchMove={this.stop}>
        <View className="bg"></View>
        <View className="wrapper">
          <View className="modal-content">
            {this.props.children}
            <View className="close" onClick={this.close}>
              <Image
                src="https://img.51jiabo.com/imgs-mall/popup-close.svg"
                mode="aspectFit"
              ></Image>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
export default _C
