export const VERSION = 11;
export const ENDPOINT = 'www.woopra.com/track/';
export const XDM_PARAM_NAME = '__woopraid';
export const CAMPAIGN_KEYS = [
  'campaign',
  'content',
  'id',
  'medium',
  'source',
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
export const MIN_PING_INTERVAL = 6_000;
export const MAX_PING_INTERVAL = 60_000;
export const URL_ID_REGEX = new RegExp(XDM_PARAM_NAME + '=([^&#]+)');

export const LIFECYCLE_ACTION = 'action';
export const LIFECYCLE_PAGE = 'page';

export const SCROLL_DEPTH = 'scroll depth';

export const ACTION_PV = 'pv';

export const IDPTNC = 'idptnc';

export const TARGET_BLANK = '_blank';

export const DATA_TRACKED_ATTRIBUTE = 'data-tracked';

export const ACTION_PROPERTY_PREFIX = 'ce_';
export const VISIT_PROPERTY_PREFIX = 'cs_';
export const VISITOR_PROPERTY_PREFIX = 'cv_';
export const ORG_PROPERTY_PREFIX = 'co_';

export const ENDPOINT_TRACK = 'ce';
export const ENDPOINT_UPDATE = 'update';
export const ENDPOINT_IDENTIFY = 'identify';

export const PAGE_LIFECYCLE_STATE_ACTIVE = 'active';
export const PAGE_LIFECYCLE_STATE_PASSIVE = 'passive';
export const PAGE_LIFECYCLE_STATE_HIDDEN = 'hidden';
export const PAGE_LIFECYCLE_STATE_FROZEN = 'frozen';
export const PAGE_LIFECYCLE_STATE_TERMINATED = 'terminated';

export const EVENT_BEFOREUNLOAD = 'beforeunload';
export const EVENT_BLUR = 'blur';
export const EVENT_CLICK = 'click';
export const EVENT_DOWNLOAD = 'download';
export const EVENT_FOCUS = 'focus';
export const EVENT_FREEZE = 'freeze';
export const EVENT_LINK_CLICK = 'link';
export const EVENT_MOUSEDOWN = 'mousedown';
export const EVENT_MOUSEMOVE = 'mousemove';
export const EVENT_OUTGOING = 'outgoing';
export const EVENT_PAGEHIDE = 'pagehide';
export const EVENT_PAGESHOW = 'pageshow';
export const EVENT_RESUME = 'resume';
export const EVENT_SCROLL = 'scroll';
export const EVENT_STATECHANGE = 'statechange';
export const EVENT_UNLOAD = 'unload';
export const EVENT_VISIBILITYCHANGE = 'visibilitychange';

export const KEY_APP = 'app';
export const KEY_AUTO_DECORATE = 'auto_decorate';
export const KEY_BEACONS = 'beacons';
export const KEY_CAMPAIGN_ONCE = 'campaign_once';
export const KEY_CLICK_TRACKING_MATCHER_SELECTORS =
  'click_tracking_matcher_selectors';
export const KEY_CLICK_PAUSE = 'click_pause';
export const KEY_CLICK_TRACKING = 'click_tracking';
export const KEY_CONTEXT = 'context';
export const KEY_COOKIE_DOMAIN = 'cookie_domain';
export const KEY_COOKIE_EXPIRE = 'cookie_expire';
export const KEY_COOKIE_NAME = 'cookie_name';
export const KEY_COOKIE_PATH = 'cookie_path';
export const KEY_COOKIE_SECURE = 'cookie_secure';
export const KEY_CROSS_DOMAIN = 'cross_domain';
export const KEY_DOMAIN = 'domain';
export const KEY_DOWNLOAD_EXTENSIONS = 'download_extensions';
export const KEY_DOWNLOAD_PAUSE = 'download_pause';
export const KEY_DOWNLOAD_TRACKING = 'download_tracking';
export const KEY_FORM_PAUSE = 'form_pause';
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

export const META_CANCELLED = 'cancelled';
export const META_DIRTY = 'dirty';
export const META_DURATION = 'duration';
export const META_EXPIRED = 'expired';
export const META_LEAVE = 'leave';
export const META_RETRACK = 'retrack';
export const META_SENT = 'sent';
export const META_TIMESTAMP = 'timestamp';

export const ACTION_PROPERTY_ALIASES = [
  [IDPTNC, IDPTNC],
  ['$duration', 'duration'],
  ['$domain', 'domain'],
  ['$app', 'app'],
  ['$timestamp', 'timestamp'],
  ['$action', 'event']
];

export const DEFAULT_DOWNLOAD_EXTENSIONS = [
  'avi',
  'css',
  'dmg',
  'doc',
  'eps',
  'exe',
  'js',
  'm4v',
  'mov',
  'mp3',
  'mp4',
  'msi',
  'pdf',
  'ppt',
  'rar',
  'svg',
  'txt',
  'vsd',
  'vxd',
  'wma',
  'wmv',
  'xls',
  'xlsx',
  'zip'
];

export const ELEMENT_MATCHER_LINK = ['a'];

export const ELEMENT_MATCHER_CLICK = [
  'a',
  'button',
  'input[type=button]',
  'input[type=submit]',
  '[role=button]'
];
