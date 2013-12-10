/* 可以设置超时时间和超时回调的get */

var http = require('http');
function HttpExt() {}

HttpExt.prototype.get = function(options, timeout, callback) {
  var timeoutEvent;
  var req = http.get(options, function(res) {
    var content = '';
    res.on('data', function(data) {
      content += data;
    });
    res.on("end", function() {
      callback(content);
      clearTimeout(timeoutEvent);
    });
    res.on("close", function() {
      clearTimeout(timeoutEvent);
    });
    res.on('abort', function() {
      clearTimeout(timeoutEvent);
    })
  });

  req.on("timeout", function() {
    if (req.res) {
      req.res.emit("abort");
    }

    req.abort();
  });

  timeoutEvent = setTimeout(function() {
    req.emit("timeout");
  }, timeout);

  return req;
};
module.exports = new HttpExt();
