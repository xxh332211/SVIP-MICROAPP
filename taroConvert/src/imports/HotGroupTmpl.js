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
class HotGroupTmpl extends React.Component {
  render() {
    const {
      data: { module_json, index, item },
      toHotGroupList,
      toHotGoodsDetail,
    } = this.props
    return (
      <Block>
        <View
          className="hot-group"
          style={{
            height: `${module_json.background_image ? '' : '11.75rem'}`,
          }}
          onClick={toHotGroupList}
        >
          <Image mode="widthFix" src={module_json.background_image}></Image>
          <View className="hot-group-list">
            {module_json.goodsList.map((item, index) => {
              return (
                <Image
                  key={index}
                  className="hot-group-goods"
                  src={item.image_url}
                  onClick={toHotGoodsDetail}
                  data-id={item.detail_id}
                ></Image>
              )
            })}
          </View>
        </View>
      </Block>
    )
  }
}
export default HotGroupTmpl
