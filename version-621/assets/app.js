(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        var form = document.querySelector("[data-filter-form]");
        if (!form) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var keyword = form.querySelector("[name='keyword']");
        var region = form.querySelector("[name='region']");
        var type = form.querySelector("[name='type']");
        var year = form.querySelector("[name='year']");
        var empty = document.querySelector("[data-empty-state]");

        function update() {
            var keywordValue = normalize(keyword && keyword.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (keywordValue && haystack.indexOf(keywordValue) === -1) {
                    matched = false;
                }
                if (regionValue && cardRegion.indexOf(regionValue) === -1 && haystack.indexOf(regionValue) === -1) {
                    matched = false;
                }
                if (typeValue && cardType.indexOf(typeValue) === -1 && haystack.indexOf(typeValue) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear.indexOf(yearValue) === -1) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [keyword, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var overlay = shell.querySelector(".player-overlay");
            var streamUrl = shell.getAttribute("data-stream-url");
            var attached = false;
            var instance = null;

            if (!video || !overlay || !streamUrl) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({
                        maxBufferLength: 30,
                        backBufferLength: 30
                    });
                    instance.loadSource(streamUrl);
                    instance.attachMedia(video);
                    return;
                }
                video.src = streamUrl;
            }

            function play() {
                overlay.classList.add("is-hidden");
                attach();
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        video.controls = true;
                    });
                }
            }

            overlay.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (instance) {
                    instance.destroy();
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
})();
