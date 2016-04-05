/**
 * Created by baidu on 16/3/28.
 * TODO 这个文件只是用来创几个基础的server,没啥用
 */
var http = require('http');

// 创建http服务
var app = http.createServer(function (req, res) {
    // 查询本机ip

    res.end('{"result":"this is 3001 port"}');


});
// 访问127.0.0.1:3001查看效果
app.listen(4001);
console.log('server started on 127.0.0.1:4001');


// 创建http服务
var app = http.createServer(function (req, res) {
    // 查询本机ip

    res.end('{"result":"this is 3002 port"}');


});
// 访问127.0.0.1:3001查看效果
app.listen(4002);
console.log('server started on 127.0.0.1:4002');