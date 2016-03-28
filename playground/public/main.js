// AjaxServant

function log (title, result) {
	console.log(title, result);
}

function runTests () {
	log('running tests...', '');

	testMain();
	testApi();
}

function testMain () {
	if (typeof AjaxServant !== 'function') return false;

	const instance = createSimple();

	log('whois', instance.whois === 'AjaxServant')
}

function testApi () {
	const servant = createSimple();

	log('has prop .verb', servant.verb === 'GET');
	log('has prop .url', servant.url === '/');
	log('has prop .async', servant.async === true);
	log('has prop .xhr',            typeof servant.xhr        === 'object' && servant.xhr instanceof XMLHttpRequest)
	log('has method .config()',     typeof servant.config     === 'function');
	log('has method .open()',       typeof servant.open       === 'function');
	log('has method .setHeaders()', typeof servant.setHeaders === 'function');
	log('has method .setHeader()',  typeof servant.setHeader  === 'function');
	log('has method .send()',       typeof servant.send       === 'function');
	log('has method .abort()',      typeof servant.abort      === 'function');
	log('has method .send()',       typeof servant.send       === 'function');
	log('has method .dismiss()',    typeof servant.dismiss    === 'function');
}

function createSimple() {
	return new AjaxServant();
}
