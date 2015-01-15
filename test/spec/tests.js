describe('window', function () {
  it('should have slimmage', function () {
    expect(window).to.have.property('slimmage');
  });
});

describe('slimmage', function () {
  var s;
  before(function(){
    s = window.slimmage;
  });

  it('should be an object', function () {
    expect(s).to.be.an('object');
  });

  it('should have checkResponsiveImages', function () {
    expect(s).to.have.property('checkResponsiveImages');
  });

  it('should have widthStep', function () {
    expect(s).to.have.property('widthStep');
  });

  it('should have jpegQuality', function () {
    expect(s).to.have.property('jpegQuality');
  });

  it('should have jpegRetinaQuality', function () {
    expect(s).to.have.property('jpegRetinaQuality');
  });

  describe('checkResponsiveImages',function() {
    after(function() {
      s.readyCallback.restore();
    });

    it('should call readyCallback',function() {

      // create a function
      s.readyCallback = function() {
        expect(this).to.be(s);
      };

      // spy on it
      sinon.spy(s, "readyCallback"); // spy on callback attached to slimmage 's'

      // call parent 'calling' function
      s.checkResponsiveImages();

      // our spy should have been called as a result, in this case, only once
      expect(s.readyCallback.calledOnce).to.be(true);
    });

    it('should call adjustImageSrc ',function() {

      // create a function
      s.adjustImageSrc = function() {
        expect(this).to.be(s);
      };

      // spy on it
      sinon.spy(s, "adjustImageSrc"); // spy on callback attached to slimmage 's'

      // call parent 'calling' function
      s.checkResponsiveImages();

      // our spy should have been called as a result, in this case, only once
      expect(s.adjustImageSrc.calledOnce).to.be(true);

      s.adjustImageSrc.restore();
    });

    it('should call beforeAdjustSrc', function(){

      s.beforeAdjustSrc = function(){
        expect(this).to.be(s);
      };

      sinon.spy(s, "beforeAdjustSrc");

      //act - call parent 'calling' function
      s.checkResponsiveImages();

      // our spy should have been called as a result, in this case, only once
      expect(s.beforeAdjustSrc.calledOnce).to.be(true);

      s.beforeAdjustSrc.restore();
      delete s.beforeAdjustSrc;
    });
  });

  describe('mutateUrl', function(){
    it('should only affect the querystring', function(){
      var result = s.mutateUrl(
        "path?a=true&b=false#hash",
        function(){},
        function(p, d, k, v){
          return d + k + "=cats";
        }, function(q){return q;});

      expect(result).to.be("path?a=cats&b=cats#hash");

    });

    it('should clean up delimiters', function(){
      var result = s.mutateUrl(
        "path?&a=true&&b=false#hash",
        function(){},
        function(p, d, k, v){
          return (k && v) ? ('&' + d + k + "=cats") : '';
        }, function(q){return q;});

      expect(result).to.be("path?a=cats&b=cats#hash");
    });
  });
  describe('getImageInfo', function(){

    it('should call adjustImageParameters with valid data', function(){

      s.adjustImageParameters = function(data){
        expect(data.width).to.be.above(10);
        expect(data.src).to.be("http://z.zr.io/ri/1s.jpg?width=150");
        expect(data.dpr).to.be.within(1,3);
        expect(data.requestedWidth).to.be(Math.round(Math.ceil(100 * data.dpr / 160) * 160));
        expect(data.quality).to.be.within(10,100);
        data.requestedWidth=200;
      };

      sinon.spy(s, "adjustImageParameters");

      //act
      var result = s.getImageInfo(100,"http://z.zr.io/ri/1s.jpg?width=150",0);

      expect(s.adjustImageParameters.calledOnce).to.be(true);

      expect(result.src).to.be("http://z.zr.io/ri/1s.jpg?width=200");
      expect(result["data-pixel-width"]).to.be(200);

      s.adjustImageParameters.restore();
      delete s.adjustImageParameters;
    });

    it('should always round up', function(){

      var dpr = window.devicePixelRatio || 1;
      var info = s.getImageInfo(159/dpr,"im?width=5",0);
      expect(info["data-pixel-width"]).to.be(160);

      info = s.getImageInfo(1,"im?width=5",0);
      expect(info["data-pixel-width"]).to.be(160);


      info = s.getImageInfo(160/dpr,"im?width=5",0);
      expect(info["data-pixel-width"]).to.be(160);

      info = s.getImageInfo(161/dpr,"im?width=5",0);
      expect(info['data-pixel-width']).to.be(320);

    });

    it('should not request a zero-width image', function(){

      var result = s.getImageInfo(0,"im?width=5",0);
      expect(result).to.be(null);

    });


    it('should adjust height if present, maintaining aspect ratio', function(){
      var dpr = window.devicePixelRatio || 1;

      var result = s.getImageInfo(100 /dpr,"im?width=16&height=9",0);
      expect(result.src).to.be("im?width=160&height=90");
    });

   it('should account for applied zoom', function(){
      var dpr = window.devicePixelRatio || 1;
      var result = s.getImageInfo(100/dpr,"im?width=16&height=9&zoom=2",0);
      expect(result['data-pixel-width']).to.be(160); //160px is the bitmap width we request
      expect(result.src).to.be("im?width=80&height=45&zoom=2"); //But only because how zoom is interpreted.
    });

  });

  var css_ids = ['twenty_px','twenty_per','two_em','two_cm','two_in'];
  var css_value_pattern = /[0-9.]+(em|px|%|cm|in)/;
  var decimal_pattern = /[0-9.]+/;
  var $id = function(id){return document.getElementById(id);};

   describe('getCssPixels', function() {
    it ('should return 20 for 20px', function(){
      expect(s.getCssPixels($id('twenty_px'), 'max-width')).to.be(20);
    });

    it ('should return 32 for two_em', function(){
      expect(s.getCssPixels($id('two_em'), 'max-width')).to.be(32);
    });

    it ('should return 76 +/- 1 for two_cm', function(){
      expect(s.getCssPixels($id('two_cm'), 'max-width')).to.be.within(75,77);
    });

    it ('should return 192 for two_in', function(){
      expect(s.getCssPixels($id('two_in'), 'max-width')).to.be(192);
    });


    it ('should return 20% of parent width (+/- 5px) for twenty_per', function(){
      var parentWidth = $id('twenty_per').parentNode.offsetWidth;
      expect(parentWidth).to.be.above(1);


      expect(s.getCssPixels($id('twenty_per'), 'max-width')).to.be.within(parentWidth /5 - 5, parentWidth/5 + 5);
    });



    var makeTestFn = function(id){
     it('should return a decimal number for the max-width of #' + id,function(){
        var value = s.getCssPixels($id(id), 'max-width');
        expect(value).to.match(decimal_pattern);
      });
    };

    for (var i = 0; i < css_ids.length; i++) {
      makeTestFn.call(this,css_ids[i]);
    }


  });

  describe('getCssValue', function() {

    var makeTestFn = function(id){
     it('should return a css value for the max-width of #' + id,function(){
        var value = s.getCssValue($id(id), 'max-width');
        expect(value).to.match(css_value_pattern);
      });
    };

    for (var i = 0; i < css_ids.length; i++) {
      makeTestFn.call(this,css_ids[i]);
    }

  });

});
