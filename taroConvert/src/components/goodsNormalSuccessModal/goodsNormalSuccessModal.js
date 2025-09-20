import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Image, Button } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import Modal from '../goodsCenterCommonModal/goodsCenterCommonModal'
import './goodsNormalSuccessModal.scss'
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    content: String,
  },
  /**
   * 组件的初始数据
   */
  data: {},
  /**
   * 组件的方法列表
   */
  methods: {
    close() {
      this.triggerEvent('close', {}, {})
    },
    submit(evt) {
      this.triggerEvent('close', {}, {})
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { title, content } = this.data
    return (
      <Modal onClose={this.close}>
        <View className="container">
          <Image
            src="https://img.51jiabo.com/imgs-mall/success-gray.svg"
            mode="aspectFit"
          ></Image>
          <View className="title">{title}</View>
          <View className="text">{content}</View>
          <Button
            className="submit normal-btn"
            onClick={this.submit}
            hoverClass="close-press"
          >
            确认
          </Button>
        </View>
      </Modal>
    )
  }
}
export default _C
