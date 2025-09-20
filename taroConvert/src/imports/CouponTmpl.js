import {
  Block,
  View,
  Image,
  ScrollView,
  Text,
  Button,
  Swiper,
  SwiperItem,
  Video,
} from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import fn from '../pages/goodsIndex/template/floorTemplate.wxml/wxs__fn.js'
@withWeapp({})
class CouponTmpl extends React.Component {
  render() {
    const {
      data: { module_json, index, item },
      toCouponList,
      toCouponDetail,
      getCoupon,
    } = this.props
    return (
      <Block>
        <View className="group-wrap">
          <View className="group-header">
            <View className="group-tit">优惠券</View>
            <View className="group-more" onClick={toCouponList}>
              <View>查看更多</View>
              <Image
                style={{
                  width: '0.225rem',
                  height: '0.3rem',
                  marginLeft: '0.125rem',
                }}
                src="/imgs/rightArrow.png"
              ></Image>
            </View>
          </View>
          <View className="coupon-list">
            {module_json.couponList.map((item, index) => {
              return (
                <View
                  key={index}
                  className="coupon-item"
                  onClick={toCouponDetail}
                  data-id={item.coupon_id}
                >
                  <View className="cp-item-header">
                    <Image className="cp-item-logo" src={item.logo_url}></Image>
                    <View className="cp-item-name">
                      {fn.textNum(item.brand_name)}
                    </View>
                  </View>
                  <View className="cp-price">
                    ￥
                    <Text
                      style={{
                        fontSize: '1.2rem',
                      }}
                    >
                      {item.coupon_value}
                    </Text>
                  </View>
                  <View className="cp-price-tips">
                    {'满' + item.consume_amount + '元可用'}
                  </View>
                  {item.can_get == 1 ? (
                    <View
                      className="coupon-btn"
                      data-item={item}
                      onClick={getCoupon}
                    >
                      免费领取
                    </View>
                  ) : (
                    <View className="coupon-btn coupon-btn-dis">
                      {item.button}
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </View>
      </Block>
    )
  }
}
export default CouponTmpl
