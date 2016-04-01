**THIS MODULE IS A WORK IN PROGRESS**

Import
------
Currently it's just a global class. Will become an "import/export" eventually.
```js
AjaxServant // global for now
```




Create & Config
---------------
```js
const servant = new AjaxServant('GET', '/api/user', options);

// OR

const servant = new AjaxServant('GET', '/api/user');
servant.config(options);
```

[Read more about initialization](./init.md)




Bind Events
-----------
```js
servant.on(XHREventName, optionalContext, callback);
```
[Read more about "Events"](./events.md)




Send / Abort
------------
Calling the `.send()` method of a servant will execute a request. You can pass some dynamic data per request.
Aborting a request is done with an `.abort()` call.
```js
var dynamicDataObj = {
	params  : ['param1', 'param2'], // -> baseURL + /param1/param2
	qryStr   : {query: 'string'},
	headers : {key: 'value'},
	body    : '*'
}

servant.send(dynamicDataObj);

// if user canceled:
servant.abort();
```
[Read more about "Dynamic data"](./dynamic-data.md)

Sending a servant while it is "away" with another request, will cancel the running request and execute the new one.
```js
servant.send({body: 1});
servant.send({body: 2});
// the later cancles the former. server will get: 2
```
**Aborting a servant doesn't delete its XHR object nor unbind any handler.**




Dismissing a Servant
--------------------
Dismissing a servant unbinds all of its event handlers and deletes its XHR object.
```js
console.log(servant.xhr); // {XMLHttpRequest instance}
console.log(servant.events); // {loadEnd: {queue: [fn, fn, fn]}}

servant.dismiss();

console.log(servant.xhr); // === null
console.log(servant.events); // === {}
```
