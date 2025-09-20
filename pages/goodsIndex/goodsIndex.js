import {
  absApi
} from '../../common/api/absAPI';
const AbsApi = new absApi();
import {
  marketing
} from "../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  svip
} from "../../common/api/svipApi.js"
const SvipApi = new svip()
import {
  util
} from "../../common/util.js"
let app = getApp();
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome'
]
let flag = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curUserCityText: '',
    goodsTabList: [{
        id: 1,
        text: '综合'
      },
      {
        id: 2,
        text: '销量'
      },
      {
        id: 3,
        text: '价格',
        type: 'up'
      },
    ],
    floorList: null,
    mallBtmList: null,
    mggCurList: null,
    curTab: 0,
    curCategoryId: 0,
    // 列表数据
    list: [],
    // 数据列表加载中
    listDataLoading: false,
    // 瀑布流加载中
    waterfallLoading: false,
    // 数据加载完毕
    loaded: false,
    id: 1,
    showTopIcon: false,
    animationData: {},
    priceSortToUp: true,
    curSortTab: 1,
    sortId: 1,
    pageNum: 1,
    showAdPopup: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.userCityId) {
      wx.setStorageSync('cityId', options.userCityId)
    }
    if (options.src) {
      wx.setStorageSync('src', options.src)
    }
    if (options.uis) {
      wx.setStorageSync('uis', options.uis)
    }
    if (options.plan) {
      wx.setStorageSync('plan', options.plan)
    }
    if (options.unit) {
      wx.setStorageSync('unit', options.unit)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let cityId = wx.getStorageSync('cityId');
    this.setData({
      navigateHeight: app.systemData.statusBarHeight,
      bgiTop: app.systemData.statusBarHeight*2+84,
    })
    this.animation = wx.createAnimation({
      delay: 100,
      timingFunction:"ease"
    })

    if(this.data.from !== 'btmGoodsDetail'){
      this.setData({
        pageNum: 1
      })
    }
    if (!cityId && wx.getStorageSync("isLocation")) {
      wx.navigateTo({
        url: '/pages/address/index?src=goodsIndex',
      })
      return;
    } else if (cityId) {
      // 获取展届信息
      this.getActInfo(cityId)
    } else {
      // 定位
      util.getPositionCity("goodsIndex", () => {
        // 获取展届信息
        this.getActInfo(wx.getStorageSync('cityId'))
      })
    }
  },

  // 页面触底
  onReachBottom() {
    if(this.data.pageNum === 1) return;
    this.setData({
      loadDone: false
    })
    this.mallBtmListReq()
  },

  // 侧边块动画------
  onTouchMove() {
    wx.createSelectorQuery().select('.container').boundingClientRect(res => {
      if (res?.top !== 0) {
        this.animation.translateX(80).opacity(.3).step();
        this.setData({
          animationData: this.animation.export()
        })
      }
    }).exec();
  },

  onPageScroll: debounce(function (res) {
    this.animation.translateX(0).opacity(1).step();
    this.setData({
      animationData: this.animation.export()
    })

    wx.getSystemInfo({
      success: (result) => {
        if (res[0].scrollTop > (result.screenHeight / 2)) {
          let Timer = setTimeout(() => {
            this.setData({
              showTopIcon: true,
            })
            clearTimeout(Timer);
          }, 50);
        } else {
          this.setData({
            showTopIcon: false
          })
        }
      },
    })
  }),
  // -------------^

  onShareAppMessage(e) {
    if (e.from === 'button') {
      let data = e.target.dataset.sharedata;
      return data;
    }else{
      return {
        title: this.data.floorList.headerInfo.module_json.shareTitle,
        path: '/pages/goodsIndex/goodsIndex',
        imageUrl: this.data.floorList.headerInfo.module_json.shareImage
      }
    }
  },

  // 获取展届信息
  getActInfo(cityId) {
    SvipApi.activityInfo({
      cityId
    }).then((res) => {
      wx.setStorageSync("activityInfo", app.disposeData(res))
      wx.setStorageSync("sessionId", res.session)
      wx.setStorageSync("activityId", res.activity_id)
      wx.setStorageSync("curUserCityText", res.city_name)
      this.setData({
        activityInfo: wx.getStorageSync("activityInfo"),
        curUserCityText: res.city_name ? res.city_name : "未选择",
      })
      // 获取页面数据
      this.mallPage();
    })
  },

  // 首页全部数据请求
  mallPage() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let params = {
      page_type: 1
    }
    AbsApi.mallPage(params).then(res => {
      wx.hideLoading();
      if (res.status === 1) {
        this.setData({
          floorList: res.data
        })

        // 视频id创建
        if (res.data.contentInfo) {
          let videoList = res.data.contentInfo.filter(item => item.module_name === 'video')
          if (videoList.length) {
            for (let k in videoList[0].module_json.videoList) {
              let id = 'video' + k;
              this[id] = wx.createVideoContext(id, this)
            }
          }
        }

        // 弹屏广告一天弹一次
        if (res.data.popImgInfo) {
          let nowTime = new Date().getTime();
          let prevTime = wx.getStorageSync('indexAdPopTime');
          if (prevTime && nowTime - prevTime < 86400000) {
            this.setData({
              showAdPopup: false
            })
          } else {
            this.setData({
              showAdPopup: true
            })
            wx.setStorageSync('indexAdPopTime', nowTime)
          }
        }
      } else {
        this.setData({
          floorList: null
        })
      }

      if(this.data.from !== 'btmGoodsDetail'){
        this.mallBtmListReq();
      }else{
        this.setData({
          from: ''
        })
      }
      this.getSideAdv();
    })
  },

  // 底部商城列表
  mallBtmListReq() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let params = {
      category: this.data.curCategoryId,
      page: this.data.pageNum,
      pageSize: 10,
      sort: this.data.sortId,
      threeGoodAdv: 82,
      sixGoodAdv: 83,
    }
    if(this.data.btmTimer) clearTimeout(this.data.btmTimer);
    this.data.btmTimer = setTimeout(() => {
      AbsApi.mallPageCategoryList(params).then(res => {
        wx.hideLoading();
        if (res.status === 1) {
          let isReset = 0;
          if (!res.data.goodsArr.length) {
            this.setData({
              loadDone: true,
            })
            if (this.data.pageNum === 1) {
              this.setData({
                mallBtmList: [],
              })
              this.selectComponent("#waterfall") && this.selectComponent("#waterfall").render([], 1)
            }
            return;
          }
  
          if (this.data.pageNum === 1) {
            this.setData({
              mallBtmList: res.data,
            })
            if (this.data.curCategoryId === 0) {
              this.setData({
                curCategoryId: res.data.categoryList[0]?.category_id,
              })
            }
            isReset = 1;
          } else {
            let resGoodsList = [...this.data.mallBtmList.goodsArr, ...res.data.goodsArr];
            this.setData({
              'mallBtmList.goodsArr': resGoodsList
            })
          }
          this.selectComponent("#waterfall").render(this.data.mallBtmList.goodsArr, isReset)
          this.setData({
            pageNum: this.data.pageNum + 1,
          })
        } else {
          this.setData({
            mallBtmList: null
          })
        }
      })
    }, 100);
  },

  //选择城市
  chooseCity() {
    wx.navigateTo({
      url: '/pages/address/index?src=goodsIndex',
    })
  },

  // 秒光光切换
  toggleMggTab(e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    this.setData({
      mggCurList: item.goodsList,
      curTab: index
    })
  },

  // 切换商品分类
  toggleGoodsCategory(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      curCategoryId: id,
      pageNum: 1,
    })
    this.mallBtmListReq();
  },

  // 切换商品排序
  toggleSortTab(e) {
    let id = e.currentTarget.dataset.id;
    let sortId = e.currentTarget.dataset.id;
    if (this.data.curSortTab == 3 && id == 3) {
      this.setData({
        priceSortToUp: !this.data.priceSortToUp
      })
      sortId = this.data.priceSortToUp ? 3 : 4;
    } else {
      this.setData({
        priceSortToUp: true
      })
    }
    this.setData({
      curSortTab: id,
      sortId,
      pageNum: 1
    })
    this.mallBtmListReq();
  },

  // 返回顶部
  toTop() {
    let _this = this;
    wx.pageScrollTo({
      scrollTop: 0,
      success() {
        _this.setData({
          showTopIcon: false
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
    let item = e.currentTarget.dataset.item;
    console.log(item)
    let type = e.currentTarget.dataset.type;
    let pageUrl = type == 'sideAdv' ? item.url : item.appPage;
    if (item.is_jump_live_broadcast == 1) {
      //跳转直播间
      if (flag) {
        flag = false;
        //获取视频号信息
        if (wx.getChannelsLiveInfo) {
          wx.getChannelsLiveInfo({
            finderUserName: "sphTgeTCjc7M4Ri",
            success(res) {
              wx.openChannelsLive({
                finderUserName: "sphTgeTCjc7M4Ri",
                feedId: res?.feedId,
                nonceId: res?.nonceId,
                complete(res) {
                  setTimeout(() => {
                    flag = true;
                  }, 100);
                }
              })
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          })
        }
      }
    } else if (item.type) {
      //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
      if (item.type == 1) {
        if (this.isTab(pageUrl)) {
          wx.switchTab({
            url: pageUrl
          })
        } else {
          wx.navigateTo({
            url: pageUrl
          })
        }
      } else if (item.type == 2) {
        wx.navigateToMiniProgram({
          appId: item.appId,
          path: pageUrl,
        })
      } else {
        wx.navigateTo({
          url: '/pages/web/web?url=' + encodeURIComponent(item.url)
        })
      }
    }
  },

  // 跳转优惠券列表
  toCouponList() {
    wx.navigateTo({
      url: '/pages/couponList/couponList',
    })
  },

  // 跳转优惠券详情
  toCouponDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/expoPackage/couponDetail/couponDetail?couponId=' + id,
    })
  },

  // 领取优惠券
  getCoupon(e) {
    let item = e.currentTarget.dataset.item;
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '优惠券点击区域',
      SourcePage: 'pages/goodsIndex/goodsIndex',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (wx.getStorageSync("isLogin")) {
      wx.showLoading({
        title: '领取中...',
        mask: true
      })
      let data = {
        source_id: item.coupon_id,
        src_id: "coupon",
        mobile: wx.getStorageSync("userInfo").mobile,
        invite: "",
        // formId: e.detail.formId,
        'src': wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit')
      }
      marketingApi.postReserve(data).then((res) => {
        wx.hideLoading()
        if (res.code == 200) {
          this.setData({
            getCouponSuccess: true,
            couponItem: item,
            shareData: {
              title: "您的好友分享你一个优惠券，快快领取吧！",
              path: "/pages/expoPackage/couponDetail/couponDetail?couponId=" + item.coupon_id + "&couponInviteMobile=" + wx.getStorageSync("userInfo").mobile + "&cityId=" + wx.getStorageSync("cityId") + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId")
            }
          })
          this.mallPage();
        } else {
          wx.showToast({
            title: res.message ? res.message : "请求出错了",
            icon: "none"
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  //关闭领取成功弹层
  closeGetCoupon() {
    this.setData({
      getCouponSuccess: false
    })
  },

  // 跳转爆品组列表
  toHotGroupList() {
    wx.navigateTo({
      url: '/pages/expoPackage/hotGoodsGroup/hotGoodsGroup',
    })
  },

  // 跳转爆品详情
  toHotGoodsDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/hotGoodsOrder/detail/detail?detail_id=' + id,
    })
  },

  // 跳转爆品列表
  toHotGoodsList() {
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '爆品更多btn',
      SourcePage: 'pages/goodsIndex/goodsIndex',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    wx.navigateTo({
      url: '/pages/hotGoodsOrder/index/index',
    })
  },

  // 预约爆品
  reverseBtn(e) {
    let item = e.currentTarget.dataset.item;
    // 友盟统计
    wx.uma.trackEvent('click_getTicke', {
      cityId: wx.getStorageSync('cityId'),
      ButtonName: '爆品预约btn',
      SourcePage: 'pages/goodsIndex/goodsIndex',
      src: wx.getStorageSync('src'),
      uis: wx.getStorageSync('uis'),
    });
    if (wx.getStorageSync("isLogin")) {
      wx.showLoading({
        title: '预约中...',
        mask: true
      })
      let itemId = item.detail_id;
      let data = {
        source_id: itemId,
        src_id: "explosive",
        mobile: wx.getStorageSync("userInfo").mobile,
        invite: "",
        formId: "",
        'src': wx.getStorageSync('src'),
        'uis': wx.getStorageSync('uis'),
        'plan': wx.getStorageSync('plan'),
        'unit': wx.getStorageSync('unit')
      }
      marketingApi.postReserve(data).then((res) => {
        wx.hideLoading()
        if (res.code == 200) {
          this.setData({
            reserveSuccess: true,
            hotGoodsItem: item,
            shareData: {
              title: item.goods_name,
              path: "/pages/hotGoodsOrder/detail/detail?detail_id=" + item.detail_id + "&hotInviteMobile=" + wx.getStorageSync("userInfo").mobile + "&userCityId=" + (wx.getStorageSync('cityId') || 1) + "&activityId=" + wx.getStorageSync("activityId") + "&sessionId=" + wx.getStorageSync("sessionId"),
            }
          })
          AbsApi.addBrowseHistory({
            action_type: 2,
            goods_type: 1,
            goods_id: itemId,
            action_info: item.goods_name
          })
          this.mallPage();
        } else {
          wx.showToast({
            title: res.message ? res.message : "请求出错了",
            icon: "none"
          })
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  closeReserve() {
    this.setData({
      reserveSuccess: false
    })
  },

  // 跳转秒光光详情
  toMggDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages-abs/pages/productDetails/productDetails?Entrance=2&id=' + id,
    })
  },

  toMggList() {
    wx.navigateTo({
      url: '/pages-abs/pages/mggGoodsList/mggGoodsList',
    })
  },

  // 关闭弹屏广告
  closeAD() {
    this.setData({
      showAdPopup: false
    })
  },

  // 获取侧边运营位
  getSideAdv() {
    SvipApi.getAdvList({
      area_id: "85"
    }).then((res) => {
      if (res.status == 1 && res.data.adv85 && res.data.adv85.length) {
        this.setData({
          sideAdv: res.data.adv85[0] || null,
        })
      } else {
        this.setData({
          sideAdv: null,
        })
      }
    })
  },



  // 一个播放，其他暂停
  onVideoPlay(e) {
    let id = e.currentTarget.dataset.id;
    let list = [];
    let videoList = this.data.floorList.contentInfo.filter(item => item.module_name === 'video')
    for (let k in videoList[0].module_json.videoList) {
      let id = 'video' + k;
      list.push(id);
    }
    let restVedio = list.filter(val => val !== id);
    for (let item of restVedio) {
      this[item].pause();
    }
  },

})


function debounce(fn, interval) {
  let timer;
  let gapTime = interval || 100;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(this, arguments);
    }, gapTime);
  };
}