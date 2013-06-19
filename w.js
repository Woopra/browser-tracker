(function(window, document) {
	"use strict";
	
    var Woopra = {};

    var console = window.console;

	/*
	 * Helper functions
	 */
	 
	Woopra.CONSTANTS = {
		EVENT_ENDPOINT: window.location.protocol + '//www.woopra.com/track/ce/',
		PING_ENDPOINT: window.location.protocol + '//www.woopra.com/track/x/'
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
		if (typeof params == 'undefined') {
			return params;
		}
		
		prefix = prefix || '';
		var p=[];
		for (var key in params) {
            p.push(prefix + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
		}
		console.log(params, p.join('&'));
		return p.join('&');
	};
	
	Woopra.randomString = function(){
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
		var s = '';
		for (var i = 0; i < 12; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
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
		console.log('endsWidth', str, suffix);
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	
	var Tracker = function(funcs) {
		this.personData = {};
		this.visitData = {};
        this.options = {};
		this.idle = 0;
		this.cookie = '';
        this._loaded = false;
	};
	
    Tracker.prototype = {
        init: function() {
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
                _wpt = window._wpt;

            if (_wpt && _wpt._e) {
                events = _wpt._e;
                //window._wpt = this;
                for (i = 0; i < events.length; i++) {
                    action = events[i];
                    console.log('queue', action[0], type);
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

        config: function() {
            var a = arguments;
            if (a.length === 0) {
                return this;
            }
            if (a.length==1) {
                if (typeof a[0] == 'string') {
                    return this.options[a[0]];
                }
                if (typeof a[0] == 'object') {
                    for (var key in a[0]) {
                        this.config(key,a[0][key]);
                    }
                }
            }
            if (a.length>=2) {
                this.options[a[0]] = a[1];
            }
            return this;
        },

        call: function() {
        },

        visit: function() {
            var a = arguments;
            if (a.length === 0) {
                return this.visitData;
            }
            if (a.length==1) {
                if (typeof a[0]=='string') {
                    return this.visitData[a[0]];
                }
                if (typeof a[0]=='object') {
                    for (var key in a[0]) {
                        this.visit(key, a[0][key]);
                    }
                }
            }
            if (a.length>=2) {
                if (typeof a[0] == 'string') {
                    this.visitData[a[0]] = a[1];
                }
            }

            return this;
        },

        person: function(name, value) {
            if (arguments.length === 0) {
                return this.personData;
            }

            if (typeof name === 'string') {
                if (typeof value === 'undefined') {
                    return this.personData[name];
                }
                else {
                    this.personData[name] = value;
                }
            }
            else if (typeof name === 'object') {
                Woopra.extend(this.personData, name);
            }

            return this;
        },

        pageview: function(options) {
            this._track('pv', 'visit', options);
        },

        track: function(name, options) {
        },

        _track: function(name, options) {
            var a = arguments;

            var event = {};
            var callback;
            // Load campaign params (load first to allow overrides)
            Woopra.extend(event, Woopra.getCampaignData());

            // Track default: pageview
            if (a.length === 0) {
                event.name = 'pv',
                event.url = this.getPageURL();
                event.title = this.getPageTitle();
            }
            // Track custom events
            if (a.length == 1) {
                if (typeof a[0] == 'string') {
                    event.name = a[0];
                }
                if (typeof a[0] == 'object') {
                    Woopra.extend(event, a[0]);	
                }
            }
            // Track custom events in format of name,object
            if (a.length >= 2) {
                event.name = a[0];
                Woopra.extend(event, a[1]);
            }

            // Extract callback
            if (typeof event.hitCallback == 'function') {
                callback = event.hitCallback;
                delete event.hitCallback;
            }

            var endpoint = Woopra.CONSTANTS.EVENT_ENDPOINT;
            var random = 'ra=' + Woopra.randomString();
            var coData = Woopra.buildUrlParams(this.getOptionParams());
            var cvData = Woopra.buildUrlParams(this.personData, 'cv_');
            var ceData = Woopra.buildUrlParams(event, 'ce_');

            var query = '?' + [random, coData, cvData, ceData].join("&");
            console.log(query);

            var scriptUrl = endpoint + query;
            Woopra.loadScript(scriptUrl, callback);

            this.startPing();
        },

        /**
         * Attach custom visitor data and then sends data to server
         * We use `email` as our unique id, so make sure you use the email as
         */
        identify: function(email, properties) {
            if (typeof email !== 'undefined' && email !== '') {
                if (typeof properties !== 'undefined') {
                    Woopra.extend(this.personData, properties);
                }

                this.person('email', email);
                //this._sync('identify', 'identify', {});
            }
        },


        startPing: function() {
            if (typeof this.pingInterval == 'undefined') {
                window.clearInterval(this.pingInterval);
                delete this.pingInterval;
            }
            var self = this;
            this.pingInterval = window.setInterval(function() {
                self.ping();
            }, this.config('ping_interval'));
        },

        ping: function() {
            var endpoint = Woopra.CONSTANTS.PING_ENDPOINT;
            var random = 'ra=' + Woopra.randomString();
            var coData = Woopra.buildUrlParams(this.getOptionParams());
            var cvData = Woopra.buildUrlParams(this.personData, 'cv_');
            //var ceData = Woopra.buildUrlParams(this.event, 'ce_');
        },

        push: function() {
            console.log('push', arguments);
            return this;
        },

        getPageURL: function() {
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
			var instance = new Tracker(window._wpt[name]._e);
            instance.init();
			window[name]=instance;
		}
	}

    window.Woopra = _public || {};

    if (typeof window.exports !== 'undefined') {
        window.exports.Woopra = _public;
    }
	
})(window, document);
