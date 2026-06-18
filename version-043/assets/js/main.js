(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      const opened = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const searchInput = document.querySelector('[data-search-input]');
  if (searchInput) {
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    searchInput.addEventListener('input', function () {
      const value = searchInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', value && !haystack.includes(value));
      });
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const play = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        play();
      });
    });

    play();
  }

  window.initMoviePlayer = function (streamUrl) {
    const frame = document.querySelector('[data-player-frame]');
    const video = document.querySelector('[data-player-video]');
    const button = document.querySelector('[data-play-button]');
    if (!frame || !video || !button || !streamUrl) {
      return;
    }

    let mounted = false;
    let hls = null;

    const mount = function () {
      if (mounted) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      mounted = true;
    };

    const start = function () {
      mount();
      frame.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      const request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    };

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });

    frame.addEventListener('click', function (event) {
      if (event.target === button) {
        return;
      }
      if (!mounted || video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
