// pages-xmb/pages/xmbIndex/xmbIndex.js
import {xmb} from '../../api/xmbApi'
const Api = new xmb();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status:1,
    getInfo:null,
    payInfo:null,
    pageNum1:0,
    pageNum2:0,
    page1_noData:false,
    page2_noData:false,
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
    this.getDetailInfo();
  },

  // 上拉触底
  onReachBottom(){
    if(this.data.status == 1 && !this.data.page1_noData){
      this.setData({
        pageNum1:this.data.pageNum1+1
      })
      this.getDetailInfo();
    }else if(this.data.status == 2 && !this.data.page2_noData){
      this.setData({
        pageNum2:this.data.pageNum2+1
      })
      this.getDetailInfo();
    }
  },

  // 获取明细信息
  getDetailInfo(){
    wx.showLoading({
      title: '加载中...',
    })
    let pageNum;
    if(this.data.status == 1){
      pageNum = 'pageNum1';
    }else if(this.data.status == 2){
      pageNum = 'pageNum2';
    }
    let params = {
      page_num:this.data[pageNum],
      type:this.data.status
    }

    Api.getXmbDetail(params).then(res=>{
      wx.hideLoading();
      if(res.status == 1){
        this.setData({
          coin:res.data.all_panda_coin
        })
        if(this.data.status == 1 && res.data.panda_add_list.length !== 0){
          if(this.data.pageNum1 > 0){
            this.setData({
              getInfo:this.data.getInfo.concat(res.data.panda_add_list)
            })
          }else{
            this.setData({
              getInfo: res.data.panda_add_list
            })
          }
        }else if(this.data.status == 1 && res.data.panda_add_list.length === 0){
          this.setData({
            page1_noData:true
          })
        }

        if(this.data.status == 2 && res.data.panda_consume_list.length !== 0){
          if(this.data.pageNum2 > 0){
            this.setData({
              payInfo:this.data.payInfo.concat(res.data.panda_consume_list)
            })
          }else{
            this.setData({
              payInfo:res.data.panda_consume_list
            })
          }
        }else if(this.data.status == 2 && res.data.panda_consume_list.length === 0){
          this.setData({
            page2_noData:true
          })
        }
      }
    })
  },

  // 收入点击
  getHandle(){
    this.setData({
      status:1
    })
    if(this.data.pageNum1 === 0){
      this.getDetailInfo();
    }
  },

  // 支出点击
  payHandle(){
    this.setData({
      status:2
    })
    if(this.data.pageNum2 === 0){
      this.getDetailInfo();
    }
  },
})