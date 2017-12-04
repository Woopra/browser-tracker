import { on, fire } from './lib/events';

// attaches any events
// needs to be handled here, instead of in a tracking instance because
// these events should only be fired once on a page
export function attachEvents() {
  on(document, 'mousedown', function(e) {
    var cElem;
    
    fire('mousemove', e, new Date());
    
    if (_auto_decorate) {
      cElem = e.srcElement || e.target;
      while (typeof cElem !== 'undefined' && cElem !== null) {
        if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
          break;
        }
        cElem = cElem.parentNode;
      }
      if (typeof cElem !== 'undefined' && cElem !== null) {
        fire('auto_decorate', cElem);
      }
    }
  });
  
  on(document, 'click', function(e) {
    const ignoreTarget = '_blank';
    var link, _download;
    
    let cElem = e.srcElement || e.target;
    
    if (Woopra.leftClick(e)) {
      fire('click', e, cElem);
    }
    
    if (_download_tracking || _outgoing_tracking) {
      // searches for an anchor element
      while (typeof cElem !== 'undefined' && cElem !== null) {
        if (cElem.tagName && cElem.tagName.toLowerCase() === 'a') {
          break;
        }
        cElem = cElem.parentNode;
      }
      
      if (typeof cElem !== 'undefined' && cElem !== null && !cElem.getAttribute('data-woopra-tracked')) {
      link = cElem;
      _download = link.pathname.match(/(?:doc|dmg|eps|svg|xls|ppt|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3|mp4|m4v)($|\&)/);
      
      if (_download_tracking && _download) {
        fire('download', link.href);
        
        if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
          e.preventDefault();
          e.stopPropagation();
          
          link.setAttribute('data-woopra-tracked', true);
          setTimeout(function() {
            link.click();
          }, _download_pause);
        }
      }
      // Make sure
      // * outgoing tracking is enabled
      // * this URL does not match a download URL (doesn't end
      //   in a binary file extension)
      // * not ignoring subdomains OR link hostname is not a partial
      //   match of current hostname (to check for subdomains),
      // * hostname is not empty
      if (_outgoing_tracking &&
        !_download &&
        Woopra.isOutgoingLink(link.hostname)) {
          fire('outgoing', link.href);
          
          if (link.target !== ignoreTarget && Woopra.leftClick(e)) {
            e.preventDefault();
            e.stopPropagation();
            
            link.setAttribute('data-woopra-tracked', true);
            
            setTimeout(function() {
              link.click();
            }, _outgoing_pause);
          }
        }
      }
    }
  });
    
  on(document, 'mousemove', function(e) {
    fire('mousemove', e, new Date());
  });
  
  on(document, 'keydown', function() {
    fire('keydown');
  });
}
