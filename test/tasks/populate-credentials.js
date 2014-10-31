'use strict';

module.exports = function(grunt) {
  grunt.registerTask('populate-credentials',  function() {
    // Put credentials into saucelabs-mocha config. Can be done after config had been set.
    grunt.config("saucelabs-mocha.all.options.username", process.env.SAUCE_USERNAME);
    grunt.config("saucelabs-mocha.all.options.key", process.env.SAUCE_ACCESS_KEY);
  });
};
