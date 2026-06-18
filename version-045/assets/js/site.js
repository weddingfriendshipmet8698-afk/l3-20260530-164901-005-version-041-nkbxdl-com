const Hls = window.Hls;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const button = $("[data-menu-button]");
  const panel = $("[data-mobile-panel]");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", () => {
    panel.classList.toggle("is-open");
    button.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
  });
}

function initHero() {
  const hero = $("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = $$(".hero-slide", hero);
  const dots = $$(".hero-dot", hero);
  const previous = $("[data-hero-prev]", hero);
  const next = $("[data-hero-next]", hero);
  if (slides.length === 0) {
    return;
  }
  let active = 0;
  let timer = null;

  const render = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === active);
      dot.setAttribute("aria-current", dotIndex === active ? "true" : "false");
    });
  };

  const start = () => {
    timer = window.setInterval(() => render(active + 1), 5000);
  };

  const restart = () => {
    window.clearInterval(timer);
    start();
  };

  previous?.addEventListener("click", () => {
    render(active - 1);
    restart();
  });
  next?.addEventListener("click", () => {
    render(active + 1);
    restart();
  });
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      render(index);
      restart();
    });
  });
  render(0);
  start();
}

function getTextValue(value) {
  return String(value || "").trim().toLowerCase();
}

function initFilters() {
  $$("[data-filter-scope]").forEach((scope) => {
    const keyword = $("[data-filter-keyword]", scope);
    const year = $("[data-filter-year]", scope);
    const region = $("[data-filter-region]", scope);
    const type = $("[data-filter-type]", scope);
    const cards = $$("[data-movie-card]", scope);
    const count = $("[data-result-count]", scope);

    const apply = () => {
      const q = getTextValue(keyword?.value);
      const y = getTextValue(year?.value);
      const r = getTextValue(region?.value);
      const t = getTextValue(type?.value);
      let visible = 0;
      cards.forEach((card) => {
        const haystack = getTextValue([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(" "));
        const matched = (!q || haystack.includes(q)) &&
          (!y || getTextValue(card.dataset.year) === y) &&
          (!r || getTextValue(card.dataset.region).includes(r)) &&
          (!t || getTextValue(card.dataset.type).includes(t));
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    };

    [keyword, year, region, type].forEach((control) => {
      control?.addEventListener("input", apply);
      control?.addEventListener("change", apply);
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && keyword) {
      keyword.value = query;
    }
    apply();
  });
}

function initHomeSearch() {
  const form = $("[data-home-search]");
  if (!form) {
    return;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("input", form);
    const value = encodeURIComponent(input?.value || "");
    window.location.href = `search.html?q=${value}`;
  });
}

function initPlayers() {
  $$("[data-player]").forEach((shell) => {
    const video = $("video", shell);
    const button = $("[data-player-start]", shell);
    const error = $("[data-player-error]", shell);
    if (!video || !button) {
      return;
    }
    let loaded = false;
    let hls = null;

    const showError = () => {
      if (error) {
        error.textContent = "播放暂时不可用，请稍后再试";
        error.classList.add("is-visible");
      }
      button.classList.remove("is-hidden");
    };

    const playVideo = () => {
      video.play().catch(showError);
    };

    const attach = () => {
      if (loaded) {
        playVideo();
        return;
      }
      const stream = video.dataset.stream;
      if (!stream) {
        showError();
        return;
      }
      loaded = true;
      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            showError();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        playVideo();
      } else {
        showError();
      }
    };

    const start = () => {
      if (error) {
        error.classList.remove("is-visible");
      }
      button.classList.add("is-hidden");
      attach();
    };

    button.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", () => button.classList.add("is-hidden"));
    video.addEventListener("pause", () => {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", () => button.classList.remove("is-hidden"));
    window.addEventListener("beforeunload", () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initHero();
  initFilters();
  initHomeSearch();
  initPlayers();
});
