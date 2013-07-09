(function(window, document) {
    "use strict";

    var Woopra = {};

    /*
     * Helper functions
     */

    Woopra.CONSTANTS = {
        VERSION: 11,
        ENDPOINT: window.location.protocol + '//www.woopra.com/track/',
        EVENT_ENDPOINT: window.location.protocol + '//www.woopra.com/track/ce/',
        PING_ENDPOINT: window.location.protocol + '//www.woopra.com/track/ping/'
    };

    Woopra.extend = function(o1, o2) {
        for (var key in o2) {
            o1[key] = o2[key];
        }
    };

    Woopra.readCookie = function(name) {
        var c,
            i,
            k;

        if (name === '') {
            return '';
        }
        c = "" + document.cookie;

        i = c.indexOf(name);
        if (i === -1){
            return "";
        }

        k = c.indexOf(';', i);
        if (k === -1){
            k = c.length;
        }

        return window.unescape(c.substring(i + name.length + 1, k));
    };

    Woopra.setCookie = function(k, v, exp, domain, path) {
        var cookie = [];
        cookie.push(k + '=' + v);
        cookie.push('expires=' + exp);
        cookie.push('path=' + path);
        cookie.push('domain=.' + domain);

        document.cookie = cookie.join('; ');
    };

    Woopra.getCampaignData = function() {
        var vars = Woopra.getUrlParams(),
            campaign = {},
            campaignKeys = ['source', 'medium', 'content', 'campaign', 'term'],
            key,
            value;

        for (var i = 0; i < campaignKeys.length; i++) {
            key = campaignKeys[i];
            value = vars['utm_' + key] || vars['woo_' + key];

            if (typeof value !== 'undefined') {
                campaign['campaign_' + (key === 'campaign' ? 'name' : key)] = value;
            }
        }

        return campaign;
    };

    Woopra.getUrlParams = function() {
        var vars = {};
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = decodeURIComponent(value.split("+").join(" "));
        });
        return vars;
    };

    Woopra.buildUrlParams = function(params, prefix) {
        var _prefix = prefix || '',
            key,
            p = [];

        if (typeof params === 'undefined') {
            return params;
        }

        for (key in params) {
            p.push(_prefix + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
        return p.join('&');
    };

    Woopra.randomString = function() {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            i,
            rnum,
            s = '';

        for (i = 0; i < 12; i++) {
            rnum = Math.floor(Math.random() * chars.length);
            s += chars.substring(rnum, rnum + 1);
        }

        return s;
    };

    Woopra.loadScript = function(url, callback) {
        var ssc,
            _callback,
            script = document.createElement('script');

        script.type = 'text/javascript';
        script.src = url;
        script.async = true;

        if (callback && typeof callback === 'function') {
            _callback = callback;
        }

        if (typeof script.onreadystatechange !== 'undefined') {
            script.onreadystatechange = function() {
                if (this.readyState === 'complete'|| this.readyState === 'loaded') {
                    if (_callback) {
                        _callback();
                    }
                    Woopra.removeScript(script);
                }
            };
        } else {
            script.onload = function(){
                if (_callback) {
                    _callback();
                }
                Woopra.removeScript(script);
            };
        }


        ssc = document.getElementsByTagName('script')[0];
        ssc.parentNode.insertBefore(script, ssc);
    };

    Woopra.removeScript = function(script) {
        script.parentNode.removeChild(script);
    };

    Woopra.getHost = function() {
        return window.location.host.replace('www.','');
    };

    Woopra.endsWith = function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    var attachEvent = function(el, evt, callback) {
        var attachName,
            eventName,
            other;

        if (typeof window.document.attachEvent !== 'undefined') {
            attachName = 'attachEvent';
            eventName = 'on' + evt;
        }
        else {
            attachName = 'addEventListener';
            eventName = evt;
            other = false;
        }

        el[attachName](eventName, callback, other);
    };

    var Tracker = function(instanceName) {
        this.visitorData = {};
        this.sessionData = {};
        this.options = {};
        this.instanceName = instanceName;
        this.idle = 0;
        this.cookie = '';
        this.last_activity = new Date();
        this._loaded = false;
        this.version = Woopra.CONSTANTS.VERSION;

        if (instanceName && instanceName !== '') {
            window[instanceName] = this;
        }
    };

    Tracker.prototype = {
        init: function() {
            this._setOptions();
            this._processQueue('config');
            this._setupCookie();
            this._bindEvents();
            this._loaded = true;
            this._processQueue();
        },

        /**
         * Sets the initial options
         */
        _setOptions: function() {
            var exp = new Date();

            // Set default options
            exp.setDate(exp.getDate()+365);
            this.config({
                domain : Woopra.getHost(),
                cookie_name : 'wooTracker',
                cookie_domain : null,
                cookie_path : '/',
                cookie_expire : exp,
                ping : true,
                ping_interval : 12000,
                idle_timeout : 300000,
                download_pause : 200,
                outgoing_pause : 400,
                download_tracking : true,
                outgoing_tracking : true,
                ignore_query_url: true
            });
        },

        /**
         * Processes the tracker queue in case user tries to push events
         * before tracker is ready.
         */
        _processQueue: function(type) {
            var i,
                action,
                events,
                _wpt = window._w[this.instanceName];

            if (_wpt && _wpt._e) {
                events = _wpt._e;
                for (i = 0; i < events.length; i++) {
                    action = events[i];
                    if (typeof action !== 'undefined' && this[action[0]] &&
                        (typeof type === 'undefined' || type === action[0])) {
                        this[action[0]].apply(this, Array.prototype.slice.call(action, 1));
                    }
                }
            }
        },

        /**
         * Sets up the tracking cookie
         */
        _setupCookie: function() {
            // Setup cookie
            this.cookie = Woopra.readCookie(this.config('cookie_name'));
            if (this.cookie && this.cookie.length > 0) {
            }
            else {
                this.cookie = Woopra.randomString();
            }

            if (this.config('cookie_domain') === null) {
                if (Woopra.endsWith(window.location.host, '.' + this.config('domain'))) {
                    this.config('cookie_domain', this.config('domain'));
                } else {
                    this.config('cookie_domain', Woopra.getHost());
                }
            }
            Woopra.setCookie(
                this.config('cookie_name'),
                this.cookie,
                this.config('cookie_exp'),
                this.config('cookie_domain'),
                this.config('cookie_path')
            );
        },

        /**
         * Binds some events to measure mouse and keyboard events
         */
        _bindEvents: function() {
            var self = this;

            attachEvent(document, 'mousedown', function() {
                self.clicked.apply(self, arguments);
            });
            attachEvent(document, 'mousemove', function() {
                self.moved.apply(self, arguments);
            });
            attachEvent(document, 'keydown', function() {
                self.typed.apply(self, arguments);
            });
        },

        /**
         * Sets/gets values from dataStore depending on arguments passed
         *
         * @param dataStore Object The tracker property to read/write
         * @param key String/Object Returns property object if key and value is undefined,
         *      acts as a getter if only `key` is defined and a string, and
         *      acts as a setter if `key` and `value` are defined OR if `key` is an object. 
         */
        _dataSetter: function(dataStore, key, value) {
            var i;

            if (typeof key === 'undefined') {
                return dataStore;
            }

            if (typeof value === 'undefined') {
                if (typeof key === 'string') {
                    return dataStore[key];
                }
                if (typeof key === 'object') {
                    for (i in key) {
                        dataStore[i] = key[i];
                        //this._dataSetter(dataStore, i, key[i]);
                    }
                }
            }
            else {
                dataStore[key] = value;
            }

            return this;
        },

        /**
         * Builds the correct tracking Url and performs an HTTP request
         */
        _push: function(endpoint, options, cb) {
            var _options = options || {},
                _endpoint = Woopra.CONSTANTS.ENDPOINT + endpoint + '/',
                random = 'ra=' + Woopra.randomString(),
                queryString,
                scriptUrl,
                types = [
                    ['visitorData', 'cv_'],
                    ['eventData', 'ce_'],
                    ['sessionData', 'cs_']
                ],
                _type,
                i,
                data = [];

            data.push(random);
            data.push(Woopra.buildUrlParams(this.getOptionParams()));

            for (i in types) {
                _type = types[i];
                if (_options[_type[0]]) {
                    data.push(Woopra.buildUrlParams(_options[_type[0]], _type[1]));
                }
            }

            queryString = '?' + data.join('&');

            scriptUrl = _endpoint + queryString;
            Woopra.loadScript(scriptUrl, cb);
        },

        /**
         * Sets configuration options
         */
        config: function(key, value) {
            var data = this._dataSetter(this.options, key, value);

            // dataSetter returns `this` when it is used as a setter
            if (data === this) {
                // do validation
                if (this.options.ping_interval < 6000) {
                    this.options.ping_interval = 6000;
                }
                else if (this.options.ping_interval > 60000) {
                    this.options.ping_interval = 60000;
                }
            }

            return data;
        },

        /**
         * Use to attach custom visit data that doesn't stick to visitor
         * ** Not in use yet
         */
        visit: function(key, value) {
            return this._dataSetter(this.sessionData, key, value);
        },

        /**
         * Attach custom visitor data
         */
        identify: function(key, value) {
            return this._dataSetter(this.visitorData, key, value);
        },

        /**
         * Generic method to call any tracker method
         */
        call: function(funcName) {
            if (this[funcName] && typeof this[funcName] === 'function') {
                this[funcName].apply(this, Array.prototype.slice.call(arguments, 1));
            }

        },

        /**
         * Send an event to tracking servr
         */
        track: function(name, options, cb) {
            var event = {};

            // Load campaign params (load first to allow overrides)
            Woopra.extend(event, Woopra.getCampaignData());

            // Track default: pageview
            if (typeof name === 'undefined') {
                event.name = 'pv',
                event.url = this.getPageUrl();
                event.title = this.getPageTitle();
            }
            // Track custom events
            else if (options === 'undefined') {
                if (typeof name === 'string') {
                    event.name = name;
                }
                if (typeof name === 'object') {
                    this._dataSetter(event, name);
                }
            }
            // Track custom events in format of name,object
            else {
                event.name = name;
                this._dataSetter(event, options);
            }

            this._push('ce', {
                visitorData: this.visitorData,
                eventData: event
            }, cb);

            this.startPing();
        },

        startPing: function() {
            var self = this;

            if (typeof this.pingInterval === 'undefined') {
                this.pingInterval = window.setInterval(function() {
                    self.ping();
                }, this.config('ping_interval'));
            }
        },

        stopPing: function() {
            if (typeof this.pingInterval !== 'undefined') {
                window.clearInterval(this.pingInterval);
                delete this.pingInterval;
            }
        },

        /**
         * Pings tracker with visitor info
         */
        ping: function() {
            var now;

            if (this.config('ping') && this.idle < this.config('idle_timeout')) {
                this._push('ping', {
                    visitorData: this.visitorData
                });
            }

            now = new Date();
            if (now - this.last_activity > 10000) {
                this.idle = now - this.last_activity;
            }

            return this;
        },

        /**
         * Pushes visitor data to server without sending an event
         */
        push: function(cb) {
            this._push('identify', {
                visitorData: this.visitorData
            }, cb);
            return this;
        },

        /**
         * synchronous sleep
         */
        sleep: function(millis) {
            var date = new Date(),
                curDate = new Date();

            while (curDate-date < millis) {
                curDate = new Date();
            }
        },

        // User Action tracking

        /**
         * Measure when the user last moved their mouse to update idle state
         */
        moved: function() {
            this.last_activity = new Date();
            this.idle = 0;
        },

        /**
         * Measure when user last typed
         */
        typed: function() {
            this.vs = 2;
        },

        /**
         * Record clicks to check for downloads and outgoing links
         */
        clicked: function(e) {
            var cElem,
                link,
                _download,
                ev;

            this.moved();

            cElem = e.srcElement || e.target;
            while (typeof cElem !== 'undefined' && cElem !== null) {
                if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
                    break;
                }
                cElem = cElem.parentNode;
            }

            if (typeof cElem !== 'undefined' && cElem !== null) {
                link = cElem;
                _download = link.pathname.match(/(?:doc|dmg|eps|jpg|jpeg|png|svg|xls|ppt|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3|mp4|m4v)($|\&)/);
                ev = false;
                if (this.config('download_tracking')) {
                    if (_download &&
                        link.href.toString().indexOf('woopra-ns.com') < 0) {
                        this.track('download', {
                            url: link.href
                        });
                        this.sleep(this.config('download_pause'));
                    }
                }
                if (this.config('outgoing_tracking')) {
                    if (!_download &&
                        link.hostname !== window.location.host &&
                        link.hostname.indexOf('javascript') === -1 &&
                        link.hostname !== '') {
                        this.track('outgoing', {
                            url: link.href
                        });
                        this.sleep(this.config('outgoing_pause'));
                    }
                }
            }
        },

        getPageUrl: function() {
            if (this.options.ignore_query_url) {
                return window.location.pathname;
            } else {
                return window.location.pathname + window.location.search;
            }
        },

        getPageTitle: function() {
            return (document.getElementsByTagName('title').length === 0) ? '' : document.getElementsByTagName('title')[0].innerHTML;
        },

        getOptionParams: function() {
            var o = {
                alias: this.config('domain'),
                instance: this.instanceName,
                cookie: Woopra.readCookie(this.config('cookie_name')),
                ka: this.config('keep_alive') || this.config('ping_interval')*2,
                meta: Woopra.readCookie('wooMeta') || '',
                screen: window.screen.width + 'x' + window.screen.height,
                language: window.navigator.browserLanguage || window.navigator.language || "",
                referer: document.referrer,
                idle: '' + parseInt(this.idle/1000, 10),
                vs: 'i'
            };

            // this.vs is 2 after typing so 'writing'
            if (this.vs === 2) {
                o.vs = 'w';
                this.vs = 0;
            } else {
                if (this.idle === 0) {
                    o.vs = 'r';
                }
            }

            return o;
        },

        /**
         * Stop ping timers and cleanup any globals.  Shouldn't really
         * be needed by clients.
         */
        dispose: function() {
            this.stopPing();
            // cleanup global
            if (typeof window[this.instanceName] !== 'undefined') {
                delete window[this.instanceName];
            }
        }
    };


    //Woopra.Tracker = Tracker;
    var _public = {
        Tracker: Tracker
    };

    // Initialize instances & preloaded settings/events
    if (typeof window._w !== 'undefined') {
        for (var name in window._w) {
            var instance = new Tracker(name);
            instance.init();
        }
    }

    window.WoopraTracker = Tracker;

    if (typeof window.exports !== 'undefined') {
        Woopra.Tracker = Tracker;
        window.exports.Woopra = Woopra;
    }

})(window, document);
