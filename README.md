# weixin-redpack
微信发企业红包 for node.js

### Installation
```
npm install fanqier-wxredpack
```

### Usage

先创建一个红包实例 Redpack，再调用 send() 发送红包，减少每次发红包的参数。
```js
var Redpack = require('fanqier-wxredpack').Redpack;

var redpack = Redpack({
	mch_id: 'xxx',
	partner_key: 'xxxxxx',
	pfx: fs.readFileSync('./wxpay_cert.p12'),
	wxappid: 'wxxxxxxx'
});

//发红包
redpack.send({
	mch_billno: '123426900220150325'+Math.random().toString().substr(2,10),
	send_name: '红包来自',
	wishing: '收好不谢！',
	re_openid: '红包接收人openid',
	total_amount: 100,
	total_num: 1,
	client_ip: '14.23.102.146',
	nick_name: 'XXXX',
	act_name: '发测试红包',
	remark: 'remark'
})
.then(function(res){
  console.log(res)
})
.catch(function(err){
  console.log(err)
});
```

查询红包记录
```js
redpack
    .check({
        mch_billno: '1357035902201622191047290884',
        bill_type:'MCHT',
    })
    .then(function(res) {
        console.log(res)
        process.exit();
    }, function(err) {
        console.log(err)
        process.exit();
    });

```
