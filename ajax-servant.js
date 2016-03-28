var AjaxServant = (function (win, doc) {
	'use strict';

	const defaultOptions = {
		async: true
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
	// private funcs
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


	class AjaxServant {
		constructor (verb = 'GET', url = '/', options = defaultOptions) {
			this.whois = 'AjaxServant';
			this.events = {};
			this.xhr = createXHR();
			this.config(verb, url, options);
		}

		config (verb = 'GET', url = '/', options = defaultOptions) {
			this.verb  = verb;
			this.url   = url;
			this.async = (typeof options.async === 'undefined') ? true : options.async;

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

		open () {
			this.xhr = this.xhr || createXHR();

			this.xhr.open(this.verb, this.url, this.async);

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

		send (urlParams, data) {
			this.xhr = this.xhr || createXHR();

			data = JSON.stringify(data);
			this.xhr.send(data || null);

			return this;
		}

		abort () {
			this.xhr && this.xhr.abort();

			return this;
		}

		go () {
			this.xhr = this.xhr || createXHR();

			this.open();
			this.setHeaders();
			this.send();

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
