var expect      = require('chai').expect;
var AjaxServant = require('../dist/ajax-servant.bundle').default;

const DELAY = 250;
const CONSTRUCTOR_INVALID_ARGS_ERR = 'AjaxServant requires two strings';
const UNKNOWN_EVENT_ERR            = 'An unknown XMLHttpRequest event name:';
const CALLBACK_NOT_FUNCTION_ERR    = '"eventHandler" should be a function:';
const LOCAL_TEST_SERVER_URL        = 'http://localhost:8081/test';

const noopFn = function emptyHandler () {};
const log = console.log.bind(console);

function createServant(urlParam, options = {}) {
	var url = LOCAL_TEST_SERVER_URL + (urlParam || '');
	// console.log('URL:', url)
	return new AjaxServant('GET', url, options);
}

function getRequestObj (responseObj) {
	return JSON.parse(responseObj.body);
}

describe('AjaxServant', function() {
	describe('class', function() {
		it('should be a function', function() {
			expect(AjaxServant).to.be.a('function');
		});

		it('should have a .on() API method', function() {
			expect(AjaxServant.prototype.on).to.be.a('function');
		});

		it('should have a .send() API method', function() {
			expect(AjaxServant.prototype.send).to.be.a('function');
		});

		it('should have a .abort() API method', function() {
			expect(AjaxServant.prototype.abort).to.be.a('function');
		});

		it('should have a .dismiss() API method', function() {
			expect(AjaxServant.prototype.dismiss).to.be.a('function');
		});
	});

	describe('instance', function () {

		it('should throw an error when constructed with no arguments', function () {
			try {
				new AjaxServant();
			}
			catch (err) {
				expect(err.name).to.equal('TypeError');
				expect(err.message).to.contain(CONSTRUCTOR_INVALID_ARGS_ERR);
			}
		});

		it('should throw an error when constructed with one argument', function () {
			try {
				new AjaxServant('GET');
			}
			catch (err) {
				expect(err.name).to.equal('TypeError');
				expect(err.message).to.contain(CONSTRUCTOR_INVALID_ARGS_ERR);
			}
		});

		it('should throw an error when constructed with invalid arguments', function () {
			try {
				new AjaxServant('aaa', 'bbb');
			}
			catch (err) {
				expect(err.name).to.equal('TypeError');
				expect(err.message).to.contain(CONSTRUCTOR_INVALID_ARGS_ERR);
			}
		});

		it('should have a .on() API method', function () {
			const servant = createServant();
			expect(servant).to.have.property('on');
		});

		it('should have a .send() API method', function () {
			const servant = createServant();
			expect(servant).to.have.property('send');
		});

		it('should have a .abort() API method', function () {
			const servant = createServant();
			expect(servant).to.have.property('abort');
		});

		it('should have a .dismiss() API method', function () {
			const servant = createServant();
			expect(servant).to.have.property('dismiss');
		});

		describe('.on()', function () {
			it('should throw an error when called with invalid event name', function () {
				const servant =	createServant();

				try {
					servant.on('laQweDeLaQwe', noopFn);
				}
				catch (err) {
					expect(err.name).to.equal('TypeError');
					expect(err.message).to.contain(UNKNOWN_EVENT_ERR);
				}
			});

			it('should throw an error when called with invalid event handler', function () {
				const servant =	createServant();

				try {
					servant.on('load', 'not a function');
				}
				catch (err) {
					expect(err.name).to.equal('TypeError');
					expect(err.message).to.contain(CALLBACK_NOT_FUNCTION_ERR);
				}
			});

			it('should throw an error when called with invalid event handler with a context', function () {
				const servant =	createServant();

				try {
					servant.on('load', {'la': 'qwe'}, ['not','a','function']);
				}
				catch (err) {
					expect(err.name).to.equal('TypeError');
					expect(err.message).to.contain(CALLBACK_NOT_FUNCTION_ERR);
				}
			});

			it('should bind an event handler', function () {
				const servant = createServant();

				expect(servant.events).to.be.empty;

				servant.on('response', noopFn);

				expect(servant.events).not.to.be.empty;
				expect(servant.events.load).to.have.property('wrapper');
				expect(servant.events.load.wrapper).to.be.a('function');
				expect(servant.events.load.wrapper.name).to.equal('loadWrapper');

				servant.dismiss();
			});

			it('should bind only one native event handler', function () {
				const servant = createServant();

				servant.on('response', noopFn);
				servant.on('load', noopFn);

				expect(Object.keys(servant.events).length).to.equal(1);
				expect(servant.events).to.have.property('load');

				servant.dismiss();
			});

			describe('bind events', function () {
				it('should bind an event handler', function () {
					const servant = createServant();
					
					servant.on('response', noopFn);

					expect(servant.events).to.have.property('load');
					expect(servant.events.load).to.have.property('queue');
					expect(servant.events.load).to.have.property('wrapper');
					expect(servant.events.load.queue.length).to.equal(1);
					expect(servant.events.load.queue[0]).to.have.property('ctx');
					expect(servant.events.load.queue[0].ctx).to.be.a('null');
					expect(servant.events.load.queue[0].fn).to.equal(noopFn);
					expect(servant.events.load.wrapper).to.be.a('function');

					servant.dismiss();
				});

				it('should bind an event handler with a context', function () {
					const servant = createServant();
					const contextObj = {id: 'context'};
					
					servant.on('response', contextObj, noopFn);

					expect(servant.events).to.have.property('load');
					expect(servant.events.load).to.have.property('queue');
					expect(servant.events.load).to.have.property('wrapper');
					expect(servant.events.load.queue.length).to.equal(1);
					expect(servant.events.load.queue[0]).to.have.property('ctx');
					expect(servant.events.load.queue[0].ctx).to.equal(contextObj);
					expect(servant.events.load.queue[0].fn).to.equal(noopFn);
					expect(servant.events.load.wrapper).to.be.a('function');

					servant.dismiss();
				});
			});
		});

		describe('.send()', function () {
			it('should send a blank request when invoked with no arguments', function (done) {
				const servant = createServant('/blank');

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('blank');
					done();

					servant.dismiss();
				});

				servant.send();
			});

			describe('headers', function () {
				it('should send base headers to the server', function (done) {
					const servant = createServant('/request', {
						headers: {'X-Requested-With':'Ajax-Servant'}
					});

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.headers).to.have.property('x-requested-with');
						expect(requestObj.headers['x-requested-with']).to.equal('Ajax-Servant');
						done();

						servant.dismiss();
					});

					servant.send();
				});

				it('should send dynamic headers to the server', function (done) {
					const servant = createServant('/request');

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.headers).to.have.property('x-requested-with');
						expect(requestObj.headers['x-requested-with']).to.equal('Ajax-Servant');
						done();

						servant.dismiss();
					});

					servant.send({headers: {'X-Requested-With':'Ajax-Servant'}});
				});

				it('should send both base and dynamic headers', function (done) {
					const servant = createServant('/request', {
						headers: {'hdr-a':'str1'}
					});

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.headers).to.have.property('hdr-a');
						expect(requestObj.headers).to.have.property('hdr-b');
						expect(requestObj.headers['hdr-a']).to.equal('str1');
						expect(requestObj.headers['hdr-b']).to.equal('str2');
						done();

						servant.dismiss();
					});

					servant.send({headers: {'hdr-b':'str2'}});
				});
			});

			describe('params', function () {
				it('should send base URL params to the server', function (done) {
					const servant = createServant('/request/a/b/c');

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.params).to.eql(['a','b','c']);
						done();

						servant.dismiss();
					});

					servant.send();
				});

				it('should send dynamic URL params to the server', function (done) {
					const servant = createServant('/request');

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.params).to.eql(['a','b','c']);
						done();

						servant.dismiss();
					});

					servant.send({params: ['a','b','c']});
				});
			});

			describe('qryStr', function () {
				it('should send a base queryString to the server', function (done) {
					const qryStr = {'qry':'str'};
					const servant = createServant('/request', {qryStr});

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.qryStr).to.eql(qryStr);
						done();

						servant.dismiss();
					});

					servant.send();
				});

				it('should send a dynamic queryString to the server', function (done) {
					const qryStr = {'qry':'str'};
					const servant = createServant('/request');

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.qryStr).to.eql(qryStr);
						done();

						servant.dismiss();
					});

					servant.send({qryStr});
				});

				it('should send both base and dynamic queryString', function (done) {
					const qry1 = {'qry1':'str1'};
					const qry2 = {'qry2':'str2'};

					const servant = createServant('/request', {qryStr: qry1});

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.qryStr).to.eql(Object.assign({}, qry1, qry2));
						done();

						servant.dismiss();
					});

					servant.send({qryStr: qry2});
				});
			});

			describe('body', function () {
				it('should send a dynamic body to the server', function (done) {
					const HELLO_WORLD = 'hello world';
					const servant = new AjaxServant('POST', LOCAL_TEST_SERVER_URL);

					servant.on('response', function (responseObj) {
						expect(responseObj.body).to.equal(HELLO_WORLD);
						done();

						servant.dismiss();
					});

					servant.send({body: HELLO_WORLD});
				});
			});

			describe('cacheBreaker', function () {
				it('should send a cacheBreaker with no queryString', function (done) {
					const servant = createServant('/request', {
						cacheBreaker: 'mytimestamp'
					});

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.qryStr).to.have.property('mytimestamp');
						expect(Object.keys(requestObj.qryStr).length).to.equal(1);
						done();

						servant.dismiss();
					});

					servant.send();
				});

				it('should send a cacheBreaker with URL params', function (done) {
					const servant = createServant('/request', {
						cacheBreaker: 'mytimestamp'
					});

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.urlObj.pathname).to.equal('/test/request/a/b');
						expect(Object.keys(requestObj.qryStr).length).to.equal(1);
						expect(requestObj.qryStr).to.have.property('mytimestamp');
						expect(requestObj.qryStr['mytimestamp'].substr(0,4)).to.equal('1461');
						done();

						servant.dismiss();
					});

					servant.send({params: ['a','b']});
				});

				it('should send a cacheBreaker with base queryString', function (done) {
					const servant = createServant('/request', {
						cacheBreaker: true,
						qryStr: {qry:'str'}
					});

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.urlObj.pathname).to.equal('/test/request');
						expect(Object.keys(requestObj.qryStr).length).to.equal(2);
						expect(requestObj.qryStr).to.have.property('qry');
						expect(requestObj.qryStr).to.have.property('timestamp');
						expect(requestObj.qryStr['qry']).to.equal('str');
						expect(requestObj.qryStr['timestamp'].substr(0,4)).to.equal('1461');
						done();

						servant.dismiss();
					});

					servant.send();
				});

				it('should send a cacheBreaker with dynamic queryString', function (done) {
					const servant = createServant('/request', {
						cacheBreaker: true
					});

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.urlObj.pathname).to.equal('/test/request');
						expect(Object.keys(requestObj.qryStr).length).to.equal(2);
						expect(requestObj.qryStr).to.have.property('qry');
						expect(requestObj.qryStr).to.have.property('timestamp');
						expect(requestObj.qryStr['qry']).to.equal('str');
						expect(requestObj.qryStr['timestamp'].substr(0,4)).to.equal('1461');
						done();

						servant.dismiss();
					});

					servant.send({qryStr: {qry:'str'}});
				});

				it('should send a cacheBreaker with both base and dynamic queryString', function (done) {
					const servant = createServant('/blank', {
						cacheBreaker: true,
						qryStr: {qry1:'str1'}
					});

					servant.on('response', function (responseObj) {
						expect(responseObj.body).to.equal('blank');
						done();

						servant.dismiss();
					});

					servant.send({qryStr: {qry2:'str2'}});
				});

				it('should send a cacheBreaker with both base and dynamic queryString and URL params', function (done) {
					const servant = createServant('/request', {
						cacheBreaker: true,
						qryStr: {qry2: 'str2'}
					});

					servant.on('response', function (responseObj) {
						const requestObj = getRequestObj(responseObj);

						expect(requestObj.urlObj.pathname).to.equal('/test/request');
						expect(Object.keys(requestObj.qryStr).length).to.equal(3);
						expect(requestObj.qryStr).to.have.property('qry1');
						expect(requestObj.qryStr).to.have.property('qry2');
						expect(requestObj.qryStr).to.have.property('timestamp');
						expect(requestObj.qryStr['qry1']).to.equal('str1');
						expect(requestObj.qryStr['qry2']).to.equal('str2');
						expect(requestObj.qryStr['timestamp'].substr(0,4)).to.equal('1461');
						done();

						servant.dismiss();
					});

					servant.send({qryStr: {qry1:'str1'}});
				});
			});

			it('should cancel ongoing request when re-send', function (done) {
				const servant = createServant();

				servant
					.on('load', function (responseObj) {
						expect(responseObj.body).to.equal('y');
						done();

						servant.dismiss();
					})
					.send({params: ['x']})
					.send({params: ['y']})
				;
			});

			it.skip('can send a synchronous request', function (done) {
				if (window.Worker) {
					var myWorker = new Worker("worker.js");

					myWorker.onmessage = function(e) {
						const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL + '/test/sync', {async:false});

						let response = false;

						servant.on('load', function (responseObj) {
							response = responseObj.body;
						});

						servant.send();

						expect(response).to.be.equal(5);
						done();
					};	
					
					myWorker.postMessage('go');
				}
				else {
					console.log('XMLHttpRequest spec does not allow synchronous requests outside workers.')
					expect(true).to.be.ok;
				}
			});

			describe('trigger events', function () {
				it('should trigger 4 "readystatechange" events on a standard request', function (done) {
					const servant = createServant('/blank');
					let eventsLog = 0;

					servant.on('readystatechange', function (readyState) {
						eventsLog += readyState;
					});

					servant.send();

					setTimeout(function () {
						// 0+1+2+3+4 = 10 (readyState native values)
						expect(eventsLog).to.equal(10);
						done();

						servant.dismiss();
					}, DELAY);
				});

				it('should trigger ~3 "progress" events on a standard request', function (done) {
					const servant = createServant('/progress');
					let eventsLog = 0;

					servant.on('progress', function (/* servant, ajaxEvent */) {
                        /*console.log('progress:', ajaxEvent)
						if (ajaxEvent.lengthComputable) {
							var percentComplete = ajaxEvent.loaded / ajaxEvent.total * 100;
							console.log('    ', Math.round(percentComplete) + '%')
						}
						else {
							console.log('Unable to compute progress information since the total size is unknown')
						}*/

						eventsLog += 1;
					});

					servant.on('end', function () {
						// response is long and split into ~3 chunks
						expect(eventsLog).to.be.within(2,4);
						done();

						servant.dismiss();
					});

					servant.send();
				});

				it('should trigger a "timeout" event when response is delayed', function (done) {
					const servant = createServant('/delay/2000', {timeout: 1000});

					let timeoutWorks = null;
					servant
						.on('load', function () {
							timeoutWorks = false;
						})
						.on('timeout', function () {
							timeoutWorks = true;							
						})
						.send();

						setTimeout(function () {
							expect(timeoutWorks).to.be.ok;
							done();

							servant.dismiss();
						}, 1500);
				});

				it('should trigger "loadstart", "load", "loadend" events on a standard request', function (done) {
					const servant = createServant('/blank');
					let eventsLog = 'a';

					servant.on('loadstart', function () {
						eventsLog += 'b';
					});

					servant.on('load', function () {
						eventsLog += 'c';
					});

					servant.on('loadend', function () {
						eventsLog += 'd';
					});

					servant.send();

					setTimeout(function () {
						expect(eventsLog).to.equal('abcd');
						done();

						servant.dismiss();
					}, DELAY);
				});

				it('should trigger "loadstart", "load", "loadend" events on a standard request using aliases', function (done) {
					const servant = createServant('/blank');
					let eventsLog = 'a';

					servant.on('start', function () {
						eventsLog += 'b';
					});

					servant.on('response', function () {
						eventsLog += 'c';
					});

					servant.on('end', function () {
						eventsLog += 'd';
					});

					servant.send();

					setTimeout(function () {
						expect(eventsLog).to.equal('abcd');
						done();

						servant.dismiss();
					}, DELAY);
				});

				it('should trigger "loadstart", "abort", "loadend" events on an aborted request', function (done) {
					const servant = createServant();
					let eventsLog = 'a';

					servant.on('loadstart', function () {
						eventsLog += 'b';
					});

					servant.on('load', function () {
						eventsLog += 'X';
					});

					servant.on('abort', function () {
						eventsLog += 'c';
					});

					servant.on('loadend', function () {
						eventsLog += 'd';
					});

					servant.send();
					servant.abort();

					setTimeout(function () {
						expect(eventsLog).to.equal('abcd');
						done();

						servant.dismiss();
					}, DELAY);
				});

				it('should trigger "loadstart", "error", "loadend" events on an invalid request', function (done) {
					const servant = new AjaxServant('GET', 'http://BAD_URL.com');
					let eventsLog = 'a';

					servant.on('loadstart', function () {
						eventsLog += 'b';
					});

					servant.on('load', function (r) {
						eventsLog += 'X';
					});

					servant.on('error', function () {
						eventsLog += 'c';
					});

					servant.on('loadend', function () {
						eventsLog += 'd';
					});

					servant.send();

					setTimeout(function () {
						expect(eventsLog).to.equal('abcd');
						done();

						servant.dismiss();
					}, DELAY);
				});

				it('should run handlers with a default (global) context', function (done) {
					const servant = createServant('/blank');

					servant.on('load', function () {
						/*
							".self" is a window prop and is equal to the window.
							If this test fails it could be related to the test context (browser/node)
						*/
						expect(this).to.equal(self);
						done();

						servant.dismiss();
					});

					servant.send();
				});

				it('should run handlers with a base context', function (done) {
					const contextObj = {id: 'context'};
					const servant = createServant('/blank', {ctx:contextObj});

					servant.on('load', function () {
						expect(this.id).to.equal('context');
						done();

						servant.dismiss();
					});

					servant.send();
				});

				it('should run handlers with a dynamic context', function (done) {
					const servant = createServant('/blank');
					const contextObj = {id: 'context'};

					servant.on('load', contextObj, function () {
						expect(this.id).to.equal('context');
						done();

						servant.dismiss();
					});

					servant.send();
				});
			});
		});

		describe('.abort()', function () {
			it('should cancel the current request', function (done) {
				var currentState = 'init';
				const servant = createServant();

				servant.on('response', function () {
					currentState = 'Aborting failed. Response recieved.';
				});

				servant.on('abort', function () {
					currentState = 'Successfully aborted.';
				});

				servant.send();
				servant.abort();

				setTimeout(function () {
					expect(currentState).to.equal('Successfully aborted.');
					done();

					servant.dismiss();
				}, DELAY);
			});
		});

		describe('.dismiss()', function () {
			it('should unbind all event handlers', function () {
				const servant = createServant();

				expect(servant.events).to.be.empty;

				servant.on('response', noopFn);

				expect(servant.events).not.to.be.empty;

				servant.dismiss();

				expect(servant.events).to.be.empty;
			});

			it('should cancel the current request (triggers .abort())', function (done) {
				var currentState = 'init';

				const servant = createServant();

				servant.on('abort', function () {
					currentState = 'Successfully aborted.';
				});

				servant.send();
				servant.dismiss();

				setTimeout(function () {
					expect(currentState).to.equal('Successfully aborted.');
					done();
				}, DELAY);
			});

			it('should delete the servant\'s XHR', function () {
				const servant = createServant();
				servant.on('response', noopFn);
				servant.dismiss();
				expect(servant.xhr).to.equal(null);
			});
		});
	})
});
