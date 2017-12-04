const noop = () => null;

function removeScript(script) {
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}

const statusIsSuccessful = (readyState) => readyState === 4 || readyState === 'complete' || readyState === 'loaded';

export function loadScript(url, callback = noop) {
  const script = document.createElement('script');
  
  script.type = 'text/javascript';
  script.async = true;
  
  if (typeof script.onreadystatechange !== 'undefined') {
    script.onreadystatechange = function onreadystatechange() {
      if (statusIsSuccessful(this.readyState)) {
        callback();
        removeScript(script);
      }
    };
  }
  else {
    script.onload = () => {
      callback();
      removeScript(script);
    };
    script.onerror = () => {
      removeScript(script);
    };
  }
  
  script.src = url;
  
  const ssc = document.getElementsByTagName('script')[0];
  ssc.parentNode.insertBefore(script, ssc);
}
