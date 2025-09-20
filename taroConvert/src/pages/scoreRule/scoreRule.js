import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, ScrollView, View, Text } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import './scoreRule.scss'
cacheOptions.setOptionsToCache({
  /**
   * 页面的初始数据
   */
  data: {
    cityId: null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      cityId: Taro.getStorageSync('cityId'),
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { cityId } = this.data
    return (
      <ScrollView scrollY={true}>
        <View className="title">积分可以用来做什么？</View>
        <View className="cont">
          <Text>积分可以用来兑换商品</Text>
          <Text>兑换规则：积分使用上限不超过单个订单支付金额的40%</Text>
        </View>
        <View className="title">我要怎么获取积分呢？</View>
        <View className="cont">
          <Text>通过做任务、参与积分活动赚取积分，任务完成即可得积分</Text>
          <Text>
            注：当用户将已产生的互动行为自行取消后，相应的积分也将被扣除
          </Text>
        </View>
        <View className="title">其他注意事项：</View>
        <View className="cont">
          {cityId == 60 ? (
            <Text>
              积分不可转让、售卖、赠送。如发现有作弊行为，宁波装修狂欢节有权直接取消相关资格。
            </Text>
          ) : (
            <Text>
              积分不可转让、售卖、赠送。如发现有作弊行为，华夏家博会有权直接取消相关资格，本活动最终解释权归华夏家博会所有。
            </Text>
          )}
        </View>
      </ScrollView>
    )
  }
}
export default _C
