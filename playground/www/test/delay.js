module.exports = function (io, delay) {
	const req = io.req;
	const res = io.res;

	setTimeout(function() {
		res.end('blank');	
	}, delay);
};