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
servant.beforeSend(pushState);
servant.onResponse(validateResponse);
servant.onComplete(updateSomething);

servant.on('abort', abortFn);
servant.on('timeout', timeoutFn);

servant.onStatus(200, OKFn);
servant.onStatus(404, notOKFn);
```



Send / Abort
------------
```js
servant.send(['id', 3], {qry: 'str'});

OR

servant.send({
	params: ['id', 3],
	qrStr: {qry: 'str'},
	headers: {k: 'v'},
	body: 'bla bla bla'
});

servant.abort();
```




