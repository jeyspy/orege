/* ============================================================
   js/ressources-docs.js
   Page-specific JavaScript for ressources-docs.html
   (Documentary database — search, category filters, load more,
    download modal)

   Responsibilities:
     1. Filtering logic  — filter document rows by category / file type
     2. Search           — keyword search across title, category, data-keywords
     3. Render           — show/hide rows + update load-more button
     4. Load more        — progressive disclosure (PAGE_SIZE = 6)
     5. Download modal   — intercepts download clicks and shows an
                           "unavailable" info-modal for placeholder links

   Dependencies:
     - nav.js   (site navigation)
     - a11y.js  (RGAA accessibility patches)
     - css/ressources-docs.css (page-specific styles)
============================================================ */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. STATE VARIABLES
  ──────────────────────────────────────────────────────────── */
  var PAGE_SIZE   = 6;   /* number of documents shown per "load more" step */
  var shownCount  = PAGE_SIZE;
  var activeCat   = 'all'; /* active category filter value  */
  var activeType  = 'all'; /* active file-type filter value */

  /* Cached DOM references */
  var searchInput   = document.getElementById('docs-search-input');
  var noResults     = document.getElementById('docs-no-results');
  var loadMoreBtn   = document.getElementById('docs-load-more-btn');
  var loadMoreWrap  = document.getElementById('docs-load-more-wrap');
  var loadMoreCount = document.getElementById('docs-load-more-count');

  /* ────────────────────────────────────────────────────────────
     2. FILTERING — returns an array of matching .doc-item nodes
     Combines the active category filter, file-type filter and
     the current search query (case-insensitive, checks title,
     category text and the data-keywords attribute).
  ──────────────────────────────────────────────────────────── */
  function getMatchingDocs() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    return Array.from(document.querySelectorAll('.doc-item')).filter(function (doc) {
      /* Category and type must match the active filter */
      var catMatch  = activeCat  === 'all' || doc.dataset.cat  === activeCat;
      var typeMatch = activeType === 'all' || doc.dataset.type === activeType;
      if (!catMatch || !typeMatch) return false;
      /* If there is a search query, check title + category text + keywords */
      if (!q) return true;
      var title = (doc.querySelector('.doc-item__title') || {}).textContent || '';
      var cat   = (doc.querySelector('.doc-item__cat')   || {}).textContent || '';
      var kw    = doc.dataset.keywords || '';
      return (title + ' ' + cat + ' ' + kw).toLowerCase().indexOf(q) !== -1;
    });
  }

  /* Reset pagination counter and re-enable the load-more button */
  function resetLoadMore() {
    shownCount = PAGE_SIZE;
    if (loadMoreBtn) {
      loadMoreBtn.disabled  = false;
      loadMoreBtn.innerHTML = '<i class="ph ph-plus" aria-hidden="true"></i> Charger plus de documents';
    }
  }

  /* ────────────────────────────────────────────────────────────
     3. RENDER — shows the first N matching rows, hides the rest,
     updates the no-results message and the load-more button state.
  ──────────────────────────────────────────────────────────── */
  function render() {
    var matching = getMatchingDocs();

    /* Hide all document rows */
    document.querySelectorAll('.doc-item').forEach(function (d) {
      d.style.display = 'none';
    });

    /* Show the first shownCount matching rows */
    matching.slice(0, shownCount).forEach(function (d) {
      d.style.display = '';
    });

    /* Show "no results" message when the filter/search returns nothing */
    noResults.style.display = matching.length === 0 ? 'flex' : 'none';

    /* Update the load-more button state */
    var remaining = matching.length - shownCount;
    if (remaining > 0) {
      /* More documents available */
      loadMoreWrap.style.display  = 'block';
      loadMoreBtn.disabled        = false;
      loadMoreBtn.innerHTML       = '<i class="ph ph-plus" aria-hidden="true"></i> Charger plus de documents';
      loadMoreCount.textContent   =
        remaining + ' document' + (remaining > 1 ? 's' : '') +
        ' supplémentaire' + (remaining > 1 ? 's' : '') + ' à afficher';
    } else {
      /* All documents are visible */
      loadMoreWrap.style.display  = matching.length > PAGE_SIZE ? 'block' : 'none';
      loadMoreBtn.disabled        = true;
      loadMoreBtn.innerHTML       = '<i class="ph ph-check" aria-hidden="true"></i> Tous les documents sont affichés';
      loadMoreCount.textContent   = '';
    }
  }

  /* ────────────────────────────────────────────────────────────
     4. FILTER BUTTONS
     Each button carries data-group (cat | type) and data-filter
     attributes. Clicking updates the active filter, clears the
     search and re-renders.
  ──────────────────────────────────────────────────────────── */
  document.querySelectorAll('.doc-filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group  = this.dataset.group;
      var filter = this.dataset.filter;

      /* Update is-active class within the same group */
      document.querySelectorAll('.doc-filter-btn[data-group="' + group + '"]').forEach(function (b) {
        b.classList.remove('is-active');
      });
      this.classList.add('is-active');

      /* Update the relevant state variable */
      if (group === 'cat')  activeCat  = filter;
      if (group === 'type') activeType = filter;

      /* Clear search and reset pagination */
      if (searchInput) searchInput.value = '';
      resetLoadMore();
      render();
    });
  });

  /* ────────────────────────────────────────────────────────────
     5. SEARCH INPUT
     On each keystroke, reset to "all" categories and re-render.
  ──────────────────────────────────────────────────────────── */
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      /* Reset category filter to "all" when the user types */
      if (activeCat !== 'all') {
        activeCat = 'all';
        document.querySelectorAll('.doc-filter-btn[data-group="cat"]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.filter === 'all');
        });
      }
      /* Reset file-type filter to "all" when the user types */
      if (activeType !== 'all') {
        activeType = 'all';
        document.querySelectorAll('.doc-filter-btn[data-group="type"]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.filter === 'all');
        });
      }
      resetLoadMore();
      render();
    });
  }

  /* ────────────────────────────────────────────────────────────
     6. LOAD MORE BUTTON
     Increases shownCount and scrolls the last newly visible item
     into view.
  ──────────────────────────────────────────────────────────── */
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      shownCount += PAGE_SIZE;
      render();
      /* Scroll the last visible item gently into view */
      var allVisible = document.querySelectorAll('.doc-item:not([style*="none"])');
      if (allVisible.length) {
        allVisible[allVisible.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* Initial render */
  render();

  /* ────────────────────────────────────────────────────────────
     7. DOWNLOAD MODAL
     All "Télécharger" links point to "#" in prototype mode.
     Clicking one opens a modal explaining that the file is not
     yet available and offering a contact link.

     The modal HTML + styles are injected dynamically so this
     script remains self-contained.
  ──────────────────────────────────────────────────────────── */

  /* Create modal DOM element */
  var modal = document.createElement('div');
  modal.id  = 'dl-modal';
  modal.innerHTML =
    '<div id="dl-modal-box">' +
      '<button id="dl-modal-close" aria-label="Fermer">&times;</button>' +
      '<div id="dl-modal-icon"><i class="ph ph-info"></i></div>' +
      '<p id="dl-modal-title"></p>' +
      '<p id="dl-modal-msg">Ce document n\'est pas encore disponible en téléchargement.<br>Contactez-nous pour en faire la demande.</p>' +
      '<a id="dl-modal-contact" href="mailto:contact@observatoire-eau-grandest.fr">' +
        '<i class="ph ph-envelope"></i> Faire une demande' +
      '</a>' +
    '</div>';
  document.body.appendChild(modal);

  /* Inject modal styles as a <style> element so the modal is fully standalone */
  var mStyle = document.createElement('style');
  mStyle.textContent =
    /* Backdrop */
    '#dl-modal{display:none;position:fixed;inset:0;background:rgba(42,52,125,.35);z-index:9999;align-items:center;justify-content:center;}' +
    '#dl-modal.is-open{display:flex;}' +
    /* Modal box */
    '#dl-modal-box{background:#fff;max-width:420px;width:90%;padding:36px 32px 28px;position:relative;border-top:4px solid #7fddf0;}' +
    /* Close button */
    '#dl-modal-close{position:absolute;top:12px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:rgba(42,52,125,.5);line-height:1;}' +
    '#dl-modal-close:hover{color:#2a347d;}' +
    /* Content */
    '#dl-modal-icon{font-size:32px;color:#2a347d;margin-bottom:14px;}' +
    '#dl-modal-title{font-family:"Cabinet Grotesk",sans-serif;font-size:15px;font-weight:800;color:#1d1d1b;margin:0 0 10px;line-height:1.4;}' +
    '#dl-modal-msg{font-size:13px;color:rgba(42,52,125,.65);margin:0 0 20px;line-height:1.6;}' +
    '#dl-modal-contact{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:#7fddf0;color:#2a347d;font-size:12px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:.3px;}' +
    '#dl-modal-contact:hover{background:#2a347d;color:#fff;}';
  document.head.appendChild(mStyle);

  /* Cache modal elements */
  var modalTitleEl = document.getElementById('dl-modal-title');
  var dlModal      = document.getElementById('dl-modal');
  var dlModalClose = document.getElementById('dl-modal-close');

  /** Open the download modal and set the document title */
  function openDlModal(docTitle) {
    modalTitleEl.textContent = docTitle || 'Document non disponible';
    dlModal.classList.add('is-open');
    dlModalClose.focus(); /* keyboard-accessible */
  }

  /** Close the download modal */
  function closeDlModal() {
    dlModal.classList.remove('is-open');
  }

  /* Close via the X button */
  dlModalClose.addEventListener('click', closeDlModal);

  /* Close when clicking the backdrop (outside the modal box) */
  dlModal.addEventListener('click', function (e) {
    if (e.target === dlModal) closeDlModal();
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDlModal();
  });

  /* Event delegation on the document grid — catches all download links */
  document.getElementById('docs-grid').addEventListener('click', function (e) {
    var link = e.target.closest('a.doc-item__link');
    if (!link) return;
    e.preventDefault();
    var href = link.getAttribute('href');
    if (!href || href === '#') {
      /* Placeholder link — show modal */
      var item  = link.closest('.doc-item');
      var title = item ? (item.querySelector('.doc-item__title') || {}).textContent : '';
      openDlModal(title);
    } else {
      /* Real file URL — open in a new tab */
      window.open(href, '_blank', 'noopener');
    }
  });

  /* Same logic for the featured-cards "Télécharger" links */
  var featuredGrid = document.querySelector('.docs-featured__grid');
  if (featuredGrid) {
    featuredGrid.addEventListener('click', function (e) {
      var link = e.target.closest('a.doc-featured-card__link');
      if (!link) return;
      e.preventDefault();
      var href = link.getAttribute('href');
      if (!href || href === '#') {
        var card  = link.closest('.doc-featured-card');
        var title = card ? (card.querySelector('.doc-featured-card__title') || {}).textContent : '';
        openDlModal(title);
      } else {
        window.open(href, '_blank', 'noopener');
      }
    });
  }

})();
