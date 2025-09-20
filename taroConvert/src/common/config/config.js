import Taro from '@tarojs/taro'
var app = Taro.getApp()
const config = {
  url: app.version(),
  // 测试
  // url: 'https://svip-api.51jiabo.com',// 正式
  mallConfig: app.versionConfig(),
}
export { config }
