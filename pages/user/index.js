// pages/user/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyIcon: wx.getStorageSync('companyIcon'),
    stationData: wx.getStorageSync('stationData'),
    nickName:'',
    avatarUrl:'',
    companyName: wx.getStorageSync('companyName'),
    stationId: wx.getStorageSync('stationId'),
    stationName:''
  },
  getStationName(_id) {
    let _data = this.data.stationData,
      _name = "";
    for (let i = 0; i < _data.length; i++) {
      let _item = _data[i];
      if (_item.stationId == _id) {
        _name = _item.name;
        break;
      }
    }
    return _name
  },
  getStationData(stationId) {
    let stationData = this.data.stationData||""
    if (stationData){
      this.setData({
        stationName: this.getStationName(stationId)
      })
    }
    app.$get('/api/station/list', {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          this.setData({
            stationData: res.data
          })
          this.setData({
            stationName: this.getStationName(stationId)
          })
          wx.setStorageSync('stationData', res.data);
        } else {
          wx.showToast(res.msg)
        }
      },
      fail: (err) => {
        wx.showToast(err.msg);
      }
    })
  },
  replayLogin(){
    wx.clearStorageSync()
    app.login(true)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _serInfo=wx.getStorageSync('wx_userInfo');
    if (_serInfo){
      this.setData({
        nickName: _serInfo.nickName,
        avatarUrl: _serInfo.avatarUrl
      })
    }
    this.getStationData(this.data.stationId);
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