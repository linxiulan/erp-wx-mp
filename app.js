//app.js
App({
  hostPath: 'https://api.mherp.com',
  toast(title, isSuccess) {
    wx.showToast({
      title: title,
      icon: isSuccess ? 'success' : 'none',
      duration: 3000
    })
  },
  request(method, url, requestHandler) {
    let _this = this,
      _host = _this.hostPath,
      API_URL = _host + url,
      params = requestHandler.params;
    wx.request({
      url: API_URL,
      data: params,
      method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        AccessToken: wx.getStorageSync('AccessToken') || ""
      }, // 设置请求的 header 
      success: function(res) {
        if (res.data.code == 'INVALID_TOKEN' && url != '/api/user/wx/bind') {
          _this.toast('登录已过期')
          wx.clearStorageSync()
          _this.login()
        } else if (res.data.code == 'USER_NOT_EXISTS') {
          _this.toast('用户不存在')
          wx.clearStorageSync()
          wx.redirectTo({
            url: '../user/error?type=1'
          });
        } else if (res.data.code == 'PERMISSION_DENIED') {
          _this.login()
        } else {
          requestHandler.success(res.data)
        }
      },
      fail: function() {
        requestHandler.fail()
      },
      complete: function() {
        // complete 
      }
    })
  },
  $get(url, requestHandler) {
    this.request('GET', url, requestHandler)
  },
  $post(url, requestHandler) {
    this.request('POST', url, requestHandler)
  },
  $put(url, requestHandler) {
    this.request('PUT', url, requestHandler)
  },
  login(isReturn) {
    var _this = this,
      _token = wx.getStorageSync('AccessToken') || "",
      pages = getCurrentPages(),
      currentPage = pages[pages.length - 1],
      _route = currentPage.route;
    if (_token == "") {
      wx.showLoading({
        title: '登录中,请稍等',
      });
      wx.login({
        success: res => {
          let _code = res.code;
          wx.getUserInfo({
            success: function(res) {
              wx.clearStorageSync();
              wx.setStorageSync('wx_userInfo', res.userInfo);
              _this.$post('/api/user/wx/token', {
                params: {
                  wxCode: _code,
                  wxEncryptedData: res.encryptedData,
                  wxIv: res.iv
                },
                success: (res) => {
                  wx.hideLoading();
                  if (res.code == 'SUCCESS') {
                    let _data = res.data,
                      _companyPhone = res.data.companyPhone || '';
                    _this.toast('登录成功', true);
                    wx.setStorageSync('AccessToken', res.data.token)
                    wx.setStorageSync('stationId', res.data.stationId)
                    wx.setStorageSync('companyName', res.data.companyName)
                    wx.setStorageSync('companyIcon', res.data.companyIcon)
                    wx.setStorageSync('companyPhone', _companyPhone)
                    wx.setStorageSync('userId', res.data.uid)
                    if (isReturn) {
                      wx.reLaunch({
                        url: '../index/index'
                      });
                    }
                  } else if (res.code == "UNBIND_COMPANY") {
                    wx.reLaunch({
                      url: '../user/error?type=1'
                    });
                  } else if (res.code == 'USER_NOT_ALLOT_STATION' && _route != 'pages/user/error') {
                    wx.reLaunch({
                      url: '../user/error?type=2'
                    });
                  }
                },
                fail: (err) => {
                  wx.hideLoading();
                  wx.showToast(err.msg)
                }
              })
            },
            fail: function(res) {
              wx.redirectTo({
                url: "../user/error?type=3"
              });
            }
          })
        }
      })
    } else {
      if (isReturn) {
        wx.redirectTo({
          url: '../index/index'
        });
      }
    }
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
  onLaunch: function(options) {

  }
})