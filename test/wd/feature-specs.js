/* global describe,before,afterEach*/

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
var verbose = true;
var test	= require('./test_functions.js');

// this.browser and this.wd are injected by the grunt-wd-mocha plugin.

describe('slimmage', function() {
    var allPassed = true;

    before(function() {
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
    });

    afterEach(function(done) {
        allPassed = allPassed && (this.currentTest.state === 'passed');
        done();
    });

    // after(function(done) {
    //   if (this.browser.mode === 'saucelabs') {
    //     this.browser
    //       .quit()
    //       // .sauceJobStatus(allPassed) // TODO: This causes tests to hang afterwards....???
    //       .nodeify(done);
    //   } else {
    //     this.browser
    //       .quit()
    //       .nodeify(done);
    //   }
    // });

    //--------------------------------------------------------------------------
    //---      Run the tests, these are the entry points                     ---
    //--------------------------------------------------------------------------
    // Run tests on the two different pages, defaults and webp
    // testMobile.call(this);
    test.desktop.call(this);

});
