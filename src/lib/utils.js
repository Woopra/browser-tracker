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

export const noop = () => null;

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
  const _options =
    typeof selector === 'string' ? options || {} : selector || {};

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
export function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * Checks if string starts with prefix
 *
 * @param {string} str The haystack string
 * @param {string} prefix The needle
 * @return {boolean} True if needle was found in haystack
 */
export function startsWith(str, prefix) {
  return str.indexOf(prefix) === 0;
}

/**
 * Checks if `value` is `undefined`
 *
 * @param {*} value The value to check.
 * @return {boolean} Returns `true` if `value` is `undefined`, else `false`.
 */
export function isUndefined(value) {
  return value === undefined;
}

const toString = Object.prototype.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @param {*} value The value to check.
 * @return {boolean} Returns `true` if `value` is a function, else `false`.
 */
export function isFunction(value) {
  if (typeof value === 'function') return true;
  if (typeof value !== 'object') return false;

  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  const tag = toString.call(value);
  return (
    tag === '[object Function]' ||
    tag === '[object AsyncFunction]' ||
    tag === '[object GeneratorFunction]' ||
    tag === '[object Proxy]'
  );
}
