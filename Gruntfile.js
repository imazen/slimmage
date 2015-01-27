var _ = require('lodash'); // For its each/keys/values met ods
var unit_browsers = require('./test/unit_browsers.js'); // hash for desired browsers
var integration_browsers = require('./test/integration_browsers.js'); // hash for desired browsers
var title = (process.env.TRAVIS_BRANCH || 'local') + ' ' + (process.env.TRAVIS_TAG || '') + ' ' + (process.env.TRAVIS_COMMIT || '        ').substring(0,8);
title = title.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
var slug = process.env.TRAVIS_REPO_SLUG || '[local]/slimmage';
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
        timeout: 5 * 60 * 1000, // TODO: Add reasonable timeout
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
          testTags: [slug, 'integration'], 
          testName: title, 
          browsers: _.values(integration_browsers),
          tunnelArgs: ['-v', '--doctor'],
          build: process.env.TRAVIS_BUILD_NUMBER || 0,
          concurrency: 3, // how many browsers to be run in parallel
          sauceConfig: {
            'record-video': false,
            'video-upload-on-pass': false,
            build: process.env.TRAVIS_BUILD_NUMBER || 0,
          }
        }
      }
    },

    'saucelabs-mocha': {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:'+port+'/test/index.html'
          ],
          browsers: _.values(unit_browsers),
          build: process.env.TRAVIS_BUILD_NUMBER || 0,
          pollInterval: 2000, // timeout
          maxRetries: 1,
          maxPollRetries: 1,
          testname: title,
          throttled: 3, // how many browses to be run in parallel
          //tunnelArgs: ["--debug"],
          sauceConfig: {
            'record-video': false,
            tags: [slug, 'unit'],
            'video-upload-on-pass': false,
            build: process.env.TRAVIS_BUILD_NUMBER || 0,
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
    'jshint': {
      slimmage: ['slimmage.js'],
      unit_tests: ['test/spec/tests.js', 'test/wd/*.js', 'test/*.js']
      
    }
  });

  // These are the grunt tasks
  grunt.loadNpmTasks('grunt-contrib-clean'); // This deletes files
  grunt.loadNpmTasks('grunt-contrib-connect'); // A static file sever
  grunt.loadNpmTasks('grunt-saucelabs'); // Run tests (it comes with support for multiple runners, we use mocha), inside browsers, with sauce-connect
  grunt.loadNpmTasks('grunt-mocha'); // Run mocha tests against a PhantomJs instance
  grunt.loadNpmTasks('grunt-mocha-webdriver');
  grunt.loadNpmTasks('grunt-gcc-rest');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-newer');

  // Load custom tasks
  grunt.task.loadTasks('test/tasks'); // Relative path to task files

  // Register alias tasks...
  grunt.registerTask('test:local:unit', ['compile','connect', 'mocha']); // Local (or within CI) tests against PhantomJS headless (webkit) browser
  grunt.registerTask('test:local:feature', ['compile','connect', 'mochaWebdriver:phantomjs']); // Local (or within CI) tests against PhantomJS headless (webkit) browser
  grunt.registerTask('test:unit', ['compile','check-credentials', 'connect', 'saucelabs-mocha']); // Unit tests in the cloud, SauceLabs
  grunt.registerTask('test:feature', ['compile','check-credentials', 'connect','mochaWebdriver:sauce']); // Run all test-browsers tasks concurrently.
  //... for more info see where the 'test:browser:<browser>' tasks are defined

  // High level aliases
  grunt.registerTask('test', ['compile', 'connect', 'mocha', 'mochaWebdriver:phantomjs', 'check-credentials', 'mochaWebdriver:sauce', 'saucelabs-mocha']); // First test locally, if successful go and test against more exotic browsers...
  grunt.registerTask('test:local', ['compile', 'connect', 'mocha', 'mochaWebdriver:phantomjs']);
  grunt.registerTask('compile',['newer:gcc_rest'] );
  grunt.registerTask('local',['clean','test:local'] );

  // Run this if no task is specified
  grunt.registerTask('default',['clean','compile', 'test'] );

};
