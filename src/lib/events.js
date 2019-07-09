const handlers = {};

export function removeHandler(id, instance) {
  handlers[id][instance] = null;
}

export function attachEvent(element, type, callback) {
  if (element.addEventListener) {
    element.addEventListener(type, callback);
  }
}

export function on(parent, event, callback) {
  const id = parent.instanceName;

  if (!handlers[event]) {
    handlers[event] = {};
  }
  handlers[event][id] = parent;

  if (parent.__l) {
    if (!parent.__l[event]) {
      parent.__l[event] = [];
    }
    parent.__l[event].push(callback);
  }
}

export function fire(event) {
  let handler;
  const _event = handlers[event];
  let _l;

  if (_event) {
    for (let id in _event) {
      if (_event.hasOwnProperty(id)) {
        handler = _event[id];
        _l = handler && handler.__l;
        if (_l && _l[event]) {
          for (let i = 0; i < _l[event].length; i++) {
            _l[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
          }
        }
      }
    }
  }
}
