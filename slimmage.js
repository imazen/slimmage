/* Slimmage 0.2.3, use with ImageResizer. MIT/Apache2 dual licensed by Imazen */

(function (w) { //w==window
    // Enable strict mode
    "use strict";

    var s =  window.slimmage || {};
    /** @expose **/
    window.slimmage = s;
    if (s.verbose === undefined) /** @expose **/ s.verbose = true;
    if (s.tryWebP === undefined) /** @expose **/ s.tryWebP = false;
    if (s.readyCallback === undefined) /** @expose **/ s.readyCallback = null;

    var log = function(){ if (w.slimmage.verbose && w.console && w.console.log) try {w.console.log.apply(w.console,arguments);}catch(e){}};
    s.beginWebPTest = function(){
        if (!s.tryWebP || s._testingWebP) return;
        s._testingWebP = true;

        var WebP=new Image();
        WebP.onload=WebP.onerror=function(){
            s.webp = (WebP.height==2);
        };
        WebP.src='data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    };
   
    s.getCssValue = function(target, hyphenProp){
      var val = typeof(window.getComputedStyle) != "undefined" && window.getComputedStyle(target, null).getPropertyValue(hyphenProp);
      if (!val && target.currentStyle){
        val = target.currentStyle[hyphenProp.replace(/([a-z])\-([a-z])/, function(a,b,c){ return b + c.toUpperCase();})] || target.currentStyle[hyphenProp];
      }
      return val;
    };

    s.getCssPixels = function(target, hyphenProp){
      var val = s.getCssValue(target,hyphenProp);

      //We can return pixels directly, but not other units
      if (val.slice(-2) == "px") return parseFloat(val.slice(0,-2));

      //Create a temporary sibling div to resolve units into pixels.
      var temp = document.createElement("div");
      temp.style.overflow = temp.style.visibility = "hidden"; 
      target.parentNode.appendChild(temp);  
      temp.style.width = val;
      var pixels = temp.offsetWidth;
      target.parentNode.removeChild(temp);
      return pixels;
    };

    s.nodesToArray = function (nodeList) {
        var array = [];
        // iterate backwards ensuring that length is an UInt32
        for (var i = nodeList.length >>> 0; i--;) {
            array[i] = nodeList[i];
        }
        return array;
    };
    //Expects virtual, not device pixel width
    s.adjustImageSrcWithWidth = function (img, originalSrc, width) {
        var data = {
            webp: s.webp,
            width: width,
            dpr: window.devicePixelRatio || 1
        }
        data.requestedWidth = Math.min(2048, data.width * data.dpr), //Limit size to 2048.
        data.quality = (data.dpr > 1.49) ? 80 : 90 //Default quality
        if (s.webp) data.quality = data.dpr > 1.49 ? 65 : 78;
		
        //Minimize variants for caching improvements; round up to nearest multiple of 160
        data.requestedWidth = data.requestedWidth - (data.requestedWidth % 160) + 160; //Will limit to 13 variations

        var oldpixels = img.getAttribute("data-pixel-width") | 0;

        if (s.adjustImageParameters && typeof(s.adjustImageParameters) === "function") {
            s.adjustImageParameters(data);
        }

        if (data.requestedWidth > oldpixels) {
            //Never request a smaller image once the larger one has already started loading
            var newSrc = originalSrc.replace(/width=\d+/i, "width=" + data.requestedWidth).replace(/quality=[0-9]+/i,"quality=" + data.quality);
            if (s.webp) newSrc = newSrc.replace(/format=[a-z]+/i,"format=webp");
            img.src =  newSrc; 
            img.setAttribute("data-pixel-width", data.requestedWidth);
            log("Slimming: updating " + newSrc)
        }
    };
    s.adjustImageSrc = function (img, originalSrc) {
        s.adjustImageSrcWithWidth(img, originalSrc, s.getCssPixels(img, "max-width"));
    };

    s.checkResponsiveImages = function (delay) {
        if (s.timeoutid > 0) w.clearTimeout(s.timeoutid);
        s.timeoutid = 0;
        if (delay && delay > 0) {
            s.timeoutid = w.setTimeout(s.checkResponsiveImages, delay);
            return;
        }
        var stopwatch = new Date().getTime();

        var newImages = 0;
        //1. Copy images out of noscript tags, but hide 'src' attribute as data-src
        var n = s.nodesToArray(w.document.getElementsByTagName("noscript"));
        for (var i = 0, il = n.length; i < il; i++) {
            var ns = n[i];
            if (ns.getAttribute("data-slimmage") !== null) {
                
                var div = w.document.createElement('div');
                var contents = (ns.textContent || ns.innerHTML);
                if (!contents || contents.replace(/[\s\t\r\n]+/,"").length == 0){
                    //IE doesn't let us touch noscript, so we have to use attributes.
                    var img = new Image();
                    for (var ai = 0; ai < ns.attributes.length; ai++) {
                        var a = ns.attributes[ai];
                        if (a && a.specified && a.name.indexOf("data-img-") == 0){
                            img.setAttribute(a.name.slice(9 - a.name.length),a.value);
                        }
                    }
                    div.appendChild(img);
                }else{
                    //noscript isn't part of DOM, so we have to recreate it, unescaping html, src->data-src 
                    div.innerHTML = contents.replace(/\s+src\s*=\s*(['"])/i, " data-src=$1").
                        replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                }
                //Clear source values before we add it back to the dom, ensure data-slimmage is set.
                var childImages = div.getElementsByTagName("img");
                for (var j = 0, jl = childImages.length; j < jl; j++) {
                    var ci = childImages[j];
                    if (ci.src !== null && ci.src.length > 0) {
                        ci.setAttribute("data-src", ci.src);
                        ci.src = "";
                    }
                    ci.setAttribute("data-slimmage", true);
                    ns.parentNode.insertBefore(ci, ns);
                    newImages++;
                }
                //2. Remove old noscript tags
                ns.parentNode.removeChild(ns);
            }
        }

        //3. Find images with data-slimmage and run adjustImageSrc.
        var totalImages = 0;
        var images = s.nodesToArray(w.document.getElementsByTagName("img"));
        for (var i = 0, il = images.length; i < il; i++) {
            if (images[i].getAttribute("data-slimmage") !== null) {
                var originalSrc = images[i].getAttribute("data-src") || images[i].src;
                s.adjustImageSrc(images[i], originalSrc);
                totalImages++;
            }
        }

        //4. Callback when ready
        if(typeof s.readyCallback === 'function') {
            s.readyCallback();
        }
        
        log("Slimmage: restored " + newImages + " images from noscript tags; sizing " + totalImages + " images. " + (new Date().getTime() - stopwatch) + "ms");
    };

    var h = s.checkResponsiveImages;
    // Run on resize and domready (w.load as a fallback)
    if (w.addEventListener) {
        w.addEventListener("resize", function () { h(500); }, false);
        w.addEventListener("DOMContentLoaded", function () {
            h();
            // Run once only
            w.removeEventListener("load", h, false);
        }, false);
        w.addEventListener("load", h, false);
    } else if (w.attachEvent) {
        w.attachEvent("onload", h);
    }
    //test for webp support
    s.beginWebPTest();
}(this));
