import { isUndefined, noop } from 'lodash-es';

export function removeScript(script) {
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}

const statusIsSuccessful = (readyState) =>
  readyState === 4 || readyState === 'complete' || readyState === 'loaded';

export function loadScript(url, callback = noop, errorCallback = noop) {
  const script = document.createElement('script');

  script.type = 'text/javascript';
  script.async = true;

  if (!isUndefined(script.onreadystatechange)) {
    script.onreadystatechange = function onreadystatechange() {
      if (statusIsSuccessful(this.readyState)) {
        callback();
        removeScript(script);
      }
    };
  } else {
    script.onload = () => {
      callback();
      removeScript(script);
    };
    script.onerror = (e) => {
      errorCallback(e);
      removeScript(script);
    };
  }

  script.src = url;

  if (document.body) document.body.appendChild(script);
  else document.head.appendChild(script);
}
