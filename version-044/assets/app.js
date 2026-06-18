(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dotsWrap = hero.querySelector("[data-hero-dots]");
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    }));
    var timer = null;

    function render() {
      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-active", index === active);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, index) {
          dot.classList.toggle("is-active", index === active);
        });
      }
    }

    function go(delta) {
      active = (active + delta + slides.length) % slides.length;
      render();
    }

    if (dotsWrap) {
      slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换到第 " + (index + 1) + " 屏");
        dot.addEventListener("click", function () {
          active = index;
          render();
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        go(1);
        restart();
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        go(1);
      }, 5200);
    }

    render();
    if (slides.length > 1) {
      restart();
    }
  }

  function initSearch() {
    var input = document.getElementById("globalSearch");
    var results = document.getElementById("globalSearchResults");
    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function close() {
      results.classList.remove("is-open");
      results.innerHTML = "";
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      if (query.length < 1) {
        close();
        return;
      }
      var matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
        return item.title.toLowerCase().indexOf(query) !== -1 ||
          String(item.year).indexOf(query) !== -1 ||
          item.region.toLowerCase().indexOf(query) !== -1 ||
          item.type.toLowerCase().indexOf(query) !== -1 ||
          item.category.toLowerCase().indexOf(query) !== -1;
      }).slice(0, 12);

      results.innerHTML = matches.map(function (item) {
        return '<a class="search-item" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + item.year + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span></span>' +
          '</a>';
      }).join("");
      results.classList.toggle("is-open", matches.length > 0);
    });

    document.addEventListener("click", function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        close();
      }
    });
  }

  function initLocalFilters() {
    var list = document.querySelector("[data-local-list]");
    if (!list) {
      return;
    }
    var input = document.querySelector(".local-filter");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-local-year]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var selectedYear = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-category") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var matchText = !query || haystack.indexOf(query) !== -1;
        var matchYear = selectedYear === "all" || card.getAttribute("data-year") === selectedYear;
        card.classList.toggle("is-hidden-by-filter", !(matchText && matchYear));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedYear = button.getAttribute("data-local-year") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initLocalFilters();
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById("movieVideo");
  var button = document.getElementById("moviePlayButton");
  var status = document.getElementById("playerStatus");
  var hlsInstance = null;
  var prepared = false;

  if (!video || !sourceUrl) {
    return;
  }

  function showStatus(text) {
    if (!status) {
      return;
    }
    status.textContent = text;
    status.classList.add("is-visible");
  }

  function hideStatus() {
    if (!status) {
      return;
    }
    status.textContent = "";
    status.classList.remove("is-visible");
  }

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      if (window.Hls.Events && window.Hls.Events.ERROR) {
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            showStatus("播放暂时不可用，请稍后再试");
          }
        });
      }
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    prepare();
    hideStatus();
    if (button) {
      button.classList.add("is-hidden");
    }
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });
  video.addEventListener("pause", function () {
    if (video.currentTime === 0 && button) {
      button.classList.remove("is-hidden");
    }
  });
  video.addEventListener("error", function () {
    showStatus("播放暂时不可用，请稍后再试");
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
