import { getElement, isFunction, isUndefined, randomString } from './lib/utils';
import {
  ENDPOINT,
  KEY_ACTION_PV,
  KEY_APP,
  KEY_AUTO_DECORATE,
  KEY_CAMPAIGN_ONCE,
  KEY_CONTEXT,
  KEY_COOKIE_DOMAIN,
  KEY_COOKIE_EXPIRE,
  KEY_COOKIE_NAME,
  KEY_COOKIE_PATH,
  KEY_CROSS_DOMAIN,
  KEY_DOMAIN,
  KEY_DOWNLOAD_PAUSE,
  KEY_DOWNLOAD_TRACKING,
  KEY_EVENT_CLICK,
  KEY_EVENT_DOWNLOAD,
  KEY_EVENT_MOUSEMOVE,
  KEY_EVENT_OUTGOING,
  KEY_HIDE_CAMPAIGN,
  KEY_HIDE_XDM_DATA,
  KEY_IDLE_THRESHOLD,
  KEY_IDLE_TIMEOUT,
  KEY_IGNORE_QUERY_URL,
  KEY_IP,
  KEY_MAP_QUERY_PARAMS,
  KEY_OUTGOING_IGNORE_SUBDOMAIN,
  KEY_OUTGOING_PAUSE,
  KEY_OUTGOING_TRACKING,
  KEY_PERSONALIZATION,
  KEY_PING,
  KEY_PING_INTERVAL,
  KEY_PROTOCOL,
  KEY_SAVE_URL_HASH,
  KEY_THIRD_PARTY,
  KEY_USE_COOKIES,
  MAX_PING_INTERVAL,
  MIN_PING_INTERVAL,
  URL_ID_REGEX,
  VERSION,
  XDM_PARAM_NAME
} from './constants';
import { attachEvent, on, removeHandler } from './lib/events';
import Woopra from './woopra';
import globals from './globals';

export default class Tracker {
  constructor(instanceName) {
    this.visitorData = {};
    this.sessionData = {};

    this.options = {
      [KEY_APP]: 'js-client',
      [KEY_USE_COOKIES]: true,
      [KEY_PING]: true,
      [KEY_PING_INTERVAL]: 12000,
      [KEY_IDLE_TIMEOUT]: 300000,
      [KEY_IDLE_THRESHOLD]: 10000,
      [KEY_DOWNLOAD_PAUSE]: globals[KEY_DOWNLOAD_PAUSE] || 200,
      [KEY_OUTGOING_PAUSE]: globals[KEY_OUTGOING_PAUSE] || 200,
      [KEY_DOWNLOAD_TRACKING]: false,
      [KEY_OUTGOING_TRACKING]: false,
      [KEY_OUTGOING_IGNORE_SUBDOMAIN]: true,
      [KEY_HIDE_CAMPAIGN]: false,
      [KEY_HIDE_XDM_DATA]: false,
      [KEY_CAMPAIGN_ONCE]: false,
      [KEY_THIRD_PARTY]: false,
      [KEY_SAVE_URL_HASH]: true,
      [KEY_CROSS_DOMAIN]: false,
      [KEY_IGNORE_QUERY_URL]: false,
      [KEY_MAP_QUERY_PARAMS]: {},
      [KEY_COOKIE_NAME]: 'wooTracker',
      [KEY_COOKIE_DOMAIN]: `.${Woopra.getHostnameNoWww()}`,
      [KEY_COOKIE_PATH]: '/',
      [KEY_COOKIE_EXPIRE]: new Date(
        new Date().setDate(new Date().getDate() + 730)
      ),
      [KEY_PERSONALIZATION]: true
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
  }

  init() {
    this.__l = {};
    this._processQueue('config');
    this._setupCookie();
    this._bindEvents();

    // Otherwise loading indicator gets stuck until the every response
    // in the queue has been received
    setTimeout(() => this._processQueue(), 1);

    this.loaded = true;

    const callback = this.config('initialized');

    if (isFunction(callback)) {
      callback(this.instanceName);
    }

    // Safe to remove cross domain url parameter after setupCookie is called
    // Should only need to be called once on load
    if (this.config(KEY_HIDE_XDM_DATA)) {
      Woopra.hideCrossDomainId();
    }
  }

  /**
   * Processes the tracker queue in case user tries to push events
   * before tracker is ready.
   */
  _processQueue(type) {
    var _wpt = window.__woo ? window.__woo[this.instanceName] : _wpt;
    _wpt = window._w ? window._w[this.instanceName] : _wpt;

    // if _wpt is undefined, means script was loaded asynchronously and
    // there is no queue

    if (_wpt && _wpt._e) {
      const events = _wpt._e;
      for (let i = 0; i < events.length; i++) {
        const action = events[i];
        if (
          !isUndefined(action) &&
          this[action[0]] &&
          (isUndefined(type) || type === action[0])
        ) {
          this[action[0]].apply(this, Array.prototype.slice.call(action, 1));
        }
      }
    }
  }

  /**
   * Sets up the tracking cookie
   */
  _setupCookie() {
    const url_id = this.getUrlId();

    this.cookie = this.getCookie();

    // overwrite saved cookie if id is in url
    if (url_id) {
      this.cookie = url_id;
    }

    // Setup cookie
    if (!this.cookie || this.cookie.length < 1) {
      this.cookie = randomString();
    }

    Woopra.docCookies.setItem(
      this.config(KEY_COOKIE_NAME),
      this.cookie,
      this.config(KEY_COOKIE_EXPIRE),
      this.config(KEY_COOKIE_PATH),
      this.config(KEY_COOKIE_DOMAIN)
    );

    this.dirtyCookie = true;
  }

  /**
   * Binds some events to measure mouse and keyboard events
   */
  _bindEvents() {
    on(this, KEY_EVENT_MOUSEMOVE, (e, l) => this.moved(e, l));
    on(this, KEY_EVENT_DOWNLOAD, (url) => this.downloaded(url));
    on(this, KEY_EVENT_OUTGOING, (url) => this.outgoing(url));
    on(this, KEY_AUTO_DECORATE, (elem) => this.autoDecorate(elem));
  }

  /**
   * Sets/gets values from dataStore depending on arguments passed
   *
   * @param dataStore Object The tracker property to read/write
   * @param key String/Object Returns property object if key and value is undefined,
   *      acts as a getter if only `key` is defined and a string, and
   *      acts as a setter if `key` and `value` are defined OR if `key` is an object.
   */
  _dataSetter(dataStore, key, value) {
    if (isUndefined(key)) {
      return dataStore;
    }

    if (isUndefined(value)) {
      if (typeof key === 'string') {
        return dataStore[key];
      }
      if (typeof key === 'object') {
        for (let i in key) {
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
  _push(options = {}) {
    const types = [
      ['visitorData', 'cv_'],
      ['eventData', 'ce_'],
      ['sessionData', 'cs_']
    ];

    const data = [];

    const endpoint = this.getEndpoint(options.endpoint);

    // Load custom visitor params from url
    this.getVisitorUrlData();

    if (this.config(KEY_HIDE_CAMPAIGN)) {
      Woopra.hideCampaignData();
    }

    // push tracker config values
    data.push(Woopra.buildUrlParams(this.getOptionParams()));

    // push eventName if it exists
    if (options.eventName) {
      data.push(`event=${options.eventName}`);
    }

    // push close if no personalization
    if (!this.config(KEY_PERSONALIZATION)) {
      data.push('close=true');
    }

    for (let i = 0; i < types.length; i++) {
      const [key, prefix] = types[i];
      const params = options[key];

      if (params) {
        const urlParam = Woopra.buildUrlParams(params, prefix);

        if (urlParam) {
          data.push(urlParam);
        }
      }
    }

    if (this.config(KEY_CONTEXT)) {
      try {
        var contextData = JSON.stringify(this.config(KEY_CONTEXT));
        data.push(`${KEY_CONTEXT}=${encodeURIComponent(contextData)}`);
      } catch (e) {}
    }

    const queryString = data.join('&');
    const scriptUrl = `${endpoint}?${queryString}`;

    Woopra.loadScript(scriptUrl, options.callback);
  }

  getVisitorUrlData() {
    Woopra.getCustomData.call(this, this.identify, 'wv_');
  }

  /*
   * Returns the Woopra cookie string
   */
  getCookie() {
    return Woopra.docCookies.getItem(this.config(KEY_COOKIE_NAME));
  }

  getProtocol() {
    const protocol = this.config(KEY_PROTOCOL);
    return protocol && protocol !== '' ? `${protocol}:` : '';
  }

  /**
   * Generates a destination endpoint string to use depending on different
   * configuration options
   */
  getEndpoint(path = '') {
    const protocol = this.getProtocol();

    if (this.config(KEY_THIRD_PARTY) && !this.config(KEY_DOMAIN)) {
      throw new Error('Error: `domain` is not set.');
    }

    let thirdPartyPath = this.config(KEY_THIRD_PARTY)
      ? `tp/${this.config(KEY_DOMAIN)}`
      : '';

    if (path && !Woopra.endsWith(path, '/')) {
      path += '/';
    }

    if (thirdPartyPath && !Woopra.startsWith(path, '/')) {
      thirdPartyPath += '/';
    }

    return `${protocol}//${ENDPOINT}${thirdPartyPath}${path}`;
  }

  /**
   * Sets configuration options
   */
  config(key, value) {
    const data = this._dataSetter(this.options, key, value);

    // dataSetter returns `this` when it is used as a setter
    if (data === this) {
      // clamp ping interval
      this.options[KEY_PING_INTERVAL] = Math.max(
        MIN_PING_INTERVAL,
        Math.min(this.options[KEY_PING_INTERVAL], MAX_PING_INTERVAL)
      );

      // set script wide variables for events that are bound on script load
      // since we shouldn't bind per tracker instance
      globals[KEY_OUTGOING_TRACKING] = this.options[KEY_OUTGOING_TRACKING];
      globals[KEY_OUTGOING_PAUSE] = this.options[KEY_OUTGOING_PAUSE];
      globals[KEY_DOWNLOAD_TRACKING] = this.options[KEY_DOWNLOAD_TRACKING];
      globals[KEY_DOWNLOAD_PAUSE] = this.options[KEY_DOWNLOAD_PAUSE];
      globals[KEY_AUTO_DECORATE] =
        isUndefined(globals[KEY_AUTO_DECORATE]) &&
        this.options[KEY_CROSS_DOMAIN]
          ? this.options[KEY_CROSS_DOMAIN]
          : globals[KEY_AUTO_DECORATE];
      globals[KEY_OUTGOING_IGNORE_SUBDOMAIN] = this.options[
        KEY_OUTGOING_IGNORE_SUBDOMAIN
      ];

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
  visit(key, value) {
    return this._dataSetter(this.sessionData, key, value);
  }

  /**
   * Attach custom visitor data
   */
  identify(key, value) {
    return this._dataSetter(this.visitorData, key, value);
  }

  /**
   * Generic method to call any tracker method
   */
  call(funcName) {
    if (isFunction(this[funcName])) {
      this[funcName].apply(this, Array.prototype.slice.call(arguments, 1));
    }
  }

  /**
   * Send an event to tracking servr
   */
  track(name, options) {
    let eventData = {};
    let eventName = '';
    let hash;
    let callback;
    let _cb = arguments[arguments.length - 1];

    if (typeof _cb === 'function') {
      callback = _cb;
    }

    // Load campaign params (load first to allow overrides)
    if (!this.config(KEY_CAMPAIGN_ONCE) || !this.sentCampaign) {
      eventData = { ...eventData, ...Woopra.getCampaignData() };
      this.sentCampaign = true;
    }

    // Load query params mapping into Woopra event
    eventData = {
      ...eventData,
      ...Woopra.mapQueryParams(this.config(KEY_MAP_QUERY_PARAMS))
    };

    if (isFunction(_cb)) {
      callback = _cb;
    }

    // Track default: pageview
    if (isUndefined(name) || name === callback) {
      eventName = KEY_ACTION_PV;
    }
    // Track custom events
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
    }
    // Track custom events in format of name,object
    else {
      this._dataSetter(eventData, options);
      eventName = name;
    }

    // Add some defaults for pageview
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
      eventName,
      eventData,
      callback
    });

    this.startPing();
  }

  /**
   * Tracks a single form and then resubmits it
   */
  trackForm(eventName = 'Tracked Form', selector, options) {
    let els;
    const _options =
      typeof selector === 'string' ? options || {} : selector || {};

    const bindEl = (el, ev, props, opts) => {
      attachEvent(el, 'submit', (e) => {
        this.trackFormHandler(e, el, ev, _options);
      });
    };

    if (_options.elements) {
      els = _options.elements;
    } else {
      els = getElement(selector, _options);
    }

    // attach event if form was found
    if (els && els.length > 0) {
      for (let i in els) {
        bindEl(els[i], eventName, _options);
      }
    }
  }

  trackFormHandler(e, el, eventName, options = {}) {
    let trackFinished = false;

    if (!el.getAttribute('data-tracked')) {
      const data = Woopra.serializeForm(el, options);

      if (isFunction(options.identify)) {
        const personData = options.identify(data) || {};

        if (personData) {
          this.identify(personData);
        }
      }

      if (options.noSubmit) {
        this.track(eventName, data, () => {
          if (isFunction(options.callback)) {
            options.callback(data);
          }
        });
      } else {
        e.preventDefault();
        e.stopPropagation();

        el.setAttribute('data-tracked', 1);

        // submit the form if the reply takes less than 250ms
        this.track(eventName, data, () => {
          trackFinished = true;

          if (isFunction(options.callback)) {
            options.callback(data);
          }

          el.submit();
        });

        // set timeout to resubmit to be a hard 250ms
        // so even if woopra does not reply it will still
        // submit the form
        setTimeout(() => {
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
  trackClick(eventName = 'Item Clicked', selector, properties, options = {}) {
    let els = [];

    const bindEl = (el, ev, props, opts) => {
      attachEvent(el, KEY_EVENT_CLICK, (e) => {
        this.trackClickHandler(e, el, ev, props, opts);
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
      for (let i = 0; i < els.length; i++) {
        bindEl(els[i], eventName, properties, options);
      }
    }
  }

  trackClickHandler(e, el, eventName, properties, options) {
    let trackFinished = false;

    if (!el.getAttribute('data-tracked')) {
      if (options.noNav) {
        this.track(eventName, properties);
      } else {
        e.preventDefault();

        el.setAttribute('data-tracked', 1);

        this.track(eventName, properties, () => {
          trackFinished = true;

          if (isFunction(options.callback)) {
            options.callback();
          }

          el.click();
        });

        setTimeout(() => {
          if (!trackFinished) {
            el.click();
          }
        }, 250);
      }
    }
  }

  startPing() {
    if (isUndefined(this.pingInterval)) {
      this.pingInterval = setInterval(() => {
        this.ping();
      }, this.config(KEY_PING_INTERVAL));
    }
  }

  stopPing() {
    if (!isUndefined(this.pingInterval)) {
      clearInterval(this.pingInterval);
      delete this.pingInterval;
    }
  }

  /**
   * Pings tracker with visitor info
   */
  ping() {
    if (this.config(KEY_PING) && this.idle < this.config(KEY_IDLE_TIMEOUT)) {
      this._push({
        endpoint: 'ping'
      });
    } else {
      this.stopPing();
    }

    const now = new Date();
    if (now - this.last_activity > this.config(KEY_IDLE_THRESHOLD)) {
      this.idle = now - this.last_activity;
    }

    return this;
  }

  /**
   * Pushes visitor data to server without sending an event
   */
  push(callback) {
    this._push({
      endpoint: 'identify',
      visitorData: this.visitorData,
      sessionData: this.sessionData,
      callback
    });
    return this;
  }

  /**
   * synchronous sleep
   */
  sleep() {
    // Why does this exist?
  }

  // User Action tracking and event handlers

  /**
   * Clicks
   */

  /**
   * Measure when the user last moved their mouse to update idle state
   */
  moved(e, last_activity) {
    this.last_activity = last_activity;
    this.idle = 0;
  }

  downloaded(url) {
    this.track(KEY_EVENT_DOWNLOAD, {
      url
    });
  }

  outgoing(url) {
    this.track(KEY_EVENT_OUTGOING, {
      url
    });
  }

  /**
   * Event handler for decorating an element with a URL (for now only
   * anchor tags)
   */
  autoDecorate(elem) {
    const xdm = this.config(KEY_CROSS_DOMAIN);

    if (!xdm) return;

    let canDecorate;

    if (typeof xdm === 'string') {
      canDecorate = elem.hostname.indexOf(xdm) > -1;
    } else if (xdm.push) {
      for (let i = 0; i < xdm.length; i++) {
        if (elem.hostname.indexOf(xdm[i]) !== -1) {
          canDecorate = true;
          break;
        }
      }
    }

    if (canDecorate) {
      const decorated = this.decorate(elem);

      if (decorated) {
        elem.href = decorated;
        // bind an event handler on mouseup to remove the url
      }
    }
  }

  /**
   * Resets cookie
   */
  reset() {
    Woopra.docCookies.removeItem(
      this.config(KEY_COOKIE_NAME),
      this.config(KEY_COOKIE_PATH),
      this.config(KEY_COOKIE_DOMAIN)
    );
    this.cookie = null;
    this._setupCookie();
  }

  /**
   * Decorates a given URL with a __woopraid query param with value of
   * the current cookie
   */
  decorate(url) {
    let el;
    let query;
    let pathname;
    let host;

    if (typeof url === 'string') {
      el = document.createElement('a');
      el.href = url;
      query = el.search ? '&' : '?';
    } else if (url && url.href) {
      el = url;
    }

    if (el) {
      query = el.search ? '&' : '?';
      pathname =
        el.pathname && el.pathname.charAt(0) === '/'
          ? el.pathname
          : '/' + el.pathname;

      host =
        el.hostname +
        (el.port && el.port !== '' && el.port !== '80' && el.port !== '0'
          ? ':' + el.port
          : '');

      return `${el.protocol}//${host}${pathname}${el.search}${query}${XDM_PARAM_NAME}=${this.cookie}${el.hash}`;
    }
  }

  /**
   * Undecorates a URL with __woopraid query param
   */
  undecorate(url) {
    const regex = new RegExp(`[?&]+(?:${XDM_PARAM_NAME})=([^&#]*)`, 'gi');
    let _url = url;

    if (url && url.href) {
      _url = url.href;
    }

    if (_url) {
      return _url.replace(regex, '');
    }
  }

  getPageUrl() {
    if (this.config(KEY_IGNORE_QUERY_URL)) {
      return Woopra.location('pathname');
    }
    return `${Woopra.location('pathname')}${Woopra.location('search')}`;
  }

  getPageHash() {
    return Woopra.location('hash');
  }

  getPageTitle() {
    return document.getElementsByTagName('title').length === 0
      ? ''
      : document.getElementsByTagName('title')[0].innerHTML;
  }

  getDomainName() {
    return Woopra.location('hostname');
  }

  getURI() {
    return Woopra.location('href');
  }

  /**
   * Retrieves a Woopra unique id from a URL's query param (__woopraid)
   *
   * @param {String} href The full URL to extract from
   */
  getUrlId(href = Woopra.location('href')) {
    const matches = href.match(URL_ID_REGEX);

    if (matches && matches[1]) {
      return matches[1];
    }
  }

  getOptionParams() {
    // default params
    const o = {
      project: this.config(KEY_DOMAIN) || Woopra.getHostnameNoWww(),
      instance: this.instanceName,
      meta: Woopra.docCookies.getItem('wooMeta') || '',
      screen: `${window.screen.width}x${window.screen.height}`,
      language:
        window.navigator.browserLanguage || window.navigator.language || '',
      app: this.config(KEY_APP),
      referer: document.referrer
    };

    if (!this.config(KEY_DOMAIN)) {
      o._warn = 'no_domain';

      if (Woopra.getHostnameNoWww() !== Woopra.getDomain()) {
        o._warn += ',domain_mismatch';
      }
    }

    // set cookie if configured
    if (this.config(KEY_USE_COOKIES)) {
      o.cookie = this.getCookie() || this.cookie;
    }

    // set ip if configured
    if (this.config(KEY_IP)) {
      o.ip = this.config(KEY_IP);
    }

    return o;
  }

  /**
   * Stop ping timers and cleanup any globals.  Shouldn't really
   * be needed by clients.
   */
  dispose() {
    this.stopPing();

    for (let id in this.__l) {
      if (this.__l.hasOwnProperty(id)) {
        removeHandler(id, this.instanceName);
      }
    }
    this.__l = null;

    // cleanup global
    if (!isUndefined(window[this.instanceName])) {
      try {
        delete window[this.instanceName];
      } catch (e) {
        window[this.instanceName] = undefined;
      }
    }
  }
}
