var lineReader = require('line-reader');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var httpExt = require('./lib/httpExt');

var identification, noResultKeywords, errKeywords;
var reqCount, resCount;
var timeout = 5000;

function checkContent(keyword, content) {
   if(!~content.indexOf(identification)) {
     noResultKeywords.push(keyword);
     console.log('没有找到匹配,关键词：' + keyword);
   };
}

function Checker() {
  EventEmitter.call(this);

  this.on('getSourceCode', function(keyword, content) {
    checkContent(keyword, content);
  });
}

util.inherits(Checker, EventEmitter);
Checker.fn = Checker.prototype;

Checker.fn.checkLine = function(keyword) {
  var self = this;
  var url = 'http://www.baidu.com/s?wd=' + keyword;

  var req = httpExt.get(url, timeout, function(data) {
    self.emit('getSourceCode', keyword, data);
    self.checkEnd();
  });
  reqCount ++;

  req.on('timeout', function() {
    errKeywords.push(keyword);
    self.checkEnd();
  });
  req.on('error', function(err) {
    errKeywords.push(keyword);
    console.log(err, keyword);
    self.checkEnd();
  });
  return this;
};

Checker.fn.checkEnd = function() {
  resCount++;
  if (reqCount === resCount) {
    this.emit('end', {
      "error": errKeywords,
      "noReg": noResultKeywords
    });
  }
};

module.exports.check = function(filePath, ic, to) {
  noResultKeywords = [];
  errKeywords = [];
  timeout = to;
  identification = ic;
  reqCount = 0;
  resCount = 0;

  var checker = new Checker();
  lineReader.eachLine(filePath, function(line) {
    checker.checkLine(line);
  });
  return checker;
}
