// pages/user/error.js
var app = getApp();
const utils = require('../../utils/util.js')
Page({
  data: {
    errorType:'',
    isFirstLoad:true
  },
  bindGetUserInfo(e){
    if (e.detail.userInfo) {
      app.login(true)
    } else {
      app.toast("拒绝授权将无法使用该小程序")
    }
  },
  scanCode(){
    wx.scanCode({
      success: (res) => {
        let _action = utils.GetQueryString(res.result, 'action') || '',
          companyId = utils.GetQueryString(res.result, 'companyId') || '',
          token = utils.GetQueryString(res.result, 'token') || '',
          _option = '?action=' + _action + '&companyId=' + companyId + '&token=' + token;
        if (_action =='bindCompany'){
          wx.redirectTo({ url: '../user/bindAccount' + _option });
          }else{
          app.toast('无法识别，这不是绑定账号的二维码')
          }
        
      }
    })
  },
  onLoad: function (options) {
    var _type = options.type||"";
    this.setData({
      errorType: _type
    });
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    let _type = this.data.errorType,
      isFirstLoad = this.data.isFirstLoad;
    if (_type == 2 && !isFirstLoad){
      app.login(true)
    }
    this.setData({
      isFirstLoad:false
    })
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  setAuthorized: function () {
    if (wx.openSetting) {
      wx.openSetting({
        success: (res) => {
          if (res.errMsg =='openSetting:ok'){
            app.login(true)
          }
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }
})
