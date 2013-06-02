(function (w) { //w==window
    // Enable strict mode
    "use strict";

    w.slimage = {};
 
    w.slimage.adjustImageSrcWithData = function(img, originalSrc, wImg){
        var trueWidth = wImg.offsetWidth;
        wImg.parentNode.removeChild(wImg);
        
        if (window.devicePixelRatio) {
            trueWidth *= window.devicePixelRatio;
        }
        
        var maxwidth = Math.min(2048,trueWidth); //Limit size to 2048.

        //Minimize variants for caching improvements; round up to nearest multiple of 160
        maxwidth = maxwidth - (maxwidth % 160) + 160; //Will limit to 13 variations

        img.src =  originalSrc.replace(/width\s*=\s*\d+/i,"width=" + maxwidth);
    };
    
    w.slimage.adjustImageSrc = function (img, originalSrc) {
        if (!img.addEventListener) {
            img.src = originalSrc;
            return; //Use fallback img on older IE versions.
        }
        var wImg = img.cloneNode();
        wImg.src="";
        wImg.style.paddingBottom="-1px";
        img.parentNode.insertBefore(wImg,img);

        var imgLoaded = function(){
            wImg.removeEventListener("load",imgLoaded);
            w.slimage.adjustImageSrcWithData(img,originalSrc, wImg);
        };
        //Load a 4,000 pixel wide image, see what the resulting true width is.
        wImg.addEventListener("load", imgLoaded, false);
        wImg.src =                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAD6AAAAABCAAAAADvHA58AAAACXZwQWcAAA+gAAAAAQDjne1PAAAAG0lEQVRIx+3BIQEAAAACIP+f1hkWIAUAAADuBuaLkULU/NTrAAAAAElFTkSuQmCC";
    };

    w.slimage.checkResponsiveImages = function (delay) {
        if (w.slimage.timeoutid > 0) w.clearTimeout(w.slimage.timeoutid);
        w.slimage.timeoutid = 0;
        if (delay && delay > 0){
            w.slimage.timeoutid = w.setTimeout(w.slimage.checkResponsiveImages,delay);
            return;
        }
        
        if (console) console.log("Scanning for noscript tags, updating images");
        //1. Copy images out of noscript tags, but hide 'src' attribute as data-src
        var n = w.document.getElementsByTagName("noscript");
        for (var i = 0, il = n.length; i < il; i++) {
            var ns = n[i];
            if (ns.getAttribute("data-ri") !== null){
                //noscript isn't part of DOM, so we have to recreate it, unescaping html, src->data-src 
                var div = w.document.createElement('div');
                div.innerHTML = ns.innerHTML.replace(/\s+src\s*=\s*(['"])/i, " data-src=$1").
                    replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
                
 
                var childImages = div.getElementsByTagName("img");
                for (var j = 0, jl = childImages.length; j < jl; j++) {
                    var ci = childImages[j];
                    if (ci.src !== null && ci.src.length > 0){
                        ci.setAttribute("data-src", ci.src);
                        ci.src = "";
                    }
                    ci.setAttribute("data-ri", true);
                    ns.parentNode.insertBefore(ci, ns);
                }
            }
        }
        //2. Remove old noscript tags
        for (var i = 0, il = n.length; i < il; i++) {
            if (n[i].getAttribute("data-ri") !== null){    
                n[i].parentNode.removeChild(n[i]);
            }
        }

        //3. Find images with data-ri and run adjustImageSrc.
        var images = w.document.getElementsByTagName("img");
        for (var i = 0, il = images.length; i < il; i++) {
            if (images[i].getAttribute("data-ri") !== null) {
                w.slimage.adjustImageSrc(images[i], images[i].getAttribute("data-src") || images[i].src);
            }
        }
    };

    var h = w.slimage.checkResponsiveImages;
    // Run on resize and domready (w.load as a fallback)
    if (w.addEventListener) {
        w.addEventListener("resize", function(){h(200);}, false);
        w.addEventListener("DOMContentLoaded", function () {
            h();
            // Run once only
            w.removeEventListener("load", h, false);
        }, false);
        w.addEventListener("load", h, false);
    } else if (w.attachEvent) {
        w.attachEvent("onload",h);
    }
}(this));
