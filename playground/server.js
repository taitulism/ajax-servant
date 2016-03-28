var aServer = require('a-server')();
var serveStatic = require('serve-static');
var $url = require('url');
var serve = serveStatic(`${__dirname}/public`, {'index': 'index.html'});

var log = console.log;

log(__dirname)

aServer.start(function (req, res) {
	if (req.url === '/favicon.ico') {
		res.end();
		return;
	}

	
	// log(req.url)
	serve(req, res, function () {
		const qry =  $url.parse(req.url, true).query;
		log(req.method)

		if (Object.keys(qry).length) {
			res.end('qry');
			return;
		}
		res.end('sababa');
		
	});
});