(function(window, document) {
    "use strict";

    var Woopra = {},
        _on,
        _handler = [],
        _download_tracking = true,
        _download_pause,
        _outgoing_tracking = true,
        _outgoing_pause;


    /*
     * Helper functions
     */

    Woopra.CONSTANTS = {
        VERSION: 11,
        ENDPOINT: '//www.woopra.com/track/'
    };

    Woopra.extend = function(o1, o2) {
        for (var key in o2) {
            o1[key] = o2[key];
        }
    };

    /*!
     * jQuery Cookie Plugin v1.3.1
     * https://github.com/carhartl/jquery-cookie
     *
     * Copyright 2013 Klaus Hartl
     * Released under the MIT license
     * Modified by Woopra, Inc.
     */
    Woopra.cookie = function (key, value, opts) {
        // write
        if (value !== undefined) {
            var options = opts || {};

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            return (document.cookie = [
                    encodeURIComponent(key),
                    '=',
                    encodeURIComponent(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by ie
                    options.path    ? '; path=' + options.path : '',
                    options.domain  ? '; domain=' + options.domain : '',
                    options.secure  ? '; secure' : ''
            ].join(''));
        }

        // read
        var decode = function(s) {
            return decodeURIComponent(s.replace(/\+/g, ' '));
        };
        var converted = function converted(s) {
            if (s.indexOf('"') === 0) {
                // This is a quoted cookie as according to RFC2068, unescape
                s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
            try {
                return s;
            } catch(er) {}
        };

        var cookies = document.cookie.split('; ');
        var result = key ? undefined : {};
        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = decode(parts.join('='));

            if (key && key === name) {
                result = converted(cookie);
                break;
            }

            if (!key) {
                result[name] = converted(cookie);
            }
        }

        return result;
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

    Woopra.getCustomData = function(method, prefix) {
        var vars = Woopra.getUrlParams(),
            i,
            _prefix = prefix || 'wv_',
            key,
            value;

        for (i in vars) {
            if (vars.hasOwnProperty(i)) {
                value = vars[i];

                if (i.substring(0, _prefix.length) === _prefix) {
                    key = i.substring(_prefix.length);
                    method.call(this, key, value);
                }
            }
        }
    };

    Woopra.getVisitorUrlData = function(context) {
        Woopra.getCustomData.call(context, context.identify, 'wv_');
    };

    Woopra.hideCampaignData = function() {
        var search = window.location.search.replace(/[?&]+((?:wv_|woo_|utm_)[^=&]+)=([^&]*)/gi, '');

        if (search.substring(0, 1) !== '?' && search !== '') {
            search = '?' + search;
        }

        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, window.location.pathname + search);
        }
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
            if (params.hasOwnProperty(key)) {
                p.push(_prefix + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
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
                if (this.readyState === 4 || this.readyState === 'complete'|| this.readyState === 'loaded') {
                    if (_callback) {
                        _callback();
                    }
                }
                Woopra.removeScript(script);
            };
        } else {
            script.onload = function(){
                if (_callback) {
                    _callback();
                }
                Woopra.removeScript(script);
            };
            script.onerror = function() {
                Woopra.removeScript(script);
            };
        }


        ssc = document.getElementsByTagName('script')[0];
        ssc.parentNode.insertBefore(script, ssc);
    };

    Woopra.removeScript = function(script) {
        if (script && script.parentNode) {
            script.parentNode.removeChild(script);
        }
    };

    Woopra.getHost = function() {
        return window.location.host.replace('www.','');
    };

    Woopra.endsWith = function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };
    Woopra.sleep = function(millis) {
        var date = new Date(),
            curDate = new Date();

        while (curDate-date < millis) {
            curDate = new Date();
        }
    };

    _on = Woopra._on = function(event, callback) {
        if (!_handler[event]) {
            _handler[event] = [];
        }
        _handler[event].push(callback);
    };

    Woopra._fire = function(event) {
        var i;
        if (_handler[event]) {
            for (i = 0; i < _handler[event].length; i++) {
                _handler[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    };

    Woopra.attachEvent = function(el, evt, callback) {
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

    Woopra.leftClick = function (evt) {
        evt = evt || window.event;
        var button = (typeof evt.which !== 'undefined' && evt.which === 1) ||
                    (typeof evt.button !== 'undefined' && evt.button === 0);
        return button && !evt.metaKey && !evt.altKey && !evt.ctrlKey && !evt.shiftKey;
    };

    // attaches any events
    (function(on, fire) {
        on(document, 'mousedown', function(e) {
            fire('mousemove', e, new Date());
        });

        on(document, 'click', function(e) {
            var cElem,
                link,
                ignoreTarget = '_blank',
                _download,
                ev;


            cElem = e.srcElement || e.target;
            if (_download_tracking || _outgoing_tracking) {
                while (typeof cElem !== 'undefined' && cElem !== null) {
                    if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
                        break;
                    }
                    cElem = cElem.parentNode;
                }

                if (typeof cElem !== 'undefined' && cElem !== null) {
                    link = cElem;
                    _download = link.pathname.match(/(?:doc|dmg|eps|svg|xls|ppt|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3|mp4|m4v)($|\&)/);
                    ev = false;

                    if (_download_tracking && _download) {
                        fire('download', link.href);
                        if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
                            window.setTimeout(function() {
                                window.location.href = link.href;
                            }, _download_pause);
                        }
                    }
                    if (_outgoing_tracking && !_download &&
                        link.hostname !== window.location.hostname &&
                        link.hostname.indexOf('javascript') === -1 &&
                        link.hostname !== '') {

                        fire('outgoing', link.href);
                        if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
                            window.setTimeout(function() {
                                window.location.href = link.href;
                            }, _outgoing_pause);
                        }
                    }
                }
            }
        });

        on(document, 'mousemove', function(e) {
            fire('mousemove', e, new Date());
        });
        on(document, 'keydown', function() {
            fire('keydown');
        });
    })(Woopra.attachEvent, Woopra._fire);

    var Tracker = function(instanceName) {
        this.visitorData = {};
        this.sessionData = {};
        this.options = {};
        this.instanceName = instanceName;
        this.idle = 0;
        this.cookie = '';
        this.last_activity = new Date();
        this.loaded = false;
        this.dirtyCookie = false;
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
            this._processQueue();
            this.loaded = true;
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
                use_cookies: true,
                cookie_name : 'wooTracker',
                cookie_domain : null,
                cookie_path : '/',
                cookie_expire : exp,
                ping : true,
                ping_interval : 12000,
                idle_timeout : 300000,
                idle_threshold: 10000,
                download_pause : _download_pause || 200,
                outgoing_pause : _outgoing_pause || 200,
                download_tracking : true,
                outgoing_tracking : true,
                hide_campaign: false,
                save_url_hash: true,
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
            this.cookie = Woopra.cookie(this.config('cookie_name'));
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
            Woopra.cookie(this.config('cookie_name'), this.cookie, {
                expires: this.config('cookie_expire'),
                path: this.config('cookie_path'),
                domain: this.config('cookie_domain')
            });
            this.dirtyCookie = true;
        },

        /**
         * Binds some events to measure mouse and keyboard events
         */
        _bindEvents: function() {
            var self = this;

            _on('mousemove', function() {
                self.moved.apply(self, arguments);
            });
            _on('keydown', function() {
                self.typed.apply(self, arguments);
            });
            _on('download', function() {
              self.downloaded.apply(self, arguments);
            });
            _on('outgoing', function() {
              self.outgoing.apply(self, arguments);
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
                        if (key.hasOwnProperty(i)) {
                            if (i.substring(0, 7) === 'cookie_') {
                                this.dirtyCookie = true;
                            }
                            dataStore[i] = key[i];
                        }
                    }
                }
            }
            else {
                if (key.substring(0, 7) === 'cookie_') {
                    this.dirtyCookie = true;
                }
                dataStore[key] = value;
            }

            return this;
        },

        /**
         * Builds the correct tracking Url and performs an HTTP request
         */
        _push: function(options) {
            var _options = options || {},
                protocol = this.config('protocol'),
                _protocol = protocol && protocol !== '' ? protocol + ':' : '',
                _endpoint = _protocol + Woopra.CONSTANTS.ENDPOINT + _options.endpoint + '/',
                random = 'ra=' + Woopra.randomString(),
                queryString,
                urlParam,
                scriptUrl,
                types = [
                    ['visitorData', 'cv_'],
                    ['eventData', 'ce_'],
                    ['sessionData', 'cs_']
                ],
                _type,
                i,
                data = [];

            // Load custom visitor params from url
            Woopra.getVisitorUrlData(this);
            if (this.config('hide_campaign')) {
                Woopra.hideCampaignData();
            }

            data.push(random);
            data.push(Woopra.buildUrlParams(this.getOptionParams()));

            for (i in types) {
                if (types.hasOwnProperty(i)) {
                    _type = types[i];
                    if (_options[_type[0]]) {
                        urlParam = Woopra.buildUrlParams(_options[_type[0]], _type[1]);
                        if (urlParam) {
                            data.push(urlParam);
                        }
                    }
                }
            }

            queryString = '?' + data.join('&');

            scriptUrl = _endpoint + queryString;
            Woopra.loadScript(scriptUrl, _options.callback);
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
                _outgoing_tracking = _outgoing_tracking && this.options.outgoing_tracking;
                _outgoing_pause = this.options.outgoing_pause;
                _download_tracking = _download_tracking && this.options.download_tracking;
                _download_pause = this.options.download_pause;

                if (this.dirtyCookie && this.loaded) {
                    this._setupCookie();
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
        track: function(name, options) {
            var event = {},
                cb,
                _cb = arguments[arguments.length-1];

            // Load campaign params (load first to allow overrides)
            Woopra.extend(event, Woopra.getCampaignData());

            if (typeof _cb === 'function') {
                cb = _cb;
            }
            // Track default: pageview
            if (typeof name === 'undefined' || name === cb) {
                event.name = 'pv';
            }
            // Track custom events
            else if (typeof options === 'undefined' || options === cb) {
                if (typeof name === 'string') {
                    event.name = name;
                }
                if (typeof name === 'object') {
                    this._dataSetter(event, name);
                }
            }
            // Track custom events in format of name,object
            else {
                this._dataSetter(event, options);
                event.name = name;
            }

            // Add some defaults for pageview
            if (event.name === 'pv') {
                event.url = event.url || this.getPageUrl();
                event.title = event.title || this.getPageTitle();

                if (this.config('save_url_hash')) {
                    event.hash = event.hash || this.getPageHash();
                }
            }

            this._push({
                endpoint: 'ce',
                visitorData: this.visitorData,
                sessionData: this.sessionData,
                eventData: event,
                callback: cb
            });

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
                this._push({
                    endpoint: 'ping'
                });
            }
            else {
                this.stopPing();
            }

            now = new Date();
            if (now - this.last_activity > this.config('idle_threshold')) {
                this.idle = now - this.last_activity;
            }

            return this;
        },

        /**
         * Pushes visitor data to server without sending an event
         */
        push: function(cb) {
            this._push({
                endpoint: 'identify',
                visitorData: this.visitorData,
                sessionData: this.sessionData,
                callback: cb
            });
            return this;
        },

        /**
         * synchronous sleep
         */
        sleep: function(millis) {
            Woopra.sleep(millis);
        },

        // User Action tracking

        /**
         * Measure when the user last moved their mouse to update idle state
         */
        moved: function(e, last_activity) {
            this.last_activity = last_activity;
            this.idle = 0;
        },

        /**
         * Measure when user last typed
         */
        typed: function(e) {
            this.vs = 2;
        },

        downloaded: function(url) {
            this.track('download', {
                url: url
            });
        },

        outgoing: function(url) {
            this.track('outgoing', {
                url: url
            });
        },

        getPageUrl: function() {
            if (this.options.ignore_query_url) {
                return window.location.pathname;
            } else {
                return window.location.pathname + window.location.search;
            }
        },

        getPageHash: function() {
            return window.location.hash;
        },

        getPageTitle: function() {
            return (document.getElementsByTagName('title').length === 0) ? '' : document.getElementsByTagName('title')[0].innerHTML;
        },

        getOptionParams: function() {
            var o = {
                alias: this.config('domain'),
                instance: this.instanceName,
                ka: this.config('keep_alive') || this.config('ping_interval')*2,
                meta: Woopra.cookie('wooMeta') || '',
                screen: window.screen.width + 'x' + window.screen.height,
                language: window.navigator.browserLanguage || window.navigator.language || "",
                referer: document.referrer,
                idle: '' + parseInt(this.idle/1000, 10),
                vs: 'i'
            };

            if (this.config('use_cookies')) {
                o.cookie = Woopra.cookie(this.config('cookie_name')) || '';
            }

            if (this.config('ip')) {
                o.ip = this.config('ip');
            }
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
            if (window._w.hasOwnProperty(name)) {
                var instance = new Tracker(name);
                instance.init();
                // XXX: compatibility with old tracker and chat
                if (typeof window.woopraTracker === 'undefined') {
                    window.woopraTracker = instance;
                }
            }
        }
    }

    window.WoopraTracker = Tracker;
    window.WoopraLoadScript = Woopra.loadScript;

    if (typeof window.exports !== 'undefined') {
        Woopra.Tracker = Tracker;
        window.exports.Woopra = Woopra;
    }

})(window, document);
