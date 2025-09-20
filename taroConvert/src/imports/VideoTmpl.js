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
class VideoTmpl extends React.Component {
  render() {
    const {
      data: { module_json, index, item },
      onVideoPlay,
    } = this.props
    return (
      <Block>
        <View className="video-wrap">
          <Swiper
            className="video-swp"
            indicatorDots="true"
            indicatorActiveColor="#E6002D"
            indicatorColor="#F3F3F3"
            circular="true"
            style={{
              height: '10rem',
            }}
          >
            {module_json.videoList.map((item, index) => {
              return (
                <SwiperItem key={index}>
                  <Video
                    id={'video' + index}
                    className="video-item"
                    src={item.videoUrl}
                    onPlay={onVideoPlay}
                    data-id={'video' + index}
                  ></Video>
                </SwiperItem>
              )
            })}
          </Swiper>
        </View>
      </Block>
    )
  }
}
export default VideoTmpl
