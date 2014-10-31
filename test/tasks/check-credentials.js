'use strict';

module.exports = function(grunt) {

  // Check-credentials task. Verifies that we have sauce credentials
  grunt.registerTask('check-credentials', 'load sauce credentials from env or file', function() {
    if(!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY){
        console.warn(
            '\nPlease configure your sauce credential:\n\n' +
            'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
            'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n' +
            'Or have a json file called "<root>/env.json" with the above data, upppercase.\n\n'
        );
        throw new Error("Missing sauce credentials");
    }
    grunt.log.writeln("We have sauce credentials...");
    grunt.log.writeln(process.env.SAUCE_USERNAME + ": " + process.env.SAUCE_ACCESS_KEY);
  });
};
