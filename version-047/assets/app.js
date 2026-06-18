(function () {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  const sliders = document.querySelectorAll("[data-hero-slider]");

  sliders.forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let index = 0;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    if (prev) prev.addEventListener("click", function () { show(index - 1); });
    if (next) next.addEventListener("click", function () { show(index + 1); });
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () { show(dotIndex); });
    });

    setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  const forms = document.querySelectorAll("[data-filter-form]");

  forms.forEach(function (form) {
    const scope = form.closest(".container") || document;
    const input = form.querySelector("[data-filter-input]");
    const region = form.querySelector("[data-region-filter]");
    const year = form.querySelector("[data-year-filter]");
    const sort = form.querySelector("[data-sort-select]");
    const result = scope.querySelector("[data-filter-results]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      const keyword = normalize(input ? input.value : "");
      const regionValue = normalize(region ? region.value : "");
      const yearValue = normalize(year ? year.value : "");
      const items = Array.from(scope.querySelectorAll(".filter-item"));

      items.forEach(function (item) {
        const haystack = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.genre,
          item.dataset.year
        ].join(" "));
        const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchRegion = !regionValue || normalize(item.dataset.region).indexOf(regionValue) !== -1;
        const matchYear = !yearValue || normalize(item.dataset.year) === yearValue;
        item.classList.toggle("is-filter-hidden", !(matchKeyword && matchRegion && matchYear));
      });
    }

    function applySort() {
      if (!sort || !result) return;
      const mode = sort.value;
      const items = Array.from(result.querySelectorAll(".filter-item"));
      items.sort(function (a, b) {
        if (mode === "year-desc") return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        if (mode === "hot-desc") return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
        if (mode === "title-asc") return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
        return 0;
      });
      items.forEach(function (item) {
        result.appendChild(item);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applySort();
      applyFilter();
    });

    [input, region, year].forEach(function (node) {
      if (node) node.addEventListener("input", applyFilter);
      if (node) node.addEventListener("change", applyFilter);
    });

    if (sort) {
      sort.addEventListener("change", function () {
        applySort();
        applyFilter();
      });
    }

    applyFilter();
  });
})();
