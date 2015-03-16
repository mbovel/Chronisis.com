(function(document, window) {

/********/
/* Vars */
/********/

var tracks;
var current = 0;
var timeRailEl = document.getElementById("time-rail");
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
	if(tracks[current].audioEl.currentTime > 3) {
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

timeRailEl.addEventListener("mousedown", function(e) {
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

window.addEventListener('load', function(e) {
	fetchJSONFile('http://api.soundcloud.com/users/chronisis/tracks?client_id=52baacfe62f29748af1aaa5bcad4fede', function(resp) {
		tracks = resp;
	});
});


/*************/
/* Functions */
/*************/

function play(/*int*/ diff, /*bool*/ reset) {
	reset = reset === undefined ? false : true;
	
	if(diff !== 0 || reset) {
		// HTML5 Audio stop function
		// http://stackoverflow.com/questions/14834520/html5-audio-stop-function
		tracks[current].audioEl.pause();
		tracks[current].audioEl.currentTime = 0;
	}
	
	current = ((current + diff) % tracks.length + tracks.length) % tracks.length;
	
	if(tracks[current].audioEl === undefined) {
		loadTrack(current);
	}
	
	tracks[current].audioEl.play();
	
	pageEl.classList.add("playing");
	
	currentSongEl.innerText = tracks[current].title;
	currentSongEl.setAttribute('href', tracks[current].permalink_url);
	currentSongContainerEl.style.width = currentSongEl.offsetWidth + 'px';
	
	playing = true;
}

function pause() {
	playing = false;
	tracks[current].audioEl.pause();
	pageEl.classList.remove("playing");
	currentSongContainerEl.style.width = 0;
}

function timeAnimation() {
	var progression = tracks[current].audioEl.currentTime / tracks[current].audioEl.duration;
	timeEl.style.width = progression * 100 + '%';
	timeAnimationRef = window.requestAnimationFrame(timeAnimation);
}

function loadTrack(i) {
	tracks[i].audioEl = document.createElement('audio');
	
	tracks[i].audioEl.setAttribute('src', tracks[i].stream_url + '?client_id=52baacfe62f29748af1aaa5bcad4fede');
			
	// Media events
	// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
	
	tracks[i].audioEl.addEventListener('playing', function(e) {
		timeAnimation();
	});
	
	tracks[i].audioEl.addEventListener('pause', function(e) {
		window.cancelAnimationFrame(timeAnimationRef);
	});
	
	tracks[i].audioEl.addEventListener('ended', function(e) {
		play(+1);
	});
}

function handleSeek(/*Event*/ e) {
	var duration = (e.pageX / document.body.clientWidth) * tracks[current].audioEl.duration;
	tracks[current].audioEl.currentTime = duration;
	
	e.preventDefault();
}

// How do i load a JSON object from a file with ajax?
// http://stackoverflow.com/a/14388512
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send(); 
}

})(document, window);