import { isUndefined, throttle } from 'lodash-es';
import {
  DATA_TRACKED_ATTRIBUTE,
  EVENT_CLICK,
  EVENT_LINK_CLICK,
  EVENT_MOUSEDOWN,
  EVENT_MOUSEMOVE,
  EVENT_SCROLL,
  EVENT_STATECHANGE,
  KEY_AUTO_DECORATE,
  KEY_DOWNLOAD_TRACKING,
  KEY_OUTGOING_TRACKING
} from '../constants';
import globals from '../globals';
import { addEventListener, fire } from './events';
import PageLifecycle from './page-lifecycle';
import { findParentAnchorElement, isLeftClick } from './utils';

function onClick(e) {
  let elem = e.srcElement || e.target;

  if (isLeftClick(e)) {
    fire(EVENT_CLICK, e, elem);
  }

  if (globals[KEY_DOWNLOAD_TRACKING] || globals[KEY_OUTGOING_TRACKING]) {
    elem = findParentAnchorElement(e.srcElement || e.target);

    if (
      !isUndefined(elem) &&
      elem !== null &&
      !elem.getAttribute(DATA_TRACKED_ATTRIBUTE)
    ) {
      fire(EVENT_LINK_CLICK, e, elem);
    }
  }
}

function onMouseDown(e) {
  let elem;

  fire(EVENT_MOUSEMOVE, e, Date.now());

  if (globals[KEY_AUTO_DECORATE]) {
    elem = findParentAnchorElement(e.srcElement || e.target);

    if (!isUndefined(elem) && elem !== null) {
      fire(KEY_AUTO_DECORATE, elem);
    }
  }
}

function onMouseMove(e) {
  fire(EVENT_MOUSEMOVE, e, Date.now());
}

const onScroll = throttle(function onScroll(e) {
  fire(EVENT_SCROLL, e);
}, 500);

function onPageStateChange(e) {
  fire(EVENT_STATECHANGE, e);
}

const CAPTURE = { capture: true };
const CAPTURE_PASSIVE = { capture: true, passive: true };

// attaches events
// needs to be handled here, instead of in a tracking instance because
// these events should only be fired once on a page
export default function attachGlobalEvents() {
  addEventListener(document, EVENT_CLICK, onClick, CAPTURE);
  addEventListener(document, EVENT_MOUSEDOWN, onMouseDown, CAPTURE);
  addEventListener(document, EVENT_MOUSEMOVE, onMouseMove, CAPTURE_PASSIVE);
  addEventListener(window, EVENT_SCROLL, onScroll, CAPTURE_PASSIVE);

  PageLifecycle.addEventListener(EVENT_STATECHANGE, onPageStateChange);
}
