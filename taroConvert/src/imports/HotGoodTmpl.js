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
@withWeapp({})
class HotGoodTmpl extends React.Component {
  render() {
    const {
      data: { module_json, index, item },
      toHotGoodsList,
      toHotGoodsDetail,
      reverseBtn,
    } = this.props
    return (
      <Block>
        <View className="hot-yy group-wrap">
          <View className="group-header">
            <View className="group-tit">爆品预约</View>
            <View className="group-more" onClick={toHotGoodsList}>
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
          <View className="hot-yy-list">
            {module_json.hotGoodsList.map((item, index) => {
              return (
                <View
                  key={index}
                  className="hot-yy-item"
                  onClick={toHotGoodsDetail}
                  data-id={item.detail_id}
                >
                  <Image
                    src={item.image_url}
                    style={{
                      height: '4.375rem',
                    }}
                  ></Image>
                  <View className="hot-yy-desc">
                    {item.goods_name + ' | ' + item.goods_descr}
                  </View>
                  <View className="hot-yy-btm">
                    <View className="hot-yy-del-price">
                      {'市场价：' + item.market_price + '元'}
                    </View>
                    <View className="hot-yy-price">
                      <Text>家博抢购价：</Text>
                      <Text
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          marginRight: '0.125rem',
                        }}
                      >
                        {item.special_price}
                      </Text>
                      <Text
                        style={{
                          color: '#666',
                        }}
                      >
                        {item.price_unit}
                      </Text>
                    </View>
                    {item.is_get == 0 ? (
                      <Block>
                        {item.goods_stock <= 0 ? (
                          <View className="hot-yy-btn hot-yy-btn-gray">
                            已约满
                          </View>
                        ) : (
                          <View
                            className="hot-yy-btn"
                            onClick={reverseBtn}
                            data-item={item}
                          >
                            抢先预约
                          </View>
                        )}
                      </Block>
                    ) : (
                      <View className="hot-yy-btn hot-yy-btn-gray">已预约</View>
                    )}
                    <View className="hot-yy-rest">
                      {'剩余' + item.goods_stock + '件'}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      </Block>
    )
  }
}
export default HotGoodTmpl
