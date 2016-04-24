// method Signatures
const CONSTRUCTOR_SIGNATURE = 'new AjaxServant(verb, url, options)';
const ON_SIGNATURE          = 'servant.on(eventName, optionalContext, eventHandler)';
const ON_STATUS_SIGNATURE   = 'servant.onStatus(statusCode, optionalContext, eventHandler)';

// error messages
const CONSTRUCTOR_INVALID_ARGS_ERR = 'AjaxServant requires two strings as first parmeters: an HTTP verb and a base-URL: ' + CONSTRUCTOR_SIGNATURE;
const UNKNOWN_EVENT_ERR            = 'An unknown XMLHttpRequest event name: ' + ON_SIGNATURE;
const CALLBACK_NOT_FUNCTION_ERR    = '"eventHandler" should be a function: ' + ON_SIGNATURE;
const INVALID_STATUS_CODE_ERR      = '"statusCode" should be a number: ' + ON_STATUS_SIGNATURE;

// 
const DEFAULT_CACHE_BREAKER_KEY = 'timestamp';
const SUPPORTED_VERBS           = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'];
const DEFAULT_OPTIONS = {
	timeout : 0,
	async   : true,
	ctx     : null,
	qryStr  : null,
	headers : null,
	cacheBreaker : false
};

const EVENT_NAME = {
	ABORT            : 'abort',
	TIMEOUT          : 'timeout',
	PROGRESS         : 'progress',
	ERROR            : 'error',
	LOADSTART        : 'loadstart',
	LOAD             : 'load',
	LOADEND          : 'loadend',
	READYSTATECHANGE : 'readystatechange'
};


export default {
	DEFAULT_OPTIONS,
	DEFAULT_CACHE_BREAKER_KEY,
	SUPPORTED_VERBS,
	CONSTRUCTOR_INVALID_ARGS_ERR,
	INVALID_STATUS_CODE_ERR,
	UNKNOWN_EVENT_ERR,
	CALLBACK_NOT_FUNCTION_ERR,
	EVENT_NAME
};