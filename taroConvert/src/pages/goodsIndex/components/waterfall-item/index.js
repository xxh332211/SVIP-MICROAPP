import withWeapp, { getTarget, cacheOptions } from '@tarojs/with-weapp'
import {
  Block,
  View,
  Image,
  Text,
  Swiper,
  SwiperItem,
} from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
// components/waterfall-item/waterfall-item.js
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome',
]
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Object,
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
    // 跳转商品详情页
    toGoodsDetail(e) {
      let item = getTarget(e.currentTarget, Taro).dataset.item
      let type = 1
      if (item.is_add_activity == 1) {
        // 秒光光
        type = 2
      }
      Taro.navigateTo({
        url: `/pages-abs/pages/productDetails/productDetails?Entrance=${type}&id=${item.prerogative_goods_id}&src=YYXCX&uis=商城&from=btmGoodsDetail`,
      })
    },
    // 判断url是否为tabbar
    isTab(url) {
      for (let item of tabUrls) {
        if (url.indexOf(item) > -1) {
          return true
        }
      }
    },
    //运营位链接跳转
    swiperUrl(e) {
      console.log(e)
      let item = getTarget(e.currentTarget, Taro).dataset.item
      let type = getTarget(e.currentTarget, Taro).dataset.item.type
      var url = getTarget(e.currentTarget, Taro).dataset.item.url
      if (item.is_jump_live_broadcast == 1) {
        //跳转直播间
        if (flag) {
          flag = false
          if (Taro.openChannelsLive) {
            Taro.openChannelsLive({
              finderUserName: 'sphTgeTCjc7M4Ri',
              feedId: this.data.liveData?.feedId,
              nonceId: this.data.liveData?.nonceId,
              complete(res) {
                setTimeout(() => {
                  flag = true
                }, 100)
              },
            })
          } else {
            Taro.showModal({
              title: '提示',
              content:
                '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
            })
          }
        }
      } else if (url) {
        //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
        if (type == 1) {
          if (this.isTab(url)) {
            Taro.switchTab({
              url,
            })
          } else {
            Taro.navigateTo({
              url,
            })
          }
        } else if (type == 2) {
          Taro.navigateToMiniProgram({
            appId: item.appid,
            path: url,
          })
        } else {
          Taro.navigateTo({
            url: '/pages/web/web?url=' + encodeURIComponent(item.url),
          })
        }
      }
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { itemData } = this.data
    return (
      <View
        className="w-item"
        onClick={this.toGoodsDetail}
        data-item={itemData}
      >
        {itemData.kind == 1 ? (
          <Block>
            <View className="w-image-box">
              <Image
                mode="widthFix"
                src={itemData.image_url}
                className="w-image"
              ></Image>
              {itemData.is_add_activity == 1 && (
                <Image
                  className="mgg-icon"
                  src="https://img.51jiabo.com/5542dd4a-328c-4e22-b3cb-ea07c4ae9b28.png"
                ></Image>
              )}
            </View>
            <View className="w-main">
              {/*  线上  */}
              {itemData.is_add_activity == 0 ? (
                <Block>
                  {itemData.pay_way == 2 ? (
                    <Block>
                      <View className="w-text">
                        {itemData.prerogative_name}
                      </View>
                      <View className="w-price">
                        <Text>优惠价:</Text>
                        <Text className="w-price-num">￥</Text>
                        <Text
                          className="w-price-num"
                          style={{
                            fontSize: '1rem',
                          }}
                        >
                          {itemData.exclusive_price}
                        </Text>
                      </View>
                      <View className="w-price-del">
                        {'￥' + itemData.market_price}
                      </View>
                    </Block>
                  ) : (
                    itemData.pay_way == 1 && (
                      <Block>
                        <View className="w-text">
                          {itemData.prerogative_name}
                        </View>
                        <View className="w-price">
                          <Text>订金:</Text>
                          <Text className="w-price-num">￥</Text>
                          <Text
                            className="w-price-num"
                            style={{
                              fontSize: '1rem',
                            }}
                          >
                            {itemData.earnest}
                          </Text>
                        </View>
                        <View
                          className="w-price-del"
                          style={{
                            textDecoration: 'none',
                          }}
                        >
                          {'优惠价:￥' + itemData.exclusive_price}
                        </View>
                      </Block>
                    )
                  )}
                  {/*  订金  */}
                </Block>
              ) : (
                itemData.is_add_activity == 1 && (
                  <Block>
                    {itemData.pay_way == 2 ? (
                      <Block>
                        <View className="w-text">
                          {itemData.prerogative_name}
                        </View>
                        <View className="w-price">
                          <Text>秒光价:</Text>
                          <Text className="w-price-num">￥</Text>
                          <Text
                            className="w-price-num"
                            style={{
                              fontSize: '1rem',
                            }}
                          >
                            {itemData.activity_price}
                          </Text>
                        </View>
                        <View className="w-price-del">
                          {'￥' + itemData.market_price}
                        </View>
                      </Block>
                    ) : (
                      itemData.pay_way == 1 && (
                        <Block>
                          <View className="w-text">
                            {itemData.prerogative_name}
                          </View>
                          <View className="w-price">
                            <Text>订金:</Text>
                            <Text className="w-price-num">￥</Text>
                            <Text
                              className="w-price-num"
                              style={{
                                fontSize: '1rem',
                              }}
                            >
                              {itemData.mgg_is_openprice == 1
                                ? itemData.mgg_define_price
                                : itemData.earnest}
                            </Text>
                          </View>
                          <View
                            className="w-price-del"
                            style={{
                              textDecoration: 'none',
                            }}
                          >
                            {'秒光价:￥' + itemData.activity_price}
                          </View>
                        </Block>
                      )
                    )}
                    {/*  订金  */}
                  </Block>
                )
              )}
              {/*  秒光光  */}
            </View>
          </Block>
        ) : (
          itemData.kind == 2 && (
            <Block>
              {itemData.adv.length > 1 ? (
                <Swiper
                  style={{
                    height: '14rem',
                  }}
                  indicatorDots="true"
                  indicatorActiveColor="#E6002D"
                  indicatorColor="#F3F3F3"
                  circular="true"
                  autoplay="true"
                >
                  {itemData.adv.map((item, index) => {
                    return (
                      <SwiperItem
                        key={index}
                        onClick={this.swiperUrl}
                        data-item={item}
                      >
                        <Image
                          style={{
                            height: '14rem',
                          }}
                          mode="scaleToFill"
                          src={item.wap_image_url}
                          className="w-image"
                        ></Image>
                      </SwiperItem>
                    )
                  })}
                </Swiper>
              ) : (
                <View>
                  <Image
                    style={{
                      height: '14rem',
                    }}
                    onClick={this.swiperUrl}
                    data-item={itemData.adv[0]}
                    mode="scaleToFill"
                    src={itemData.adv[0].wap_image_url}
                    className="w-image"
                  ></Image>
                </View>
              )}
            </Block>
          )
        )}
        {/*  运营位  */}
      </View>
    )
  }
}
export default _C
