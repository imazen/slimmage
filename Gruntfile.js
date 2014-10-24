module.exports = function (grunt) {
  var browsers = [{
    browserName: 'internet explorer',
    version: '8',
    platform: 'Windows 7'
  }, {
    browserName: 'googlechrome',
    platform: 'linux'
  },];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          base: '',
          port: 9999
        }
      }
    },

    clean: {
      all: ['**/*.swp', 'sc_*.log'] 
    },

    'saucelabs-mocha': {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:9999/test/index.html'
          ],
          browsers: browsers,
          build: process.env.TRAVIS_JOB_ID,
          testname: 'mocha tests',
          throttled: 3,
          tunnelArgs: ["--verbose"],
          sauceConfig: {
            tags: ['unit'],
            'video-upload-on-pass': false
          }
        }
      }
    },
    watch: {}
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs');


  grunt.registerTask('check-credentials', function(){
    if(!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY){
        console.warn(
            '\nPlease configure your sauce credential:\n\n' +
            'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
            'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
        );
        throw new Error("Missing sauce credentials");
    }
  });


  grunt.registerTask('test:unit', ['check-credentials', 'connect', 'saucelabs-mocha']);
  grunt.registerTask('dummy', ['check-credentials']);

};
