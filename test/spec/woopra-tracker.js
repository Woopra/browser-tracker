describe('Woopra', function() {
    var visitorProperties = {
            name: 'WoopraUser',
            email: 'test@woopra.com',
            company: 'Woopra'
        },
        tracker;

    describe('Client snippet test', function() {
        var woopraTracker,
            i, a, b, c,
            spy = {},
            _wpt = _wpt || {};

        _wpt._e = [];
        window._wpt = _wpt;
        a = function (f) {
            return function() {
                _wpt._e.push([f].concat(Array.prototype.slice.call(arguments, 0)));
            };
        };
        b = ['track', 'pageview', 'identify', 'visitor', 'visit', 'option', 'setDomain', 'setIdleTimeout', 'call'];
        for (c = 0; c < b.length; c++) {
            _wpt[b[c]] = a(b[c]);
        }

        beforeEach(function() {
            // create spies for all of the public methods
            for (i = 0; i < b.length; i++) {
                spy[b[i]] = sinon.spy(WoopraTracker.prototype, b[i]);
            }
        });
        afterEach(function() {
            // restore spies
            for (i = 0; i < b.length; i++) {
                WoopraTracker.prototype[b[i]].restore();
            }
        });

        // lets queue up some events since woopraTracker isn't loaded yet
        // shouldn't need to test all of the public methods
        it('should queue track() call', function() {
            var tSpy = sinon.spy(WoopraTracker.prototype, '_processQueue');

            expect(_wpt._e.length).to.equal(0);
            _wpt.track('testEvent', {title: 'testTitle'});
            expect(_wpt._e.length).to.equal(1);
            woopraTracker = new WoopraTracker();
            woopraTracker.initialize();
            expect(tSpy).to.be.called;
            expect(spy.track).to.be.calledWith('testEvent', sinon.match({title: 'testTitle'}));
        });
    });

    describe('WoopraEvent', function() {
    });

    describe('Tracker', function() {
        beforeEach(function() {
            tracker = new WoopraTracker();
            tracker.visitor(visitorProperties);
        });

        it('should set visitor properties by passing the params as key, value', function() {
            var newEmail = 'newemail@woopra.com';

            tracker.visitor('email', newEmail);

            expect(tracker.cv.name).to.equal(visitorProperties.name);
            expect(tracker.cv.company).to.equal(visitorProperties.company);
            expect(tracker.cv.email).to.equal(newEmail);
        });

        it('should set visitor properties by passing a new object as a param', function() {
            var newVisitorProperties = {
                name: 'NewUser',
                email: 'newemail@woopra.com'
            };

            tracker.visitor(newVisitorProperties);

            expect(tracker.cv.name).to.equal(newVisitorProperties.name);
            expect(tracker.cv.email).to.equal(newVisitorProperties.email);
            expect(tracker.cv.company).to.be.undefined;
        });

        it('should set tracker options', function() {
            var testOpt = 'testOption',
                newVal = 'optionValue';

            tracker.option('testOption', newVal);
            expect(tracker.props.testOption).to.equal(newVal);
        });

        it('should set overwite options if an object is passed in', function() {
            var testOpt = 'testOption',
                newVal = 'optionValue';

            tracker.option('testOption', newVal);
            expect(tracker.props.testOption).to.equal(newVal);
            tracker.option({
                test: 'option',
                another: 'option'
            });
            expect(tracker.props.testOption).to.be.undefined;
            expect(tracker.props.test).to.equal('option');
            expect(tracker.props.another).to.equal('option');
        });

        it('should have option() act as a getter if only one param is passed', function() {
            var testOpt = 'testOption',
                newVal = 'optionValue';

            tracker.option(testOpt, newVal);
            expect(tracker.option(testOpt)).to.equal(newVal);
        });

        it('setDomain() should be an alias to set "domain" and "cookie_domain" options', function() {
            var newDomain = 'notwoopra.com';

            tracker.setDomain(newDomain);

            expect(tracker.option('domain')).to.be.equal(newDomain);
            expect(tracker.option('cookie_domain')).to.be.equal(newDomain);
        });

        it('setIdleTimeout() should be an alias to set "idle_timeout" option', function() {
            var newTimeout = '321405';

            tracker.setIdleTimeout(newTimeout);

            expect(tracker.option('idle_timeout')).to.be.equal(newTimeout);
        });

        it('when moved() handler is called, should not be idle', function() {
            tracker.idle = 1000;
            tracker.moved();
            expect(tracker.idle).to.equal(0);
            //expect(tracker.last_activity.getTime()).to.be.at.least(oldLastActivity.getTime());
        });

        // TODO figure out how to spy on the constructor
        it('pageview() should send a "pv" event', function() {
            var spy = sinon.spy(tracker, 'pageview'),
                fireSpy = sinon.spy(WoopraEvent.prototype, 'fire');

            tracker.pageview();
            expect(spy).to.be.called;
            expect(fireSpy).to.be.calledWith(tracker);
            //expect(WoopraEvent).to.be.calledWith('pv', {}, visitorProperties, 'visit');
        });

    });
});
