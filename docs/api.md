**THIS MODULE IS A WORK IN PROGRESS**


0. import
1. instanciate & config
2. bind events
3. send request


Import
------
Currently it's just a global.
```js
AjaxServant // global for now
```



Init
----
```js
const servant = new AjaxServant('GET', '/api/user', options);

// OR

const servant = new AjaxServant('GET', '/api/user');
servant.config(options);
```



Options
-------
```js
const options = {
	async: true,
	breakCache: false,
	ctx: {},
	headers: {},
	qryStr: {}
};
```
[Options](./options.md)



Bind events
-----------
```js
servant.on(XHREventName, optionalContext, callback);
```
[Events](./events.md)



Send / Abort
------------
```js
servant.send(dynamicDataObj);

servant.abort();
```



Dynamic Data Object
-------------------
```js
{
	params  : ['param1', 'param2'], // URL/param1/param2
	qryStr   : {query: string},
	headers : {key: value},
	body    : '*'
}
```
[Dynamic data object](./dynamic-data.md)


