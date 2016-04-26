module.exports = function (io, statusCode, statusText) {
	const req = io.req;
	const res = io.res;

	res.writeHead(statusCode, statusText);
	res.end();
};