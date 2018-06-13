// pages/order/editOrder.js
const app = getApp()
const utils = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    stationData: '',
    priceData: '',
    stationId: '',
    stationName: '',
    monthly: false,
    receiverInfo: {
      name: "",
      mobile: "",
      address: "",
      stationId: '',
      stationName: ''
    },
    senderInfo: {
      name: "",
      mobile: "",
      address: "",
      stationId: ''
    },
    cargoes: [{
      "name": "",
      "count": 0,
      "unit": ""
    }],
    "receivableInfo": {  //应收发货人费用
      "receivable": 0
    },
    otherPrices: [],
    otherPricesText: '',
    payType: "", //寄付:BY_SENDER  到付:BY_RECEIVER
    statisticalFees: 0,
    RECEIVERFreight:0,
    freightCharge: 0,
    remark: "",
    editCargoesName: ['布条', '箱包'],
    editCargoesType: ['包', '条'],
    editCargoes: {
      index: '',
      name: '布条',
      count: 0.00,
      unit: '包'
    },
    isShowEditCargoes: false,
    isShowStatisticalPopUp: false,
    modal: {
      isHidden: true,
      text: '',
      info: ''
    }
  },
  statisticalFees() {
    let _num = 0,
      _otherPrices = this.data.otherPrices;
    for (let i = 0; i < _otherPrices.length; i++) {
      let _amount=_otherPrices[i].amount;
      _num += Number(_amount);
    }
    if (this.data.payType == "BY_SENDER") {
      let _freightCharge = this.data.freightCharge
      _num += Number(_freightCharge);
    }
    this.setData({
      statisticalFees: utils.powAmount(_num, 2)
    })
  },
  editReceiverInfo() {
    let $receiverInfo = this.data.receiverInfo,
      _parameter = $receiverInfo.name + '|' + $receiverInfo.mobile + '|' + $receiverInfo.address + '|' + $receiverInfo.stationId + '|' + $receiverInfo.stationName;
    wx.navigateTo({
      url: '../editInfo/receiver?parameter=' + _parameter
    })
  },
  editSenderInfo() {
    let $senderInfo = this.data.senderInfo,
      _parameter = $senderInfo.name + '|' + $senderInfo.mobile + '|' + $senderInfo.address + '|' + $senderInfo.stationId;
    wx.navigateTo({
      url: '../editInfo/sender?parameter=' + _parameter
    })
  },
  changeData(data) {
    let _receiverInfo = data.receiverInfo,
      _senderInfo = data.senderInfo,
      _costInfo = data.costInfo;
    if (_receiverInfo) {
      this.setData({
        receiverInfo: {
          name: _receiverInfo.name,
          mobile: _receiverInfo.mobile,
          address: _receiverInfo.address,
          stationId: _receiverInfo.stationId,
          stationName: _receiverInfo.stationName
        },
        monthly: _receiverInfo.monthly
      })
    }
    if (_senderInfo) {
      let _stationId = _senderInfo.stationId;
      this.setData({
        senderInfo: {
          name: _senderInfo.name,
          mobile: _senderInfo.mobile,
          stationId: _stationId,
          stationName: this.getStationName(_stationId)
        }
      })
    }
    if (_costInfo) {
      let otherPrices = _costInfo.otherPrices,
        _text = '';
      this.setData({
        otherPrices: _costInfo.otherPrices,
        freightCharge: _costInfo.freightCharge
      })
      for (let i = 0; i < otherPrices.length; i++) {
        let item = otherPrices[i];
        _text += this.getPriceName(item.pcId) + item.amount + '元；'
      }
      this.setData({
        otherPricesText: _text
      })
      this.statisticalFees();
    }
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
  getStationData() {
    app.$get('/api/station/list', {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          this.setData({
            stationData: res.data
          })
          wx.setStorageSync('stationData', res.data);
          this.setData({
            stationName: this.getStationName(this.data.stationId)
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
  getPriceName(_id) {
    let _data = this.data.priceData,
      _name = "";
    for (let i = 0; i < _data.length; i++) {
      let _item = _data[i];
      if (_item.pcId == _id) {
        _name = _item.name;
        break;
      }
    }
    return _name
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
  editCostInfo() {
    let $otherPrices = this.data.otherPrices,
      $freightCharge = this.data.freightCharge,
      editCostData = {
        otherPrices: $otherPrices,
        freightCharge: $freightCharge
      }
    wx.setStorageSync('editCostData', editCostData)
    wx.navigateTo({
      url: '../editInfo/cost'
    })
  },
  bindKeyReceivable(e) {
    let _value = e.detail.value;
    _value = utils.formatMoney(_value)
    this.setData({
      'receivableInfo.receivable': _value
    })
  },
  bindKeyFreight(e) {
    let _value = e.detail.value;
    _value = utils.formatMoney(_value)
    this.setData({
      'RECEIVERFreight': _value
    })
  },
  bindKeyRemark(e) {
    this.setData({
      remark: e.detail.value
    })
  },
  operateCargoes(e) {
    let _index = e.target.dataset.index,
      _cargoes = this.data.cargoes;
    if (_index > 0) {
      _cargoes.splice(_index, 1)
    } else {
      _cargoes.push({
        name: '',
        count: 0,
        unit: ''
      })
    }
    this.setData({
      cargoes: _cargoes
    })
  },
  openEditCargoes(e) {
    let _index = e.target.dataset.index,
      _cargoes = this.data.cargoes,
      _item = _cargoes[_index] || "";
    this.setData({
      editCargoes: {
        index: _index,
        name: _item.name || '',
        count: _item.count || 0,
        unit: _item.unit || '包'
      },
      isShowEditCargoes: true
    })
  },
  bindKeyCount(e) {
    this.setData({
      'editCargoes.count': e.detail.value
    })
  },
  selectCargoesName(e) {
    let _name = e.target.dataset.name,
      c_name = this.data.editCargoes.name || '';
    this.setData({
      'editCargoes.name': _name == c_name ? '' : _name
    })
  },
  addEditCargoesCount() {
    let _num = this.data.editCargoes.count;
    _num++;
    this.setData({
      'editCargoes.count': _num
    })
  },
  delEditCargoesCount() {
    let _num = this.data.editCargoes.count;
    _num--;
    this.setData({
      'editCargoes.count': _num > 0 ? _num : 0
    })
  },
  operateStatisticalPopUp(e) {
    let _type = e.target.dataset.type,
      _isShow = this.data.isShowStatisticalPopUp;
    if (_type) {
      this.setData({
        'editCargoes.unit': _type
      })
    }
    this.setData({
      isShowStatisticalPopUp: _isShow ? false : true
    })
  },
  savaCargoes() {
    let _item = this.data.editCargoes,
      _cargoes = this.data.cargoes,
      _index = _item.index;
    _cargoes[_index] = {
      name: _item.name || '',
      count: _item.count || 0,
      unit: _item.unit || ''
    };
    this.setData({
      cargoes: _cargoes
    })
  },
  closeBullet() {
    this.setData({
      isShowEditCargoes: false
    })
    this.savaCargoes()
  },
  switchPayType(e) {
    let _type = e.target.dataset.type;
    if (_type) {
      this.setData({
        payType: _type
      })
      this.statisticalFees()
    }
  },
  modalCancel: function () {
    this.setData({
      "modal.isHidden": true
    });
  },
  modalConfirm: function () {
    this.savaInfo(this.data.modal.info);
    this.setData({
      "modal.isHidden": true
    });
  },
  //验证提交信息
  verificationInfo() {
    let _data = this.data,
      _otherPrices = utils.copyObj(_data.otherPrices);
    for (let i = 0; i < _otherPrices.length; i++) {
      let _item = _otherPrices[i];
      _otherPrices[i].amount = _item.amount * 100;
    }
    let _info = {
      "stationId": wx.getStorageSync('stationId'),
      "senderInfo":
      {
        "name": _data.senderInfo.name,
        "mobile": _data.senderInfo.mobile
      },
      "receiverInfo":
      {
        "name": _data.receiverInfo.name,
        "mobile": _data.receiverInfo.mobile,
        "address": _data.receiverInfo.address,
        "stationId": _data.receiverInfo.stationId
      },
      "cargoes": _data.cargoes,
      "receivableInfo": {
        "receivable": _data.receivableInfo.receivable * 100
      },
      "otherPrices": _otherPrices,
      "payType": _data.payType,
      "freightCharge": _data.freightCharge * 100,
      "remark": _data.remark
    };
    if (_data.payType == 'BY_RECEIVER' ) {
      _info.freightCharge = _data.RECEIVERFreight*100
    } 
    if (_data.senderInfo.mobile == '') {
      app.toast("请填写发货人信息");
      return false;
    }
    if (_data.receiverInfo.mobile == '') {
      app.toast("请填写收货人信息");
      return false;
    }
    let _cargoes = _data.cargoes,
      _cargoes_err = false;
    for (let i = 0; i < _cargoes.length; i++) {
      let item = _cargoes[i];
      if (item.count <= 0) {
        _cargoes_err = true
        break;
      }
    }
    if (_cargoes_err) {
      app.toast("请完善货物信息");
      return false;
    }
    if (_data.payType == '') {
      app.toast("请选择支付方式");
      return false;
    }
    if (_data.payType == 'BY_SENDER' && _data.freightCharge <= 0) {
      app.toast("请填写运费");
      return false;
    } 
    if (_data.payType == 'BY_SENDER' && !_data.monthly ) {
      this.setData({
        modal: {
          isHidden: false,
          text: '亲，请确认是否已收取发货人-' + _data.senderInfo.name + '相关费用' + _data.statisticalFees + '元',
          info: _info
        }
      })
    } else {
      this.savaInfo(_info)
    }
  },
  savaInfo(_data) {
    wx.showLoading({
      title: '保存中,请稍等',
    });
    app.$post('/api/order', {
      params: _data,
      success: (res) => {
        wx.hideLoading();
        if (res.code == 'SUCCESS') {
          app.toast('添加成功', true);
          let _id = res.data.tradeId;
          wx.redirectTo({ url: '../order/detail?tradeID=' + _id });
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
    let _stationId = wx.getStorageSync('stationId') || "";
    this.setData({
      stationId: _stationId
    })
    this.getStationData();
    this.getPriceData();
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