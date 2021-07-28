/*
 Copyright 2018 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

/**
 * Original source: https://github.com/GoogleChromeLabs/page-lifecycle
 * MODIFICATIONS:
 * - inline imports
 * - always use shims
 * - use constants in place of string literals
 */

import {
  EVENT_BEFOREUNLOAD,
  EVENT_BLUR,
  EVENT_FOCUS,
  EVENT_FREEZE,
  EVENT_PAGEHIDE,
  EVENT_PAGESHOW,
  EVENT_RESUME,
  EVENT_UNLOAD,
  EVENT_VISIBILITYCHANGE,
  PAGE_LIFECYCLE_STATE_ACTIVE,
  PAGE_LIFECYCLE_STATE_FROZEN,
  PAGE_LIFECYCLE_STATE_HIDDEN,
  PAGE_LIFECYCLE_STATE_PASSIVE,
  PAGE_LIFECYCLE_STATE_TERMINATED
} from '../constants';

class EventTargetShim {
  /**
   * Creates the event registry.
   */
  constructor() {
    this._registry = {};
  }

  /**
   * @param {string} type
   * @param {EventListener|function(!Event):(boolean|undefined)} listener
   * @param {(boolean|!AddEventListenerOptions)=} opts
   * @return {undefined}
   * @see https://dom.spec.whatwg.org/#dom-eventtarget-addeventlistener
   */
  addEventListener(type, listener, opts = false) {
    this._getRegistry(type).push(listener);
  }

  /**
   * @param {string} type
   * @param {EventListener|function(!Event):(boolean|undefined)} listener
   * @param {(boolean|!EventListenerOptions)=} opts
   * @return {undefined}
   * @see https://dom.spec.whatwg.org/#dom-eventtarget-removeeventlistener
   */
  removeEventListener(type, listener, opts = false) {
    const typeRegistry = this._getRegistry(type);
    const handlerIndex = typeRegistry.indexOf(listener);
    if (handlerIndex > -1) {
      typeRegistry.splice(handlerIndex, 1);
    }
  }

  /**
   * @param {!Event|!EventShim} evt
   * @return {boolean}
   * @see https://dom.spec.whatwg.org/#dom-eventtarget-dispatchevent
   */
  dispatchEvent(evt) {
    // Set the target then freeze the event object to prevent modification.
    evt.target = this;
    Object.freeze(evt);

    this._getRegistry(evt.type).forEach((listener) => listener(evt));
    return true;
  }

  /**
   * Returns an array of handlers associated with the passed event type.
   * If no handlers have been registered, an empty array is returned.
   * @private
   * @param {string} type The event type.
   * @return {!Array} An array of handler functions.
   */
  _getRegistry(type) {
    return (this._registry[type] = this._registry[type] || []);
  }
}

class StateChangeEvent {
  constructor(type, initDict) {
    this.type = type;
    this.newState = initDict.newState;
    this.oldState = initDict.oldState;
    this.originalEvent = initDict.originalEvent;
  }
}

// Detect Safari to work around Safari-specific bugs.
const IS_SAFARI = typeof safari === 'object' && safari.pushNotification;

const SUPPORTS_PAGE_TRANSITION_EVENTS = 'onpageshow' in self;

const EVENTS = [
  EVENT_FOCUS,
  EVENT_BLUR,
  EVENT_VISIBILITYCHANGE,
  EVENT_FREEZE,
  EVENT_RESUME,
  EVENT_PAGESHOW,
  // IE9-10 do not support the pagehide event, so we fall back to unload
  // Note: unload *MUST ONLY* be added conditionally, otherwise it will
  // prevent page navigation caching (a.k.a bfcache).
  SUPPORTS_PAGE_TRANSITION_EVENTS ? EVENT_PAGEHIDE : EVENT_UNLOAD
];

/**
 * @param {!Event} evt
 * @return {string}
 */
const onbeforeunload = (evt) => {
  evt.preventDefault();
  return (evt.returnValue = 'Are you sure?');
};

/**
 * Converts an array of states into an object where the state is the key
 * and the value is the index.
 * @param {!Array<string>} arr
 * @return {!Object}
 */
const toIndexedObject = (arr) =>
  arr.reduce((acc, val, idx) => {
    acc[val] = idx;
    return acc;
  }, {});

/**
 * @type {!Array<!Object>}
 */
const LEGAL_STATE_TRANSITIONS = [
  // The normal unload process (bfcache process is addressed above).
  [
    PAGE_LIFECYCLE_STATE_ACTIVE,
    PAGE_LIFECYCLE_STATE_PASSIVE,
    PAGE_LIFECYCLE_STATE_HIDDEN,
    PAGE_LIFECYCLE_STATE_TERMINATED
  ],

  // An active page transitioning to frozen,
  // or an unloading page going into the bfcache.
  [
    PAGE_LIFECYCLE_STATE_ACTIVE,
    PAGE_LIFECYCLE_STATE_PASSIVE,
    PAGE_LIFECYCLE_STATE_HIDDEN,
    PAGE_LIFECYCLE_STATE_FROZEN
  ],

  // A hidden page transitioning back to active.
  [
    PAGE_LIFECYCLE_STATE_HIDDEN,
    PAGE_LIFECYCLE_STATE_PASSIVE,
    PAGE_LIFECYCLE_STATE_ACTIVE
  ],

  // A frozen page being resumed
  [PAGE_LIFECYCLE_STATE_FROZEN, PAGE_LIFECYCLE_STATE_HIDDEN],

  // A frozen (bfcached) page navigated back to
  // Note: [FROZEN, HIDDEN] can happen here, but it's already covered above.
  [PAGE_LIFECYCLE_STATE_FROZEN, PAGE_LIFECYCLE_STATE_ACTIVE],
  [PAGE_LIFECYCLE_STATE_FROZEN, PAGE_LIFECYCLE_STATE_PASSIVE]
].map(toIndexedObject);

/**
 * Accepts a current state and a future state and returns an array of legal
 * state transition paths. This is needed to normalize behavior across browsers
 * since some browsers do not fire events in certain cases and thus skip
 * states.
 * @param {string} oldState
 * @param {string} newState
 * @return {!Array<string>}
 */
const getLegalStateTransitionPath = (oldState, newState) => {
  // We're intentionally not using for...of here so when we transpile to ES5
  // we don't need to include the Symbol polyfills.
  for (let order, i = 0; (order = LEGAL_STATE_TRANSITIONS[i]); ++i) {
    const oldIndex = order[oldState];
    const newIndex = order[newState];

    if (oldIndex >= 0 && newIndex >= 0 && newIndex > oldIndex) {
      // Differences greater than one should be reported
      // because it means a state was skipped.
      return Object.keys(order).slice(oldIndex, newIndex + 1);
    }
  }
  return [];
  // TODO(philipwalton): it shouldn't be possible to get here, but
  // consider some kind of warning or call to action if it happens.
  // console.warn(`Invalid state change detected: ${oldState} > ${newState}`);
};

/**
 * Returns the current state based on the document's visibility and
 * in input focus states. Note this method is only used to determine
 * active vs passive vs hidden states, as other states require listening
 * for events.
 * @return {string}
 */
const getCurrentState = () => {
  if (document.visibilityState === PAGE_LIFECYCLE_STATE_HIDDEN) {
    return PAGE_LIFECYCLE_STATE_HIDDEN;
  }
  if (document.hasFocus()) {
    return PAGE_LIFECYCLE_STATE_ACTIVE;
  }
  return PAGE_LIFECYCLE_STATE_PASSIVE;
};

/**
 * Class definition for the exported, singleton lifecycle instance.
 */
class PageLifecycle extends EventTargetShim {
  /**
   * Initializes state, state history, and adds event listeners to monitor
   * state changes.
   */
  constructor() {
    super();

    const state = getCurrentState();

    this._state = state;
    this._unsavedChanges = [];

    // Bind the callback and add event listeners.
    this._handleEvents = this._handleEvents.bind(this);

    // Add capturing events on window so they run immediately.
    EVENTS.forEach((evt) => addEventListener(evt, this._handleEvents, true));

    // Safari does not reliably fire the `pagehide` or `visibilitychange`
    // events when closing a tab, so we have to use `beforeunload` with a
    // timeout to check whether the default action was prevented.
    // - https://bugs.webkit.org/show_bug.cgi?id=151610
    // - https://bugs.webkit.org/show_bug.cgi?id=151234
    // NOTE: we only add this to Safari because adding it to Firefox would
    // prevent the page from being eligible for bfcache.
    if (IS_SAFARI) {
      addEventListener(EVENT_BEFOREUNLOAD, (evt) => {
        this._safariBeforeUnloadTimeout = setTimeout(() => {
          if (!(evt.defaultPrevented || evt.returnValue.length > 0)) {
            this._dispatchChangesIfNeeded(evt, PAGE_LIFECYCLE_STATE_HIDDEN);
          }
        }, 0);
      });
    }
  }

  /**
   * @return {string}
   */
  get state() {
    return this._state;
  }

  /**
   * Returns the value of document.wasDiscarded. This is arguably unnecessary
   * but I think there's value in having the entire API in one place and
   * consistent across browsers.
   * @return {boolean}
   */
  get pageWasDiscarded() {
    return document.wasDiscarded || false;
  }

  /**
   * @param {Symbol|Object} id A unique symbol or object identifying the
   *.    pending state. This ID is required when removing the state later.
   */
  addUnsavedChanges(id) {
    // Don't add duplicate state. Note: ideally this would be a set, but for
    // better browser compatibility we're using an array.
    if (!this._unsavedChanges.indexOf(id) > -1) {
      // If this is the first state being added,
      // also add a beforeunload listener.
      if (this._unsavedChanges.length === 0) {
        addEventListener(EVENT_BEFOREUNLOAD, onbeforeunload);
      }
      this._unsavedChanges.push(id);
    }
  }

  /**
   * @param {Symbol|Object} id A unique symbol or object identifying the
   *.    pending state. This ID is required when removing the state later.
   */
  removeUnsavedChanges(id) {
    const idIndex = this._unsavedChanges.indexOf(id);

    if (idIndex > -1) {
      this._unsavedChanges.splice(idIndex, 1);

      // If there's no more pending state, remove the event listener.
      if (this._unsavedChanges.length === 0) {
        removeEventListener(EVENT_BEFOREUNLOAD, onbeforeunload);
      }
    }
  }

  /**
   * @private
   * @param {!Event} originalEvent
   * @param {string} newState
   */
  _dispatchChangesIfNeeded(originalEvent, newState) {
    if (newState !== this._state) {
      const oldState = this._state;
      const path = getLegalStateTransitionPath(oldState, newState);

      for (let i = 0; i < path.length - 1; ++i) {
        const oldState = path[i];
        const newState = path[i + 1];

        this._state = newState;
        this.dispatchEvent(
          new StateChangeEvent('statechange', {
            oldState,
            newState,
            originalEvent
          })
        );
      }
    }
  }

  /**
   * @private
   * @param {!Event} evt
   */
  _handleEvents(evt) {
    if (IS_SAFARI) {
      clearTimeout(this._safariBeforeUnloadTimeout);
    }

    switch (evt.type) {
      case EVENT_PAGESHOW:
      case EVENT_RESUME:
        this._dispatchChangesIfNeeded(evt, getCurrentState());
        break;
      case EVENT_FOCUS:
        this._dispatchChangesIfNeeded(evt, PAGE_LIFECYCLE_STATE_ACTIVE);
        break;
      case EVENT_BLUR:
        // The `blur` event can fire while the page is being unloaded, so we
        // only need to update the state if the current state is "active".
        if (this._state === PAGE_LIFECYCLE_STATE_ACTIVE) {
          this._dispatchChangesIfNeeded(evt, getCurrentState());
        }
        break;
      case EVENT_PAGEHIDE:
      case EVENT_UNLOAD:
        this._dispatchChangesIfNeeded(
          evt,
          evt.persisted
            ? PAGE_LIFECYCLE_STATE_FROZEN
            : PAGE_LIFECYCLE_STATE_TERMINATED
        );
        break;
      case EVENT_VISIBILITYCHANGE:
        // The document's `visibilityState` will change to hidden  as the page
        // is being unloaded, but in such cases the lifecycle state shouldn't
        // change.
        if (
          this._state !== PAGE_LIFECYCLE_STATE_FROZEN &&
          this._state !== PAGE_LIFECYCLE_STATE_TERMINATED
        ) {
          this._dispatchChangesIfNeeded(evt, getCurrentState());
        }
        break;
      case EVENT_FREEZE:
        this._dispatchChangesIfNeeded(evt, PAGE_LIFECYCLE_STATE_FROZEN);
        break;
    }
  }
}

export default new PageLifecycle();
