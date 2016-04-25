'use strict';

import CONSTANTS from './constants.js';
import {getType, forIn, copy} from './utils.js';
import formatResponse from './format-response.js';
import resolveUrl from './resolve-url.js';

const {
	DEFAULT_OPTIONS,
	DEFAULT_CACHE_BREAKER_KEY,
	SUPPORTED_VERBS,
	CONSTRUCTOR_INVALID_ARGS_ERR,
	INVALID_STATUS_CODE_ERR,
	UNKNOWN_EVENT_ERR,
	CALLBACK_NOT_FUNCTION_ERR,
	EVENT_NAME
} = CONSTANTS;

const eventsDictionary = {
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
	readystatechange (servant, nativeName) {
		const queue = servant.events[nativeName].queue;

		return function rscWrapper (ajaxEvent) {
			const response = formatResponse(servant.xhr);
			const readyState = servant.xhr.readyState;

			queue.forEach(cbObj => {
				const {ctx, fn} = cbObj;

				fn.apply(ctx, [readyState, response, servant, ajaxEvent]);
			});
		};
	},
	load (servant, nativeName) {
		const queue = servant.events[nativeName].queue;

		return function loadWrapper (ajaxEvent) {
			const response = formatResponse(servant.xhr);

			queue.forEach(cbObj => {
				const {ctx, fn} = cbObj;

				fn.apply(ctx, [response, servant, ajaxEvent]);
			});
		};
	},
	loadend (servant, nativeName) {
		const queue = servant.events[nativeName].queue;

		return function loadEndWrapper (ajaxEvent) {
			const response = formatResponse(servant.xhr);

			queue.forEach(cbObj => {
				const {ctx, fn} = cbObj;

				fn.apply(ctx, [response, servant, ajaxEvent]);
			});
		};
	}
};

function getWrapper (servant, nativeName) {
	const eventWrapper = eventsWrappers[nativeName];

	if (eventWrapper) {
		return eventWrapper(servant, nativeName);
	}

	const queue = servant.events[nativeName].queue;

	return function defaultWrapper (ajaxEvent) {
		queue.forEach(cbObj => {
			const {ctx, fn} = cbObj;

			fn.apply(ctx, [servant, ajaxEvent]);
		});
	};
}

 /*----------------------------------------------------------
 |  example event object for the "load" event:
 |
 |  servant.events['load'] = {
 |      wrapper: defaultWrapper // <-- see "getWrapper()"
 |      queue: []
 |  }
*/
function createEventObj (servant, nativeName) {
	const eventObj = servant.events[nativeName] = Object.create(null);

	eventObj.queue = [];
	eventObj.wrapper = getWrapper(servant, nativeName);

	servant.xhr.addEventListener(nativeName, eventObj.wrapper);
	
	return eventObj;	
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
	const xhr = servant.xhr || createXHR();

	xhr.timeout = servant.timeout;

	return xhr;
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

function removeAllListeners (servant) {
	const xhr = servant.xhr;

	xhr && forIn(servant.events, (eventName, eventObj) => {
		xhr.removeEventListener(eventName, eventObj.wrapper);
	});
}




/* Class */

class AjaxServant {
	constructor (verb, baseUrl, options = {}) {
		if (!isVerb(verb) || !isUrl(baseUrl)) {
			throw new TypeError(CONSTRUCTOR_INVALID_ARGS_ERR);
		}

		options = copy(DEFAULT_OPTIONS, options);

		this.xhr          = null;
		this.events       = {};
		this.baseUrl      = baseUrl;
		this.verb         = verb.toUpperCase();
		this.ctx          = options.ctx;
		this.timeout      = options.timeout;
		this.baseHeaders  = options.headers;
		this.baseQryStr   = options.query;
		this.async        = isNotUndefined(options.async) ? options.async : true;
		this.cacheBreaker = resolveCacheBreakerKey(options.cacheBreaker);
	}

	on (eventName, ctx, cbFn) {
		const nativeName = eventsDictionary.resolve(eventName);
		if (!nativeName) {
			throw new TypeError(UNKNOWN_EVENT_ERR);
		}

		// shift args: no ctx
		if (!cbFn && typeof ctx === 'function') {
			cbFn = ctx;
			ctx  = this.ctx;
		}

		if (typeof cbFn !== 'function') {
			throw new TypeError(CALLBACK_NOT_FUNCTION_ERR);
		}

		this.xhr = getXhr(this);

		// get or create eventObj
		const eventObj = this.events[nativeName] || createEventObj(this, nativeName);

		// add to queue
		eventObj.queue.push({
			ctx,
			fn: cbFn
		});

		return this;
	}

	onStatus (statusCode, ctx, cbFn) {
		if (typeof statusCode !== 'number') {
			throw new TypeError(INVALID_STATUS_CODE_ERR);
		}

		// shift args: no ctx
		if (!cbFn && typeof ctx === 'function') {
			cbFn = ctx;
			ctx  = this.ctx;
		}

		if (typeof cbFn !== 'function') {
			throw new TypeError(CALLBACK_NOT_FUNCTION_ERR);
		}

		this.on('load', ctx, function (responseObj, servant, ajaxEvent) {
			if (responseObj.status.code === statusCode) {
				cbFn.apply(ctx, [responseObj, servant, ajaxEvent]);
			}
		});
		
		return this;
	}

	send ({params, query, headers, body} = {}) {
		const xhr = this.xhr = getXhr(this);

		const verb = this.verb;
		const url  = resolveUrl(this, params, query);
		
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
		console.warn('Request:',[verb, url, body]);

		return this;
	}

	abort () {
		this.xhr && this.xhr.abort();

		return this;
	}

	dismiss () {
		this.abort();

		removeAllListeners(this);

		this.xhr    = null;
		this.events = {};

		return this;
	}
}

export default AjaxServant;
