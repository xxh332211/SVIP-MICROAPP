// pages/cloudPackage/cloudRule/index.js
import {
  config
} from '../../../common/config/config.js'
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      flag: true
    })
    // wx.hideShareMenu()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // if (!wx.getStorageSync('cloudRule')) {
    //   this.setData({
    //     notAct:true
    //   })
    //   return false
    // }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this;
    that.setData({
      isLogin: wx.getStorageSync('isLogin'),
      baseUrl: config.url,
      rules: wx.getStorageSync('cloudRule')
    })

    //用户状态
    wx.request({
      url: this.data.baseUrl + "/v2.0/user/userStatus",
      method: 'POST',
      data: {
        mobile: wx.getStorageSync("userInfo").mobile ? wx.getStorageSync("userInfo").mobile : ""
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.status == -1) {
          that.setData({
            isLogin: false
          })
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync("token")
          wx.removeStorageSync("mall_token")
          wx.removeStorageSync('pageGuideList')
          wx.removeStorageSync("isLogin")
          wx.removeStorageSync("isSvip")
          wx.removeStorageSync("codePopup")
          wx.showToast({
            title: res.data.message,
            icon: "none"
          })
        }
      }
    })

    marketingApi.cloudShowInfo({
      cityId: wx.getStorageSync('cityId'),
      mobile: wx.getStorageSync("userInfo") ? wx.getStorageSync("userInfo").mobile : ""
    }).then((res) => {
      if (res.status == 1) {
        wx.setStorageSync('liveCityId', res.data.city_id);
        wx.setStorageSync('liveActId', res.data.id);
        //云逛展邀请奖励用户显示
        wx.request({
          method: 'GET',
          header: {
            'City': wx.getStorageSync('liveCityId'),
            Activity: wx.getStorageSync('liveActId')
          },
          url: that.data.baseUrl + "/awardRecordList",
          success(data) {
            if (data.data.status == 1) {
              that.setData({
                awardPerson: data.data.data
              })
            }
            wx.hideLoading()
          }
        })
      } else {
        //海报背景
        wx.setStorageSync('postBg', "")
        that.setData({
          awardPerson: [],
          rules: ""
        })
        wx.hideLoading()
      }
    })
  },

  //保存图片
  saveImg() {
    wx.showLoading({
      title: '保存中...',
      mask: true
    })
    const query = wx.createSelectorQuery();
    query.select('#canvas')
      .fields({
        node: true,
        size: true
      })
      .exec(async (res) => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: res[0].width * wx.getSystemInfoSync().pixelRatio,
          height: res[0].height * wx.getSystemInfoSync().pixelRatio,
          destWidth: res[0].width * wx.getSystemInfoSync().pixelRatio * 2,
          destHeight: res[0].height * wx.getSystemInfoSync().pixelRatio * 2,
          canvas: res[0].node,
          success(res) {
            console.log(res)
            let imgData = res.tempFilePath;
            wx.saveImageToPhotosAlbum({
              filePath: imgData,
              success(res) {
                wx.showToast({
                  title: '保存成功',
                  icon: "none"
                })
                console.log(res)
              },
              fail(res) {
                wx.showModal({
                  title: '提示',
                  content: '请设置允许授权保存相册',
                  confirmText: "去设置",
                  success(res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success(res) {
                          console.log(res)
                        },
                        complete(res) {
                          console.log(res)
                        }
                      })
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              },
              complete(res) {
                wx.hideLoading()
                console.log(res)
              }
            })
          },
          complete(res) {
            console.log(res)
          }
        })
      })

  },
  //生成海报
  getPost(e) {
    let postBgImg = wx.getStorageSync('postBg') ? wx.getStorageSync('postBg') : "https://img.51jiabo.com/7fe2f1a2-2ac0-4b57-94c5-3f0d24e22983.jpg";
    if (wx.getStorageSync('isLogin')) {
      if (e.detail.errMsg != "getUserInfo:ok") {
        wx.showModal({
          title: '提示!',
          content: '请允许授权,否则无法生成海报!',
          showCancel: false
        })
        return false
      }
      let avatar = e.detail.userInfo.avatarUrl
      let nickname = e.detail.userInfo.nickName
      wx.showLoading({
        title: '海报生成中...',
        mask: true
      })
      const that = this;
      wx.request({
        method: 'GET',
        header: {
          'City': wx.getStorageSync('liveCityId')
        },
        url: this.data.baseUrl + "/QRCode?page=pages/cloudShow/cloudShow&scene=" + wx.getStorageSync("userInfo").mobile + encodeURIComponent("&" + wx.getStorageSync('liveCityId')),
        success(data) {
          console.log(data.data, "分享二维码")
          if (data.data.status == 1) {
            let qrcodeImg = data.data.data;
            wx.createSelectorQuery().select('#canvas').fields({
              node: true,
              size: true,
            }).exec(async (res) => {
              console.log(res)
              const canvas = res[0].node;
              const ctx = canvas.getContext('2d');
              const width = res[0].width;
              const height = res[0].height;
              if (that.data.flag) {
                const dpr = wx.getSystemInfoSync().pixelRatio
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
                that.data.flag = false;
              }
              const bgImg = canvas.createImage();
              //'https://img.51jiabo.com/52c52ebb-4aba-4768-9b2b-4272604ac366.png'
              bgImg.src = postBgImg;
              let bgImgPo = await new Promise((resolve, reject) => {
                bgImg.onload = () => {
                  resolve(bgImg)
                }
                bgImg.onerror = (e) => {
                  reject(e)
                }
              });
              ctx.drawImage(bgImgPo, 0, 0, 257, 389)
              //用户昵称
              ctx.font = "normal bold 14px sans-serif";
              ctx.fillStyle = "#FFFFFF"
              ctx.fillText(`${nickname}邀您参加`, 42, 24)
              //参与
              ctx.font = "normal bold 12px sans-serif";
              ctx.fillStyle = "#FFFFFF"
              ctx.strokeStyle = "#4B32A9"
              ctx.strokeText('长按识别二维码参与', 75, 373)
              ctx.fillText('长按识别二维码参与', 75, 373)

              //二维码裁剪
              function canvasQR(qrImgUrl) {
                const qrImg = canvas.createImage();
                qrImg.src = qrImgUrl;
                qrImg.onload = () => {
                  ctx.save();
                  ctx.beginPath() //开始创建一个路径
                  ctx.arc(128, 319, 32, 0, 2 * Math.PI, false) //画一个圆形裁剪区域
                  ctx.clip() //裁剪
                  ctx.drawImage(qrImg, 96, 287, 65, 65);
                  ctx.closePath();
                  ctx.restore();
                }
              }
              canvasQR(qrcodeImg);

              //头像裁剪
              function canvasWxHeader(headImageLocal) {
                const headerImg = canvas.createImage();
                headerImg.src = headImageLocal;
                headerImg.onload = () => {
                  ctx.save();
                  ctx.beginPath() //开始创建一个路径
                  ctx.arc(26, 21, 12, 0, 2 * Math.PI, false) //画一个圆形裁剪区域
                  ctx.clip() //裁剪
                  ctx.drawImage(headerImg, 14, 5, 24, 30);
                  ctx.closePath();
                  ctx.restore();
                  //关闭loading
                  wx.hideLoading();
                }
              }
              canvasWxHeader(avatar);

              that.setData({
                postPopup: true
              })
            })
          } else {
            wx.hideLoading()
            wx.showToast({
              title: '生成小程序码失败',
              icon: "none"
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  //显示海报
  // showPost() {
  //   this.setData({
  //     postPopup: true
  //   })
  // },

  //关闭弹层
  closePopup() {
    this.setData({
      postPopup: false
    })
  },


  stop() {
    return false
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '云逛展邀请',
      imageUrl: "",
      path: '/pages/cloudShow/cloudShow?cloudInviteMobile=' + wx.getStorageSync("userInfo").mobile + "&inviteLiveCityId=" + wx.getStorageSync("liveCityId")
    }
  }
})