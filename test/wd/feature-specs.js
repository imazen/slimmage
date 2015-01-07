/* global describe,before,it*/

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
var verbose = true;
var test	= require('./test_functions.js');

// this.browser and this.wd are injected by the grunt-wd-mocha plugin.

describe('slimmage', function() {
    var tests_to_call;

    before(function(done) {
      // enables chai assertion chaining
      chaiAsPromised.transferPromiseness = this.wd.transferPromiseness;
      // Add logging if verbose
      if(verbose){
        // optional logging
        this.browser.on('status', function(info) {
          console.log(info.cyan);
        });
        this.browser.on('command', function(meth, path, data) {
          console.log(' > ' + meth.yellow, path.grey, data || '');
        });
      }


      this.browser
      .sessionCapabilities()
      .then(function(caps) {

        // Note we use the browserName attr for android, as it doesn't seem to have a 'deviceName' attr
        if (/iphone/i.test(caps.deviceName) || /android/i.test(caps.browserName)) {

          console.log('This is an iPhone or an Android phone');
          tests_to_call = test.mobile;

        } else if (/internet explorer/i.test(caps.browserName) && parseFloat(caps.version) <= 8.0) {

          console.log('This is Internet Explorer < 8.0');
          tests_to_call = test.desktop;

        } else {

          console.log('Run default tests...desktop');
          tests_to_call = test.desktop;

        }
      })
      .nodeify(done);

    });

    //--------------------------------------------------------------------------
    //---  Run the tests, this is the entry point as defined in 'before'     ---
    //--------------------------------------------------------------------------

    it('tests',function() {
      tests_to_call.call(this);
    });

  }); // describe slimmage
