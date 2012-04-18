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
	//let's change this to a local dir? then rsync to media server or use nginx?
	app.set('screenshots', __dirname + '/public/renders/');
	app.set('view options', { pretty: true });
	app.use(express.logger('dev'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	//let's change this to a local dir? then rsync to media server or use nginx?
	app.set('screenshots', '/tmp');
	app.set('view options', { pretty: true });
	app.use(express.logger('dev'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

require('./routes');



app.helpers({
		"dateFormat": function(dateObj){ 
			return dateObj.getMonth() + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
		}
		, "dateTimeFormat": function(dateObj){ 
			//TODO: clean up time to 12 hour clock?
			return dateObj.getMonth() + "/" + dateObj.getDate() + "/" + dateObj.getFullYear() + " " + dateObj.getHours() + ":" + dateObj.getMinutes();
		}
		, "percentage": function(num) {
			return Math.round(num * 100) + "%";
		}
		, "isNumber": function(num) {
			return (typeof(num) == "number") && !isNaN(num);
		}
		, "bookmarklet": 'javascript:(function(e,a,g,h,f,c,b,d){if(!(f=e.jQuery)||g>f.fn.jquery||h(f)){c=a.createElement("script");c.type="text/javascript";c.src="http://ajax.googleapis.com/ajax/libs/jquery/"+g+"/jquery.min.js";c.onload=c.onreadystatechange=function(){if(!b&&(!(d=this.readyState)||d=="loaded"||d=="complete")){h((f=e.jQuery).noConflict(1),b=1);f(c).remove()}};a.documentElement.childNodes[0].appendChild(c)}})(window,document,"1.7.1",function($,L){var jsCode = document.createElement("script");jsCode.setAttribute("src", "https://raw.github.com/jessefulton/webpages-for-humans/master/public/javascripts/bookmarklet.js");document.body.appendChild(jsCode);});'
		//via http://beardscratchers.com/journal/using-javascript-to-get-the-hostname-of-a-url
		, "hostname": function(str) {
			var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
			return str.match(re)[1].toString();
		}
});


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