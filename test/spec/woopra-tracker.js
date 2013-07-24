describe('Woopra', function() {
    var visitorProperties = {
            name: 'WoopraUser',
            email: 'test@woopra.com',
            company: 'Woopra'
        },
        tracker;

    describe('Client snippet test', function() {
        var woopra,
            b = ['config', 'track', 'identify', 'visit', 'push'],
            i,
            spy = {};

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
                for (i = 0; i < a.length; a++) {
                    w._w[a[i]] = w[a[i]] = w[a[i]] || new c();
                }
            })('woopra', 'woopra2', 'woopra3');

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
            expect(window.woopra).to.be.defined;
        });

        it('support multiple instances of tracker', function() {
            expect(window.woopra2).to.be.defined;
            expect(window.woopra3).to.be.defined;

            expect(window.woopra2).to.not.equal(window.woopra);
        });

        // lets queue up some events since woopra tracker isn't loaded yet
        // shouldn't need to test all of the public methods
        it('queues track() call', function() {
            expect(window.woopra._e.length).to.equal(0);
            window.woopra.track('testEvent', {title: 'testTitle'});
            expect(window.woopra._e.length).to.equal(1);
        });

        it('initializes the tracker and processes the queued up track() call', function() {
            var tSpy = sinon.spy(Woopra.Tracker.prototype, '_processQueue');

            woopra = new Woopra.Tracker('woopra');
            woopra.init();
            expect(tSpy).to.be.called;
            expect(spy.track).to.be.called;
            expect(spy.track).to.be.calledWith('testEvent', sinon.match({title: 'testTitle'}));
            tSpy.restore();
        });
    });

    describe('Tracker', function() {
        beforeEach(function() {
            tracker = new Woopra.Tracker('woopra');
            tracker.init();
            tracker.identify(visitorProperties);
        });

        afterEach(function() {
            tracker.dispose();
        });

        it('initializes properly and use a different instance name', function() {
            var oSpy = sinon.spy(Woopra.Tracker.prototype, '_setOptions'),
                cSpy = sinon.spy(Woopra.Tracker.prototype, '_setupCookie'),
                qSpy = sinon.spy(Woopra.Tracker.prototype, '_processQueue'),
                newTracker = new Woopra.Tracker('newTracker');

            expect(newTracker._loaded).to.be.false;
            newTracker.init();
            expect(newTracker._loaded).to.be.true;
            expect(newTracker.instanceName).to.equal('newTracker');
            expect(oSpy).to.be.called;
            expect(cSpy).to.be.called;
            expect(qSpy).to.be.called;
            oSpy.restore();
            cSpy.restore();
            qSpy.restore();
            delete window.newTracker;
        });

        it('retrieves all visitor properties when no parameters are passed', function() {
            var properties = tracker.identify();
            expect(properties).to.eql(visitorProperties);
        });

        it('retrieves a visitor property when only the key name is supplied', function() {
            var property = tracker.identify('name');
            expect(property).to.equal(visitorProperties.name);
        });

        it('sets visitor properties by passing the params as key, value', function() {
            var newEmail = 'newemail@woopra.com';

            tracker.identify('email', newEmail);

            expect(tracker.visitorData.name).to.equal(visitorProperties.name);
            expect(tracker.visitorData.company).to.equal(visitorProperties.company);
            expect(tracker.visitorData.email).to.equal(newEmail);
        });

        it('sets visitor properties by passing a new object as a param and extends existing properties', function() {
            var newVisitorProperties = {
                name: 'NewUser',
                email: 'newemail@woopra.com'
            };

            tracker.identify(newVisitorProperties);

            expect(tracker.visitorData.name).to.equal(newVisitorProperties.name);
            expect(tracker.visitorData.email).to.equal(newVisitorProperties.email);
            expect(tracker.visitorData.company).to.equal(visitorProperties.company);
        });

        it('sets a tracker option when a key, value is passed', function() {
            var testOpt = 'testOption',
                newVal = 'optionValue';

            tracker.config('testOption', newVal);
            expect(tracker.options.testOption).to.equal(newVal);
        });

        it('extends options if an object is passed in', function() {
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

        it('retrieves a configuration option when only the key name is supplied', function() {
            var testOpt = 'testOption',
                newVal = 'optionValue';

            tracker.config(testOpt, newVal);
            expect(tracker.config(testOpt)).to.equal(newVal);
        });

        describe('Pings', function() {
            it('only has one ping timer going on at once', function() {
                var oldInterval,
                    pingTracker = new WoopraTracker('pingTracker');

                pingTracker.init();

                expect(pingTracker.pingInterval).to.be.undefined;

                // track() starts the ping
                pingTracker.track();
                oldInterval = pingTracker.pingInterval;
                expect(pingTracker.pingInterval).to.exist;

                pingTracker.track();
                expect(pingTracker.pingInterval).to.equal(oldInterval);

                pingTracker.startPing();
                expect(pingTracker.pingInterval).to.equal(oldInterval);

                pingTracker.dispose();
            });

            it('has a minimum interval of 6 seconds and max of 1 minute', function() {
                var pingTracker = new WoopraTracker('pingTracker');

                pingTracker.config('ping_interval', 5000);
                expect(pingTracker.config('ping_interval')).to.equal(6000);
                pingTracker.config('ping_interval', 6000);
                expect(pingTracker.config('ping_interval')).to.equal(6000);
                pingTracker.config('ping_interval', 7000);
                expect(pingTracker.config('ping_interval')).to.equal(7000);

                pingTracker.config('ping_interval', 59000);
                expect(pingTracker.config('ping_interval')).to.equal(59000);
                pingTracker.config('ping_interval', 60000);
                expect(pingTracker.config('ping_interval')).to.equal(60000);
                pingTracker.config('ping_interval', 60001);
                expect(pingTracker.config('ping_interval')).to.equal(60000);

                pingTracker.config({
                    ping_interval: 5000
                });
                expect(pingTracker.config('ping_interval')).to.equal(6000);
                pingTracker.config({
                    ping_interval: 6000
                });
                expect(pingTracker.config('ping_interval')).to.equal(6000);
                pingTracker.config({
                    ping_interval: 7000
                });
                expect(pingTracker.config('ping_interval')).to.equal(7000);
                pingTracker.dispose();
            });

            it('stopPing should stop the interval', function() {
                var pingTracker = new WoopraTracker('pingTracker');

                pingTracker.init();

                expect(pingTracker.pingInterval).to.be.undefined;
                pingTracker.track();
                expect(pingTracker.pingInterval).to.exist;

                pingTracker.stopPing();
                expect(pingTracker.pingInterval).to.be.undefined;

                pingTracker.dispose();
            });

            it('stops pinging when user idle time is greater than idle_timeout', function() {
                var pingTracker = new WoopraTracker('pingTracker');

                pingTracker.init();

                expect(pingTracker.pingInterval).to.be.undefined;
                pingTracker.startPing();
                expect(pingTracker.pingInterval).to.exist;

                // set idle and idle_timeout values manually
                pingTracker.idle = 10000;
                pingTracker.config('idle_timeout', 5000);

                // manually call ping
                // pingInterval should be stopped
                pingTracker.ping();
                expect(pingTracker.pingInterval).to.be.undefined;

                pingTracker.dispose();
            });
            describe('Mouse and Keyboard Events', function() {
                var pingTracker = new WoopraTracker('pingTracker');
                pingTracker.init();

                it('when moved() handler is called, should not be idle', function() {
                    var oldLastActivity = pingTracker.last_activity;
                    pingTracker.idle = 1000;
                    pingTracker.moved(null, new Date());
                    expect(pingTracker.idle).to.equal(0);
                    expect(pingTracker.last_activity.getTime()).to.be.at.least(oldLastActivity.getTime());
                });

                it('when user types, pingTracker.vs should be 2', function() {
                    pingTracker.typed();
                    expect(pingTracker.vs).to.equal(2);
                });

                it('has the mousedown event attached to the dom', function() {
                    var evt = new Event('mousedown'),
                        cSpy = sinon.spy(pingTracker, 'moved');

                    document.dispatchEvent(evt);
                    expect(cSpy).to.be.called;

                    cSpy.restore();
                });

                it('has the mouse move event attached to the dom', function() {
                    var evt = new Event('mousemove'),
                        movedSpy = sinon.spy(pingTracker, 'moved');

                    document.dispatchEvent(evt);
                    expect(movedSpy).to.be.called;

                    movedSpy.restore();
                });

                it('has the keydown event attached to the dom', function() {
                    var evt = new Event('keydown'),
                        typedSpy = sinon.spy(pingTracker, 'typed');

                    document.dispatchEvent(evt);
                    expect(typedSpy).to.be.called;

                    typedSpy.restore();
                });


                pingTracker.dispose();
            });
        });

        describe('Multiple Instances', function() {
            var w1 = new WoopraTracker('w1'),
                w2 = new WoopraTracker('w2'),
                w3 = new WoopraTracker('w3'),
                evt,
                sleepSpy = sinon.spy(Woopra, 'sleep'),
                ts1 = sinon.spy(w1, 'track'),
                ts2 = sinon.spy(w2, 'track'),
                ts3 = sinon.spy(w3, 'track'),
                fireSpy = sinon.spy(Woopra, '_fire');

            w1.init();
            w2.init();
            w3.init();

            it('sending a track event for one instance should not affect the others', function() {
                w1.track();
                expect(ts1).to.be.called;
                expect(ts2).to.not.be.called;
                expect(ts3).to.not.be.called;
            });

            it('keydown events should be captured and recorded by all trackers', function() {
                var evt = new Event('keydown'),
                    s1 = sinon.spy(w1, 'typed'),
                    s2 = sinon.spy(w2, 'typed'),
                    s3 = sinon.spy(w3, 'typed');

                document.dispatchEvent(evt);
                expect(s1).to.be.called;
                expect(s2).to.be.called;
                expect(s3).to.be.called;

                s1.restore();
                s2.restore();
                s3.restore();
            });


            it('if a 2nd Woopra tracking script is included, make sure events are only bound once', function() {
                var spy = sinon.spy(Woopra, 'attachEvent'),
                    script = document.createElement('script'),
                    parent;

                script.async = 1;
                script.src = '//static.woopra.com/js/w.js';
                parent = document.getElementsByTagName('script')[0];
                parent.parentNode.insertBefore(script, parent);

                expect(spy).to.not.be.called;

                Woopra.removeScript(script);
                spy.restore();
            });

            w1.dispose();
            w2.dispose();
            w3.dispose();
            sleepSpy.restore();
        });

        describe('Helper functions', function() {
            var oldPath = window.location.pathname;

            beforeEach(function() {
                //window.location.pathname = oldPath + '?query_string=true';
            });
            afterEach(function() {
                //window.location.pathname = oldPath;
            });

            it('gets the current url with the queryl url', function() {
                woopra.config('ignore_query_url', true);
                expect(tracker.getPageUrl()).to.equal(oldPath);
            });
            it('gets the current url ignoring the queryl url', function() {
                woopra.config('ignore_query_url', false);
                expect(tracker.getPageUrl()).to.equal(window.location.pathname + window.location.search);
            });

            it('builds the correct url parameters without a prefix', function() {
                var properties = {
                        name: 'WoopraUser',
                        company: 'Woopra',
                        location: 'California'
                    },
                    params;

                params = Woopra.buildUrlParams(properties, '');
                expect(params).to.equal('name=WoopraUser&company=Woopra&location=California');
            });

            it('builds the correct url parameters with a prefix', function() {
                var properties = {
                        name: 'WoopraUser',
                        company: 'Woopra',
                        location: 'California'
                    },
                    params;

                params = Woopra.buildUrlParams(properties, 'cv_');
                expect(params).to.equal('cv_name=WoopraUser&cv_company=Woopra&cv_location=California');
            });

            it('builds the correct Url parameters with proper Url encoding, without a prefix', function() {
                var params = Woopra.buildUrlParams(visitorProperties, '');
                expect(params).to.equal('name=WoopraUser&email=test%40woopra.com&company=Woopra');
            });
        });

        describe('HTTP Calls', function() {
            var spy,
                visitorData = {
                    name: 'WoopraUser',
                    company: 'Woopra'
                },
                eventData = {
                    name: 'testEvent',
                    type: 'test'
                },
                sessionData = {
                    session: 'test',
                    session2: 'test2'
                },
                loadSpy;

            beforeEach(function() {
                spy = sinon.spy(Woopra.Tracker.prototype, '_push');
                loadSpy = sinon.spy(Woopra, 'loadScript');
            });

            afterEach(function() {
                spy.restore();
                loadSpy.restore();
                tracker.identify(visitorProperties);
            });

            it('calls _push with a test endpoint and just event properties to create a url string with properties and attempt to load script', function() {
                tracker._push({
                    endpoint: 'test',
                    eventData: eventData
                });

                expect(loadSpy).to.be.calledWithMatch(/woopra.com\/track\/test\//);
                expect(loadSpy).to.be.calledWithMatch(/ce_name=testEvent/);
                expect(loadSpy).to.be.calledWithMatch(/ce_type=test/);
            });

            it('has the correct version and instance name in the request', function() {
                tracker._push({
                    endpoint: 'test',
                    eventData: eventData
                });

                expect(loadSpy).to.be.calledWithMatch(new RegExp('instance=woopra'));
            });

            it('pushes visitor properties and session properties to tracking server without a custom event', function() {
                var newVisitorProperties = {
                        name: 'notWoopraUser',
                        email: 'new@woopra.com',
                        company: 'Not Woopra'
                    };

                // Verify visitor properties first
                expect(tracker.identify()).to.eql(visitorProperties);
                tracker.identify(newVisitorProperties);
                expect(tracker.identify()).to.eql(newVisitorProperties);

                tracker.visit(sessionData);
                expect(tracker.visit()).to.eql(sessionData);

                tracker.push();
                // XXX pass by reference side effect with options
                expect(spy).to.be.called;
                expect(spy).to.be.calledWith({
                    endpoint: 'identify',
                    sessionData: sessionData,
                    visitorData: newVisitorProperties,
                    callback: undefined
                });

                expect(loadSpy).to.be.calledWithMatch(/woopra.com\/track\/identify\//);
                expect(loadSpy).to.be.calledWithMatch(/cs_session=test/);
                expect(loadSpy).to.be.calledWithMatch(/cs_session2=test2/);
                expect(loadSpy).to.be.calledWithMatch(/cv_name=notWoopraUser/);
                expect(loadSpy).to.be.calledWithMatch(/cv_company=Not%20Woopra/);
                expect(loadSpy).to.be.calledWithMatch(/cv_email=new%40woopra.com/);
            });

            it('ping() connects to "ping" endpoint', function() {
                var pSpy = sinon.spy(tracker, 'ping');

                tracker.ping();
                expect(pSpy).to.be.called;
                // XXX pass by reference side effect with options
                expect(spy).to.be.calledWith({
                    endpoint: 'ping'
                });
            });

            it('supports the old pushEvent() format with one parameter being an object', function() {
                var trSpy = sinon.spy(tracker, 'track'),
                    _name = 'testEvent';

                tracker.track({
                    name: _name,
                    type: 'test'
                });

                expect(trSpy).to.be.calledWith({name: _name, type: 'test'});
                expect(loadSpy).to.be.calledWithMatch(/woopra.com\/track\/ce\//);
                expect(loadSpy).to.be.calledWithMatch(/ce_name=testEvent/);
                expect(loadSpy).to.be.calledWithMatch(/ce_type=test/);

                trSpy.restore();
            });

            it('sends "ce" event when track() is called and chain visitor properties with identify', function() {
                var newVisitorProperties = {
                        name: 'notWoopraUser',
                        email: 'new@woopra.com',
                        company: 'Not Woopra'
                    },
                    trSpy = sinon.spy(tracker, 'track'),
                    _name = 'testEvent';

                expect(tracker.identify()).to.eql(visitorProperties);
                tracker.visit(sessionData)
                       .identify(newVisitorProperties)
                       .track(_name, {
                           type: 'test'
                       });

                expect(trSpy).to.be.calledWith(_name, {type: 'test'});
                expect(loadSpy).to.be.calledWithMatch(/woopra.com\/track\/ce\//);
                expect(loadSpy).to.be.calledWithMatch(/cv_name=notWoopraUser/);
                expect(loadSpy).to.be.calledWithMatch(/cv_company=Not%20Woopra/);
                expect(loadSpy).to.be.calledWithMatch(/cv_email=new%40woopra.com/);
                expect(loadSpy).to.be.calledWithMatch(/cs_session=test/);
                expect(loadSpy).to.be.calledWithMatch(/cs_session2=test2/);
                expect(loadSpy).to.be.calledWithMatch(/ce_name=testEvent/);
                expect(loadSpy).to.be.calledWithMatch(/ce_type=test/);

                trSpy.restore();
            });

            it('sends a "ce" event with "pv" event name if track() is called with no parameters', function() {
                var pSpy = sinon.spy(tracker, 'track');

                tracker.visit(sessionData);
                tracker.track();
                expect(pSpy).to.be.called;

                expect(spy).to.be.calledWith({
                    endpoint: 'ce',
                    visitorData: visitorProperties,
                    sessionData: sessionData,
                    eventData: {
                        name: 'pv',
                        url: tracker.getPageUrl(),
                        title: tracker.getPageTitle()
                    },
                    callback: undefined
                });
                expect(loadSpy).to.be.calledWithMatch(/woopra.com\/track\/ce\//);
                expect(loadSpy).to.be.calledWithMatch(/cv_name=WoopraUser/);
                expect(loadSpy).to.be.calledWithMatch(/cv_company=Woopra/);
                expect(loadSpy).to.be.calledWithMatch(/cs_session=test/);
                expect(loadSpy).to.be.calledWithMatch(/cs_session2=test2/);
                expect(loadSpy).to.be.calledWithMatch(/cv_email=test%40woopra.com/);
                expect(loadSpy).to.be.calledWithMatch(/ce_name=pv/);
                pSpy.restore();
            });

            describe('Callbacks', function() {
                var cb,
                    tSpy,
                    loadStub;

                beforeEach(function() {
                    cb = sinon.spy(function() {});
                    tSpy = sinon.spy(tracker, 'track');

                    loadSpy.restore();
                    loadStub = sinon.stub(Woopra, 'loadScript', function(url, callback) {
                    });
                });

                afterEach(function() {
                    loadStub.restore();
                    tSpy.restore();
                });


                it('track() with only callback as a paramenter ("pv")', function() {
                    tracker.track(cb);
                    expect(tSpy).to.be.called;

                    expect(spy).to.be.calledWith({
                        endpoint: 'ce',
                        visitorData: visitorProperties,
                        sessionData: {},
                        eventData: {
                            name: 'pv',
                            url: tracker.getPageUrl(),
                            title: tracker.getPageTitle()
                        },
                        callback: cb
                    });

                    expect(loadStub).to.be.calledWithMatch(/woopra.com\/track\/ce\//);
                    expect(loadStub).to.be.calledWithMatch(/cv_name=WoopraUser/);
                    expect(loadStub).to.be.calledWithMatch(/cv_company=Woopra/);
                    expect(loadStub).to.be.calledWithMatch(/cv_email=test%40woopra.com/);
                    expect(loadStub).to.be.calledWithMatch(/ce_name=pv/);
                    loadStub.yield();
                    expect(cb).to.be.called;
                });

                it('track() called with an event name, properties, and a callback', function() {
                    tracker.track('pv', {
                        url: 'Test'
                    }, cb);
                    expect(tSpy).to.be.called;

                    expect(spy).to.be.calledWith({
                        endpoint: 'ce',
                        visitorData: visitorProperties,
                        sessionData: {},
                        eventData: {
                            name: 'pv',
                            url: 'Test'
                        },
                        callback: cb
                    });

                    expect(loadStub).to.be.calledWithMatch(/woopra.com\/track\/ce\//);
                    expect(loadStub).to.be.calledWithMatch(/cv_name=WoopraUser/);
                    expect(loadStub).to.be.calledWithMatch(/cv_company=Woopra/);
                    expect(loadStub).to.be.calledWithMatch(/cv_email=test%40woopra.com/);
                    expect(loadStub).to.be.calledWithMatch(/ce_name=pv/);
                    expect(loadStub).to.be.calledWithMatch(/ce_url=Test/);
                    loadStub.yield();
                    expect(cb).to.be.called;
                });

                it('track() called with an object and a callback', function() {
                    tracker.track({
                        name: 'pv'
                    }, cb);
                    expect(tSpy).to.be.called;

                    expect(spy).to.be.calledWith({
                        endpoint: 'ce',
                        visitorData: visitorProperties,
                        sessionData: {},
                        eventData: {
                            name: 'pv'
                        },
                        callback: cb
                    });

                    expect(loadStub).to.be.calledWithMatch(/woopra.com\/track\/ce\//);
                    expect(loadStub).to.be.calledWithMatch(/cv_name=WoopraUser/);
                    expect(loadStub).to.be.calledWithMatch(/cv_company=Woopra/);
                    expect(loadStub).to.be.calledWithMatch(/cv_email=test%40woopra.com/);
                    expect(loadStub).to.be.calledWithMatch(/ce_name=pv/);
                    loadStub.yield();
                    expect(cb).to.be.called;
                });

                it('push() called with a callback', function() {
                    var pSpy = sinon.spy(tracker, 'push');
                    tracker.push(cb);
                    expect(pSpy).to.be.called;

                    expect(spy).to.be.calledWith({
                        endpoint: 'identify',
                        visitorData: visitorProperties,
                        sessionData: {},
                        callback: cb
                    });

                    expect(loadStub).to.be.calledWithMatch(/woopra.com\/track\/identify\//);
                    expect(loadStub).to.be.calledWithMatch(/cv_name=WoopraUser/);
                    expect(loadStub).to.be.calledWithMatch(/cv_company=Woopra/);
                    expect(loadStub).to.be.calledWithMatch(/cv_email=test%40woopra.com/);
                    loadStub.yield();
                    expect(cb).to.be.called;
                    pSpy.restore();
                });

            });
        });

    });
});
