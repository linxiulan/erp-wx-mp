// pages/index/selectOrder.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    size: 20,
    index: 0,
    selectedOrders: [],
    listData: [],
    loadingText: '',
    isLoadMore: true
  },
  select: function (e) {
    let _index = e.currentTarget.dataset.index,
      _data = this.data.listData;
    _data[_index].isSelect = _data[_index].isSelect ? false : true;
    this.setData({
      listData: _data
    })
  },
  //获取未装车车订单
  getCollectedList() {
    const _len = this.data.listData.length;
    let _index = _len > 0 ? _len : 0,
      _size = this.data.size;
    app.$get('/api/order/station/collected/list?index=' + _index + '&size=' + _size, {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          let _listData = this.data.listData,
            _selectedOrders = this.data.selectedOrders,
            _data = res.data;
          for (let i = 0; i < _data.length; i++) {
            let _item = _data[i],
              _isHidden = false;
            for (let k = 0; k < _selectedOrders.length; k++) {
              let k_item = _selectedOrders[k];
              if (_item.tradeId == k_item) {
                _isHidden = true;
                break
              }
            }
            _listData.push({
              from: _item.from || "",
              gmtCreate: _item.gmtCreate,
              items: _item.items,
              receiver: _item.receiver,
              sender: _item.sender,
              status: _item.status,
              to: _item.to,
              tradeId: _item.tradeId,
              isSelect: false,
              isHidden: _isHidden
            })
          }
          if (_data.length < 1) {
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
  addOrder() {
    let _data = this.data.listData,
      _arr = [];
    for (let i = 0; i < _data.length; i++) {
      let item = _data[i];
      if (item.isSelect) {
        _arr.push(item);
      }
    }
    this.returnData(_arr)
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
      selectedOrders: wx.getStorageSync('loadingSelectedOrder') || ""
    })
    this.getCollectedList()
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
      this.getCollectedList()
    }
  },

  
})