function getLongString(len) {
	var str = '';
	while (len) {
		str += '*';
		len--;
	}
	return str;
}

const longLongString = getLongString(10e6); // => 10,000,000
const size           = Buffer.byteLength(longLongString);
// console.log('size', size)

module.exports = function (io) {
	const req = io.req;
	const res = io.res;

	res.end(longLongString);
};