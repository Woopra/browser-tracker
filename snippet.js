(function () {
    var i,
        s,
        z,
        w = window,
        d = document,
        a = arguments,
        q = 'script',
        f = ['config', 'track', 'identify', 'visit', 'push', 'call'],
        c = function () {
            var i, self = this;
            self._e = [];
            for (i = 0; i < f.length; i++) {
                (function (f) {
                    self[f] = function () {
                        // need to do this so params get called properly
                        self._e.push([f].concat(Array.prototype.slice.call(arguments, 0)));
                        return self;
                    };
                })(f[i]);
            }
        };

    w._w = w._w || {};
    // check if instance of tracker exists
    for (i = 0; i < a.length; i++) {
        w._w[a[i]] = w[a[i]] = w[a[i]] || new c();
    }
    // insert tracker script
    s = d.createElement(q);
    s.async = 1;
    s.src = '//static.woopra.com/js/w.js';
    z = d.getElementsByTagName(q)[0];
    z.parentNode.insertBefore(s, z);
})('woopra');
