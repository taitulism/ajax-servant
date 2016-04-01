**THIS MODULE IS A WORK IN PROGRESS**

Table Of Contents
-----------------
* Main API (this page)
* [Configuration](./init.md)
* [Servant Events](./events.md)
* [Dyncamic Data](./dynamic-data.md)




How to Use
----------
1. import
2. create & config
3. Bind events
4. send/abort request




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
```js
servant.send(dynamicDataObj);

servant.abort();
```




Dynamic Data
------------
```js
{
	params  : ['param1', 'param2'], // URL/param1/param2
	qryStr   : {query: 'string'},
	headers : {key: 'value'},
	body    : '*'
}
```
[Read more about "Dynamic data"](./dynamic-data.md)
