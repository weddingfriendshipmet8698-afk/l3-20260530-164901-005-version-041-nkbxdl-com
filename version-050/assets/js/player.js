function initializeMoviePlayer(videoId, source, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var loaded = false;
  var hls = null;

  if (!video) {
    return;
  }

  function load() {
    if (loaded) {
      return;
    }

    if (window.Hls && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function start() {
    load();

    var action = video.play();

    if (action && action.catch) {
      action.catch(function() {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function() {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
}
