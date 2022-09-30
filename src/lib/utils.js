import {
  isArray,
  isFinite,
  isFunction,
  isPlainObject,
  isString,
  isUndefined
} from 'lodash-es';
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

export function jsonStringifyObjectValues(object) {
  const obj = {};

  if (isUndefined(object)) return obj;

  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      if (isPlainObject(object[key]) || isArray(object[key])) {
        try {
          obj[key] = JSON.stringify(object[key]);
        } catch {
          obj[key] = object[key];
        }
      } else obj[key] = object[key];
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

function matchesElement(element, matcher) {
  return matcher.some((sel) => element.matches(sel));
}

export function findParentElement(element, matcher) {
  let elem = element;

  while (!isUndefined(elem) && elem !== null) {
    if (elem.tagName && matchesElement(elem, matcher)) break;

    elem = elem.parentNode;
  }

  return elem;
}

export function hasBeaconSupport() {
  return isFunction(navigator.sendBeacon);
}

export function getDOMPath(element) {
  const stack = [];

  let elem = element;

  while (elem.parentNode) {
    let count = 0;
    let index = 0;

    for (let i = 0; i < elem.parentNode.childNodes.length; i++) {
      const siblingElement = elem.parentNode.childNodes[i];

      if (siblingElement.nodeName === elem.nodeName) {
        if (siblingElement === elem) index = count;

        count++;
      }
    }

    const nodeName = elem.nodeName.toLowerCase();

    if (elem.hasAttribute('id') && elem.id) {
      stack.unshift(`${nodeName}#${elem.id}`);
    } else if (count > 1) {
      stack.unshift(`${nodeName}[${index}]`);
    } else {
      stack.unshift(nodeName);
    }

    elem = elem.parentNode;
  }

  return stack.slice(1).join(' > ');
}
