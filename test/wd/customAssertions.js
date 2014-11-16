var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');
var Asserter = wd.Asserter; // asserter base class

// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// tagging chai assertion errors for retry
var tagChaiAssertionError = function(err) {
  // throw error and tag as retriable to poll again
  err.retriable = err instanceof chai.AssertionError;
  throw err;
};

/*
 *  Wait for the size to be correct, a polling asserter
 *  @param: {array} size width,height
 */
exports.bodyWidthToBeWithin = function(expected_width,tolerance) {
  return new Asserter(
    function(target) { // browser or el
      return target
        // condition implemented with chai as promised
        .elementByTagName('body')
        .getSize()
        // .should.eventually.have.deep.property("width",expected_width)
        .then(function(size) {
          var w = expected_width
          var a = w - tolerance;
          var b = w + tolerance;
          size.width.should.be.within(a,b);
        })
        // .then(function(actual_size) {

        //   var w = expected_width
        //   var wa = w/2 - tollerance;
        //   var wb = w/2 + tollerance;
        //   actual_size.width.should.be.within(wa,wb);
        //   return target;

        // })
        // .noop() // this will be returned by waitFor
                // and ignored by waitForElement.
        .catch(tagChaiAssertionError); // tag errors for retry in catch.
    }
  );
};

// simple asserter, just making sure that the element (or browser)
// text is non-empty and returning the text.
// It will be called until the promise is resolved with a defined value.
var customTextNonEmpty = new Asserter(
  function(target) { // browser or el
    return target
      .text().then(function(text) {
        // condition implemented with chai within a then
        text.should.have.length.above(0);
        return text; // this will be returned by waitFor
                     // and ignored by waitForElement.
      })
      .catch(tagChaiAssertionError); // tag errors for retry in catch.
  }
);

// another simple element asserter
var customIsDisplayed = new Asserter(
  function(el) {
    return el
      .isDisplayed().should.eventually.be.ok
      .catch(tagChaiAssertionError);
  }
);

// asserter generator
var customTextInclude = function(text) {
  return new Asserter(
    function(target) { // browser or el
      return target
        // condition implemented with chai as promised
        .text().should.eventually.include(text)
        .text() // this will be returned by waitFor
                // and ignored by waitForElement.
        .catch(tagChaiAssertionError); // tag errors for retry in catch.
    }
  );
};

// optional add custom method
wd.PromiseChainWebdriver.prototype.waitForElementWithTextByCss = function(selector, timeout, pollFreq) {
  return this
    .waitForElementByCss(selector, customTextNonEmpty , timeout, pollFreq);
};

// var browser = wd.promiseChainRemote();

// browser
//   .init({browserName:'chrome'})
//   .get("http://admc.io/wd/test-pages/guinea-pig.html")
//   .title().should.become('WD Tests')

//   // generic waitFor, asserter compulsary
//   .waitFor(customTextInclude('a waitFor child') , 2000)
//   .should.eventually.include('a waitFor child')

//   // waitForElement with element asserter
//   .execute(removeChildren)
//   .execute( appendChild, [500] )
//   .waitForElementByCss("#i_am_an_id .child", customTextNonEmpty , 2000)

//   // another asserter
//   .waitForElementByCss("#i_am_an_id .child", customIsDisplayed , 2000)
//   .text().should.become('a waitFor child')

//   // custom method
//   .execute(removeChildren)
//   .execute( appendChild, [500] )
//   .waitForElementWithTextByCss("#i_am_an_id .child", 2000)
//   .text().should.become('a waitFor child')

//   .fin(function() { return browser.quit(); })
//   .done();/html>
