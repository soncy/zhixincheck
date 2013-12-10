/*
 * Created with Sublime Text (build3047).
 * User: soncy
 * Date: 2013-12-06
 * Time: 15:43:19
 * Contact: song.chen@qunar.com
 */

var fs = require('fs');
var path = require('path');
var checker = require('./checker');

function checkFile(filepath, identification) {
  var dirname = path.dirname(filepath);
  checker.check(filepath, identification, 3000).on('end', function(result) {
    // 检查结果 result.error : 检查超时或请求错误的词表, result.noReg : 没有匹配的词表
    var resultFilePath = path.join(dirname, identification + '_result.txt');
    fd = fs.open(resultFilePath, 'w+', function(err, fd) {
      fs.write(fd, JSON.stringify(result));
    });
  }); // 3000为单个请求超时时间，单位毫秒，不设置为5000毫秒
}

function checkGuoneiP2P() {
  checkFile('./guneiall.txt', 'op_ticket_ifrFlash'); // 参数1：词表文件，一词一行；参数2：需要检查的标识字符串
}

checkGuoneiP2P();
