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
exports.widthToBeWithin = function(selector, expected_width,tolerance) {

  return new Asserter(
    function(target) { // browser or el
      return target
        .elementByCssSelector(selector)
        .getSize()
        // condition implemented with chai as promised
        .then(function(size) {
          var w = expected_width;
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

exports.asserter = function (fn) {
  return new Asserter(
    function(target) { // browser or el
      return fn(target) // Remember to return `target`
        .catch(tagChaiAssertionError); // tag errors for retry in catch.
    }
  );
};


