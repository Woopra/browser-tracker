(function () {
  'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  var VERSION = 11;
  var ENDPOINT = 'www.woopra.com/track/';
  var XDM_PARAM_NAME = '__woopraid';
  var CAMPAIGN_KEYS = ['source', 'medium', 'content', 'campaign', 'term'];
  var SECOND_LEVEL_TLDS = ['com.au', 'net.au', 'org.au', 'co.hu', 'com.ru', 'ac.za', 'net.za', 'com.za', 'co.za', 'co.uk', 'org.uk', 'me.uk', 'net.uk'];
  var RANDOM_STRING_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var MIN_PING_INTERVAL = 6000;
  var MAX_PING_INTERVAL = 60000;
  var URL_ID_REGEX = new RegExp(XDM_PARAM_NAME + '=([^&#]+)');
  var KEY_ACTION_PV = 'pv';
  var KEY_EVENT_CLICK = 'click';
  var KEY_EVENT_DOWNLOAD = 'download';
  var KEY_EVENT_MOUSEDOWN = 'mousedown';
  var KEY_EVENT_MOUSEMOVE = 'mousemove';
  var KEY_EVENT_OUTGOING = 'outgoing';
  var KEY_APP = 'app';
  var KEY_AUTO_DECORATE = 'auto_decorate';
  var KEY_CAMPAIGN_ONCE = 'campaign_once';
  var KEY_CONTEXT = 'context';
  var KEY_COOKIE_DOMAIN = 'cookie_domain';
  var KEY_COOKIE_EXPIRE = 'cookie_expire';
  var KEY_COOKIE_NAME = 'cookie_name';
  var KEY_COOKIE_PATH = 'cookie_path';
  var KEY_CROSS_DOMAIN = 'cross_domain';
  var KEY_DOMAIN = 'domain';
  var KEY_DOWNLOAD_PAUSE = 'download_pause';
  var KEY_DOWNLOAD_TRACKING = 'download_tracking';
  var KEY_HIDE_CAMPAIGN = 'hide_campaign';
  var KEY_HIDE_XDM_DATA = 'hide_xdm_data';
  var KEY_IDLE_THRESHOLD = 'idle_threshold';
  var KEY_IDLE_TIMEOUT = 'idle_timeout';
  var KEY_IGNORE_QUERY_URL = 'ignore_query_url';
  var KEY_IP = 'ip';
  var KEY_MAP_QUERY_PARAMS = 'map_query_params';
  var KEY_OUTGOING_IGNORE_SUBDOMAIN = 'outgoing_ignore_subdomain';
  var KEY_OUTGOING_PAUSE = 'outgoing_pause';
  var KEY_OUTGOING_TRACKING = 'outgoing_tracking';
  var KEY_PERSONALIZATION = 'personalization';
  var KEY_PING = 'ping';
  var KEY_PING_INTERVAL = 'ping_interval';
  var KEY_PROTOCOL = 'protocol';
  var KEY_SAVE_URL_HASH = 'save_url_hash';
  var KEY_THIRD_PARTY = 'third_party';
  var KEY_USE_COOKIES = 'use_cookies';

  /**
   * Generates a random 12 character string
   *
   * @return {String} Returns a random 12 character string
   */

  function randomString() {
    var s = '';

    for (var i = 0; i < 12; i++) {
      var rnum = Math.floor(Math.random() * RANDOM_STRING_CHARS.length);
      s += RANDOM_STRING_CHARS.substring(rnum, rnum + 1);
    }

    return s;
  }
  var noop = function noop() {
    return null;
  };
  function isLeftClick(evt) {
    if (evt === void 0) {
      evt = window.event;
    }

    var button = !isUndefined(evt.which) && evt.which === 1 || !isUndefined(evt.button) && evt.button === 0;
    return button && !evt.metaKey && !evt.altKey && !evt.ctrlKey && !evt.shiftKey;
  }
  /**
   * Helper to either query an element by id, or return element if passed
   * through options
   *
   * Supports searching by ids and classnames (or querySelector if browser supported)
   */

  function getElement(selector, options) {
    var _options = typeof selector === 'string' ? options || {} : selector || {};

    if (_options.el) {
      return _options.el;
    } else if (typeof selector === 'string') {
      if (document.querySelectorAll) {
        return document.querySelectorAll(selector);
      } else if (selector[0] === '#') {
        return document.getElementById(selector.substr(1));
      } else if (selector[0] === '.') {
        return document.getElementsByClassName(selector.substr(1));
      }
    }
  }
  /**
   * Checks if string ends with suffix
   *
   * @param {string} str The haystack string
   * @param {string} suffix The needle
   * @return {boolean} True if needle was found in haystack
   */

  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }
  /**
   * Checks if string starts with prefix
   *
   * @param {string} str The haystack string
   * @param {string} prefix The needle
   * @return {boolean} True if needle was found in haystack
   */

  function startsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
  }
  /**
   * Checks if `value` is `undefined`
   *
   * @param {*} value The value to check.
   * @return {boolean} Returns `true` if `value` is `undefined`, else `false`.
   */

  function isUndefined(value) {
    return value === undefined;
  }
  var toString = Object.prototype.toString;
  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @param {*} value The value to check.
   * @return {boolean} Returns `true` if `value` is a function, else `false`.
   */

  function isFunction(value) {
    if (typeof value === 'function') return true;
    if (typeof value !== 'object') return false; // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.

    var tag = toString.call(value);
    return tag === '[object Function]' || tag === '[object AsyncFunction]' || tag === '[object GeneratorFunction]' || tag === '[object Proxy]';
  }

  var handlers = {};
  function removeHandler(id, instance) {
    handlers[id][instance] = null;
  }
  function attachEvent(element, type, callback) {
    if (element.addEventListener) {
      element.addEventListener(type, callback);
    }
  }
  function on(parent, event, callback) {
    var id = parent.instanceName;

    if (!handlers[event]) {
      handlers[event] = {};
    }

    handlers[event][id] = parent;

    if (parent.__l) {
      if (!parent.__l[event]) {
        parent.__l[event] = [];
      }

      parent.__l[event].push(callback);
    }
  }
  function fire(event) {
    var handler;
    var _event = handlers[event];

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
  }

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
  function getItem(sKey) {
    if (!sKey) {
      return null;
    }

    return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
  }
  function setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return false;
    }

    var sExpires = '';

    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
          break;

        case String:
          sExpires = '; expires=' + vEnd;
          break;

        case Date:
          sExpires = '; expires=' + vEnd.toUTCString();
          break;
      }
    }

    document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
    return true;
  }
  function removeItem(sKey, sPath, sDomain) {
    if (!hasItem(sKey)) {
      return false;
    }

    document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '');
    return true;
  }
  function hasItem(sKey) {
    if (!sKey) {
      return false;
    }

    return new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=').test(document.cookie);
  }
  function keys() {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:\=[^;]*)?;\s*/);

    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
      aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
    }

    return aKeys;
  }

  var docCookies = /*#__PURE__*/Object.freeze({
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem,
    hasItem: hasItem,
    keys: keys
  });

  function removeScript(script) {
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }

  var statusIsSuccessful = function statusIsSuccessful(readyState) {
    return readyState === 4 || readyState === 'complete' || readyState === 'loaded';
  };

  function loadScript(url, callback) {
    if (callback === void 0) {
      callback = noop;
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;

    if (!isUndefined(script.onreadystatechange)) {
      script.onreadystatechange = function onreadystatechange() {
        if (statusIsSuccessful(this.readyState)) {
          callback();
          removeScript(script);
        }
      };
    } else {
      script.onload = function () {
        callback();
        removeScript(script);
      };

      script.onerror = function () {
        removeScript(script);
      };
    }

    script.src = url;
    document.body.appendChild(script);
  }

  var TYPE_BUTTON = 'button';
  var TYPE_SUBMIT = 'submit';
  var TYPE_RESET = 'reset'; // https://code.google.com/p/form-serialize/
  // modified to return an object

  function serializeForm(form, options) {
    if (options === void 0) {
      options = {};
    }

    if (!form || form.nodeName !== 'FORM') {
      return;
    }

    var exclude = options.exclude || [];
    var data = {};

    for (var i = form.elements.length - 1; i >= 0; i = i - 1) {
      if (form.elements[i].name === '' || exclude.indexOf(form.elements[i].name) > -1) {
        continue;
      }

      switch (form.elements[i].nodeName) {
        case 'INPUT':
          switch (form.elements[i].type) {
            case 'text':
            case 'hidden':
            case TYPE_BUTTON:
            case TYPE_RESET:
            case TYPE_SUBMIT:
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
              for (var j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                if (form.elements[i].options[j].selected) {
                  data[form.elements[i].name] = form.elements[i].options[j].value;
                }
              }

              break;
          }

          break;

        case 'BUTTON':
          switch (form.elements[i].type) {
            case TYPE_RESET:
            case TYPE_SUBMIT:
            case TYPE_BUTTON:
              data[form.elements[i].name] = form.elements[i].value;
              break;
          }

          break;
      }
    }

    return data;
  }

  var _KEY_AUTO_DECORATE$KE;
  var globals = (_KEY_AUTO_DECORATE$KE = {}, _KEY_AUTO_DECORATE$KE[KEY_AUTO_DECORATE] = undefined, _KEY_AUTO_DECORATE$KE[KEY_DOWNLOAD_PAUSE] = undefined, _KEY_AUTO_DECORATE$KE[KEY_DOWNLOAD_TRACKING] = false, _KEY_AUTO_DECORATE$KE[KEY_OUTGOING_IGNORE_SUBDOMAIN] = true, _KEY_AUTO_DECORATE$KE[KEY_OUTGOING_PAUSE] = undefined, _KEY_AUTO_DECORATE$KE[KEY_OUTGOING_TRACKING] = false, _KEY_AUTO_DECORATE$KE);

  var Woopra = {};
  Woopra.docCookies = docCookies;
  /**
   * Wrapper for window.location to allow stubs in testing
   */

  Woopra.location = function location(property, value) {
    // make sure property is valid
    if (!isUndefined(window.location[property])) {
      if (!isUndefined(value)) {
        window.location[property] = value;
      } else {
        return window.location[property];
      }
    }
  };

  function getHostname() {
    return Woopra.location('hostname');
  }
  /**
   * This exists to please the Safari gods. Sinon can't stub window in Safari.
   */


  Woopra.historyReplaceState = window.history && window.history.replaceState ? function historyReplaceState(data, title, url) {
    return window.history.replaceState(data, title, url);
  } : function () {};
  /**
   * Hides any URL parameters by calling window.history.replaceState
   *
   * @param {Array} params A list of parameter prefixes that will be hidden
   * @return {String} Returns the new URL that will be used
   */

  Woopra.hideUrlParams = function hideUrlParams(params) {
    var regex = new RegExp("[?&]+((?:" + params.join('|') + ")[^=&]*)=([^&#]*)", 'gi');
    var href = Woopra.location('href').replace(regex, '');
    Woopra.historyReplaceState(null, null, href);
    return href;
  };
  /**
   * Retrieves the current URL parameters as an object
   *
   * @return {Object} An object for all of the URL parameters
   */


  Woopra.getUrlParams = function getUrlParams() {
    var vars = {};
    var href = Woopra.location('href');

    if (href) {
      href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = decodeURIComponent(value.split('+').join(' '));
      });
    }

    return vars;
  };

  Woopra.buildUrlParams = function buildUrlParams(params, prefix) {
    if (prefix === void 0) {
      prefix = '';
    }

    var p = [];

    if (isUndefined(params)) {
      return params;
    }

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        if (params[key] !== 'undefined' && params[key] !== 'null' && !isUndefined(params[key])) {
          p.push("" + prefix + encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        }
      }
    }

    return p.join('&');
  };
  /**
   * Parses the URL parameters for data beginning with a certain prefix
   *
   * @param {Function} method The callback method for each key found matching `prefix`
   * @param {string} prefix The prefix that the parameter should start with
   */


  Woopra.getCustomData = function getCustomData(method, prefix) {
    if (prefix === void 0) {
      prefix = 'wv_';
    }

    var vars = Woopra.getUrlParams();

    for (var i in vars) {
      if (vars.hasOwnProperty(i)) {
        var value = vars[i];

        if (i.substring(0, prefix.length) === prefix) {
          var key = i.substring(prefix.length);
          method.call(this, key, value);
        }
      }
    }
  };
  /**
   * Retrieves the current client domain name using the hostname
   * and returning the last two tokens with a `.` separator (domain + tld).
   *
   * This can be an issue if there is a second level domain
   */


  Woopra.getDomain = function getDomain(hostname) {
    if (hostname === void 0) {
      hostname = getHostname();
    }

    var domain = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1); // check if domain is in list of second level domains, ignore if so

    if (SECOND_LEVEL_TLDS.indexOf(domain) !== -1) {
      return hostname.substring(hostname.lastIndexOf('.', hostname.indexOf(domain) - 2) + 1);
    }

    return domain;
  };
  /**
   * Returns the current hostname with 'www' stripped out
   */


  Woopra.getHostnameNoWww = function getHostnameNoWww() {
    var hostname = getHostname();

    if (hostname.indexOf('www.') === 0) {
      return hostname.replace('www.', '');
    }

    return hostname;
  };
  /**
   * Determines if the current URL should be considered an outgoing URL
   */


  Woopra.isOutgoingLink = function isOutgoingLink(targetHostname) {
    var currentHostname = getHostname();
    var currentDomain = Woopra.getDomain(currentHostname);
    return targetHostname !== currentHostname && targetHostname.replace(/^www\./, '') !== currentHostname.replace(/^www\./, '') && (!globals[KEY_OUTGOING_IGNORE_SUBDOMAIN] || currentDomain !== Woopra.getDomain(targetHostname)) && !Woopra.startsWith(targetHostname, 'javascript') && targetHostname !== '' && targetHostname !== '#';
  };

  Woopra.hideCrossDomainId = function hideCrossDomainId() {
    return Woopra.hideUrlParams([XDM_PARAM_NAME]);
  };

  Woopra.mapQueryParams = function mapQueryParams(mapping) {
    var vars = Woopra.getUrlParams();
    var params = {};

    for (var key in mapping) {
      var value = vars[key];

      if (!isUndefined(value)) {
        params[mapping[key]] = value;
      }
    }

    return params;
  };

  Woopra.redirect = function redirect(link) {
    Woopra.location('href', link);
  };
  /**
   * Parses current URL for parameters that start with either `utm_` or `woo_`
   * and have the keys `source`, `medium`, `content`, `campaign`, `term`
   *
   * @return {Object} Returns an object with campaign keys as keys
   */


  Woopra.getCampaignData = function getCampaignData() {
    var vars = Woopra.getUrlParams();
    var campaign = {};

    for (var i = 0; i < CAMPAIGN_KEYS.length; i++) {
      var key = CAMPAIGN_KEYS[i];
      var value = vars["utm_" + key] || vars["woo_" + key];

      if (!isUndefined(value)) {
        campaign["campaign_" + (key === 'campaign' ? 'name' : key)] = value;
      }
    }

    return campaign;
  };
  /**
   * Hides any campaign data (query params: wv_, woo_, utm_) from the URL
   * by using replaceState (if available)
   */


  Woopra.hideCampaignData = function hideCampaignData() {
    return Woopra.hideUrlParams(['wv_', 'woo_', 'utm_']);
  };

  Woopra.leftClick = isLeftClick;
  Woopra.randomString = randomString;
  Woopra.getElement = getElement;
  Woopra.loadScript = loadScript;
  Woopra.removeScript = removeScript;
  Woopra.serializeForm = serializeForm;
  Woopra._on = on;
  Woopra._fire = fire;
  Woopra.attachEvent = attachEvent;
  Woopra.startsWith = startsWith;
  Woopra.endsWith = endsWith;

  var Tracker =
  /*#__PURE__*/
  function () {
    function Tracker(instanceName) {
      var _this$options;

      this.visitorData = {};
      this.sessionData = {};
      this.options = (_this$options = {}, _this$options[KEY_APP] = 'js-client', _this$options[KEY_USE_COOKIES] = true, _this$options[KEY_PING] = true, _this$options[KEY_PING_INTERVAL] = 12000, _this$options[KEY_IDLE_TIMEOUT] = 300000, _this$options[KEY_IDLE_THRESHOLD] = 10000, _this$options[KEY_DOWNLOAD_PAUSE] = globals[KEY_DOWNLOAD_PAUSE] || 200, _this$options[KEY_OUTGOING_PAUSE] = globals[KEY_OUTGOING_PAUSE] || 200, _this$options[KEY_DOWNLOAD_TRACKING] = false, _this$options[KEY_OUTGOING_TRACKING] = false, _this$options[KEY_OUTGOING_IGNORE_SUBDOMAIN] = true, _this$options[KEY_HIDE_CAMPAIGN] = false, _this$options[KEY_HIDE_XDM_DATA] = false, _this$options[KEY_CAMPAIGN_ONCE] = false, _this$options[KEY_THIRD_PARTY] = false, _this$options[KEY_SAVE_URL_HASH] = true, _this$options[KEY_CROSS_DOMAIN] = false, _this$options[KEY_IGNORE_QUERY_URL] = false, _this$options[KEY_MAP_QUERY_PARAMS] = {}, _this$options[KEY_COOKIE_NAME] = 'wooTracker', _this$options[KEY_COOKIE_DOMAIN] = "." + Woopra.getHostnameNoWww(), _this$options[KEY_COOKIE_PATH] = '/', _this$options[KEY_COOKIE_EXPIRE] = new Date(new Date().setDate(new Date().getDate() + 730)), _this$options[KEY_PERSONALIZATION] = true, _this$options);
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
    }

    var _proto = Tracker.prototype;

    _proto.init = function init() {
      var _this = this;

      this.__l = {};

      this._processQueue('config');

      this._setupCookie();

      this._bindEvents(); // Otherwise loading indicator gets stuck until the every response
      // in the queue has been received


      setTimeout(function () {
        return _this._processQueue();
      }, 1);
      this.loaded = true;
      var callback = this.config('initialized');

      if (isFunction(callback)) {
        callback(this.instanceName);
      } // Safe to remove cross domain url parameter after setupCookie is called
      // Should only need to be called once on load


      if (this.config(KEY_HIDE_XDM_DATA)) {
        Woopra.hideCrossDomainId();
      }
    }
    /**
     * Processes the tracker queue in case user tries to push events
     * before tracker is ready.
     */
    ;

    _proto._processQueue = function _processQueue(type) {
      var _wpt = window.__woo ? window.__woo[this.instanceName] : _wpt;

      _wpt = window._w ? window._w[this.instanceName] : _wpt; // if _wpt is undefined, means script was loaded asynchronously and
      // there is no queue

      if (_wpt && _wpt._e) {
        var events = _wpt._e;

        for (var i = 0; i < events.length; i++) {
          var action = events[i];

          if (!isUndefined(action) && this[action[0]] && (isUndefined(type) || type === action[0])) {
            this[action[0]].apply(this, Array.prototype.slice.call(action, 1));
          }
        }
      }
    }
    /**
     * Sets up the tracking cookie
     */
    ;

    _proto._setupCookie = function _setupCookie() {
      var url_id = this.getUrlId();
      this.cookie = this.getCookie(); // overwrite saved cookie if id is in url

      if (url_id) {
        this.cookie = url_id;
      } // Setup cookie


      if (!this.cookie || this.cookie.length < 1) {
        this.cookie = randomString();
      }

      Woopra.docCookies.setItem(this.config(KEY_COOKIE_NAME), this.cookie, this.config(KEY_COOKIE_EXPIRE), this.config(KEY_COOKIE_PATH), this.config(KEY_COOKIE_DOMAIN));
      this.dirtyCookie = true;
    }
    /**
     * Binds some events to measure mouse and keyboard events
     */
    ;

    _proto._bindEvents = function _bindEvents() {
      var _this2 = this;

      on(this, KEY_EVENT_MOUSEMOVE, function (e, l) {
        return _this2.moved(e, l);
      });
      on(this, KEY_EVENT_DOWNLOAD, function (url) {
        return _this2.downloaded(url);
      });
      on(this, KEY_EVENT_OUTGOING, function (url) {
        return _this2.outgoing(url);
      });
      on(this, KEY_AUTO_DECORATE, function (elem) {
        return _this2.autoDecorate(elem);
      });
    }
    /**
     * Sets/gets values from dataStore depending on arguments passed
     *
     * @param dataStore Object The tracker property to read/write
     * @param key String/Object Returns property object if key and value is undefined,
     *      acts as a getter if only `key` is defined and a string, and
     *      acts as a setter if `key` and `value` are defined OR if `key` is an object.
     */
    ;

    _proto._dataSetter = function _dataSetter(dataStore, key, value) {
      if (isUndefined(key)) {
        return dataStore;
      }

      if (isUndefined(value)) {
        if (typeof key === 'string') {
          return dataStore[key];
        }

        if (typeof key === 'object') {
          for (var i in key) {
            if (key.hasOwnProperty(i)) {
              if (Woopra.startsWith(i, 'cookie_')) {
                this.dirtyCookie = true;
              }

              dataStore[i] = key[i];
            }
          }
        }
      } else {
        if (Woopra.startsWith(key, 'cookie_')) {
          this.dirtyCookie = true;
        }

        dataStore[key] = value;
      }

      return this;
    }
    /**
     * Builds the correct tracking Url and performs an HTTP request
     */
    ;

    _proto._push = function _push(options) {
      if (options === void 0) {
        options = {};
      }

      var types = [['visitorData', 'cv_'], ['eventData', 'ce_'], ['sessionData', 'cs_']];
      var data = [];
      var endpoint = this.getEndpoint(options.endpoint); // Load custom visitor params from url

      this.getVisitorUrlData();

      if (this.config(KEY_HIDE_CAMPAIGN)) {
        Woopra.hideCampaignData();
      } // push tracker config values


      data.push(Woopra.buildUrlParams(this.getOptionParams())); // push eventName if it exists

      if (options.eventName) {
        data.push("event=" + options.eventName);
      } // push close if no personalization


      if (!this.config(KEY_PERSONALIZATION)) {
        data.push('close=true');
      }

      for (var i = 0; i < types.length; i++) {
        var _types$i = types[i],
            key = _types$i[0],
            prefix = _types$i[1];
        var params = options[key];

        if (params) {
          var urlParam = Woopra.buildUrlParams(params, prefix);

          if (urlParam) {
            data.push(urlParam);
          }
        }
      }

      if (this.config(KEY_CONTEXT)) {
        try {
          var contextData = JSON.stringify(this.config(KEY_CONTEXT));
          data.push(KEY_CONTEXT + "=" + encodeURIComponent(contextData));
        } catch (e) {}
      }

      var queryString = data.join('&');
      var scriptUrl = endpoint + "?" + queryString;
      Woopra.loadScript(scriptUrl, options.callback);
    };

    _proto.getVisitorUrlData = function getVisitorUrlData() {
      Woopra.getCustomData.call(this, this.identify, 'wv_');
    }
    /*
     * Returns the Woopra cookie string
     */
    ;

    _proto.getCookie = function getCookie() {
      return Woopra.docCookies.getItem(this.config(KEY_COOKIE_NAME));
    };

    _proto.getProtocol = function getProtocol() {
      var protocol = this.config(KEY_PROTOCOL);
      return protocol && protocol !== '' ? protocol + ":" : '';
    }
    /**
     * Generates a destination endpoint string to use depending on different
     * configuration options
     */
    ;

    _proto.getEndpoint = function getEndpoint(path) {
      if (path === void 0) {
        path = '';
      }

      var protocol = this.getProtocol();

      if (this.config(KEY_THIRD_PARTY) && !this.config(KEY_DOMAIN)) {
        throw new Error('Error: `domain` is not set.');
      }

      var thirdPartyPath = this.config(KEY_THIRD_PARTY) ? "tp/" + this.config(KEY_DOMAIN) : '';

      if (path && !Woopra.endsWith(path, '/')) {
        path += '/';
      }

      if (thirdPartyPath && !Woopra.startsWith(path, '/')) {
        thirdPartyPath += '/';
      }

      return protocol + "//" + ENDPOINT + thirdPartyPath + path;
    }
    /**
     * Sets configuration options
     */
    ;

    _proto.config = function config(key, value) {
      var data = this._dataSetter(this.options, key, value); // dataSetter returns `this` when it is used as a setter


      if (data === this) {
        // clamp ping interval
        this.options[KEY_PING_INTERVAL] = Math.max(MIN_PING_INTERVAL, Math.min(this.options[KEY_PING_INTERVAL], MAX_PING_INTERVAL)); // set script wide variables for events that are bound on script load
        // since we shouldn't bind per tracker instance

        globals[KEY_OUTGOING_TRACKING] = this.options[KEY_OUTGOING_TRACKING];
        globals[KEY_OUTGOING_PAUSE] = this.options[KEY_OUTGOING_PAUSE];
        globals[KEY_DOWNLOAD_TRACKING] = this.options[KEY_DOWNLOAD_TRACKING];
        globals[KEY_DOWNLOAD_PAUSE] = this.options[KEY_DOWNLOAD_PAUSE];
        globals[KEY_AUTO_DECORATE] = isUndefined(globals[KEY_AUTO_DECORATE]) && this.options[KEY_CROSS_DOMAIN] ? this.options[KEY_CROSS_DOMAIN] : globals[KEY_AUTO_DECORATE];
        globals[KEY_OUTGOING_IGNORE_SUBDOMAIN] = this.options[KEY_OUTGOING_IGNORE_SUBDOMAIN];

        if (this.dirtyCookie && this.loaded) {
          this._setupCookie();
        }
      }

      return data;
    }
    /**
     * Use to attach custom visit data that doesn't stick to visitor
     * ** Not in use yet
     */
    ;

    _proto.visit = function visit(key, value) {
      return this._dataSetter(this.sessionData, key, value);
    }
    /**
     * Attach custom visitor data
     */
    ;

    _proto.identify = function identify(key, value) {
      return this._dataSetter(this.visitorData, key, value);
    }
    /**
     * Generic method to call any tracker method
     */
    ;

    _proto.call = function call(funcName) {
      if (isFunction(this[funcName])) {
        this[funcName].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
    /**
     * Send an event to tracking servr
     */
    ;

    _proto.track = function track(name, options) {
      var eventData = {};
      var eventName = '';
      var hash;
      var callback;
      var _cb = arguments[arguments.length - 1];

      if (typeof _cb === 'function') {
        callback = _cb;
      } // Load campaign params (load first to allow overrides)


      if (!this.config(KEY_CAMPAIGN_ONCE) || !this.sentCampaign) {
        eventData = _extends({}, eventData, Woopra.getCampaignData());
        this.sentCampaign = true;
      } // Load query params mapping into Woopra event


      eventData = _extends({}, eventData, Woopra.mapQueryParams(this.config(KEY_MAP_QUERY_PARAMS)));

      if (isFunction(_cb)) {
        callback = _cb;
      } // Track default: pageview


      if (isUndefined(name) || name === callback) {
        eventName = KEY_ACTION_PV;
      } // Track custom events
      else if (isUndefined(options) || options === callback) {
          if (typeof name === 'string') {
            eventName = name;
          }

          if (typeof name === 'object') {
            if (name.name && name.name === KEY_ACTION_PV) {
              eventName = KEY_ACTION_PV;
            }

            this._dataSetter(eventData, name);
          }
        } // Track custom events in format of name,object
        else {
            this._dataSetter(eventData, options);

            eventName = name;
          } // Add some defaults for pageview


      if (eventName === KEY_ACTION_PV) {
        eventData.url = eventData.url || this.getPageUrl();
        eventData.title = eventData.title || this.getPageTitle();
        eventData.domain = eventData.domain || this.getDomainName();
        eventData.uri = eventData.uri || this.getURI();

        if (this.config(KEY_SAVE_URL_HASH)) {
          hash = eventData.hash || this.getPageHash();

          if (hash !== '' && hash !== '#') {
            eventData.hash = hash;
          }
        }
      }

      this._push({
        endpoint: 'ce',
        visitorData: this.visitorData,
        sessionData: this.sessionData,
        eventName: eventName,
        eventData: eventData,
        callback: callback
      });

      this.startPing();
    }
    /**
     * Tracks a single form and then resubmits it
     */
    ;

    _proto.trackForm = function trackForm(eventName, selector, options) {
      var _this3 = this;

      if (eventName === void 0) {
        eventName = 'Tracked Form';
      }

      var els;

      var _options = typeof selector === 'string' ? options || {} : selector || {};

      var bindEl = function bindEl(el, ev, props, opts) {
        attachEvent(el, 'submit', function (e) {
          _this3.trackFormHandler(e, el, ev, _options);
        });
      };

      if (_options.elements) {
        els = _options.elements;
      } else {
        els = getElement(selector, _options);
      } // attach event if form was found


      if (els && els.length > 0) {
        for (var i in els) {
          bindEl(els[i], eventName);
        }
      }
    };

    _proto.trackFormHandler = function trackFormHandler(e, el, eventName, options) {
      if (options === void 0) {
        options = {};
      }

      var trackFinished = false;

      if (!el.getAttribute('data-tracked')) {
        var data = Woopra.serializeForm(el, options);

        if (isFunction(options.identify)) {
          var personData = options.identify(data) || {};

          if (personData) {
            this.identify(personData);
          }
        }

        if (options.noSubmit) {
          this.track(eventName, data, function () {
            if (isFunction(options.callback)) {
              options.callback(data);
            }
          });
        } else {
          e.preventDefault();
          e.stopPropagation();
          el.setAttribute('data-tracked', 1); // submit the form if the reply takes less than 250ms

          this.track(eventName, data, function () {
            trackFinished = true;

            if (isFunction(options.callback)) {
              options.callback(data);
            }

            el.submit();
          }); // set timeout to resubmit to be a hard 250ms
          // so even if woopra does not reply it will still
          // submit the form

          setTimeout(function () {
            if (!trackFinished) {
              el.submit();
            }
          }, 250);
        }
      }
    }
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
    ;

    _proto.trackClick = function trackClick(eventName, selector, properties, options) {
      var _this4 = this;

      if (eventName === void 0) {
        eventName = 'Item Clicked';
      }

      if (options === void 0) {
        options = {};
      }

      var els = [];

      var bindEl = function bindEl(el, ev, props, opts) {
        attachEvent(el, KEY_EVENT_CLICK, function (e) {
          _this4.trackClickHandler(e, el, ev, props, opts);
        });
      };
      /**
       * Support an array of elements
       */


      if (options.elements) {
        els = options.elements;
      } else {
        els = getElement(selector, options);
      }

      if (els) {
        for (var i = 0; i < els.length; i++) {
          bindEl(els[i], eventName, properties, options);
        }
      }
    };

    _proto.trackClickHandler = function trackClickHandler(e, el, eventName, properties, options) {
      var trackFinished = false;

      if (!el.getAttribute('data-tracked')) {
        if (options.noNav) {
          this.track(eventName, properties);
        } else {
          e.preventDefault();
          el.setAttribute('data-tracked', 1);
          this.track(eventName, properties, function () {
            trackFinished = true;

            if (isFunction(options.callback)) {
              options.callback();
            }

            el.click();
          });
          setTimeout(function () {
            if (!trackFinished) {
              el.click();
            }
          }, 250);
        }
      }
    };

    _proto.startPing = function startPing() {
      var _this5 = this;

      if (isUndefined(this.pingInterval)) {
        this.pingInterval = setInterval(function () {
          _this5.ping();
        }, this.config(KEY_PING_INTERVAL));
      }
    };

    _proto.stopPing = function stopPing() {
      if (!isUndefined(this.pingInterval)) {
        clearInterval(this.pingInterval);
        delete this.pingInterval;
      }
    }
    /**
     * Pings tracker with visitor info
     */
    ;

    _proto.ping = function ping() {
      if (this.config(KEY_PING) && this.idle < this.config(KEY_IDLE_TIMEOUT)) {
        this._push({
          endpoint: 'ping'
        });
      } else {
        this.stopPing();
      }

      var now = new Date();

      if (now - this.last_activity > this.config(KEY_IDLE_THRESHOLD)) {
        this.idle = now - this.last_activity;
      }

      return this;
    }
    /**
     * Pushes visitor data to server without sending an event
     */
    ;

    _proto.push = function push(callback) {
      this._push({
        endpoint: 'identify',
        visitorData: this.visitorData,
        sessionData: this.sessionData,
        callback: callback
      });

      return this;
    }
    /**
     * synchronous sleep
     */
    ;

    _proto.sleep = function sleep() {} // Why does this exist?
    // User Action tracking and event handlers

    /**
     * Clicks
     */

    /**
     * Measure when the user last moved their mouse to update idle state
     */
    ;

    _proto.moved = function moved(e, last_activity) {
      this.last_activity = last_activity;
      this.idle = 0;
    };

    _proto.downloaded = function downloaded(url) {
      this.track(KEY_EVENT_DOWNLOAD, {
        url: url
      });
    };

    _proto.outgoing = function outgoing(url) {
      this.track(KEY_EVENT_OUTGOING, {
        url: url
      });
    }
    /**
     * Event handler for decorating an element with a URL (for now only
     * anchor tags)
     */
    ;

    _proto.autoDecorate = function autoDecorate(elem) {
      var xdm = this.config(KEY_CROSS_DOMAIN);
      if (!xdm) return;
      var canDecorate;

      if (typeof xdm === 'string') {
        canDecorate = elem.hostname.indexOf(xdm) > -1;
      } else if (xdm.push) {
        for (var i = 0; i < xdm.length; i++) {
          if (elem.hostname.indexOf(xdm[i]) !== -1) {
            canDecorate = true;
            break;
          }
        }
      }

      if (canDecorate) {
        var decorated = this.decorate(elem);

        if (decorated) {
          elem.href = decorated; // bind an event handler on mouseup to remove the url
        }
      }
    }
    /**
     * Resets cookie
     */
    ;

    _proto.reset = function reset() {
      Woopra.docCookies.removeItem(this.config(KEY_COOKIE_NAME), this.config(KEY_COOKIE_PATH), this.config(KEY_COOKIE_DOMAIN));
      this.cookie = null;

      this._setupCookie();
    }
    /**
     * Decorates a given URL with a __woopraid query param with value of
     * the current cookie
     */
    ;

    _proto.decorate = function decorate(url) {
      var el;
      var query;
      var pathname;
      var host;

      if (typeof url === 'string') {
        el = document.createElement('a');
        el.href = url;
        query = el.search ? '&' : '?';
      } else if (url && url.href) {
        el = url;
      }

      if (el) {
        query = el.search ? '&' : '?';
        pathname = el.pathname && el.pathname.charAt(0) === '/' ? el.pathname : '/' + el.pathname;
        host = el.hostname + (el.port && el.port !== '' && el.port !== '80' && el.port !== '0' ? ':' + el.port : '');
        return el.protocol + "//" + host + pathname + el.search + query + XDM_PARAM_NAME + "=" + this.cookie + el.hash;
      }
    }
    /**
     * Undecorates a URL with __woopraid query param
     */
    ;

    _proto.undecorate = function undecorate(url) {
      var regex = new RegExp("[?&]+(?:" + XDM_PARAM_NAME + ")=([^&#]*)", 'gi');
      var _url = url;

      if (url && url.href) {
        _url = url.href;
      }

      if (_url) {
        return _url.replace(regex, '');
      }
    };

    _proto.getPageUrl = function getPageUrl() {
      if (this.config(KEY_IGNORE_QUERY_URL)) {
        return Woopra.location('pathname');
      }

      return "" + Woopra.location('pathname') + Woopra.location('search');
    };

    _proto.getPageHash = function getPageHash() {
      return Woopra.location('hash');
    };

    _proto.getPageTitle = function getPageTitle() {
      return document.getElementsByTagName('title').length === 0 ? '' : document.getElementsByTagName('title')[0].innerHTML;
    };

    _proto.getDomainName = function getDomainName() {
      return Woopra.location('hostname');
    };

    _proto.getURI = function getURI() {
      return Woopra.location('href');
    }
    /**
     * Retrieves a Woopra unique id from a URL's query param (__woopraid)
     *
     * @param {String} href The full URL to extract from
     */
    ;

    _proto.getUrlId = function getUrlId(href) {
      if (href === void 0) {
        href = Woopra.location('href');
      }

      var matches = href.match(URL_ID_REGEX);

      if (matches && matches[1]) {
        return matches[1];
      }
    };

    _proto.getOptionParams = function getOptionParams() {
      // default params
      var o = {
        alias: this.config(KEY_DOMAIN) || Woopra.getHostnameNoWww(),
        instance: this.instanceName,
        meta: Woopra.docCookies.getItem('wooMeta') || '',
        screen: window.screen.width + "x" + window.screen.height,
        language: window.navigator.browserLanguage || window.navigator.language || '',
        app: this.config(KEY_APP),
        referer: document.referrer
      };

      if (!this.config(KEY_DOMAIN)) {
        o._warn = 'no_domain';

        if (Woopra.getHostnameNoWww() !== Woopra.getDomain()) {
          o._warn += ',domain_mismatch';
        }
      } // set cookie if configured


      if (this.config(KEY_USE_COOKIES)) {
        o.cookie = this.getCookie() || this.cookie;
      } // set ip if configured


      if (this.config(KEY_IP)) {
        o.ip = this.config(KEY_IP);
      }

      return o;
    }
    /**
     * Stop ping timers and cleanup any globals.  Shouldn't really
     * be needed by clients.
     */
    ;

    _proto.dispose = function dispose() {
      this.stopPing();

      for (var id in this.__l) {
        if (this.__l.hasOwnProperty(id)) {
          removeHandler(id, this.instanceName);
        }
      }

      this.__l = null; // cleanup global

      if (!isUndefined(window[this.instanceName])) {
        try {
          delete window[this.instanceName];
        } catch (e) {
          window[this.instanceName] = undefined;
        }
      }
    };

    return Tracker;
  }();

  var on$1 = Woopra.attachEvent;
  var fire$1 = Woopra._fire; // attaches any events
  // needs to be handled here, instead of in a tracking instance because
  // these events should only be fired once on a page

  function attachEvents() {
    on$1(document, KEY_EVENT_MOUSEDOWN, function (e) {
      var cElem;
      fire$1(KEY_EVENT_MOUSEMOVE, e, new Date());

      if (globals[KEY_AUTO_DECORATE]) {
        cElem = e.srcElement || e.target;

        while (!isUndefined(cElem) && cElem !== null) {
          if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
            break;
          }

          cElem = cElem.parentNode;
        }

        if (!isUndefined(cElem) && cElem !== null) {
          fire$1(KEY_AUTO_DECORATE, cElem);
        }
      }
    });
    on$1(document, KEY_EVENT_CLICK, function (e) {
      var ignoreTarget = '_blank';

      var link, _download;

      var cElem = e.srcElement || e.target;

      if (Woopra.leftClick(e)) {
        fire$1(KEY_EVENT_CLICK, e, cElem);
      }

      if (globals[KEY_DOWNLOAD_TRACKING] || globals[KEY_OUTGOING_TRACKING]) {
        // searches for an anchor element
        while (!isUndefined(cElem) && cElem !== null) {
          if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
            break;
          }

          cElem = cElem.parentNode;
        }

        if (!isUndefined(cElem) && cElem !== null && !cElem.getAttribute('data-woopra-tracked')) {
          link = cElem;
          _download = link.pathname.match(/(?:doc|dmg|eps|svg|xls|ppt|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3|mp4|m4v)($|\&)/);

          if (globals[KEY_DOWNLOAD_TRACKING] && _download) {
            fire$1(KEY_EVENT_DOWNLOAD, link.href);

            if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
              e.preventDefault();
              e.stopPropagation();
              link.setAttribute('data-woopra-tracked', true);
              setTimeout(function () {
                link.click();
              }, globals[KEY_DOWNLOAD_PAUSE]);
            }
          } // Make sure
          // * outgoing tracking is enabled
          // * this URL does not match a download URL (doesn't end
          //   in a binary file extension)
          // * not ignoring subdomains OR link hostname is not a partial
          //   match of current hostname (to check for subdomains),
          // * hostname is not empty


          if (globals[KEY_OUTGOING_TRACKING] && !_download && Woopra.isOutgoingLink(link.hostname)) {
            fire$1(KEY_EVENT_OUTGOING, link.href);

            if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
              e.preventDefault();
              e.stopPropagation();
              link.setAttribute('data-woopra-tracked', true);
              setTimeout(function () {
                link.click();
              }, globals[KEY_OUTGOING_PAUSE]);
            }
          }
        }
      }
    });
    on$1(document, KEY_EVENT_MOUSEMOVE, function (e) {
      fire$1(KEY_EVENT_MOUSEMOVE, e, new Date());
    });
  }

  window.WoopraTracker = Tracker;
  window.WoopraLoadScript = Woopra.loadScript;
  attachEvents();

  if (!isUndefined(window.exports)) {
    Woopra.Tracker = Tracker;
    window.exports.Woopra = Woopra;

    if (isFunction(window.woopraLoaded)) {
      window.woopraLoaded();
      window.woopraLoaded = null;
    }
  } // Initialize instances & preloaded settings/events


  var _queue = window.__woo || window._w;

  if (!isUndefined(_queue)) {
    for (var name in _queue) {
      if (_queue.hasOwnProperty(name)) {
        var instance = new Tracker(name);
        instance.init(); // DO NOT REMOVE
        // compatibility with old tracker and chat

        if (isUndefined(window.woopraTracker)) {
          window.woopraTracker = instance;
        }
      }
    }
  }

}());
