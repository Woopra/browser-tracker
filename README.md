# Woopra Browser Tracker

[**Full Documentation ▸**](https://docs.woopra.com/reference#intro-javscript-sdk)

# Installation

For best results, this should be included at the top of your document, preferrably in the HEAD section,
but definitely before you make any calls to `woopra`. You may use any `woopra` function after this snippet
and it will process all of your commands after the script loads asynchronously.

```html
<script>
  // load woopra tracker
  !function(){var t,o,c,e=window,n=document,r=arguments,a="script",i=["call","cancelAction","config","identify","push","track","trackClick","trackForm","update","visit"],s=function(){var t,o=this,c=function(t){o[t]=function(){return o._e.push([t].concat(Array.prototype.slice.call(arguments,0))),o}};for(o._e=[],t=0;t<i.length;t++)c(i[t])};for(e.__woo=e.__woo||{},t=0;t<r.length;t++)e.__woo[r[t]]=e[r[t]]=e[r[t]]||new s;(o=n.createElement(a)).async=1,o.src="https://static.woopra.com/w.js",(c=n.getElementsByTagName(a)[0]).parentNode.insertBefore(o,c)}("woopra");

  // configure tracker
  woopra.config({
    domain: 'mybusiness.com'
  });

  // track pageview action
  woopra.track();
</script>
```

### Advanced

You can change the tracker's instance name by changing the string in the last line of the snippet `})('woopra');`.
If you need multiple instances just duplicate the snippet with a different instance name.

# Configuration

The Woopra tracker can be customized using the config function. Find below the list of options:

| Option                           | Default                                                                    | Description                                                                                                          |
|----------------------------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| **domain**                       | N/A: required                                                              | **REQUIRED** Project Name in Woopra. Must be explicitly set for tracker to work.                                     |
| beacons                          | Browser support                                                            | Whether to use `navigator.sendBeacon` instead of `<script>` injection to send actions to Woopra's tracking servers   |
| click_pause                      | `250`                                                                      | Time in millisecond to pause the browser to ensure that the event is tracked when visitor clicks on an element url.  |
| click_tracking                   | `false`                                                                    | Track button and link clicks.                                                                                        |
| click_tracking_matcher_selectors | `['a','button','input[type=button]','input[type=submit]','[role=button]']` | Array of query selectors to enable click tracking for.                                                               |
| cookie_domain                    | Website domain                                                             | Domain scope of the Woopra cookie.                                                                                   |
| cookie_expire                    | 2 years from last action                                                   | Expiration date (Date object) of the Woopra cookie.                                                                  |
| cookie_name                      | `'wooTracker'`                                                             | Name of the cookie used to identify the visitor.                                                                     |
| cookie_path                      | `/`                                                                        | Directory scope of the Woopra cookie.                                                                                |
| download_extensions              | `['avi', 'css', 'dmg',...]`                                                | Specifies which file extensions will result in a `downloaded` event to be tracked upon click.                        |
| download_pause                   | `200`                                                                      | Time in millisecond to pause the browser to ensure that the event is tracked when visitor clicks on a download url.  |
| download_tracking                | `false`                                                                    | Track downloads on the web page.                                                                                     |
| form_pause                       | `250`                                                                      | Time in millisecond to pause the browser to ensure that the event is tracked when visitor clicks submits a form.     |
| hide_campaign                    | `false`                                                                    | Enabling this option will remove campaign properties from the URL when they’re captured (using HTML5 `pushState`).   |
| ignore_query_url                 | `true`                                                                     | Ignores the query part of the url when the standard pageviews tracking function (track() with no args) is called     |
| map_query_params                 | `{}`                                                                       | Object with URL parameter keys mapped to action property names. (e.g. { ref: "campaign_name" })                      |
| outgoing_ignore_subdomain        | `true`                                                                     | Do not include links to subdomains as outgoing links.                                                                |
| outgoing_pause                   | `200`                                                                      | Time in millisecond to pause the browser to ensure that the event is tracked when visitor clicks on an outgoing url. |
| outgoing_tracking                | `false`                                                                    | Track external links clicks on the web page.                                                                         |
| personalization                  | `true`                                                                     | Keeps the tracking request connection open to allow personalization features like segments and client triggers       |
| ping                             | `false`                                                                    | Ping woopra servers to ensure that the visitor is still on the webpage.                                              |
| ping_interval                    | `12000`                                                                    | Time interval in milliseconds between each ping. (min: `6000`, max: `60000`)                                         |
| protocol                         | `https://`                                                                 | The protocol used to contact Woopra's servers. `http://` forces unsecure mode and `//` follows the page's protocol   |

The `config()` function supports key/value singleton argument:

```javascript
woopra.config('cookie_name', 'my_business_cookie');
```

Or an object of keys and values:

```javascript
woopra.config({
  download_tracking: false,
  outgoing_tracking: false,
  ping_interval: 30000
});
```

# Identifying Customers

In order to identify a customer, you need to send their email address to Woopra as a custom visitor property. It should
be added before the `track()` function and formatted in the following manner:

```javascript
// Identify customer before the track event
woopra.identify({
  email: 'johndoe@mybusiness.com',
  name: 'John Doe',
  company: 'My Business'
});
```

Standard attributes which will be displayed in the Woopra profiles include:

- `email` - Which displays the visitor's email address and it will be used as a unique identifier instead of cookies.
- `name` - Which displays the visitor's full name
- `company` - Which displays the company name or account of your customer

Note that if you wish to identify a visitor without sending a tracking event, you can call the function `push()`.
`push()` also accepts a callback function as a parameter.

```javascript
woopra.identify('email', 'johndoe@mybusiness.com').push();
```

# Tracking Actions

Woopra also allows you to track Custom Actions in addition to simple pageviews. Let’s say you are running a website
where people can signup. You can track these actions using Woopra’s Custom Events.

The `track()` function will track the pageview of the current page if no arguments are provided:

### Arguments

- `eventName` - name of the custom event to track
- `properties` - An object containing any properties to send with the custom event
- `callback` - A callback function on success

```javascript
woopra.track();

// The line above is equivalent to
woopra.track('pv', {
  url: window.location.pathname + window.location.search,
  title: document.title
});
```

To track custom actions, you can define the action name string and the properties associated with that action object:

```javascript
woopra.track(
  'signup',
  {
    company: 'My Business',
    username: 'johndoe',
    plan: 'Gold'
  },
  function (action) {
    // track request successfully sent to Woopra
  }
);
```

The code above will track a custom event titled `signup` and provides some more information like the username and company of the account created. Just imagine all of the custom events that can be tracked on your website: payment, comment, logout, email, etc…

What’s even more important about custom events is that you can always run custom reports about the data you pass to Woopra, so for the example given above, you could get the number of signup by company.

When you track custom events, remember to update your schema on Woopra. That will help the rest your team to identify the events being tracked and Woopra will automatically build reports out of the box based on the event properties.

Below is another example to track when people click on the play button with id="play-button":

```javascript
document.getElementById('play-button').onclick = function() {
  woopra.track('play', {
    artist: 'Dave Brubeck',
    song: 'Take Five',
    genre: 'Jazz'
  });
};
```

# Browser Support

- Chrome 15+
- Firefox 6+
- Safari 5.1+
- Edge
- Internet Explorer 9+
