require("babel-register");

const expect = require('chai').expect;

// const AjaxServant = require('../ajax-servant').default;
import AjaxServant from '../ajax-servant';

describe('AjaxServant', function() {
	describe('AjaxServant Class', function() {
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

		it('should have a .dismiss() API method', function() {
			expect(AjaxServant.prototype.dismiss).to.be.an('function');
		});
	});
});