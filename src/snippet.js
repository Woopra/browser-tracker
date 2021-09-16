(function () {
  var i,
    s,
    z,
    w = window,
    d = document,
    a = arguments,
    q = 'script',
    f = [
      'call',
      'cancelAction',
      'config',
      'identify',
      'push',
      'track',
      'trackClick',
      'trackForm',
      'update',
      'visit'
    ],
    c = function () {
      var i,
        self = this,
        createStubs = function (name) {
          // create stub functions for tracker instance
          self[name] = function () {
            // need to do this so params get called properly
            self._e.push(
              [name].concat(Array.prototype.slice.call(arguments, 0))
            );
            return self;
          };
        };
      self._e = [];
      for (i = 0; i < f.length; i++) {
        createStubs(f[i]);
      }
    };

  w.__woo = w.__woo || {};
  // check if instance of tracker exists
  for (i = 0; i < a.length; i++) {
    w.__woo[a[i]] = w[a[i]] = w[a[i]] || new c();
  }
  // insert tracker script
  s = d.createElement(q);
  s.async = 1;
  s.src = 'https://static.woopra.com/js/w.js';
  z = d.getElementsByTagName(q)[0];
  z.parentNode.insertBefore(s, z);
})('woopra');
