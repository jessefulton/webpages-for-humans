(function() {
	
	var _captchafy = module.exports;
	
	
	if (typeof(window.jQuery) != 'function') {
		console.log('no jquery');
		var s=document.createElement('script');
		s.setAttribute('src','https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js');
		document.getElementsByTagName('body')[0].appendChild(s);
	}
	else {
		console.log('already had jquery');
	}

	var doIt = function() {	
		console.log('about to doIt()');
		console.log(_captchafy);
		_captchafy.captchafyText(jQuery, jQuery(document.body), function() {
			jQuery(document.body).addClass("captchafied");
		});
	};
	
	var check = window.setInterval(function() {
		console.log('inside "check"');
		if (typeof(window.jQuery) == 'function') {
			window.clearInterval(check);
			doIt();
		}
	}, 250);
	
})();