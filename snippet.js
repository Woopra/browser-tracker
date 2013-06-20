(function (instanceName) {
    var i,
        s,
        z,
        q = 'script',
        a = arguments,
        f = ['config', 'track', 'identify', 'push'],
        c = function () {
            var self = this;
            self._e = [];
            for (i = 0; i < f.length; i++) {
                (function (f) {
                    self[f] = function () {
                        self._e.push([f, arguments]);
                        return self;
                    };
                })(f[i]);
            }
        };

    window._wpt = window._wpt || {};
    // check if instance of tracker exists
    window._wpt[instanceName] = window[instanceName] = window[instanceName] || new c();
    // insert tracker script
    s = document.createElement(q);
    s.async = 1;
    s.src = '//cdn-origin.woopra.com/w.js';
    z = document.getElementsByTagName(q)[0];
    z.parentNode.insertBefore(s, z);
})('woopra');
