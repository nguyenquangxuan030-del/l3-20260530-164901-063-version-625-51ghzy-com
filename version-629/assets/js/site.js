(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFiltering() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".card-filter-input"));
    if (!inputs.length) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    function apply(value) {
      var q = normalize(value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search") || card.textContent);
        var matched = !q || haystack.indexOf(q) !== -1;
        card.setAttribute("hidden-by-filter", matched ? "false" : "true");
      });
    }

    inputs.forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
      input.addEventListener("input", function () {
        apply(input.value);
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-reset]")).forEach(function (button) {
      button.addEventListener("click", function () {
        inputs.forEach(function (input) {
          input.value = "";
        });
        apply("");
      });
    });

    if (query) {
      apply(query);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFiltering();
  });
})();
