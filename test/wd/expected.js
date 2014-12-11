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
expected.explicit_wait = 10000;

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
      halfsize: 400, // 1334/4
      halfsize_src: expected.calc_nearest_slim_step(400)
    },

    large: {
      devicePixelRatio: 1,
      size: {
        width: 1024,
        height: 768
      },

      halfsize: 512,
      halfsize_src: expected.calc_nearest_slim_step(512)
    }

};

expected.mobiles = {
  // NOTE: this is not the larger 'plus' version
  iphone6: {
    landscape: {
      devicePixelRatio: 2,
      halfsize: 333, // 1334/4
      // first factor in dpr, then round up to nearest step
      halfsize_src: expected.calc_nearest_slim_step(333 * 2)
    },
    portrait: {
      devicePixelRatio: 2,
      halfsize: 180,
      // first factor in dpr, then round up to nearest step
      halfsize_src: expected.calc_nearest_slim_step(180 * 2)
    }
  }
};
