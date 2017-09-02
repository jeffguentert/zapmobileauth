//"use strict";

// Pull the API Key from enviromental variable
// Which is embeded in travis-ci
var apikey = process.env.APIKEY;
var domain = process.env.DOMAIN;
if(process.env.APIKEY === undefined || process.env.DOMAIN === undefined){
  console.log("No API key or domain");
  process.exit(1);
}

// Require all the modules
var chai = require('chai');
chai.should();

// true bool for preview, why would you test in production?
var OktaAPI = require('../index.js');
var okta = new OktaAPI(apikey, domain, true);


describe('okta users', function() {
  it('should do something', function (done){
    var x = true;
    x.should.be.true;
    done();
  });
});
