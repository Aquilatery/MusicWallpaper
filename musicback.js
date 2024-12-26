var canvas = document.getElementById("canvas");
var TopCanvas = document.getElementById("TopCanvas");
var max_height, startPos, Width, midY;

var backgroundColor = "rgb(0,0,0)";
var tctx = TopCanvas.getContext("2d");
var ctx = canvas.getContext("2d");
var defaultPrimaryColor = "#00ccff";
var defaultSecondaryColor = "#fff4e0";
var primaryColor = "#00ccff";
var secondaryColor = "#fff4e0";
var lineColor = "#ffffff";
var useDynamicColors = true;
var displayMusicArt = true;
var displayTitle = true;
var displayArtist = true;
var minLevel = 0.3;
var maxLevel = 80;
var smoothing = 0.8;
var isPlaying = false;
var image;
var imageData;
var rgbValues;
var quantColors;
// var gradient;

var file = "./art.png";
var img = new Image();
img.src = file;

var line1A = {x: 0, y: 0 };
var line1B = {x: 0, y: 0 };
var line2A = {x: 0, y: 0 };
var line2B = {x: 0, y: 0 };
var line3A = {x: 0, y: 0 };
var line3B = {x: 0, y: 0 };
var line4A = {x: 0, y: 0 };
var line4B = {x: 0, y: 0 };

function livelyPropertyListener(name, val) {
	switch(name) {
		case "backgroundColor":
			backgroundColor = val;
			render()
		break
		case "useDynamicColors":
			useDynamicColors = val;
			primaryColor = defaultPrimaryColor;
			secondaryColor = defaultSecondaryColor;
			setDynamicColors()
		break
		case "primaryColor":
			// console.debug(val);
			defaultPrimaryColor = val;
			primaryColor = val;
		break
		case "secondaryColor":
			// console.debug(val);
			defaultSecondaryColor = val;
			secondaryColor = val;
		break
		case "lineColor":
			lineColor = val;
			render()
		break
		case "displayMusicArt":
			displayMusicArt = val;
			img.src = val ? image : null;
			render()
		break
		case "minLevel":
			minLevel = val;
		break
		case "maxLevel":
			maxLevel = val;
		break
		case "smoothing":
			smoothing = val;
		break
	}
}

async function livelyCurrentTrack(data) {
	let obj = JSON.parse(data);
	// console.debug(data);
	if (obj != null) {
		if (displayTitle)
			document.getElementById("track-title").innerHTML = obj.Title;
		else
			document.getElementById("track-title").innerHTML = "";
		if (displayArtist)
			document.getElementById("track-artist").innerHTML = obj.Artist;
		else
			document.getElementById("track-artist").innerHTML = "";

		if (obj.Thumbnail != null) {
			img.src = null;
			const img64 = !obj.Thumbnail.startsWith("data:image/")
				? "data:image/png;base64," + obj.Thumbnail
				: obj.Thumbnail;
			// img.onload = render();
			image = img64;
			if (displayMusicArt)
				img.src = img64;
			// document.getElementById("track-artist").innerHTML = img64;
			await sleep(100);
		}
	} else {
		img.src = null;
		document.getElementById("track-title").innerHTML = "";
		document.getElementById("track-artist").innerHTML = "";
	}
	render()
	setDynamicColors()
}

function setDynamicColors() {
	if (quantColors != null && useDynamicColors) {
		var color = quantColors[0];
		if (color.r<120 || color.g<120 || color.b<120)
			color = {r: color.r+100, g: color.g+100, b: color.b+100}
		var rgbColors = "rgb(" +color.r+ "," +color.g+ "," +color.b+ ")"
		primaryColor = rgbColors;
		color = quantColors[1];
		if (color.r<120 || color.g<120 || color.b<120)
			color = {r: color.r+100, g: color.g+100, b: color.b+100}
		rgbColors = "rgb(" +color.r+ "," +color.g+ "," +color.b+ ")"
		secondaryColor = rgbColors;
	}
}

function livelyAudioListener(audioArray) {
	var centerX = (1474/1920)* canvas.width,
		centerY = (499/1080)* canvas.height,
		centerRadius = {w: (445/1920)* canvas.width, h: (445/1080)* canvas.height}
		isLineInner = {l1: false, l2: false, l3: false, l4: false}
	// const length = 128;
	tctx.clearRect(0, 0, canvas.width, canvas.height);

	tctx.beginPath();
	// tctx.strokeStyle = "rgb(255, 255, 255)";
	// tctx.lineWidth = 0;
	// var lastLevel;
	var silent = 0;
	var nextLevel;
	var grt;
	for (var i = 0; i < audioArray.length; i++) {
		var level = i == 0 ? Math.min(audioArray[i] == 0 ?  audioArray[i]: audioArray[i]+minLevel, 1+minLevel): nextLevel;
		var nextLevel = Math.min(audioArray[i+1] == 0 ?  audioArray[i+1]: audioArray[i+1]+minLevel, 1+minLevel);
		
		if (level == 0 && nextLevel == 0) {
			silent++;
			if (silent == audioArray.length) {
				isPlaying = false;
				return;
			}
			continue;
		} else if (!isPlaying) {
			isPlaying = true;
			render()
			// break;
		}
		silent = 0;
		// lastLevel = level;
		var xOffset = [(i* (line1B.x-line1A.x)/audioArray.length)+line1A.x, ((i+1)* (line1B.x-line1A.x)/audioArray.length)+line1A.x];
		var yOffset = [(i* ((line1B.y-line1A.y)/audioArray.length))+line1A.y, ((i+1)* ((line1B.y-line1A.y)/audioArray.length))+line1A.y];
		// console.log(level, audioArray[i]+minLevel, level*maxLevel, audioArray[i]*maxLevel);
		// grt = tctx.createLinearGradient(200, 0, 1600, 0);
		// grt = tctx.createLinearGradient(xOffset[0]-(level*maxLevel), yOffset[0]+(level*maxLevel), xOffset[0]+(level*maxLevel), yOffset[0]-(level*maxLevel));
		if (xOffset[0] > centerX - centerRadius.w && yOffset[0] < centerY + centerRadius.h) {
			grt = tctx.createRadialGradient(xOffset[0], yOffset[0], 1, xOffset[1], yOffset[1], (maxLevel)*4);
			grt.addColorStop(0, primaryColor)
			grt.addColorStop(0.5*level, backgroundColor+"00")
		} else {
			grt = tctx.createRadialGradient(xOffset[0], yOffset[0], 1, xOffset[1], yOffset[1], (maxLevel)*4);
			grt.addColorStop(0, secondaryColor)
			grt.addColorStop(0.5*level, backgroundColor+"00")
		}
		//Line1
		tctx.fillStyle = grt;
		tctx.beginPath();
		tctx.moveTo(xOffset[0]-4, yOffset[0]-4);
		if (xOffset[1] > centerX - centerRadius.w && yOffset[1] < centerY + centerRadius.h) {
			// tctx.moveTo(xOffset[0] -(lastLevel*maxLevel), yOffset[0] -(lastLevel*maxLevel));
			if (!isLineInner.l1) {
				isLineInner.l1 = true
				// tctx.lineTo(xOffset[0] +(lastLevel*maxLevel), yOffset[0] -(lastLevel*maxLevel));
				tctx.lineTo(centerX - centerRadius.w, centerY);
				tctx.bezierCurveTo(xOffset[1] -(nextLevel*maxLevel)*smoothing, yOffset[1] +(nextLevel*maxLevel)*smoothing, xOffset[0] -(level*maxLevel)*smoothing, yOffset[0] +(level*maxLevel)*smoothing, xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			} 
			else {
				tctx.lineTo(xOffset[0] -(level*maxLevel), yOffset[0] +(level*maxLevel));
				tctx.bezierCurveTo(xOffset[1] -(nextLevel*maxLevel)*smoothing, yOffset[1] +(nextLevel*maxLevel)*smoothing, xOffset[0] -(level*maxLevel)*smoothing, yOffset[0] +(level*maxLevel)*smoothing, xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			}
		} else {
			// tctx.moveTo(xOffset[0] -(lastLevel*maxLevel), yOffset[0] -(lastLevel*maxLevel));
			if (isLineInner.l1) {
				isLineInner.l1 = false
				// tctx.lineTo(xOffset[0] -(lastLevel*maxLevel), yOffset[0] +(lastLevel*maxLevel));
				tctx.lineTo(centerX, centerY + centerRadius.h);
				// tctx.lineTo(xOffset[1] +(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel));
				tctx.bezierCurveTo(xOffset[1] +(nextLevel*maxLevel)*smoothing, yOffset[1] -(nextLevel*maxLevel)*smoothing, xOffset[0] +(level*maxLevel)*smoothing, yOffset[0] -(level*maxLevel)*smoothing, xOffset[1] +(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel))
				tctx.lineTo(xOffset[1], yOffset[1]);
			} 
			else {
				tctx.lineTo(xOffset[0] +(level*maxLevel), yOffset[0] -(level*maxLevel));
				tctx.bezierCurveTo(xOffset[1] +(nextLevel*maxLevel)*smoothing, yOffset[1] -(nextLevel*maxLevel)*smoothing, xOffset[0] +(level*maxLevel)*smoothing, yOffset[0] -(level*maxLevel)*smoothing, xOffset[1] +(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] +(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			}
		}
		// tctx.stroke();
		tctx.fill();
		tctx.closePath();
		//line2
		xOffset = [(i* (line2B.x-line2A.x)/audioArray.length)+line2A.x, ((i+1)* (line2B.x-line2A.x)/audioArray.length)+line2A.x];
		yOffset = [(i* ((line2B.y-line2A.y)/audioArray.length))+line2A.y, ((i+1)* ((line2B.y-line2A.y)/audioArray.length))+line2A.y];

		if (xOffset[0] < centerX + centerRadius.w && yOffset[0] > centerY - centerRadius.h) {
			grt = tctx.createRadialGradient(xOffset[0], yOffset[0], 1, xOffset[1], yOffset[1], (maxLevel)*4);
			grt.addColorStop(0*level, primaryColor)
			grt.addColorStop(0.5*level, backgroundColor+"00")
		} else {
			grt = tctx.createRadialGradient(xOffset[0], yOffset[0], 1, xOffset[1], yOffset[1], (maxLevel)*4);
			grt.addColorStop(0*level, secondaryColor)
			grt.addColorStop(0.5*level, backgroundColor+"00")
		}
		
		tctx.fillStyle = grt;
		tctx.beginPath();
		tctx.moveTo(xOffset[0]-4, yOffset[0]-4);
		if (xOffset[1] < centerX + centerRadius.w && yOffset[1] > centerY - centerRadius.h) {
				tctx.lineTo(xOffset[0] +(level*maxLevel), yOffset[0] -(level*maxLevel));
				tctx.bezierCurveTo(xOffset[1] +(nextLevel*maxLevel)*smoothing, yOffset[1] -(nextLevel*maxLevel)*smoothing, xOffset[0] +(level*maxLevel)*smoothing, yOffset[0] -(level*maxLevel)*smoothing, xOffset[1] +(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] +(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
		} else {
			if (isLineInner.l2) {
				isLineInner.l2 = false
				// tctx.lineTo(xOffset[0] +(lastLevel*maxLevel), yOffset[0] -(lastLevel*maxLevel));
				tctx.lineTo(centerX + centerRadius.w, centerY);
				tctx.bezierCurveTo(xOffset[1] -(nextLevel*maxLevel)*smoothing, yOffset[1] +(nextLevel*maxLevel)*smoothing, xOffset[0] -(level*maxLevel)*smoothing, yOffset[0] +(level*maxLevel)*smoothing, xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			} 
			else {
				tctx.lineTo(xOffset[0] -(level*maxLevel), yOffset[0] +(level*maxLevel));
				tctx.bezierCurveTo(xOffset[1] -(nextLevel*maxLevel)*smoothing, yOffset[1] +(nextLevel*maxLevel)*smoothing, xOffset[0] -(level*maxLevel)*smoothing, yOffset[0] +(level*maxLevel)*smoothing, xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			}
		}
		tctx.fill();
		tctx.closePath();
		
		//line3
		xOffset = [(i* (line3B.x-line3A.x)/audioArray.length)+line3A.x, ((i+1)* (line3B.x-line3A.x)/audioArray.length)+line3A.x];
		yOffset = [(i* ((line3B.y-line3A.y)/audioArray.length))+line3A.y, ((i+1)* ((line3B.y-line3A.y)/audioArray.length))+line3A.y];

		if (xOffset[0] > centerX - centerRadius.w && yOffset[0] > centerY - centerRadius.h) {
			grt = tctx.createRadialGradient(xOffset[0], yOffset[0], 1, xOffset[1], yOffset[1], (maxLevel)*4);
			grt.addColorStop(0*level, primaryColor)
			grt.addColorStop(0.5*level, backgroundColor+"00")
		} else {
			grt = tctx.createRadialGradient(xOffset[0], yOffset[0], 1, xOffset[1], yOffset[1], (maxLevel)*4);
			grt.addColorStop(0*level, secondaryColor)
			grt.addColorStop(0.5*level, backgroundColor+"00")
		}
		
		tctx.fillStyle = grt;
		tctx.beginPath();
		tctx.moveTo(xOffset[0]+4, yOffset[0]-4);
		if (xOffset[1] > centerX - centerRadius.w && yOffset[1] > centerY - centerRadius.h) {
			if (!isLineInner.l3) {
				isLineInner.l3 = true
				// tctx.lineTo(xOffset[0] +(lastLevel*maxLevel), yOffset[0] +(lastLevel*maxLevel));
				tctx.lineTo(centerX - centerRadius.w, centerY);
				tctx.bezierCurveTo(xOffset[1] -(nextLevel*maxLevel)*smoothing, yOffset[1] -(nextLevel*maxLevel)*smoothing, xOffset[0] -(level*maxLevel)*smoothing, yOffset[0] -(level*maxLevel)*smoothing, xOffset[1] -(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			} 
			else {
				tctx.lineTo(xOffset[0] -(level*maxLevel), yOffset[0] -(level*maxLevel));
				tctx.bezierCurveTo(xOffset[1] -(nextLevel*maxLevel)*smoothing, yOffset[1] -(nextLevel*maxLevel)*smoothing, xOffset[0] -(level*maxLevel)*smoothing, yOffset[0] -(level*maxLevel)*smoothing, xOffset[1] -(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			}
		} else {
			if (isLineInner.l3) {
				isLineInner.l3 = false
				// tctx.lineTo(xOffset[0] -(lastLevel*maxLevel), yOffset[0] -(lastLevel*maxLevel));
				tctx.lineTo(centerX, centerY - centerRadius.h);
				// tctx.lineTo(xOffset[1] +(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel));
				tctx.bezierCurveTo(xOffset[1] +(nextLevel*maxLevel)*smoothing, yOffset[1] +(nextLevel*maxLevel)*smoothing, xOffset[0] +(level*maxLevel)*smoothing, yOffset[0] +(level*maxLevel)*smoothing, xOffset[1] +(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel))
				tctx.lineTo(xOffset[1], yOffset[1]);
			} 
			else {
				tctx.lineTo(xOffset[0] +(level*maxLevel), yOffset[0] +(level*maxLevel));
				tctx.bezierCurveTo(xOffset[1] +(nextLevel*maxLevel)*smoothing, yOffset[1] +(nextLevel*maxLevel)*smoothing, xOffset[0] +(level*maxLevel)*smoothing, yOffset[0] +(level*maxLevel)*smoothing, xOffset[1] +(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] +(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			}
		}
		tctx.fill();
		tctx.closePath();
		
		//line4
		xOffset = [(i* (line4B.x-line4A.x)/audioArray.length)+line4A.x, ((i+1)* (line4B.x-line4A.x)/audioArray.length)+line4A.x];
		yOffset = [(i* ((line4B.y-line4A.y)/audioArray.length))+line4A.y, ((i+1)* ((line4B.y-line4A.y)/audioArray.length))+line4A.y];

		if (xOffset[0] < centerX + centerRadius.w && yOffset[0] < centerY + centerRadius.h) {
			grt = tctx.createRadialGradient(xOffset[0], yOffset[0], 1, xOffset[1], yOffset[1], (maxLevel)*4);
			grt.addColorStop(0*level, primaryColor)
			grt.addColorStop(0.5*level, backgroundColor+"00")
		} else {
			grt = tctx.createRadialGradient(xOffset[0], yOffset[0], 1, xOffset[1], yOffset[1], (maxLevel)*4);
			grt.addColorStop(0*level, secondaryColor)
			grt.addColorStop(0.5*level, backgroundColor+"00")
		}
		
		tctx.fillStyle = grt;
		tctx.beginPath();
		tctx.moveTo(xOffset[0]+4, yOffset[0]-4);
		if (xOffset[1] < centerX + centerRadius.w && yOffset[1] < centerY + centerRadius.h) {
			tctx.lineTo(xOffset[0] +(level*maxLevel), yOffset[0] +(level*maxLevel));
			tctx.bezierCurveTo(xOffset[1] +(nextLevel*maxLevel)*smoothing, yOffset[1] +(nextLevel*maxLevel)*smoothing, xOffset[0] +(level*maxLevel)*smoothing, yOffset[0] +(level*maxLevel)*smoothing, xOffset[1] +(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel))
			// tctx.lineTo(xOffset[1] +(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel));
			tctx.lineTo(xOffset[1], yOffset[1]);
		} else {
			if (isLineInner.l4) {
				isLineInner.l4 = false
				// tctx.lineTo(xOffset[0] +(lastLevel*maxLevel), yOffset[0] +(lastLevel*maxLevel));
				tctx.lineTo(centerX - centerRadius.w, centerY);
				tctx.bezierCurveTo(xOffset[1] -(nextLevel*maxLevel)*smoothing, yOffset[1] -(nextLevel*maxLevel)*smoothing, xOffset[0] -(level*maxLevel)*smoothing, yOffset[0] -(level*maxLevel)*smoothing, xOffset[1] -(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			} 
			else {
				tctx.lineTo(xOffset[0] -(level*maxLevel), yOffset[0] -(level*maxLevel));
				tctx.bezierCurveTo(xOffset[1] -(nextLevel*maxLevel)*smoothing, yOffset[1] -(nextLevel*maxLevel)*smoothing, xOffset[0] -(level*maxLevel)*smoothing, yOffset[0] -(level*maxLevel)*smoothing, xOffset[1] -(nextLevel*maxLevel), yOffset[1] -(nextLevel*maxLevel))
				// tctx.lineTo(xOffset[1] -(nextLevel*maxLevel), yOffset[1] +(nextLevel*maxLevel));
				tctx.lineTo(xOffset[1], yOffset[1]);
			}
		}
		tctx.fill();
		tctx.closePath();
		
		// tctx.rect(200,100,1600,850);
		// tctx.stroke();
		// ctx.moveTo(line1A.x, line1A.y);
		// ctx.lineTo(line1B.x, line1B.y);
		// tctx.stroke();
	}


	// const length = 128;
	// const minLevel = 0.1;
	// const maxLevel = 50;

	// tctx.beginPath();

	// tctx.strokeStyle = "white";
	// tctx.lineWidth = 2;
	// for (var i = 0; i <= audioArray.length; i++) {
	// 	var level = Math.min(audioArray[i] + minLevel, 1); //Math.max(Math.random(), 0.3);
	// 	var xOffset = (i* 944/audioArray.length)+29;
	// 	// console.log(xOffset);
		
		
	// 	tctx.moveTo(xOffset, 499+(level*maxLevel));
	// 	tctx.lineTo(xOffset, 499-(level*maxLevel));
	// 	tctx.stroke();
	// }
}


function render() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	TopCanvas.width = window.innerWidth;
	TopCanvas.height = window.innerHeight;
	document.getElementById("track-container").style.fontSize = `${(100/1080)*canvas.height}%`;

	line1A = {x: (531/1920)*canvas.width, y: 0};
	line1B = {x: (1610/1920)*canvas.width, y: canvas.height};
	line2A = {x: (1421/1920)*canvas.width, y: 0};
	line2B = {x: canvas.width, y: (499/1080)*canvas.height};
	line3A = {x: (1529/1920)*canvas.width, y: 0};
	line3B = {x: (450/1920)*canvas.width, y: canvas.height};
	line4A = {x: canvas.width, y: (499/1080)*canvas.height};
	line4B = {x: (1340/1920)*canvas.width, y: canvas.height};


	var imgTop = (56/1080*canvas.height);
	/*
	531, 0  -> 1610, 1079
	1420, 0 -> 1919, 499
	1529, 0 -> 450, 1079
	1919, 499 -> 1339, 1079

		
	*/
	ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.fillStyle = backgroundColor;
	// ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		
	img.width = (886/1920)*canvas.width;
	img.height = (887/1080)*canvas.height;
	// albumart.src = img.src;
	var debug = true;
	if (img.src != null && !img.src.startsWith("localfolder")) {
		ctx.beginPath();
		ctx.drawImage(img, canvas.width- (img.width+2), imgTop, img.width, img.height);

		imageData = ctx.getImageData(canvas.width- (img.width+2), imgTop, img.width, img.height);
		rgbValues = buildRgb(imageData);
		quantColors = quantization(rgbValues, 3);

		// document.getElementById("track-artist").innerHTML = img.src;
		var grX = 1474,
			grY = 499,
			grRadius = 445,
			grOutterR = grRadius + 10
			grInnerR = grOutterR/2,
			gradient = ctx.createRadialGradient(grX, grY, grInnerR, grX, grY, grOutterR)
		gradient.addColorStop(0, "rgba(0,0,0,0)")
		gradient.addColorStop(1, backgroundColor)
		ctx.strokeStyle = backgroundColor;
		// ctx.lineWidth = 0;
		
		ctx.beginPath();
		ctx.scale(canvas.width/1920,canvas.height/1080);
		ctx.arc(grX, grY, grRadius, 0, 2 * Math.PI);
		ctx.fillStyle = gradient;
		ctx.fill();
		ctx.beginPath();
		// context.globalCompositeOperation = "destination-out";
		ctx.arc(grX, grY, grRadius-1, 0, 2 * Math.PI);
		ctx.restore();

		ctx.rect(canvas.width, 0, -canvas.width, canvas.height);
		ctx.fillStyle = backgroundColor;
		ctx.fill();
		// ctx.stroke()
	} else {
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	ctx.restore();
		
	ctx.strokeStyle = lineColor;
	ctx.lineWidth = 2;
	ctx.beginPath();
	// ctx.moveTo((531/1920)*canvas.width, 0);
	ctx.moveTo(line1A.x, line1A.y);
	ctx.lineTo(line1B.x, line1B.y);
	ctx.stroke();
		
	ctx.moveTo(line2A.x, line2A.y);
	ctx.lineTo(line2B.x, line2B.y);
	ctx.stroke();
		
	ctx.moveTo(line3A.x, line3A.y);
	ctx.lineTo(line3B.x, line3B.y);
	ctx.stroke();
		
	ctx.moveTo(line4A.x, line4A.y);
	ctx.lineTo(line4B.x, line4B.y);
	ctx.stroke();

	//128
	//29, 499 -> 973, 499 : 944
		
		
}

function sleep(milliseconds) {  
	return new Promise(resolve => setTimeout(resolve, milliseconds));  
}



function buildRgb(imageData) {
	var rgbValues = [];
	for (let i = 0; i < imageData.data.length; i += 4) {
		var rgb = {
		r: imageData.data[i],
		g: imageData.data[i + 1],
		b: imageData.data[i + 2],
	};
	rgbValues.push(rgb);
	}
	return rgbValues;
};
 
function findBiggestColorRange(rgbValues) {
	let rMin = Number.MAX_VALUE;
	let gMin = Number.MAX_VALUE;
	let bMin = Number.MAX_VALUE;
 
	let rMax = Number.MIN_VALUE;
	let gMax = Number.MIN_VALUE;
	let bMax = Number.MIN_VALUE;
 
	rgbValues.forEach((pixel) => {
		rMin = Math.min(rMin, pixel.r);
		gMin = Math.min(gMin, pixel.g);
		bMin = Math.min(bMin, pixel.b);
 
		rMax = Math.max(rMax, pixel.r);
		gMax = Math.max(gMax, pixel.g);
		bMax = Math.max(bMax, pixel.b);
	});
 
	const rRange = rMax - rMin;
	const gRange = gMax - gMin;
	const bRange = bMax - bMin;
 
	const biggestRange = Math.max(rRange, gRange, bRange);
	if (biggestRange === rRange) {
		return "r";
	} else if (biggestRange === gRange) {
		return "g";
	} else {
		return "b";
	}
}
 
function quantization(rgbValues, depth) {
	const MAX_DEPTH = 4;
 
	// Base case
	if (depth === MAX_DEPTH || rgbValues.length === 0) {
		const color = rgbValues.reduce(
		(prev, curr) => {
			prev.r += curr.r;
			prev.g += curr.g;
			prev.b += curr.b;
 
			return prev;
		},
		{
			r: 0,
			g: 0,
			b: 0,
		}
		);
 
		color.r = Math.round(color.r / rgbValues.length);
		color.g = Math.round(color.g / rgbValues.length);
		color.b = Math.round(color.b / rgbValues.length);
 
		return [color];
	}
 
	/**
	 *  Recursively do the following:
	 *  1. Find the pixel channel (red,green or blue) with biggest difference/range
	 *  2. Order by this channel
	 *  3. Divide in half the rgb colors list
	 *  4. Repeat process again, until desired depth or base case
	 */
	const componentToSortBy = findBiggestColorRange(rgbValues);
	rgbValues.sort((p1, p2) => {
		return p1[componentToSortBy] - p2[componentToSortBy];
	});
 
	const mid = rgbValues.length / 2;
	return [
		...quantization(rgbValues.slice(0, mid), depth + 1),
		...quantization(rgbValues.slice(mid + 1), depth + 1),
	];
}



window.onload = () => {
	render();
};

 window.onresize = () => {
	render();
};
