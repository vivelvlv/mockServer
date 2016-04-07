/**
 * Created by vive on 16/3/24.
 */


/**
 * TODO 要求
 * 1.配置 ENV为 qa,online,preview中的一种
 * 2.在所有的mock请求都放置在mock.txt文件中
 * 3.所有进行环境切换的操作都针对域名是qa,online,preview环境域名的列表中,否则不进行host环境切换,直接被代理请求
 * 4.需开启charles或者findler,监听8888端口
 * 5.客户端https需转成http
 * @type {string}
 */

var ENV = 'online';
var isUseCharles = false;

var http = require('http');
var httpProxy = require('http-proxy');
var url = require('url');
var Request = require('request');
var BufferHelper = require('bufferhelper');
var zlib = require('zlib');
var gunzipStream = zlib.createGunzip();

var obj = {
    proxy: null,
    mockMap: new Map(),

    server: null,
    env: ENV,

    initServer: function () {
        this.createProxyServer();
        this.createServer();
        console.info(">>> listen: " + this.getIPAdress() + ":8887 port");
        this.server.listen(8887);
        console.info('>>>');

    },

    getIPAdress: function () {
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    },
    // 创建代理server
    createProxyServer: function () {
        this.proxy = httpProxy.createProxyServer({});
        this.proxy.on('error', function (err, req, res) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('代理服务器捕获异常错误');
        });
    },
    //创建主server
    createServer: function () {
        this.server = http.createServer(function (req, res) {
            var method = req.method;
            var url = req.url;


            console.info(">>>[" + method + "] " + url);

            console.info('>>>');
            console.info('>>>');


            if (method == 'GET') {
                obj.dealGet(req, res);
            } else {
                obj.dealPost(req, res);
            }


        });
    },

    dealPost: function (req, res) {
        if (this.checkMockUrl(req.url)) {
            this.mockRequest(req, res);
        } else {
            this.transRequest(req, res);
        }
    },

    dealGet: function (req, res) {
        if (this.checkMockUrl(req.url)) {
            this.mockRequest(req, res);
        } else {
            this.transRequest(req, res);
        }
    },

    // 模拟请求
    mockRequest: function (req, res) {
        res.end('{"result":"这是一个被mock的返回"}');
    },


    /**
     * 从手机端截取到的请求mock一个新请求发给server
     * @param req  原生的请求体
     * @param shouldChangeDomain  是否需要进行域名替换,true 是,false 否
     * @param res,
     * @returns {{}}
     */
    _createNewRequest: function (req, shouldChangeDomain, res) {

        var orgUrl = url.parse(req.url);// 原始请求url

        // 原始请求数据
        var orgRequestData = {
            host: orgUrl.hostname,
            path: orgUrl.path,// 使用这种方式传递数据,不必要在拼装url请求
            method: req.method,
            port: orgUrl.port,
            url: req.url //
        };

        // 新建请求
        var newRequestData = {};

        if (req.url.toLowerCase().indexOf("http://") == 0) {
            newRequestData.url = req.url;
        }


        // 获取主机地址|域名 + port端口号
        newRequestData.host = orgRequestData.host;
        newRequestData.port = orgRequestData.port;
        if (orgRequestData.host == '' || orgRequestData.host == null || orgRequestData.host == undefined) {
            var headerTemp = req.headers.host;
            if (headerTemp != "" && headerTemp != null && headerTemp != undefined) {
                if (headerTemp.indexOf(':') > 0) {
                    var hostTemp = headerTemp.split(':');
                    newRequestData.host = hostTemp[0];
                    newRequestData.port = hostTemp[1];
                } else {
                    newRequestData.host = headerTemp;
                    newRequestData.port = 80;
                }
            } else {
                res.end('{"result":"parse url error, please check request"}');
                return;
            }
        }

        if (newRequestData.port == null || newRequestData.port == '' || newRequestData.port == undefined) {
            newRequestData.port = 80;
        }

        // 获取请求路径地址 + 请求内容也在这个地方
        newRequestData.path = orgRequestData.path;
        // 获取请求方式
        newRequestData.method = orgRequestData.method;
        // headers
        newRequestData.headers = {};

        // 传送header
        for (var key in req.headers) {
            if (key == 'host' || key == 'accept-encoding') {
                continue;
            }
            newRequestData.headers[key] = req.headers[key];
        }


        if (shouldChangeDomain === true) {
            // 执行环境域名替换操作
            var newUrlString = this.requestEnv(ENV);
            var newUrlHost = url.parse(newUrlString);

            newRequestData.host = newUrlHost.hostname;

            newRequestData.port = newUrlHost.port;
            if (newRequestData.port == '' || newRequestData.port == null || newRequestData.port == undefined) {
                newRequestData.port = 80;
            }

        }

        return newRequestData;

    },

    /**
     * 转发请求的总入口
     * 1.检查请求的host是否是可能被重新映射的接口列表中
     * 2.创建新的请求报头
     * 3.如果条件1不满足,则直接代理抓发请求,有两种方式代理转发
     * 3-1,转发到8888的charles端口上
     * 3-2,直接请求
     * @param req
     * @param res
     */
    transRequest: function (req, res) {
        if (this.checkRequestUrlInEnv(req.url)) {

            var newReq = this._createNewRequest(req, true, res);

            this._requestProxy(req, newReq, res);

        } else {
            // 针对电影等组件,直接修改请求包体会产生异常,因为进行了请求校验
            //res.on('end', function () {
            //    if (res.headers['content-encoding'].indexOf("gzip") != -1) {
            //        res.pipe(gunzipStream).pipe(res);
            //    }
            //});

            //this.proxy.on('proxyRes', function (proxyRes, req, res) {
            //    if (proxyRes.headers['content-encoding'] != null && proxyRes.headers['content-encoding'].indexOf("gzip") != -1) {
            //        proxyRes.pipe(gunzipStream).pipe(res);
            //    }
            //});

            this.proxyWeb(req, res);
        }


    },

    /**
     * 直接转发请求,可以通过
     * @param req
     * @param res
     */
    proxyWeb: function (req, res) {
        if (isUseCharles == true) {
            this.proxy.web(req, res, {target: "http://localhost:8888"});
        } else {
            var newReq = this._createNewRequest(req, false, res);
            this._requestProxy(req, newReq, res);
        }
    },


    // 代理处理方法
    _requestProxy: function (orgRequest, request, res) {

        var sreq = http.request(request, function (sres) {

            //console.log('STATUS:' + sres.statusCode);
            //console.log('HEADERS:' + JSON.stringify(sres.headers));
            sres.pipe(res);
            sres.on('end', function () {
                console.log('----------代理请求结果返回-------------');
            });
        });

        sreq.on('error', function (error, req, res) {
            console.info(JSON.stringify('{"result":"get proxy error"}'));
        });

        if (/POST|PUT/i.test(orgRequest.method)) {
            orgRequest.pipe(sreq);
        } else {
            sreq.end();
        }
    },


    // 检查url是否在约定mock的map表之内
    checkMockUrl: function (url) {
        return false;
    },
    // 转发请求,并且同时切换环境的时候,需要判定该请求在环境之一,否则直接代理不用在新建转发请求
    checkRequestUrlInEnv: function (url) {
        if (this.isStringContains(url, this.qa) || this.isStringContains(url, this.online) ||
            this.isStringContains(url, this.preview) || this.isStringContains(url, this.rd) ||
            this.isStringContains(url, this.sandbox) || this.isStringContains(url, this.test)) {
            return true;
        }
        return false;
    },
    // 返回运行环境的host
    requestEnv: function (env) {
        this.env = env;
        if (this.env == 'qa') {
            return this.qa;
        } else if (this.env == 'online') {
            return this.online;
        } else if (this.env == 'preview') {
            return this.preview;
        } else if (this.env == 'rd') {
            return this.rd;
        } else if (this.env == 'sandbox') {
            return this.sandbox;
        } else if (this.env == 'test') {
            return this.test;
        }

    },

    // 工具方法用于判定是否包含子串
    isStringContains: function (str, substr) {
        return str.indexOf(substr) >= 0;
    },

};

obj.initServer();
