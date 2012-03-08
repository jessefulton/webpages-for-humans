(function() {

	var Captcha = function(canvas) {
		this.canvas = canvas;
		
		this._text = "";
		this.fontSize = 64;
		this.fontFace = "Times";
		this.padding = 0;
		
		
		var executionChain = [];
		
		this.init = function(text, fontSize, fontFace, padding) {
			this._text = text;
			this.fontSize = fontSize;
			if (fontFace) {
				this.fontFace = fontFace;
			}
			this.padding = padding;
			this.adjustSize();
			return this;
		}
		
		this.saveContext = function() {}
		this.restoreContext = function() {}
		
		
		this.noise = function(noise, options) {
			var ctx = this.canvas;
			executionChain.push(function() {
				noise(ctx, options);
			});
			return this;
		}
		
		this.gimp = function(renderer, options) {
			var ctx = this.canvas;
			executionChain.push(function() {
				renderer(ctx, options);
			});
			return this;
		}
		
		this.text = function(textProducer, options) {
			var ctx = this.canvas;
			executionChain.push(function() {
				textProducer(ctx, options);
			});
			return this;	
		}
		
		this.adjustSize = function() {
			var context = this.canvas.getContext('2d');
			//context.save();
			context.font = this.fontSize + "px " + this.fontFace;
			var textWidth = context.measureText(this._text).width;
			this.canvas.width = (textWidth + (this.padding ? this.padding : 0)) * 2;
			this.canvas.height = (this.fontSize + (this.padding ? this.padding : 0)) * 4;
			//context.restore();
			//console.log('adjusted Size');
			//console.log(this.canvas.width + "x" + this.canvas.height);
		}
		
		this.toDataURL = function() {
			return this.canvas.toDataURL();
		}
		
		this.render = function() {
			//console.log(executionChain);
			executionChain.forEach(function(el, idx, arr) {
				el.call(el);
			});
		}
		
		this.crop = function() {
			var context = this.canvas.getContext('2d');
			var imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var data = imageData.data;

			var maxX = 0
				, maxY = 0
				, minX = this.canvas.width
				, minY = this.canvas.height;
	
			for (var i=0; i<data.length; i+=4) {
				var alpha = data[i + 3];
				if (alpha != 0) {
					//we have image data
					var x = Math.floor((i/4) % imageData.width) + 1;
					var y = Math.floor((i/4) / imageData.width) + 1;
					
					if (x < minX) { minX = x; }
					if (x > maxX) { maxX = x; }
					if (y < minY) { minY = y; }
					if (y > maxY) { maxY = y; }
				}
			}
	
			var croppedData = context.getImageData(minX, minY, (maxX-minX), (maxY-minY));
			this.canvas.width = maxX-minX;
			this.canvas.height = maxY-minY;
			
			context.putImageData(croppedData, 0, 0);
		}

	};

	var Gimpy = {
		'shadow': function(canvas, options, fn) {
			options = options ? options : {};
			var x = options.x ? options.x : 5;
			var y = options.x ? options.y : 5;
			var color = options.color ? options.color : "rgba(0,0,0,.25)";
		
			var context = canvas.getContext('2d');
		
			//context.save();
			context.shadowOffsetX = x;
			context.shadowOffsetY = y;
			context.shadowColor = color;
			
			//fn(context, options);
			if (fn) {
				fn.call(context);
			}
			//context.restore();
		}
	};


	var NoiseProducer = {
		'blob': function(canvas, options) {

			var getRand = function(min, max) {
				return (Math.random() * (max - min)) + min;
			}


			context = canvas.getContext('2d');
		
			var fillStyle = options.fillStyle ? options.fillStyle : "black";
			/*
			var x = options.x
				, y = options.y
				, w = options.w
				, h = options.h;
			*/
			var w = options.w; //canvas.width/5;
			var h = options.h; //canvas.height/4;
		
			var x = (canvas.width/2)-w;
			var y = (canvas.height/2)+(h/2);
		
			context.save();
			context.fillStyle = fillStyle;
		
			context.setTransform(1,0,0,1,0,0);
			context.globalCompositeOperation = "xor";
			//context.lineWidth = 6;
			//context.strokeStyle = "#000";
			context.beginPath();
			context.moveTo(x, y);
			var curvePct = .4;
			var corners = [[x+w, y], [x+w, y-h], [x, y-h], [x,y]];
			for (var i=0; i<corners.length; i++) {
				var corner = corners[i];
				var nextX = corner[0], nextY = corner[1];
				var cp1x = nextX * (getRand((-1*curvePct), curvePct))
					, cp1y = nextX * (getRand((-1*curvePct), curvePct))
					, cp2x = nextX * (getRand((-1*curvePct), curvePct))
					, cp2y = nextX * (getRand((-1*curvePct), curvePct));
				context.bezierCurveTo(nextX-cp1x, nextY-cp1y, nextX-cp2x, nextY-cp2y, nextX, nextY);
			}
			//context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x+w, y);
			//context.bezierCurveTo(7, 490, 488, 7, 493, 490);
			//context.bezierCurveTo(7, 490, 488, 7, 493, 490);
			//context.bezierCurveTo(7, 490, 488, 7, x+w, y+h);
			context.fill(); //.stroke();
			context.restore();
		}
	};

	
	var TextProducer = {
		'basic': function(canvas, options, cb) {
			var getRand = function(min, max) {
				return (Math.random() * (max - min)) + min;
			}
			
			var context = canvas.getContext('2d');
			//console.log(arguments);
			options = options ? options : {};
			var text = options.text ? options.text : "";
			var fontSize = options.size ? options.size : 64;
			var fontFace = options.font ? options.font : "Times";
			var fillStyle = options.fillStyle ? options.fillStyle : "black";
		
		
			context.save();
		
			context.font = fontSize + "px " + fontFace;
			context.fillStyle = fillStyle;
			
			//context.textAlign = "center";
		
			//console.log("Writing " + text);
		
			context.textAlign = "left";
			context.textBaseline = "middle";
			
			//FIXME: hack to adjust for descenders
			//context.translate(canvas.width/2, canvas.height/2);
			//fontSize-(.2*fontSize));
			//context.fillText(text, canvas.width/2, canvas.height/2);
			
			context.translate(10, canvas.height/2); 
			
			for (var x = 0; x < text.length; x++)
			{
				context.save();
				var c = text.charAt(x);
				var metrics = context.measureText(c);
				var w = metrics.width;
			
				context.transform (1, getRand(-.5,.5), getRand(-.5,.5), 1, 0, 0);
				context.fillText (c, 0, 0) ;
			
				context.restore();
				//context.setTransform (1, 0, 0, 1, 0, 0);
				context.translate(w, 0);
			}
			
			if (cb) { cb(context); }
			context.restore();
		}

	};





	//TODO: inject canvas element and create image data urls rather than bogging down server
	
	//TODO: check for jquery and inject it if needed (noconflict?)
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
		var getTextNodesIn = function(el) {
			var whitespace = /^\s*$/;
			return $(el).find("*").andSelf().contents().filter(function() {
				return (this.nodeType == 3) && !whitespace.test(this.nodeValue);
			});
		};
		
		var toColorString = function(rgbString) {
			var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			// parts now should be ["rgb(0, 70, 255", "0", "70", "255"]
			
			delete (parts[0]);
			for (var i = 1; i <= 3; ++i) {
				parts[i] = parseInt(parts[i]).toString(16);
				if (parts[i].length == 1) parts[i] = '0' + parts[i];
			} 
			return "#" + parts.join('').toUpperCase(); // "#0070FF"
		}
		
		try {	
			getTextNodesIn($(document.body)).each(function() {
				var fontSize = parseInt($(this.parentNode).css("font-size"));
				var text = this.nodeValue;

				/*
				console.log(text);
				console.log("!!text = " + !!text);
				console.log("!!fontSize = " + !!fontSize);
				console.log("visible = " + ($(this.parentNode).is(':visible')));
				console.log("============");
				*/
				
				if (!!text && !!fontSize && ($(this.parentNode).is(':visible'))) {

					var color = toColorString($(this.parentNode).css("color"));
					//TODO: implement
					var fontface = "Times";
					var words = text.split(' ');
					var replacements = [];
					var canvas = document.createElement('canvas');				
					
					for (var i=0; i<words.length; i++) {
						var word = words[i];
						if (!word) { continue; }
						
						try {
							var captcha = new Captcha(canvas);
							captcha.init(word, fontSize, fontface);
							captcha
								.text(TextProducer.basic, {"text": word, "size": fontSize, "fillStyle": color, "font": fontface })
								.noise(NoiseProducer.blob, {"fillStyle": color, "h": fontSize, "w": (fontSize * 1.5)})
								.render();
							captcha.crop();
							replacements.push('<img src="' + captcha.toDataURL() + '" /> ');
						}
						catch(err) {
							//console.log("Error generating captcha for " + word + " [" + fontSize + "]");
							console.log(err);
						}
					}
					
					
					$(this).replaceWith(replacements.join(' '));

				}
				
				
			});
		}
		catch(e) {
			//handle exception
			console.log("error");
			console.log(e);
		}
		window.setTimeout(function(){$(document.body).addClass("captchafied");}, 1000);
	};
	
	var check = window.setInterval(function() {
		console.log('inside "check"');
		if (typeof(window.jQuery) == 'function') {
			window.clearInterval(check);
			doIt();
		}
	}, 250);
	
})();