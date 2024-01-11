/*!
 * Copyright (c) 2024 Woopra, Inc.
 *
 * For license information please see https://static.woopra.com/js/w.js.LICENSE.txt
 */

!function(){"use strict";function t(t){return void 0===t}var e="object"==typeof global&&global&&global.Object===Object&&global,n="object"==typeof self&&self&&self.Object===Object&&self,i=e||n||Function("return this")(),o=i.Symbol,a=Object.prototype,r=a.hasOwnProperty,s=a.toString,c=o?o.toStringTag:void 0;var u=Object.prototype.toString;var l=o?o.toStringTag:void 0;function h(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":l&&l in Object(t)?function(t){var e=r.call(t,c),n=t[c];try{t[c]=void 0;var i=!0}catch(t){}var o=s.call(t);return i&&(e?t[c]=n:delete t[c]),o}(t):function(t){return u.call(t)}(t)}function d(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}function f(t){if(!d(t))return!1;var e=h(t);return"[object Function]"==e||"[object GeneratorFunction]"==e||"[object AsyncFunction]"==e||"[object Proxy]"==e}var p=function(){return i.Date.now()},g=/\s/;var m=/^\s+/;function v(t){return t?t.slice(0,function(t){for(var e=t.length;e--&&g.test(t.charAt(e)););return e}(t)+1).replace(m,""):t}function _(t){return null!=t&&"object"==typeof t}function w(t){return"symbol"==typeof t||_(t)&&"[object Symbol]"==h(t)}var y=/^[-+]0x[0-9a-f]+$/i,k=/^0b[01]+$/i,b=/^0o[0-7]+$/i,C=parseInt;function E(t){if("number"==typeof t)return t;if(w(t))return NaN;if(d(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=d(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=v(t);var n=k.test(t);return n||b.test(t)?C(t.slice(2),n?2:8):y.test(t)?NaN:+t}var S=Math.max,D=Math.min;function x(t,e,n){var i,o,a,r,s,c,u=0,l=!1,h=!1,f=!0;if("function"!=typeof t)throw new TypeError("Expected a function");function g(e){var n=i,a=o;return i=o=void 0,u=e,r=t.apply(a,n)}function m(t){return u=t,s=setTimeout(_,e),l?g(t):r}function v(t){var n=t-c;return void 0===c||n>=e||n<0||h&&t-u>=a}function _(){var t=p();if(v(t))return w(t);s=setTimeout(_,function(t){var n=e-(t-c);return h?D(n,a-(t-u)):n}(t))}function w(t){return s=void 0,f&&i?g(t):(i=o=void 0,r)}function y(){var t=p(),n=v(t);if(i=arguments,o=this,c=t,n){if(void 0===s)return m(c);if(h)return clearTimeout(s),s=setTimeout(_,e),g(c)}return void 0===s&&(s=setTimeout(_,e)),r}return e=E(e)||0,d(n)&&(l=!!n.leading,a=(h="maxWait"in n)?S(E(n.maxWait)||0,e):a,f="trailing"in n?!!n.trailing:f),y.cancel=function(){void 0!==s&&clearTimeout(s),u=0,i=c=o=s=void 0},y.flush=function(){return void 0===s?r:w(p())},y}var N;var O,B=((N={}).eu="www.woopra.com/track/",N.kr="kr.track.airis.appier.net/track/",N.us="us.track.airis.appier.net/track/",N),j="__woopraid",P=["campaign","content","id","medium","source","term"],I=["com.au","net.au","org.au","co.hu","com.ru","ac.za","net.za","com.za","co.za","co.uk","org.uk","me.uk","net.uk"],T="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",A=new RegExp("__woopraid=([^&#]+)"),U="action",R="page",L="scroll depth",W="pv",$="idptnc",M="_blank",F="data-tracked",H="ce_",z="co_",q="ce",Q="update",J="active",K="passive",V="hidden",G="frozen",X="terminated",Y="beforeunload",Z="blur",tt="click",et="download",nt="focus",it="freeze",ot="link",at="mousemove",rt="outgoing",st="pagehide",ct="pageshow",ut="resume",lt="scroll",ht="statechange",dt="unload",ft="visibilitychange",pt="app",gt="appier_app_id",mt="augment_action",vt="auto_decorate",_t="beacons",wt="campaign_once",yt="click_tracking_matcher_selectors",kt="click_pause",bt="context",Ct="cookie_domain",Et="cookie_expire",St="cookie_name",Dt="cookie_path",xt="cookie_secure",Nt="cross_domain",Ot="domain",Bt="download_extensions",jt="download_pause",Pt="download_tracking",It="dynamic_tracker",Tt="form_pause",At="hide_campaign",Ut="hide_xdm_data",Rt="idle_threshold",Lt="idle_timeout",Wt="ignore_query_url",$t="map_query_params",Mt="outgoing_pause",Ft="outgoing_tracking",Ht="personalization",zt="ping",qt="ping_interval",Qt="protocol",Jt="region",Kt="save_url_hash",Vt="third_party",Gt="use_cookies",Xt=[[$,$],["$duration","duration"],["$domain",Ot],["$app",pt],["$timestamp","timestamp"],["$action","event"],[gt,gt]],Yt=["avi","css","dmg","doc","eps","exe","js","m4v","mov","mp3","mp4","msi","pdf","ppt","rar","svg","txt","vsd","vxd","wma","wmv","xls","xlsx","zip"],Zt=["a"],te=["a","button","input[type=button]","input[type=submit]","[role=button]"],ee=((O={}).auto_decorate=void 0,O.download_tracking=!1,O.outgoing_ignore_subdomain=!0,O.outgoing_tracking=!1,O),ne={};function ie(t,e){ne[t][e]=null}function oe(t,e,n){null!=t&&t.addEventListener&&t.addEventListener(e,n)}function ae(t,e,n){var i=t.instanceName;ne[e]||(ne[e]={}),ne[e][i]=t,t.__l&&(t.__l[e]||(t.__l[e]=[]),t.__l[e].push(n))}function re(t){var e,n,i=ne[t];if(i)for(var o in i)if(i.hasOwnProperty(o)&&(n=(e=i[o])&&e.__l)&&n[t])for(var a=0;a<n[t].length;a++)n[t][a].apply(this,Array.prototype.slice.call(arguments,1))}function se(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function ce(){return ce=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(t[i]=n[i])}return t},ce.apply(this,arguments)}function ue(t,e){return ue=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},ue(t,e)}function le(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,i=new Array(e);n<e;n++)i[n]=t[n];return i}function he(t,e){var n="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(n)return(n=n.call(t)).next.bind(n);if(Array.isArray(t)||(n=function(t,e){if(t){if("string"==typeof t)return le(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?le(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var i=0;return function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function de(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var n=t[Symbol.toPrimitive];if(void 0!==n){var i=n.call(t,e||"default");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}var fe=function(){function t(){this._registry={}}var e=t.prototype;return e.addEventListener=function(t,e,n){this._getRegistry(t).push(e)},e.removeEventListener=function(t,e,n){var i=this._getRegistry(t),o=i.indexOf(e);o>-1&&i.splice(o,1)},e.dispatchEvent=function(t){return t.target=this,Object.freeze(t),this._getRegistry(t.type).forEach((function(e){return e(t)})),!0},e._getRegistry=function(t){return this._registry[t]=this._registry[t]||[]},t}(),pe=function(t,e){this.type=t,this.newState=e.newState,this.oldState=e.oldState,this.originalEvent=e.originalEvent},ge="object"==typeof safari&&safari.pushNotification,me="onpageshow"in self,ve=[nt,Z,ft,it,ut,ct,me?st:dt],_e=function(t){return t.preventDefault(),t.returnValue="Are you sure?"},we=[[J,K,V,X],[J,K,V,G],[V,K,J],[G,V],[G,J],[G,K]].map((function(t){return t.reduce((function(t,e,n){return t[e]=n,t}),{})})),ye=function(){return document.visibilityState===V?V:document.hasFocus()?J:K},ke=new(function(t){var e,n;function i(){var e;e=t.call(this)||this;var n=ye();return e._state=n,e._unsavedChanges=[],e._handleEvents=e._handleEvents.bind(function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(e)),ve.forEach((function(t){return addEventListener(t,e._handleEvents,!0)})),ge&&addEventListener(Y,(function(t){e._safariBeforeUnloadTimeout=setTimeout((function(){t.defaultPrevented||t.returnValue.length>0||e._dispatchChangesIfNeeded(t,V)}),0)})),e}n=t,(e=i).prototype=Object.create(n.prototype),e.prototype.constructor=e,ue(e,n);var o,a,r,s=i.prototype;return s.addUnsavedChanges=function(t){!this._unsavedChanges.indexOf(t)>-1&&(0===this._unsavedChanges.length&&addEventListener(Y,_e),this._unsavedChanges.push(t))},s.removeUnsavedChanges=function(t){var e=this._unsavedChanges.indexOf(t);e>-1&&(this._unsavedChanges.splice(e,1),0===this._unsavedChanges.length&&removeEventListener(Y,_e))},s._dispatchChangesIfNeeded=function(t,e){if(e!==this._state)for(var n=function(t,e){for(var n,i=0;n=we[i];++i){var o=n[t],a=n[e];if(o>=0&&a>=0&&a>o)return Object.keys(n).slice(o,a+1)}return[]}(this._state,e),i=0;i<n.length-1;++i){var o=n[i],a=n[i+1];this._state=a,this.dispatchEvent(new pe("statechange",{oldState:o,newState:a,originalEvent:t}))}},s._handleEvents=function(t){switch(ge&&clearTimeout(this._safariBeforeUnloadTimeout),t.type){case ct:case ut:this._dispatchChangesIfNeeded(t,ye());break;case nt:this._dispatchChangesIfNeeded(t,J);break;case Z:this._state===J&&this._dispatchChangesIfNeeded(t,ye());break;case st:case dt:this._dispatchChangesIfNeeded(t,t.persisted?G:X);break;case ft:this._state!==G&&this._state!==X&&this._dispatchChangesIfNeeded(t,ye());break;case it:this._dispatchChangesIfNeeded(t,G)}},o=i,(a=[{key:"state",get:function(){return this._state}},{key:"pageWasDiscarded",get:function(){return document.wasDiscarded||!1}}])&&se(o.prototype,a),r&&se(o,r),i}(fe)),be=Array.isArray;function Ce(t){return"string"==typeof t||!be(t)&&_(t)&&"[object String]"==h(t)}var Ee,Se,De=(Ee=Object.getPrototypeOf,Se=Object,function(t){return Ee(Se(t))}),xe=Function.prototype,Ne=Object.prototype,Oe=xe.toString,Be=Ne.hasOwnProperty,je=Oe.call(Object);function Pe(t){if(!_(t)||"[object Object]"!=h(t))return!1;var e=De(t);if(null===e)return!0;var n=Be.call(e,"constructor")&&e.constructor;return"function"==typeof n&&n instanceof n&&Oe.call(n)==je}var Ie=i.isFinite;function Te(){for(var t="",e=0;e<12;e++){var n=Math.floor(Math.random()*T.length);t+=T.substring(n,n+1)}return t}function Ae(e){return void 0===e&&(e=window.event),(!t(e.which)&&1===e.which||!t(e.button)&&0===e.button)&&!e.metaKey&&!e.altKey&&!e.ctrlKey&&!e.shiftKey}function Ue(t,e){var n=Ce(t)?e||{}:t||{};if(n.el)return n.el;if(Ce(t)){if(document.querySelectorAll)return document.querySelectorAll(t);if("#"===t[0])return document.getElementById(t.substr(1));if("."===t[0])return document.getElementsByClassName(t.substr(1))}}function Re(e,n,i){var o={};if(t(e))return o;for(var a in e)if(e.hasOwnProperty(a)){for(var r=e[a],s=!1,c=0;c<i.length;c++)if(i[c][0]===a){s=!0;break}s||"undefined"===r||"null"===r||t(r)||(o[""+n+a]=r)}return o}function Le(e){var n={};if(t(e))return n;for(var i in e)if(e.hasOwnProperty(i))if(Pe(e[i])||be(e[i]))try{n[i]=JSON.stringify(e[i])}catch(t){n[i]=e[i]}else n[i]=e[i];return n}function We(){var t,e=document.body.scrollHeight,n=((window.scrollY||0)+window.innerHeight)/e;return Math.max(0,Math.min(1,"number"==typeof(t=n)&&Ie(t)?n:0))}function $e(t,e){try{t()}catch(t){console.error("Error in Woopra "+e+" callback"),console.error(t.stack)}}function Me(t,e){return e.some((function(e){return t.matches(e)}))}function Fe(e,n){for(var i=e;!(t(i)||null===i||i.tagName&&Me(i,n));)i=i.parentNode;return i}function He(t){for(var e=[],n=t;n.parentNode;){for(var i=0,o=0,a=0;a<n.parentNode.childNodes.length;a++){var r=n.parentNode.childNodes[a];r.nodeName===n.nodeName&&(r===n&&(o=i),i++)}var s=n.nodeName.toLowerCase();n.hasAttribute("id")&&n.id?e.unshift(s+"#"+n.id):i>1?e.unshift(s+"["+o+"]"):e.unshift(s),n=n.parentNode}return e.slice(1).join(" > ")}function ze(e){var n=e.srcElement||e.target;Ae(e)&&re(tt,e,n),(ee.download_tracking||ee.outgoing_tracking)&&(t(n=Fe(e.srcElement||e.target,Zt))||null===n||n.getAttribute(F)||re(ot,e,n))}function qe(e){var n;re(at,e,Date.now()),ee.auto_decorate&&(t(n=Fe(e.srcElement||e.target,Zt))||null===n||re(vt,n))}function Qe(t){re(at,t,Date.now())}var Je=function(t,e,n){var i=!0,o=!0;if("function"!=typeof t)throw new TypeError("Expected a function");return d(n)&&(i="leading"in n?!!n.leading:i,o="trailing"in n?!!n.trailing:o),x(t,e,{leading:i,maxWait:e,trailing:o})}((function(t){re(lt,t)}),500);function Ke(t){re(ht,t)}function Ve(){}var Ge=function(){function t(t,e,n,i){this.woopra=t,this.id=e,this.params=n,this.meta=i}var e=t.prototype;return e.update=function(t,e){void 0===t&&(t={}),t.event&&t.event!==this.params.event&&(this.params.event=t.event),this.woopra.update(this.id,ce({},t,{$action:this.params.event}),e)},e.cancel=function(){this.woopra.cancelAction(this.id)},t}();function Xe(t,e,n){return t==t&&(void 0!==n&&(t=t<=n?t:n),void 0!==e&&(t=t>=e?t:e)),t}var Ye=o?o.prototype:void 0,Ze=Ye?Ye.toString:void 0;function tn(t){if("string"==typeof t)return t;if(be(t))return function(t,e){for(var n=-1,i=null==t?0:t.length,o=Array(i);++n<i;)o[n]=e(t[n],n,t);return o}(t,tn)+"";if(w(t))return Ze?Ze.call(t):"";var e=t+"";return"0"==e&&1/t==-Infinity?"-0":e}var en=1/0;function nn(t){var e=function(t){return t?(t=E(t))===en||t===-1/0?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0}(t),n=e%1;return e==e?n?e-n:e:0}function on(t){return null==t?"":tn(t)}function an(t){return!!t&&new RegExp("(?:^|;\\s*)"+encodeURIComponent(t).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=").test(document.cookie)}var rn=Object.freeze({__proto__:null,getItem:function(t){return t&&decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(t).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null},setItem:function(t,e,n,i,o,a){if(!t||/^(?:expires|max\-age|path|domain|secure)$/i.test(t))return!1;var r="";if(n)switch(n.constructor){case Number:r=n===1/0?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+n;break;case String:r="; expires="+n;break;case Date:r="; expires="+n.toUTCString()}return document.cookie=encodeURIComponent(t)+"="+encodeURIComponent(e)+r+(o?"; domain="+o:"")+(i?"; path="+i:"")+(a?"; secure":""),!0},removeItem:function(t,e,n){return!!an(t)&&(document.cookie=encodeURIComponent(t)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(n?"; domain="+n:"")+(e?"; path="+e:""),!0)},hasItem:an,keys:function(){for(var t=document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/),e=t.length,n=0;n<e;n++)t[n]=decodeURIComponent(t[n]);return t}}),sn="button",cn="submit",un="reset";function ln(t){t&&t.parentNode&&t.parentNode.removeChild(t)}var hn={};function dn(){return hn.location("hostname")}hn.docCookies=rn,hn.location=function(e,n){if(!t(window.location[e])){if(t(n))return window.location[e];window.location[e]=n}},hn.historyReplaceState=window.history&&window.history.replaceState?function(t,e,n){return window.history.replaceState(t,e,n)}:function(){},hn.hideUrlParams=function(t){var e=new RegExp("[?&]+((?:"+t.join("|")+")[^=&]*)=([^&#]*)","gi"),n=hn.location("href").replace(e,"");return hn.historyReplaceState(null,null,n),n},hn.getUrlParams=function(){var t={},e=hn.location("href");return e&&e.replace(/[?&]+([^=&]+)=([^&]*)/gi,(function(e,n,i){t[n]=decodeURIComponent(i.split("+").join(" "))})),t},hn.buildUrlParams=function(e,n){void 0===n&&(n="");var i=[];if(t(e))return e;for(var o in e)e.hasOwnProperty(o)&&("undefined"===e[o]||"null"===e[o]||t(e[o])||i.push(""+n+encodeURIComponent(o)+"="+encodeURIComponent(e[o])));return i.join("&")},hn.getCustomData=function(t,e){void 0===e&&(e="wv_");var n=hn.getUrlParams();for(var i in n)if(n.hasOwnProperty(i)){var o=n[i];if(i.substring(0,e.length)===e){var a=i.substring(e.length);t.call(this,a,o)}}},hn.getDomain=function(t){void 0===t&&(t=dn());var e=t.substring(t.lastIndexOf(".",t.lastIndexOf(".")-1)+1);return-1!==I.indexOf(e)?t.substring(t.lastIndexOf(".",t.indexOf(e)-2)+1):e},hn.getHostnameNoWww=function(){var t=dn();return 0===t.indexOf("www.")?t.replace("www.",""):t},hn.isOutgoingLink=function(t){var e=dn(),n=hn.getDomain(e);return!(t===e||t.replace(/^www\./,"")===e.replace(/^www\./,"")||ee.outgoing_ignore_subdomain&&n===hn.getDomain(t)||hn.startsWith(t,"javascript")||""===t||"#"===t)},hn.hideCrossDomainId=function(){return hn.hideUrlParams([j])},hn.mapQueryParams=function(e){var n=hn.getUrlParams(),i={};for(var o in e){var a=n[o];t(a)||(i[e[o]]=a)}return i},hn.redirect=function(t){hn.location("href",t)},hn.getCampaignData=function(){for(var e=hn.getUrlParams(),n={},i=0;i<P.length;i++){var o=P[i],a=e["utm_"+o]||e["woo_"+o];t(a)||(n["campaign_"+("campaign"===o?"name":o)]=a)}return n},hn.hideCampaignData=function(){return hn.hideUrlParams(["wv_","woo_","utm_"])},hn.leftClick=Ae,hn.randomString=Te,hn.getElement=Ue,hn.loadScript=function(e,n,i){void 0===n&&(n=Ve),void 0===i&&(i=Ve);var o=document.createElement("script");o.type="text/javascript",o.async=!0,t(o.onreadystatechange)?(o.onload=function(){n(),ln(o)},o.onerror=function(t){i(t),ln(o)}):o.onreadystatechange=function(){var t;(4===(t=this.readyState)||"complete"===t||"loaded"===t)&&(n(),ln(o))},o.src=e,document.body?document.body.appendChild(o):document.head.appendChild(o)},hn.removeScript=ln,hn.serializeForm=function(t,e){if(void 0===e&&(e={}),t&&"FORM"===t.nodeName){for(var n=e.exclude||[],i={},o=t.elements.length-1;o>=0;o-=1)if(!(""===t.elements[o].name||n.indexOf(t.elements[o].name)>-1))switch(t.elements[o].nodeName){case"INPUT":switch(t.elements[o].type){case"text":case"hidden":case sn:case un:case cn:i[t.elements[o].name]=t.elements[o].value;break;case"checkbox":case"radio":t.elements[o].checked&&(i[t.elements[o].name]=t.elements[o].value)}break;case"TEXTAREA":i[t.elements[o].name]=t.elements[o].value;break;case"SELECT":switch(t.elements[o].type){case"select-one":i[t.elements[o].name]=t.elements[o].value;break;case"select-multiple":for(var a=t.elements[o].options.length-1;a>=0;a-=1)t.elements[o].options[a].selected&&(i[t.elements[o].name]=t.elements[o].options[a].value)}break;case"BUTTON":switch(t.elements[o].type){case un:case cn:case sn:i[t.elements[o].name]=t.elements[o].value}}return i}},hn._on=ae,hn._fire=re,hn.attachEvent=oe,hn.startsWith=function(t,e,n){return t=on(t),n=null==n?0:Xe(nn(n),0,t.length),e=tn(e),t.slice(n,n+e.length)==e},hn.endsWith=function(t,e,n){t=on(t),e=tn(e);var i=t.length,o=n=void 0===n?i:Xe(nn(n),0,i);return(n-=e.length)>=0&&t.slice(n,o)==e};var fn=hn._fire,pn=function(){function e(t){var e;this.visitorData={},this.sessionData={},this.orgData={},this.options=((e={}).app="js-client",e.beacons=f(navigator.sendBeacon),e.campaign_once=!1,e.click_tracking_matcher_selectors=te,e.cookie_domain="."+hn.getHostnameNoWww(),e.cookie_expire=new Date((new Date).setDate((new Date).getDate()+730)),e.cookie_name="wooTracker",e.cookie_path="/",e.cookie_secure="https:"===hn.location("protocol"),e.cross_domain=!1,e.download_extensions=Yt,e.download_pause=200,e.download_tracking=!1,e.hide_campaign=!1,e.hide_xdm_data=!1,e.idle_threshold=1e4,e.idle_timeout=6e5,e.ignore_query_url=!1,e.map_query_params={},e.outgoing_ignore_subdomain=!0,e.outgoing_pause=200,e.outgoing_tracking=!1,e.personalization=!0,e.ping_interval=12e3,e.ping=!1,e.protocol="https",e.region="eu",e.save_url_hash=!0,e.third_party=!1,e.click_pause=250,e.form_pause=250,e.use_cookies=!0,e),this.instanceName=t||"woopra",this.idle=0,this.cookie="",this.last_activity=Date.now(),this.loaded=!1,this.dirtyCookie=!1,this.sentCampaign=!1,this.version=11,this.pending=[],this.beaconQueue=[],this.lastAction=null,t&&""!==t&&(window[t]=this)}var n=e.prototype;return n.init=function(){var t=this;this.__l={},this._processQueue("config"),this._setupCookie(),this._bindEvents(),setTimeout((function(){return t._processQueue()}),1),this.loaded=!0;var e=this.config("initialized");f(e)&&e(this.instanceName),this.config(Ut)&&hn.hideCrossDomainId()},n._processQueue=function(e){var n=window.__woo?window.__woo[this.instanceName]:n;if((n=window._w?window._w[this.instanceName]:n)&&n._e)for(var i=n._e,o=0;o<i.length;o++){var a=i[o];t(a)||!this[a[0]]||!t(e)&&e!==a[0]||this[a[0]].apply(this,Array.prototype.slice.call(a,1))}},n._setupCookie=function(){var t=this.getUrlId();this.cookie=this.getCookie(),t&&(this.cookie=t),(!this.cookie||this.cookie.length<1)&&(this.cookie=Te()),hn.docCookies.setItem(this.config(St),this.cookie,this.config(Et),this.config(Dt),this.config(Ct),this.config(xt)),this.dirtyCookie=!0},n._bindEvents=function(){var t=this;ae(this,tt,(function(e){return t.onClick(e)})),ae(this,et,(function(e){return t.downloaded(e)})),ae(this,ot,(function(e,n){return t.onLink(e,n)})),ae(this,at,(function(e,n){return t.moved(e,n)})),ae(this,rt,(function(e){return t.outgoing(e)})),ae(this,lt,(function(e){return t.onScroll(e)})),ae(this,ht,(function(e){return t.onPageStateChange(e)})),ae(this,vt,(function(e){return t.autoDecorate(e)}))},n._dataSetter=function(e,n,i){if(t(n))return e;if(t(i)){if(Ce(n))return e[n];if(d(n))for(var o in n)n.hasOwnProperty(o)&&(hn.startsWith(o,"cookie_")&&(this.dirtyCookie=!0),e[o]=n[o])}else hn.startsWith(n,"cookie_")&&(this.dirtyCookie=!0),e[n]=i;return this},n.getVisitorUrlData=function(){hn.getCustomData.call(this,this.identify,"wv_")},n.getCookie=function(){return hn.docCookies.getItem(this.config(St))},n.getProtocol=function(){var t=this.config(Qt);return t&&""!==t?t+":":""},n.getEndpoint=function(t){void 0===t&&(t="");var e=this.getProtocol();if(this.config(Vt)&&!this.config(Ot))throw new Error("Error: `domain` is not set.");var n=this.config(Vt)?"tp/"+this.config(Ot):"";t&&!hn.endsWith(t,"/")&&(t+="/"),n&&!hn.startsWith(t,"/")&&(n+="/");var i=this.config(Jt),o=B[i];if(!o)throw new Error("Error: Invalid region: "+i);return e+"//"+o+n+t},n.config=function(e,n){var i=this._dataSetter(this.options,e,n);return i===this&&(this.options.ping_interval=Math.max(6e3,Math.min(this.options.ping_interval,6e4)),ee.outgoing_tracking=this.options.outgoing_tracking,ee.download_tracking=this.options.download_tracking,ee.auto_decorate=t(ee.auto_decorate)&&this.options.cross_domain?this.options.cross_domain:ee.auto_decorate,ee.outgoing_ignore_subdomain=this.options.outgoing_ignore_subdomain,this.dirtyCookie&&this.loaded&&this._setupCookie()),i},n.visit=function(t,e){return this._dataSetter(this.sessionData,t,e)},n.identify=function(){var t=void 0,e=void 0,n=void 0,i=void 0;d(arguments.length<=0?void 0:arguments[0])&&d(arguments.length<=1?void 0:arguments[1])?(t=arguments.length<=0?void 0:arguments[0],n=arguments.length<=1?void 0:arguments[1]):d(arguments.length<=0?void 0:arguments[0])&&Ce(arguments.length<=1?void 0:arguments[1])?(t=arguments.length<=0?void 0:arguments[0],n=arguments.length<=1?void 0:arguments[1],i=arguments.length<=2?void 0:arguments[2]):Ce(arguments.length<=0?void 0:arguments[0])&&Ce(arguments.length<=1?void 0:arguments[1])&&d(arguments.length<=2?void 0:arguments[2])?(t=arguments.length<=0?void 0:arguments[0],e=arguments.length<=1?void 0:arguments[1],n=arguments.length<=2?void 0:arguments[2]):(t=arguments.length<=0?void 0:arguments[0],e=arguments.length<=1?void 0:arguments[1],n=arguments.length<=2?void 0:arguments[2],i=arguments.length<=3?void 0:arguments[3]);var o=this._dataSetter(this.visitorData,t,e);return n&&this._dataSetter(this.orgData,n,i),o},n.identifyOrg=function(t,e){return this._dataSetter(this.orgData,t,e)},n.call=function(t){f(this[t])&&this[t].apply(this,Array.prototype.slice.call(arguments,1))},n._push=function(e){var n,i=this;void 0===e&&(e={});var o=[["visitorData","cv_"],["eventData",H],["sessionData","cs_"],["orgData",z]],a={},r=this.getEndpoint(e.endpoint),s=e.lifecycle||U;this.getVisitorUrlData(),this.config(At)&&hn.hideCampaignData(),this._dataSetter(a,this.getOptionParams()),e.eventName&&(a.event=e.eventName),this.config(Ht)||(a.close=!0),a.timeout=t(e.timeout)?this.config(Lt):e.timeout;for(var c,u={},l=he(Xt);!(c=l()).done;){var h=c.value,d=h[0],p=h[1];e.eventData&&e.eventData[d]&&(u[p]=e.eventData[d])}this._dataSetter(a,u);for(var g=0;g<o.length;g++){var m=o[g],v=m[0],_=m[1],w=Le(Re(e[v],_,_===H?Xt:[]));_===z&&w.co_id&&(w.org=w.co_id,delete w.co_id),this._dataSetter(a,w)}if(this.config(bt))try{var y=JSON.stringify(this.config(bt));a.context=encodeURIComponent(y)}catch(t){}e.fullEventData&&(a=e.fullEventData);var k=Boolean(e.useBeacon||this.isUnloading),b=((n={}).dirty=k,n.duration=0,n.retrack=Boolean(e.retrack),n.sent=!k,n.timestamp=Date.now(),n),C=new Ge(this,a[$],a,b),E=f(e.callback)?function(){return e.callback(C)}:Ve,S=f(e.beforeCallback)?function(){return e.beforeCallback(C)}:Ve,D=e.errorCallback||Ve;if(s===R&&this.pending.forEach((function(t){t.lifecycle===R&&t.args.eventData[$]&&i.cancelAction(t.args.eventData[$])})),(s===R||e.useBeacon||this.isUnloading)&&this.pending.push({lifecycle:s,endpoint:e.endpoint,params:a,args:e,meta:b,callback:E,errorCallback:D}),s!==R&&e.endpoint===q&&(this.lastAction=C),this.isUnloading||e.useBeacon&&!e.queue)this.sendBeacons();else if(!e.queue){var x=r+"?"+hn.buildUrlParams(a);hn.loadScript(x,(function(){return $e(E,a.event)}),(function(){return $e(D,a.event)}))}setTimeout((function(){return $e(S,a.event)}))},n.track=function(e,n){var i,o,a,r,s,c,u={},l="",h=arguments[arguments.length-1],p=U,g=!1,m=!1;f(h)?o=h:d(h)&&(f(h.callback)?o=h.callback:f(h.onSuccess)&&(o=h.onSuccess),f(h.onBeforeSend)&&(a=h.onBeforeSend),f(h.onError)&&(r=h.onError),t(h.lifecycle)||(p=h.lifecycle),t(h.timeout)||(s=h.timeout),t(h.retrack)||(c=h.retrack),this.config(_t)?(t(h.queue)||(g=Boolean(h.queue)),t(h.useBeacon)?g&&(m=!0):m=Boolean(h.useBeacon)):m=!1),this.config(wt)&&this.sentCampaign||(u=ce({},u,hn.getCampaignData()),this.sentCampaign=!0),u=ce({},u,hn.mapQueryParams(this.config($t))),t(e)||e===o?l=W:t(n)||n===o?(Ce(e)&&(l=e),d(e)&&(e.name&&e.name===W&&(l=W),this._dataSetter(u,e))):(this._dataSetter(u,n),l=e),u[$]=Te(),l===W&&(u.url=u.url||this.getPageUrl(),u.title=u.title||this.getPageTitle(),u.domain=u.domain||this.getDomainName(),u.uri=u.uri||this.getURI(),u[L]=We(),u.returning=!t(u.returning)&&u.returning,h&&h.lifecycle||(p=R),this.config(Kt)&&""!==(i=u.hash||this.getPageHash())&&"#"!==i&&(u.hash=i));var v=this.config(mt);return f(v)&&v.call(this,l,u),this._push({endpoint:q,visitorData:this.visitorData,sessionData:this.sessionData,orgData:this.orgData,eventName:l,eventData:u,lifecycle:p,callback:o,beforeCallback:a,errorCallback:r,queue:g,useBeacon:m,retrack:c,timeout:s}),this.startPing(),this},n.update=function(e,n,i){var o,a,r,s,c=!1,u=!0;f(i)?a=i:d(i)&&(f(i.callback)?a=i.callback:f(i.onSuccess)&&(a=i.onSuccess),f(i.onBeforeSend)&&(r=i.onBeforeSend),f(i.onError)&&(s=i.onError),this.config(_t)?(t(i.queue)||(c=Boolean(i.queue)),t(i.useBeacon)?c&&(u=!0):u=Boolean(i.useBeacon)):u=!1);for(var l,h=((o={})[$]=e,o.project=this.config(Ot)||hn.getHostnameNoWww(),o),p={},g=he(Xt);!(l=g()).done;){var m=l.value,v=m[0],_=m[1];n&&n[v]&&(p[_]=n[v])}return this.config(Gt)&&(p.cookie=this.getCookie()||this.cookie),this._dataSetter(h,p),this._dataSetter(h,Le(Re(n,H,Xt))),this._push({endpoint:Q,fullEventData:h,callback:a,beforeCallback:r,errorCallback:s,queue:c,useBeacon:u}),this},n.cancelAction=function(t){var e,n=!1;(null==(e=this.lastAction)?void 0:e.id)===t&&(this.lastAction=null),this.pending=this.pending.map((function(e){var i;return e.params[$]===t?(n=!0,ce({},e,{meta:ce({},e.meta,(i={},i.cancelled=!0,i.dirty=!0,i.duration=e.lifecycle===R?e.meta.duration+(Date.now()-e.meta.timestamp):e.meta.duration,i.retrack=!1,i))})):e})),n&&this.sendBeacons()},n.trackForm=function(t,e,n){var i,o=this;void 0===t&&(t="Tracked Form");var a=Ce(e)?n||{}:e||{},r=function(t,e,n,i){oe(t,"submit",(function(n){o.trackFormHandler(n,t,e,a)}))};if((i=a.elements?a.elements:Ue(e,a))&&i.length>0)for(var s in i)r(i[s],t)},n.trackFormHandler=function(t,e,n,i){void 0===i&&(i={});var o=!1;if(!e.getAttribute(F)){var a=Boolean(this.config(_t)),r=hn.serializeForm(e,i);if(f(i.identify)){var s=i.identify(r)||{};s&&this.identify(s)}var c=f(i.onBeforeSend)?i.onBeforeSend:void 0,u=f(i.callback)?function(){return i.callback(r)}:void 0,l=f(i.onError)?i.onError:void 0;if(i.noSubmit||e.setAttribute(F,1),i.noSubmit||a)this.track(n,r,{onBeforeSend:c,onError:l,onSuccess:u,useBeacon:a});else{t.preventDefault(),t.stopPropagation();var h=setTimeout((function(){o||e.submit()}),this.config(Tt));this.track(n,r,{onBeforeSend:c,onSuccess:function(){clearTimeout(h),u&&u(),o||e.submit(),o=!0},onError:l})}}},n.trackClick=function(t,e,n,i){var o=this;void 0===t&&(t="Item Clicked"),void 0===i&&(i={});var a=[],r=function(t,e,n,i){oe(t,tt,(function(a){o.trackClickHandler(a,t,e,n,i)}))};if(a=i.elements?i.elements:Ue(e,i))for(var s=0;s<a.length;s++)r(a[s],t,n,i)},n.trackClickHandler=function(t,e,n,i,o){var a=!1;if(!e.getAttribute(F)){var r=Boolean(this.config(_t)),s=f(o.onBeforeSend)?o.onBeforeSend:void 0,c=f(o.callback)?function(){return o.callback(i)}:void 0,u=f(o.onError)?o.onError:void 0;if(o.noNav||e.setAttribute(F,1),o.noNav||r)this.track(n,i,{onBeforeSend:s,onError:u,onSuccess:c,useBeacon:r});else{t.preventDefault();var l=setTimeout((function(){a||e.click()}),this.config(kt));this.track(n,i,{onBeforeSend:s,onSuccess:function(){clearTimeout(l),c&&c(),a||e.click(),a=!0},onError:u})}}},n.startPing=function(){var e=this;t(this.pingInterval)&&(this.pingInterval=setInterval((function(){e.ping()}),this.config(qt)))},n.stopPing=function(){t(this.pingInterval)||(clearInterval(this.pingInterval),delete this.pingInterval)},n.ping=function(){this.config(zt)&&this.idle<this.config(Lt)||this.stopPing();var t=Date.now();return t-this.last_activity>this.config(Rt)&&(this.idle=t-this.last_activity),this},n.push=function(t){return this._push({endpoint:"identify",visitorData:this.visitorData,sessionData:this.sessionData,orgData:this.orgData,callback:t}),this.sendBeacons(),this},n._updateDurations=function(t,e){var n=Date.now();function i(i){var o,a,r;switch(e){case J:case K:var s;return n-i.meta.leave>i.params.timeout?((s={}).expired=!0,s):e===J&&t===K||e===K&&t===J?{}:((o={}).timestamp=n,o);case V:return(a={}).dirty=i.meta.dirty||n-i.meta.timestamp>100,a.duration=i.meta.duration+(n-i.meta.timestamp),a.leave=n,a;case X:return(r={}).dirty=i.meta.dirty||n-i.meta.leave>100,r;default:return{}}}this.pending=this.pending.map((function(t){return t.lifecycle!==R?t:ce({},t,{meta:ce({},t.meta,i(t))})})),this.lastAction&&(this.lastAction=ce({},this.lastAction,{meta:ce({},this.lastAction.meta,i(this.lastAction))}))},n._processLifecycle=function(t){var e,n=this,i=[];(this.pending.forEach((function(t){var e;t.meta.expired&&!t.meta.cancelled&&t.meta.retrack&&i.push(ce({},t.args,{eventData:ce({},t.args.eventData||{},(e={},e[$]=Te(),e.returning=!0,e))}))})),i.forEach((function(t){return n._push(t)})),this.pending=this.pending.filter((function(e){return!e.meta.expired&&(e.meta.dirty&&n.beaconQueue.push({lifecycle:e.lifecycle,endpoint:e.endpoint,params:ce({},e.params),meta:ce({},e.meta),successCallback:e.callback,errorCallback:e.errorCallback}),!e.meta.cancelled&&(e.lifecycle===R&&t!==R))})),this.pending=this.pending.map((function(t){var e;return ce({},t,{meta:ce({},t.meta,(e={},e.dirty=!1,e.sent=!0,e))})})),t===R&&this.lastAction)&&this.beaconQueue.push({lifecycle:R,endpoint:q,params:ce({},this.lastAction.params),meta:ce({},this.lastAction.meta,(e={},e.sent=!0,e))});return i.length>0},n._drainBeaconQueue=function(){var t=this,e=this.config(Gt);function n(t){t[$],t.cookie,t.project,t.event;var e=function(t,e){if(null==t)return{};var n,i,o={},a=Object.keys(t);for(i=0;i<a.length;i++)n=a[i],e.indexOf(n)>=0||(o[n]=t[n]);return o}(t,[$,"cookie","project","event"].map(de));return Object.keys(e).length>0}var i=this.beaconQueue.reduce((function(t,e){return t[e.params[$]]=[],t}),{});this.beaconQueue.forEach((function(t){i[t.params[$]].push(t)})),this.beaconQueue=[];var o=Object.keys(i).map((function(n){var o=i[n],a={endpoint:void 0,params:{},onSuccess:[],onError:[]};return o.forEach((function(n){var i;a.endpoint||(n.endpoint===q&&n.meta.sent?a.endpoint=Q:a.endpoint=n.endpoint),a.params.project=n.params.project,a.params.event=n.params.event,a.params[$]=n.params[$],e&&(a.params.cookie=t.getCookie()||t.cookie),(n.lifecycle===R||n.params[$]===(null==(i=t.lastAction)?void 0:i.id))&&n.meta.duration>0&&(a.params.duration=n.meta.duration),n.meta[L]&&(a.params["ce_scroll depth"]=Math.round(1e4*n.meta[L])/1e4),n.meta.sent||(a.params=ce({},a.params,n.params),f(n.successCallback)&&a.onSuccess.push(n.successCallback),f(n.errorCallback)&&a.onError.push(n.errorCallback))})),a.params.project||(a.params.project=t.config(Ot)||hn.getHostnameNoWww()),a})).filter((function(t){return n(t.params)})),a=navigator.sendBeacon&&navigator.sendBeacon.bind(navigator),r=Boolean(this.config(_t))&&f(a);if(o.length>0)if(r){var s=[""];o.map((function(t){var e=t.endpoint,n=t.params;return JSON.stringify({endpoint:e,params:n})})).forEach((function(t){new Blob([""+s[s.length-1]+t]).size>=65e3&&s.push(""),s[s.length-1]+=t+"\n"})),s.forEach((function(e,n){var i=new FormData;i.append("payload",e.slice(0,-1));try{a(t.getEndpoint("push"),i)}catch(t){console.error("Woopra: sendBeacon failed:",t)}})),o.forEach((function(t){t.onSuccess.forEach((function(e){return $e(e,t.params.event)}))}))}else o.forEach((function(e){var n=t.getEndpoint(e.endpoint)+"?"+hn.buildUrlParams(ce({close:!0},e.params));hn.loadScript(n,(function(){return e.onSuccess.forEach((function(t){return $e(t,e.params.event)}))}),(function(){return e.onError.forEach((function(t){return $e(t,e.params.event)}))}))}))},n.sendBeacons=function(t){void 0===t&&(t=U),this._processLifecycle(t),this._drainBeaconQueue()},n.sleep=function(){},n._touch=function(t){void 0===t&&(t=Date.now()),this.last_activity=t,this.idle=0},n.moved=function(t,e){this._touch(e)},n.getLinkType=function(t){var e=!this.config(Pt)&&void 0,n=!this.config(Ft)&&void 0,i=this.config(Bt),o=new RegExp("(?:"+i.join("|")+")($|&)","i").test(t.pathname);return this.config(Pt)&&o&&(e=!0),this.config(Ft)&&!e&&hn.isOutgoingLink(t.hostname)&&(n=!0),{download:e,outgoing:n}},n.onClick=function(e){if(this.config("click_tracking")){var n=Boolean(this.config(_t)),i=Fe(e.target,this.config(yt));if(i){var o=i.tagName.toLowerCase(),a=i.getAttributeNames().reduce((function(t,e){return hn.startsWith(e,"data-woopra-")&&(t[e.slice(12)]=i.getAttribute(e)),t}),{}),r=i.getAttribute("data-woopra")||"button click",s=ce({"page url":this.getPageUrl(),"page title":this.getPageTitle(),text:i.innerText||i.value||i.textContent,title:i.textContent,type:"a"===o?"link":i.type,tagname:o,classname:i.className,"dom path":He(i),url:i.href,"pointer type":e.pointerType},a);if(this.config(It)){var c=this.getLinkType(i),u=c.download,l=c.outgoing;t(u)||(s.download=u),t(l)||(s.outgoing=l)}if(this.config(Kt)){var h=this.getPageHash();""!==h&&"#"!==h&&(s["page hash"]=h)}this.track(r,s,{useBeacon:n})}}},n.onLink=function(t,e){if(!this.config(It)){var n=Boolean(this.config(_t)),i=this.getLinkType(e),o=i.download,a=i.outgoing;o&&(fn(et,e.href),e.target!==M&&hn.leftClick(t)&&(e.setAttribute(F,1),n||(t.preventDefault(),t.stopPropagation(),setTimeout((function(){e.click()}),this.config(jt))))),a&&(fn(rt,e.href),e.target!==M&&hn.leftClick(t)&&(e.setAttribute(F,1),n||(t.preventDefault(),t.stopPropagation(),setTimeout((function(){e.click()}),this.config(Mt)))))}},n.downloaded=function(t){var e=Boolean(this.config(_t));this.track(et,{url:t},{useBeacon:e})},n.outgoing=function(t){var e=Boolean(this.config(_t));this.track(rt,{url:t},{useBeacon:e})},n.onUnload=function(){this.isUnloading||(this.isUnloading=!0,this._updateDurations(V,X),this.sendBeacons(R))},n.onPageStateChange=function(t){var e=t.newState,n=t.oldState;switch(e){case J:this._updateDurations(n,e),this.sendBeacons(),this._touch();break;case K:case V:this._updateDurations(n,e),this.sendBeacons();break;case X:this.onUnload()}},n.onScroll=function(t){this._touch();var e=We();this.pending.filter((function(t){return t.lifecycle===R})).forEach((function(t){t.meta[L]=Math.min(1,Math.max(e,t.meta[L]||0))}))},n.autoDecorate=function(t){var e=this.config(Nt);if(e){for(var n,i=Ce(e)?[e]:be(e)?e:[],o=0;o<i.length;o++)if(-1!==t.hostname.indexOf(i[o])&&t.hostname!==hn.location("hostname")){n=!0;break}if(n){var a=this.decorate(t);a&&(t.href=a)}}},n.reset=function(){hn.docCookies.removeItem(this.config(St),this.config(Dt),this.config(Ct)),this.cookie=null,this._setupCookie()},n.decorate=function(t){var e,n,i,o;if(Ce(t)?((e=document.createElement("a")).href=t,n=e.search?"&":"?"):t&&t.href&&(e=t),e)return n=e.search?"&":"?",i=e.pathname&&"/"===e.pathname.charAt(0)?e.pathname:"/"+e.pathname,o=e.hostname+(e.port&&""!==e.port&&"80"!==e.port&&"0"!==e.port?":"+e.port:""),e.protocol+"//"+o+i+e.search+n+"__woopraid="+this.cookie+e.hash},n.undecorate=function(t){var e=new RegExp("[?&]+(?:__woopraid)=([^&#]*)","gi"),n=t;if(t&&t.href&&(n=t.href),n)return n.replace(e,"")},n.getPageUrl=function(){return this.config(Wt)?hn.location("pathname"):""+hn.location("pathname")+hn.location("search")},n.getPageHash=function(){return hn.location("hash")},n.getPageTitle=function(){return 0===document.getElementsByTagName("title").length?"":document.getElementsByTagName("title")[0].innerHTML},n.getDomainName=function(){return hn.location("hostname")},n.getURI=function(){return hn.location("href")},n.getUrlId=function(t){void 0===t&&(t=hn.location("href"));var e=t.match(A);if(e&&e[1])return e[1]},n.getOptionParams=function(){var t={project:this.config(Ot)||hn.getHostnameNoWww(),instance:this.instanceName,meta:hn.docCookies.getItem("wooMeta")||"",screen:window.screen.width+"x"+window.screen.height,language:window.navigator.browserLanguage||window.navigator.language||"",app:this.config(pt),referer:document.referrer};return this.config(Ot)||(t._warn="no_domain",hn.getHostnameNoWww()!==hn.getDomain()&&(t._warn+=",domain_mismatch")),this.config(Gt)&&(t.cookie=this.getCookie()||this.cookie),this.config("ip")&&(t.ip=this.config("ip")),t},n.dispose=function(){for(var e in this.stopPing(),this.__l)this.__l.hasOwnProperty(e)&&ie(e,this.instanceName);if(this.__l=null,!t(window[this.instanceName]))try{delete window[this.instanceName]}catch(t){window[this.instanceName]=void 0}},e}();window.WoopraTracker||(oe(document,tt,ze),oe(document,"mousedown",qe),oe(document,at,Qe),oe(window,lt,Je),ke.addEventListener(ht,Ke)),window.WoopraTracker=pn,window.WoopraLoadScript=hn.loadScript,t(window.exports)||(hn.Tracker=pn,window.exports.Woopra=hn,f(window.woopraLoaded)&&(window.woopraLoaded(),window.woopraLoaded=null));var gn=window.__woo||window._w;if(!t(gn))for(var mn in gn)if(gn.hasOwnProperty(mn)){var vn=new pn(mn);vn.init(),t(window.woopraTracker)&&(window.woopraTracker=vn)}}();
//# sourceMappingURL=w.js.map
