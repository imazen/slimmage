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

    });

  });

});
