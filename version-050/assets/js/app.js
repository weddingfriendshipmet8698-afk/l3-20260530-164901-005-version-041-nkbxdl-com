(function() {
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.querySelector(".nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      var next = Number(dot.getAttribute("data-slide") || 0);
      showSlide(next);
    });
  });

  if (slides.length > 1) {
    setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector(".js-search");
  var filters = Array.prototype.slice.call(document.querySelectorAll(".js-filter"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var visibleCount = document.querySelector(".js-visible-count");

  function matchesFilter(card, key, value) {
    if (!value) {
      return true;
    }

    return (card.getAttribute("data-" + key) || "") === value;
  }

  function updateCards() {
    if (!cards.length) {
      return;
    }

    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var activeFilters = filters.map(function(filter) {
      return {
        key: filter.getAttribute("data-filter"),
        value: filter.value
      };
    });

    var visible = 0;

    cards.forEach(function(card) {
      var text = (card.getAttribute("data-keywords") || "").toLowerCase();
      var ok = !query || text.indexOf(query) >= 0;

      activeFilters.forEach(function(filter) {
        if (!matchesFilter(card, filter.key, filter.value)) {
          ok = false;
        }
      });

      card.classList.toggle("is-hidden-card", !ok);

      if (ok) {
        visible += 1;
      }
    });

    if (visibleCount) {
      visibleCount.textContent = visible ? "当前显示 " + visible + " 部影片" : "未找到匹配影片";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", updateCards);
  }

  filters.forEach(function(filter) {
    filter.addEventListener("change", updateCards);
  });

  updateCards();
})();
