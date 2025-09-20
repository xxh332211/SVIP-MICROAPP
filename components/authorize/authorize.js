// components/authorize/authorize.js
import {
  util
} from "../../common/util.js"
import {
  svip
} from "../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navHeight:String,
    isMgg: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    isLogin: true,
    cityId:null
  },
  pageLifetimes: {
    show: function () {
      this.setData({
        cityId: wx.getStorageSync('cityId')
      })
      marketingApi.checkToken().then((res) => {
        if (res.data) {
          if (res.data.result != 1) {
            wx.removeStorageSync("token")
            wx.removeStorageSync("userInfo")
            wx.removeStorageSync("isLogin")
            wx.removeStorageSync("isSvip")
          }
          // 页面被展示
          this.setData({
            isLogin: wx.getStorageSync('isLogin'),
            isAuth: wx.getStorageSync("isAuth"),

          })
        } else {

        }
      })

      //获取授权登录code
      let that = this;
      wx.login({
        success(res) {
          if (res.code) {
            that.setData({
              wxcode: res.code
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    }
  },
  ready() {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    //获取formId
    getFormId(e) {
      SvipApi.pushFormId({
        formId: ""
      }).then((res) => {
        console.log(res)
      })
    },
    //授权手机号
    getPhoneNumber(e) {
      util.authorizePhone(e, this.data.wxcode, () => {
        this.setData({
          isAuth: true
        })
        //授权登录成功回调父组件方法
        this.triggerEvent("getPhoneBack")
      })
    },

    //关闭弹层
    closeAuth() {
      this.setData({
        isAuth: true
      })
      wx.uma.trackEvent('Event_LoginFailed', {
        Um_Key_Reasons: '用户取消登录',
        Um_Key_LoginType: '手机号授权'
      });
      wx.setStorageSync('isAuth', true)
    }
  }
})