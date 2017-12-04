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
};

export function isLeftClick(evt = window.event) {
  const button = (typeof evt.which !== 'undefined' && evt.which === 1) ||
  (typeof evt.button !== 'undefined' && evt.button === 0);
  return button && !evt.metaKey && !evt.altKey && !evt.ctrlKey && !evt.shiftKey;
}

/**
* Helper to either query an element by id, or return element if passed
* through options
*
* Supports searching by ids and classnames (or querySelector if browser supported)
*/
export function getElement(selector, options) {
  const _options = typeof selector === 'string' ? options || {} : selector || {};
  
  if (_options.el) {
    return _options.el;
  }
  else if (typeof selector === 'string') {
    if (document.querySelectorAll) {
      return document.querySelectorAll(selector);
    }
    else if (selector[0] === '#') {
      return document.getElementById(selector.substr(1));
    }
    else if (selector[0] === '.') {
      return document.getElementsByClassName(selector.substr(1));
    }
  }
}
