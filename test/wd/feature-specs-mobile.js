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

function calc_nearest_slim_step(val) {
  return val - (val % slim.widthStep) + slim.widthStep;
}

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

  // NOTE: this is not the larger 'plus' version
var mobiles = {
  iphone6: {
    devicePixelRatio: 2,
    portrait: {
      halfsize: 180,
      // first factor in dpr, then round up to nearest step
      halfsize_src: 480, // 180 * 2 = 360, nearest step (multiple of 160) is 480.
    }
  }
};

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
        testElements.call(this, mobiles.iphone6.portrait) ;
        testChangeOrientation.call(this, 'LANDSCAPE');
        // testElements.call(this, mobiles.iphone6) ;

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
          .should.become(value)
          .nodeify(done);
        });

      });
    }

    // ------------------------------------------------------------------------
    // Load page, test all
    // ------------------------------------------------------------------------
    function loadPage(page_details) {
      describe(page_details.name,function() {
        before(function(){
          page = browser
          .get(page_details.url);
        });

        it('should load the right page', function(done) {
          page
          .title()
          .should.become(page_details.title)
          .nodeify(done);
        });
      });
    }

    function testElements(vals){
      var dpr = vals.devicePixelRatio || 1;
      var fix100_src = calc_nearest_slim_step(dpr * 100);
      var fix200_src = calc_nearest_slim_step(dpr * 200);

      describe('fixedwidth_100', function() {

        it('src url should ratchet up to ' + fix100_src , function(done) {
          page
            .elementByClassName('fixedsize_100') // img.max_width == 100px
            .getAttribute('src')
            .should.become('http://z.zr.io/ri/1s.jpg?width=' + fix100_src)
            .nodeify(done);
        });

      });

      describe('fixedwidth_200', function() {
        it('src url should ratchet up to ' + fix200_src, function(done) {
          page
            .elementByClassName('fixedsize_200') // img.max_width == 200px
            .getAttribute('src')
            .should.become('http://z.zr.io/ri/1s.jpg?width=' + fix200_src)
            .nodeify(done);
        });
      });

      describe('halfsize', function() {
        it('should be '+ vals.halfsize +' +/-'+ win_tollerance +' px wide',function(done) {
          page
            .waitFor(util.widthToBeWithin('.halfsize',
                vals.halfsize,
                win_tollerance
              ), explicit_wait)
            .nodeify(done);
        });

        it('src url should ratchet up to '+ vals.halfsize_src ,function(done) {
          page
            .waitFor(util.asserter(function(t) {
              return t
                .elementByClassName('halfsize')
                .getAttribute('src')
                .should.become('http://z.zr.io/ri/1s.jpg?width=' + vals.halfsize_src );
            }), explicit_wait) // repeat the above until success or timeout
            .nodeify(done);
        });
      });

    } // testElements
});
