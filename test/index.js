var expect = chai.expect;

function eventFire(el, etype, options) {
  // deprecated but needed by PhantomJS :(
  var evObj;
  if (document.createEvent) {
    evObj = document.createEvent('HTMLEvents');
    if (options) {
      for (var i in options) {
        if (options.hasOwnProperty(i)) {
          evObj[i] = options[i];
        }
      }
    }
    evObj.initEvent(etype, true, true);
  } else if (document.createEventObject) {
    evObj = document.createEventObject();
    evObj.eventType = etype;
  }

  if (el.dispatchEvent) {
    return el.dispatchEvent(evObj);
  } else if (el.fireEvent) {
    return el.fireEvent('on' + etype, evObj);
  }
}

describe('Woopra Tracker', function () {
  var visitorProperties = {
    name: 'WoopraUser',
    email: 'test@woopra.com',
    company: 'Woopra'
  };
  var tracker;

  beforeEach(function () {
    tracker = new Woopra.Tracker('woopra');
    tracker.config({
      domain: 'woopratest.com',
      cookie_domain: null,
      beacons: false
    });

    tracker.init();
    tracker.identify(visitorProperties);
  });

  afterEach(function () {
    tracker.reset();
    tracker.dispose();
  });

  it('initializes properly and use a different instance name', function () {
    var cSpy = sinon.spy(Woopra.Tracker.prototype, '_setupCookie'),
      qSpy = sinon.spy(Woopra.Tracker.prototype, '_processQueue'),
      newTracker = new Woopra.Tracker('newTracker');

    newTracker.config('cookie_domain', null);
    expect(newTracker.loaded).to.be.false;
    newTracker.init();
    expect(newTracker.loaded).to.be.true;
    expect(newTracker.instanceName).to.equal('newTracker');
    expect(cSpy).to.have.been.called;
    expect(qSpy).to.have.been.called;
    cSpy.restore();
    qSpy.restore();
    newTracker.dispose();
  });

  it('parses cookies properly if a % character is in the cookies', function () {
    var val = 'test=%!@#$%^&*()_+-[]\\l;"\',./<>?~`';
    Woopra.docCookies.setItem('woopratest', val);
    expect(Woopra.docCookies.getItem('woopratest')).to.equal(val);
    Woopra.docCookies.removeItem('woopratest');
  });

  it('`getCookie()` returns the Woopra cookie', function () {
    var oldCookie = tracker.getCookie();

    expect(tracker.getCookie()).to.not.equal(undefined);
    expect(tracker.getCookie()).to.not.equal(null);
    expect(tracker.getCookie()).to.not.equal('');
    expect(tracker.getCookie()).to.equal(oldCookie);
  });

  it('`reset()` changes the Woopra cookie', function () {
    var oldCookie = tracker.getCookie();

    expect(oldCookie).to.not.equal(null);

    tracker.reset();

    expect(oldCookie).to.not.equal(null);
    expect(tracker.getCookie()).to.not.equal(null);
    expect(tracker.getCookie()).to.not.equal(oldCookie);
  });

  it('Hostname with port changes the cookie', function () {
    var oldCookie = tracker.getCookie();
    var stub = sinon.stub(Woopra, 'location').callsFake(function (type) {
      if (type === 'href') {
        return window.location.href;
      }
      if (type === 'host') {
        return window.location.hostname + ':80';
      }
    });

    tracker._setupCookie();

    expect(tracker.getCookie()).to.equal(oldCookie);

    stub.restore();
  });

  it('retrieves all visitor properties when no parameters are passed', function () {
    var properties = tracker.identify();
    expect(properties).to.deep.equal(visitorProperties);
  });

  it('retrieves a visitor property when only the key name is supplied', function () {
    var property = tracker.identify('name');
    expect(property).to.equal(visitorProperties.name);
  });

  it('sets visitor properties by passing the params as key, value', function () {
    var newEmail = 'newemail@woopra.com';

    tracker.identify('email', newEmail);

    expect(tracker.visitorData.name).to.equal(visitorProperties.name);
    expect(tracker.visitorData.company).to.equal(visitorProperties.company);
    expect(tracker.visitorData.email).to.equal(newEmail);
  });

  it('sets visitor properties by passing a new object as a param and extends existing properties', function () {
    var newVisitorProperties = {
      name: 'NewUser',
      email: 'newemail@woopra.com'
    };

    tracker.identify(newVisitorProperties);

    expect(tracker.visitorData.name).to.equal(newVisitorProperties.name);
    expect(tracker.visitorData.email).to.equal(newVisitorProperties.email);
    expect(tracker.visitorData.company).to.equal(visitorProperties.company);
  });

  it('sets a tracker option when a key, value is passed', function () {
    var newVal = 'optionValue';

    tracker.config('testOption', newVal);
    expect(tracker.options.testOption).to.equal(newVal);
  });

  it('extends options if an object is passed in', function () {
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

  it('retrieves a configuration option when only the key name is supplied', function () {
    var testOpt = 'testOption',
      newVal = 'optionValue';

    tracker.config(testOpt, newVal);
    expect(tracker.config(testOpt)).to.equal(newVal);
  });

  it('can be called with a configurable protocol', function () {
    var t = new Woopra.Tracker('t'),
      spy = sinon.stub(Woopra, 'loadScript').callsFake(function () {});

    t.config('protocol', 'file');
    t.config('cookie_domain', null);
    t.init();

    t._push({
      endpoint: 'test'
    });

    expect(spy).to.have.been.calledWithMatch(
      /^file:\/\/www.woopra.com\/track\/test\//
    );
    t.dispose();
    spy.restore();
  });

  it('`getHostnameNoWww` returns full hostname with `www.` stripped out', function () {
    var stub = sinon.stub(Woopra, 'location').callsFake(function (type) {
      if (type === 'hostname') {
        return 'www.woopra-testing.com';
      }
      return '';
    });

    expect(Woopra.getHostnameNoWww()).to.equal('woopra-testing.com');

    stub.restore();
  });

  it('`getHostnameNoWww` returns full hostname when `www.` is not present in domain', function () {
    var stub = sinon.stub(Woopra, 'location').callsFake(function (type) {
      if (type === 'hostname') {
        return 'testing.woopra-testing.com';
      }
      return '';
    });

    expect(Woopra.getHostnameNoWww()).to.equal('testing.woopra-testing.com');

    stub.restore();
  });

  it('`getHostnameNoWww` returns full hostname when it does not start with `www.`', function () {
    var stub = sinon.stub(Woopra, 'location').callsFake(function (type) {
      if (type === 'hostname') {
        return 'no-www.woopra-testing.com';
      }
      return '';
    });

    expect(Woopra.getHostnameNoWww()).to.equal('no-www.woopra-testing.com');

    stub.restore();
  });

  describe('Pings', function () {
    var pingTracker;
    var stub;

    beforeEach(function () {
      pingTracker = new Woopra.Tracker('pingTracker');
      pingTracker.config('cookie_domain', null);
      pingTracker.init();
      stub = sinon.stub(pingTracker, '_push').callsFake(function () {});
    });
    afterEach(function () {
      pingTracker.dispose();
      stub.restore();
    });

    after(function () {
      if (pingTracker) {
        pingTracker.dispose();
      }
    });

    it('only has one ping timer going on at once', function () {
      var oldInterval;

      expect(pingTracker.pingInterval).to.be.undefined;

      // track() starts the ping
      pingTracker.track();
      oldInterval = pingTracker.pingInterval;
      expect(pingTracker.pingInterval).to.not.be.undefined;

      pingTracker.track();
      expect(pingTracker.pingInterval).to.equal(oldInterval);

      pingTracker.startPing();
      expect(pingTracker.pingInterval).to.equal(oldInterval);
    });

    it('has a minimum interval of 6 seconds and max of 1 minute', function () {
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

    it('stopPing should stop the interval', function () {
      expect(pingTracker.pingInterval).to.be.undefined;
      pingTracker.track();
      expect(pingTracker.pingInterval).to.not.be.undefined;

      pingTracker.stopPing();
      expect(pingTracker.pingInterval).to.be.undefined;
    });

    it('stops pinging when user idle time is greater than idle_timeout', function () {
      expect(pingTracker.pingInterval).to.be.undefined;
      pingTracker.startPing();
      expect(pingTracker.pingInterval).to.not.be.undefined;

      // set idle and idle_timeout values manually
      pingTracker.idle = 10000;
      pingTracker.config('idle_timeout', 5000);

      // manually call ping
      // pingInterval should be stopped
      pingTracker.ping();
      expect(pingTracker.pingInterval).to.be.undefined;
    });

    describe('Mouse and Keyboard Events', function () {
      var pingTracker;

      beforeEach(function () {
        pingTracker = new Woopra.Tracker('pingTracker');
        pingTracker.config('cookie_domain', null);
        pingTracker.init();
      });

      afterEach(function () {
        pingTracker.dispose();
      });

      it('when moved() handler is called, should not be idle', function () {
        var clock = sinon.useFakeTimers(Number(Date.now()));
        var oldLastActivity = pingTracker.last_activity;
        pingTracker.idle = 1000;

        clock.tick(3000);

        pingTracker.moved(null, Date.now());
        expect(pingTracker.idle).to.equal(0);
        expect(pingTracker.last_activity).to.be.greaterThan(oldLastActivity);

        clock.restore();
      });

      it('has the mousedown event attached to the dom', function () {
        var cSpy = sinon.spy(pingTracker, 'moved');

        eventFire(document, 'mousedown');
        expect(cSpy).to.have.been.called;

        cSpy.restore();
      });

      it('has the mouse move event attached to the dom', function () {
        var movedSpy = sinon.stub(pingTracker, 'moved');

        eventFire(document, 'mousemove');
        expect(movedSpy).to.have.been.called;

        movedSpy.restore();
      });
    });
  });

  describe('Multiple Instances', function () {
    var w1, w2, w3;
    var ts1, ts2, ts3;

    beforeEach(function () {
      w1 = new Woopra.Tracker('w1');
      w2 = new Woopra.Tracker('w2');
      w3 = new Woopra.Tracker('w3');
      ts1 = sinon.stub(w1, 'track');
      ts2 = sinon.stub(w2, 'track');
      ts3 = sinon.stub(w3, 'track');
      w1.config('cookie_domain', null);
      w2.config('cookie_domain', null);
      w3.config('cookie_domain', null);
      w1.init();
      w2.init();
      w3.init();
    });

    afterEach(function () {
      w1.dispose();
      w2.dispose();
      w3.dispose();
    });

    it('sending a track event for one instance should not affect the others', function () {
      w1.track();
      expect(ts1).to.have.been.called;
      expect(ts2).to.not.have.been.called;
      expect(ts3).to.not.have.been.called;
    });

    it('mousemove events should be captured and recorded by all trackers', function () {
      var s1 = sinon.spy(w1, 'moved');
      var s2 = sinon.spy(w2, 'moved');
      var s3 = sinon.spy(w3, 'moved');

      eventFire(document, 'mousemove');
      expect(s1).to.have.been.called;
      expect(s2).to.have.been.called;
      expect(s3).to.have.been.called;

      s1.restore();
      s2.restore();
      s3.restore();
    });

    it('if a 2nd Woopra tracking script is included, make sure events are only bound once', function () {
      var spy = sinon.spy(Woopra, 'attachEvent'),
        script = document.createElement('script'),
        parent;

      script.async = 1;
      script.src = '../dist/w.js';
      parent = document.getElementsByTagName('script')[0];
      parent.parentNode.insertBefore(script, parent);

      expect(spy).to.not.have.been.called;

      Woopra.removeScript(script);
      spy.restore();
    });
  });

  describe('Helper functions', function () {
    var path;
    var query;
    var stub;

    beforeEach(function () {
      path = '/a/path/index.html';
      query = '?with=query&string=true';
      stub = sinon.stub(Woopra, 'location').callsFake(function (type) {
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

    afterEach(function () {
      stub.restore();
    });

    it('gets the current url with the query url', function () {
      window.woopra.config('ignore_query_url', true);
      expect(tracker.getPageUrl()).to.equal(path);
    });

    it('gets the current url ignoring the query url', function () {
      window.woopra.config('ignore_query_url', false);
      expect(tracker.getPageUrl()).to.equal(path + query);
    });

    it('builds the correct url parameters without a prefix', function () {
      var properties = {
          name: 'WoopraUser',
          company: 'Woopra',
          location: 'California'
        },
        params;

      params = Woopra.buildUrlParams(properties, '');
      expect(params).to.equal(
        'name=WoopraUser&company=Woopra&location=California'
      );
    });

    it('builds the correct url parameters with a prefix', function () {
      var properties = {
          name: 'WoopraUser',
          company: 'Woopra',
          location: 'California'
        },
        params;

      params = Woopra.buildUrlParams(properties, 'cv_');
      expect(params).to.equal(
        'cv_name=WoopraUser&cv_company=Woopra&cv_location=California'
      );
    });

    it('builds the correct Url parameters with proper Url encoding, without a prefix', function () {
      var params = Woopra.buildUrlParams(visitorProperties, '');
      expect(params).to.equal(
        'name=WoopraUser&email=test%40woopra.com&company=Woopra'
      );
    });

    it('finds a string inside of an array using Array.prototype.indexOf', function () {
      var needle = 'woopra';
      var haystack = ['door', 'haystack', 'woopra', 'table'];

      expect(haystack.indexOf(needle)).to.equal(2);
    });

    it('returns -1 when it cant find string inside of an array using Array.prototype.indexOf', function () {
      var needle = 'woopra';
      var haystack = ['door', 'haystack', 'woopra1', 'table'];

      expect(haystack.indexOf(needle)).to.equal(-1);
    });

    it('test `getEndpoint` when configured with default values (no third party) and no path', function () {
      expect(tracker.getEndpoint()).to.equal('https://www.woopra.com/track/');
    });
    it('test `getEndpoint` when configured with default values and a path', function () {
      expect(tracker.getEndpoint('path')).to.equal(
        'https://www.woopra.com/track/path/'
      );
    });
    it('test `getEndpoint` when sending a path with a trailing slash', function () {
      expect(tracker.getEndpoint('path/')).to.equal(
        'https://www.woopra.com/track/path/'
      );
    });

    it('test `getEndpoint` when configured using third party tracking', function () {
      tracker.config('third_party', true);
      tracker.config('domain', 'test.woopra.com');

      expect(tracker.getEndpoint()).to.equal(
        'https://www.woopra.com/track/tp/test.woopra.com/'
      );
      expect(tracker.getEndpoint('path')).to.equal(
        'https://www.woopra.com/track/tp/test.woopra.com/path/'
      );
      expect(tracker.getEndpoint('path/')).to.equal(
        'https://www.woopra.com/track/tp/test.woopra.com/path/'
      );
    });
  });

  describe('Outgoing Link Helpers', function () {
    var location;
    var expectations = [
      {
        // ignore subdomain = false
        'www.woopra.com': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'woopra.com': false,
          'www.woopra.com': false,
          'www.abc.woopra.com': true,
          'abc.www.woopra.com': true,
          'abc.woopra.com': true,
          'abcdef.woopra.com': true
        },
        'woopra.com': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'woopra.com': false,
          'www.woopra.com': false,
          'www.abc.woopra.com': true,
          'abc.www.woopra.com': true,
          'abc.woopra.com': true,
          'abcdef.woopra.com': true
        },
        'abc.woopra.com': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'woopra.com': true,
          'www.woopra.com': true,
          'www.abc.woopra.com': false,
          'abc.www.woopra.com': true,
          'abc.woopra.com': false,
          'abcdef.woopra.com': true
        },
        'woopra.co.uk': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'google.co.uk': true,
          'www.google.co.uk': true,
          'woopra.co.uk': false,
          'test.woopra.co.uk': true
        },
        'test.woopra.co.uk': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'google.co.uk': true,
          'www.google.co.uk': true,
          'woopra.co.uk': true,
          'test.woopra.co.uk': false
        }
      },
      {
        // ignore subdomain = true
        'www.woopra.com': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'woopra.com': false,
          'www.woopra.com': false,
          'www.abc.woopra.com': false,
          'abc.www.woopra.com': false,
          'abc.woopra.com': false,
          'abcdef.woopra.com': false
        },
        'woopra.com': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'woopra.com': false,
          'www.woopra.com': false,
          'www.abc.woopra.com': false,
          'abc.www.woopra.com': false,
          'abc.woopra.com': false,
          'abcdef.woopra.com': false
        },
        'abc.woopra.com': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'woopra.com': false,
          'www.woopra.com': false,
          'www.abc.woopra.com': false,
          'abc.www.woopra.com': false,
          'abc.woopra.com': false,
          'abcdef.woopra.com': false
        },
        'woopra.co.uk': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'google.co.uk': true,
          'www.google.co.uk': true,
          'woopra.co.uk': false,
          'test.woopra.co.uk': false
        },
        'test.woopra.co.uk': {
          'abc.google.com': true,
          'google.com': true,
          'www.google.com': true,
          'google.co.uk': true,
          'www.google.co.uk': true,
          'woopra.co.uk': false,
          'test.woopra.co.uk': false
        }
      }
    ];

    beforeEach(function () {});

    afterEach(function () {});

    expectations.forEach(function (expectation, is_ignore_subdomain) {
      describe(
        'URLs to subdomains are' +
          (is_ignore_subdomain ? ' NOT' : '') +
          ' outgoing',
        function () {
          beforeEach(function () {});

          Object.keys(expectation).forEach(function (sourceDomain) {
            var domains = expectation[sourceDomain];

            describe(
              'Source domain ' + sourceDomain + ' clicking on',
              function () {
                beforeEach(function () {
                  location = sinon
                    .stub(Woopra, 'location')
                    .callsFake(function (type) {
                      if (type === 'href') {
                        return '';
                      }
                      if (type === 'hostname') {
                        return sourceDomain;
                      }
                    });
                  tracker.config('domain', sourceDomain);
                  tracker.config(
                    'outgoing_ignore_subdomain',
                    Boolean(is_ignore_subdomain)
                  );
                });
                afterEach(function () {
                  location.restore();
                });

                Object.keys(domains).forEach(function (targetDomain) {
                  var expected = domains[targetDomain];

                  it(
                    targetDomain +
                      ' is ' +
                      (expected ? '' : 'NOT ') +
                      'outgoing',
                    function () {
                      expect(Woopra.isOutgoingLink(targetDomain)).to.equal(
                        expected
                      );
                    }
                  );
                });
              }
            );
          });
        }
      );
    });

    it('should ignore empty URLs', function () {
      expect(Woopra.isOutgoingLink('')).to.be.false;
    });

    it('should ignore URLs that are just an empty hash (#)', function () {
      expect(Woopra.isOutgoingLink('#')).to.be.false;
    });

    it('should ignore URLs that are javascript calls (i.e. javascript:void(0))', function () {
      /*eslint-disable*/
      expect(Woopra.isOutgoingLink('javascript:void(0)')).to.be.false;
      /*eslint-enable*/
    });

    it('should be an outgoing link if a URL contains the string "javascript"', function () {
      expect(Woopra.isOutgoingLink('www.woopra.com/javascript.html)')).to.be
        .true;
    });

    it('should be an outgoing link if a URL contains a hash "#"', function () {
      expect(Woopra.isOutgoingLink('www.woopra.com/#testing)')).to.be.true;
    });
  });

  describe('HTTP Calls', function () {
    var _pushSpy,
      eventData = {
        name: 'testName',
        type: 'test'
      },
      sessionData = {
        session: 'test',
        session2: 'test2'
      },
      eventName = 'testEvent',
      loadSpy;

    beforeEach(function () {
      _pushSpy = sinon.spy(Woopra.Tracker.prototype, '_push');
      loadSpy = sinon.stub(Woopra, 'loadScript').callsFake(function () {});
    });

    afterEach(function () {
      _pushSpy.restore();
      loadSpy.restore();
      tracker.identify(visitorProperties);
    });

    it('calls _push with a test endpoint and just event properties to create a url string with properties and attempt to load script', function () {
      tracker._push({
        eventName: eventName,
        endpoint: 'test',
        eventData: eventData
      });

      expect(loadSpy).to.have.been.calledWithMatch(/woopra.com\/track\/test\//);
      expect(loadSpy).to.have.been.calledWithMatch(/event=testEvent/);
      expect(loadSpy).to.have.been.calledWithMatch(/ce_type=test/);
      // also ce_name should be a valid event property
      expect(loadSpy).to.have.been.calledWithMatch(/ce_name=testName/);
    });

    it('sends configured `domain` as `project` parameter when tracking', function () {
      tracker.track();

      expect(loadSpy).to.have.been.calledWithMatch(/project=woopratest.com/);
    });

    it('has the correct version and instance name in the request', function () {
      tracker._push({
        endpoint: 'test',
        eventData: eventData
      });

      expect(loadSpy).to.have.been.calledWithMatch(
        new RegExp('instance=woopra')
      );
    });

    it('does not send the tpc url param by default', function () {
      tracker._push({
        endpoint: 'test',
        eventData: eventData
      });

      expect(loadSpy).to.not.have.been.calledWithMatch(/tpc=1/);
    });

    it('pushes visitor properties and session properties to tracking server without a custom event', function () {
      var newVisitorProperties = {
        name: 'notWoopraUser',
        email: 'new@woopra.com',
        company: 'Not Woopra'
      };

      // Verify visitor properties first
      expect(tracker.identify()).to.deep.equal(visitorProperties);
      tracker.identify(newVisitorProperties);
      expect(tracker.identify()).to.deep.equal(newVisitorProperties);

      tracker.visit(sessionData);
      expect(tracker.visit()).to.deep.equal(sessionData);

      tracker.push();
      // XXX pass by reference side effect with options
      expect(_pushSpy).to.have.been.called;
      expect(_pushSpy).to.have.been.calledWith({
        endpoint: 'identify',
        sessionData: sessionData,
        visitorData: newVisitorProperties,
        callback: undefined
      });

      expect(loadSpy).to.have.been.calledWithMatch(
        /woopra.com\/track\/identify\//
      );
      expect(loadSpy).to.have.been.calledWithMatch(/cs_session=test/);
      expect(loadSpy).to.have.been.calledWithMatch(/cs_session2=test2/);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_name=notWoopraUser/);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_company=Not%20Woopra/);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_email=new%40woopra.com/);
    });

    it('ping() connects to "ping" endpoint', function () {
      tracker.config('ping', true);
      var pSpy = sinon.spy(tracker, 'ping');

      tracker.ping();
      expect(pSpy).to.have.been.called;
      // XXX pass by reference side effect with options
      expect(_pushSpy).to.have.been.calledWith({
        endpoint: 'ping'
      });
      tracker.config('ping', false);
    });

    it('supports the old pushEvent() format with one parameter being an object', function () {
      var trSpy = sinon.spy(tracker, 'track'),
        _name = 'testEvent';

      tracker.track({
        name: _name,
        type: 'test'
      });

      expect(trSpy).to.have.been.calledWith({ name: _name, type: 'test' });
      expect(loadSpy).to.have.been.calledWithMatch(/woopra.com\/track\/ce\//);
      expect(loadSpy).to.have.been.calledWithMatch(/ce_name=testEvent/);
      expect(loadSpy).to.have.been.calledWithMatch(/ce_type=test/);

      trSpy.restore();
    });

    it('uses `location.hostname` if `domain` is not set', function () {
      var stub = sinon.stub(Woopra, 'location').callsFake(function (arg) {
        if (arg === 'hostname') {
          return 'hostname.woopra-test.com';
        }
        return '';
      });
      var oldDomain = tracker.config('domain');

      tracker.config('domain', null);

      tracker.track('test');

      expect(loadSpy).to.have.been.calledWithMatch(
        /project=hostname.woopra-test.com/
      );

      tracker.config('domain', oldDomain);
      stub.restore();
    });

    it('sets a warning flag to send to server if `domain` is not set', function () {
      var oldDomain = tracker.config('domain');
      tracker.config('domain', null);

      tracker.track('test');

      expect(loadSpy).to.have.been.calledWithMatch(/_warn=no_domain/);

      tracker.config('domain', oldDomain);
    });

    it('sends "ce" event when track() is called and chain visitor properties with identify', function () {
      var newVisitorProperties = {
          name: 'notWoopraUser',
          email: 'new@woopra.com',
          company: 'Not Woopra'
        },
        trSpy = sinon.spy(tracker, 'track'),
        _name = 'testEvent';

      expect(tracker.identify()).to.deep.equal(visitorProperties);
      tracker.visit(sessionData).identify(newVisitorProperties).track(_name, {
        type: 'test'
      });

      expect(trSpy).to.have.been.calledWith(_name, { type: 'test' });
      expect(loadSpy).to.have.been.calledWithMatch(/woopra.com\/track\/ce\//);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_name=notWoopraUser/);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_company=Not%20Woopra/);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_email=new%40woopra.com/);
      expect(loadSpy).to.have.been.calledWithMatch(/cs_session=test/);
      expect(loadSpy).to.have.been.calledWithMatch(/cs_session2=test2/);
      expect(loadSpy).to.have.been.calledWithMatch(/event=testEvent/);
      expect(loadSpy).to.have.been.calledWithMatch(/ce_type=test/);

      trSpy.restore();
    });

    it('sends a "ce" event with "pv" event name if track() is called with no parameters', function () {
      var pSpy = sinon.spy(tracker, 'track');

      tracker.visit(sessionData);
      tracker.track();
      expect(pSpy).to.have.been.called;

      expect(_pushSpy).to.have.been.calledWithMatch({
        endpoint: 'ce',
        visitorData: visitorProperties,
        sessionData: sessionData,
        eventName: 'pv',
        eventData: {
          url: tracker.getPageUrl(),
          title: tracker.getPageTitle(),
          domain: tracker.getDomainName(),
          uri: tracker.getURI(),
          returning: false,
          'scroll depth': sinon.match.number,
          idptnc: sinon.match.string
        },
        callback: undefined
      });

      expect(loadSpy).to.have.been.calledWithMatch(/woopra.com\/track\/ce\//);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_name=WoopraUser/);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_company=Woopra/);
      expect(loadSpy).to.have.been.calledWithMatch(/cs_session=test/);
      expect(loadSpy).to.have.been.calledWithMatch(/cs_session2=test2/);
      expect(loadSpy).to.have.been.calledWithMatch(
        /cv_email=test%40woopra.com/
      );
      expect(loadSpy).to.have.been.calledWithMatch(/event=pv/);
      pSpy.restore();
    });

    it('Gets custom visitor data from URL and sends it with track()', function () {
      var trSpy = sinon.spy(tracker, 'track'),
        oldUrlParams = Woopra.getUrlParams,
        _name = 'testEvent';

      Woopra.getUrlParams = function () {
        return {
          wv_realName: 'woopratest'
        };
      };

      tracker.track(_name, {
        type: 'test'
      });

      expect(trSpy).to.have.been.calledWith(_name, { type: 'test' });
      expect(loadSpy).to.have.been.calledWithMatch(/woopra.com\/track\/ce\//);
      expect(loadSpy).to.have.been.calledWithMatch(/event=testEvent/);
      expect(loadSpy).to.have.been.calledWithMatch(/ce_type=test/);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_realName=woopratest/);

      trSpy.restore();
      tracker.dispose();
      Woopra.getUrlParams = oldUrlParams;
    });

    it('Gets custom visitor data from URL and sends it with identify().push()', function () {
      var trSpy = sinon.spy(tracker, 'push'),
        oldUrlParams = Woopra.getUrlParams;

      Woopra.getUrlParams = function () {
        return {
          wv_realName: 'woopratest'
        };
      };

      tracker.identify('name', 'woopra').push();

      expect(trSpy).to.have.been.calledWith();
      expect(loadSpy).to.have.been.calledWithMatch(/cv_name=woopra/);
      expect(loadSpy).to.have.been.calledWithMatch(/cv_realName=woopratest/);

      trSpy.restore();
      tracker.dispose();
      Woopra.getUrlParams = oldUrlParams;
    });

    it('Hides campaign/custom data from URL by using replaceState', function () {
      var test;
      var history;

      test = sinon.stub(Woopra, 'location').callsFake(function (prop) {
        if (prop === 'href') {
          return (
            Woopra.location('protocol') +
            '//' +
            Woopra.location('host') +
            Woopra.location('pathname') +
            '?test=true&wv_testname=billy&test=&woo_campaign=test&utm_name=&test2=true&'
          );
        }
        return window.location[prop];
      });
      history = sinon.stub(Woopra, 'historyReplaceState');

      tracker.config('hide_campaign', true);
      expect(tracker.config('hide_campaign')).to.be.true;

      tracker.track();
      expect(history).to.have.been.calledWith(
        null,
        null,
        Woopra.location('protocol') +
          '//' +
          Woopra.location('host') +
          Woopra.location('pathname') +
          '?test=true&test=&test2=true&'
      );

      history.restore();
      test.restore();

      tracker.dispose();
    });

    it('Only submit campaign data on the first track, and not subsequent tracks', function () {
      var trSpy,
        cSpy,
        oldUrlParams = Woopra.getUrlParams;

      tracker.config('campaign_once', true);
      trSpy = sinon.spy(tracker, 'push');
      cSpy = sinon.spy(Woopra, 'getCampaignData');

      Woopra.getUrlParams = function () {
        return {
          utm_source: 'utm_source',
          utm_content: 'utm_content'
        };
      };

      expect(tracker.sentCampaign).to.be.false;
      tracker.track('test');
      expect(tracker.sentCampaign).to.be.true;
      expect(cSpy).to.have.been.called;
      expect(loadSpy).to.have.been.calledWithMatch(/event=test/);
      expect(loadSpy).to.have.been.calledWithMatch(
        /campaign_source=utm_source/
      );
      expect(loadSpy).to.have.been.calledWithMatch(
        /campaign_content=utm_content/
      );

      cSpy.resetHistory();
      loadSpy.resetHistory();

      tracker.track('test2');
      expect(tracker.sentCampaign).to.be.true;
      expect(cSpy).to.not.have.been.called;
      expect(loadSpy).to.have.been.calledWithMatch(/event=test2/);
      expect(loadSpy).to.not.have.been.calledWithMatch(
        /campaign_source=utm_source/
      );
      expect(loadSpy).to.not.have.been.calledWithMatch(
        /campaign_content=utm_content/
      );

      trSpy.restore();
      cSpy.restore();
      tracker.dispose();
      Woopra.getUrlParams = oldUrlParams;
    });

    it('Sends app property', function () {
      var app_name = 'js-client-tester';

      tracker.track();
      expect(loadSpy).to.have.been.calledWithMatch(/app=js-client/);

      // change app name to something
      tracker.config('app', app_name);
      tracker.track();
      expect(loadSpy).to.have.been.calledWithMatch(/app=js-client-tester/);

      tracker.dispose();
    });

    it('Sends ip address on push() or track() calls if it is configured', function () {
      var trSpy = sinon.spy(tracker, 'track'),
        TEST_IP = '127.0.0.1',
        _name = 'testEvent';

      tracker.config('ip', TEST_IP);

      tracker.track(_name, {
        type: 'test'
      });

      expect(trSpy).to.have.been.calledWith(_name, { type: 'test' });
      expect(loadSpy).to.have.been.calledWithMatch(/woopra.com\/track\/ce\//);
      expect(loadSpy).to.have.been.calledWithMatch(/event=testEvent/);
      expect(loadSpy).to.have.been.calledWithMatch(/ce_type=test/);
      expect(loadSpy).to.have.been.calledWithMatch(/ip=127.0.0.1/);

      trSpy.restore();
      tracker.dispose();
    });

    it('Does not send cookies if use_cookies is false', function () {
      var trSpy = sinon.spy(tracker, 'track'),
        _name = 'testEvent';

      tracker.config('use_cookies', false);

      tracker.track(_name, {
        type: 'test'
      });

      expect(trSpy).to.have.been.calledWith(_name, { type: 'test' });
      expect(loadSpy).to.have.been.calledWithMatch(/woopra.com\/track\/ce\//);
      expect(loadSpy).to.have.been.calledWithMatch(/event=testEvent/);
      expect(loadSpy).to.have.been.calledWithMatch(/ce_type=test/);
      expect(loadSpy).to.not.have.been.calledWithMatch(/cookie=/);

      trSpy.restore();
      tracker.dispose();
    });

    it('Third party cookies will track to a different endpoint', function () {
      var trSpy = sinon.spy(tracker, 'track');
      var _name = 'testEvent';
      var domain = 'test.woopra.com';
      var regex = new RegExp('woopra.com/track/tp/' + domain + '/ce/');

      tracker.config({
        domain: domain,
        third_party: true
      });

      tracker.track({
        name: _name,
        type: 'test'
      });

      expect(trSpy).to.have.been.calledWith({ name: _name, type: 'test' });
      expect(loadSpy).to.have.been.calledWithMatch(regex);

      trSpy.restore();
      tracker.dispose();
    });

    it('track() called with query URL mapping properties', function () {
      var oldUrlParams = Woopra.getUrlParams;

      tracker.config('map_query_params', {
        key1: 'campaign_name',
        key2: 'test_key'
      });

      //trSpy = sinon.spy(tracker, 'push');

      Woopra.getUrlParams = function () {
        return {
          key1: 'value1',
          key2: 'value2',
          key3: 'value3'
        };
      };

      tracker.track();
      expect(loadSpy).to.have.been.calledWithMatch(/campaign_name=value1/);
      expect(loadSpy).to.have.been.calledWithMatch(/test_key=value2/);

      loadSpy.resetHistory();

      tracker.dispose();
      Woopra.getUrlParams = oldUrlParams;
    });

    describe('Callbacks', function () {
      var cb, tSpy, loadStub;

      beforeEach(function () {
        cb = sinon.spy(function () {});
        tSpy = sinon.spy(tracker, 'track');

        loadSpy.restore();
        loadStub = sinon.stub(Woopra, 'loadScript').callsFake(function () {});
      });

      afterEach(function () {
        loadStub.restore();
        tSpy.restore();
      });

      it('track() with only callback as a paramenter ("pv")', function () {
        tracker.track(cb);
        expect(tSpy).to.have.been.called;

        expect(_pushSpy).to.have.been.calledWithMatch({
          endpoint: 'ce',
          visitorData: visitorProperties,
          sessionData: {},
          eventName: 'pv',
          eventData: {
            url: tracker.getPageUrl(),
            title: tracker.getPageTitle(),
            domain: tracker.getDomainName(),
            uri: tracker.getURI(),
            returning: false,
            'scroll depth': sinon.match.number,
            idptnc: sinon.match.string
          },
          callback: cb
        });

        expect(loadStub).to.have.been.calledWithMatch(
          /woopra.com\/track\/ce\//
        );
        expect(loadStub).to.have.been.calledWithMatch(/cv_name=WoopraUser/);
        expect(loadStub).to.have.been.calledWithMatch(/cv_company=Woopra/);
        expect(loadStub).to.have.been.calledWithMatch(
          /cv_email=test%40woopra.com/
        );
        expect(loadStub).to.have.been.calledWithMatch(/event=pv/);
        loadStub.yield();
        expect(cb).to.have.been.called;
      });

      it('track() called with an event name, properties, and a callback', function () {
        tracker.track(
          'pv',
          {
            url: 'Test',
            title: 'Test Title'
          },
          cb
        );
        expect(tSpy).to.have.been.called;

        expect(_pushSpy).to.have.been.calledWithMatch({
          endpoint: 'ce',
          visitorData: visitorProperties,
          sessionData: {},
          eventName: 'pv',
          eventData: {
            url: 'Test',
            title: 'Test Title',
            domain: tracker.getDomainName(),
            uri: tracker.getURI(),
            returning: false,
            'scroll depth': sinon.match.number,
            idptnc: sinon.match.string
          },
          callback: cb
        });

        expect(loadStub).to.have.been.calledWithMatch(
          /woopra.com\/track\/ce\//
        );
        expect(loadStub).to.have.been.calledWithMatch(/cv_name=WoopraUser/);
        expect(loadStub).to.have.been.calledWithMatch(/cv_company=Woopra/);
        expect(loadStub).to.have.been.calledWithMatch(
          /cv_email=test%40woopra.com/
        );
        expect(loadStub).to.have.been.calledWithMatch(/event=pv/);
        expect(loadStub).to.have.been.calledWithMatch(/ce_url=Test/);
        loadStub.yield();
        expect(cb).to.have.been.called;
      });

      it('track() called with an event name, properties, and options with an onBeforeSend callback', function () {
        tracker.track(
          'pv',
          {
            url: 'Test',
            title: 'Test Title'
          },
          { onBeforeSend: cb }
        );
        expect(tSpy).to.have.been.called;

        expect(_pushSpy).to.have.been.calledWithMatch({
          endpoint: 'ce',
          visitorData: visitorProperties,
          sessionData: {},
          eventName: 'pv',
          eventData: {
            url: 'Test',
            title: 'Test Title',
            domain: tracker.getDomainName(),
            uri: tracker.getURI(),
            returning: false,
            'scroll depth': sinon.match.number,
            idptnc: sinon.match.string
          },
          beforeCallback: cb
        });

        expect(loadStub).to.have.been.calledWithMatch(
          /woopra.com\/track\/ce\//
        );
        expect(loadStub).to.have.been.calledWithMatch(/cv_name=WoopraUser/);
        expect(loadStub).to.have.been.calledWithMatch(/cv_company=Woopra/);
        expect(loadStub).to.have.been.calledWithMatch(
          /cv_email=test%40woopra.com/
        );
        expect(loadStub).to.have.been.calledWithMatch(/event=pv/);
        expect(loadStub).to.have.been.calledWithMatch(/ce_url=Test/);
        loadStub.yield();
        expect(cb).to.have.been.called;
      });

      it('track() called with an event name, properties, and options with an onSuccess callback', function () {
        tracker.track(
          'pv',
          {
            url: 'Test',
            title: 'Test Title'
          },
          { onSuccess: cb }
        );
        expect(tSpy).to.have.been.called;

        expect(_pushSpy).to.have.been.calledWithMatch({
          endpoint: 'ce',
          visitorData: visitorProperties,
          sessionData: {},
          eventName: 'pv',
          eventData: {
            url: 'Test',
            title: 'Test Title',
            domain: tracker.getDomainName(),
            uri: tracker.getURI(),
            returning: false,
            'scroll depth': sinon.match.number,
            idptnc: sinon.match.string
          },
          callback: cb
        });

        expect(loadStub).to.have.been.calledWithMatch(
          /woopra.com\/track\/ce\//
        );
        expect(loadStub).to.have.been.calledWithMatch(/cv_name=WoopraUser/);
        expect(loadStub).to.have.been.calledWithMatch(/cv_company=Woopra/);
        expect(loadStub).to.have.been.calledWithMatch(
          /cv_email=test%40woopra.com/
        );
        expect(loadStub).to.have.been.calledWithMatch(/event=pv/);
        expect(loadStub).to.have.been.calledWithMatch(/ce_url=Test/);
        loadStub.yield();
        expect(cb).to.have.been.called;
      });

      it('track() called with pv event and no properties', function () {
        tracker.track('pv', cb);
        expect(tSpy).to.have.been.called;

        expect(_pushSpy).to.have.been.calledWithMatch({
          endpoint: 'ce',
          visitorData: visitorProperties,
          sessionData: {},
          eventName: 'pv',
          eventData: {
            url: tracker.getPageUrl(),
            title: tracker.getPageTitle(),
            domain: tracker.getDomainName(),
            uri: tracker.getURI(),
            returning: false,
            'scroll depth': sinon.match.number,
            idptnc: sinon.match.string
          },
          callback: cb
        });

        expect(loadStub).to.have.been.calledWithMatch(
          /woopra.com\/track\/ce\//
        );
        expect(loadStub).to.have.been.calledWithMatch(/cv_name=WoopraUser/);
        expect(loadStub).to.have.been.calledWithMatch(/cv_company=Woopra/);
        expect(loadStub).to.have.been.calledWithMatch(
          /cv_email=test%40woopra.com/
        );
        expect(loadStub).to.have.been.calledWithMatch(/event=pv/);
        loadStub.yield();
        expect(cb).to.have.been.called;
      });

      it('track() called with pv event as an object with no properties and a callback', function () {
        tracker.track(
          {
            name: 'pv'
          },
          cb
        );
        expect(tSpy).to.have.been.called;

        expect(_pushSpy).to.have.been.calledWithMatch({
          endpoint: 'ce',
          visitorData: visitorProperties,
          sessionData: {},
          eventName: 'pv',
          eventData: {
            name: 'pv',
            url: tracker.getPageUrl(),
            title: tracker.getPageTitle(),
            domain: tracker.getDomainName(),
            uri: tracker.getURI(),
            returning: false,
            'scroll depth': sinon.match.number,
            idptnc: sinon.match.string
          },
          callback: cb
        });

        expect(loadStub).to.have.been.calledWithMatch(
          /woopra.com\/track\/ce\//
        );
        expect(loadStub).to.have.been.calledWithMatch(/cv_name=WoopraUser/);
        expect(loadStub).to.have.been.calledWithMatch(/cv_company=Woopra/);
        expect(loadStub).to.have.been.calledWithMatch(
          /cv_email=test%40woopra.com/
        );
        expect(loadStub).to.have.been.calledWithMatch(/ce_name=pv/);
        loadStub.yield();
        expect(cb).to.have.been.called;
      });

      it('push() called with a callback', function () {
        var pSpy = sinon.spy(tracker, 'push');
        tracker.push(cb);
        expect(pSpy).to.have.been.called;

        expect(_pushSpy).to.have.been.calledWith({
          endpoint: 'identify',
          visitorData: visitorProperties,
          sessionData: {},
          callback: cb
        });

        expect(loadStub).to.have.been.calledWithMatch(
          /woopra.com\/track\/identify\//
        );
        expect(loadStub).to.have.been.calledWithMatch(/cv_name=WoopraUser/);
        expect(loadStub).to.have.been.calledWithMatch(/cv_company=Woopra/);
        expect(loadStub).to.have.been.calledWithMatch(
          /cv_email=test%40woopra.com/
        );
        loadStub.yield();
        expect(cb).to.have.been.called;
        pSpy.restore();
      });
    });

    describe('Outgoing Links', function () {
      var outgoing;
      var sendBeacons;

      beforeEach(function () {
        outgoing = sinon.spy(Woopra.Tracker.prototype, 'outgoing');
        sendBeacons = sinon.spy(Woopra.Tracker.prototype, 'sendBeacons');
        tracker.config('outgoing_tracking', true);
      });

      afterEach(function () {
        outgoing.restore();
        sendBeacons.restore();
        tracker.config('outgoing_tracking', false);
      });

      it('Should track outgoing links when clicked', function (done) {
        var clock = sinon.useFakeTimers();
        var link = $('<a>', {
          href: 'http://testoutgoinglink.tld'
        });

        loadSpy.restore();

        loadSpy = sinon.stub(tracker, 'track').callsFake(function () {
          expect(outgoing).to.have.been.called;
          expect(loadSpy).to.have.been.called;

          expect(loadSpy).to.have.been.calledWithMatch(
            'outgoing',
            {
              url: 'http://testoutgoinglink.tld/'
            },
            { queue: false }
          );

          done();
        });

        $(document.body).append(link);

        eventFire(link[0], 'click', {
          which: 1
        });

        clock.restore();
      });

      it('Should track outgoing links using beacons when clicked', function (done) {
        tracker.config({ beacons: true });

        var clock = sinon.useFakeTimers();
        var link = $('<a>', {
          href: 'http://testoutgoinglink.tld'
        });

        loadSpy.restore();

        loadSpy = sinon.stub(tracker, 'track').callsFake(function () {
          expect(outgoing).to.have.been.called;
          expect(loadSpy).to.have.been.called;

          expect(loadSpy).to.have.been.calledWithMatch(
            'outgoing',
            {
              url: 'http://testoutgoinglink.tld/'
            },
            { queue: true }
          );

          done();
        });

        $(document.body).append(link);

        eventFire(link[0], 'click', {
          which: 1
        });

        expect(sendBeacons).to.have.been.called;

        clock.restore();
      });
    });

    describe('Downloads', function () {
      var downloaded;
      var sendBeacons;

      beforeEach(function () {
        downloaded = sinon.spy(Woopra.Tracker.prototype, 'downloaded');
        sendBeacons = sinon.spy(Woopra.Tracker.prototype, 'sendBeacons');
        tracker.config('download_tracking', true);
      });

      afterEach(function () {
        downloaded.restore();
        sendBeacons.restore();
        tracker.config('download_tracking', false);
      });

      it('Should track download links when clicked', function (done) {
        var clock = sinon.useFakeTimers();
        var link = $('<a>', {
          href: 'http://testoutgoinglink.tld/file.pdf'
        });

        loadSpy.restore();

        loadSpy = sinon.stub(tracker, 'track').callsFake(function () {
          expect(downloaded).to.have.been.called;
          expect(loadSpy).to.have.been.called;

          expect(loadSpy).to.have.been.calledWithMatch(
            'download',
            {
              url: 'http://testoutgoinglink.tld/file.pdf'
            },
            { queue: false }
          );

          done();
        });

        $(document.body).append(link);

        eventFire(link[0], 'click', {
          which: 1
        });

        clock.restore();
      });

      it('Should track outgoing links using beacons when clicked', function (done) {
        tracker.config({ beacons: true });

        var clock = sinon.useFakeTimers();
        var link = $('<a>', {
          href: 'http://testoutgoinglink.tld/file.pdf'
        });

        loadSpy.restore();

        loadSpy = sinon.stub(tracker, 'track').callsFake(function () {
          expect(downloaded).to.have.been.called;
          expect(loadSpy).to.have.been.called;

          expect(loadSpy).to.have.been.calledWithMatch(
            'download',
            {
              url: 'http://testoutgoinglink.tld/file.pdf'
            },
            { queue: true }
          );

          done();
        });

        $(document.body).append(link);

        eventFire(link[0], 'click', {
          which: 1
        });

        expect(sendBeacons).to.have.been.called;

        clock.restore();
      });
    });
  });

  describe('Cross Domain Tracking', function () {
    it('parses the unique id from the url', function () {
      expect(
        tracker.getUrlId('http://www.woopra-test.com/test/?__woopraid=test')
      ).to.equal('test');
      expect(
        tracker.getUrlId(
          'http://www.woopra-test.com/test/?test=test&__woopraid=test'
        )
      ).to.equal('test');
      expect(
        tracker.getUrlId(
          'http://www.woopra-test.com/test/?test=test&__woopraid=test#hashUrl'
        )
      ).to.equal('test');
      expect(
        tracker.getUrlId(
          'http://www.woopra-test.com/test/?test=test&__woopraid=test&something=else'
        )
      ).to.equal('test');
      expect(
        tracker.getUrlId(
          'http://www.woopra-test.com/test/?test=test&__woopraid=test&'
        )
      ).to.equal('test');
    });
    it('returns undefined if it can not parse a unique id from the url', function () {
      expect(tracker.getUrlId('http://www.woopra-test.com/test/?woopraid=test'))
        .to.be.undefined;
      expect(
        tracker.getUrlId(
          'http://www.woopra-test.com/test/?test=test&__woopraid=&something=test'
        )
      ).to.be.undefined;
    });
    it('sets the cookie to be the unique id from url', function () {
      var t = new Woopra.Tracker('woopra');
      var spy = sinon.spy(Woopra.Tracker.prototype, '_setupCookie');
      var get_url = sinon.spy(Woopra.Tracker.prototype, 'getUrlId');
      var location;
      var NEW_COOKIE = 'anewcookie1';

      t.config('cookie_domain', null);
      t.init();

      expect(spy).to.have.been.called;
      expect(t.cookie).to.not.equal('');
      expect(t.getUrlId()).to.be.undefined;

      // stub location so that we can inject our own woopraid in url params
      location = sinon.stub(Woopra, 'location').callsFake(function (type) {
        if (type === 'href') {
          return (
            'http://www.woopra-test.com/test/?test=test&__woopraid=' +
            NEW_COOKIE +
            '&'
          );
        }
        if (type === 'host') {
          return 'www.woopra-test.com';
        }
      });

      expect(t.getUrlId()).to.equal(NEW_COOKIE);

      // now that Woopra.location is stubbed to return a URL with __woopraid
      // run setupCookie
      t._setupCookie();

      expect(get_url).to.have.been.called;
      expect(t.cookie).to.equal(NEW_COOKIE);

      t.reset();
      spy.restore();
      location.restore();
      get_url.restore();
    });

    it('decorates a given url with no query string', function () {
      var url = 'http://www.woopra-test.com';
      var decorated;

      decorated = tracker.decorate(url + '/');

      expect(decorated).to.equal(url + '/?__woopraid=' + tracker.cookie);
    });

    it('decorates a given url with a query string', function () {
      var url = 'http://www.woopra-test.com/?test=true';
      var decorated;

      decorated = tracker.decorate(url);

      expect(decorated).to.equal(url + '&__woopraid=' + tracker.cookie);
    });

    it('decorates a given url with a hash', function () {
      var url = 'http://www.woopra-test.com/?test=true';
      var decorated;

      decorated = tracker.decorate(url + '#hash');

      expect(decorated).to.equal(
        url + '&__woopraid=' + tracker.cookie + '#hash'
      );
    });

    it('undecorates a given url with no query string', function () {
      var url = 'http://www.woopra-test.com';
      var decorated;

      decorated = tracker.undecorate(url + '/?__woopraid=' + tracker.cookie);

      expect(decorated).to.equal(url + '/');
    });

    it('decorates a given url with a query string', function () {
      var url = 'http://www.woopra-test.com/?test=true';
      var decorated;

      decorated = tracker.undecorate(url + '&__woopraid=' + tracker.cookie);

      expect(decorated).to.equal(url);
    });

    it('decorates a given url with a hash', function () {
      var url = 'http://www.woopra-test.com/?test=true';
      var decorated;

      decorated = tracker.undecorate(
        url + '&__woopraid=' + tracker.cookie + '#hash'
      );

      expect(decorated).to.equal(url + '#hash');
    });

    it('checks if current domain is configured to auto-decorate links', function () {
      var domains = ['woopra1.com', 'woopra5.com'];
      var stub = sinon.stub(Woopra, 'location').callsFake(function (type) {
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

      expect(tracker.config('cross_domain')).to.be.false;

      tracker.config('cross_domain', domains);
      expect(
        tracker.config('cross_domain').indexOf(Woopra.location('hostname'))
      ).to.equal(0);

      stub.restore();
    });

    it('decorates a <a> element', function () {
      var a;
      var url = 'http://www.woopra-test.com/?test=true';
      var decorated;

      a = document.createElement('a');
      a.href = url;

      decorated = tracker.decorate(a);

      expect(decorated).to.equal(url + '&__woopraid=' + tracker.cookie);
    });

    it('decorates a <a> element with a hash', function () {
      var a;
      var url = 'http://www.woopra-test.com/?test=true';
      var hash = '#hash=testing,';
      var decorated;

      a = document.createElement('a');
      a.href = url + hash;

      decorated = tracker.decorate(a);

      expect(decorated).to.equal(url + '&__woopraid=' + tracker.cookie + hash);
    });

    it('decorates <a> elements on mousedown when auto decorate is configured', function () {
      var domains = ['www.woopra-outbound-url.com', 'woopra5.com'];
      var a;
      var url = 'http://www.woopra-outbound-url.com/?test=true';
      var stub = sinon.stub(Woopra, 'location').callsFake(function (type) {
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

      expect(decorate).to.have.been.called;
      expect(a.href).to.equal(url + '&__woopraid=' + tracker.cookie);

      stub.restore();
      decorate.restore();
    });

    it.skip('autoDecorate should not match subdomains', function () {
      var domains = ['woopra-outbound-url.com'];
      var a;
      var url = 'http://www.woopra-outbound-url.com/?test=true';
      var stub = sinon.stub(Woopra, 'location').callsFake(function (type) {
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

      expect(decorate).to.have.been.called;
      expect(a.href).to.equal(url);

      stub.restore();
      decorate.restore();
    });

    describe('hides the cross domain unique id from URL using replaceState (if available)', function () {
      var history;

      beforeEach(function () {
        history = sinon.stub(Woopra, 'historyReplaceState');
      });
      afterEach(function () {
        history.restore();
      });

      it('with no query string', function () {
        var PROTOCOL = 'http:';
        var HOST = 'www.woopra-test.com';
        var PATHNAME = '/test/';
        var SEARCH = '';
        var HASH = '';
        var location;
        var url = PROTOCOL + '//' + HOST + PATHNAME + SEARCH + HASH;
        var decorated;

        location = sinon.stub(Woopra, 'location').callsFake(function (type) {
          if (type === 'href') {
            return decorated;
          }
          return window.location[type];
        });

        decorated = tracker.decorate(url);

        Woopra.hideCrossDomainId();

        expect(history).to.have.been.calledWith(null, null, url);

        location.restore();
      });

      it('with query string', function () {
        var PROTOCOL = 'http:';
        var HOST = 'www.woopra-test.com';
        var PATHNAME = '/test/';
        var SEARCH = '?testing=true&anothertest=5';
        var HASH = '';
        var location;
        var url = PROTOCOL + '//' + HOST + PATHNAME + SEARCH + HASH;
        var decorated;

        location = sinon.stub(Woopra, 'location').callsFake(function (type) {
          if (type === 'href') {
            return decorated;
          }
          return window.location[type];
        });

        decorated = tracker.decorate(url);

        Woopra.hideCrossDomainId();

        expect(history).to.have.been.calledWith(null, null, url);

        location.restore();
      });

      it('with hash', function () {
        var PROTOCOL = 'http:';
        var HOST = 'www.woopra-test.com';
        var PATHNAME = '/test/';
        var SEARCH = '';
        var HASH = '#testing';
        var location;
        var url = PROTOCOL + '//' + HOST + PATHNAME + SEARCH + HASH;
        var decorated;

        location = sinon.stub(Woopra, 'location').callsFake(function (type) {
          if (type === 'href') {
            return decorated;
          }
          return window.location[type];
        });

        decorated = tracker.decorate(url);

        Woopra.hideCrossDomainId();

        expect(history).to.have.been.calledWith(null, null, url);

        location.restore();
      });

      it('with query string and hash', function () {
        var PROTOCOL = 'http:';
        var HOST = 'www.woopra-test.com';
        var PATHNAME = '/test/';
        var SEARCH = '?test=true&anothertest=5';
        var HASH = '#testing';
        var location;
        var url = PROTOCOL + '//' + HOST + PATHNAME + SEARCH + HASH;
        var decorated;

        location = sinon.stub(Woopra, 'location').callsFake(function (type) {
          if (type === 'href') {
            return decorated;
          }
          return window.location[type];
        });

        decorated = tracker.decorate(url);

        Woopra.hideCrossDomainId();

        expect(history).to.have.been.calledWith(null, null, url);

        location.restore();
      });
    });
  });

  describe('getElement, querySelector', function () {
    var $el;
    var $el2;
    var className = 'testClass';
    var idName = 'testEl';

    beforeEach(function () {
      $el = $('<div id="testEl" class="testClass">Test Element</div>');
      $el2 = $('<div class="testClass">Test Element2</div>');

      document.body.appendChild($el[0]);
      document.body.appendChild($el2[0]);
    });

    afterEach(function () {
      document.body.removeChild($el[0]);
      document.body.removeChild($el2[0]);
    });

    it('id selector (#)', function () {
      expect(Woopra.getElement('#' + idName)[0]).to.equal(
        document.getElementById(idName)
      );
    });
    it('class selector (.)', function () {
      expect(Woopra.getElement('.' + className).length).to.equal(
        document.getElementsByClassName(className).length
      );
    });

    it('works with querySelectorAll', function () {
      if (document.querySelectorAll) {
        expect(Woopra.getElement('#' + idName).length).to.equal(
          document.querySelectorAll('#' + idName).length
        );
        expect(Woopra.getElement('.' + className).length).to.equal(
          document.querySelectorAll('.' + className).length
        );
      }
    });
  });

  describe('Tracking forms', function () {
    var elementId = 'testForm';
    var elementSel = '#' + elementId;
    var $el = $(elementSel);
    var form = $el[0];
    var formData;
    var trackSpy;
    var trackFormSpy;
    var idSpy;
    var trackCb;
    var formSpy;
    var clock;

    beforeEach(function () {
      $el = $(
        '<form id="testForm" action="." style="display: none;"><div>Name <input type="text" name="name" value="Woopra"></div><div><p><label for="email">Email</label><input type="text" name="email" value="woopra@woopra.com"></p></div> Phone <input type="text" name="phone" value="5551234"> password <input type="password" name="password1" value="woopra_password"> password2 <input type="text" name="passwords" value="woopra_otherpassword"> <select name="selector"> <option value="1" selected>1</option> <option value="2">2</option> </select> <input type="checkbox" name="checkbox[]" value="a" checked="checked"> <input type="checkbox" name="checkbox[]" value="b"> <input type="checkbox" name="checkbox[]" value="c"><div><textarea name="desc">this is my textarea</textarea></div><div> <button type="submit">Submit</button></div> </form>'
      );
      form = $el[0];

      clock = sinon.useFakeTimers();
      formData = Woopra.serializeForm(form);
      trackSpy = sinon.stub(tracker, 'track').callsFake(function (n, p, c) {
        trackCb =
          typeof c === 'function'
            ? c
            : typeof c === 'object'
            ? c.onSuccess || c.onBeforeSend
            : undefined;
      });
      trackFormSpy = sinon.spy(tracker, 'trackFormHandler');
      idSpy = sinon.stub(tracker, 'identify').callsFake(function () {});
      formSpy = sinon.stub(form, 'submit').callsFake(function () {});

      document.body.appendChild(form);
    });

    afterEach(function () {
      trackSpy.restore();
      trackFormSpy.restore();
      idSpy.restore();
      formSpy.restore();
      clock.restore();
      document.body.removeChild(form);
    });

    it('serializes the form data properly', function () {
      expect(formData).to.deep.equal({
        name: 'Woopra',
        email: 'woopra@woopra.com',
        passwords: 'woopra_otherpassword',
        phone: '5551234',
        selector: '1',
        'checkbox[]': 'a',
        desc: 'this is my textarea'
      });
    });

    it('respects the excludes option when serializing a form', function () {
      formData = Woopra.serializeForm(form, {
        exclude: ['passwords']
      });

      expect(formData).to.deep.equal({
        name: 'Woopra',
        email: 'woopra@woopra.com',
        phone: '5551234',
        selector: '1',
        'checkbox[]': 'a',
        desc: 'this is my textarea'
      });
    });

    it('calls track() with form data and event name', function () {
      expect(Boolean(form.getAttribute('data-tracked'))).to.be.false;

      tracker.trackForm('test', elementSel);

      eventFire(form, 'submit');

      expect(Boolean(form.getAttribute('data-tracked'))).to.be.true;
      expect(trackSpy).to.have.been.calledWith('test', formData);
      expect(formSpy).to.not.have.been.called;
      expect(trackFormSpy).to.have.been.calledOnce;
    });

    it('calls track() using beacons with form data and event name', function () {
      tracker.config({ beacons: true });
      expect(Boolean(form.getAttribute('data-tracked'))).to.be.false;

      tracker.trackForm('test', elementSel);

      eventFire(form, 'submit');

      expect(Boolean(form.getAttribute('data-tracked'))).to.be.true;
      expect(trackSpy).to.have.been.calledWith('test', formData, {
        queue: true,
        onBeforeSend: undefined,
        onSuccess: undefined,
        onError: undefined
      });

      expect(formSpy).to.not.have.been.called;
      expect(trackFormSpy).to.have.been.calledOnce;
    });

    it('calls track() with form data and event name and submits form after 300ms', function () {
      expect(Boolean(form.getAttribute('data-tracked'))).to.be.false;

      tracker.trackForm('test', elementSel);

      eventFire(form, 'submit');

      expect(Boolean(form.getAttribute('data-tracked'))).to.be.true;
      expect(trackSpy).to.have.been.calledWith('test', formData);

      clock.tick(300);

      expect(formSpy).to.have.been.called;
      expect(trackSpy).to.have.been.calledOnce;
      expect(trackFormSpy).to.have.been.calledOnce;
    });

    it('identifies before tracking the form', function () {
      tracker.trackForm('test', elementSel, {
        identify: function (data) {
          return {
            email: data.email
          };
        }
      });

      eventFire(form, 'submit');

      expect(idSpy).to.have.been.calledWith({
        email: 'woopra@woopra.com'
      });

      expect(trackSpy).to.have.been.calledWith('test', formData);
      expect(formSpy).to.not.have.been.called;
      expect(trackFormSpy).to.have.been.calledOnce;
    });

    it('submits the form after it tracks the form and waits for the callback and setTimeout does not submit again', function () {
      var spy = sinon.spy();

      expect(Boolean(form.getAttribute('data-tracked'))).to.be.false;

      tracker.trackForm('test', elementSel, {
        callback: spy
      });

      eventFire(form, 'submit');

      expect(Boolean(form.getAttribute('data-tracked'))).to.be.true;
      expect(trackSpy).to.have.been.calledWith('test', formData);

      trackFormSpy.restore();
      trackFormSpy = sinon
        .stub(tracker, 'trackFormHandler')
        .callsFake(function () {});
      trackCb();

      clock.tick(200);
      expect(spy).to.have.been.calledOnce;
      expect(formSpy).to.have.been.calledOnce;

      // setTimeout should go off but shouldn't submit again
      clock.tick(100);
      expect(formSpy).to.have.been.calledOnce;
    });

    it('doesnt resubmit the form and just tracks', function () {
      trackFormSpy.restore();

      trackFormSpy = sinon
        .stub(tracker, 'trackFormHandler')
        .callsFake(function (e, el, eventName, options) {
          expect(options.noSubmit).to.be.true;
          e.preventDefault();
          e.stopPropagation();
        });

      tracker.trackForm('test', elementSel, {
        noSubmit: true
      });

      eventFire(form, 'submit');
    });
  });

  describe('Tracking Clicks', function () {
    var elementId = 'testEl';
    var elementSel = '#' + elementId;
    var $el;
    var el;
    var el2;
    var trackSpy;
    var trackClickSpy;
    var idSpy;
    var trackCb;
    var clickSpy;
    var clock;

    beforeEach(function () {
      $el = $('<a href="#" id="testEl" class="testClass">Test Element</a>');
      el = $el[0];
      el2 = document.createElement('a');
      el2.setAttribute('href', '#');
      el2.setAttribute('class', 'testClass');

      clock = sinon.useFakeTimers();
      trackSpy = sinon.stub(tracker, 'track').callsFake(function (n, p, c) {
        trackCb =
          typeof c === 'function'
            ? c
            : typeof c === 'object'
            ? c.onSuccess || c.onBeforeSend
            : undefined;
      });
      // we actually can't really test trackClickHandler being called twice reliably
      // at least not in phantomjs because el.click isn't supported
      trackClickSpy = sinon.spy(tracker, 'trackClickHandler');
      idSpy = sinon.stub(tracker, 'identify').callsFake(function () {});

      // phantomJS HTMLElements don't have a click method
      if (!el.click) {
        el.click = function () {};
      }

      clickSpy = sinon.stub(el, 'click').callsFake(function () {});

      document.body.appendChild(el);
      document.body.appendChild(el2);
    });

    afterEach(function () {
      trackSpy.restore();
      trackClickSpy.restore();
      idSpy.restore();
      clickSpy.restore();
      clock.restore();
      document.body.removeChild(el);
      document.body.removeChild(el2);
    });

    it('calls track() when element is clicked', function () {
      expect(Boolean(el.getAttribute('data-tracked'))).to.be.false;

      tracker.trackClick('test', elementSel);

      eventFire(el, 'click');

      expect(Boolean(el.getAttribute('data-tracked'))).to.be.true;
      expect(trackSpy).to.have.been.calledWith('test');
      expect(trackClickSpy).to.have.been.calledOnce;
    });

    it('on elements selected by classname', function () {
      expect(Boolean(el.getAttribute('data-tracked'))).to.be.false;
      expect(Boolean(el2.getAttribute('data-tracked'))).to.be.false;

      tracker.trackClick('test', '.testClass');

      eventFire(el, 'click');
      eventFire(el2, 'click');

      expect(Boolean(el.getAttribute('data-tracked'))).to.be.true;
      expect(Boolean(el2.getAttribute('data-tracked'))).to.be.true;
      expect(trackSpy).to.have.been.calledWith('test');
      expect(trackClickSpy).to.have.been.calledTwice;
    });

    it('calls track() re-clicks after 300ms', function () {
      expect(Boolean(el.getAttribute('data-tracked'))).to.be.false;

      tracker.trackClick('test', elementSel);

      eventFire(el, 'click');

      expect(trackClickSpy).to.have.been.calledOnce;
      expect(Boolean(el.getAttribute('data-tracked'))).to.be.true;
      expect(trackSpy).to.have.been.calledWith('test');
      expect(trackClickSpy).to.have.been.calledOnce;
      expect(clickSpy).to.not.have.been.called;

      // so click event propagates

      clock.tick(300);

      expect(trackSpy).to.have.been.calledOnce;
      expect(clickSpy).to.have.been.calledOnce;
    });

    it('re-click element after it tracks, waits for the callback, setTimeout does not click again', function () {
      var spy = sinon.spy();

      expect(Boolean(el.getAttribute('data-tracked'))).to.be.false;

      tracker.trackClick(
        'test',
        elementSel,
        {},
        {
          callback: spy
        }
      );

      eventFire(el, 'click');

      expect(Boolean(el.getAttribute('data-tracked'))).to.be.true;
      expect(trackSpy).to.have.been.calledWith('test');
      expect(trackClickSpy).to.have.been.calledOnce;
      expect(clickSpy).to.not.have.been.called;

      trackCb();

      // not needed but lets tick it at 200ms anyway
      clock.tick(200);

      expect(spy).to.have.been.calledOnce;
      expect(clickSpy).to.have.been.calledOnce;

      // setTimeout should go off but shouldn't submit again
      clock.tick(100);
      expect(clickSpy).to.have.been.calledOnce;
    });

    it('doesnt re-click the element after tracking', function () {
      tracker.trackClick(
        'test',
        elementSel,
        {},
        {
          noNav: true
        }
      );

      eventFire(el, 'click');

      expect(trackSpy).to.have.been.calledWith('test');
      expect(clickSpy).to.not.have.been.called;

      clock.tick(300);
      expect(clickSpy).to.not.have.been.called;
    });
  });
});
