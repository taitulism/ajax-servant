var AjaxServant = (function (win, doc) {
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

	const defaultOptions = {
		async: true
	};

	// constructor
	var AjaxServant = function (verb = 'GET', url = '/', options = defaultOptions) {
		this.events = {};
		this.xhr = createXHR();
		this.config(verb, url, options);
	}

	// constructor prototype
	var proto = {
		whois: 'AjaxServant',
		constructor: AjaxServant,
		config (verb = 'GET', url = '/', options = defaultOptions) {
			this.verb  = verb;
			this.url   = url;
			this.async = (typeof options.async === 'undefined') ? true : options.async;

			return this;
		},
		on (eventName, cbFn) {
			this.xhr = this.xhr || createXHR();

			return this;
		},
		open () {
			this.xhr = this.xhr || createXHR();

			this.xhr.open(this.verb, this.url, this.async);

			return this;
		},
		setHeaders () {
			if (!this.headers || typeof this.headers !== 'object') {return null;}

			this.xhr = this.xhr || createXHR();

			const xhr = this.xhr;

			forIn(this.headers, function (key, value) {
				xhr.setRequestHeader(key, value);
			});

			return this;
		},
		setHeader (key, value) {
			this.xhr = this.xhr || createXHR();

			xhr.setRequestHeader(key, value);

			return this;
		},
		send (urlParams, data) {
			this.xhr = this.xhr || createXHR();

			data = JSON.stringify(data);
			this.xhr.send(data || null);

			return this;
		},
		abort () {
			this.xhr && this.xhr.abort();

			return this;
		},
		go () {
			this.xhr = this.xhr || createXHR();

			this.open();
			this.setHeaders();
			this.send();

			return this;
		},
		dismiss () {
			var xhr = this.xhr;

			this.abort();

			// remove listeners
			forIn(this.events, function (eventName, handler) {
				xhr.removeListener(eventName, handler);
			});

			this.xhr = null;

			return this;
		}
	};

	AjaxServant.prototype = proto;

	return AjaxServant;

})(window, document);
