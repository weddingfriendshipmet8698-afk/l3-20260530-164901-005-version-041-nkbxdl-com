(function () {
  function playVideo(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    var message = player.querySelector('.player-message');
    var source = button ? button.getAttribute('data-stream') : '';

    if (!video || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachAndPlay() {
      player.classList.add('is-playing');
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.getAttribute('src') !== source) {
          video.setAttribute('src', source);
        }
        video.play().catch(function () {
          setMessage('点击视频区域继续播放');
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (player._hlsInstance) {
          player._hlsInstance.destroy();
        }
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setMessage('点击视频区域继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('暂时无法播放，请稍后再试');
          }
        });
        return;
      }

      video.setAttribute('src', source);
      video.play().catch(function () {
        setMessage('暂时无法播放，请稍后再试');
      });
    }

    if (button) {
      button.addEventListener('click', attachAndPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        attachAndPlay();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(playVideo);
})();
