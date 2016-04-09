var $url = require('url');
var qs = require('querystring');
var send = require('send');

var serveStatic = require('serve-static');
var serve = serveStatic(`${__dirname}/public`, {'index': 'index.html'});

var aServer = require('a-server')({port:8081});

var log = console.log;

log(__dirname);

function parsePOSTBody(req, res, next) {
	'use strict';

	let body = '';

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
	if (req.url === '/favicon.ico') {
		res.end();
		return;
	}

	if (req.url === '/dist/ajax-servant.bundle.js') {
		send(req, '.' + req.url).pipe(res);
		return;
	}
	serve(req, res, function () {

		const qry =  $url.parse(req.url, true).query;
		log('');
		log(req.method, req.url);
		log(req.headers['content-type'] || 'no headers');

		if (req.method === 'POST') {
			parsePOSTBody(req, res, function (body) {
				res.end(body);
			});
			return;
		}

		if (Object.keys(qry).length) {
			res.end('qry');
			return;
		}

		res.end('RAGIL');
		
	});
});