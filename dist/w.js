/*!
 * Copyright (c) 2023 Woopra, Inc.
 *
 * For license information please see https://static.woopra.com/js/w.js.LICENSE.txt
 */

!function(){"use strict";function t(t){return void 0===t}var e="object"==typeof global&&global&&global.Object===Object&&global,n="object"==typeof self&&self&&self.Object===Object&&self,i=e||n||Function("return this")(),o=i.Symbol,a=Object.prototype,r=a.hasOwnProperty,s=a.toString,c=o?o.toStringTag:void 0;var u=Object.prototype.toString;var l=o?o.toStringTag:void 0;function h(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":l&&l in Object(t)?function(t){var e=r.call(t,c),n=t[c];try{t[c]=void 0;var i=!0}catch(t){}var o=s.call(t);return i&&(e?t[c]=n:delete t[c]),o}(t):function(t){return u.call(t)}(t)}function d(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}function f(t){if(!d(t))return!1;var e=h(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e}var p=function(){return i.Date.now()},g=/\s/;var m=/^\s+/;function v(t){return t?t.slice(0,function(t){for(var e=t.length;e--&&g.test(t.charAt(e)););return e}(t)+1).replace(m,""):t}function _(t){return null!=t&&"object"==typeof t}function w(t){return"symbol"==typeof t||_(t)&&"[object Symbol]"==h(t)}var y=/^[-+]0x[0-9a-f]+$/i,k=/^0b[01]+$/i,b=/^0o[0-7]+$/i,C=parseInt;function E(t){if("number"==typeof t)return t;if(w(t))return NaN;if(d(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=d(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=v(t);var n=k.test(t);return n||b.test(t)?C(t.slice(2),n?2:8):y.test(t)?NaN:+t}var S=Math.max,D=Math.min;function x(t,e,n){var i,o,a,r,s,c,u=0,l=!1,h=!1,f=!0;if("function"!=typeof t)throw new TypeError("Expected a function");function g(e){var n=i,a=o;return i=o=void 0,u=e,r=t.apply(a,n)}function m(t){return u=t,s=setTimeout(_,e),l?g(t):r}function v(t){var n=t-c;return void 0===c||n>=e||n<0||h&&t-u>=a}function _(){var t=p();if(v(t))return w(t);s=setTimeout(_,function(t){var n=e-(t-c);return h?D(n,a-(t-u)):n}(t))}function w(t){return s=void 0,f&&i?g(t):(i=o=void 0,r)}function y(){var t=p(),n=v(t);if(i=arguments,o=this,c=t,n){if(void 0===s)return m(c);if(h)return clearTimeout(s),s=setTimeout(_,e),g(c)}return void 0===s&&(s=setTimeout(_,e)),r}return e=E(e)||0,d(n)&&(l=!!n.leading,a=(h="maxWait"in n)?S(E(n.maxWait)||0,e):a,f="trailing"in n?!!n.trailing:f),y.cancel=function(){void 0!==s&&clearTimeout(s),u=0,i=c=o=s=void 0},y.flush=function(){return void 0===s?r:w(p())},y}var N;var O,B=((N={}).eu="www.woopra.com/track/",N.kr="kr.track.airis.appier.net/track/",N),j="__woopraid",P=["campaign","content","id","medium","source","term"],I=["com.au","net.au","org.au","co.hu","com.ru","ac.za","net.za","com.za","co.za","co.uk","org.uk","me.uk","net.uk"],T="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",A=new RegExp("__woopraid=([^&#]+)"),U="action",R="page",L="scroll depth",W="pv",$="idptnc",M="_blank",F="data-tracked",H="ce_",z="co_",q="ce",Q="update",J="active",K="passive",V="hidden",G="frozen",X="terminated",Y="beforeunload",Z="blur",tt="click",et="download",nt="focus",it="freeze",ot="link",at="mousemove",rt="outgoing",st="pagehide",ct="pageshow",ut="resume",lt="scroll",ht="statechange",dt="unload",ft="visibilitychange",pt="auto_decorate",gt="beacons",mt="campaign_once",vt="click_tracking_matcher_selectors",_t="click_pause",wt="context",yt="cookie_domain",kt="cookie_expire",bt="cookie_name",Ct="cookie_path",Et="cookie_secure",St="cross_domain",Dt="domain",xt="download_extensions",Nt="download_pause",Ot="download_tracking",Bt="form_pause",jt="hide_campaign",Pt="hide_xdm_data",It="idle_threshold",Tt="idle_timeout",At="ignore_query_url",Ut="map_query_params",Rt="outgoing_pause",Lt="outgoing_tracking",Wt="personalization",$t="ping",Mt="ping_interval",Ft="protocol",Ht="region",zt="save_url_hash",qt="third_party",Qt="use_cookies",Jt=[[$,$],["$duration","duration"],["$domain","domain"],["$app","app"],["$timestamp","timestamp"],["$action","event"]],Kt=["avi","css","dmg","doc","eps","exe","js","m4v","mov","mp3","mp4","msi","pdf","ppt","rar","svg","txt","vsd","vxd","wma","wmv","xls","xlsx","zip"],Vt=["a"],Gt=["a","button","input[type=button]","input[type=submit]","[role=button]"],Xt=((O={}).auto_decorate=void 0,O.download_tracking=!1,O.outgoing_ignore_subdomain=!0,O.outgoing_tracking=!1,O),Yt={};function Zt(t,e){Yt[t][e]=null}function te(t,e,n){null!=t&&t.addEventListener&&t.addEventListener(e,n)}function ee(t,e,n){var i=t.instanceName;Yt[e]||(Yt[e]={}),Yt[e][i]=t,t.__l&&(t.__l[e]||(t.__l[e]=[]),t.__l[e].push(n))}function ne(t){var e,n,i=Yt[t];if(i)for(var o in i)if(i.hasOwnProperty(o)&&(n=(e=i[o])&&e.__l)&&n[t])for(var a=0;a<n[t].length;a++)n[t][a].apply(this,Array.prototype.slice.call(arguments,1))}function ie(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function oe(){return oe=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(t[i]=n[i])}return t},oe.apply(this,arguments)}function ae(t,e){return ae=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},ae(t,e)}function re(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,i=new Array(e);n<e;n++)i[n]=t[n];return i}function se(t,e){var n="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(n)return(n=n.call(t)).next.bind(n);if(Array.isArray(t)||(n=function(t,e){if(t){if("string"==typeof t)return re(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?re(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var i=0;return function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function ce(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var n=t[Symbol.toPrimitive];if(void 0!==n){var i=n.call(t,e||"default");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}var ue=function(){function t(){this._registry={}}var e=t.prototype;return e.addEventListener=function(t,e,n){this._getRegistry(t).push(e)},e.removeEventListener=function(t,e,n){var i=this._getRegistry(t),o=i.indexOf(e);o>-1&&i.splice(o,1)},e.dispatchEvent=function(t){return t.target=this,Object.freeze(t),this._getRegistry(t.type).forEach((function(e){return e(t)})),!0},e._getRegistry=function(t){return this._registry[t]=this._registry[t]||[]},t}(),le=function(t,e){this.type=t,this.newState=e.newState,this.oldState=e.oldState,this.originalEvent=e.originalEvent},he="object"==typeof safari&&safari.pushNotification,de="onpageshow"in self,fe=[nt,Z,ft,it,ut,ct,de?st:dt],pe=function(t){return t.preventDefault(),t.returnValue="Are you sure?"},ge=[[J,K,V,X],[J,K,V,G],[V,K,J],[G,V],[G,J],[G,K]].map((function(t){return t.reduce((function(t,e,n){return t[e]=n,t}),{})})),me=function(){return document.visibilityState===V?V:document.hasFocus()?J:K},ve=new(function(t){var e,n;function i(){var e;e=t.call(this)||this;var n=me();return e._state=n,e._unsavedChanges=[],e._handleEvents=e._handleEvents.bind(function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(e)),fe.forEach((function(t){return addEventListener(t,e._handleEvents,!0)})),he&&addEventListener(Y,(function(t){e._safariBeforeUnloadTimeout=setTimeout((function(){t.defaultPrevented||t.returnValue.length>0||e._dispatchChangesIfNeeded(t,V)}),0)})),e}n=t,(e=i).prototype=Object.create(n.prototype),e.prototype.constructor=e,ae(e,n);var o,a,r,s=i.prototype;return s.addUnsavedChanges=function(t){!this._unsavedChanges.indexOf(t)>-1&&(0===this._unsavedChanges.length&&addEventListener(Y,pe),this._unsavedChanges.push(t))},s.removeUnsavedChanges=function(t){var e=this._unsavedChanges.indexOf(t);e>-1&&(this._unsavedChanges.splice(e,1),0===this._unsavedChanges.length&&removeEventListener(Y,pe))},s._dispatchChangesIfNeeded=function(t,e){if(e!==this._state)for(var n=function(t,e){for(var n,i=0;n=ge[i];++i){var o=n[t],a=n[e];if(o>=0&&a>=0&&a>o)return Object.keys(n).slice(o,a+1)}return[]}(this._state,e),i=0;i<n.length-1;++i){var o=n[i],a=n[i+1];this._state=a,this.dispatchEvent(new le("statechange",{oldState:o,newState:a,originalEvent:t}))}},s._handleEvents=function(t){switch(he&&clearTimeout(this._safariBeforeUnloadTimeout),t.type){case ct:case ut:this._dispatchChangesIfNeeded(t,me());break;case nt:this._dispatchChangesIfNeeded(t,J);break;case Z:this._state===J&&this._dispatchChangesIfNeeded(t,me());break;case st:case dt:this._dispatchChangesIfNeeded(t,t.persisted?G:X);break;case ft:this._state!==G&&this._state!==X&&this._dispatchChangesIfNeeded(t,me());break;case it:this._dispatchChangesIfNeeded(t,G)}},o=i,(a=[{key:"state",get:function(){return this._state}},{key:"pageWasDiscarded",get:function(){return document.wasDiscarded||!1}}])&&ie(o.prototype,a),r&&ie(o,r),i}(ue)),_e=Array.isArray;function we(t){return"string"==typeof t||!_e(t)&&_(t)&&"[object String]"==h(t)}var ye,ke,be=(ye=Object.getPrototypeOf,ke=Object,function(t){return ye(ke(t))}),Ce=Function.prototype,Ee=Object.prototype,Se=Ce.toString,De=Ee.hasOwnProperty,xe=Se.call(Object);function Ne(t){if(!_(t)||"[object Object]"!=h(t))return!1;var e=be(t);if(null===e)return!0;var n=De.call(e,"constructor")&&e.constructor;return"function"==typeof n&&n instanceof n&&Se.call(n)==xe}var Oe=i.isFinite;function Be(){for(var t="",e=0;e<12;e++){var n=Math.floor(Math.random()*T.length);t+=T.substring(n,n+1)}return t}function je(e){return void 0===e&&(e=window.event),(!t(e.which)&&1===e.which||!t(e.button)&&0===e.button)&&!e.metaKey&&!e.altKey&&!e.ctrlKey&&!e.shiftKey}function Pe(t,e){var n=we(t)?e||{}:t||{};if(n.el)return n.el;if(we(t)){if(document.querySelectorAll)return document.querySelectorAll(t);if("#"===t[0])return document.getElementById(t.substr(1));if("."===t[0])return document.getElementsByClassName(t.substr(1))}}function Ie(e,n,i){var o={};if(t(e))return o;for(var a in e)if(e.hasOwnProperty(a)){for(var r=e[a],s=!1,c=0;c<i.length;c++)if(i[c][0]===a){s=!0;break}s||"undefined"===r||"null"===r||t(r)||(o[""+n+a]=r)}return o}function Te(e){var n={};if(t(e))return n;for(var i in e)if(e.hasOwnProperty(i))if(Ne(e[i])||_e(e[i]))try{n[i]=JSON.stringify(e[i])}catch(t){n[i]=e[i]}else n[i]=e[i];return n}function Ae(){var t,e=document.body.scrollHeight,n=((window.scrollY||0)+window.innerHeight)/e;return Math.max(0,Math.min(1,"number"==typeof(t=n)&&Oe(t)?n:0))}function Ue(t,e){try{t()}catch(t){console.error("Error in Woopra "+e+" callback"),console.error(t.stack)}}function Re(t,e){return e.some((function(e){return t.matches(e)}))}function Le(e,n){for(var i=e;!(t(i)||null===i||i.tagName&&Re(i,n));)i=i.parentNode;return i}function We(t){for(var e=[],n=t;n.parentNode;){for(var i=0,o=0,a=0;a<n.parentNode.childNodes.length;a++){var r=n.parentNode.childNodes[a];r.nodeName===n.nodeName&&(r===n&&(o=i),i++)}var s=n.nodeName.toLowerCase();n.hasAttribute("id")&&n.id?e.unshift(s+"#"+n.id):i>1?e.unshift(s+"["+o+"]"):e.unshift(s),n=n.parentNode}return e.slice(1).join(" > ")}function $e(e){var n=e.srcElement||e.target;je(e)&&ne(tt,e,n),(Xt.download_tracking||Xt.outgoing_tracking)&&(t(n=Le(e.srcElement||e.target,Vt))||null===n||n.getAttribute(F)||ne(ot,e,n))}function Me(e){var n;ne(at,e,Date.now()),Xt.auto_decorate&&(t(n=Le(e.srcElement||e.target,Vt))||null===n||ne(pt,n))}function Fe(t){ne(at,t,Date.now())}var He=function(t,e,n){var i=!0,o=!0;if("function"!=typeof t)throw new TypeError("Expected a function");return d(n)&&(i="leading"in n?!!n.leading:i,o="trailing"in n?!!n.trailing:o),x(t,e,{leading:i,maxWait:e,trailing:o})}((function(t){ne(lt,t)}),500);function ze(t){ne(ht,t)}function qe(){}var Qe=function(){function t(t,e,n,i){this.woopra=t,this.id=e,this.params=n,this.meta=i}var e=t.prototype;return e.update=function(t,e){void 0===t&&(t={}),t.event&&t.event!==this.params.event&&(this.params.event=t.event),this.woopra.update(this.id,oe({},t,{$action:this.params.event}),e)},e.cancel=function(){this.woopra.cancelAction(this.id)},t}();function Je(t,e,n){return t==t&&(void 0!==n&&(t=t<=n?t:n),void 0!==e&&(t=t>=e?t:e)),t}var Ke=o?o.prototype:void 0,Ve=Ke?Ke.toString:void 0;function Ge(t){if("string"==typeof t)return t;if(_e(t))return function(t,e){for(var n=-1,i=null==t?0:t.length,o=Array(i);++n<i;)o[n]=e(t[n],n,t);return o}(t,Ge)+"";if(w(t))return Ve?Ve.call(t):"";var e=t+"";return"0"==e&&1/t==-Infinity?"-0":e}var Xe=1/0;function Ye(t){var e=function(t){return t?(t=E(t))===Xe||t===-1/0?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0}(t),n=e%1;return e==e?n?e-n:e:0}function Ze(t){return null==t?"":Ge(t)}function tn(t){return!!t&&new RegExp("(?:^|;\\s*)"+encodeURIComponent(t).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=").test(document.cookie)}var en=Object.freeze({__proto__:null,getItem:function(t){return t&&decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(t).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null},setItem:function(t,e,n,i,o,a){if(!t||/^(?:expires|max\-age|path|domain|secure)$/i.test(t))return!1;var r="";if(n)switch(n.constructor){case Number:r=n===1/0?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+n;break;case String:r="; expires="+n;break;case Date:r="; expires="+n.toUTCString()}return document.cookie=encodeURIComponent(t)+"="+encodeURIComponent(e)+r+(o?"; domain="+o:"")+(i?"; path="+i:"")+(a?"; secure":""),!0},removeItem:function(t,e,n){return!!tn(t)&&(document.cookie=encodeURIComponent(t)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(n?"; domain="+n:"")+(e?"; path="+e:""),!0)},hasItem:tn,keys:function(){for(var t=document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/),e=t.length,n=0;n<e;n++)t[n]=decodeURIComponent(t[n]);return t}}),nn="button",on="submit",an="reset";function rn(t){t&&t.parentNode&&t.parentNode.removeChild(t)}var sn={};function cn(){return sn.location("hostname")}sn.docCookies=en,sn.location=function(e,n){if(!t(window.location[e])){if(t(n))return window.location[e];window.location[e]=n}},sn.historyReplaceState=window.history&&window.history.replaceState?function(t,e,n){return window.history.replaceState(t,e,n)}:function(){},sn.hideUrlParams=function(t){var e=new RegExp("[?&]+((?:"+t.join("|")+")[^=&]*)=([^&#]*)","gi"),n=sn.location("href").replace(e,"");return sn.historyReplaceState(null,null,n),n},sn.getUrlParams=function(){var t={},e=sn.location("href");return e&&e.replace(/[?&]+([^=&]+)=([^&]*)/gi,(function(e,n,i){t[n]=decodeURIComponent(i.split("+").join(" "))})),t},sn.buildUrlParams=function(e,n){void 0===n&&(n="");var i=[];if(t(e))return e;for(var o in e)e.hasOwnProperty(o)&&("undefined"===e[o]||"null"===e[o]||t(e[o])||i.push(""+n+encodeURIComponent(o)+"="+encodeURIComponent(e[o])));return i.join("&")},sn.getCustomData=function(t,e){void 0===e&&(e="wv_");var n=sn.getUrlParams();for(var i in n)if(n.hasOwnProperty(i)){var o=n[i];if(i.substring(0,e.length)===e){var a=i.substring(e.length);t.call(this,a,o)}}},sn.getDomain=function(t){void 0===t&&(t=cn());var e=t.substring(t.lastIndexOf(".",t.lastIndexOf(".")-1)+1);return-1!==I.indexOf(e)?t.substring(t.lastIndexOf(".",t.indexOf(e)-2)+1):e},sn.getHostnameNoWww=function(){var t=cn();return 0===t.indexOf("www.")?t.replace("www.",""):t},sn.isOutgoingLink=function(t){var e=cn(),n=sn.getDomain(e);return!(t===e||t.replace(/^www\./,"")===e.replace(/^www\./,"")||Xt.outgoing_ignore_subdomain&&n===sn.getDomain(t)||sn.startsWith(t,"javascript")||""===t||"#"===t)},sn.hideCrossDomainId=function(){return sn.hideUrlParams([j])},sn.mapQueryParams=function(e){var n=sn.getUrlParams(),i={};for(var o in e){var a=n[o];t(a)||(i[e[o]]=a)}return i},sn.redirect=function(t){sn.location("href",t)},sn.getCampaignData=function(){for(var e=sn.getUrlParams(),n={},i=0;i<P.length;i++){var o=P[i],a=e["utm_"+o]||e["woo_"+o];t(a)||(n["campaign_"+("campaign"===o?"name":o)]=a)}return n},sn.hideCampaignData=function(){return sn.hideUrlParams(["wv_","woo_","utm_"])},sn.leftClick=je,sn.randomString=Be,sn.getElement=Pe,sn.loadScript=function(e,n,i){void 0===n&&(n=qe),void 0===i&&(i=qe);var o=document.createElement("script");o.type="text/javascript",o.async=!0,t(o.onreadystatechange)?(o.onload=function(){n(),rn(o)},o.onerror=function(t){i(t),rn(o)}):o.onreadystatechange=function(){var t;(4===(t=this.readyState)||"complete"===t||"loaded"===t)&&(n(),rn(o))},o.src=e,document.body?document.body.appendChild(o):document.head.appendChild(o)},sn.removeScript=rn,sn.serializeForm=function(t,e){if(void 0===e&&(e={}),t&&"FORM"===t.nodeName){for(var n=e.exclude||[],i={},o=t.elements.length-1;o>=0;o-=1)if(!(""===t.elements[o].name||n.indexOf(t.elements[o].name)>-1))switch(t.elements[o].nodeName){case"INPUT":switch(t.elements[o].type){case"text":case"hidden":case nn:case an:case on:i[t.elements[o].name]=t.elements[o].value;break;case"checkbox":case"radio":t.elements[o].checked&&(i[t.elements[o].name]=t.elements[o].value)}break;case"TEXTAREA":i[t.elements[o].name]=t.elements[o].value;break;case"SELECT":switch(t.elements[o].type){case"select-one":i[t.elements[o].name]=t.elements[o].value;break;case"select-multiple":for(var a=t.elements[o].options.length-1;a>=0;a-=1)t.elements[o].options[a].selected&&(i[t.elements[o].name]=t.elements[o].options[a].value)}break;case"BUTTON":switch(t.elements[o].type){case an:case on:case nn:i[t.elements[o].name]=t.elements[o].value}}return i}},sn._on=ee,sn._fire=ne,sn.attachEvent=te,sn.startsWith=function(t,e,n){return t=Ze(t),n=null==n?0:Je(Ye(n),0,t.length),e=Ge(e),t.slice(n,n+e.length)==e},sn.endsWith=function(t,e,n){t=Ze(t),e=Ge(e);var i=t.length,o=n=void 0===n?i:Je(Ye(n),0,i);return(n-=e.length)>=0&&t.slice(n,o)==e};var un=sn._fire,ln=function(){function e(t){var e;this.visitorData={},this.sessionData={},this.orgData={},this.options=((e={}).app="js-client",e.beacons=f(navigator.sendBeacon),e.campaign_once=!1,e.click_tracking_matcher_selectors=Gt,e.cookie_domain="."+sn.getHostnameNoWww(),e.cookie_expire=new Date((new Date).setDate((new Date).getDate()+730)),e.cookie_name="wooTracker",e.cookie_path="/",e.cookie_secure="https:"===sn.location("protocol"),e.cross_domain=!1,e.download_extensions=Kt,e.download_pause=200,e.download_tracking=!1,e.hide_campaign=!1,e.hide_xdm_data=!1,e.idle_threshold=1e4,e.idle_timeout=6e5,e.ignore_query_url=!1,e.map_query_params={},e.outgoing_ignore_subdomain=!0,e.outgoing_pause=200,e.outgoing_tracking=!1,e.personalization=!0,e.ping_interval=12e3,e.ping=!1,e.protocol="https",e.region="eu",e.save_url_hash=!0,e.third_party=!1,e.click_pause=250,e.form_pause=250,e.use_cookies=!0,e),this.instanceName=t||"woopra",this.idle=0,this.cookie="",this.last_activity=Date.now(),this.loaded=!1,this.dirtyCookie=!1,this.sentCampaign=!1,this.version=11,this.pending=[],this.beaconQueue=[],this.lastAction=null,t&&""!==t&&(window[t]=this)}var n=e.prototype;return n.init=function(){var t=this;this.__l={},this._processQueue("config"),this._setupCookie(),this._bindEvents(),setTimeout((function(){return t._processQueue()}),1),this.loaded=!0;var e=this.config("initialized");f(e)&&e(this.instanceName),this.config(Pt)&&sn.hideCrossDomainId()},n._processQueue=function(e){var n=window.__woo?window.__woo[this.instanceName]:n;if((n=window._w?window._w[this.instanceName]:n)&&n._e)for(var i=n._e,o=0;o<i.length;o++){var a=i[o];t(a)||!this[a[0]]||!t(e)&&e!==a[0]||this[a[0]].apply(this,Array.prototype.slice.call(a,1))}},n._setupCookie=function(){var t=this.getUrlId();this.cookie=this.getCookie(),t&&(this.cookie=t),(!this.cookie||this.cookie.length<1)&&(this.cookie=Be()),sn.docCookies.setItem(this.config(bt),this.cookie,this.config(kt),this.config(Ct),this.config(yt),this.config(Et)),this.dirtyCookie=!0},n._bindEvents=function(){var t=this;ee(this,tt,(function(e){return t.onClick(e)})),ee(this,et,(function(e){return t.downloaded(e)})),ee(this,ot,(function(e,n){return t.onLink(e,n)})),ee(this,at,(function(e,n){return t.moved(e,n)})),ee(this,rt,(function(e){return t.outgoing(e)})),ee(this,lt,(function(e){return t.onScroll(e)})),ee(this,ht,(function(e){return t.onPageStateChange(e)})),ee(this,pt,(function(e){return t.autoDecorate(e)}))},n._dataSetter=function(e,n,i){if(t(n))return e;if(t(i)){if(we(n))return e[n];if(d(n))for(var o in n)n.hasOwnProperty(o)&&(sn.startsWith(o,"cookie_")&&(this.dirtyCookie=!0),e[o]=n[o])}else sn.startsWith(n,"cookie_")&&(this.dirtyCookie=!0),e[n]=i;return this},n.getVisitorUrlData=function(){sn.getCustomData.call(this,this.identify,"wv_")},n.getCookie=function(){return sn.docCookies.getItem(this.config(bt))},n.getProtocol=function(){var t=this.config(Ft);return t&&""!==t?t+":":""},n.getEndpoint=function(t){void 0===t&&(t="");var e=this.getProtocol();if(this.config(qt)&&!this.config(Dt))throw new Error("Error: `domain` is not set.");var n=this.config(qt)?"tp/"+this.config(Dt):"";t&&!sn.endsWith(t,"/")&&(t+="/"),n&&!sn.startsWith(t,"/")&&(n+="/");var i=this.config(Ht),o=B[i];if(!o)throw new Error("Error: Invalid region: "+i);return e+"//"+o+n+t},n.config=function(e,n){var i=this._dataSetter(this.options,e,n);return i===this&&(this.options.ping_interval=Math.max(6e3,Math.min(this.options.ping_interval,6e4)),Xt.outgoing_tracking=this.options.outgoing_tracking,Xt.download_tracking=this.options.download_tracking,Xt.auto_decorate=t(Xt.auto_decorate)&&this.options.cross_domain?this.options.cross_domain:Xt.auto_decorate,Xt.outgoing_ignore_subdomain=this.options.outgoing_ignore_subdomain,this.dirtyCookie&&this.loaded&&this._setupCookie()),i},n.visit=function(t,e){return this._dataSetter(this.sessionData,t,e)},n.identify=function(){var t=void 0,e=void 0,n=void 0,i=void 0;d(arguments.length<=0?void 0:arguments[0])&&d(arguments.length<=1?void 0:arguments[1])?(t=arguments.length<=0?void 0:arguments[0],n=arguments.length<=1?void 0:arguments[1]):d(arguments.length<=0?void 0:arguments[0])&&we(arguments.length<=1?void 0:arguments[1])?(t=arguments.length<=0?void 0:arguments[0],n=arguments.length<=1?void 0:arguments[1],i=arguments.length<=2?void 0:arguments[2]):we(arguments.length<=0?void 0:arguments[0])&&we(arguments.length<=1?void 0:arguments[1])&&d(arguments.length<=2?void 0:arguments[2])?(t=arguments.length<=0?void 0:arguments[0],e=arguments.length<=1?void 0:arguments[1],n=arguments.length<=2?void 0:arguments[2]):(t=arguments.length<=0?void 0:arguments[0],e=arguments.length<=1?void 0:arguments[1],n=arguments.length<=2?void 0:arguments[2],i=arguments.length<=3?void 0:arguments[3]);var o=this._dataSetter(this.visitorData,t,e);return n&&this._dataSetter(this.orgData,n,i),o},n.identifyOrg=function(t,e){return this._dataSetter(this.orgData,t,e)},n.call=function(t){f(this[t])&&this[t].apply(this,Array.prototype.slice.call(arguments,1))},n._push=function(e){var n,i=this;void 0===e&&(e={});var o=[["visitorData","cv_"],["eventData",H],["sessionData","cs_"],["orgData",z]],a={},r=this.getEndpoint(e.endpoint),s=e.lifecycle||U;this.getVisitorUrlData(),this.config(jt)&&sn.hideCampaignData(),this._dataSetter(a,this.getOptionParams()),e.eventName&&(a.event=e.eventName),this.config(Wt)||(a.close=!0),a.timeout=t(e.timeout)?this.config(Tt):e.timeout;for(var c,u={},l=se(Jt);!(c=l()).done;){var h=c.value,d=h[0],p=h[1];e.eventData&&e.eventData[d]&&(u[p]=e.eventData[d])}this._dataSetter(a,u);for(var g=0;g<o.length;g++){var m=o[g],v=m[0],_=m[1],w=Te(Ie(e[v],_,_===H?Jt:[]));_===z&&w.co_id&&(w.org=w.co_id,delete w.co_id),this._dataSetter(a,w)}if(this.config(wt))try{var y=JSON.stringify(this.config(wt));a.context=encodeURIComponent(y)}catch(t){}e.fullEventData&&(a=e.fullEventData);var k=Boolean(e.useBeacon||this.isUnloading),b=((n={}).dirty=k,n.duration=0,n.retrack=Boolean(e.retrack),n.sent=!k,n.timestamp=Date.now(),n),C=new Qe(this,a[$],a,b),E=f(e.callback)?function(){return e.callback(C)}:qe,S=f(e.beforeCallback)?function(){return e.beforeCallback(C)}:qe,D=e.errorCallback||qe;if(s===R&&this.pending.forEach((function(t){t.lifecycle===R&&t.args.eventData[$]&&i.cancelAction(t.args.eventData[$])})),(s===R||e.useBeacon||this.isUnloading)&&this.pending.push({lifecycle:s,endpoint:e.endpoint,params:a,args:e,meta:b,callback:E,errorCallback:D}),s!==R&&e.endpoint===q&&(this.lastAction=C),this.isUnloading||e.useBeacon&&!e.queue)this.sendBeacons();else if(!e.queue){var x=r+"?"+sn.buildUrlParams(a);sn.loadScript(x,(function(){return Ue(E,a.event)}),(function(){return Ue(D,a.event)}))}setTimeout((function(){return Ue(S,a.event)}))},n.track=function(e,n){var i,o,a,r,s,c,u={},l="",h=arguments[arguments.length-1],p=U,g=!1,m=!1;return f(h)?o=h:d(h)&&(f(h.callback)?o=h.callback:f(h.onSuccess)&&(o=h.onSuccess),f(h.onBeforeSend)&&(a=h.onBeforeSend),f(h.onError)&&(r=h.onError),t(h.lifecycle)||(p=h.lifecycle),t(h.timeout)||(s=h.timeout),t(h.retrack)||(c=h.retrack),this.config(gt)?(t(h.queue)||(g=Boolean(h.queue)),t(h.useBeacon)?g&&(m=!0):m=Boolean(h.useBeacon)):m=!1),this.config(mt)&&this.sentCampaign||(u=oe({},u,sn.getCampaignData()),this.sentCampaign=!0),u=oe({},u,sn.mapQueryParams(this.config(Ut))),t(e)||e===o?l=W:t(n)||n===o?(we(e)&&(l=e),d(e)&&(e.name&&e.name===W&&(l=W),this._dataSetter(u,e))):(this._dataSetter(u,n),l=e),u[$]=Be(),l===W&&(u.url=u.url||this.getPageUrl(),u.title=u.title||this.getPageTitle(),u.domain=u.domain||this.getDomainName(),u.uri=u.uri||this.getURI(),u[L]=Ae(),u.returning=!t(u.returning)&&u.returning,h&&h.lifecycle||(p=R),this.config(zt)&&""!==(i=u.hash||this.getPageHash())&&"#"!==i&&(u.hash=i)),this._push({endpoint:q,visitorData:this.visitorData,sessionData:this.sessionData,orgData:this.orgData,eventName:l,eventData:u,lifecycle:p,callback:o,beforeCallback:a,errorCallback:r,queue:g,useBeacon:m,retrack:c,timeout:s}),this.startPing(),this},n.update=function(e,n,i){var o,a,r,s,c=!1,u=!0;f(i)?a=i:d(i)&&(f(i.callback)?a=i.callback:f(i.onSuccess)&&(a=i.onSuccess),f(i.onBeforeSend)&&(r=i.onBeforeSend),f(i.onError)&&(s=i.onError),this.config(gt)?(t(i.queue)||(c=Boolean(i.queue)),t(i.useBeacon)?c&&(u=!0):u=Boolean(i.useBeacon)):u=!1);for(var l,h=((o={})[$]=e,o.project=this.config(Dt)||sn.getHostnameNoWww(),o),p={},g=se(Jt);!(l=g()).done;){var m=l.value,v=m[0],_=m[1];n&&n[v]&&(p[_]=n[v])}return this.config(Qt)&&(p.cookie=this.getCookie()||this.cookie),this._dataSetter(h,p),this._dataSetter(h,Te(Ie(n,H,Jt))),this._push({endpoint:Q,fullEventData:h,callback:a,beforeCallback:r,errorCallback:s,queue:c,useBeacon:u}),this},n.cancelAction=function(t){var e,n=!1;(null==(e=this.lastAction)?void 0:e.id)===t&&(this.lastAction=null),this.pending=this.pending.map((function(e){var i;return e.params[$]===t?(n=!0,oe({},e,{meta:oe({},e.meta,(i={},i.cancelled=!0,i.dirty=!0,i.duration=e.lifecycle===R?e.meta.duration+(Date.now()-e.meta.timestamp):e.meta.duration,i.retrack=!1,i))})):e})),n&&this.sendBeacons()},n.trackForm=function(t,e,n){var i,o=this;void 0===t&&(t="Tracked Form");var a=we(e)?n||{}:e||{},r=function(t,e,n,i){te(t,"submit",(function(n){o.trackFormHandler(n,t,e,a)}))};if((i=a.elements?a.elements:Pe(e,a))&&i.length>0)for(var s in i)r(i[s],t)},n.trackFormHandler=function(t,e,n,i){void 0===i&&(i={});var o=!1;if(!e.getAttribute(F)){var a=Boolean(this.config(gt)),r=sn.serializeForm(e,i);if(f(i.identify)){var s=i.identify(r)||{};s&&this.identify(s)}var c=f(i.onBeforeSend)?i.onBeforeSend:void 0,u=f(i.callback)?function(){return i.callback(r)}:void 0,l=f(i.onError)?i.onError:void 0;if(i.noSubmit||e.setAttribute(F,1),i.noSubmit||a)this.track(n,r,{onBeforeSend:c,onError:l,onSuccess:u,useBeacon:a});else{t.preventDefault(),t.stopPropagation();var h=setTimeout((function(){o||e.submit()}),this.config(Bt));this.track(n,r,{onBeforeSend:c,onSuccess:function(){clearTimeout(h),u&&u(),o||e.submit(),o=!0},onError:l})}}},n.trackClick=function(t,e,n,i){var o=this;void 0===t&&(t="Item Clicked"),void 0===i&&(i={});var a=[],r=function(t,e,n,i){te(t,tt,(function(a){o.trackClickHandler(a,t,e,n,i)}))};if(a=i.elements?i.elements:Pe(e,i))for(var s=0;s<a.length;s++)r(a[s],t,n,i)},n.trackClickHandler=function(t,e,n,i,o){var a=!1;if(!e.getAttribute(F)){var r=Boolean(this.config(gt)),s=f(o.onBeforeSend)?o.onBeforeSend:void 0,c=f(o.callback)?function(){return o.callback(i)}:void 0,u=f(o.onError)?o.onError:void 0;if(o.noNav||e.setAttribute(F,1),o.noNav||r)this.track(n,i,{onBeforeSend:s,onError:u,onSuccess:c,useBeacon:r});else{t.preventDefault();var l=setTimeout((function(){a||e.click()}),this.config(_t));this.track(n,i,{onBeforeSend:s,onSuccess:function(){clearTimeout(l),c&&c(),a||e.click(),a=!0},onError:u})}}},n.startPing=function(){var e=this;t(this.pingInterval)&&(this.pingInterval=setInterval((function(){e.ping()}),this.config(Mt)))},n.stopPing=function(){t(this.pingInterval)||(clearInterval(this.pingInterval),delete this.pingInterval)},n.ping=function(){this.config($t)&&this.idle<this.config(Tt)||this.stopPing();var t=Date.now();return t-this.last_activity>this.config(It)&&(this.idle=t-this.last_activity),this},n.push=function(t){return this._push({endpoint:"identify",visitorData:this.visitorData,sessionData:this.sessionData,orgData:this.orgData,callback:t}),this.sendBeacons(),this},n._updateDurations=function(t,e){var n=Date.now();function i(i){var o,a,r;switch(e){case J:case K:var s;return n-i.meta.leave>i.params.timeout?((s={}).expired=!0,s):e===J&&t===K||e===K&&t===J?{}:((o={}).timestamp=n,o);case V:return(a={}).dirty=i.meta.dirty||n-i.meta.timestamp>100,a.duration=i.meta.duration+(n-i.meta.timestamp),a.leave=n,a;case X:return(r={}).dirty=i.meta.dirty||n-i.meta.leave>100,r;default:return{}}}this.pending=this.pending.map((function(t){return t.lifecycle!==R?t:oe({},t,{meta:oe({},t.meta,i(t))})})),this.lastAction&&(this.lastAction=oe({},this.lastAction,{meta:oe({},this.lastAction.meta,i(this.lastAction))}))},n._processLifecycle=function(t){var e,n=this,i=[];(this.pending.forEach((function(t){var e;t.meta.expired&&!t.meta.cancelled&&t.meta.retrack&&i.push(oe({},t.args,{eventData:oe({},t.args.eventData||{},(e={},e[$]=Be(),e.returning=!0,e))}))})),i.forEach((function(t){return n._push(t)})),this.pending=this.pending.filter((function(e){return!e.meta.expired&&(e.meta.dirty&&n.beaconQueue.push({lifecycle:e.lifecycle,endpoint:e.endpoint,params:oe({},e.params),meta:oe({},e.meta),successCallback:e.callback,errorCallback:e.errorCallback}),!e.meta.cancelled&&(e.lifecycle===R&&t!==R))})),this.pending=this.pending.map((function(t){var e;return oe({},t,{meta:oe({},t.meta,(e={},e.dirty=!1,e.sent=!0,e))})})),t===R&&this.lastAction)&&this.beaconQueue.push({lifecycle:R,endpoint:q,params:oe({},this.lastAction.params),meta:oe({},this.lastAction.meta,(e={},e.sent=!0,e))});return i.length>0},n._drainBeaconQueue=function(){var t=this,e=this.config(Qt);function n(t){t[$],t.cookie,t.project,t.event;var e=function(t,e){if(null==t)return{};var n,i,o={},a=Object.keys(t);for(i=0;i<a.length;i++)n=a[i],e.indexOf(n)>=0||(o[n]=t[n]);return o}(t,[$,"cookie","project","event"].map(ce));return Object.keys(e).length>0}var i=this.beaconQueue.reduce((function(t,e){return t[e.params[$]]=[],t}),{});this.beaconQueue.forEach((function(t){i[t.params[$]].push(t)})),this.beaconQueue=[];var o=Object.keys(i).map((function(n){var o=i[n],a={endpoint:void 0,params:{},onSuccess:[],onError:[]};return o.forEach((function(n){var i;a.endpoint||(n.endpoint===q&&n.meta.sent?a.endpoint=Q:a.endpoint=n.endpoint),a.params.project=n.params.project,a.params.event=n.params.event,a.params[$]=n.params[$],e&&(a.params.cookie=t.getCookie()||t.cookie),(n.lifecycle===R||n.params[$]===(null==(i=t.lastAction)?void 0:i.id))&&n.meta.duration>0&&(a.params.duration=n.meta.duration),n.meta[L]&&(a.params["ce_scroll depth"]=Math.round(1e4*n.meta[L])/1e4),n.meta.sent||(a.params=oe({},a.params,n.params),f(n.successCallback)&&a.onSuccess.push(n.successCallback),f(n.errorCallback)&&a.onError.push(n.errorCallback))})),a.params.project||(a.params.project=t.config(Dt)||sn.getHostnameNoWww()),a})).filter((function(t){return n(t.params)})),a=navigator.sendBeacon&&navigator.sendBeacon.bind(navigator),r=Boolean(this.config(gt))&&f(a);if(o.length>0)if(r){var s=[""];o.map((function(t){var e=t.endpoint,n=t.params;return JSON.stringify({endpoint:e,params:n})})).forEach((function(t){new Blob([""+s[s.length-1]+t]).size>=65e3&&s.push(""),s[s.length-1]+=t+"\n"})),s.forEach((function(e,n){var i=new FormData;i.append("payload",e.slice(0,-1));try{a(t.getEndpoint("push"),i)}catch(t){console.error("Woopra: sendBeacon failed:",t)}})),o.forEach((function(t){t.onSuccess.forEach((function(e){return Ue(e,t.params.event)}))}))}else o.forEach((function(e){var n=t.getEndpoint(e.endpoint)+"?"+sn.buildUrlParams(oe({close:!0},e.params));sn.loadScript(n,(function(){return e.onSuccess.forEach((function(t){return Ue(t,e.params.event)}))}),(function(){return e.onError.forEach((function(t){return Ue(t,e.params.event)}))}))}))},n.sendBeacons=function(t){void 0===t&&(t=U),this._processLifecycle(t),this._drainBeaconQueue()},n.sleep=function(){},n._touch=function(t){void 0===t&&(t=Date.now()),this.last_activity=t,this.idle=0},n.moved=function(t,e){this._touch(e)},n.onClick=function(t){if(this.config("click_tracking")){var e=Boolean(this.config(gt)),n=Le(t.target,this.config(vt));if(n){var i=n.tagName.toLowerCase(),o=n.getAttributeNames().reduce((function(t,e){return sn.startsWith(e,"data-woopra-")&&(t[e.slice(12)]=n.getAttribute(e)),t}),{}),a=n.getAttribute("data-woopra")||"button click",r=oe({"page url":this.getPageUrl(),"page title":this.getPageTitle(),text:n.innerText||n.value||n.textContent,title:n.textContent,type:"a"===i?"link":n.type,tagname:i,classname:n.className,"dom path":We(n),url:n.href,"pointer type":t.pointerType},o);if(this.config(zt)){var s=this.getPageHash();""!==s&&"#"!==s&&(r["page hash"]=s)}this.track(a,r,{useBeacon:e})}}},n.onLink=function(t,e){var n=Boolean(this.config(gt)),i=this.config(xt),o=new RegExp("(?:"+i.join("|")+")($|&)","i").test(e.pathname);this.config(Ot)&&o&&(un(et,e.href),e.target!==M&&sn.leftClick(t)&&(e.setAttribute(F,1),n||(t.preventDefault(),t.stopPropagation(),setTimeout((function(){e.click()}),this.config(Nt))))),this.config(Lt)&&!o&&sn.isOutgoingLink(e.hostname)&&(un(rt,e.href),e.target!==M&&sn.leftClick(t)&&(e.setAttribute(F,1),n||(t.preventDefault(),t.stopPropagation(),setTimeout((function(){e.click()}),this.config(Rt)))))},n.downloaded=function(t){var e=Boolean(this.config(gt));this.track(et,{url:t},{useBeacon:e})},n.outgoing=function(t){var e=Boolean(this.config(gt));this.track(rt,{url:t},{useBeacon:e})},n.onUnload=function(){this.isUnloading||(this.isUnloading=!0,this._updateDurations(V,X),this.sendBeacons(R))},n.onPageStateChange=function(t){var e=t.newState,n=t.oldState;switch(e){case J:this._updateDurations(n,e),this.sendBeacons(),this._touch();break;case K:case V:this._updateDurations(n,e),this.sendBeacons();break;case X:this.onUnload()}},n.onScroll=function(t){this._touch();var e=Ae();this.pending.filter((function(t){return t.lifecycle===R})).forEach((function(t){t.meta[L]=Math.min(1,Math.max(e,t.meta[L]||0))}))},n.autoDecorate=function(t){var e=this.config(St);if(e){for(var n,i=we(e)?[e]:_e(e)?e:[],o=0;o<i.length;o++)if(-1!==t.hostname.indexOf(i[o])){n=!0;break}if(n){var a=this.decorate(t);a&&(t.href=a)}}},n.reset=function(){sn.docCookies.removeItem(this.config(bt),this.config(Ct),this.config(yt)),this.cookie=null,this._setupCookie()},n.decorate=function(t){var e,n,i,o;if(we(t)?((e=document.createElement("a")).href=t,n=e.search?"&":"?"):t&&t.href&&(e=t),e)return n=e.search?"&":"?",i=e.pathname&&"/"===e.pathname.charAt(0)?e.pathname:"/"+e.pathname,o=e.hostname+(e.port&&""!==e.port&&"80"!==e.port&&"0"!==e.port?":"+e.port:""),e.protocol+"//"+o+i+e.search+n+"__woopraid="+this.cookie+e.hash},n.undecorate=function(t){var e=new RegExp("[?&]+(?:__woopraid)=([^&#]*)","gi"),n=t;if(t&&t.href&&(n=t.href),n)return n.replace(e,"")},n.getPageUrl=function(){return this.config(At)?sn.location("pathname"):""+sn.location("pathname")+sn.location("search")},n.getPageHash=function(){return sn.location("hash")},n.getPageTitle=function(){return 0===document.getElementsByTagName("title").length?"":document.getElementsByTagName("title")[0].innerHTML},n.getDomainName=function(){return sn.location("hostname")},n.getURI=function(){return sn.location("href")},n.getUrlId=function(t){void 0===t&&(t=sn.location("href"));var e=t.match(A);if(e&&e[1])return e[1]},n.getOptionParams=function(){var t={project:this.config(Dt)||sn.getHostnameNoWww(),instance:this.instanceName,meta:sn.docCookies.getItem("wooMeta")||"",screen:window.screen.width+"x"+window.screen.height,language:window.navigator.browserLanguage||window.navigator.language||"",app:this.config("app"),referer:document.referrer};return this.config(Dt)||(t._warn="no_domain",sn.getHostnameNoWww()!==sn.getDomain()&&(t._warn+=",domain_mismatch")),this.config(Qt)&&(t.cookie=this.getCookie()||this.cookie),this.config("ip")&&(t.ip=this.config("ip")),t},n.dispose=function(){for(var e in this.stopPing(),this.__l)this.__l.hasOwnProperty(e)&&Zt(e,this.instanceName);if(this.__l=null,!t(window[this.instanceName]))try{delete window[this.instanceName]}catch(t){window[this.instanceName]=void 0}},e}();window.WoopraTracker||(te(document,tt,$e),te(document,"mousedown",Me),te(document,at,Fe),te(window,lt,He),ve.addEventListener(ht,ze)),window.WoopraTracker=ln,window.WoopraLoadScript=sn.loadScript,t(window.exports)||(sn.Tracker=ln,window.exports.Woopra=sn,f(window.woopraLoaded)&&(window.woopraLoaded(),window.woopraLoaded=null));var hn=window.__woo||window._w;if(!t(hn))for(var dn in hn)if(hn.hasOwnProperty(dn)){var fn=new ln(dn);fn.init(),t(window.woopraTracker)&&(window.woopraTracker=fn)}}();
//# sourceMappingURL=w.js.map
