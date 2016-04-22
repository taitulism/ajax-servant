const send        = require('send');
const serveStatic = require('serve-static');

const serve = serveStatic(`../${__dirname}/public`, {'index': false});

module.exports = function (io) {
	const req = io.req;
	const res = io.res;

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, hdr-A, hdr-B');

	if (req.url === '/favicon.ico') {
		res.end();
	}
	else if (req.url === '/dist/ajax-servant.bundle.js') {
		send(req, '.' + req.url).pipe(res);
	}
	else {
		serve(req, res, function () {
			io.next();
		});
	}
};