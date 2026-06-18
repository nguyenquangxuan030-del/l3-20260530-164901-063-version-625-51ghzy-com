(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initNavigation() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".mobile-toggle");
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = header.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                play();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        play();
    }

    function normalized(value) {
        return String(value || "").trim().toLowerCase();
    }

    function textOfCard(card) {
        return normalized([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags"),
            card.textContent
        ].join(" "));
    }

    function initFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var input = root.querySelector(".filter-input");
            var year = root.querySelector(".filter-year");
            var reset = root.querySelector(".filter-reset");
            var scope = root.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .compact-movie"));
            var empty = scope.querySelector(".empty-state");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            if (input && initial) {
                input.value = initial;
            }

            function apply() {
                var q = normalized(input ? input.value : "");
                var y = normalized(year ? year.value : "");
                var shown = 0;
                cards.forEach(function (card) {
                    var hay = textOfCard(card);
                    var cardYear = normalized(card.getAttribute("data-year"));
                    var ok = (!q || hay.indexOf(q) !== -1) && (!y || cardYear === y);
                    card.hidden = !ok;
                    if (ok) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    apply();
                });
            }
            apply();
        });
    }

    function initPlayer() {
        var shell = document.querySelector(".player-shell");
        var video = document.querySelector("#movie-player");
        var layer = document.querySelector("#play-layer");
        if (!shell || !video || !layer) {
            return;
        }
        var source = video.getAttribute("data-src");
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !source) {
                return Promise.resolve();
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                attached = true;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                attached = true;
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    setTimeout(resolve, 1600);
                });
            }
            video.src = source;
            attached = true;
            return Promise.resolve();
        }

        function playVideo() {
            shell.classList.add("is-playing");
            attach().then(function () {
                return video.play();
            }).catch(function () {
                shell.classList.remove("is-playing");
            });
        }

        layer.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0) {
                shell.classList.remove("is-playing");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayer();
    });
})();
