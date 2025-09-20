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
class MggTmpl extends React.Component {
  render() {
    const {
      data: { module_json, index, curTab, item, mggCurList },
      toMggList,
      toggleMggTab,
      toMggDetail,
    } = this.props
    return (
      <Block>
        <View className="mgg-wrap">
          <View className="mgg-more">
            <Image
              mode="widthFix"
              src={module_json.activity_background}
              onClick={toMggList}
            ></Image>
            <View className="mgg-main">
              {module_json.mggActConfig.length > 1 && (
                <View className="mgg-tab-box">
                  {module_json.mggActConfig.map((item, index) => {
                    return (
                      <View
                        key={index}
                        className={
                          'mgg-tab ' + (index === curTab && 'mgg-tab-act')
                        }
                        style={{
                          width: `${
                            module_json.mggActConfig.length == 2 ? '9rem' : ''
                          }`,
                        }}
                        data-item={item}
                        data-index={index}
                        onClick={toggleMggTab}
                      >
                        {item.level_content}
                      </View>
                    )
                  })}
                  {module_json.mggActConfig.length == 3 && (
                    <Block>
                      {!(curTab != 2) && <View className="mgg-line1"></View>}
                      {!(curTab != 0) && <View className="mgg-line2"></View>}
                    </Block>
                  )}
                </View>
              )}
              {module_json.mggActConfig[0].goodsList.length && (
                <View className="mgg-list">
                  {(mggCurList || module_json.mggActConfig[0].goodsList).map(
                    (item, index) => {
                      return (
                        <View
                          key={index}
                          className="mgg-item"
                          onClick={toMggDetail}
                          data-id={item.prerogative_id}
                        >
                          <Image
                            className="mgg-icon"
                            src="https://img.51jiabo.com/5542dd4a-328c-4e22-b3cb-ea07c4ae9b28.png"
                          ></Image>
                          <Image src={item.image_url}></Image>
                          {module_json.is_card_price == 1 && (
                            <Block>
                              {item.pay_way == 1 ? (
                                <View className="mgg-price">
                                  {'￥' + item.earnest}
                                </View>
                              ) : (
                                item.pay_way == 2 && (
                                  <View className="mgg-price">
                                    {'￥' + item.activity_price}
                                  </View>
                                )
                              )}
                            </Block>
                          )}
                        </View>
                      )
                    }
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Block>
    )
  }
}
export default MggTmpl
