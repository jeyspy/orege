/**
 * profil-page.js — Shared script for all "Je suis…" profile pages
 * (je-suis-elu.html, je-suis-specialiste.html, je-suis-habitant.html,
 *  ressources-dispositifs.html and any future profile-style content page)
 *
 * Responsibility:
 *   Implements a sticky Table of Contents (ToC) that highlights the
 *   currently visible section as the user scrolls.
 *
 * How it works:
 *   1. Reads all <li> elements inside .article-toc__list.
 *   2. For each <li>, resolves the matching page section via the href="#id".
 *   3. On scroll, finds the section whose offsetTop is closest to (but not
 *      above) the current scroll position + a top offset to account for the
 *      sticky navigation bar (~120 px).
 *   4. Adds the CSS class `is-active` to the matching <li>.
 *
 * CSS companion: css/profil-page.css (.article-toc__list li.is-active)
 *
 * No dependencies — vanilla JS, no jQuery required.
 */
(function () {
  'use strict';

  /* Collect all ToC list items and their corresponding section elements */
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
   * Update the active ToC item based on the current scroll position.
   * The section whose top edge is closest to (scrollY + 120 px) is
   * considered "active".  The 120 px offset matches the sticky navbar height.
   */
  function onScroll() {
    var scrollY  = window.scrollY + 120;
    var current  = sections[0]; // Default to first section

    sections.forEach(function (s) {
      if (s.el.offsetTop <= scrollY) current = s;
    });

    // Remove active class from all items, then set on the current one
    tocItems.forEach(function (li) { li.classList.remove('is-active'); });
    if (current) current.li.classList.add('is-active');
  }

  /* Attach scroll listener (passive for better performance) and run once */
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initialise on page load without waiting for a scroll event
})();
