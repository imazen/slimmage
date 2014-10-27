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

    credentials: {
      all: {}
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

    'mocha': {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:9999/test/index.html'
          ]
        }
      }
    },

    watch: {}
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-mocha');


  grunt.registerMultiTask('credentials', 'load sauce credentials from env or file', function() {
    var sauce_username, sauce_access_key

    if (grunt.file.exists("env.json")){ 
      var file = require("./env.json")
      sauce_username = file.sauce_username
      sauce_access_key = file.sauce_access_key 
    }

    sauce_username = sauce_username || process.env.SAUCE_USERNAME
    sauce_access_key = sauce_access_key || process.env.SAUCE_ACCESS_KEY

    if(!sauce_username || !sauce_access_key){
        console.warn(
            '\nPlease configure your sauce credential:\n\n' +
            'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
            'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n' +
            'Or have a have a json file called "env.json" with the above data, lowercase.\n\n'
        );
        throw new Error("Missing sauce credentials");
    }
    grunt.config("saucelabs-mocha.all.options.username", sauce_username)
    grunt.config("saucelabs-mocha.all.options.key", sauce_access_key)
    grunt.log.writeln("We have sauce credentials...");
  });



  grunt.registerTask('test:unit', ['credentials', 'connect', 'saucelabs-mocha']); // Unit tests in the cloud, SauceLabs
  grunt.registerTask('test:local', ['connect', 'mocha']); // Local (or within CI) tests against PhantomJS headless (webkit) browser

  grunt.registerTask('test', ['test:local', 'test:unit']); // First test locally, if successful go and test against more excotic browsers...

  grunt.registerTask('default',['test:local'] ); // First test locally, if successful go and test against more excotic browsers...
};
