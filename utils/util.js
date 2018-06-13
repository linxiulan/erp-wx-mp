const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const powAmount = (amount, _pow_) => {
  var amount_bak = amount;
  var base = 10;
  if (isNaN(amount)) {
    amount = Number(amount)
  }

  amount = Math.round((amount - Math.floor(amount)) * Math.pow(base, _pow_));
  amount = amount < 10 ? '.0' + amount : '.' + amount
  amount = Math.floor(amount_bak) + amount;
  return amount;
}
const formatMoney = (num) => {
  let regStrs = [
    [/[^\d\.]/g, ''], //禁止录入任何非数字和点
    ['^0(\\d+)$', '$1'], //禁止录入整数部分两位以上，但首位为0
    ['\\.(\\d?)\\.+', '.$1'], //禁止录入两个以上的点
    ['^(\\d+\\.\\d{2}).+', '$1'] //禁止录入小数点后两位以上
  ];
  for (let i = 0; i < regStrs.length; i++) {
    let reg = new RegExp(regStrs[i][0]);
    num = num.replace(reg, regStrs[i][1]);
  }
  return num
}
const GetQueryString = (url, name) => {
  let num = url.indexOf("?"),
    str = url.substr(num + 1),
    reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
    r = str.match(reg);
  if (r != null) return unescape(r[2]); return null;
}

const copyObj = (obj) => {
  let newObj = {};
  newObj = JSON.parse(JSON.stringify(obj));
  return newObj;
}

const copyArr=(arr)=>{
  let newArr=[];
  newArr = arr.concat();
  return newArr;
}

module.exports = {
  formatTime: formatTime,
  formatMoney: formatMoney,
  powAmount: powAmount,
  GetQueryString: GetQueryString,
  copyObj: copyObj,
  copyArr: copyArr
}
