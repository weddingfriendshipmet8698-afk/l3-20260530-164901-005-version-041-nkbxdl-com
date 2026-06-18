(function () {
  window.initMoviePlayer = function (url) {
    const video = document.querySelector("[data-player]");
    const button = document.querySelector("[data-play-button]");
    const layer = button;
    let hlsInstance = null;

    function attach() {
      if (!video || video.dataset.ready === "1") return;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }

      video.dataset.ready = "1";
    }

    function start() {
      attach();
      if (layer) layer.classList.add("is-hidden");
      if (video) {
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) start();
      });
      video.addEventListener("play", function () {
        if (layer) layer.classList.add("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) hlsInstance.destroy();
      });
    }
  };
})();
