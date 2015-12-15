function init () {
	canvasSize();
	render();
	drawAnimatedSprites();
	setInterval(render, 1000/60)
}

function canvasSize () {
	gridSize = Math.round(window.innerHeight/10);
	originalGridSize = Math.round(window.innerWidth/10);
	drawSize = 10;
	canvas.style.width = window.innerWidth + "px";
	canvas.style.height = window.innerHeight + "px";
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	betaDraw.width = mapSize*gridSize;
	betaDraw.height = mapSize*gridSize;
	deltaDraw.width = window.innerWidth;
	deltaDraw.height = window.innerHeight;
	gammaDraw.width = window.innerWidth;
	gammaDraw.height = window.innerHeight;
	drawBackground();
	window.requestAnimationFrame(drawBackground);
	canvasWidth = window.innerWidth;
}

var powerLevels = [0,100,500,2000,3000,3500];

canvasWidth = 0;

var upArrow = new Image();
upArrow.src = "img/up.png";
var downArrow = new Image();
downArrow.src = "img/down.png";
var leftArrow = new Image();
leftArrow.src = "img/left.png";
var rightArrow = new Image();
rightArrow.src = "img/right.png";

softArray = [];
for (var i = 0; i < 10; i++) {
	softArray[i] = new Audio("sound/random/soft.wav");
}

player = {
	"x": 25,
	"y": 25,
	"sprite": leftArrow,
	"direction": "down",
	"size": 1,
	"angle": 180
}

level = 0;
mapSize = 65;
gridSize = 32;
drawSize = 10;
drawCollisionOverlay = false;
movementSpeed = 0.075;//0.125, 0.0625
originalMovementSpeed = 0.075;//0.125, 0.0625
playerMovement = 0; // 0.1
animatedSprites = [];
viewOffsetX = 0;
viewOffsetY = 0;

canvas = document.getElementById("mainCanvas");
context = canvas.getContext("2d");

betaDraw = document.getElementById("b");
betaContext = betaDraw.getContext("2d");

deltaDraw = document.getElementById("d");
deltaContext = deltaDraw.getContext("2d");

gammaDraw = document.getElementById("g");
gammaContext = gammaDraw.getContext("2d");

var images = {};

images.img0 = new Image();
images.img0.src = "img/darkDirt.gif";
images.img1 = new Image();
images.img1.src = "img/dirt.gif";
images.img2 = new Image();
images.img2.src = "img/water.gif";

images.img3 = new Image();
images.img3.src = "img/dirt_tl.gif";
images.img4 = new Image();
images.img4.src = "img/dirt_tr.gif";
images.img5 = new Image();
images.img5.src = "img/dirt_br.gif";
images.img6 = new Image();
images.img6.src = "img/dirt_bl.gif";

images.img7 = new Image();
images.img7.src = "img/dirt_pt.gif";
images.img8 = new Image();
images.img8.src = "img/dirt_pr.gif";
images.img9 = new Image();
images.img9.src = "img/dirt_pb.gif";
images.img10 = new Image();
images.img10.src = "img/dirt_pl.gif";
images.img11 = new Image();
images.img11.src = "img/dirt2.gif";


cursorPosition = 0;
selected = "none";

notStarted = true, inMenu = true, inGame = false, inCutscene = false;
var lastLoop = new Date;
function render () {
	var win = true;
	for (var i = 0; i < foreground.length; i++) {
		if (foreground[i] != 0) win = false;
	};
    var thisLoop = new Date;
    var fps = 1000 / (thisLoop - lastLoop);
    lastLoop = thisLoop;
    if (win) {
    	gammaContext.clearRect(0,0,window.innerWidth,window.innerHeight);
		gammaContext.fillStyle = "black";
    	gammaContext.fillRect(0,0,window.innerWidth,window.innerHeight);

		gammaContext.fillStyle = "white";
		gammaContext.font = "30px Arial";
		gammaContext.fillText("You win",window.innerWidth/2,window.innerHeight/2);
    } else if (inGame) {
		var playersize = 0;//Math.round(player.size/200);
		for (var i = 0; i < powerLevels.length; i++) {
			if (player.size > powerLevels[i]) playersize = i+1;
		};
		if (playersize > powerLevels.length) {player.size = 1; levelUp()};

		if (playerLeft) {player.angle -= 1.5};
		if (playerRight) {player.angle += 1.5};
		if (player.angle > 360) {player.angle = 0};
		if (player.angle < 0) {player.angle = 360};
		if (playerLeft && playerRight && playersize > 1) {player.size--; playerMovement += 0.0025};
		if (playerMovement > originalMovementSpeed) {playerMovement -= 0.001};
		//if (zoom < 1) {zoom = 1};
		movePlayer();
		viewOffsetX = -(player.x * gridSize) + window.innerWidth/2;
		viewOffsetY = -(player.y * gridSize) + window.innerHeight/2;
		context.clearRect(0,0,window.innerWidth,window.innerHeight);

		var x = Math.round(viewOffsetX);
		var y = Math.round(viewOffsetY);

		//draw Background
		context.drawImage(betaDraw, x, y);

		//draw Animated Background Sprites
		//context.drawImage(gammaDraw, x, y);

		//draw player
		drawRotatedImage(context, player.sprite, player.x*gridSize+x, player.y*gridSize+y, (gridSize + playersize *gridSize), (gridSize + playersize *gridSize), player.angle);

		//draw Foreground
		window.requestAnimationFrame(drawForeground);
		//context.drawImage(deltaDraw, x, y);
		if (notStarted) {
			gammaContext.fillStyle = "black";
			gammaContext.font = "30px Arial";

			gammaContext.fillText("Press A or L to start", window.innerWidth/2 - 160, window.innerHeight/2);
		};
	} else if (inMenu) {
		document.getElementById("menu").style.display = "block";
		if (selected == "none") {
			document.getElementById("nav").style.display = "block";
	
			var menu = ["inst","play","info"];
			for (var i = 0; i < menu.length; i++) {
				if (cursorPosition >= menu.length) {cursorPosition=0};
				if (cursorPosition < 0) {cursorPosition=menu.length-1};

				if (cursorPosition == i) document.getElementById(menu[i]).style.textDecoration = "underline overline";
				else document.getElementById(menu[i]).style.textDecoration = "none";
	
				if (select) {
					switch (cursorPosition) {
						case 0:
							selected = "inst";
							document.getElementById("nav").style.display = "none";
							select = false;
						break;
						case 1:
							inMenu = false; inGame = true;
							document.getElementById("menu").style.display = "none";
							select = false;
						break;
						case 2:
							selected = "info";
							document.getElementById("nav").style.display = "none";
							select = false;
						break;
					}
	
					select = false;
				};
			};
		} else if (selected == "inst") {
			document.getElementById("instBlock").style.display = "block";
			if (select) {
				selected = "none";
				document.getElementById("instBlock").style.display = "none";
				select = false;
			};
		} else if (selected == "info") {
			document.getElementById("infoBlock").style.display = "block";
			if (select) {
				selected = "none";
				document.getElementById("infoBlock").style.display = "none";
				select = false;
			};
		};

	} else if (inCutscene) {

	}
	//debug
	if (!inMenu) {
		gammaContext.clearRect(0,0,300,70);
		gammaContext.font = "15px Arial";
		gammaContext.fillStyle = "black";
		gammaContext.fillText("X:"+player.x,1,15);
		gammaContext.fillText("Y:"+player.y,1,31);
		gammaContext.fillText("Size: "+(player.size-1),200,31);
		gammaContext.fillText("Level: "+level,200,15);
			//var framerate = 0;
			//for (var i = lastFrame.length-60; i < lastFrame.length; i++) {
			//	framerate = (lastFrame[i] + lastFrame[i-1])/2;
			//};
			gammaContext.fillText("FPS: "+Math.round(fps),0,60);
	};
}

function drawAnimatedSprites() {
	//gammaContext.clearRect(0,0,window.innerWidth*20,window.innerHeight*20);
	var tempArray = animatedSprites[0];
	for (var i = 0; i < tempArray.length; i++) {

		tempArray[i].frame = tempArray[i].frame+1;

		if (tempArray[i].frame >= tempArray[i].frames.length) {tempArray[i].frame = 0};
		var image = images[tempArray[i].frames[tempArray[i].frame]];

		if (true) {
			gammaContext.drawImage(images[tempArray[i].frames[tempArray[i].frame]], tempArray[i].x*gridSize, tempArray[i].y*gridSize,gridSize,gridSize);
		}
	};
	setTimeout(drawAnimatedSprites, 250);
}

animatedSprites[0] = [];
function drawBackground () {
	betaContext.clearRect(0,0,window.innerWidth*20,window.innerHeight*20);
	animatedSprites[0] = [];

	for (var i = 0; i < mapSize; i++) {
		for (var b = 0; b < mapSize; b++) {
			var x = (b*gridSize);// + viewOffsetX;
			var y = (i*gridSize);// + viewOffsetY;
			betaContext.drawImage(images["img"+map[b + (i * mapSize)]],x,y,gridSize,gridSize);
		};
	};
}

function drawForeground () {
	//deltaContext.clearRect(0,0,window.innerWidth*20,window.innerHeight*20);
	viewOffsetX = Math.round(-(player.x * gridSize) + window.innerWidth/2);
	viewOffsetY = Math.round(-(player.y * gridSize) + window.innerHeight/2);

	for (var i = 0; i < mapSize; i++) {
		for (var b = 0; b < mapSize; b++) {
			var x = (b*gridSize) + viewOffsetX;
			var y = (i*gridSize) + viewOffsetY;
			if (!(x > window.innerWidth) && !(y > window.innerHeight*2) && x > 0-gridSize && y > 0-gridSize) {
				if (foreground[b + (i * mapSize)] > 0) {
					if (foreground[b + (i * mapSize)] == 1) {
						if (foreground[b + ((i-1) * mapSize)] == 0 && foreground[(b-1) + (i * mapSize)] == 0 && foreground[(b+1) + (i * mapSize)] == 0 && foreground[b + ((i+1) * mapSize)] == 0) {
							deltaContext.clearRect(x,y,gridSize,gridSize);
							eatAtCoord(b,i);
						}
						else if (foreground[b + ((i-1) * mapSize)] == 0 && foreground[(b-1) + (i * mapSize)] == 0 && foreground[(b+1) + (i * mapSize)] == 0) {
							deltaContext.clearRect(x,y,gridSize,gridSize);
							deltaContext.drawImage(images["img7"],x,y,gridSize,gridSize);
						}
						else if (foreground[(b+1) + (i * mapSize)] == 0 && foreground[b + ((i+1) * mapSize)] == 0 && foreground[(b-1) + (i * mapSize)] == 0) {
							deltaContext.clearRect(x,y,gridSize,gridSize);
							deltaContext.drawImage(images["img9"],x,y,gridSize,gridSize);
						}
						else if (foreground[b + ((i-1) * mapSize)] == 0 && foreground[(b+1) + (i * mapSize)] == 0 && foreground[b + ((i+1) * mapSize)] == 0) {
							deltaContext.clearRect(x,y,gridSize,gridSize);
							deltaContext.drawImage(images["img8"],x,y,gridSize,gridSize);
						}
						else if (foreground[b + ((i+1) * mapSize)] == 0 && foreground[(b-1) + (i * mapSize)] == 0 && foreground[b + ((i-1) * mapSize)] == 0) {
							deltaContext.clearRect(x,y,gridSize,gridSize);
							deltaContext.drawImage(images["img10"],x,y,gridSize,gridSize);
						}
						else if (foreground[b + ((i-1) * mapSize)] == 0 && foreground[(b-1) + (i * mapSize)] == 0) {
							deltaContext.clearRect(x,y,gridSize,gridSize);
							deltaContext.drawImage(images["img3"],x,y,gridSize,gridSize);
						}
						else if (foreground[(b+1) + (i * mapSize)] == 0 && foreground[b + ((i-1) * mapSize)] == 0) {
							deltaContext.clearRect(x,y,gridSize,gridSize);
							deltaContext.drawImage(images["img4"],x,y,gridSize,gridSize);
						}
						else if (foreground[(b+1) + (i * mapSize)] == 0 && foreground[b + ((i+1) * mapSize)] == 0) {
							deltaContext.clearRect(x,y,gridSize,gridSize);
							deltaContext.drawImage(images["img5"],x,y,gridSize,gridSize);
						}
						else if (foreground[(b-1) + (i * mapSize)] == 0 && foreground[b + ((i+1) * mapSize)] == 0) {
							deltaContext.clearRect(x,y,gridSize,gridSize);
							deltaContext.drawImage(images["img6"],x,y,gridSize,gridSize);
						}
						else deltaContext.drawImage(images["img"+foreground[b + (i * mapSize)]],x,y,gridSize,gridSize);
					} else deltaContext.drawImage(images["img"+foreground[b + (i * mapSize)]],x,y,gridSize,gridSize);
				} else deltaContext.clearRect(x,y,gridSize,gridSize);
				//switch (foreground[b + (i * mapSize)]) {
				//	case 0:
				//		deltaContext.clearRect(x,y,gridSize,gridSize);
				//	break;
				//}
			};
		};
	};

}

$("body").click(function() {
	playerRight = false;
	playerLeft = false;
});


var playerUp = false, playerDown = false, playerLeft = false, playerRight = false;
var lastDirection = "";
var select = false;
$("body").keydown(function(e) {
	if (inMenu) {
		var code = e.keyCode;
		if (code == 81 || code == 87 || code == 69 || code == 83 || code == 82 || code == 84 || code == 65 || code == 93 || code == 68 || code == 70 || code == 71 || code == 90 || code == 88 || code == 67 || code == 86 || code == 9 || code == 49 || code == 50 || code == 51 || code == 52 || code == 53 || code == 20 || code == 27 || code == 112 || code == 113 || code == 114 || code == 115 || code == 192 || e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
			e.preventDefault();
			select = true;
		} else if (code != 17 && code != 16 && code != 32 && code != 18) {
			e.preventDefault();
			cursorPosition++;
		}
	};

	//if (!inGame) {return};
	if (notStarted && inGame) {
		notStarted = false;
		playerMovement = movementSpeed;
		gammaContext.clearRect(0,0,window.innerWidth,window.innerHeight)
	};
	//if (gameOver) return;
	var code = e.keyCode;
	if (code == 81 || code == 87 || code == 69 || code == 83 || code == 82 || code == 84 || code == 65 || code == 93 || code == 68 || code == 70 || code == 71 || code == 90 || code == 88 || code == 67 || code == 86 || code == 9 || code == 49 || code == 50 || code == 51 || code == 52 || code == 53 || code == 20 || code == 27 || code == 112 || code == 113 || code == 114 || code == 115 || code == 192 || e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
		e.preventDefault();
		if (!playerLeft) notifyOfMovement("left");
		playerLeft = true;
	} else if (code != 17 && code != 16 && code != 32 && code != 18) {
		e.preventDefault();
		if (!playerRight) notifyOfMovement("right");
		playerRight = true;
	}
});

$("body").keyup(function(e) {
	//if (gameOver) return;

	var code = e.keyCode;

	if (code == 81 || code == 87 || code == 69 || code == 83 || code == 82 || code == 84 || code == 65 || code == 93 || code == 68 || code == 70 || code == 71 || code == 90 || code == 88 || code == 67 || code == 86 || code == 9 || code == 49 || code == 50 || code == 51 || code == 52 || code == 53 || code == 20 || code == 27 || code == 112 || code == 113 || code == 114 || code == 115 || code == 192 || e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
		e.preventDefault();
		playerLeft = false;
	} else if (code != 17 && code != 16 && code != 32 && code != 18) {
		e.preventDefault();
		playerRight = false;
	}
});

var movementTimes = {
	"up": 0,
	"left": 0,
	"down": 0,
	"right": 0
};

var movementTimesArray = [
	"up",
	"left",
	"down",
	"right"
];

function notifyOfMovement (argument) {
	var d = new Date();
	var n = d.getTime();
	movementTimes[argument] = n;
}


var movingUp, movingDown, movingLeft, currentlyMoving, movingRight = false;
var targetDestination = {"x": 0, "y": 0};
var collisionDestination = {"x": 0, "y": 0};
function movePlayer () {

	checkMovement();
	if (player.x > mapSize-1) player.x = mapSize-1;
	if (player.y > mapSize-1) player.y = mapSize-1;
	if (player.x < 0) player.x = 0;
	if (player.y < 0) player.y = 0;
	player.x -= (playerMovement) * Math.cos(player.angle * Math.PI / 180);
	player.y -= (playerMovement) * Math.sin(player.angle * Math.PI / 180);
}

function checkMovement () {
	var playersize = 0;//Math.round(player.size/200);
	//if (playersize < 1) {playersize = 1};

	//var runningTotal = 0;
	for (var i = 0; i < powerLevels.length; i++) {
		if (player.size > powerLevels[i]) playersize = i+1;
	};

	for (var i = 0; i < Math.ceil(playersize); i++) {
		var checkDistance = i;
		if (i>2) { checkDistance = i/2}; //seems to scale pretty well

		if (getAtCoord(collision,Math.round(player.x+checkDistance),Math.round(player.y)) != 0 && Math.round(player.y) >= 0 && Math.round(player.x+checkDistance) >= 0) {
			eatAtCoord(player.x+checkDistance,player.y);
		}
		if (getAtCoord(collision,Math.round(player.x),Math.round(player.y-checkDistance)) != 0 && Math.round(player.y-checkDistance) >= 0 && Math.round(player.x) >= 0) {
			eatAtCoord(player.x,player.y-checkDistance);
		}
		if (getAtCoord(collision,Math.round(player.x-checkDistance),Math.round(player.y)) != 0 && Math.round(player.y) >= 0 && Math.round(player.x-checkDistance) >= 0) {
			eatAtCoord(player.x-checkDistance,player.y);
		}
		if (getAtCoord(collision,Math.round(player.x),Math.round(player.y+checkDistance)) != 0 && Math.round(player.y+i) >= 0 && Math.round(player.x) >= 0) {
			eatAtCoord(player.x,player.y+checkDistance);
		}


		if (getAtCoord(collision,Math.round(player.x+checkDistance/2),Math.round(player.y+checkDistance/2)) != 0 && Math.round(player.y) >= 0 && Math.round(player.x+checkDistance) >= 0) {
			eatAtCoord(player.x+checkDistance/2,player.y+checkDistance/2);
		}
		if (getAtCoord(collision,Math.round(player.x+checkDistance/2),Math.round(player.y-checkDistance/2)) != 0 && Math.round(player.y-checkDistance) >= 0 && Math.round(player.x) >= 0) {
			eatAtCoord(player.x+checkDistance/2,player.y-checkDistance/2);
		}
		if (getAtCoord(collision,Math.round(player.x-checkDistance/2),Math.round(player.y+checkDistance/2)) != 0 && Math.round(player.y) >= 0 && Math.round(player.x-checkDistance) >= 0) {
			eatAtCoord(player.x-checkDistance/2,player.y+checkDistance/2);
		}
		if (getAtCoord(collision,Math.round(player.x-checkDistance/2),Math.round(player.y-checkDistance/2)) != 0 && Math.round(player.y+i) >= 0 && Math.round(player.x) >= 0) {
			eatAtCoord(player.x-checkDistance/2,player.y-checkDistance/2);
		}
	}
}

function getAtCoord (array,x,y) {
	var posx=Math.round(x),posy=Math.round(y);
	if (posx<0) {var posx = 0;}
	if (posx>=mapSize) {var posx = mapSize-1};
	if (posy<0) {var posy = 0;}
	if (posy>=mapSize) {var posy = mapSize-1};

	return array[Math.round(posx) + Math.round(posy)*mapSize];
}
function eatAtCoord (x,y,value) {
	var posx=Math.round(x),posy=Math.round(y);
	if (posx<0) {var posx = 0;}
	if (posx>=mapSize) {var posx = mapSize-1};
	if (posy<0) {var posy = 0;}
	if (posy>=mapSize) {var posy = mapSize-1};

	var tile = foreground[Math.round(posx) + Math.round(posy)*mapSize];
	var upTile = foreground[Math.round(posx) + Math.round(posy-1)*mapSize];
	var leftTile = foreground[Math.round(posx-1) + Math.round(posy)*mapSize];
	var downTile = foreground[Math.round(posx) + Math.round(posy+1)*mapSize];
	var rightTile = foreground[Math.round(posx+1) + Math.round(posy)*mapSize];
	if (tile == 1) {player.size++}
	else if (tile == 2) {
		player.size++;
		if (upTile == 2) {
			player.size++;
			foreground[Math.round(posx) + Math.round(posy-1)*mapSize] = 0;
			collision[Math.round(posx) + Math.round(posy-1)*mapSize] = 0;
		};
		if (downTile == 2) {
			player.size++;
			foreground[Math.round(posx) + Math.round(posy+1)*mapSize] = 0;
			collision[Math.round(posx) + Math.round(posy+1)*mapSize] = 0;
		};
		if (rightTile == 2) {
			player.size++;
			foreground[Math.round(posx+1) + Math.round(posy)*mapSize] = 0;
			collision[Math.round(posx+1) + Math.round(posy)*mapSize] = 0;
		};
		if (leftTile == 2) {
			player.size++;
			foreground[Math.round(posx-1) + Math.round(posy)*mapSize] = 0;
			collision[Math.round(posx-1) + Math.round(posy)*mapSize] = 0;
		};
	}
	foreground[Math.round(posx) + Math.round(posy)*mapSize] = 0;
	collision[Math.round(posx) + Math.round(posy)*mapSize] = 0;
}

function rI(min, max) {return Math.floor(Math.random() * (max - min)) + min;}

var TO_RADIANS = Math.PI/180; 
function drawRotatedImage(context, image, x, y, width, height, angle) { 
	context.save(); 
	context.translate(x, y);
	context.rotate(angle * TO_RADIANS);
	context.drawImage(image, Math.round(-(width/2)), Math.round(-(height/2)), Math.round(width), Math.round(height));
	context.restore(); 
}

function levelUp () {
	level++;
	leveling = true;
	foreground = levelOne();
	for (var i = 0; i < foreground.length; i++) {
		collision[i] = foreground[i]*2;
	};

	player.x = Math.round(mapSize/2);
	player.y = Math.round(mapSize/2);
}