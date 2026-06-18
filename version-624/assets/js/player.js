(function () {
    function attachSource(video, sourceUrl, ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            ready();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                maxBufferLength: 24
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                ready();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    video.src = sourceUrl;
                    ready();
                }
            });
            return;
        }
        video.src = sourceUrl;
        ready();
    }

    window.initMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var button = document.getElementById(config.buttonId);
        var started = false;
        if (!video || !overlay || !config.source) {
            return;
        }

        function playVideo() {
            overlay.classList.add('is-hidden');
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        function start() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            attachSource(video, config.source, playVideo);
        }

        overlay.addEventListener('click', start);
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
    };
})();
