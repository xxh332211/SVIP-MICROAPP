import withWeapp, { getTarget, cacheOptions } from '@tarojs/with-weapp'
import {
  Block,
  View,
  Image,
  ScrollView,
  Text,
  Button,
  Swiper,
  SwiperItem,
  Video,
} from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import { absApi } from '../../common/api/absAPI.js'
const AbsApi = new absApi()
import { marketing } from '../../common/api/marketingApi.js'
let marketingApi = new marketing()
import { svip } from '../../common/api/svipApi.js'
const SvipApi = new svip()
import { util } from '../../common/util.js'
import OnlineServe from '../../components/onlineServe/onlineServe'
import HotGoodsPopup from '../../components/hotGoodsItem/hotGoodsPopup/hotGoodsPopup'
import Waterfall from '../../components/waterfall'
import PrivacyPopup from '../../components/privacyPopup/privacyPopup'
import fn from '../../imports/fn0.js'
import './goodsIndex.scss'
let app = Taro.getApp()
let tabUrls = [
  'pages/goodsIndex/goodsIndex',
  'pages/getTicket/getTicket',
  'pages/cloudShow/cloudShow',
  'pages/home/home',
  'pages/user/userHome',
]
let flag = true
cacheOptions.setOptionsToCache({
  /**
   * 页面的初始数据
   */
  data: {
    curUserCityText: '',
    goodsTabList: [
      {
        id: 1,
        text: '综合',
      },
      {
        id: 2,
        text: '销量',
      },
      {
        id: 3,
        text: '价格',
        type: 'up',
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
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let cityId = Taro.getStorageSync('cityId')
    this.setData({
      navigateHeight: app.systemData.statusBarHeight,
      bgiTop: app.systemData.statusBarHeight * 2 + 84,
    })
    this.animation = Taro.createAnimation({
      delay: 100,
      timingFunction: 'ease',
    })
    if (this.data.from !== 'btmGoodsDetail') {
      this.setData({
        pageNum: 1,
      })
    }
    if (!cityId && Taro.getStorageSync('isLocation')) {
      Taro.navigateTo({
        url: '/pages/address/index?src=goodsIndex',
      })
      return
    } else if (cityId) {
      // 获取展届信息
      this.getActInfo(cityId)
    } else {
      // 定位
      util.getPositionCity('goodsIndex', () => {
        // 获取展届信息
        this.getActInfo(Taro.getStorageSync('cityId'))
      })
    }
  },
  // 页面触底
  onReachBottom() {
    if (this.data.pageNum === 1) return
    this.setData({
      loadDone: false,
    })
    this.mallBtmListReq()
  },
  // 侧边块动画------
  onTouchMove() {
    Taro.createSelectorQuery()
      .select('.container')
      .boundingClientRect((res) => {
        if (res?.top !== 0) {
          this.animation.translateX(80).opacity(0.3).step()
          this.setData({
            animationData: this.animation.export(),
          })
        }
      })
      .exec()
  },
  onPageScroll: debounce(function (res) {
    this.animation.translateX(0).opacity(1).step()
    this.setData({
      animationData: this.animation.export(),
    })
    Taro.getSystemInfo({
      success: (result) => {
        if (res[0].scrollTop > result.screenHeight / 2) {
          let Timer = setTimeout(() => {
            this.setData({
              showTopIcon: true,
            })
            clearTimeout(Timer)
          }, 50)
        } else {
          this.setData({
            showTopIcon: false,
          })
        }
      },
    })
  }),
  // -------------^

  onShareAppMessage(e) {
    if (e.from === 'button') {
      let data = getTarget(e.target, Taro).dataset.sharedata
      return data
    } else {
      return {
        title: this.data.floorList.headerInfo.module_json.shareTitle,
        path: '/pages/goodsIndex/goodsIndex',
        imageUrl: this.data.floorList.headerInfo.module_json.shareImage,
      }
    }
  },
  // 获取展届信息
  getActInfo(cityId) {
    SvipApi.activityInfo({
      cityId,
    }).then((res) => {
      Taro.setStorageSync('activityInfo', app.disposeData(res))
      Taro.setStorageSync('sessionId', res.session)
      Taro.setStorageSync('activityId', res.activity_id)
      Taro.setStorageSync('curUserCityText', res.city_name)
      this.setData({
        activityInfo: Taro.getStorageSync('activityInfo'),
        curUserCityText: res.city_name ? res.city_name : '未选择',
      })
      // 获取页面数据
      this.mallPage()
    })
  },
  // 首页全部数据请求
  mallPage() {
    Taro.showLoading({
      title: '加载中...',
      mask: true,
    })
    let params = {
      page_type: 1,
    }
    AbsApi.mallPage(params).then((res) => {
      Taro.hideLoading()
      if (res.status === 1) {
        this.setData({
          floorList: res.data,
        })

        // 视频id创建
        if (res.data.contentInfo) {
          let videoList = res.data.contentInfo.filter(
            (item) => item.module_name === 'video'
          )
          if (videoList.length) {
            for (let k in videoList[0].module_json.videoList) {
              let id = 'video' + k
              this[id] = Taro.createVideoContext(id, this)
            }
          }
        }

        // 弹屏广告一天弹一次
        if (res.data.popImgInfo) {
          let nowTime = new Date().getTime()
          let prevTime = Taro.getStorageSync('indexAdPopTime')
          if (prevTime && nowTime - prevTime < 86400000) {
            this.setData({
              showAdPopup: false,
            })
          } else {
            this.setData({
              showAdPopup: true,
            })
            Taro.setStorageSync('indexAdPopTime', nowTime)
          }
        }
      } else {
        this.setData({
          floorList: null,
        })
      }
      if (this.data.from !== 'btmGoodsDetail') {
        this.mallBtmListReq()
      } else {
        this.setData({
          from: '',
        })
      }
      this.getSideAdv()
    })
  },
  // 底部商城列表
  mallBtmListReq() {
    Taro.showLoading({
      title: '加载中...',
      mask: true,
    })
    let params = {
      category: this.data.curCategoryId,
      page: this.data.pageNum,
      pageSize: 10,
      sort: this.data.sortId,
      threeGoodAdv: 82,
      sixGoodAdv: 83,
    }
    if (this.data.btmTimer) clearTimeout(this.data.btmTimer)
    this.setData({
      btmTimer: setTimeout(() => {
        AbsApi.mallPageCategoryList(params).then((res) => {
          Taro.hideLoading()
          if (res.status === 1) {
            let isReset = 0
            if (!res.data.goodsArr.length) {
              this.setData({
                loadDone: true,
              })
              if (this.data.pageNum === 1) {
                this.setData({
                  mallBtmList: [],
                })
                this.selectComponent('#waterfall') &&
                  this.selectComponent('#waterfall').render([], 1)
              }
              return
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
              isReset = 1
            } else {
              let resGoodsList = [
                ...this.data.mallBtmList.goodsArr,
                ...res.data.goodsArr,
              ]
              this.setData({
                'mallBtmList.goodsArr': resGoodsList,
              })
            }
            this.selectComponent('#waterfall').render(
              this.data.mallBtmList.goodsArr,
              isReset
            )
            this.setData({
              pageNum: this.data.pageNum + 1,
            })
          } else {
            this.setData({
              mallBtmList: null,
            })
          }
        })
      }, 100),
    })
  },
  //选择城市
  chooseCity() {
    Taro.navigateTo({
      url: '/pages/address/index?src=goodsIndex',
    })
  },
  // 秒光光切换
  toggleMggTab(e) {
    let item = getTarget(e.currentTarget, Taro).dataset.item
    let index = getTarget(e.currentTarget, Taro).dataset.index
    this.setData({
      mggCurList: item.goodsList,
      curTab: index,
    })
  },
  // 切换商品分类
  toggleGoodsCategory(e) {
    let id = getTarget(e.currentTarget, Taro).dataset.id
    this.setData({
      curCategoryId: id,
      pageNum: 1,
    })
    this.mallBtmListReq()
  },
  // 切换商品排序
  toggleSortTab(e) {
    let id = getTarget(e.currentTarget, Taro).dataset.id
    let sortId = getTarget(e.currentTarget, Taro).dataset.id
    if (this.data.curSortTab == 3 && id == 3) {
      this.setData({
        priceSortToUp: !this.data.priceSortToUp,
      })
      sortId = this.data.priceSortToUp ? 3 : 4
    } else {
      this.setData({
        priceSortToUp: true,
      })
    }
    this.setData({
      curSortTab: id,
      sortId,
      pageNum: 1,
    })
    this.mallBtmListReq()
  },
  // 返回顶部
  toTop() {
    let _this = this
    Taro.pageScrollTo({
      scrollTop: 0,
      success() {
        _this.setData({
          showTopIcon: false,
        })
      },
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
    let item = getTarget(e.currentTarget, Taro).dataset.item
    console.log(item)
    let type = getTarget(e.currentTarget, Taro).dataset.type
    let pageUrl = type == 'sideAdv' ? item.url : item.appPage
    if (item.is_jump_live_broadcast == 1) {
      //跳转直播间
      if (flag) {
        flag = false
        //获取视频号信息
        if (Taro.getChannelsLiveInfo) {
          Taro.getChannelsLiveInfo({
            finderUserName: 'sphTgeTCjc7M4Ri',
            success(res) {
              Taro.openChannelsLive({
                finderUserName: 'sphTgeTCjc7M4Ri',
                feedId: res?.feedId,
                nonceId: res?.nonceId,
                complete(res) {
                  setTimeout(() => {
                    flag = true
                  }, 100)
                },
              })
            },
          })
        } else {
          Taro.showModal({
            title: '提示',
            content:
              '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
          })
        }
      }
    } else if (item.type) {
      //type1为跳转自己的小程序,2为跳转其他小程序，3为跳转wap页
      if (item.type == 1) {
        if (this.isTab(pageUrl)) {
          Taro.switchTab({
            url: pageUrl,
          })
        } else {
          Taro.navigateTo({
            url: pageUrl,
          })
        }
      } else if (item.type == 2) {
        Taro.navigateToMiniProgram({
          appId: item.appId,
          path: pageUrl,
        })
      } else {
        Taro.navigateTo({
          url: '/pages/web/web?url=' + encodeURIComponent(item.url),
        })
      }
    }
  },
  // 跳转优惠券列表
  toCouponList() {
    Taro.navigateTo({
      url: '/pages/couponList/couponList',
    })
  },
  // 跳转优惠券详情
  toCouponDetail(e) {
    let id = getTarget(e.currentTarget, Taro).dataset.id
    Taro.navigateTo({
      url: '/pages/expoPackage/couponDetail/couponDetail?couponId=' + id,
    })
  },
  // 领取优惠券
  getCoupon(e) {
    let item = getTarget(e.currentTarget, Taro).dataset.item
    // 友盟统计
    Taro.uma.trackEvent('click_getTicke', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '优惠券点击区域',
      SourcePage: 'pages/goodsIndex/goodsIndex',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    if (Taro.getStorageSync('isLogin')) {
      Taro.showLoading({
        title: '领取中...',
        mask: true,
      })
      let data = {
        source_id: item.coupon_id,
        src_id: 'coupon',
        mobile: Taro.getStorageSync('userInfo').mobile,
        invite: '',
        // formId: e.detail.formId,
        src: Taro.getStorageSync('src'),
        uis: Taro.getStorageSync('uis'),
        plan: Taro.getStorageSync('plan'),
        unit: Taro.getStorageSync('unit'),
      }
      marketingApi.postReserve(data).then((res) => {
        Taro.hideLoading()
        if (res.code == 200) {
          this.setData({
            getCouponSuccess: true,
            couponItem: item,
            shareData: {
              title: '您的好友分享你一个优惠券，快快领取吧！',
              path:
                '/pages/expoPackage/couponDetail/couponDetail?couponId=' +
                item.coupon_id +
                '&couponInviteMobile=' +
                Taro.getStorageSync('userInfo').mobile +
                '&cityId=' +
                Taro.getStorageSync('cityId') +
                '&activityId=' +
                Taro.getStorageSync('activityId') +
                '&sessionId=' +
                Taro.getStorageSync('sessionId'),
            },
          })
          this.mallPage()
        } else {
          Taro.showToast({
            title: res.message ? res.message : '请求出错了',
            icon: 'none',
          })
        }
      })
    } else {
      Taro.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  //关闭领取成功弹层
  closeGetCoupon() {
    this.setData({
      getCouponSuccess: false,
    })
  },
  // 跳转爆品组列表
  toHotGroupList() {
    Taro.navigateTo({
      url: '/pages/expoPackage/hotGoodsGroup/hotGoodsGroup',
    })
  },
  // 跳转爆品详情
  toHotGoodsDetail(e) {
    let id = getTarget(e.currentTarget, Taro).dataset.id
    Taro.navigateTo({
      url: '/pages/hotGoodsOrder/detail/detail?detail_id=' + id,
    })
  },
  // 跳转爆品列表
  toHotGoodsList() {
    // 友盟统计
    Taro.uma.trackEvent('click_getTicke', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '爆品更多btn',
      SourcePage: 'pages/goodsIndex/goodsIndex',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    Taro.navigateTo({
      url: '/pages/hotGoodsOrder/index/index',
    })
  },
  // 预约爆品
  reverseBtn(e) {
    let item = getTarget(e.currentTarget, Taro).dataset.item
    // 友盟统计
    Taro.uma.trackEvent('click_getTicke', {
      cityId: Taro.getStorageSync('cityId'),
      ButtonName: '爆品预约btn',
      SourcePage: 'pages/goodsIndex/goodsIndex',
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    if (Taro.getStorageSync('isLogin')) {
      Taro.showLoading({
        title: '预约中...',
        mask: true,
      })
      let itemId = item.detail_id
      let data = {
        source_id: itemId,
        src_id: 'explosive',
        mobile: Taro.getStorageSync('userInfo').mobile,
        invite: '',
        formId: '',
        src: Taro.getStorageSync('src'),
        uis: Taro.getStorageSync('uis'),
        plan: Taro.getStorageSync('plan'),
        unit: Taro.getStorageSync('unit'),
      }
      marketingApi.postReserve(data).then((res) => {
        Taro.hideLoading()
        if (res.code == 200) {
          this.setData({
            reserveSuccess: true,
            hotGoodsItem: item,
            shareData: {
              title: item.goods_name,
              path:
                '/pages/hotGoodsOrder/detail/detail?detail_id=' +
                item.detail_id +
                '&hotInviteMobile=' +
                Taro.getStorageSync('userInfo').mobile +
                '&userCityId=' +
                (Taro.getStorageSync('cityId') || 1) +
                '&activityId=' +
                Taro.getStorageSync('activityId') +
                '&sessionId=' +
                Taro.getStorageSync('sessionId'),
            },
          })
          AbsApi.addBrowseHistory({
            action_type: 2,
            goods_type: 1,
            goods_id: itemId,
            action_info: item.goods_name,
          })
          this.mallPage()
        } else {
          Taro.showToast({
            title: res.message ? res.message : '请求出错了',
            icon: 'none',
          })
        }
      })
    } else {
      Taro.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  closeReserve() {
    this.setData({
      reserveSuccess: false,
    })
  },
  // 跳转秒光光详情
  toMggDetail(e) {
    let id = getTarget(e.currentTarget, Taro).dataset.id
    Taro.navigateTo({
      url: '/pages-abs/pages/productDetails/productDetails?Entrance=2&id=' + id,
    })
  },
  toMggList() {
    Taro.navigateTo({
      url: '/pages-abs/pages/mggGoodsList/mggGoodsList',
    })
  },
  // 关闭弹屏广告
  closeAD() {
    this.setData({
      showAdPopup: false,
    })
  },
  // 获取侧边运营位
  getSideAdv() {
    SvipApi.getAdvList({
      area_id: '85',
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
    let id = getTarget(e.currentTarget, Taro).dataset.id
    let list = []
    let videoList = this.data.floorList.contentInfo.filter(
      (item) => item.module_name === 'video'
    )
    for (let k in videoList[0].module_json.videoList) {
      let id = 'video' + k
      list.push(id)
    }
    let restVedio = list.filter((val) => val !== id)
    for (let item of restVedio) {
      this[item].pause()
    }
  },
})
function debounce(fn, interval) {
  let timer
  let gapTime = interval || 100
  return function () {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.call(this, arguments)
    }, gapTime)
  }
}
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const {
      floorList,
      bgiTop,
      navigateHeight,
      curUserCityText,
      mggCurList,
      curTab,
      mallBtmList,
      curCategoryId,
      goodsTabList,
      curSortTab,
      priceSortToUp,
      loadDone,
      sideAdv,
      animationData,
      showTopIcon,
      showAdPopup,
      getCouponSuccess,
      activityInfo,
      couponItem,
      shareData,
      reserveSuccess,
      hotGoodsItem,
    } = this.data
    return (
      <Block>
        <OnlineServe></OnlineServe>
        <PrivacyPopup></PrivacyPopup>
        <View
          className="container"
          onTouchMove={this.onTouchMove}
          style={{
            backgroundColor: `${
              floorList.headerInfo.module_json.backgroundType == 1 &&
              floorList.headerInfo.module_json.backgroundColor
            }`,
          }}
        >
          {floorList.headerInfo.module_json.backgroundType == 2 && (
            <Image
              mode="widthFix"
              className="page-bgi"
              style={{
                top: `${bgiTop / 40}rem`,
              }}
              src={floorList.headerInfo.module_json.backgroundImage}
            ></Image>
          )}
          {/*  导航栏  */}
          <View
            className="navigate"
            id="navigate"
            style={{
              paddingTop: `${navigateHeight / 20}rem`,
              backgroundColor: `${
                floorList.headerInfo.module_json.navBackgroundColor || '#fff'
              }`,
            }}
          >
            {floorList.headerInfo.module_json.navBackgroundType == 2 && (
              <Image
                className="nav-bgi"
                src={floorList.headerInfo.module_json.navBackgroundImage}
              ></Image>
            )}
            <View className="city" onClick={this.chooseCity}>
              {curUserCityText}
              <View className="ico"></View>
            </View>
            <View
              className="nav-text"
              style={{
                color: `${
                  floorList.headerInfo.module_json.navTextColor == 1
                    ? '#000'
                    : '#fff'
                }`,
              }}
            >
              {floorList.headerInfo.module_json.pageName}
            </View>
          </View>
          <View
            className="navigate-blank"
            style={{
              paddingTop: `${navigateHeight / 20}rem`,
            }}
          ></View>
          {/*  楼层列表  */}
          {floorList.contentInfo.map((item, index) => {
            return (
              <Block key={index}>
                <Template
                  is={item.module_name}
                  data={{
                    ...item,
                    mggCurList,
                    curTab,
                  }}
                  spread
                ></Template>
              </Block>
            )
          })}
          {/*  商品列表  */}
          {mallBtmList && mallBtmList.categoryList.length && (
            <View className="goods-wrap">
              <ScrollView scrollX="true" className="goods-nav-box">
                {mallBtmList.categoryList.map((item, index) => {
                  return (
                    <View
                      key={item.category_id}
                      className={
                        'goods-nav ' +
                        (item.category_id === curCategoryId && 'goods-nav-act')
                      }
                      onClick={this.toggleGoodsCategory}
                      data-id={item.category_id}
                    >
                      {item.category_name}
                    </View>
                  )
                })}
              </ScrollView>
              <View className="goods-main">
                <View className="goods-tab-box">
                  {goodsTabList.map((item, index) => {
                    return (
                      <View
                        key={item.id}
                        className={
                          'goods-tab ' +
                          (item.id === curSortTab && 'goods-tab-act')
                        }
                        onClick={this.toggleSortTab}
                        data-id={item.id}
                      >
                        <Text>{item.text}</Text>
                        <Block></Block>
                        {item.id === 3 && (
                          <Image
                            style={{
                              width: '0.3rem',
                              height: '0.525rem',
                              marginLeft: '0.15rem',
                            }}
                            src={
                              priceSortToUp ? '/imgs/up.png' : '/imgs/down.png'
                            }
                          ></Image>
                        )}
                      </View>
                    )
                  })}
                </View>
                <View className="goods-list">
                  <Waterfall
                    id="waterfall"
                    genericLayout="waterfall-item"
                  ></Waterfall>
                  <View className="loadMore">
                    {loadDone ? '没有更多商品了~' : '加载中...'}
                  </View>
                </View>
              </View>
            </View>
          )}
          {/*  侧边运营位  */}
          {sideAdv && (
            <Image
              animation={animationData}
              className="side-yyw"
              onClick={this.swiperUrl}
              src={
                sideAdv?.wap_image_url ||
                'https://img.51jiabo.com/77f127d4-58d1-4d2a-aa1c-482055da2c80.png'
              }
              data-type="sideAdv"
              data-item={sideAdv}
            ></Image>
          )}
          {/*  返回顶部按钮  */}
          {showTopIcon && (
            <Image
              animation={animationData}
              className="to-top"
              onClick={this.toTop}
              src="https://img.51jiabo.com/eba89cd7-08d5-4aee-aeb7-c2b9f4841c2d.png"
            ></Image>
          )}
          {/*  弹屏广告  */}
          {floorList.popImgInfo && showAdPopup && (
            <View className="cover" onTouchMove={this.privateStopNoop}>
              <View className="ad-img">
                <Image
                  src={floorList.popImgInfo.module_json.popInfo.imageUrl}
                  onClick={this.swiperUrl}
                  data-item={floorList.popImgInfo.module_json.popInfo}
                ></Image>
                <Image
                  className="ad-del"
                  src={require('../../imgs/closed.png')}
                  onClick={this.closeAD}
                ></Image>
              </View>
            </View>
          )}
          {/*  优惠券领取成功弹层  */}
          {getCouponSuccess && (
            <View className="get-ticket-box">
              <View className="get-ticket">
                <View className="txt-box">
                  <View className="tit1">领取成功</View>
                  <View className="tit2">
                    {activityInfo?.begin_date +
                      '-' +
                      activityInfo?.end_date +
                      '前往' +
                      activityInfo?.venue_name +
                      '下单使用'}
                  </View>
                </View>
                <View className="coupon-box">
                  <View className="left">
                    <View className="price">
                      <View className="lab">￥</View>
                      {couponItem?.coupon_value}
                    </View>
                    <View className="cond">
                      {'满' + couponItem?.consume_amount + '元可用'}
                    </View>
                  </View>
                  <View className="right">
                    <Image className="s-img" src={couponItem?.logo_url}></Image>
                    <View className="name">{couponItem?.brand_name}</View>
                    <View className="date">
                      {couponItem?.begin_date +
                        '-' +
                        couponItem?.end_date +
                        '使用'}
                    </View>
                  </View>
                </View>
                {/*  <view class='remaind'>分享好友优惠券，好友领取成功后，赠送您
              
                      <text class='remaind-txt'>10元</text>奖励金，可在我的-奖励金页面查看详细活动规则
              
                    </view>  */}
                <Button
                  openType="share"
                  data-sharedata={shareData}
                  className="share"
                >
                  赠送好友优惠券，一起逛展
                </Button>
                <View className="close" onClick={this.closeGetCoupon}></View>
              </View>
            </View>
          )}
          {/*  预约成功弹窗  */}
          {reserveSuccess && (
            <HotGoodsPopup
              shareData={shareData}
              hotGoodsItem={hotGoodsItem}
              onCloseReserve={this.closeReserve}
            ></HotGoodsPopup>
          )}
        </View>
      </Block>
    )
  }
}
export default _C
