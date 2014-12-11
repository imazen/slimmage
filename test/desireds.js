/*jshint  node:true */
'use strict';

module.exports = {

    firefox: {
      browserName: 'firefox',
      platform: 'Windows',
      'screen-resolution': '1024x768'
    },

    explorer6: {
      browserName: 'internet explorer',
      version: '6.0',
      'screen-resolution': '1024x768'
    },

    explorer: {
      browserName: 'internet explorer',
      'screen-resolution': '1024x768'
    },

    chrome: {
      browserName: 'chrome',
      platform: 'Linux',
      version: '38.0',
      'screen-resolution': '1024x768'
    },

    ios: {
      'browserName': 'iphone',
      'platform': 'OS X 10.9',
      'version': '8.0',
      // 'deviceName':'iPhone Simulator',
      'device-orientation': 'portrait'
    }

};
