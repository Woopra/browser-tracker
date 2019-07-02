export const VERSION = 11;
export const ENDPOINT = 'www.woopra.com/track/';
export const XDM_PARAM_NAME = '__woopraid';
export const CAMPAIGN_KEYS = [
  'source',
  'medium',
  'content',
  'campaign',
  'term'
];
export const SECOND_LEVEL_TLDS = [
  'com.au',
  'net.au',
  'org.au',
  'co.hu',
  'com.ru',
  'ac.za',
  'net.za',
  'com.za',
  'co.za',
  'co.uk',
  'org.uk',
  'me.uk',
  'net.uk'
];
export const RANDOM_STRING_CHARS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const MIN_PING_INTERVAL = 6000;
export const MAX_PING_INTERVAL = 60000;
export const URL_ID_REGEX = new RegExp(XDM_PARAM_NAME + '=([^&#]+)');

export const KEY_ACTION_PV = 'pv';

export const KEY_EVENT_CLICK = 'click';
export const KEY_EVENT_DOWNLOAD = 'download';
export const KEY_EVENT_MOUSEDOWN = 'mousedown';
export const KEY_EVENT_MOUSEMOVE = 'mousemove';
export const KEY_EVENT_OUTGOING = 'outgoing';

export const KEY_APP = 'app';
export const KEY_AUTO_DECORATE = 'auto_decorate';
export const KEY_CAMPAIGN_ONCE = 'campaign_once';
export const KEY_CONTEXT = 'context';
export const KEY_COOKIE_DOMAIN = 'cookie_domain';
export const KEY_COOKIE_EXPIRE = 'cookie_expire';
export const KEY_COOKIE_NAME = 'cookie_name';
export const KEY_COOKIE_PATH = 'cookie_path';
export const KEY_CROSS_DOMAIN = 'cross_domain';
export const KEY_DOMAIN = 'domain';
export const KEY_DOWNLOAD_PAUSE = 'download_pause';
export const KEY_DOWNLOAD_TRACKING = 'download_tracking';
export const KEY_HIDE_CAMPAIGN = 'hide_campaign';
export const KEY_HIDE_XDM_DATA = 'hide_xdm_data';
export const KEY_IDLE_THRESHOLD = 'idle_threshold';
export const KEY_IDLE_TIMEOUT = 'idle_timeout';
export const KEY_IGNORE_QUERY_URL = 'ignore_query_url';
export const KEY_IP = 'ip';
export const KEY_MAP_QUERY_PARAMS = 'map_query_params';
export const KEY_OUTGOING_IGNORE_SUBDOMAIN = 'outgoing_ignore_subdomain';
export const KEY_OUTGOING_PAUSE = 'outgoing_pause';
export const KEY_OUTGOING_TRACKING = 'outgoing_tracking';
export const KEY_PERSONALIZATION = 'personalization';
export const KEY_PING = 'ping';
export const KEY_PING_INTERVAL = 'ping_interval';
export const KEY_PROTOCOL = 'protocol';
export const KEY_SAVE_URL_HASH = 'save_url_hash';
export const KEY_THIRD_PARTY = 'third_party';
export const KEY_USE_COOKIES = 'use_cookies';
