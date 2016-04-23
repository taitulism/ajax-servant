(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AjaxServant"] = factory();
	else
		root["AjaxServant"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**************************!*\
  !*** multi ajax-servant ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(/*! ./src/ajax-servant.js */1);


/***/ },
/* 1 */
/*!*****************************!*\
  !*** ./src/ajax-servant.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _constants = __webpack_require__(/*! ./constants.js */ 2);

	var _constants2 = _interopRequireDefault(_constants);

	var _utils = __webpack_require__(/*! ./utils.js */ 3);

	var _formatResponse = __webpack_require__(/*! ./format-response.js */ 4);

	var _formatResponse2 = _interopRequireDefault(_formatResponse);

	var _resolveUrl = __webpack_require__(/*! ./resolve-url.js */ 5);

	var _resolveUrl2 = _interopRequireDefault(_resolveUrl);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var DEFAULT_OPTIONS = _constants2.default.DEFAULT_OPTIONS;
	var DEFAULT_CACHE_BREAKER_KEY = _constants2.default.DEFAULT_CACHE_BREAKER_KEY;
	var SUPPORTED_VERBS = _constants2.default.SUPPORTED_VERBS;
	var CONSTRUCTOR_INVALID_ARGS_ERR = _constants2.default.CONSTRUCTOR_INVALID_ARGS_ERR;
	var UNKNOWN_EVENT_ERR = _constants2.default.UNKNOWN_EVENT_ERR;
	var CALLBACK_NOT_FUNCTION_ERR = _constants2.default.CALLBACK_NOT_FUNCTION_ERR;
	var EVENT_NAME = _constants2.default.EVENT_NAME;


	var eventsDictionary = {
		abort: EVENT_NAME.ABORT,
		error: EVENT_NAME.ERROR,
		timeout: EVENT_NAME.TIMEOUT,
		progress: EVENT_NAME.PROGRESS,
		start: EVENT_NAME.LOADSTART,
		loadstart: EVENT_NAME.LOADSTART,
		load: EVENT_NAME.LOAD,
		response: EVENT_NAME.LOAD,
		end: EVENT_NAME.LOADEND,
		loadend: EVENT_NAME.LOADEND,
		readystatechange: EVENT_NAME.READYSTATECHANGE,

		resolve: function resolve(eventName) {
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

	var eventsWrappers = {
		readystatechange: function readystatechange(servant, nativeName) {
			var queue = servant.events[nativeName].queue;

			return function rscWrapper(ajaxEvent) {
				var response = (0, _formatResponse2.default)(servant.xhr);
				var readyState = servant.xhr.readyState;

				queue.forEach(function (cbObj) {
					var ctx = cbObj.ctx;
					var fn = cbObj.fn;


					fn.apply(ctx, [readyState, response, servant, ajaxEvent]);
				});
			};
		},
		load: function load(servant, nativeName) {
			var queue = servant.events[nativeName].queue;

			return function loadWrapper(ajaxEvent) {
				var response = (0, _formatResponse2.default)(servant.xhr);

				queue.forEach(function (cbObj) {
					var ctx = cbObj.ctx;
					var fn = cbObj.fn;


					fn.apply(ctx, [response, servant, ajaxEvent]);
				});
			};
		},
		loadend: function loadend(servant, nativeName) {
			var queue = servant.events[nativeName].queue;

			return function loadEndWrapper(ajaxEvent) {
				var response = (0, _formatResponse2.default)(servant.xhr);

				queue.forEach(function (cbObj) {
					var ctx = cbObj.ctx;
					var fn = cbObj.fn;


					fn.apply(ctx, [response, servant, ajaxEvent]);
				});
			};
		}
	};

	function getWrapper(servant, nativeName) {
		var eventWrapper = eventsWrappers[nativeName];

		if (eventWrapper) {
			return eventWrapper(servant, nativeName);
		}

		var queue = servant.events[nativeName].queue;

		return function defaultWrapper(ajaxEvent) {
			queue.forEach(function (cbObj) {
				var ctx = cbObj.ctx;
				var fn = cbObj.fn;


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
	function createEventObj(servant, nativeName) {
		var eventObj = servant.events[nativeName] = Object.create(null);

		eventObj.queue = [];
		eventObj.wrapper = getWrapper(servant, nativeName);

		servant.xhr.addEventListener(nativeName, eventObj.wrapper);

		return eventObj;
	}

	function prepareBody(data, verb) {
		var type = (0, _utils.getType)(data);

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
			} catch (err) {
				return null;
			}
		}

		return data.toString() || null;
	}

	function createXHR() {
		return new XMLHttpRequest();
	}

	function getXhr(servant) {
		var xhr = servant.xhr || createXHR();

		xhr.timeout = servant.timeout;

		return xhr;
	}

	function isSupported(verb) {
		return ~SUPPORTED_VERBS.indexOf(verb.toUpperCase());
	}

	function isUrl(url) {
		return typeof url === 'string' && (url[0] === '/' || url.substr(0, 4) === 'http');
	}

	function isVerb(verb) {
		return typeof verb === 'string' && isSupported(verb);
	}

	function isNotUndefined(x) {
		return typeof x !== 'undefined';
	}

	function resolveCacheBreakerKey(breaker) {
		if (!breaker) {
			return null;
		}

		return typeof breaker === 'string' ? breaker : DEFAULT_CACHE_BREAKER_KEY;
	}

	/* Class */

	var AjaxServant = function () {
		function AjaxServant(verb, baseUrl) {
			var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			_classCallCheck(this, AjaxServant);

			if (!isVerb(verb) || !isUrl(baseUrl)) {
				throw new TypeError(CONSTRUCTOR_INVALID_ARGS_ERR);
			}

			options = (0, _utils.copy)(DEFAULT_OPTIONS, options);

			this.xhr = null;
			this.events = {};
			this.baseUrl = baseUrl;
			this.verb = verb.toUpperCase();
			this.ctx = options.ctx;
			this.timeout = options.timeout;
			this.baseHeaders = options.headers;
			this.baseQryStr = options.qryStr;
			this.async = isNotUndefined(options.async) ? options.async : true;
			this.cacheBreaker = resolveCacheBreakerKey(options.cacheBreaker);
		}

		_createClass(AjaxServant, [{
			key: 'on',
			value: function on(eventName, ctx, cbFn) {
				this.xhr = getXhr(this);

				// shift args: no ctx
				if (!cbFn && typeof ctx === 'function') {
					cbFn = ctx;
					ctx = this.ctx;
				}

				// validate eventName
				var nativeName = eventsDictionary.resolve(eventName);
				if (!nativeName || typeof cbFn !== 'function') {
					if (!nativeName) {
						throw new TypeError(UNKNOWN_EVENT_ERR);
					}
					throw new TypeError(CALLBACK_NOT_FUNCTION_ERR);
				}

				// get or create eventObj
				var eventObj = this.events[nativeName] || createEventObj(this, nativeName);

				// add to queue
				eventObj.queue.push({
					ctx: ctx,
					fn: cbFn
				});

				return this;
			}
		}, {
			key: 'send',
			value: function send() {
				var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

				var params = _ref.params;
				var qryStr = _ref.qryStr;
				var headers = _ref.headers;
				var body = _ref.body;

				var xhr = this.xhr = getXhr(this);

				var verb = this.verb;
				var url = (0, _resolveUrl2.default)(this, params, qryStr);

				headers = (0, _utils.copy)(this.baseHeaders, headers);
				body = prepareBody(body, verb);

				// open
				xhr.open(verb, url, this.async);

				// set headers
				(0, _utils.forIn)(headers, function (key, value) {
					xhr.setRequestHeader(key, value);
				});

				// send
				xhr.send(body);

				/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
				console.warn('Request:', [verb, url, body]);

				return this;
			}
		}, {
			key: 'abort',
			value: function abort() {
				this.xhr && this.xhr.abort();

				return this;
			}
		}, {
			key: 'dismiss',
			value: function dismiss() {
				this.abort();

				var xhr = this.xhr;

				xhr && (0, _utils.forIn)(this.events, function (eventName, eventObj) {
					xhr.removeEventListener(eventName, eventObj.wrapper);
				});

				this.xhr = null;
				this.events = {};

				return this;
			}
		}]);

		return AjaxServant;
	}();

	exports.default = AjaxServant;

/***/ },
/* 2 */
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var DEFAULT_CACHE_BREAKER_KEY = 'timestamp';
	var SUPPORTED_VERBS = ['GET', 'POST', 'PUT', 'DELETE'];
	var CONSTRUCTOR_SIGNATURE = 'new AjaxServant(verb, url, options)';
	var DOT_ON_SIGNATURE = 'AjaxServant.on(eventName, optionalContext, eventHandler)';
	var CONSTRUCTOR_INVALID_ARGS_ERR = 'AjaxServant requires two strings as first parmeters: an HTTP verb and a base-URL: ' + CONSTRUCTOR_SIGNATURE;
	var UNKNOWN_EVENT_ERR = 'An unknown XMLHttpRequest eventName: ' + DOT_ON_SIGNATURE;
	var CALLBACK_NOT_FUNCTION_ERR = 'eventHandler should be a function: ' + DOT_ON_SIGNATURE;

	var DEFAULT_OPTIONS = {
		timeout: 0,
		async: true,
		ctx: null,
		qryStr: null,
		headers: null,
		cacheBreaker: false
	};

	var EVENT_NAME = {
		ABORT: 'abort',
		TIMEOUT: 'timeout',
		PROGRESS: 'progress',
		ERROR: 'error',
		LOADSTART: 'loadstart',
		LOAD: 'load',
		LOADEND: 'loadend',
		READYSTATECHANGE: 'readystatechange'
	};

	exports.default = {
		DEFAULT_OPTIONS: DEFAULT_OPTIONS,
		DEFAULT_CACHE_BREAKER_KEY: DEFAULT_CACHE_BREAKER_KEY,
		SUPPORTED_VERBS: SUPPORTED_VERBS,
		CONSTRUCTOR_INVALID_ARGS_ERR: CONSTRUCTOR_INVALID_ARGS_ERR,
		UNKNOWN_EVENT_ERR: UNKNOWN_EVENT_ERR,
		CALLBACK_NOT_FUNCTION_ERR: CALLBACK_NOT_FUNCTION_ERR,
		EVENT_NAME: EVENT_NAME
	};

/***/ },
/* 3 */
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	exports.forIn = forIn;
	exports.stringify = stringify;
	exports.getType = getType;
	exports.copy = copy;
	function forIn(obj, cbFn) {
		if (!obj) {
			return;
		}

		var hasOwn = Object.hasOwnProperty;

		for (var key in obj) {
			if (hasOwn.call(obj, key)) {
				cbFn.call(obj, key, obj[key]);
			}
		}
	}

	function stringify(obj) {
		var ary = [];

		forIn(obj, function (key, value) {
			var esc_key = encodeURIComponent(key);
			var esc_val = encodeURIComponent(value);

			ary.push(esc_key + '=' + esc_val);
		});

		return ary.join('&');
	}

	function getType(x) {
		var type = typeof x === 'undefined' ? 'undefined' : _typeof(x);

		if (type === 'object') {
			type = Object.prototype.toString.call(x);
			type = type.substring(8, type.length - 1);
		}

		return type.toLowerCase();
	}

	function copy() {
		for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
			sources[_key] = arguments[_key];
		}

		return Object.assign.apply(Object, [{}].concat(sources));
	}

/***/ },
/* 4 */
/*!********************************!*\
  !*** ./src/format-response.js ***!
  \********************************/
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function (xhr) {
		var headersObj = getResponseHeaders(xhr);

		return {
			status: {
				code: xhr.status,
				text: xhr.statusText
			},
			headers: headersObj,
			body: xhr.responseText || xhr.responseXML
		};
	};

	function objectifyHeaders(headersStr) {
		var headersObj = {};
		var headersAry = headersStr.split(/\n/).filter(function (header) {
			return !!header;
		});

		headersAry.forEach(function (header) {
			var pair = header.split(/:\s?/);

			headersObj[pair[0]] = pair[1];
		});

		return headersObj;
	}

	function getResponseHeaders(xhr) {
		var headersStr = xhr.getAllResponseHeaders();

		return objectifyHeaders(headersStr);
	}

/***/ },
/* 5 */
/*!****************************!*\
  !*** ./src/resolve-url.js ***!
  \****************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function (servant, params, qryStr) {
		var baseUrl = normalizeBaseUrl(servant.baseUrl);

		params = stringifyUrlParams(params);
		qryStr = prepareQryStr(servant.baseQryStr, qryStr, servant.cacheBreaker);

		return baseUrl + params + qryStr;
	};

	var _utils = __webpack_require__(/*! ./utils.js */ 3);

	function removePreSlash(urlParamsStr) {
		if (urlParamsStr[0] === '/') {
			return urlParamsStr.substr(1);
		}
		return urlParamsStr;
	}

	function stringifyUrlParams(urlParams) {
		if (!urlParams || !urlParams.length) {
			return '';
		}

		if (typeof urlParams === 'string') {
			urlParams = removePreSlash(urlParams);
			return '/' + urlParams;
		}

		var params = urlParams.filter(function (param) {
			return param && typeof param === 'string';
		});

		if (!params.length) {
			return '';
		}

		return '/' + params.join('/');
	}

	function addCacheBreaker(cacheBreaker, qryStrObj) {
		if (cacheBreaker) {
			qryStrObj[cacheBreaker] = Date.now();
		}
	}

	function prepareQryStr(baseQryStrObj, dynaQryStrObj, cacheBreaker) {
		var qryStrObj = (0, _utils.copy)(baseQryStrObj, dynaQryStrObj);

		addCacheBreaker(cacheBreaker, qryStrObj);

		var queryString = (0, _utils.stringify)(qryStrObj);

		return queryString ? '?' + queryString : '';
	}

	function normalizeBaseUrl(baseUrl) {
		if (baseUrl === '/') {
			return '';
		}

		var len = baseUrl.length;

		if (baseUrl[len - 1] === '/') {
			return baseUrl.substr(0, len - 1);
		}

		return baseUrl;
	}

/***/ }
/******/ ])
});
;