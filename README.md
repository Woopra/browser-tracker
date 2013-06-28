Repository for Woopra client-side javascript tracking

### Snippet to be included at the top of your document
For best results, this should be included at the top of your document, preferrably in the HEAD section,
but definitely before you make any calls to `woopra`.  You may use any `woopra` function after this snippet
and it will process all of your commands after the script loads asynchronously.

```html
<script>
(function(t){var i,e,n,o=window,a=document,r="script",s=["config","track","identify","push","call"],c=function(){var t=this;for(t._e=[],i=0;s.length>i;i++)(function(i){t[i]=function(){return t._e.push([i].concat(Array.prototype.slice.call(arguments,0))),t}})(s[i])};o._w=o._w||{},o._w[t]=o[t]=o[t]||new c,e=a.createElement(r),e.async=1,e.src="//static.woopra.com/js/wpt.min.js?v=3.0.3",n=a.getElementsByTagName(r)[0],n.parentNode.insertBefore(e,n)})("woopra");
</script>
```

