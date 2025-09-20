import { svip } from '../../common/api/svipApi'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    url: String,
    type: Number, // 1限时折扣 2 秒杀 3
    drawData: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    cWidth: undefined,
    cHeight: undefined,
    spaceHeight: '10rpx',
    closeBtnTop: '80%',
    rpx: undefined,
    saveBtnEnable: true
  },

  ready () {
    const sysInfo = wx.getSystemInfoSync();
    let cWidth = sysInfo.windowWidth * 0.8
    let cHeight = cWidth * 1.6
    let spaceHeight = sysInfo.windowHeight * 0.8 - cHeight
    spaceHeight = spaceHeight > 0 ? spaceHeight : 20
    this.setData({
      cWidth,
      cHeight,
      spaceHeight: `${spaceHeight}rpx`,
      closeBtnTop: `${sysInfo.windowHeight * 0.8}px`,
      rpx: sysInfo.pixelRatio
    })
    let api = new svip()
    wx.showLoading({
      title: '正在生成海报...'
    })
    const { url, type, scene } = this.properties
    Promise.all([
      api.getPathQrCode('pages/goodsIndex/goodsIndex'),
      api.getPathQrCode(url, scene)
    ]).then(res => {
      if(+res[0].status !== 1 && +res[1].status !== 1) {
        wx.hideLoading({
          success: (res) => {
            wx.showToast({
              title: '获取二维码失败',
              duration: 3000
            })
            this.close()
          },
        })
        return
      }
      let qrUrl = +res[1].status === 1 && res[1].data || res[0].data
      if (+type === 1) {
        this.drawTplA(cWidth, cHeight, qrUrl)
      } else if (+type === 2) {
        this.drawTplB(cWidth, cHeight, qrUrl)
      } else {
        this.drawTplC(cWidth, cHeight, qrUrl)
      }
      setTimeout(() => {
        wx.hideLoading({
          success: (res) => {},
        })
        this.setData({
          saveBtnEnable: false
        })
      }, 100)
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    stop() {
      return false
    },
    close () {
      this.triggerEvent('close', {}, {});
    },
    checkPermission() {
      return new Promise((resolve, reject) => {
        wx.getSetting({
          success (res) {
            if (!res.authSetting['scope.writePhotosAlbum']) {
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success () {
                  resolve(true)
                },
                fail () {
                  reject(false)
                }
              })
            }
            else {
              resolve(true)
            }
          }
        })
      })
    },
    saveImage () {
      this.checkPermission().then(() => {
        const { cHeight, cWidth, rpx } = this.data
        const that = this
        wx.canvasToTempFilePath({
          canvasId: 'poster',
          x: 0,
          y: 0,
          width: cWidth,
          height: cHeight,
          success(res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                that.close()
                wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 2000
                })
              },
              fail (err) {
                wx.showToast({
                  title: err.errMsg,
                  icon: 'none',
                  duration: 100000
                })
              }
            })
          }
        }, this)
      }).catch(() => {
        wx.showToast({
          title: '需要同意相册权限才能保存',
        })
      })
    },
    drawTplA (cWidth, cHeight, qrcodePath) {
      let drawData = this.properties.drawData
      if (drawData.images.length < 4) {
        for(let i = drawData.images.length; i < 4; i++) {
          drawData.images.push('https://img.51jiabo.com/15a54ecc-4c1c-4a67-a284-10db2cdb5370.png')
        }
      }
      let ctx = wx.createCanvasContext('poster', this)
      ctx.setFillStyle('#fff')
      ctx.fillRect(0, 0, cWidth, cHeight)
      ctx.setFontSize(16)
      ctx.font = 'normal bold 16px Arial, sans-serif'
      ctx.setTextAlign('center')
      ctx.setFillStyle('#000')
      let top = cWidth * 0.06
      ctx.fillText(drawData.title, cWidth / 2, top + 16)
      top += 16 + cWidth *0.05
      let smallPictureWidth = cWidth * 0.44
      for(let i = 0; i < 4; i++) {
        let option = {width: smallPictureWidth, height: smallPictureWidth}
        if (i === 0) {
          option.left = 0.05 * cWidth
          option.top = top
        }
        if (i === 1) {
          option.left = 0.51 * cWidth
          option.top = top
        }
        if (i === 2) {
          option.left = 0.05 * cWidth
          option.top = top + smallPictureWidth + 0.02 * cWidth
        }
        if (i === 3) {
          option.left = 0.51 * cWidth
          option.top = top + smallPictureWidth + 0.02 * cWidth
        }
        this.drawImageUrl(ctx, drawData.images[i], option)
      }
      let top3 = top + smallPictureWidth * 2 + 0.02 * cWidth
      ctx.setFillStyle('#E6001B')
      ctx.fillRect(0.05 * cWidth, top3, 0.9 * cWidth, 0.08 * cWidth)
      ctx.setFillStyle('#fff')
      ctx.setFontSize(14)
      ctx.font = 'normal normal 14px Arial, sans-serif '
      ctx.setTextAlign('left')
      ctx.fillText('限时抢购', 0.08 * cWidth, top3 + 0.06 * cWidth)
      ctx.setTextAlign('right')
      ctx.fillText(`${drawData.timeStart} - ${drawData.timeEnd}`, 0.92 * cWidth, top3 + 0.06 * cWidth)
      let qrWidth = cWidth * 0.3
      let qrOption = { left: (cWidth * 0.95 - qrWidth), top: (top3 + 0.1 * cWidth), width: qrWidth, height: qrWidth }
      // ctx.drawImage(qrcodePath, 0, 0, 120, 120, (cWidth * 0.97 - qrWidth), (top3 + 0.1 * cWidth), qrWidth, qrWidth)
      this.drawImageUrl(ctx, qrcodePath, qrOption)
      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.font = 'normal bold 16px Arial, sans-serif'
      ctx.setFillStyle('#000')
      let top4 = (top3 + 0.1 * cWidth)
      ctx.fillText('华夏家博会优选', cWidth * 0.05, top4 + 0.07 *cWidth)
      ctx.setFillStyle('#f00')
      ctx.font = 'normal normal 12px Arial, sans-serif'
      ctx.setFontSize(12)
      ctx.fillText(`结束时间${drawData.timeEndDetail}`, cWidth * 0.05, top4 + qrWidth/2)
      ctx.setFillStyle('#CBCBCB')
      ctx.font = 'normal normal 14px Arial, sans-serif'
      ctx.setFontSize(14)
      ctx.fillText(`扫一扫或长按识别二维码`, cWidth * 0.05, top4 + qrWidth - 2)
      ctx.draw()
      this.ctx = ctx
    },
    drawTplB (cWidth, cHeight, qrcodePath) {
      let drawData = this.properties.drawData
      if (!drawData.images || drawData.images.length < 1) {
        drawData.images= ['https://img.51jiabo.com/15a54ecc-4c1c-4a67-a284-10db2cdb5370.png']
      }
      let ctx = wx.createCanvasContext('poster', this)
      ctx.setFillStyle('#fff')
      ctx.fillRect(0, 0, cWidth, cHeight)
      let top = 0.05 * cWidth
      this.drawImageUrl(ctx, drawData.images[0], { left: top, top: top, width: cWidth * 0.9, height: cWidth * 0.9 })
      ctx.setFillStyle('#000')
      ctx.setFontSize(14)
      ctx.font = 'normal bold 14px Arial, sans-serif'
      ctx.setTextAlign('left')
      let lines = this.fillLongText(drawData.title, cWidth*0.05, cWidth * 1.05, cWidth * 0.9, 14, ctx)
      ctx.setFontSize(18)
      ctx.font = 'normal normal 18px Arial, sans-serif'
      ctx.setFillStyle('#E6001B')
      console.log(lines)
      let topBase = cWidth * 1.05 + lines * 14 + 14
      ctx.fillText(drawData.price, cWidth * 0.05, topBase)
      ctx.font = 'normal normal 16px Arial, sans-serif'
      ctx.setFillStyle('#CBCBCB')
      let leftOp = cWidth * 0.05 + (drawData.price.length) * 14
      ctx.fillText(`价格 ${drawData.orgPrice}`, leftOp, topBase - 1)
      ctx.moveTo(leftOp + 36, topBase - 7)
      ctx.lineTo(leftOp + (drawData.orgPrice.length + 2) * 16, topBase - 7)
      ctx.setStrokeStyle('#CBCBCB')
      ctx.lineWidth = 2
      ctx.stroke() 
      ctx.setFillStyle('#E6001B')
      ctx.fillRect(cWidth * 0.05, topBase + cWidth*0.02, 12 * (drawData.decreasePrice.length) + 6, 18)
      ctx.setFillStyle('#FFF')
      ctx.setFontSize(12)
      topBase = topBase + cWidth*0.02
      ctx.fillText(`省${drawData.decreasePrice}`, cWidth * 0.05 + 4, topBase + 14);
      let qrWidth = cWidth * 0.3
      let qrOption = { left: (cWidth * 0.95 - qrWidth), top: topBase, width: qrWidth, height: qrWidth }
      this.drawImageUrl(ctx, qrcodePath, qrOption)
      ctx.setFillStyle('#E6001B')
      ctx.fillText(`结束时间${drawData.timeEndDetail}`, cWidth * 0.05, topBase + qrWidth / 2)
      ctx.setFillStyle('#CBCBCB')
      ctx.font = 'normal normal 14px Arial, sans-serif'
      ctx.setFontSize(14)
      ctx.fillText(`扫一扫或长按识别二维码`, cWidth * 0.05, topBase + qrWidth - 2)
      ctx.draw(true)
    },
    drawTplC (cWidth, cHeight, qrcodePath) {
      let title = this.properties.title
      let drawData = this.properties.drawData
      drawData.title = title || '多人拼团，团购享超低价'
      if (drawData.images.length < 4) {
        for(let i = drawData.images.length; i < 4; i++) {
          drawData.images.push('https://img.51jiabo.com/15a54ecc-4c1c-4a67-a284-10db2cdb5370.png')
        }
      }
      let ctx = wx.createCanvasContext('poster', this)
      ctx.setFillStyle('#fff')
      ctx.fillRect(0, 0, cWidth, cHeight)
      ctx.setFontSize(16)
      ctx.font = 'normal bold 16px Arial, sans-serif'
      ctx.setTextAlign('center')
      ctx.setFillStyle('#000')
      let top = cWidth * 0.06
      ctx.fillText(drawData.title, cWidth / 2, top + 16)
      top += 16 + cWidth *0.05
      let smallPictureWidth = cWidth * 0.44
      for(let i = 0; i < 4; i++) {
        let option = {width: smallPictureWidth, height: smallPictureWidth}
        if (i === 0) {
          option.left = 0.05 * cWidth
          option.top = top
        }
        if (i === 1) {
          option.left = 0.51 * cWidth
          option.top = top
        }
        if (i === 2) {
          option.left = 0.05 * cWidth
          option.top = top + smallPictureWidth + 0.02 * cWidth
        }
        if (i === 3) {
          option.left = 0.51 * cWidth
          option.top = top + smallPictureWidth + 0.02 * cWidth
        }
        this.drawImageUrl(ctx, drawData.images[i], option)
      }
      let top3 = top + smallPictureWidth * 2 + 0.02 * cWidth
      ctx.setFillStyle('#E6001B')
      ctx.fillRect(0.05 * cWidth, top3, 0.9 * cWidth, 0.08 * cWidth)
      ctx.setFillStyle('#fff')
      ctx.setFontSize(14)
      ctx.font = 'normal normal 14px Arial, sans-serif '
      ctx.setTextAlign('left')
      ctx.fillText('多人拼团', 0.08 * cWidth, top3 + 0.06 * cWidth)
      ctx.setTextAlign('right')
      ctx.fillText('享超低价', 0.92 * cWidth, top3 + 0.06 * cWidth)
      let qrWidth = cWidth * 0.3
      let qrOption = { left: (cWidth * 0.95 - qrWidth), top: (top3 + 0.1 * cWidth), width: qrWidth, height: qrWidth }
      // ctx.drawImage(qrcodePath, 0, 0, 120, 120, (cWidth * 0.97 - qrWidth), (top3 + 0.1 * cWidth), qrWidth, qrWidth)
      this.drawImageUrl(ctx, qrcodePath, qrOption)
      ctx.setTextAlign('left')
      ctx.setFontSize(16)
      ctx.font = 'normal bold 16px Arial, sans-serif'
      ctx.setFillStyle('#000')
      let top4 = (top3 + 0.1 * cWidth)
      ctx.fillText('华夏家博会优选', cWidth * 0.05, top4 + 0.07 *cWidth)
      ctx.setFillStyle('#CBCBCB')
      ctx.font = 'normal normal 14px Arial, sans-serif'
      ctx.setFontSize(14)
      ctx.fillText(`扫一扫或长按识别二维码`, cWidth * 0.05, top4 + qrWidth - 2)
      ctx.draw()
      this.ctx = ctx
    },
    drawImageUrl(ctx, url, options) {
      wx.getImageInfo({
        src: url,
        success (res) {
          let imageWidth = res.height
          let imageHeight = res.height
          // if (options.isQr) {
          //   let pad = imageWidth * 16 / 150
          //   ctx.drawImage(res.path, pad, pad, imageWidth * 118 / 150, imageHeight * 118 / 150, options.left, options.top, options.width, options.height )
          // } else {
            ctx.drawImage(res.path, 0, 0, imageWidth, imageHeight, options.left, options.top, options.width, options.height)
          // }
          ctx.draw(true)
        }
      })
    },
    fillLongText(str, x, y, maxWidth, fontSize, ctx) {
      let lineMax = parseInt(maxWidth / fontSize)
      let lineC = 0
      for(let i = 0; i < str.length; i += lineMax) {
        let tt = str.slice(i, i + lineMax)
        ctx.fillText(tt, x, y + lineC * (fontSize + 2), maxWidth)
        lineC++
      }
      return lineC
    }
  }
})
