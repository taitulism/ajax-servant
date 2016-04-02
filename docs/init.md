Initialization
==============

Create
------
`AjaxServant` is a class you create a servant instance from:
```js
var servant = new AjaxServant(verb, url, options);
```

The constructor requires an HTTP verb and a RELATIVE URL. 

>**NOTE:** there's no support for cross domain requests. yet!

Options are optional.
* `verb` (string, required*) - one of: `'GET'`, `'POST'`, `'PUT'`, `'DELETE'`.
* `url` (string, required*) - the URL to assign the servant to. Should start with a slash e.g. `'/api'`.
* `options` (object, optional) - a configuration object (covered later).  

>**NOTE:** Currently, only the 4 HTTP verbs listed above are supported formally but you can set `servant.verb` to whatever, after instanciation.

A string could be either the HTTP `VERB` or the `/baseURL`:  
If it starts with a slash `'/'` it's the base URL. Else, it's the VERB. An error is thrown if two strings were passed and none or both starts with a `'/'`.




Options
-------
**Defaults:**
```js
{
  async: true,
  breakCache: false,
  ctx: null,
  qryStr: null,
  headers: null
}
```

####async
**type:** boolean  
**default:** `true`  
When set to `false` the AJAX request will be synchronous (but why would you do that?).


####breakCache
**type:** boolean | string  
**default:** `'timestamp'`  
Adds a timestamp to the querystring (`key=value`) to get a fresh response. Pass `true` to use the default key (`timestamp=123456`). Pass a string to set your own cache breaker (e.g. `myCacheBreaker=123456`).


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
