var aServer    = require('a-server')({port:8081});
var bootstruct = require('bootstruct')('./playground/www');

aServer.start(bootstruct);
