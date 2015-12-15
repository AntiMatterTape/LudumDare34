audioArray = {};

audioArray.soft = new Audio("random/soft.wav");
audioArray.bell = new Audio("random/bell.wav");
audioArray.eject = new Audio("random/Eject.wav");
audioArray.softOld = new Audio("random/softOld.wav");
audioArray.spaceship = new Audio("random/starWarsShip.wav");
audioArray.wubwub = new Audio("random/WubWubWubEngine.wav");


songArray = [
	{"tune":"eject","time":[1]},
	{"tune":"soft","time":[0,5]},
	{"tune":"spaceship","time":[3]},
	{"tune":"wubwub","time":[7]},
	{"tune":"softOld","time":[2]}
];

function init () {
	setInterval(song, 100);
}

playAudio = false;
tick = 0;
function song () {
	tick++;
	if (tick == 10) {tick = 0};

	if (playAudio) {
		for (var i = 0; i < songArray.length; i++) {
			for (var b = 0; b < songArray[i]["time"].length; b++) {
				if (songArray[i].time[b] == tick) audioArray[songArray[i].tune].play();
			};
		};
	};
}