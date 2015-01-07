// testElements
var expected = module.exports = {};
var port = process.env.PORT || 3000;

// Slimmage defaults
expected.slim = {
  widthStep: 160
};

expected.calc_nearest_slim_step = function (val) {
  return val - (val % expected.slim.widthStep) + expected.slim.widthStep;
};

expected.win_tollerance = 30; // = px; tolerance for padding/margin/window-frame
expected.body_tollerance = 50; // = px; chrome has a body size of 759px (with the window at 880px)
expected.explicit_wait = 7 * 1000;

// given->expected for the repeatable tests run
expected.pages = {
  normal: {
    name: 'default',
    url:'http://127.0.0.1:'+ port +'/test/feature-defaults.html',
    title: 'slimmage defaults'
  },

  webp: {
    name: 'webp',
    url:'http://127.0.0.1:'+ port +'/test/feature-webp.html',
    title: 'slimmage webp'
  },
};

expected.desktop = {

    medium: {
      devicePixelRatio: 1,
      size: {
        width: 800,
        height: 600
      },
    },

    large: {
      devicePixelRatio: 1,
      size: {
        width: 1024,
        height: 768
      },
    }

};

expected.iphone_retina = {
  devicePixelRatio: 2,
};

expected.android = {
  devicePixelRatio: 1.5,
};
