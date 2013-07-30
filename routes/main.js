

var rasterize = require('../lib/rasterize')
	, stream = require('../lib/stream')
//  , imagemap = require('../lib/imagemap')
  , ratelimit = require('../lib/ratelimit')
  , Batch = require('../lib/batch')
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


app.get('/browse/:url(*)', function(req, res, next){
      res.render('browse', { layout: false });
});



/**
 * GET serve when already rasterized.
 */
app.get('/image/:url(*)', function(req, res, next){
  var url = utils.url(req.params.url);
  db.hget('render:url:id', url, function(err, id){
    if (err) return next(err);
    if (!id) return next();
    db.hget('render:' + id, 'path', function(err, path){
      if (err) return next(err);
      console.log(path);
      console.log('screenshot - serving rasterized %s', url);
      res.sendfile(path + id + ".png");
    });
  });
});

/*
 * GET screenshot.
 */
app.get('/image/:url(*)', function(req, res, next){
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

		  rasterize(url, options, function(err){
			if (err) {
				console.log("Error rasterizing (html) " + url);
				console.log(err);
				return next(err);
			}
			console.log('screenshot - rasterized %s', url);
			//magic!
			app.emit('render', url, options.path, id);
			res.sendfile(options.path + id + ".png");
		  }); 
	}
	else {
		console.log("Invalid URL. URL parameter " + url + " did not match on regex " + regex);
		console.log(err);
		return next();
	}
});






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
      console.log('screenshot - serving rasterized %s', url);
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

		  /*
		  rasterize(url, options, function(err){
			if (err) {
				console.log("Error rasterizing image " + url);
				console.log(err);
				return next(err);
			}
			console.log('screenshot - rasterized %s', url);
			//magic!
			app.emit('render', url, options.path, id);
			res.sendfile(options.path + id + ".html");
		  }); 
		  */
	}
	else {
		console.log("Invalid URL. URL parameter " + url + " did not match on regex " + regex);
		return next();
	}
});


app.get('/about', function(req, res, next){
      res.render('about', { layout: false });
});


