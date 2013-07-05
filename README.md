Slimmage.js
=======

Context-friendly responsive image solution
Slimmage is focused on full-stack responsive imaging. It requires an RIAPI-compliant backend to perform on-demand resizing.

It is **CSS-friendly** - your sizing logic stays in your CSS files, and you can use media queries.

It is **context-aware** - if your images use 'max-width:100%' but are inside a column, they will be sized to the column width, not the screen width.

It is **CDN-smart** - images are sized in intervals of 160px to minimize the number of variants (this comes out to roughly 13 versions, and is configurable).

It **degrades gracefully** without javascript, or on older browsers.

It is **accessbile** - the standard `<img>` tag is used. 

It is **vanilla js**.

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
    
    
## Sample markup with IE7/8 support

    <noscript data-slimmage data-img-class="halfsize" data-img-src="http://z.zr.io/ri/1s.jpg?width=150">
      <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150" />
    </noscript>

## Sample markup with IE7/8 fallback

    <!--[if !IE]>--><noscript data-slimmage><!--<![endif]-->
      <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150" />
    <!--[if !IE]>--></noscript><!--<![endif]-->
    
## Sammple markup with WebP and quality adjustment enabled

    <noscript data-slimmage>
      <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150&format=jpg&quality=90" />
    </noscript>
    
    <style type="text/css">
      img.halfsize {max-width:50%;}
    </style>
    
    <script type="text/javascript">
        window.slimage = {settings: {serverHasWebP:true}};
    </script>
    <script src="/slimage.js" ></script>
    
