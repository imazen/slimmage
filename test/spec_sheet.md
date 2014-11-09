## Slimmage Test Spec


The project is Simmage.js: https://github.com/imazen/slimmage

Tests should verify a few key API points: 
On 'unstable'

### Feature tests: using wd.js run locally against the wirejson protocal
- [ ] Enabling WebP does not break any browser: window.slimmage = {tryWebP:true};
  - ie: tests should pass with and without 'tryWebP'
- [ ] Images do not break following a viewport size increase 
  - ie: tests should pass after a viewport change
- [ ] Images load correctly - are they visible? correct size?
- [x] Final URLs reflect appropriate width and height values for the given viewport.
- ?? isRIAPIUrlValid

### Unit tests: Mocha is inside the browser
- Following are defined:
  - [x] window.slimmage with...
    - .checkResponsiveImages
    - .widthStep
    - .jpegQuality
    - .jpegRetinaQuality
    - .maxWidth
- ?? wrap event listeners in a '#init' method
- [ ] window.slimmage.readyCallback is, in fact, called. 
- [ ] window.slimmage.adjustImageParameters is, in fact, called.



