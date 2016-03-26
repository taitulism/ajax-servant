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
		},
		on (eventName, cbFn) {

		},
		open () {
			this.xhr.open(this.verb, this.url, this.async);
		},
		setHeaders () {
			if (!this.headers || typeof this.headers !== 'object') {return null;}

			const xhr = this.xhr;

			forIn(this.headers, function (key, value) {
				xhr.setRequestHeader(key, value);
			});
		},
		setHeader (key, value) {
			xhr.setRequestHeader(key, value);
		},
		send (urlParams, data) {
			data = JSON.stringify(data);
			this.xhr.send(data || null);
		},
		abort () {
			this.xhr.abort();
		},
		go () {
			this.open();
			this.setHeaders();
			this.send();
		},
		die () {
			// remove listeners
		}
	};

	AjaxServant.prototype = proto;

	return AjaxServant;

})(window, document);
