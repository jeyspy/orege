/* ============================================================
   js/faq.js
   Page-specific JavaScript for faq.html
   (FAQ — accordéon, filtres catégories, recherche, load-more)

   Responsabilités :
     1. Accordéon           — ouverture/fermeture des réponses (aria-expanded)
     2. getMatchingItems()  — filtrer les items par catégorie + recherche texte
     3. applyFilters()      — reset pagination et déclencher render()
     4. render()            — afficher/masquer items et sections, gérer load-more
     5. Filtres boutons     — toggle actif + reset recherche
     6. Recherche texte     — recherche dans question, réponse, data-keywords

   Dépendances :
     - nav.js   (navigation principale)
     - a11y.js  (correctifs RGAA)
     - css/faq.css (styles de la page)
============================================================ */
(function() {
  'use strict';

  /* ── Accordéon FAQ ── */
  document.querySelectorAll('.faq-item__question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      var target = document.getElementById(this.getAttribute('aria-controls'));
      if (!target) return;
      this.setAttribute('aria-expanded', !expanded);
      target.classList.toggle('is-open', !expanded);
    });
  });

  /* ── État filtre / recherche ── */
  var currentFilter = 'all';
  var searchInput   = document.getElementById('faq-search-input');
  var noResults     = document.getElementById('faq-no-results');
  var loadMoreBtn   = document.getElementById('faq-load-more-btn');
  var loadMoreWrap  = document.getElementById('faq-load-more-wrap');
  var loadMoreCount = document.getElementById('faq-load-more-count');
  var PAGE_SIZE     = 5;
  var shownCount    = PAGE_SIZE;

  function getMatchingItems() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var all = [];
    document.querySelectorAll('.faq-section-wrap').forEach(function(sec) {
      var cat = sec.dataset.category;
      if (currentFilter !== 'all' && cat !== currentFilter) return;
      sec.querySelectorAll('.faq-item').forEach(function(item) {
        var question = item.querySelector('.faq-item__question').textContent.toLowerCase();
        var answer   = item.querySelector('.faq-item__answer').textContent.toLowerCase();
        var keywords = (item.dataset.keywords || '').toLowerCase();
        if (!q || question.indexOf(q) !== -1 || answer.indexOf(q) !== -1 || keywords.indexOf(q) !== -1) {
          all.push(item);
        }
      });
    });
    return all;
  }

  function applyFilters() { shownCount = PAGE_SIZE; render(); }

  function render() {
    var matching = getMatchingItems();
    document.querySelectorAll('.faq-item').forEach(function(i) { i.style.display = 'none'; });
    matching.slice(0, shownCount).forEach(function(i) { i.style.display = ''; });

    document.querySelectorAll('.faq-section-wrap').forEach(function(sec) {
      var cat = sec.dataset.category;
      var catMatch = currentFilter === 'all' || cat === currentFilter;
      if (!catMatch) { sec.style.display = 'none'; return; }
      var visible = sec.querySelectorAll('.faq-item:not([style*="none"])').length;
      sec.style.display = visible ? '' : 'none';
    });

    noResults.style.display = matching.length === 0 ? 'block' : 'none';

    var remaining = matching.length - shownCount;
    if (remaining > 0) {
      loadMoreWrap.style.display = 'block';
      loadMoreBtn.disabled = false;
      loadMoreBtn.innerHTML = '<i class="ph ph-plus" aria-hidden="true"></i> Charger plus de questions';
      loadMoreCount.textContent = remaining + ' question' + (remaining > 1 ? 's' : '') + ' supplémentaire' + (remaining > 1 ? 's' : '') + ' à afficher';
    } else {
      loadMoreWrap.style.display = matching.length > PAGE_SIZE ? 'block' : 'none';
      loadMoreBtn.disabled = true;
      loadMoreBtn.innerHTML = '<i class="ph ph-check" aria-hidden="true"></i> Toutes les questions sont affichées';
      loadMoreCount.textContent = '';
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      shownCount += PAGE_SIZE;
      render();
    });
  }

  /* Filtres boutons */
  function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.faq-filter-btn').forEach(function(b) {
      b.classList.toggle('is-active', b.dataset.filter === filter);
    });
    if (searchInput) searchInput.value = '';
    applyFilters();
  }

  document.querySelectorAll('.faq-filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { setFilter(this.dataset.filter); });
  });

  /* Recherche */
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (currentFilter !== 'all') {
        currentFilter = 'all';
        document.querySelectorAll('.faq-filter-btn').forEach(function(b) {
          b.classList.toggle('is-active', b.dataset.filter === 'all');
        });
      }
      applyFilters();
    });
  }

  render();

})();
