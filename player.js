(function(document, window) {

/********/
/* Vars */
/********/

var tracks;
var current = 0;
var timeEl = document.getElementById("time");
var loadedEl = document.getElementById("loaded");
var prevEl = document.getElementById("prev");
var playEl = document.getElementById("play");
var pauseEl = document.getElementById("pause");
var nextEl = document.getElementById("next");
var pageEl = document.getElementById("page");
var currentSongContainerEl = document.getElementById("current-song-container");
var currentSongEl = document.getElementById("current-song");
var timeAnimationRef;
var loadAnimationRef;
var dragging = false;
var playing = false;


/********************/
/* Events listeners */
/********************/

prevEl.addEventListener("click", function(e) {
	if(tracks[current].stream.position > 3000) {
		play(0, true);
	}
	else {
		play(-1);
	}
	event.preventDefault();
});

playEl.addEventListener("click", function(e) {
	play(0);
	event.preventDefault();
});

pauseEl.addEventListener("click", function(e) {
	pause();
	event.preventDefault();
});

nextEl.addEventListener("click", function() {
	play(+1);
	event.preventDefault();
});

document.addEventListener("mouseup", function() {
	dragging = false;
	event.preventDefault();
});

loadedEl.addEventListener("mousedown", function(e) {
	dragging = true;
	
	if(playing)
		handleSeek(e);
	
	event.preventDefault();
});

document.addEventListener("mousemove", function(e) {
	if(dragging && playing)
		handleSeek(e);
	
	event.preventDefault();
});


/*************/
/* Functions */
/*************/

function play(/*int*/ diff, /*bool*/ reset) {
	reset = reset === undefined ? false : true;
	
	loadTracksIfNeeded(function() {
		if(diff !== 0 || reset) {
			tracks[current].stream.stop();
		}
		
		current = ((current + diff) % tracks.length + tracks.length) % tracks.length;
		
		loadTrackIfNeeded(current, function() {
			tracks[current].stream.play({
				onfinish: function() {
					play(+1);
				}
			});
			
			pageEl.classList.add("playing");
			
			if(playing) {
				window.cancelAnimationFrame(timeAnimationRef);
				window.cancelAnimationFrame(loadAnimationRef);
			}
			
			currentSongEl.innerText = tracks[current].title;
			currentSongEl.setAttribute('href', tracks[current].permalink_url);
			currentSongContainerEl.style.width = currentSongEl.offsetWidth + 'px';
			
			playing = true;
			
			timeAnimation();
			loadAnimation();
		});
	});
}

function pause() {
	playing = false;
	tracks[current].stream.pause();
	pageEl.classList.remove("playing");
	window.cancelAnimationFrame(timeAnimationRef);
	window.cancelAnimationFrame(loadAnimationRef);
	currentSongContainerEl.style.width = 0;
}

function loadTracksIfNeeded(/*function*/ callback) {
	if(tracks === undefined) {
		SC.initialize({
		  client_id: '52baacfe62f29748af1aaa5bcad4fede'
		});
		
		SC.get('/users/chronisis/tracks', function(resp) {
			tracks = resp;
			callback();
		});
	}
	else {
		callback();
	}
}

function loadTrackIfNeeded(/*int*/ index, /*function*/ callback) {
	if(tracks[index].stream === undefined) {
		SC.stream('/tracks/' + tracks[index].id, function(resp){
			tracks[index].stream = resp;
			callback();
		});
	}
	else {
		callback();
	}
}

function timeAnimation() {
	var progression = tracks[current].stream.position / tracks[current].duration;
	timeEl.style.width = progression * 100 + '%';
	timeAnimationRef = window.requestAnimationFrame(timeAnimation);
}

function loadAnimation() {
	var progression = tracks[current].stream.duration / tracks[current].duration;
	loadedEl.style.width = progression * 100 + '%';
	
	if(progression < 1)
		loadAnimationRef = window.requestAnimationFrame(loadAnimation);
}

function handleSeek(/*Event*/ e) {
	var duration = (e.pageX / document.body.clientWidth) * tracks[current].duration;
	tracks[current].stream.setPosition(duration);
	
	console.log(tracks[current].stream);
	
	if(tracks[current].stream.playState !== 1) {
		tracks[current].stream.play();
	}
	
	e.preventDefault();
}

})(document, window);