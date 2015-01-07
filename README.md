## Slimmage - sane & simple responsive images
[![master](https://img.shields.io/travis/imazen/slimmage/master.svg?label=master)](https://travis-ci.org/imazen/slimmage/builds) [![unstable](https://img.shields.io/travis/imazen/slimmage/unstable.svg?label=unstable)](https://travis-ci.org/imazen/slimmage/builds)

Selenium status from most recent test run (may not be a published commit): [![Selenium Test Status](https://saucelabs.com/buildstatus/imazen)](https://saucelabs.com/u/imazen)
[![Selenium Test Status](https://saucelabs.com/browser-matrix/imazen.svg)](https://saucelabs.com/u/imazen)

Your wait for a sane, easily managed path to responsive images has now ended.

**With Slimmage, *CSS* controls which image size is downloaded, not HTML**


* **Media queries, breakpoints, nested percentages, & `max-width` work as expected**.
* **Works on > 99% of browsers. 3KB minified *vanilla js*, 1.5KB compressed.** [Download minified version via releases tab](https://github.com/imazen/slimmage/releases).
* **Cookie-free; works on first page load. Works with CDNs**.
* **Fully accessible; degrades gracefully without javascript**
* **Massive bandwidth reduction. No duplicate requests. Can auto-enable WebP and adjust compression based on pixel density**
* **Works with any [RIAPI-compliant](http://riapi.org) backend. [ImageResizer](http://imageresizing.net) is preferred.**

Handles any viewport size and pixel density with ease. Yes, retina and retina-like displays are supported.

Our automated tests currently check firefox, ie, chrome, and mobile safari.

0.2.3 was manually tested on IE6-10, Firefox 3.6-23, Opera 11-12, Safari 5-6, Chrome 14-28, Opera Mobile, and over a dozen mobile Webkit browsers. - essentially everything [supported by BrowserStack](http://www.browserstack.com/screenshots). In theory we should be supporting over 99.5% of browsers.

MIT/Apache dual licensed by [Imazen](http://imazen.io).

### [Demo page](http://imazen.github.io/slimmage/demo.html) using [PureCSS](http://purecss.io/), slimmage.js, & [ImageResizer](http://imageresizing.net).

**If [you're on Windows or IIS, read this guide for the easiest implementation path](http://imageresizing.net/blog/2013/effortless-responsive-images)**

## Sample markup

```html
<noscript data-slimmage>
  <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150" />
</noscript>

<style type="text/css">
  img.halfsize {max-width:50%;}
</style>

<script src="/slimmage.js" ></script>
```    
    
## Sample markup with IE6/7/8 support

IE6, 7, & 8 are unable to access the contents of a noscript tag, and we are therefore required to duplicate the attributes.
If you didn't care about non-javascript enabled users, you could drop the inner `img` element, but we wouldn't advise it.

```html
<noscript data-slimmage data-img-class="halfsize" data-img-src="http://z.zr.io/ri/1s.jpg?width=150">
  <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150" />
</noscript>
```

## Sample markup with WebP and quality adjustment enabled, console logging disabled.

```html
<noscript data-slimmage>
  <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150&format=jpg&quality=90" />
</noscript>

<style type="text/css">
  img.halfsize {max-width:50%;}
</style>

<script type="text/javascript">
    window.slimmage = {tryWebP:true, verbose:false};
</script>
<script src="/slimmage.js" ></script>
```

## Sample markup for LQIP (Low-quality image placeholders) mode

**Warning - this syntax will cause 2 network requests on many browsers**

```html
<img data-slimmage="true" src="http://z.zr.io/ri/1s.jpg?width=100&format=jpg&quality=75" />
```

## Sample markup for future browsers (IE11, etc)

**Warning - this syntax will cause 2 network requests on browsers which support image prefetching but don't support [Resource Priorities](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/ResourcePriorities/Overview.html).**

IE11 is [supposed to support the lazyload attribute](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/ResourcePriorities/Overview.html), and we expect other vendors will follow suit soon.

```html
<img lazyload data-slimmage="true" src="http://z.zr.io/ri/1s.jpg?width=100&format=jpg&quality=75" />
```


### Notes

* Slimmage requires "width=[number]" be present in the URL. This value specifies the image size when javascript is disabled, but is modified by slimmage.js under normal circumstances.
* It can also adjust compression quality based on device pixel ratio, if "quality=[number]" is present.
* If WebP is enabled, it can automatically detect and request WebP images instead.
* The final `max-width` applied to the element determines which image file size is downloaded. Unlike earlier versions, a sizing image is not used, and 'width' and 'height' properties are ignored in the selection process.
* Images are loaded immediately after stylesheets download. Slimmage add 2ms of javascript execution time per image.
* Images added to the page after DOMLoaded will not be detected by Slimmage unless you call `window.slimmage.checkResponsiveImages()` *after* they are on the page. If you use a separate lazy-load or jQuery plugin that modifies images, call checkResponsiveImages() after it completes its work.

**It's a good idea to use a helper method or HTML filter to generate slimmage's required markup. Everything works cross-browser today, but browser vendors have a long and venerable tradition of breaking responsive image solutions.**

* For IIS or ASP.NET, there's [SlimResponse](https://github.com/imazen/slimresponse), an output filter that simplifes the markup down to `<img src="image.jpg?width=150&slimmage=true" />`

Feel free to fork and add links to your HTML filters/helpers here!


### Release notes


* 0.1 - Dynamically injected a twin image tag with a sizer gif (4k wide transparent gif) to let the browser calculate the desired size, then used that for the image URI.
* 0.2 - Implemented direct reading of the calculated 'max-width' value and conversion of non-px units via a dynamic sibling div (faster and added IE6,7,8 support).
* 0.2.1 - Fixed IE bug related to console.log: https://github.com/imazen/slimmage/issues/2
* 0.2.2 - Fixed another IE bug related to console.log: https://github.com/imazen/slimmage/issues/2
* 0.2.3 - Added `window.slimmage.readyCallback` callback - occurs after first adjustment of all images. Added `s.adjustImageParameters(data)` to allow size/quality/format customization. Fixed incorrect quality calculation bug. All code contributed by Per Osbäck and Ola Andersson! Release tested on BrowserStack.
* 0.2.4 - Added automated test suite. (sorry for the delay in PR acceptance!).  
    Merge #25 from perosb - Pass image url into data structure to allow logic based on file name.  
    Merge #27 from dancek - Configurable max-width and quality parameters.  
    Merge #36 from dancek - Fix behavior when max-width is not defined (IE8) (replaces #18, fixes #29)  
    Refactored access notations to eliminate both minification errors and lint. Fix bug: Perfect multiples of stepWidth were being rounded up to the next interval (images larger than needed in some instances).  
* 0.2.5 - Merge #30 from Jeavon - Fix css size calculation when the parent div is floated in Safari (both OS X and iOS). (otherwise 0x0) 
* 0.3.0 - Make 'data.element' available to slimmage.adjustImageParameters, so plugins have more information  
    Add window.slimmage.beforeAdjustSrc callback function - this allows users to inject behavior between noscript parsing and img.src edits.  
    Replace adjustImageSrcWithWidth with getImageInfo, make adjustImageSrc responsible for more. Simplifies certain kinds of extension, such as background image support.


### Contributor notes

Please make all pull requests against the 'unstable' branch. Pull requests should include corresponding tests.


## FAQ

* I don’t want to be stuck with multiples of `stepWidth` (default: 160). Can I use arbitrary sizes? [Sure! window.slimmage.adjustImageParameters gives you full control](https://github.com/imazen/slimmage/issues/24#issuecomment-68944115).
* Does this support retina? [Absolutely! All pixel density variations should work perfectly](https://github.com/imazen/slimmage/issues/17).
* [Do you support lazy loading](https://github.com/imazen/slimmage/issues/16)? That depends on your definition. You can certainly use the `postpone` attribute to lower the priority of the image downloading. You can create or enable images at arbitrary times, and call `window.slimmage.checkResponsiveImages()` at any time to ‘fix them’, but slimmage doesn’t *in itself*, bake in a lazy-loading-as-you-scroll kind of feature/bug.
* It doesn’t work with my AJAXY-thingamabob! Slimmage can’t fix what isn’t there. Either [ensure Slimmage is loaded before the other script begins messing up the DOM](https://github.com/imazen/slimmage/issues/4), or call `window.slimmage.checkResponsiveImages()` after the DOM-mangling is complete and the images are visible.


### Other approaches

* [&lt;picture>](http://responsiveimages.org/) (good if you need art direction)
* [srcset](http://caniuse.com/#search=srcset) is gaining traction; 36% of users have access to the full syntax (both x and w), while 47.8% have access to pixel density switching. All browser plan on implementing the standard. Srcset requires nearly-impossible reasoning about the viewport and element size relationship (breakpoints and reflow, anyone?), and has a corresponding authorship burden.
* [Clown Car Technqiue by Estelle Weyl](https://github.com/estelle/clowncar) (SVG media queries for the win!)