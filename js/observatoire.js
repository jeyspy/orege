/**
 * observatoire.js — JS specific to the "Présentation de l'Observatoire" page
 * (observatoire.html)
 *
 * Responsibility:
 *   Implements a sticky Table of Contents (ToC) that highlights the
 *   currently visible section as the user scrolls — identical logic
 *   to profil-page.js but kept as a standalone file for page autonomy.
 *
 * How it works:
 *   1. Reads all <li> in .article-toc__list and resolves their section targets.
 *   2. On each scroll event, determines which section is "in view" by comparing
 *      each section's offsetTop against scrollY + 120 px (sticky nav height).
 *   3. Applies the CSS class `is-active` to the matching ToC item.
 *
 * CSS companion: css/pages.css (.article-toc__list li.is-active)
 *
 * No external dependencies — vanilla JS only.
 */
(function () {
  'use strict';

  /* Map ToC list items to their corresponding section elements */
  var tocItems = Array.from(document.querySelectorAll('.article-toc__list li'));
  var sections = tocItems.map(function (li) {
    var a    = li.querySelector('a');
    var href = a && a.getAttribute('href');
    return href ? document.querySelector(href) : null;
  });

  /**
   * Determine which section is currently in view and apply `is-active`
   * to the matching ToC item.
   * The 120 px offset accounts for the fixed navigation bar height.
   */
  function updateToc() {
    var scrollY  = window.scrollY + 120;
    var current  = 0; // Default: first section

    sections.forEach(function (sec, i) {
      if (sec && sec.offsetTop <= scrollY) current = i;
    });

    tocItems.forEach(function (li, i) {
      li.classList.toggle('is-active', i === current);
    });
  }

  /* Attach scroll listener (passive for performance) and initialise */
  window.addEventListener('scroll', updateToc, { passive: true });
  updateToc();
})();
