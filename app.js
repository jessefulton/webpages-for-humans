// heroku PATH=/usr/local/bin:/usr/bin:/bin:/app/vendor/phantomjs/bin


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
	app.set('screenshots', '/tmp/');
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
		, "bookmarklet": 'javascript:(function(){var d=document.getElementsByTagName("body")[0],e=false;if(typeof jQuery!="undefined"){a();return}else{if(typeof $=="function"){e=true}}function c(h,j){var g=document.createElement("script");g.src=h;var i=document.getElementsByTagName("head")[0],b=false;g.onload=g.onreadystatechange=function(){if(!b&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")){b=true;j();g.onload=g.onreadystatechange=null;i.removeChild(g)}};i.appendChild(g)}c("https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js",function(){if(typeof jQuery=="undefined"){}else{msg="This page is now jQuerified with v"+jQuery.fn.jquery;if(e){msg+=" and noConflict(). Use $jq(), not $()."}}return f()});function a(){var b=document.createElement("script");b.setAttribute("src","https://raw.github.com/jessefulton/webpages-for-humans/master/public/javascripts/bookmarklet.js");document.body.appendChild(b)}function f(){window.setTimeout(function(){if(typeof jQuery=="undefined"){}else{if(e){$jq=jQuery.noConflict()}a()}},2500)}})();'
		
		
			//'javascript:(function(){var doIt=function(){var a=document.createElement("script");a.setAttribute("src","https://raw.github.com/jessefulton/webpages-for-humans/master/public/javascripts/bookmarklet.js");document.body.appendChild(a)};if(typeof(jQuery)=="undefined"){var s=document.createElement("script");s.setAttribute("src","https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js");s.onload=doIt();document.getElementsByTagName("body")[0].appendChild(s)}else{doIt()};})();'
		
		//'javascript:(function(e,a,g,h,f,c,b,d){if(!(f=e.jQuery)||g>f.fn.jquery||h(f)){c=a.createElement("script");c.type="text/javascript";c.src="http://ajax.googleapis.com/ajax/libs/jquery/"+g+"/jquery.min.js";c.onload=c.onreadystatechange=function(){if(!b&&(!(d=this.readyState)||d=="loaded"||d=="complete")){h((f=e.jQuery).noConflict(1),b=1);f(c).remove()}};a.documentElement.childNodes[0].appendChild(c)}})(window,document,"1.7.1",function($,L){var jsCode = document.createElement("script");jsCode.setAttribute("src", "https://raw.github.com/jessefulton/webpages-for-humans/master/public/javascripts/bookmarklet.js");document.body.appendChild(jsCode);});'
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








/*************
BOOKMARKLET SCRIPT


(function() {
  var b=document.getElementsByTagName('body')[0]
	, otherlib = false;
  if(typeof jQuery!='undefined') {
    doIt();
	return
  } else if (typeof $=='function') {
    otherlib=true;
  }
 
  // more or less stolen form jquery core and adapted by paul irish
  function getScript(url,success){
    var script=document.createElement('script');
    script.src=url;
    var head=document.getElementsByTagName('head')[0],
        done=false;
    // Attach handlers for all browsers
    script.onload=script.onreadystatechange = function(){
      if ( !done && (!this.readyState
           || this.readyState == 'loaded'
           || this.readyState == 'complete') ) {
        done=true;
        success();
        script.onload = script.onreadystatechange = null;
        head.removeChild(script);
      }
    };
    head.appendChild(script);
  }
  getScript("https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js",function() {
    if (typeof jQuery=='undefined') {
		//error
    } else {
      msg='This page is now jQuerified with v' + jQuery.fn.jquery;
      if (otherlib) {msg+=' and noConflict(). Use $jq(), not $().';}
    }
    return showMsg();
  });
  function doIt() {
	var jsCode = document.createElement("script");
	jsCode.setAttribute("src", "https://raw.github.com/jessefulton/webpages-for-humans/master/public/javascripts/bookmarklet.js");
	document.body.appendChild(jsCode);
  }
  function showMsg() {
    window.setTimeout(function() {
      if (typeof jQuery=='undefined') {

      } else {
        if (otherlib) {
          $jq=jQuery.noConflict();
        }
		doIt();
      }
    } ,2500);    
  }
})();

*****************/