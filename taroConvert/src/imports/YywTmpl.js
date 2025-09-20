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
class YywTmpl extends React.Component {
  render() {
    const {
      data: { module_json, index, item },
      swiperUrl,
    } = this.props
    return (
      <Block>
        {module_json.displayType == 2 ? (
          <View className="yyw-wrap">
            {module_json.imageList.map((item, index) => {
              return (
                <Image
                  key={index}
                  className={
                    'yyw-item ' +
                    (module_json.imageList.length == 1
                      ? 'yyw-one'
                      : module_json.imageList.length == 2
                      ? 'yyw-two'
                      : module_json.imageList.length == 3
                      ? 'yyw-three'
                      : 'yyw-four')
                  }
                  src={item.imageUrl}
                  onClick={swiperUrl}
                  data-item={item}
                ></Image>
              )
            })}
          </View>
        ) : (
          <View className="yyw-wrap-vert">
            {module_json.imageList.map((item, index) => {
              return (
                <Image
                  key={index}
                  className="yyw-item yyw-one"
                  mode="widthFix"
                  src={item.imageUrl}
                  onClick={swiperUrl}
                  data-item={item}
                ></Image>
              )
            })}
          </View>
        )}
      </Block>
    )
  }
}
export default YywTmpl
