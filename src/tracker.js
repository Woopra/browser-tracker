import assign from 'core-js/library/fn/object/assign';
import endsWith from 'core-js/library/fn/string/ends-with';
import startsWith from 'core-js/library/fn/string/starts-with';

import { getElement, randomString } from './lib/utils';
import * as cookies from './lib/cookies';
import { getCustomData, getHostnameNoWww, hideCrossDomainId, buildUrlParams, mapQueryParams, getDomain } from './lib/url';
import { VERSION, XDM_PARAM_NAME, ENDPOINT } from './constants';
import { on, attachEvent } from './lib/events';
import { hideCampaignData, getCampaignData } from './lib/campaign';
import { loadScript } from './lib/script';
import { serializeForm } from './lib/form';

let _auto_decorate;
let _download_pause;
let _download_tracking = false;
let _outgoing_ignore_subdomain = true;
let _outgoing_pause;
let _outgoing_tracking = false;

const urlIdRegex = new RegExp(XDM_PARAM_NAME + '=([^&#]+)');

export default class Tracker {
  constructor(instanceName) {
    this.visitorData = {};
    this.sessionData = {};
    
    this.options = {
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
      map_query_params: {},
      cookie_name: 'wooTracker',
      cookie_domain: '.' + getHostnameNoWww(),
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
  }

  init() {
    this.__l = {};
    this._processQueue('config');
    this._setupCookie();
    this._bindEvents();
    
    // Otherwise loading indicator gets stuck until the every response
    // in the queue has been received
    setTimeout(() => this._processQueue(), 1);

    const callback = this.config('initialized');

    if (callback && typeof callback === 'function') {
      callback(this.instanceName);
    }
    
    // Safe to remove cross domain url parameter after setupCookie is called
    // Should only need to be called once on load
    if (this.config('hide_xdm_data')) {
      hideCrossDomainId();
    } 
  }
  
  /**
  * Processes the tracker queue in case user tries to push events
  * before tracker is ready.
  */
  _processQueue(type) {  
    let _wpt = window.__woo ? window.__woo[this.instanceName] : _wpt;
    _wpt = window._w ? window._w[this.instanceName] : _wpt;
    
    // if _wpt is undefined, means script was loaded asynchronously and
    // there is no queue
    
    if (_wpt && _wpt._e) {
      const events = _wpt._e;
      for (let i = 0; i < events.length; i++) {
        const action = events[i];
        if (typeof action !== 'undefined' && this[action[0]] &&
        (typeof type === 'undefined' || type === action[0])) {
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
    
    cookies.setItem(
      this.config('cookie_name'),
      this.cookie,
      this.config('cookie_expire'),
      this.config('cookie_path'),
      this.config('cookie_domain')
    );
    
    this.dirtyCookie = true;
  }
  
  /**
  * Binds some events to measure mouse and keyboard events
  */
  _bindEvents() {
    on(this, 'mousemove', (...args) => this.moved(...args));
    on(this, 'keydown', (...args) => this.typed(...args));
    on(this, 'download', (...args) => this.downloaded(...args));
    on(this, 'outgoing', (...args) => this.outgoing(...args));
    on(this, 'auto_decorate', (...args) => this.autoDecorate(...args));
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
    if (typeof key === 'undefined') {
      return dataStore;
    }
    
    if (typeof value === 'undefined') {
      if (typeof key === 'string') {
        return dataStore[key];
      }
      if (typeof key === 'object') {
        for (let i in key) {
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
  }
  
  /**
  * Builds the correct tracking Url and performs an HTTP request
  */
  _push(options = {}) {
    const random = 'ra=' + randomString();

    const types = [
      ['visitorData', 'cv_'],
      ['eventData', 'ce_'],
      ['sessionData', 'cs_']
    ];

    const data = [];
    
    const endpoint = this.getEndpoint(options.endpoint);
    
    // Load custom visitor params from url
    this.getVisitorUrlData();
    
    if (this.config('hide_campaign')) {
      hideCampaignData();
    }
    
    data.push(random);
    
    // push tracker config values
    data.push(buildUrlParams(this.getOptionParams()));
    
    // push eventName if it exists
    if (options.eventName) {
      data.push('event=' + options.eventName);
    }
    
    for (let i = 0; i < types.length; i++) {
      const [ key, prefix ] = types[i];
      const params = options[key];
  
      if (params) {
        const urlParam = buildUrlParams(params, prefix);

        if (urlParam) {
          data.push(urlParam);
        }
      }
    }
    
    const queryString = '?' + data.join('&');
    const scriptUrl = endpoint + queryString;

    loadScript(scriptUrl, options.callback);
  }

  getVisitorUrlData() {
    getCustomData.call(this, this.identify, 'wv_');
  }
  
  /*
  * Returns the Woopra cookie string
  */
  getCookie() {
    return cookies.getItem(this.config('cookie_name'));
  }
  
  /**
  * Generates a destination endpoint string to use depending on different
  * configuration options
  */
  getEndpoint(path = '') {
    const protocol = this.config('protocol');
    const _protocol = protocol && protocol !== '' ? protocol + ':' : '';
    let endpoint = _protocol + '//';
    const region = this.config('region');
    let thirdPartyPath;
    
    if (this.config('third_party') && !this.config('domain')) {
      throw new Error('Error: `domain` is not set.');
    }
    
    // create endpoint, default is www.woopra.com/track/
    // China region will be cn.t.woopra.com/track
    if (region) {
      endpoint += region + '.t.';
    }
    else {
      endpoint += 'www.';
    }
    
    thirdPartyPath = this.config('third_party') ? 'tp/' + this.config('domain') : '';
    
    if (path && !endsWith(path, '/')) {
      path += '/';
    }
    
    if (thirdPartyPath && !startsWith(path, '/')) {
      thirdPartyPath += '/';
    }
    
    endpoint += ENDPOINT + thirdPartyPath + path;
    
    return endpoint;
  }
  
  /**
  * Sets configuration options
  */
  config(key, value) {
    const data = this._dataSetter(this.options, key, value);
    
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
    if (this[funcName] && typeof this[funcName] === 'function') {
      this[funcName].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    
  }
  
  /**
  * Send an event to tracking servr
  */
  track(name, options) {
    let event = {};
    let eventName = '';
    let cb;
    let _hash;
    let _cb = arguments[arguments.length - 1];
    
    // Load campaign params (load first to allow overrides)
    if (!this.config('campaign_once') || !this.sentCampaign) {
      assign(event, getCampaignData());
      this.sentCampaign = true;
    }
    
    // Load query params mapping into Woopra event
    assign(event, mapQueryParams(this.config('map_query_params')));
    
    
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
      event.domain = event.domain || this.getDomainName();
      event.uri = event.uri || this.getURI();
      
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
  }
  
  /**
  * Tracks a single form and then resubmits it
  */
  trackForm(eventName = 'Tracked Form', selector, options) {
    let els;
    const _options = typeof selector === 'string' ? options || {} : selector || {};
    
    const bindEl = (el, ev, props, opts) => {
      attachEvent(el, 'submit', (e) => {
        this.trackFormHandler(e, el, ev, _options);
      });
    };
    
    if (_options.elements) {
      els = _options.elements;
    }
    else {
      els = getElement(selector, _options);
    }
    
    // attach event if form was found
    if (els && els.length > 0) {
      for (var i in els) {
        bindEl(els[i], eventName, _options);
      }
    }
  }
  
  trackFormHandler(e, el, eventName, options = {}) {
    let trackFinished = false;
    
    if (!el.getAttribute('data-tracked')) {
      const data = serializeForm(el, options);
      
      if (options.identify && typeof options.identify === 'function') {
        const personData = options.identify(data) || {};

        if (personData) {
          this.identify(personData);
        }
      }
      
      if (options.noSubmit) {
        this.track(eventName, data, () => {
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
        this.track(eventName, data, () => {
          trackFinished = true;
          
          if (typeof options.callback === 'function') {
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
      attachEvent(el, 'click', (e) => {
        this.trackClickHandler(e, el, ev, props, opts);
      });
    };
    
    /**
    * Support an array of elements
    */
    if (options.elements) {
      els = options.elements;
    }
    else {
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
      }
      else {
        e.preventDefault();
        
        el.setAttribute('data-tracked', 1);
        
        this.track(eventName, properties, () => {
          trackFinished = true;
          
          if (typeof options.callback === 'function') {
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
    var self = this;
    
    if (typeof this.pingInterval === 'undefined') {
      this.pingInterval = setInterval(() => {
        self.ping();
      }, this.config('ping_interval'));
    }
  }
  
  stopPing() {
    if (typeof this.pingInterval !== 'undefined') {
      clearInterval(this.pingInterval);
      delete this.pingInterval;
    }
  }
  
  /**
  * Pings tracker with visitor info
  */
  ping() {  
    if (this.config('ping') && this.idle < this.config('idle_timeout')) {
      this._push({
        endpoint: 'ping'
      });
    }
    else {
      this.stopPing();
    }
    
    const now = new Date();
    if (now - this.last_activity > this.config('idle_threshold')) {
      this.idle = now - this.last_activity;
    }
    
    return this;
  }
  
  /**
  * Pushes visitor data to server without sending an event
  */
  push(cb) {
    this._push({
      endpoint: 'identify',
      visitorData: this.visitorData,
      sessionData: this.sessionData,
      callback: cb
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
  
  /**
  * Measure when user last typed
  */
  typed() {
    this.vs = 2;
  }
  
  downloaded(url) {
    this.track('download', {
      url: url
    });
  }
  
  outgoing(url) {
    this.track('outgoing', {
      url: url
    });
  }
  
  /**
  * Event handler for decorating an element with a URL (for now only
  * anchor tags)
  */
  autoDecorate(elem) {
    const xdm = this.config('cross_domain');
    
    if (xdm) {
      let canDecorate;

      if (typeof xdm === 'string') {
        canDecorate = elem.href.indexOf(xdm) > -1;
      }
      else if (xdm.push) {
        canDecorate = xdm.indexOf(elem.hostname) > -1;
      }
      
      if (canDecorate) {
        const decorated = this.decorate(elem);
        
        if (decorated) {
          elem.href = decorated;
          // bind an event handler on mouseup to remove the url
        }
      }
    }
  }
  
  /**
  * Resets cookie
  */
  reset() {
    cookies.removeItem(
      this.config('cookie_name'),
      this.config('cookie_path'),
      this.config('cookie_domain')
    );
    this.cookie = null;
    this._setupCookie();
  }
  
  /**
  * Decorates a given URL with a __woopraid query param with value of
  * the current cookie
  */
  decorate(url) {
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
  }
  
  /**
  * Undecorates a URL with __woopraid query param
  */
  undecorate(url) {
    var regex = new RegExp('[?&]+(?:' + XDM_PARAM_NAME + ')=([^&#]*)', 'gi');
    var _url = url;
    
    if (url && url.href) {
      _url = url.href;
    }
    
    if (_url) {
      return _url.replace(regex, '');
    }
  }
  
  getPageUrl() {
    if (this.options.ignore_query_url) {
      return window.location.pathname;
    }
    else {
      return window.location.pathname + window.location.search;
    }
  }
  
  getPageHash() {
    return window.location.hash;
  }
  
  getPageTitle() {
    return (document.getElementsByTagName('title').length === 0) ? '' : document.getElementsByTagName('title')[0].innerHTML;
  }
  
  getDomainName() {
    return window.location.hostname;
  }
  
  getURI() {
    return window.location.href;
  }
  
  /**
  * Retrieves a Woopra unique id from a URL's query param (__woopraid)
  *
  * @param {String} href The full URL to extract from
  */
  getUrlId(href = window.location.href) { 
    const matches = href.match(urlIdRegex);
    
    if (matches && matches[1]) {
      return matches[1];
    }
  }
  
  getOptionParams() {
    // default params
    var o = {
      alias: this.config('domain') || getHostnameNoWww(),
      instance: this.instanceName,
      ka: this.config('keep_alive') || this.config('ping_interval') * 2,
      meta: cookies.getItem('wooMeta') || '',
      screen: window.screen.width + 'x' + window.screen.height,
      language: window.navigator.browserLanguage || window.navigator.language || '',
      app: this.config('app'),
      referer: document.referrer,
      idle: '' + parseInt(this.idle / 1000, 10),
      vs: 'i'
    };
    
    if (!this.config('domain')) {
      o._warn = 'no_domain';
      
      if (getHostnameNoWww() !== getDomain()) {
        o._warn += ',domain_mismatch';
      }
    }
    
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
  }
  
  /**
  * Stop ping timers and cleanup any globals.  Shouldn't really
  * be needed by clients.
  */
  dispose() {
    this.stopPing();
    
    for (var id in this.__l) {
      if (this.__l.hasOwnProperty(id)) {
        removeHandler(id, this.instanceName);
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
}
