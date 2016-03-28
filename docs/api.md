**THIS MODULE IS A WORK IN PROGRESS**


0. import
1. instanciate & config
2. bind events
3. send request


Usage
-----
```js
AjaxServant // global for now
```



Init
----
```js
const options = {
	async: true,
	ctx: {a:1}
};

const servant = new AjaxServant('GET', '/api/user', options);

// OR

const servant = new AjaxServant('GET', '/api/user');
servant.config(options);
```



Bind events
-----------
```js
servant.on(eventName, context, callback);
```



Send / Abort
------------
```js
servant.send(requestObj);

servant.abort();
```



Request Object
--------------
```js
{
	params  : ['id', 3],
	qrStr   : {qry: 'str'},
	headers : {k: 'v'},
	body    : 'bla bla bla'
}
```



