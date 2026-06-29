/*
  Custom Enhancements — Aria Roasters
  Motion orchestration for Horizon: scroll reveals, hero entrance,
  heading clips, sticky-header scroll state, and hero parallax.
  Pairs with custom-enhancements.css. No dependencies.
  ------------------------------------------------------------------ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;

  /* ---------------------------------------------------------------
     Sticky-header scroll state — toggle a class once the page moves.
     Runs even under reduced motion (it's just a shadow, CSS handles
     whether it transitions). Uses rAF-throttled scroll handling.
     --------------------------------------------------------------- */
  function initHeaderScrollState() {
    var ticking = false;
    function update() {
      root.classList.toggle('ce-scrolled', window.scrollY > 30);
      ticking = false;
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------------------------------------------------------------
     Hero entrance — stagger the first content section's text/buttons
     in on load with a blur-rise.
     --------------------------------------------------------------- */
  function initHeroEntrance(sections) {
    var hero = null;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (/header|announcement|footer/i.test(s.id || '')) continue;
      if (s.querySelector('.hero, h1, h2, [class*="heading"]')) {
        hero = s;
        break;
      }
    }
    if (!hero) return;

    var items = hero.querySelectorAll(
      'h1, h2, h3, .h1, .h2, p, .button, a.hero__link, [class*="button"]:not(.button-unstyled)'
    );
    if (!items.length) return;

    hero.classList.add('ce-hero-entrance');
    var n = 0;
    items.forEach(function (el) {
      // Skip nested duplicates (an item already inside another flagged item).
      if (el.closest('.ce-hero-item') && el.closest('.ce-hero-item') !== el) return;
      el.classList.add('ce-hero-item');
      el.style.setProperty('--ce-i', n++);
    });

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        hero.classList.add('ce-go');
      });
    });
  }

  /* ---------------------------------------------------------------
     Scroll reveal — sections fade/rise in; grids stagger; headings clip.
     --------------------------------------------------------------- */
  function initScrollReveal(sections) {
    var skip = /header|announcement|footer|menu-drawer|cart/i;
    var targets = sections.filter(function (el, i) {
      if (i === 0) return false;
      if (el.classList.contains('ce-hero-entrance')) return false;
      if (skip.test(el.id || '')) return false;
      return true;
    });
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add('ce-reveal');

      var grid = el.querySelector(
        'ul, .product-grid, .resource-list, [class*="product-list"]'
      );
      if (grid && grid.children.length > 1 && grid.children.length <= 24) {
        grid.classList.add('ce-stagger');
      }

      // First heading in the section gets the clip-reveal treatment.
      var heading = el.querySelector('h1, h2, .h1, .h2');
      if (heading) heading.classList.add('ce-head-reveal');

      // Large media wrappers: slow hover-zoom.
      el.querySelectorAll('.hero, .banner, [class*="image"]').forEach(function (m) {
        if (m.querySelector('img, video')) m.classList.add('ce-zoom-frame');
      });
    });

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        el.classList.add('ce-in');
        var g = el.querySelector('.ce-stagger');
        if (g) g.classList.add('ce-in');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add('ce-in');
          var grid = el.querySelector('.ce-stagger');
          if (grid) grid.classList.add('ce-in');
          observer.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     Parallax — hero media drifts at ~88% of scroll speed (desktop).
     --------------------------------------------------------------- */
  function initParallax() {
    if (window.innerWidth < 750) return;

    var frames = Array.prototype.slice
      .call(document.querySelectorAll('.hero__media'))
      .slice(0, 4)
      .filter(function (el) {
        return el.tagName === 'IMG' || el.querySelector('img, video');
      });
    if (!frames.length) return;

    frames.forEach(function (el) {
      el.classList.add('ce-parallax');
    });

    var ticking = false;
    var MAX = 26; // px of drift either side

    function update() {
      var vh = window.innerHeight;
      frames.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        // Progress: -1 (entering bottom) .. 1 (leaving top)
        var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        var y = Math.max(-1, Math.min(1, progress)) * -MAX;
        el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function init() {
    initHeaderScrollState();

    // Motion-heavy effects respect the reduced-motion preference.
    if (reduceMotion.matches) return;

    var sections = Array.prototype.slice.call(
      document.querySelectorAll('.shopify-section')
    );
    initHeroEntrance(sections);
    initScrollReveal(sections);
    initParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
