(function(window, document) {
    'use strict';

    var Woopra = {},
        _on,
        _handler = [],
        _download_tracking = false,
        _download_pause,
        _outgoing_tracking = false,
        _outgoing_pause,
        _auto_decorate,
        _outgoing_ignore_subdomain = true;

    /**
     * Constants
     */
    var VERSION = 11;
    var ENDPOINT = 'woopra.com/track/';
    var XDM_PARAM_NAME = '__woopraid';

    /**
     * addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
     * https://gist.github.com/eirikbacker/2864711
     * removeEventListener from https://gist.github.com/jonathantneal/3748027
     */
    /*eslint-disable*/
    (function(win, doc){
        if (win.addEventListener) return;		//No need to polyfill

        var listeners = [];

        function docHijack(p){var old = doc[p];doc[p] = function(v){return addListen(old(v))}}
        function addEvent(on, fn, self) {
            self = this;

            listeners.unshift([self, on, fn, function(e) {
                var e = e || win.event;
                e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
                e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
                e.currentTarget = self;
                e.target = e.srcElement || self;
                fn.call(self, e);
            }]);

            return this.attachEvent('on' + on, listeners[0][3])
        }

        function removeEvent(on, fn) {
            for (var index = 0, register; register = listeners[index]; ++index) {
                if (register[0] == this && register[1] == on && register[2] == fn) {
                    return this.detachEvent("on" + on, listeners.splice(index, 1)[0][3]);
                }
            }
        }

        function addListen(obj, i){
            if (i = obj.length) {
                while(i--) {
                    obj[i].addEventListener = addEvent;
                    obj[i].removeEventListener = removeEvent;
                }
            }
            else {
                obj.addEventListener = addEvent;
                obj.removeEventListener = removeEvent;
            }

            return obj;
        }

        addListen([doc, win]);
        if ('Element' in win) {
            // IE 8
            win.Element.prototype.addEventListener = addEvent;
            win.Element.prototype.removeEventListener = removeEvent;
        }
        else {
            // IE < 8
            //Make sure we also init at domReady
            doc.attachEvent('onreadystatechange', function(){addListen(doc.all)});
            docHijack('getElementsByTagName');
            docHijack('getElementById');
            docHijack('createElement');
            addListen(doc.all);
        }
    })(window, document);

    /**
     * Array.prototype.indexOf polyfill via
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
     */
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            if ( this === undefined || this === null ) {
                throw new TypeError( '"this" is null or not defined' );
            }

            var length = this.length >>> 0; // Hack to convert object.length to a UInt32

            fromIndex = +fromIndex || 0;

            if (Math.abs(fromIndex) === Infinity) {
                fromIndex = 0;
            }

            if (fromIndex < 0) {
                fromIndex += length;
                if (fromIndex < 0) {
                    fromIndex = 0;
                }
            }

            for (;fromIndex < length; fromIndex++) {
                if (this[fromIndex] === searchElement) {
                    return fromIndex;
                }
            }

            return -1;
        };
    }

    /**
     * Helper functions
     */
    Woopra.extend = function(o1, o2) {
        for (var key in o2) {
            o1[key] = o2[key];
        }
    };

    // https://code.google.com/p/form-serialize/
    // modified to return an object
    Woopra.serializeForm = function(form, options) {
        if (!form || form.nodeName !== "FORM") {
            return;
        }
        var _options = options || {};
        var _exclude = _options.exclude || [];
        var i, j, data = {};
        for (i = form.elements.length - 1; i >= 0; i = i - 1) {
            if (form.elements[i].name === "" || _exclude.indexOf(form.elements[i].name) > -1) {
                continue;
            }
            switch (form.elements[i].nodeName) {
                case 'INPUT':
                    switch (form.elements[i].type) {
                    case 'text':
                        case 'hidden':
                        case 'button':
                        case 'reset':
                        case 'submit':
                        data[form.elements[i].name] = form.elements[i].value;
                    break;
                    case 'checkbox':
                        case 'radio':
                        if (form.elements[i].checked) {
                            data[form.elements[i].name] = form.elements[i].value;
                        }
                    break;
                    case 'file':
                        break;
                }
                break;
                case 'TEXTAREA':
                    data[form.elements[i].name] = form.elements[i].value;
                break;
                case 'SELECT':
                    switch (form.elements[i].type) {
                    case 'select-one':
                        data[form.elements[i].name] = form.elements[i].value;
                    break;
                    case 'select-multiple':
                        for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                        if (form.elements[i].options[j].selected) {
                            data[form.elements[i].name] = form.elements[i].options[j].value;
                        }
                    }
                    break;
                }
                break;
                case 'BUTTON':
                    switch (form.elements[i].type) {
                    case 'reset':
                        case 'submit':
                        case 'button':
                        data[form.elements[i].name] = form.elements[i].value;
                    break;
                }
                break;
            }
        }
        return data;
    };

    /*\
    |*|
    |*|  :: cookies.js ::
    |*|
    |*|  A complete cookies reader/writer framework with full unicode support.
    |*|
    |*|  Revision #1 - September 4, 2014
    |*|
    |*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
    |*|  https://developer.mozilla.org/User:fusionchess
    |*|
    |*|  This framework is released under the GNU Public License, version 3 or later.
    |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
    |*|
    |*|  Syntaxes:
    |*|
    |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
    |*|  * docCookies.getItem(name)
    |*|  * docCookies.removeItem(name[, path[, domain]])
    |*|  * docCookies.hasItem(name)
    |*|  * docCookies.keys()
    |*|
    \*/
    var docCookies = {
        getItem: function (sKey) {
            if (!sKey) { return null; }
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
            var sExpires = "";
            if (vEnd) {
                switch (vEnd.constructor) {
                    case Number:
                        sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                    case String:
                        sExpires = "; expires=" + vEnd;
                    break;
                    case Date:
                        sExpires = "; expires=" + vEnd.toUTCString();
                    break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        },
        removeItem: function (sKey, sPath, sDomain) {
            if (!this.hasItem(sKey)) { return false; }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function (sKey) {
            if (!sKey) { return false; }
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        keys: function () {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
            return aKeys;
        }
    };

    Woopra.docCookies = docCookies;
    /*eslint-enable*/

    /**
     * Wrapper for window.location
     */
    Woopra.location = function(property, value) {
        // make sure property is valid
        if (typeof window.location[property] !== 'undefined') {
            if (typeof value !== 'undefined') {
                window.location[property] = value;
            }
            else {
                return window.location[property];
            }
        }
    };

    /**
     * Parses current URL for parameters that start with either `utm_` or `woo_`
     * and have the keys `source`, `medium`, `content`, `campaign`, `term`
     *
     * @return {Object} Returns an object with campaign keys as keys
     */
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


    /**
     * Parses the URL parameters for data beginning with a certain prefix
     *
     * @param {Function} method The callback method for each key found matching `prefix`
     * @param {string} prefix The prefix that the parameter should start with
     */
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

    /**
     * Parses Visitor Data in the URL.
     *
     * Query params that start with 'wv_'
     */
    Woopra.getVisitorUrlData = function(context) {
        Woopra.getCustomData.call(context, context.identify, 'wv_');
    };


    /**
     * Hides any campaign data (query params: wv_, woo_, utm_) from the URL
     * by using pushState (if available)
     */
    Woopra.hideCampaignData = function() {
        return Woopra.hideUrlParams(['wv_', 'woo_', 'utm_']);
    };
    Woopra.hideCrossDomainId = function() {
        return Woopra.hideUrlParams([XDM_PARAM_NAME]);
    };

    /**
     * Hides any URL parameters by calling window.history.replaceState
     *
     * @param {Array} params A list of parameter prefixes that will be hidden
     * @return {String} Returns the new URL that will be used
     */
    Woopra.hideUrlParams = function(params) {
        var regex = new RegExp('[?&]+((?:' + params.join('|') + ')[^=&]*)=([^&#]*)', 'gi');
        var href = Woopra.location('href').replace(regex, '');

        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, href);
        }

        return href;
    };

    /**
     * Retrieves the current URL parameters as an object
     *
     * @return {Object} An object for all of the URL parameters
     */
    Woopra.getUrlParams = function() {
        var vars = {};
        var href = Woopra.location('href');

        if (href) {
            href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                vars[key] = decodeURIComponent(value.split('+').join(' '));
            });
        }
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
                if (params[key] !== 'undefined' &&
                    params[key] !== 'null' &&
                    typeof params[key] !== 'undefined') {
                    p.push(_prefix + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                }
            }
        }
        return p.join('&');
    };

    /**
     * Generates a random 12 character string
     *
     * @return {String} Returns a random 12 character string
     */
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
        script.async = true;

        if (callback && typeof callback === 'function') {
            _callback = callback;
        }

        if (typeof script.onreadystatechange !== 'undefined') {
            script.onreadystatechange = function() {
                if (this.readyState === 4 ||
                    this.readyState === 'complete' ||
                    this.readyState === 'loaded') {
                    if (_callback) {
                        _callback();
                    }
                    Woopra.removeScript(script);
                }
            };
        }
        else {
            script.onload = function() {
                if (_callback) {
                    _callback();
                }
                Woopra.removeScript(script);
            };
            script.onerror = function() {
                Woopra.removeScript(script);
            };
        }

        script.src = url;

        ssc = document.getElementsByTagName('script')[0];
        ssc.parentNode.insertBefore(script, ssc);
    };

    Woopra.removeScript = function(script) {
        if (script && script.parentNode) {
            script.parentNode.removeChild(script);
        }
    };

    /**
     * Helper to either query an element by id, or return element if passed
     * through options
     *
     * Supports searching by ids and classnames (or querySelector if browser supported)
     */
    Woopra.getElement = function(selector, options) {
        var _options = typeof selector === 'string' ? options || {} : selector || {};
        var _selector = selector;

        if (_options.el) {
            return _options.el;
        }
        else if (typeof selector === 'string') {
            if (document.querySelectorAll) {
                return document.querySelectorAll(_selector);
            }
            else if (selector[0] === '#') {
                _selector = selector.substr(1);
                return document.getElementById(_selector);
            }
            else if (selector[0] === '.') {
                _selector = selector.substr(1);
                return document.getElementsByClassName(_selector);
            }
        }
    };

    /**
     * Retrieves the current client domain name using the hostname
     * and returning the last two tokens with a `.` separator (domain + tld).
     *
     * This can be an issue if there is a second level domain
     */
    Woopra.getDomain = function(hostname) {
        var _hostname = hostname || Woopra.location('hostname');
        var secondLevelTlds = {
            'com.au': 1,
            'net.au': 1,
            'org.au': 1,
            'co.hu': 1,
            'com.ru': 1,
            'ac.za': 1,
            'net.za': 1,
            'com.za': 1,
            'co.za': 1,
            'co.uk': 1,
            'org.uk': 1,
            'me.uk': 1,
            'net.uk': 1
        };
        var domain = _hostname.substring(_hostname.lastIndexOf('.', _hostname.lastIndexOf('.') - 1) + 1);

        // check if domain is in list of second level domains, ignore if so
        if (secondLevelTlds[domain]) {
            domain = _hostname.substring(_hostname.lastIndexOf('.', _hostname.indexOf(domain) - 2) + 1);
        }

        return domain;
    };

    /**
     * Checks if string ends with suffix
     *
     * @param {string} str The haystack string
     * @param {string} suffix The needle
     * @return {boolean} True if needle was found in haystack
     */
    Woopra.endsWith = function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    /**
     * Checks if string starts with prefix
     *
     * @param {string} str The haystack string
     * @param {string} prefix The needle
     * @return {boolean} True if needle was found in haystack
     */
    Woopra.startsWith = function(str, prefix) {
        return str.indexOf(prefix) === 0;
    };

    _on = Woopra._on = function(parent, event, callback) {
        var id = parent.instanceName;

        if (!_handler[event]) {
            _handler[event] = {};
        }
        _handler[event][id] = parent;

        if (parent.__l) {
            if (!parent.__l[event]) {
                parent.__l[event] = [];
            }
            parent.__l[event].push(callback);
        }
    };

    Woopra._fire = function(event) {
        var handler;
        var _event = _handler[event];
        var _l;

        if (_event) {
            for (var id in _event) {
                if (_event.hasOwnProperty(id)) {
                    handler = _event[id];
                    _l = handler && handler.__l;
                    if (_l && _l[event]) {
                        for (var i = 0; i < _l[event].length; i++) {
                            _l[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
                        }
                    }

                }
            }
        }
    };

    Woopra.attachEvent = function(element, type, callback) {
        if (element.addEventListener) {
           element.addEventListener(type, callback);
        }
        else if (element.attachEvent) {
            /*eslint-disable*/
            element.attachEvent('on' + type, function(e) {
                var e = e || win.event;
                e.preventDefault = e.preventDefault || function() {e.returnValue = false};
                e.stopPropagation = e.stopPropagation || function() {e.cancelBubble = true};
                callback.call(self, e);
            });
            /*eslint-enable*/
        }
    };

    Woopra.leftClick = function(evt) {
        evt = evt || window.event;
        var button = (typeof evt.which !== 'undefined' && evt.which === 1) ||
                    (typeof evt.button !== 'undefined' && evt.button === 0);
        return button && !evt.metaKey && !evt.altKey && !evt.ctrlKey && !evt.shiftKey;
    };

    Woopra.redirect = function(link) {
        Woopra.location('href', link);
    };

    /**
     * Determines if the current URL should be considered an outgoing URL
     */
    Woopra.isOutgoingLink = function(targetHostname) {
        var currentHostname = Woopra.location('hostname');
        var currentDomain = Woopra.getDomain(currentHostname);

        return targetHostname !== currentHostname &&
            targetHostname.replace(/^www\./, '') !== currentHostname.replace(/^www\./, '') &&
            (
                !_outgoing_ignore_subdomain ||
                currentDomain !== Woopra.getDomain(targetHostname)
            ) &&
            !Woopra.startsWith(targetHostname, 'javascript') &&
            targetHostname !== '' &&
            targetHostname !== '#';
    };

    // attaches any events
    // needs to be handled here, instead of in a tracking instance because
    // these events should only be fired once on a page
    (function(on, fire) {
        on(document, 'mousedown', function(e) {
            var cElem;

            fire('mousemove', e, new Date());

            if (_auto_decorate) {
                cElem = e.srcElement || e.target;
                while (typeof cElem !== 'undefined' && cElem !== null) {
                    if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
                        break;
                    }
                    cElem = cElem.parentNode;
                }
                if (typeof cElem !== 'undefined' && cElem !== null) {
                    fire('auto_decorate', cElem);
                }
            }
        });

        on(document, 'click', function(e) {
            var cElem,
                link,
                ignoreTarget = '_blank',
                _download;

            cElem = e.srcElement || e.target;

            if (Woopra.leftClick(e)) {
                fire('click', e, cElem);
            }

            if (_download_tracking || _outgoing_tracking) {

                // searches for an anchor element
                while (typeof cElem !== 'undefined' && cElem !== null) {
                    if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
                        break;
                    }
                    cElem = cElem.parentNode;
                }

                if (typeof cElem !== 'undefined' && cElem !== null &&
                    !cElem.getAttribute('data-woopra-tracked')) {
                    link = cElem;
                    _download = link.pathname.match(/(?:doc|dmg|eps|svg|xls|ppt|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3|mp4|m4v)($|\&)/);

                    if (_download_tracking && _download) {
                        fire('download', link.href);

                        if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
                            e.preventDefault();
                            e.stopPropagation();

                            link.setAttribute('data-woopra-tracked', true);
                            window.setTimeout(function() {
                                link.click();
                            }, _download_pause);
                        }
                    }
                    // Make sure
                    // * outgoing tracking is enabled
                    // * this URL does not match a download URL (doesn't end
                    //   in a binary file extension)
                    // * not ignoring subdomains OR link hostname is not a partial
                    //   match of current hostname (to check for subdomains),
                    // * hostname is not empty
                    if (_outgoing_tracking &&
                        !_download &&
                        Woopra.isOutgoingLink(link.hostname)) {
                        fire('outgoing', link.href);

                        if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
                            e.preventDefault();
                            e.stopPropagation();

                            link.setAttribute('data-woopra-tracked', true);

                            window.setTimeout(function() {
                                link.click();
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
        var domain = Woopra.getDomain();

        this.visitorData = {};
        this.sessionData = {};

        this.options = {
            domain: Woopra.getDomain(),
            app: 'js-client',
            use_cookies: true,
            ping: true,
            ping_interval: 12000,
            idle_timeout: 300000,
            idle_threshold: 10000,
            download_pause: _download_pause || 200,
            outgoing_pause: _outgoing_pause || 200,
            download_tracking: false,
            outgoing_tracking: false,
            outgoing_ignore_subdomain: true,
            hide_campaign: false,
            hide_xdm_data: false,
            campaign_once: false,
            third_party: false,
            save_url_hash: true,
            cross_domain: false,
            region: null,
            ignore_query_url: false,
            cookie_name: 'wooTracker',
            cookie_domain: domain ? '.' + domain : '',
            cookie_path: '/',
            cookie_expire: new Date(new Date().setDate(new Date().getDate() + 730))
        };

        this.instanceName = instanceName || 'woopra';
        this.idle = 0;
        this.cookie = '';
        this.last_activity = new Date();
        this.loaded = false;
        this.dirtyCookie = false;
        this.sentCampaign = false;
        this.version = VERSION;

        if (instanceName && instanceName !== '') {
            window[instanceName] = this;
        }
    };

    Tracker.prototype = {
        docCookies: docCookies,
        init: function() {
            var callback,
                self = this;

            this.__l = {};
            this._processQueue('config');
            this._setupCookie();
            this._bindEvents();

            // Otherwise loading indicator gets stuck until the every response
            // in the queue has been received
            setTimeout(function() {
                self._processQueue();
            }, 1);

            this.loaded = true;

            callback = this.config('initialized');
            if (callback && typeof callback === 'function') {
                callback(this.instanceName);
            }

            // Safe to remove cross domain url parameter after setupCookie is called
            // Should only need to be called once on load
            if (this.config('hide_xdm_data')) {
                Woopra.hideCrossDomainId();
            }

        },

        /**
         * Processes the tracker queue in case user tries to push events
         * before tracker is ready.
         */
        _processQueue: function(type) {
            var i,
                action,
                events,
                _wpt;

            _wpt = window.__woo ? window.__woo[this.instanceName] : _wpt;
            _wpt = window._w ? window._w[this.instanceName] : _wpt;

            // if _wpt is undefined, means script was loaded asynchronously and
            // there is no queue

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
            var url_id = this.getUrlId();

            this.cookie = this.getCookie();

            // overwrite saved cookie if id is in url
            if (url_id) {
                this.cookie = url_id;
            }

            // Setup cookie
            if (!this.cookie || this.cookie.length < 1) {
                this.cookie = Woopra.randomString();
            }

            docCookies.setItem(
                this.config('cookie_name'),
                this.cookie,
                this.config('cookie_expire'),
                this.config('cookie_path'),
                this.config('cookie_domain')
            );

            this.dirtyCookie = true;
        },

        /**
         * Binds some events to measure mouse and keyboard events
         */
        _bindEvents: function() {
            var self = this;

            _on(this, 'mousemove', function() {
                self.moved.apply(self, arguments);
            });
            _on(this, 'keydown', function() {
                self.typed.apply(self, arguments);
            });
            _on(this, 'download', function() {
              self.downloaded.apply(self, arguments);
            });
            _on(this, 'outgoing', function() {
              self.outgoing.apply(self, arguments);
            });
            _on(this, 'auto_decorate', function() {
              self.autoDecorate.apply(self, arguments);
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
                random = 'ra=' + Woopra.randomString(),
                queryString,
                endpoint,
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

            endpoint = this.getEndpoint(_options.endpoint);

            // Load custom visitor params from url
            Woopra.getVisitorUrlData(this);

            if (this.config('hide_campaign')) {
                Woopra.hideCampaignData();
            }

            data.push(random);

            // push tracker config values
            data.push(Woopra.buildUrlParams(this.getOptionParams()));

            // push eventName if it exists
            if (_options.eventName) {
                data.push('event=' + _options.eventName);
            }

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

            scriptUrl = endpoint + queryString;
            Woopra.loadScript(scriptUrl, _options.callback);
        },

        /*
         * Returns the Woopra cookie string
         */
        getCookie: function() {
            return docCookies.getItem(this.config('cookie_name'));
        },

        /**
         * Generates a destination endpoint string to use depending on different
         * configuration options
         */
        getEndpoint: function(path) {
            var protocol = this.config('protocol');
            var _protocol = protocol && protocol !== '' ? protocol + ':' : '';
            var _path = path || '';
            var endpoint = _protocol + '//';
            var region = this.config('region');
            var thirdPartyPath;

            // create endpoint, default is www.woopra.com/track/
            // China region will be cn.t.woopra.com/track
            if (region) {
                endpoint += region + '.t.';
            }
            else {
                endpoint += 'www.';
            }

            thirdPartyPath = this.config('third_party') ? 'tp/' + this.config('domain') : '';

            if (_path && !Woopra.endsWith(_path, '/')) {
                _path += '/';
            }

            if (thirdPartyPath && !Woopra.startsWith(_path, '/')) {
                thirdPartyPath += '/';
            }

            endpoint += ENDPOINT + thirdPartyPath + _path;

            return endpoint;
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

                // set script wide variables for events that are bound on script load
                // since we shouldn't bind per tracker instance
                _outgoing_tracking = this.options.outgoing_tracking;
                _outgoing_pause = this.options.outgoing_pause;
                _download_tracking = this.options.download_tracking;
                _download_pause = this.options.download_pause;
                _auto_decorate = typeof _auto_decorate === 'undefined' && this.options.cross_domain ? this.options.cross_domain : _auto_decorate;
                _outgoing_ignore_subdomain = this.options.outgoing_ignore_subdomain;

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
                eventName = '',
                cb,
                _hash,
                _cb = arguments[arguments.length - 1];

            // Load campaign params (load first to allow overrides)
            if (!this.config('campaign_once') || !this.sentCampaign) {
                Woopra.extend(event, Woopra.getCampaignData());
                this.sentCampaign = true;
            }


            if (typeof _cb === 'function') {
                cb = _cb;
            }
            // Track default: pageview
            if (typeof name === 'undefined' || name === cb) {
                eventName = 'pv';
            }
            // Track custom events
            else if (typeof options === 'undefined' || options === cb) {
                if (typeof name === 'string') {
                    eventName = name;
                }
                if (typeof name === 'object') {
                    if (name.name && name.name === 'pv') {
                        eventName = 'pv';
                    }

                    this._dataSetter(event, name);
                }
            }
            // Track custom events in format of name,object
            else {
                this._dataSetter(event, options);
                eventName = name;
            }

            // Add some defaults for pageview
            if (eventName === 'pv') {
                event.url = event.url || this.getPageUrl();
                event.title = event.title || this.getPageTitle();

                if (this.config('save_url_hash')) {
                    _hash = event.hash || this.getPageHash();
                    if (_hash !== '') {
                        event.hash = _hash;
                    }
                }
            }

            this._push({
                endpoint: 'ce',
                visitorData: this.visitorData,
                sessionData: this.sessionData,
                eventName: eventName,
                eventData: event,
                callback: cb
            });

            this.startPing();
        },

        /**
         * Tracks a single form and then resubmits it
         */
        trackForm: function(eventName, selector, options) {
            var els;
            var _event = eventName || 'Tracked Form';
            var _options = typeof selector === 'string' ? options || {} : selector || {};
            var bindEl;
            var self = this;

            bindEl = function(el, ev, props, opts) {
                Woopra.attachEvent(el, 'submit', function(e) {
                    self.trackFormHandler(e, el, ev, _options);
                });
            };

            if (_options.elements) {
                els = _options.elements;
            }
            else {
                els = Woopra.getElement(selector, _options);
            }

            // attach event if form was found
            if (els && els.length > 0) {
                for (var i in els) {
                    bindEl(els[i], _event, _options);
                }
            }
        },

        trackFormHandler: function(e, el, eventName, options) {
            var data;
            var personData;
            var trackFinished = false;

            if (!el.getAttribute('data-tracked')) {
                data = Woopra.serializeForm(el, options);

                if (options.identify && typeof options.identify === 'function') {
                    personData = options.identify(data) || {};
                    if (personData) {
                        this.identify(personData);
                    }
                }

                if (options.noSubmit) {
                    this.track(eventName, data, function() {
                        if (typeof options.callback === 'function') {
                            options.callback(data);
                        }
                    });
                }
                else {
                    e.preventDefault();
                    e.stopPropagation();

                    el.setAttribute('data-tracked', 1);

                    // submit the form if the reply takes less than 250ms
                    this.track(eventName, data, function() {
                        trackFinished = true;

                        if (typeof options.callback === 'function') {
                            options.callback(data);
                        }

                        el.submit();
                    });

                    // set timeout to resubmit to be a hard 250ms
                    // so even if woopra does not reply it will still
                    // submit the form
                    setTimeout(function() {
                        if (!trackFinished) {
                            el.submit();
                        }
                    }, 250);
                }
            }
        },

        /**
         * Tracks clicks
         *
         * @param {String} eventName The name of the event to track
         * @param {String} selector The id of element to track
         * @param {Object} properties Any event properties to track with
         * @param {Object} options (Optional) Options object
         * @param {Array} options.elements Supports an array of elements (jQuery object)
         * @param {Boolean} options.noNav (Default: false) If true, will only perform the track event and let the click event bubble up
         */
        trackClick: function(eventName, selector, properties, options) {
            var els = [];
            var i;
            var _options = options || {};
            var _event = eventName || 'Item Clicked';
            var bindEl;
            var self = this;

            bindEl = function(el, ev, props, opts) {
                Woopra.attachEvent(el, 'click', function(e) {
                    self.trackClickHandler(e, el, ev, props, opts);
                });
            };

            /**
             * Support an array of elements
             */
            if (_options.elements) {
                els = _options.elements;
            }
            else {
                els = Woopra.getElement(selector, _options);
            }

            if (els) {
                for (i = 0; i < els.length; i++) {
                    bindEl(els[i], _event, properties, _options);
                }
            }
        },

        trackClickHandler: function(e, el, eventName, properties, options) {
            var trackFinished = false;

            if (!el.getAttribute('data-tracked')) {
                if (options.noNav) {
                    this.track(eventName, properties);
                }
                else {
                    e.preventDefault();

                    el.setAttribute('data-tracked', 1);

                    this.track(eventName, properties, function() {
                        trackFinished = true;

                        if (typeof options.callback === 'function') {
                            options.callback();
                        }

                        el.click();
                    });

                    setTimeout(function() {
                        if (!trackFinished) {
                            el.click();
                        }
                    }, 250);
                }
            }
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
        sleep: function() {
        },

        // User Action tracking and event handlers

        /**
         * Clicks
         */

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
        typed: function() {
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

        /**
         * Event handler for decorating an element with a URL (for now only
         * anchor tags)
         */
        autoDecorate: function(elem) {
            var decorated;
            var canDecorate;
            var xdm = this.config('cross_domain');

            if (xdm) {
                if (typeof xdm === 'string') {
                    canDecorate = elem.href.indexOf(xdm) > -1;
                }
                else if (xdm.push) {
                    canDecorate = xdm.indexOf(elem.hostname) > -1;
                }

                if (canDecorate) {
                    decorated = this.decorate(elem);

                    if (decorated) {
                        elem.href = decorated;
                        // bind an event handler on mouseup to remove the url
                    }
                }
            }
        },

        /**
         * Resets cookie
         */
        reset: function() {
            docCookies.removeItem(
                this.config('cookie_name'),
                this.config('cookie_path'),
                this.config('cookie_domain')
            );
            this.cookie = null;
            this._setupCookie();
        },

        /**
         * Decorates a given URL with a __woopraid query param with value of
         * the current cookie
         */
        decorate: function(url) {
            var el;
            var query;
            var pathname;
            var host;

            if (typeof url === 'string') {
                el = document.createElement('a');
                el.href = url;
                query = el.search ? '&' : '?';
            }
            else if (url && url.href) {
                el = url;
            }

            if (el) {
                query = el.search ? '&' : '?';
                pathname = el.pathname && el.pathname.charAt(0) === '/' ? el.pathname : '/' + el.pathname;

                host = el.hostname + (el.port && el.port !== '' && el.port !== '80' && el.port !== '0' ? ':' + el.port : '');

                return el.protocol + '//' +
                    host +
                    pathname +
                    el.search +
                    query + XDM_PARAM_NAME + '=' + this.cookie +
                    el.hash;
            }
        },

        /**
         * Undecorates a URL with __woopraid query param
         */
        undecorate: function(url) {
            var regex = new RegExp('[?&]+(?:' + XDM_PARAM_NAME + ')=([^&#]*)', 'gi');
            var _url = url;

            if (url && url.href) {
                _url = url.href;
            }

            if (_url) {
                return _url.replace(regex, '');
            }
       },

        getPageUrl: function() {
            if (this.options.ignore_query_url) {
                return Woopra.location('pathname');
            }
            else {
                return Woopra.location('pathname') + Woopra.location('search');
            }
        },

        getPageHash: function() {
            return Woopra.location('hash');
        },

        getPageTitle: function() {
            return (document.getElementsByTagName('title').length === 0) ? '' : document.getElementsByTagName('title')[0].innerHTML;
        },

        /**
         * Retrieves a Woopra unique id from a URL's query param (__woopraid)
         *
         * @param {String} href The full URL to extract from
         */
        getUrlId: function(href) {
            var _href = href || Woopra.location('href');
            var matches;
            var regex = new RegExp(XDM_PARAM_NAME + '=([^&#]+)');

            matches = _href.match(regex);

            if (matches && matches[1]) {
                return matches[1];
            }
        },

        getOptionParams: function() {
            // default params
            var o = {
                alias: this.config('domain'),
                instance: this.instanceName,
                ka: this.config('keep_alive') || this.config('ping_interval') * 2,
                meta: docCookies.getItem('wooMeta') || '',
                screen: window.screen.width + 'x' + window.screen.height,
                language: window.navigator.browserLanguage || window.navigator.language || '',
                app: this.config('app'),
                referer: document.referrer,
                idle: '' + parseInt(this.idle / 1000, 10),
                vs: 'i'
            };

            // set cookie if configured
            if (this.config('use_cookies')) {
                o.cookie = this.getCookie() || this.cookie;
            }

            // set ip if configured
            if (this.config('ip')) {
                o.ip = this.config('ip');
            }
            // this.vs is 2 after typing so 'writing'
            if (this.vs === 2) {
                o.vs = 'w';
                this.vs = 0;
            }
            else if (this.idle === 0) {
                o.vs = 'r';
            }

            return o;
        },

        /**
         * Stop ping timers and cleanup any globals.  Shouldn't really
         * be needed by clients.
         */
        dispose: function() {
            this.stopPing();

            for (var id in this.__l) {
                if (this.__l.hasOwnProperty(id)) {
                    _handler[id][this.instanceName] = null;
                }
            }
            this.__l = null;

            // cleanup global
            if (typeof window[this.instanceName] !== 'undefined') {
                try {
                    delete window[this.instanceName];
                }
                catch(e) {
                    window[this.instanceName] = undefined;
                }
            }
        }
    };

    window.WoopraTracker = Tracker;
    window.WoopraLoadScript = Woopra.loadScript;

    if (typeof window.exports !== 'undefined') {
        Woopra.Tracker = Tracker;
        window.exports.Woopra = Woopra;

        if (typeof window.woopraLoaded === 'function') {
            window.woopraLoaded();
            window.woopraLoaded = null;
        }
    }

    // Initialize instances & preloaded settings/events
    var _queue = window.__woo || window._w;
    if (typeof _queue !== 'undefined') {
        for (var name in _queue) {
            if (_queue.hasOwnProperty(name)) {
                var instance = new Tracker(name);
                instance.init();

                // DO NOT REMOVE
                // compatibility with old tracker and chat
                if (typeof window.woopraTracker === 'undefined') {
                    window.woopraTracker = instance;
                }
            }
        }
    }

})(window, document);
