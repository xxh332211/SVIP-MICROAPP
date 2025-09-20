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
class BannerTmpl extends React.Component {
  render() {
    const {
      data: { module_json, index, item },
      swiperUrl,
    } = this.props
    return (
      <Block>
        {module_json.imageList.length > 1 ? (
          <Swiper
            className="banner"
            style={{
              height: `${module_json.imageHeight / 40}rem`,
            }}
            indicatorActiveColor="#E6002D"
            indicatorColor="#F3F3F3"
            indicatorDots="true"
            autoplay="true"
            circular="true"
          >
            {module_json.imageList.map((item, index) => {
              return (
                <SwiperItem key={index}>
                  <Image
                    style={{
                      width: '100%',
                      minHeight: '100%',
                    }}
                    src={item.imageUrl}
                    onClick={swiperUrl}
                    data-item={item}
                  ></Image>
                </SwiperItem>
              )
            })}
          </Swiper>
        ) : (
          <View className="banner">
            <Image
              mode="widthFix"
              src={module_json.imageList[0].imageUrl}
              onClick={swiperUrl}
              data-item={module_json.imageList[0]}
            ></Image>
          </View>
        )}
      </Block>
    )
  }
}
export default BannerTmpl
