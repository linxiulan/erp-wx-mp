// canvas 全局配置
var context = null;// 使用 wx.createContext 获取绘图上下文 context
var isButtonDown = false;
var arrx = [];
var arry = [];
var arrz = [];
var canvasw = 0;
var canvash = 0;
const app = getApp()
//注册页面
Page({
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },
  canvasStart: function (event) {
    isButtonDown = true;
    arrz.push(0);
    arrx.push(event.changedTouches[0].x);
    arry.push(event.changedTouches[0].y);
    //context.moveTo(event.changedTouches[0].x, event.changedTouches[0].y);

  },
  canvasMove: function (event) {
    if (isButtonDown) {
      arrz.push(1);
      arrx.push(event.changedTouches[0].x);
      arry.push(event.changedTouches[0].y);
      // context.lineTo(event.changedTouches[0].x, event.changedTouches[0].y);
      // context.stroke();
      // context.draw()

    };

    for (var i = 0; i < arrx.length; i++) {
      if (arrz[i] == 0) {
        context.moveTo(arrx[i], arry[i])
      } else {
        context.lineTo(arrx[i], arry[i])
      };

    };
    context.clearRect(0, 0, canvasw, canvash);
    context.stroke();

    context.draw(true);
  },
  canvasEnd: function (event) {
    isButtonDown = false;
  },
  cleardraw: function () {
    //清除画布
    arrx = [];
    arry = [];
    arrz = [];
    context.clearRect(0, 0, canvasw, canvash);
    context.draw(true);
  },
  getimg: function () {
    let _this = this;
    if (arrx.length == 0) {
      wx.showModal({
        title: '提示',
        content: '签名内容不能为空！',
        showCancel: false
      });
      return false;
    };
    //生成图片
    wx.canvasToTempFilePath({
      canvasId: 'canvas',
      success: function (res) {
        let _tempFilePath = res.tempFilePath;
        wx.uploadFile({
          url: app.hostPath + '/api/file/temp/upload', //仅为示例，非真实的接口地址
          filePath: _tempFilePath,
          header: {
            AccessToken: wx.getStorageSync('AccessToken') || ""
          },
          name: 'file',
          formData: {
            'user': 'test'
          },
          success: function (res) {
            let _data = JSON.parse(res.data);
            if (_data.code == 'SUCCESS') {
              let _fileKey = _data.data.fileKey;
              _data = { 'signature': _fileKey }
              _this.returnData(_data)
              wx.navigateBack()
            } else {
              app.toast(_data.msg)
            }
          }
        })
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
   * 页面的初始数据
   */
  data: {
    src: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 使用 wx.createContext 获取绘图上下文 context
    let query = wx.createSelectorQuery();
    query.select('#canvas').boundingClientRect();
    query.exec(function (res) {
      canvasw = res[0].width;//设备宽度
      canvash = res[0].height;
    });
    context = wx.createCanvasContext('canvas');
    context.beginPath()
    context.setStrokeStyle('#000000');
    context.setLineWidth(4);
    context.setLineCap('round');
    context.setLineJoin('round');
    this.cleardraw();
  }
})