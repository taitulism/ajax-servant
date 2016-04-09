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

		// describe('.on()', function () {
		// 	it('should add an event handler', function () {
		// 		const servant = new AjaxServant('GET', '/api');
		// 		const handler = function handler () {};

		// 		servant.on('reposnse', handler);

		// 		console.log(servant.events)
		// 	});
		// });
	})
});