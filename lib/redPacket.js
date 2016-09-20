// redPacket.js

const xml2js = require('xml2js'),
  md5 = require('MD5'),
  request = require('request'),
  SEND_REDPACKET_URL = "https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack",
  CHECK_REDPACKET_URL = "https://api.mch.weixin.qq.com/mmpaymkttransfers/gethbinfo";

function _sign(obj) {

  var PARTNER_KEY = obj.partner_key || "";

  ['key', 'pfx', 'partner_key', 'sign'].forEach(function(k) {
    delete obj[k];
  });

  var querystring = Object.keys(obj).filter(function(key) {
    return obj[key] !== undefined && obj[key] !== '';
  }).sort().map(function(key) {
    return key + '=' + obj[key];
  }).join('&') + "&key=" + PARTNER_KEY;

  obj.sign = md5(querystring).toUpperCase();

  return obj;
};

function _generateNonceString(length) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var maxPos = chars.length;
  var noceStr = "";
  for (var i = 0; i < (length || 32); i++) {
    noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return noceStr;
};

function _mix() {
  var root = arguments[0];
  if (arguments.length == 1) {
    return root;
  }
  for (var i = 1; i < arguments.length; i++) {
    for (var k in arguments[i]) {
      root[k] = arguments[i][k];
    }
  }
  return root;
};

function _request(url, opts) {
  return new Promise(function(resolve, reject) {
    const REQUEST_URL = url;

    var PFX = opts.pfx;

    opts.nonce_str = _generateNonceString(32);
    opts = _sign(opts);

    var builder = new xml2js.Builder();
    var xml = builder.buildObject({
      xml: opts
    });

    request({
        url: REQUEST_URL,
        method: 'POST',
        body: xml,
        agentOptions: {
          pfx: PFX,
          passphrase: opts.mch_id
        }
      },
      function(err, response, body) {
        var parser = new xml2js.Parser({
          trim: true,
          explicitArray: false,
          explicitRoot: false
        });
        parser.parseString(body, function(err, res) {
          if (err) {
            reject(err)
          } else {
            resolve(res);
          }
        });
      });
  });
};

function Redpack(opts) {

  var redpack = function(opts) {
    this._paymentOptions = opts || {};
  };
  _mix(redpack.prototype, {
    send: function(opts) {
      var params = _mix({}, this._paymentOptions, opts);
      return _request(SEND_REDPACKET_URL, params);
    },
    check: function(opts, fn) {
      var params = _mix({}, this._paymentOptions, opts);
      params.appid = params.wxappid;
      params.bill_type = "MCHT";
      delete params.wxappid;

      return _request(CHECK_REDPACKET_URL, params);
    }
  });
  return new redpack(opts);
};

module.exports = Redpack;