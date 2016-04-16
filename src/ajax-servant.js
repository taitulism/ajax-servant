'use strict';

import CONSTANTS from './constants.js';
import {getType, forIn, copy} from './utils.js';
import formatResponse from './format-response.js';
import resolveUrl from './resolve-url.js';

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

function getWrapper (servant, nativeName) {
	const eventWrapper = eventsWrappers[nativeName];

	if (eventWrapper) {
		return eventWrapper;
	}

	const queue = servant.events[nativeName].queue;

	return function defaultWrapper (ajaxEvent) {
		const response = formatResponse(servant.xhr);

		queue.forEach(cbObj => {
			const {ctx, fn} = cbObj;

			fn.apply(ctx, [response, servant, ajaxEvent]);
		});
	};
}

function createEventObj (servant, nativeName) {
	return {
		queue: [],
		wrapper: null
	};
}

function prepareBody (data, verb) {
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

function createXHR () {
	return new XMLHttpRequest();
}

function getXhr (servant) {
	return servant.xhr || createXHR();
}

function isSupported (verb) {
	return ~SUPPORTED_VERBS.indexOf(verb.toUpperCase());
}

function isUrl(url) {
	return (typeof url === 'string' && (url[0] === '/' || url.substr(0,4) === 'http'));
}

function isVerb (verb) {
	return (typeof verb === 'string' && isSupported(verb));
}

function isNotUndefined(x) {
	return (typeof x !== 'undefined');
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

		options = copy(defaultOptions, options);

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
		const eventObj = this.events[nativeName] || createEventObj(this, nativeName);

		// add to queue
		eventObj.queue.push({
			ctx,
			fn: cbFn
		});

		if (!eventObj.wrapper) {
			this.events[nativeName] = eventObj;
			eventObj.wrapper = getWrapper(this, nativeName);
			this.xhr.addEventListener(nativeName, eventObj.wrapper);
		}

		return this;
	}

	send ({params, qryStr, headers, body} = {}) {
		const xhr = this.xhr = getXhr(this);

		const verb = this.verb;
		const url  = resolveUrl(this, params, qryStr);
		
		headers = copy(this.baseHeaders, headers);
		body    = prepareBody(body, verb);

		// open
		xhr.open(verb, url, this.async);

		// set headers
		forIn(headers, function (key, value) {
			xhr.setRequestHeader(key, value);
		});
		
		// send
		xhr.send(body);

		/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
		// console.warn('Request:',[verb, url, body]);

		return this;
	}

	abort () {
		this.xhr && this.xhr.abort();

		return this;
	}

	dismiss () {
		this.abort();

		const xhr = this.xhr;

		xhr && forIn(this.events, (eventName, eventObj) => {
			xhr.removeEventListener(eventName, eventObj.wrapper);
		});

		this.xhr    = null;
		this.events = {};

		return this;
	}
}

export default AjaxServant;