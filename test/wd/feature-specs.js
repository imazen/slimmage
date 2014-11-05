var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
var verbose = true;

// this.browser and this.wd are injected by the grunt-wd-mocha plugin.
//var setup = require('./setup')(this); // setup details, such as logging and credentials

var slim = { // Slimmage defaults
  widthStep: 160
}

describe('slimmage', function() {
    var browser;
    var allPassed = true;

    before(function() {
      browser = this.browser; // browser only gets injected here, once tests start...
      // enables chai assertion chaining
      chaiAsPromised.transferPromiseness = this.wd.transferPromiseness;
      // Add logging if verbose
      if(verbose){
        // optional logging
        browser.on('status', function(info) {
          console.log(info.cyan);
        });
        browser.on('command', function(meth, path, data) {
          console.log(' > ' + meth.yellow, path.grey, data || '');
        });
      }
    });

    afterEach(function(done) {
        allPassed = allPassed && (this.currentTest.state === 'passed');
        done();
    });

    after(function(done) {
      if (browser.mode === 'saucelabs') {
        browser
          .quit()
          .sauceJobStatus(allPassed)
          .nodeify(done)
      } else {
        browser
          .quit()
          .nodeify(done)
      }
    });

    // Begin actual tests...
    describe('with defaults', function(done) {
      var page; // Promise chain, once we have a loaded page
      before(function(){
        page = browser.get('http://127.0.0.1:9999/test/feature-defaults.html')
      })
      after(function(){
        page.nodeify(done) // describe is finished at this point
      })

      it('should load without errors', function(done) {
          page
            .title()
            .should.become('slimmage defaults')
          .nodeify(done)
      });

      describe('src url', function() {
        it('should ratchet up to 160', function(done) {
            page
              .elementByClassName('fixedsize_100') // img.max_width == 100
              .getAttribute('src')
              .should.become('http://z.zr.io/ri/1s.jpg?width=' + slim.widthStep)
            .nodeify(done)
        });
        it('should ratchet up to 320', function(done) {
            page
              .elementByClassName('fixedsize_200') // img.max_width == 200
              .getAttribute('src')
              .should.become('http://z.zr.io/ri/1s.jpg?width=' + (slim.widthStep*2))
            .nodeify(done)
        });
      });
    });
});
