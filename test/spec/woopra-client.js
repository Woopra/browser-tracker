describe('Woopra Client Snippet', function() {
    var b = ['config', 'track', 'identify', 'visit', 'push'];

    it('Can be loaded asynchronously', function(done) {
        window.woopraLoaded = function() {
            window.woopraLoaded = null;
            window.woopra_c1 = null;
            done();
        };

        (function () {
            var i,
                s,
                z,
                w = window,
                d = document,
                a = arguments,
                q = 'script',
                f = ['config', 'track', 'identify', 'visit', 'push', 'call'],
                C = function () {
                    var i,
                    self = this,
                    createStubs = function(name) {
                        // create stub functions for tracker instance
                        self[name] = function () {
                            // need to do this so params get called properly
                            self._e.push([name].concat(Array.prototype.slice.call(arguments, 0)));
                            return self;
                        };
                    };

                    self._e = [];
                    for (i = 0; i < f.length; i++) {
                        createStubs(f[i]);
                    }
                };

            w._w = w._w || {};
            // check if instance of tracker exists
            for (i = 0; i < a.length; i++) {
                w._w[a[i]] = w[a[i]] = w[a[i]] || new C();
            }
            // insert tracker script
            s = d.createElement(q);
            s.async = 1;
            s.src = 'http://localhost:4141/wpt.js';
            z = d.getElementsByTagName(q)[0];
            z.parentNode.insertBefore(s, z);
        })('woopra');
    });


    describe('Multiple Instances', function() {
        var insert_tracker;
        var init_cb = {};

        before(function() {
            window.woopra.dispose();
            window.woopra = null;
            window.woopraTracker = null;
            window.Woopra.Tracker = null;
            window._w = {};

            (function () {
                var i,
                s,
                z,
                w = window,
                d = document,
                a = arguments,
                q = 'script',
                f = ['config', 'track', 'identify', 'visit', 'push', 'call'],
                C = function () {
                    var i,
                    self = this,
                    createStubs = function(name) {
                        // create stub functions for tracker instance
                        self[name] = function () {
                            // need to do this so params get called properly
                            self._e.push([name].concat(Array.prototype.slice.call(arguments, 0)));
                            return self;
                        };
                    };

                    self._e = [];
                    for (i = 0; i < f.length; i++) {
                        createStubs(f[i]);
                    }
                };

                w._w = w._w || {};
                // check if instance of tracker exists
                for (i = 0; i < a.length; i++) {
                    w._w[a[i]] = w[a[i]] = w[a[i]] || new C();
                }

                insert_tracker = function() {
                    // insert tracker script
                    s = d.createElement(q);
                    s.async = 1;
                    s.src = 'http://localhost:4141/wpt.js';
                    z = d.getElementsByTagName(q)[0];
                    z.parentNode.insertBefore(s, z);
                };
            })('woopra_c1', 'woopra_c2', 'woopra_c3');
        });


        after(function() {
            window.woopra_c1.dispose();
            window.woopra_c2.dispose();
            window.woopra_c3.dispose();
        });

        it('Creates multiple instances of tracker stubs', function() {
            expect(window.woopra_c1).to.not.be(undefined);
            expect(window.woopra_c2).to.not.be(undefined);
            expect(window.woopra_c3).to.not.be(undefined);
            expect(window.woopra_c2).to.not.equal(window.woopra_c1);
        });

        it('Stub methods are created for all instances', function() {
            var j;
            var i;

            for (j = 1; j <= 3; j++) {
                expect(window['woopra_c' + j]._e.length).to.equal(0);
                for (i = 0; i < b.length; i++) {
                    expect(window['woopra_c' + j][b[i]]).to.not.be(undefined);
                }
            }
        });

        // lets queue up some events since woopra tracker isn't loaded yet
        // shouldn't need to test all of the public methods
        it('Queues track() calls for all instances', function() {
            var name;
            var j;
            var spy;

            for (j = 1; j <= 3; j++) {
                name = 'woopra_c' + j;
                spy = sinon.spy();
                init_cb[j] = spy;

                expect(window[name]._e.length).to.equal(0);
                window[name].track('testEvent' + j, {title: 'testTitle'});
                window[name].config('initialized', spy);
                expect(window[name]._e.length).to.equal(2);
            }
        });

        it('Programmatically insert tracker into the DOM', function(done) {
            // Stub Tracker.init so we can manually initialize
            window.woopraLoaded = function() {
                /* jshint ignore:start */
                var stub = sinon.stub(Woopra.Tracker.prototype, 'init');
                /* jshint ignore:end */
                done();
            };
            insert_tracker();
        });

        it('Processes queues when `init` is called', function() {
            var spy;
            var qSpy;
            var name;

            Woopra.Tracker.prototype.init.restore();

            for (var i = 1; i <= 3; i++) {
                spy = sinon.spy(Woopra.Tracker.prototype, 'track');
                qSpy = sinon.spy(Woopra.Tracker.prototype,  '_processQueue');

                name = 'woopra_c' + i;

                expect(qSpy).was.notCalled();
                expect(spy).was.notCalled();

                window[name].init();

                expect(qSpy).was.called();
                expect(spy).was.called();
                expect(spy).was.calledWithMatch('testEvent' + i, {title: 'testTitle'});
                spy.restore();
                qSpy.restore();
            }
        });

        it('Call all queued up initialize callbacks', function() {
            for (var i = 1; i <= 3; i++) {
                expect(init_cb[i]).was.called();
            }
        });

        it('Set and call initialize callbacks after tracker has been loaded', function() {
            for (var i = 1; i <= 3; i++) {
                expect(init_cb[i]).was.called();
            }
        });


    });
});
