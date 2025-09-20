import apiService from '../../../common/http/httpService_mall'
import utils from '../../../utils/utils'
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    useType: 0,
    couponType: 0,
    categories: [],
    list: [],
    loading: false
  },
  /**	在组件实例进入页面节点树时执行 */
  attached() {
    this.loadCats()
    this.loadList()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    loadCats () {
      let cats = []
      return apiService('member/coupon/categories', 'GET').then(rst => {
        cats = [
          {
            categoryId: 0,
            categoryName: '全部'
          },
          ...(rst || [])
        ]
        this.setData({
          categories: cats
        })
      }).catch(() => {
        this.setData({
          categories: cats
        })
      })
    },
    loadList () {
      wx.showLoading()
      this.setData({
        loading: true
      })
      apiService('member/list/coupons', 'GET', {
        categoryId: this.data.couponType || undefined,
        used: this.data.useType ? true : false
      }).then(rst => {
        this.setData({
          list: (rst || []).filter(e => {
            e.beginDate = utils.dateFormat(e.beginDate, 'YYYY.MM.DD')
            e.endDate = utils.dateFormat(e.endDate, 'YYYY.MM.DD')
            return true
          })
        })
        wx.hideLoading()
        this.setData({
          loading: false
        })
      }).catch(() => {
        wx.hideLoading()
        this.setData({
          loading: false
        })
      })
    },
    //切换预约类型
    switchTab(e) {
      this.setData({
        useType: e.currentTarget.dataset.id
      })
      this.loadList()
    },
    //切换分类
    switchCat(e) {
      this.setData({
        couponType: e.currentTarget.dataset.id
      })
      this.loadList()
    },
  }
})