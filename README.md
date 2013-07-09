Repository for Woopra client-side javascript tracking

# Installation
For best results, this should be included at the top of your document, preferrably in the HEAD section,
but definitely before you make any calls to `woopra`.  You may use any `woopra` function after this snippet
and it will process all of your commands after the script loads asynchronously.

```html
<script>
(function(t){
	var i,e,n,o=window,a=document,r="script",s=["config","track","identify","push","call"],c=function(){var t=this;for(t._e=[],i=0;s.length>i;i++)(function(i){t[i]=function(){return t._e.push([i].concat(Array.prototype.slice.call(arguments,0))),t}})(s[i])};o._w=o._w||{},o._w[t]=o[t]=o[t]||new c,e=a.createElement(r),e.async=1,e.src="//static.woopra.com/js/wpt.min.js?v=3.0.3",n=a.getElementsByTagName(r)[0],n.parentNode.insertBefore(e,n)	
})("woopra");

// configure tracker
woopra.config({
 domain: 'mybusiness.com'
});
</script>
```

### Advanced
You can change the tracker's instance name by changing the string in the last line of the snippet `})("woopra");`.
If you need multiple instances just duplicate the snippet with a different instance name.


# Configuration

The Woopra tracker can be customized using the config function. Find below the list of options:

Option | Default | Description
--- | --- | ---
domain | Website domain | Website hostname as added to Woopra
cookie_name | 'wooTracker' | Name of the cookie used to identify the visitor
cookie_domain | Website domain | Domain scope of the Woopra cookie
cookie_path | / | Directory scope of the Woopra cookie
cookie_expire | 2 years from last action | Expiration date (Date object) of the Woopra cookie
ping | true | Ping woopra servers to ensure that the visitor is still on the webpage
ping_interval | 12000 | Time interval in milliseconds between each ping
idle_timeout | 300000 | Idle time after which the user is considered offline
download_tracking | true | Track downloads on the web page
outgoing_tracking | true | Track external links clicks on the web page
download_pause | 200 | Time in millisecond to pause the browser to ensure that the event is tracked when visitor clicks on a download url.
outgoing_pause | 400 | Time in millisecond to pause the browser to ensure that the event is tracked when visitor clicks on an outgoing url.
ignore_query_url | true | Ignores the query part of the url when the standard pageviews tracking function track()
The config function supports key/value singleton argument:

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

In order to identify a customer, you need to send their email address to Woopra as a custom visitor property. It should be added before the track() function and formatted in the following manner:

```javascript

// Identify customer before the track event
woopra.identify({
    email: 'johndoe@mybusiness.com',
    name: 'John Doe',
    company: 'My Business'
});

```
Standard attributes which will be displayed in the Woopra live visitor data include:

email - Which displays the visitor's email address and it will be used as a unique identifier instead of cookies.
name - Which displays the visitor's full name
company - Which displays the company name or account of your customer
avatar - Which is a URL link to a visitor avatar
But you can define any attribute you like and have that detail passed from within the visitor live stream data when viewing Woopra.

Note that if you wish to identify a visitor without sending a tracking event, you can call the function push().

```javascript
woopra.identify('email', 'johndoe@mybusiness.com').push();
```
# Tracking Actions

Woopra also allows you to track Custom Actions in addition to simple pageviews. Let’s say you are running a website where people can signup. You can track these actions using Woopra’s Custom Events.

The track() function will track the pageview of the current page if no arguments are provided:

```javascript
woopra.track();

// The line above is equivalent to
woopra.track('pv', {
    url: window.location.pathname + window.location.search,
    title: document.title,
});
```
To track custom actions, you can define the action name string and the properties associated with that action object:

```javascript
woopra.track('signup', {
    company: 'My Business',
    username: 'johndoe',
    plan: 'Gold'
});
```
The code above will track a custom event titled “signup”, and provides some more information like the username and company of the account created. Just imagine all of the custom events that can be tracked on your website: payment, comment, logout, email, etc…

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
