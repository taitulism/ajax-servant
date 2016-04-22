var $url = require('url');
var qs = require('querystring');
var send = require('send');

var serveStatic = require('serve-static');
var serve = serveStatic(`${__dirname}/public`, {'index': false});

var aServer = require('a-server')({port:8081, timeout: 20000});

var log = console.log;

function getLongString(len) {
	var str = '';
	while (len) {
		str += '*';
		len--;
	}
	return str;
}

var longLongString = getLongString(2e7);
var size = Buffer.byteLength(longLongString);
// console.log('size', size)

function parsePOSTBody(req, res, next) {
	var body = '';

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        // var post = qs.parse(body);
        log('post data:', decodeURIComponent(body))
        next(body);
    });
}

aServer.start(function (req, res) {
	const headers = req.headers;
	if (req.url === '/favicon.ico') {
		res.end();
		return;
	}

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, hdrA, hdrB');

	if (req.url === '/dist/ajax-servant.bundle.js') {
		send(req, '.' + req.url).pipe(res);
		return;
	}
	serve(req, res, function () {
		var urlObj   = $url.parse(req.url, true);
		var qryObj   = urlObj.query;
		var queryLen = Object.keys(qryObj).length;

		log('');
		log(req.method, req.url);
		// log('urlObj', urlObj);
		// log('headers', headers);
		// log('headers', headers);
		
		if (req.method === 'POST') {
			parsePOSTBody(req, res, function (body) {
				res.end(body);
			});
			return;
		}

		if (req.url.substr(0,5) === '/test') {
			if (urlObj.pathname === '/test/x' || urlObj.pathname === '/test/y') {
				res.end(urlObj.pathname.substr(5));
				return;
			}

			if (urlObj.pathname === '/test/params/qry') {
				res.end('params/qry');
				return;
			}

			if (urlObj.pathname === '/test/baseqrycache') {
				res.end('baseqrycache');
				return;
			}

			if (urlObj.pathname === '/test/dynaqrycache') {
				res.end('dynaqrycache');
				return;
			}

			if (urlObj.pathname === '/test/bothqrycache') {
				res.end('bothqrycache');
				return;
			}

			if (urlObj.pathname === '/test/params/bothqry/cache') {
				res.end('params/bothqry/cache');
				return;
			}

			if (queryLen) {
				if (queryLen === 1 && qryObj.mytimestamp) {
					res.end(req.url);
					return;
				}
				
				res.end(urlObj.search);
				return;
			}

			if (headers['x-requested-with']) {
				res.end(headers['x-requested-with']);
				return;
			}

			if (headers.hdra && headers.hdrb) {
				res.end(headers.hdra + headers.hdrb);
				return;
			}

			if (req.url === '/test/a/b/c') {
				res.end('/a/b/c');
				return;
			}

			if (req.url === '/test/timeout') {
				setTimeout(function() {
					res.end('thanks for waiting');
				}, 5000);
				return;
			}

			if (req.url === '/test/progress') {
				res.setHeader('Content-Length', size);
				res.write(longLongString);
				res.end();
				return;
			}

			res.end('GET');
			return;
		}

		res.end('good');
	});
});