/**
 * Created by baidu on 16/3/22.
 */
var http = require('http');
var httpProxy = require('http-proxy');
var url = require('url');
var proxy = httpProxy.createProxyServer({});
proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
});
var server = http.createServer(function
    (req, res) {
    console.info("----req----");
    if (req.url.indexOf("poiscene") > 0) {
        console.info("should debug");
    }
    console.info("url=" + req.url);
    proxy.web(req, res, {target: "http://localhost:8888"});
});
server.listen(8887);