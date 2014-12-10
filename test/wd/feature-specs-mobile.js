var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
var verbose = true;
var port = process.env.PORT || 3000;

// Add some custom 'waitFor' assertions
var util  = require('./util.js'); /* .asserter,  */

// this.browser and this.wd are injected by the grunt-wd-mocha plugin.
//var setup = require('./setup')(this); // setup details, such as logging and credentials

// Slimmage defaults
var slim = {
  widthStep: 160
};

var win_tollerance = 30; // = px; tolerance for padding/margin/window-frame
var explicit_wait = 3000;

// given->expected for the repeatable tests run
var pages = [
  {
    name: 'default',
    url:'http://127.0.0.1:'+port+'/test/feature-defaults.html',
    title: 'slimmage defaults'
  },

  {
    name: 'webp',
    url:'http://127.0.0.1:'+port+'/test/feature-webp.html',
    title: 'slimmage webp'
  },
];
    },

describe('slimmage', function() {
    var browser;
    var allPassed = true;
    var page; // Promise chain, once we have a loaded page

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

    // after(function(done) {
    //   if (browser.mode === 'saucelabs') {
    //     browser
    //       .quit()
    //       // .sauceJobStatus(allPassed) // TODO: This causes tests to hang afterwards....???
    //       .nodeify(done);
    //   } else {
    //     browser
    //       .quit()
    //       .nodeify(done);
    //   }
    // });

    //--------------------------------------------------------------------------
    //---      Run the tests, these are the entry points                     ---
    //--------------------------------------------------------------------------
    // Run tests on the two different pages, defaults and webp
    // testPage.call(this, pages[0]);
    // testPage.call(this, pages[1]);
    testMobile.call(this);

    //--------------------------------------------------------------------------
    //---       The following are only functions, and unless called          ---
    //---       ... from within a test, they do nothing.                     ---
    //--------------------------------------------------------------------------

    function testMobile() {
      describe('mobile',function() {

        before(function() {
          page = browser.setOrientation('PORTRAIT');
        });

        loadPage.call(this, pages[0]);
        testElements.call(this, values.mobile) ;
        testChangeOrientation.call(this);
        testElements.call(this, values.mobile) ;

      });
    }

    function testChangeOrientation (value) {
      describe('orientation',function() {

        before(function() {
          page = browser.setOrientation('LANDSCAPE');
        });

        it('should change to, ' + value ,function(done) {
          page
          .getOrientation()
          .should.eventually.be(value)
          .nodeify(done);
        });

      });
    }

    // ------------------------------------------------------------------------
    // Load page, test all
    // ------------------------------------------------------------------------
    function loadPage(details) {
      describe(details.name,function() {
        before(function(){
          page = browser
          .get(details.url);
        });

        it('should load the right page', function(done) {
          page
          .title()
          .should.become(details.title)
          .nodeify(done);
        });
      });
    }

    function testElements(vals){

      describe('fixedwidth_100', function() {

        it('src url should ratchet up to 160', function(done) {
          page
            .elementByClassName('fixedsize_100') // img.max_width == 100px
            .getAttribute('src')
            .should.become('http://z.zr.io/ri/1s.jpg?width=' + slim.widthStep)
            .nodeify(done);
        });

      });

      describe('fixedwidth_200', function() {
        it('src url should ratchet up to 320', function(done) {
          page
            .elementByClassName('fixedsize_200') // img.max_width == 200px
            .getAttribute('src')
            .should.become('http://z.zr.io/ri/1s.jpg?width=' + (slim.widthStep*2))
            .nodeify(done);
        });
      });

      describe('halfsize', function() {
        var half_window = vals.given.window_w/2;
        it('should be '+half_window+' +/-'+ win_tollerance +' px wide',function(done) {
          page
            .waitFor(util.widthToBeWithin('.halfsize', half_window, win_tollerance), explicit_wait)
            .waitFor(util.widthToBeWithin('.halfsize', half_window, win_tollerance), explicit_wait)
            .nodeify(done);
        });

        it('src url should ratchet up to '+ vals.expected.halfsize_w,function(done) {
          page
            .waitFor(util.asserter(function(t) {
              return t
                .elementByClassName('halfsize')
                .getAttribute('src')
                .should.become('http://z.zr.io/ri/1s.jpg?width=' + vals.expected.halfsize_w );
            }), explicit_wait) // repeat the above until success or timeout
            .nodeify(done);
        });
      });

    } // testElements
});
