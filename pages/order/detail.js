// pages/order/detail.js
const app = getApp()
const utils = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tradeID: '',
    orderData: '',
    payType: '',
    payReceivable: 0,
    monthly: true,
    statisticalFees: 0,
    Fee: 0,
    receivableRemark:'',
    noticeRemark: '',
    signature: '',
    modal: {
      hidden: true,
      title: '',
      leftBtn: '取消',
      rightBtn: '确定',
      content: '',
      type: 1
    }
  },
  bindKeyRemark: function(e) {
    this.setData({
      noticeRemark: e.detail.value
    })
  },
  bindKeyReceivableRemark: function (e) {
    this.setData({
      receivableRemark: e.detail.value
    })
  },
  dialMobile(e) {
    let _num = e.target.dataset.num;
    wx.makePhoneCall({
      phoneNumber: _num
    })
  },
  statisticalFees() {
    let _num = 0,
      _data = this.data.orderData,
      _prices = _data.prices || "";
    for (let i = 0; i < _prices.length; i++) {
      let _amount = _prices[i].amount;
      _num += Number(_amount);
    }
    let _freightCharge = _data.freightCharge || 0;
    _num += Number(_freightCharge);
    this.setData({
      statisticalFees: _num
    })
  },
  countFee() {
    let _num = 0,
      _data = this.data.orderData,
      _prices = _data.prices || "",
      _freightCharge = _data.freightCharge || 0,
      _payReceivable = this.data.payReceivable || 0,
      _payType = _data.payType;
    _num += Number(_payReceivable);
    if (_payType == 'BY_RECEIVER') {
      for (let i = 0; i < _prices.length; i++) {
        let _amount = _prices[i].amount;
        _num += Number(_amount);
      }
      _num += Number(_freightCharge);
    }
    this.setData({
      Fee: _num
    })
  },
  getPriceData() {
    app.$get('/api/price/list', {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          this.setData({
            priceData: res.data
          })
          wx.setStorageSync('priceData', res.data)
        } else {
          wx.showToast(res.msg)
        }
      },
      fail: (err) => {
        wx.showToast(err.msg)
      }
    })
  },
  getOrderInfo(_id) {
    let _this = this;
    app.$get('/api/order/' + _id, {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          wx.hideLoading();
          let _data = res.data,
            _prices = _data.prices;
          _data.freightCharge = _data.freightCharge / 100;
          _data.receivable = _data.receivable / 100;
          if (_prices) {
            for (let i = 0; i < _prices.length; i++) {
              let _amount = _prices[i].amount;
              _data.prices[i].amount = _amount / 100;
            }
          }
          _this.setData({
            orderData: _data
          });
          _this.statisticalFees();
          _this.countFee();
        } else {
          _this.setData({
            orderData: []
          });
        }
      },
      fail: (err) => {
        app.toast(err.msg)
      }
    })
  },

  //打印订单
  printOrderBtn() {
    let _this = this,
      _data = _this.data,
      _printData = {
        tradeId: _data.orderData.tradeId,
        orderStatus: _data.orderData.orderStatus,
        companyName: wx.getStorageSync('companyName') || "",
        telephone: wx.getStorageSync('companyPhone') || "",
        senderInfoStationName: _data.orderData.senderInfo.station.name,
        receiverInfoStationName: _data.orderData.receiverInfo.station.name,
        receiverInfoName: _data.orderData.receiverInfo.name,
        receiverInfoMobile: _data.orderData.receiverInfo.mobile,
        items: _data.orderData.items,
        total: _data.statisticalFees,
        isMonthly: _data.orderData.payType == 'BY_SENDER' ? _data.orderData.senderInfo.monthly : _data.orderData.receiverInfo.monthly,
        payType: _data.orderData.payType,
        receivable: _data.orderData.receivable,
        note: _data.orderData.remark || '无',
        createUser: _data.orderData.traces[0].createUser,
        gmtCreate: _data.orderData.traces[0].gmtCreate,
      };
    wx.setStorageSync('printData', _printData)
    wx.navigateTo({
      url: '../blueTooth/list'
    })
    //app.toast('开发中，敬请期待')
  },
  //取消订单
  cancelOrderBtn() {
    this.setData({
      modal: {
        hidden: false,
        title: '您确定要取消此订单吗？',
        leftBtn: '取消',
        rightBtn: '确定',
        content: '',
        type: 1
      }
    })
  },
  //通知
  noticeUserBtn() {
    let _name = this.data.orderData.receiverInfo.name;
    this.setData({
      modal: {
        hidden: false,
        title: '标记已通知' + _name,
        leftBtn: '取消',
        rightBtn: '确定',
        content: '',
        type: 2
      }
    })
  },
  //通知用户
  noticeUser() {
    let _id = this.data.tradeID || "",
      _noticeRemark = this.data.noticeRemark;
    this.setData({
      'modal.hidden': true
    })
    wx.showLoading({
      title: '操作中,请稍等',
    });
    app.$put('/api/order/notify', {
      params: {
        "tradeId": _id,
        "remark": _noticeRemark || ""
      },
      success: (res) => {
        wx.hideLoading();
        if (res.code == 'SUCCESS') {
          app.toast('操作成功')
          this.getOrderInfo(_id)
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
  //提货
  pickUpBtn() {
    let $orderData = this.data.orderData,
      _payType = $orderData.payType,
      _title = '',
      _payReceivable = this.data.payReceivable,
      _receivable = $orderData.receivable;
    if (_payReceivable > _receivable) {
      app.toast('收取货款金额不能大于代收货款金额');
      return false;
    }
    if (_payReceivable == 0 || _payReceivable == _receivable){
      this.setData({
        receivableRemark:''
      })
    }
    if (_payType == 'BY_SENDER') {
      let _name = $orderData.receiverInfo.name,
        _money = _payReceivable;
      _title = '亲，请确认是否已收取收货人-' + _name + '货款' + _money + '元'
    }
    if (_payType == 'BY_RECEIVER') {
      let _freightCharge = $orderData.freightCharge || 0;
      if (_freightCharge <= 0) {
        app.toast('请输入运费')
        return false;
      }
      let _Fee = this.data.Fee,
        _name = $orderData.receiverInfo.name;
      _title = '亲，请确认是否已收取收货人-' + _name + '货款加其他费用' + _Fee + '元'
    }
    if ($orderData.receiverInfo.monthly){
      this.photoUpload()
    }else{
      this.setData({
        modal: {
          hidden: false,
          title: _title,
          leftBtn: '取消',
          rightBtn: '确认',
          content: '',
          type: 3
        }
      })
    }
  },
  pickUp() {
    wx.showLoading({
      title: '操作中,请稍等',
    });
    let _data = this.data,
      $orderData = _data.orderData,
      _otherPrices = utils.copyObj($orderData.prices) || "",
      _id = _data.tradeID,
      _payType = $orderData.payType,
      _params = {
        "tradeId": _id,
        "status": "COMPLETED",
        "payType": _payType,
        "replaceUnPayPrice": false,
        "freightCharge": $orderData.freightCharge * 100,
        "payReceivable": _data.payReceivable * 100,
        "sign": _data.signature || '',
        "receivableRemark": _data.receivableRemark
      };
    for (let i = 0; i < _otherPrices.length; i++) {
      let _item = _otherPrices[i];
      _otherPrices[i].amount = _item.amount * 100;
    }
    if (_payType == 'BY_RECEIVER') {
      _params.replaceUnPayPrice = true;
      _params.replaceOrderPrices = _otherPrices || [];
    }
    app.$put('/api/order/status', {
      params: _params,
      success: (res) => {
        wx.hideLoading();
        if (res.code == 'SUCCESS') {
          app.toast('操作成功')
          this.getOrderInfo(_id)
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
  modalConfirm() {
    let _type = this.data.modal.type;
    if (_type == 1) { //取消订单
      this.cancelOrder();
    }
    if (_type == 2) {
      this.noticeUser();
      return false;
    }
    if (_type == 3) {
      /*wx.navigateTo({
        url: '../canvas/signature'
      })*/
      this.photoUpload();
    }
    this.setData({
      'modal.hidden': true
    });
  },
  modalCancel() {
    this.setData({
      'modal.hidden': true
    })
  },
  uploadFile(_tempFilePath) {
    let _this = this;
    wx.uploadFile({
      url: app.hostPath + '/api/file/temp/upload', //仅为示例，非真实的接口地址
      filePath: _tempFilePath[0],
      header: {
        AccessToken: wx.getStorageSync('AccessToken') || ""
      },
      name: 'file',
      formData: {
        'user': 'test'
      },
      success: function(res) {
        let _data = JSON.parse(res.data);
        if (_data.code == 'SUCCESS') {
          /*let _fileKey = _data.data.fileKey;
          _data = { 'signature': _fileKey }
          _this.returnData(_data)
          wx.navigateBack()*/
          _this.setData({
            'signature': _data.data.fileKey
          })
          _this.pickUp()
        } else {
          app.toast(_data.msg)
        }
      }
    })
  },
  //拍照上传
  photoUpload() {
    let _this = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        //var tempFilePaths = res.tempFilePaths
        //console.log(res.tempFilePaths)
        _this.uploadFile(res.tempFilePaths)
      }
    })
  },
  //取消订单
  cancelOrder() {
    let _id = this.data.tradeID || "";
    if (_id == '') {
      return false;
    }
    wx.showLoading({
      title: '操作中,请稍等',
    });
    app.$put('/api/order/status', {
      params: {
        "tradeId": _id,
        "status": "CANCEL"
      },
      success: (res) => {
        if (res.code == 'SUCCESS') {
          app.toast('取消成功')
          this.getOrderInfo(_id)
        } else {
          wx.hideLoading();
          app.toast(res.msg)
        }
      },
      fail: (err) => {
        wx.hideLoading();
        app.toast(err.msg)
      }
    })
  },
  //编辑费用
  editCostInfo() {
    let _data = this.data.orderData,
      $otherPrices = _data.prices,
      $freightCharge = _data.freightCharge,
      receivable = this.data.payReceivable,
      payType = _data.payType,
      orderStatus = _data.orderStatus;
    let editCostData = {
      otherPrices: $otherPrices,
      freightCharge: $freightCharge,
      receivable: receivable,
      payType: payType,
      orderStatus: orderStatus
    };
    wx.setStorageSync('editCostData', editCostData)
    wx.navigateTo({
      url: '../editInfo/cost'
    })
  },
  changeData(data) {
    let _costInfo = data.costInfo,
      _signature = data.signature;
    if (_costInfo) {
      let otherPrices = _costInfo.otherPrices;
      this.setData({
        'orderData.prices': _costInfo.otherPrices,
        'orderData.freightCharge': _costInfo.freightCharge,
        'payReceivable': _costInfo.receivable
      })
      this.statisticalFees();
      this.countFee();
    }
    if (_signature) {
      this.setData({
        'signature': _signature
      })
      this.pickUp()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _tradeID = options.tradeID || "";
    this.setData({
      tradeID: _tradeID
    })
    wx.showLoading({
      title: '加载中',
    })
    this.getPriceData();
    this.getOrderInfo(_tradeID)
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

 
})