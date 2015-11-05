
(function (w) { //w==window
    // Enable strict mode
    "use strict";

    var s =  window['slimmage'];
	
	s['adjustBackgroundImageSrc'] = function(elem, previousSrc) {
        var result = s['getImageInfo'](cssMaxWidth,
                                       previousSrc,
                                       elem.getAttribute('data-pixel-width') | 0,
                                       elem);
 
        if (result){
          s.setAttr(elem,'data-pixel-width',result['data-pixel-width']);
		  elem.style.backgroundImage = "url(" + newSrc + ")";
	      if (!elem.style.backgroundImage) elem.style.backgroundImage = "url(" + originalSrc + ")";
          log("Slimming: updating " + result['src']);
		}
    }

	s['beforeAdjustSrc'] = function(){
		if (w.document.querySelectorAll) {
			var i, il, j, jl, k, kl;
			var totalImages = 0;
			var images = s.nodesToArray(w.document.querySelectorAll("[data-slimmage-bg]"));
			for (k = 0, kl = images.length; k < kl; k++) {
				var previousSrc = images[k].getAttribute("data-slimmage-bg");
			    if (previousSrc !== null) {
                    s['adjustBackgroundImageSrc'](images[k], previousSrc);
                    totalImages++;
                }
			}
		}
        log("Slimmage: updated " + newImages + " images from background-image styles, checked " + totalImages + " images, changed " + changed.length + ". " + (new Date().getTime() - stopwatch) + "ms");
	}
	
}(this));