import withWeapp, { getTarget, cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Image, ScrollView, Text } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import apiService from '../../common/http/httpService_mall.js'
import utils from '../../utils/utils.js'
import './scoreRecords.scss'
cacheOptions.setOptionsToCache({
  /**
   * 页面的初始数据
   */
  data: {
    score: 238,
    earned: 0,
    spent: 0,
    cur: 0,
    pagination: {
      pageSize: 20,
      pageIndex: 1,
      totalCount: 0,
    },
    list: [],
    loading: false,
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
    apiService('member/score/total', 'GET').then((rst) => {
      this.setData({
        score: rst.total,
        spent: Math.abs(rst.spent),
        earned: rst.earned,
      })
    })
    this.data.pagination.totalCount = 0
    this.setData({
      list: [],
    })
    this.loadData(1)
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
  loadMore() {
    if (this.data.loading) {
      return
    }
    this.loadData(this.data.pagination.pageIndex + 1)
  },
  loadData(pageIndex) {
    let index = +pageIndex || 1
    if (
      this.data.pagination.totalCount > 0 &&
      this.data.list.length >= this.data.pagination.totalCount
    ) {
      return
    }
    Taro.showLoading()
    this.setData({
      loading: true,
    })
    apiService('member/score/list', 'GET', {
      pageSize: this.data.pagination.pageSize,
      pageIndex: index,
      income: this.data.cur ? false : true,
    })
      .then((rst) => {
        for (let item of rst.items) {
          item.createTime = utils.dateFormat(item.createTime, 'YYYY/MM/DD')
        }
        if (index === 1) {
          this.setData({
            list: rst.items || [],
          })
        } else {
          this.setData({
            list: [...this.data.list, ...rst.items],
          })
        }
        this.setData({
          pagination: rst.pagination,
        })
        this.setData({
          list: this.data.list,
          loading: false,
        })
        Taro.hideLoading()
      })
      .catch(() => {
        Taro.hideLoading()
        this.setData({
          loading: false,
        })
      })
  },
  switchType(evt) {
    let e = getTarget(evt.currentTarget, Taro).dataset.id
    if (e !== this.data.cur) {
      this.setData({
        cur: e,
      })
      this.data.pagination.totalCount = 0
      this.setData({
        list: [],
      })
      this.loadData(1)
    }
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { score, cur, earned, spent, loading, list } = this.data
    return (
      <View className="page">
        <View className="head">
          <View className="score">
            <Image
              mode="aspectFill"
              src="https://img.51jiabo.com/imgs-mall/icon-score-black.svg"
            ></Image>
            <View>{score}</View>
            <View>积分</View>
          </View>
          <View className="links">
            <View
              className={'link ' + (cur === 0 ? 'active' : '')}
              onClick={this.switchType}
              data-id={0}
            >
              <View>收入</View>
              <View>{earned}</View>
            </View>
            <View
              className={'link ' + (cur === 1 ? 'active' : '')}
              onClick={this.switchType}
              data-id={1}
            >
              <View>支出</View>
              <View>{spent}</View>
            </View>
          </View>
        </View>
        <View className="gap"></View>
        <View className="cont">
          <ScrollView scrollY={true} onScrollToLower={this.loadMore}>
            {!loading && list?.length === 0 && (
              <View className="no-data">
                <Image
                  src={require('../../imgs/empty.png')}
                  mode="aspectFill"
                ></Image>
                <Text>暂无相关记录</Text>
              </View>
            )}
            {list?.map((item, index) => {
              return (
                <View className="record-item" key={item.id} data-id={item.id}>
                  <View className="info">
                    <View className="name">{item.description}</View>
                    <View className="date">{item.createTime}</View>
                  </View>
                  <View className="count">
                    {item.value > 0 ? '+' + item.value : item.value}
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </View>
      </View>
    )
  }
}
export default _C
