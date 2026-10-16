/**
 * je-suis-elu.js — JS specific to the "Je suis élu / décideur" page
 * (je-suis-elu.html)
 *
 * NOTE: This file is now a thin alias for the shared profil-page.js logic.
 * It is kept as a separate file so each profile page can add its own
 * page-specific behaviour below the ToC section in the future without
 * modifying the shared script.
 *
 * Responsibility:
 *   Implements a sticky Table of Contents (ToC) that highlights the
 *   currently visible section as the user scrolls.
 *
 * How it works:
 *   1. Reads all <li> in .article-toc__list and resolves their section targets.
 *   2. On each scroll event, finds the last section whose offsetTop is at or
 *      above the current scroll position (+ 120 px for the sticky nav bar).
 *   3. Applies the CSS class `is-active` to the corresponding ToC item.
 *
 * CSS companion: css/profil-page.css (.article-toc__list li.is-active)
 *
 * No external dependencies — vanilla JS only.
 */
(function () {
  'use strict';

  /* Map ToC list items to their corresponding section elements */
  var tocItems = document.querySelectorAll('.article-toc__list li');
  var sections = [];

  tocItems.forEach(function (li) {
    var a = li.querySelector('a');
    if (a) {
      var id = a.getAttribute('href').replace('#', '');
      var el = document.getElementById(id);
      if (el) sections.push({ li: li, el: el });
    }
  });

  /**
   * Scroll handler: applies `is-active` to the ToC item matching
   * the section currently in view.
   * The 120 px offset matches the fixed navigation bar height.
   */
  function onScroll() {
    var scrollY = window.scrollY + 120;
    var current = sections[0]; // Default: first section

    sections.forEach(function (s) {
      if (s.el.offsetTop <= scrollY) current = s;
    });

    tocItems.forEach(function (li) { li.classList.remove('is-active'); });
    if (current) current.li.classList.add('is-active');
  }

  /* Attach scroll listener (passive for better performance) and initialise */
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
