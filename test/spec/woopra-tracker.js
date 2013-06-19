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
        b = ['track', 'pageview', 'identify', 'person', 'visit', 'config', 'call'];
        for (c = 0; c < b.length; c++) {
            _wpt[b[c]] = a(b[c]);
        }

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

        // lets queue up some events since woopraTracker isn't loaded yet
        // shouldn't need to test all of the public methods
        it('should queue track() call', function() {
            var tSpy = sinon.spy(Woopra.Tracker.prototype, '_processQueue');

            expect(_wpt._e.length).to.equal(0);
            _wpt.track('testEvent', {title: 'testTitle'});
            expect(_wpt._e.length).to.equal(1);
            woopraTracker = new Woopra.Tracker();
            woopraTracker.init();
            expect(tSpy).to.be.called;
            expect(spy.track).to.be.calledWith('testEvent', sinon.match({title: 'testTitle'}));
            tSpy.restore();
        });
    });

    describe('Tracker', function() {
        beforeEach(function() {
            tracker = new Woopra.Tracker();
            tracker.init();
            tracker.person(visitorProperties);
        });

        it('should initialize properly', function() {
            var oSpy = sinon.spy(Woopra.Tracker.prototype, '_setOptions'),
                qSpy = sinon.spy(Woopra.Tracker.prototype, '_processQueue'),
                newTracker = new Woopra.Tracker();

            expect(newTracker._loaded).to.be.false;
            newTracker.init();
            expect(newTracker._loaded).to.be.true;
            expect(oSpy).to.be.called;
            expect(qSpy).to.be.called;
            oSpy.restore();
            qSpy.restore();
        });

        // Dropping support for woopraReady
        //it('should call woopraReady when loaded if it is defined', function() {
            //window.woopraReady = function() {};
            //var spy = sinon.spy(window, 'woopraReady'),
                //newTracker = new Woopra.Tracker();

            //newTracker.init();
            //expect(spy).to.be.called;
            //spy.restore();
            //delete window.woopraReady;
        //});

        it('should set visitor properties by passing the params as key, value', function() {
            var newEmail = 'newemail@woopra.com';

            tracker.person('email', newEmail);

            expect(tracker.personData.name).to.equal(visitorProperties.name);
            expect(tracker.personData.company).to.equal(visitorProperties.company);
            expect(tracker.personData.email).to.equal(newEmail);
        });

        it('should set visitor properties by passing a new object as a param', function() {
            var newVisitorProperties = {
                name: 'NewUser',
                email: 'newemail@woopra.com'
            };

            tracker.person(newVisitorProperties);

            expect(tracker.personData.name).to.equal(newVisitorProperties.name);
            expect(tracker.personData.email).to.equal(newVisitorProperties.email);
            // XXX: currently we extend if object is passed in, instead of overwrite
            //expect(tracker.personData.company).to.be.undefined;
        });

        it('should set tracker options', function() {
            var testOpt = 'testOption',
                newVal = 'optionValue';

            tracker.config('testOption', newVal);
            expect(tracker.options.testOption).to.equal(newVal);
        });

        it('should extend options if an object is passed in', function() {
            var testOpt = 'testOption',
                newVal = 'optionValue';

            tracker.config('testOption', newVal);
            expect(tracker.options.testOption).to.equal(newVal);

            tracker.config({
                test: 'option',
                another: 'option'
            });
            expect(tracker.options.testOption).to.equal(newVal);
            expect(tracker.options.test).to.equal('option');
            expect(tracker.options.another).to.equal('option');
        });

        it('should have option() act as a getter if only one param is passed', function() {
            var testOpt = 'testOption',
                newVal = 'optionValue';

            tracker.config(testOpt, newVal);
            expect(tracker.config(testOpt)).to.equal(newVal);
        });

        //it('setDomain() should be an alias to set "domain" and "cookie_domain" options', function() {
            //var newDomain = 'notwoopra.com';

            //tracker.setDomain(newDomain);

            //expect(tracker.option('domain')).to.be.equal(newDomain);
            //expect(tracker.option('cookie_domain')).to.be.equal(newDomain);
        //});

        //it('setIdleTimeout() should be an alias to set "idle_timeout" option', function() {
            //var newTimeout = '321405';

            //tracker.setIdleTimeout(newTimeout);

            //expect(tracker.option('idle_timeout')).to.be.equal(newTimeout);
        //});

        it('when moved() handler is called, should not be idle', function() {
            tracker.idle = 1000;
            tracker.moved();
            expect(tracker.idle).to.equal(0);
            //expect(tracker.last_activity.getTime()).to.be.at.least(oldLastActivity.getTime());
        });

        it('when user types, tracker.vs should be 2', function() {
            tracker.typed();
            expect(tracker.vs).to.equal(2);
        });

        describe('requests that sync to server', function() {
            var spy;
            beforeEach(function() {
                spy = sinon.spy(Woopra.Tracker.prototype, '_sync');
            });
            afterEach(function() {
                spy.restore();
            });

            it('sync should create a new Woopra.Event and fire', function() {
                var eSpy = sinon.spy(Woopra, 'Event'),
                    fireSpy = sinon.spy(Woopra.Event.prototype, 'fire'),
                    _name = 'testSync';

                tracker._sync(_name, 'test', {});

                expect(eSpy).to.be.calledWith(_name, {name: _name}, tracker.cv, 'test');
                expect(fireSpy).to.be.calledWith(tracker);
                eSpy.restore();
                fireSpy.restore();
            });

            it('should not identify user if email param is empty', function() {
                tracker.identify();
                expect(spy).to.not.be.called;
                spy.restore();
            });

            it('should identify user if email is given', function() {
                var newVisitorProperties = {
                        name: 'notWoopraUser',
                        company: 'Not Woopra'
                    };

                expect(tracker.cv).to.equal(visitorProperties);
                tracker.identify('new@woopra.com', newVisitorProperties);
                expect(tracker.cv).to.deep.equal({
                    name: 'notWoopraUser',
                    company: 'Not Woopra',
                    email: 'new@woopra.com'
                });
                // XXX pass by reference side effect with options
                expect(spy).to.be.calledWith('identify', 'identify', {name: 'identify'});
            });

            it('pingServer() sends an "x" request', function() {
                var pSpy = sinon.spy(tracker, 'pingServer');

                tracker.pingServer();
                expect(pSpy).to.be.called;
                // XXX pass by reference side effect with options
                expect(spy).to.be.calledWith('x', 'ping', {name: 'x'});
            });

            it('pageview() should send a "pv" event', function() {
                var pSpy = sinon.spy(tracker, 'pageview');

                tracker.pageview({});
                // XXX pass by reference side effect with options
                expect(pSpy).to.be.calledWith({name: 'pv'});
                expect(spy).to.be.calledWith('pv', 'visit', {name: 'pv'});
                pSpy.restore();
            });

            it('track() should send a "ce" request, and should extract visitor object from options', function() {
                var newVisitorProperties = {
                        name: 'notWoopraUser',
                        email: 'new@woopra.com',
                        company: 'Not Woopra'
                    },
                    trSpy = sinon.spy(tracker, 'track'),
                    tSpy = sinon.spy(tracker, '_track'),
                    eSpy = sinon.spy(Woopra, 'Event'),
                    _name = 'testEvent';

                expect(tracker.cv).to.equal(visitorProperties);
                tracker.track(_name, {
                    visitor: newVisitorProperties
                });
                expect(trSpy).to.be.calledWith(_name, {name: _name});
                expect(tSpy).to.be.calledWith(_name, 'ce', {name: _name});
                expect(tracker.cv).to.equal(newVisitorProperties);
                expect(spy).to.be.calledWith(_name, 'ce', {name: _name});

                trSpy.restore();
                tSpy.restore();
                eSpy.restore();
            });

        });

    });
});
