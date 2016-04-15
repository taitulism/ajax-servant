// require("babel-register");

// import {expect} from 'chai';
// import AjaxServant from '../ajax-servant';

var expect      = require('chai').expect;
var AjaxServant = require('../dist/ajax-servant.bundle').default;

const CONSTRUCTOR_INVALID_ARGS_ERR = 'AjaxServant requires two strings';
const UNKNOWN_EVENT_ERR            = 'An unknown XMLHttpRequest eventName:';
const CALLBACK_NOT_FUNCTION_ERR    = 'eventHandler should be a function:';
const LOCAL_TEST_SERVER_URL        = 'http://localhost:8081/test';

const noopFn = function emptyHandler () {};

describe('AjaxServant', function() {
	describe('class', function() {
		it('should be a function', function() {
			expect(AjaxServant).to.be.a('function');
		});

		it('should have a .on() API method', function() {
			expect(AjaxServant.prototype.on).to.be.an('function');
		});

		it('should have a .send() API method', function() {
			expect(AjaxServant.prototype.send).to.be.an('function');
		});

		it('should have a .abort() API method', function() {
			expect(AjaxServant.prototype.abort).to.be.an('function');
		});

		it('should have a .dismiss() API method', function() {
			expect(AjaxServant.prototype.dismiss).to.be.an('function');
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

		it('should have no events attached when created', function () {
			const servant = new AjaxServant('GET', '/');
			// expect(servant).to.have.property('on');
		});

		it('should have a .on() API method', function () {
			const servant = new AjaxServant('GET', '/');
			expect(servant).to.have.property('on');
		});

		it('should have a .send() API method', function () {
			const servant = new AjaxServant('GET', '/');
			expect(servant).to.have.property('send');
		});

		it('should have a .abort() API method', function () {
			const servant = new AjaxServant('GET', '/');
			expect(servant).to.have.property('abort');
		});

		it('should have a .dismiss() API method', function () {
			const servant = new AjaxServant('GET', '/');
			expect(servant).to.have.property('dismiss');
		});

		describe('.on()', function () {
			it('should throw an error when called with invalid event name', function () {
				const servant =	new AjaxServant('GET', '/api');

				try {
					servant.on('laQweDeLaQwe', noopFn);
				}
				catch (err) {
					expect(err.name).to.equal('TypeError');
					expect(err.message).to.contain(UNKNOWN_EVENT_ERR);
				}
			});

			it('should throw an error when called with invalid event handler', function () {
				const servant =	new AjaxServant('GET', '/api');

				try {
					servant.on('load', 'not a function');
				}
				catch (err) {
					expect(err.name).to.equal('TypeError');
					expect(err.message).to.contain(CALLBACK_NOT_FUNCTION_ERR);
				}
			});

			it('should throw an error when called with invalid event handler with a context', function () {
				const servant =	new AjaxServant('GET', '/api');

				try {
					servant.on('load', {'la': 'qwe'}, ['not','a','function']);
				}
				catch (err) {
					expect(err.name).to.equal('TypeError');
					expect(err.message).to.contain(CALLBACK_NOT_FUNCTION_ERR);
				}
			});

			it('should add an event handler', function () {
				const servant = new AjaxServant('GET', '/api');

				expect(servant.events).to.be.empty;

				servant.on('response', noopFn);

				expect(servant.events).not.to.be.empty;
			});

			it('should add only one native event handler', function () {
				const servant = new AjaxServant('GET', '/api');

				servant.on('response', noopFn);
				servant.on('load', noopFn);

				expect(Object.keys(servant.events).length).to.equal(1);
				expect(servant.events).to.have.property('load');
			});

			describe('bind events', function () {
				it('should add an event handler', function () {
					const servant = new AjaxServant('GET', '/api');
					
					servant.on('response', noopFn);

					expect(servant.events).to.have.property('load');
					expect(servant.events.load).to.have.property('queue');
					expect(servant.events.load).to.have.property('wrapper');
					expect(servant.events.load.queue.length).to.equal(1);
					expect(servant.events.load.queue[0]).to.have.property('ctx');
					expect(servant.events.load.queue[0].ctx).to.be.a('null');
					expect(servant.events.load.queue[0].fn).to.equal(noopFn);
					expect(servant.events.load.wrapper).to.be.a('function');
				});

				it('should add an event handler with a context', function () {
					const servant = new AjaxServant('GET', '/api');
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
				});
			});
		});


		describe('.abort()', function () {
			it('should cancel the current request', function (done) {
				var currentState = 'init';
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL);

				servant.on('response', function () {
					currentState = 'Aborting failed. Response recieved.';
				});

				servant.on('abort', function () {
					currentState = 'Successfully aborted.';
				});

				setTimeout(function () {
					expect(currentState).to.equal('Successfully aborted.');
					done();
				}, 500);

				servant.send();
				servant.abort();
			});
		});

		describe('.send()', function () {
			it('should send base data to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL);

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('GET');
					done();
				});

				servant.send();
			});

			it('should send base queryString to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL, {qryStr: {'qry':'str'}});

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('?qry=str');
					done();
				});

				servant.send();
			});

			it('should send base headers to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL, {headers: {'X-Requested-With':'Ajax-Servant'}});

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('Ajax-Servant');
					done();
				});

				servant.send();
			});

			it('should send base URL params to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL + '/a/b/c');

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('/a/b/c');
					done();
				});

				servant.send();
			});

			it('should send dynamic body to the server', function (done) {
				const OK_MESSAGE = 'hello world';
				const servant = new AjaxServant('POST', LOCAL_TEST_SERVER_URL);

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal(OK_MESSAGE);
					done();
				});

				servant.send({body: OK_MESSAGE});
			});

			it('should send dynamic queryString to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL);

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('?qry=str');
					done();
				});

				servant.send({qryStr: {'qry':'str'}});
			});

			it('should send dynamic headers to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL);

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('Ajax-Servant');
					done();
				});

				servant.send({headers: {'X-Requested-With':'Ajax-Servant'}});
			});

			it('should send dynamic URL params to the server', function (done) {
				const servant = new AjaxServant('GET', LOCAL_TEST_SERVER_URL);

				servant.on('response', function (responseObj) {
					expect(responseObj.body).to.equal('/a/b/c');
					done();
				});

				servant.send({params: ['a','b','c']});
			});
		});

		describe.skip('.dismiss()', function () {
			it('should add an event handler', function () {
				const servant = new AjaxServant('GET', '/api');

				servant.dismiss('response', noopFn);
			});

			it('should abort a running server', function () {
				expect(true).to.equal(false);
			});

			it('should unbind all event handlers', function () {
				expect(true).to.equal(false);
			});

			it('should delete the servant\'s XHR', function () {
				expect(true).to.equal(false);
			});
		});

		describe('trigger events', function () {
			it.skip('should. really.', function () {

			});
		});
	})
});
























