(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playerOverlay");
    if (!video || !overlay) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var started = false;
    var hls = null;
    var readyCallbacks = [];

    function runReadyCallbacks() {
      var callbacks = readyCallbacks.splice(0);
      callbacks.forEach(function (callback) {
        callback();
      });
    }

    function attachStream(callback) {
      readyCallbacks.push(callback);
      if (started) {
        runReadyCallbacks();
        return;
      }
      started = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        runReadyCallbacks();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, runReadyCallbacks);
      } else {
        video.src = stream;
        runReadyCallbacks();
      }
    }

    function playVideo() {
      overlay.classList.add("is-hidden");
      attachStream(function () {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      });
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
