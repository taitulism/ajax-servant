Events
======
After [initializing](./init.md#create) a servant instance you can bind it with callbacks to handle its different events.

```js
var servant = new AjaxServant('GET', '/api');

servant.on(eventName, optionalContext, callback)
```


####eventName
**type:** string  
One of the servant lifecycle event:
* **loadStart** - gets called before each request
* **load** - gets called when a response has recieved
* **loadEnd** - gets called after a "load", "abort" and "error" events
* **abort** - gets called when when the request is being aborted
* **error** - gets called when an error occured something is wrong with the request
* **timeout** - gets called if no response from the server. See [`options.timeout`](./init.md#timeout)
* **progress** - gets called while resonse is transfered. Could get called multiple times.
* **readyStateChange** - gets called up to 4 times during a request. ([W3schools  Link](http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp))

Some of them have an alias (and all are case-insensitive):

| Event Name |  alias   |
|------------|----------|
| loadStart  | start    |
| load       | response |
| loadEnd    | end      |

example:  
```js
servant.on('loadEnd', callback);
// is same as
servant.on('end', callback);
```


####optionalContext
**type:** any  
When you want the following callback to run with a certain context. You can set a default context for all of the servant's callbacks ([see `options.ctx`](./init.md#ctx)).
```js
var servant = new AjaxServant('GET', '/api');

servant.on('load', {b:2}, function () {
  console.log(this); // -> {b:2}
});
```


####callback
**type:** function  
The function to run when the event occurs. The `this` keyword context can be set individually or globaly. [See optionalContext above](#optionalcontext).  

Event handlers have with different signatures. Most have the same default signature: `handler(servant, ajaxEvent)` when `servant` is the current AjaxServant instance (`this`) and `ajaxHandler` is the native XHR event that is passed to the handler.

The events handlers with this signature are: `loadStart`, `abort`, `progress`, `error` and `timeout`.
```js
servant.on('error', function (servant, ajaxEvent) {...})
```

The event handlers that have their own signature are: `load`, `loadEnd`, `progress` and `readyStateChange`.
```js
servant.on('load', function (response, servant, ajaxEvent) {...})

servant.on('loadEnd', function (response, servant, ajaxEvent) {...})

servant.on('readyStateChange', function (readyState, response, servant, ajaxEvent) {...})
```


#####response
`response` is a formatted object containing three props:

1. response.status ( e.g. {code: 200, text: 'ok'} )
2. response.headers (e.g. {'Content-Type': 'text/plain'})
3. response.body (whatever response from the server)

```js
servant.on('load', function(response, currentServant, ajaxEvent){
  if (response.status.code === 200) {
    console.log(response.body);
  }
});
```



###.onStatus()
```js
var servant = new AjaxServant('GET', '/api');

servant.onStatus(statusCode, optionalContext, callback)
```
This binds a "load" event to the servant and will be triggered on response.
`statusCode` should be a number.

```js
var servant = new AjaxServant('GET', '/api');

servant.onStatus(200, successFn);
servant.onStatus(404, notFoundFn);
```
