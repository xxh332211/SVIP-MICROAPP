import {
  svip
} from "../../common/api/svipApi.js"
let SvipApi = new svip()
import {
  marketing
} from "../../common/api/marketingApi.js"
import cryptoJs from '../../utils/crypto.js';
import callService from '../../common/http/httpService_mall'
import apiService from "../../common/http/httpService_mall";
import {
  config
} from '../../common/config/config.js'

// import {
//   global_variable
// } from '/common/global_variable.js'

let marketingApi = new marketing()
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mobile: "",
    code: "",
    timeTic: 0,
    sending: null,
    showProtocol: false,
    cityId: null,
    activityId: null
  },
  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    this.setData({
      source: options.source ? options.source : "",
      type: options.type ? options.type : "",
      next: options.next ? decodeURIComponent(options.next) : "",
    })
  },
  onShow: function () {
    // console.log(gloable)
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
  },
  checkboxChange(e) {
    if (e.detail.value.includes('1')) {
      this.setData({
        isChecked: true
      })
    } else {
      this.setData({
        isChecked: false
      })
    }
  },
  login: function (e) {
    let avatar = e.detail.userInfo.avatarUrl
    let nickname = e.detail.userInfo.nickName
    let that = this
    let data = {
      mobile: that.data.mobile,
      code: that.data.code,
      uis: "microapp",
      src: wx.getStorageSync('src'),
      wxcode: that.data.wxcode,
      avatar: avatar,
      nickname: nickname,
      encryptedData: e.detail.encryptedData,
      offset: e.detail.iv,
      formId: "",
      clickid: wx.getStorageSync('gdt_vid'),
      session: wx.getStorageSync('sessionId')
    }
    if (!that.data.mobile || !that.data.code) {
      wx.showToast({
        icon: 'none',
        title: '请输入手机号码和验证码!',
      })
      return
    }
    if (!that.data.isChecked) {
      wx.showToast({
        icon: 'none',
        title: '请阅读用户隐私协议完成勾选，即可登录',
        duration: 3000
      })
      return
    }
    wx.showLoading({
      title: '登录中..',
    })
    SvipApi.login(data, 'POST').then((res) => {
      console.log('svip登录成功', res)
      wx.setStorageSync('token', res.token)
      wx.setStorageSync('userInfo', res.user_info);
      wx.setStorageSync('isLogin', true)
      wx.request({
        url: config.mallConfig.baseUrl + 'token',
        data: {
          mobile: res.user_info.mobile
        },
        method: 'POST',
        dataType: 'json',
        responseText: 'text',
        success(resp) {
          if (!resp.data || !resp.data.data || !resp.data.data.access_token) {
            return
          }
          wx.setStorageSync('mall_token', resp.data.data)
        },
        fail(err) {
          console.log('失败了')
        }
      })

      // 友盟统计
      const userInfo = wx.getStorageSync('userInfo');
      wx.uma.trackEvent('Event_LoginSuc', {
        Um_Key_LoginType: '手机号验证码',
        Um_Key_UserID: userInfo.uid
      });

      //用户行为记录
      SvipApi.postPV({
        envent_id: 10,
        source: "svip_xcx",
        begin_time: 0,
        end_time: 0,
        pv_type: 1,
        src: wx.getStorageSync('src'),
        uis: wx.getStorageSync('uis')
      }).then((res) => {

      })
      if (that.data.source == "getTicket" || that.data.source == "mgg") {
        //索票接口
        let data1 = {
          source_id: "",
          src_id: "ticket",
          mobile: wx.getStorageSync("userInfo").mobile,
          invite: "",
          formId: "",
          'src': wx.getStorageSync('src'),
          'uis': wx.getStorageSync('uis'),
          'plan': wx.getStorageSync('plan'),
          'unit': wx.getStorageSync('unit')
        }
        marketingApi.postReserve(data1).then((res) => {
          wx.hideLoading()
          if (res.code == 200) {
            wx.setStorageSync("shareTicketId", res.ticket_id)
            wx.setStorageSync("nextActivity", res.activityInfo)
            if (that.data.source == "getTicket") {
              //跳转成功页
              wx.redirectTo({
                url: '/pages/expoPackage/getTicketSuccess/getTicketSuccess?type=' + that.data.type
              })
            } else {
              wx.showToast({
                title: res.message,
                icon: "none",
                mask: true,
                success() {
                  setTimeout(() => {
                    wx.navigateBack({
                      delda: 1
                    })
                  }, 1000);
                }
              })
            }
          } else {
            wx.showToast({
              title: res.message,
              icon: "none"
            })
            wx.navigateBack({
              delda: 1
            })
          }
        })
      } else if (that.data.source == "cloudShow") {
        cryptoJs.getAccessToken()
          .then(() => {
            //预约接口
            let data = {
              isSendSms: 0,
              source_id: "",
              src_id: "cloud_show",
              mobile: wx.getStorageSync("userInfo").mobile,
              invite: wx.getStorageSync("cloudInviteMobile"),
              formId: "",
              activity_id: wx.getStorageSync('liveActId'),
              'src': wx.getStorageSync('src'),
              'uis': wx.getStorageSync('uis'),
              'plan': wx.getStorageSync('plan'),
              'unit': wx.getStorageSync('unit'),
              ds: cryptoJs.tokenAES(),
              tk: wx.getStorageSync('accessToken')
            }
            wx.request({
              method: 'POST',
              dataType: 'json',
              header: {
                'content-type': 'application/x-www-form-urlencoded',
                'Token': wx.getStorageSync('token'),
                'City': wx.getStorageSync('liveCityId')
              },
              url: config.url + "/expo/shareReserve",
              data: data,
              success(data) {
                wx.hideLoading()
                if (data.data.code == 200) {
                  //跳转成功页
                  wx.navigateTo({
                    url: '/pages/cloudPackage/cloudShowSuccess/index'
                  })
                } else {
                  wx.navigateBack({
                    delda: 1
                  })
                }
              }
            })
          })
      } else {
        //判断来源
        if (that.data.next) {
          let params = {
            cityId: wx.getStorageSync('cityId'),
            activityId: wx.getStorageSync('activityId'),
          }
          SvipApi.isSvip(params).then((res) => {
            if (res.status == 1) {
              let status = res.data.svip == 1 ? true : false
              wx.setStorageSync('isSvip', status)
              if (res.data.svip == 1) {
                wx.redirectTo({
                  url: "/pages/svipPackage/svipUserCenter/svipUserCenter"
                })
              } else {
                // svip是否需要0元升级
                SvipApi.zeroUpgrade({
                  cityId: wx.getStorageSync('cityId')
                }).then((resData) => {
                  if (resData.status == 1) {
                    if (resData.data.is_upgrade == 2) {
                      //直接升级
                      that.svipUpgrade()
                    } else {
                      if (that.data.next == "svipPay") {
                        wx.redirectTo({
                          url: "/pages/svipPackage/paySvip/paySvip"
                        })
                      } else {
                        wx.switchTab({
                          url: "/pages/home/home"
                        })
                      }
                    }
                  } else {
                    wx.showToast({
                      icon: 'none',
                      title: res.message
                    })
                    wx.switchTab({
                      url: "/pages/home/home"
                    })
                  }
                })
              }
            } else {
              wx.showToast({
                title: res.message,
                icon: 'none'
              })
            }
          })
        } else {
          //商品购买0元升级特殊逻辑(每个按钮逻辑都不同，所以重写一遍)
          let page = getCurrentPages();
          if (page.length > 1) {
            let preRouter = page[page.length - 2].route;
            if (preRouter == "pages/home/home" || preRouter == "pages/goodsList/goodsList" || preRouter == "pages/svipPackage/payProductDetail/payProductDetail") {
              // svip是否需要0元升级
              SvipApi.zeroUpgrade({
                cityId: wx.getStorageSync('cityId')
              }).then((resData) => {
                if (resData.status == 1) {
                  if (resData.data.is_upgrade == 2) {
                    //直接升级
                    wx.showLoading({
                      title: '加载中...',
                      mask: true
                    })
                    SvipApi.svipUpgrade({
                      cityId: wx.getStorageSync('cityId'),
                      activityId: wx.getStorageSync('activityId'),
                      src: wx.getStorageSync('src'),
                      uis: wx.getStorageSync('uis')
                    }).then((res) => {
                      wx.hideLoading()
                      if (res.status == 1) {
                        //0元升级成功
                        wx.setStorageSync("zeroUpgradeS", 1)
                        wx.navigateBack({
                          delda: 1
                        })
                      } else {
                        wx.showToast({
                          icon: 'none',
                          title: res.message,
                          complete() {
                            wx.navigateBack({
                              delda: 1
                            })
                          }
                        })
                      }
                    })
                  } else {
                    wx.hideLoading();
                    wx.navigateBack({
                      delda: 1
                    })
                  }
                }
              })
            } else {
              wx.hideLoading();
              wx.navigateBack({
                delda: 1
              })
            }
          } else {
            wx.hideLoading();
            wx.navigateBack({
              delda: 1
            })
          }
        }
      }
    }).catch(err => {
      // 友盟统计
      wx.uma.trackEvent('Event_LoginFailed', {
        Um_Key_Reasons: err,
        Um_Key_LoginType: '手机号验证码'
      });
    })
  },
  //0元升级接口
  svipUpgrade() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    // svip 0元升级
    SvipApi.svipUpgrade({
      cityId: wx.getStorageSync('cityId'),
      activityId: wx.getStorageSync('activityId'),
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    }).then((res) => {
      wx.hideLoading()
      if (res.status == 1) {
        wx.navigateTo({
          url: '/pages/svipPackage/svipUserCenter/svipUserCenter?preFrom=zeroUpgrade'
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: res.message
        })
      }
    })
  },
  //手机号
  inputMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  // 验证码
  inputCode: function (e) {
    this.setData({
      code: e.detail.value
    })
  },
  // 获取验证码
  getIdCode: function () {
    cryptoJs.getAccessToken()
      .then(() => {
        this.getIdCodeStep2()
      })
  },
  getIdCodeStep2: function () {
    let mbNUm = this.data.mobile
    if (!mbNUm || mbNUm == "") {
      wx.showToast({
        icon: 'none',
        title: '请填写手机号',
      })
      return false;
    }
    if (mbNUm.length != 11) {
      wx.showToast({
        icon: "none",
        title: '手机号码长度不符！',
      })
      return false;
    }
    var myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if (!myreg.test(mbNUm)) {
      wx.showToast({
        icon: "none",
        title: '请输入有效的手机号码！',
      })
      return false;
    }
    if (this.data.sending) return false;
    this.setData({
      sending: true
    })
    wx.showLoading({
      title: '获取中...',
    })
    let data = {
      mobile: this.data.mobile,
      ds: cryptoJs.tokenAES(),
      tk: wx.getStorageSync('accessToken')
    }
    SvipApi.verificationCode(data, 'POST').then((res) => {
      console.log(res)
      wx.hideLoading()
      if (res.status == 1) {
        wx.showToast({
          title: "发送成功!",
        })
        this.getCodeTime(59);
      } else if (res.status == -2) {
        // this.getIdCode()
        SvipApi.verificationCode(data, 'POST').then((res) => {
          console.log(res)
          if (res.status == 1) {
            wx.showToast({
              title: "发送成功!",
            })
            this.getCodeTime(59);
          } else {
            this.setData({
              sending: false
            })
            wx.showToast({
              title: res.message ? res.message : "发送失败",
              icon: "none"
            })
          }
        })
      } else {
        this.setData({
          sending: false
        })
        wx.showToast({
          title: res.message ? res.message : "发送失败",
          icon: "none"
        })
      }
    })
  },
  // 计算验证码倒计时
  getCodeTime: function (sec) {
    this.setData({
      timeTic: sec
    })
    var that = this
    var timeTic = this.data.timeTic;
    var interval = setInterval(function () {
      timeTic--;
      that.setData({
        timeTic: timeTic
      })
      if (timeTic <= 0) {
        clearInterval(interval)
        that.setData({
          sending: false,
          timeTic: 0
        })
      }
    }, 1000)
    return true;
  },
  showProtocol() {
    wx.navigateTo({
      url: '/pages/agreement/agreement',
    })
  },
  closedProtocol() {
    this.setData({
      showProtocol: false
    })
  }
})