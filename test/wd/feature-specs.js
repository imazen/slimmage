var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
var verbose = true;
var port = process.env.PORT || 3000

// Add some custom 'waitFor' assertions
var ca  = require('./customAssertions.js'); /* .sizeToBe */

// this.browser and this.wd are injected by the grunt-wd-mocha plugin.
//var setup = require('./setup')(this); // setup details, such as logging and credentials

// Slimmage defaults
var slim = {
  widthStep: 160
}

var win_tollerance = 20; // = px; tolerance for padding/margin/window-frame

// given->expected for the repeatable tests run
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
      halfsize_w: 640 // 1024/2 = 512, nearest step is 640
    }
  },
}
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

    // ------------------------------------------------------------------------
    // Load page, test all
    // ------------------------------------------------------------------------
    describe('defaults ('+values._default.given.window_w + ',' + values._default.given.window_h + ')',function() {
      before(function(){
        page = browser
          .setWindowSize(values._default.given.window_w,values._default.given.window_h)
          .get('http://127.0.0.1:'+port+'/test/feature-defaults.html');
      })

      it('should load the right page', function(done) {
        page
        .title()
        .should.become('slimmage defaults')
        .nodeify(done)
      });

      it('should have the right window size', function(done) {
        page
        .getWindowSize()
        .should.eventually.have.deep.property('width', values._default.given.window_w)
        .nodeify(done)
      });

      testAll.call(this)

    });

    // ------------------------------------------------------------------------
    // Do the same tests as above, but on the -webp page
    // ------------------------------------------------------------------------
    // describe("webp",function() {
    //   before(function(){
    //     // ...the following will have 'tryWebP' enabled
    //     page = browser
    //       .setWindowSize(values._default.given.window_w,values._default.given.window_h)
    //       .get('http://127.0.0.1:'+port+'/test/feature-webp.html');
    //   })

    //   it('should load the right page', function(done) {
    //     page
    //     .title()
    //     .should.become('slimmage webp')
    //     .nodeify(done)
    //   });

    //   testAll.call(this)

    // });

    //--------------------------------------------------------------------------
    //---                                                                    ---
    //---       The following are only functions, and unless called          ---
    //---       ... from within a test, they do nothing.                     ---
    //---                                                                    ---
    //--------------------------------------------------------------------------

    // Change window size. Test. Change window size again. Test
    function testAll() {
      //testChangeWindowSize.call(this,values._default) // Change window size (and test window size)
      testElements.call(this, values._default) // Run tests on the elements
      testChangeWindowSize.call(this,values.viewport_change) /// Change window size (and test window size)
    }

    // This is to fire off a change event.
    function testChangeWindowSize(vals) {
      describe('window about to be ' + vals.given.window_w,function() {

        before(function(done) {
          page.setWindowSize(vals.given.window_w, vals.given.window_h)
            .nodeify(done) // We need the above window changes before we can continue
        });

        it("should be the right size ("+ vals.given.window_w + ")", function(done) {
          // This exists, because resizing the elements is async
          page.getWindowSize()
            .should.eventually.have.deep.property("width",vals.given.window_w)
            .nodeify(done)
        });

        it('should wait until the body has resized', function(done) {
            page
            .waitFor(ca.bodyWidthToBeWithin(vals.given.window_w, win_tollerance), 1000) // 1000 = timeout
            .nodeify(done)
        });

        // Must run tests AFTER window changes size
        testElements.call(this, values.viewport_change) // Run tests on the elements

      });
    }

    function testElements(vals){

      describe('fixedwidth_100', function() {

        it('src url should ratchet up to 160', function(done) {
          page
            .elementByClassName('fixedsize_100') // img.max_width == 100px
            .getAttribute('src')
            .should.become('http://z.zr.io/ri/1s.jpg?width=' + slim.widthStep)
            .nodeify(done)
        });

      });

      describe('fixedwidth_200', function() {
        it('src url should ratchet up to 320', function(done) {
          page
            .elementByClassName('fixedsize_200') // img.max_width == 200px
            .getAttribute('src')
            .should.become('http://z.zr.io/ri/1s.jpg?width=' + (slim.widthStep*2))
            .nodeify(done)
        });
      });

      describe('halfsize', function() {
        it('should be ' + (vals.given.window_w/2)
                        + ' +/-'+ win_tollerance
                        +' px wide',function(done) {
          page
            .elementByClassName('halfsize')
            .getSize()
            //.should.eventually.have.deep.property('width', vals.given.window_w/2 )// half the window's size
            .then(function(size) {
              var a = vals.given.window_w/2 - win_tollerance;
              var b = vals.given.window_w/2 + win_tollerance;
              size.width.should.be.within(a,b);
            })
            .nodeify(done)
        });

        it('src url should ratchet up to '+ vals.expected.halfsize_w,function(done) {
          page
            .elementByClassName('halfsize')
            .getAttribute('src')
            .should.become('http://z.zr.io/ri/1s.jpg?width=' + vals.expected.halfsize_w )
            .nodeify(done)
        });
      });

    } // testElements

});
