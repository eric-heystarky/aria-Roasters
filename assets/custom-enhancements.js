/*
  Custom Enhancements — Aria Roasters
  Scroll-reveal orchestration for Horizon sections + product grids.
  Pairs with custom-enhancements.css. No dependencies.
  ------------------------------------------------------------------ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init() {
    // Bail out entirely if the visitor prefers reduced motion.
    if (reduceMotion.matches) return;

    var sections = Array.prototype.slice.call(
      document.querySelectorAll('.shopify-section')
    );

    // Skip chrome (header/announcement/footer) and the first in-view section
    // so above-the-fold content never flashes or shifts on load.
    var skip = /header|announcement|footer|menu-drawer|cart/i;
    var targets = sections.filter(function (el, i) {
      if (i === 0) return false;
      if (skip.test(el.id || '')) return false;
      return true;
    });

    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add('ce-reveal');

      // Mark product grids / galleries inside the section for staggered reveal.
      var grid = el.querySelector(
        'ul, .product-grid, .resource-list, [class*="product-list"]'
      );
      if (grid && grid.children.length > 1 && grid.children.length <= 24) {
        grid.classList.add('ce-stagger');
      }

      // Flag large media wrappers for the slow hover-zoom effect.
      el.querySelectorAll('.hero, .banner, [class*="image"]').forEach(function (m) {
        if (m.querySelector('img, video')) m.classList.add('ce-zoom-frame');
      });
    });

    if (!('IntersectionObserver' in window)) {
      // No observer support: just show everything.
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
