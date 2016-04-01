Events
======
After [initializing](./init.md#create) a servant instance you can bind it with callbacks to handle its different events.

```js
var servant = new AjaxServant();

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

**Some of the listed events have aliases. [See below](#events-aliases)**

####optionalContext
**type:** any  
The context of the `this` keyword to run the following callback with.
You can set the same context for all of the servant's callbacks ([see config docs](./init.md#ctx)). Use `optionalContext` to run the following callback with a specific context.

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
```


Events Aliases
--------------
| Event Name | aliases  |           |      |         |
|------------|----------|-----------|------|---------|
| loadStart  | start    | loadstart |      |         |
| load       | response |           |      |         |
| loadEnd    | end      | complete  | done | loadend |
| error      | err      |           |      |         |


example:  
```js
servant.on('loadEnd', fn(){...});
// is same as
servant.on('complete', fn(){...});
```
