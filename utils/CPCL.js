const test = () => {
  let cmd = [33, 32, 49, 51, 48, 32, 50, 48, 48, 32, 50, 48, 48, 32, 51, 56, 49, 32, 49, 13, 10, 66, 84, 32, 50, 32, 48, 32, 48, 13, 10, 66, 32, 57, 51, 32, 49, 32, 48, 32, 49, 48, 48, 32, 48, 32, 48, 32, 49, 51, 56, 48, 48, 49, 51, 56, 48, 48, 49, 13, 10, 84, 69, 88, 84, 32, 49, 32, 51, 32, 48, 32, 49, 54, 48, 32, -57, -8, -45, -14, -93, -70, -61, -37, -30, -75, -68, -76, -76, -17, -41, -36, -78, -65, 13, 10, 84, 69, 88, 84, 32, 49, 32, 51, 32, 48, 32, 50, 52, 48, 32, -54, -3, -63, -65, -93, -70, 51, 45, 49, 13, 10, 71, 65, 80, 45, 83, 69, 78, 83, 69, 13, 10, 70, 79, 82, 77, 13, 10, 80, 82, 73, 78, 84, 13, 10, 33, 32, 49, 51, 48, 32, 50, 48, 48, 32, 50, 48, 48, 32, 51, 56, 49, 32, 49, 13, 10, 66, 84, 32, 50, 32, 48, 32, 48, 13, 10, 66, 32, 57, 51, 32, 49, 32, 48, 32, 49, 48, 48, 32, 48, 32, 48, 32, 49, 51, 56, 48, 48, 49, 51, 56, 48, 48, 50, 13, 10, 84, 69, 88, 84, 32, 49, 32, 51, 32, 48, 32, 49, 54, 48, 32, -57, -8, -45, -14, -93, -70, -61, -37, -30, -75, -68, -76, -76, -17, -41, -36, -78, -65, 13, 10, 84, 69, 88, 84, 32, 49, 32, 51, 32, 48, 32, 50, 52, 48, 32, -54, -3, -63, -65, -93, -70, 51, 45, 50, 13, 10, 71, 65, 80, 45, 83, 69, 78, 83, 69, 13, 10, 70, 79, 82, 77, 13, 10, 80, 82, 73, 78, 84, 13, 10, 33, 32, 49, 51, 48, 32, 50, 48, 48, 32, 50, 48, 48, 32, 51, 56, 49, 32, 49, 13, 10, 66, 84, 32, 50, 32, 48, 32, 48, 13, 10, 66, 32, 57, 51, 32, 49, 32, 48, 32, 49, 48, 48, 32, 48, 32, 48, 32, 49, 51, 56, 48, 48, 49, 51, 56, 48, 48, 51, 13, 10, 84, 69, 88, 84, 32, 49, 32, 51, 32, 48, 32, 49, 54, 48, 32, -57, -8, -45, -14, -93, -70, -61, -37, -30, -75, -68, -76, -76, -17, -41, -36, -78, -65, 13, 10, 84, 69, 88, 84, 32, 49, 32, 51, 32, 48, 32, 50, 52, 48, 32, -54, -3, -63, -65, -93, -70, 51, 45, 51, 13, 10, 71, 65, 80, 45, 83, 69, 78, 83, 69, 13, 10, 70, 79, 82, 77, 13, 10, 80, 82, 73, 78, 84, 13, 10];

  return (new Int8Array(cmd)).buffer;
};
const str2UTF8 = (str) => {
  var bytes = new Array();
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10FFFF) {
      bytes.push(((c >> 18) & 0x07) | 0xF0);
      bytes.push(((c >> 12) & 0x3F) | 0x80);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00FFFF) {
      bytes.push(((c >> 12) & 0x0F) | 0xE0);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007FF) {
      bytes.push(((c >> 6) & 0x1F) | 0xC0);
      bytes.push((c & 0x3F) | 0x80);
    } else {
      bytes.push(c & 0xFF);
    }
  }
  return bytes;
}

const _convertArrayBuffer = (cmd) => {
  let buffer = new ArrayBuffer(cmd.length * 2);
  let uint16Array = new Uint16Array(buffer);
  for (let i = 0; i < cmd.length; i++) {
    uint16Array[i] = cmd.charCodeAt(i);
  }
  return uint16Array;
};
const test2 = (printData) => {
  let _items = printData.items,
    _materials = '',
    _orderStatus = printData.orderStatus,
    _payType = printData.payType == 'BY_RECEIVER' ? '提付' : '现付',
    _isMonthly = printData.isMonthly ? '月结' : '现结',
    _status=''
  for (let i = 0; i < _items.length; i++) {
    let _item = _items[i];
    _materials += _item.name + ' ' + _item.count + '' + _item.unit + '; '
  }
  if (_orderStatus == "COMPLETED" || printData.payType =='BY_SENDER'){
    _status=_isMonthly + "、" + _payType 
  }else{
    _status = _payType
  }

  let cmd = "! 0 200 200 700 1\r\n";
  cmd += "T 2 0 55 8 " + printData.companyName + "\r\n";
  cmd += "T 1 0 55 58 电话:" + printData.telephone + "\r\n";
  cmd += "T 1 2 55 120 " + printData.senderInfoStationName + " -- " + printData.receiverInfoStationName + "\r\n";
  cmd += "T 1 0 55 185 收货人：" + printData.receiverInfoName + " " + printData.receiverInfoMobile + "\r\n";
  cmd += "T 1 0 55 250 物品：" + _materials + "\r\n";
  cmd += "T 1 0 55 290 " + printData.total + "元(" + _status+ ")   代收货款：" + printData.receivable + "元\r\n";
  cmd += "T 1 0 55 330 备注:" + printData.note + "\r\n";
  cmd += "T 1 0 55 390 未保价货物则按双方约定运价的2.5倍进行赔偿,\r\n";
  cmd += "T 1 0 55 430 其余未尽事宜按原机打执行\r\n";
  cmd += "B QR 55 490 M 2 U 4\r\n";
  cmd += "MA,http://mherp.com/wx/mp/?action=order&tradeId=" + printData.tradeId + "\r\n";
  cmd += "ENDQR \r\n"
  cmd += "T 1 0 200 500 单号：" + printData.tradeId + "\r\n";
  cmd += "T 1 0 200 540 下单员：" + printData.createUser + "\r\n";
  cmd += "T 1 0 200 580 日期：" + printData.gmtCreate + "\r\n";
  cmd += "GAP-SENSE\r\n"
  cmd += "FORM\r\n";
  cmd += "PRINT\r\n";
  return cmd;
};

module.exports = {
  test: test,
  test2: test2,
}