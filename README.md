**A WORK IN PROGRESS...**  
Won't be taking any pull requests. For now.


Ajax Servant
============
A javascript client-side class to create dedicated ajax services.


Justification
-------------
A customized AJAX request can get really messy to configure, send and bind the response handlers to, and we usually do it all in one place (e.g. `jQuery.ajax({...})`).

`Promise`s are ok, i guess, but often doesn't **feel** like the "right" way to go with. This concept was very hard for me to understand back then. A promise is an abstarct idea. I mean, I can imagine a car object, I can "see" an events object and its queue array, I can almost feel an HTML element, but WTH is a promise? 

And why should I "re-wire" the promise to the "send" function call (`.send().then()`) when I usually want the same callback to run when the same request is sent?

That's because the XHR object is used only for one single request and then it dies. All of its XHR event handlers are gone with it so we need to bind some new handlers for every new request, even if it's exactly the same request as the one before.

With today's javascript programming concepts, an ajax request will likely to be triggered by a specific component or an app rather than by the page itself (i.e some arbitrary code in the global scope). An ajax request has now a master entity (e.g. a controller, an initiator) to config, send, abort and handle its responses.
A component will usually have just a couple of requests it uses to the same API, with the same HTTP methods (GET, POST...) and the only thing that changes per request is the payload (dynamic data).

An **Ajax Servant** instance is a pre-configured ajax request object that you configure once (i.e. in your `component.init()`) and use multiple times (i.e. in your `component.getItem()`), using the same XHR instance.

You configure it once with a base URL, a static querystring if you'd like and maybe some static headers:
```js
var servant = new AjaxServant('GET', '/api/items', configObj);
```
Keep the `servant` instance on your component. This is your component's go-to guy for everything you'll ever need from the back-end. 

You can bind the response event handlers now or later in the code (`servant.on()`).

When time comes you can send the servant on its way with some dynamic data (`servant.send()`), additional URL segments, querystring parameters and headers.

Next time you'll send the `servant` away, it will use the same base configuration, the same XHR instance and the same handlers.

[Read The Fabulous Manual](https://github.com/taitulism/ajax-servant/blob/master/docs/README.md)
