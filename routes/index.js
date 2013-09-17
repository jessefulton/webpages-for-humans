

var stream = require('../lib/stream')
  //, rasterize = require('../lib/rasterize')
//  , imagemap = require('../lib/imagemap')
  , utils = require('../lib/utils')
  , path = require('path')
  , join = path.join
  , fs = require('fs');

var dir = app.get('screenshots')
  , db = app.db;

/*
 * GET home page.
 */

app.get('/', function(req, res, next){
      res.render('index', { layout: false });
});


app.get('/about', function(req, res, next){
      res.render('about', { layout: false });
});


// TODO: GET RID OF THIS? OR TIMEOUT CACHE TO X MINUTES
/**
 * GET serve when already rasterized.
 */
app.get('/view/:url(*)', function(req, res, next){
  var url = utils.url(req.params.url);
  db.hget('render:url:id', url, function(err, id){
    if (err) return next(err);
    if (!id) return next();
    db.hget('render:' + id, 'path', function(err, path){
      if (err) {
      	console.log("Error finding HTML for URL " + url);
      	console.log(err);
      	return next(err);
      }
      res.sendfile(path + id + ".html");
    });
  });
});



/*
 * GET screenshot.
 */
app.get('/view/:url(*)', function(req, res, next){
	var url = utils.url(req.params.url);
	if (!url) return next();
	
	
	//var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var expression = /(https?:\/\/)?([a-z0-9\.]+)?\.[a-z]{2,4}/gi;
	var regex = new RegExp(expression);
	 
	//if we have a valid URL, then go fetch
	if (url.match(regex)) {
			console.log("fetching screenshot for " + url);
		  var id = utils.md5(url);
		
		  var options = {
			//TODO: render to .PDF instead of .PNG - then run tesseract on image
			  "path": dir
			, "id": id
			, "viewportWidth": req.query.width || app.get('default viewport width')
			, "viewportHeight": req.query.height || app.get('default viewport height')
		  };

		  stream(url, options, function(err){}, res);
	}
	else {
		console.log("Invalid URL. URL parameter " + url + " did not match on regex " + regex);
		return next();
	}
});
