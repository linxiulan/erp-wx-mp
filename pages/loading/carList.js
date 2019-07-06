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
    let _this=this;
    wx.scanCode({
      success: (res) => {
        let _url = res.result,
          action = utils.GetQueryString(_url, 'action') || '',
          carId = utils.GetQueryString(_url, 'carId') || '';
        if (action == 'car' && carId != '') {
          _this.quickSelectionCar(carId)
          /*wx.showLoading({
            title: '扫码成功,正在添加车辆',
          });*/
        } else {
          app.toast('扫码失败')
        }
      }
    })
  },
  //快速选择
  quickSelectionCar(carId){
    let _this=this,
      _data = _this.data.carList||[],
      _id='',
      _name='';
    for (let i = 0; i < _data.length;i++){
      let _item = _data[i];
      if (_item.carId == carId){
        _id = _item.carId;
        _name = _item.plateNumber;
      }
    }
    if (_id==''){
      app.toast('没有该车辆');
      return false;
    }
    this.setData({
      curCar: _id,
      curCarName: _name || '--'
    })
    wx.navigateTo({
      url: '../loading/orderList?carId=' + _id + '&plateNumber=' + _name,
    })
  },
  /*addCar(name) {
    app.$post('/api/admin/car', {
      params:{
        plateNumber: name
      },
      success: (res) => {
        wx.hideLoading();
        if (res.code == 'SUCCESS') {
          this.getCarList();
        } else {
          app.toast(res.msg)
        }
      },
      fail: (err) => {
        wx.hideLoading();
        app.toast(err.msg)
      }
    })
  },*/
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

 
})