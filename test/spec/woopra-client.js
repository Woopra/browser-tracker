describe('Woopra Client Snippet', function() {
    var visitorProperties = {
            name: 'WoopraUser',
            email: 'test@woopra.com',
            company: 'Woopra'
        },
        woopra,
        b = ['config', 'track', 'identify', 'visit', 'push'],
        i,
        spy = {},
        tracker;

    before(function() {
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

            window._w = window._w || {};
            // check if instance of tracker exists
            for (i = 0; i < a.length; i++) {
                window._w[a[i]] = window[a[i]] = window[a[i]] || new c();
            }
            // insert tracker script
            s = d.createElement(q);
            s.async = 1;
            s.src = '//localhost:4141/wpt.min.js';
            z = d.getElementsByTagName(q)[0];
            z.parentNode.insertBefore(s, z);
        })('woopra_c1', 'woopra_c2', 'woopra_c3');

    });

    beforeEach(function() {
        // create spies for all of the public methods
        for (i = 0; i < b.length; i++) {
            spy[b[i]] = sinon.spy(Woopra.Tracker.prototype, b[i]);
        }
    });
    afterEach(function() {
        // restore spies
        for (i = 0; i < b.length; i++) {
            Woopra.Tracker.prototype[b[i]].restore();
        }
    });

    it('has the instance name of "woopra"', function() {
        expect(window.woopra_c1).to.be.defined;
    });

    it('support multiple instances of tracker', function() {
        expect(window.woopra_c2).to.be.defined;
        expect(window.woopra_c3).to.be.defined;
        expect(window.woopra_c2).to.not.equal(window.woopra_c1);
    });

    it('make sure stub methods are created', function() {
        var i = 0;
        expect(window.woopra_c1._e.length).to.equal(0);
        for (i = 0; i < b.length; i++) {
            expect(window.woopra_c1[b[i]]).to.be.defined;
        }
    });

    // lets queue up some events since woopra tracker isn't loaded yet
    // shouldn't need to test all of the public methods
    it('queues track() call', function() {
        expect(window.woopra_c1._e.length).to.equal(0);
        window.woopra_c1.track('testEvent', {title: 'testTitle'});
        expect(window.woopra_c1._e.length).to.equal(1);
    });

    it('initializes the tracker and processes the queued up track() call', function() {
        var tSpy = sinon.spy(Woopra.Tracker.prototype, '_processQueue');
        var woopra = new Woopra.Tracker('woopra_c1');
        woopra.init();
        expect(tSpy).was.called;
        expect(spy.track).was.called;
        expect(spy.track).was.calledWith('testEvent', sinon.match({title: 'testTitle'}));
        tSpy.restore();
    });
});
