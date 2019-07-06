// pages/blueTooth/list.js
let app = getApp();
const utils = require('../../utils/util.js');
const CPCL = require('../../utils/CPCL.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    status: '',//错误页面:failure  正常页面:normal
    connectedDeviceList: [], //已连接设备列表
    lastUsedDeviceList: [], //上次使用列表
    newDeviceList: [],      //新设备列表
    loading: true,
    autoSearch: true,
    requestNum: 0,
    returnNum: 0,
    devices: [],
    deviceName: '',//仅用于存储连接的设备名
    deviceId: '',
    serviceId: '',
    characteristicId: '',
    instructionAbove: '',
    instructionBelow: ''
  },
  //
  startConnect: function () {
    let _this = this;
    _this.openBluetoothAdapter();
    setTimeout(function () {
      _this.onBluetoothAdapterStateChange();
    }, 2000);
  },
  //蓝牙报错处理
  errorHandling(err) {
    let _code = err.errCode,
      _msg = "";
    wx.hideLoading();
    if (_code == -1) {
      _msg = "连接失败,已连接";
    } else if (_code == 10000) {
      _msg = "未初始化蓝牙适配器";
    }
    if (_code == 10001) {
      _msg = "当前蓝牙适配器不可用";
    }
    if (_code == 10002) {
      _msg = "没有找到指定设备";
    }
    if (_code == 10003) {
      _msg = "指定的设备已与我们断开连接";
    }
    if (_code == 10004) {
      _msg = "没有找到指定服务";
    }
    if (_code == 10005) {
      _msg = "没有找到指定特征值";
    }
    if (_code == 10006) {
      _msg = "当前连接已断开";
    }
    if (_code == 10007) {
      _msg = "当前特征值不支持此操作";
    }
    if (_code == 10008) {
      _msg = err.errMsg;
    }
    if (_msg != "") {
      app.toast(_msg);
    }
  },
  //开启蓝牙
  openBluetoothAdapter() {
    let _this = this;
    wx.showLoading({
      title: '开启蓝牙适配'
    });
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log("初始化蓝牙适配器", res);
        //_this.getBluetoothDevices();
        _this.getBluetoothAdapterState();
      },
      fail: function (err) {
        console.log("初始化蓝牙适配器", err);
        _this.setData({
          status: 'failure'
        })
        wx.hideLoading();
      }
    });
  },
  //获取蓝牙模块生效期间的已发现设备，包括已经和本机处于联系状态的设备
  getBluetoothDevices() {
    function ab2hex(buffer) {
      var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (bit) {
          return ('00' + bit.toString(16)).slice(-2)
        }
      )
      return hexArr.join('');
    }
    wx.getBluetoothDevices({
      success: function (res) {
        console.log('获取已发现设备', res)
        if (res.devices[0]) {
          console.log(ab2hex(res.devices[0].advertisData))
        }
      }
    })
  },
  //监听蓝牙设配器状态
  onBluetoothAdapterStateChange() {
    let _this = this,
      _autoSearch = _this.data.autoSearch;
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log('监听蓝牙设配器状态', res);
      let available = res.available;
      if (available && _autoSearch) {
        _this.getBluetoothAdapterState();
      } else if (!available) {
        _this.closeBluetoothFeatures();
      }
    })
  },
  //关闭蓝牙服务
  closeBluetoothFeatures() {
    this.setData({
      status: 'failure'
    })
    wx.openBluetoothAdapter()
    wx.stopBluetoothDevicesDiscovery()
  },
  //获取本机蓝牙状态
  getBluetoothAdapterState: function () {
    let _this = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log('获取本机蓝牙状态1', res)
        let available = res.available,
          discovering = res.discovering;
        if (!available) { //蓝牙适配器不可用
          app.toast('无法开启蓝牙连接，请检查蓝牙是否开启');
          setTimeout(function () {
            wx.hideToast()
          }, 3000)
        } else {
          wx.hideToast();
          if (discovering || !_this.data.autoSearch) {//正在搜附近蓝牙或手动关闭了蓝牙
            _this.setData({
              status: 'normal'
            })
            return false
          }
          _this.startBluetoothDevicesDiscovery();
          //_this.getConnectedBluetoothDevices();
        }
      },
      fail: function (err) {
        console.log('获取本机蓝牙状态失败', err)
      }
    })
  },
  //开始搜索蓝牙设备
  startBluetoothDevicesDiscovery: function () {
    let _this = this;
    this.setData({
      loading: true
    })
    wx.startBluetoothDevicesDiscovery({
      services: [],
      allowDuplicatesKey: false,//关闭重复上报
      success: function (res) {
        console.log('开始搜索蓝牙设备', res)
        if (!res.isDiscovering) {
          _this.getBluetoothAdapterState();
        } else {
          _this.setData({
            status: 'normal'
          })
          _this.onBluetoothDeviceFound();
        }
      },
      fail: function (err) {
        console.log('搜索蓝牙设备异常', err)
      }
    });
  },
  //获取已连接状态的蓝牙设备
  getConnectedBluetoothDevices: function () {
    let _this = this;
    wx.getConnectedBluetoothDevices({
      services: [],
      success: function (res) {
        console.log("获取处于连接状态的设备", res);
        var devices = res['devices'], flag = false, index = 0, conDevList = [];
        devices.forEach(function (value, index, array) {
          if (value['name'].indexOf('FeiZhi') != -1) {
            // 如果存在包含FeiZhi字段的设备
            flag = true;
            index += 1;
            conDevList.push(value['deviceId']);
            that.deviceId = value['deviceId'];
            return;
          }
        });
        if (flag) {
          this.connectDeviceIndex = 0;
          that.loopConnect(conDevList);
        } else {
          if (!this.getConnectedTimer) {
            that.getConnectedTimer = setTimeout(function () {
              that.getConnectedBluetoothDevices();
            }, 5000);
          }
        }
      },
      fail: function (err) {
        if (!this.getConnectedTimer) {
          that.getConnectedTimer = setTimeout(function () {
            that.getConnectedBluetoothDevices();
          }, 5000);
        }
      }
    });

  },
  //监听寻找到新设备的事件；开启蓝牙搜索功能失败，则回到第2步重新检查蓝牙是适配器是否可用，开启蓝牙搜索功能成功后开启发现附近蓝牙设备事件监听
  onBluetoothDeviceFound: function () {
    let _this = this,
      isExist = false;
    wx.onBluetoothDeviceFound(function (res) {
      console.log('监听寻找到新设备的事件', res)
      let _devices = res.devices[0];
      if (_devices) {
        let _name = _devices.name;
        let newDeviceList = _this.data.newDeviceList || [],
          _deviceId = _devices.deviceId,
          _uuid = _devices.advertisServiceUUIDs;
        for (let i = 0; i < newDeviceList.length; i++) {
          let _item = newDeviceList[i];
          if (_name == _item.name) {
            isExist = true;
            break;
          }
        }
        if (!isExist) {
          newDeviceList.push({
            name: _name,
            deviceId: _deviceId,
            uuid: _uuid
          })
          _this.setData({
            newDeviceList: newDeviceList
          })
        }
      }
    })
  },
  //停止搜搜附近的蓝牙设备
  stopBluetoothDevicesDiscovery() {
    let _this = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log('停止搜搜附近', res)
        _this.setData({
          loading: false,
          autoSearch: false
        })
      }
    })
  },
  //发现了某个想配对的设备，则获取到该设备的deviceId
  startConnectDevices(deviceId) {
    let _this = this;
    wx.createBLEConnection({
      deviceId: deviceId,
      success: function (res) {
        if (res.errCode == 0) {
          _this.getService(deviceId);
          wx.showLoading({
            title: '获取设备服务中'
          });
        }
      },
      fail: function (err) {
        wx.hideLoading();
        _this.errorHandling(err);
        console.log('连接失败：', err);
      }
    });
  },
  //获取设备的所有服务
  getService: function (deviceId) {
    var _this = this;
    // 监听蓝牙连接
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res);
    });
    // 获取蓝牙设备service值
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: function (res) {
        let _services = res.services;
        _this.setData({
          deviceId: deviceId,
          services: _services
        })
        _this.getCharacter(deviceId, res.services);
      },
      fail: function (err) {
        wx.hideLoading();
        _this.errorHandling(err);
        console.log('获取蓝牙设备service值失败');
      },
    })

  },
  //获取蓝牙设备某个服务中的所有特征值
  getCharacter: function (deviceId, services) {
    let _this = this,
      _servicesLen = services.length;
    _this.setData({
      requestNum: _servicesLen,
      returnNum: 0,
      devices: []
    })
    for (let i = 0; i < _servicesLen; i++) {
      let _uuid = services[i].uuid;
      wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: _uuid,
        success: function (res) {
          let _characteristics = res.characteristics,
            _serviceId = _uuid,
            _deviceId = _this.data.deviceId,
            _characteristicId = '';
          if (_characteristicId == '' && _characteristics.length > 0) {
            for (let i = 0; i < _characteristics.length; i++) {
              let _item = _characteristics[i];
              if (_item.properties && _item.properties.write && _item.properties.notify) {

                _characteristicId = _item.uuid;

                break;
              }
            }
            let devicesArr = _this.data.devices;
            if (_characteristicId != '') {
              devicesArr.push({
                deviceId: _deviceId,
                serviceId: _serviceId,
                characteristicId: _characteristicId
              })
            }
            _this.setData({
              returnNum: _this.data.returnNum + 1,
              devices: devicesArr
            })
            _this.returnCharacter();
          }
        },
        fail: function (err) {
          _this.setData({
            returnNum: _this.data.returnNum + 1
          })
          _this.returnCharacter();
        }
      })
    }
  },
  //
  returnCharacter() {
    let _this = this,
      _data = _this.data,
      requestNum = _data.requestNum,
      returnNum = _data.returnNum;
    if (requestNum == returnNum) {
      let devices = _data.devices;
      if (!devices || devices.length < 1) {
        app.toast("该设备不支持打印");
        wx.hideLoading();
        return false;
      }
      let _device = devices[0],
        _deviceId = _device.deviceId,
        _serviceId = _device.serviceId,
        _characteristicId = _device.characteristicId;
      _this.notifyBLECharacteristicValueChange(_deviceId, _serviceId, _characteristicId);
      _this.writeBLECharacteristicValue(_deviceId, _serviceId, _characteristicId)
    }
  },
  loopConnect: function (devicesId) {
    var that = this;
    var listLen = devicesId.length;
    if (devicesId[this.connectDeviceIndex]) {
      this.deviceId = devicesId[this.connectDeviceIndex];
      this.startConnectDevices('loop', devicesId);
    } else {
      console.log('已配对的设备小程序蓝牙连接失败');
      that.startBluetoothDevicesDiscovery();
      //that.getConnectedBluetoothDevices();
    }
  },
  arrayBufferToHexString(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },
  //接受notify消息
  onNotifyChange() {
    var _this = this;
    wx.onBLECharacteristicValueChange(function (res) {
      let msg = _this.arrayBufferToHexString(res.value);
      //callback && callback(msg);
      console.log('接受notify消息' + msg);
    })
  },
  //启动notify 功能
  notifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId) {
    let _this = this;
    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      complete(res) {
        setTimeout(function () {
          _this.onOpenNotify && _this.onOpenNotify();
        }, 1000);
        _this.onNotifyChange();//接受消息
      }
    })
  },
  //启动打印
  writeBLECharacteristicValue(deviceId, serviceId, characteristicId) {
    let _this = this,
      printData = wx.getStorageSync('printData') || "";
    _this.setData({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      instructionAbove: '',
      instructionBelow: ''
    })
    wx.showLoading({
      title: '准备打印'
    });
    this.getInstructionText(printData,'Above');
    this.getInstructionText(printData,'Below');
  },
  getInstructionText(printData,nature) {
    let _this = this,
    _value = CPCL.test2(printData, nature);
    app.$post('/api/utils/encode', {
      params: {
        "charset": 'gb2312',
        "value": _value,
      },
      success: (res) => {
        if (res.code == 'SUCCESS') {
          let _data = res.data;
          if (nature =='Below'){
            _this.setData({
              instructionBelow: _data
            })
          }else{
            _this.setData({
              instructionAbove: _data
            })
          }
          _this.sendInstructions()
        } else {
          wx.hideLoading();
          app.toast(res.msg)
        }
      },
      fail: (err) => {
        wx.hideLoading();
        _this.errorHandling(err);
      }
    })
  },
  //发送指令
  sendInstructions() {
    let _this = this,
      _data = _this.data,
      _instructionAbove = _data.instructionAbove,
      _instructionBelow = _data.instructionBelow;
    if (_instructionAbove != '' && _instructionBelow != '') {
      let _deviceId = _data.deviceId,
        _serviceId = _data.serviceId,
        _characteristicId = _data.characteristicId,
        _Above = (new Int8Array(_instructionAbove)).buffer,
        _Below = (new Int8Array(_instructionBelow)).buffer;
      console.log(_deviceId, _serviceId, _characteristicId, _Above, _Below);
      wx.writeBLECharacteristicValue({
        deviceId: _deviceId,
        serviceId: _serviceId,
        characteristicId: _characteristicId,
        value: _Above,
        success: function (res) {
        }
      })
      wx.writeBLECharacteristicValue({
        deviceId: _deviceId,
        serviceId: _serviceId,
        characteristicId: _characteristicId,
        value: _Below,
        success: function (res) {
          setTimeout(function () {
            _this.recordUsedDevice(_deviceId, _serviceId, _characteristicId)
            _this.closeBLEConnection(_deviceId);
            wx.hideLoading();
            app.toast("正在为您打印，请查看打印机");
          }, 1000);
        }
      })
    }
  },
  //断开与设备的连接
  closeBLEConnection(deviceId) {
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: function (res) {
        console.log('断开与设备的连接', res)
      }
    })
  },
  //将连接的设备保存起来
  recordUsedDevice(deviceId, serviceId, characteristicId) {
    let _device = {
      name: this.data.deviceName,
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId
    },
      isExist = false,
      _lastUsedDevices = wx.getStorageSync('lastUsedDevices') || [];
    if (_lastUsedDevices.length > 0) {
      for (let i = 0; i < _lastUsedDevices.length; i++) {
        let _item = _lastUsedDevices[i];
        if (_item.deviceId == deviceId) {
          isExist = true;
          break;
        }
      }
    }
    if (!isExist) {
      _lastUsedDevices.push(_device)
      this.setData({
        lastUsedDeviceList: _lastUsedDevices
      })
      wx.setStorageSync('lastUsedDevices', _lastUsedDevices)
    }
  },
  //是否直接打印
  connectionPrint(e) {
    let _deviceId = e.target.dataset.deviceid || "",
      _serviceId = e.target.dataset.serviceid || "",
      _characteristicId = e.target.dataset.characteristicid || "",
      _deviceName = e.target.dataset.devicename || "",
      _index = e.target.dataset.listindex,
      _this = this,
      $lastUsedDeviceList = _this.data.lastUsedDeviceList;
    if (_deviceId == '') {
      app.toast("该设备已失效");
      $lastUsedDeviceList.splice(_index, 1);
    }
    _this.stopBluetoothDevicesDiscovery();
    _this.setData({
      deviceName: _deviceName
    })
    wx.showModal({
      title: '提示',
      content: '亲~是否连接该设备并打印？',
      success: function (res) {
        if (res.confirm) {
          _this.startConnectDevices(_deviceId);
          //_this.writeBLECharacteristicValue(_deviceId, _serviceId, _characteristicId)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //是否连接设备
  connectionDevice(e) {
    let _deviceId = e.target.dataset.deviceid || "",
      _deviceName = e.target.dataset.devicename || "",
      _this = this;
    _this.setData({
      deviceName: _deviceName
    })
    if (_deviceId == "") {
      app.toast("该设备无效");
      return false;
    }
    _this.stopBluetoothDevicesDiscovery();
    wx.showModal({
      title: '提示',
      content: '亲~是否连接该设备并打印？',
      success: function (res) {
        if (res.confirm) {
          _this.startConnectDevices(_deviceId)
          wx.showLoading({
            title: '正在连接设备'
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //手动搜索附近的设备
  manualSearch: function () {
    this.setData({
      autoSearch: true
    })
    this.getBluetoothAdapterState();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.openBluetoothAdapter) {
      wx.stopBluetoothDevicesDiscovery()
      this.startConnect();
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    let _lastUsedDevices = wx.getStorageSync('lastUsedDevices') || [];
    this.setData({
      lastUsedDeviceList: _lastUsedDevices
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
    wx.stopBluetoothDevicesDiscovery()
    wx.closeBluetoothAdapter()
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