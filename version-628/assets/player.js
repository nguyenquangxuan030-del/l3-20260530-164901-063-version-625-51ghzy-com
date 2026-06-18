(function () {
    window.initializeMoviePlayer = function (sourceUrl) {
        var video = document.getElementById('movie-video');
        var cover = document.getElementById('movie-cover-layer');
        var playButton = document.getElementById('movie-play-button');
        var errorBox = document.getElementById('movie-player-error');
        var loaded = false;
        var hlsInstance = null;

        if (!video || !cover || !playButton) {
            return;
        }

        function showError(message) {
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.classList.add('is-visible');
            }
        }

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        showError('播放出错，请稍后重试');
                    }
                });
                return;
            }
            video.src = sourceUrl;
            video.load();
        }

        function beginPlay() {
            loadVideo();
            cover.classList.add('is-hidden');
            var playing = video.play();
            if (playing && typeof playing.catch === 'function') {
                playing.catch(function () {
                    showError('点击视频区域可继续播放');
                });
            }
        }

        playButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            beginPlay();
        });

        cover.addEventListener('click', function () {
            beginPlay();
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                beginPlay();
            } else {
                video.pause();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
