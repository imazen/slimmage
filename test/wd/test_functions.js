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

test.desktop_ie = function() {
  describe('desktop (IE 6/7)',function() {
    test.desktopPage.call(this, e.pages.normal, true);
    test.desktopPage.call(this, e.pages.webp, true);
  });
};

test.desktop_fixed = function() {
  describe('desktop (fixed - no window resizing - ratcheting not tested)',function() {
    test.desktopFixed.call(this, e.pages.normal);
    test.desktopFixed.call(this, e.pages.webp);
  });
};

test.mobile = function() {
  test.mobilePage.call(this, e.pages.normal);
  test.mobilePage.call(this, e.pages.webp);
};

//--------------------------------------------------------------------------
//---    Desktop specific                                                ---
//--------------------------------------------------------------------------

test.desktopFixed = function(page) {
  test.loadPage.call(this, page );
  test.elements.call(this);
};

test.desktopPage = function(page) {
  test.changeWindowSize.call(this, e.desktop.medium.size );
  test.loadPage.call(this, page );
  test.elements.call(this);
  test.changeWindowSize.call(this, e.desktop.large.size );
  test.elements.call(this);
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
        .waitFor(util.asserter(function(t) {
          return t
          .title()
          .should.become(page_details.title);
        }), e.explicit_wait_page_loading) // repeat the above until success or timeout
        .nodeify(done);
    });
  });
};

test.elements = function(){
  var dpr = 1;
  var halfsize; // Based on the size of the body tag
  var halfsize_src;
  var format;
  var quality;

  describe('elements',function() {

    // Calculate halfsize and halfsize_src
    before(function(done) {
      var chain = this.browser;
      chain = chain
        .safeExecute('[window.devicePixelRatio || 1, window.slimmage && window.slimmage.webp]')
        .then(function(val){
          dpr = val[0];
          if (dpr > 1.49){
            quality = val[1] ? 65 : 80;
          }else{
            quality = val[1] ? 78 : 90;
          }
          format = val[1] ? '&format=webp&quality=' + quality : '&format=jpg&quality=' + quality;
        });


      chain.elementById('container')
        .getSize()
        .then(function(size) {
          halfsize = size.width/2;
          halfsize_src = e.calc_nearest_slim_step(halfsize * dpr);
        })
        .nodeify(done);
    });

    describe('last_element',function() {
      it('load before continuing the tests',function(done) {
        this.browser
          .waitForElementById('last_element', e.explicit_wait)
          .nodeify(done);
      });

    });

    describe('fixedwidth_155', function() {
      it('src url should ratchet up to nearest step', function(done) {
        var fix155_src = e.calc_nearest_slim_step(dpr * 155);
        this.browser
          .elementById('fixedsize_155') // img.max_width == 150px
          .getAttribute('src')
          .should.become('http://z.zr.io/ri/1s.jpg?width=' + fix155_src + format)
          .nodeify(done);
      });
    });

    describe('fixedwidth_315', function() {
      it('src url should ratchet up to nearest step', function(done) {
        var fix315_src = e.calc_nearest_slim_step(dpr * 315);
        this.browser
          .elementById('fixedsize_315') // img.max_width == 315px
          .getAttribute('src')
          .should.become('http://z.zr.io/ri/1s.jpg?width=' + fix315_src+ format)
          .nodeify(done);
      });
    });

    describe('halfsize', function() {

      it('should be half the width of #container +/-'+ e.win_tollerance +' px',function(done) {
       this.browser
          .waitFor(util.asserter(function(t) {
            return t
              .elementById('halfsize')
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
              .elementById('halfsize')
              .getAttribute('src')
              .should.become('http://z.zr.io/ri/1s.jpg?width=' + halfsize_src + format);
          }), e.explicit_wait) // repeat the above until success or timeout
          .nodeify(done);
      });

    });
  });
};
