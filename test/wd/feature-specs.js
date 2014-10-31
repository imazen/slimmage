var wd = require('wd');
require('colors');
var _ = require("lodash");
var chai = require("chai"); // setup.js handles promise chaining

var setup = require("./setup.js")() // Note the function call, setup is an object though

describe('mocha-wd (' + setup.desired.browserName + ')', function() {
    var browser;
    var allPassed = true;

    before(function(done) {
        var username = setup.username
        var accessKey = setup.key
        browser = wd.promiseChainRemote("ondemand.saucelabs.com", 80, username, accessKey);
        if(setup.verbose){
            // optional logging
            browser.on('status', function(info) {
                console.log(info.cyan);
            });
            browser.on('command', function(meth, path, data) {
                console.log(' > ' + meth.yellow, path.grey, data || '');
            });
        }
        browser
            .init(setup.desired)
            .nodeify(done);
    });

    afterEach(function(done) {
        allPassed = allPassed && (this.currentTest.state === 'passed');
        done();
    });

    after(function(done) {
        browser
            .quit()
            .sauceJobStatus(allPassed)
            .nodeify(done);
    });

    it("should get home page", function(done) {
        browser
            .get("http://nodejs.org/")
            .title()
            .should.become("node.js")
            .elementById("intro")
            .text()
            .should.eventually.include('JavaScript runtime')
            .nodeify(done);
    });

    _(2).times(function(i) { // repeat twice

        it("should go to the doc page (" + i + ")", function(done) {
            browser
                .elementById('docsbutton')
                .click()
                .waitForElementByCss("#content header", wd.asserters.textInclude('Manual'), 10000)
                .title()
                .should.eventually.include("Manual")
                .nodeify(done);
        });

        it("should return to the home page(" + i + ")", function(done) {
            browser
                .elementByCss('#nav ul li a')
                .click()
                .waitForElementById("intro", wd.asserters.textInclude('JavaScript runtime'), 10000)
                .title()
                .should.not.eventually.include("Manual")
                .nodeify(done);
        });

    });
});
