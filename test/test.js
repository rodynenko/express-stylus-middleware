'use strict';

var express = require('express'),
		request = require('supertest'),
		stylus = require('../');

describe('Express-stylus middleware', function() {
	beforeEach(function() {
		this.app = express();
		this.app.use(stylus(__dirname + '/fictures'));
	});

	it('should return valid CSS', function(done) {
		request(this.app)
			.get('/valid.css')
			.expect('Content-Type', /css/)
			.expect(/color: #dc143c/)
			.expect(200)
			.end(function(err, res) {
					if (err) {
						done.fail(err);
					} else {
						done();
					}
				});
	});
});
