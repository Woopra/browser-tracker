Repository for Woopra client-side javascript tracking

### Snippet to be included at the top of your document
For best results, this should be included at the top of your document, preferrably in the HEAD section, but definitely before you make any calls to `_wpt`.  You may use any _wpt function after this snippet and it will process all of your commands after the script loads asynchronously.  You may also use `woopraReady` if you need to have your tracking commands before the snippet.

```javascript
(function (d) {
    var WPT_DOMAIN = 'YOUR_DOMAIN_HERE',
        _wpt = window._wpt = window._wpt || {}, l, m, a, b, c;
    _wpt._e = [];
    a = function (f) { return function() { _wpt._e.push([f].concat(Array.prototype.slice.call(arguments, 0))); }; };
    b = ['track', 'pageview', 'identify', 'visitor', 'visit', 'option', 'setDomain', 'setIdleTimeout', 'do'];
    for (c = 0; c < b.length; c++) { _wpt[b[c]] = a(b[c]); }
    l = d.createElement('script'); l.async = true;
    l.src = ('https:' === d.location.protocol ? 'https:' : 'http:') + '//static.woopra.com/js/woopra-tracker.v3.0.0.min.js';
    m = d.getElementsByTagName('script')[0];
    m.parentNode.insertBefore(l, m);
    _wpt.setDomain(WPT_DOMAIN);
})(window.document);
```

