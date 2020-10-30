import globals from '../globals';
import Woopra from '../woopra';
import {
  KEY_AUTO_DECORATE,
  KEY_DOWNLOAD_PAUSE,
  KEY_DOWNLOAD_TRACKING,
  KEY_EVENT_CLICK,
  KEY_EVENT_DOWNLOAD,
  KEY_EVENT_MOUSEDOWN,
  KEY_EVENT_MOUSEMOVE,
  KEY_EVENT_OUTGOING,
  KEY_OUTGOING_PAUSE,
  KEY_OUTGOING_TRACKING
} from '../constants';
import { isUndefined } from './utils';

const on = Woopra.attachEvent;
const fire = Woopra._fire;

// attaches any events
// needs to be handled here, instead of in a tracking instance because
// these events should only be fired once on a page
export default function attachEvents() {
  on(document, KEY_EVENT_MOUSEDOWN, (e) => {
    let cElem;

    fire(KEY_EVENT_MOUSEMOVE, e, new Date());

    if (globals[KEY_AUTO_DECORATE]) {
      cElem = e.srcElement || e.target;
      while (!isUndefined(cElem) && cElem !== null) {
        if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
          break;
        }
        cElem = cElem.parentNode;
      }
      if (!isUndefined(cElem) && cElem !== null) {
        fire(KEY_AUTO_DECORATE, cElem);
      }
    }
  });

  on(document, KEY_EVENT_CLICK, (e) => {
    const ignoreTarget = '_blank';
    let link, _download;

    let cElem = e.srcElement || e.target;

    if (Woopra.leftClick(e)) {
      fire(KEY_EVENT_CLICK, e, cElem);
    }

    if (globals[KEY_DOWNLOAD_TRACKING] || globals[KEY_OUTGOING_TRACKING]) {
      // searches for an anchor element
      while (!isUndefined(cElem) && cElem !== null) {
        if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
          break;
        }
        cElem = cElem.parentNode;
      }

      if (
        !isUndefined(cElem) &&
        cElem !== null &&
        !cElem.getAttribute('data-woopra-tracked')
      ) {
        link = cElem;
        _download = link.pathname.match(
          /(?:doc|dmg|eps|svg|xls|ppt|pdf|xlsx|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3|mp4|m4v)($|\&)/
        );

        if (globals[KEY_DOWNLOAD_TRACKING] && _download) {
          fire(KEY_EVENT_DOWNLOAD, link.href);

          if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
            e.preventDefault();
            e.stopPropagation();

            link.setAttribute('data-woopra-tracked', true);

            setTimeout(() => {
              link.click();
            }, globals[KEY_DOWNLOAD_PAUSE]);
          }
        }
        // Make sure
        // * outgoing tracking is enabled
        // * this URL does not match a download URL (doesn't end
        //   in a binary file extension)
        // * not ignoring subdomains OR link hostname is not a partial
        //   match of current hostname (to check for subdomains),
        // * hostname is not empty
        if (
          globals[KEY_OUTGOING_TRACKING] &&
          !_download &&
          Woopra.isOutgoingLink(link.hostname)
        ) {
          fire(KEY_EVENT_OUTGOING, link.href);

          if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
            e.preventDefault();
            e.stopPropagation();

            link.setAttribute('data-woopra-tracked', true);

            setTimeout(() => {
              link.click();
            }, globals[KEY_OUTGOING_PAUSE]);
          }
        }
      }
    }
  });

  on(document, KEY_EVENT_MOUSEMOVE, (e) => {
    fire(KEY_EVENT_MOUSEMOVE, e, new Date());
  });
}
