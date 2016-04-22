module.exports = function (io) {
	const req = io.req;
	const res = io.res;

	res.end('blank');
};