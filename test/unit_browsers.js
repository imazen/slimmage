/*jshint  node:true */
'use strict';

module.exports = {

    firefox: {
      browserName: 'firefox',
      platform: 'Windows 8.1',
      'screen-resolution': '1024x768'
    },

    explorer: {
      browserName: 'internet explorer',
      version: '6',
      platform: 'Windows XP'
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
