'use strict';

import CONSTANTS from './constants.js';

const {
	DEFAULT_CACHE_BREAKER_KEY,
	SUPPORTED_VERBS,
	CONSTRUCTOR_INVALID_ARGS_ERR,
	UNKNOWN_EVENT_ERR,
	CALLBACK_NOT_FUNCTION_ERR,
	EVENT_NAME
} = CONSTANTS;


/* Private vars */
const defaultOptions = {
	async   : true,
	ctx     : null,
	qryStr  : null,
	headers : null,
	cacheBreaker : false
};

const eventsDict = {
	abort            : EVENT_NAME.ABORT,
	error            : EVENT_NAME.ERROR,
	timeout          : EVENT_NAME.TIMEOUT,
	progress         : EVENT_NAME.PROGRESS,
	start            : EVENT_NAME.LOADSTART,
	loadstart        : EVENT_NAME.LOADSTART,
	load             : EVENT_NAME.LOAD,
	response         : EVENT_NAME.LOAD,
	end              : EVENT_NAME.LOADEND,
	loadend          : EVENT_NAME.LOADEND,
	readystatechange : EVENT_NAME.READYSTATECHANGE,

	resolve: function (eventName) {
		if (!eventName || typeof eventName !== 'string') {
			return false;
		}

		eventName = eventName.toLowerCase();

		if (this.hasOwnProperty(eventName) && eventName !== 'resolve') {
			return this[eventName];
		}

		return false;
	}
};

const eventsWrappers = {
	readystatechange () {},
	progress () {},
	timeout () {}
};

/* Private functions */
function getType (x) {
	let type = typeof x;

	if (type === 'object') {
		type = Object.prototype.toString.call(x);
		type = type.substring(8, type.length -1);
	}

	return type.toLowerCase();
}

function isNotUndefined(x) {
	return (typeof x !== 'undefined');
}

function forIn (obj, cbFn) {
	if (!obj) {return;}

	const hasOwn = Object.hasOwnProperty;

	for (const key in obj) { if (hasOwn.call(obj, key)) {
		cbFn.call(obj, key, obj[key]);
	}}
}

function createXHR () {
	return new XMLHttpRequest();
}

function normalizeBaseUrl (baseUrl) {
	if (baseUrl === '/') {
		return '';
	}

	const len = baseUrl.length;

	if (baseUrl[len-1] === '/') {
		return baseUrl.substr(0, len-1);
	}

	return baseUrl;
}

function stringify(obj) {
	const ary = [];

	forIn(obj, function (key, value) {
		const esc_key = encodeURIComponent(key);
		const esc_val = encodeURIComponent(value);

		ary.push(esc_key + '=' + esc_val);
	});

	return ary.join('&');
}

function objectifyHeaders (headersStr) {
	const headersObj = {};
	const headersAry = headersStr.split(/\n/).filter(header => !!header);

	headersAry.forEach(header => {
		const pair = header.split(/:\s?/);

		headersObj[pair[0]] = pair[1];
	});

	return headersObj;
}

function formatResponse (xhr, headersObj) {
	return {
		status: {
			code: xhr.status,
			text: xhr.statusText
		},
		headers: headersObj,
		body: xhr.responseText || xhr.responseXML
	};
}

function getResponseHeader (xhr) {
	const headersStr = xhr.getAllResponseHeaders();

	return objectifyHeaders(headersStr);
}

function isUrl(url) {
	return (typeof url === 'string' && (url[0] === '/' || url.substr(0,4) === 'http'));
}

function isSupported (verb) {
	return ~SUPPORTED_VERBS.indexOf(verb.toUpperCase());
}

function isVerb (verb) {
	return (typeof verb === 'string' && isSupported(verb));
}

function addCacheBreaker (cacheBreaker, qryStrObj) {
	if (cacheBreaker) {
		qryStrObj[cacheBreaker] = Date.now();
	}
}

function getFullQueryString (baseQryStrObj, dynaQryStrObj, cacheBreaker) {
	const qryStrObj = Object.assign({}, baseQryStrObj, dynaQryStrObj);

	addCacheBreaker(cacheBreaker, qryStrObj);

	const queryString = stringify(qryStrObj);

	return queryString ? ('?' + queryString) : '';
}

function removePreSlash (urlParamsStr) {
	if (urlParamsStr[0] === '/') {
		return urlParamsStr.substr(1);
	}
	return urlParamsStr;
}

function getUrlParams (urlParams) {
	if (!urlParams || !urlParams.length) {
		return '';
	}

	if (typeof urlParams === 'string') {
		urlParams = removePreSlash(urlParams);
		return `/${urlParams}`;
	}

	const params = urlParams.filter(param => (param && typeof param === 'string'));

	if (!params.length) {
		return '';
	}

	return `/${params.join('/')}`;
}

function getFullUrl (servant, params, qryStr) {
	const baseUrl = normalizeBaseUrl(servant.baseUrl);

	params = getUrlParams(params);
	qryStr = getFullQueryString(servant.baseQryStr, qryStr, servant.cacheBreaker);

	return baseUrl + params + qryStr;
}

function setHeaders (servant, headers = null) {
	const fullHeaders = Object.assign({}, servant.baseHeaders, headers);

	if (!fullHeaders) {
		return null;
	}

	const xhr = getXhr(servant);

	forIn(fullHeaders, function (key, value) {
		xhr.setRequestHeader(key, value);
	});
}

function formatBody (data, verb) {
	const type = getType(data);

	if (!data || verb === 'GET' || verb === 'HEAD') {
		return null;
	}

	if (type === 'string') {
		return data;
	}

	if (type === 'number') {
		return data + '';
	}

	if (type === 'object' || type === 'array') {
		try {
			return JSON.stringify(data);
		}
		catch (err) {
			return null;
		}
	}

	return data.toString() || null;
}

function getEventQueue (servant, nativeName) {
	return servant.events[nativeName].queue;
}

function getResponse (xhr) {
	const headers = getResponseHeader(xhr);

	return formatResponse(xhr, headers);
}

function getDefaultWrapper (servant, nativeName) {
	const queue = getEventQueue(servant, nativeName);

	return function defaultWrapper (ajaxEvent) {
		const response = getResponse(servant.xhr);

		queue.forEach(cbObj => {
			const {ctx, fn} = cbObj;

			fn.apply(ctx, [response, servant, ajaxEvent]);
		});
	};
}

function getWrapper (servant, nativeName) {
	return (eventsWrappers[nativeName])
		? eventsWrappers[nativeName].call(servant, nativeName)
		: getDefaultWrapper(servant, nativeName);
}

function createEventObj () {
	return {
		queue: [],
		wrapper: null
	};
}

function getXhr (servant) {
	return servant.xhr || createXHR();
}

function removeAllListeners (servant) {
	const xhr = servant.xhr;

	if (!xhr) {
		return;
	}

	forIn(servant.events, function (eventName, eventObj) {
		xhr.removeEventListener(eventName, eventObj.wrapper);
	});

	servant.events = {};
}

function resolveCacheBreakerKey (breaker) {
	if (!breaker) {
		return null;
	}

	return (typeof breaker === 'string') ? breaker : DEFAULT_CACHE_BREAKER_KEY;
}



/* Class */
class AjaxServant {
	constructor (verb, baseUrl, options = {}) {
		if (!isVerb(verb) || !isUrl(baseUrl)) {
			throw new TypeError(CONSTRUCTOR_INVALID_ARGS_ERR);
		}

		options = Object.assign({}, defaultOptions, options);

		this.xhr          = null;
		this.events       = {};
		this.baseUrl      = baseUrl;
		this.verb         = verb.toUpperCase();
		this.ctx          = options.ctx;
		this.baseHeaders  = options.headers;
		this.baseQryStr   = options.qryStr;
		this.async        = isNotUndefined(options.async) ? options.async : true;
		this.cacheBreaker = resolveCacheBreakerKey(options.cacheBreaker);
	}

	on (eventName, ctx, cbFn) {
		this.xhr = getXhr(this);

		// shift args: no ctx
		if (!cbFn && typeof ctx === 'function') {
			cbFn = ctx;
			ctx = this.ctx;
		}

		// validate eventName
		const nativeName = eventsDict.resolve(eventName);
		if (!nativeName || typeof cbFn !== 'function') {
			if (!nativeName) {
				throw new TypeError(UNKNOWN_EVENT_ERR);
			}
			throw new TypeError(CALLBACK_NOT_FUNCTION_ERR);
		}

		// get or create eventObj
		const eventObj = this.events[nativeName] || createEventObj();

		// add to queue
		eventObj.queue.push({
			ctx,
			fn: cbFn
		});

		// if wrapper hasn't been set -> set it
		if (!eventObj.wrapper) {
			this.events[nativeName] = eventObj;

			eventObj.wrapper = getWrapper(this, nativeName);

			this.xhr.addEventListener(nativeName, eventObj.wrapper);
		}

		return this;
	}

	send ({params, qryStr, headers, body} = {}) {
		this.xhr = getXhr(this);

		const verb = this.verb;
		const data = formatBody(body, verb);
		const url  = getFullUrl(this, params, qryStr);

		// open
		this.xhr.open(verb, url, this.async);

		// set headers
		setHeaders(this, headers, data);
		
		// send
		this.xhr.send(data);

		/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
		// console.warn('Request:',[verb, url, data]);

		return this;
	}

	abort () {
		this.xhr && this.xhr.abort();

		return this;
	}

	dismiss () {
		this.abort();

		removeAllListeners(this);

		this.xhr = null;

		return this;
	}
}

export default AjaxServant;
