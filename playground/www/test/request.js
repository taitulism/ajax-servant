var $url = require('url');

module.exports = function (io, ...params) {
	const req = io.req;
	const res = io.res;
	
	res.setHeader('Content-Type', 'application/json');

	const urlObj = $url.parse(req.url, true);

	const requestObj = {
		params,
		urlObj,
		headers : req.headers,
		qryStr  : urlObj.query
	};

	res.end(JSON.stringify(requestObj));
};