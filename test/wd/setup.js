// Now using a plugin that injects wd and browser, so no local reference needed...
  //var wd = require('wd');

require('colors'); // For console logging.
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");


// The following isn't necessary yet...
 /*
  // http configuration, not needed for simple runs
  wd.configureHttp( {
      timeout: 60000,
      retryDelay: 15000,
      retries: 5
  });
*/


// Make it a function, in case node.js caches our config details.
module.exports = function (context) {
  var browser = context.browser;
  var wd = context.wd;
  var verbose = process.env.VERBOSE

  // Setup promise chaining.
  chai.use(chaiAsPromised);
  chai.should();
  chaiAsPromised.transferPromiseness = wd.transferPromiseness;
  console.dir({chaiAsPromised:chaiAsPromised});
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
}

