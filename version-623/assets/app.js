(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });
    restart();
  }

  function setupFilters() {
    selectAll('[data-filter-form]').forEach(function (form) {
      var targetSelector = form.getAttribute('data-target');
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) {
        return;
      }
      var keyword = form.querySelector('[data-filter-keyword]');
      var type = form.querySelector('[data-filter-type]');
      var region = form.querySelector('[data-filter-region]');
      var year = form.querySelector('[data-filter-year]');
      var items = selectAll('[data-movie-card]', target);
      var empty = target.parentElement ? target.parentElement.querySelector('[data-empty-state]') : null;

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var q = normalize(keyword ? keyword.value : '');
        var t = normalize(type ? type.value : '');
        var r = normalize(region ? region.value : '');
        var y = normalize(year ? year.value : '');
        var visible = 0;
        items.forEach(function (item) {
          var search = normalize(item.getAttribute('data-search'));
          var itemType = normalize(item.getAttribute('data-type'));
          var itemRegion = normalize(item.getAttribute('data-region'));
          var itemYear = normalize(item.getAttribute('data-year'));
          var matched = true;
          if (q && search.indexOf(q) === -1) {
            matched = false;
          }
          if (t && itemType !== t) {
            matched = false;
          }
          if (r && itemRegion !== r) {
            matched = false;
          }
          if (y && itemYear !== y) {
            matched = false;
          }
          item.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      [keyword, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && keyword) {
        keyword.value = q;
      }
      apply();
    });
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle('is-visible', window.scrollY > 460);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupBackTop();
  });
})();

function initMoviePlayer(stream, selector) {
  var player = document.querySelector(selector || '.movie-player');
  if (!player) {
    return;
  }
  var video = player.querySelector('video');
  var overlay = player.querySelector('.player-overlay');
  var loaded = false;
  var hls = null;

  function attach() {
    if (loaded || !video) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  }

  function play() {
    attach();
    if (overlay) {
      overlay.hidden = true;
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (overlay) {
          overlay.hidden = false;
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      event.preventDefault();
      play();
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });
    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.hidden = false;
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
