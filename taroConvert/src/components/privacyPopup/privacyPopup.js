import withWeapp, { cacheOptions } from '@tarojs/with-weapp'
import { Block, View, Text, Button } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
let privacyHandler
let privacyResolves = new Set()
let closeOtherPagePopUpHooks = new Set()
if (Taro.onNeedPrivacyAuthorization) {
  Taro.onNeedPrivacyAuthorization((resolve) => {
    console.log('触发 onNeedPrivacyAuthorization')
    if (typeof privacyHandler === 'function') {
      privacyHandler(resolve)
    }
  })
}
const closeOtherPagePopUp = (closePopUp) => {
  closeOtherPagePopUpHooks.forEach((hook) => {
    if (closePopUp !== hook) {
      hook()
    }
  })
}
cacheOptions.setOptionsToCache({
  data: {
    innerShow: false,
  },
  lifetimes: {
    attached: function () {
      const closePopUp = () => {
        this.disPopUp()
      }
      privacyHandler = (resolve) => {
        privacyResolves.add(resolve)
        this.popUp()
        // 额外逻辑：当前页面的隐私弹窗弹起的时候，关掉其他页面的隐私弹窗
        closeOtherPagePopUp(closePopUp)
      }
      this.closePopUp = closePopUp
      closeOtherPagePopUpHooks.add(this.closePopUp)
    },
    detached: function () {
      closeOtherPagePopUpHooks.delete(this.closePopUp)
    },
  },
  pageLifetimes: {
    show() {
      if (this.closePopUp) {
        privacyHandler = (resolve) => {
          privacyResolves.add(resolve)
          this.popUp()
          // 额外逻辑：当前页面的隐私弹窗弹起的时候，关掉其他页面的隐私弹窗
          closeOtherPagePopUp(this.closePopUp)
        }
      }
    },
  },
  methods: {
    handleAgree(e) {
      this.disPopUp()
      // 这里演示了同时调用多个wx隐私接口时要如何处理：让隐私弹窗保持单例，点击一次同意按钮即可让所有pending中的wx隐私接口继续执行 （看page/index/index中的 wx.getClipboardData 和 wx.startCompass）
      privacyResolves.forEach((resolve) => {
        resolve({
          event: 'agree',
          buttonId: 'agree-btn',
        })
      })
      privacyResolves.clear()
    },
    handleDisagree(e) {
      this.disPopUp()
      privacyResolves.forEach((resolve) => {
        resolve({
          event: 'disagree',
        })
      })
      privacyResolves.clear()
    },
    popUp() {
      if (this.data.innerShow === false) {
        this.setData({
          innerShow: true,
        })
      }
    },
    disPopUp() {
      if (this.data.innerShow === true) {
        this.setData({
          innerShow: false,
        })
      }
    },
    openPrivacyContract() {
      Taro.openPrivacyContract({
        success: (res) => {
          console.log('openPrivacyContract success')
        },
        fail: (res) => {
          console.error('openPrivacyContract fail', res)
        },
      })
    },
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const { innerShow } = this.data
    return (
      innerShow && (
        <View className="privacy-popup-wrap">
          <View className="privacy-popup-box">
            <View className="privacy-title">华夏家博</View>
            <View className="text-box">
              <View className="text1">
                感谢您使用本小程序，您使用本小程序前应当阅读并同意
                <Text
                  style={{
                    color: '#0052D9',
                  }}
                  onClick={this.openPrivacyContract}
                >
                  《用户隐私保护指引》
                </Text>
              </View>
              <View className="text2">
                当您点击同意并开始使用产品服务时，即表示你已理解并同意该条款内容，该条款将对您产生法律约束力。如您拒绝，将无法给您提供更好的服务。
              </View>
            </View>
            <View className="btn-box">
              <Button
                id="disagree-btn"
                type="default"
                className="btn"
                onClick={this.handleDisagree}
              >
                不同意
              </Button>
              <Button
                id="agree-btn"
                type="default"
                openType="agreePrivacyAuthorization"
                className="btn agree"
                onAgreeprivacyauthorization={this.handleAgree}
              >
                同意并继续
              </Button>
            </View>
          </View>
        </View>
      )
    )
  }
}
export default _C
