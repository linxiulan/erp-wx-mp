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
      stationId: "",
      stationName: ""
    },
    senderInfo: {
      name: "",
      mobile: "",
      address: "",
      stationId: ""
    },
    cargoes: [{
      name: "",
      count: "",
      unit: "条"
    }],
    receivableInfo: { //应收发货人费用
      receivable: 0
    },
    otherPrices: [],
    otherPricesText: '',
    payType: "", //寄付:BY_SENDER  到付:BY_RECEIVER
    statisticalFees: 0,
    Fee: 0,
    RECEIVERFreight: 0,
    freightCharge: 0,
    remark: "",
    editCargoesName: ['布条', '箱包'],
    editCargoesType: ['条', '包'],
    editCargoes: {
      index: ''
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
      _otherPrices = this.data.otherPrices,
      _freightCharge = this.data.freightCharge,
      _receivable = this.data.receivableInfo.receivable;
    for (let i = 0; i < _otherPrices.length; i++) {
      let _amount = _otherPrices[i].amount;
      _num += Number(_amount);
    }
    _num += Number(_freightCharge);
    _num += Number(_receivable);
    this.setData({
      statisticalFees: utils.powAmount(_num, 2)
    })
  },
  countFee() {
    let _num = 0,
      _otherPrices = this.data.otherPrices,
      _freightCharge = this.data.freightCharge,
      _receivable = this.data.receivableInfo.receivable,
      _payType = this.data.payType;
    for (let i = 0; i < _otherPrices.length; i++) {
      let _amount = _otherPrices[i].amount;
      _num += Number(_amount);
    }
    _num += Number(_freightCharge);
    if (_payType == 'BY_RECEIVER') {
      _num += Number(_receivable);
    }
    this.setData({
      Fee: utils.powAmount(_num, 2)
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
        freightCharge: _costInfo.freightCharge,
        receivableInfo: {
          receivable: _costInfo.receivable
        }
      })
      for (let i = 0; i < otherPrices.length; i++) {
        let item = otherPrices[i],
          _unit = i == otherPrices.length - 1 ? '元' : '元；';
        _text += this.getPriceName(item.pcId) + item.amount + _unit;
      }
      this.setData({
        otherPricesText: _text
      })
      this.statisticalFees();
      this.countFee();
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
    let _this = this;
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
          wx.showToast({
            icon: 'none',
            title: res.msg,
          })
        }
        if (_this.data.stationData !== '' && _this.data.priceData !== '') {
          wx.hideLoading()
        }
      },
      fail: (err) => {
        if (_this.data.stationData !== '' && _this.data.priceData !== '') {
          wx.hideLoading()
        }
        wx.showToast({
          icon: 'none',
          title: err.msg,
        })
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
    let _this = this;
    app.$get('/api/price/list', {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          this.setData({
            priceData: res.data
          })
          wx.setStorageSync('priceData', res.data);
          _this.setOtherPrices();
        } else {
          wx.showToast({
            icon: 'none',
            title: res.msg,
          })
        }
        if (_this.data.stationData !== '' && _this.data.priceData !== '') {
          wx.hideLoading()
        }
      },
      fail: (err) => {
        if (_this.data.stationData !== '' && _this.data.priceData !== '') {
          wx.hideLoading()
        }
        wx.showToast({
          icon: 'none',
          title: err.msg,
        })
      }
    })
  },
  setOtherPrices() {
    let _this = this,
      priceData = _this.data.priceData || "",
      otherPrices = _this.data.otherPrices || "",
      arr = [];
    for (let i = 0; i < priceData.length; i++) {
      let item = priceData[i],
        _amount = 0;
      arr.push({
        pcId: item.pcId,
        amount: _amount
      })
    }
    _this.setData({
      'otherPrices': arr
    })
  },
  editCostInfo() {
    let _otherPrices = this.data.otherPrices,
      _freightCharge = this.data.freightCharge,
      _receivable = this.data.receivableInfo.receivable,
      editCostData = {
        otherPrices: _otherPrices,
        freightCharge: _freightCharge,
        receivable: _receivable
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
  //搜索用户信息
  searchInfo(_value, _type, urlType) {
    let _this = this,
      _url = '';
    if (urlType == 'mobile') {
      _url = '/api/customer/' + _value;
    } else {
      _url = '/api/customer/name/' + _value;
    }
    console.log(_url)
    app.$get(_url, {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          if (res.data != null) {
            if (_type == 'receiverInfo') {
              _this.setData({
                receiverInfo: {
                  name: res.data.name || "",
                  mobile: res.data.mobile || "",
                  address: res.data.address || "",
                  stationId: res.data.station ? res.data.station.stationId : "",
                  stationName: res.data.station ? res.data.station.name : "",
                },
                monthly: res.data.monthly
              })
            } else {
              _this.setData({
                senderInfo: {
                  name: res.data.name || "",
                  mobile: res.data.mobile || "",
                  address: res.data.address || "",
                  stationId: res.data.station ? res.data.station.stationId : "",
                  stationName: res.data.station ? res.data.station.name : "",
                }
              })
            }
          }
        }
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },
  //收件人输入手机号
  bindKeyReceiverInfoMobile: function(e) {
    let _value = e.detail.value;
    this.setData({
      'receiverInfo.mobile': _value,
      monthly: false
    })
    if (_value.length >= 11) {
      this.searchInfo(_value, 'receiverInfo', 'mobile')
    }
  },
  //收件人输入姓名
  bindKeyReceiverInfoName: function(e) {
    let _value = e.detail.value;
    this.setData({
      'receiverInfo.name': _value
    })
    if (_value.length >= 2) {
      this.searchInfo(_value, 'receiverInfo', 'name')
    }
  },
  //收件人选择站点
  bindPickerChange(e) {
    let _this = this,
      _key = e.detail.value,
      _stationData = _this.data.stationData,
      _stationId = _stationData[_key].stationId,
      _stationName = _stationData[_key].name;
    _this.setData({
      'receiverInfo.stationId': _stationId,
      'receiverInfo.stationName': _stationName
    });
  },
  //收件人输入地址
  bindKeyReceiverInfoAddress: function(e) {
    this.setData({
      'receiverInfo.address': e.detail.value
    })
  },
  //寄件人输入手机号
  bindKeySenderInfoMobile: function(e) {
    let _value = e.detail.value;
    this.setData({
      'senderInfo.mobile': _value
    })
    if (_value.length >= 11) {
      this.searchInfo(_value, 'senderInfo', 'mobile')
    }
  },
  //寄件人输入姓名
  bindKeySenderInfoName: function(e) {
    let _value = e.detail.value;
    this.setData({
      'senderInfo.name': _value
    })
    if (_value.length >= 2) {
      this.searchInfo(_value, 'senderInfo', 'name')
    }
  },
  //运费
  bindKeyFreightCharge(e) {
    let _value = e.detail.value;
    _value = utils.formatMoney(_value);
    this.setData({
      freightCharge: _value || 0
    })
    this.statisticalFees();
    this.countFee();
  },
  //代收货款
  bindKeyreceivable(e) {
    let _value = e.detail.value;
    _value = utils.formatMoney(_value);
    this.setData({
      'receivableInfo.receivable': _value || 0
    })
    this.statisticalFees();
    this.countFee();
  },
  bindKeyOtherPrices(e) {
    let _value = e.detail.value,
      _index = e.target.dataset.index,
      otherPrices = this.data.otherPrices;
    _value = utils.formatMoney(_value);
    otherPrices[_index].amount = _value || 0;
    this.setData({
      otherPrices: otherPrices
    })
    this.statisticalFees();
    this.countFee();
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
        count: '',
        unit: '条'
      })
    }
    this.setData({
      cargoes: _cargoes
    })
  },
  openEditCargoes(e) {
    let _index = e.currentTarget.dataset.index;
    this.setData({
      editCargoes: {
        index: _index,
      },
      isShowEditCargoes: true
    })
  },
  bindKeyCount(e) {
    let _value = e.detail.value,
      _index = e.currentTarget.dataset.index,
      cargoes = this.data.cargoes;
    if (_value < 1) {
      _value = '';
    }
    cargoes[_index].count = _value;
    this.setData({
      cargoes: cargoes
    })
  },
  switchCargoesUnit(e) {
    let _item = this.data.editCargoes,
      _index = _item.index,
      _unit = e.target.dataset.unit,
      cargoes = this.data.cargoes;
    cargoes[_index].unit = _unit;
    this.setData({
      cargoes: cargoes,
      isShowEditCargoes: false
    })
  },
  closeBullet() {
    this.setData({
      isShowEditCargoes: false
    })
  },
  switchPayType(e) {
    let _type = e.target.dataset.type;
    if (_type) {
      this.setData({
        payType: _type
      })
      this.statisticalFees();
      this.countFee();
    }
  },
  modalCancel: function() {
    this.setData({
      "modal.isHidden": true
    });
  },
  modalConfirm: function() {
    this.savaInfo(this.data.modal.info);
    this.setData({
      "modal.isHidden": true
    });
  },
  //添加客户信息
  savaClient(_name, _mobile, _address, _stationId) {
    app.$post('/api/customer/' + _mobile, {
      params: {
        name: _name,
        stationId: _stationId,
        address: _address
      },
      success: (res) => {},
      fail: (err) => {
        console.log(err);
      }
    })
  },
  //验证提交信息
  verificationInfo() {
    let _data = this.data,
      otherPrices = _data.otherPrices,
      _otherPrices = [],
      mobileReg = /^[1][0-9]{10}$/;
    for (let i = 0; i < otherPrices.length; i++) {
      let _item = otherPrices[i];
      if (_item.amount > 0) {
        _otherPrices.push({
          pcId: _item.pcId,
          amount: _item.amount * 100
        })
      }
    }
    let _info = {
      "stationId": wx.getStorageSync('stationId'),
      "senderInfo": {
        "name": _data.senderInfo.name,
        "mobile": _data.senderInfo.mobile
      },
      "receiverInfo": {
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
    //没有代收货款收货人与寄货人只需要填一个
    if (_data.receivableInfo.receivable <= 0) {
      if ((_data.receiverInfo.name == '' || !mobileReg.test(_data.receiverInfo.mobile)) && (_data.senderInfo.name == '' || !mobileReg.test(_data.senderInfo.mobile))) {
        app.toast("请填写收货人信息或与寄货人信息");
        return false;
      }
    } else {
      if (!mobileReg.test(_data.receiverInfo.mobile)) {
        app.toast("请填写收货人手机号");
        return false;
      }
      if (_data.receiverInfo.name == '') {
        app.toast("请填写收货人姓名");
        return false;
      }
      if (!mobileReg.test(_data.senderInfo.mobile)) {
        app.toast("请填写寄货人手机号");
        return false;
      }
      if (_data.senderInfo.name == '') {
        app.toast("请填写寄货人姓名");
        return false;
      }
    }

    if (_data.receiverInfo.stationId == '') {
      app.toast("请选择收货网点");
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

    /*if (_data.payType == 'BY_SENDER' && _data.freightCharge <= 0) {
      app.toast("请填写运费");
      return false;
    }*/
    if (_data.payType == 'BY_SENDER' && !_data.monthly && _data.Fee != 0) {
      this.setData({
        modal: {
          isHidden: false,
          text: '亲，请确认是否已收取发货人' + _data.senderInfo.name + '相关费用' + _data.Fee + '元',
          info: _info
        }
      })
    } else {
      this.savaInfo(_info)
    }
  },
  savaInfo(_data) {
    let _this = this;
    if (_data.receiverInfo.name != '' && _data.receiverInfo.mobile != '') {
      _this.savaClient(_data.receiverInfo.name, _data.receiverInfo.mobile, _data.receiverInfo.address, _data.receiverInfo.stationId);
    }
    if (_data.senderInfo.name != '' && _data.senderInfo.mobile != '') {
      _this.savaClient(_data.senderInfo.name, _data.senderInfo.mobile, '', _this.data.stationId);
    }
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
          wx.redirectTo({
            url: '../order/detail?tradeID=' + _id
          });
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
  onLoad: function(options) {
    let _stationId = wx.getStorageSync('stationId') || "";
    this.setData({
      stationId: _stationId
    })
    wx.showLoading({
      title: '加载中',
    })
    this.getStationData();
    this.getPriceData();
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