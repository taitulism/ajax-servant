module.exports = function (io, ...params) {
	const req = io.req;
	const res = io.res;

	if (params[0]) {
		res.end(params.join(','));
		return;
	}

	io.next();	
};