import withWeapp, { getTarget, cacheOptions } from '@tarojs/with-weapp'
import {
  Block,
  View,
  Image,
  Text,
  Swiper,
  SwiperItem,
  Button,
  Canvas,
} from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
// pages/cloudShow/cloudShow.js
import { config } from '../../common/config/config.js'
import { svip } from '../../common/api/svipApi.js'
let SvipApi = new svip()
import { marketing } from '../../common/api/marketingApi.js'
let marketingApi = new marketing()
import { util } from '../../common/util.js'
import cryptoJs from '../../utils/crypto.js'
import OnlineServe from '../../components/onlineServe/onlineServe'
import CouponPopup from '../../components/couponPopup/couponPopup'
import CouponBtn from '../../components/couponBtn/couponBtn'
import Authorize from '../../components/authorize/authorize'
import './cloudShow.scss'
const app = Taro.getApp()
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome',
]
cacheOptions.setOptionsToCache({
  /**
   * 页面的初始数据
   */
  data: {
    stop: Function,
    countDown: Function,
    // reserveAdv:[{wap_image_url:"https://img.51jiabo.com/558548c1-2cee-4db4-8686-964aecfdd8c7.png"},{wap_image_url:"https://img.51jiabo.com/558548c1-2cee-4db4-8686-964aecfdd8c7.png"},{wap_image_url:"https://img.51jiabo.com/558548c1-2cee-4db4-8686-964aecfdd8c7.png"}]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.scene) {
      let arr = decodeURIComponent(options.scene).split('&')
      Taro.setStorageSync('cloudInviteMobile', arr[0])
      Taro.setStorageSync('inviteLiveCityId', arr[1])
    }
    if (options.cloudInviteMobile) {
      Taro.setStorageSync('inviteLiveCityId', options.inviteLiveCityId)
      Taro.setStorageSync('cloudInviteMobile', options.cloudInviteMobile)
    }

    // 推广链接带参 cityId src uis plan unit
    if (options.userCityId) {
      Taro.setStorageSync('cityId', options.userCityId)
    }
    if (options.src) {
      Taro.setStorageSync('src', options.src)
    }
    if (options.uis) {
      Taro.setStorageSync('uis', options.uis)
    }
    if (options.plan) {
      Taro.setStorageSync('plan', options.plan)
    }
    if (options.unit) {
      Taro.setStorageSync('unit', options.unit)
    }
    //广告投放参数
    if (options.gdt_vid) {
      Taro.setStorageSync('gdt_vid', options.gdt_vid)
    }
    if (options.weixinadinfo) {
      Taro.setStorageSync('weixinadinfo', options.weixinadinfo)
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let cityId = Taro.getStorageSync('cityId')
    this.setData({
      isLogin: Taro.getStorageSync('isLogin'),
      offLine: false,
      pageOnload: false,
      baseUrl: config.url,
      days: '0',
      hours: '0',
      minute: '0',
      second: '0',
      cityId,
    })
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
      })
      let text = 'list[1].text'
      if (cityId == 60) {
        this.getTabBar().setData({
          [text]: '装修狂欢节',
        })
      } else {
        this.getTabBar().setData({
          [text]: '家博会',
        })
      }
    }

    //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
    if (!cityId && Taro.getStorageSync('isLocation')) {
      Taro.navigateTo({
        url: '/pages/address/index?src=cloudShow',
      })
    } else if (cityId) {
      //云逛展基础信息
      this.getInfo()
    } else {
      //定位
      util.getPositionCity('cloudShow', () => {
        this.setData({
          curUserCityText: Taro.getStorageSync('curUserCityText'),
        })
        //定位成功请求数据
        this.getInfo()
      })
    }
  },
  //云逛展基础信息
  getInfo(detail) {
    let that = this
    let cityId = Taro.getStorageSync('cityId')
    if (
      cityId == 1 ||
      cityId == 2 ||
      cityId == 3 ||
      cityId == 6 ||
      cityId == 7 ||
      cityId == 8 ||
      cityId == 14 ||
      cityId == 15 ||
      cityId == 17 ||
      cityId == 19 ||
      cityId == 23 ||
      cityId == 54
    ) {
      Taro.reLaunch({
        url: '/pages/mgg/mgg',
      })
      return
    }
    Taro.showLoading({
      title: '加载中...',
      mask: true,
    })
    //获取当前城市name并填充
    SvipApi.activityInfo({
      cityId: Taro.getStorageSync('cityId'),
    }).then((res) => {
      Taro.setStorageSync('activityInfo', app.disposeData(res))
      Taro.setStorageSync('sessionId', res.session)
      Taro.setStorageSync('activityId', res.activity_id)
      Taro.setStorageSync('curUserCityText', res.city_name)
      this.setData({
        curUserCityText: res.city_name,
      })
    })
    this.setData({
      showCouponBtn: false,
      showCouponPopup: false,
    })
    //已登录&&当天首次登录&&有抵扣券 || 未登录&&有抵扣券 ，显示抵扣券弹层
    SvipApi.firstLoginCheck().then((res) => {
      if (res.status == 1) {
        if (res.data.firstStatus == 1 && !detail) {
          //获取svip抵扣券列表
          this.svipCouponData()
        }
        //判断用户是否有未使用svip抵扣券并且非svip，有则弹优惠券按钮
        SvipApi.userSvipCouponData().then((res) => {
          if (res.status == 1 && res.data.is_show == 1) {
            this.setData({
              showCouponBtn: true,
            })
          }
        })
      } else {
        //获取svip抵扣券列表
        this.svipCouponData()
      }
    })
    //判断用户是否svip
    SvipApi.isSvip({
      cityId: Taro.getStorageSync('cityId'),
      activityId: Taro.getStorageSync('activityId'),
    }).then((res) => {
      if (res.status == 1) {
        let isSvip = res.data.svip === 1
        Taro.setStorageSync('isSvip', isSvip)
        this.setData({
          isSvip,
        })
      } else {
        this.setData({
          isLogin: false,
        })
      }
    })
    //获取云逛展信息
    marketingApi
      .cloudShowInfo({
        cityId: Taro.getStorageSync('cityId'),
        mobile: Taro.getStorageSync('userInfo')
          ? Taro.getStorageSync('userInfo').mobile
          : '',
      })
      .then((res) => {
        if (res.status == 1) {
          this.setData({
            pageOnload: true,
          })
          console.log(res, '云逛展数据')
          //海报背景
          Taro.setStorageSync('postBg', res.data.poster_image_url)
          //活动规则
          Taro.setStorageSync('cloudRule', res.data.rule)
          //提现规则
          Taro.setStorageSync('withdrawRule', res.data.withdraw_rule)
          Taro.setStorageSync('liveCityId', res.data.city_id)
          Taro.setStorageSync('liveActId', res.data.id)

          //云逛展邀请首次点击
          cryptoJs.getAccessToken().then(() => {
            Taro.request({
              url: this.data.baseUrl + '/expo/clickCloud',
              method: 'POST',
              data: {
                invite: Taro.getStorageSync('cloudInviteMobile'),
                src_id: 'click_cloud',
                invite_city: Taro.getStorageSync('inviteLiveCityId'),
                activity_id: Taro.getStorageSync('liveActId'),
                mobile: Taro.getStorageSync('userInfo').mobile
                  ? Taro.getStorageSync('userInfo').mobile
                  : '',
                ds: cryptoJs.tokenAES(),
                tk: Taro.getStorageSync('accessToken'),
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
                Token: Taro.getStorageSync('token'),
                City: Taro.getStorageSync('liveCityId'),
              },
              complete: function (res) {},
            })
          })

          //用户状态
          Taro.request({
            url: this.data.baseUrl + '/v2.0/user/userStatus',
            method: 'POST',
            data: {
              mobile: Taro.getStorageSync('userInfo').mobile
                ? Taro.getStorageSync('userInfo').mobile
                : '',
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              Token: Taro.getStorageSync('token'),
            },
            success(res) {
              if (res.data.status == -1) {
                Taro.removeStorageSync('userInfo')
                Taro.removeStorageSync('token')
                Taro.removeStorageSync('mall_token')
                Taro.removeStorageSync('pageGuideList')
                Taro.removeStorageSync('isLogin')
                Taro.removeStorageSync('isSvip')
                Taro.removeStorageSync('codePopup')
                Taro.showToast({
                  title: res.data.message,
                  icon: 'none',
                })
              }
            },
          })

          //banner运营位
          Taro.request({
            method: 'GET',
            header: {
              City: res.data.city_id,
            },
            url: this.data.baseUrl + '/expo/xcx/adv?area_id=33',
            success(data) {
              if (data.data.code == 200) {
                that.setData({
                  banner: data.data.result,
                  current: 0,
                })
              }
            },
          })

          //直播按钮运营位
          Taro.request({
            method: 'GET',
            header: {
              City: res.data.city_id,
            },
            url: this.data.baseUrl + '/expo/xcx/adv?area_id=37',
            success(data) {
              if (data.data.code == 200) {
                that.setData({
                  liveAdv: data.data.result,
                })
              }
            },
          })

          //底部运营位
          Taro.request({
            method: 'GET',
            header: {
              City: res.data.city_id,
            },
            url: this.data.baseUrl + '/expo/xcx/adv?area_id=34',
            success(data) {
              if (data.data.code == 200) {
                that.setData({
                  reserveAdv: data.data.result,
                })
              }
              Taro.hideLoading()
            },
          })

          //浮动运营位
          Taro.request({
            method: 'GET',
            header: {
              City: res.data.city_id,
            },
            url: this.data.baseUrl + '/expo/xcx/adv?area_id=38',
            success(data) {
              if (data.data.code == 200) {
                that.setData({
                  fixedAdv: data.data.result,
                })
              }
            },
          })
          clearInterval(this.data.stop)
          let actBegDate = res.data.begin_date
          let actEndDate = res.data.end_date
          res.data.begin_date = res.data.begin_date
            .split(' ')[0]
            .split(/[-.]/)
            .join('.')
          res.data.end_date = res.data.end_date
            .split(' ')[0]
            .split(/[-.]/)
            .slice(1)
            .join('.')
          this.setData({
            ticketInfo: res.data,
          })
          //直播开始倒计时
          let nowTime = new Date().getTime()
          let startDate =
            new Date(actBegDate.replace(/-/g, '/')).getTime() - nowTime
          if (startDate > 0) {
            // this.setData({
            //   countOver: false
            // })
            //倒计时
            this.setData({
              stop: setInterval(() => {
                let days = Math.floor(startDate / 1000 / 60 / 60 / 24)
                let hours = Math.floor((startDate / 1000 / 60 / 60) % 24)
                let minute = Math.floor((startDate / 1000 / 60) % 60)
                let second = Math.floor((startDate / 1000) % 60)
                this.setData({
                  days: days < 10 ? '0' + days : days,
                  hours: hours < 10 ? '0' + hours : hours,
                  minute: minute < 10 ? '0' + minute : minute,
                  second: second < 10 ? '0' + second : second,
                })
                if (startDate <= 0) {
                  this.setData({
                    days: '00',
                    hours: '00',
                    minute: '00',
                    second: '00',
                  })
                  clearInterval(this.data.stop)
                  return false
                } else {
                  startDate -= 1000
                }
              }, 1000),
            })
          } else {
            // this.setData({
            //   countOver: true
            // })
          }

          //直播结束倒计时
          let endDate =
            new Date(actEndDate.replace(/-/g, '/')).getTime() - nowTime
          if (endDate > 0) {
            this.setData({
              liveOver: false,
            })
            //倒计时
            this.setData({
              countDown: setInterval(() => {
                if (endDate <= 0) {
                  this.setData({
                    liveOver: true,
                  })
                  clearInterval(this.data.countDown)
                  return false
                } else {
                  endDate -= 1000
                }
              }, 1000),
            })
          } else {
            this.setData({
              liveOver: true,
            })
          }
        } else {
          Taro.hideLoading()
          this.setData({
            pageOnload: true,
            offLine: true,
          })
        }
      })
  },
  //svip抵扣券列表
  svipCouponData() {
    let that = this
    SvipApi.svipCouponData().then((res) => {
      if (
        res.status == 1 &&
        res.data.coupon_list &&
        res.data.coupon_list.length > 0
      ) {
        that.setData({
          couponInfo: res.data.coupon_list,
          showCouponPopup: true,
        })
      }
    })
  },
  closeCouponPopup() {
    this.setData({
      showCouponPopup: false,
    })
  },
  //选择城市
  chooseCity() {
    Taro.navigateTo({
      url: '/pages/address/index?src=cloudShow',
    })
  },
  //免费预约
  freeReserve() {
    cryptoJs.getAccessToken().then(() => {
      this.getFreeReserve()
    })
  },
  //
  getFreeReserve() {
    if (Taro.getStorageSync('isLogin')) {
      Taro.showLoading({
        title: '预约中...',
        mask: true,
      })
      //预约接口
      let data = {
        isSendSms: 0,
        source_id: '',
        src_id: 'cloud_show',
        mobile: Taro.getStorageSync('userInfo').mobile,
        invite: Taro.getStorageSync('cloudInviteMobile'),
        formId: '',
        invite_city: Taro.getStorageSync('inviteLiveCityId'),
        activity_id: Taro.getStorageSync('liveActId'),
        src: Taro.getStorageSync('src'),
        uis: Taro.getStorageSync('uis'),
        plan: Taro.getStorageSync('plan'),
        unit: Taro.getStorageSync('unit'),
        ds: cryptoJs.tokenAES(),
        tk: Taro.getStorageSync('accessToken'),
      }
      Taro.request({
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          Token: Taro.getStorageSync('token'),
          City: Taro.getStorageSync('liveCityId'),
        },
        url: this.data.baseUrl + '/expo/shareReserve',
        data: data,
        success(data) {
          Taro.hideLoading()
          if (data.data.code == 200) {
            //跳转成功页
            Taro.navigateTo({
              url: '/pages/cloudPackage/cloudShowSuccess/index',
            })
          } else {
            Taro.showToast({
              title: data.data.message ? data.data.message : '请求出错了',
              icon: 'none',
            })
          }
        },
      })
    } else {
      Taro.navigateTo({
        url: '/pages/login/login?source=cloudShow',
      })
    }
  },
  //分享
  cloudShare() {
    if (Taro.getStorageSync('isLogin')) {
      this.setData({
        showShare: true,
      })
    } else {
      Taro.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  //关闭弹层
  closeShare() {
    this.setData({
      showShare: false,
    })
  },
  //关闭弹层
  closePopup() {
    this.setData({
      postPopup: false,
    })
  },
  stop() {
    return false
  },
  // 判断url是否为tabbar
  isTab(url) {
    for (let item of tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },
  //运营位链接跳转
  swiperUrl(e) {
    // 友盟统计
    Taro.uma.trackEvent('click_AD', {
      cityId: Taro.getStorageSync('cityId'),
      ADID: '33',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    let type = getTarget(e.currentTarget, Taro).dataset.item.type
    var url = getTarget(e.currentTarget, Taro).dataset.item.url
    console.log(url)
    //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
    if (type == 1) {
      if (this.isTab(url)) {
        Taro.switchTab({
          url,
        })
      } else {
        Taro.navigateTo({
          url,
        })
      }
    } else if (type == 2) {
      Taro.navigateToMiniProgram({
        appId: getTarget(e.currentTarget, Taro).dataset.item.appid,
        path: getTarget(e.currentTarget, Taro).dataset.item.url,
        complete(res) {},
      })
    } else {
      Taro.navigateTo({
        url:
          '/pages/web/web?url=' +
          encodeURIComponent(getTarget(e.currentTarget, Taro).dataset.item.url),
      })
    }
  },
  //跳转规则页
  toRule() {
    if (!Taro.getStorageSync('cloudRule')) {
      Taro.showToast({
        title: '当前未开启推广奖励活动',
        icon: 'none',
      })
    } else {
      Taro.navigateTo({
        url: '/pages/cloudPackage/cloudRule/index',
      })
    }
  },
  //跳转其他小程序
  toLiveHome() {
    Taro.navigateToMiniProgram({
      appId: 'wx65a5078ca69b0e5f',
      path: 'pages/address/index',
      complete(res) {
        console.log(res)
      },
    })
  },
  //跳转奖励页
  myAward() {
    if (Taro.getStorageSync('isLogin')) {
      Taro.navigateTo({
        url: '/pages/cloudPackage/cloudAward/index',
      })
    } else {
      Taro.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  //授权手机号回调
  getPhoneBack(e) {
    let detail = e.detail
    this.setData({
      isAuth: true,
      isLogin: true,
    })
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getInfo(detail)
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.stop)
    clearInterval(this.data.countDown)
    this.setData({
      pageOnload: false,
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.stop)
    clearInterval(this.data.countDown)
    this.setData({
      pageOnload: false,
    })
  },
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
  onShareAppMessage: function () {
    return {
      title: '云逛展',
      imageUrl: '',
      path:
        '/pages/cloudShow/cloudShow?cloudInviteMobile=' +
        Taro.getStorageSync('userInfo').mobile +
        '&inviteLiveCityId=' +
        Taro.getStorageSync('liveCityId'),
    }
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const {
      curUserCityText,
      pageOnload,
      offLine,
      banner,
      current,
      ticketInfo,
      days,
      hours,
      minute,
      second,
      liveOver,
      liveAdv,
      reserveAdv,
      fixedAdv,
      cityId,
      showShare,
      postPopup,
      showCouponBtn,
      couponInfo,
      isLogin,
      showCouponPopup,
      isAuth,
    } = this.data
    return (
      <Block>
        <OnlineServe></OnlineServe>
        <View className="pos" onClick={this.chooseCity}>
          <Image src={require('../../imgs/site.png')}></Image>
          <Text>{curUserCityText}</Text>
        </View>
        {pageOnload && (
          <View>
            {!offLine && (
              <View>
                <View className="swiper-box">
                  {banner?.length > 1 && (
                    <Swiper
                      className="swiper"
                      indicatorDots="true"
                      indicatorColor="#f3f3f3"
                      indicatorActiveColor="#e6002d"
                      autoplay="true"
                      interval="3000"
                      current={current}
                    >
                      {banner?.map((item, index) => {
                        return (
                          <Block key={index}>
                            <SwiperItem
                              data-item={item}
                              onClick={item.url ? 'swiperUrl' : ''}
                            >
                              <Image
                                src={item.wap_image_url}
                                className="slide-image"
                                mode="scaleToFill"
                              ></Image>
                            </SwiperItem>
                          </Block>
                        )
                      })}
                    </Swiper>
                  )}
                  {banner?.length == 1 && (
                    <View
                      className="single-swiper"
                      data-item={banner?.[0]}
                      onClick={banner?.[0]?.url ? 'swiperUrl' : ''}
                    >
                      <Image
                        src={banner?.[0]?.wap_image_url}
                        className="slide-image"
                        mode="widthFix"
                      ></Image>
                    </View>
                  )}
                </View>
                {/*  直播信息  */}
                <View className="live-box">
                  <View className="time">
                    直播时间
                    <Text>
                      {ticketInfo?.begin_date +
                        '~' +
                        ticketInfo?.end_date +
                        '日'}
                    </Text>
                  </View>
                  <View className="count">
                    距直播开始
                    <Text>
                      {days +
                        '天' +
                        hours +
                        '小时' +
                        minute +
                        '分' +
                        second +
                        '秒'}
                    </Text>
                  </View>
                  <View className="number">
                    已有<Text>{ticketInfo?.ticketNum}</Text>人预约
                  </View>
                  {!liveOver && ticketInfo?.ticket_id === 0 && (
                    <View className="reserve" onClick={this.freeReserve}>
                      免费预约直播
                    </View>
                  )}
                  {/*  <view class="reserve" wx:if="{{!liveOver && ticketInfo.ticket_id !==0 }}">已预约</view>  */}
                  {!liveOver && ticketInfo?.ticket_id !== 0 && (
                    <View
                      className="reserve"
                      data-item={liveAdv?.[0]}
                      onClick={liveAdv?.[0]?.url ? 'swiperUrl' : ''}
                    >
                      观看直播
                    </View>
                  )}
                  {liveOver && <View className="reserve">活动已结束</View>}
                  {/*  <view class="other">
              
              			<view class="award" bindtap="myAward">我的奖励</view>
              
              			<view class="ico" bindtap="cloudShare">分享</view>
              
              			<view class="rule" bindtap="toRule">规则</view>
              
              		</view>  */}
                </View>
                {/*  运营位  */}
                <View className="adv">
                  {reserveAdv?.map((item, index) => {
                    return (
                      <Image
                        key={index}
                        className="oprate"
                        mode="widthFix"
                        src={item.wap_image_url}
                        data-item={item}
                        onClick={item.url ? 'swiperUrl' : ''}
                      ></Image>
                    )
                  })}
                </View>
                {/*  浮动运营位  */}
                <View className="fixed-adv">
                  <Image
                    src={fixedAdv?.[0]?.wap_image_url}
                    data-item={fixedAdv?.[0]}
                    onClick={fixedAdv?.[0]?.url ? 'swiperUrl' : ''}
                  ></Image>
                </View>
              </View>
            )}
            {offLine && (
              <View className="off-line">
                {cityId == 60 ? (
                  <Image
                    mode="widthFix"
                    src="https://img.51jiabo.com/619a6b40-7221-4f5e-9e4f-1b3e3d52d3a0.png"
                  ></Image>
                ) : (
                  <Image
                    mode="widthFix"
                    src="https://img.51jiabo.com/b423161b-ffda-4ab6-945b-8e5150d87775.jpg"
                  ></Image>
                )}
                {/*  <view class="text">当前城市云逛展 <text>敬请期待...</text></view>  */}
              </View>
            )}
          </View>
        )}
        {/*  分享  */}
        {showShare && (
          <View className="share-popup" onClick={this.closeShare}>
            <View className="bottom">
              <Button openType="share" className="share">
                <Image
                  src="https://img.51jiabo.com/88e20692-bb64-4776-a594-7b7e41ec22bb.png"
                  mode="widthFix"
                ></Image>
                <Text>微信好友</Text>
              </Button>
              <Button
                id="login"
                className="share"
                openType="getUserInfo"
                onGetuserinfo={this.getPost}
              >
                <Image
                  src="https://img.51jiabo.com/bd2bb4b2-91c6-4df5-9d07-f585ba19d1de.png"
                  mode="widthFix"
                ></Image>
                <Text>推广海报</Text>
              </Button>
            </View>
          </View>
        )}
        {/*  海报  */}
        <View
          className={'popup ' + (postPopup == true ? 'visible' : '')}
          onTouchMove={this.stop}
        >
          <View className="popup-bg" onClick={this.closePopup}></View>
          <View className="content">
            <View className="close" onClick={this.closePopup}></View>
            <Canvas
              className="canvas"
              id="canvas"
              type="2d"
              disableScroll="true"
              style={{
                width: '12.85rem',
                height: '19.45rem',
              }}
            ></Canvas>
            <View className="save" onClick={this.saveImg}>
              保存图片
            </View>
          </View>
        </View>
        {/*  svip抵扣券按钮  */}
        {showCouponBtn && <CouponBtn></CouponBtn>}
        {/*  领取svip抵扣券弹层  */}
        <CouponPopup
          couponInfo={couponInfo}
          isLogin={isLogin}
          showCouponPopup={showCouponPopup}
          onGetPhoneBack={this.getPhoneBack}
          onCloseCouponPopup={this.closeCouponPopup}
        ></CouponPopup>
        {/*  微信授权手机号弹层  */}
        {!isAuth && <Authorize onGetPhoneBack={this.getPhoneBack}></Authorize>}
      </Block>
    )
  }
}
export default _C
