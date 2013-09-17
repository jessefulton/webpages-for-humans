/*
var parse = require('url').parse;
var db = app.db;


app.on('render', function(url, path, id){
  var now = Date.now();
  console.log('render - saving meta-data');
  db.hset('render:url:id', url, id);
  db.zadd('render:ids', now, id);
  db.zadd('render:urls', now, url);
  db.zadd('render:hosts', now, parse(url).host);
  db.hmset('render:' + id, {
    created_at: now,
    path: path,
    url: url,
    id: id
  });
});


app.on('render', function(url, path, id){
  db.hincrby('render:stats', 'total', 1);
});
*/