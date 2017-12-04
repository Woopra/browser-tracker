import includes from 'core-js/library/fn/array/includes';
import startsWith from 'core-js/library/fn/string/starts-with';

import { XDM_PARAM_NAME, SECOND_LEVEL_TLDS } from '../constants';

export function getHostname() {
  return window.location.hostname;
}

/**
* Hides any URL parameters by calling window.history.replaceState
*
* @param {Array} params A list of parameter prefixes that will be hidden
* @return {String} Returns the new URL that will be used
*/
export function hideUrlParams(params) {
  const regex = new RegExp('[?&]+((?:' + params.join('|') + ')[^=&]*)=([^&#]*)', 'gi');
  const href = window.location.href.replace(regex, '');
  
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, null, href);
  }
  
  return href;
}

/**
* Retrieves the current URL parameters as an object
*
* @return {Object} An object for all of the URL parameters
*/
export function getUrlParams() {
  const vars = {};
  const { href } = window.location;
  
  if (href) {
    href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
      vars[key] = decodeURIComponent(value.split('+').join(' '));
    });
  }

  return vars;
}

export function buildUrlParams(params, prefix = '') {
  const p = [];
  
  if (typeof params === 'undefined') {
    return params;
  }
  
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      if (params[key] !== 'undefined' &&
      params[key] !== 'null' &&
      typeof params[key] !== 'undefined') {
        p.push(prefix + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    }
  }
  return p.join('&');
}

/**
* Parses the URL parameters for data beginning with a certain prefix
*
* @param {Function} method The callback method for each key found matching `prefix`
* @param {string} prefix The prefix that the parameter should start with
*/
export function getCustomData(method, prefix = 'wv_') {
  const vars = getUrlParams();
  
  for (let i in vars) {
    if (vars.hasOwnProperty(i)) {
      const value = vars[i];
      
      if (i.substring(0, prefix.length) === prefix) {
        const key = i.substring(prefix.length);
        method.call(this, key, value);
      }
    }
  }
}

/**
* Retrieves the current client domain name using the hostname
* and returning the last two tokens with a `.` separator (domain + tld).
*
* This can be an issue if there is a second level domain
*/
export function getDomain(hostname = getHostname()) {
  const domain = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);
  
  // check if domain is in list of second level domains, ignore if so
  if (includes(domain, SECOND_LEVEL_TLDS)) {
    return hostname.substring(hostname.lastIndexOf('.', hostname.indexOf(domain) - 2) + 1);
  }
  
  return domain;
}

/**
* Returns the current hostname with 'www' stripped out
*/
export function getHostnameNoWww() {
  const hostname = getHostname();
  
  if (hostname.indexOf('www.') === 0) {
    return hostname.replace('www.', '');
  }
  
  return hostname;
};


/**
* Determines if the current URL should be considered an outgoing URL
*/
export function isOutgoingLink(targetHostname) {
  const currentHostname = getHostname();
  const currentDomain = getDomain(currentHostname);
  
  return targetHostname !== currentHostname &&
  targetHostname.replace(/^www\./, '') !== currentHostname.replace(/^www\./, '') &&
  (
    !_outgoing_ignore_subdomain ||
    currentDomain !== getDomain(targetHostname)
  ) &&
  !startsWith(targetHostname, 'javascript') &&
  targetHostname !== '' &&
  targetHostname !== '#';
};

export function hideCrossDomainId() {
  return hideUrlParams([XDM_PARAM_NAME]);
};

export function mapQueryParams(mapping) {
  const vars = getUrlParams();
  const params = {};

  for (let key in mapping) {
    const value = vars[key];
    if (typeof value !== 'undefined') {
        params[mapping[key]] = value;
    }
  }

  return params;
}

export function redirect(link) {
  window.location.href = link;
}
