(function() {
    var header = document.getElementById("siteHeader");
    var menuToggle = document.getElementById("menuToggle");
    var mobileNav = document.getElementById("mobileNav");

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (menuToggle && mobileNav && header) {
        menuToggle.addEventListener("click", function() {
            mobileNav.classList.toggle("open");
            header.classList.toggle("menu-open", mobileNav.classList.contains("open"));
        });
    }

    var hero = document.getElementById("homeHero");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                showSlide(current + 1);
                restart();
            });
        }

        restart();
    }

    var input = document.getElementById("movieSearchInput");
    var category = document.getElementById("movieCategoryFilter");
    var results = document.getElementById("searchResults");
    var hintButtons = document.querySelectorAll("[data-search-word]");

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function renderSearch() {
        if (!input || !category || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var keyword = input.value.trim().toLowerCase();
        var selected = category.value;
        var items = window.SEARCH_MOVIES.filter(function(movie) {
            var inCategory = !selected || movie.category === selected;
            if (!keyword) {
                return inCategory;
            }
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
            return inCategory && haystack.indexOf(keyword) !== -1;
        }).slice(0, 96);
        results.innerHTML = items.map(function(movie) {
            return [
                "<article class=\"movie-card movie-card-poster\">",
                "<a class=\"movie-cover\" href=\"" + escapeHtml(movie.detail) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"movie-cover-mask\"></span>",
                "<span class=\"play-chip\">▶</span>",
                "<span class=\"meta-chip\">" + escapeHtml(movie.year) + "</span>",
                "</a>",
                "<div class=\"movie-info\">",
                "<h3><a href=\"" + escapeHtml(movie.detail) + "\">" + escapeHtml(movie.title) + "</a></h3>",
                "<p class=\"movie-meta\">" + escapeHtml(movie.region + " / " + movie.type) + "</p>",
                "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");
    }

    if (input && category && results) {
        input.addEventListener("input", renderSearch);
        category.addEventListener("change", renderSearch);
        hintButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                input.value = button.getAttribute("data-search-word") || "";
                renderSearch();
            });
        });
        renderSearch();
    }
})();
