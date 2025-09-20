import apiService from '../../../common/http/httpService_mall'
import utils from '../../../utils/utils'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    score: 0,
    count: 0,
    days: [{}, {}, {}, {}, {}, {}, {}],
    modal1Visible: false,
    modal2Visible: false,
    modal3Visible: false,
    signScore: 0,
    signScoreExtra: 0,
    states: {},
    statesArray: [],

    banners: []
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onLoad: function() {
    this.loadAdv()
  },
  onShow: function() {
    this.loadData()
  },

  loadAdv () {
    apiService('common/advertisement', 'GET', {name: '积分中心运营位', column: '积分中心', position: '积分任务上方', cityId: wx.getStorageSync('cityId') || 1}).then(rst => {
      this.setData({
        banners: rst || []
      })
    })
  },
  isTab (url) {
    let tabUrls = [
      'pages/goodsIndex/goodsIndex',
      'pages/getTicket/getTicket',
      'pages/home/home',
      'pages/user/userHome'
    ]
    for (let item of tabUrls) {
      if (url.indexOf(item) > -1) {
        return true
      }
    }
  },
  toUrl (evt) {
    let url = evt.currentTarget.dataset.url
    if (!url) return
    if (url.indexOf('http') === 0) {
      wx.navigateTo({
        url: '/pages/web/web?url=' + encodeURIComponent(url)
      })
    } else {
      if (this.isTab(url)) {
        wx.switchTab({
          url
        })
      } else {
        wx.navigateTo({
          url
        })
      }
    }
  },

  loadData (noLoading) {
    apiService('member/score/total', 'GET')
      .then(rst => {
        let score = Math.floor(rst.total)
        this.setData({
          score
        })
      })
      .catch(() => {})
    apiService('member/score/completeness', 'GET')
      .then(rst => {
        let obj = {}
        for (let item of rst) {
          switch(item.code) {
            case '02':
              item.icon = 'https://img.51jiabo.com/imgs-mall/icon-scorecenter-svip.svg'
              break
            default:
              item.icon = 'https://img.51jiabo.com/imgs-mall/icon-scorecenter-svip.svg'
              break
          }
          obj[item.code] = item
        }
        this.setData({
          statesArray: rst,
          states: obj
        })
      })
      .catch(() => {})
      
    !noLoading && wx.showLoading()
    apiService('member/score/list/by/type/days', 'GET', {code: '01', days: 7})
      .then(rst => {
        let tmp = []
        let today = utils.dateFormat(new Date(), 'YYYY/MM/DD')
        for (let i = 0; i < rst.length; i++){
          let t = utils.dateFormat(rst[i].createTime, 'YYYY/MM/DD')
          let t1 = tmp.length ? utils.dateFormat(tmp[tmp.length - 1].createTime, 'YYYY/MM/DD') : ''
          if (today === t) {
            if (rst[i].description.indexOf('连续') > -1) {
              this.setData({
                signScoreExtra: rst[i].value
              })
            } else {
              this.setData({
                signScore: rst[i].value
              })
            }
          } else {
            if (rst[i].description.indexOf('连续') > -1) {
              break
            }
          }
          if (t === t1) continue
          tmp.push(rst[i])
        }
        rst = tmp
        let days = [{}, {}, {}, {}, {}, {}, {}]
        let count = 0
        let i = 0
        let t = rst.length && utils.dateFormat(rst[0].createTime, 'YYYY/MM/DD') || ''
        if (rst.length > 0 && t === today) {
          // 如果当天已签到
          days[0].date = t
          i++
          count++
          this.setData({
            signed: true
          })
          wx.hideLoading()
        } else {
          // 没有签到
          apiService('member/score/add', 'POST', { scoreCode: '01' }).then(rst => {
            this.setData({
              signed: true,
              signScore: rst.score,
              signScoreExtra: rst.bonus
            })
            let yes = new Date()
            yes.setHours(yes.getHours() - 24)
            yes = utils.dateFormat(yes, 'YYYY/MM/DD')
            let yestodaySigned = rst.length > 1 && utils.dateFormat(rst[0].createTime, 'YYYY/MM/DD') === yes
            if (yestodaySigned || !this.hasSignRecord()) {
              this.setData({
                modal1Visible: true
              })
            } else {
              this.setData({
                modal2Visible: false
              })
            }
            this.loadData(true)
          })
        }
        for (; i < rst.length && i < days.length; i++) {
          let ct = utils.dateFormat(rst[i].createTime, 'YYYY/MM/DD')
          let d = new Date()
          d.setHours(d.getHours() - i * 24)
          d = utils.dateFormat(d, 'YYYY/MM/DD')
          if (ct !== d) {
            break
          }
          days[i].date = d
          count++;
        }
        this.setData({
          days,
          count
        })
      })
      .catch(() => {
        wx.hideLoading()
      })
  },
  showRule () {
    wx.navigateTo({
      url: '/pages/scoreRule/scoreRule'
    })
  },
  showDesc (evt) {
    wx.showModal({
      title: '积分规则',
      showCancel: false,
      content: evt.currentTarget.dataset.desc,
      confirmText: '知道了'
    })
  },
  toDetail () {
    wx.navigateTo({
      url: '/pages/scoreRecords/scoreRecords'
    })
  },
  hasSignRecord () {
    for (let d of this.data.days){
      if (d.date) return true
    }
    return false
  },
  closeModal1 () {
    this.setData({
      modal1Visible: false
    })
  },
  closeModal2 () {
    this.setData({
      modal2Visible: false
    })
  },
  closeModal3 () {
    this.setData({
      modal3Visible: false
    })
  },
  signin () {
    if (this.data.signed) return
    this.data.loading = true
    apiService('member/score/add', 'POST', { scoreCode: '01' }).then(() => {
      let yes = new Date()
      yes.setHours(yes.getHours() - 24)
      yes = utils.dateFormat(yes, 'YYYY/MM/DD')
      let yestodaySigned = this.data.days.length > 1 && this.data.days[0].date === yes
      if (yestodaySigned || !this.hasSignRecord()) {
        this.setData({
          modal1Visible: true
        })
      } else {
        this.setData({
          modal2Visible: false
        })
      }
      this.data.loading = false
      this.setData({
        signed: true
      })
    }).catch(() => {
      this.data.loading = false
    })
  },
  doTask (evt) {
    let code = evt.currentTarget.dataset.code
    if (this.data.states[code].completed){
      return
    }
    switch(code){
      // 完善用户信息
      case '02':
        wx.navigateTo({
          url: '/pages/userCenter/userCenter'
        })
        break
      // 关注公众号
      case '03':
        break
      // 领取优惠券
      case '04':
        wx.navigateTo({
          url: '/pages/couponList/couponList'
        })
        break
      // 预约爆品
      case '05':
        wx.navigateTo({
          url: '/pages/hotGoodsOrder/index/index'
        })
        break
      // 购买SVIP
      case '06':
        wx.switchTab({
          url: '/pages/home/home'
        })
        break
      // 关注抖音号
      case '07':
        this.setData({
          modal3Visible: true
        })
        break
      // 到场
      case '08':
        wx.switchTab({
          url: '/pages/getTicket/getTicket'
        })
        break
      // 下单
      case '09':
        break
      // 邀友到场
      case '10':
        break
      // 邀友下单
      case '11':
        break
      // SVIP裂变
      case '12':
        break
      // 裂变分享门票
      case '13':
        break
      // 裂变分享优惠券
      case '14':
        wx.navigateTo({
          url: '/pages/couponList/couponList'
        })
        break
      // 裂变分享爆品
      case '15':
        wx.navigateTo({
          url: '/pages/hotGoodsOrder/index/index'
        })
        break
        
    }
  },
  douyinSave () {
    this.setData({
      modal3Visible: false
    })
    wx.showLoading()
    apiService('member/score/add', 'POST', { scoreCode: '07' })
      .then(() => {
        this.data.states['07'].completed = true
        this.setData({
          states: this.data.states
        })
        wx.hideLoading()
      })
      .catch(() => {
        wx.hideLoading()
      })
  }
})