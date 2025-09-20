// pages/user/myCollection/myCollection.js
import {absApi} from '../../../common/api/absAPI';
const AbsApi = new absApi();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    showPopup:false,
    curId:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.myCollection();
  },

  toIndex(){
    wx.switchTab({
      url: '/pages/goodsIndex/goodsIndex',
    })
  },

  delHandle(e){
    let id = e.currentTarget.dataset.id;
    this.setData({
      showPopup:true,
      curId:id
    })
  },

  closePopup(){
    this.setData({
      showPopup:false
    })
  },

  // 确认删除
  confirmDel(){
    this.delGoods();
  },

  // 列表
  myCollection(){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    AbsApi.myCollection().then(res=>{
      wx.hideLoading();
      if(res.status === 1 && res.data.length){
        this.setData({
          list:res.data
        })
      }else{
        this.setData({
          list:[]
        })
      }
    })
  },

  // 删除收藏
  delGoods(){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let params = {
      prerogative_goods_id: this.data.curId,
      type: 1
    }
    AbsApi.preCollect(params).then(res=>{
      wx.hideLoading();
      if(res.status == 1){
        this.setData({
          showPopup:false
        })
        this.myCollection();
      }
    })
  },

  // 跳转商品详情页
  toGoodsDetail(e){
    let item = e.currentTarget.dataset.item;
    if(item.is_online == 0) return;
    let type = 1;
    if(item.is_add_activity == 1){ // 秒光光
      type = 2;
    }
    wx.navigateTo({
      url: `/pages-abs/pages/productDetails/productDetails?Entrance=${type}&id=${item.prerogative_goods_id}`,
    })
  },
})