var AjaxServant = (function (win, doc) {
	'use strict';

/* Private vars */

	const DEFAULT_CACHE_BREAKER_KEY = 'timestamp';

	const defaultOptions = {
		async: true,
		ctx: null,
		qryStr: null,
		headers: null,
		breakCache: false,
	};

	const eventsDict = {
		readystatechange : 'readystatechange',
		rsc       : 'readystatechange',
		err       : 'error',
		end       : 'loadend',
		load      : 'load',
		prog      : 'progress',
		error     : 'error',
		start     : 'loadstart',
		abort     : 'abort',
		timeout   : 'timeout',
		loadend   : 'loadend',
		complete  : 'loadend',
		done      : 'loadend',
		progress  : 'progress',
		response  : 'load',
		loadstart : 'loadstart',
		resolve          : function (eventName) {
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

/* Class */
	class AjaxServant {
		constructor (verb = 'GET', baseUrl = '/', options) {
			this.whois = 'AjaxServant';
			this.events = {};
			this.config(verb, baseUrl, options);
		}

		config (verb = 'GET', baseUrl = '/', options) {
			options = (!options) ? defaultOptions : mixin({}, defaultOptions, options);

			this.xhr         = null;
			this.verb        = verb.toUpperCase();
			this.baseUrl     = baseUrl;
			this.ctx         = options.ctx;
			this.baseQryStr  = options.qryStr;
			this.baseHeaders = options.headers;
			this.async       = isNotUndefined(options.async) ? options.async : true;

			if (options.breakCache) {
				this.setCacheBreaker(options.breakCache);
			}

			return this;
		}

		getXhr () {
			return this.xhr || createXHR();
		}

		setCacheBreaker (breaker) {
			const type = typeof breaker;
			if (type === 'boolean') {
				this.cacheBreaker = DEFAULT_CACHE_BREAKER_KEY;
			}
			else if (type === 'string') {
				this.cacheBreaker = breaker;
			}
			else { // TODO: maybe this is useless
				this.cacheBreaker = DEFAULT_CACHE_BREAKER_KEY;
			}
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

		formatResponse () {
			const xhr = this.xhr;
			const headersStr = xhr.getAllResponseHeaders();
			const headersObj = objectifyHeaders(headersStr);

			return {
				status: {
					code: xhr.status,
					text: xhr.statusText
				},
				headers: headersObj,
				body: xhr.responseText || xhr.responseXML
			};
		}

		getDefaultWrapper (nativeName) {
			const ajaxServant = this;
			const queue = ajaxServant.getEventQueue(nativeName);

			return function (ajaxEvent) {
				const response = ajaxServant.formatResponse();

				queue.forEach(cbObj => {
					const {ctx, fn} = cbObj;

					fn.apply(ctx, [response, ajaxServant, ajaxEvent]);
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

			console.log('ctx', ctx)

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
			log(this.baseHeaders)
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

			log('request',{
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
