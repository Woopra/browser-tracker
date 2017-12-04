import { getUrlParams, hideUrlParams } from './url';
import { CAMPAIGN_KEYS } from '../constants';

/**
* Parses current URL for parameters that start with either `utm_` or `woo_`
* and have the keys `source`, `medium`, `content`, `campaign`, `term`
*
* @return {Object} Returns an object with campaign keys as keys
*/
export function getCampaignData() {
  const vars = getUrlParams();
  const campaign = {};
  
  for (let i = 0; i < CAMPAIGN_KEYS.length; i++) {
    const key = CAMPAIGN_KEYS[i];
    const value = vars['utm_' + key] || vars['woo_' + key];
    
    if (typeof value !== 'undefined') {
      campaign['campaign_' + (key === 'campaign' ? 'name' : key)] = value;
    }
  }
  
  return campaign;
};

/**
* Hides any campaign data (query params: wv_, woo_, utm_) from the URL
* by using pushState (if available)
*/
export function hideCampaignData() {
  return hideUrlParams(['wv_', 'woo_', 'utm_']);
};
