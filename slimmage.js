/* Slimmage 0.2.2, use with ImageResizer. MIT/Apache2 dual licensed by Imazen */
/*jslint browser: true, devel: true, bitwise: true, plusplus: true */
(function (win) {
  "use strict";

  var slmg = window.slimmage || {},
	  log = function () {
	    if (win.slimmage.verbose && win.console && win.console.log) {
	      try {
	        win.console.log.apply(win.console, arguments);
	      } catch (ignore) { }
	    }
	  };

  window.slimmage = slmg;

  if (slmg.verbose === undefined) {
    slmg.verbose = false;
  }

  if (slmg.tryWebP === undefined) {
    slmg.tryWebP = false;
  }

  slmg.beginWebPTest = function () {
    if (!slmg.tryWebP || slmg.testingWebP) {
      return;
    }
    slmg.testingWebP = true;

    var webP = new Image();
    webP.onload = webP.onerror = function () {
      slmg.webp = (webP.height === 2);
    };

    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  };

  slmg.getCssValue = function (target, hyphenProp) {
    var currentStyle = typeof (window.getComputedStyle) !== "undefined" && window.getComputedStyle(target, null).getPropertyValue(hyphenProp);
    if (!currentStyle && target.currentStyle) {
      currentStyle = target.currentStyle[hyphenProp.replace(/([a-z])\-([a-z])/, function (a, b, c) {
        return b + c.toUpperCase();
      })] || target.currentStyle[hyphenProp];
    }
    return currentStyle;
  };

  slmg.getCssPixels = function (target, hyphenProp) {
    var currentStyle = slmg.getCssValue(target, hyphenProp),
		temp,
		offsetWidth;

    //We can return pixels directly, but not other units
    if (currentStyle.slice(-2) === "px") {
      return parseFloat(currentStyle.slice(0, -2));
    }

    //Create a temporary sibling div to resolve units into pixels.
    temp = document.createElement("div");
    temp.style.overflow = temp.style.visibility = "hidden";
    target.parentNode.appendChild(temp);
    temp.style.width = currentStyle;
    offsetWidth = temp.offsetWidth;
    target.parentNode.removeChild(temp);
    return offsetWidth;
  };

  slmg.nodesToArray = function (nodeList) {
    var array = [],
		i = nodeList.length >>> 0;

    while (i--) {
      array[i] = nodeList[i];
    }

    return array;
  };

  //Expects virtual, not device pixel width
  slmg.adjustImageSrcWithWidth = function (img, originalSrc, width) {
    var devicePixelRatio = window.devicePixelRatio || 1,
		trueWidth = width * devicePixelRatio,
		quality = (devicePixelRatio > 1.49) ? 90 : 80,
		maxwidth = Math.min(2048, trueWidth), //Limit size to 2048.
		oldpixels,
		newSrc;

    if (slmg.webp) {
      quality = devicePixelRatio > 1.49 ? 65 : 78;
    }

    //Minimize variants for caching improvements; round up to nearest multiple of 160
    maxwidth = maxwidth - (maxwidth % 160) + 160; //Will limit to 13 variations

    oldpixels = img.getAttribute("data-pixel-width") | 0;

    if (maxwidth > oldpixels) {
      //Never request a smaller image once the larger one has already started loading
      newSrc = originalSrc.replace(/width=\d+/i, "width=" + maxwidth).replace(/quality=[0-9]+/i, "quality=" + quality);
      if (slmg.webp) {
        newSrc = newSrc.replace(/format=[a-z]+/i, "format=webp");
      }
      img.src = newSrc;
      img.setAttribute("data-pixel-width", maxwidth);
      log("Slimming: updating " + newSrc);
    }
  };

  slmg.adjustImageSrc = function (img, originalSrc) {
    slmg.adjustImageSrcWithWidth(img, originalSrc, slmg.getCssPixels(img, "max-width"));
  };

  slmg.checkResponsiveImages = function (delay) {
    var stopwatch = new Date().getTime(),
		newImages = 0,
		//1. Copy images out of noscript tags, but hide 'src' attribute as data-src
		nodeArr = slmg.nodesToArray(win.document.getElementsByTagName("noscript")),
		nodeAttr,
		node,
		i = 0,
		j = 0,
		k = 0,
		arrLength = 0,
		totalImages,
		images,
		div,
		contents,
		img,
		childImages,
		childImage,
		originalSrc;

    if (slmg.timeoutid > 0) {
      win.clearTimeout(slmg.timeoutid);
    }
    slmg.timeoutid = 0;
    if (delay && delay > 0) {
      slmg.timeoutid = win.setTimeout(slmg.checkResponsiveImages, delay);
      return;
    }

    for (i = 0, arrLength = nodeArr.length; i < arrLength; i++) {
      node = nodeArr[i];
      if (node.getAttribute("data-slimmage") !== null) {

        div = win.document.createElement('div');
        contents = (node.textContent || node.innerHTML);
        if (!contents || contents.replace(/[\s\t\r\n]+/, "").length === 0) {
          //IE doesn't let us touch noscript, so we have to use attributes.
          img = new Image();
          for (k = 0; k < node.attributes.length; k++) {
            nodeAttr = node.attributes[k];
            if (nodeAttr && nodeAttr.specified && nodeAttr.name.indexOf("data-img-") === 0) {
              img.setAttribute(nodeAttr.name.slice(9 - nodeAttr.name.length), nodeAttr.value);
            }
          }
          div.appendChild(img);
        } else {
          //noscript isn't part of DOM, so we have to recreate it, unescaping html, src->data-src 
          div.innerHTML = contents.replace(/\s+src\s*=\s*(['"])/i, " data-src=$1").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        }
        //Clear source values before we add it back to the dom, ensure data-slimmage is set.
        childImages = div.getElementsByTagName("img");
        for (j = 0; j < childImages.length; j++) {
          childImage = childImages[j];
          if (childImage.src !== null && childImage.src.length > 0) {
            childImage.setAttribute("data-src", childImage.src);
            childImage.src = "";
          }
          childImage.setAttribute("data-slimmage", true);
          node.parentNode.insertBefore(childImage, node);
          newImages++;
        }
        //2. Remove old noscript tags
        node.parentNode.removeChild(node);
      }
    }

    //3. Find images with data-slimmage and run adjustImageSrc.
    totalImages = 0;
    images = slmg.nodesToArray(win.document.getElementsByTagName("img"));
    for (i = 0, arrLength = images.length; i < arrLength; i++) {
      if (images[i].getAttribute("data-slimmage") !== null) {
        originalSrc = images[i].getAttribute("data-src") || images[i].src;
        slmg.adjustImageSrc(images[i], originalSrc);
        totalImages++;
      }
    }

    log("Slimmage: restored " + newImages + " images from noscript tags; sizing " + totalImages + " images. " + (new Date().getTime() - stopwatch) + "ms");
  };

  // Run on resize and domready (w.load as a fallback)
  if (win.addEventListener) {
    win.addEventListener("resize", function () {
      slmg.checkResponsiveImages(500);
    }, false);
    win.addEventListener("DOMContentLoaded", function () {
      slmg.checkResponsiveImages();
      // Run once only
      win.removeEventListener("load", slmg.checkResponsiveImages, false);
    }, false);
    win.addEventListener("load", slmg.checkResponsiveImages, false);
  } else if (win.attachEvent) {
    win.attachEvent("onload", slmg.checkResponsiveImages);
  }
  //test for webp support
  slmg.beginWebPTest();
}(window));
