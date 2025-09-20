// pages/expoPackage/getTicketSuccess/getTicketSuccess.js
import {
  marketing
} from "../../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  svip
} from "../../../common/api/svipApi.js"

let SvipApi = new svip()
let app = getApp()
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome'
]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: "",
    isElectron: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.type && options.type == 1) {
      this.setData({
        isElectron: true
      })
    } else {
      this.setData({
        isElectron: false
      })
    }

    let cityId = wx.getStorageSync('cityId'),
      setTitle;
    if (cityId == 60) {
      setTitle = '宁波装修狂欢节'
    } else if (cityId == 65) {
      setTitle = '现代家博会'
    } else {
      setTitle = '华夏家博会'
    }

    wx.setNavigationBarTitle({
      title: setTitle
    })

    //获取开展时间区间来填充对应样式
    let nextInfo = wx.getStorageSync("nextActivity");
    let begin_date = nextInfo.begin_date.split(" ")[0].replace(/-/g, "/");
    let end_date = nextInfo.end_date.split(" ")[0].replace(/-/g, "/");
    let bDateTime = new Date(begin_date).getTime()
    let eDateTime = new Date(end_date).getTime()
    let firstDate = bDateTime - 172800000
    let dateList = [];
    for (var i = 0; i < 7; i++) {
      let item = firstDate + (i * 86400000);
      let listItem = {};
      //标记开展时间区间
      if ((item == bDateTime) || (item == eDateTime) || (item > bDateTime && item < eDateTime)) {
        listItem.isActive = true;
      } else {
        listItem.isActive = false;
      }
      listItem.date = new Date(item).getDate();
      let day = new Date(item).getDay();
      switch (day) {
        case 0:
          listItem.day = "星期日";
          break;
        case 1:
          listItem.day = "星期一";
          break;
        case 2:
          listItem.day = "星期二";
          break;
        case 3:
          listItem.day = "星期三";
          break;
        case 4:
          listItem.day = "星期四";
          break;
        case 5:
          listItem.day = "星期五";
          break;
        case 6:
          listItem.day = "星期六";
      }
      dateList.push(listItem)
    }
    this.setData({
      dateList: dateList,
      expoYear: begin_date.split("/")[0],
      expoMonth: begin_date.split("/")[1],
      activityInfo: app.disposeData(nextInfo),
      cityId: wx.getStorageSync('cityId'),
      curUserCityText: wx.getStorageSync('curUserCityText')
    })

    //获取客服信息
    SvipApi.getCityConfig().then((res) => {
      if (res.status == 1) {
        this.setData({
          cityConfig: res.data
        })
      }
    })

    //获取参观日程下方运营位数据
    SvipApi.getAdvList({
      area_id: "14,27,59"
    }).then((res) => {
      // 14:参观日程下方运营位数据 27:门票分享图片 59:索票成功添加客服微信运营位
      if (res.status == 1) {
        this.setData({
          successAdv: res.data.adv14 || [],
          ticketShareAdv: res.data.adv27 || "",
          //索票成功弹运营位（如果配置了运营位）
          serviceAdv: res.data.adv59 || [],
          showServePopup: res.data.adv59 && res.data.adv59.length > 0 ? true : false
        })
      } else {
        this.setData({
          serviceAdv: []
        })
      }
    })
    //获取爆品组
    marketingApi.getGoodsGroup().then((res) => {
      if (res.status == 1) {
        this.setData({
          goodsGroup: res.data
        })
      }
    })
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
    marketingApi.getUserDefaultAddress().then((res) => {
      console.log(res)
      if (res.status == 1) {
        var address = res.data.province_name + res.data.city_name + res.data.district_name + res.data.address
        this.setData({
          address: address
        })
      }
    })
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
    wx.uma.trackEvent('click_AD', {
      cityId: wx.getStorageSync('cityId'),
      ADID: '14',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis')
    });

    let type = e.currentTarget.dataset.item.type;
    var url = e.currentTarget.dataset.item.url

    //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
    if (type == 1) {
      if (this.isTab(url)) {
        wx.switchTab({
          url
        })
      } else {
        wx.navigateTo({
          url
        })
      }
    } else if (type == 2) {
      wx.navigateToMiniProgram({
        appId: e.currentTarget.dataset.item.appid,
        path: e.currentTarget.dataset.item.url,
        complete(res) {

        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(e.currentTarget.dataset.item.url)
      })
    }
  },
  //地址表单失焦获取内容
  addressInput(e) {
    this.data.address = e.detail.value
  },
  idCardInput(e) {
    this.data.idCard = e.detail.value
  },
  //提交地址
  submitForm() {
    if (!this.data.address) {
      wx.showToast({
        title: '请输入详细地址',
        mask: true,
        icon: "none"
      })
      return
    } else {
      marketingApi.postAddress({
        address: this.data.address,
        mobile: wx.getStorageSync("userInfo").mobile
      }).then((res) => {
        if (res.code == 200) {
          this.setData({
            submitSuccess: true,
            hasAddress: true
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: "none"
          })
        }
      })
    }
  },
  closeServe() {
    this.setData({
      showServePopup: !this.data.showServePopup
    })
  },

  toAddKin() {
    const activityId = wx.getStorageSync("activityId"),
      bindMobile = wx.getStorageSync("userInfo").mobile;
    marketingApi.getKey({
      activityId,
      bindMobile,
    }).then((res) => {
      //判断环境跳转不同H5页面
      let url = `https://svip-test.jia-expo.com/addKin?key=${res.infoMap.key}`
      let version = __wxConfig.envVersion
      if (!version) version = __wxConfig.platform
      if (version == "release") {
        url = `https://svip.51jiabo.com/addKin?key=${res.infoMap.key}`
      }
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(url)
      })
    })
  },

  //
  confirm() {
    this.setData({
      submitSuccess: false
    })
  },
  saveCodeImg() {
    wx.downloadFile({
      url: this.data.cityConfig.qr_url,
      success(res) {
        if (res.statusCode === 200) {
          let imgData = res.tempFilePath;
          wx.saveImageToPhotosAlbum({
            filePath: imgData,
            success(res) {
              wx.showToast({
                title: '保存成功',
                icon: "none"
              })
            },
            fail(res) {
              wx.showModal({
                title: '提示',
                content: '请设置允许授权保存相册',
                confirmText: "去设置",
                success(res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success(res) {},
                      complete(res) {}
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            },
            complete(res) {

            }
          })
        }
      }
    })
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
      title: '您的亲友分享给您一张华夏家博会现场门票',
      imageUrl: this.data.ticketShareAdv ? this.data.ticketShareAdv[0].wap_image_url : "https://img.51jiabo.com/21d7670e-2324-495a-ab6c-4a07d603092a.png",
      path: '/pages/expoPackage/ticketDetail/ticketDetail?ticketId=' + wx.getStorageSync("shareTicketId") + "&ticketInviteMobile=" + wx.getStorageSync("userInfo").mobile + "&cityId=" + wx.getStorageSync("cityId"),
      success: function (res) {
        wx.showToast({
          title: '分享成功！',
        })
      },
      fail(res) {
        console.log(res)
      }
    }
  },
})