import withWeapp, { getTarget, cacheOptions } from '@tarojs/with-weapp'
import {
  Block,
  View,
  ScrollView,
  Image,
  Text,
  Button,
} from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
// pages/mgg/mgg.js
import { svip } from '../../common/api/svipApi.js'
let SvipApi = new svip()
import { absApi } from '../../common/api/absAPI.js'
let AbsApi = new absApi()
import { marketing } from '../../common/api/marketingApi.js'
let marketingApi = new marketing()
import { util } from '../../common/util.js'
import OnlineServe from '../../components/onlineServe/onlineServe'
import LiveAdv from '../../components/liveAdv/liveAdv'
import BannerSwiper from '../../components/bannerSwiper/bannerSwiper'
import HotGoodsGroup from '../../components/hotGoodsGroup/hotGoodsGroup'
import TabBar from '../../custom-tab-bar/index'
import CouponPopup from '../../components/couponPopup/couponPopup'
import CouponBtn from '../../components/couponBtn/couponBtn'
import Authorize from '../../components/authorize/authorize'
import md from '../../imports/md1.js'
import './mgg.scss'
let app = Taro.getApp()
cacheOptions.setOptionsToCache({
  /**
   * 页面的初始数据
   */
  data: {
    tabData: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.from == 'share') {
      Taro.setStorageSync('src', 'YYXCX')
    }
    if (options.userCityId) {
      Taro.setStorageSync('cityId', options.userCityId)
    }
    let cityId = Taro.getStorageSync('cityId')
    if (
      cityId != 1 &&
      cityId != 2 &&
      cityId != 3 &&
      cityId != 6 &&
      cityId != 7 &&
      cityId != 8 &&
      cityId != 14 &&
      cityId != 15 &&
      cityId != 17 &&
      cityId != 19 &&
      cityId != 23 &&
      cityId != 54
    ) {
      Taro.switchTab({
        url: '/pages/cloudShow/cloudShow',
      })
      return
    }
    if (options.src) {
      Taro.setStorageSync('src', options.src)
    }
    if (options.uis) {
      Taro.setStorageSync('uis', options.uis)
    }
    //广告投放参数
    if (options.gdt_vid) {
      Taro.setStorageSync('gdt_vid', options.gdt_vid)
    }
    if (options.weixinadinfo) {
      Taro.setStorageSync('weixinadinfo', options.weixinadinfo)
    }
    this.setData({
      navigateHeight: app.systemData.statusBarHeight,
      selected: 2,
      actOffLine: false,
    })
    this.detailTop = []
    //加个判断，如果定位过或者拒绝过定位，则永远不提示定位
    if (!cityId && Taro.getStorageSync('isLocation')) {
      Taro.navigateTo({
        url: '/pages/address/index?src=mgg',
      })
      return
    } else if (cityId) {
      //获取页面所有接口信息
      this.getRequestInfo()
    } else {
      //定位
      util.getPositionCity('mgg', () => {
        this.setData({
          curUserCityText: Taro.getStorageSync('curUserCityText'),
        })
        //定位成功请求数据
        this.getRequestInfo()
      })
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
    this.setData({
      showTicketPopup: false,
      showCouponPopup: false,
      showCouponBtn: false,
      isLogin: Taro.getStorageSync('isLogin'),
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
    // 友盟统计
    Taro.uma.trackEvent('enter_mgg_list', {
      userCityId: Taro.getStorageSync('cityId'),
      src: Taro.getStorageSync('src'),
      uis: Taro.getStorageSync('uis'),
    })
    this.checkHasTicket()
    this.getSvipCoupon()
  },
  getSvipCoupon(detail) {
    //已登录&&当天首次登录&&有抵扣券 || 未登录&&有抵扣券 ，显示抵扣券弹层
    SvipApi.firstLoginCheck().then((res) => {
      if (res.status == 1) {
        if (res.data.firstStatus == 1 && !detail) {
          //获取svip抵扣券列表
          this.svipCouponData()
        } else {
          this.setData({
            showCouponPopup: false,
          })
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
  },
  getRequestInfo() {
    Taro.showLoading({
      title: '加载中...',
      mask: true,
    })
    SvipApi.activityInfo({
      cityId: Taro.getStorageSync('cityId'),
    }).then((res) => {
      this.setData({
        expoEndTime: res.end_date,
        curUserCityText: res.city_name,
      })
      Taro.setStorageSync('activityInfo', app.disposeData(res))
      Taro.setStorageSync('sessionId', res.session)
      Taro.setStorageSync('activityId', res.activity_id)
      Taro.setStorageSync('curUserCityText', res.city_name)
      //获取视频号信息
      let that = this
      if (Taro.getChannelsLiveInfo) {
        Taro.getChannelsLiveInfo({
          finderUserName: 'sphTgeTCjc7M4Ri',
          success(res) {
            that.setData({
              liveData: res,
            })
          },
          fail(res) {
            console.log(res)
          },
        })
      }
      //获取运营位
      SvipApi.getAdvList({
        area_id: '61,62,78',
      }).then((res) => {
        // 61:获取banner 61:品牌列表入口运营位
        if (res.status == 1) {
          this.setData({
            banner: res.data.adv61 || [],
            brandAdv: res.data.adv62 || [],
            liveAdv: res.data.adv78 || [],
          })
        } else {
          this.setData({
            banner: [],
            brandAdv: [],
            liveAdv: [],
          })
        }
        //获取秒杀档位及对应商品
        AbsApi.getAbsGoodsList().then((res) => {
          if (res.status == 1) {
            let data = res.data.map((v) => {
              v.id = `level-${v.id}`
              v.type = 'number'
              return v
            })
            let tData = JSON.parse(JSON.stringify(data))
            tData.push(
              {
                level_content: '采购清单',
                id: 'shoppingList',
                type: 'string',
              },
              // {
              //   level_content: "主题馆",
              //   id: "themePavilion",
              //   type: "string"
              // },
              {
                level_content: '最近浏览',
                id: 'browseHistory',
                type: 'string',
              },
              {
                level_content: '吐槽箱',
                id: 'opinion',
                type: 'string',
              }
            )
            let endDate = +new Date(
                res.data[0].activity_end_time.replace(/-/g, '/')
              ),
              now = +new Date()
            this.setData({
              tabData: tData,
              goodsList: data,
              actEnd: now > endDate ? true : false,
            })
            //获取爆品组
            marketingApi.getGoodsGroup().then((res) => {
              if (res.status == 1) {
                this.setData({
                  goodsGroup: res.data,
                })
              }
              //获取浏览记录
              AbsApi.getBrowseHistory().then((res) => {
                if (res.status == 1) {
                  this.setData({
                    historyData: res.data,
                  })
                }
                setTimeout(() => {
                  this.getHeadTop()
                }, 1000)
              })
            })
          } else {
            Taro.hideLoading()
            this.setData({
              goodsList: [],
              actOffLine: true,
            })
          }
        })
      })
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
  //授权手机号回调
  getPhoneBack(e) {
    let detail = e.detail
    this.setData({
      isAuth: true,
      isLogin: true,
    })
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.getSvipCoupon(detail)
  },
  //是否索票
  checkHasTicket() {
    if (Taro.getStorageSync('src') == 'pyqabs') {
      let outTime = new Date().getTime()
      marketingApi.getTicketsInfo().then((res) => {
        if (res.status == -1 || !res.data.hasGetTicket) {
          SvipApi.activityInfo({
            cityId: Taro.getStorageSync('cityId'),
          }).then((res) => {
            let resData = res
            // 是否首次弹层
            marketingApi
              .recordTicketPopup({
                activity_end_time: resData.end_date,
              })
              .then((res) => {
                if (res.status == 1 && res.data.firstStatus == 1) {
                  let inTime = new Date().getTime()
                  setTimeout(() => {
                    this.setData({
                      showTicketPopup: true,
                    })
                  }, 3000 - (inTime - outTime))
                }
              })
          })
        }
      })
    }
  },
  //授权手机号同时领取门票
  getPhoneNumber(e) {
    e.source = 'mgg'
    util.authorizePhone(e, this.data.wxcode, () => {
      this.setData({
        isAuth: true,
        isLogin: true,
      })
      this.getSvipCoupon()
      //索票
      this.freeGet()
    })
  },
  //免费索票
  freeGet() {
    Taro.showLoading({
      title: '索票中...',
      mask: true,
    })
    //索票接口
    let data = {
      source_id: '',
      src_id: 'ticket',
      mobile: Taro.getStorageSync('userInfo').mobile,
      invite: '',
      formId: '',
      src: 'pyqabs',
      uis: Taro.getStorageSync('uis'),
      plan: Taro.getStorageSync('plan'),
      unit: Taro.getStorageSync('unit'),
    }
    marketingApi.postReserve(data).then((res) => {
      Taro.hideLoading()
      this.setData({
        showTicketPopup: false,
      })
      if (res.code == 200) {
        Taro.setStorageSync('shareTicketId', res.ticket_id)
        Taro.setStorageSync('nextActivity', res.activityInfo)
        Taro.showToast({
          title: res.message,
          icon: 'none',
        })
        //提交投放参数
        Taro.request({
          url: 'https://api.51jiabo.com/youzan/wxAD/wxReported',
          method: 'POST',
          data: {
            clickId: Taro.getStorageSync('gdt_vid'),
            weixinadinfo: Taro.getStorageSync('weixinadinfo'),
            type: 1,
            cityId: Taro.getStorageSync('cityId'),
            session: Taro.getStorageSync('sessionId'),
            mobile: Taro.getStorageSync('userInfo').mobile,
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          complete: function (res) {
            Taro.removeStorageSync('gdt_vid')
            Taro.removeStorageSync('weixinadinfo')
            console.log(res, '投放接口')
          },
        })
      } else {
        Taro.showToast({
          title: res.message ? res.message : '请求出错了',
          icon: 'none',
        })
      }
    })
  },
  closeTicket() {
    this.setData({
      showTicketPopup: false,
    })
  },
  getHeadTop() {
    const that = this
    const query = Taro.createSelectorQuery()
    query
      .select('#navigate')
      .boundingClientRect((rect) => {
        this.setData({
          top: rect ? rect.height : 62,
        })
      })
      .exec()
    query
      .select('.tab-box')
      .boundingClientRect((rect) => {
        this.setData({
          height: app.systemData.screenHeight - rect.height,
          marginTop: rect.height + this.data.top,
        })
        for (let i of that.data.tabData) {
          const query2 = Taro.createSelectorQuery()
          query2.select(`#${i.id}-detail`).boundingClientRect()
          query2.selectViewport().scrollOffset()
          query2.exec(function (res) {
            if (res[0]) {
              that.detailTop.push({
                id: i.id,
                height: res[0] && res[0].height,
                top: Math.floor(res[0].top - that.data.marginTop),
              })
            }
          })
        }
        Taro.hideLoading()
        console.log(that.detailTop)
      })
      .exec()
  },
  //选择城市
  chooseCity() {
    Taro.navigateTo({
      url: '/pages/address/index?src=mgg',
    })
  },
  toGoodsDetail(e) {
    let item = getTarget(e.currentTarget, Taro).dataset.item
    if (!Taro.getStorageSync('uis')) {
      Taro.setStorageSync('uis', '推荐页购买')
    }
    // 活动未过期跳转秒光光商品详情，已过期跳转普通商品详情
    Taro.navigateTo({
      url:
        '/pages-abs/pages/productDetails/productDetails?Entrance=2&id=' +
        item.prerogative_id,
    })
    AbsApi.addBrowseHistory({
      action_type: 2,
      goods_type: 2,
      goods_id: item.prerogative_id,
      action_info: item.prerogative_name,
    }).then((res) => {})
  },
  selTab(e) {
    let item = getTarget(e.currentTarget, Taro).dataset.item
    let scrollTop = 0
    let top = 0
    let that = this
    // that.setData({
    //   currentView: item.id
    // })
    const query = Taro.createSelectorQuery()
    query.select(`#${item.id}-detail`).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      top = res[0].top // #the-id节点的上边界坐标
      scrollTop = res[1].scrollTop // 显示区域的竖直滚动位置
      Taro.pageScrollTo({
        scrollTop: top + scrollTop - that.data.marginTop,
        complete(res) {
          setTimeout(() => {
            if (that.isTouchBottom) {
              that.setData({
                currentView: item.id,
              })
            }
          }, 100)
          // console.log(res)
        },
      })
    })
  },
  onPageScroll(e) {
    const that = this
    for (let i of that.detailTop) {
      if (e.scrollTop >= i.top && e.scrollTop < i.top + i.height) {
        that.setData({
          currentView: i.id,
        })
      }
    }
  },
  toShoppingList() {
    Taro.navigateTo({
      url: '/pages-abs/pages/shoppingList/shoppingList',
    })
  },
  toOpinion() {
    Taro.navigateTo({
      url: '/pages-abs/pages/opinion/opinion',
    })
  },
  toTheme(e) {
    let type = getTarget(e.currentTarget, Taro).dataset.type
    Taro.navigateTo({
      url: '/pages-live/pages/theme/theme?pid=' + type,
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.isTouchBottom = true
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      imageUrl: '',
      path: `/pages/mgg/mgg?from=share&userCityId=${Taro.getStorageSync(
        'cityId'
      )}&uis=${Taro.getStorageSync('uis')}`,
    }
  },
  // 跳转品牌列表
  toBrandList: function () {
    Taro.navigateTo({
      url: '/pages-abs/pages/brandList/brandList',
    })
  },
})
@withWeapp(cacheOptions.getOptionsFromCache())
class _C extends React.Component {
  render() {
    const {
      navigateHeight,
      curUserCityText,
      banner,
      liveData,
      goodsGroup,
      brandAdv,
      actOffLine,
      top,
      currentView,
      tabData,
      goodsList,
      actEnd,
      historyData,
      showTicketPopup,
      isLogin,
      showCouponBtn,
      couponInfo,
      showCouponPopup,
      isAuth,
      liveAdv,
      selected,
    } = this.data
    return (
      <Block>
        <OnlineServe from="'custom'"></OnlineServe>
        <View className="container">
          <View
            className="navigate"
            id="navigate"
            style={{
              paddingTop: `${navigateHeight / 20}rem`,
            }}
          >
            <View className="city" onClick={this.chooseCity}>
              {curUserCityText}
              <View className="ico"></View>
            </View>
            <View className="nav-text">华夏家博</View>
          </View>
          <View
            className="navigate-blank"
            style={{
              paddingTop: `${navigateHeight / 20}rem`,
            }}
          ></View>
          {/*  轮播  */}
          {banner && banner?.length > 0 && (
            <BannerSwiper banner={banner} liveData={liveData}></BannerSwiper>
          )}
          {/*  爆品组  */}
          {goodsGroup?.map((item, index) => {
            return (
              <Block>
                {md.indexof(item.banner_info, '76') && (
                  <View key={index}>
                    <HotGoodsGroup groupItem={item}></HotGoodsGroup>
                  </View>
                )}
              </Block>
            )
          })}
          {/*  品牌列表运营位  */}
          <View className="brand-box" onClick={this.toBrandList}>
            {brandAdv && brandAdv?.length > 0 && (
              <BannerSwiper
                banner={brandAdv}
                liveData={liveData}
              ></BannerSwiper>
            )}
            {/*  <image class="adv-img" mode="widthFix" src="{{brandAdv[0].wap_image_url}}"></image>  */}
          </View>
          {!actOffLine && (
            <View
              className="tab-box"
              style={{
                top: `${top / 20}rem`,
              }}
            >
              <ScrollView
                className="tab-scroll"
                scrollX="true"
                enableFlex
                scrollAnchoring
                scrollIntoView={currentView}
              >
                {tabData?.map((item, index) => {
                  return (
                    <Block>
                      {item.goods_list.length != 0 && (
                        <View
                          className={
                            'tab-item ' + (currentView == item.id ? 'act' : '')
                          }
                          id={item.id}
                          key={index}
                          data-item={item}
                          onClick={this.selTab}
                        >
                          {item.level_content}
                        </View>
                      )}
                    </Block>
                  )
                })}
              </ScrollView>
            </View>
          )}
          {goodsList?.map((item, index) => {
            return (
              <Block>
                {item.goods_list.length != 0 && (
                  <View
                    className="seckill"
                    id={item.id + '-detail'}
                    key={index}
                  >
                    <View className="seckill-title">
                      <View className="line"></View>
                      <View className="logo"></View>
                      <View className="price">
                        <View className="num">{item.level_content}</View>秒光光
                      </View>
                    </View>
                    <View className="item-wrap">
                      {item.goods_list.map((v, index) => {
                        return (
                          <View
                            className="goods-item"
                            key={index}
                            data-item={v}
                            onClick={this.toGoodsDetail}
                          >
                            <View className="img-box">
                              <Image
                                className="goods-img"
                                src={v.image_url}
                              ></Image>
                              {actEnd && (
                                <View className="end">活动已结束</View>
                              )}
                            </View>
                            <View className="info-content">
                              <View className="name">{v.prerogative_name}</View>
                              {/*  is_openprice:是否开放自定义价格：-1：否1：是  */}
                              {/*  配置自定义价格，显示自定义价格，否则显示活动价  */}
                              {/*  全款商品  */}
                              {v.pay_way == 2 ? (
                                <View className="current-price">
                                  <Text className="sign">￥</Text>
                                  <Text className="num">
                                    {md.numFormat(v.activity_price)}
                                  </Text>
                                </View>
                              ) : (
                                <View className="current-price">
                                  订金：<Text className="sign">￥</Text>
                                  <Text className="num">
                                    {md.numFormat(v.earnest)}
                                  </Text>
                                </View>
                              )}
                              {/*  定金商品  */}
                              {/*  pay_way：1订金商品：订金价;2全款商品：活动价  */}
                              {/*  全款商品  */}
                              {v.pay_way == 2 && (
                                <View className="total-price total">
                                  {'￥' + md.numFormat(v.market_price)}
                                </View>
                              )}
                              {/*  定金商品自定义价格  */}
                              {v.pay_way == 1 && v.is_openprice == 1 && (
                                <View className="total-price">
                                  <Text>优惠价：</Text>
                                  {'￥' + v.define_price}
                                </View>
                              )}
                              {/*  定金商品非自定义价格  */}
                              {v.pay_way == 1 && v.is_openprice != 1 && (
                                <View className="total-price">
                                  <Text>优惠价：</Text>
                                  {'￥' + md.numFormat(v.activity_price)}
                                </View>
                              )}
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                )}
              </Block>
            )
          })}
          {/*  购物清单  */}
          <View
            className="shopping-list"
            id="shoppingList-detail"
            onClick={this.toShoppingList}
          >
            <Image
              className="list-img"
              mode="widthFix"
              src="https://img.51jiabo.com/2284fea9-4b61-4e97-86f6-fd0c87193508.png"
            ></Image>
          </View>
          {/*  主题馆  */}
          {/*  <view class="theme" id="themePavilion-detail">
          
              <view class="title">主题馆</view>
          
              <view class="content">
          
                <view class="left">
          
                  <view class="elec" data-type="35" bindtap="toTheme">
          
                    <image class="elec-img" src="https://img.51jiabo.com/70ba86ee-84a0-44e1-8f4b-9976b72c8d01.png"></image>
          
                    <view class="elec-layer">
          
                      <view class="text">家用电器</view>
          
                      <view class="go">GO</view>
          
                    </view>
          
                  </view>
          
                  <view class="theme-item" data-type="33" bindtap="toTheme">
          
                    <image class="theme-img" src="https://img.51jiabo.com/73a68fa1-7f44-4d70-b313-2d4ae8809b49.png"></image>
          
                    <view class="layer">地板门窗</view>
          
                  </view>
          
                </view>
          
                <view class="right">
          
                  <view class="theme-item" data-type="32" bindtap="toTheme">
          
                    <image class="theme-img" src="https://img.51jiabo.com/66ce0eb2-0b32-4d8a-ad50-92a1e086703c.png"></image>
          
                    <view class="layer">厨房卫浴</view>
          
                  </view>
          
                  <view class="theme-item" data-type="34" bindtap="toTheme">
          
                    <image class="theme-img" src="https://img.51jiabo.com/e536b353-d14d-4fc8-a702-f3c3343ae12a.png"></image>
          
                    <view class="layer">家具软装</view>
          
                  </view>
          
                  <view class="theme-item" data-type="36" bindtap="toTheme">
          
                    <image class="theme-img" src="https://img.51jiabo.com/6a2d6bed-2f8b-4e90-af6b-d398bdfbd032.png"></image>
          
                    <view class="layer">综合建材</view>
          
                  </view>
          
                </view>
          
              </view>
          
            </view>  */}
          {/*  最近浏览  */}
          <View className="browse-history" id="browseHistory-detail">
            <View className="history-title">最近浏览</View>
            <View className="history-content">
              {historyData?.map((item, index) => {
                return (
                  <View
                    className={
                      'history-item ' + (item.action_type == 1 ? 'store' : '')
                    }
                    key={index}
                  >
                    <View className="type">
                      {item.action_type == 1 ? '店铺' : '商品'}
                    </View>
                    {item.action_info}
                  </View>
                )
              })}
            </View>
          </View>
          {/*  吐槽箱  */}
          <View
            className="opinion"
            id="opinion-detail"
            onClick={this.toOpinion}
          >
            <Image
              className="opinion-img"
              src="https://img.51jiabo.com/da62f6a0-4201-4434-b217-373240358b1f.png"
            ></Image>
          </View>
        </View>
        {/*  领取门票弹层  */}
        {showTicketPopup && (
          <View className="ticket-popup">
            <View className="ticket-box">
              <Image
                className="bg"
                mode="widthFix"
                src="https://img.51jiabo.com/24c46ac5-798b-476f-b828-b74efe5dd0c6.png"
              ></Image>
              <View className="head">
                <View className="thin">您浏览的商品需到展会现场购买领取</View>
                <View className="bold">免费赠送您价值20元华夏家博会门票</View>
              </View>
              <Image
                className="ticket"
                src="https://img.51jiabo.com/2de83b03-000a-4896-b32a-c56039e8647e.png"
              ></Image>
              {!isLogin && (
                <Button
                  className="get-btn"
                  openType="getPhoneNumber"
                  onGetphonenumber={this.getPhoneNumber}
                >
                  领取门票
                </Button>
              )}
              {isLogin && (
                <View className="get-btn" onClick={this.freeGet}>
                  领取门票
                </View>
              )}
              <View className="ticket-close" onClick={this.closeTicket}></View>
            </View>
          </View>
        )}
        {/*  领取svip抵扣券按钮  */}
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
        {!isAuth && (
          <Authorize
            isMgg="true"
            navHeight={navigateHeight}
            onGetPhoneBack={this.getPhoneBack}
          ></Authorize>
        )}
        {/*  直播运营位弹层  */}
        <LiveAdv
          isMgg="true"
          navHeight={navigateHeight}
          liveData={liveData}
          liveAdv={liveAdv}
          areaId="78"
        ></LiveAdv>
        {/*  自定义tabbar  */}
        <TabBar selected={selected}></TabBar>
      </Block>
    )
  }
}
export default _C
