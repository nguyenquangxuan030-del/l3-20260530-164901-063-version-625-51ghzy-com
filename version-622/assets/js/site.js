(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterPanel && filterList) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-filter-card]'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    function getText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      cards.forEach(function (card) {
        var haystack = getText(card);
        var ok = true;
        ok = ok && (!keyword || haystack.indexOf(keyword) !== -1);
        ok = ok && (!type || card.getAttribute('data-type') === type);
        ok = ok && (!year || card.getAttribute('data-year') === year);
        ok = ok && (!region || card.getAttribute('data-region') === region);
        card.style.display = ok ? '' : 'none';
      });
    }

    [input, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-cover]');
    var playButton = player.querySelector('[data-play]');
    var hlsInstance = null;

    function bindVideo() {
      if (!video || video.getAttribute('data-ready') === 'yes') {
        return;
      }

      var stream = video.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', 'yes');
    }

    function startVideo() {
      bindVideo();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        video.controls = true;
        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    if (playButton) {
      playButton.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
