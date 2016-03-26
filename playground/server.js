var aServer = require('a-server')();
var serveStatic = require('serve-static');
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
		log(req.method, req.url)
		res.end('sababa');
		
	});
});