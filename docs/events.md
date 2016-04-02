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

Some of them have aliases:

| Event Name |  alias   |
|------------|----------|
| loadStart  | start    |
| load       | response |
| loadEnd    | end      |
| error      | err      |

example:  
```js
servant.on('loadEnd', callback);
// is same as
servant.on('complete', callback);
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
Events are triggerd with the following arguments:  
```js
callback(response, currentServant, ajaxEvent)
```

`response` is a formatted object containing three props:

1. response.status ( = {code: 200, text: 'ok'} )
2. response.headers
3. response.body

`currentServant` is very self explanatory.  
`ajaxEvent` is a native XHR event that is passed to the event handler.

examlpe:  
```js
servant.on('load', function(response, currentServant, ajaxEvent){
  if (response.status.code === 200) {
    console.log(response.body);
  }
});
