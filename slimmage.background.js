/**
 * @preserve Slimmage Background Plugin 0.4.2, use with ImageResizer. MIT/Apache2 licensed by Imazen, HiQ Finland, and ProWorks Corporation
 */

/* We often use string instead of dot notation to keep 
   Closure Compiler's advanced mode from breaking APIs */
/*jshint sub:true*/

(function (w) { //w==window
    // Enable strict mode
    "use strict";

    var s =  window['slimmage'];
	
	s['adjustBackgroundImageSrc'] = function(elem, previousSrc) {
	    var cssMaxWidth = s['getCssPixels'](elem, 'max-width');             // Note: The div or element with data-slimmage-bg needs to have max-width: 100% as a part of its styles.
	    var result = s['getImageInfo'](cssMaxWidth ? cssMaxWidth : 2000,    //       This check will fall back if max-width is not set so the image doesn't break.
                                       previousSrc,
                                       elem.getAttribute('data-pixel-width') | 0,
                                       elem);
 
        if (result){
          s.setAttr(elem,'data-pixel-width',result['data-pixel-width']);
          elem.style.backgroundImage = "url(" + result['src'] + ")";
          if (!elem.style.backgroundImage) elem.style.backgroundImage = "url(" + previousSrc + ")";
		}
    }

	s['beforeAdjustSrc'] = function(){
		if (w.document.querySelectorAll) {
		    var k, kl;
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
	}
	
}(this));