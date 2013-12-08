var lineReader = require('line-reader');
var httpExt = require('./lib/httpExt');

var reqcount = 0,
  rescount = 0; // 请求数和回调数，用于判断是否全部检查完毕
var timeoutKeyWords = []; // 检查超时或者报错的关键词
var errKeyWors = []; // 没有匹配到的关键词

function Chcker() {
  this.doneCallback = function() {};
  this.timeout = 5000;
}
Chcker.fn = Chcker.prototype;

Chcker.fn.check = function(path, identification, callback, timeout) {
  var self = this;
  var readend = false;
  this.doneCallback = callback;
  this.timeout = timeout;

  lineReader.eachLine(path, function(line, last) {
    self.checkLine(line, identification);
    reqcount++;
  }).then(function() {
    readend = true;
  });
}

/* 检查是否完毕，完毕就回调 */
Chcker.fn.checkEnd = function() {
  rescount++;
  if (reqcount === rescount) {
    this.doneCallback({
      timeout: timeoutKeyWords,
      notReg: errKeyWors
    });
  }
};

/* 逐行检查 */
Chcker.fn.checkLine = function(keyword, identification) {
  var self = this;
  keyword = keyword.trim();
  this.getSourceCode(keyword, function(content) {
    if (!~content.indexOf(identification)) { // 检查搜索结果中是否有需要检查的关键字
      console.info('没有匹配的搜索词：' + keyword);
      errKeyWors.push(keyword);
    }
    self.checkEnd();
  });
};

/* 获取搜索结果源码 */
Chcker.fn.getSourceCode = function(keyword, callback) {
  var timeoutEvent;
  var self = this;
  var url = ["http://www.baidu.com/s?eid=13942&zhixin=13941&ip=220.181.3.105&ie=utf-8&bs=",
    keyword, "&f=8&rsv_bp=1&wd=", keyword, "&inputT=0"
  ].join('');

  // 第二个参数为超时时间
  var req = httpExt.get(url, this.timeout, function(res) {

    var content = '';
    res.on('data', function(d) {
      content += d.toString();
    });

    res.on('end', function() {
      callback(content);
    });

  }, function() {
    timeoutKeyWords.push(keyword);
    self.checkEnd();
  });
};

var checker = new Chcker();
module.exports = checker;