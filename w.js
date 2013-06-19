
(function(w) {
	"use strict";
	
	var Woopra = function(funcs) {
		this.init(funcs);
	};
	
	Woopra.prototype.init = function(funcs) {
		this.personData = {};
		this.visitData = {};
		this.idle = 0;
		this.cookie = '';
		
		var exp = new Date();
		exp.setDate(exp.getDate()+365);
		
		// Set default options
		this.options = {
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
		};
	
		// Run config overrides first
		for (var i=0;i<funcs.length;i++) {
			var func = funcs[i];
			var funcName = func[0];
			if (funcName == 'config') {
				var funcArguments = func[1];
				this[funcName].apply(this, funcArguments);
			}
		}
		
		// Setup cookie
		this.cookie = Woopra.readCookie(this.config('cookie_name'));
		if(this.cookie && this.cookie.length > 0){
		}else{
			this.cookie = Woopra.randomString();
		}
		
		if (this.config('cookie_domain') == null) {
			if (Woopra.endsWith(location.host, '.' + this.config('domain'))) {
				this.config('cookie_domain', this.config('domain'))
			} else {
				this.config('cookie_domain', Woopra.getHost());
			}
		}
		Woopra.setCookie(this.config('cookie_name'), this.cookie, this.config('cookie_exp'), this.config('cookie_domain'), this.config('cookie_path'));

		// Identify & track...
		for (var i=0;i<funcs.length;i++) {
			var func = funcs[i];
			var funcName = func[0];
			if (funcName != 'config') {
				var funcArguments = func[1];
				this[funcName].apply(this, funcArguments);
			}
		}
	}
	
	Woopra.prototype.config = function() {
		var a=arguments;
		if (a.length==0) {
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
		console.log('config', arguments);
		return this;
	}
	Woopra.prototype.track = function() {
		var a=arguments;
		
		if (a.length==0) {
			
		} else {
			if (typeof a[0] == 'string') {
				var event = a[1] || {};
				event.name = a[0];
				this.track(event);
			} 
			if (typeof a[0] == 'object') {
				// track a[0] as event object...
			}
		}
		
		console.log('track', arguments);
		return this;
	}
	
	Woopra.prototype.visit = function() {
		var a = arguments;
		if (a.length==0) {
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
	}
	
	Woopra.prototype.person = function() {
		var a = arguments;
		if (a.length==0) {
			return this.personData;
		}
		if (a.length==1) {
			if (typeof a[0]=='string') {
				return this.personData[a[0]];
			}
			if (typeof a[0]=='object') {
				for (var key in a[0]) {
					this.person(key, a[0][key]);
				}
			}
		}
		if (a.length>=2) {
			if (typeof a[0] == 'string') {
				this.personData[a[0]] = a[1];
			}
		}
		return this;
	}
	
	Woopra.prototype.track = function() {
		var a = arguments;
		
		var event = {};
		var callback;
		// Load campaign params (load first to allow overrides)
		Woopra.extend(event, Woopra.getCampaignData());
		
		// Track default: pageview
		if (a.length == 0) {
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
		if (typeof event['hitCallback'] == 'function') {
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
	};
	
	Woopra.prototype.startPing = function() {
		if (typeof this.pingInterval == 'undefined') {
			clearInterval(this.pingInterval);
			delete this.pingInterval;
		}
		var self = this;
		this.pingInterval = setInterval(function() {
			self.ping();
		}, this.config('ping_interval'));
	};
	
	Woopra.prototype.ping = function() {
		var endpoint = Woopra.CONSTANTS.PING_ENDPOINT;
		var random = 'ra=' + Woopra.randomString();
		var coData = Woopra.buildUrlParams(this.getOptionParams());
		var cvData = Woopra.buildUrlParams(this.personData, 'cv_');
		var ceData = Woopra.buildUrlParams(event, 'ce_');
	};
	
	Woopra.prototype.push = function() {
		console.log('push', arguments);
		return this;
	};
	
	Woopra.prototype.getPageURL = function() {
		if (this.options.ignore_query_url) {
			return w.location.pathname;
		} else {
			return w.location.pathname + w.location.search;
		}
	};
	
	Woopra.prototype.getPageTitle = function() {
		return (document.getElementsByTagName('title').length==0)?'':document.getElementsByTagName('title')[0].innerHTML;
	};
	
	Woopra.prototype.getOptionParams = function() {
		var o={};
		o['alias'] = this.config('domain');
		o['cookie'] = Woopra.readCookie(this.config('cookie_name'));
		o['meta'] = Woopra.readCookie('wooMeta') || '';
		o['screen'] = screen.width + 'x' + screen.height;
		o['language'] = navigator.browserLanguage || navigator.language || "";
		o['referer'] = document.referrer;
		o['idle'] = ''+parseInt(this.idle/1000);
		
		o['vs'] = 'w';
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

	};
	
	/*
	 * Helper functions
	 */
	 
	Woopra.CONSTANTS = {
		EVENT_ENDPOINT: window.location.protocol+'//www.woopra.com/track/ce/',
		PING_ENDPOINT: window.location.protocol+'//www.woopra.com/track/x/',
	};
	 
	Woopra.extend = function(o1, o2) {
		for (var key in o2) {
			o1[key] = o2[key];
		}
	};
	 
	Woopra.readCookie = function(name) {
		if (name == '') {
			return '';
		}
		var c = "" + document.cookie;
		
		var i = c.indexOf(name);
		if (i==-1){
			return "";
		}
		var k = c.indexOf(';', i);
		if (k == -1){
			k = c.length;
		}
	
		return unescape(c.substring(i + name.length + 1, k));
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
		w.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
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

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.async = true;

		if(typeof script.onreadystatechange != 'undefined'){
			script.onreadystatechange = function() {
				if (this.readyState == 'complete'|| this.readyState=='loaded') {
					if (callback) {
						callback();
					}
					Woopra.removeScript(script);
				}
			}
		} else {
			script.onload = function(){
				if (callback) {
					callback();
				}
				Woopra.removeScript(script);
			}
		}
		
	
		var ssc = document.getElementsByTagName('script')[0];
		ssc.parentNode.insertBefore(script, ssc);
	};
	
	Woopra.removeScript = function(script) {
		script.parentNode.removeChild(script);
	};
	
	Woopra.getHost = function() {
		return location.host.replace('www.','');
	};
	
	Woopra.endsWith = function(str, suffix) {
		console.log('endsWidth', str, suffix);
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	
	// Initialize instances & preloaded settings/events
	if (typeof w._w != 'undefined') {
		for (var name in w._w) {
			var instance = new Woopra(w._w[name].c);
			w[name]=instance;
		}
	}
	
	
})(window);