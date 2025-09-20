import {
  liveApi
} from "../../../common/api/liveApi"
let LiveApi = new liveApi()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    index: 0,

    name:'',
    zhutilist:[],
    shopLists:[],
    liveListAll:[],
    beginpage:0,
    page:0,
    isList:true,
    livetotal:true
  },

  // 点击按钮返回顶部
  posTop(){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  // 一级分类
  PickerSchoolChange: function (e) { 
    var index = e.detail.value
    this.setData({
        index: e.detail.value,
        beginpage:0,
        shopLists:[],
        page:0,
        liveListAll:[],
        total:0,
        pid :this.data.zhutilist[index].id 
    });
    this.categoryList()
  },
  // 点击二级分类
  navIdName(e){
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name
    this.setData({
      supplierCategoryId:id,
      titleName:name,
      beginpage:0,
      shopLists:[],
      page:0,
      liveListAll:[],
      total:0 
    })
    this.hxjbLiveList()
    this.shopList()
  },
  onPageScroll(e) {
    if (e.scrollTop > 500) {
        this.setData({
            showToTop: true
        })
    } else {
        this.setData({
            showToTop: false
        })
    }
  },
  // 点击整体跳转店铺页
  navStore(e){
    var supplier_id = e.currentTarget.dataset.supplier_id
    wx.navigateTo({
      url: '../storeDetail/storeDetail?supplier_id='+supplier_id,
    })
  },
  //去直播间
  toLiveRoom(e) {
    var status = e.currentTarget.dataset.status
    if(status == 2 || status == 3){    //直播中
      wx.navigateToMiniProgram({
        appId: 'wx8e0746fdfcbf770c',
        path: '/pages/liveRoom/liveRoom?token='+ wx.getStorageSync('token') + '&cityId=' + wx.getStorageSync('cityId') + '&liveId=' + e.currentTarget.dataset.liveid,
        envVersion: "trial"
      })
    }else if(status == 1){   //预告
      wx.navigateToMiniProgram({
        appId: 'wx8e0746fdfcbf770c',
        path: '/pages/yugao/yugao?token='+ wx.getStorageSync('token') + '&cityId=' + wx.getStorageSync('cityId') + '&liveId=' + e.currentTarget.dataset.liveid,
        envVersion: "trial"
      })
    }else if(status == 4){   //回放
      let liveId = e.currentTarget.dataset.liveid;
      let cityId = wx.getStorageSync('cityId');
      //判断环境跳转不同H5页面
      let url = "https://svip.51jiabo.com/livePlayback?liveId=" + liveId + "&cityId=" + cityId
      let version = __wxConfig.envVersion
      if (!version) version = __wxConfig.platform
      if (version == "release") {
        url = "https://svip.51jiabo.com/livePlayback?liveId=" + liveId + "&cityId=" + cityId
      }
      LiveApi.liveUserVideoCollection({
        liveId: liveId,
        cityId: cityId
      }).then(() => {
        wx.navigateToMiniProgram({
          appId: 'wx8e0746fdfcbf770c',
          path: '/pages/web/web?token='+ wx.getStorageSync('token') + '&url=' + encodeURIComponent(url),
          envVersion: "trial"
        })
      })
    }
    
  },
  // 点击查看更多加载更多直播间
  addlive(){
    this.setData({
      page: ++this.data.page
    })
    this.hxjbLiveList()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      pid:options.pid,
    })
    this.categoryList()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
   /**
   * 生命周期函数--上滑触底事件
   */
  onReachBottom: function () {
    if(this.data.isList != false){
      this.setData({
        beginpage: ++ this.data.beginpage
      })
      this.shopList()
    }
  },
  // 获取一级列表和二级列表
  categoryList(data){
    var that = this
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    LiveApi.categoryList(data).then((res)=>{
      wx.hideLoading()
      if(res.code == 200){
        // 二级分类
        if(data){
          that.setData({
            list:res.result,
            supplierCategoryId:res.result[0].id,
            titleName:res.result[0].category_name,
          })
          that.hxjbLiveList()
          that.shopList()
        }else{
          // 第一次进入时候
          res.result.map((item,i)=>{
            if(item.id == that.data.pid){
              that.setData({
                zhutilist:res.result,
                index:i,
                supplierId:res.result[i].id,
              })
              var datas = {pid:res.result[i].id}
              that.categoryList(datas)
            }
          })
        }
      }
    })
  },
  // 主题馆列表
  shopList(){
    var that = this
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    let data = {
      categoryId:this.data.supplierCategoryId,
      pid:this.data.supplierId,
      beginpage:this.data.beginpage,
      pagesize:10,
      City:wx.getStorageSync('cityId'),
      Activity:wx.getStorageSync('activityInfo').activity_id
    }
    LiveApi.shopList(data).then((res)=>{
      wx.hideLoading()
      if(res.code == 200){
        if(res.result){
          var newArr = that.data.shopLists
          res.result.forEach((item,i)=>{
            newArr.push(item)
          })
          that.setData({
            shopLists:newArr
          })
        }
        if(res.result==null || res.result.length < 10){
          that.setData({
            isList:false
          })
        }
      }else{
        wx.showToast({
          title: res.message,
        })
      }
    })
  },
  // 显示直播列表
  hxjbLiveList(){
    wx.showLoading({
      title: '加载中',
      mask:true

    })
    let data = {
      cityId:wx.getStorageSync('cityId'),
      supplierId:'',
      supplierCategoryId:this.data.supplierCategoryId,
      page:this.data.page,
      pageSize:3
    }
    LiveApi.hxjbLiveList(data).then((res)=>{
      wx.hideLoading()
      if(res.status == 1){
        //观看人数包括注水人数+实际观看人数(如果是回放还要加上回放观看人数)
        var liveList = []
        res.data.live_list.map((item,i)=>{
          let num = Number(item.look_count) + Number(item.init_count);
          liveList.push(item)
          liveList[i].lookLiveNum = num.toString()
        })
        this.setData({
          liveListAll:this.data.liveListAll.concat(liveList),
          total:Number(res.data.total)
        })
      }else{
        wx.showToast({
          title: res.message,
          icon:'none'
        })
      }
    })
  }
})