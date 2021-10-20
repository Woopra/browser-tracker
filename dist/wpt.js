(function () {
  'use strict';

  /**
   * Checks if `value` is `undefined`.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
   * @example
   *
   * _.isUndefined(void 0);
   * // => true
   *
   * _.isUndefined(null);
   * // => false
   */
  function isUndefined(value) {
    return value === undefined;
  }

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
  var freeGlobal$1 = freeGlobal;

  /** Detect free variable `self`. */

  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
  /** Used as a reference to the global object. */

  var root = freeGlobal$1 || freeSelf || Function('return this')();
  var root$1 = root;

  /** Built-in value references. */

  var Symbol$1 = root$1.Symbol;
  var Symbol$2 = Symbol$1;

  /** Used for built-in method references. */

  var objectProto$1 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty = objectProto$1.hasOwnProperty;
  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */

  var nativeObjectToString$1 = objectProto$1.toString;
  /** Built-in value references. */

  var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : undefined;
  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */

  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag$1),
        tag = value[symToStringTag$1];

    try {
      value[symToStringTag$1] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$1.call(value);

    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }

    return result;
  }

  /** Used for built-in method references. */
  var objectProto = Object.prototype;
  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */

  var nativeObjectToString = objectProto.toString;
  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */

  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  /** `Object#toString` result references. */

  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';
  /** Built-in value references. */

  var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : undefined;
  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */

  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }

    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /** `Object#toString` result references. */

  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';
  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */

  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    } // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.


    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => Logs the number of milliseconds it took for the deferred invocation.
   */

  var now = function now() {
    return root$1.Date.now();
  };

  var now$1 = now;

  /** Used to match a single whitespace character. */
  var reWhitespace = /\s/;
  /**
   * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the last non-whitespace character.
   */

  function trimmedEndIndex(string) {
    var index = string.length;

    while (index-- && reWhitespace.test(string.charAt(index))) {}

    return index;
  }

  /** Used to match leading whitespace. */

  var reTrimStart = /^\s+/;
  /**
   * The base implementation of `_.trim`.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} Returns the trimmed string.
   */

  function baseTrim(string) {
    return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '') : string;
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /** `Object#toString` result references. */

  var symbolTag = '[object Symbol]';
  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */

  function isSymbol(value) {
    return typeof value == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag;
  }

  /** Used as references for various `Number` constants. */

  var NAN = 0 / 0;
  /** Used to detect bad signed hexadecimal string values. */

  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  /** Used to detect binary string values. */

  var reIsBinary = /^0b[01]+$/i;
  /** Used to detect octal string values. */

  var reIsOctal = /^0o[0-7]+$/i;
  /** Built-in method references without a dependency on `root`. */

  var freeParseInt = parseInt;
  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */

  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }

    if (isSymbol(value)) {
      return NAN;
    }

    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject(other) ? other + '' : other;
    }

    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }

    value = baseTrim(value);
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
  }

  /** Error message constants. */

  var FUNC_ERROR_TEXT$1 = 'Expected a function';
  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeMax = Math.max,
      nativeMin = Math.min;
  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed `func` invocations and a `flush` method to immediately invoke them.
   * Provide `options` to indicate whether `func` should be invoked on the
   * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
   * with the last arguments provided to the debounced function. Subsequent
   * calls to the debounced function return the result of the last `func`
   * invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', debounced);
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel);
   */

  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$1);
    }

    wait = toNumber(wait) || 0;

    if (isObject(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;
      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time; // Start the timer for the trailing edge.

      timerId = setTimeout(timerExpired, wait); // Invoke the leading edge.

      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          timeWaiting = wait - timeSinceLastCall;
      return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime; // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.

      return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
    }

    function timerExpired() {
      var time = now$1();

      if (shouldInvoke(time)) {
        return trailingEdge(time);
      } // Restart the timer.


      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined; // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.

      if (trailing && lastArgs) {
        return invokeFunc(time);
      }

      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }

      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now$1());
    }

    function debounced() {
      var time = now$1(),
          isInvoking = shouldInvoke(time);
      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }

        if (maxing) {
          // Handle invocations in a tight loop.
          clearTimeout(timerId);
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }

      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }

      return result;
    }

    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  /** Error message constants. */

  var FUNC_ERROR_TEXT = 'Expected a function';
  /**
   * Creates a throttled function that only invokes `func` at most once per
   * every `wait` milliseconds. The throttled function comes with a `cancel`
   * method to cancel delayed `func` invocations and a `flush` method to
   * immediately invoke them. Provide `options` to indicate whether `func`
   * should be invoked on the leading and/or trailing edge of the `wait`
   * timeout. The `func` is invoked with the last arguments provided to the
   * throttled function. Subsequent calls to the throttled function return the
   * result of the last `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the throttled function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.throttle` and `_.debounce`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to throttle.
   * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=true]
   *  Specify invoking on the leading edge of the timeout.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new throttled function.
   * @example
   *
   * // Avoid excessively updating the position while scrolling.
   * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
   *
   * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
   * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
   * jQuery(element).on('click', throttled);
   *
   * // Cancel the trailing throttled invocation.
   * jQuery(window).on('popstate', throttled.cancel);
   */

  function throttle(func, wait, options) {
    var leading = true,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }

    if (isObject(options)) {
      leading = 'leading' in options ? !!options.leading : leading;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    return debounce(func, wait, {
      'leading': leading,
      'maxWait': wait,
      'trailing': trailing
    });
  }

  var VERSION = 11;
  var ENDPOINT = 'www.woopra.com/track/';
  var XDM_PARAM_NAME = '__woopraid';
  var CAMPAIGN_KEYS = ['campaign', 'content', 'id', 'medium', 'source', 'term'];
  var SECOND_LEVEL_TLDS = ['com.au', 'net.au', 'org.au', 'co.hu', 'com.ru', 'ac.za', 'net.za', 'com.za', 'co.za', 'co.uk', 'org.uk', 'me.uk', 'net.uk'];
  var RANDOM_STRING_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var MIN_PING_INTERVAL = 6000;
  var MAX_PING_INTERVAL = 60000;
  var URL_ID_REGEX = new RegExp(XDM_PARAM_NAME + '=([^&#]+)');
  var LIFECYCLE_ACTION = 'action';
  var LIFECYCLE_PAGE = 'page';
  var SCROLL_DEPTH = 'scroll depth';
  var ACTION_PV = 'pv';
  var IDPTNC = 'idptnc';
  var TARGET_BLANK = '_blank';
  var DATA_TRACKED_ATTRIBUTE = 'data-tracked';
  var ACTION_PROPERTY_PREFIX = 'ce_';
  var VISIT_PROPERTY_PREFIX = 'cs_';
  var VISITOR_PROPERTY_PREFIX = 'cv_';
  var PAGE_LIFECYCLE_STATE_ACTIVE = 'active';
  var PAGE_LIFECYCLE_STATE_PASSIVE = 'passive';
  var PAGE_LIFECYCLE_STATE_HIDDEN = 'hidden';
  var PAGE_LIFECYCLE_STATE_FROZEN = 'frozen';
  var PAGE_LIFECYCLE_STATE_TERMINATED = 'terminated';
  var EVENT_BEFOREUNLOAD = 'beforeunload';
  var EVENT_BLUR = 'blur';
  var EVENT_CLICK = 'click';
  var EVENT_DOWNLOAD = 'download';
  var EVENT_FOCUS = 'focus';
  var EVENT_FREEZE = 'freeze';
  var EVENT_LINK_CLICK = 'link';
  var EVENT_MOUSEDOWN = 'mousedown';
  var EVENT_MOUSEMOVE = 'mousemove';
  var EVENT_OUTGOING = 'outgoing';
  var EVENT_PAGEHIDE = 'pagehide';
  var EVENT_PAGESHOW = 'pageshow';
  var EVENT_RESUME = 'resume';
  var EVENT_SCROLL = 'scroll';
  var EVENT_STATECHANGE = 'statechange';
  var EVENT_UNLOAD = 'unload';
  var EVENT_VISIBILITYCHANGE = 'visibilitychange';
  var KEY_APP = 'app';
  var KEY_AUTO_DECORATE = 'auto_decorate';
  var KEY_BEACONS = 'beacons';
  var KEY_CAMPAIGN_ONCE = 'campaign_once';
  var KEY_CONTEXT = 'context';
  var KEY_COOKIE_DOMAIN = 'cookie_domain';
  var KEY_COOKIE_EXPIRE = 'cookie_expire';
  var KEY_COOKIE_NAME = 'cookie_name';
  var KEY_COOKIE_PATH = 'cookie_path';
  var KEY_CROSS_DOMAIN = 'cross_domain';
  var KEY_DOMAIN = 'domain';
  var KEY_DOWNLOAD_EXTENSIONS = 'download_extensions';
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
  var KEY_CLICK_PAUSE = 'click_pause';
  var KEY_FORM_PAUSE = 'form_pause';
  var KEY_USE_COOKIES = 'use_cookies';
  var META_CANCELLED = 'cancelled';
  var META_DIRTY = 'dirty';
  var META_DURATION = 'duration';
  var META_EXPIRED = 'expired';
  var META_LEAVE = 'leave';
  var META_RETRACK = 'retrack';
  var META_SENT = 'sent';
  var META_TIMESTAMP = 'timestamp';
  var ACTION_PROPERTY_ALIASES = [[IDPTNC, IDPTNC], ['$duration', 'duration'], ['$domain', 'domain'], ['$app', 'app'], ['$timestamp', 'timestamp'], ['$action', 'event']];
  var DEFAULT_DOWNLOAD_EXTENSIONS = ['avi', 'css', 'dmg', 'doc', 'eps', 'exe', 'js', 'm4v', 'mov', 'mp3', 'mp4', 'msi', 'pdf', 'ppt', 'rar', 'svg', 'txt', 'vsd', 'vxd', 'wma', 'wmv', 'xls', 'xlsx', 'zip'];

  var _KEY_AUTO_DECORATE$KE;
  var globals = (_KEY_AUTO_DECORATE$KE = {}, _KEY_AUTO_DECORATE$KE[KEY_AUTO_DECORATE] = undefined, _KEY_AUTO_DECORATE$KE[KEY_DOWNLOAD_TRACKING] = false, _KEY_AUTO_DECORATE$KE[KEY_OUTGOING_IGNORE_SUBDOMAIN] = true, _KEY_AUTO_DECORATE$KE[KEY_OUTGOING_TRACKING] = false, _KEY_AUTO_DECORATE$KE);

  var handlers = {};
  function removeHandler(id, instance) {
    handlers[id][instance] = null;
  }
  function addEventListener$1(element, type, callback) {
    if (element != null && element.addEventListener) {
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
  function fire$1(event) {
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

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

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

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;

    _setPrototypeOf(subClass, superClass);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelperLoose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);

    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];

    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }

    return (hint === "string" ? String : Number)(input);
  }

  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");

    return typeof key === "symbol" ? key : String(key);
  }

  var EventTargetShim = /*#__PURE__*/function () {
    /**
     * Creates the event registry.
     */
    function EventTargetShim() {
      this._registry = {};
    }
    /**
     * @param {string} type
     * @param {EventListener|function(!Event):(boolean|undefined)} listener
     * @param {(boolean|!AddEventListenerOptions)=} opts
     * @return {undefined}
     * @see https://dom.spec.whatwg.org/#dom-eventtarget-addeventlistener
     */


    var _proto = EventTargetShim.prototype;

    _proto.addEventListener = function addEventListener(type, listener, opts) {

      this._getRegistry(type).push(listener);
    }
    /**
     * @param {string} type
     * @param {EventListener|function(!Event):(boolean|undefined)} listener
     * @param {(boolean|!EventListenerOptions)=} opts
     * @return {undefined}
     * @see https://dom.spec.whatwg.org/#dom-eventtarget-removeeventlistener
     */
    ;

    _proto.removeEventListener = function removeEventListener(type, listener, opts) {

      var typeRegistry = this._getRegistry(type);

      var handlerIndex = typeRegistry.indexOf(listener);

      if (handlerIndex > -1) {
        typeRegistry.splice(handlerIndex, 1);
      }
    }
    /**
     * @param {!Event|!EventShim} evt
     * @return {boolean}
     * @see https://dom.spec.whatwg.org/#dom-eventtarget-dispatchevent
     */
    ;

    _proto.dispatchEvent = function dispatchEvent(evt) {
      // Set the target then freeze the event object to prevent modification.
      evt.target = this;
      Object.freeze(evt);

      this._getRegistry(evt.type).forEach(function (listener) {
        return listener(evt);
      });

      return true;
    }
    /**
     * Returns an array of handlers associated with the passed event type.
     * If no handlers have been registered, an empty array is returned.
     * @private
     * @param {string} type The event type.
     * @return {!Array} An array of handler functions.
     */
    ;

    _proto._getRegistry = function _getRegistry(type) {
      return this._registry[type] = this._registry[type] || [];
    };

    return EventTargetShim;
  }();

  var StateChangeEvent = function StateChangeEvent(type, initDict) {
    this.type = type;
    this.newState = initDict.newState;
    this.oldState = initDict.oldState;
    this.originalEvent = initDict.originalEvent;
  }; // Detect Safari to work around Safari-specific bugs.


  var IS_SAFARI = typeof safari === 'object' && safari.pushNotification;
  var SUPPORTS_PAGE_TRANSITION_EVENTS = ('onpageshow' in self);
  var EVENTS = [EVENT_FOCUS, EVENT_BLUR, EVENT_VISIBILITYCHANGE, EVENT_FREEZE, EVENT_RESUME, EVENT_PAGESHOW, // IE9-10 do not support the pagehide event, so we fall back to unload
  // Note: unload *MUST ONLY* be added conditionally, otherwise it will
  // prevent page navigation caching (a.k.a bfcache).
  SUPPORTS_PAGE_TRANSITION_EVENTS ? EVENT_PAGEHIDE : EVENT_UNLOAD];
  /**
   * @param {!Event} evt
   * @return {string}
   */

  var onbeforeunload = function onbeforeunload(evt) {
    evt.preventDefault();
    return evt.returnValue = 'Are you sure?';
  };
  /**
   * Converts an array of states into an object where the state is the key
   * and the value is the index.
   * @param {!Array<string>} arr
   * @return {!Object}
   */


  var toIndexedObject = function toIndexedObject(arr) {
    return arr.reduce(function (acc, val, idx) {
      acc[val] = idx;
      return acc;
    }, {});
  };
  /**
   * @type {!Array<!Object>}
   */


  var LEGAL_STATE_TRANSITIONS = [// The normal unload process (bfcache process is addressed above).
  [PAGE_LIFECYCLE_STATE_ACTIVE, PAGE_LIFECYCLE_STATE_PASSIVE, PAGE_LIFECYCLE_STATE_HIDDEN, PAGE_LIFECYCLE_STATE_TERMINATED], // An active page transitioning to frozen,
  // or an unloading page going into the bfcache.
  [PAGE_LIFECYCLE_STATE_ACTIVE, PAGE_LIFECYCLE_STATE_PASSIVE, PAGE_LIFECYCLE_STATE_HIDDEN, PAGE_LIFECYCLE_STATE_FROZEN], // A hidden page transitioning back to active.
  [PAGE_LIFECYCLE_STATE_HIDDEN, PAGE_LIFECYCLE_STATE_PASSIVE, PAGE_LIFECYCLE_STATE_ACTIVE], // A frozen page being resumed
  [PAGE_LIFECYCLE_STATE_FROZEN, PAGE_LIFECYCLE_STATE_HIDDEN], // A frozen (bfcached) page navigated back to
  // Note: [FROZEN, HIDDEN] can happen here, but it's already covered above.
  [PAGE_LIFECYCLE_STATE_FROZEN, PAGE_LIFECYCLE_STATE_ACTIVE], [PAGE_LIFECYCLE_STATE_FROZEN, PAGE_LIFECYCLE_STATE_PASSIVE]].map(toIndexedObject);
  /**
   * Accepts a current state and a future state and returns an array of legal
   * state transition paths. This is needed to normalize behavior across browsers
   * since some browsers do not fire events in certain cases and thus skip
   * states.
   * @param {string} oldState
   * @param {string} newState
   * @return {!Array<string>}
   */

  var getLegalStateTransitionPath = function getLegalStateTransitionPath(oldState, newState) {
    // We're intentionally not using for...of here so when we transpile to ES5
    // we don't need to include the Symbol polyfills.
    for (var order, i = 0; order = LEGAL_STATE_TRANSITIONS[i]; ++i) {
      var oldIndex = order[oldState];
      var newIndex = order[newState];

      if (oldIndex >= 0 && newIndex >= 0 && newIndex > oldIndex) {
        // Differences greater than one should be reported
        // because it means a state was skipped.
        return Object.keys(order).slice(oldIndex, newIndex + 1);
      }
    }

    return []; // TODO(philipwalton): it shouldn't be possible to get here, but
    // consider some kind of warning or call to action if it happens.
    // console.warn(`Invalid state change detected: ${oldState} > ${newState}`);
  };
  /**
   * Returns the current state based on the document's visibility and
   * in input focus states. Note this method is only used to determine
   * active vs passive vs hidden states, as other states require listening
   * for events.
   * @return {string}
   */


  var getCurrentState = function getCurrentState() {
    if (document.visibilityState === PAGE_LIFECYCLE_STATE_HIDDEN) {
      return PAGE_LIFECYCLE_STATE_HIDDEN;
    }

    if (document.hasFocus()) {
      return PAGE_LIFECYCLE_STATE_ACTIVE;
    }

    return PAGE_LIFECYCLE_STATE_PASSIVE;
  };
  /**
   * Class definition for the exported, singleton lifecycle instance.
   */


  var PageLifecycle = /*#__PURE__*/function (_EventTargetShim) {
    _inheritsLoose(PageLifecycle, _EventTargetShim);

    /**
     * Initializes state, state history, and adds event listeners to monitor
     * state changes.
     */
    function PageLifecycle() {
      var _this;

      _this = _EventTargetShim.call(this) || this;
      var state = getCurrentState();
      _this._state = state;
      _this._unsavedChanges = []; // Bind the callback and add event listeners.

      _this._handleEvents = _this._handleEvents.bind(_assertThisInitialized(_this)); // Add capturing events on window so they run immediately.

      EVENTS.forEach(function (evt) {
        return addEventListener(evt, _this._handleEvents, true);
      }); // Safari does not reliably fire the `pagehide` or `visibilitychange`
      // events when closing a tab, so we have to use `beforeunload` with a
      // timeout to check whether the default action was prevented.
      // - https://bugs.webkit.org/show_bug.cgi?id=151610
      // - https://bugs.webkit.org/show_bug.cgi?id=151234
      // NOTE: we only add this to Safari because adding it to Firefox would
      // prevent the page from being eligible for bfcache.

      if (IS_SAFARI) {
        addEventListener(EVENT_BEFOREUNLOAD, function (evt) {
          _this._safariBeforeUnloadTimeout = setTimeout(function () {
            if (!(evt.defaultPrevented || evt.returnValue.length > 0)) {
              _this._dispatchChangesIfNeeded(evt, PAGE_LIFECYCLE_STATE_HIDDEN);
            }
          }, 0);
        });
      }

      return _this;
    }
    /**
     * @return {string}
     */


    var _proto2 = PageLifecycle.prototype;

    /**
     * @param {Symbol|Object} id A unique symbol or object identifying the
     *.    pending state. This ID is required when removing the state later.
     */
    _proto2.addUnsavedChanges = function addUnsavedChanges(id) {
      // Don't add duplicate state. Note: ideally this would be a set, but for
      // better browser compatibility we're using an array.
      if (!this._unsavedChanges.indexOf(id) > -1) {
        // If this is the first state being added,
        // also add a beforeunload listener.
        if (this._unsavedChanges.length === 0) {
          addEventListener(EVENT_BEFOREUNLOAD, onbeforeunload);
        }

        this._unsavedChanges.push(id);
      }
    }
    /**
     * @param {Symbol|Object} id A unique symbol or object identifying the
     *.    pending state. This ID is required when removing the state later.
     */
    ;

    _proto2.removeUnsavedChanges = function removeUnsavedChanges(id) {
      var idIndex = this._unsavedChanges.indexOf(id);

      if (idIndex > -1) {
        this._unsavedChanges.splice(idIndex, 1); // If there's no more pending state, remove the event listener.


        if (this._unsavedChanges.length === 0) {
          removeEventListener(EVENT_BEFOREUNLOAD, onbeforeunload);
        }
      }
    }
    /**
     * @private
     * @param {!Event} originalEvent
     * @param {string} newState
     */
    ;

    _proto2._dispatchChangesIfNeeded = function _dispatchChangesIfNeeded(originalEvent, newState) {
      if (newState !== this._state) {
        var oldState = this._state;
        var path = getLegalStateTransitionPath(oldState, newState);

        for (var i = 0; i < path.length - 1; ++i) {
          var _oldState = path[i];
          var _newState = path[i + 1];
          this._state = _newState;
          this.dispatchEvent(new StateChangeEvent('statechange', {
            oldState: _oldState,
            newState: _newState,
            originalEvent: originalEvent
          }));
        }
      }
    }
    /**
     * @private
     * @param {!Event} evt
     */
    ;

    _proto2._handleEvents = function _handleEvents(evt) {
      if (IS_SAFARI) {
        clearTimeout(this._safariBeforeUnloadTimeout);
      }

      switch (evt.type) {
        case EVENT_PAGESHOW:
        case EVENT_RESUME:
          this._dispatchChangesIfNeeded(evt, getCurrentState());

          break;

        case EVENT_FOCUS:
          this._dispatchChangesIfNeeded(evt, PAGE_LIFECYCLE_STATE_ACTIVE);

          break;

        case EVENT_BLUR:
          // The `blur` event can fire while the page is being unloaded, so we
          // only need to update the state if the current state is "active".
          if (this._state === PAGE_LIFECYCLE_STATE_ACTIVE) {
            this._dispatchChangesIfNeeded(evt, getCurrentState());
          }

          break;

        case EVENT_PAGEHIDE:
        case EVENT_UNLOAD:
          this._dispatchChangesIfNeeded(evt, evt.persisted ? PAGE_LIFECYCLE_STATE_FROZEN : PAGE_LIFECYCLE_STATE_TERMINATED);

          break;

        case EVENT_VISIBILITYCHANGE:
          // The document's `visibilityState` will change to hidden  as the page
          // is being unloaded, but in such cases the lifecycle state shouldn't
          // change.
          if (this._state !== PAGE_LIFECYCLE_STATE_FROZEN && this._state !== PAGE_LIFECYCLE_STATE_TERMINATED) {
            this._dispatchChangesIfNeeded(evt, getCurrentState());
          }

          break;

        case EVENT_FREEZE:
          this._dispatchChangesIfNeeded(evt, PAGE_LIFECYCLE_STATE_FROZEN);

          break;
      }
    };

    _createClass(PageLifecycle, [{
      key: "state",
      get: function get() {
        return this._state;
      }
      /**
       * Returns the value of document.wasDiscarded. This is arguably unnecessary
       * but I think there's value in having the entire API in one place and
       * consistent across browsers.
       * @return {boolean}
       */

    }, {
      key: "pageWasDiscarded",
      get: function get() {
        return document.wasDiscarded || false;
      }
    }]);

    return PageLifecycle;
  }(EventTargetShim);

  var PageLifecycle$1 = new PageLifecycle();

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;
  var _isArray = isArray;

  /** `Object#toString` result references. */

  var stringTag = '[object String]';
  /**
   * Checks if `value` is classified as a `String` primitive or object.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a string, else `false`.
   * @example
   *
   * _.isString('abc');
   * // => true
   *
   * _.isString(1);
   * // => false
   */

  function isString(value) {
    return typeof value == 'string' || !_isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeIsFinite = root$1.isFinite;
  /**
   * Checks if `value` is a finite primitive number.
   *
   * **Note:** This method is based on
   * [`Number.isFinite`](https://mdn.io/Number/isFinite).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
   * @example
   *
   * _.isFinite(3);
   * // => true
   *
   * _.isFinite(Number.MIN_VALUE);
   * // => true
   *
   * _.isFinite(Infinity);
   * // => false
   *
   * _.isFinite('3');
   * // => false
   */

  function isFinite(value) {
    return typeof value == 'number' && nativeIsFinite(value);
  }

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
    var _options = isString(selector) ? options || {} : selector || {};

    if (_options.el) {
      return _options.el;
    } else if (isString(selector)) {
      if (document.querySelectorAll) {
        return document.querySelectorAll(selector);
      } else if (selector[0] === '#') {
        return document.getElementById(selector.substr(1));
      } else if (selector[0] === '.') {
        return document.getElementsByClassName(selector.substr(1));
      }
    }
  }
  function prefixObjectKeys(object, prefix, blacklist) {
    var obj = {};
    if (isUndefined(object)) return obj;

    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        var value = object[key];
        var isBlacklisted = false;

        for (var i = 0; i < blacklist.length; i++) {
          if (blacklist[i][0] === key) {
            isBlacklisted = true;
            break;
          }
        }

        if (!isBlacklisted && value !== 'undefined' && value !== 'null' && !isUndefined(value)) {
          obj["" + prefix + key] = value;
        }
      }
    }

    return obj;
  }
  function getScrollDepth() {
    var scrollHeight = document.body.scrollHeight;
    var scrollDepth = ((window.scrollY || 0) + window.innerHeight) / scrollHeight;
    return Math.max(0, Math.min(1, isFinite(scrollDepth) ? scrollDepth : 0));
  }
  function callCallback(callback, action) {
    try {
      callback();
    } catch (e) {
      console.error("Error in Woopra " + action + " callback"); // eslint-disable-line no-console

      console.error(e.stack); // eslint-disable-line no-console
    }
  }
  function findParentAnchorElement(elem) {
    var anchor = elem;

    while (!isUndefined(anchor) && anchor !== null) {
      if (anchor.tagName && anchor.tagName.toLowerCase() === 'a') {
        break;
      }

      anchor = anchor.parentNode;
    }

    return anchor;
  }
  function hasBeaconSupport() {
    return isFunction(navigator.sendBeacon);
  }

  function onClick(e) {
    var elem = e.srcElement || e.target;

    if (isLeftClick(e)) {
      fire$1(EVENT_CLICK, e, elem);
    }

    if (globals[KEY_DOWNLOAD_TRACKING] || globals[KEY_OUTGOING_TRACKING]) {
      elem = findParentAnchorElement(e.srcElement || e.target);

      if (!isUndefined(elem) && elem !== null && !elem.getAttribute(DATA_TRACKED_ATTRIBUTE)) {
        fire$1(EVENT_LINK_CLICK, e, elem);
      }
    }
  }

  function onMouseDown(e) {
    var elem;
    fire$1(EVENT_MOUSEMOVE, e, Date.now());

    if (globals[KEY_AUTO_DECORATE]) {
      elem = findParentAnchorElement(e.srcElement || e.target);

      if (!isUndefined(elem) && elem !== null) {
        fire$1(KEY_AUTO_DECORATE, elem);
      }
    }
  }

  function onMouseMove(e) {
    fire$1(EVENT_MOUSEMOVE, e, Date.now());
  }

  var onScroll = throttle(function onScroll(e) {
    fire$1(EVENT_SCROLL, e);
  }, 500);

  function onPageStateChange(e) {
    fire$1(EVENT_STATECHANGE, e);
  }
  // needs to be handled here, instead of in a tracking instance because
  // these events should only be fired once on a page

  function attachGlobalEvents() {
    addEventListener$1(document, EVENT_CLICK, onClick);
    addEventListener$1(document, EVENT_MOUSEDOWN, onMouseDown);
    addEventListener$1(document, EVENT_MOUSEMOVE, onMouseMove);
    addEventListener$1(window, EVENT_SCROLL, onScroll);
    PageLifecycle$1.addEventListener(EVENT_STATECHANGE, onPageStateChange);
  }

  /**
   * This method returns `undefined`.
   *
   * @static
   * @memberOf _
   * @since 2.3.0
   * @category Util
   * @example
   *
   * _.times(2, _.noop);
   * // => [undefined, undefined]
   */
  function noop() {// No operation performed.
  }

  var WoopraAction = /*#__PURE__*/function () {
    function WoopraAction(woopra, id, event) {
      this.woopra = woopra;
      this.id = id;
      this.event = event;
    }

    var _proto = WoopraAction.prototype;

    _proto.update = function update(options, lastArg) {
      if (options === void 0) {
        options = {};
      }

      if (options.event && options.event !== this.event) {
        this.event = options.event;
      }

      this.woopra.update(this.id, _extends({}, options, {
        $action: this.event
      }), lastArg);
    };

    _proto.cancel = function cancel() {
      this.woopra.cancelAction(this.id);
    };

    return WoopraAction;
  }();

  /**
   * The base implementation of `_.clamp` which doesn't coerce arguments.
   *
   * @private
   * @param {number} number The number to clamp.
   * @param {number} [lower] The lower bound.
   * @param {number} upper The upper bound.
   * @returns {number} Returns the clamped number.
   */
  function baseClamp(number, lower, upper) {
    if (number === number) {
      if (upper !== undefined) {
        number = number <= upper ? number : upper;
      }

      if (lower !== undefined) {
        number = number >= lower ? number : lower;
      }
    }

    return number;
  }

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }

    return result;
  }

  /** Used as references for various `Number` constants. */

  var INFINITY$1 = 1 / 0;
  /** Used to convert symbols to primitives and strings. */

  var symbolProto = Symbol$2 ? Symbol$2.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;
  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */

  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }

    if (_isArray(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap(value, baseToString) + '';
    }

    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }

    var result = value + '';
    return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
  }

  /** Used as references for various `Number` constants. */

  var INFINITY = 1 / 0,
      MAX_INTEGER = 1.7976931348623157e+308;
  /**
   * Converts `value` to a finite number.
   *
   * @static
   * @memberOf _
   * @since 4.12.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted number.
   * @example
   *
   * _.toFinite(3.2);
   * // => 3.2
   *
   * _.toFinite(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toFinite(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toFinite('3.2');
   * // => 3.2
   */

  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }

    value = toNumber(value);

    if (value === INFINITY || value === -INFINITY) {
      var sign = value < 0 ? -1 : 1;
      return sign * MAX_INTEGER;
    }

    return value === value ? value : 0;
  }

  /**
   * Converts `value` to an integer.
   *
   * **Note:** This method is loosely based on
   * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3.2);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3.2');
   * // => 3
   */

  function toInteger(value) {
    var result = toFinite(value),
        remainder = result % 1;
    return result === result ? remainder ? result - remainder : result : 0;
  }

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */

  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  /**
   * Checks if `string` starts with the given target string.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to inspect.
   * @param {string} [target] The string to search for.
   * @param {number} [position=0] The position to search from.
   * @returns {boolean} Returns `true` if `string` starts with `target`,
   *  else `false`.
   * @example
   *
   * _.startsWith('abc', 'a');
   * // => true
   *
   * _.startsWith('abc', 'b');
   * // => false
   *
   * _.startsWith('abc', 'b', 1);
   * // => true
   */

  function startsWith(string, target, position) {
    string = toString(string);
    position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
    target = baseToString(target);
    return string.slice(position, position + target.length) == target;
  }

  /**
   * Checks if `string` ends with the given target string.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to inspect.
   * @param {string} [target] The string to search for.
   * @param {number} [position=string.length] The position to search up to.
   * @returns {boolean} Returns `true` if `string` ends with `target`,
   *  else `false`.
   * @example
   *
   * _.endsWith('abc', 'c');
   * // => true
   *
   * _.endsWith('abc', 'b');
   * // => false
   *
   * _.endsWith('abc', 'b', 2);
   * // => true
   */

  function endsWith(string, target, position) {
    string = toString(string);
    target = baseToString(target);
    var length = string.length;
    position = position === undefined ? length : baseClamp(toInteger(position), 0, length);
    var end = position;
    position -= target.length;
    return position >= 0 && string.slice(position, end) == target;
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
    __proto__: null,
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem,
    hasItem: hasItem,
    keys: keys
  });

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

  function removeScript(script) {
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }

  var statusIsSuccessful = function statusIsSuccessful(readyState) {
    return readyState === 4 || readyState === 'complete' || readyState === 'loaded';
  };

  function loadScript(url, callback, errorCallback) {
    if (callback === void 0) {
      callback = noop;
    }

    if (errorCallback === void 0) {
      errorCallback = noop;
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

      script.onerror = function (e) {
        errorCallback(e);
        removeScript(script);
      };
    }

    script.src = url;
    if (document.body) document.body.appendChild(script);else document.head.appendChild(script);
  }

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
  Woopra._fire = fire$1;
  Woopra.attachEvent = addEventListener$1;
  Woopra.startsWith = startsWith;
  Woopra.endsWith = endsWith;

  var fire = Woopra._fire;

  var Tracker = /*#__PURE__*/function () {
    function Tracker(instanceName) {
      var _this$options;

      this.visitorData = {};
      this.sessionData = {};
      this.options = (_this$options = {}, _this$options[KEY_APP] = 'js-client', _this$options[KEY_BEACONS] = hasBeaconSupport(), _this$options[KEY_CAMPAIGN_ONCE] = false, _this$options[KEY_COOKIE_DOMAIN] = "." + Woopra.getHostnameNoWww(), _this$options[KEY_COOKIE_EXPIRE] = new Date(new Date().setDate(new Date().getDate() + 730)), _this$options[KEY_COOKIE_NAME] = 'wooTracker', _this$options[KEY_COOKIE_PATH] = '/', _this$options[KEY_CROSS_DOMAIN] = false, _this$options[KEY_DOWNLOAD_EXTENSIONS] = DEFAULT_DOWNLOAD_EXTENSIONS, _this$options[KEY_DOWNLOAD_PAUSE] = 200, _this$options[KEY_DOWNLOAD_TRACKING] = false, _this$options[KEY_HIDE_CAMPAIGN] = false, _this$options[KEY_HIDE_XDM_DATA] = false, _this$options[KEY_IDLE_THRESHOLD] = 10 * 1000, _this$options[KEY_IDLE_TIMEOUT] = 60 * 10 * 1000, _this$options[KEY_IGNORE_QUERY_URL] = false, _this$options[KEY_MAP_QUERY_PARAMS] = {}, _this$options[KEY_OUTGOING_IGNORE_SUBDOMAIN] = true, _this$options[KEY_OUTGOING_PAUSE] = 200, _this$options[KEY_OUTGOING_TRACKING] = false, _this$options[KEY_PERSONALIZATION] = true, _this$options[KEY_PING_INTERVAL] = 12 * 1000, _this$options[KEY_PING] = false, _this$options[KEY_PROTOCOL] = 'https', _this$options[KEY_SAVE_URL_HASH] = true, _this$options[KEY_THIRD_PARTY] = false, _this$options[KEY_CLICK_PAUSE] = 250, _this$options[KEY_FORM_PAUSE] = 250, _this$options[KEY_USE_COOKIES] = true, _this$options);
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

      on(this, EVENT_DOWNLOAD, function (url) {
        return _this2.downloaded(url);
      });
      on(this, EVENT_LINK_CLICK, function (e, link) {
        return _this2.onLink(e, link);
      });
      on(this, EVENT_MOUSEMOVE, function (e, l) {
        return _this2.moved(e, l);
      });
      on(this, EVENT_OUTGOING, function (url) {
        return _this2.outgoing(url);
      });
      on(this, EVENT_SCROLL, function (elem) {
        return _this2.onScroll(elem);
      });
      on(this, EVENT_STATECHANGE, function (e) {
        return _this2.onPageStateChange(e);
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
        if (isString(key)) {
          return dataStore[key];
        }

        if (isObject(key)) {
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
        globals[KEY_DOWNLOAD_TRACKING] = this.options[KEY_DOWNLOAD_TRACKING];
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
     * Builds the correct tracking Url and performs an HTTP request
     */
    ;

    _proto._push = function _push(options) {
      if (options === void 0) {
        options = {};
      }

      var types = [['visitorData', VISITOR_PROPERTY_PREFIX], ['eventData', ACTION_PROPERTY_PREFIX], ['sessionData', VISIT_PROPERTY_PREFIX]];
      var data = {};
      var endpoint = this.getEndpoint(options.endpoint);
      var lifecycle = options.lifecycle || LIFECYCLE_ACTION; // Load custom visitor params from url

      this.getVisitorUrlData();

      if (this.config(KEY_HIDE_CAMPAIGN)) {
        Woopra.hideCampaignData();
      } // push tracker config values


      this._dataSetter(data, this.getOptionParams()); // push eventName if it exists


      if (options.eventName) {
        data.event = options.eventName;
      } // push close if no personalization


      if (!this.config(KEY_PERSONALIZATION)) {
        data.close = true;
      }

      data.timeout = isUndefined(options.timeout) ? this.config(KEY_IDLE_TIMEOUT) : options.timeout;
      var rawData = {};

      for (var _iterator = _createForOfIteratorHelperLoose(ACTION_PROPERTY_ALIASES), _step; !(_step = _iterator()).done;) {
        var _step$value = _step.value,
            original = _step$value[0],
            alias = _step$value[1];

        if (options.eventData && options.eventData[original]) {
          rawData[alias] = options.eventData[original];
        }
      }

      this._dataSetter(data, rawData);

      for (var i = 0; i < types.length; i++) {
        var _types$i = types[i],
            key = _types$i[0],
            prefix = _types$i[1];

        this._dataSetter(data, prefixObjectKeys(options[key], prefix, prefix === ACTION_PROPERTY_PREFIX ? ACTION_PROPERTY_ALIASES : []));
      }

      if (this.config(KEY_CONTEXT)) {
        try {
          var contextData = JSON.stringify(this.config(KEY_CONTEXT));
          data[KEY_CONTEXT] = encodeURIComponent(contextData);
        } catch (e) {}
      }

      if (options.fullEventData) data = options.fullEventData;
      var action = new WoopraAction(this, data[IDPTNC], data.event);
      var callback = isFunction(options.callback) ? function () {
        return options.callback(action);
      } : noop;
      var beforeCallback = isFunction(options.beforeCallback) ? function () {
        return options.beforeCallback(action);
      } : noop;
      var errorCallback = options.errorCallback || noop;

      if (lifecycle === LIFECYCLE_PAGE || options.useBeacon || this.isUnloading) {
        var _meta;

        var dirty = Boolean(options.useBeacon || this.isUnloading);
        this.pending.push({
          lifecycle: lifecycle,
          endpoint: options.endpoint,
          params: data,
          args: options,
          meta: (_meta = {}, _meta[META_DIRTY] = dirty, _meta[META_DURATION] = 0, _meta[META_RETRACK] = Boolean(options.retrack), _meta[META_SENT] = !dirty, _meta[META_TIMESTAMP] = Date.now(), _meta),
          callback: callback,
          errorCallback: errorCallback
        });
      }

      if (this.isUnloading || options.useBeacon && !options.queue) {
        this.sendBeacons();
      } else {
        var queryString = Woopra.buildUrlParams(data);
        var scriptUrl = endpoint + "?" + queryString;

        var onSuccess = function onSuccess() {
          return callCallback(callback, data.event);
        };

        var onError = function onError() {
          return callCallback(errorCallback, data.event);
        };

        Woopra.loadScript(scriptUrl, onSuccess, onError);
      }

      setTimeout(function () {
        return callCallback(beforeCallback, data.event);
      });
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
      var beforeCallback;
      var errorCallback;
      var lastArg = arguments[arguments.length - 1];
      var lifecycle = LIFECYCLE_ACTION;
      var queue = false;
      var useBeacon = false;
      var timeout;
      var retrack;
      if (isFunction(lastArg)) callback = lastArg;else if (isObject(lastArg)) {
        if (isFunction(lastArg.callback)) callback = lastArg.callback;else if (isFunction(lastArg.onSuccess)) callback = lastArg.onSuccess;
        if (isFunction(lastArg.onBeforeSend)) beforeCallback = lastArg.onBeforeSend;
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
      } // Load campaign params (load first to allow overrides)

      if (!this.config(KEY_CAMPAIGN_ONCE) || !this.sentCampaign) {
        eventData = _extends({}, eventData, Woopra.getCampaignData());
        this.sentCampaign = true;
      } // Load query params mapping into Woopra event


      eventData = _extends({}, eventData, Woopra.mapQueryParams(this.config(KEY_MAP_QUERY_PARAMS))); // Track default: pageview

      if (isUndefined(name) || name === callback) {
        eventName = ACTION_PV;
      } // Track custom events
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
      } // Track custom events in format of name,object
      else {
        this._dataSetter(eventData, options);

        eventName = name;
      }

      eventData[IDPTNC] = randomString(); // Add some defaults for pageview

      if (eventName === ACTION_PV) {
        eventData.url = eventData.url || this.getPageUrl();
        eventData.title = eventData.title || this.getPageTitle();
        eventData.domain = eventData.domain || this.getDomainName();
        eventData.uri = eventData.uri || this.getURI();
        eventData[SCROLL_DEPTH] = getScrollDepth();
        eventData.returning = isUndefined(eventData.returning) ? false : eventData.returning;
        if (!lastArg || !lastArg.lifecycle) lifecycle = LIFECYCLE_PAGE;

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
        lifecycle: lifecycle,
        callback: callback,
        beforeCallback: beforeCallback,
        errorCallback: errorCallback,
        queue: queue,
        useBeacon: useBeacon,
        retrack: retrack,
        timeout: timeout
      });

      this.startPing();
      return this;
    };

    _proto.update = function update(idptnc, options, lastArg) {
      var _eventData;

      var callback;
      var beforeCallback;
      var errorCallback;
      var queue = false;
      var useBeacon = true;
      if (isFunction(lastArg)) callback = lastArg;else if (isObject(lastArg)) {
        if (isFunction(lastArg.callback)) callback = lastArg.callback;else if (isFunction(lastArg.onSuccess)) callback = lastArg.onSuccess;
        if (isFunction(lastArg.onBeforeSend)) beforeCallback = lastArg.onBeforeSend;
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
      var eventData = (_eventData = {}, _eventData[IDPTNC] = idptnc, _eventData.project = this.config(KEY_DOMAIN) || Woopra.getHostnameNoWww(), _eventData);
      var rawData = {};

      for (var _iterator2 = _createForOfIteratorHelperLoose(ACTION_PROPERTY_ALIASES), _step2; !(_step2 = _iterator2()).done;) {
        var _step2$value = _step2.value,
            original = _step2$value[0],
            alias = _step2$value[1];

        if (options && options[original]) {
          rawData[alias] = options[original];
        }
      }

      if (this.config(KEY_USE_COOKIES)) {
        rawData.cookie = this.getCookie() || this.cookie;
      }

      this._dataSetter(eventData, rawData);

      this._dataSetter(eventData, prefixObjectKeys(options, ACTION_PROPERTY_PREFIX, ACTION_PROPERTY_ALIASES));

      this._push({
        endpoint: 'update',
        fullEventData: eventData,
        callback: callback,
        beforeCallback: beforeCallback,
        errorCallback: errorCallback,
        queue: queue,
        useBeacon: useBeacon
      });

      return this;
    };

    _proto.cancelAction = function cancelAction(idptnc) {
      var hasCancelled = false;
      this.pending = this.pending.map(function (item) {
        if (item.params[IDPTNC] === idptnc) {
          var _extends2;

          hasCancelled = true;
          return _extends({}, item, {
            meta: _extends({}, item.meta, (_extends2 = {}, _extends2[META_CANCELLED] = true, _extends2[META_DIRTY] = true, _extends2[META_DURATION] = item.lifecycle === LIFECYCLE_PAGE ? item.meta[META_DURATION] + (Date.now() - item.meta[META_TIMESTAMP]) : item.meta[META_DURATION], _extends2[META_RETRACK] = false, _extends2))
          });
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
    ;

    _proto.trackForm = function trackForm(eventName, selector, options) {
      var _this3 = this;

      if (eventName === void 0) {
        eventName = 'Tracked Form';
      }

      var els;

      var _options = isString(selector) ? options || {} : selector || {};

      var bindEl = function bindEl(el, ev, props, opts) {
        addEventListener$1(el, 'submit', function (e) {
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

      if (!el.getAttribute(DATA_TRACKED_ATTRIBUTE)) {
        var useBeacon = Boolean(this.config(KEY_BEACONS));
        var properties = Woopra.serializeForm(el, options);

        if (isFunction(options.identify)) {
          var personData = options.identify(properties) || {};

          if (personData) {
            this.identify(personData);
          }
        }

        var onBeforeSend = isFunction(options.onBeforeSend) ? options.onBeforeSend : undefined;

        var _onSuccess = isFunction(options.callback) ? function () {
          return options.callback(properties);
        } : undefined;

        var onError = isFunction(options.onError) ? options.onError : undefined;
        if (!options.noSubmit) el.setAttribute(DATA_TRACKED_ATTRIBUTE, 1);

        if (options.noSubmit || useBeacon) {
          this.track(eventName, properties, {
            onBeforeSend: onBeforeSend,
            onError: onError,
            onSuccess: _onSuccess,
            useBeacon: useBeacon
          });
        } else {
          e.preventDefault();
          e.stopPropagation(); // set timeout to resubmit (default 250ms)
          // so even if woopra does not reply it will still
          // submit the form

          var timer = setTimeout(function () {
            if (!trackFinished) {
              el.submit();
            }
          }, this.config(KEY_FORM_PAUSE));
          this.track(eventName, properties, {
            onBeforeSend: onBeforeSend,
            onSuccess: function onSuccess() {
              clearTimeout(timer);
              if (_onSuccess) _onSuccess();
              if (!trackFinished) el.submit();
              trackFinished = true;
            },
            onError: onError
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
        addEventListener$1(el, EVENT_CLICK, function (e) {
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

      if (!el.getAttribute(DATA_TRACKED_ATTRIBUTE)) {
        var useBeacon = Boolean(this.config(KEY_BEACONS));
        var onBeforeSend = isFunction(options.onBeforeSend) ? options.onBeforeSend : undefined;

        var _onSuccess2 = isFunction(options.callback) ? function () {
          return options.callback(properties);
        } : undefined;

        var onError = isFunction(options.onError) ? options.onError : undefined;
        if (!options.noNav) el.setAttribute(DATA_TRACKED_ATTRIBUTE, 1);

        if (options.noNav || useBeacon) {
          this.track(eventName, properties, {
            onBeforeSend: onBeforeSend,
            onError: onError,
            onSuccess: _onSuccess2,
            useBeacon: useBeacon
          });
        } else {
          e.preventDefault(); // set timeout to resubmit (default 250ms)
          // so even if woopra does not reply it will still
          // click the link

          var timer = setTimeout(function () {
            if (!trackFinished) {
              el.click();
            }
          }, this.config(KEY_CLICK_PAUSE));
          this.track(eventName, properties, {
            onBeforeSend: onBeforeSend,
            onSuccess: function onSuccess() {
              clearTimeout(timer);
              if (_onSuccess2) _onSuccess2();
              if (!trackFinished) el.click();
              trackFinished = true;
            },
            onError: onError
          });
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
      if (this.config(KEY_PING) && this.idle < this.config(KEY_IDLE_TIMEOUT)) ; else {
        this.stopPing();
      }

      var now = Date.now();

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

      this.sendBeacons();
      return this;
    };

    _proto._updateDurations = function _updateDurations(oldState, newState) {
      var now = Date.now();
      this.pending = this.pending.map(function (item) {
        var _extends4, _extends5, _extends6;

        if (item.lifecycle === LIFECYCLE_PAGE) {
          switch (newState) {
            case PAGE_LIFECYCLE_STATE_ACTIVE:
            case PAGE_LIFECYCLE_STATE_PASSIVE:
              if (now - item.meta[META_LEAVE] > item.params.timeout) {
                var _extends3;

                return _extends({}, item, {
                  meta: _extends({}, item.meta, (_extends3 = {}, _extends3[META_EXPIRED] = true, _extends3))
                });
              }

              if (newState === PAGE_LIFECYCLE_STATE_ACTIVE && oldState === PAGE_LIFECYCLE_STATE_PASSIVE || newState === PAGE_LIFECYCLE_STATE_PASSIVE && oldState === PAGE_LIFECYCLE_STATE_ACTIVE) {
                return item;
              }

              return _extends({}, item, {
                meta: _extends({}, item.meta, (_extends4 = {}, _extends4[META_TIMESTAMP] = now, _extends4))
              });

            case PAGE_LIFECYCLE_STATE_HIDDEN:
              return _extends({}, item, {
                meta: _extends({}, item.meta, (_extends5 = {}, _extends5[META_DIRTY] = item.meta[META_DIRTY] || now - item.meta[META_TIMESTAMP] > 100, _extends5[META_DURATION] = item.meta[META_DURATION] + (now - item.meta[META_TIMESTAMP]), _extends5[META_LEAVE] = now, _extends5))
              });

            case PAGE_LIFECYCLE_STATE_TERMINATED:
              return _extends({}, item, {
                meta: _extends({}, item.meta, (_extends6 = {}, _extends6[META_DIRTY] = item.meta[META_DIRTY] || now - item.meta[META_LEAVE] > 100, _extends6))
              });
          }
        }

        return item;
      });
    };

    _proto._processLifecycle = function _processLifecycle(lifecycle) {
      var _this6 = this;

      var toRetrack = [];
      this.pending.forEach(function (item) {
        if (item.meta[META_EXPIRED] && !item.meta[META_CANCELLED] && item.meta[META_RETRACK]) {
          var _extends7;

          toRetrack.push(_extends({}, item.args, {
            eventData: _extends({}, item.args.eventData || {}, (_extends7 = {}, _extends7[IDPTNC] = randomString(), _extends7.returning = true, _extends7))
          }));
        }
      });
      toRetrack.forEach(function (item) {
        return _this6._push(item);
      });
      this.pending = this.pending.filter(function (item) {
        if (item.meta[META_EXPIRED]) return false;

        if (item.meta[META_DIRTY]) {
          _this6.beaconQueue.push({
            lifecycle: item.lifecycle,
            endpoint: item.endpoint,
            params: _extends({}, item.params),
            meta: _extends({}, item.meta),
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
      this.pending = this.pending.map(function (item) {
        var _extends8;

        return _extends({}, item, {
          meta: _extends({}, item.meta, (_extends8 = {}, _extends8[META_DIRTY] = false, _extends8[META_SENT] = true, _extends8))
        });
      });
      return toRetrack.length > 0;
    };

    _proto._drainBeaconQueue = function _drainBeaconQueue() {
      var _this7 = this;

      var useCookies = this.config(KEY_USE_COOKIES);

      function isEmptyBeaconParams(params) {
        params[IDPTNC];
            params.cookie;
            params.project;
            params.event;
            var rest = _objectWithoutPropertiesLoose(params, [IDPTNC, "cookie", "project", "event"].map(_toPropertyKey));

        return Object.keys(rest).length > 0;
      }

      var idMap = this.beaconQueue.reduce(function (idMap, item) {
        idMap[item.params[IDPTNC]] = [];
        return idMap;
      }, {});
      this.beaconQueue.forEach(function (item) {
        idMap[item.params[IDPTNC]].push(item);
      });
      this.beaconQueue = [];
      var toSend = Object.keys(idMap).map(function (id) {
        var items = idMap[id];
        var data = {
          endpoint: undefined,
          params: {},
          onSuccess: [],
          onError: []
        };
        items.forEach(function (item) {
          if (!data.endpoint) {
            if (item.endpoint === 'ce' && item.meta[META_SENT]) {
              data.endpoint = 'update';
            } else {
              data.endpoint = item.endpoint;
            }
          }

          data.params.project = item.params.project;
          data.params.event = item.params.event;
          data.params[IDPTNC] = item.params[IDPTNC];

          if (useCookies) {
            data.params.cookie = _this7.getCookie() || _this7.cookie;
          }

          if (item.lifecycle === LIFECYCLE_PAGE) {
            if (item.meta[META_DURATION] > 0) {
              data.params.duration = item.meta[META_DURATION];
            }
          }

          if (item.meta[SCROLL_DEPTH]) {
            data.params["" + ACTION_PROPERTY_PREFIX + SCROLL_DEPTH] = Math.round(item.meta[SCROLL_DEPTH] * 10000) / 10000;
          }

          if (!item.meta[META_SENT]) {
            data.params = _extends({}, data.params, item.params);

            if (isFunction(item.successCallback)) {
              data.onSuccess.push(item.successCallback);
            }

            if (isFunction(item.errorCallback)) {
              data.onError.push(item.errorCallback);
            }
          }
        });

        if (!data.params.project) {
          data.params.project = _this7.config(KEY_DOMAIN) || Woopra.getHostnameNoWww();
        }

        return data;
      }).filter(function (item) {
        return isEmptyBeaconParams(item.params);
      });

      if (toSend.length > 0) {
        if (this.config(KEY_BEACONS)) {
          var payloads = [''];
          var lines = toSend.map(function (_ref) {
            var endpoint = _ref.endpoint,
                params = _ref.params;
            return JSON.stringify({
              endpoint: endpoint,
              params: params
            });
          }); // chunk beacons into < 64 KiB chunks

          lines.forEach(function (line) {
            if (new Blob(["" + payloads[payloads.length - 1] + line]).size >= 65000) {
              payloads.push('');
            }

            payloads[payloads.length - 1] += line + "\n";
          });
          payloads.forEach(function (payload, index) {
            var formData = new FormData();
            formData.append('payload', payload.slice(0, -1));
            navigator.sendBeacon.call(navigator, _this7.getEndpoint('push'), formData);
          });
          toSend.forEach(function (item) {
            item.onSuccess.forEach(function (callback) {
              return callCallback(callback, item.params.event);
            });
          });
        } else {
          toSend.forEach(function (item) {
            var endpoint = _this7.getEndpoint(item.endpoint);

            var queryString = Woopra.buildUrlParams(_extends({
              close: true
            }, item.params));
            var scriptUrl = endpoint + "?" + queryString;

            var onSuccess = function onSuccess() {
              return item.onSuccess.forEach(function (callback) {
                return callCallback(callback, item.params.event);
              });
            };

            var onError = function onError() {
              return item.onError.forEach(function (callback) {
                return callCallback(callback, item.params.event);
              });
            };

            Woopra.loadScript(scriptUrl, onSuccess, onError);
          });
        }
      }
    };

    _proto.sendBeacons = function sendBeacons(lifecycle) {
      if (lifecycle === void 0) {
        lifecycle = LIFECYCLE_ACTION;
      }

      this._processLifecycle(lifecycle);

      this._drainBeaconQueue();
    }
    /**
     * synchronous sleep
     */
    ;

    _proto.sleep = function sleep() {// Why does this exist?
    };

    _proto._touch = function _touch(last_activity) {
      if (last_activity === void 0) {
        last_activity = Date.now();
      }

      this.last_activity = last_activity;
      this.idle = 0;
    } // User Action tracking and event handlers

    /**
     * Clicks
     */

    /**
     * Measure when the user last moved their mouse to update idle state
     */
    ;

    _proto.moved = function moved(e, last_activity) {
      this._touch(last_activity);
    };

    _proto.onLink = function onLink(e, link) {
      var useBeacons = Boolean(this.config(KEY_BEACONS));
      var downloadTypes = this.config(KEY_DOWNLOAD_EXTENSIONS);
      var downloadFileTypeRegexp = new RegExp("(?:" + downloadTypes.join('|') + ")($|&)", 'i');
      var isDownloadFileType = downloadFileTypeRegexp.test(link.pathname);

      if (this.config(KEY_DOWNLOAD_TRACKING) && isDownloadFileType) {
        fire(EVENT_DOWNLOAD, link.href);

        if (link.target !== TARGET_BLANK && Woopra.leftClick(e)) {
          link.setAttribute(DATA_TRACKED_ATTRIBUTE, 1);

          if (!useBeacons) {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(function () {
              link.click();
            }, this.config(KEY_DOWNLOAD_PAUSE));
          }
        }
      } // Make sure
      // * outgoing tracking is enabled
      // * this URL does not match a download URL (doesn't end
      //   in a binary file extension)
      // * not ignoring subdomains OR link hostname is not a partial
      //   match of current hostname (to check for subdomains),
      // * hostname is not empty


      if (this.config(KEY_OUTGOING_TRACKING) && !isDownloadFileType && Woopra.isOutgoingLink(link.hostname)) {
        fire(EVENT_OUTGOING, link.href);

        if (link.target !== TARGET_BLANK && Woopra.leftClick(e)) {
          link.setAttribute(DATA_TRACKED_ATTRIBUTE, 1);

          if (!useBeacons) {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(function () {
              link.click();
            }, this.config(KEY_OUTGOING_PAUSE));
          }
        }
      }
    };

    _proto.downloaded = function downloaded(url) {
      var useBeacon = Boolean(this.config(KEY_BEACONS));
      this.track(EVENT_DOWNLOAD, {
        url: url
      }, {
        useBeacon: useBeacon
      });
    };

    _proto.outgoing = function outgoing(url) {
      var useBeacon = Boolean(this.config(KEY_BEACONS));
      this.track(EVENT_OUTGOING, {
        url: url
      }, {
        useBeacon: useBeacon
      });
    };

    _proto.onUnload = function onUnload() {
      if (!this.isUnloading) {
        this.isUnloading = true;

        this._updateDurations(PAGE_LIFECYCLE_STATE_HIDDEN, PAGE_LIFECYCLE_STATE_TERMINATED);

        this.sendBeacons(LIFECYCLE_PAGE);
      }
    };

    _proto.onPageStateChange = function onPageStateChange(e) {
      var newState = e.newState,
          oldState = e.oldState;

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
    };

    _proto.onScroll = function onScroll(e) {
      this._touch();

      var scrollDepth = getScrollDepth();
      var pages = this.pending.filter(function (item) {
        return item.lifecycle === LIFECYCLE_PAGE;
      });
      pages.forEach(function (pv) {
        pv.meta[SCROLL_DEPTH] = Math.min(1, Math.max(scrollDepth, pv.meta[SCROLL_DEPTH] || 0));
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
      var domains = isString(xdm) ? [xdm] : _isArray(xdm) ? xdm : [];
      var canDecorate;

      for (var i = 0; i < domains.length; i++) {
        if (elem.hostname.indexOf(domains[i]) !== -1) {
          canDecorate = true;
          break;
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

      if (isString(url)) {
        el = document.createElement('a');
        el.href = url;
        query = el.search ? '&' : '?';
      } else if (url && url.href) {
        el = url;
      }

      if (el) {
        query = el.search ? '&' : '?';
        pathname = el.pathname && el.pathname.charAt(0) === '/' ? el.pathname : "/" + el.pathname;
        host = el.hostname + (el.port && el.port !== '' && el.port !== '80' && el.port !== '0' ? ":" + el.port : '');
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
        project: this.config(KEY_DOMAIN) || Woopra.getHostnameNoWww(),
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

  window.WoopraTracker = Tracker;
  window.WoopraLoadScript = Woopra.loadScript;
  attachGlobalEvents();

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
