// require("babel-register");

// import {expect} from 'chai';
// import AjaxServant from '../ajax-servant';

var expect = require('chai').expect;
var AjaxServant = require('../dist/ajax-servant.bundle').default;

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
		const CONSTRUCTOR_ERROR = 'AjaxServant requires two strings';

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

		it('should throw an error when constructed with no arguments', function () {
			try {
				new AjaxServant();
			}
			catch (err) {
				expect(err.name).to.equal('TypeError');
				expect(err.message).to.contain(CONSTRUCTOR_ERROR);
			}
		});

		it('should throw an error when constructed with one argument', function () {
			try {
				new AjaxServant('GET');
			}
			catch (err) {
				expect(err.name).to.equal('TypeError');
				expect(err.message).to.contain(CONSTRUCTOR_ERROR);
			}
		});

		it('should throw an error when constructed with invalid arguments', function () {
			try {
				new AjaxServant('aaa', 'bbb');
			}
			catch (err) {
				expect(err.name).to.equal('TypeError');
				expect(err.message).to.contain(CONSTRUCTOR_ERROR);
			}
		});

		describe('.on()', function () {
			it('should add an event handler', function () {
				const servant = new AjaxServant('GET', '/api');
				const handler = function handler () {};

				servant.on('response', handler);

				console.log(1, servant.events)
			});

			it('should add an event handler with context', function () {
				expect(true).to.be(false);
			});

			it('should add only one native(!) event handler', function () {
				expect(true).to.be(false);
			});

			it('should throw an error when called with invalid arguments', function () {
				expect(true).to.be(false);
			});
		});

		describe('.send()', function () {
			it('should add an event handler', function () {
				const servant = new AjaxServant('GET', '/api');
				const handler = function handler () {};

				servant.send();

				console.log(1, servant.events)
			});

			it('should add an event handler with context', function () {
				expect(true).to.be(false);
			});

			it('should send body to the server (same domain)', function () {
				expect(true).to.be(false);
			});

			it('should send queryString to the server (same domain)', function () {
				expect(true).to.be(false);
			});

			it('should send headers to the server (same domain)', function () {
				expect(true).to.be(false);
			});

			it('should send URL params to the server (same domain)', function () {
				expect(true).to.be(false);
			});
		});

		describe('.abort()', function () {
			it('should add an event handler', function () {
				const servant = new AjaxServant('GET', '/api');
				const handler = function handler () {};

				servant.on('response', handler);
				servant.send();
				servant.abort('response', handler);

				console.log(1, servant.events)
			});

			it('should add an event handler with context', function () {
				expect(true).to.be(false);
			});
		});

		describe('.dismiss()', function () {
			it('should add an event handler', function () {
				const servant = new AjaxServant('GET', '/api');
				const handler = function handler () {};

				servant.dismiss('response', handler);

				console.log(1, servant.events)
			});

			it('should abort a running server', function () {
				expect(true).to.be(false);
			});

			it('should unbind all event handlers', function () {
				expect(true).to.be(false);
			});

			it('should delete the servant\'s XHR', function () {
				expect(true).to.be(false);
			});
		});
	})
});
























