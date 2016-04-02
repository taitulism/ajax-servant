var AjaxServant = (function (win, doc) {
	'use strict';

/* Private vars */

	const DEFAULT_CACHE_BREAKER_KEY = 'timestamp';
	const SUPPORTED_VERBS = ['GET', 'POST', 'PUT', 'DELETE'];
	const INSUFFICIENT_DATA_ERR = "AjaxServant requires an HTTP verb and a base-URL as first parmeters:\n\tnew AjaxServant('GET', '/')";

	const defaultOptions = {
		async     : true,
		breakCache: false,
		ctx       : null,
		qryStr    : null,
		headers   : null,
	};

	const eventsDict = {
		abort     : 'abort',
		timeout   : 'timeout',
		prog      : 'progress',
		progress  : 'progress',
		err       : 'error',
		error     : 'error',
		start     : 'loadstart',
		loadstart : 'loadstart',
		load      : 'load',
		response  : 'load',
		end       : 'loadend',
		loadend   : 'loadend',
		complete  : 'loadend',
		done      : 'loadend',
		rsc             : 'readystatechange',
		readystatechange: 'readystatechange',
		resolve: function (eventName) {
			eventName = eventName.toLowerCase();

			if (this.hasOwnProperty(eventName) && eventName !== 'resolve') {
				return this[eventName];
			}

			return null;
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
/* Class */
	class AjaxServant {
		constructor (verb, baseUrl, options = {}) {
			if (!isVerb(verb) || !isUrl(baseUrl)) {
				throw new Error(INSUFFICIENT_DATA_ERR);
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
			this.cacheBreaker = this.getCacheBreaker(options.breakCache);
		}

		getXhr () {
			return this.xhr || createXHR();
		}

		getCacheBreaker (breaker) {
			if (!breaker) {
				return false;
			}

			const type = typeof breaker;

			return (type === 'string') ? breaker : DEFAULT_CACHE_BREAKER_KEY;
		}

		createEventObj (nativeName) {
			return {
				queue: [],
				wrapper: null
			};
		}

		getEventQueue (nativeName) {
			return this.events[nativeName].queue;
		}

		setHeaders (headers = null) {
			const fullHeaders = this.getFullHeaders(headers);

			if (!fullHeaders) {
				return null;
			}

			this.xhr = this.getXhr();

			const xhr = this.xhr;

			forIn(fullHeaders, function (key, value) {
				xhr.setRequestHeader(key, value);
			});

			return this;
		}

		setHeader (key, value) {
			this.xhr = this.getXhr();

			xhr.setRequestHeader(key, value);

			return this;
		}

		getReaponse () {
			const xhr = this.xhr;
			const headers = getResponseHeader(xhr);

			return formatResponse(xhr, headers);
		}

		getDefaultWrapper (nativeName) {
			const self = this;
			const queue = this.getEventQueue(nativeName);

			return function (ajaxEvent) {
				const response = self.getReaponse();

				queue.forEach(cbObj => {
					const {ctx, fn} = cbObj;

					fn.apply(ctx, [response, self, ajaxEvent]);
				});
			};
		}

		getWrapper (nativeName) {
			return (eventsWrappers[nativeName])
				? eventsWrappers[nativeName].call(this, nativeName)
				: this.getDefaultWrapper(nativeName);
		}

		on (eventName, ctx, cbFn) {
			this.xhr = this.getXhr();

			// shift args: no ctx
			if (!cbFn && typeof ctx === 'function') {
				cbFn = ctx;
				ctx = this.ctx;
			}

			// validate eventName
			const nativeName = eventsDict.resolve(eventName);
			if (!nativeName) {return this;}

			// get or create eventObj
			const eventObj = this.events[nativeName] || this.createEventObj(nativeName);

			// add to queue
			eventObj.queue.push({
				ctx,
				fn: cbFn
			});

			// if wrapper hasn't been set -> set it
			if (!eventObj.wrapper) {
				this.events[nativeName] = eventObj;

				eventObj.wrapper = this.getWrapper(nativeName);

				this.xhr.addEventListener(nativeName, eventObj.wrapper)
			}

			return this;
		}

		getFullHeaders (headers = null) {
			return mixin({}, this.baseHeaders, headers);
		}

		getUrlParams (urlParams) {
			if (!urlParams || !urlParams.length) {
				return '';
			}

			const params = urlParams.filter(param => param && typeof param === 'string');

			if (!params.length) {
				return '';
			}

			return '/' + params.join('/');
		}

		getFullQueryString (qryStrObj = null) {
			let queryString = stringifyAll(this.baseQryStr, qryStrObj);

			if (this.cacheBreaker) {
				queryString += `&${this.cacheBreaker}=${Date.now()}`;
			}

			return queryString ? '?' + queryString : '';
		}

		getFullUrl (baseUrl, urlParams, qryStrObj) {
			const url = normalizeBaseUrl(baseUrl) + this.getUrlParams(urlParams);
			const queryString = this.getFullQueryString(qryStrObj);

			return url + queryString;
		}

		open (params, qryStr) {
			this.xhr = this.getXhr();

			const fullUrl = this.getFullUrl(this.baseUrl, params, qryStr);

			this.xhr.open(this.verb, fullUrl, this.async);

			return this;
		}

		formatBody (data) {
			const type = getType(data);
			const verb = this.verb;

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

		send ({params, qryStr, headers, body} = {}) {
			this.xhr = this.getXhr();
			const data = this.formatBody(body);

			this.open(params, qryStr);
			this.setHeaders(headers, data);
			this.xhr.send(data);

			console.log('request',{
				verb: this.verb,
				body: data
			});

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
