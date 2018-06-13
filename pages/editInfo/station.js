// pages/editInfo/station.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    stations: [],
    stationId: '',
    stationName: ''
  },
  getStationData() {
    let stationData=wx.getStorageSync('stationData') || ""
    if (stationData!=""){
      this.setData({
        stations: stationData
      })
      return false
    }
    app.$get('/api/station/list', {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          this.setData({
            stations: res.data
          })
        } else {
          wx.showToast(res.msg)
        }
      },
      fail: (err) => {
        wx.showToast(err.msg)
      }
    })
  },
  selectedStation(event) {
    let _id = event.target.dataset.id,
      _name = event.target.dataset.name;
    this.setData({
      stationId: _id,
      stationName: _name
    })
    let _data = {
      "station": {
        stationId: _id,
        stationName: _name
      }
    }
    this.returnData(_data)
    wx.navigateBack()
  },
  returnData(data) {
    let pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      let prePage = pages[pages.length - 2];
      //关键在这里
      prePage.changeData(data)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      stationId: options.stationId
    })
    this.getStationData();
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