// 首页换图片
// 购物车逻辑：删除 某个
// 部署

'use strict';

const moment = require('moment');
const marked = require('marked');
//const AlipayNotify = require('../lib/alipay');
const counter = require('../lib/count');

function pad(num, n) {
  var len = num.toString().length;
  while (len < n) {
    num = "0" + num;
    len++;
  }
  return num;
}

function addPreZero(num){
 var t = (num+'').length,
  s = '';
 
 for(var i=0; i<18-t; i++){
  s += '0';
 }
 
 return s+num;
}


function leftpad(str, len, ch) {
  if(!str){
    str = '';
  }
  if(str.length>len){
    return str
  }
  if (!ch && ch !== 0) ch = ' ';
  var len = len - str.length;
  return Array(len).join(ch) + str;
}

function generatorYijiUrl(goods, order, id, total, YijiConfig) {
  //https://apidoc.yiji.com/website/api_detail.html?sericeNo=espOrderPay_1.0&id=8a949fbe564a569d0156e36025ae00c3&sericeName=%E8%AE%A2%E5%8D%95%E6%94%AF%E4%BB%98&schemeName=%E6%96%B0%E5%A4%96%E5%8D%A1%E6%94%B6%E5%8D%95#espOrderPay_1.0

  //请与贵网站订单系统中的唯一订单号匹配
  var orderNo = 'defront' + (+new Date()) + (Math.random() * 100).toFixed(0);
  var service = 'espOrderPay';
  var partnerId = YijiConfig.partner;
  var signType = 'MD5';

  var goodsInfoList = [];
  goods.forEach(function (good) {
    goodsInfoList.push({
      'goodsNumber': good.id, //货号
      'goodsName': good.title, //货物名称
      'goodsCount': good.quantity, //货物数量
      'itemSharpProductcode': good.material, //商品分类
      'itemSharpUnitPrice': good.price //商品单价
    })
  })


  var orderDetail = {
    'ipAddress': '113.204.226.234', //IP地址
    'billtoCountry': order.country, //账单国家
    'billtoState': 'CA', //账单州
    'billtoCity': 'Covina', //账单城市
    'billtoPostalcode': order.postcode, //账单邮编
    'billtoEmail': order.email, //账单邮箱

    'billtoFirstname': order.name, //接收账单人员名
    'billtoLastname': order.name, //接收账单人员姓
    'billtoPhonenumber': order.phone, //账单电话
    'billtoStreet': order.address, //账单街道

    'shiptoCity': 'Covina', //收货城市
    'shiptoCountry': 'United States', //收货国家
    'shiptoFirstname': order.name, //收货人姓
    'shiptoLastname': order.name, //收货人名
    'shiptoEmail': order.email, //收货邮箱
    'shiptoPhonenumber': order.phone, //收货电话
    'shiptoPostalcode': '91723', //收货邮编
    'shiptoState': 'CA', //收货州
    'shiptoStreet': order.address, //收货街道
    'logisticsFee': '0.00', //物流费
    'logisticsMode': 'EMS', //物流方式
    'cardType': 'Visa', //卡类型
    'customerEmail': order.email, //购买者邮箱
    'customerPhonenumber': '13996412842', //购买者电话
    'merchantEmail': 'info@de-front.com', //商户邮箱
    'merchantName': '杭州棣凡科技有限公司', //商户名
    'addressLine1': '', //卡地址1
    'addressLine2': '' //卡地址2
  }
  orderDetail.billtoPhonenumber = leftpad(orderDetail.billtoPhonenumber, 8, '0');
  orderDetail.billtoPostalcode = leftpad(orderDetail.billtoPostalcode, 6, '0');
  
  //把请求参数打包成数组
  var sParaTemp = [];
  sParaTemp.push(["orderNo", orderNo]);
  sParaTemp.push(["service", service]);
  sParaTemp.push(["partnerId", partnerId]);
  sParaTemp.push(["signType", signType]);
  // 业务接口
  sParaTemp.push(["merchOrderNo", addPreZero(id)]);
  sParaTemp.push(["goodsInfoList", JSON.stringify(goodsInfoList)]);
  sParaTemp.push(["orderDetail", JSON.stringify(orderDetail)]);
  sParaTemp.push(["currency", 'USD']);
  sParaTemp.push(["userId", partnerId]);
  sParaTemp.push(["amount", total]);
  sParaTemp.push(["webSite", 'de-front.com']);
  sParaTemp.push(["endReturnURL", 'http://en.de-front.com/profile']);
  sParaTemp.push(["returnUrl", 'http://en.de-front.com/api/payreturn']);
  sParaTemp.push(["notifyUrl", 'http://en.de-front.com/api/paynotify']);
  sParaTemp.push(["memo", '备注']);
  sParaTemp.push(["acquiringType", 'CRDIT']);
  sParaTemp.push(["deviceFingerprintId", 'sfkjddge534314edsa']);

  /**
   * 构造即时到帐接口
   * @param sParaTemp 请求参数集合
   * @return 表单提交HTML信息
   */
  var create_direct_pay_by_user = function (sParaTemp) {

    /**
     * 构造提交表单HTML数据
     * @param sParaTemp 请求参数数组
     * @param gateway 网关地址
     * @param strMethod 提交方式。两个值可选：post、get
     * @param strButtonName 确认按钮显示文字
     * @return 提交表单HTML文本
     */
    var buildURL = function (sParaTemp) {
      /**
       * 生成要请求给支付宝的参数数组
       * @param sParaTemp 请求前的参数数组
       * @return 要请求的参数数组
       */
      var buildRequestPara = function (sParaTemp) {
        var sPara = [];
        //除去数组中的空值和签名参数
        for (var i1 = 0; i1 < sParaTemp.length; i1++) {
          var value = sParaTemp[i1];
          if (value[1] == null || value[1] == "" || value[0] == "sign" ||
            value[0] == "sign_type") {
            continue;
          }
          sPara.push(value);
        }
        sPara.sort();
        //生成签名结果
        var prestr = "";
        //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
        for (var i2 = 0; i2 < sPara.length; i2++) {
          var obj = sPara[i2];
          if (i2 == sPara.length - 1) {
            prestr = prestr + obj[0] + "=" + obj[1];
          } else {
            prestr = prestr + obj[0] + "=" + obj[1] + "&";
          }

        }
        prestr = prestr + YijiConfig.key; //把拼接后的字符串再与安全校验码直接连接起来
        var crypto = require('crypto');
        var mysign = crypto.createHash('md5').update(prestr, 'utf-8').digest("hex");
        //签名结果与签名方式加入请求提交参数组中
        sPara.push(["sign", mysign]);

        return sPara;
      };
      //待请求参数数组
      var sPara = buildRequestPara(sParaTemp);
      var path = YijiConfig.url;


      for (var i3 = 0; i3 < sPara.length; i3++) {
        var obj = sPara[i3];
        var name = obj[0];
        var value = encodeURIComponent(obj[1]);
        if (i3 < (sPara.length - 1)) {
          path = path + name + "=" + value + "&";
        } else {
          path = path + name + "=" + value;
        }
      }
      return path.toString();
    };
    return buildURL(sParaTemp);
  };

  //构造函数，生成请求URL
  var sURL = create_direct_pay_by_user(sParaTemp);
  console.log(sURL);
  return sURL;
}

// 新增订单
exports.add = function* () {
  const name = this.request.body.name;
  const email = this.request.body.email;
  const phone = this.request.body.phone;
  const address = this.request.body.address;
  const country = this.request.body.country;
  const postcode = this.request.body.postcode;
  const user_id = this.session.user.id;
  let goods = yield this.service.cart.list(this.session.user.id);
  let total = 0;
  for (let i = 0, l = goods.length; i < l; i++) {
    let goodsInfo = yield this.service.goods.find(goods[i].goods_id);
    Object.assign(goods[i], goodsInfo);
    delete goods[i].content;
    delete goods[i].description;
    delete goods[i].in_pic;
    total += parseInt(goods[i].price) * goods[i].quantity;
  }

  let delivery = counter(goods, country);
  if (delivery !== undefined) {
    total += Number(delivery);
  }

  let bill = yield this.service.bill.insert({
    user_id,
    name,
    email,
    phone,
    address,
    country,
    postcode,
    total: total,
    info: JSON.stringify(goods),
    status: 0 //创建订单
  });
  let bill_id = bill.insertId;

  // 清除购物车 
  yield this.service.cart.remove({
    user_id: this.session.user.id
  });

  this.body = {
    success: true,
    surl: generatorYijiUrl(goods, {
      user_id,
      name,
      email,
      phone,
      address,
      country,
      postcode,
      total: total,
      info: JSON.stringify(goods),
      status: 0 //创建订单
    }, bill_id, total, this.app.config.yiji)
  }

};

exports.pay = function* () {
  let bill_id = this.query.bill_id;
  let bill = yield this.service.bill.find(bill_id);
  let AlipayConfig = this.app.config.alipay;
  this.body = {
    success: true,
    surl: generatorYijiUrl(JSON.parse(bill.info), bill, bill_id, bill.total, this.app.config.yiji)
  }
}

exports.send = function* () {
  let bill_id = this.query.bill_id;
  let shipping_code = this.query.shippingcode;
  let bill = yield this.service.bill.update({
    id: bill_id,
    status: 2,
    shipping_code
  });
  this.body = {
    success: true
  }
}

exports.change = function* () {
  let bill_id = this.query.bill_id;
  let total = this.query.total;
  let bill = yield this.service.bill.update({
    id: bill_id,
    total
  });
  this.body = {
    success: true
  }
}

exports.confirm = function* () {
  let bill_id = this.query.bill_id;
  let bill = yield this.service.bill.update({
    id: bill_id,
    status: 3
  });
  this.body = {
    success: true
  }
}

// 更新订单状态
exports.update = function* () {
  const id = this.request.body.id;
  const title = this.request.body.title;
  const m_pic = this.request.body.m_pic;
  const in_pic = this.request.body.in_pic;


  yield this.service.bill.update({
    id,
    title,
    m_pic,
    in_pic,
  });

  this.body = {
    success: 'true'
  }
};

// 删除一个订单
exports.deleteBill = function* () {
  const id = +this.request.body.id;

  const success = yield this.service.bill.deleteBill(id);

  if (success) {
    this.body = true;
  } else {
    this.body = false;
  }
};


exports.paynotify = function* () {
  /*
  var params = this.query;
  var trade_no = params.trade_no; //支付宝交易号
  var order_no = params.out_trade_no; //获取订单号
  var total_fee = params.total_fee; //获取总金额
  var subject = params.subject; //商品名称、订单名称
  var body = "";
  if (params.body != null) {
    body = params.body; //商品描述、订单备注、描述
  }
  var buyer_email = param.buyer_email; //买家支付宝账号
  var trade_status = param.trade_status; //交易状态
  //获取支付宝的通知返回参数，可参考技术文档中页面跳转同步通知参数列表(以上仅供参考)//
  const self = this;
  AlipayNotify.verity(params, function (result) {
    console.log(result);
    if (result) {

      if (trade_status == "TRADE_FINISHED") {

      } else if (trade_status == "TRADE_SUCCESS") {
        self.body = "success"; //请不要修改或删除——
        return
      }
    } else {
      self.body = "fail";
      return
    }

  });*/
  this.body = 'success';
};
exports.payreturn = function* () {
  this.body = 'success';
  /*
  var params = this.query;
  var trade_no = params.trade_no; //支付宝交易号
  var order_no = params.out_trade_no; //获取订单号
  var total_fee = params.total_fee; //获取总金额
  var subject = params.subject; //商品名称、订单名称
  var body = "";
  if (params.body != null) {
    body = params.body; //商品描述、订单备注、描述
  }
  var buyer_email = params.buyer_email; //买家支付宝账号
  var trade_status = params.trade_status; //交易状态
  //获取支付宝的通知返回参数，可参考技术文档中页面跳转同步通知参数列表(以上仅供参考)//
  const self = this;
  console.log(order_no, buyer_email, trade_status);

  var id = parseInt(order_no);
  var verify = AlipayNotify.verity(params);

  if (verify.host) {
    const result = yield self.app.curl('https://' + verify.host + verify.path);
    if (trade_status == "TRADE_SUCCESS" && result.data.toString() === 'true') {
      yield this.service.bill.update({
        id,
        status: 1
      })
      self.redirect('/profile');
      return;
    }

  } else {
    self.body = "fail";
    return
  }*/

};
