Slimmage.js
=======

Context-friendly responsive image solution for 99.5% of browsers. 3KB minified; 1.5KB compressed. Adds 2ms/image javascript execution time.
Slimmage is focused on full-stack responsive imaging. It requires an RIAPI-compliant backend to perform on-demand resizing.


It is **CSS-friendly** - your sizing logic stays in your CSS files, and you can use media queries to control image dimensions. This means images don't start loading until the stylesheets are down, but that's a fair trade.

It is **context-aware** - if your images use 'max-width:100%' but are inside a column, they will be sized to the column width, not the screen width.

It is **CDN-smart** - images are sized in intervals of 160px to minimize the number of variants (this comes out to roughly 13 versions, and is configurable).

It **degrades gracefully** without javascript.

It is **accessbile** - the standard `<img>` tag is used. 

It is **vanilla js**

We tested it on IE6+, Firefox 3.6+, Opera 11+, Safari 5+, Chrome 14+, and a dozen mobile Webkit browsers. In theory we should be supporting 99.5% of browsers.

## Demo page
    
The [demo page](http://imazen.github.io/slimmage/demo.html
) uses PureCSS for the responsive grid, slimmage.js to modify the URIs, and ImageResizer for Restful Image Processing.



### Notes

* Slimmage depends on finding "width=[number]" in the image URL. If it's not there, nothing will work.
* It can also adjust compression quality based on device pixel ratio, if "quality=[number]" is present.
* If WebP is enabled, it can automatically detect and request WebP images instead.


## Sample markup

    <noscript data-slimmage>
      <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150" />
    </noscript>
    
    <style type="text/css">
      img.halfsize {max-width:50%;}
    </style>
    
    <script src="/slimage.js" ></script>
    
    
## Sample markup with IE6/7/8 support

IE6, 7, & 8 are unable to access the contents of a noscript tag, and we are therefore required to duplicate the attributes.
If you didn't care about non-javascript enabled users, you could drop the inner `img` element, but we wouldn't advise it.

    <noscript data-slimmage data-img-class="halfsize" data-img-src="http://z.zr.io/ri/1s.jpg?width=150">
      <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150" />
    </noscript>

## Sample markup with IE6/7/8 fallback

    <!--[if !IE]>--><noscript data-slimmage><!--<![endif]-->
      <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150" />
    <!--[if !IE]>--></noscript><!--<![endif]-->
    
## Sample markup with WebP and quality adjustment enabled, console logging disabled.

    <noscript data-slimmage>
      <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150&format=jpg&quality=90" />
    </noscript>
    
    <style type="text/css">
      img.halfsize {max-width:50%;}
    </style>
    
    <script type="text/javascript">
        window.slimage = {tryWebP:true, verbose:false};
    </script>
    <script src="/slimage.js" ></script>
    
    
### Release notes


* 0.1 - Dynamically injected a twin image tag with a sizer gif (4k wide transparent gif) to let the browser calculate the desired size, then used that for the image URI.
* 0.2 - Implemented direct reading of the calculated 'max-width' value and conversion of non-px units via a dynamic sibling div (faster and added IE6,7,8 support).

