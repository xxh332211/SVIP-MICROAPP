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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close () {
      this.triggerEvent('close', {}, {});
    },
    submit (evt) {
      let ctx = this
      wx.saveImageToPhotosAlbum({
        filePath: 'https://img.51jiabo.com/imgs-mall/douyin.jpg',
        success(res) {
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          });
          ctx.triggerEvent('save', {}, {});
        },
        fail(res) {
          wx.showToast({
            title: '保存失败',
            icon: 'success',
            duration: 2000
          });
        }
      });
    }
  }
})
