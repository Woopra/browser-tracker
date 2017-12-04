/**
* addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
* https://gist.github.com/eirikbacker/2864711
* removeEventListener from https://gist.github.com/jonathantneal/3748027
*/
/*eslint-disable*/

if (!window.addEventListener)	{
  var listeners = [];

  function docHijack(p) {
    var old = document[p];
    
    document[p] = function(v) {
      return addListen(old(v));
    };
  }

  function addEvent(on, fn, self) {
    self = this;
    
    listeners.unshift([self, on, fn, function(e) {
      var e = e || window.event;
      e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
      e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
      e.currentTarget = self;
      e.target = e.srcElement || self;
      fn.call(self, e);
    }]);
    
    return this.attachEvent('on' + on, listeners[0][3])
  }

  function removeEvent(on, fn) {
    for (var index = 0, register; register = listeners[index]; ++index) {
      if (register[0] == this && register[1] == on && register[2] == fn) {
        return this.detachEvent("on" + on, listeners.splice(index, 1)[0][3]);
      }
    }
  }

  function addListen(obj, i){
    if (obj && (i = obj.length)) {
      while(i--) {
        obj[i].addEventListener = addEvent;
        obj[i].removeEventListener = removeEvent;
      }
    }
    else if (obj) {
      obj.addEventListener = addEvent;
      obj.removeEventListener = removeEvent;
    }
    
    return obj;
  }

  addListen([document, window]);
  if ('Element' in window) {
    // IE 8
    window.Element.prototype.addEventListener = addEvent;
    window.Element.prototype.removeEventListener = removeEvent;
  }
  else {
    // IE < 8
    //Make sure we also init at domReady
    document.attachEvent('onreadystatechange', () => addListen(document.all));
    docHijack('getElementsByTagName');
    docHijack('getElementById');
    docHijack('createElement');
    addListen(document.all);
  }
}
