// pages/index/list.js
const app = getApp()
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
  },
  getCarList() {
    app.$get('/api/car/list', {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          this.setData({
            carList: res.data || []
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
      params: {
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
  discharge(){
    wx.showLoading({
      title: '操作中,请稍等',
    });
    app.$put('/api/order/status', {
      params: {
        "stationId": wx.getStorageSync('stationId') || "",
        "carId": this.data.curCar,
        "status": "DELIVERY"
      },
      success: (res) => {
        wx.hideLoading();
        if (res.code == 'SUCCESS') {
          app.toast('操作成功,即将返回首页');
          setTimeout(function () {
            wx.reLaunch({
              url: '../index/index'
            })  
          }, 2000) //延迟时间 这里是1秒
          
        }else{
          app.toast(res.msg)
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast(err.msg)
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