import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Image, Text, Button } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
// components/authorize/authorize.js
import { util } from '../../common/util.js'
import { svip } from '../../common/api/svipApi.js'
let SvipApi = new svip()
import { marketing } from '../../common/api/marketingApi.js'
import './authorize.scss'
let marketingApi = new marketing()
cacheOptions.setOptionsToCache({
  /**
   * 组件的属性列表
   */
  properties: {
    navHeight: String,
    isMgg: Boolean,
  },
  /**
   * 组件的初始数据
   */
  data: {
    isLogin: true,
    cityId: null,
  },
  pageLifetimes: {
    show: function () {
      this.setData({
        cityId: Taro.getStorageSync('cityId'),
      })
      marketingApi.checkToken().then((res) => {
        if (res.data) {
          if (res.data.result != 1) {
            Taro.removeStorageSync('token')
            Taro.removeStorageSync('userInfo')
            Taro.removeStorageSync('isLogin')
            Taro.removeStorageSync('isSvip')
          }
          // 页面被展示
          this.setData({
            isLogin: Taro.getStorageSync('isLogin'),
            isAuth: Taro.getStorageSync('isAuth'),
          })
        } else {
        }
      })

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
  },
  ready() {},
  /**
   * 组件的方法列表
   */
  methods: {
    //获取formId
    getFormId(e) {
      SvipApi.pushFormId({
        formId: '',
      }).then((res) => {
        console.log(res)
      })
    },
    //授权手机号
    getPhoneNumber(e) {
      util.authorizePhone(e, this.data.wxcode, () => {
        this.setData({
          isAuth: true,
        })
        //授权登录成功回调父组件方法
        this.triggerEvent('getPhoneBack')
      })
    },
    //关闭弹层
    closeAuth() {
      this.setData({
        isAuth: true,
      })
      Taro.uma.trackEvent('Event_LoginFailed', {
        Um_Key_Reasons: '用户取消登录',
        Um_Key_LoginType: '手机号授权',
      })
      Taro.setStorageSync('isAuth', true)
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { isLogin, isAuth, isMgg, navHeight, cityId } = this.data
    return (
      !isLogin &&
      !isAuth && (
        <View
          className="auth-popup"
          style={isMgg ? 'padding-top:' + navHeight + 'px' : ''}
        >
          <View className={'auth-box ' + (isMgg ? 'top' : '')}>
            {cityId == 60 ? (
              <Image
                className="auth-img"
                src="https://img.51jiabo.com/c1fb2f1d-d74f-43a6-9b79-c80cef9dafcc.png"
                mode="widthFix"
              ></Image>
            ) : (
              <Image
                className="auth-img"
                src="https://img.51jiabo.com/494fec82-40fb-4e04-89d0-bbd4778dfc79.png"
                mode="widthFix"
              ></Image>
            )}
            <View className="welcome">
              欢迎来到
              {cityId == 60 ? (
                <Text>宁波装修狂欢节</Text>
              ) : (
                <Text>华夏家博会</Text>
              )}
              小程序
            </View>
            <Button
              className="auth-btn"
              openType="getPhoneNumber"
              onGetphonenumber={this.getPhoneNumber}
            >
              微信授权登录
            </Button>
            <View className="not-login" onClick={this.closeAuth}>
              暂不登录
            </View>
          </View>
        </View>
      )
    )
  }
}
export default _C
