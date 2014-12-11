/* global describe,before,it,afterEach*/

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
var pages = {
  normal: {
    name: 'default',
    url:'http://127.0.0.1:'+port+'/test/feature-defaults.html',
    title: 'slimmage defaults'
  },

  webp: {
    name: 'webp',
    url:'http://127.0.0.1:'+port+'/test/feature-webp.html',
    title: 'slimmage webp'
  },
};

  // NOTE: this is not the larger 'plus' version
var desktop = {

    medium: {
      devicePixelRatio: 1,
      size: {
        width: 800,
        height: 600
      },
      halfsize: 400, // 1334/4
      halfsize_src: calc_nearest_slim_step(400)
    },

    large: {
      devicePixelRatio: 1,
      size: {
        width: 1024,
        height: 768
      },

      halfsize: 512,
      halfsize_src: calc_nearest_slim_step(512)
    }

};

var mobiles = {
  iphone6: {
    landscape: {
      devicePixelRatio: 2,
      halfsize: 333, // 1334/4
      // first factor in dpr, then round up to nearest step
      halfsize_src: calc_nearest_slim_step(333 * 2)
    },
    portrait: {
      devicePixelRatio: 2,
      halfsize: 180,
      // first factor in dpr, then round up to nearest step
      halfsize_src: calc_nearest_slim_step(180 * 2)
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
    // testMobile.call(this);
    testDesktop.call(this);

    //--------------------------------------------------------------------------
    //---       The following are only functions, and unless called          ---
    //---       ... from within a test, they do nothing.                     ---
    //--------------------------------------------------------------------------

    //--------------------------------------------------------------------------
    //---    High level test suites                                          ---
    //--------------------------------------------------------------------------

    function testDesktop() {
      describe('desktop',function() {

        testChangeWindowSize.call(this, desktop.medium.size );
        testLoadPage.call(this, pages.normal );
        testElements.call(this, desktop.medium );
        testChangeWindowSize.call(this, desktop.large.size );
        testElements.call(this, desktop.large );

      });
    }

    function testMobile() {
      describe('mobile',function() {

        testChangeOrientation.call(this, 'PORTRAIT');
        testLoadPage.call(this, pages.normal );
        testElements.call(this, mobiles.iphone6.portrait) ;
        testChangeOrientation.call(this, 'LANDSCAPE');
        testElements.call(this, mobiles.iphone6.landscape);

        testChangeOrientation.call(this, 'PORTRAIT');
        testLoadPage.call(this, pages.webp );
        testElements.call(this, mobiles.iphone6.portrait) ;
        testChangeOrientation.call(this, 'LANDSCAPE');
        testElements.call(this, mobiles.iphone6.landscape);

      });
    }

    //--------------------------------------------------------------------------
    //---    Desktop specific                                                ---
    //--------------------------------------------------------------------------

    function testChangeWindowSize(size) {
      describe('changing to ' + size.width,function() {

        before(function(done) {
          page.setWindowSize( size.width , size.height )
            .nodeify(done); // We need the above window changes before we can continue
        });

        it('should be the right size ('+ size.width + ')', function(done) {
          page
          .getWindowSize()
          .should.eventually.have.deep.property('width', size.width)
          .nodeify(done);
        });

        it('should wait until the body has resized', function(done) {
            page
            .waitFor(util.asserter(function(t) {
              var a = size.width - win_tollerance;
              var b = size.width + win_tollerance;
              return t
                .elementByTagName('body')
                .getSize()
                .then(function(size) {
                  return size.width.should.be.within(a,b);
                });
            }), explicit_wait) // repeat the above until success or timeout
            .nodeify(done);
        });

      });
    }


    //--------------------------------------------------------------------------
    //---    Mobile specific                                                 ---
    //--------------------------------------------------------------------------

    function testChangeOrientation (value) {
      describe('orientation',function() {

        before(function() {
          page = browser.setOrientation(value);
        });

        it('should change to ' + value, function(done) {
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
    function testLoadPage(page_details) {
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
