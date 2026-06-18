(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function text(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = menu.hasAttribute('hidden') === false;
            if (opened) {
                menu.setAttribute('hidden', '');
                button.setAttribute('aria-expanded', 'false');
            } else {
                menu.removeAttribute('hidden');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function applyGridFilter(root) {
        var queryInput = root.querySelector('[data-local-search]') || root.querySelector('[data-search-input]');
        var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var empty = root.querySelector('[data-empty-state]');
        var activeFilter = 'all';

        function update() {
            var query = text(queryInput ? queryInput.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = text(card.getAttribute('data-text'));
                var genres = text(card.getAttribute('data-genre'));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchFilter = activeFilter === 'all' || genres.indexOf(text(activeFilter)) !== -1 || haystack.indexOf(text(activeFilter)) !== -1;
                var isVisible = matchQuery && matchFilter;
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visible += 1;
                }
            });
            if (empty) {
                if (visible) {
                    empty.setAttribute('hidden', '');
                } else {
                    empty.removeAttribute('hidden');
                }
            }
        }

        if (queryInput) {
            queryInput.addEventListener('input', update);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                update();
            });
        });

        update();
    }

    function initFilters() {
        Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(applyGridFilter);
        var searchPage = document.querySelector('[data-search-page]');
        if (searchPage) {
            var input = searchPage.querySelector('[data-search-input]');
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            if (input) {
                input.value = query;
            }
            applyGridFilter(searchPage);
            if (input && query) {
                input.dispatchEvent(new Event('input'));
            }
        }
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (root) {
            var video = root.querySelector('.js-player-video');
            var overlay = root.querySelector('.player-overlay');
            if (!video) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var hlsInstance = null;
            var started = false;

            function attach() {
                if (!stream || started) {
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (!started) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
