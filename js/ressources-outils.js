/* ============================================================
   js/ressources-outils.js
   Page-specific JavaScript for ressources-outils.html
   (Tools & useful links — search, category filters, load more)

   Responsibilities:
     1. getMatchingCards()  — filter tool cards by active category + search query
     2. applyFilters()      — reset pagination and trigger render
     3. render()            — show/hide cards and sections, update load-more
     4. Load more button    — progressive disclosure (PAGE_SIZE = 6)
     5. Category filters    — toggle active state, reset search
     6. Text search         — keyword search across name, description, data-keywords

   Dependencies:
     - nav.js   (site navigation)
     - a11y.js  (RGAA accessibility patches)
     - css/ressources-outils.css (page-specific styles)
============================================================ */
(function() {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. STATE VARIABLES
  ──────────────────────────────────────────────────────────── */
  var searchInput   = document.getElementById('outils-search');
  var noResults     = document.getElementById('no-results');
  var loadMoreBtn   = document.getElementById('outils-load-more-btn');
  var loadMoreWrap  = document.getElementById('outils-load-more-wrap');
  var loadMoreCount = document.getElementById('outils-load-more-count');

  var currentFilter = 'all'; /* currently selected category filter */
  var PAGE_SIZE     = 6;     /* cards revealed per "load more" click */
  var shownCount    = PAGE_SIZE;

  /* ────────────────────────────────────────────────────────────
     2. FILTERING — returns all matching .outil-card nodes
     Respects both the active category filter (matched against
     the parent .cat-section[data-category]) and the search
     query (checked against name, description and data-keywords).
  ──────────────────────────────────────────────────────────── */
  function getMatchingCards() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';

    /* Walk every category section and collect matching cards */
    return Array.from(document.querySelectorAll('.cat-section')).reduce(function(acc, sec) {
      /* Skip sections that don't match the active category filter */
      if (currentFilter !== 'all' && sec.dataset.category !== currentFilter) return acc;

      sec.querySelectorAll('.outil-card').forEach(function(card) {
        var name = card.querySelector('.outil-card__name').textContent.toLowerCase();
        var desc = card.querySelector('.outil-card__desc').textContent.toLowerCase();
        var kw   = (card.dataset.keywords || '').toLowerCase();
        /* Include card if no query, or if query matches name / desc / keywords */
        if (!q || name.indexOf(q) !== -1 || desc.indexOf(q) !== -1 || kw.indexOf(q) !== -1) {
          acc.push(card);
        }
      });
      return acc;
    }, []);
  }

  /* Reset pagination counter and trigger a fresh render */
  function applyFilters() {
    shownCount = PAGE_SIZE;
    render();
  }

  /* ────────────────────────────────────────────────────────────
     3. RENDER — show/hide cards + sections + load-more state
  ──────────────────────────────────────────────────────────── */
  function render() {
    var matching = getMatchingCards();
    var sections = document.querySelectorAll('.cat-section');

    /* Hide all cards first */
    document.querySelectorAll('.outil-card').forEach(function(c) {
      c.style.display = 'none';
    });

    /* Show the first shownCount matching cards */
    matching.slice(0, shownCount).forEach(function(c) {
      c.style.display = '';
    });

    /* Show/hide category sections based on whether they contain visible cards */
    sections.forEach(function(sec) {
      var cat      = sec.dataset.category;
      var catMatch = currentFilter === 'all' || cat === currentFilter;
      if (!catMatch) { sec.style.display = 'none'; return; }
      /* Count cards that are not hidden in this section */
      var visible = sec.querySelectorAll('.outil-card:not([style*="none"])').length;
      sec.style.display = visible ? '' : 'none';
    });

    /* "No results" message */
    noResults.style.display = matching.length === 0 ? 'block' : 'none';

    /* Load-more button state */
    var remaining = matching.length - shownCount;
    if (remaining > 0) {
      /* More cards to reveal */
      loadMoreWrap.style.display = 'block';
      loadMoreBtn.disabled       = false;
      loadMoreCount.textContent  =
        remaining + ' outil' + (remaining > 1 ? 's' : '') +
        ' supplémentaire' + (remaining > 1 ? 's' : '') + ' à afficher';
    } else {
      /* All matching cards are visible */
      loadMoreWrap.style.display = matching.length > PAGE_SIZE ? 'block' : 'none';
      loadMoreBtn.disabled       = true;
      loadMoreBtn.innerHTML      = '<i class="ph ph-check" aria-hidden="true"></i> Tous les outils sont affichés';
      loadMoreCount.textContent  = '';
    }
  }

  /* ────────────────────────────────────────────────────────────
     4. LOAD MORE BUTTON
     Increases shownCount and gently scrolls to the last new card.
  ──────────────────────────────────────────────────────────── */
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      shownCount += PAGE_SIZE;
      render();
      /* Scroll the last visible card into view */
      var allVisible = document.querySelectorAll('.outil-card:not([style*="none"])');
      if (allVisible.length) {
        allVisible[allVisible.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* ────────────────────────────────────────────────────────────
     5. CATEGORY FILTER BUTTONS
     Toggle the active state and re-apply filters.
  ──────────────────────────────────────────────────────────── */
  document.querySelectorAll('.outils-filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      /* Remove active class from all filter buttons */
      document.querySelectorAll('.outils-filter-btn').forEach(function(b) {
        b.classList.remove('is-active');
      });
      /* Set active class on the clicked button */
      this.classList.add('is-active');
      currentFilter = this.dataset.filter;
      /* Clear search input and reset load-more button label */
      if (searchInput) searchInput.value = '';
      loadMoreBtn.innerHTML = '<i class="ph ph-plus" aria-hidden="true"></i> Charger plus d\'outils';
      applyFilters();
    });
  });

  /* ────────────────────────────────────────────────────────────
     6. TEXT SEARCH
     On each keystroke, reset to "all" categories and re-render.
  ──────────────────────────────────────────────────────────── */
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      /* Reset category filter to "all" while the user is typing */
      if (currentFilter !== 'all') {
        currentFilter = 'all';
        document.querySelectorAll('.outils-filter-btn').forEach(function(b) {
          b.classList.toggle('is-active', b.dataset.filter === 'all');
        });
      }
      /* Reset load-more button label */
      loadMoreBtn.innerHTML = '<i class="ph ph-plus" aria-hidden="true"></i> Charger plus d\'outils';
      applyFilters();
    });
  }

  /* Initial render on page load */
  render();

})();
