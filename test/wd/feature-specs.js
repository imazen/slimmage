var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

// this.browser and this.wd are injected by the grunt-wd-mocha plugin.
//var setup = require("./setup")(this); // setup details, such as logging and credentials

describe('slimmage on training wheels', function() {
    var browser;
    var allPassed = true;

    before(function() {
      browser = this.browser; // browser only gets injected here, once tests start...
      // enables chai assertion chaining
      chaiAsPromised.transferPromiseness = this.wd.transferPromiseness;
    });

    afterEach(function(done) {
        allPassed = allPassed && (this.currentTest.state === 'passed');
        done();
    });

    after(function(done) {
        browser
          .quit()
          //.sauceJobStatus(allPassed)
          .nodeify(done)

    });
    describe('dummy browser', function() {
      it('should work', function(done) {
        browser
            .get("http://nodejs.org/")
            .title()
            .should.become("node.js")
            .elementById("intro")
            .text()
            .should.eventually.include('JavaScript runtime')
          .nodeify(done)
      });
    });
    describe("slimmage with defaults", function() {
      it("should load without errors", function(done) {
          browser
            .get("http://127.0.0.1:9999/test/feature-defaults.html")
            .title()
              .should.become("slimmage defaults")
          .nodeify(done)
      });
    });
});
