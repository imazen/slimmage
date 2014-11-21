describe('window', function () {
  it('should have slimmage', function () {
    expect(window).to.have.property('slimmage');
  });
});

describe('failing tests, to show things are working', function () {
  it('should fail in IE8', function () {
    expect(document).to.have.property('getElementsByClassName');
  });
  //it('should fail everywhere', function () {
    //expect(true).to.be(false)
  //});
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

  describe('readyCallback',function() {
    it('should be called',function(done) {
      // It's simple. slimmage should call this method. If is doesn't we'll hang until timeout.
      window.slimmage.readyCallback = function() { // we'll put our test cb in here later
        expect(this).to.be(s);
        done();
      };
    });
  });


  // it('',function(done) {
  //   sinon.spy(s, "checkResponsiveImages"); // spy on callback attached to slimmage 's'
  //   s.checkResponsiveImages.restore();
  //   done();
  // });

});
