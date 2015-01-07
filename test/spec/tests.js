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

  describe('getImageInfo', function(){
    
    it('should call adjustImageParameters with valid data', function(){

      s.adjustImageParameters = function(data){
        expect(data.width).to.be.above(10);
        expect(data.src).to.be("http://z.zr.io/ri/1s.jpg?width=150");
        expect(data.dpr).to.be.within(1,3);
        expect(data.requestedWidth).to.be(160 * data.dpr);
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
      expect(info["data-pixel-width"]).to.be(320);

    });

    it('should not request a zero-width image', function(){

      var result = s.getImageInfo(0,"im?width=5",0);
      expect(result).to.be(null);

    });

  });

});
