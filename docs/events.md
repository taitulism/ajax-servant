Events
======
After [initializing](./init.md) a servant instance you can bind it with callbacks to handle its different events.

```js
var servant = new AjaxServant();

servant.on(eventName, optionalContext, callback)
```


#####eventName
**type:** string
One of the servant lifecycle event:
* loadStart - runs before each request
* load - runs when a response has recieved
* loadEnd - runs after a "load", "abort" and "error" events
* abort - get called when when the request is being aborted
* error - get called when an error occured something is wrong with the request

**Some of the listed events have aliases. [See below](#events-aliases)**

#####optionalContext
**type:** any
The context of the `this` keyword to run the following callback with.
You can set the same context for all of the servant's callbacks ([see config docs](./init.md)). Use `optionalContext` to run the following callback with a specific context.

#####callback
**type:** function
The function to run when the event occurs. The `this` keyword context can be set individually or globaly. See [above](#optionlcontext)


Events Aliases
--------------
**loadStart:** [start, loadstart]
**load:** [response]
**loadEnd:** [end, complete, loadend]
**error:** [err]
