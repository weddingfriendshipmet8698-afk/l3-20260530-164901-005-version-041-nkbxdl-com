function initMoviePlayer(mediaUrl) {
  var shell = document.querySelector(".player-shell");

  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var cover = shell.querySelector(".player-cover");
  var attached = false;
  var hlsInstance = null;

  var attachMedia = function () {
    if (attached || !video || !mediaUrl) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = mediaUrl;
    video.load();
  };

  var requestPlay = function () {
    attachMedia();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    video.setAttribute("controls", "controls");
    var promise = video.play();

    if (promise && promise.catch) {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  };

  if (cover) {
    cover.addEventListener("click", requestPlay);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        requestPlay();
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
