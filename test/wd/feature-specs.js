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
var values = {
  _default: {
    given:{
      window_w: 800,
      window_h: 640
    },
    expected: {
      halfsize_w: 480 // 800/2 = 400, nearest step is 480
    }
  },
  viewport_change: {
    given:{
      window_w: 1024,
      window_h: 768
    },
    expected: {
      // halfsize_w: 1024 // 2048/2 = 1024, nearest step is the same at...1024
      halfsize_w: 640
    }
  },
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
    testPage.call(this, pages[0]);
    testPage.call(this, pages[1]);


    //--------------------------------------------------------------------------
    //---       The following are only functions, and unless called          ---
    //---       ... from within a test, they do nothing.                     ---
    //--------------------------------------------------------------------------

    // ------------------------------------------------------------------------
    // Load page, test all
    // ------------------------------------------------------------------------
    function testPage(details) {
      describe(details.name,function() {
        before(function(){
          page = browser
          .setWindowSize(values._default.given.window_w,values._default.given.window_h)
          .get(details.url);
        });

        it('should load the right page', function(done) {
          page
          .title()
          .should.become(details.title)
          .nodeify(done);
        });

        testAll.call(this);

      });
    }
    // Change window size. Test. Change window size again. Test
    function testAll() {
      testWindowSize.call(this, values._default, true);
      testWindowSize.call(this, values.viewport_change);
      // testChangeWindowSize.call(this,values.viewport_change) /// Change window size (and test window size)
      // testElements.call(this, values.viewport_change) // Run tests on the elements
    }
    function testWindowSize(vals, leave_window_size) {
      describe("window at "+vals.given.window_w +" x "+ vals.given.window_h,function() {
        if (!leave_window_size){
          testChangeWindowSize.call(this, vals); // Change window size (and test window size)
        }
        testElements.call(this, vals); // Run tests on the elements
      });
    }
    // This is to fire off a change event.
    function testChangeWindowSize(vals) {
      describe('changing to ' + vals.given.window_w,function() {

        before(function(done) {
          page.setWindowSize(vals.given.window_w, vals.given.window_h)
            .nodeify(done); // We need the above window changes before we can continue
        });

        it("should be the right size ("+ vals.given.window_w + ")", function(done) {
          // This exists, because resizing elements, is async
            page.waitFor(util.asserter(function(t) {
              var a = vals.given.window_w - win_tollerance;
              var b = vals.given.window_w + win_tollerance;
              return t
                .getWindowSize()
                .then(function(size) {
                  return size.width.should.be.within(a,b);
                });
            }), explicit_wait) // repeat the above until success or timeout
            .nodeify(done);
        });

        it('should wait until the body has resized', function(done) {
            page
            .waitFor(util.asserter(function(t) {
              var a = vals.given.window_w - win_tollerance;
              var b = vals.given.window_w + win_tollerance;
              return t
                .elementByTagName('body')
                .getSize()
                .then(function(size) {
                  return size.width.should.be.within(a,b);
                });
            }), explicit_wait) // repeat the above until success or timeout
            .nodeify(done);
        });

        // Must run tests AFTER window changes size
        // testElements.call(this, values.viewport_change) // Run tests on the elements

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
            // .elementByClassName('halfsize')
            // .getSize()
            // //.should.eventually.have.deep.property('width', vals.given.window_w/2 )// half the window's size
            // .then(function(size) {
            //   var a = vals.given.window_w/2 - win_tollerance;
            //   var b = vals.given.window_w/2 + win_tollerance;
            //   size.width.should.be.within(a,b);
            // })
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
