## Slimmage v0.2 - sane & simple responsive images

Your wait for a sane, easily managed path to responsive images has now ended.

**With Slimmage, *CSS* controls which image size is downloaded, not HTML**


* **Media queries, breakpoints, nested percentages, & `max-width` work as expected**.
* **Works on > 99% of browsers. 3KB minified *vanilla js*, 1.5KB compressed.**
* **Cookie-free; works on first page load. Works with CDNs**.
* **Fully accessible; degrades gracefully without javascript**
* **Massive bandwidth reduction. No duplicate requests. Can auto-enable WebP and adjust compression based on pixel density**
* **Works with any [RIAPI-compliant](http://riapi.org) backend. [ImageResizer](http://imageresizing.net) is preferred.**

Tested on IE6-10, Firefox 3.6-23, Opera 11-12, Safari 5-6, Chrome 14-28, Opera Mobile, and over a dozen mobile Webkit browsers. Essentially everything [supported by BrowserStack](http://www.browserstack.com/screenshots). In theory we should be supporting over 99.5% of browsers.

MIT/Apache dual licensed by [Imazen](http://imazen.io).

## Demo page
    
The (kinda lousy) [demo page](http://imazen.github.io/slimmage/demo.html
) uses PureCSS for the responsive grid, slimmage.js to modify the URIs, and ImageResizer for RESTful Image Processing.

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


### Notes

* Slimmage depends on finding "width=[number]" in the image URL. If it's not there, nothing will work.
* It can also adjust compression quality based on device pixel ratio, if "quality=[number]" is present.
* If WebP is enabled, it can automatically detect and request WebP images instead.
* The final `max-width` applied to the element determines which image file size is downloaded. Unlike earlier versions, a sizing image is not used, and 'width' and 'height' properties are ignored in the selection process.
* Images are loaded immediately after stylesheets download. Slimmage add 2ms of javascript execution time per image.


  
### Release notes


* 0.1 - Dynamically injected a twin image tag with a sizer gif (4k wide transparent gif) to let the browser calculate the desired size, then used that for the image URI.
* 0.2 - Implemented direct reading of the calculated 'max-width' value and conversion of non-px units via a dynamic sibling div (faster and added IE6,7,8 support).

