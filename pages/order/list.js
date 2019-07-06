// pages/order/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    datePickerValue: ['', '', ''],
    datePickerIsShow: false,
    typePicker:{
      data:[
        {
          name:'全部类型',
          value:0
        },
        {
          name: '待装车',
          value:1
        },
        {
          name: '已装车',
          value:2
        },
        {
          name: '已送达',
          value: 3
        },
        {
          name: '已通知',
          value: 4
        },
        {
          name: '已提货',
          value: 5
        },
        {
          name: '已取消',
          value: 6
        }
      ],
      isShow:false,
      current:0
    },
    orderData:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  
  showTypePickerr:function(e){
    var typePicker = this.data.typePicker;
    if (typePicker.isShow){
      typePicker.isShow = false;
    }else{
      typePicker.isShow = true;
    }
    this.setData({
      typePicker: typePicker,
    });
  },
  showDatePicker: function (e) {
    // this.data.datePicker.show(this);
    this.setData({
      datePickerIsShow: true,
    });
  },

  datePickerOnSureClick: function (e) {
    this.setData({
      date: `${e.detail.value[0]}年${e.detail.value[1]}月${e.detail.value[2]}日`,
      datePickerValue: e.detail.value,
      datePickerIsShow: false,
    });
  },

  datePickerOnCancelClick: function (event) {
    this.setData({
      datePickerIsShow: false,
    });
  },
})