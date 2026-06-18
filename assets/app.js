(function () {
  var menuButton = document.querySelector(".menu-toggle");

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      document.body.classList.toggle("is-menu-open");
    });
  }

  var hero = document.querySelector(".hero");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;

    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterBlocks = document.querySelectorAll("[data-filter-block]");

  filterBlocks.forEach(function (block) {
    var keywordInput = block.querySelector("[data-filter-keyword]");
    var typeSelect = block.querySelector("[data-filter-type]");
    var yearSelect = block.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-state");

    var normalize = function (value) {
      return String(value || "").toLowerCase().trim();
    };

    var applyFilter = function () {
      var keyword = normalize(keywordInput && keywordInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var combined = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matchesKeyword = !keyword || combined.indexOf(keyword) !== -1;
        var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
        var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
        var shouldShow = matchesKeyword && matchesType && matchesYear;

        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    };

    [keywordInput, typeSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applyFilter);
        field.addEventListener("change", applyFilter);
      }
    });
  });
})();
