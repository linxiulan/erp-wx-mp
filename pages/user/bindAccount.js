// pages/qrcode/handler.js
const app = getApp();
const utils = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentModules: '',
    userName: '',
    mobile: '',
    bindToken: '',
    companyId: '',
    failureTitle: '二维码已过期',
    failureText: '请联系公司负责人获取最新员工绑定二维码',
    isSaving:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options){
      let _action = options.action || 'bindCompany',
        _companyId = options.companyId||'1',
        _token = options.token ||'1f56e540176940958bcb89ff3d537aa8';
      if (_action == 'bindCompany') {
        this.setData({
          currentModules: 'company',
          companyId: _companyId,
          bindToken: _token
        })
        return false;
        app.toast("扫码的二维码无效")
      } 
    }else{
      app.toast("扫码的二维码无效")
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

  

  /**
   * 切换到完善资料模块
   */
  switchingModule: function (event) {
    let _name = event.currentTarget.dataset.name;
    this.setData({
      'currentModules': _name
    })
    if (_name == 'information') {
      wx.setNavigationBarTitle({
        title: '完善资料'//页面标题为路由参数
      })
    }
  },
  bindKeyUserName: function (e) {
    this.setData({
      userName: e.detail.value
    })
  },
  bindKeyMobile: function (e) {
    var phone = e.detail.value;
    if (!(/^[1][2,3,4,5,7,8][0-9]{9}$/.test(phone))) {
      this.setData({
        mobile: e.detail.value
      })
      if (phone.length >= 11) {
        app.toast('手机号有误');
      }
    } else {
      this.setData({
        mobile: e.detail.value
      })
    }
  },
  saveBtn: function () {
    var _this = this,
      _mobile = this.data.mobile,
      _name = this.data.userName,
      nameReg = /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,
      mobileReg = /^[1][2,3,4,5,7,8][0-9]{9}$/;
    if (!nameReg.test(_name)) {
      app.toast('请输入正确的姓名');
      return false;
    }
    if (!mobileReg.test(_mobile)) {
      app.toast('请输入正确的手机号码');
      return false;
    }
    _this.saveInfo(_name, _mobile)
  },
  saveInfo: function (name, mobile) {
    wx.showLoading({
      title: '绑定中,请稍等',
    });
    let _this = this;
    wx.login({
      success: res => {
        let _code = res.code;
        wx.getUserInfo({
          success: function (res) {
            app.$put('/api/user/wx/bind', {
              params: {
                wxCode: _code,
                wxEncryptedData: res.encryptedData,
                wxIv: res.iv,
                mobile: mobile,
                name: name,
                bindToken: _this.data.bindToken,
                companyId: _this.data.companyId
              },
              success: (res) => {
                wx.hideLoading();
                if (res.code == 'SUCCESS') {
                  _this.setData({
                    currentModules: 'bindSuccess'
                  })
                  wx.setNavigationBarTitle({
                    title: '绑定成功'//页面标题为路由参数
                  })
                } else if (res.code == "INVALID_TOKEN") {
                  _this.setData({
                    currentModules: 'bindFailure'
                  })
                  wx.setNavigationBarTitle({
                    title: '二维码已过期'//页面标题为路由参数
                  })
                } else {
                  app.toast(res.msg);
                }
              },
              fail: (err) => {
                wx.hideLoading();
                wx.showToast(err.msg)
              }
            })
          },
          fail: function (res) {
            wx.redirectTo({ url: '../user/error?type=3' });
          }
        })
      }
    })
  },
  returnHome: function () {
    app.login(true);
  }
})