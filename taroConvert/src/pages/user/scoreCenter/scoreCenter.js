import withWeapp, { getTarget, cacheOptions } from '@tarojs/with-weapp'
import { Block, View, ScrollView, Image, Text } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import apiService from '../../../common/http/httpService_mall.js'
import utils from '../../../utils/utils.js'
import DouyinModal from '../../../components/goodsSaveDouyinModal/goodsSaveDouyinModal'
import NormalModal from '../../../components/goodsNormalSuccessModal/goodsNormalSuccessModal'
import './scoreCenter.scss'
cacheOptions.setOptionsToCache({
  /**
   * 页面的初始数据
   */
  data: {
    score: 0,
    count: 0,
    days: [{}, {}, {}, {}, {}, {}, {}],
    modal1Visible: false,
    modal2Visible: false,
    modal3Visible: false,
    signScore: 0,
    signScoreExtra: 0,
    states: {},
    statesArray: [],
    banners: [],
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onLoad: function () {
    this.loadAdv()
  },
  onShow: function () {
    this.loadData()
  },
  loadAdv() {
    apiService('common/advertisement', 'GET', {
      name: '积分中心运营位',
      column: '积分中心',
      position: '积分任务上方',
      cityId: Taro.getStorageSync('cityId') || 1,
    }).then((rst) => {
      this.setData({
        banners: rst || [],
      })
    })
  },
  isTab(url) {
    let tabUrls = [
      'pages/goodsIndex/goodsIndex',
      'pages/getTicket/getTicket',
      'pages/home/home',
      'pages/user/userHome',
    ]
    for (let item of tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },
  toUrl(evt) {
    let url = getTarget(evt.currentTarget, Taro).dataset.url
    if (!url) return
    if (url.indexOf('http') === 0) {
      Taro.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(url),
      })
    } else {
      if (this.isTab(url)) {
        Taro.switchTab({
          url,
        })
      } else {
        Taro.navigateTo({
          url,
        })
      }
    }
  },
  loadData(noLoading) {
    apiService('member/score/total', 'GET')
      .then((rst) => {
        let score = Math.floor(rst.total)
        this.setData({
          score,
        })
      })
      .catch(() => {})
    apiService('member/score/completeness', 'GET')
      .then((rst) => {
        let obj = {}
        for (let item of rst) {
          switch (item.code) {
            case '02':
              item.icon =
                'https://img.51jiabo.com/imgs-mall/icon-scorecenter-svip.svg'
              break
            default:
              item.icon =
                'https://img.51jiabo.com/imgs-mall/icon-scorecenter-svip.svg'
              break
          }
          obj[item.code] = item
        }
        this.setData({
          statesArray: rst,
          states: obj,
        })
      })
      .catch(() => {})
    !noLoading && Taro.showLoading()
    apiService('member/score/list/by/type/days', 'GET', {
      code: '01',
      days: 7,
    })
      .then((rst) => {
        let tmp = []
        let today = utils.dateFormat(new Date(), 'YYYY/MM/DD')
        for (let i = 0; i < rst.length; i++) {
          let t = utils.dateFormat(rst[i].createTime, 'YYYY/MM/DD')
          let t1 = tmp.length
            ? utils.dateFormat(tmp[tmp.length - 1].createTime, 'YYYY/MM/DD')
            : ''
          if (today === t) {
            if (rst[i].description.indexOf('连续') > -1) {
              this.setData({
                signScoreExtra: rst[i].value,
              })
            } else {
              this.setData({
                signScore: rst[i].value,
              })
            }
          } else {
            if (rst[i].description.indexOf('连续') > -1) {
              break
            }
          }
          if (t === t1) continue
          tmp.push(rst[i])
        }
        rst = tmp
        let days = [{}, {}, {}, {}, {}, {}, {}]
        let count = 0
        let i = 0
        let t =
          (rst.length && utils.dateFormat(rst[0].createTime, 'YYYY/MM/DD')) ||
          ''
        if (rst.length > 0 && t === today) {
          // 如果当天已签到
          days[0].date = t
          i++
          count++
          this.setData({
            signed: true,
          })
          Taro.hideLoading()
        } else {
          // 没有签到
          apiService('member/score/add', 'POST', {
            scoreCode: '01',
          }).then((rst) => {
            this.setData({
              signed: true,
              signScore: rst.score,
              signScoreExtra: rst.bonus,
            })
            let yes = new Date()
            yes.setHours(yes.getHours() - 24)
            yes = utils.dateFormat(yes, 'YYYY/MM/DD')
            let yestodaySigned =
              rst.length > 1 &&
              utils.dateFormat(rst[0].createTime, 'YYYY/MM/DD') === yes
            if (yestodaySigned || !this.hasSignRecord()) {
              this.setData({
                modal1Visible: true,
              })
            } else {
              this.setData({
                modal2Visible: false,
              })
            }
            this.loadData(true)
          })
        }
        for (; i < rst.length && i < days.length; i++) {
          let ct = utils.dateFormat(rst[i].createTime, 'YYYY/MM/DD')
          let d = new Date()
          d.setHours(d.getHours() - i * 24)
          d = utils.dateFormat(d, 'YYYY/MM/DD')
          if (ct !== d) {
            break
          }
          days[i].date = d
          count++
        }
        this.setData({
          days,
          count,
        })
      })
      .catch(() => {
        Taro.hideLoading()
      })
  },
  showRule() {
    Taro.navigateTo({
      url: '/pages/scoreRule/scoreRule',
    })
  },
  showDesc(evt) {
    Taro.showModal({
      title: '积分规则',
      showCancel: false,
      content: getTarget(evt.currentTarget, Taro).dataset.desc,
      confirmText: '知道了',
    })
  },
  toDetail() {
    Taro.navigateTo({
      url: '/pages/scoreRecords/scoreRecords',
    })
  },
  hasSignRecord() {
    for (let d of this.data.days) {
      if (d.date) return true
    }
    return false
  },
  closeModal1() {
    this.setData({
      modal1Visible: false,
    })
  },
  closeModal2() {
    this.setData({
      modal2Visible: false,
    })
  },
  closeModal3() {
    this.setData({
      modal3Visible: false,
    })
  },
  signin() {
    if (this.data.signed) return
    this.setData({
      loading: true,
    })
    apiService('member/score/add', 'POST', {
      scoreCode: '01',
    })
      .then(() => {
        let yes = new Date()
        yes.setHours(yes.getHours() - 24)
        yes = utils.dateFormat(yes, 'YYYY/MM/DD')
        let yestodaySigned =
          this.data.days.length > 1 && this.data.days[0].date === yes
        if (yestodaySigned || !this.hasSignRecord()) {
          this.setData({
            modal1Visible: true,
          })
        } else {
          this.setData({
            modal2Visible: false,
          })
        }
        this.setData({
          loading: false,
        })
        this.setData({
          signed: true,
        })
      })
      .catch(() => {
        this.setData({
          loading: false,
        })
      })
  },
  doTask(evt) {
    let code = getTarget(evt.currentTarget, Taro).dataset.code
    if (this.data.states[code].completed) {
      return
    }
    switch (code) {
      // 完善用户信息
      case '02':
        Taro.navigateTo({
          url: '/pages/userCenter/userCenter',
        })
        break
      // 关注公众号
      case '03':
        break
      // 领取优惠券
      case '04':
        Taro.navigateTo({
          url: '/pages/couponList/couponList',
        })
        break
      // 预约爆品
      case '05':
        Taro.navigateTo({
          url: '/pages/hotGoodsOrder/index/index',
        })
        break
      // 购买SVIP
      case '06':
        Taro.switchTab({
          url: '/pages/home/home',
        })
        break
      // 关注抖音号
      case '07':
        this.setData({
          modal3Visible: true,
        })
        break
      // 到场
      case '08':
        Taro.switchTab({
          url: '/pages/getTicket/getTicket',
        })
        break
      // 下单
      case '09':
        break
      // 邀友到场
      case '10':
        break
      // 邀友下单
      case '11':
        break
      // SVIP裂变
      case '12':
        break
      // 裂变分享门票
      case '13':
        break
      // 裂变分享优惠券
      case '14':
        Taro.navigateTo({
          url: '/pages/couponList/couponList',
        })
        break
      // 裂变分享爆品
      case '15':
        Taro.navigateTo({
          url: '/pages/hotGoodsOrder/index/index',
        })
        break
    }
  },
  douyinSave() {
    this.setData({
      modal3Visible: false,
    })
    Taro.showLoading()
    apiService('member/score/add', 'POST', {
      scoreCode: '07',
    })
      .then(() => {
        this.data.states['07'].completed = true
        this.setData({
          states: this.data.states,
        })
        Taro.hideLoading()
      })
      .catch(() => {
        Taro.hideLoading()
      })
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const {
      score,
      count,
      days,
      signScore,
      signScoreExtra,
      banners,
      signed,
      statesArray,
      states,
      modal1Visible,
      modal2Visible,
      modal3Visible,
    } = this.data
    return (
      <Block>
        <View className="page">
          <ScrollView className="page" scrollY={true}>
            <View className="head">
              <View className="score">
                <Image
                  mode="aspectFill"
                  src="https://img.51jiabo.com/imgs-mall/score-white.svg"
                ></Image>
                <View>{score}</View>
                <View>积分</View>
              </View>
              <View className="links">
                <View className="link" onClick={this.toDetail}>
                  <View>积分明细</View>
                  <View>‣</View>
                </View>
              </View>
              <View className="rules normal-btn" onClick={this.showRule}>
                <Image
                  src="https://img.51jiabo.com/imgs-mall/info.svg"
                  mode="aspectFill"
                ></Image>
                <View>规则说明</View>
              </View>
              <View className="records">
                <View className="state">{'已连续签到' + count + '天'}</View>
                <View className="items">
                  {days.map((item, index) => {
                    return (
                      <View className={'item ' + (item.date ? 'active' : '')}>
                        <Image
                          src="https://img.51jiabo.com/imgs-mall/checked-light.svg"
                          mode="aspectFill"
                        ></Image>
                        <Text>{index + 1}</Text>
                      </View>
                    )
                  })}
                </View>
                <View className="tip">
                  {'今日签到获取' + (signScore + signScoreExtra) + '积分'}
                </View>
              </View>
            </View>
            <View className="tasks">
              {banners?.length > 0 && (
                <View>
                  {banners?.map((item, index) => {
                    return (
                      <Image
                        key={item.item}
                        src={banners?.[index]?.imageUrls}
                        onClick={this.toUrl}
                        data-url={banners?.[index]?.linkUrls}
                        mode="widthFix"
                      ></Image>
                    )
                  })}
                </View>
              )}
              <View className="title">积分任务</View>
              <View className="task-item">
                <Image
                  src="https://img.51jiabo.com/imgs-mall/scorecenter/icon-scorecenter-01.svg"
                  mode="aspectFill"
                ></Image>
                <View className="info">
                  <View>
                    签到任务
                    <View
                      className="question-btn"
                      onClick={this.showDesc}
                      data-desc="每日签到领积分，连续7天签到更有积分奖励"
                    >
                      ?
                    </View>
                  </View>
                  <View>
                    <View className="desc">今日获得</View>
                    <View className="tag">
                      {'+' + (signed ? signScore + signScoreExtra : 0) + '积分'}
                    </View>
                  </View>
                </View>
                <View
                  className={'state-btn ' + (signed ? 'disabled' : '')}
                  onClick={this.signin}
                >
                  {signed ? '已完成' : '领积分'}
                </View>
              </View>
              {statesArray?.map((item, index) => {
                return (
                  <Block>
                    {item.code !== '01' && (
                      <View className="task-item">
                        <Image
                          src={
                            'https://img.51jiabo.com/imgs-mall/scorecenter/icon-scorecenter-' +
                            item.code +
                            '.svg'
                          }
                          mode="aspectFill"
                        ></Image>
                        <View className="info">
                          <View>
                            {states[item.code].name}
                            <View
                              className="question-btn"
                              onClick={this.showDesc}
                              data-desc={states[item.code].description}
                            >
                              ?
                            </View>
                          </View>
                          <View>
                            <View className="desc">
                              {states[item.code].description}
                              <View className="tag">
                                {'+' + (states[item.code].value || '') + '积分'}
                              </View>
                            </View>
                          </View>
                        </View>
                        <View
                          className={
                            'state-btn ' +
                            (states[item.code].completed ? 'disabled' : '')
                          }
                          data-code={states[item.code].code}
                          onClick={this.doTask}
                        >
                          {states[item.code].completed ? '已完成' : '领积分'}
                        </View>
                      </View>
                    )}
                  </Block>
                )
              })}
            </View>
          </ScrollView>
        </View>
        {modal1Visible && (
          <NormalModal
            title="签到成功"
            content={
              '恭喜您获得' +
              signScore +
              '积分' +
              (signScoreExtra ? ', 并额外获得' + signScoreExtra + '积分' : '')
            }
            onClose={this.closeModal1}
          ></NormalModal>
        )}
        {modal2Visible && (
          <NormalModal
            title="签到成功"
            content="您漏签了，已开始新的签到周期"
            onClose={this.closeModal2}
          ></NormalModal>
        )}
        {modal3Visible && (
          <DouyinModal
            onClose={this.closeModal3}
            onSave={this.douyinSave}
          ></DouyinModal>
        )}
      </Block>
    )
  }
}
export default _C
