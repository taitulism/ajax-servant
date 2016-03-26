// AjaxServant

function run () {
	let test = checkExternalAPI();

	alert(test);
}

function checkExternalAPI () {
	if (typeof AjaxServant !== 'function') return false;

	const instance = new AjaxServant();
	
	return typeof instance.xhr === 'object';
}