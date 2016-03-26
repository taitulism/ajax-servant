var AjaxServant = (function (win, doc) {
	// private funcs
	function createXHR () {
		return new XMLHttpRequest();
	}

	// constructor
	var AjaxServant = function (verb, url) {
		this.xhr = createXHR();
	}

	// constructor prototype
	var proto = {
		constructor: AjaxServant
	};


	return AjaxServant;

})(window, document);