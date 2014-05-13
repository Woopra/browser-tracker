var eventFire = function eventFireFn(el, etype, options) {
    if (document.createEvent) {
        var evObj = document.createEvent('HTMLEvents');
        if (options) {
            for (var i in options) {
                if (options.hasOwnProperty(i)) {
                    evObj[i] = options[i];
                }
            }
        }
        evObj.initEvent(etype, true, true);
        el.dispatchEvent(evObj);
    }
    else if (el.fireEvent) {
        el.fireEvent('on' + etype);
    }
};


describe('Woopra Tracker', function() {
    var visitorProperties = {
        name: 'WoopraUser',
        email: 'test@woopra.com',
        company: 'Woopra'
    };
    var tracker;

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

        expect(newTracker.loaded).to.be(false);
        newTracker.init();
        expect(newTracker.loaded).to.be(true);
        expect(newTracker.instanceName).to.equal('newTracker');
        expect(oSpy).was.called();
        expect(cSpy).was.called();
        expect(qSpy).was.called();
        oSpy.restore();
        cSpy.restore();
        qSpy.restore();
        newTracker.dispose();
    });

    it('parses cookies properly if a % character is in the cookies', function() {
        var expires = new Date();
        expires.setDate(expires.getDate() + '10');
        document.cookie = 'test=%!@#$%^&*()_+-[]\\l;"\',./<>?~`';
        expect(Woopra.cookie).to.not.throwException();
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
        var newVal = 'optionValue';

        tracker.config('testOption', newVal);
        expect(tracker.options.testOption).to.equal(newVal);
    });

    it('extends options if an object is passed in', function() {
        var newVal = 'optionValue';

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

    it('can be called with a configurable protocol', function() {
        var t = new WoopraTracker('t'),
            spy = sinon.stub(Woopra, 'loadScript', function() {
            });

        t.init();
        t.config('protocol', 'file');

        t._push({
            endpoint: 'test'
        });

        expect(spy).was.calledWithMatch(/^file:\/\/www.woopra.com\/track\/test\//);
        t.dispose();
        spy.restore();
    });

    describe('Pings', function() {
        var pingTracker;
        var stub;

        beforeEach(function() {
            pingTracker = new WoopraTracker('pingTracker');
            pingTracker.init();
            stub = sinon.stub(pingTracker, '_push', function() {});
        });
        afterEach(function() {
            pingTracker.dispose();
            stub.restore();
        });

        after(function() {
            if (pingTracker) {
                pingTracker.dispose();
            }
        });

        it('only has one ping timer going on at once', function() {
            var oldInterval;

            expect(pingTracker.pingInterval).to.be(undefined);

            // track() starts the ping
            pingTracker.track();
            oldInterval = pingTracker.pingInterval;
            expect(pingTracker.pingInterval).to.not.be(undefined);

            pingTracker.track();
            expect(pingTracker.pingInterval).to.equal(oldInterval);

            pingTracker.startPing();
            expect(pingTracker.pingInterval).to.equal(oldInterval);
        });

        it('has a minimum interval of 6 seconds and max of 1 minute', function() {
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
        });

        it('stopPing should stop the interval', function() {
            expect(pingTracker.pingInterval).to.be(undefined);
            pingTracker.track();
            expect(pingTracker.pingInterval).to.not.be(undefined);

            pingTracker.stopPing();
            expect(pingTracker.pingInterval).to.be(undefined);
        });

        it('stops pinging when user idle time is greater than idle_timeout', function() {
            expect(pingTracker.pingInterval).to.be(undefined);
            pingTracker.startPing();
            expect(pingTracker.pingInterval).to.not.be(undefined);

            // set idle and idle_timeout values manually
            pingTracker.idle = 10000;
            pingTracker.config('idle_timeout', 5000);

            // manually call ping
            // pingInterval should be stopped
            pingTracker.ping();
            expect(pingTracker.pingInterval).to.be(undefined);
        });

        describe('Mouse and Keyboard Events', function() {
            var pingTracker;

            beforeEach(function() {
                pingTracker = new WoopraTracker('pingTracker');
                pingTracker.init();
            });

            afterEach(function() {
                pingTracker.dispose();
            });

            it('when moved() handler is called, should not be idle', function(done) {
                var oldLastActivity = pingTracker.last_activity;
                pingTracker.idle = 1000;
                setTimeout(function() {
                    pingTracker.moved(null, new Date());
                    expect(pingTracker.idle).to.equal(0);
                    expect(pingTracker.last_activity.getTime()).to.be.greaterThan(oldLastActivity.getTime());
                    done();
                }, 1);
            });

            it('when user types, pingTracker.vs should be 2', function() {
                pingTracker.typed();
                expect(pingTracker.vs).to.equal(2);
            });

            it('has the mousedown event attached to the dom', function() {
                var cSpy = sinon.spy(pingTracker, 'moved');

                eventFire(document, 'mousedown');
                expect(cSpy).was.called();

                cSpy.restore();
            });

            it('has the mouse move event attached to the dom', function() {
                var movedSpy = sinon.stub(pingTracker, 'moved');

                eventFire(document, 'mousemove');
                expect(movedSpy).was.called();

                movedSpy.restore();
            });

            it('has the keydown event attached to the dom', function() {
                var typedSpy = sinon.spy(pingTracker, 'typed');

                eventFire(document, 'keydown');
                expect(typedSpy).was.called();

                typedSpy.restore();
            });
        });
    });

    describe('Multiple Instances', function() {
        var w1, w2, w3, sleepSpy;
        var ts1, ts2, ts3;

        beforeEach(function() {
            w1 = new WoopraTracker('w1');
            w2 = new WoopraTracker('w2');
            w3 = new WoopraTracker('w3');
            sleepSpy = sinon.spy(Woopra, 'sleep');
            ts1 = sinon.stub(w1, 'track');
            ts2 = sinon.stub(w2, 'track');
            ts3 = sinon.stub(w3, 'track');
            w1.init();
            w2.init();
            w3.init();
        });

        afterEach(function() {
            w1.dispose();
            w2.dispose();
            w3.dispose();
            sleepSpy.restore();
        });

        it('sending a track event for one instance should not affect the others', function() {
            w1.track();
            expect(ts1).was.called();
            expect(ts2).was.notCalled();
            expect(ts3).was.notCalled();
        });

        it('keydown events should be captured and recorded by all trackers', function() {
            var evt = document.createEvent('HTMLEvents'),
                s1 = sinon.spy(w1, 'typed'),
                s2 = sinon.spy(w2, 'typed'),
                s3 = sinon.spy(w3, 'typed');

            evt.initEvent('keydown', false, true);
            document.dispatchEvent(evt);
            expect(s1).was.called();
            expect(s2).was.called();
            expect(s3).was.called();

            s1.restore();
            s2.restore();
            s3.restore();
        });

        it.skip('if a 2nd Woopra tracking script is included, make sure events are only bound once', function() {
            var spy = sinon.spy(Woopra, 'attachEvent'),
                script = document.createElement('script'),
                parent;

            script.async = 1;
            script.src = '/wpt.js';
            parent = document.getElementsByTagName('script')[0];
            parent.parentNode.insertBefore(script, parent);

            expect(spy).was.notCalled();

            Woopra.removeScript(script);
            spy.restore();
        });

    });

    describe('Helper functions', function() {
        var path;
        var query;
        var stub;

        beforeEach(function() {
            path = '/a/path/index.html';
            query = '?with=query&string=true';
            stub = sinon.stub(Woopra, 'location', function(type) {
                if (type === 'href') {
                    return 'http://www.woopra-test.com' + path + query;
                }
                if (type === 'pathname') {
                    return path;
                }
                if (type === 'search') {
                    return query;
                }
            });
        });
        afterEach(function() {
            stub.restore();
        });

        it('gets the current url with the query url', function() {
            window.woopra.config('ignore_query_url', true);
            expect(tracker.getPageUrl()).to.equal(path);
        });

        it('gets the current url ignoring the query url', function() {
            window.woopra.config('ignore_query_url', false);
            expect(tracker.getPageUrl()).to.equal(path + query);
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

        it('finds a string inside of an array using Array.prototype.indexOf', function() {
            var needle = 'woopra';
            var haystack = ['door', 'haystack', 'woopra', 'table'];

            expect(haystack.indexOf(needle)).to.equal(2);
        });
        it('returns -1 when it cant find string inside of an array using Array.prototype.indexOf', function() {
            var needle = 'woopra';
            var haystack = ['door', 'haystack', 'woopra1', 'table'];

            expect(haystack.indexOf(needle)).to.equal(-1);
        });
    });

    describe('HTTP Calls', function() {
        var spy,
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
            loadSpy = sinon.stub(Woopra, 'loadScript', function() {});
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

            expect(loadSpy).was.calledWithMatch(/woopra.com\/track\/test\//);
            expect(loadSpy).was.calledWithMatch(/ce_name=testEvent/);
            expect(loadSpy).was.calledWithMatch(/ce_type=test/);
        });

        it('has the correct version and instance name in the request', function() {
            tracker._push({
                endpoint: 'test',
                eventData: eventData
            });

            expect(loadSpy).was.calledWithMatch(new RegExp('instance=woopra'));
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
            expect(spy).was.called();
            expect(spy).was.calledWith({
                endpoint: 'identify',
                sessionData: sessionData,
                visitorData: newVisitorProperties,
                callback: undefined
            });

            expect(loadSpy).was.calledWithMatch(/woopra.com\/track\/identify\//);
            expect(loadSpy).was.calledWithMatch(/cs_session=test/);
            expect(loadSpy).was.calledWithMatch(/cs_session2=test2/);
            expect(loadSpy).was.calledWithMatch(/cv_name=notWoopraUser/);
            expect(loadSpy).was.calledWithMatch(/cv_company=Not%20Woopra/);
            expect(loadSpy).was.calledWithMatch(/cv_email=new%40woopra.com/);
        });

        it('ping() connects to "ping" endpoint', function() {
            var pSpy = sinon.spy(tracker, 'ping');

            tracker.ping();
            expect(pSpy).was.called();
            // XXX pass by reference side effect with options
            expect(spy).was.calledWith({
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

            expect(trSpy).was.calledWith({name: _name, type: 'test'});
            expect(loadSpy).was.calledWithMatch(/woopra.com\/track\/ce\//);
            expect(loadSpy).was.calledWithMatch(/ce_name=testEvent/);
            expect(loadSpy).was.calledWithMatch(/ce_type=test/);

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

            expect(trSpy).was.calledWith(_name, {type: 'test'});
            expect(loadSpy).was.calledWithMatch(/woopra.com\/track\/ce\//);
            expect(loadSpy).was.calledWithMatch(/cv_name=notWoopraUser/);
            expect(loadSpy).was.calledWithMatch(/cv_company=Not%20Woopra/);
            expect(loadSpy).was.calledWithMatch(/cv_email=new%40woopra.com/);
            expect(loadSpy).was.calledWithMatch(/cs_session=test/);
            expect(loadSpy).was.calledWithMatch(/cs_session2=test2/);
            expect(loadSpy).was.calledWithMatch(/ce_name=testEvent/);
            expect(loadSpy).was.calledWithMatch(/ce_type=test/);

            trSpy.restore();
        });

        it('sends a "ce" event with "pv" event name if track() is called with no parameters', function() {
            var pSpy = sinon.spy(tracker, 'track');

            tracker.visit(sessionData);
            tracker.track();
            expect(pSpy).was.called();

            expect(spy).was.calledWith({
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
            expect(loadSpy).was.calledWithMatch(/woopra.com\/track\/ce\//);
            expect(loadSpy).was.calledWithMatch(/cv_name=WoopraUser/);
            expect(loadSpy).was.calledWithMatch(/cv_company=Woopra/);
            expect(loadSpy).was.calledWithMatch(/cs_session=test/);
            expect(loadSpy).was.calledWithMatch(/cs_session2=test2/);
            expect(loadSpy).was.calledWithMatch(/cv_email=test%40woopra.com/);
            expect(loadSpy).was.calledWithMatch(/ce_name=pv/);
            pSpy.restore();
        });

        it('Gets custom visitor data from URL and sends it with track()', function() {
            var trSpy = sinon.spy(tracker, 'track'),
                oldUrlParams = Woopra.getUrlParams,
                _name = 'testEvent';

            Woopra.getUrlParams = function() {
                return {
                    wv_realName: 'woopratest'
                };
            };

            tracker.track({
                name: _name,
                type: 'test'
            });

            expect(trSpy).was.calledWith({name: _name, type: 'test'});
            expect(loadSpy).was.calledWithMatch(/woopra.com\/track\/ce\//);
            expect(loadSpy).was.calledWithMatch(/ce_name=testEvent/);
            expect(loadSpy).was.calledWithMatch(/ce_type=test/);
            expect(loadSpy).was.calledWithMatch(/cv_realName=woopratest/);

            trSpy.restore();
            tracker.dispose();
            Woopra.getUrlParams = oldUrlParams;
        });

        it('Gets custom visitor data from URL and sends it with identify().push()', function() {
            var trSpy = sinon.spy(tracker, 'push'),
                oldUrlParams = Woopra.getUrlParams;

            Woopra.getUrlParams = function() {
                return {
                    wv_realName: 'woopratest'
                };
            };

            tracker.identify('name', 'woopra').push();

            expect(trSpy).was.calledWith();
            expect(loadSpy).was.calledWithMatch(/cv_name=woopra/);
            expect(loadSpy).was.calledWithMatch(/cv_realName=woopratest/);

            trSpy.restore();
            tracker.dispose();
            Woopra.getUrlParams = oldUrlParams;
        });

        it('Hides campaign/custom data from URL by using pushState', function() {
            var test = sinon.stub(Woopra, 'location', function(prop) {
                if (prop === 'href') {
                    return Woopra.location('protocol') + '//' + Woopra.location('host') + Woopra.location('pathname') + '?test=true&wv_testname=billy&test=&woo_campaign=test&utm_name=&test2=true&';
                }
                else {
                    return window.location[prop];
                }
            });
            var history = sinon.stub(window.history, 'replaceState');

            tracker.config('hide_campaign', true);
            expect(tracker.config('hide_campaign')).to.be(true);

            tracker.track();
            expect(history).was.calledWith(null, null, Woopra.location('protocol') + '//' + Woopra.location('host') + Woopra.location('pathname') + '?test=true&test=&test2=true&');

            tracker.dispose();
            history.restore();
            test.restore();
        });

        it('Only submit campaign data on the first track, and not subsequent tracks', function() {
            var trSpy,
                cSpy,
                oldUrlParams = Woopra.getUrlParams;

            tracker.config('campaign_once', true);
            trSpy = sinon.spy(tracker, 'push');
            cSpy = sinon.spy(Woopra, 'getCampaignData');

            Woopra.getUrlParams = function() {
                return {
                    utm_source: 'utm_source',
                    utm_content: 'utm_content'
                };
            };

            expect(tracker.sentCampaign).to.be(false);
            tracker.track('test');
            expect(tracker.sentCampaign).to.be(true);
            expect(cSpy).was.called();
            expect(loadSpy).was.calledWithMatch(/ce_name=test/);
            expect(loadSpy).was.calledWithMatch(/campaign_source=utm_source/);
            expect(loadSpy).was.calledWithMatch(/campaign_content=utm_content/);

            cSpy.reset();
            loadSpy.reset();

            tracker.track('test2');
            expect(tracker.sentCampaign).to.be(true);
            expect(cSpy).was.notCalled();
            expect(loadSpy).was.calledWithMatch(/ce_name=test2/);
            expect(loadSpy).was.neverCalledWithMatch(/campaign_source=utm_source/);
            expect(loadSpy).was.neverCalledWithMatch(/campaign_content=utm_content/);

            trSpy.restore();
            cSpy.restore();
            tracker.dispose();
            Woopra.getUrlParams = oldUrlParams;
        });

        it('Sends app property', function() {
            var app_name = 'js-client-tester';

            tracker.track();
            expect(loadSpy).was.calledWithMatch(/app=js-client/);

            // change app name to something
            tracker.config('app', app_name);
            tracker.track();
            expect(loadSpy).was.calledWithMatch(/app=js-client-tester/);

            tracker.dispose();
        });

        it('Sends ip address on push() or track() calls if it is configured', function() {
            var trSpy = sinon.spy(tracker, 'track'),
                TEST_IP = '127.0.0.1',
                _name = 'testEvent';

            tracker.config('ip', TEST_IP);

            tracker.track({
                name: _name,
                type: 'test'
            });

            expect(trSpy).was.calledWith({name: _name, type: 'test'});
            expect(loadSpy).was.calledWithMatch(/woopra.com\/track\/ce\//);
            expect(loadSpy).was.calledWithMatch(/ce_name=testEvent/);
            expect(loadSpy).was.calledWithMatch(/ce_type=test/);
            expect(loadSpy).was.calledWithMatch(/ip=127.0.0.1/);

            trSpy.restore();
            tracker.dispose();
        });

        it('Does not send cookies if use_cookies is false', function() {
            var trSpy = sinon.spy(tracker, 'track'),
                _name = 'testEvent';

            tracker.config('use_cookies', false);

            tracker.track({
                name: _name,
                type: 'test'
            });

            expect(trSpy).was.calledWith({name: _name, type: 'test'});
            expect(loadSpy).was.calledWithMatch(/woopra.com\/track\/ce\//);
            expect(loadSpy).was.calledWithMatch(/ce_name=testEvent/);
            expect(loadSpy).was.calledWithMatch(/ce_type=test/);
            expect(loadSpy).was.neverCalledWithMatch(/cookie=/);

            trSpy.restore();
            tracker.dispose();

        });

        describe('Callbacks', function() {
            var cb,
                tSpy,
                loadStub;

            beforeEach(function() {
                cb = sinon.spy(function() {});
                tSpy = sinon.spy(tracker, 'track');

                loadSpy.restore();
                loadStub = sinon.stub(Woopra, 'loadScript', function() {
                });
            });

            afterEach(function() {
                loadStub.restore();
                tSpy.restore();
            });


            it('track() with only callback as a paramenter ("pv")', function() {
                tracker.track(cb);
                expect(tSpy).was.called();

                expect(spy).was.calledWith({
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

                expect(loadStub).was.calledWithMatch(/woopra.com\/track\/ce\//);
                expect(loadStub).was.calledWithMatch(/cv_name=WoopraUser/);
                expect(loadStub).was.calledWithMatch(/cv_company=Woopra/);
                expect(loadStub).was.calledWithMatch(/cv_email=test%40woopra.com/);
                expect(loadStub).was.calledWithMatch(/ce_name=pv/);
                loadStub.yield();
                expect(cb).was.called();
            });

            it('track() called with an event name, properties, and a callback', function() {
                tracker.track('pv', {
                    url: 'Test',
                    title: 'Test Title'
                }, cb);
                expect(tSpy).was.called();

                expect(spy).was.calledWith({
                    endpoint: 'ce',
                    visitorData: visitorProperties,
                    sessionData: {},
                    eventData: {
                        name: 'pv',
                        url: 'Test',
                        title: 'Test Title'
                    },
                    callback: cb
                });

                expect(loadStub).was.calledWithMatch(/woopra.com\/track\/ce\//);
                expect(loadStub).was.calledWithMatch(/cv_name=WoopraUser/);
                expect(loadStub).was.calledWithMatch(/cv_company=Woopra/);
                expect(loadStub).was.calledWithMatch(/cv_email=test%40woopra.com/);
                expect(loadStub).was.calledWithMatch(/ce_name=pv/);
                expect(loadStub).was.calledWithMatch(/ce_url=Test/);
                loadStub.yield();
                expect(cb).was.called();
            });

            it('track() called with pv event and no properties', function() {
                tracker.track('pv', cb);
                expect(tSpy).was.called();

                expect(spy).was.calledWith({
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

                expect(loadStub).was.calledWithMatch(/woopra.com\/track\/ce\//);
                expect(loadStub).was.calledWithMatch(/cv_name=WoopraUser/);
                expect(loadStub).was.calledWithMatch(/cv_company=Woopra/);
                expect(loadStub).was.calledWithMatch(/cv_email=test%40woopra.com/);
                expect(loadStub).was.calledWithMatch(/ce_name=pv/);
                loadStub.yield();
                expect(cb).was.called();
            });

            it('track() called with pv event as an object with no properties and a callback', function() {
                tracker.track({
                    name: 'pv'
                }, cb);
                expect(tSpy).was.called();

                expect(spy).was.calledWith({
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

                expect(loadStub).was.calledWithMatch(/woopra.com\/track\/ce\//);
                expect(loadStub).was.calledWithMatch(/cv_name=WoopraUser/);
                expect(loadStub).was.calledWithMatch(/cv_company=Woopra/);
                expect(loadStub).was.calledWithMatch(/cv_email=test%40woopra.com/);
                expect(loadStub).was.calledWithMatch(/ce_name=pv/);
                loadStub.yield();
                expect(cb).was.called();
            });

            it('push() called with a callback', function() {
                var pSpy = sinon.spy(tracker, 'push');
                tracker.push(cb);
                expect(pSpy).was.called();

                expect(spy).was.calledWith({
                    endpoint: 'identify',
                    visitorData: visitorProperties,
                    sessionData: {},
                    callback: cb
                });

                expect(loadStub).was.calledWithMatch(/woopra.com\/track\/identify\//);
                expect(loadStub).was.calledWithMatch(/cv_name=WoopraUser/);
                expect(loadStub).was.calledWithMatch(/cv_company=Woopra/);
                expect(loadStub).was.calledWithMatch(/cv_email=test%40woopra.com/);
                loadStub.yield();
                expect(cb).was.called();
                pSpy.restore();
            });

        });
        describe('Outgoing Links', function() {
            var outgoing;
            var redirect;

            beforeEach(function() {
                outgoing = sinon.spy(Woopra.Tracker.prototype, 'outgoing');
            });

            afterEach(function() {
                outgoing.restore();
            });

            it('Should track outgoing links when clicked', function(done) {
                var link = $('<a>', {
                    href: 'http://testoutgoinglink.tld'
                });

                redirect = sinon.stub(Woopra, 'redirect', function() {
                    done();
                });

                loadSpy.restore();
                loadSpy = sinon.stub(Woopra, 'loadScript', function() {
                    expect(outgoing).was.called();
                    expect(loadSpy).was.called();
                    expect(loadSpy).was.calledWithMatch(/woopra.com\/track\/ce\//);
                    expect(loadSpy).was.calledWithMatch(/ce_name=outgoing/);
                });

                $(document.body).append(link);

                eventFire(link[0], 'click', {
                    which: 1
                });
            });

        });
    });

    describe('Cross Domain Tracking', function() {
        it('parses the unique id from the url', function() {
            expect(tracker.getUrlId('http://www.woopra-test.com/test/?__woopraid=test')).to.be('test');
            expect(tracker.getUrlId('http://www.woopra-test.com/test/?test=test&__woopraid=test')).to.be('test');
            expect(tracker.getUrlId('http://www.woopra-test.com/test/?test=test&__woopraid=test#hashUrl')).to.be('test');
            expect(tracker.getUrlId('http://www.woopra-test.com/test/?test=test&__woopraid=test&something=else')).to.be('test');
            expect(tracker.getUrlId('http://www.woopra-test.com/test/?test=test&__woopraid=test&')).to.be('test');
        });
        it('returns undefined if it can not parse a unique id from the url', function() {
            expect(tracker.getUrlId('http://www.woopra-test.com/test/?woopraid=test')).to.be(undefined);
            expect(tracker.getUrlId('http://www.woopra-test.com/test/?test=test&__woopraid=&something=test')).to.be(undefined);
        });
        it('sets the cookie to be the unique id from url', function() {
            var t = new Woopra.Tracker('woopra');
            var spy = sinon.spy(Woopra.Tracker.prototype, '_setupCookie');
            var get_url = sinon.spy(Woopra.Tracker.prototype, 'getUrlId');
            var location;
            var NEW_COOKIE = 'anewcookie1';

            t.init();

            expect(spy).was.called();
            expect(t.cookie).to.not.be('');
            expect(t.getUrlId()).to.be(undefined);

            // stub location so that we can inject our own woopraid in url params
            location = sinon.stub(Woopra, 'location', function(type) {
                if (type === 'href') {
                    return 'http://www.woopra-test.com/test/?test=test&__woopraid=' + NEW_COOKIE + '&';
                }
                if (type === 'host') {
                    return 'www.woopra-test.com';
                }
            });

            expect(t.getUrlId()).to.be(NEW_COOKIE);

            // now that Woopra.location is stubbed to return a URL with __woopraid
            // run setupCookie
            t._setupCookie();

            expect(get_url).was.called();
            expect(t.cookie).to.be(NEW_COOKIE);

            spy.restore();
            location.restore();
            get_url.restore();
        });

        it('decorates a given url with no query string', function() {
            var url = 'http://www.woopra-test.com';
            var decorated;

            decorated = tracker.decorate(url + '/');

            expect(decorated).to.be(url + '/?__woopraid=' + tracker.cookie);
        });

        it('decorates a given url with a query string', function() {
            var url = 'http://www.woopra-test.com/?test=true';
            var decorated;

            decorated = tracker.decorate(url);

            expect(decorated).to.be(url + '&__woopraid=' + tracker.cookie);
        });

        it('decorates a given url with a hash', function() {
            var url = 'http://www.woopra-test.com/?test=true';
            var decorated;

            decorated = tracker.decorate(url + '#hash');

            expect(decorated).to.be(url + '&__woopraid=' + tracker.cookie + '#hash');
        });

        it('undecorates a given url with no query string', function() {
            var url = 'http://www.woopra-test.com';
            var decorated;

            decorated = tracker.undecorate(url + '/?__woopraid=' + tracker.cookie);

            expect(decorated).to.be(url + '/');
        });

        it('decorates a given url with a query string', function() {
            var url = 'http://www.woopra-test.com/?test=true';
            var decorated;

            decorated = tracker.undecorate(url + '&__woopraid=' + tracker.cookie);

            expect(decorated).to.be(url);
        });

        it('decorates a given url with a hash', function() {
            var url = 'http://www.woopra-test.com/?test=true';
            var decorated;

            decorated = tracker.undecorate(url + '&__woopraid=' + tracker.cookie + '#hash');

            expect(decorated).to.be(url + '#hash');
        });

        it('checks if current domain is configured to auto-decorate links', function() {
            var t = new Woopra.Tracker('woopra');
            var domains = ['woopra1.com', 'woopra5.com'];
            var stub = sinon.stub(Woopra, 'location', function(type) {
                if (type === 'href') {
                    return 'http://www.woopra1.com';
                }
                if (type === 'hostname') {
                    return 'woopra1.com';
                }
                if (type === 'host') {
                    return 'woopra1.com';
                }
            });

            expect(t.config('cross_domain')).to.be(undefined);
            t.init();
            expect(t.config('cross_domain')).to.be(false);

            t.config('cross_domain', domains);
            expect(t.config('cross_domain').indexOf(Woopra.location('hostname'))).to.be(0);

            stub.restore();
            t.dispose();
        });

        it('decorates a <a> element', function() {
            var a;
            var url = 'http://www.woopra-test.com/?test=true';
            var decorated;

            a = document.createElement('a');
            a.href = url;

            decorated = tracker.decorate(a);

            expect(decorated).to.be(url + '&__woopraid=' + tracker.cookie);
        });

        it('decorates <a> elements on mousedown when auto decorate is configured', function() {
            var domains = ['www.woopra-outbound-url.com', 'woopra5.com'];
            var a;
            var url = 'http://www.woopra-outbound-url.com/?test=true';
            var stub = sinon.stub(Woopra, 'location', function(type) {
                if (type === 'href') {
                    return 'http://www.woopra-test.com';
                }
                if (type === 'hostname') {
                    return 'woopra-test.com';
                }
                if (type === 'host') {
                    return 'woopra-test.com';
                }
            });
            var decorate = sinon.spy(Woopra.Tracker.prototype, 'autoDecorate');

            tracker.config('cross_domain', domains);

            a = document.createElement('a');
            a.href = url;

            $(document.body).append(a);
            eventFire(a, 'mousedown');

            expect(decorate).was.called();
            expect(a.href).to.be(url + '&__woopraid=' + tracker.cookie);

            stub.restore();
            decorate.restore();
        });

        it('autoDecorate should not match subdomains', function() {
            var domains = ['woopra-outbound-url.com'];
            var a;
            var url = 'http://www.woopra-outbound-url.com/?test=true';
            var stub = sinon.stub(Woopra, 'location', function(type) {
                if (type === 'href') {
                    return 'http://www.woopra-test.com';
                }
                if (type === 'hostname') {
                    return 'woopra-test.com';
                }
                if (type === 'host') {
                    return 'woopra-test.com';
                }
            });
            var decorate = sinon.spy(Woopra.Tracker.prototype, 'autoDecorate');

            tracker.config('cross_domain', domains);

            a = document.createElement('a');
            a.href = url;

            $(document.body).append(a);
            eventFire(a, 'mousedown');

            expect(decorate).was.called();
            expect(a.href).to.be(url);

            stub.restore();
            decorate.restore();
        });

        it('hides the cross domain unique id from URL using pushState (if available)', function() {
            var test = sinon.stub(Woopra, 'location', function(prop) {
                if (prop === 'search') {
                    return '?test=true&__woopraid=anewcookie&test=&test2=true&';
                }
                else {
                   return window.location[prop];
                }
            });
            var history = sinon.stub(window.history, 'replaceState');

            Woopra.hideCrossDomainId();

            expect(history).was.calledWith(null, null, window.location.pathname + '?test=true&test=&test2=true&');

            tracker.dispose();
            history.restore();
            test.restore();
        });
    });
});
