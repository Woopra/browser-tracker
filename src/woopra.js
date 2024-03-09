import { endsWith, isUndefined, startsWith } from 'lodash-es';
import {
  CAMPAIGN_KEYS,
  KEY_OUTGOING_IGNORE_SUBDOMAIN,
  SECOND_LEVEL_TLDS,
  XDM_PARAM_NAME
} from './constants';
import globals from './globals';
import * as docCookies from './lib/cookies';
import { addEventListener, fire, on } from './lib/events';
import { serializeForm } from './lib/form';
import { loadScript, removeScript } from './lib/script';
import { getElement, isLeftClick, randomString } from './lib/utils';

const Woopra = {};

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
Woopra.historyReplaceState =
  window.history && window.history.replaceState
    ? function historyReplaceState(data, title, url) {
        return window.history.replaceState(data, title, url);
      }
    : function () {};

/**
 * Hides any URL parameters by calling window.history.replaceState
 *
 * @param {Array} params A list of parameter prefixes that will be hidden
 * @return {String} Returns the new URL that will be used
 */
Woopra.hideUrlParams = function hideUrlParams(params) {
  const regex = new RegExp(
    `[?&]+((?:${params.join('|')})[^=&]*)=([^&#]*)`,
    'gi'
  );
  const href = Woopra.location('href').replace(regex, '');

  Woopra.historyReplaceState(window.history?.state ?? null, null, href);

  return href;
};

/**
 * Retrieves the current URL parameters as an object
 *
 * @return {Object} An object for all of the URL parameters
 */
Woopra.getUrlParams = function getUrlParams() {
  const vars = {};
  const href = Woopra.location('href');

  if (href) {
    href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
      vars[key] = decodeURIComponent(value.split('+').join(' '));
    });
  }

  return vars;
};

Woopra.buildUrlParams = function buildUrlParams(params, prefix = '') {
  const p = [];

  if (isUndefined(params)) {
    return params;
  }

  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      if (
        params[key] !== 'undefined' &&
        params[key] !== 'null' &&
        !isUndefined(params[key])
      ) {
        p.push(
          `${prefix}${encodeURIComponent(key)}=${encodeURIComponent(
            params[key]
          )}`
        );
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
Woopra.getCustomData = function getCustomData(method, prefix = 'wv_') {
  const vars = Woopra.getUrlParams();

  for (let i in vars) {
    if (vars.hasOwnProperty(i)) {
      const value = vars[i];

      if (i.substring(0, prefix.length) === prefix) {
        const key = i.substring(prefix.length);
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
Woopra.getDomain = function getDomain(hostname = getHostname()) {
  const domain = hostname.substring(
    hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1
  );

  // check if domain is in list of second level domains, ignore if so
  if (SECOND_LEVEL_TLDS.indexOf(domain) !== -1) {
    return hostname.substring(
      hostname.lastIndexOf('.', hostname.indexOf(domain) - 2) + 1
    );
  }

  return domain;
};

/**
 * Returns the current hostname with 'www' stripped out
 */
Woopra.getHostnameNoWww = function getHostnameNoWww() {
  const hostname = getHostname();

  if (hostname.indexOf('www.') === 0) {
    return hostname.replace('www.', '');
  }

  return hostname;
};

/**
 * Determines if the current URL should be considered an outgoing URL
 */
Woopra.isOutgoingLink = function isOutgoingLink(targetHostname) {
  const currentHostname = getHostname();
  const currentDomain = Woopra.getDomain(currentHostname);

  return (
    targetHostname !== currentHostname &&
    targetHostname.replace(/^www\./, '') !==
      currentHostname.replace(/^www\./, '') &&
    (!globals[KEY_OUTGOING_IGNORE_SUBDOMAIN] ||
      currentDomain !== Woopra.getDomain(targetHostname)) &&
    !Woopra.startsWith(targetHostname, 'javascript') &&
    targetHostname !== '' &&
    targetHostname !== '#'
  );
};

Woopra.hideCrossDomainId = function hideCrossDomainId() {
  return Woopra.hideUrlParams([XDM_PARAM_NAME]);
};

Woopra.mapQueryParams = function mapQueryParams(mapping) {
  const vars = Woopra.getUrlParams();
  const params = {};

  for (let key in mapping) {
    const value = vars[key];
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
  const vars = Woopra.getUrlParams();
  const campaign = {};

  for (let i = 0; i < CAMPAIGN_KEYS.length; i++) {
    const key = CAMPAIGN_KEYS[i];
    const value = vars[`utm_${key}`] || vars[`woo_${key}`];

    if (!isUndefined(value)) {
      campaign[`campaign_${key === 'campaign' ? 'name' : key}`] = value;
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
Woopra.attachEvent = addEventListener;
Woopra.startsWith = startsWith;
Woopra.endsWith = endsWith;

export default Woopra;
