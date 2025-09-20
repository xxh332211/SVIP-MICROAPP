// pages/user/selfHelp/FillIn/FillIn.js
import {
  marketing
} from "../../../../common/api/marketingApi.js"
let marketingApi = new marketing()
import {
  svip
} from "../../../../common/api/svipApi.js"

let SvipApi = new svip()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoList: [],
    searchList:[],
    cityId:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      orderId: options.orderId ? options.orderId : ""
    })
    if (this.data.orderId) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      this.getActivityInfo()
      SvipApi.getSelfOrderDetail({
        orderId: this.data.orderId
      }).then((res) => {
        console.log(res)
        if (res.infoMap.statusCode == 200) {
          if (res.infoMap.notpassList) {
            //实现同一订单审核未通过弹层只弹一次
            let selfOrderId = "selfOrder" + this.data.orderId
            if (!wx.getStorageSync(selfOrderId)) {
              this.setData({
                notPassTip: true
              })
              wx.setStorageSync(selfOrderId, true)
            }
            for (let i of res.infoMap.notpassList) {
              // 1=照片不清晰 2=订单号不正确 3=姓名与订单上的不符 4=手机号码订单上的不符 5=商品名称与订单上的不符 6=订单金额与订单上的不符 7=品牌名称不符 8=该订单已录入
              let err = "error" + i;
              this.setData({
                [err]: true
              })
            }
          }
          this.setData({
            isVendor: res.infoMap.sfInputOrder.orderNum ? false : true,
            orderNum: res.infoMap.sfInputOrder.orderNum,
            brandName: res.infoMap.sfInputOrder.brandName,
            name: res.infoMap.sfInputOrder.orderUserName,
            mobile: res.infoMap.sfInputOrder.orderUserMobile,
            payWay: res.infoMap.sfInputOrder.payType,
            amountNum: res.infoMap.sfInputOrder.payAmount,
            goodsName: res.infoMap.sfInputOrder.goodsName,
            photoList: res.infoMap.sfInputOrder.orderImages.map((v, i) => {
              return {
                imageUrl: v.imageUrl
              }
            })
          })
        }
        wx.hideLoading()
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      cityId:wx.getStorageSync('cityId'),
      mobile: this.data.mobile ? this.data.mobile : wx.getStorageSync("userInfo").mobile
    })
    marketingApi.checkToken().then((res) => {
      if (res.data) {
        if (res.data.result != 1 && wx.getStorageSync("isAuth")) {
          wx.navigateTo({
            url: '/pages/login/login',
          })
        } else {

        }
      }
    })
  },
  //授权手机号回调
  getPhoneBack() {
    //授权登录成功回调重新请求一次接口来获取用户状态
    this.onShow()
  },
  //订单类型切换
  tabSwitch(e) {
    let type = e.currentTarget.dataset.type;
    if (type == "unify") {
      this.setData({
        isVendor: false
      })
    } else {
      this.setData({
        isVendor: true
      })
    }
  },
  chaInput(){
    this.setData({
      brandName:'',
      showFuzzySearch:false
    })
  },
  // 点击模糊搜索的商家赋值
  getInputSearch(e){
    var index = e.currentTarget.dataset.index
    setTimeout(()=>{
      this.setData({
        showFuzzySearch:false,
        brandName:this.data.searchList[index]
      })
    },100)
  },
  //查看大图
  bigImg(e){
    let imgList = this.data.photoList.map((v, i) => {
      return v.imageUrl
    })
    wx.previewImage({
      current: e.currentTarget.dataset.img,
      urls: imgList
    })
  },
  //未选择支付方式
  notWayTip() {
    this.toast('请选择购买方式')
  },
  //支付方式切换
  switchWay(e) {
    let way = e.currentTarget.dataset.way;
    if (way == 1) {
      this.setData({
        payWay: 1
      })
    } else {
      this.setData({
        payWay: 2
      })
    }
  },
  //扫码
  wxScan() {
    let that = this;
    wx.scanCode({
      success(res) {
        let orderNum = res.result;
        //根据扫描获取的订单号获取品牌名称
        SvipApi.getSelfOrderBrand({
          orderNum: orderNum,
          City: wx.getStorageSync('cityId')
        }).then((data) => {
          console.log(data)
          if (data.infoMap.statusCode == 200) {
            that.setData({
              orderNum: orderNum,
              brandName: data.infoMap.brandName
            })
          } else {
   
              that.setData({
                showBindUser:true,
                BindUserText:data.infoMap.reason
              })

          }
        })
      }
    })
  },
  //监听输入
  inputAmount(e) {
    e.detail.value = e.detail.value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')
    this.setData({
      amountNum: e.detail.value
    })
  },
  inputBrandName(e) {
    this.setData({
      brandName: e.detail.value,
    })
    if(e.detail.value.length != 0){
      this.getBrandName()
    }else{
      this.setData({
        showFuzzySearch:false
      })
    }
  },
  inputName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  inputMobile(e) {
    this.data.mobile = e.detail.value
  },

  // 禁止input框输入表情
  inputGoodsName(e) {
     var str = e.detail.value.replace(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig, "");     // 
    this.setData({
      goodsName:str
    })
  },
  //清除输入框
  clearForm() {
    this.setData({
      amountNum: ""
    })
  },
  //上传图片(会触发onShow事件)
  takePhoto() {
    let that = this;
    let countNum = 2;
    if (this.data.photoList && this.data.photoList.length == 1) {
      countNum = 1;
    } else if (this.data.photoList && this.data.photoList.length == 2) {
      that.toast('最多上传2张照片')
      return false
    }
    wx.chooseImage({
      count: countNum,
      success(res) {
        for (let i of res.tempFiles) {
          setTimeout(() => {
            wx.showLoading({
              title: '上传中...',
              mask: true
            })
            wx.uploadFile({
              url: 'https://api.51jiabo.com/file/v2.0/uploadImage',
              filePath: i.path,
              name: 'path',
              success(res) {
                wx.hideLoading()
                let resultList = JSON.parse(res.data).resultList.map((v, i) => {
                  return {
                    imageUrl: v.access_url
                  }
                });
                that.setData({
                  photoList: that.data.photoList.concat(resultList)
                })
              }
            })
          }, 400)
        }
      }
    })
  },
  //删除照片
  delImg(e) {
    let id = e.currentTarget.dataset.id;
    for (let i in this.data.photoList) {
      if (i == id) {
        this.data.photoList.splice(i, 1)
        this.setData({
          photoList: this.data.photoList
        })
      }
    }
  },
  //
  phoneTips() {
    if (this.data.phoneTips) {
      this.setData({
        phoneTips: false
      })
    } else {
      this.setData({
        phoneTips: true
      })
    }
  },
  confirm() {
    this.setData({
      notPassTip: false,
      submitSuccess: false,
      auditPass: false,
      showBindUser:false
    })
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  // 提交成功点击确定跳转到录单列表页
  confirmNav(){
    this.setData({
      notPassTip: false,
      submitSuccess: false,
      auditPass: false,
      showBindUser:false
    })
    // wx.redirectTo({
    //   url:'../Index/Index'
    // })
    wx.navigateBack()
  },
  //报错提示
  toast(text) {
    this.setData({
      errorText: text,
      showError: true
    })
    setTimeout(() => {
      this.setData({
        showError: false
      })
    }, 3000)
  },
  //提交
  submit() {
    let regTest = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
    if (!regTest.test(this.data.mobile)) {
      this.toast('手机号码格式不正确')
      return
    }
    if (this.data.amountNum <= 0) {
      this.toast('订单金额需大于0')
      return
    }
    if (this.data.isVendor) {
      // if (!this.data.brandName || !this.data.name || !this.data.amountNum || !this.data.goodsName || this.data.photoList.length == 0) {
      if (!this.data.amountNum || !this.data.brandName || this.data.photoList.length == 0) {
        this.toast('请将内容填写完整')
        return
      }
    } else {
      // if (!this.data.orderNum || !this.data.brandName || !this.data.name || !this.data.amountNum || !this.data.goodsName || this.data.photoList.length == 0) {
      if (!this.data.orderNum || !this.data.amountNum || !this.data.brandName || this.data.photoList.length == 0) {
        this.toast('请将内容填写完整')
        return
      }
    }
    //提交数据
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    SvipApi.submitSelfOrder({
      brandName: this.data.brandName,
      goodsName: this.data.goodsName,
      orderId: this.data.orderId ? this.data.orderId : "",
      orderImages: this.data.photoList,
      orderNum: this.data.orderNum ? this.data.orderNum : "",
      orderUserMobile: this.data.mobile,
      orderUserName: this.data.name,
      payAmount: this.data.amountNum,
      payType: this.data.payWay,
      userId: wx.getStorageSync("userInfo").uid,
      cityId: wx.getStorageSync('cityId'),
      session: wx.getStorageSync('sessionId')
    }).then((res) => {
      console.log(res)
      wx.hideLoading()
      if (res.infoMap.statusCode == 200) {
        if (res.infoMap.orderId){
          this.setData({
            orderId: res.infoMap.orderId
          })
        }
        this.setData({
          submitSuccess: true
        })
      } else if (res.infoMap.statusCode == 400){
        this.setData({
          auditPass: true
        })
      } else {
        this.toast(res.infoMap.reason)
      }
    })
  },
   // 获取展届信息
   getActivityInfo(){
    let that = this
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    SvipApi.activityInfo({cityId:wx.getStorageSync('cityId')}).then((res)=>{
      wx.hideLoading()
      if (res.begin_date <= res.buy_time && res.end_date >= res.buy_time) {
        console.log('展中')
        this.setData({
          activityType:true
        })
      }else{
        console.log('非展中')
        this.setData({
          activityType:false,
          item:res
        })
      }
    })
  },
  // 品牌模糊匹配
  getBrandName(){
    let data = {
      activityId:wx.getStorageSync('activityId'),
      brandName:this.data.brandName
    }
    SvipApi.getBrandName(data).then((res)=>{
      console.log(this.data.brandName.length)
      if(res.infoMap.brandNameList.length>0 && this.data.brandName.length!=0){
        var showFuzzySearch = true
      }else{
        var showFuzzySearch = false
      }
      this.setData({
        searchList:res.infoMap.brandNameList,
        showFuzzySearch:showFuzzySearch
      })
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})