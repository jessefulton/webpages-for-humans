console.log("executing phantomjs rasterize.js");
var page = require('webpage').create()
  , url = phantom.args[0]
  , path = phantom.args[1]
  , size = phantom.args[2] || '';

if (!url) throw new Error('url required');
if (!path) throw new Error('output path required');

size = size.split('x');

page.viewportSize = {
    width: ~~size[0] || 1024
  , height: ~~size[1] || 600
};

console.log("phantomjs: setup viewport");


page.open(url, function (status) {
  if (status == 'success') {
	  console.log("phantomjs: successfully opened URL");
    //page.render(path);
    //phantom.exit();
    
	page.injectJs('captchafy.js');
	
	//page.evaluate('function() {captchify("' + text.replace("\"", "\\\"") + '", '+fontSize+');}');


	waitFor(function() {
			console.log("checking...");
			// Check in the page if a specific element is now visible
			var cn = page.evaluate(function() {
				return document.body.className;
			});
			var mgn = page.evaluate(function() { return document.body.innerHTML; });
			//console.log(mgn);
			//console.log(cn);
			return cn.indexOf("captchafied") != -1;
		}, function() {
			console.log("rendered.");
			page.render(path);
			phantom.exit();
		}, 5000
	);        

    
  } else {
	  console.log("phantomjs: could not open URL: " + status);
    throw new Error('failed to load ' + url);
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
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};
