(function () {
  var header = document.querySelector('[data-header]');
  var lastScroll = window.scrollY || 0;

  function updateHeader() {
    var current = window.scrollY || 0;
    if (header) {
      header.classList.toggle('is-shadowed', current > 40);
      header.classList.toggle('is-hidden', current > lastScroll && current > 220);
    }
    lastScroll = current;
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        event.preventDefault();
        window.location.href = './search.html';
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(value);
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(currentIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(currentIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function applyCardFilters(targetSelector) {
    var container = document.querySelector(targetSelector);
    if (!container) {
      return;
    }
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
    var textInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-target="' + targetSelector + '"]'));
    var yearSelects = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter="' + targetSelector + '"]'));

    function filterCards() {
      var text = textInputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).join(' ');
      var year = yearSelects.map(function (select) {
        return select.value;
      }).filter(Boolean)[0] || '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchesText = !text || haystack.indexOf(text) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-hidden', !(matchesText && matchesYear));
      });
    }

    textInputs.concat(yearSelects).forEach(function (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    });

    filterCards();
  }

  document.querySelectorAll('[data-filter-target]').forEach(function (input) {
    applyCardFilters(input.getAttribute('data-filter-target'));
  });
})();
