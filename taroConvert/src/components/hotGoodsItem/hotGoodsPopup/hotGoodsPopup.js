import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Image, Text, Button } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
// components/hotGoodsItem/hotGoodsPopup/hotGoodsPopup.js
import { marketing } from '../../../common/api/marketingApi.js'
import XmbPopup from '../../xmbPopup/xmbPopup'
import './hotGoodsPopup.scss'
let marketingApi = new marketing()
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {
    hotGoodsItem: Object,
    shareData: Object,
  },
  /**
   * 组件的初始数据
   */
  data: {},
  /**
   * 在组件实例进入页面节点树时执行
   */
  attached() {
    this.setData({
      marketPrice: Number(this.data.hotGoodsItem.market_price),
      specialPrice: Number(this.data.hotGoodsItem.special_price),
      stock: Number(this.data.hotGoodsItem.goods_stock) - 1,
      activityInfo: Taro.getStorageSync('activityInfo'),
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onClose() {
      this.triggerEvent('closeReserve')
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const {
      activityInfo,
      hotGoodsItem,
      marketPrice,
      specialPrice,
      stock,
      shareData,
      showXmbTips,
      xmbPopupData,
    } = this.data
    return (
      <Block>
        <View className="order-popup">
          <View className="order-box">
            <View className="txt-box">
              <View className="tit1">预约成功</View>
              <View className="tit2">
                {activityInfo?.begin_date +
                  '-' +
                  activityInfo?.end_date +
                  '前往' +
                  activityInfo?.venue_name +
                  '下单使用'}
              </View>
            </View>
            <View className="order-top">
              <Image className="goods-img" src={hotGoodsItem.image_url}></Image>
              <View className="title">{hotGoodsItem.goods_name}</View>
              <View className="detail">
                <View className="left">
                  <View className="market-price">
                    {'市场价：' + marketPrice + '元'}
                  </View>
                  <View className="unit">
                    <Text className="text">家博抢购价：</Text>
                    {specialPrice}
                    <View className="lab">{hotGoodsItem.price_unit}</View>
                  </View>
                </View>
                <View className="sy">{'剩余' + stock + '件'}</View>
              </View>
            </View>
            {/*  <view class='tips'>分享好友预约爆品，好友预约成功后，赠送您
            
                  <text class='tips-txt'>10元</text>奖励金，可在我的-奖励金页面查看详细活动规则</view>  */}
            <Button
              openType="share"
              data-sharedata={shareData}
              className="share"
            >
              赠送好友爆品，一起逛展
            </Button>
            <View className="close" onClick={this.onClose}></View>
          </View>
        </View>
        {/*  熊猫币顶部提示  */}
        <XmbPopup
          showXmbTips={showXmbTips}
          xmbPopupData={xmbPopupData}
        ></XmbPopup>
      </Block>
    )
  }
}
export default _C
