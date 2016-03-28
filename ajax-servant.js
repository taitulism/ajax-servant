var AjaxServant = (function (win, doc) {
	'use strict';

// private vars
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

// Private functions
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

	function stringify (obj) {

		if (!obj) {
			return '';
		}

		const ary = [];

		forIn(obj, function (key, value) {
			const esc_key = encodeURIComponent(key);
			const esc_val = encodeURIComponent(value);

			ary.push(esc_key + '=' + esc_val);
		});

		return ary.join('&');
	}

// Class
	class AjaxServant {
		constructor (baseUrl = '/', options = defaultOptions) {
			this.whois = 'AjaxServant';
			this.events = {};
			this.xhr = createXHR();
			this.config(baseUrl, options);
		}

		config (baseUrl = '/', options = defaultOptions) {
			this.baseUrl     = baseUrl;
			this.urlParams   = [];
			this.qryStrObj   = {};
			this.queryString = '';
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

		getUrlParams () {
			if (!this.urlParams.length) {
				return '';
			}

			const params = this.urlParams.filter(param => param && typeof param === 'string');

			if (!params.length) {
				return '';
			}

			return '/' + params.join('/');
		}

		getQueryString () {
			if (!Object.keys(this.qryStrObj).length) {
				return '';
			}
			return '?' + stringify(this.qryStrObj);
		}

		getUrl () {
			const baseUrl = normalizeBaseUrl(this.baseUrl);
			const urlParams = this.getUrlParams();
			const queryString = this.getQueryString();

			return baseUrl + urlParams + queryString;
		}

		open (verb = 'GET') {
			this.xhr = this.xhr || createXHR();

			log('URL:', this.getUrl())

			this.xhr.open(verb, this.getUrl(), this.async);

			return this;
		}

		setHeaders () {
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

		abort () {
			this.xhr && this.xhr.abort();

			return this;
		}

		// TODO: move data handling to .open .setHeaders
		send (verb, urlParams, qryStrObj, data) {
			this.xhr = this.xhr || createXHR();

			if (Array.isArray(urlParams)) {
				this.urlParams = urlParams;
			}

			if (qryStrObj) {
				this.qryStrObj = qryStrObj;
			}

			this.open(verb);
			this.setHeaders();

			data = JSON.stringify(data);
			this.xhr.send(data || null);

			return this;
		}

		GET (...args) {
			this.send('GET', ...args);
		}
		POST (...args) {
			this.send('POST', ...args);
		}
		PUT (...args) {
			this.send('PUT', ...args);
		}
		DELETE (...args) {
			this.send('DELETE', ...args);
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
