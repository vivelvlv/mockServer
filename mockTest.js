/**
 * Created by baidu on 16/3/24.
 */
var http = require('http');

var url = require('url');
// 创建http服务
var app = http.createServer(function (req, res) {
    // 查询本机ip

    // TODO 这样配置在ip和域名的情况下,都是可行的
    var sreq = http.request({
        host: '182.254.217.75', // 目标主机
        port: '8086',
        path: '/site/home', // 目标路径
        method: 'GET'
    }, function (sres) {
        sres.pipe(res);
        sres.on('end', function () {
            console.log('代理成功-------------');
        });
    });

    console.info('===== visit 3003: url=' + sreq.url);
    if (/POST|PUT/i.test(req.method)) {
        req.pipe(sreq);
    } else {
        sreq.end();
    }
});
// 访问127.0.0.1:3001查看效果
app.listen(3003);
console.log('server started on 127.0.0.1:3003');

var testGet = http.createServer(function (req, res) {

    var orgUrl = url.parse(req.url);// 原始请求url

    var orgUrlData = {
        host: orgUrl.hostname,
        path: orgUrl.pathname,
        query: orgUrl.query,
        port: orgUrl.port
    };
    var sreq = http.request({
        host: orgUrlData.host,
        port: orgUrlData.port,
        query: orgUrlData.query,
        path: orgUrlData.path

    }, function (sres) {
        //res.end('{"result":"success"}');
        sres.pipe(res);
        sres.on("end", function () {
            console.log("针对测试 get的所有可能的情况下的,新建代理请求的配置是否和原生get请求的配置保持一致");
        });
    });

    sreq.end();
});

testGet.listen(3004);
console.log('server started on 127.0.0.1:3004');
