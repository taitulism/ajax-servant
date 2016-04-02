Dynamic Data Object
===================
When sending a `servant` on its way you can send it with some dynamic data (per request).

This data object includes the following props (all are optional):  
* **params** - (array | string) URL segments
* **qryStr** - (object) querystring parameters object (e.g. `{key:value}`)
* **headers** - (object) request headers
* **body** - (any) request body

examples:  
```js
servant.send({body: 'some text to send to the server'});
// OR
servant.send({
  params: ['path', 'to', 'somewhere'],
  qryStr: {myKey: 'myValue'},
  header: {'Content-type': 'application/json'},
  body: {name: 'john', age: 30}
});
```

The dynamic data will be added to any corresponding data that was set during the servant initialization.
```js
// init
var servant = new AjaxServant('GET', '/api/user', {
  qryStr: {
    action: 'same'
  }
});

// send 1
servant.send({
  params: ['john'],
  qryStr: {
    color: 'blue'
  }
}); // -> request URL = /api/user/john/?action=same&color=blue

// somewhere down the road...

// send 2
servant.send({
  params: ['olivia'],
  qryStr: {
    color: 'red'
  }
}); // -> request URL = /api/user/olivia/?action=same&color=red
```
