// pages/qrcode/handler.js
const app = getApp();
const utils = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentModules: '',
    failureTitle: '扫码的二维码无效',
    failureText: '请检查是否是火山智慧物流专属二维码'
  },
  scanCode() {
    wx.scanCode({
      success: (res) => {
        let _action = utils.GetQueryString(res.result, 'action') || '',
          companyId = utils.GetQueryString(res.result, 'companyId') || '',
          token = utils.GetQueryString(res.result, 'token') || '',
          _option = '?action=' + _action + '&companyId=' + companyId + '&token=' + token;
        if (_action == 'bindCompany') {
          wx.redirectTo({ url: '../user/bindAccount' + _option });
        } else {
          app.toast('无法识别，这不是绑定账号的二维码')
        }

      }
    })
  },
  backHome(){
    wx.redirectTo({ url: '../index/index'});
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this=this;
    if (options.q !== undefined) {
      let _url = decodeURIComponent(options.q),
        action = utils.GetQueryString(_url, 'action') || '',
        companyId = utils.GetQueryString(_url, 'companyId') || 1,
        token = utils.GetQueryString(_url, 'token') || '',
        tradeId = utils.GetQueryString(_url, 'tradeId') || '',
        carId = utils.GetQueryString(_url, 'carId') || '';

      if (action == 'bindCompany') {
        let _option = '?action=' + action + '&companyId=' + companyId + '&token=' + token;
        wx.redirectTo({ url: '../user/bindAccount' + _option });
        return false;
      } else if (action == 'order') {
        wx.redirectTo({
          url: '../index/index?tradeId =' + tradeId,
        })
        return false;
      } else if (action == 'car') {
        wx.redirectTo({
          url: '../index/index?carId =' + carId,
        })
        return false;
      } else {
        _this.setData({
          currentModules:'bindFailure',
        })
        //app.toast("扫码的二维码无效")
      }
    } else {
      _this.setData({
        currentModules: 'bindFailure',
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  
})