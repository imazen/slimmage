SlimImage (slimage.js)
=======

Context-friendly responsive image solution
SlimImage (slimage.js) is focused on full-stack responsive imaging. It requires an RIAPI-compliant backend to perform on-demand resizing.

It is **CSS-friendly** - your sizing logic stays in your CSS files, and you can use media queries.

It is **context-aware** - if your images use 'max-width:100%' but are inside a column, they will be sized to the column width, not the screen width.

It is **CDN-smart** - images are sized in intervals of 160px to minimize the number of variants (this comes out to roughly 13 versions, and is configurable).

It **degrades gracefully** without javascript, or on older browsers.

It is **accessbile* - the standard `<img>` tag is used. 

It is **vanilla js**.

## Sample markup

    <noscript data-ri>
      <img class="halfsize" src="http://z.zr.io/ri/1s.jpg?width=150" />
    </noscript>
    
    <style type="text/css">
      img.halfsize {max-width:50%;}
    </style>
    
    <script src="/slimage.js" ></script>
    
    

## Demo page
    
The [demo page](http://imazen.github.io/slimage/demo.html
) uses PureCSS for the responsive grid, slimage.js to modify the URIs, and ImageResizer for Restful Image Processing.
