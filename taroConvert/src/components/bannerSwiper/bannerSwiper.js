import withWeapp, { getTarget, cacheOptions } from '@tarojs/with-weapp'
import { Block, Swiper, SwiperItem, Image, View } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import './bannerSwiper.scss'
// components/bannerSwiper/bannerSwiper.js
let flag = true
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {
    liveData: Object,
    banner: Array,
    area_id: Number,
  },
  /**
   * 组件的初始数据
   */
  data: {
    tabUrls: [
      'pages/goodsIndex/goodsIndex',
      'pages/getTicket/getTicket',
      'pages/cloudShow/cloudShow',
      'pages/home/home',
      'pages/user/userHome',
    ],
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 判断url是否为tabbar
    isTab(url) {
      for (let item of this.data.tabUrls) {
        if (url.indexOf(item) > -1) {
          return true
        }
      }
    },
    // 运营位链接跳转
    swiperUrl(e) {
      // 友盟统计
      Taro.uma.trackEvent('click_AD', {
        cityId: Taro.getStorageSync('cityId'),
        ADID: this.data.area_id.toString(),
        src: Taro.getStorageSync('src'),
        uis: Taro.getStorageSync('uis'),
      })
      console.log('广告===》', {
        cityId: Taro.getStorageSync('cityId'),
        ADID: this.data.area_id.toString(),
        src: Taro.getStorageSync('src'),
        uis: Taro.getStorageSync('uis'),
      })
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
      } else {
        if (item.url) {
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
              appId: getTarget(e.currentTarget, Taro).dataset.item.appid,
              path: getTarget(e.currentTarget, Taro).dataset.item.url,
            })
          } else {
            Taro.navigateTo({
              url:
                '/pages/web/web?url=' +
                encodeURIComponent(
                  getTarget(e.currentTarget, Taro).dataset.item.url
                ),
            })
          }
        }
      }
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { banner } = this.data
    return banner.length > 1 ? (
      <Swiper
        className="swiper"
        indicatorDots="true"
        indicatorColor="#f3f3f3"
        indicatorActiveColor="#e6002d"
        autoplay="true"
        interval="3000"
      >
        {banner.map((item, index) => {
          return (
            <Block key={index}>
              <SwiperItem data-item={item} onClick={this.swiperUrl}>
                <Image
                  src={item.wap_image_url}
                  className="slide-image"
                  mode="scaleToFill"
                ></Image>
              </SwiperItem>
            </Block>
          )
        })}
      </Swiper>
    ) : (
      <View
        className="single-swiper"
        data-item={banner[0]}
        onClick={this.swiperUrl}
      >
        <Image
          src={banner[0].wap_image_url}
          className="slide-image"
          mode="widthFix"
        ></Image>
      </View>
    )
  }
}
export default _C
