'use strict';

module.exports = function(grunt) {

  // Check-credentials task. Verifies that we have sauce credentials
  grunt.registerTask('check-credentials', 'So that if we fail, at least we know some more info', function() {
    if(!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY){
        console.warn(
            '\nPlease configure your sauce credential:\n\n' +
            'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
            'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
        );
        throw new Error("Missing sauce credentials");
    }
  });
};
