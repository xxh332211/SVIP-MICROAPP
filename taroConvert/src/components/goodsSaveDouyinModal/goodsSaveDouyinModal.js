import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Image, Button } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import Modal from '../goodsCenterCommonModal/goodsCenterCommonModal'
import './goodsSaveDouyinModal.scss'
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
      this.triggerEvent('close', {}, {})
    },
    submit(evt) {
      let ctx = this
      Taro.saveImageToPhotosAlbum({
        filePath: 'https://img.51jiabo.com/imgs-mall/douyin.jpg',
        success(res) {
          Taro.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000,
          })
          ctx.triggerEvent('save', {}, {})
        },
        fail(res) {
          Taro.showToast({
            title: '保存失败',
            icon: 'success',
            duration: 2000,
          })
        },
      })
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    return (
      <Modal onClose={this.close}>
        <View className="container">
          <Image
            src="https://img.51jiabo.com/imgs-mall/douyin.jpg"
            mode="aspectFit"
          ></Image>
          <Button
            className="submit normal-btn"
            onClick={this.submit}
            hoverClass="close-press"
          >
            保存到相册
          </Button>
        </View>
      </Modal>
    )
  }
}
export default _C
