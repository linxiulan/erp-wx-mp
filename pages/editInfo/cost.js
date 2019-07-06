// pages/editInfo/cost.js
const utils = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    priceData: wx.getStorageSync('priceData') || "",
    otherPrices: [],
    freightCharge: 0,
    receivable:0,
    payType:'',
    orderStatus:''
  },
  bindKeyFreightCharge(e) {
    let _value = e.detail.value;
    _value = utils.formatMoney(_value);
    this.setData({
      freightCharge: _value || 0
    })
  },
  bindKeyreceivable(e) {
    let _value = e.detail.value;
    _value = utils.formatMoney(_value);
    this.setData({
      receivable: _value || 0
    })
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
  init(){
    let _data = wx.getStorageSync('editCostData') || "",
      priceData = this.data.priceData || "",
      otherPrices = _data.otherPrices || "",
      arr = [];
    for (let i = 0; i < priceData.length; i++) {
      let item = priceData[i],
        _amount = 0;
      
      for (let x = 0; x < otherPrices.length; x++) {
        let x_item = otherPrices[x];
        if (item.pcId == x_item.pcId) {
          _amount = x_item.amount
          break
        }
      }
      arr.push({
        pcId: item.pcId,
        amount: _amount
      })
    }
    this.setData({
      otherPrices: arr,
      freightCharge: _data.freightCharge,
      receivable: _data.receivable,
      payType: _data.payType||'',
      orderStatus: _data.orderStatus||''
    })
  },
  //请求费用相关数据
  getPriceData() {
    let _this=this;
    app.$get('/api/price/list', {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          _this.setData({
            priceData: res.data
          })
          _this.init();
          wx.setStorageSync('priceData', res.data)
        } else {
          app.toast("请求费用相关失败，请重新进入")
        }
      },
      fail: (err) => {
        wx.showToast(err.msg)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _data = wx.getStorageSync('priceData') || "",
    _this=this;
    if (_data){
      _this.setData({
        priceData: _data
      })
      _this.init();
    }else{
      _this.getPriceData()
    }
  },
  savaBtn() {
    let otherPrices = this.data.otherPrices,
      freightCharge = this.data.freightCharge,
      receivable = this.data.receivable,
      _arr = [];
    for (let i = 0; i < otherPrices.length; i++) {
      let item = otherPrices[i];
      if (item.amount > 0) {
        _arr.push({
          pcId: item.pcId,
          name: this.getPriceName(item.pcId),
          amount: item.amount
        })
      }
    }
    let _data = {
      costInfo: {
        otherPrices: _arr,
        freightCharge: freightCharge,
        receivable: receivable
      }
    }
    this.returnData(_data)
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