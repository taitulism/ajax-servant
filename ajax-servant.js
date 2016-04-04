var AjaxServant = (function (win, doc) {
	'use strict';

/* Private vars */

	const DEFAULT_CACHE_BREAKER_KEY = 'timestamp';
	const SUPPORTED_VERBS = ['GET', 'POST', 'PUT', 'DELETE'];
	const CONSTRUCTOR_SIGNATURE = "new AjaxServant(verb, url, options)";
	const DOT_ON_SIGNATURE = 'AjaxServant.on(eventName, optionalContext, eventHandler)';
	const CONSTRUCTOR_INVALID_ARGS_ERR = 'AjaxServant requires two strings as first parmeters: an HTTP verb and a base-URL: ' + CONSTRUCTOR_SIGNATURE;
	const UNKNOWN_EVENT_ERR = 'An unknown XMLHttpRequest eventName: ' + DOT_ON_SIGNATURE;
	const CALLBACK_NOT_FUNCTION_ERR = 'eventHandler should be a function: ' + DOT_ON_SIGNATURE;
	const EVENT_NAME = {
		ABORT           : 'abort',
		TIMEOUT         : 'timeout',
		PROGRESS        : 'progress',
		ERROR           : 'error',
		LOADSTART       : 'loadstart',
		LOAD            : 'load',
		LOADEND         : 'loadend',
		READYSTATECHANGE: 'readystatechange',
	};

	const defaultOptions = {
		async     : true,
		breakCache: false,
		ctx       : null,
		qryStr    : null,
		headers   : null,
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
		if (!obj) {return};

		const hasOwn = Object.hasOwnProperty;

		for (const key in obj) { if (hasOwn.call(obj, key)) {
			cbFn.call(obj, key, obj[key]);
		}}
	}

	function mixin(target, ...sources) {
		sources.forEach(srcObj => {
			srcObj && forIn(srcObj, (key, value) => {
				target[key] = value;
			});
		});

		return target;
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

	function stringifyAll (...objects) {
		const ary = [];

		objects.forEach(obj => {
			if (!obj || typeof obj !== 'object') {return;}

			forIn(obj, function (key, value) {
				const esc_key = encodeURIComponent(key);
				const esc_val = encodeURIComponent(value);

				ary.push(esc_key + '=' + esc_val);
			});
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
		// not supporting cross domain requests. yet!
		return (typeof url === 'string' && url[0] === '/');
		// TODO: add condition: || url.substr(0,4) === 'http'
	}

	function isSupported (verb) {
		return ~SUPPORTED_VERBS.indexOf(verb.toUpperCase())
	}

	function isVerb (verb) {
		return (typeof verb === 'string' && isSupported(verb));
	}

	function getFullQueryString (baseQryStr, dynaQryStr, cacheBreaker) {
		let cacheBreakerObj;

		if (cacheBreaker) {
			cacheBreakerObj = {};
			cacheBreakerObj[cacheBreaker] = Date.now();
		}
		else {
			cacheBreakerObj = null;
		}

		const queryString = stringifyAll(baseQryStr, dynaQryStr, cacheBreakerObj);

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
		const fullHeaders = mixin({}, servant.baseHeaders, headers);

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

	function getCacheBreaker (breaker) {
		if (!breaker) {
			return false;
		}

		const type = typeof breaker;

		return (type === 'string') ? breaker : DEFAULT_CACHE_BREAKER_KEY;
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

		return function (ajaxEvent) {
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

	function createEventObj (nativeName) {
		return {
			queue: [],
			wrapper: null
		};
	}

	function getXhr (servant) {
		return servant.xhr || createXHR();
	}

/* Class */
	class AjaxServant {
		constructor (verb, baseUrl, options = {}) {
			if (!isVerb(verb) || !isUrl(baseUrl)) {
				throw new TypeError(CONSTRUCTOR_INVALID_ARGS_ERR);
			}

			options = mixin({}, defaultOptions, options);

			this.xhr          = null;
			this.events       = {};
			this.baseUrl      = baseUrl;
			this.verb         = verb.toUpperCase();
			this.ctx          = options.ctx;
			this.baseQryStr   = options.qryStr;
			this.baseHeaders  = options.headers;
			this.async        = isNotUndefined(options.async) ? options.async : true;
			this.cacheBreaker = getCacheBreaker(options.breakCache);
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
			const eventObj = this.events[nativeName] || createEventObj(nativeName);

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

			console.log('Request:',[verb, url, data]);

			return this;
		}

		abort () {
			this.xhr && this.xhr.abort();

			return this;
		}

		dismiss () {
			var xhr = this.xhr;

			this.abort();

			// remove listeners
			forIn(this.events, function (eventName, eventObj) {
				xhr.removeListener(eventName, eventObj.wrapper);
			});

			this.xhr = null;

			return this;
		}
	}

	return AjaxServant;

})(window, document);
