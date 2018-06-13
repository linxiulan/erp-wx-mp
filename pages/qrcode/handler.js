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
        tradeID = utils.GetQueryString(_url, 'tradeID') || '',
        carId = utils.GetQueryString(_url, 'carId') || '';

      if (action == 'bindCompany') {
        let _option = '?action=' + action + '&companyId=' + companyId + '&token=' + token;
        wx.redirectTo({ url: '../user/bindAccount' + _option });
        return false;
      } else if (action == 'order') {
        wx.redirectTo({
          url: '../index/index?tradeID =' + tradeID,
        })
        return false;
      } else if (action == 'car') {
        wx.redirectTo({
          url: '../index/index?carId =' + carId,
        })
        return false;
      } else {
        _this.setData({
          currentModules:bindFailure,
        })
        //app.toast("扫码的二维码无效")
      }
    } else {
      _this.setData({
        currentModules: bindFailure,
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})