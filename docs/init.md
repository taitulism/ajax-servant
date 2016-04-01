Create and Config
=================

Create
------
`AjaxServant` is a class you create a servant instance from:
```js
var servant = new AjaxServant();
```

The constructor's signature is very flexible. It accepts up to three arguments:
* string: `VERB` - (default: `'GET'`) an HTTP verb: GET, POST, PUT, DELETE... Should be CAPITALIZED. 
* string: `/baseURL` - (default: `'/'`) the URL to assign the servant to. Should start with a slash e.g. `'/api'`.
* object: `{config}` - (default: `{}`) a configuration object (covered later).  

**Currently, there is no check against a valid HTTP verb.**

A string could be either the HTTP `VERB` or the `/baseURL`:  
If it starts with a slash `'/'` it's the base URL. Else, it's the VERB. An error is thrown if two strings were passed and none or both starts with a `'/'`.

```js
var cfg = {...};

new AjaxServant('GET', cfg, '/api'); // ok
new AjaxServant(cfg, '/api', 'GET'); // ok
new AjaxServant('GET', 'api'); // error (no slash)
new AjaxServant('/GET', '/api', cfg); // error (two slashes)

```




Config
------
**Defaults:**
```js
{
  async: true,
  ctx: null,
  breakCache: false,
  qryStr: {}, // empty object
  headers: {} // empty object
}
```

####async
type: boolean  
default: `true`  
When set to `false` the AJAX request will be synchronous (but why would you do that?).


####ctx
type: any  
default: `null`  
The context of the `this` keyword to run your callback with. See [events](./events.md).


####breakCache
type: boolean | string  
default: `'timestamp'`  
Adds a timestamp to the querystring (`key=value`) to get a fresh response. Pass `true` to use the default key (`timestamp=123456`). Pass a string to set your own cache breaker (e.g. `myCacheBreaker=123456`).


####qryStr
type: object  
default: `null`  
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
type: object  
default: `null`  
An object of HTTP headers to be sent for all requests.
```js
headers: {
  'Content-type': 'text/plain',
  'X-Requested-With': 'XMLHttpRequest',
  'token': 'secret'
}
```
