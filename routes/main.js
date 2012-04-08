

var rasterize = require('../lib/rasterize')
  , ratelimit = require('../lib/ratelimit')
  , Batch = require('../lib/batch')
  , utils = require('../lib/utils')
  , path = require('path')
  , join = path.join
  , fs = require('fs');

var dir = app.set('screenshots')
  , db = app.db;

/*
 * GET home page.
 */

app.get('/', function(req, res, next){

  var from = 0
    , to = 10
    , batch = new Batch;

  db.zrange('screenshot:ids', from, to, function(err, ids){
    if (err) return next(err);

    // fetch
    ids.forEach(function(id){
      batch.push(function(fn){
        db.hgetall('screenshot:' + id, fn);
      });
    });

    // finished
    batch.end(function(err, objs){
      if (err) return next(err);
      res.render('index', { layout: false, screenshots: objs });
    })
  });

});

/**
 * GET stats.
 */

app.get('/stats', function(req, res){
  db.hgetall('screenshot:stats', function(err, obj){
    if (err) return next(err);
    res.send(obj);
  });
});

/**
 * GET screenshots by range.
 */

app.get('/screenshots/:from..:to', function(req, res, next){
  var from = req.params.from
    , to = req.params.to
    , batch = new Batch;

  db.zrange('screenshot:ids', from, to, function(err, ids){
    if (err) return next(err);

    // fetch
    ids.forEach(function(id){
      batch.push(function(fn){
        db.hgetall('screenshot:' + id, fn);
      });
    });

    // finished
    batch.end(function(err, objs){
      if (err) return next(err);
      res.send(objs);
    })
  });
});

/**
 * GET serve when already rasterized.
 */

app.get('/:url(*)', function(req, res, next){
  var url = utils.url(req.params.url);
  db.hget('screenshot:url:id', url, function(err, id){
    if (err) return next(err);
    if (!id) return next();
    db.hget('screenshot:' + id, 'path', function(err, path){
      if (err) return next(err);
      console.log('screenshot - serving rasterized %s', url);
      res.sendfile(path);
    });
  });
});

/*
 * GET screenshot.
 */

app.get('/:url(*)', function(req, res, next){
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
			  path: join(dir, id + '.png')
			, viewportWidth: req.query.width || app.set('default viewport width')
			, viewportHeight: req.query.height || app.set('default viewport height')
		  };

		  rasterize(url, options, function(err){
			if (err) return next(err);
			console.log('screenshot - rasterized %s', url);
			//magic!
			app.emit('screenshot', url, options.path, id);
			res.sendfile(options.path);
		  }); 
	}
	else {
		return next();
	}
 

});
