/**
 * Created by baidu on 16/3/22.
 */
var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

// 捕获异常
proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
});

//proxy.on('proxyReq', function (proxyReq, req, res, options) {
//
//    proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
//    var body = [];
//    req.on('error', function (err) {
//        console.error(err);
//    }).on('data', function (chunk) {
//        console.info("----------2----------");
//        body.push(chunk);
//    }).on('end', function () {
//        console.info("----------3----------");
//        body = Buffer.concat(body).toString();
//        // At this point, we have the headers, method, url and body, and can now
//        // do whatever we need to in order to respond to this request.
//        console.info('body:' + body);
//    });
//});



var server = http.createServer(function (req, res) {
    var headers = req.headers;
    var method = req.method;
    var url = req.url;
    console.info("headers:" + headers);
    console.info("method:" + method);
    console.info("url:" + url);

    if (isContains(url, "mock")) {
        var body = [];
        req.on('error', function (err) {
            console.error(err);
        }).on('data', function (chunk) {
            body.push(chunk);
        }).on('end', function () {
            body = Buffer.concat(body).toString();
            // At this point, we have the headers, method, url and body, and can now
            // do whatever we need to in order to respond to this request.

            res.end('{"hello":"empty"}');
            console.info('body:' + body);
        });
    } else {
        proxy.web(req, res, {target: "http://localhost:8888"});
    }

});


console.info("把手机代理设置成 8887,需要启动charles 8888,如果url中包含了mock字样,那么就跳转返回一个json字串,逻辑正常");
server.listen(8887);

function isContains(str, substr) {
    return str.indexOf(substr) >= 0;
}


// ------------------------------下是测试server,上面的代码不要轻易改动,下面的代码随便改--------------------------------


var setMockServer = http.createServer(function (req, res) {
    var body = [];
    req.on('data', function (chunk) {
        body.push(chunk);
        console.info("chunk:" + chunk);
    }).on('end', function () {
        body = Buffer.concat(body).toString();
        console.info('set mock body:' + body);
    });
});
console.info("listening on port 8889");
setMockServer.listen(8889);



