function objectifyHeaders (headersStr) {
	const headersObj = {};
	const headersAry = headersStr.split(/\n/).filter((header) => !!header);

	headersAry.forEach(header => {
		const pair = header.split(/:\s?/);

		headersObj[pair[0]] = pair[1];
	});

	return headersObj;
}

function getResponseHeaders (xhr) {
	const headersStr = xhr.getAllResponseHeaders();

	return objectifyHeaders(headersStr);
}

export default function (xhr) {
	const headersObj = getResponseHeaders(xhr);

	return {
		status: {
			code: xhr.status,
			text: xhr.statusText
		},
		headers: headersObj,
		body: xhr.responseText || xhr.responseXML
	};
}