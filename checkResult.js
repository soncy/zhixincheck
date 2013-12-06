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
    checker.check(filepath, identification, function(result) {        
        // 检查结果 result.timeout : 检查超时的词表, result.notReg : 没有匹配的词表
        fd = fs.open(path.join(dirname, identification + '_result.txt'), 'w+', function(err, fd) {
            fs.write(fd, JSON.stringify(result));
        });
    }, 3000); // 3000为单个请求超时时间，单位毫秒，不设置为5000毫秒
}

function checkGuoneiP2P() {
    checkFile('./guneiall.txt', 'op_ticket_ifrFlash');
}

checkGuoneiP2P();