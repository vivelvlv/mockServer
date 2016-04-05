/**
 * Created by baidu on 16/3/28.
 */
var request = require('request');
request('http://app.nuomi.com/naserver/home/hotcategory?compV=3.1.2&page_type=component&compId=index&logpage=Home&appid=android&tn=android&terminal_type=android&device=HUAWEI+HUAWEI+MT7-TL00&channel=bainuo&v=6.4.0&os=SDK19&sdkversion=1.2.0&cityid=200010000&location=0.0%2C0.0&cuid=407C53A4592223ADB901A61F80E77B29%7C638554520661568&uuid=00000000-6307-586f-7cdd-fd600033c587&timestamp=1459318918135&swidth=1080&sheight=1812&net=wifi&appkey=sFTRwpfNpZihllpqhpionpCirKCjy1mRh9Sgl6SapqaiVJuDldCbqaOanFKQV6mj0ZislKqEcYfT2aOjmVa0&packname=com.nuomi&platform=android&power=100&sign=cabb379af9c6822267a5f4d7f880799d', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
    }
})
