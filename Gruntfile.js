var _ = require('lodash'); // For its each/keys/values met ods
var desireds = require('./test/desireds.js'); // hash for desired browsers
var port = process.env.PORT || 3000;

module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          base: '',
          port: port,
          host: '127.0.0.1'
        }
      }
    },

    // Google Closure Compiler, which is a very thin wrapper of a HTTP API with Google
    gcc_rest: {
      all: {
        files: {
          'slimmage.min.js': 'slimmage.js'
        },
      },
      options: {
        params: {
          language: 'ECMASCRIPT5_STRICT',
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          warning_level: 'VERBOSE'
        }
      }
    },

    clean: {
      all: ['phantom.log', 'sc_*.log', 'slimmage.min.js']
    },

    // Webdriver tests (Sauce and local PhantomJs)
    mochaWebdriver: {
      options: {
        usePromises: true,
        timeout: 60000, // TODO: Add reasonable timeout
        reporter: 'spec'
      },
      phantomjs: {
        src: ['test/wd/*-specs.js'], // Use this.browser inside regular mocha test files.
        options: {
          testName: 'phantom test',
          usePhantom: true,
          phantomPort: 4444,
          phantomFlags: [
            '--webdriver-logfile', 'phantom.log'
          ]
        }
      },
      sauce: {
        src: ['test/wd/*-specs.js'], // Use this.browser inside regular mocha test files.
        options: {
          testTags: ['feature', 'slimmage'], // TODO: put in github specifics (issues/branch/etc)
          testName: 'slimmage feature tests', // TODO: put in github specifics (issues/branch/etc)
          browsers: _.values(desireds),
          tunnelArgs: ['-v', '--doctor'],
          concurrency: 99 // how many browses to be run in parallel
        }
      }
    },

    'saucelabs-mocha': {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:'+port+'/test/index.html'
          ],
          browsers: _.values(desireds),
          build: process.env.TRAVIS_JOB_ID,
          pollInterval: 5000, // timeout
          maxRetries: 3,
          testname: 'slimmage mocha tests',
          throttled: 3, // how many browses to be run in parallel
          //tunnelArgs: ["--debug"],
          sauceConfig: {
            tags: ['slimmage', 'unit'],
            'video-upload-on-pass': false
          }
        }
      }
    },

    'mocha': { // Local PhantomJs unit tests
      all: {
        options: {
          urls: [
            'http://127.0.0.1:'+port+'/test/index.html'
          ]
        }
      }
    },
  });

  // These are the grunt tasks
  grunt.loadNpmTasks('grunt-contrib-clean'); // This deletes files
  grunt.loadNpmTasks('grunt-contrib-connect'); // A static file sever
  grunt.loadNpmTasks('grunt-saucelabs'); // Run tests (it comes with support for multiple runners, we use mocha), inside browsers, with sauce-connect
  grunt.loadNpmTasks('grunt-mocha'); // Run mocha tests against a PhantomJs instance
  grunt.loadNpmTasks('grunt-mocha-webdriver');
  grunt.loadNpmTasks('grunt-gcc-rest');

  // Load custom tasks
  grunt.task.loadTasks('test/tasks'); // Relative path to task files

  // Register alias tasks...
  grunt.registerTask('test:local:unit', ['connect', 'mocha']); // Local (or within CI) tests against PhantomJS headless (webkit) browser
  grunt.registerTask('test:local:feature', ['connect', 'mochaWebdriver:phantomjs']); // Local (or within CI) tests against PhantomJS headless (webkit) browser
  grunt.registerTask('test:unit', ['check-credentials', 'connect', 'saucelabs-mocha']); // Unit tests in the cloud, SauceLabs
  grunt.registerTask('test:feature', ['check-credentials', 'connect','mochaWebdriver:sauce']); // Run all test-browsers tasks concurrently.
  //... for more info see where the 'test:browser:<browser>' tasks are defined

  // High level aliases
  grunt.registerTask('test', ['connect', 'mocha', 'mochaWebdriver:phantomjs', 'check-credentials', 'mochaWebdriver:sauce', 'saucelabs-mocha']); // First test locally, if successful go and test against more exotic browsers...
  grunt.registerTask('test:local', ['connect', 'mocha', 'mochaWebdriver:phantomjs']);
  grunt.registerTask('compile',['gcc_rest'] );
  grunt.registerTask('local',['clean','compile','test:local'] );

  // Run this if no task is specified
  grunt.registerTask('default',['clean','compile','test'] );

};
