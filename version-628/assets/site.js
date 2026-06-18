(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        selectAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = selectAll('.hero-slide', slider);
        var dots = selectAll('[data-hero-dot]', slider);
        var previous = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                show(itemIndex);
                start();
            });
        });
        previous && previous.addEventListener('click', function () {
            show(current - 1);
            start();
        });
        next && next.addEventListener('click', function () {
            show(current + 1);
            start();
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var filterRoot = document.querySelector('[data-filter-root]');
        if (!filterRoot) {
            return;
        }
        var keyword = filterRoot.querySelector('[data-filter-keyword]');
        var year = filterRoot.querySelector('[data-filter-year]');
        var sort = filterRoot.querySelector('[data-filter-sort]');
        var result = filterRoot.querySelector('[data-filter-result]');
        var grid = filterRoot.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }
        var cards = selectAll('.movie-card, .compact-card', grid);

        function matches(card) {
            var query = keyword ? keyword.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category'),
                card.getAttribute('data-year')
            ].join(' ').toLowerCase();
            if (query && text.indexOf(query) === -1) {
                return false;
            }
            if (yearValue && card.getAttribute('data-year') !== yearValue) {
                return false;
            }
            return true;
        }

        function apply() {
            var visible = 0;
            var ordered = cards.slice();
            if (sort && sort.value === 'year') {
                ordered.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            }
            if (sort && sort.value === 'score') {
                ordered.sort(function (a, b) {
                    return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
                });
            }
            if (sort && sort.value === 'title') {
                ordered.sort(function (a, b) {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                });
            }
            ordered.forEach(function (card) {
                grid.appendChild(card);
                var ok = matches(card);
                card.classList.toggle('hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (result) {
                result.textContent = visible ? '筛选结果已更新' : '未匹配到影片';
            }
        }

        [keyword, year, sort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupSearchPage() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (!query) {
            return;
        }
        var input = document.querySelector('[data-filter-keyword]');
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroSlider();
        setupFilters();
        setupSearchPage();
    });
})();
