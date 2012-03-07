
var exec = require('child_process').exec
  , script = app.set('root') + '/scripts/rasterize.js'
  , bin = app.set('phantom')
  , spawn = require('child_process').spawn;


/**
 * Rasterize the given `url` and callback `(err, stdout, stderr)`.
 *
 * Options:
 *
 *   - `path`: output file path
 *   - viewportWidth: viewport width
 *   - viewportHeight: viewport height
 *
 * @param {String} url
 * @param {String} path
 * @param {Function} fn
 */
module.exports = function(url, options, fn){
  var args = [script, url];
  console.log(options);
  args.push(options.path);
  args.push(options.viewportWidth + 'x' + options.viewportHeight);
  
  
  var phntm = spawn(bin, args);
  
	phntm.stdout.on('data', function (data) {
		console.log('stdout: ' + data);
	});
	
	phntm.stderr.on('data', function (data) {
		console.log('stderr: ' + data);
	});
	
	phntm.on('exit', function (code) {
		console.log('child process exited with code ' + code);
		if (code) { 
			fn(code); 
		}
		else {
			fn();
		}
	});
  
  /*
  cmd = cmd.join(' ');
  
	console.log(cmd);
  
  exec(cmd, fn);
  */
};