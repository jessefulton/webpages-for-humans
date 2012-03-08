
/**
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  //, redis = require('redis')
  , redis = require('redis-url').createClient(process.env.REDISTOGO_URL)
  , http = require('http');


app = express.createServer();

app.configure(function(){
  app.db = redis; //.createClient();
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('phantom', 'phantomjs');
  //let's change this to a local dir? then rsync to media server or use nginx?
  app.set('screenshots', __dirname + '/public/renders');
  app.set('default viewport width', 1024);
  app.set('default viewport height', 600);
  app.set('colors', 3);
  app.set('root', __dirname);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(stylus.middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
	app.set('view options', { pretty: true });
	app.use(express.logger('dev'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

require('./routes');




/**
 * Start it.
 */
var port = process.env.PORT || 3000;
app.listen(port, function () {
    var addr = app.address();
    app.set("basedomain", 'http://' + addr.address + ':' + addr.port);
	console.log('    app listening on ' + app.set("basedomain"));
    console.log('    NODE_ENV = ' + process.env.NODE_ENV);
});