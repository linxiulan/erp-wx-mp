// pages/index/list.js
const app = getApp();
const utils = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carId: '',
    plateNumber: '',
    editIndex: 0,
    startX: 0, //开始坐标
    startY: 0,
    isTouchMove: false,
    delBtnWidth: 150,
    orderList: []
  },
  //扫码添加
  scanningBtn() {
    let _this = this;
    wx.scanCode({
      success: (res) => {
        let _url = res.result,
          action = utils.GetQueryString(_url, 'action') || '',
          tradeID = utils.GetQueryString(_url, 'tradeId') || '',
          _orderList = _this.data.orderList,
          isExist = false;
        for (let i = 0; _orderList.length > i; i++) {
          if (tradeID == _orderList[i].tradeId) {
            isExist = true;
            break;
          }
        }
        if (isExist) {
          app.toast('该订单已存在');
        } else if (action == 'order' && tradeID != '') {
          wx.showLoading({
            title: '扫码成功,正在查询订单信息',
          });
          _this.getOrderInfo(tradeID)
        } else {
          app.toast('该订单无效')
        }
      }
    })
  },
  //获取订单信息
  getOrderInfo(_id) {
    app.$get('/api/order/list/' + _id, {
      success: (res) => {
        wx.hideLoading();
        if (res.code == 'SUCCESS') {
          if (res.data == null) {
            app.toast("没有该订单")
          } else {
            let _orderList = this.data.orderList || [];
            _orderList.push(res.data);
            this.setData({
              orderList: _orderList
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
  //选择订单
  selectOrder() {
    let _orderList = this.data.orderList,
      _tradeIds = [];
    for (let i = 0; _orderList.length > i; i++) {
      _tradeIds.push(_orderList[i].tradeId);
    }
    wx.setStorageSync('loadingSelectedOrder', _tradeIds);
    wx.navigateTo({
      url: '../loading/addList'
    })
  },
  //接收返回的数据
  changeData(data) {
    let _data = data;
    if (_data.length > 0) {
      let _orderList = this.data.orderList;
      _orderList.push.apply(_orderList, _data);
      this.setData({
        orderList: _orderList
      })
    }
  },
  //装车
  modifyStatus() {
    let _orderList = this.data.orderList;
    if (_orderList.length < 1) {
      app.toast("选择订单")
      return false;
    }
    let _tradeIds = [];
    for (let i = 0; i < _orderList.length; i++) {
      _tradeIds.push(_orderList[i].tradeId)
    }
    app.$put('/api/order/status', {
      params: {
        "tradeIds": _tradeIds,
        "carId": this.data.carId,
        "status": "ONLOAD"
      },
      success: (res) => {
        if (res.code == 'SUCCESS') {
          app.toast('装车成功');
          setTimeout(function() {
            wx.reLaunch({
              url: '../index/index'
            })
          }, 1500)

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
  onLoad: function(options) {
    this.setData({
      carId: options.carId || "",
      plateNumber: options.plateNumber || ""
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

 
  //手指触摸动作开始 记录起点X坐标
  touchstart: function(e) {
    //开始触摸时 重置所有删除
    this.data.orderList.forEach(function(v, i) {
      if (v.isTouchMove) //只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      orderList: this.data.orderList
    })
  },
  //滑动事件处理
  touchmove: function(e) {
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
        X: touchMoveX,
        Y: touchMoveY
      });
    that.data.orderList.forEach(function(v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      orderList: that.data.orderList
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function(start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function(e) {
    this.data.orderList.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      orderList: this.data.orderList
    })
  }
})