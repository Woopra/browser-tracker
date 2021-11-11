import {
  isArray,
  isFunction,
  isObject,
  isString,
  isUndefined,
  noop
} from 'lodash-es';
import WoopraAction from './action';
import {
  ACTION_PROPERTY_ALIASES,
  ACTION_PROPERTY_PREFIX,
  ACTION_PV,
  DATA_TRACKED_ATTRIBUTE,
  DEFAULT_DOWNLOAD_EXTENSIONS,
  ELEMENT_MATCHER_CLICK,
  ENDPOINT,
  ENDPOINT_IDENTIFY,
  ENDPOINT_TRACK,
  ENDPOINT_UPDATE,
  EVENT_CLICK,
  EVENT_DOWNLOAD,
  EVENT_LINK_CLICK,
  EVENT_MOUSEMOVE,
  EVENT_OUTGOING,
  EVENT_SCROLL,
  EVENT_STATECHANGE,
  IDPTNC,
  KEY_APP,
  KEY_AUTO_DECORATE,
  KEY_BEACONS,
  KEY_CAMPAIGN_ONCE,
  KEY_CLICK_PAUSE,
  KEY_CLICK_TRACKING,
  KEY_CONTEXT,
  KEY_COOKIE_DOMAIN,
  KEY_COOKIE_EXPIRE,
  KEY_COOKIE_NAME,
  KEY_COOKIE_PATH,
  KEY_CROSS_DOMAIN,
  KEY_DOMAIN,
  KEY_DOWNLOAD_EXTENSIONS,
  KEY_DOWNLOAD_PAUSE,
  KEY_DOWNLOAD_TRACKING,
  KEY_FORM_PAUSE,
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
  LIFECYCLE_ACTION,
  LIFECYCLE_PAGE,
  MAX_PING_INTERVAL,
  META_CANCELLED,
  META_DIRTY,
  META_DURATION,
  META_EXPIRED,
  META_LEAVE,
  META_RETRACK,
  META_SENT,
  META_TIMESTAMP,
  MIN_PING_INTERVAL,
  PAGE_LIFECYCLE_STATE_ACTIVE,
  PAGE_LIFECYCLE_STATE_HIDDEN,
  PAGE_LIFECYCLE_STATE_PASSIVE,
  PAGE_LIFECYCLE_STATE_TERMINATED,
  SCROLL_DEPTH,
  TARGET_BLANK,
  URL_ID_REGEX,
  VERSION,
  VISITOR_PROPERTY_PREFIX,
  VISIT_PROPERTY_PREFIX,
  XDM_PARAM_NAME
} from './constants';
import globals from './globals';
import { addEventListener, on, removeHandler } from './lib/events';
import {
  callCallback,
  findParentElement,
  getDOMPath,
  getElement,
  getScrollDepth,
  hasBeaconSupport,
  prefixObjectKeys,
  randomString
} from './lib/utils';
import Woopra from './woopra';

const fire = Woopra._fire;

export default class Tracker {
  constructor(instanceName) {
    this.visitorData = {};
    this.sessionData = {};

    this.options = {
      [KEY_APP]: 'js-client',
      [KEY_BEACONS]: hasBeaconSupport(),
      [KEY_CAMPAIGN_ONCE]: false,
      [KEY_COOKIE_DOMAIN]: `.${Woopra.getHostnameNoWww()}`,
      [KEY_COOKIE_EXPIRE]: new Date(
        new Date().setDate(new Date().getDate() + 730)
      ),
      [KEY_COOKIE_NAME]: 'wooTracker',
      [KEY_COOKIE_PATH]: '/',
      [KEY_CROSS_DOMAIN]: false,
      [KEY_DOWNLOAD_EXTENSIONS]: DEFAULT_DOWNLOAD_EXTENSIONS,
      [KEY_DOWNLOAD_PAUSE]: 200,
      [KEY_DOWNLOAD_TRACKING]: false,
      [KEY_HIDE_CAMPAIGN]: false,
      [KEY_HIDE_XDM_DATA]: false,
      [KEY_IDLE_THRESHOLD]: 10 * 1_000,
      [KEY_IDLE_TIMEOUT]: 60 * 10 * 1_000,
      [KEY_IGNORE_QUERY_URL]: false,
      [KEY_MAP_QUERY_PARAMS]: {},
      [KEY_OUTGOING_IGNORE_SUBDOMAIN]: true,
      [KEY_OUTGOING_PAUSE]: 200,
      [KEY_OUTGOING_TRACKING]: false,
      [KEY_PERSONALIZATION]: true,
      [KEY_PING_INTERVAL]: 12 * 1_000,
      [KEY_PING]: false,
      [KEY_PROTOCOL]: 'https',
      [KEY_SAVE_URL_HASH]: true,
      [KEY_THIRD_PARTY]: false,
      [KEY_CLICK_PAUSE]: 250,
      [KEY_FORM_PAUSE]: 250,
      [KEY_USE_COOKIES]: true
    };

    this.instanceName = instanceName || 'woopra';
    this.idle = 0;
    this.cookie = '';
    this.last_activity = Date.now();
    this.loaded = false;
    this.dirtyCookie = false;
    this.sentCampaign = false;
    this.version = VERSION;
    this.pending = [];
    this.beaconQueue = [];
    this.lastAction = null;

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
    on(this, EVENT_CLICK, (e) => this.onClick(e));
    on(this, EVENT_DOWNLOAD, (url) => this.downloaded(url));
    on(this, EVENT_LINK_CLICK, (e, link) => this.onLink(e, link));
    on(this, EVENT_MOUSEMOVE, (e, l) => this.moved(e, l));
    on(this, EVENT_OUTGOING, (url) => this.outgoing(url));
    on(this, EVENT_SCROLL, (elem) => this.onScroll(elem));
    on(this, EVENT_STATECHANGE, (e) => this.onPageStateChange(e));
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
      if (isString(key)) {
        return dataStore[key];
      }
      if (isObject(key)) {
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
      globals[KEY_DOWNLOAD_TRACKING] = this.options[KEY_DOWNLOAD_TRACKING];
      globals[KEY_AUTO_DECORATE] =
        isUndefined(globals[KEY_AUTO_DECORATE]) &&
        this.options[KEY_CROSS_DOMAIN]
          ? this.options[KEY_CROSS_DOMAIN]
          : globals[KEY_AUTO_DECORATE];
      globals[KEY_OUTGOING_IGNORE_SUBDOMAIN] =
        this.options[KEY_OUTGOING_IGNORE_SUBDOMAIN];

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
   * Builds the correct tracking Url and performs an HTTP request
   */
  _push(options = {}) {
    const types = [
      ['visitorData', VISITOR_PROPERTY_PREFIX],
      ['eventData', ACTION_PROPERTY_PREFIX],
      ['sessionData', VISIT_PROPERTY_PREFIX]
    ];

    let data = {};

    const endpoint = this.getEndpoint(options.endpoint);
    const lifecycle = options.lifecycle || LIFECYCLE_ACTION;

    // Load custom visitor params from url
    this.getVisitorUrlData();

    if (this.config(KEY_HIDE_CAMPAIGN)) {
      Woopra.hideCampaignData();
    }

    // push tracker config values
    this._dataSetter(data, this.getOptionParams());

    // push eventName if it exists
    if (options.eventName) {
      data.event = options.eventName;
    }

    // push close if no personalization
    if (!this.config(KEY_PERSONALIZATION)) {
      data.close = true;
    }

    data.timeout = isUndefined(options.timeout)
      ? this.config(KEY_IDLE_TIMEOUT)
      : options.timeout;

    const rawData = {};

    for (const [original, alias] of ACTION_PROPERTY_ALIASES) {
      if (options.eventData && options.eventData[original]) {
        rawData[alias] = options.eventData[original];
      }
    }

    this._dataSetter(data, rawData);

    for (let i = 0; i < types.length; i++) {
      const [key, prefix] = types[i];

      this._dataSetter(
        data,
        prefixObjectKeys(
          options[key],
          prefix,
          prefix === ACTION_PROPERTY_PREFIX ? ACTION_PROPERTY_ALIASES : []
        )
      );
    }

    if (this.config(KEY_CONTEXT)) {
      try {
        var contextData = JSON.stringify(this.config(KEY_CONTEXT));
        data[KEY_CONTEXT] = encodeURIComponent(contextData);
      } catch (e) {}
    }

    if (options.fullEventData) data = options.fullEventData;

    const dirty = Boolean(options.useBeacon || this.isUnloading);

    const meta = {
      [META_DIRTY]: dirty,
      [META_DURATION]: 0,
      [META_RETRACK]: Boolean(options.retrack),
      [META_SENT]: !dirty,
      [META_TIMESTAMP]: Date.now()
    };

    const action = new WoopraAction(this, data[IDPTNC], data, meta);

    const callback = isFunction(options.callback)
      ? () => options.callback(action)
      : noop;
    const beforeCallback = isFunction(options.beforeCallback)
      ? () => options.beforeCallback(action)
      : noop;
    const errorCallback = options.errorCallback || noop;

    if (lifecycle === LIFECYCLE_PAGE || options.useBeacon || this.isUnloading) {
      this.pending.push({
        lifecycle,
        endpoint: options.endpoint,
        params: data,
        args: options,
        meta,
        callback,
        errorCallback
      });
    }

    if (lifecycle !== LIFECYCLE_PAGE && options.endpoint === ENDPOINT_TRACK) {
      this.lastAction = action;
    }

    if (this.isUnloading || (options.useBeacon && !options.queue)) {
      this.sendBeacons();
    } else {
      const queryString = Woopra.buildUrlParams(data);
      const scriptUrl = `${endpoint}?${queryString}`;

      const onSuccess = () => callCallback(callback, data.event);
      const onError = () => callCallback(errorCallback, data.event);

      Woopra.loadScript(scriptUrl, onSuccess, onError);
    }

    setTimeout(() => callCallback(beforeCallback, data.event));
  }

  /**
   * Send an event to tracking servr
   */
  track(name, options) {
    let eventData = {};
    let eventName = '';
    let hash;
    let callback;
    let beforeCallback;
    let errorCallback;
    let lastArg = arguments[arguments.length - 1];
    let lifecycle = LIFECYCLE_ACTION;
    let queue = false;
    let useBeacon = false;
    let timeout;
    let retrack;

    if (isFunction(lastArg)) callback = lastArg;
    else if (isObject(lastArg)) {
      if (isFunction(lastArg.callback)) callback = lastArg.callback;
      else if (isFunction(lastArg.onSuccess)) callback = lastArg.onSuccess;
      if (isFunction(lastArg.onBeforeSend))
        beforeCallback = lastArg.onBeforeSend;
      if (isFunction(lastArg.onError)) errorCallback = lastArg.onError;

      if (!isUndefined(lastArg.lifecycle)) lifecycle = lastArg.lifecycle;
      if (!isUndefined(lastArg.timeout)) timeout = lastArg.timeout;
      if (!isUndefined(lastArg.retrack)) retrack = lastArg.retrack;

      if (this.config(KEY_BEACONS)) {
        if (!isUndefined(lastArg.queue)) queue = Boolean(lastArg.queue);

        if (!isUndefined(lastArg.useBeacon)) {
          useBeacon = Boolean(lastArg.useBeacon);
        } else if (queue) useBeacon = true;
      } else {
        useBeacon = false;
      }
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

    // Track default: pageview
    if (isUndefined(name) || name === callback) {
      eventName = ACTION_PV;
    }
    // Track custom events
    else if (isUndefined(options) || options === callback) {
      if (isString(name)) {
        eventName = name;
      }
      if (isObject(name)) {
        if (name.name && name.name === ACTION_PV) {
          eventName = ACTION_PV;
        }

        this._dataSetter(eventData, name);
      }
    }
    // Track custom events in format of name,object
    else {
      this._dataSetter(eventData, options);
      eventName = name;
    }

    eventData[IDPTNC] = randomString();

    // Add some defaults for pageview
    if (eventName === ACTION_PV) {
      eventData.url = eventData.url || this.getPageUrl();
      eventData.title = eventData.title || this.getPageTitle();
      eventData.domain = eventData.domain || this.getDomainName();
      eventData.uri = eventData.uri || this.getURI();
      eventData[SCROLL_DEPTH] = getScrollDepth();
      eventData.returning = isUndefined(eventData.returning)
        ? false
        : eventData.returning;

      if (!lastArg || !lastArg.lifecycle) lifecycle = LIFECYCLE_PAGE;

      if (this.config(KEY_SAVE_URL_HASH)) {
        hash = eventData.hash || this.getPageHash();
        if (hash !== '' && hash !== '#') {
          eventData.hash = hash;
        }
      }
    }

    this._push({
      endpoint: ENDPOINT_TRACK,
      visitorData: this.visitorData,
      sessionData: this.sessionData,
      eventName,
      eventData,
      lifecycle,
      callback,
      beforeCallback,
      errorCallback,
      queue,
      useBeacon,
      retrack,
      timeout
    });

    this.startPing();

    return this;
  }

  update(idptnc, options, lastArg) {
    let callback;
    let beforeCallback;
    let errorCallback;
    let queue = false;
    let useBeacon = true;

    if (isFunction(lastArg)) callback = lastArg;
    else if (isObject(lastArg)) {
      if (isFunction(lastArg.callback)) callback = lastArg.callback;
      else if (isFunction(lastArg.onSuccess)) callback = lastArg.onSuccess;
      if (isFunction(lastArg.onBeforeSend))
        beforeCallback = lastArg.onBeforeSend;
      if (isFunction(lastArg.onError)) errorCallback = lastArg.onError;

      if (this.config(KEY_BEACONS)) {
        if (!isUndefined(lastArg.queue)) queue = Boolean(lastArg.queue);

        if (!isUndefined(lastArg.useBeacon)) {
          useBeacon = Boolean(lastArg.useBeacon);
        } else if (queue) useBeacon = true;
      } else {
        useBeacon = false;
      }
    }

    const eventData = {
      [IDPTNC]: idptnc,
      project: this.config(KEY_DOMAIN) || Woopra.getHostnameNoWww()
    };

    const rawData = {};

    for (const [original, alias] of ACTION_PROPERTY_ALIASES) {
      if (options && options[original]) {
        rawData[alias] = options[original];
      }
    }

    if (this.config(KEY_USE_COOKIES)) {
      rawData.cookie = this.getCookie() || this.cookie;
    }

    this._dataSetter(eventData, rawData);

    this._dataSetter(
      eventData,
      prefixObjectKeys(options, ACTION_PROPERTY_PREFIX, ACTION_PROPERTY_ALIASES)
    );

    this._push({
      endpoint: ENDPOINT_UPDATE,
      fullEventData: eventData,
      callback,
      beforeCallback,
      errorCallback,
      queue,
      useBeacon
    });

    return this;
  }

  cancelAction(idptnc) {
    let hasCancelled = false;

    if (this.lastAction?.id === idptnc) {
      this.lastAction = null;
    }

    this.pending = this.pending.map((item) => {
      if (item.params[IDPTNC] === idptnc) {
        hasCancelled = true;

        return {
          ...item,
          meta: {
            ...item.meta,
            [META_CANCELLED]: true,
            [META_DIRTY]: true,
            [META_DURATION]:
              item.lifecycle === LIFECYCLE_PAGE
                ? item.meta[META_DURATION] +
                  (Date.now() - item.meta[META_TIMESTAMP])
                : item.meta[META_DURATION],
            [META_RETRACK]: false
          }
        };
      }

      return item;
    });

    if (hasCancelled) {
      this.sendBeacons();
    }
  }

  /**
   * Tracks a single form and then resubmits it
   */
  trackForm(eventName = 'Tracked Form', selector, options) {
    let els;
    const _options = isString(selector) ? options || {} : selector || {};

    const bindEl = (el, ev, props, opts) => {
      addEventListener(el, 'submit', (e) => {
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

    if (!el.getAttribute(DATA_TRACKED_ATTRIBUTE)) {
      const useBeacon = Boolean(this.config(KEY_BEACONS));

      const properties = Woopra.serializeForm(el, options);

      if (isFunction(options.identify)) {
        const personData = options.identify(properties) || {};

        if (personData) {
          this.identify(personData);
        }
      }

      const onBeforeSend = isFunction(options.onBeforeSend)
        ? options.onBeforeSend
        : undefined;
      const onSuccess = isFunction(options.callback)
        ? () => options.callback(properties)
        : undefined;
      const onError = isFunction(options.onError) ? options.onError : undefined;

      if (!options.noSubmit) el.setAttribute(DATA_TRACKED_ATTRIBUTE, 1);

      if (options.noSubmit || useBeacon) {
        this.track(eventName, properties, {
          onBeforeSend,
          onError,
          onSuccess,
          useBeacon
        });
      } else {
        e.preventDefault();
        e.stopPropagation();

        // set timeout to resubmit (default 250ms)
        // so even if woopra does not reply it will still
        // submit the form
        const timer = setTimeout(() => {
          if (!trackFinished) {
            el.submit();
          }
        }, this.config(KEY_FORM_PAUSE));

        this.track(eventName, properties, {
          onBeforeSend,
          onSuccess() {
            clearTimeout(timer);

            if (onSuccess) onSuccess();

            if (!trackFinished) el.submit();

            trackFinished = true;
          },
          onError
        });
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
      addEventListener(el, EVENT_CLICK, (e) => {
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

    if (!el.getAttribute(DATA_TRACKED_ATTRIBUTE)) {
      const useBeacon = Boolean(this.config(KEY_BEACONS));

      const onBeforeSend = isFunction(options.onBeforeSend)
        ? options.onBeforeSend
        : undefined;
      const onSuccess = isFunction(options.callback)
        ? () => options.callback(properties)
        : undefined;
      const onError = isFunction(options.onError) ? options.onError : undefined;

      if (!options.noNav) el.setAttribute(DATA_TRACKED_ATTRIBUTE, 1);

      if (options.noNav || useBeacon) {
        this.track(eventName, properties, {
          onBeforeSend,
          onError,
          onSuccess,
          useBeacon
        });
      } else {
        e.preventDefault();

        // set timeout to resubmit (default 250ms)
        // so even if woopra does not reply it will still
        // click the link
        const timer = setTimeout(() => {
          if (!trackFinished) {
            el.click();
          }
        }, this.config(KEY_CLICK_PAUSE));

        this.track(eventName, properties, {
          onBeforeSend,
          onSuccess() {
            clearTimeout(timer);

            if (onSuccess) onSuccess();

            if (!trackFinished) el.click();

            trackFinished = true;
          },
          onError
        });
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
      // this._push({
      //   endpoint: 'ping'
      // });
    } else {
      this.stopPing();
    }

    const now = Date.now();
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
      endpoint: ENDPOINT_IDENTIFY,
      visitorData: this.visitorData,
      sessionData: this.sessionData,
      callback
    });

    this.sendBeacons();

    return this;
  }

  _updateDurations(oldState, newState) {
    const now = Date.now();

    function updateDuration(item) {
      switch (newState) {
        case PAGE_LIFECYCLE_STATE_ACTIVE:
        case PAGE_LIFECYCLE_STATE_PASSIVE:
          if (now - item.meta[META_LEAVE] > item.params.timeout) {
            return {
              [META_EXPIRED]: true
            };
          }

          if (
            (newState === PAGE_LIFECYCLE_STATE_ACTIVE &&
              oldState === PAGE_LIFECYCLE_STATE_PASSIVE) ||
            (newState === PAGE_LIFECYCLE_STATE_PASSIVE &&
              oldState === PAGE_LIFECYCLE_STATE_ACTIVE)
          ) {
            return {};
          }

          return {
            [META_TIMESTAMP]: now
          };

        case PAGE_LIFECYCLE_STATE_HIDDEN:
          return {
            [META_DIRTY]:
              item.meta[META_DIRTY] || now - item.meta[META_TIMESTAMP] > 100,
            [META_DURATION]:
              item.meta[META_DURATION] + (now - item.meta[META_TIMESTAMP]),
            [META_LEAVE]: now
          };

        case PAGE_LIFECYCLE_STATE_TERMINATED:
          return {
            [META_DIRTY]:
              item.meta[META_DIRTY] || now - item.meta[META_LEAVE] > 100
          };

        default:
          return {};
      }
    }

    this.pending = this.pending.map((item) => {
      if (item.lifecycle !== LIFECYCLE_PAGE) return item;

      return {
        ...item,
        meta: {
          ...item.meta,
          ...updateDuration(item)
        }
      };
    });

    if (this.lastAction) {
      this.lastAction = {
        ...this.lastAction,
        meta: {
          ...this.lastAction.meta,
          ...updateDuration(this.lastAction)
        }
      };
    }
  }

  _processLifecycle(lifecycle) {
    const toRetrack = [];

    this.pending.forEach((item) => {
      if (
        item.meta[META_EXPIRED] &&
        !item.meta[META_CANCELLED] &&
        item.meta[META_RETRACK]
      ) {
        toRetrack.push({
          ...item.args,
          eventData: {
            ...(item.args.eventData || {}),
            [IDPTNC]: randomString(),
            returning: true
          }
        });
      }
    });

    toRetrack.forEach((item) => this._push(item));

    this.pending = this.pending.filter((item) => {
      if (item.meta[META_EXPIRED]) return false;

      if (item.meta[META_DIRTY]) {
        this.beaconQueue.push({
          lifecycle: item.lifecycle,
          endpoint: item.endpoint,
          params: {
            ...item.params
          },
          meta: {
            ...item.meta
          },
          successCallback: item.callback,
          errorCallback: item.errorCallback
        });
      }

      if (item.meta[META_CANCELLED]) return false;

      if (item.lifecycle === LIFECYCLE_PAGE && lifecycle !== LIFECYCLE_PAGE) {
        return true;
      }

      return false;
    });

    this.pending = this.pending.map((item) => ({
      ...item,
      meta: {
        ...item.meta,
        [META_DIRTY]: false,
        [META_SENT]: true
      }
    }));

    if (lifecycle === LIFECYCLE_PAGE && this.lastAction) {
      this.beaconQueue.push({
        lifecycle: LIFECYCLE_PAGE,
        endpoint: ENDPOINT_TRACK,
        params: {
          ...this.lastAction.params
        },
        meta: {
          ...this.lastAction.meta,
          [META_SENT]: true
        }
      });
    }

    return toRetrack.length > 0;
  }

  _drainBeaconQueue() {
    const useCookies = this.config(KEY_USE_COOKIES);

    function isEmptyBeaconParams(params) {
      const { [IDPTNC]: id, cookie, project, event, ...rest } = params;

      return Object.keys(rest).length > 0;
    }

    const idMap = this.beaconQueue.reduce((idMap, item) => {
      idMap[item.params[IDPTNC]] = [];

      return idMap;
    }, {});

    this.beaconQueue.forEach((item) => {
      idMap[item.params[IDPTNC]].push(item);
    });

    this.beaconQueue = [];

    const toSend = Object.keys(idMap)
      .map((id) => {
        const items = idMap[id];

        const data = {
          endpoint: undefined,
          params: {},
          onSuccess: [],
          onError: []
        };

        items.forEach((item) => {
          if (!data.endpoint) {
            if (item.endpoint === ENDPOINT_TRACK && item.meta[META_SENT]) {
              data.endpoint = ENDPOINT_UPDATE;
            } else {
              data.endpoint = item.endpoint;
            }
          }

          data.params.project = item.params.project;
          data.params.event = item.params.event;
          data.params[IDPTNC] = item.params[IDPTNC];

          if (useCookies) {
            data.params.cookie = this.getCookie() || this.cookie;
          }

          if (
            (item.lifecycle === LIFECYCLE_PAGE ||
              item.params[IDPTNC] === this.lastAction?.id) &&
            item.meta[META_DURATION] > 0
          ) {
            data.params.duration = item.meta[META_DURATION];
          }

          if (item.meta[SCROLL_DEPTH]) {
            data.params[`${ACTION_PROPERTY_PREFIX}${SCROLL_DEPTH}`] =
              Math.round(item.meta[SCROLL_DEPTH] * 10_000) / 10_000;
          }

          if (!item.meta[META_SENT]) {
            data.params = { ...data.params, ...item.params };

            if (isFunction(item.successCallback)) {
              data.onSuccess.push(item.successCallback);
            }

            if (isFunction(item.errorCallback)) {
              data.onError.push(item.errorCallback);
            }
          }
        });

        if (!data.params.project) {
          data.params.project =
            this.config(KEY_DOMAIN) || Woopra.getHostnameNoWww();
        }

        return data;
      })
      .filter((item) => isEmptyBeaconParams(item.params));

    if (toSend.length > 0) {
      if (this.config(KEY_BEACONS)) {
        const payloads = [''];

        const lines = toSend.map(({ endpoint, params }) =>
          JSON.stringify({ endpoint, params })
        );

        // chunk beacons into < 64 KiB chunks
        lines.forEach((line) => {
          if (
            new Blob([`${payloads[payloads.length - 1]}${line}`]).size >= 65_000
          ) {
            payloads.push('');
          }
          payloads[payloads.length - 1] += `${line}\n`;
        });

        payloads.forEach((payload, index) => {
          const formData = new FormData();

          formData.append('payload', payload.slice(0, -1));

          navigator.sendBeacon.call(
            navigator,
            this.getEndpoint('push'),
            formData
          );
        });

        toSend.forEach((item) => {
          item.onSuccess.forEach((callback) =>
            callCallback(callback, item.params.event)
          );
        });
      } else {
        toSend.forEach((item) => {
          const endpoint = this.getEndpoint(item.endpoint);

          const queryString = Woopra.buildUrlParams({
            close: true,
            ...item.params
          });
          const scriptUrl = `${endpoint}?${queryString}`;

          const onSuccess = () =>
            item.onSuccess.forEach((callback) =>
              callCallback(callback, item.params.event)
            );
          const onError = () =>
            item.onError.forEach((callback) =>
              callCallback(callback, item.params.event)
            );

          Woopra.loadScript(scriptUrl, onSuccess, onError);
        });
      }
    }
  }

  sendBeacons(lifecycle = LIFECYCLE_ACTION) {
    this._processLifecycle(lifecycle);
    this._drainBeaconQueue();
  }

  /**
   * synchronous sleep
   */
  sleep() {
    // Why does this exist?
  }

  _touch(last_activity = Date.now()) {
    this.last_activity = last_activity;
    this.idle = 0;
  }

  // User Action tracking and event handlers

  /**
   * Clicks
   */

  /**
   * Measure when the user last moved their mouse to update idle state
   */
  moved(e, last_activity) {
    this._touch(last_activity);
  }

  onClick(e) {
    if (!this.config(KEY_CLICK_TRACKING)) return;

    const useBeacon = Boolean(this.config(KEY_BEACONS));

    const { target } = e;

    const clickTarget = findParentElement(target, ELEMENT_MATCHER_CLICK);

    if (clickTarget) {
      const tagName = clickTarget.tagName.toLowerCase();

      const properties = {
        'page url': this.getPageUrl(),
        'page title': this.getPageTitle(),
        text:
          clickTarget.innerText || clickTarget.value || clickTarget.textContent,
        title: clickTarget.textContent,
        type: tagName === 'a' ? 'link' : clickTarget.type,
        tagname: tagName,
        classname: clickTarget.className,
        'dom path': getDOMPath(clickTarget),
        url: clickTarget.href
      };

      if (this.config(KEY_SAVE_URL_HASH)) {
        const hash = this.getPageHash();

        if (hash !== '' && hash !== '#') {
          properties['page hash'] = hash;
        }
      }

      this.track('button click', properties, {
        useBeacon
      });
    }
  }

  onLink(e, link) {
    const useBeacon = Boolean(this.config(KEY_BEACONS));
    const downloadTypes = this.config(KEY_DOWNLOAD_EXTENSIONS);

    const downloadFileTypeRegexp = new RegExp(
      `(?:${downloadTypes.join('|')})($|\&)`,
      'i'
    );

    const isDownloadFileType = downloadFileTypeRegexp.test(link.pathname);

    if (this.config(KEY_DOWNLOAD_TRACKING) && isDownloadFileType) {
      fire(EVENT_DOWNLOAD, link.href);

      if (link.target !== TARGET_BLANK && Woopra.leftClick(e)) {
        link.setAttribute(DATA_TRACKED_ATTRIBUTE, 1);

        if (!useBeacon) {
          e.preventDefault();
          e.stopPropagation();

          setTimeout(() => {
            link.click();
          }, this.config(KEY_DOWNLOAD_PAUSE));
        }
      }
    }

    // Make sure
    // * outgoing tracking is enabled
    // * this URL does not match a download URL (doesn't end
    //   in a binary file extension)
    // * not ignoring subdomains OR link hostname is not a partial
    //   match of current hostname (to check for subdomains),
    // * hostname is not empty
    if (
      this.config(KEY_OUTGOING_TRACKING) &&
      !isDownloadFileType &&
      Woopra.isOutgoingLink(link.hostname)
    ) {
      fire(EVENT_OUTGOING, link.href);

      if (link.target !== TARGET_BLANK && Woopra.leftClick(e)) {
        link.setAttribute(DATA_TRACKED_ATTRIBUTE, 1);

        if (!useBeacon) {
          e.preventDefault();
          e.stopPropagation();

          setTimeout(() => {
            link.click();
          }, this.config(KEY_OUTGOING_PAUSE));
        }
      }
    }
  }

  downloaded(url) {
    const useBeacon = Boolean(this.config(KEY_BEACONS));

    this.track(
      EVENT_DOWNLOAD,
      {
        url
      },
      { useBeacon }
    );
  }

  outgoing(url) {
    const useBeacon = Boolean(this.config(KEY_BEACONS));

    this.track(
      EVENT_OUTGOING,
      {
        url
      },
      { useBeacon }
    );
  }

  onUnload() {
    if (!this.isUnloading) {
      this.isUnloading = true;
      this._updateDurations(
        PAGE_LIFECYCLE_STATE_HIDDEN,
        PAGE_LIFECYCLE_STATE_TERMINATED
      );
      this.sendBeacons(LIFECYCLE_PAGE);
    }
  }

  onPageStateChange(e) {
    const { newState, oldState } = e;

    switch (newState) {
      case PAGE_LIFECYCLE_STATE_ACTIVE:
        this._updateDurations(oldState, newState);
        this.sendBeacons();
        this._touch();
        break;

      case PAGE_LIFECYCLE_STATE_PASSIVE:
        this._updateDurations(oldState, newState);
        this.sendBeacons();
        break;

      case PAGE_LIFECYCLE_STATE_HIDDEN:
        this._updateDurations(oldState, newState);
        this.sendBeacons();
        break;

      case PAGE_LIFECYCLE_STATE_TERMINATED:
        this.onUnload();
        break;
    }
  }

  onScroll(e) {
    this._touch();

    const scrollDepth = getScrollDepth();

    const pages = this.pending.filter(
      (item) => item.lifecycle === LIFECYCLE_PAGE
    );

    pages.forEach((pv) => {
      pv.meta[SCROLL_DEPTH] = Math.min(
        1,
        Math.max(scrollDepth, pv.meta[SCROLL_DEPTH] || 0)
      );
    });
  }

  /**
   * Event handler for decorating an element with a URL (for now only
   * anchor tags)
   */
  autoDecorate(elem) {
    const xdm = this.config(KEY_CROSS_DOMAIN);

    if (!xdm) return;

    const domains = isString(xdm) ? [xdm] : isArray(xdm) ? xdm : [];

    let canDecorate;

    for (let i = 0; i < domains.length; i++) {
      if (elem.hostname.indexOf(domains[i]) !== -1) {
        canDecorate = true;
        break;
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

    if (isString(url)) {
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
          : `/${el.pathname}`;

      host =
        el.hostname +
        (el.port && el.port !== '' && el.port !== '80' && el.port !== '0'
          ? `:${el.port}`
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
