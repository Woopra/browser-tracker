(function(window, document) {
    "use strict";

    var Woopra = {};

    var console = window.console;

    /*
     * Helper functions
     */

    Woopra.CONSTANTS = {
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
        if (name === '') {
            return '';
        }
        var c = "" + document.cookie;

        var i = c.indexOf(name);
        if (i === -1){
            return "";
        }
        var k = c.indexOf(';', i);
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

    Woopra.getCampaignData = function(url) {
        var vars = Woopra.getUrlParams();
        var campaign = {};
        var campaignKeys = ['source', 'medium', 'content', 'campaign', 'term'];
        for (var i=0;i<campaignKeys.length;i++) {
            var key = campaignKeys[i];
            var value = vars['utm_' + key] || vars['woo_' + key];
            if (typeof value != 'undefined') {
                campaign['campaign_' + ((key=='campaign')?'name':key)] = value; 
            }
        }
        return campaign;
    };

    Woopra.getUrlParams = function(url) {
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
            script = document.createElement('script');

        script.type = 'text/javascript';
        script.src = url;
        script.async = true;

        if (typeof script.onreadystatechange != 'undefined') {
            script.onreadystatechange = function() {
                if (this.readyState === 'complete'|| this.readyState === 'loaded') {
                    if (callback) {
                        callback();
                    }
                    Woopra.removeScript(script);
                }
            };
        } else {
            script.onload = function(){
                if (callback) {
                    callback();
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


    var Tracker = function(instanceName) {
        this.visitorData = {};
        this.visitData = {};
        this.options = {};
        this.instanceName = instanceName;
        this.idle = 0;
        this.cookie = '';
        this._loaded = false;
    };

    Tracker.prototype = {
        init: function(instanceName) {
            this._setOptions();
            this._processQueue('config');
            this._setupCookie();
            this._loaded = true;
            this._processQueue();
        },

        /**
         * Processes the tracker queue in case user tries to push events
         * before tracker is ready.
         */
        _processQueue: function(type) {
            var i,
                action,
                events,
                _wpt = window._wpt[this.instanceName];

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
        _push: function(endpoint, options) {
            var _options = options || {},
                _endpoint = Woopra.CONSTANTS.ENDPOINT + endpoint + '/',
                random = 'ra=' + Woopra.randomString(),
                queryString,
                scriptUrl,
                data = [];

            data.push(random);
            data.push(Woopra.buildUrlParams(this.getOptionParams()));

            if (_options.visitorData) {
                data.push(Woopra.buildUrlParams(_options.visitorData, 'cv_'));
            }

            if (_options.eventData) {
                data.push(Woopra.buildUrlParams(_options.eventData, 'ce_'));
            }

            queryString = '?' + data.join('&');

            scriptUrl = _endpoint + queryString;
            Woopra.loadScript(scriptUrl, _options.callback);
        },

        /**
         * Sets configuration options
         */
        config: function(key, value) {
            return this._dataSetter(this.options, key, value);
        },

        /**
         * Use to attach custom visit data that doesn't stick to visitor
         * ** Not in use yet
         */
        visit: function(key, value) {
            return this._dataSetter(this.visitData, key, value);
        },

        /**
         * Attach custom visitor data
         */
        identify: function(key, value) {
            var blah = this._dataSetter(this.visitorData, key, value);

            return blah;
        },

        call: function() {
        },


        track: function(name, options) {
            var event = {},
                callback;

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

            // Extract callback
            if (typeof event.hitCallback === 'function') {
                callback = event.hitCallback;
                delete event.hitCallback;
            }

            this._push('ce', {
                visitorData: this.visitorData,
                eventData: event,
                callback: callback
            });

            this.startPing();
        },

        startPing: function() {
            var self = this;
            if (typeof this.pingInterval == 'undefined') {
                window.clearInterval(this.pingInterval);
                delete this.pingInterval;
            }
            this.pingInterval = window.setInterval(function() {
                self.ping();
            }, this.config('ping_interval'));
        },

        /**
         * Pings tracker with visitor info
         */
        ping: function() {
            this._push('ping', {
                visitorData: this.visitorData
            });

            return this;
        },

        /**
         * Pushes visitor data to server without sending an event
         */
        push: function() {
            this._push('identify', {
                visitorData: this.visitorData
            });
            return this;
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
                cookie: Woopra.readCookie(this.config('cookie_name')),
                meta: Woopra.readCookie('wooMeta') || '',
                screen: window.screen.width + 'x' + window.screen.height,
                language: window.navigator.browserLanguage || window.navigator.language || "",
                referer: document.referrer,
                idle: '' + parseInt(this.idle/1000, 10),
                vs: 'w'
            };
            /*
             if(t.vs==2){
                 r['vs']='w';
                 t.vs=0;
             }else{
                 if(t.idle==0){
                     r['vs']='r';
                 }else{
                     r['vs']='i';
                 }
                 }*/
                return o;

            }
        };


         //Woopra.Tracker = Tracker;
         var _public = {
             Tracker: Tracker
         };

         // Initialize instances & preloaded settings/events
         if (typeof window._wpt !== 'undefined') {
             for (var name in window._wpt) {
                 cosnole.log(name);
                 var instance = new Tracker(name);
                 instance.init();
                 window[name]=instance;
             }
         }

         window.Woopra = _public || {};

         if (typeof window.exports !== 'undefined') {
             Woopra.Tracker = Tracker;
             window.exports.Woopra = Woopra;
         }

     })(window, document);
