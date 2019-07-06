// pages/order/search.js
const app = getApp()
const utils = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNO: '',
    keywords: [],
    searchData: '',
    isNoData: false
  },
  searchBtn() {
    let _keywords = this.data.keywords;
    if (_keywords==''){
      return false;
    }
    app.$get('/api/order/search?keywords=' + _keywords, {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          this.setData({
            isNoData: false,
            searchData: res.data || []
          })
        } else {
          app.toast(res.msg)
        }
      },
      fail: (err) => {
        app.toast(err.msg)
      }
    })
  },
  checkOrder() {
    let _id = this.data.orderNO;
    if (_id == "") {
      return false;
    }
    app.$get('/api/order/list/' + _id, {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          if (res.data == null) {
            this.setData({
              isNoData: true
            })
          } else {
            wx.redirectTo({ url: '../order/detail?tradeID=' + _id });
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
  bindKeyInput: function (e) {
    this.setData({
      keywords: e.detail.value
    })
  },
  scanningBtn() {
    wx.scanCode({
      success: (res) => {
        let _orderID = utils.GetQueryString(res.result, 'tradeId') || '';
        this.setData({
          orderNO: _orderID
        })
        this.checkOrder()
        wx.showToast({
          title: '扫描成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.type == "scanning") {
      this.scanningBtn()
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