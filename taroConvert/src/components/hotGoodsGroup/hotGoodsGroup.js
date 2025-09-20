import withWeapp, { getTarget, cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Image } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import './hotGoodsGroup.scss'
// components/hotGoodsGroup/hotGoodsGroup.js
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {
    groupItem: Object,
  },
  /**
   * 组件的初始数据
   */
  data: {},
  /**
   * 组件的方法列表
   */
  methods: {
    toGroupList(e) {
      let id = getTarget(e.currentTarget, Taro).dataset.groupid
      Taro.navigateTo({
        url: '/pages/expoPackage/hotGoodsGroup/hotGoodsGroup?groupId=' + id,
      })
    },
    toHotGoodsDetail(e) {
      let item = getTarget(e.currentTarget, Taro).dataset.item
      Taro.navigateTo({
        url: '/pages/hotGoodsOrder/detail/detail?detail_id=' + item.detail_id,
      })
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { groupItem } = this.data
    return (
      <View className="hot-goods-group">
        <Image
          className="group-bg"
          mode="widthFix"
          data-groupid={groupItem.group_info.goods_group_id}
          onClick={this.toGroupList}
          src={groupItem.group_info.background_image}
        ></Image>
        <View className="group-box">
          {groupItem.goods_info.map((item, index) => {
            return (
              <Block>
                {index < 4 && (
                  <Image
                    className="group-item"
                    key={index}
                    data-item={item}
                    onClick={this.toHotGoodsDetail}
                    src={item.image_url}
                  ></Image>
                )}
              </Block>
            )
          })}
        </View>
      </View>
    )
  }
}
export default _C
