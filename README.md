**A WORK IN PROGRESS...**
I won't be taking any pull requests. For now.


Ajax Servant
============
A javascript client-side class to create dedicated ajax services.

Philosophy
----------
A fully costumed ajax request could be really messy to write natively. This process contains the following standard steps:
  * create an XHR instance
  * bind ajax events (onReadyStateChange, onLoad, onFail etc)
  * open a connection
  * set headers (which should be prepared somewhere)
  * send the data

With today's js programming concepts, an ajax request will be triggered by a specific component or an app and not by the page itself (i.e some arbitrary code in the global scope). An ajax request has now a master entity (e.g. a controller, an initiator) to trigger, abort, config and handle its responses.
A component will usually have just a couple of requests it uses to the same API, with the same HTTP methods (GET, POST...) and the only thing that changes is the payload (dynamic data).

An **Ajax Servant** instance is a pre-configured ajax request object that you configure once (i.e. in myConroller.init()) and use multiple times (i.e. in myController.addItem()), using the same XHR instance.

[See API](https://github.com/taitulism/ajax-servant/blob/master/docs/api.md)
