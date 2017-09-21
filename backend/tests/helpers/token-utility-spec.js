'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var sinon = require('sinon');
var tokenUtility = require('../../helpers/token-utility');
var should = chai.should();
var expect = chai.expect;



describe("Token utitlity",function() {

  it("should generate a 10 digits token",function() {
    var token = tokenUtility.generateToken();
    var expectedLength = 10;
    expect(token.length).to.equal(expectedLength);
  });

  it("should generate a (n) digits token",function() {
    var tokenLength = 10;
    var token = tokenUtility.generateToken(tokenLength);
    var expectedLength = 10;
    expect(token.length).to.equal(expectedLength);
  });
});
