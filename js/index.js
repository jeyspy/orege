/**
 * index.js — Home page specific JavaScript
 * Observatoire de l'Eau Grand Est
 *
 * Handles:
 *  1. Animated KPI counter in the "key figures" section
 *  2. Territory search engine (hero section) with debounced autocomplete,
 *     keyboard navigation and redirect to the dashboard page
 *
 * Dependencies:
 *  - data-territoires.js  → must expose a global `TERRITOIRES` object
 *  - data-communes.js     → may dispatch a `communes:loaded` event when ready
 *
 * NOTE: This file has no jQuery dependency; it uses vanilla JS throughout.
 */

/* ============================================================
   1. KPI COUNTER ANIMATION
   Uses IntersectionObserver to start the counter only when the
   element enters the viewport (avoids wasted animation off-screen).
   ============================================================ */
(function () {
  var kpiDone = false; // Guard: run the animation only once

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !kpiDone) {
        kpiDone = true;
        var el   = document.getElementById('kpi-ind');
        var end  = 94;               // Final value to count up to
        var cur  = 0;
        var step = Math.ceil(end / 30); // Increment per tick (~30 frames)

        var t = setInterval(function () {
          cur = Math.min(cur + step, end);
          el.textContent = cur;
          if (cur >= end) clearInterval(t);
        }, 40); // ~25 fps
      }
    });
  }, { threshold: 0.5 }); // Trigger when 50 % of the element is visible

  var kpiEl = document.getElementById('kpi-ind');
  if (kpiEl) observer.observe(kpiEl);
})();


/* ============================================================
   2. TERRITORY SEARCH ENGINE (Hero section)
   Provides instant autocomplete over all territories defined in
   the TERRITOIRES global object (loaded by data-territoires.js).

   Flow:
     user types → debounce 80 ms → search() → renderDropdown()
     user clicks / presses Enter → goToTdb() → redirect

   URL format: template/tableau-de-bord.html?echelle=…&territoire=…&annee=2023
   ============================================================ */
(function () {
  'use strict';

  /** Destination URL for territory dashboards */
  var TDB_URL = 'template/tableau-de-bord.html';

  /**
   * Maps each territory scale to a Font Awesome icon class.
   * Used in the autocomplete dropdown to visually differentiate scale types.
   */
  var ECHELLE_ICONS = {
    'Grand Est':        'fa-globe',
    'Département':      'fa-map',
    'EPCI':             'fa-city',
    'Maison de Région': 'fa-building-columns',
    'Pays / PETR':      'fa-tree-city',
    'PNR':              'fa-leaf',
    'PTRTE':            'fa-people-group',
    'SAGE':             'fa-water',
    'SCoT':             'fa-drafting-compass',
    "Agence de l'eau":  'fa-droplet',
    'Commune':          'fa-house'
  };

  /** Currently highlighted row index in the dropdown (-1 = none) */
  var activeIdx = -1;
  /** Latest search results array, kept in sync with the dropdown */
  var currentResults = [];
  /** setTimeout reference for debounce */
  var debounceTimer = null;

  /**
   * Normalize a string for accent-insensitive, case-insensitive comparison.
   * @param {string} str
   * @returns {string} lowercase, diacritic-stripped, alphanumeric-only string
   */
  function normalize(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');
  }

  /**
   * Build a flat array of all territory entries from the TERRITOIRES global.
   * Each entry: { label, echelle, icon }
   * @returns {Array}
   */
  function getAllTerritoires() {
    var all = [];
    if (typeof TERRITOIRES === 'undefined') return all;
    Object.keys(TERRITOIRES).forEach(function (echelle) {
      var icon = ECHELLE_ICONS[echelle] || 'fa-location-dot';
      (TERRITOIRES[echelle] || []).forEach(function (nom) {
        all.push({ label: nom, echelle: echelle, icon: icon });
      });
    });
    return all;
  }

  /**
   * Search territories by keyword(s).
   * All words must appear in the territory label (AND logic).
   * Results starting with the full query are sorted first.
   * @param {string} query
   * @returns {Array} up to 30 matching territory objects
   */
  function search(query) {
    if (!query.trim()) return [];
    var words  = normalize(query).split(/\s+/).filter(Boolean);
    var normQ  = normalize(query);

    var results = getAllTerritoires().filter(function (t) {
      var norm = normalize(t.label);
      return words.every(function (w) { return norm.indexOf(w) !== -1; });
    });

    // Sort: exact prefix matches first, then alphabetical
    results.sort(function (a, b) {
      var aN = normalize(a.label), bN = normalize(b.label);
      var aS = aN.indexOf(normQ) === 0;
      var bS = bN.indexOf(normQ) === 0;
      if (aS && !bS) return -1;
      if (!aS && bS) return 1;
      return a.label.localeCompare(b.label, 'fr');
    });
    return results.slice(0, 30);
  }

  /**
   * Wrap the matched portion of a label in a <mark> tag.
   * @param {string} label   Full territory label
   * @param {string} query   User's current input
   * @returns {string} HTML string with highlights
   */
  function highlight(label, query) {
    if (!query.trim()) return label;
    var esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return label.replace(new RegExp('(' + esc + ')', 'gi'), '<mark>$1</mark>');
    } catch (e) {
      return label; // Fallback: no highlight if regex fails
    }
  }

  /**
   * Navigate to the territory dashboard page.
   * @param {string} echelle   Territory scale key (e.g. "Département")
   * @param {string} val       Territory name (e.g. "Moselle (57)")
   */
  function goToTdb(echelle, val) {
    window.location.href = TDB_URL
      + '?echelle='    + encodeURIComponent(echelle)
      + '&territoire=' + encodeURIComponent(val)
      + '&annee=2023';
  }

  /**
   * Build and display the dropdown list from current search results.
   * Each list item binds a mousedown listener to navigate on click.
   * @param {string} query   Current input value
   */
  function renderDropdown(query) {
    var $dd    = document.getElementById('hero-search-dropdown');
    var results = search(query);
    currentResults = results;
    activeIdx      = -1;

    if (!results.length) {
      $dd.innerHTML = '<li class="hero__search-empty"><i class="ph ph-info"></i> Aucun territoire trouvé</li>';
      $dd.classList.add('is-open');
      return;
    }

    $dd.innerHTML = results.map(function (t, i) {
      return '<li class="hero__search-result" role="option" data-idx="' + i + '">'
        + '<span class="hero__search-result-icon"><i class="fa ' + t.icon + '" aria-hidden="true"></i></span>'
        + '<span class="hero__search-result-body">'
        +   '<span class="hero__search-result-label">' + highlight(t.label, query) + '</span>'
        +   '<span class="hero__search-result-echelle">' + t.echelle + '</span>'
        + '</span>'
        + '<i class="ph ph-arrow-right hero__search-result-arrow" aria-hidden="true"></i>'
        + '</li>';
    }).join('');
    $dd.classList.add('is-open');

    // Bind click handlers on each result row
    $dd.querySelectorAll('.hero__search-result').forEach(function (el) {
      el.addEventListener('mousedown', function (e) {
        e.preventDefault(); // Prevent input blur before navigation
        var idx = parseInt(el.dataset.idx, 10);
        var t   = currentResults[idx];
        if (t) goToTdb(t.echelle, t.label);
      });
    });
  }

  /** Close the dropdown and reset keyboard selection */
  function closeDropdown() {
    var $dd = document.getElementById('hero-search-dropdown');
    if ($dd) $dd.classList.remove('is-open');
    activeIdx = -1;
  }

  /**
   * Highlight the dropdown row at the given index and scroll it into view.
   * @param {number} idx
   */
  function setActive(idx) {
    var items = document.querySelectorAll('#hero-search-dropdown .hero__search-result');
    items.forEach(function (el) { el.classList.remove('is-active'); });
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('is-active');
      items[idx].scrollIntoView({ block: 'nearest' });
    }
  }

  /* ── Event binding once DOM is ready ── */
  document.addEventListener('DOMContentLoaded', function () {
    var input  = document.getElementById('hero-search-input');
    var clear  = document.getElementById('hero-search-clear');
    var submit = document.getElementById('hero-search-submit');
    if (!input) return; // Guard: only run on pages that have the search widget

    /* Typing: debounce to avoid searching on every keystroke */
    input.addEventListener('input', function () {
      var q = input.value;
      clear.style.display = q ? 'flex' : 'none';
      clearTimeout(debounceTimer);
      if (!q.trim()) { closeDropdown(); return; }
      debounceTimer = setTimeout(function () { renderDropdown(q); }, 80);
    });

    /* Keyboard navigation: ArrowDown / ArrowUp / Enter / Escape */
    input.addEventListener('keydown', function (e) {
      var items = document.querySelectorAll('#hero-search-dropdown .hero__search-result');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, items.length - 1);
        setActive(activeIdx);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        setActive(activeIdx);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIdx >= 0 && currentResults[activeIdx]) {
          goToTdb(currentResults[activeIdx].echelle, currentResults[activeIdx].label);
        } else if (currentResults.length > 0) {
          // No row highlighted: navigate to the first result
          goToTdb(currentResults[0].echelle, currentResults[0].label);
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
        input.blur();
      }
    });

    /* Close dropdown when clicking outside the search widget */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.hero__search')) closeDropdown();
    });

    /* Clear button: wipe input and close dropdown */
    clear.addEventListener('click', function () {
      input.value = '';
      clear.style.display = 'none';
      closeDropdown();
      input.focus();
    });

    /* Submit button: navigate to the first match if any */
    submit.addEventListener('click', function () {
      var q = input.value.trim();
      if (!q) { input.focus(); return; }
      if (currentResults.length > 0) {
        goToTdb(currentResults[0].echelle, currentResults[0].label);
      }
    });

    /**
     * Re-run the current query after communes data has finished loading.
     * communes:loaded is dispatched by data-communes.js once the larger
     * communes dataset has been asynchronously parsed.
     */
    document.addEventListener('communes:loaded', function () {
      if (input.value.trim()) renderDropdown(input.value);
    });
  });
})();
