export function forIn (obj, cbFn) {
	if (!obj) {return;}

	const hasOwn = Object.hasOwnProperty;

	for (const key in obj) { if (hasOwn.call(obj, key)) {
		cbFn.call(obj, key, obj[key]);
	}}
}

export function stringify (obj) {
	const ary = [];

	forIn(obj, (key, value) => {
		const esc_key = encodeURIComponent(key);
		const esc_val = encodeURIComponent(value);

		ary.push(esc_key + '=' + esc_val);
	});

	return ary.join('&');
}

export function getType (x) {
	let type = typeof x;

	if (type === 'object') {
		type = Object.prototype.toString.call(x);
		type = type.substring(8, type.length -1);
	}

	return type.toLowerCase();
}

export function copy (...sources) {
	return Object.assign({}, ...sources);
}