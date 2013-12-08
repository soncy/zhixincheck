/* 可以设置超时时间和超时回调的get */
var http = require('http');

function httpExt() {}

httpExt.prototype.get = function(options, timeout, callback, timeoutcallback) {
  var timeoutEvent;

  var req = http.get(options, function(res) {

    res.on("end", function() {
      clearTimeout(timeoutEvent);
    })
    res.on("close", function(e) {
      clearTimeout(timeoutEvent);
    })

    res.on("abort", function() {
      timeoutcallback();
    });

    callback(res);

  });

  req.on("timeout", function() {
    if (req.res) {
      req.res.emit("abort");
    }

    req.abort();
  });

  req.on('error', function() {
    timeoutcallback();
  });

  timeoutEvent = setTimeout(function() {
    req.emit("timeout");
  }, timeout);

  return req;
};

module.exports = new httpExt();