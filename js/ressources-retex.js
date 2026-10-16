/**
 * ressources-retex.js — JS specific to the "Retours d'expérience" listing page
 * (ressources-retex.html)
 *
 * Features:
 *  1. Category filter chips  — clicking a .cat-btn hides non-matching cards
 *  2. Full-text search        — filters cards against the user's query
 *  3. "Load more" pagination  — reveals PAGE_SIZE additional cards per click
 *
 * DOM requirements:
 *  - .retex-card[data-cat="<category>"]  → individual retex cards
 *  - .cat-btn[data-cat="<category>|all"] → filter buttons
 *  - #retex-search-input                 → text search field
 *  - #retex-no-results-p                 → "no results" message paragraph
 *  - #retex-load-more-btn                → "load more" button
 *  - #retex-load-more-wrap               → wrapper that hides/shows the button
 *  - #retex-load-more-count              → text showing remaining count
 *
 * No external dependencies — vanilla JS only.
 */
(function () {
  'use strict';

  /** Number of cards visible per page / per "load more" click */
  var PAGE_SIZE = 9;

  /** How many matching cards are currently visible */
  var shownCount = PAGE_SIZE;

  /** Currently active category filter ('all' = show every category) */
  var currentFilter = 'all';

  /* ── DOM references ── */
  var searchInput   = document.getElementById('retex-search-input');
  var noResultsP    = document.getElementById('retex-no-results-p');
  var loadMoreBtn   = document.getElementById('retex-load-more-btn');
  var loadMoreWrap  = document.getElementById('retex-load-more-wrap');
  var loadMoreCount = document.getElementById('retex-load-more-count');

  /**
   * Return all .retex-card elements as an Array (live NodeList → Array).
   * @returns {Element[]}
   */
  function getCards() {
    return Array.from(document.querySelectorAll('.retex-card'));
  }

  /**
   * Return only the cards that pass both the active category filter
   * and the current search query.
   * @returns {Element[]}
   */
  function getMatching() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    return getCards().filter(function (card) {
      // Category check: show all, or only the selected category
      var catOk = currentFilter === 'all' || card.dataset.cat === currentFilter;
      if (!catOk) return false;

      // Text search check: search inside the full text content of the card
      if (!q) return true;
      return card.textContent.toLowerCase().indexOf(q) !== -1;
    });
  }

  /**
   * Refresh the cards display:
   *  - hide every card
   *  - show the first `shownCount` matching ones
   *  - update the "no results" message
   *  - update/hide the "load more" button
   */
  function render() {
    var matching = getMatching();

    // Hide all cards first
    getCards().forEach(function (c) { c.style.display = 'none'; });

    // Show the visible slice
    matching.slice(0, shownCount).forEach(function (c) { c.style.display = 'flex'; });

    // Toggle "no results" message
    if (noResultsP) noResultsP.style.display = matching.length === 0 ? 'block' : 'none';

    // Update "load more" button with the remaining count
    var remaining = matching.length - shownCount;
    if (loadMoreWrap) loadMoreWrap.style.display = remaining > 0 ? 'block' : 'none';
    if (loadMoreCount && remaining > 0) {
      loadMoreCount.textContent = remaining + ' retex supplémentaire' + (remaining > 1 ? 's' : '');
    }
  }

  /* ── Event listeners ── */

  /**
   * Category filter buttons:
   * clicking a button sets the active filter and resets pagination.
   */
  document.querySelectorAll('.cat-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Deactivate all buttons, then activate the clicked one
      document.querySelectorAll('.cat-btn').forEach(function (b) {
        b.classList.remove('is-active');
      });
      this.classList.add('is-active');

      currentFilter = this.dataset.cat;
      shownCount    = PAGE_SIZE; // Reset to first page on filter change
      render();
    });
  });

  /**
   * Text search input:
   * any change resets pagination and re-renders the grid.
   */
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      shownCount = PAGE_SIZE;
      render();
    });
  }

  /**
   * "Load more" button:
   * increases the visible count by PAGE_SIZE and re-renders.
   */
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      shownCount += PAGE_SIZE;
      render();
    });
  }

  /* Initial render on page load */
  render();

})();
