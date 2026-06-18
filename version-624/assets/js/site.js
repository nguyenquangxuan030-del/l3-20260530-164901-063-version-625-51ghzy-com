(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
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

    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
        var queryInput = scope.querySelector('[data-page-filter]');
        var typeFilter = scope.querySelector('[data-type-filter]');
        var regionFilter = scope.querySelector('[data-region-filter]');
        var yearFilter = scope.querySelector('[data-year-filter]');
        var grid = document.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && queryInput) {
            queryInput.value = q;
        }

        function matchText(card, query) {
            if (!query) {
                return true;
            }
            var source = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-category'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
            return source.indexOf(query.toLowerCase()) !== -1;
        }

        function applyFilter() {
            var query = queryInput ? queryInput.value.trim() : '';
            var typeValue = typeFilter ? typeFilter.value : '';
            var regionValue = regionFilter ? regionFilter.value : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            cards.forEach(function (card) {
                var ok = true;
                if (!matchText(card, query)) {
                    ok = false;
                }
                if (typeValue && (card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
                    ok = false;
                }
                if (regionValue && (card.getAttribute('data-region') || '').indexOf(regionValue) === -1) {
                    ok = false;
                }
                if (yearValue && (card.getAttribute('data-year') || '').indexOf(yearValue) !== 0) {
                    ok = false;
                }
                card.classList.toggle('is-filter-hidden', !ok);
            });
        }

        [queryInput, typeFilter, regionFilter, yearFilter].forEach(function (input) {
            if (input) {
                input.addEventListener('input', applyFilter);
                input.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    });
})();
