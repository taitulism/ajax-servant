When sending a `servant` on its way you can load it with some dynamic data (per request).

This data object includes the following props (all are optional):  
* **params** - array of URL parameters (e.g. `['api', 'user']`)
* **qryStr** - querystring parameters (e.g. /api/?key=value)
* **headers** - request headers
* **body** - request body

examples:  
```js
servant.send({body: 'some text to send to the server'});
servant.send({
  header: {'Content-type': 'application/json'},
  body: {name: 'john', age: 30}
});
```

The dynamic data will be added to any corresponding data that was set during the servant initialization.
```js
// init
var servant = new AjaxServant('/api/user', {
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

// ...
// ...
// ...

// send 2
servant.send({
  params: ['olivia'],
  qryStr: {
    color: 'red'
  }
}); // -> request URL = /api/user/olivia/?action=same&color=red
```
