// pages-sh/pages/shForm/shForm.js
import {
  shApply
} from "../../../common/api/shApi"
import {
  svip
} from "../../../common/api/svipApi.js"

let SvipApi = new svip()
let Api = new shApply();
let refundReasonList = [{
    text: '不合适不喜欢',
    id: 1
  },
  {
    text: '产品价格因素',
    id: 2
  },
  {
    text: '服务态度',
    id: 3
  },
  {
    text: '商品配送或安装服务因素',
    id: 4
  },
  {
    text: '商品与描述不符',
    id: 5
  },
  {
    text: '质量问题',
    id: 6
  },
  {
    text: '发错货',
    id: 7
  },
  {
    text: '收到商品破损',
    id: 8
  },
  {
    text: '认为假货',
    id: 9
  },
  {
    text: '其他',
    id: 10
  }
]
let refundTypeList = [{
    text: '仅退款（未收到货或未签收）',
    id: 1
  },
  {
    text: '退货退款（已收到货）',
    id: 2
  },
  {
    text: '协商解决',
    id: 3
  }
]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideErrTips: true,
    errTips: '',
    orderNum: '',
    name: '',
    phoneNum: '',
    brandName: '',
    curCity: null,
    refundType: null,
    refundReason: null,
    problemContent: '',
    genderId: 1,
    showCover: false,
    chooseCityPopup: false,
    chooseRefundReasonPopup: false,
    chooseRefundTypePopup: false,
    cityList: null,
    defaultCurCity: '',
    refundReasonList,
    refundTypeList,
    uploadedImgUrl: '',
    fromModify: false,
    submitStatus: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.onNetworkStatusChange(res=>{
      console.log(res);
      if(!res.isConnected || res.networkType == 'none'){
        wx.showToast({
          title: '没有网了',
          duration:2000,
          icon:'none'
        })
        return false;
      }
    })
    // 修改次数id
    if (options.modifyId) {
      this.setData({
        fromModify:true
      })
      this.getOrderInfo(options.modifyId);
    }
  },

  onShow: function () {
    let cityText = wx.getStorageSync('curUserCityText');
    if (cityText) {
      this.setData({
        defaultCurCity: cityText
      })
    }
  },

  onUnload(){
    if(this.data.fromModify){
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  getOrderInfo(id) {
    wx.showLoading({
      title: '加载中...',
    })
    Api.getApplyDetail({
      id
    }).then(res => {
      wx.hideLoading();
      if (res.status == 1) {
        let curCity = {
          id:res.data.city_id,
          city_name:res.data.city_name,
        }
        let refundType,refundReason;
        for(let item of refundTypeList){
          if(item.id == res.data.refund_type){
            refundType = item;
          }
        }
        for(let item of refundReasonList){
          if(item.id == res.data.refund_reason){
            refundReason = item;
          }
        }
        this.setData({
          modifyId: res.data.id,
          orderNum: res.data.order_sn,
          name: res.data.buyer_name,
          genderId: res.data.buyer_sex,
          phoneNum: res.data.buyer_mobile,
          brandName: res.data.brand_name,
          curCity,
          uploadedImgUrl: res.data.order_images,
          refundType,
          refundReason,
          problemContent: res.data.problem,
          submitStatus: res.data.status,
        })
      }
    })
  },

  // 城市列表
  cityListReq() {
    wx.showLoading({
      title: '加载中...',
    })
    SvipApi.citylist().then((res) => {
      wx.hideLoading()
      this.setData({
        cityList: res,
        showCover: true,
        chooseCityPopup: true,
      })
    })
  },

  // 订单信息查找
  orderSearchReq(order) {
    wx.showLoading({
      title: '查找订单信息中……',
    })
    let _this = this;
    Api.orderSearch({
      order_sn: order,
    }).then(data => {
      if (data.data) {
        wx.hideLoading()
        _this.setData({
          orderNum: order,
          name: data.data.buyer_name,
          phoneNum: data.data.buyer_mobile,
          brandName: data.data.brand_name,
          curCity: data.data.city
        })
      } else {
        _this.setData({
          name: '',
          phoneNum: '',
          brandName: '',
          genderId: 1,
          uploadedImgUrl: '',
          problemContent: '',
          curCity: null,
          refundType: null,
          refundReason: null,
        })
        wx.showToast({
          title: '未查到历史订单，请手动填写信息',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },

  // 扫码
  wxScan() {
    let _this = this;
    wx.scanCode({
      success(res) {
        _this.orderSearchReq(res.result)
      },
      fail(e) {
        console.log(e)
        wx.showToast({
          title: '请扫订单右上角订单条码',
          icon: 'none'
        })
      }
    })
  },

  // input双向绑定
  orderInpChange(e) {
    this.setData({
      orderNum: e.detail.value
    })
  },

  nameInpChange(e) {
    this.setData({
      name: e.detail.value
    })
  },

  phoneInpChange(e) {
    this.setData({
      phoneNum: e.detail.value
    })
  },

  brandInpChange(e) {
    this.setData({
      brandName: e.detail.value
    })
  },

  problemInpChange(e) {
    this.setData({
      problemContent: e.detail.value
    })
  },

  // 隐藏错误提示
  phoneInpFocus() {
    this.setData({
      hideErrTips: true
    })
  },

  // 搜索订单信息
  searchOrderInfo(e) {
    let orderNum = e.detail.value;
    this.setData({
      orderNum
    })
    if (orderNum) {
      this.orderSearchReq(orderNum)
    }
  },

  radioHandle(e) {
    this.setData({
      genderId: e.detail.value
    })
  },

  // 显示弹框
  showCityPopup() {
    this.cityListReq();
  },

  showRefundTypePopup() {
    this.setData({
      showCover: true,
      chooseRefundTypePopup: true,
    })
  },

  showRefundReasonPopup() {
    this.setData({
      showCover: true,
      chooseRefundReasonPopup: true,
    })
  },


  // 选择城市
  chooseCity(e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      curCity: item,
      showCover: false,
      chooseCityPopup: false,
      hideErrTips: true,
      errTips: ''
    })
  },

  // 选择退款原因
  refundReasonChoose(e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      refundReason: item,
      showCover: false,
      chooseRefundReasonPopup: false,
      hideErrTips: true,
      errTips: ''
    })
  },

  // 选择退款类型
  refundTypeChoose(e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      refundType: item,
      showCover: false,
      chooseRefundTypePopup: false,
      hideErrTips: true,
      errTips: ''
    })
  },

  closePopup(){
    this.setData({
      showCover:false,
      chooseCityPopup:false,
      chooseRefundReasonPopup:false,
      chooseRefundTypePopup:false,
    })
  },

  // 上传图片
  uploadPhoto() {
    if (this.data.uploadedImgUrl) return;
    let _this = this;
    wx.chooseImage({
      count: 1,
      success(res) {
        console.log(res)
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
        wx.uploadFile({
          url: 'https://api.51jiabo.com/file/v2.0/uploadImage',
          filePath: res.tempFilePaths[0],
          name: 'path',
          success(res) {
            wx.hideLoading()
            _this.setData({
              uploadedImgUrl: JSON.parse(res.data).resultList[0].access_url
            })
          }
        })
      }
    })
  },

  delImg() {
    this.setData({
      uploadedImgUrl: ''
    })
  },


  // 提交
  submit() {
    let formSuccess = this.formVerification();
    if (formSuccess) {
      let params = {
        id: this.data.modifyId,
        order_sn: this.data.orderNum,
        buyer_name: this.data.name,
        buyer_mobile: this.data.phoneNum,
        submitter_mobile: wx.getStorageSync('userInfo').mobile,
        brand_name: this.data.brandName,
        city_id: this.data.curCity.id,
        order_images: this.data.uploadedImgUrl,
        problem: this.data.problemContent,
        refund_type: this.data.refundType.id,
        refund_reason: this.data.refundReason.id,
        status: this.data.submitStatus,
        buyer_sex: this.data.genderId,
      }
      this.submitReq(params);
    }
  },

  submitReq(data) {
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    Api.formSubmit(data).then(res => {
      wx.hideLoading();
      if (res.status == 1) {
        wx.redirectTo({
          url: '/pages-sh/pages/shDetail/shDetail?id=' + res.data.id,
        })
      }
    })
  },

  // 表单验证
  formVerification() {
    let phoneNum = this.data.phoneNum;
    let myreg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    if (!phoneNum || phoneNum == "") {
      this.setData({
        hideErrTips: false,
        errTips: '请输入手机号'
      })
      return;
    }
    if (phoneNum.length != 11) {
      this.setData({
        hideErrTips: false,
        errTips: '手机号码长度不符！'
      })
      return;
    }
    if (!myreg.test(phoneNum)) {
      this.setData({
        hideErrTips: false,
        errTips: '请输入有效的手机号码！'
      })
      return;
    }
    if (!this.data.curCity) {
      this.setData({
        hideErrTips: false,
        errTips: '请选择城市'
      })
      return;
    }
    if (!this.data.uploadedImgUrl) {
      this.setData({
        hideErrTips: false,
        errTips: '请上传订单图片'
      })
      return;
    }
    if (!this.data.refundType) {
      this.setData({
        hideErrTips: false,
        errTips: '请选择退款类型'
      })
      return;
    }
    if (!this.data.refundReason) {
      this.setData({
        hideErrTips: false,
        errTips: '请选择退款原因'
      })
      return;
    }
    return true;
  },
})