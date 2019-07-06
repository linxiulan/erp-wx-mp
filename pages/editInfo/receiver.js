// pages/editInfo/receiver.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentModule: '',// search or completeMaterial
    searchMobile: '',
    searchData: '',
    name: "",
    mobile: "",
    address: "",
    stationId: '',
    stationName: '',
    monthly:false
  },
  selectStation() {
    wx.navigateTo({
      url: 'station?stationId=' + this.data.stationId
    })
  },
  changeData(data) {
    let item = data.station;
    if (item) {
      this.setData({
        stationId: item.stationId || '',
        stationName: item.stationName || '',
      })
    }
  },
  bindKeySearchMobile: function (e) {
    let _value = e.detail.value;
    this.setData({
      searchMobile: _value
    })
    if (_value.length >= 11) {
      this.searchInfo(_value)
    } else {
      this.setData({
        searchData: ''
      })
    }
  },
  bindKeyName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindKeyMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  searchInfo(_value) {
    app.$get('/api/customer/' + _value, {
      success: (res) => {
        if (res.code == 'SUCCESS') {
          if (res.data == null) {
            this.setData({
              searchData: []
            })
          }else{
            this.setData({
              searchData: [{
                name: res.data.name || "",
                mobile: res.data.mobile || "",
                address: res.data.address || "",
                stationId: res.data.station ? res.data.station.stationId : "",
                monthly: res.data.monthly
              }]
            })
          }
        } else {
          this.setData({
            searchData: []
          })
        }
      },
      fail: (err) => {
        wx.showToast({
          title: err.msg,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  selectedUser(e) {
    let _index = e.target.dataset.index,
      _data = this.data.searchData[_index],
      _stationId = _data.stationId,
      _stationName = '',
      stationData = wx.getStorageSync('stationData') || "";

    if (stationData) {
      for (let i = 0; i < stationData.length; i++) {
        let item = stationData[i];
        if (item.stationId == _stationId) {
          _stationName = item.name;
          break
        }
      }
    }
    this.setData({
      name: _data.name,
      mobile: _data.mobile,
      address: _data.address,
      stationId: _stationId,
      stationName: _stationName,
      monthly: _data.monthly,
      currentModule: 'completeMaterial'
    })
  },
  savaMobile() {
    this.setData({
      mobile: this.data.searchMobile,
      currentModule: 'completeMaterial'
    })
  },
  textareaFocus(e) {
    let _value = e.detail.value;
    if (_value == "请输入收货地址") {
      this.setData({
        address: ''
      })
    }
  },
  textareaBlur(e) {
    let _value = e.detail.value;
    if (_value == "") {
      _value = "请输入收货地址"
    }
    this.setData({
      address: _value
    })
  },
  textareaKey(e) {
    this.setData({
      address: e.detail.value
    })
  },
  savaBtn() {
    var _this = this,
      _mobile = this.data.mobile,
      _name = this.data.name,
      _address = this.data.address == '请输入收货地址' ? '' : this.data.address,
      _stationId = this.data.stationId,
      _stationName = this.data.stationName,
      _monthly=this.data.monthly,
      nameReg = /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,
      mobileReg = /^[1][2,3,4,5,7,8][0-9]{9}$/;
    if (_name == "") {
      wx.showToast({
        title: '请输入收货人',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (!mobileReg.test(_mobile)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (_stationId == '') {
      wx.showToast({
        title: '请选择收货网点',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    /*if (_address == '') {
      wx.showToast({
        title: '请输入收货地址',
        icon: 'none',
        duration: 2000
      })
      return false;
    }*/
    this.savaInfo(_name, _mobile, _address, _stationId, _stationName, _monthly)
  },
  savaInfo(_name, _mobile, _address, _stationId, _stationName, _monthly) {
    let _data = {
      "receiverInfo": {
        name: _name,
        mobile: _mobile,
        address: _address,
        stationId: _stationId,
        stationName: _stationName,
        monthly: _monthly
      }
    }
    this.returnData(_data);
    this.savaClient(_name, _mobile, _address, _stationId);
    wx.navigateBack();
  },
  savaClient(_name, _mobile, _address, _stationId){
    app.$post('/api/customer/' + _mobile, {
      params: {
        name: _name,
        stationId: _stationId,
        address: _address
      },
      success: (res) => {
        wx.hideLoading();
        /*if (res.code == 'SUCCESS') {

        } else {
          app.toast(res.msg)
        }*/
        //console.log(res);
      },
      fail: (err) => {
        wx.hideLoading();
        app.toast(err.msg)
      }
    })
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
    let _parameter = options.parameter;
    _parameter = _parameter.split('|');
    this.setData({
      currentModule: _parameter[0] ? 'completeMaterial' : 'search'
    })
    this.setData({
      name: _parameter[0] || '',
      mobile: _parameter[1] || '',
      address: _parameter[2] || '',
      stationId: _parameter[3] || '',
      stationName: _parameter[4] || ''
    })
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