/**
 * @preserve Slimmage 0.4.2, use with ImageResizer. MIT/Apache2 dual licensed by Imazen 
 */

/* We often use string instead of dot notation to keep 
   Closure Compiler's advanced mode from breaking APIs */
/*jshint sub:true*/

(function (w) { //w==window
    // Enable strict mode
    "use strict";

    var s =  window['slimmage'] || {};
    window['slimmage'] = s;
    if (s['verbose'] === undefined) {           s['verbose'] = false;}
    if (s['tryWebP'] === undefined) {           s['tryWebP'] = false;}
    if (s['maxWidth'] === undefined) {          s['maxWidth'] = 2048;}
    if (s['widthStep'] === undefined) {         s['widthStep'] = 160;}
    if (s['jpegQuality'] === undefined) {       s['jpegQuality'] = 90;}
    if (s['jpegRetinaQuality'] === undefined) { s['jpegRetinaQuality'] = 80;}
    if (s['webpTimeout'] === undefined){        s['webpTimeout'] = 0;}
    s['changed'] = [];

    var log = function(){ if (s['verbose'] && w.console && w.console.log) try {w.console.log.apply(w.console,arguments);}catch(e){}};
    s.beginWebPTest = function(){
        if (!s['tryWebP'] || s._testingWebP) return;
        s._testingWebP = true;

        var WebP=new Image();
        WebP.onload=WebP.onerror=function(){
            s['webp'] = (WebP.height==2);
            s._testingWebP = false;
            if (s.cr) { s.cr(); }
        };
        WebP.src='data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    };
    //test for webp support ASAP
    s.beginWebPTest();

    s.setAttr = function(elem, name, value){
      name = name.toLowerCase();
      if (name == "class"){ elem.className = value;}
      else if (name == "tabindex") {elem.tabIndex = value;}
      else if (name == "usemap") {elem.useMap = value;}
      else{
        elem.setAttribute(name,value);
      }
      
    };
    s['setAttribute'] = s.setAttr;

    s.is_blank = function(v){ return v === "none" || v === null || v === undefined || v === "" || v === false;};
    s['getCssValue'] = function(target, hyphenProp){
      //See http://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser

      var val = typeof(window.getComputedStyle) != "undefined" && window.getComputedStyle(target, null).getPropertyValue(hyphenProp);

      // Some browsers (IE8, Firefox 28) read "none" when not set. Others (IE6) respond with undefined. A value of
      // "none" is invalid and would cause an exception or be interpreted as 
      if (!s.is_blank(val)){ 
        return val; 
      }

      if (target.currentStyle){
        val = target.currentStyle[hyphenProp.replace(/([a-z])\-([a-z])/, function(a,b,c){ return b + c.toUpperCase();})] || target.currentStyle[hyphenProp];
      }
      
      return s.is_blank(val) ? null : val;
    };

    s['getCssPixels'] = function(target, hyphenProp){
      var val = s['getCssValue'](target,hyphenProp);

      if (val === null || val === "0" || val === 0) return val;

      //We can return pixels directly, but not other units
      if (val.slice(-2) == "px") return parseFloat(val.slice(0,-2));

      //Create a temporary sibling div to resolve units into pixels.
      var temp = document.createElement("div");
      temp.style.overflow = temp.style.visibility = "hidden"; 
      temp.style.cssFloat = "none";
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

    /*
      No URI decoding/encoding is perfomed on keys or values. Caller's responsibility.

      vistor and mutator are applied to string.replace -> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
      params:
      1. entire pair, incl. (optional) &  and = 
      2. '&' (if present)
      3. key
      4. value

      mutator's result is honored. Must return param 1, or provide valid replacement.
      
      injector(query) is responsible for adding additional pairs if required. 
      It must not produce a malformatted query.
    */
    s['mutateUrl'] = function(url, visitor,mutator,injector){
      var m = /^([^?#]*)?(\?([^#]*))?(#.*)?/.exec(url);
      var q = m[3] || '';

      var qr = /(^&*|&+)([^&=]*)=?([^&]*)/g;
      q.replace(qr, visitor); //read-only, to gather data

      var newq = '?' + q.replace(qr, mutator).replace(/(?:^\?*&*)|(?:[?&]+$)/g,"").replace(/&&+/g,"&");

      return (m[1] || '') + injector(newq) + (m[4] || '');
    };

    //Expects virtual, not device pixel width
    s['getImageInfo'] = function (elementWidth, previousSrc, previousPixelWidth, previousElement) {
        var data = {
            'webp': s['webp'],
            'width': elementWidth,
            'dpr': window.devicePixelRatio || 1,
            'src': previousSrc, 
            'element': previousElement
        };
        //Determine quality percentage
        var high_density = s['webp'] ? 65 : s['jpegRetinaQuality'];
        var low_density = s['webp'] ? 78 : s['jpegQuality'];
        data['quality'] = data['dpr'] > 1.49 ? high_density : low_density;
      
        //Calculate raw pixels using devicePixelRatio. Limit size to maxWidth.
        var idealWidth = elementWidth * data['dpr']; 
        //Minimize variants for caching improvements; round up to nearest multiple of widthStep
        data['requestedWidth'] = Math.min(s['maxWidth'], //Limit size to maxWidth
                                  Math.round( //Round in case widthStep isn't an integer
                                    Math.ceil(idealWidth / s['widthStep']) * s['widthStep'] //Divide, ceiling, then multiply
                                            )
                                          );


        var a = s['adjustImageParameters'];
        if (a && typeof(a) === "function") {
            a(data);
        }
        var finalWidth = data['requestedWidth'];

        if (finalWidth > previousPixelWidth) {
            //Never request a smaller image once the larger one has already started loading
            var u = {}; //For storing raw pairs
            var c = {}; //For storing relevant parsed info
            var newSrc = s['mutateUrl'](
              previousSrc,
              //Visitor
              function(_,d, k,v){
                u[k.toLowerCase()] = v;
              }, 
              //Mutator
              function(p,d,k,v){

                //Parse existing values so we can make educated calculations for width/height
                if (c.zoom === undefined){
                  c.zoom = parseFloat(u.zoom || 1);
                  if (isNaN(c.zoom)){ c.zoom = 1; }
                  c.w = (finalWidth / c.zoom).toFixed();
                }
                if (c.ratio === undefined){
                  var w = parseFloat(u.width || u.w || u.maxwidth);
                  var h = parseFloat(u.height || u.h || u.maxheight);
                  if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0){
                    c.ratio = w/h;
                    c.h = (((finalWidth / c.zoom) / w) * h).toFixed();
                  }else{
                    c.ratio = 'noclue';
                  }
                }
                
                if (k.match(/^format$/i) && data['webp']) { return d + "format=webp"; }
                if (k.match(/^quality/i)) { return d + "quality=" + data['quality']; }
                
                if (k.match(/^(w|width|maxwidth)$/i)) { return d + k + "=" + c.w;}
                if (k.match(/^(h|height|maxheight)$/i)) { return d + k + "=" + c.h;}
                
                return p;
              }, 
              //Injector
              function(q){ return q;});
            
            return {'src': newSrc, 'data-pixel-width': finalWidth};
        }
        return null;
    };
    s['adjustImageSrc'] = function (img, previousSrc) {

        var cssMaxWidth = s['getCssPixels'](img, 'max-width');
        var result = s['getImageInfo'](cssMaxWidth,
                                       previousSrc,
                                       img.getAttribute('data-pixel-width') | 0,
                                       img);
        
        if (result){
          img.src = result['src'];
          s.setAttr(img,'data-pixel-width',result['data-pixel-width']);
          if (s['enforceCss']){
            if (cssMaxWidth < result['data-pixel-width']){
              img.style.width = s['getCssValue'](img,'max-width'); 
              s.setAttr(img,'data-width-enforced',true);
            }else{
              img.style.width = 'auto';
            }
          }
          s['changed'].push(img);
          log("Slimming: updating " + result['src']);
        }else if (s['enforceCss'] && img.getAttribute('data-width-enforced')){
          var imageWidth = parseFloat(img.getAttribute('data-pixel-width'));
          if (!isNaN(imageWidth) && cssMaxWidth >= imageWidth){
            img.style.width = 'auto';
            img.removeAttribute('data-width-enforced');
          }
        }

    };
    s.cr = function (delay) {
        var i, il, j, jl, k, kl;

        if (s.timeoutid > 0) w.clearTimeout(s.timeoutid);
        s.timeoutid = 0;

        if (s._testingWebP && s['webpTimeout'] > 0 && !s.webp_waiting){
          s.webp_waiting = true;
          delay = s['webpTimeout'];
        }
        if (delay && delay > 0) {
            s.timeoutid = w.setTimeout(s.cr, delay);
            return;
        }
        var stopwatch = new Date().getTime();

        var newImages = 0;
        //1. Copy images out of noscript tags, but hide 'src' attribute as data-src
        var n = s.nodesToArray(w.document.getElementsByTagName("noscript"));
        for (i = 0, il = n.length; i < il; i++) {
            var ns = n[i];
            if (ns.getAttribute("data-slimmage") !== null) {
                
                var div = w.document.createElement('div');
                var contents = (ns.textContent || ns.innerHTML);
                if (!contents || contents.replace(/[\s\t\r\n]+/,"").length === 0){
                    //IE doesn't let us touch noscript, so we have to use attributes.
                    var img = new Image();
                    for (var ai = 0; ai < ns.attributes.length; ai++) {
                        var a = ns.attributes[ai];
                        if (a && a.specified && a.name.indexOf("data-img-") === 0){
                            s.setAttr(img,a.name.slice(9 - a.name.length),a.value);
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
                for (j = 0, jl = childImages.length; j < jl; j++) {
                    var ci = childImages[j];
                    if (ci.src !== null && ci.src.length > 0) {
                        s.setAttr(ci,"data-src", ci.src);
                        ci.src = "";
                    }
                    s.setAttr(ci,"data-slimmage", true);
                    ns.parentNode.insertBefore(ci, ns);
                    newImages++;
                }
                //2. Remove old noscript tags
                ns.parentNode.removeChild(ns);
            }
        }

        //3. Let plugins inject custom behavior
        if('function' === typeof s['beforeAdjustSrc']) {
            s['beforeAdjustSrc']();
        }

        //4. Find images with data-slimmage and run adjustImageSrc.
        var totalImages = 0;
        var images = s.nodesToArray(w.document.getElementsByTagName("img"));
        for (k = 0, kl = images.length; k < kl; k++) {
            if (images[k].getAttribute("data-slimmage") !== null) {
                var previousSrc = images[k].getAttribute("data-src") || images[k].src;
                s['adjustImageSrc'](images[k], previousSrc);
                totalImages++;
            }
        }

        var changed = s['changed'].slice();
        s['changed'].length = 0;

        //5. Callback when ready
        if((changed.length > 0 || !s.readyCalled)  && 'function' === typeof s['readyCallback']) {
            s['readyCallback'](changed);
            s.readyCalled = true;
        }
        
        log("Slimmage: restored " + newImages + " images from noscript tags, checked " + totalImages + " images, changed " + changed.length + ". " + (new Date().getTime() - stopwatch) + "ms");
    };

    s['checkResponsiveImages'] = s.cr;
    // Run on resize and domready (w.load as a fallback)
    if (w.addEventListener) {
        w.addEventListener("resize", function () { s.cr(500); }, false);
        w.addEventListener("DOMContentLoaded", function () {
            s.cr();
            // Run once only
            w.removeEventListener("load", s.cr, false);
        }, false);
        w.addEventListener("load", s.cr, false);
    } else if (w.attachEvent) {
        w.attachEvent("onload", s.cr);
        w.attachEvent("onresize",  function () { s.cr(500); });
    }
    
}(this));