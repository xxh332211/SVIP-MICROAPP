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
class ActNavTmpl extends React.Component {
  render() {
    const {
      data: { module_json, index, item },
      swiperUrl,
    } = this.props
    return (
      <Block>
        <View className="act-nav">
          {module_json.navList.map((item, index) => {
            return (
              <View
                key={index}
                className={
                  'act-nav-five ' +
                  (module_json.navList.length == 4
                    ? 'act-nav-four'
                    : 'act-nav-five')
                }
                onClick={swiperUrl}
                data-item={item}
              >
                <Image
                  className={
                    'act-nav-img ' +
                    (module_json.navList.length == 4
                      ? 'act-nav-img-four'
                      : 'act-nav-img-five')
                  }
                  src={item.imageUrl}
                ></Image>
                <View className="act-nav-tit">{item.navName}</View>
              </View>
            )
          })}
        </View>
      </Block>
    )
  }
}
export default ActNavTmpl
