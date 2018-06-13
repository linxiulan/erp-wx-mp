// pages/index/selectOrder.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listType:'',
    size: 20,
    index: 0,
    listData: '',
    loadingText: '',
    isLoadMore: true
  },
  //获取列表数据
  getDataList() {
    const _len = this.data.listData.length;
    let _listType = this.data.listType,
    _index = _len > 0 ? _len : 0,
      _size = this.data.size,
      _url ='/api/order/station/today/list';
    if (_listType==1){
      _url = '/api/order/station/collected/list?index=' + _index+'&size='+ _size
    } else if (_listType == 2){
      _url = '/api/order/station/unnotify/list?index=' + _index+'&size='+ _size
    } else if (_listType == 3){
      _url = '/api/order/station/delivery/list?index=' + _index+'&size='+ _size
    }

    app.$get(_url, {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          let _listData = this.data.listData||[],
            _data = res.data;
          _listData.push.apply(_listData, _data)
          if (_data.length < 1) {
            if (_index==0){
              this.setData({
                listData: []
              })
            }
            this.setData({
              isLoadMore: false,
              loadingText: '没有更多数据',
            })
          } else {
            this.setData({
              listData: _listData,
              isLoadMore: true,
            })
          }
        } else {
          app.toast(res.msg)
        }
      },
      fail: (err) => {
        wx.hideLoading();
        app.toast(err.msg)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _listType = options.type || '';
    this.setData({
      listType: _listType
    });
    wx.setNavigationBarTitle({
      title: _listType == 1 ? '已收件未装车' : _listType == 2 ? '已卸货待通知' : _listType == 3 ?'已卸货未提货':'今天的所有订单'
    })
    this.getDataList()
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
    if (this.data.isLoadMore) {
      this.setData({
        isLoadMore: false,
        loadingText: '正在努力的获取更多,请稍等',
      });
      this.getDataList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})