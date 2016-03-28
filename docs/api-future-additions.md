**THIS MODULE IS A WORK IN PROGRESS**

Usage
-----
```js
import AjaxServant from 'ajax-servant';
// OR
const AjaxServant = require('ajax-servant');
```



Init
----
```js
const options = {
	async: true,
	headers: {k:'v'},
	cache: true,
	autoSetContentType: true,
	credentials: {user: 'me', pass: '1234'},
	responseType: 'json',
	jsonp: false,
};

const servant = new AjaxServant('GET', '/api/user', options);

// OR

const servant = new AjaxServant('GET', '/api/user');
servant.config(options);
```



Bind events
-----------
```js
servant.onStatus(200, OKFn);
servant.onStatus(404, notOKFn);
servant.onSuccess(OKFn);
servant.onFail(notOKFn);
```



Send / Abort
------------
```js
servant.GET(requestObj);
servant.POST(requestObj);
servant.PUT(requestObj);
servant.DELETE(requestObj);

servant.send(verb, requestObj);

servant.abort();
```



Request Object
--------------
```js
{
	urlParams : ['id', 3],
	qrStr     : {qry: 'str'},
	headers   : {k: 'v'},
	body      : 'bla bla bla'
}
```



