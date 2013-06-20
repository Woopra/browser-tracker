Repository for Woopra client-side javascript tracking

### Snippet to be included at the top of your document
For best results, this should be included at the top of your document, preferrably in the HEAD section,
but definitely before you make any calls to `woopra`.  You may use any `woopra` function after this snippet
and it will process all of your commands after the script loads asynchronously.

```javascript
(function(n){var t,e,o,r="script",c=["config","track","identify","push"],i=function(){var n=this;for(n._e=[],t=0;c.length>t;t++)(function(t){n[t]=function(){return n._e.push([t].concat(Array.prototype.slice.call(arguments,0))),n}})(c[t])};window._wpt=window._wpt||{},window._wpt[n]=window[n]=window[n]||new i,e=document.createElement(r),e.async=1,e.src="//cdn-origin.woopra.com/w.js",o=document.getElementsByTagName(r)[0],o.parentNode.insertBefore(e,o)})("woopra");
```

