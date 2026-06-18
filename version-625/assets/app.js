(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
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
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-chip-filter]'));
    var activeChip = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function getQueryFromUrl() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function cardMatchesChip(card) {
        if (activeChip === 'all') {
            return true;
        }
        var kind = normalize(card.getAttribute('data-kind'));
        if (activeChip === '剧') {
            return kind.indexOf('剧') !== -1;
        }
        return kind.indexOf(normalize(activeChip)) !== -1;
    }

    function applyFilters() {
        var value = searchInputs.length ? normalize(searchInputs[0].value) : '';
        filterCards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var matchedText = !value || text.indexOf(value) !== -1;
            card.classList.toggle('is-hidden-by-filter', !(matchedText && cardMatchesChip(card)));
        });
    }

    if (searchInputs.length && filterCards.length) {
        var query = getQueryFromUrl();
        if (query) {
            searchInputs.forEach(function (input) {
                input.value = query;
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener('input', applyFilters);
        });

        chipButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeChip = button.getAttribute('data-chip-filter') || 'all';
                chipButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });

        applyFilters();
    }
})();

function initMoviePlayer(streamUrl) {
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('[data-player-play]');
    var hlsInstance = null;
    var loaded = false;

    if (!video || !streamUrl) {
        return;
    }

    function loadStream() {
        if (loaded) {
            return;
        }
        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal || !hlsInstance) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        } else {
            video.src = streamUrl;
        }
    }

    function startPlayback() {
        loadStream();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (overlay && !video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });

    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });
}
