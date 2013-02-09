describe('Woopra', function() {
    var visitorProperties = {
        name: 'WoopraUser',
        email: 'test@woopra.com',
        company: 'Woopra'
      },
      tracker;

    describe('WoopraEvent', function() {
    });

    describe('WoopraTracker', function() {
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
            expect(fireSpy).to.be.called;
            //expect(WoopraEvent).to.be.calledWith('pv', {}, visitorProperties, 'visit');
        });

    });
});
