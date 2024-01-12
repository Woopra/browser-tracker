import { isFunction, isUndefined } from 'lodash-es';

import attachGlobalEvents from './lib/global-events';
import Tracker from './tracker';
import Woopra from './woopra';

if (!window.WoopraTracker) attachGlobalEvents();

window.WoopraTracker = Tracker;
window.WoopraLoadScript = Woopra.loadScript;

if (!isUndefined(window.exports)) {
  Woopra.Tracker = Tracker;
  window.exports.Woopra = Woopra;

  if (isFunction(window.woopraLoaded)) {
    window.woopraLoaded();
    window.woopraLoaded = null;
  }
}

// Initialize instances & preloaded settings/events
const _queue = window.__woo || window._w;
if (!isUndefined(_queue)) {
  for (const name in _queue) {
    if (_queue.hasOwnProperty(name)) {
      const instance = new Tracker(name);
      instance.init();

      // DO NOT REMOVE
      // compatibility with old tracker and chat
      if (isUndefined(window.woopraTracker)) {
        window.woopraTracker = instance;
      }
    }
  }
}
