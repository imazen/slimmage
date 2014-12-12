var _ = require('lodash'); // For its each/keys/values methods
var desireds = require('./test/desireds.js'); // hash for desired browsers
var port = process.env.PORT || 3000;

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    env: { // Useful for getting browers from environment, which the spec files can test against.
      credentials: { // And for sauce credentials
        src: 'env.json'
      }
      // dynamically filled
    },

    connect: {
      server: {
        options: {
          base: '',
          port: port,
          host: '127.0.0.1'
        }
      }
    },

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
      all: ['**/*.swp', 'sc_*.log']
    },

    // simplemocha: Runs mocha tests from grunt, in node. Nothing special.
    // No connection to saucelabs or WD
    // WD specifics take place in the test files
    // simplemocha: {
    //     sauce: {
    //         options: {
    //             timeout: 60000,
    //             reporter: 'spec'
    //         },
    //         src: ['test/wd/**/*-specs.js']
    //     }
    // },

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

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-saucelabs'); // Run tests, inside browsers, with sauce-connect
  grunt.loadNpmTasks('grunt-mocha'); // Run mocha tests against a PhantomJs instance
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-simple-mocha'); // Run mocha tests in node from grunt
  grunt.loadNpmTasks('grunt-mocha-webdriver');
  grunt.loadNpmTasks('grunt-gcc-rest');

  // Load custom tasks
  grunt.task.loadTasks('test/tasks'); // Relative path to task files


  // Add each browser as a task,
  // ... then we'll also be able to run them concurrently
  _(desireds).each(function(desired, key) {

    // Add to env (plugin)
    grunt.config('env.'+key, {
        DESIRED: JSON.stringify(desired) // By putting the browser config in the environment, we'll be able to use them from within the spec files.
    });

    // Create test:browser:<browser> task
    // grunt.registerTask('test:browser:' + key, ['env:' + key, 'simplemocha:sauce']); // A bit of magic here: set up the environment with chosen browser, and run simplemocha

    // Add concurrent tasks
    var tb = grunt.config('concurrent.test-browsers') || [];
    tb.push('test:browser:' + key);
    grunt.config('concurrent.test-browsers', tb);
  });

  // Credentials: Add from file or use environment, then check and populate.
  grunt.registerTask('credentials',['env:credentials', 'check-credentials', 'populate-credentials'] ); // First test locally, if successful go and test against more exotic browsers...

  // Register alias tasks...
  grunt.registerTask('test:local:unit', ['connect', 'mocha']); // Local (or within CI) tests against PhantomJS headless (webkit) browser
  grunt.registerTask('test:local:feature', ['connect', 'mochaWebdriver:phantomjs']); // Local (or within CI) tests against PhantomJS headless (webkit) browser
  grunt.registerTask('test:unit', ['credentials', 'connect', 'saucelabs-mocha']); // Unit tests in the cloud, SauceLabs
  //grunt.registerTask('test:feature', ['credentials', 'connect','concurrent:test-browsers']); // Run all test-browsers tasks concurrently.
  grunt.registerTask('test:feature', ['credentials', 'connect','mochaWebdriver:sauce']); // Run all test-browsers tasks concurrently.
  //... for more info see where the 'test:browser:<browser>' tasks are defined

  grunt.registerTask('test', ['clean', 'connect', 'mocha', 'mochaWebdriver:phantomjs', 'credentials', 'mochaWebdriver:sauce', 'saucelabs-mocha']); // First test locally, if successful go and test against more exotic browsers...
  grunt.registerTask('test:local', ['clean', 'connect', 'mocha', 'mochaWebdriver:phantomjs']);
  grunt.registerTask('compile',['gcc_rest'] );
  grunt.registerTask('default',['clean', 'test:local'] );

  grunt.log.writeln(grunt.config('concurrent.test-browsers'));
};
