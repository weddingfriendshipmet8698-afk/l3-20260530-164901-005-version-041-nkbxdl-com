(function () {
  var input = document.getElementById('searchInput');
  var typeSelect = document.getElementById('searchType');
  var yearSelect = document.getElementById('searchYear');
  var results = document.getElementById('searchResults');
  var movies = window.__MOVIE_INDEX__ || [];

  if (!input || !results) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-card>' +
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\')">' +
          '<span class="poster-shade"></span>' +
          '<span class="play-chip">播放</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<div class="card-meta">' +
            '<span>' + escapeHtml(movie.year) + '</span>' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>' + escapeHtml(movie.type) + '</span>' +
          '</div>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var selectedType = typeSelect ? typeSelect.value : '';
    var selectedYear = yearSelect ? yearSelect.value : '';
    var matched = movies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      return (!keyword || haystack.indexOf(keyword) !== -1) &&
        (!selectedType || movie.type === selectedType) &&
        (!selectedYear || movie.year === selectedYear);
    }).slice(0, 120);

    results.innerHTML = matched.map(card).join('');
  }

  input.value = getQuery();
  [input, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    }
  });
  render();
})();
