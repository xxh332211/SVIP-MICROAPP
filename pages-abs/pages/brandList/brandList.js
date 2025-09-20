// pages-abs/pages/brandList/brandList.js
import {
    absApi
} from "../../../common/api/absAPI";
import {
    svip
} from "../../../common/api/svipApi"
const AbsApi = new absApi()
const SvipApi = new svip();
Page({
    data: {
        list: [],
        tabUrls: [
            'pages/goodsIndex/goodsIndex',
            'pages/getTicket/getTicket',
            'pages/cloudShow/cloudShow',
            'pages/home/home',
            'pages/user/userHome'
        ]
    },
    onLoad: function (options) {
        this.initData()
        // 品牌列表 头部banner
        SvipApi.getAdvList({
            area_id: "65"
        }).then((res) => {
            if (res.status == 1) {
                this.setData({
                    brandAdv: res.data.adv65 || [],
                })
            } else {
                this.setData({
                    brandAdv: []
                })
            }

        })
    },
    initData() {
        const that = this
        AbsApi.getBrandList().then(res => {
            wx.hideLoading()
            console.log(res);
            that.setData({
                list: res.data
            })
        }).catch(err => {
            wx.hideLoading()
            wx.showToast({
                title: err.message,
            })
        })
    },
    toShop(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages-live/pages/storeDetail/storeDetail?supplier_id=' + id
        })
    },
    // 运营位链接跳转
    swiperUrl(e) {
        // 友盟统计
        wx.uma.trackEvent('click_AD', {
            cityId: wx.getStorageSync('cityId'),
            ADID: e.currentTarget.dataset.area_id,
            src: wx.getStorageSync('src'),
            uis: wx.getStorageSync('uis')
        });

        const type = e.currentTarget.dataset.type;
        const url = e.currentTarget.dataset.url

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
                appId: appid,
                path: url
            })
        } else {
            wx.navigateTo({
                url: '/pages/web/web?url=' + encodeURIComponent(url)
            })
        }
    },
    // 判断url是否为tabbar
    isTab(url) {
        for (let item of this.data.tabUrls) {
            if (url.indexOf(item) > -1) {
                return true
            }
        }
    },
})