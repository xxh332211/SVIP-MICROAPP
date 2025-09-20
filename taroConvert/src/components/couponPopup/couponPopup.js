import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Image, Text, Button, CoverView } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
// components/couponPopup/couponPopup.js
import { svip } from '../../common/api/svipApi.js'
let SvipApi = new svip()
import { util } from '../../common/util.js'
import './couponPopup.scss'
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {
    showCouponPopup: Boolean,
    isLogin: Boolean,
    couponInfo: Array,
  },
  /**
   * 组件的初始数据
   */
  data: {
    couponPopup: false,
    login: false,
    getSuccess: false,
    couponData: [],
  },
  observers: {
    showCouponPopup: function (newVal) {
      this.setData({
        couponPopup: newVal,
      })
    },
    isLogin: function (newVal) {
      this.setData({
        login: newVal,
      })
    },
    couponInfo: function (newVal) {
      let hasNotGet = false
      for (let v of newVal) {
        if (v.is_own == 0) {
          hasNotGet = true
        }
      }
      if (!hasNotGet) {
        this.setData({
          getSuccess: true,
        })
      }
      this.setData({
        couponData: newVal,
        couponIdArr: newVal.map((v) => {
          return v.coupon_id
        }),
      })
    },
  },
  ready() {
    //获取授权登录code
    let that = this
    Taro.login({
      success(res) {
        if (res.code) {
          that.setData({
            wxcode: res.code,
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      },
    })
  },
  pageLifetimes: {
    show: function () {
      // 页面被展示
      this.setData({
        getSuccess: false,
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //授权手机号
    getPhoneNumber(e) {
      util.authorizePhone(e, this.data.wxcode, () => {
        //授权登录成功回调父组件方法
        this.triggerEvent('getPhoneBack', 'getCoupon')
        this.getCoupon(e)
      })
    },
    getCoupon() {
      let that = this
      Taro.showLoading({
        title: '领取中...',
        mask: true,
      })
      SvipApi.getMultiSvipCoupon({
        couponId: this.data.couponIdArr,
      }).then((res) => {
        let resData = res
        Taro.hideLoading({
          complete() {
            if (resData.status == 1) {
              let arr = []
              that.data.couponData.map((v) => {
                if (resData.data.indexOf(v.coupon_id) > -1) {
                  arr.push(v)
                }
              })
              that.setData({
                getSuccess: true,
                couponData: arr,
              })
            } else {
              that.setData({
                showCouponPopup: false,
                showTips: true,
                ticketName: res.message,
              })
              setTimeout(function () {
                that.setData({
                  showTips: false,
                })
              }, 3000)
            }
          },
        })
      })
    },
    closeCouponPopup() {
      this.setData({
        showCouponPopup: false,
      })
      // this.triggerEvent("closeCouponPopup")
    },
    toUse() {
      this.setData({
        showCouponPopup: false,
      })
      Taro.navigateTo({
        url: '/pages/svipPackage/paySvip/paySvip',
      })
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const {
      showCouponPopup,
      couponData,
      login,
      getSuccess,
      showTips,
      ticketName,
    } = this.data
    return (
      <Block>
        {showCouponPopup && (
          <View className="coupon-popup">
            <View className="coupon-box">
              <Image
                className="flower"
                mode="widthFix"
                src="https://img.51jiabo.com/06e23eb9-ab84-49a0-942d-96889833e290.png"
              ></Image>
              <View className="close" onClick={this.closeCouponPopup}></View>
              <View className="title">恭喜获得</View>
              <View className="content">
                <View className="scroll-box">
                  {couponData?.map((item, index) => {
                    return (
                      <View className="coupon" key={index}>
                        <View className="left">
                          <Text className="text">￥</Text>
                          {item.coupon_value}
                        </View>
                        <View className="right">
                          <View className="name">{item.coupon_name}</View>
                          <View className="time">
                            {'有效时间：' +
                              item.begin_date +
                              '-' +
                              item.end_date}
                          </View>
                          <View className="desc">{item.smemo}</View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
              <View className="bottom">
                {!login && (
                  <Button
                    openType="getPhoneNumber"
                    onGetphonenumber={this.getPhoneNumber}
                    className="btn"
                  >
                    {couponData?.length == 1 ? '立即领取 GO >' : '一键领取'}
                  </Button>
                )}
                {/*  多张券未领取按钮文案  */}
                {!getSuccess && login && couponData?.length > 1 && (
                  <View className="btn" onClick={this.getCoupon}>
                    一键领取
                  </View>
                )}
                {/*  一张券未领取按钮文案  */}
                {!getSuccess && login && couponData?.length == 1 && (
                  <View className="btn" onClick={this.getCoupon}>
                    立即领取 GO >
                  </View>
                )}
                {/*  多张券已领取按钮文案  */}
                {getSuccess && couponData?.length > 1 && (
                  <View className="btn use-btn" onClick={this.toUse}>
                    立即使用<View className="tips">将为您匹配最优优惠方式</View>
                  </View>
                )}
                {/*  一张券已领取按钮文案  */}
                {getSuccess && couponData?.length == 1 && (
                  <View className="btn" onClick={this.toUse}>
                    立即使用 GO >
                  </View>
                )}
              </View>
              <View className="pinion"></View>
            </View>
          </View>
        )}
        {showTips && (
          <CoverView className="tips-box-pop">{ticketName}</CoverView>
        )}
      </Block>
    )
  }
}
export default _C
