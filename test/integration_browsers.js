/*jshint  node:true */
'use strict';

module.exports = {

    explorer6: {
       platform = 'Windows XP',
       browserName: 'internet explorer',
       version: '6',
       'screen-resolution': '1024x768'
    },

    ios_emulator: {
      'browserName': 'iphone',
      'platform': 'OS X 10.9',
      'version': '8.0',
      // 'deviceName':'iPhone Simulator',
      'device-orientation': 'portrait'
    },

    android4_0: {
      browserName: 'android',
      platform: 'Linux', 
      version = '4.0'
    },

    chrome_linux: {
      browserName: 'chrome',
      platform: 'Linux',
      version: '39',
      'screen-resolution': '1024x768'
    },

    firefox_windows: {
      browserName: 'firefox',
      platform: 'Windows',
      'screen-resolution': '1024x768'
    },


    safari7_mac: {
      browserName: 'safari',
      platform: 'OS X 10.9', 
      version: '7',
      deviceName: '',
      'screen-resolution': '1024x768',
    },


    firefox_linux: {
      browserName: 'firefox',
      platform: 'Linux',
      version: '34',
      'screen-resolution': '1024x768'
    },
    
    firefox_mac: {
      browserName: 'firefox', 
      platform: 'OS X 10.10',
      version: '34',
      deviceName: '',
      'screen-resolution': '1024x768',
    },

    chrome_mac: {
      browserName: 'chrome', 
      platform: 'OS X 10.10',
      version: '',
      deviceName: '',
      'screen-resolution': '1024x768',
    },

    explorer7: {
       platform = 'Windows XP',
       browserName: 'internet explorer',
       version: '7',
       'screen-resolution': '1024x768'
    },

    explorer8: {
       platform = 'Windows 7',
       browserName: 'internet explorer',
       version: '8',
       'screen-resolution': '1024x768'
    },

    explorer9: {
      platform = 'Windows 7',
      browserName: 'internet explorer',
      version: '9',
      'screen-resolution': '1024x768'
    },

    explorer10: {
      platform = 'Windows 8',
      browserName: 'internet explorer',
      version: '10',
      'screen-resolution': '1024x768'
    },

    explorer11: {
      platform = 'Windows 8.1',
      browserName: 'internet explorer',
      version: '11',
      'screen-resolution': '1024x768'
    },

    android4_4: {
      browserName: 'android',
      platform: 'Linux', 
      version = '4.4'
    }

};
