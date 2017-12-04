const handlers = {};

export function removeHandler(id, instance) {
  handers[id][instance] = null;
}

export function attachEvent(element, type, callback) {
  if (element.addEventListener) {
    element.addEventListener(type, callback);
  }
  else if (element.attachEvent) {
    /*eslint-disable*/
    element.attachEvent('on' + type, function(e) {
      var e = e || win.event;
      e.preventDefault = e.preventDefault || function() {e.returnValue = false};
      e.stopPropagation = e.stopPropagation || function() {e.cancelBubble = true};
      callback.call(self, e);
    });
    /*eslint-enable*/
  }
}


export function on(parent, event, callback) {
  var id = parent.instanceName;
  
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
};

export function fire(event) {
  var handler;
  var _event = handlers[event];
  var _l;
  
  if (_event) {
    for (var id in _event) {
      if (_event.hasOwnProperty(id)) {
        handler = _event[id];
        _l = handler && handler.__l;
        if (_l && _l[event]) {
          for (var i = 0; i < _l[event].length; i++) {
            _l[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
          }
        }
        
      }
    }
  }
};
