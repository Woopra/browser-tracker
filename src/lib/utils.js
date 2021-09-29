import { isFinite, isFunction, isString, isUndefined } from 'lodash-es';
import { RANDOM_STRING_CHARS } from '../constants';

/**
 * Generates a random 12 character string
 *
 * @return {String} Returns a random 12 character string
 */
export function randomString() {
  let s = '';

  for (let i = 0; i < 12; i++) {
    const rnum = Math.floor(Math.random() * RANDOM_STRING_CHARS.length);
    s += RANDOM_STRING_CHARS.substring(rnum, rnum + 1);
  }

  return s;
}

export function isLeftClick(evt = window.event) {
  const button =
    (!isUndefined(evt.which) && evt.which === 1) ||
    (!isUndefined(evt.button) && evt.button === 0);
  return button && !evt.metaKey && !evt.altKey && !evt.ctrlKey && !evt.shiftKey;
}

/**
 * Helper to either query an element by id, or return element if passed
 * through options
 *
 * Supports searching by ids and classnames (or querySelector if browser supported)
 */
export function getElement(selector, options) {
  const _options = isString(selector) ? options || {} : selector || {};

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

export function prefixObjectKeys(object, prefix, blacklist) {
  const obj = {};

  if (isUndefined(object)) return obj;

  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      const value = object[key];

      let isBlacklisted = false;

      for (let i = 0; i < blacklist.length; i++) {
        if (blacklist[i][0] === key) {
          isBlacklisted = true;
          break;
        }
      }

      if (
        !isBlacklisted &&
        value !== 'undefined' &&
        value !== 'null' &&
        !isUndefined(value)
      ) {
        obj[`${prefix}${key}`] = value;
      }
    }
  }

  return obj;
}

export function getScrollDepth() {
  const scrollHeight = document.body.scrollHeight;

  const scrollDepth =
    ((window.scrollY || 0) + window.innerHeight) / scrollHeight;

  return Math.max(0, Math.min(1, isFinite(scrollDepth) ? scrollDepth : 0));
}

export function callCallback(callback, action) {
  try {
    callback();
  } catch (e) {
    console.error(`Error in Woopra ${action} callback`); // eslint-disable-line no-console
    console.error(e.stack); // eslint-disable-line no-console
  }
}

export function findParentAnchorElement(elem) {
  let anchor = elem;

  while (!isUndefined(anchor) && anchor !== null) {
    if (anchor.tagName && anchor.tagName.toLowerCase() === 'a') {
      break;
    }
    anchor = anchor.parentNode;
  }

  return anchor;
}

export function hasBeaconSupport() {
  return isFunction(navigator.sendBeacon);
}
