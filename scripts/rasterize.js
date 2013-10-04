var fs = require('fs');

var DEBUG = false;
function debug() {
	if (DEBUG) { console.log.apply(arguments); }
}


phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    phantom.exit(1);
};





debug("executing phantomjs rasterize.js");
var page = require('webpage').create()
  , url = phantom.args[0]
  , path = phantom.args[1]
  , id = phantom.args[2]
  , size = phantom.args[3] || '';

if (!url) throw new Error('url required');
if (!path) throw new Error('output path required');

size = size.split('x');

page.viewportSize = {
    width: ~~size[0] || 960
  , height: ~~size[1] || 600
};

debug("phantomjs: setup viewport");


page.settings.resourceTimeout = 5000;
page.onResourceTimeout = function(e) {
  debug("RESOURCE TIMEOUT: [" + e.errorCode + "] " + e.errorString + " (" + e.url + ")");
};


page.onAlert = function (msg) { 
    //debug("ALERT: " + msg);
};
page.onConsoleMessage = function (msg) {
    //debug("CONSOLE: " + msg);
};
page.onError = function (msg, trace) {
    /*
    debug("ERROR: " + msg);
    trace.forEach(function(item) {
        debug('  ', item.file, ':', item.line);
    })
    */
};

page.open(url, function (status) {
  if (status == 'success') {
    debug("phantomjs: successfully opened URL");

	page.injectJs('module-shim.js');    
	page.injectJs('../node_modules/captchafy/lib/captchafy.js');
	


	page.evaluate(function() {
		(function() {
			
			var _captchafy = module.exports;
			
			
			if (typeof(window.jQuery) != 'function') {
				//console.log('no jquery');
				var s=document.createElement('script');
				s.setAttribute('src','https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js');
				document.getElementsByTagName('body')[0].appendChild(s);

				s=document.createElement('script');
				s.setAttribute('src','http://webpagesforhumans.com/js/jquery-noconflict.js');
                document.getElementsByTagName('body')[0].appendChild(s);
			}
			else {
				//console.log('already had jquery');
			}
		
			var doIt = function() {	
				_captchafy.captchafyText(jQuery, jQuery(document.body), function() {
					jQuery(document.body).addClass("captchafied");
				});
			};
			
			var check = window.setInterval(function() {
				//console.log('inside "check"');
				if (typeof(window.jQuery) == 'function') {
					window.clearInterval(check);
					doIt();
				}
			}, 250);
			
		})();
	});


	waitFor(function() {
			debug("checking...");
			// Check in the page if a specific element is now visible
			var cn = page.evaluate(function() {
				return document.body.className;
			});
			
			return cn.indexOf("captchafied") != -1;
		}, function() {
			debug("rendered.");
			//page.render(path + id + ".png");
			
			var theHtml = page.evaluate(function() {
			
				//ugly hack to set URLs to absolute	
				var foundLinks = document.body.querySelectorAll("a[href]:not([href^='javascript:']):not([href*=doubleclick]):not([href^='itpc://']):not([href^='zune://']):not([href^='#'])");		
			
				var dummyA = document.createElement('a');
				for(var i=0; i<foundLinks.length; i++) {
					var el = foundLinks[i];
					dummyA.href = el.href
					el.href = "/view/" + dummyA.href;
					//el.href = "/#/view/" + dummyA.href;
                    //el.target="_parent";
				}

				foundLinks = document.querySelectorAll("link[href]");		
				for(var i=0; i<foundLinks.length; i++) {
					var el = foundLinks[i];
					dummyA.href = el.href
					el.href = dummyA.href;
				}
				
				foundLinks = document.querySelectorAll("script[src],img[src]");		
				for(var i=0; i<foundLinks.length; i++) {
					var el = foundLinks[i];
					dummyA.href = el.src
					el.src = dummyA.href;
				}


			    var forms = document.querySelectorAll("form");
			    for (var i=0; i<forms.length; i++) {
			        dummyA.href = forms[i].action;
			        forms[i].action = "/form/" + encodeURIComponent(dummyA.href);
			    }


				var doctype = "";
				
				try {
					var dt = document.doctype;
					doctype = '<!DOCTYPE '+ 
						dt.name+' PUBLIC "'+ //maybe you should check for publicId first
						dt.publicId+'" "'+
						dt.systemId+'">';
				}
				catch(e) { debug("error creating doctype"); }
				return doctype + document.documentElement.outerHTML;
			});
			
			console.log (theHtml);
			phantom.exit();
		}, 30000
	);        

    
  } else {
	  debug("phantomjs: could not open URL: " + status);
	  throw new Error('failed to load ' + url);
	  phantom.exit(1);
  }
});







/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    debug("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    debug("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};
