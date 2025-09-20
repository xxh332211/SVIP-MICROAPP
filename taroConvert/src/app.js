import withWeapp, { cacheOptions } from "@tarojs/with-weapp";
import { Block } from "@tarojs/components";
import React from "react";
import Taro from "@tarojs/taro";
//app.js
// import globalVariable from '/common/global_variable.js'
import 'umtrack-wx';
import "./app.scss";
cacheOptions.setOptionsToCache({
  systemData: Taro.getSystemInfoSync({
    success(res) {
      console.log(res);
    }
  }),
  onLaunch: function (options) {
    Taro.setStorageSync('codePopup', true);
    if (!Taro.getStorageSync('src') || Taro.getStorageSync('src') == "运营小程序") {
      Taro.setStorageSync('src', "YYXCX");
    }
    this.initialize();
    const updateManager = Taro.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    });
    updateManager.onUpdateReady(function () {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            Taro.clearStorage();
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    });
  },
  umengConfig: {
    appKey: '5f87bd5894846f78a972de90',
    //由友盟分配的APP_KEY
    // 使用Openid进行统计，此项为false时将使用友盟+uuid进行用户统计。
    // 使用Openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用Openid。
    useOpenid: true,
    // 使用openid进行统计时，是否授权友盟自动获取Openid，
    // 如若需要，请到友盟后台"设置管理-应用信息"(https://mp.umeng.com/setting/appset)中设置appId及secret
    autoGetOpenid: true,
    // debug: true, //是否打开调试模式
    uploadUserInfo: true // 自动上传用户信息，设为false取消上传，默认为false
  },
  onHide: function () {
    Taro.setStorageSync('codePopup', true);
  },
  onShow: function () {
    // console.log(CryptoJS)
  },
  /**获取当前页面 */
  getPrepPage() {
    let pages = Taro.getCurrentPages();
    return pages[pages.length - 1];
  },
  onPageNotFound() {
    Taro.switchTab({
      url: '/pages/getTicket/getTicket'
    });
  },
  //初始化
  initialize: function () {
    Taro.removeStorageSync('isThisGoing');
    // wx.removeStorageSync("activityInfo")
    Taro.removeStorageSync('isSvip');
    Taro.removeStorageSync('price');
    let token1 = Taro.getStorageSync('token');
    if (!token1) {
      Taro.removeStorageSync('accessToken');
      Taro.removeStorageSync('token');
      Taro.removeStorageSync('isLogin');
      Taro.removeStorageSync('isAuth');
    }
  },
  // 处理数据格式函数
  disposeData(obj) {
    let typeObj = Object.prototype.toString.call(obj) == '[object Object]';
    let typeAry = Object.prototype.toString.call(obj) == '[object Array]';
    if (typeObj) {
      Object.keys(obj).forEach(i => {
        if (i == 'begin_date') {
          obj[i] = setStr(obj[i]);
        }
        if (i == 'end_date') {
          obj[i] = setStr(obj[i]);
        }
        if (i == 'buy_time') {
          obj[i] = setStr(obj[i]);
        }
        if (i == 'activity_end_date') {
          obj[i] = setStr(obj[i]);
        }
        if (i == 'activity_begin_date') {
          obj[i] = setStr(obj[i]);
        }
        if (i == 'sale_price') {
          obj[i] = parseFloat(obj[i]);
        }
        if (i == 'prepay_amount') {
          obj[i] = parseFloat(obj[i]);
        }
        if (i == 'origin_price') {
          obj[i] = parseFloat(obj[i]);
        }
        if (i == 'goods_price') {
          obj[i] = parseFloat(obj[i]);
        }
        if (i == 'coupon_value') {
          obj[i] = parseFloat(obj[i]);
        }
        if (i == 'consume_amount') {
          obj[i] = parseFloat(obj[i]);
        }
      });
      return obj;
    }
    if (typeAry) {
      let newData = obj.map(i => {
        Object.keys(i).map(key => {
          if (key == ' ') {
            i[key] = setStr(i[key]);
          }
          if (key == 'coupon_value') {
            i[key] = parseFloat(i[key]);
          }
          if (key == 'consume_amount') {
            i[key] = parseFloat(i[key]);
          }
          if (key == 'activity_end_date') {
            i[key] = setStr(i[key]);
          }
          if (key == 'activity_begin_date') {
            i[key] = setStr(i[key]);
          }
          if (key == 'begin_date') {
            i[key] = setStr(i[key]);
          }
          if (key == 'end_date') {
            i[key] = setStr(i[key]);
          }
          if (key == 'sale_price') {
            i[key] = parseFloat(i[key]);
          }
          if (key == 'prepay_amount') {
            i[key] = parseFloat(i[key]);
          }
          if (key == 'origin_price') {
            i[key] = parseFloat(i[key]);
          }
          if (key == 'goods_price') {
            i[key] = parseFloat(i[key]);
          }
        });
        return i;
      });
      return newData;
    }
    function setStr(str) {
      if (str) {
        let d = str.split(' ')[0].split(/[-.]/).slice(1);
        return d.join('.');
      }
      // let s = d.map((item) => {
      //   return parseFloat(item)
      // })
      // return s.join('.')
    }
  },
  //加载数据~
  loadData(tipInfo = '数据加载中...') {
    Taro.showToast({
      title: tipInfo,
      icon: 'loading',
      duration: 2000,
      mask: true
    });
  },
  version: function () {
    let version = __wxConfig.envVersion;
    if (!version) version = __wxConfig.platform;
    // console.log('版本号', version)
    // http://192.168.1.60:8008
    // https://ticket-api.jia-expo.com
    switch (version) {
      case 'devtools':
        //开发版
        return 'https://ticket-api.jia-expo.com';
        break;
      case 'develop':
        //开发者工具
        return 'https://ticket-api.jia-expo.com';
        break;
      case 'trial':
        //体验版
        return 'https://ticket-api.jia-expo.com';
        break;
      case 'release':
        //正式版
        return 'https://svip-api.51jiabo.com';
        break;
      default:
        return 'https://svip-api.51jiabo.com';
    }
  },
  versionConfig: function () {
    let version = __wxConfig.envVersion;
    if (!version) version = __wxConfig.platform;
    // https://ticket-api.jia-expo.com/applet/api/
    let devConfig = {
      baseUrl: 'https://ticket-api.jia-expo.com/applet/',
      apiBaseUrl: 'https://ticket-api.jia-expo.com/applet/api/'
    };
    let prodConfig = {
      baseUrl: 'https://svip-api.51jiabo.com/applet/',
      apiBaseUrl: 'https://svip-api.51jiabo.com/applet/api/'
    };
    // console.log('版本号', version)
    // http://192.168.1.60:8008
    switch (version) {
      case 'devtools': //开发版
      case 'develop': //真机调试版
      case 'trial':
        //体验版
        return devConfig;
      case 'release':
        //正式版
        return prodConfig;
      default:
        return devConfig;
    }
  }
});
@withWeapp(cacheOptions.getOptionsFromCache(), true)
class App extends React.Component {
  render() {
    return this.props.children;
  }
}
export default App;