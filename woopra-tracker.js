(function(window, document) {
    "use strict";

    var Woopra = {};

    Woopra.Script = function(file, src, hook, async) {
        this.scriptObject = false;
        this.file = file;
        this.src = this.getEndpoint() + src;
        this.hook = hook;
        this.async = async;
    };

    Woopra.Script.prototype = {
        getProtocol: function() {
            return window.location.protocol;
        },

        getEndpoint: function() {
            return this.getProtocol() + '//www.woopra.com/track/' + this.file + '/';
        },

        clear: function() {
            this.scriptObject.parentNode.removeChild(this.scriptObject);
        },

        load: function() {
            var script = document.createElement('script'),
                ssc,
                _hook = this.hook;

            script.src = this.src;
            script.async = this.async;

            if (_hook) {
                if (typeof script.onreadystatechange !== 'undefined') {
                    script.onreadystatechange = function() {
                        if (this.readyState === 'complete'|| this.readyState === 'loaded') {
                            window.setTimeout(_hook, 400);
                        }
                    };
                }
                else {
                    script.onload = function() {
                        window.setTimeout(function() {
                            _hook.apply();
                        }, 400);
                    };
                }
            }

            ssc = document.getElementsByTagName('script')[0];
            ssc.parentNode.insertBefore(script, ssc);
        }
    };



    Woopra.Event = function(name, ce, cv, file) {
        this.name = name || 'unknown';
        this.ce = ce || {};
        this.cv = cv || {};
        this.file = file || 'ce';
        this.requestString = '';
        this.attachCampaignData();
    };

    Woopra.Event.prototype = {
        attachCampaignData: function() {
            var vars = this.getUrlVars(),
                i,
                key,
                value,
                campaignKeys = ['source', 'medium', 'content', 'campaign', 'term'];

            for (i = 0; i < campaignKeys.length; i++) {
                key = campaignKeys[i];
                value = vars['utm_' + key] || vars['woo_' + key];

                if (typeof value !== 'undefined') {
                    this.ce['woo_' + key] = value;
                }
            }
        },

        getUrlVars: function() {
            var vars = {};

            window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                vars[key] = value;
            });
            return vars;
        },

        addProperty: function(key, value) {
            this.ce[key] = value;
        },

        serialize: function(v, prefix) {
            var i,
                itemKey;

            if (this.requestString.length > 4000 ||
                typeof v === 'undefined' ||
                typeof v === 'function') {
                return;
            }

            if (typeof v === 'string' ||
                typeof v === 'number' ||
                typeof v === 'boolean') {
                this.requestString += '&' + encodeURIComponent(prefix) +
                                      '=' + encodeURIComponent(v);
                return;
            }

            if (v instanceof Array) {
                for (i=0; i < v.length; i++) {
                    this.serialize(v[i], prefix + '[' + i + ']');
                }
                return;
            }

            for (itemKey in v) {
                if (v.hasOwnProperty(itemKey)) {
                    this.serialize(v[itemKey], prefix + '.' + itemKey);
                }
            }
        },

        fire: function(tracker) {
            var t = tracker,
                key,
                rd = t.getRequestData() || {};

            t.ensure();

            this.addProperty('name', this.name);
            this.requestString = '';

            for (key in rd) {
                if (rd.hasOwnProperty(key)){
                    this.serialize(rd[key], key);
                }
            }
            for (key in this.cv) {
                if (this.cv.hasOwnProperty(key)){
                    this.serialize(this.cv[key], 'cv_'+key);
                }
            }

            for (key in this.ce){
                if (this.ce.hasOwnProperty(key)){
                    this.serialize(this.ce[key], 'ce_'+key);
                }
            }

            if (t.option('performance') && window.performance) {
                this.serialize(window.performance, 'ce_performance');
            }

            var script = new Woopra.Script(this.file, '?ra='+t.randomstring()+this.requestString, function(){}, true );
            script.load();

        }
    };

    Woopra.Tracker = function() {
        this.chat = false;
        this.alias = '';
        this.vs = 0;
        this.props = {};
        this.cv = {};
        this.cs = {};
        this.pint = false;
        this.ctr = 0;
        this.version = 20;
        this.last_activity = new Date();
        this.idle = 0;
        this.inited = 0;
        this._loaded  =  false;
    };

    Woopra.Tracker.prototype = {
        initialize: function() {
            this._setOptions();

            this._processQueue();
            this._loaded = true;
            if (typeof window.woopraReady !== 'undefined') {
                window.woopraReady(this);
            }

        },

        /**
         * Processes the tracker queue in case user tries to push events
         * before tracker is ready.
         */
        _processQueue: function() {
            var i, a,
                events,
                _wpt = window._wpt;

            if (_wpt && _wpt._e) {
                events = _wpt._e;
                window._wpt = this;
                for (i = 0; i < events.length; i++) {
                    a = events[i];
                    if (typeof a !== 'undefined') {
                        this[a[0]].apply(this, Array.prototype.slice.call(a, 1));
                    }
                }
            }
        },

        /**
         * Sets the initial options
         */
        _setOptions: function() {
            var t = this,
                exp = new Date();

            exp.setDate(exp.getDate()+365);
            this.option({
                domain: window.location.hostname,
                cookie_name: 'wooTracker',
                cookie_domain: window.location.hostname,
                cookie_path: '/',
                cookie_expire: exp,
                ping: true,
                ping_interval: 12000,
                idle_timeout: 300000,
                download_pause: 200,
                outgoing_pause: 400,
                download_tracking: true,
                outgoing_tracking: true
            });
        },

        ensure: function() {
            var t = this,
                name,
                _c;

            if (t.inited === 0) {
                t.inited = 1;

                name = t.option('cookie_name');
                _c = t.readcookie(name);
                if (!_c || _c.length <= 0) {
                    _c = t.randomstring();
                }
                t.createcookie(name, _c);

                window.setInterval(function() {
                    t.next();
                }, 1000);

                if (typeof document.attachEvent !== 'undefined') {
                    document.attachEvent("onmousedown", function() {
                        t.clicked.apply(t, arguments);
                    });
                    document.attachEvent("onmousemove", function() {
                        t.moved.apply(t, arguments);
                    });
                    document.attachEvent("onkeydown", function() {
                        t.typed.apply(t, arguments);
                    });
                } else {
                    document.addEventListener("mousedown", function() {
                        t.clicked.apply(t, arguments);
                    }, false);
                    document.addEventListener("mousemove", function() {
                        t.moved.apply(t, arguments);
                    }, false);
                    document.addEventListener("keydown", function() {
                        t.typed.apply(t, arguments);
                    }, false);
                }
            }
        },

        sleep: function(millis) {
            var date = new Date(),
                curDate = new Date();

            while (curDate-date < millis) {
                curDate = new Date();
            }
        },

        randomstring: function() {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
                i,
                rnum,
                s = '';

            for (i = 0; i < 12; i++) {
                rnum = Math.floor(Math.random() * chars.length);
                s += chars.substring(rnum, rnum + 1);
            }

            return s;
        },

        readcookie: function(k) {
            var c = document.cookie + '',
                ind,
                ind1;

            ind = c.indexOf(k);
            if (ind === -1 || k === '') {
                return '';
            }

            ind1 = c.indexOf(';', ind);
            if (ind1 === -1) {
                ind1 = c.length;
            }

            return window.unescape(c.substring(ind + k.length + 1, ind1));
        },

        createcookie: function(k, v) {
            var t = this,
                cookieval;

            cookieval = k + '=' + v + '; ' + 'expires=' + t.option('cookie_expire') + ';' + 'path='+t.option('cookie_path')+';domain=.'+t.option('cookie_domain');
            document.cookie = cookieval;
        },

        getRequestData: function(){
            var t = this,
                r = {};

            r.alias = t.option('domain');
            r.cookie = t.readcookie(t.option('cookie_name'));
            r.meta = t.readcookie('wooMeta') || '';
            r.screen = window.screen.width + 'x' + window.screen.height;
            r.language = (window.navigator.browserLanguage || window.navigator.language || "");
            r.referer = document.referrer;
            r.idle = parseInt(t.idle/1000, 10);

            if (t.vs === 2) {
                r.vs = 'w';
                t.vs = 0;
            } else {
                if (t.idle === 0) {
                    r.vs = 'r';
                } else{
                    r.vs = 'i';
                }
            }

            return r;
        },

        /**
         * Generic call method
         */
        call: function(name, options) {
        },

        /**
         * Sends a pageview event to the server
         *
         * Alias for `track('pv', options)`
         */
        pageview: function(options) {
            this._track('pv', 'visit', options);
        },

        /**
         * Sends a custom event to the server
         *
         * If you pass a `visitor` object to options, then the custom visitor
         * data in `visitor` will be sent along with the custom event
         *
         * This is equivalent to calling `_wpt.visitor(data)` before
         * calling `track()`
         */
        track: function(name, options) {
            this._track(name, 'ce', options);
        },

        /**
         * Private method to extract visitor data from options, and then
         * call WoopraEvent.fire
         */
        _track: function(name, type, options) {
            var _options = options || {};

            if (typeof _options.visitor !== 'undefined') {
                this.cv = _options.visitor;
                delete _options.visitor;
            }

            this._sync(name, type, _options);
        },

        /**
         * Wrapper to call Woopra.Event.fire
         */
        _sync: function(name, type, options) {
            var e;

            e = new Woopra.Event(name, options, this.cv, type);
            e.fire(this);
        },

        /**
         * Attach custom visitor data and then sends data to server
         * We use `email` as our unique id, so make sure you use the email as
         */
        identify: function(email, properties) {
            if (typeof email !== 'undefined' && email !== '') {
                if (typeof properties !== 'undefined') {
                    this.cv = properties;
                }

                this.visitor('email', email);
                this._sync('identify', 'identify', {});
            }
        },

        /**
         * Attach custom visitor data without sending the server an event.
         * Use identify to sync the visitor data to the server
         */
        visitor: function(name, value) {
            if (typeof name === 'string' && typeof value !== 'undefined') {
                this.cv[name] = value;
            }
            else if (typeof name === 'object') {
                this.cv = name;
            }
        },

        /**
         * Use to attach custom visit data that doesn't stick to visitor
         * ** Not in use yet
         */
        visit: function(name, value) {
            if (typeof name === 'string' && typeof value !== 'undefined') {
                this.cs[name] = value;
            }
            else if (typeof name === 'object') {
                this.cs = name;
            }
        },

        /**
         * Gets/sets tracker options
         */
        option: function(k, v) {
            if (typeof v === 'undefined') {
                if (typeof k === 'object') {
                    this.props = k;
                }
                else {
                    return this.props[k];
                }
            }
            else {
                this.props[k] = v;
            }

            return v;
        },


        /** Compatibility with old tracker methods **/
        /**
         * Shortcut to set domain
         */
        setDomain: function(domain) {
            this.option('domain', domain);
            this.option('cookie_domain', domain);
        },

        setIdleTimeout: function(timeout) {
            this.option('idle_timeout', timeout);
        },

        // XXX
        pingServer: function() {
            this._sync('x', 'ping', {});
        },

        typed: function() {
            this.vs = 2;
        },

        clicked: function(e) {
            var t = this;

            t.moved();

            var cElem = e.srcElement || e.target;
            while (typeof cElem !== 'undefined' && cElem !== null) {
                if (cElem.tagNam === 'A') {
                    break;
                }
                cElem = cElem.parentNode;
            }

            if (typeof cElem !== 'undefined' && cElem !== null) {
                var link=cElem;
                var _download = link.pathname.match(/(?:doc|dmg|eps|jpg|jpeg|png|svg|xls|ppt|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3|mp4|m4v)($|\&)/);
                var ev=false;
                if (t.option('download_tracking')) {
                    if (_download && (link.href.toString().indexOf('woopra-ns.com')<0)) {
                        ev = new Woopra.Event('download', {url:link.href});
                        ev.addProperty('url',link.href);
                        ev.fire(this);
                        t.sleep(t.option('download_pause'));
                    }
                }
                if (t.option('outgoing_tracking')) {
                    if (!_download &&
                        link.hostname !== window.location.host &&
                        link.hostname.indexOf('javascript') === -1 &&
                        link.hostname !== '') {
                        ev = new Woopra.Event('outgoing', {url:link.href});
                        ev.fire(this);
                        t.sleep(t.option('outgoing_pause'));
                    }
                }
            }
        },

        moved: function() {
            var t = this;
            t.last_activity = new Date();
            t.idle = 0;
        },

        next: function() {
            var now,
                t = this;

            //clocks every 1 second
            t.ctr++;

            if (t.ctr * 1000 > t.option('ping_interval')) {
                t.ctr = 0;
                if (t.option('ping') && t.idle < t.option('idle_timeout')) {
                    t.pingServer();
                }
            }

            now = new Date();
            if (now-t.last_activity > 10000) {
                t.idle = now - t.last_activity;
            }
        }
    };

    var woopraTracker = new Woopra.Tracker();
    woopraTracker.initialize();

    window.WoopraScript = Woopra.Script;
    if (typeof window.exports !== 'undefined') {
        window.exports.Woopra = Woopra;
    }
}(window, document));


