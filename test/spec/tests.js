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
    s = window.slimmage
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

});
