## Slimmage Test Spec


The project is Simmage.js: https://github.com/imazen/slimmage

Tests should verify a few key API points: 
On 'unstable'

### WD: Feature tests 
- Enabling WebP does not break any browser: window.slimmage = {tryWebP:true};
- Images do not break following a viewport size increase (or a container element resize, which may be easier to accomplish). 
- All images load correctly, and their final URLs reflect appropriate width and height values for the given viewport.
- ?? isRaipUrlValid

### Mocha-inside-browser: Unit tests
- Following are defined:
  - window.slimmage
    - .checkResponsiveImages
    - .widthStep
    - .jpegQuality
    - .jpegRetinaQuality
    - .maxWidth
- ?? Defer 'onload' to spy on methods, called by 'onload'?
- ?? wrap event listeners in a '#init' method
- window.slimmage.readyCallback is, in fact, called. 
- window.slimmage.adjustImageParameters is, in fact, called.



