(function(window, document) {
    "use strict";

    var WoopraScript = function(_src, _hook, _async) {
        this.scriptObject = false;
        this.src = _src;
        this.hook = _hook;
        this.async = _async;
    };

    WoopraScript.prototype.clear = function() {
        this.scriptObject.parentNode.removeChild(this.scriptObject);
    };

    WoopraScript.prototype.load = function() {
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
    };

    var WoopraEvent = function(name, ce, cv, file) {
        this.name = name || 'unknown';
        this.ce = ce || {};
        this.cv = cv || {};
        this.file = file || 'ce';
        this.requestString = '';
        this.attachCampaignData();
    };

    WoopraEvent.prototype.attachCampaignData = function() {
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
    };

    WoopraEvent.prototype.getUrlVars = function() {
        var vars = {};

        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
            vars[key] = value;
        });
        return vars;
    };

    WoopraEvent.prototype.addProperty = function(key, value) {
        this.ce[key] = value;
    };

    WoopraEvent.prototype.serialize = function(v, prefix) {
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
    };

    WoopraEvent.prototype.fire = function(tracker) {
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

        new WoopraScript(t.getEndpoint(this.file)+'?ra='+t.randomstring()+this.requestString, function(){}, true ).load();

    };

    var WoopraTracker = function() {
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
        this.initialize.apply(this, arguments);
    };

    WoopraTracker.prototype.initialize = function() {
        var i,
            a,
            _wpt = window._wpt,
            _this = this;

        this._setOptions();

        this._processQueue();
        this._loaded = true;
        if (window.woopraReady !== 'undefined') {
            window.woopraReady(this);
        }

    };

    /**
     * Processes the tracker queue in case user tries to push events
     * before tracker is ready.
     */
    WoopraTracker.prototype._processQueue = function() {
        var i, a,
            _wpt = window._wpt;

        if (_wpt && _wpt._e) {
            for (i = 0; i < _wpt._e.length; i++) {
                a = _wpt._e[i];
                this[_wpt._e[i][0]].apply(this, Array.prototype.slice.call(a, 1));
            }
        }
        window._wpt = this;
    };

    /**
     * Sets the initial options
     */
    WoopraTracker.prototype._setOptions = function() {
        var t = this,
            exp = new Date();

        t.option('domain', window.location.hostname);
        t.option('cookie_name', 'wooTracker');
        t.option('cookie_domain', window.location.hostname);
        t.option('cookie_path', '/');
        exp.setDate(exp.getDate()+365);
        t.option('cookie_expire', exp);
        t.option('ping', true);
        t.option('ping_interval', 12000);
        t.option('idle_timeout', 300000);
        t.option('download_pause', 200);
        t.option('outgoing_pause', 400);
        t.option('download_tracking', true);
        t.option('outgoing_tracking', true);
    };

    WoopraTracker.prototype.ensure = function() {
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
    };

    WoopraTracker.prototype.getEndpoint = function(file) {
        return window.location.protocol + '//www.woopra.com/track/' + file + '/';
    };

    WoopraTracker.prototype.sleep = function(millis) {
        var date = new Date(),
            curDate = new Date();

        while (curDate-date < millis) {
            curDate = new Date();
        }
    };

    WoopraTracker.prototype.randomstring = function() {
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

    WoopraTracker.prototype.readcookie = function(k) {
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
    };

    WoopraTracker.prototype.createcookie = function(k, v) {
        var t = this,
            cookieval;

        cookieval = k + '=' + v + '; ' + 'expires=' + t.option('cookie_expire') + ';' + 'path='+t.option('cookie_path')+';domain=.'+t.option('cookie_domain');
        document.cookie = cookieval;
    };

    WoopraTracker.prototype.getRequestData = function(){
        var t = this,
            r = {};

        r.alias = t.option('domain');
        r.cookie = t.readcookie(t.option('cookie_name'));
        r.meta = t.readcookie('wooMeta') || '';
        r.screen = window.screen.width + 'x' + window.screen.height;
        r.language = (window.navigator.browserLanguage || window.navigator.language || "");
        r.referer = document.referrer;
        r.idle = parseInt(t.idle/1000, 10) + '';

        if (t.vs === 2) {
            r.vs = 'w';
            t.vs = 0;
        } else {
            if (t.idle == 0) {
                r.vs = 'r';
            } else{
                r.vs = 'i';
            }
        }

        return r;
    };

    /**
     * Sends a pageview event to the server
     *
     * Alias for `track('pv', options)`
     */
    WoopraTracker.prototype.pageview = function(options) {
        var _options = options || {},
            e;

        if (typeof _options.visitor !== 'undefined') {
            this.cv = _options.visitor;
            delete _options.visitor;
        }

        e = new WoopraEvent('pv', _options, this.cv, 'visit');
        e.fire(this);
    };

    /**
     * Sends a custom event to the server
     *
     * If you pass a `visitor` object to options, then the custom visitor
     * data in `visitor` will be sent along with the custom event
     *
     * This is equivalent to calling `_wpt.visitor(data)` before
     * calling `track()`
     */
    WoopraTracker.prototype.track = function(name, options) {
        var _options = options || {},
            e;

        if (typeof _options.visitor !== 'undefined') {
            this.cv = _options.visitor;
            delete _options.visitor;
        }

        e = new WoopraEvent(name, _options, this.cv, 'ce');
        e.fire(this);
    };

    /**
     * Attach custom visitor data and then sends data to server
     * Use `visitor()` to attach 
     */
    WoopraTracker.prototype.identify = function(id, properties) {
        var e;
        if (typeof properties !== 'undefined') {
            this.cv = properties;
        }
        if (typeof id !== 'undefined') {
            this.visitor('email', id);
        }

        e = new WoopraEvent('identify', {}, this.cv, 'identify');
        e.fire(this);
    };

    /**
     * Gets/sets tracker options
     */
    WoopraTracker.prototype.option = function(k, v) {
        if (typeof v === 'undefined') {
            return this.props[k];
        }

        this.props[k] = v;
        return v;
    };

    /**
     * Attach custom visitor data without sending the server an event.
     * Use identify to sync the visitor data to the server
     */
    WoopraTracker.prototype.visitor = function(name, value) {
        if (typeof name === 'string' && typeof value !== 'undefined') {
            this.cv[name] = value;
        }
        else if (typeof name === 'object') {
            this.cv = name;
        }
    };

    /**
     * Use to attach custom visit data that doesn't stick to visitor
     * ** Not in use yet
     */
    WoopraTracker.prototype.visit = function(name, value) {
        if (typeof name === 'string' && typeof value !== 'undefined') {
            this.cs[name] = value;
        }
        else if (typeof name === 'object') {
            this.cs = name;
        }
    };

    /** Compatibility with old tracker methods **/
    /**
     * Shortcut to set domain
     */
    WoopraTracker.prototype.setDomain = function(domain) {
        this.option('domain', domain);
        this.option('cookie_domain', domain);
    };

    WoopraTracker.prototype.setIdleTimeout = function(timeout) {
        this.option('idle_timeout', timeout);
    };

    // XXX
    WoopraTracker.prototype.pingServer = function() {
        var e = new WoopraEvent('x', {}, this.cv, 'ping');
        e.fire(this);
    };

    WoopraTracker.prototype.typed = function(e) {
        this.vs = 2;
    };

    WoopraTracker.prototype.clicked=function(e) {
        var t = this;

        t.moved();

        var cElem = e.srcElement || e.target;
        while (typeof cElem !== 'undefined' && cElem !== null){
            if (cElem.tagNam === 'A') {
                break;
            }
            cElem = cElem.parentNode;
        }

        if (typeof cElem !== 'undefined' && cElem !== null){
            var link=cElem;
            var _download = link.pathname.match(/(?:doc|dmg|eps|jpg|jpeg|png|svg|xls|ppt|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3|mp4|m4v)($|\&)/);
            var ev=false;
            if(t.option('download_tracking')){
                if(_download && (link.href.toString().indexOf('woopra-ns.com')<0)){
                    ev=new WoopraEvent('download', {url:link.href});
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
                    ev = new WoopraEvent('outgoing', {url:link.href});
                    ev.fire(this);
                    t.sleep(t.option('outgoing_pause'));
                }
            }
        }
    };

    WoopraTracker.prototype.moved = function() {
        var t = this;
        t.last_activity = new Date();
        t.idle = 0;
    };

    WoopraTracker.prototype.next = function(){
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
    };

    var woopraTracker = new WoopraTracker();

    if (typeof exports !== 'undefined') {
        exports.WoopraTracker = WoopraTracker;
        exports.WoopraEvent = WoopraEvent;
    }
}(window, document));


