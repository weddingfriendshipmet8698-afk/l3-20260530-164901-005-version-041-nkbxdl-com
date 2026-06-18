(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function sitePath(path) {
    var base = document.body.getAttribute("data-base") || ".";
    return base.replace(/\/$/, "") + "/" + String(path || "").replace(/^\//, "");
  }

  function initMenu() {
    var toggle = one("[data-menu-toggle]");
    var menu = one("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = one("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    var prev = one("[data-hero-prev]", hero);
    var next = one("[data-hero-next]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });
    hero.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initFilterForms() {
    all("[data-filter-form]").forEach(function (form) {
      var container = form.parentElement ? form.parentElement.querySelector(".filter-target") : null;
      if (!container) {
        return;
      }
      var cards = all(".movie-card", container);
      var keywordInput = form.querySelector("input[name='keyword']");
      var yearSelect = form.querySelector("select[name='year']");
      var genreSelect = form.querySelector("select[name='genre']");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      if (keywordInput && initialQuery) {
        keywordInput.value = initialQuery;
      }

      function apply() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var genre = genreSelect ? genreSelect.value : "";
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardGenre = card.getAttribute("data-genre") || "";
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (genre && cardGenre.indexOf(genre) === -1) {
            matched = false;
          }
          card.hidden = !matched;
        });
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  function initSearchSuggest() {
    var source = window.MovieSearchIndex || [];
    all("[data-global-search]").forEach(function (form) {
      var input = form.querySelector("input[name='q']");
      var panel = form.querySelector(".search-suggest");
      if (!input || !panel) {
        return;
      }

      function close() {
        panel.hidden = true;
        panel.innerHTML = "";
      }

      function render() {
        var keyword = input.value.trim().toLowerCase();
        if (!keyword) {
          close();
          return;
        }
        var results = source.filter(function (item) {
          return item.search.indexOf(keyword) !== -1;
        }).slice(0, 8);
        if (!results.length) {
          close();
          return;
        }
        panel.innerHTML = results.map(function (item) {
          return '<a href="' + sitePath(item.path) + '"><strong>' + item.title + '</strong><span>' + item.meta + '</span></a>';
        }).join("");
        panel.hidden = false;
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          close();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilterForms();
    initSearchSuggest();
  });
})();

window.bindMoviePlayer = function (videoId, sourceUrl) {
  var video = document.getElementById(videoId);
  if (!video) {
    return;
  }
  var shell = video.closest(".player-shell");
  var startButton = shell ? shell.querySelector("[data-player-start]") : null;
  var prepared = false;
  var hlsInstance = null;

  function prepare() {
    if (prepared) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    prepared = true;
  }

  function start() {
    prepare();
    if (shell) {
      shell.classList.add("is-started");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (shell) {
          shell.classList.remove("is-started");
        }
      });
    }
  }

  if (startButton) {
    startButton.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (!prepared || video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    if (shell) {
      shell.classList.add("is-started");
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
};
