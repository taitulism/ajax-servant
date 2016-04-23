Initialization
==============

Create
------
`AjaxServant` is a class you create a servant instance from:
```js
var servant = new AjaxServant(verb, url, options);
```

The constructor requires an HTTP verb and a relative URL. 

>**NOTE:** there's no support for cross-domain requests, yet.

Options are optional.
* `verb` (string, required*) - one of: `'GET'`, `'POST'`, `'PUT'`, `'DELETE'`.
* `url` (string, required*) - the URL to assign the servant to. Should start with a slash (e.g. `'/api'`).
* `options` (object, optional) - a configuration object (covered later).  

>**NOTE:** Currently, only the 4 HTTP verbs listed above are supported formally but you can set `servant.verb` to whatever, after instantiation.

An error will be thrown if any of the `verb` or the `url` are invalid.




Options
-------
**Defaults:**
```js
{
  async: true,
  cacheBreaker: false,
  ctx: null,
  qryStr: null,
  headers: null
}
```

####async
**type:** boolean  
**default:** `true`  
When set to `false` the AJAX request will be synchronous (but why would you do that?). Chrome (50) doesn't allow synchronous request sent from the window. You will need a `web Worker` ([MDN link](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)) for that.


####cacheBreaker
**type:** boolean | string  
**default:** `'timestamp'`  
Adds a timestamp to the querystring (`key=value`) to get a fresh response. Pass `true` to use the default key (`timestamp=123456`). Pass a string to set your own cache breaker key (e.g. `myCacheBreaker=123456`).


####ctx
**type:** any  
**default:** `null`  
The context of the `this` keyword to run your callbacks with.
```js
var servant = new AjaxServant('GET', '/api', {ctx: {a:1}});

servant.on('load', function () {
  console.log(this); // -> {a:1}
});
```
You can set a specific context for event handlers. See [Events](./events.md#optionalcontext).  
tl;dr:
```js
var servant = new AjaxServant('GET', '/api', {ctx: {a:1}});

servant.on('load', {b:2}, function () {
  console.log(this); // -> {b:2}
});
```


####qryStr
**type:** object  
**default:** `null`  
An object that will be stringified and added to the request URL as the querystring (for all requests). Its keys and values will be encoded with the native `encodeURIComponent()`

```js
qryStr: {
  name: 'John',
  age: 30,
  bla: 'key=value'
}
// => URL + ?name=John&age=30&bla=key%3Dvalue
```


####headers
**type:** object  
**default:** `null`  
An object of HTTP headers to be sent for all requests.
```js
headers: {
  'Content-type': 'text/plain',
  'X-Requested-With': 'XMLHttpRequest',
  'token': 'secret'
}
```
