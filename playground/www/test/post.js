var qs = require('querystring');

function parsePOSTBody(req, res, next) {
	var body = '';

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        // console.log('post data:', decodeURIComponent(body))
        next(body);
    });
}

module.exports = function (io) {
    const req = io.req;
    const res = io.res;
    
    parsePOSTBody(req, res, function (body) {
		res.end(body);
	});
};