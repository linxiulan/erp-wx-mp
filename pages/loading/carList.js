// pages/index/list.js
const app = getApp()
const utils = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    curCar: '',
    curCarName: '--',
    carList: [
    ],
    lists: [
      {
        name: '',
        isSelected: true
      },
    ]
  },
  selectedCar(e) {
    let _id = e.target.dataset.id,
      _name = e.target.dataset.name;
    this.setData({
      curCar: _id,
      curCarName: _name || '--'
    })
    wx.navigateTo({
      url: '../loading/orderList?carId=' + _id + '&plateNumber=' + _name,
    })
  },
  getCarList(){
    app.$get('/api/car/list', {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          this.setData({
            carList:res.data||[]
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
  scanningBtn() {
    wx.scanCode({
      success: (res) => {
        let _carId = utils.GetQueryString(res.result, 'carId') || '';
        this.addCar(res._carId)
        wx.showToast({
          title: '扫描成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  addCar(name) {
    app.$post('/api/admin/car', {
      params:{
        plateNumber: name
      },
      success: (res) => {
        if (res.code == 'SUCCESS') {
          this.getCarList();
        } else {
          app.toast(res.msg)
        }
      },
      fail: (err) => {
        app.toast(err.msg)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCarList()
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