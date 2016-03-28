var AjaxServant = (function (win, doc) {
	'use strict';

/* Private vars */
	const defaultOptions = {
		async: true,
		ctx: null
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

		// "loadend" event is triggered after: "load, "abort" and "error".
		// i.e. Done, but result is unknown.

/* Private functions */
	function forIn (obj, cbFn) {
		var key;
		var hasOwn = Object.hasOwnProperty;

		for (key in obj) { if (hasOwn.call(obj, key)) {
			cbFn.call(obj, key, obj[key]);
		}}
	}

	function mixin(target, ...sources) {
		sources.forEach(srcObj => {
			forIn(srcObj, (key, value) => {
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
			if (typeof obj !== 'object') {return;}

			forIn(obj, function (key, value) {
				const esc_key = encodeURIComponent(key);
				const esc_val = encodeURIComponent(value);

				ary.push(esc_key + '=' + esc_val);
			});
		});

		return ary.join('&');
	}

/* Class */
	class AjaxServant {
		constructor (verb = 'GET', baseUrl = '/', options = defaultOptions) {
			this.whois = 'AjaxServant';
			this.events = {};
			this.xhr = createXHR();
			this.config(verb, baseUrl, options);
		}

		config (verb = 'GET', baseUrl = '/', options = defaultOptions) {
			this.verb        = verb;
			this.baseUrl     = baseUrl;
			this.baseQryStrObj = {};
			this.ctx         = options.ctx;
			this.async       = (typeof options.async === 'undefined') ? true : options.async;

			return this;
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

		setHeaders (headers) {
			const fullHeaders = this.getFullHeaders(headers);

			if (!this.headers || typeof this.headers !== 'object') {return null;}

			this.xhr = this.xhr || createXHR();

			const xhr = this.xhr;

			forIn(this.headers, function (key, value) {
				xhr.setRequestHeader(key, value);
			});

			return this;
		}

		setHeader (key, value) {
			this.xhr = this.xhr || createXHR();

			xhr.setRequestHeader(key, value);

			return this;
		}

		getResponse () {
			const xhr = this.xhr;

			return {
				status: {
					code: xhr.status,
					text: xhr.statusText
				},
				headers: xhr.getAllResponseHeaders(),
				body: xhr.responseText || xhr.responseXML
			};
		}

		getDefaultWrapper (nativeName) {
			const ajaxServant = this;
			const queue = ajaxServant.getEventQueue(nativeName);

			return function (ajaxEvent) {
				const response = ajaxServant.getResponse();

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
			this.xhr = this.xhr || createXHR();

			// shift args
			if (!cbFn && typeof ctx === 'function') {
				cbFn = ctx;
				ctx = this.ctx || this;
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

		getFullHeaders (headers) {
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

		getFullQueryString (qryStrObj) {
			const queryString = stringifyAll(this.baseQryStrObj, qryStrObj);
			log('qs', queryString)
			return queryString ? '?' + queryString : '';
		}

		getFullUrl (baseUrl, urlParams, qryStrObj) {
			const url = normalizeBaseUrl(baseUrl) + this.getUrlParams(urlParams);
			const queryString = this.getFullQueryString(qryStrObj);

			return url + queryString;
		}

		open (params, qryStr) {
			this.xhr = this.xhr || createXHR();

			const fullUrl = this.getFullUrl(this.baseUrl, params, qryStr);

			log('URL:', fullUrl)

			this.xhr.open(this.verb, fullUrl, this.async);

			return this;
		}

		send ({params, qryStr, headers, body}) {
			this.xhr = this.xhr || createXHR();

			this.open(params, qryStr);
			this.setHeaders(headers, body);

			const data = JSON.stringify(body);

			this.xhr.send(data || null);

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
