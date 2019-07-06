//index.js
//获取应用实例
const app = getApp()
const utils = require('../../utils/util.js')
Page({
  data: {
    collectedCount:0,
    deliveryCount: 0,
    total: 0,
    unNotifyCount: 0,
  },
  getOrderCount(){
    app.$get('/api/statistics/station/order/count', {
      success: (res) => {
        wx.hideLoading();
        if (res.code == 'SUCCESS') {
          let _data=res.data;
          this.setData({
            collectedCount: _data.collectedCount,
            deliveryCount: _data.deliveryCount,
            total: _data.total,
            unNotifyCount: _data.unNotifyCount
          })
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast(err.msg)
      }
    })
  },
  searchOrder(orderID){
    app.$get('/api/order/list/' + orderID, {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          if (res.data == null) {
            app.toast('找不到该订单')
          } else {
            wx.navigateTo({ url: '../order/detail?tradeID=' + orderID });
          }
        } else {
          app.toast(res.msg)
        }
      },
      fail: (err) => {
        app.toast(err.msg)
      }
    })
  },
  scanningBtn(){
    let _this=this;
    wx.scanCode({
      success: (res) => {
        let orderID = utils.GetQueryString(res.result,'tradeId')||'';
        _this.searchOrder(orderID);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _tradeID = options.tradeId,
      _carId = options.carId;
    if (_tradeID){
      this.searchOrder(_tradeID)
    }
    if (_carId){
      app.toast("不知道去哪里")
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
  onShow: function (options) {
    this.getOrderCount();
  }
})
