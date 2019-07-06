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
    let stationData = this.data.stationData||"",
    _this=this;
    if (stationData){
      this.setData({
        stationName: this.getStationName(stationId)
      })
    }
    app.$get('/api/station/list', {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          _this.setData({
            stationData: res.data
          })
          _this.setData({
            stationName: _this.getStationName(stationId)
          })
          wx.setStorageSync('stationData', res.data);
        } else {
          app.toast(res.msg)
        }
      },
      fail: (err) => {
        app.toast('请求失败，重新请求')
        _this.getStationData(stationId);
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
    let _serInfo=wx.getStorageSync('wx_userInfo'),
      _companyIcon=wx.getStorageSync('companyIcon'),
      _stationData=wx.getStorageSync('stationData'),
      _companyName=wx.getStorageSync('companyName'),
      _stationId=wx.getStorageSync('stationId');
    if (_serInfo){
      this.setData({
        nickName: _serInfo.nickName,
        avatarUrl: _serInfo.avatarUrl,
        companyIcon: _companyIcon,
        stationData: _stationData,
        companyName: _companyName,
        stationId: _stationId
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

  
})