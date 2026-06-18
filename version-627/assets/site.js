(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = qs('.mobile-menu-button');
        var nav = qs('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = qsa('[data-hero-slide]');
        if (slides.length < 2) {
            return;
        }
        var dots = qsa('[data-hero-dot]');
        var prev = qs('[data-hero-prev]');
        var next = qs('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function initPlayers() {
        qsa('[data-play-button]').forEach(function (button) {
            button.addEventListener('click', function () {
                var card = button.closest('.player-card');
                var video = card ? qs('video[data-src]', card) : null;
                if (!video) {
                    return;
                }
                var source = video.getAttribute('data-src');
                if (!source) {
                    return;
                }

                button.classList.add('is-hidden');

                if (window.Hls && window.Hls.isSupported()) {
                    if (!video._hlsInstance) {
                        video._hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        video._hlsInstance.loadSource(source);
                        video._hlsInstance.attachMedia(video);
                    }
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }

                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            });
        });
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 6).map(function (tag) {
            return '<span class="tag tag-small">' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '    <a class="poster-link" href="' + movie.page + '">',
            '        <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
            '        <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-line">',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '        <h3><a href="' + movie.page + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.one_line) + '</p>',
            '        <div class="card-tags">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initSearchPage() {
        var results = qs('#search-results');
        var input = qs('#search-input');
        var title = qs('#search-title');
        if (!results || !input || !title) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;
        if (!query.trim()) {
            return;
        }
        fetch('assets/search-data.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (movies) {
                var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
                var matched = movies.filter(function (movie) {
                    var haystack = [
                        movie.title,
                        movie.year,
                        movie.region,
                        movie.type,
                        movie.genre,
                        (movie.tags || []).join(' '),
                        movie.one_line
                    ].join(' ').toLowerCase();
                    return words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                }).sort(function (a, b) {
                    return b.hot_score - a.hot_score || b.year - a.year || a.id - b.id;
                });
                title.textContent = '“' + query + '” 的搜索结果：' + matched.length + ' 部';
                results.innerHTML = matched.slice(0, 240).map(movieCardTemplate).join('') || '<p>没有找到匹配影片。</p>';
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initPlayers();
        initSearchPage();
    });
})();
