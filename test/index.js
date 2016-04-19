var expect      = require('chai').expect;
var AjaxServant = require('../dist/ajax-servant.bundle').default;

const CONSTRUCTOR_INVALID_ARGS_ERR = 'AjaxServant requires two strings';
const UNKNOWN_EVENT_ERR            = 'An unknown XMLHttpRequest eventName:';
const CALLBACK_NOT_FUNCTION_ERR    = 'eventHandler should be a function:';
const LOCAL_TEST_SERVER_URL        = 'http://localhost:8081/test';

const noopFn = function emptyHandler () {};

function createServant(VERB) {
	return new AjaxServant(VERB, LOCAL_TEST_SERVER_URL);
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
			const servant = createServant('GET');
			expect(servant).to.have.property('on');
		});

		it('should have a .send() API method', function () {
			const servant = createServant('GET');
			expect(servant).to.have.property('send');
		});

		it('should have a .abort() API method', function () {
			const servant = createServant('GET');
			expect(servant).to.have.property('abort');
		});

		it('should have a .dismiss() API method', function () {
			const servant = createServant('GET');
			expect(servant).to.have.property('dismiss');
		});

		describe('.on()', function () {
			it('should throw an error when called with invalid event name', function () {
				const servant =	createServant('GET');

				try {
					servant.on('laQweDeLaQwe', noopFn);
				}
				catch (err) {
					expect(err.name).to.equal('TypeError');
					expect(err.message).to.contain(UNKNOWN_EVENT_ERR);
				}
			});

			it('should throw an error when called with invalid event handler', function () {
				const servant =	createServant('GET');

				try {
					servant.on('load', 'not a function');
				}
				catch (err) {
					expect(err.name).to.equal('TypeError');
					expect(err.message).to.contain(CALLBACK_NOT_FUNCTION_ERR);
				}
			});

			it('should throw an error when called with invalid event handler with a context', function () {
				const servant =	createServant('GET');

				try {
					servant.on('load', {'la': 'qwe'}, ['not','a','function']);
				}
				catch (err) {
					expect(err.name).to.equal('TypeError');
					expect(err.message).to.contain(CALLBACK_NOT_FUNCTION_ERR);
				}
			});

			it('should bind an event handler', function () {
				const servant = createServant('GET');

				expect(servant.events).to.be.empty;

				servant.on('response', noopFn);

				expect(servant.events).not.to.be.empty;
				expect(servant.events.load).to.have.property('wrapper');
				expect(servant.events.load.wrapper).to.be.a('function');
				expect(servant.events.load.wrapper.name).to.equal('defaultWrapper');

				servant.dismiss();
			});

			it('should bind only one native event handler', function () {
				const servant = createServant('GET');

				servant.on('response', noopFn);
				servant.on('load', noopFn);

				expect(Object.keys(servant.events).length).to.equal(1);
				expect(servant.events).to.have.property('load');

				servant.dismiss();
			});

			describe('bind events', function () {
				it('should bind an event handler', function () {
					const servant = createServant('GET');
					
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
					const servant = createServant('GET');
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

				it.skip('should bind multiple same event to assert getDefaultWrapper queue');
			});
		});

		describe('.send()', function () {
			it('should send base data to the server', function (done) {
				const servant = createServant('GET');

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('GET');
					done();
					servant.dismiss();
				});

				servant.send();
			});

			it('should send a base queryString to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL, {qryStr: {'qry':'str'}});

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('?qry=str');
					done();
					servant.dismiss();
				});

				servant.send();
			});

			it('should send base headers to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL, {headers: {'X-Requested-With':'Ajax-Servant'}});

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('Ajax-Servant');
					done();
					servant.dismiss();
				});

				servant.send();
			});

			it('should send base URL params to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL + '/a/b/c');

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('/a/b/c');
					done();
					servant.dismiss();
				});

				servant.send();
			});

			it('should send a dynamic body to the server', function (done) {
				const OK_MESSAGE = 'hello world';
				const servant = createServant('POST');

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal(OK_MESSAGE);
					done();
					servant.dismiss();
				});

				servant.send({body: OK_MESSAGE});
			});

			it('should send a dynamic queryString to the server', function (done) {
				const servant = createServant('GET');

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('?qry=str');
					done();
					servant.dismiss();
				});

				servant.send({qryStr: {'qry':'str'}});
			});

			it('should send dynamic headers to the server', function (done) {
				const servant = createServant('GET');

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('Ajax-Servant');
					done();
					servant.dismiss();
				});

				servant.send({headers: {'X-Requested-With':'Ajax-Servant'}});
			});

			it('should send dynamic URL params to the server', function (done) {
				const servant = createServant('GET');

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('/a/b/c');
					done();
					servant.dismiss();
				});

				servant.send({params: ['a','b','c']});
			});

			it.skip('should send multiple with base & dynam')

			describe('trigger events', function () {
				it('should trigger 4 "readystatechange" events on a standard request', function (done) {
					const servant = createServant('GET');
					let eventsLog = 0;

					servant.on('readystatechange', function (readyState) {
						eventsLog += readyState;
					});

					servant.send();

					setTimeout(function () {
						// 0+1+2+3+4 (readyState native values)
						expect(eventsLog).to.equal(10);
						done();
						servant.dismiss();
					}, 500);
				});

				it('should trigger "loadstart", "load", "loadend" events on a standard request', function (done) {
					const servant = createServant('GET');
					let eventsLog = 'a';

					servant.on('loadstart', function (responseObj) {
						eventsLog += 'b';
					});

					servant.on('load', function (responseObj) {
						eventsLog += 'c';
					});

					servant.on('loadend', function (responseObj) {
						eventsLog += 'd';
					});

					servant.send();

					setTimeout(function () {
						expect(eventsLog).to.equal('abcd');
						done();
						servant.dismiss();
					}, 500);
				});

				it('should trigger "loadstart", "load", "loadend" events on a standard request using aliases', function (done) {
					const servant = createServant('GET');
					let eventsLog = 'a';

					servant.on('start', function (responseObj) {
						eventsLog += 'b';
					});

					servant.on('response', function (responseObj) {
						eventsLog += 'c';
					});

					servant.on('end', function (responseObj) {
						eventsLog += 'd';
					});

					servant.send();

					setTimeout(function () {
						expect(eventsLog).to.equal('abcd');
						done();
						servant.dismiss();
					}, 500);
				});

				it('should trigger "loadstart", "abort", "loadend" events on an aborted request', function (done) {
					const servant = createServant('GET');
					let eventsLog = 'a';

					servant.on('loadstart', function (responseObj) {
						eventsLog += 'b';
					});

					servant.on('load', function (responseObj) {
						eventsLog += 'X';
					});

					servant.on('abort', function (responseObj) {
						eventsLog += 'c';
					});

					servant.on('loadend', function (responseObj) {
						eventsLog += 'd';
					});

					servant.send();
					servant.abort();

					setTimeout(function () {
						expect(eventsLog).to.equal('abcd');
						done();
						servant.dismiss();
					}, 500);
				});

				it('should trigger "loadstart", "error", "loadend" events on an invalid request', function (done) {
					const servant = new AjaxServant('GET', 'http://BAD_URL.com');
					let eventsLog = 'a';

					servant.on('loadstart', function (responseObj) {
						eventsLog += 'b';
					});

					servant.on('load', function (responseObj) {
						eventsLog += 'X';
					});

					servant.on('error', function (responseObj) {
						eventsLog += 'c';
					});

					servant.on('loadend', function (responseObj) {
						eventsLog += 'd';
					});

					servant.send();

					setTimeout(function () {
						expect(eventsLog).to.equal('abcd');
						done();
						servant.dismiss();
					}, 500);
				});

				it('should run handlers with a default (global) context', function (done) {
					const servant = createServant('GET');

					servant.on('load', function (responseObj) {
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
					const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL, {ctx:contextObj});

					servant.on('load', function (responseObj) {
						expect(this.id).to.equal('context');
						done();
						servant.dismiss();
					});

					servant.send();
				});

				it('should run handlers with a dynamic context', function (done) {
					const servant = createServant('GET');
					const contextObj = {id: 'context'};

					servant.on('load', contextObj, function (responseObj) {
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
				const servant = createServant('GET');

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
				}, 500);
			});
		});

		describe('.dismiss()', function () {
			it('should unbind all event handlers', function () {
				const servant = createServant('GET');

				expect(servant.events).to.be.empty;

				servant.on('response', noopFn);

				expect(servant.events).not.to.be.empty;

				servant.dismiss();

				expect(servant.events).to.be.empty;
			});

			it('should cancel the current request (triggers .abort())', function (done) {
				var currentState = 'init';

				const servant = createServant('GET');

				servant.on('abort', function () {
					currentState = 'Successfully aborted.';
				});

				servant.send();
				servant.dismiss();

				setTimeout(function () {
					expect(currentState).to.equal('Successfully aborted.');
					done();
				}, 500);
			});

			it('should delete the servant\'s XHR', function () {
				const servant = createServant('GET');
				servant.on('response', noopFn);
				servant.dismiss();
				expect(servant.xhr).to.equal(null);
			});
		});
	})
});
