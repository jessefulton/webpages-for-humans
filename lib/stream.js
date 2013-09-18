
var exec = require('child_process').exec
  , script = app.get('root') + '/scripts/rasterize.js'
  , bin = app.get('phantom')
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
 * @param {Buffer} buff
 */
module.exports = function(url, options, fn, buff){
    var args = [script, url];
    console.log(options);
    args.push(options.path);
    args.push(options.id);
    args.push(options.viewportWidth + 'x' + options.viewportHeight);
    
    console.log("SPAWNING: " + bin);
    console.log(JSON.stringify(args));
    var phntm = spawn(bin, args);
    
  	if (buff) {
  	
  	    buff.on("close", function() {
  	        console.log("RESPONSE CLOSED!");
  	        phntm.kill();
  	    });
  	
	  	phntm.stdout.pipe(buff);

  
        phntm.stdout.on('data', function (data) {
            //console.log('stdout: ' + data);
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
  	}
  	else {
  	    fn(-1);
  	}


};