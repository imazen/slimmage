/* global describe,before,it */

var e = require('./expected.js');
var util	= require('./util.js');
var test = module.exports = {};

//--------------------------------------------------------------------------
//---       The following are only functions, and unless called          ---
//---       ... from within a test, they do nothing.                     ---
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
//---    High level test suites                                          ---
//--------------------------------------------------------------------------

test.desktop = function() {
  describe('desktop',function() {
    test.desktopPage.call(this, e.pages.normal);
    test.desktopPage.call(this, e.pages.webp);
  });
};

test.mobile = function() {
  test.mobilePage.call(this, e.pages.normal);
  test.mobilePage.call(this, e.pages.webp);
};

//--------------------------------------------------------------------------
//---    Desktop specific                                                ---
//--------------------------------------------------------------------------

test.desktopPage = function(page) {
  test.changeWindowSize.call(this, e.desktop.medium.size );
  test.loadPage.call(this, page );
  test.elements.call(this, e.desktop.medium );
  test.changeWindowSize.call(this, e.desktop.large.size );
  test.elements.call(this, e.desktop.large );
};

test.changeWindowSize = function(size) {
  describe('changing to ' + size.width,function() {
    var chain;
    before(function() {
      chain = this.browser
        .setWindowSize( size.width , size.height );
    });

    it('should be the right size ('+ size.width + ')', function(done) {
      chain
      .getWindowSize()
      .then(function(actual) {
          var a = size.width - e.win_tollerance;
          var b = size.width + e.win_tollerance;
          return actual.width.should.be.within(a,b);
      })
      .nodeify(done);
    });

    it('should wait until the body has resized', function(done) {
      chain
        .waitFor(util.asserter(function(t) {
          var a = size.width - e.body_tollerance;
          var b = size.width + e.body_tollerance;
          return t
            .elementByTagName('body')
            .getSize()
            .then(function(actual) {
              return actual.width.should.be.within(a,b);
            });
        }), e.explicit_wait) // repeat the above until success or timeout
        .nodeify(done);
    });

  });
};

//--------------------------------------------------------------------------
//---    Mobile specific                                                 ---
//--------------------------------------------------------------------------

test.mobilePage = function(page) {
    test.changeOrientation.call(this, 'PORTRAIT');
    test.loadPage.call(this, page);
    test.elements.call(this);
    test.changeOrientation.call(this, 'LANDSCAPE');
    test.elements.call(this);
};

test.changeOrientation  = function(value) {
  describe('orientation',function() {
    var chain;
    before(function() {
      chain = this.browser.setOrientation(value);
    });

    it('should change to ' + value, function(done) {
      chain
      .getOrientation()
      .should.become(value)
      .nodeify(done);
    });

  });
};

// ------------------------------------------------------------------------
// Shared funtions
// ------------------------------------------------------------------------

// ------------------------------------------------------------------------
// Load page
// ------------------------------------------------------------------------

test.loadPage = function(page_details) {
  describe(page_details.name,function() {
    var chain;
    before(function(){
      chain = this.browser
      .get(page_details.url);
    });

    it('should load the right page', function(done) {
      chain
      .title()
      .should.become(page_details.title)
      .nodeify(done);
    });
  });
};

test.elements = function(){
  var dpr;
  var halfsize; // Based on the size of the body tag
  var halfsize_src;

  describe('elements',function() {

    // Calculate halfsize and halfsize_src
    before(function(done) {
      this.browser
        .elementByTagName('body')
        .getSize()
        .then(function(size) {
          halfsize = size.width/2;
          halfsize_src = e.calc_nearest_slim_step(halfsize * dpr);
        })
        .safeExecute('window.devicePixelRatio || 1')
        .then(function(val){
          dpr = val;
        })
        .nodeify(done);
    });

    describe('fixedwidth_155', function() {
      it('src url should ratchet up to nearest step', function(done) {
        var fix155_src = e.calc_nearest_slim_step(dpr * 155);
        this.browser
          .elementByClassName('fixedsize_155') // img.max_width == 150px
          .getAttribute('src')
          .should.become('http://z.zr.io/ri/1s.jpg?width=' + fix155_src)
          .nodeify(done);
      });
    });

    describe('fixedwidth_200', function() {
      it('src url should ratchet up to nearest step', function(done) {
        var fix200_src = e.calc_nearest_slim_step(dpr * 200);
        this.browser
          .elementByClassName('fixedsize_200') // img.max_width == 200px
          .getAttribute('src')
          .should.become('http://z.zr.io/ri/1s.jpg?width=' + fix200_src)
          .nodeify(done);
      });
    });

    describe('halfsize', function() {

      it('should be half the width of the body +/-'+ e.win_tollerance +' px',function(done) {
       this.browser
          .waitFor(util.asserter(function(t) {
            return t
              .elementByClassName('halfsize')
              .getSize()
              .then(function(size) {
                var a = halfsize - e.body_tollerance;
                var b = halfsize + e.body_tollerance;
                size.width.should.be.within(a,b);
              });
          }), e.explicit_wait) // repeat the above until success or timeout
          .nodeify(done);
      });

      it('src url should ratchet up to nearest step size', function(done) {
        this.browser
          .waitFor(util.asserter(function(t) {
            return t
              .elementByClassName('halfsize')
              .getAttribute('src')
              .should.become('http://z.zr.io/ri/1s.jpg?width=' + halfsize_src );
          }), e.explicit_wait) // repeat the above until success or timeout
          .nodeify(done);
      });

    });
  });
};
