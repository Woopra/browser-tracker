import './polyfills/add-event-listener';
import Tracker from './tracker';
import { loadScript } from './lib/script';
import { attachEvents } from './events';

window.WoopraTracker = Tracker;
window.WoopraLoadScript = loadScript;

attachEvents();

if (typeof window.exports !== 'undefined') {
  Woopra.Tracker = Tracker;
  window.exports.Woopra = Woopra;
  
  if (typeof window.woopraLoaded === 'function') {
    window.woopraLoaded();
    window.woopraLoaded = null;
  }
}

// Initialize instances & preloaded settings/events
var _queue = window.__woo || window._w;
if (typeof _queue !== 'undefined') {
  for (var name in _queue) {
    if (_queue.hasOwnProperty(name)) {
      var instance = new Tracker(name);
      instance.init();
      
      // DO NOT REMOVE
      // compatibility with old tracker and chat
      if (typeof window.woopraTracker === 'undefined') {
        window.woopraTracker = instance;
      }
    }
  }
}
