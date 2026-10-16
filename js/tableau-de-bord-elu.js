/**
 * tableau-de-bord-elu.js
 * ═══════════════════════════════════════════════════════════════════════
 * Moteur de rendu du Tableau de bord Élu
 * - Gère les 5 sections thématiques (onglets navigation)
 * - Moteur à facettes 3 niveaux (Exposition / Catégorie / Sous-catégorie)
 * - Rend 3 types de tuiles par indicateur : Chiffre clé, Graphique, Cartographie
 * - Utilise Chart.js pour les graphiques (donut + histogramme)
 * ═══════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ── Références DOM ──────────────────────────────────────────────────
  var navContainer, contentContainer;
  var activeSection = null;
  var activeFacets = { categorie: null, sousCategorie: null };
  var chartInstances = []; // pour détruire les Chart.js avant re-rendu

  // ── Mode comparaison ──────────────────────────────────────────────
  var compareMode = false;
  var compareTerritoire = null; // { nom: string, echelle: string }

  // ── Initialisation ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    navContainer = document.getElementById('tdb-elu-nav');
    contentContainer = document.getElementById('tdb-elu-content');

    if (!navContainer || !contentContainer) {
      console.warn('[TDB-ELU] Conteneurs nav/content introuvables');
      return;
    }

    renderNav();
    // Activer la première section (Fiche d'identité)
    activateSection(SECTIONS_ELU[0].id);

    // Initialiser les sélecteurs Échelle + Territoire
    initialiserSelecteursElu();
  });

  // ══════════════════════════════════════════════════════════════════════
  // SÉLECTEURS ÉCHELLE + TERRITOIRE (identique au TdB principal)
  // ══════════════════════════════════════════════════════════════════════

  var eluEchelle = 'Grand Est';
  var eluTerritoire = 'Tout le territoire Grand Est';

  function initialiserSelecteursElu() {
    if (typeof TERRITOIRES === 'undefined') {
      console.warn('[TDB-ELU] TERRITOIRES non disponible');
      return;
    }

    // ── Sélecteur Échelle ──
    var selEchelle = document.getElementById('tdb-elu-select-echelle');
    if (!selEchelle) return;
    selEchelle.innerHTML = '';

    var echelles = Object.keys(TERRITOIRES);
    echelles.forEach(function(e) {
      var opt = document.createElement('option');
      opt.value = e;
      opt.textContent = e;
      if (e === 'Commune' && TERRITOIRES[e].length === 0) {
        opt.textContent = 'Commune (chargement…)';
      }
      selEchelle.appendChild(opt);
    });
    selEchelle.value = eluEchelle;

    selEchelle.addEventListener('change', function() {
      eluEchelle = this.value;
      remplirSelectEluTerritoire(eluEchelle);
      // Reset le champ de recherche
      if (searchInput) {
        searchInput.value = '';
        searchInput.placeholder = 'Rechercher dans ' + eluEchelle + '…';
        if (clearBtn) clearBtn.style.display = 'none';
        fermerSuggestions();
      }
      majTitreElu();
    });

    // ── Sélecteur territoire (caché) ──
    remplirSelectEluTerritoire(eluEchelle);

    var selTerritoire = document.getElementById('tdb-elu-select-territoire');
    if (selTerritoire) {
      selTerritoire.addEventListener('change', function() {
        eluTerritoire = this.value;
        majTitreElu();
      });
    }

    // ── Champ de recherche avec autocomplétion ──
    var searchInput = document.getElementById('tdb-elu-territoire-search');
    var clearBtn = document.getElementById('tdb-elu-search-clear');
    var sugList = document.getElementById('tdb-elu-territoire-suggestions');
    if (!searchInput || !sugList) return;

    var debounceTimer = null;

    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      var q = this.value.trim();
      clearBtn.style.display = q ? '' : 'none';
      if (q.length < 2) {
        fermerSuggestions();
        return;
      }
      debounceTimer = setTimeout(function() {
        afficherSuggestions(q);
      }, 200);
    });

    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        fermerSuggestions();
        searchInput.blur();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        var first = sugList.querySelector('li');
        if (first) first.focus();
      }
    });

    searchInput.addEventListener('focus', function() {
      var q = this.value.trim();
      if (q.length >= 2) {
        afficherSuggestions(q);
      } else {
        // Afficher les premiers territoires de l'échelle courante
        afficherSuggestionsEchelle();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        fermerSuggestions();
        searchInput.focus();
      });
    }

    // Fermer suggestions au clic extérieur
    document.addEventListener('click', function(e) {
      var wrap = document.getElementById('tdb-elu-search-wrap');
      if (wrap && !wrap.contains(e.target)) {
        fermerSuggestions();
      }
    });

    // Quand les communes sont chargées
    document.addEventListener('communes:loaded', function(evt) {
      var count = evt.detail && evt.detail.count ? evt.detail.count : 0;
      var opt = selEchelle.querySelector('option[value="Commune"]');
      if (opt) opt.textContent = 'Commune (' + count + ')';
      if (eluEchelle === 'Commune') {
        remplirSelectEluTerritoire('Commune');
      }
    });

    function afficherSuggestionsEchelle() {
      var items = TERRITOIRES[eluEchelle] || [];
      if (items.length === 0) {
        sugList.innerHTML = '<li class="tdb-territoire-suggestions__empty">Aucun territoire chargé pour cette échelle</li>';
        sugList.style.display = 'block';
        searchInput.setAttribute('aria-expanded', 'true');
        return;
      }
      var resultats = items.slice(0, 12).map(function(nom) {
        return { nom: nom, echelle: eluEchelle };
      });
      afficherResultats(resultats);
    }

    function afficherSuggestions(query) {
      var q = query.toLowerCase();
      var resultats = [];
      // Prioriser l'échelle courante
      var echellesOrdonnees = [eluEchelle].concat(Object.keys(TERRITOIRES).filter(function(e) { return e !== eluEchelle; }));
      for (var i = 0; i < echellesOrdonnees.length; i++) {
        var ech = echellesOrdonnees[i];
        var items = TERRITOIRES[ech] || [];
        for (var j = 0; j < items.length; j++) {
          if (items[j].toLowerCase().indexOf(q) !== -1) {
            resultats.push({ nom: items[j], echelle: ech });
          }
          if (resultats.length >= 12) break;
        }
        if (resultats.length >= 12) break;
      }
      afficherResultats(resultats);
    }

    function afficherResultats(resultats) {
      sugList.innerHTML = '';
      if (resultats.length === 0) {
        sugList.innerHTML = '<li class="tdb-territoire-suggestions__empty">Aucun résultat</li>';
      } else {
        resultats.forEach(function(r) {
          var li = document.createElement('li');
          li.className = 'tdb-territoire-suggestions__item';
          li.setAttribute('role', 'option');
          li.setAttribute('tabindex', '-1');
          li.innerHTML = '<span class="tdb-territoire-suggestions__name">' + r.nom + '</span>' +
            '<span class="tdb-territoire-suggestions__scale">' + r.echelle + '</span>';
          li.addEventListener('click', function() {
            selectionnerTerritoire(r.nom, r.echelle);
          });
          li.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { selectionnerTerritoire(r.nom, r.echelle); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); if (li.nextElementSibling) li.nextElementSibling.focus(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); if (li.previousElementSibling) li.previousElementSibling.focus(); else searchInput.focus(); }
            else if (e.key === 'Escape') { fermerSuggestions(); searchInput.focus(); }
          });
          sugList.appendChild(li);
        });
      }
      sugList.style.display = 'block';
      searchInput.setAttribute('aria-expanded', 'true');
    }

    function fermerSuggestions() {
      sugList.innerHTML = '';
      sugList.style.display = 'none';
      searchInput.setAttribute('aria-expanded', 'false');
    }

    function selectionnerTerritoire(nom, echelle) {
      eluEchelle = echelle;
      eluTerritoire = nom;
      selEchelle.value = echelle;
      searchInput.value = nom;
      clearBtn.style.display = 'block';
      fermerSuggestions();
      remplirSelectEluTerritoire(echelle, nom);
      majTitreElu();
    }
  }

  function remplirSelectEluTerritoire(echelle, defaut) {
    var sel = document.getElementById('tdb-elu-select-territoire');
    if (!sel) return;
    sel.innerHTML = '';
    var liste = (typeof TERRITOIRES !== 'undefined' && TERRITOIRES[echelle]) ? TERRITOIRES[echelle] : [];
    liste.forEach(function(nom) {
      var opt = document.createElement('option');
      opt.value = nom;
      opt.textContent = nom;
      sel.appendChild(opt);
    });
    if (defaut && liste.indexOf(defaut) !== -1) {
      sel.value = defaut;
      eluTerritoire = defaut;
    } else {
      eluTerritoire = liste[0] || '';
    }
    majTitreElu();
  }

  function majTitreElu() {
    var span = document.getElementById('tdb-elu-territoire');
    if (span) {
      span.textContent = eluTerritoire || eluEchelle;
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // NAVIGATION (onglets thématiques)
  // ══════════════════════════════════════════════════════════════════════

  function renderNav() {
    var inner = navContainer.querySelector('.tdb-elu-nav__inner');
    if (!inner) return;
    inner.innerHTML = '';

    SECTIONS_ELU.forEach(function(sec) {
      var count = getIndicateursForSection(sec.id).length;
      var btn = document.createElement('button');
      btn.className = 'tdb-elu-nav-btn';
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      btn.dataset.section = sec.id;
      btn.style.setProperty('--nav-color', sec.color);
      btn.innerHTML =
        '<i class="ph ' + sec.icon + '" aria-hidden="true"></i>' +
        '<span>' + sec.nom + '</span>' +
        '<span class="tdb-elu-nav-btn__count">' + count + '</span>';
      btn.addEventListener('click', function() {
        activateSection(sec.id);
      });
      inner.appendChild(btn);
    });
  }

  function activateSection(sectionId) {
    activeSection = sectionId;
    activeFacets = { categorie: null, sousCategorie: null };

    // Update nav buttons
    var btns = navContainer.querySelectorAll('.tdb-elu-nav-btn');
    btns.forEach(function(btn) {
      var isActive = btn.dataset.section === sectionId;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    renderSection(sectionId);

    // Remonter en haut de la page au changement d'onglet
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ══════════════════════════════════════════════════════════════════════
  // RENDU D'UNE SECTION
  // ══════════════════════════════════════════════════════════════════════

  function renderSection(sectionId) {
    destroyCharts();
    destroyMinimaps();
    var sec = SECTIONS_ELU.find(function(s) { return s.id === sectionId; });
    if (!sec) return;

    var indicateurs = getIndicateursForSection(sectionId);

    var html = '';

    // Section header
    html += '<div class="tdb-elu-section">';
    html += '  <div class="tdb-elu-section__header">';
    html += '    <div class="tdb-elu-section__icon" style="background:' + sec.gradient + '">';
    html += '      <i class="ph ' + sec.icon + '"></i>';
    html += '    </div>';
    html += '    <div>';
    html += '      <h2 class="tdb-elu-section__title">' + sec.nom + '</h2>';
    html += '      <p class="tdb-elu-section__desc">' + sec.description + '</p>';
    html += '    </div>';

    // Bouton Comparer / Fermer comparaison
    if (compareMode) {
      html += '    <button class="tdb-elu-compare-btn tdb-elu-compare-btn--active" id="tdb-elu-btn-compare" type="button">';
      html += '      <i class="ph ph-x-circle"></i> Fermer la comparaison';
      html += '    </button>';
    } else {
      html += '    <button class="tdb-elu-compare-btn" id="tdb-elu-btn-compare" type="button">';
      html += '      <i class="ph ph-arrows-left-right"></i> Comparer';
      html += '    </button>';
    }

    html += '  </div>';

    // Search bar + Facets
    var facetData = buildFacetData(indicateurs);
    html += renderSearchBar(indicateurs.length, facetData.hasContent);

    // Facets (hidden by default, toggled by filter button)
    if (facetData.hasContent) {
      html += renderFacets(facetData, sec.color);
    }

    // Mode comparaison : split en 2 colonnes
    if (compareMode && compareTerritoire) {
      html += renderCompareLayout(indicateurs, sec, sectionId);
    } else if (sectionId === 'fiche-identite') {
      // Layout spécial Fiche d'identité
      html += renderFicheIdentiteLayout();
    } else {
      // Tuiles grid (mode normal)
      html += '  <div class="tdb-elu-grid" id="tdb-elu-tiles-grid">';
      html += renderTiles(indicateurs, sec.color);
      html += '  </div>';
    }

    html += '</div>'; // close section

    contentContainer.innerHTML = html;

    // Init Charts after DOM injection
    initCharts();
    initMinimaps();

    // Bind facet buttons
    bindFacetEvents(sec.color);

    // Bind search
    bindSearchEvents(sec.color);

    // Bind filter toggle button
    bindFilterToggle();

    // Bind compare button
    bindCompareButton();
  }

  // ══════════════════════════════════════════════════════════════════════
  // RECHERCHE AVEC AUTOCOMPLÉTION
  // ══════════════════════════════════════════════════════════════════════

  var searchQuery = '';

  function renderSearchBar(totalCount, hasFacets) {
    var html = '<div class="tdb-elu-search" id="tdb-elu-search">';
    html += '  <div class="tdb-elu-search__field">';
    html += '    <i class="ph ph-magnifying-glass tdb-elu-search__icon" aria-hidden="true"></i>';
    html += '    <input type="text" id="tdb-elu-search-input" class="tdb-elu-search__input"';
    html += '      placeholder="Rechercher un indicateur dans cette section…"';
    html += '      autocomplete="off" aria-label="Rechercher un indicateur"';
    html += '      aria-autocomplete="list" aria-controls="tdb-elu-search-suggestions" aria-expanded="false">';
    html += '    <button class="tdb-elu-search__clear" id="tdb-elu-search-clear" type="button" aria-label="Effacer la recherche" style="display:none">';
    html += '      <i class="ph ph-x"></i>';
    html += '    </button>';
    html += '    <span class="tdb-elu-search__count">' + totalCount + ' indicateurs</span>';
    html += '  </div>';
    if (hasFacets) {
      html += '  <button class="tdb-elu-search__filter-btn" id="tdb-elu-filter-toggle" type="button" aria-expanded="false" aria-controls="tdb-elu-facets-panel">';
      html += '    <i class="ph ph-funnel"></i> Filtres';
      html += '  </button>';
    }
    html += '  <ul class="tdb-elu-search__suggestions" id="tdb-elu-search-suggestions" role="listbox" aria-label="Suggestions d\'indicateurs"></ul>';
    html += '</div>';
    return html;
  }

  function bindSearchEvents(color) {
    var input = document.getElementById('tdb-elu-search-input');
    var clearBtn = document.getElementById('tdb-elu-search-clear');
    var sugList = document.getElementById('tdb-elu-search-suggestions');
    var countEl = contentContainer.querySelector('.tdb-elu-search__count');
    if (!input) return;

    var indicateurs = getIndicateursForSection(activeSection);
    var activeIdx = -1;

    input.value = searchQuery || '';
    if (searchQuery) clearBtn.style.display = 'flex';

    // Input handler
    input.addEventListener('input', function() {
      searchQuery = this.value.trim();
      clearBtn.style.display = searchQuery ? 'flex' : 'none';
      activeIdx = -1;

      if (searchQuery.length >= 2) {
        var matches = filterBySearch(indicateurs, searchQuery);
        renderSuggestions(matches, sugList, searchQuery);
        openSuggestions(input, sugList);
      } else {
        closeSuggestions(input, sugList);
        // Reset to show all (or faceted)
        if (!searchQuery) applyAllFilters(color, countEl);
      }
    });

    // Focus → show suggestions if query exists
    input.addEventListener('focus', function() {
      if (searchQuery.length >= 2) {
        var matches = filterBySearch(indicateurs, searchQuery);
        renderSuggestions(matches, sugList, searchQuery);
        openSuggestions(input, sugList);
      }
    });

    // Clear button
    clearBtn.addEventListener('click', function() {
      searchQuery = '';
      input.value = '';
      clearBtn.style.display = 'none';
      closeSuggestions(input, sugList);
      applyAllFilters(color, countEl);
      input.focus();
    });

    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
      var items = sugList.querySelectorAll('.tdb-elu-search__suggestion-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, items.length - 1);
        highlightSuggestion(items, activeIdx);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        highlightSuggestion(items, activeIdx);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIdx >= 0 && items[activeIdx]) {
          searchQuery = items[activeIdx].dataset.nom;
          input.value = searchQuery;
          clearBtn.style.display = 'flex';
        }
        closeSuggestions(input, sugList);
        applyAllFilters(color, countEl);
      } else if (e.key === 'Escape') {
        closeSuggestions(input, sugList);
      }
    });

    // Click outside → close
    document.addEventListener('click', function(e) {
      var searchWrap = document.getElementById('tdb-elu-search');
      if (searchWrap && !searchWrap.contains(e.target)) {
        closeSuggestions(input, sugList);
      }
    });

    // On Enter or selecting a suggestion → filter tiles
    input.addEventListener('change', function() {
      searchQuery = this.value.trim();
      applyAllFilters(color, countEl);
    });
  }

  function filterBySearch(indicateurs, query) {
    var q = query.toLowerCase();
    return indicateurs.filter(function(ind) {
      return ind.nom.toLowerCase().indexOf(q) !== -1 ||
             ind.description.toLowerCase().indexOf(q) !== -1 ||
             (ind.sousCategorie && ind.sousCategorie.toLowerCase().indexOf(q) !== -1) ||
             (ind.categorie && ind.categorie.toLowerCase().indexOf(q) !== -1);
    });
  }

  function renderSuggestions(matches, sugList, query) {
    sugList.innerHTML = '';
    if (matches.length === 0) {
      var li = document.createElement('li');
      li.className = 'tdb-elu-search__suggestion-empty';
      li.textContent = 'Aucun indicateur trouvé';
      sugList.appendChild(li);
      return;
    }
    var shown = matches.slice(0, 8);
    var re = new RegExp('(' + escapeRegex(query) + ')', 'gi');
    shown.forEach(function(ind) {
      var li = document.createElement('li');
      li.className = 'tdb-elu-search__suggestion-item';
      li.setAttribute('role', 'option');
      li.dataset.nom = ind.nom;
      li.innerHTML = '<i class="ph ph-magnifying-glass"></i> ' + ind.nom.replace(re, '<mark>$1</mark>');
      li.addEventListener('mousedown', function(e) {
        e.preventDefault();
        var input = document.getElementById('tdb-elu-search-input');
        searchQuery = ind.nom;
        input.value = searchQuery;
        document.getElementById('tdb-elu-search-clear').style.display = 'flex';
        closeSuggestions(input, sugList);
        var sec = SECTIONS_ELU.find(function(s) { return s.id === activeSection; });
        applyAllFilters(sec ? sec.color : '#1565C0', contentContainer.querySelector('.tdb-elu-search__count'));
      });
      sugList.appendChild(li);
    });
    if (matches.length > 8) {
      var more = document.createElement('li');
      more.className = 'tdb-elu-search__suggestion-more';
      more.textContent = '+ ' + (matches.length - 8) + ' autres résultats — Appuyez sur Entrée';
      sugList.appendChild(more);
    }
  }

  function highlightSuggestion(items, idx) {
    items.forEach(function(el, i) { el.classList.toggle('is-active', i === idx); });
    if (idx >= 0 && items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
  }

  function openSuggestions(input, sugList) { sugList.style.display = 'block'; input.setAttribute('aria-expanded', 'true'); }
  function closeSuggestions(input, sugList) { sugList.style.display = 'none'; input.setAttribute('aria-expanded', 'false'); }

  function bindFilterToggle() {
    var btn = document.getElementById('tdb-elu-filter-toggle');
    var panel = document.getElementById('tdb-elu-facets-panel');
    if (!btn || !panel) return;

    btn.addEventListener('click', function() {
      var isOpen = !panel.hidden;
      panel.hidden = isOpen;
      btn.setAttribute('aria-expanded', String(!isOpen));
      btn.classList.toggle('is-active', !isOpen);
    });
  }

  function applyAllFilters(color, countEl) {
    destroyCharts();
    destroyMinimaps();
    var indicateurs = getIndicateursForSection(activeSection);

    // Apply facet filters
    var filtered = indicateurs.filter(function(ind) {
      
      if (activeFacets.categorie && ind.categorie !== activeFacets.categorie) return false;
      if (activeFacets.sousCategorie && ind.sousCategorie !== activeFacets.sousCategorie) return false;
      return true;
    });

    // Apply search filter
    if (searchQuery && searchQuery.length >= 2) {
      filtered = filterBySearch(filtered, searchQuery);
    }

    // Update count
    if (countEl) countEl.textContent = filtered.length + ' indicateur' + (filtered.length > 1 ? 's' : '');

    var grid = document.getElementById('tdb-elu-tiles-grid');
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="tdb-elu-empty"><i class="ph ph-funnel-x"></i><p>Aucun indicateur ne correspond à votre recherche.</p></div>';
    } else {
      grid.innerHTML = renderTiles(filtered, color);
    }

    // Mode comparaison : mettre aussi à jour la grille droite
    if (compareMode && compareTerritoire) {
      var gridCmp = document.getElementById('tdb-elu-tiles-grid-compare');
      if (gridCmp) {
        if (filtered.length === 0) {
          gridCmp.innerHTML = '<div class="tdb-elu-empty"><i class="ph ph-funnel-x"></i><p>Aucun indicateur ne correspond à votre recherche.</p></div>';
        } else {
          gridCmp.innerHTML = renderTilesCompare(filtered, color);
        }
      }
    }

    initCharts();
    initMinimaps();
  }

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // ══════════════════════════════════════════════════════════════════════
  // MOTEUR À FACETTES
  // ══════════════════════════════════════════════════════════════════════

  function buildFacetData(indicateurs) {
    var categories = {}, sousCategories = {};

    indicateurs.forEach(function(ind) {
      if (ind.categorie) categories[ind.categorie] = (categories[ind.categorie] || 0) + 1;
      if (ind.sousCategorie) sousCategories[ind.sousCategorie] = (sousCategories[ind.sousCategorie] || 0) + 1;
    });

    var hasContent = Object.keys(categories).length > 1 ||
                     Object.keys(sousCategories).length > 1;

    return { categories: categories, sousCategories: sousCategories, hasContent: hasContent };
  }

  function renderFacets(facetData, color) {
    var html = '<div class="tdb-elu-facets-panel" id="tdb-elu-facets-panel" hidden>';
    html += '<div class="tdb-elu-facets">';

    // Catégorie
    if (Object.keys(facetData.categories).length > 1) {
      html += '<div class="tdb-elu-facets__group">';
      html += '<span class="tdb-elu-facets__label">Catégorie</span>';
      Object.keys(facetData.categories).forEach(function(key) {
        html += '<button class="tdb-elu-facet-btn" data-facet="categorie" data-value="' + escHtml(key) + '" style="--facet-color:' + color + '">';
        html += escHtml(key) + ' <span class="tdb-elu-facet-btn__count">' + facetData.categories[key] + '</span>';
        html += '</button>';
      });
      html += '</div>';
      html += '<div class="tdb-elu-facets__sep"></div>';
    }

    // Sous-catégorie
    if (Object.keys(facetData.sousCategories).length > 1) {
      html += '<div class="tdb-elu-facets__group">';
      html += '<span class="tdb-elu-facets__label">Sous-catégorie</span>';
      Object.keys(facetData.sousCategories).forEach(function(key) {
        html += '<button class="tdb-elu-facet-btn" data-facet="sousCategorie" data-value="' + escHtml(key) + '" style="--facet-color:' + color + '">';
        html += escHtml(key) + ' <span class="tdb-elu-facet-btn__count">' + facetData.sousCategories[key] + '</span>';
        html += '</button>';
      });
      html += '</div>';
    }

    html += '</div>';
    html += '</div>'; // close .tdb-elu-facets-panel
    return html;
  }

  function bindFacetEvents(color) {
    var btns = contentContainer.querySelectorAll('.tdb-elu-facet-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var facetType = this.dataset.facet;
        var facetValue = this.dataset.value;

        // Toggle: if already active, deactivate
        if (activeFacets[facetType] === facetValue) {
          activeFacets[facetType] = null;
          this.classList.remove('is-active');
        } else {
          // Deactivate other buttons in same group
          contentContainer.querySelectorAll('.tdb-elu-facet-btn[data-facet="' + facetType + '"]')
            .forEach(function(b) { b.classList.remove('is-active'); });
          activeFacets[facetType] = facetValue;
          this.classList.add('is-active');
        }

        // Re-render tiles
        applyFacetFilter(color);
      });
    });
  }

  function applyFacetFilter(color) {
    var countEl = contentContainer.querySelector('.tdb-elu-search__count');
    applyAllFilters(color, countEl);
  }

  // ══════════════════════════════════════════════════════════════════════
  // RENDU DES TUILES (1 tuile par indicateur, onglets si multi-affichage)
  // ══════════════════════════════════════════════════════════════════════

  // ── Tuile Cartographie territoire (section Fiche d'identité) ────────
  // ══════════════════════════════════════════════════════════════════════
  // LAYOUT FICHE D'IDENTITÉ (custom)
  // ══════════════════════════════════════════════════════════════════════

  function renderFicheIdentiteLayout() {
    // Récupérer les indicateurs nécessaires
    var indPopulation = findInd('IND-095');
    var indEvolution = findInd('IND-096');
    var indDensite = findInd('IND-097');
    var indSuperficie = findInd('IND-099');
    var indPlansEauNb = findInd('IND-039');
    var indPlansEauHa = findInd('IND-040');
    var indCoursEau = findInd('IND-041');

    var html = '<div class="tdb-elu-fiche-layout" id="tdb-elu-tiles-grid">';

    // ── RANGÉE 1 : Tuile héro pleine largeur ──────────────────────
    html += '<div class="tdb-elu-fiche-hero">';
    html += '  <div class="tdb-elu-fiche-hero__left">';
    html += '    <h2 class="tdb-elu-fiche-hero__title">' + escHtml(eluTerritoire || 'Grand Est') + '</h2>';
    html += '    <div class="tdb-elu-fiche-hero__stats">';
    // Superficie
    if (indSuperficie && indSuperficie.fakeData) {
      html += '      <div class="tdb-elu-fiche-hero__stat">';
      html += '        <i class="ph ph-ruler"></i>';
      html += '        <span class="tdb-elu-fiche-hero__stat-value">' + indSuperficie.fakeData.value + '</span>';
      html += '        <span class="tdb-elu-fiche-hero__stat-unit">' + (indSuperficie.fakeData.unit || '') + '</span>';
      html += '      </div>';
    }
    // Population
    if (indPopulation && indPopulation.fakeData) {
      html += '      <div class="tdb-elu-fiche-hero__stat">';
      html += '        <i class="ph ph-users"></i>';
      html += '        <span class="tdb-elu-fiche-hero__stat-value">' + indPopulation.fakeData.value + '</span>';
      html += '        <span class="tdb-elu-fiche-hero__stat-unit">' + (indPopulation.fakeData.unit || '') + '</span>';
      html += '      </div>';
    }
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="tdb-elu-fiche-hero__right">';
    html += '    <div class="tdb-elu-tile__minimap tdb-elu-minimap--territoire" id="minimap-territoire" data-minimap="territoire"></div>';
    html += '  </div>';
    html += '</div>';

    // ── RANGÉE 2 : Densité (1 col) + Évolution population (2 cols) ──
    html += '<div class="tdb-elu-fiche-row2">';

    // Densité
    html += '  <div class="tdb-elu-fiche-card tdb-elu-fiche-card--densite">';
    if (indDensite && indDensite.fakeData) {
      html += '    <div class="tdb-elu-fiche-card__icon"><i class="ph ph-users-four"></i></div>';
      html += '    <div class="tdb-elu-fiche-card__value">' + indDensite.fakeData.value + '</div>';
      html += '    <div class="tdb-elu-fiche-card__unit">' + (indDensite.fakeData.unit || '') + '</div>';
      html += '    <div class="tdb-elu-fiche-card__label">Densité de population</div>';
      if (indDensite.fakeData.trend) {
        html += '    <div class="tdb-elu-fiche-card__trend">' + escHtml(indDensite.fakeData.trend) + '</div>';
      }
    }
    html += '  </div>';

    // Évolution population (graphique)
    html += '  <div class="tdb-elu-fiche-card tdb-elu-fiche-card--evolution">';
    html += '    <div class="tdb-elu-fiche-card__header">';
    html += '      <span class="tdb-elu-fiche-card__header-title">Évolution de la population</span>';
    if (indEvolution && indEvolution.fakeData && indEvolution.fakeData.trend) {
      var trendDir = indEvolution.fakeData.trendDir || 'neutral';
      var trendIcon = trendDir === 'up' ? 'ph-arrow-up-right' : trendDir === 'down' ? 'ph-arrow-down-right' : 'ph-minus';
      var trendClass = trendDir === 'up' ? 'tdb-elu-fiche-card__trend--up' : trendDir === 'down' ? 'tdb-elu-fiche-card__trend--down' : '';
      html += '      <span class="tdb-elu-fiche-card__trend-badge ' + trendClass + '"><i class="ph ' + trendIcon + '"></i> ' + escHtml(indEvolution.fakeData.trend) + '</span>';
    }
    html += '    </div>';
    html += '    <div class="tdb-elu-fiche-card__chart">';
    var canvasIdEvo = 'chart-fiche-evolution-' + Math.random().toString(36).substr(2, 6);
    html += '      <canvas id="' + canvasIdEvo + '" data-ind-id="IND-096" data-chart-type="histogramme"></canvas>';
    html += '    </div>';
    html += '  </div>';

    html += '</div>';

    // ── RANGÉE 3 : Ressource en eau (1.5) + Prélèvements (1.5) ──
    html += '<div class="tdb-elu-fiche-row3">';

    // Caractéristiques ressource en eau
    html += '  <div class="tdb-elu-fiche-card tdb-elu-fiche-card--ressource">';
    html += '    <div class="tdb-elu-fiche-card__header">';
    html += '      <span class="tdb-elu-fiche-card__header-title"><i class="ph ph-drop"></i> Caractéristiques de la ressource en eau</span>';
    html += '    </div>';
    html += '    <div class="tdb-elu-fiche-card__kpi-list">';
    // Plans d'eau (nombre)
    if (indPlansEauNb && indPlansEauNb.fakeData) {
      html += '      <div class="tdb-elu-fiche-card__kpi-row">';
      html += '        <span class="tdb-elu-fiche-card__kpi-label">Plans d\'eau (nombre)</span>';
      html += '        <span class="tdb-elu-fiche-card__kpi-val">' + indPlansEauNb.fakeData.value + '</span>';
      html += '      </div>';
    }
    // Plans d'eau (superficie)
    if (indPlansEauHa && indPlansEauHa.fakeData) {
      html += '      <div class="tdb-elu-fiche-card__kpi-row">';
      html += '        <span class="tdb-elu-fiche-card__kpi-label">Plans d\'eau (superficie)</span>';
      html += '        <span class="tdb-elu-fiche-card__kpi-val">' + indPlansEauHa.fakeData.value + ' ' + (indPlansEauHa.fakeData.unit || '') + '</span>';
      html += '      </div>';
    }
    // Cours d'eau (linéaire)
    if (indCoursEau && indCoursEau.fakeData) {
      html += '      <div class="tdb-elu-fiche-card__kpi-row">';
      html += '        <span class="tdb-elu-fiche-card__kpi-label">Cours d\'eau (linéaire)</span>';
      html += '        <span class="tdb-elu-fiche-card__kpi-val">' + indCoursEau.fakeData.value + ' ' + (indCoursEau.fakeData.unit || '') + '</span>';
      html += '      </div>';
    }
    html += '    </div>';
    html += '  </div>';

    // Historique des prélèvements
    html += '  <div class="tdb-elu-fiche-card tdb-elu-fiche-card--prelevements">';
    html += '    <div class="tdb-elu-fiche-card__header">';
    html += '      <span class="tdb-elu-fiche-card__header-title"><i class="ph ph-chart-bar"></i> Historique des prélèvements</span>';
    html += '    </div>';
    html += '    <div class="tdb-elu-fiche-card__chart">';
    var canvasIdPrelev = 'chart-fiche-prelevements-' + Math.random().toString(36).substr(2, 6);
    html += '      <canvas id="' + canvasIdPrelev + '" data-chart-type="prelevements"></canvas>';
    html += '    </div>';
    html += '  </div>';

    html += '</div>';

    // ── RANGÉE 4 : Prix de l'eau + AAC + Captages (3 tuiles) ──
    var indPrixEau = findInd('IND-065');
    var indAAC = findInd('IND-066');
    var indCaptages = findInd('IND-067');

    html += '<div class="tdb-elu-fiche-row4">';

    // Prix de l'eau
    html += '  <div class="tdb-elu-fiche-card tdb-elu-fiche-card--kpi">';
    if (indPrixEau && indPrixEau.fakeData) {
      html += '    <div class="tdb-elu-fiche-card__icon"><i class="ph ph-currency-eur"></i></div>';
      html += '    <div class="tdb-elu-fiche-card__value">' + indPrixEau.fakeData.value + '</div>';
      html += '    <div class="tdb-elu-fiche-card__unit">' + (indPrixEau.fakeData.unit || '') + '</div>';
      html += '    <div class="tdb-elu-fiche-card__label">Prix de l\'eau</div>';
      if (indPrixEau.fakeData.trend) {
        html += '    <div class="tdb-elu-fiche-card__trend">' + escHtml(indPrixEau.fakeData.trend) + '</div>';
      }
    }
    html += '  </div>';

    // AAC
    html += '  <div class="tdb-elu-fiche-card tdb-elu-fiche-card--kpi">';
    if (indAAC && indAAC.fakeData) {
      html += '    <div class="tdb-elu-fiche-card__icon"><i class="ph ph-shield-check"></i></div>';
      html += '    <div class="tdb-elu-fiche-card__value">' + indAAC.fakeData.value + '</div>';
      html += '    <div class="tdb-elu-fiche-card__unit">' + (indAAC.fakeData.unit || '') + '</div>';
      html += '    <div class="tdb-elu-fiche-card__label">Aires d\'alimentation de captages</div>';
      if (indAAC.fakeData.trend) {
        html += '    <div class="tdb-elu-fiche-card__trend">' + escHtml(indAAC.fakeData.trend) + '</div>';
      }
    }
    html += '  </div>';

    // Captages sensibles
    html += '  <div class="tdb-elu-fiche-card tdb-elu-fiche-card--kpi tdb-elu-fiche-card--captages">';
    if (indCaptages && indCaptages.fakeData && indCaptages.fakeData.chartData) {
      html += '    <div class="tdb-elu-fiche-card__header">';
      html += '      <span class="tdb-elu-fiche-card__header-title"><i class="ph ph-target"></i> Captages sensibles</span>';
      html += '    </div>';
      html += '    <div class="tdb-elu-fiche-card__chart">';
      var canvasIdCapt = 'chart-fiche-captages-' + Math.random().toString(36).substr(2, 6);
      html += '      <canvas id="' + canvasIdCapt + '" data-ind-id="IND-067" data-chart-type="donut"></canvas>';
      html += '    </div>';
    }
    html += '  </div>';

    html += '</div>';

    html += '</div>'; // close .tdb-elu-fiche-layout
    return html;
  }

  function findInd(id) {
    for (var i = 0; i < INDICATEURS_ELU.length; i++) {
      if (INDICATEURS_ELU[i].id === id) return INDICATEURS_ELU[i];
    }
    return null;
  }

  // ══════════════════════════════════════════════════════════════════════
  // RENDU DES TUILES (1 tuile par indicateur, onglets si multi-affichage)
  // ══════════════════════════════════════════════════════════════════════

  function renderTileCartoTerritoire(suffix) {
    var mapId = 'minimap-territoire' + (suffix || '');
    var html = '<div class="tdb-elu-tile tdb-elu-tile--carto-territoire">';
    html += '<div class="tdb-elu-tile__accent" style="background:linear-gradient(90deg,#1565C0,#42A5F5)"></div>';
    html += '<div class="tdb-elu-tile__pres-header">';
    html += '  <i class="ph ph-map-trifold"></i>';
    html += '  <span>Localisation du territoire</span>';
    html += '</div>';
    html += '<div class="tdb-elu-tile__carto-body">';
    html += '  <div class="tdb-elu-tile__minimap tdb-elu-minimap--territoire" id="' + mapId + '" data-minimap="territoire"></div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ── Tuile Présentation (section Fiche d'identité uniquement) ───────
  function renderTilePresentation() {
    var html = '<div class="tdb-elu-tile tdb-elu-tile--presentation">';
    html += '<div class="tdb-elu-tile__accent" style="background:linear-gradient(90deg,#455A64,#78909C)"></div>';
    html += '<div class="tdb-elu-tile__pres-header">';
    html += '  <i class="ph ph-map-pin-area"></i>';
    html += '  <span>Présentation</span>';
    html += '</div>';
    html += '<div class="tdb-elu-tile__pres-content">';
    html += '  <div class="tdb-elu-tile__pres-img">';
    html += '    <img src="../images/grand-est-presentation.jpg" alt="Paysage fluvial du Grand Est — Strasbourg, Petite France" loading="lazy">';
    html += '  </div>';
    html += '  <div class="tdb-elu-tile__pres-text">';
    html += '    <h3>Région Grand Est</h3>';
    html += '    <p>Le <strong>Grand Est</strong> est la plus grande région de France métropolitaine avec <strong>57 441 km²</strong>. ';
    html += 'Elle regroupe les anciennes régions Alsace, Champagne-Ardenne et Lorraine, soit <strong>10 départements</strong> et environ <strong>5,56 millions d\'habitants</strong>.</p>';
    html += '    <p>Traversée par trois grands bassins hydrographiques <em>(Rhin-Meuse, Seine-Normandie, Rhône-Méditerranée)</em>, ';
    html += 'la région dispose d\'un réseau hydrographique dense de plus de 52 000 km de cours d\'eau, ';
    html += 'de nappes souterraines majeures (nappe rhénane, craie de Champagne) et de zones humides remarquables.</p>';
    html += '    <p>L\'Observatoire Régional de l\'Eau du Grand Est (OREGE) assure le suivi de la ressource en eau ';
    html += 'et de ses usages à l\'échelle régionale.</p>';
    html += '  </div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderTiles(indicateurs, color) {
    var html = '';
    indicateurs.forEach(function(ind) {
      html += renderTileUnified(ind, color);
    });
    return html;
  }

  function renderTileUnified(ind, color, isCompare) {
    // Déterminer les onglets disponibles
    var tabs = [];
    var geoInfo = (typeof GEO_MAPPING_ELU !== 'undefined') ? GEO_MAPPING_ELU[ind.id] : null;
    var hasCarto = ind.affichage.carto && geoInfo && geoInfo.type !== 'none';

    if (ind.affichage.chiffre) tabs.push({ key: 'chiffre', icon: 'ph-hash', label: 'Chiffre clé' });
    if (ind.affichage.graphique) tabs.push({ key: 'graphique', icon: 'ph-chart-bar', label: 'Graphique' });
    if (hasCarto) tabs.push({ key: 'carto', icon: 'ph-map-trifold', label: 'Cartographie' });

    // Si aucun tab, afficher en chiffre par défaut
    if (tabs.length === 0) tabs.push({ key: 'chiffre', icon: 'ph-hash', label: 'Chiffre clé' });

    var tileId = (isCompare ? 'tile-cmp-' : 'tile-') + ind.id;
    var firstTab = tabs[0].key;

    // Ouverture tuile
    var html = '<div class="tdb-elu-tile" id="' + tileId + '">';
    html += '<div class="tdb-elu-tile__accent" style="background:linear-gradient(90deg,' + color + ',' + lightenColor(color, 40) + ')"></div>';

    // Badge de type (uniquement si un seul onglet → pas de barre d'onglets)
    if (tabs.length === 1) {
      var badgeClass = tabs[0].key === 'graphique' ? 'tdb-elu-tile__type-badge--graph' :
                       tabs[0].key === 'carto' ? 'tdb-elu-tile__type-badge--carto' :
                       'tdb-elu-tile__type-badge--chiffre';
      html += '<div class="tdb-elu-tile__type-badge ' + badgeClass + '"><i class="ph ' + tabs[0].icon + '"></i></div>';
    }

    // Header commun (titre + tooltip)
    html += '<div class="tdb-elu-tile__header' + (tabs.length === 1 ? ' tdb-elu-tile__header--with-badge' : '') + '">';
    html += '  <span class="tdb-elu-tile__title">' + escHtml(ind.nom) + '</span>';
    html += '  <button class="tdb-elu-tile__tooltip-btn" data-tooltip="' + escHtml(ind.description) + '" aria-label="Détail de l\u2019indicateur"><i class="ph ph-info"></i></button>';
    html += '</div>';

    // Badges
    html += '<div class="tdb-elu-tile__badges">';
    if (ind.exposition) html += '<span class="tdb-elu-tile__badge tdb-elu-tile__badge--b">' + escHtml(ind.exposition) + '</span>';
    if (ind.categorie) html += '<span class="tdb-elu-tile__badge tdb-elu-tile__badge--c">' + escHtml(ind.categorie) + '</span>';
    if (ind.sousCategorie) html += '<span class="tdb-elu-tile__badge tdb-elu-tile__badge--d">' + escHtml(ind.sousCategorie) + '</span>';
    html += '</div>';

    // Contenus des panneaux
    tabs.forEach(function(tab) {
      var isActive = (tab.key === firstTab);
      html += '<div class="tdb-elu-tile__panel' + (isActive ? ' is-active' : '') + '" data-panel="' + tab.key + '">';
      if (tab.key === 'chiffre') {
        html += renderContentChiffre(ind);
      } else if (tab.key === 'graphique') {
        html += renderContentGraph(ind);
      } else if (tab.key === 'carto') {
        html += renderContentCarto(ind, geoInfo);
      }
      html += '</div>';
    });

    // Barre d'onglets en bas (uniquement si plus d'un tab)
    if (tabs.length > 1) {
      html += '<div class="tdb-elu-tile__tabs" data-tile-id="' + tileId + '">';
      tabs.forEach(function(tab) {
        var isActive = (tab.key === firstTab);
        html += '<button class="tdb-elu-tile__tab' + (isActive ? ' is-active' : '') + '" data-tab="' + tab.key + '" type="button">';
        html += '<i class="ph ' + tab.icon + '"></i> ' + tab.label;
        html += '</button>';
      });
      html += '</div>';
    }

    html += '</div>'; // close .tdb-elu-tile
    return html;
  }

  // ── Contenu Chiffre clé (sans enveloppe tile) ──────────────────────
  function renderContentChiffre(ind) {
    var fd = ind.fakeData || {};
    var trendClass = fd.trendDir === 'up' ? 'tdb-elu-tile__kpi-trend--up' :
                     fd.trendDir === 'down' ? 'tdb-elu-tile__kpi-trend--down' :
                     'tdb-elu-tile__kpi-trend--neutral';
    var trendIcon = fd.trendDir === 'up' ? 'ph-arrow-up-right' :
                    fd.trendDir === 'down' ? 'ph-arrow-down-right' : 'ph-minus';

    var html = '<div class="tdb-elu-tile__kpi">';
    html += '  <span class="tdb-elu-tile__kpi-value">' + (fd.value != null ? fd.value : '—') + '</span>';
    if (fd.unit) html += '  <span class="tdb-elu-tile__kpi-unit">' + escHtml(fd.unit) + '</span>';
    html += '</div>';
    if (fd.trend) {
      html += '<div class="tdb-elu-tile__kpi-trend ' + trendClass + '"><i class="ph ' + trendIcon + '"></i> ' + escHtml(fd.trend) + '</div>';
    }
    if (fd.details) {
      html += '<p class="tdb-elu-tile__kpi-detail">' + escHtml(fd.details) + '</p>';
    }
    return html;
  }

  // ── Contenu Graphique (sans enveloppe tile) ────────────────────────
  function renderContentGraph(ind) {
    var fd = ind.fakeData || {};
    var canvasId = 'chart-' + ind.id + '-' + Math.random().toString(36).substr(2, 6);

    var html = '<div class="tdb-elu-tile__chart">';
    html += '  <canvas id="' + canvasId + '" data-ind-id="' + ind.id + '" data-chart-type="' + (ind.graphType || 'donut') + '"></canvas>';
    html += '</div>';
    if (fd.trend) {
      var trendClass = fd.trendDir === 'up' ? 'tdb-elu-tile__kpi-trend--up' :
                       fd.trendDir === 'down' ? 'tdb-elu-tile__kpi-trend--down' :
                       'tdb-elu-tile__kpi-trend--neutral';
      html += '<div class="tdb-elu-tile__kpi-trend ' + trendClass + '" style="margin-top:8px"><i class="ph ph-trend-up"></i> ' + escHtml(fd.trend) + '</div>';
    }
    return html;
  }

  // ── Contenu Cartographie (sans enveloppe tile) ─────────────────────
  function renderContentCarto(ind, geoInfo) {
    var html = '';
    if (geoInfo.type === 'lien_externe') {
      html += '<div class="tdb-elu-tile__carto tdb-elu-tile__carto--externe">';
      html += '  <i class="ph ph-globe tdb-elu-tile__carto-icon"></i>';
      html += '  <span>Carte externe</span>';
      html += '  <a href="' + escHtml(geoInfo.url) + '" target="_blank" rel="noopener" class="tdb-elu-tile__carto-link"><i class="ph ph-arrow-square-out"></i> Voir sur la carte</a>';
      html += '</div>';
    } else {
      var mapId = 'minimap-' + ind.id + '-' + Math.random().toString(36).substr(2, 6);
      html += '<div class="tdb-elu-tile__minimap" id="' + mapId + '" data-ind-id="' + ind.id + '"></div>';
    }
    return html;
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHART.JS — Initialisation et destruction
  // ══════════════════════════════════════════════════════════════════════

  function initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('[TDB-ELU] Chart.js non chargé');
      return;
    }

    // Charts in active tile panels (normal tiles)
    var canvases = contentContainer.querySelectorAll('.tdb-elu-tile__panel.is-active canvas[data-ind-id]');
    canvases.forEach(function(canvas) {
      initSingleChart(canvas);
    });

    // Charts in fiche d'identité layout (no tab panel wrapper)
    var ficheCanvases = contentContainer.querySelectorAll('.tdb-elu-fiche-card__chart canvas');
    ficheCanvases.forEach(function(canvas) {
      initFicheChart(canvas);
    });
  }

  function initFicheChart(canvas) {
    if (typeof Chart === 'undefined') return;
    var chartType = canvas.dataset.chartType || 'histogramme';
    var indId = canvas.dataset.indId;

    // Donut chart (e.g. Captages)
    if (chartType === 'donut' && indId) {
      var indD = INDICATEURS_ELU.find(function(i) { return i.id === indId; });
      if (!indD || !indD.fakeData || !indD.fakeData.chartData) return;
      var cdD = indD.fakeData.chartData;
      var ctxD = canvas.getContext('2d');
      var configD = {
        type: 'doughnut',
        data: {
          labels: cdD.labels,
          datasets: [{ data: cdD.values, backgroundColor: cdD.colors, borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8 } } }
        }
      };
      var chartD = new Chart(ctxD, configD);
      chartInstances.push(chartD);
      return;
    }

    // Prélèvements = stacked bar with 4 series (custom data)
    if (chartType === 'prelevements') {
      var ctx = canvas.getContext('2d');
      var config = {
        type: 'bar',
        data: {
          labels: ['2016','2017','2018','2019','2020','2021','2022','2023'],
          datasets: [
            { label: 'Surface continentale', data: [320,305,298,285,270,262,255,248], backgroundColor: '#1565C0', borderRadius: 2 },
            { label: 'Littorale', data: [45,42,40,38,35,34,32,30], backgroundColor: '#42A5F5', borderRadius: 2 },
            { label: 'Souterraine', data: [180,175,172,168,165,160,158,155], backgroundColor: '#0D47A1', borderRadius: 2 },
            { label: 'Stockée', data: [60,58,55,52,50,48,46,44], backgroundColor: '#90CAF9', borderRadius: 2 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 10, usePointStyle: true, pointStyle: 'rect' } }
          },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { stacked: true, beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 }, callback: function(v) { return v + ' Mm³'; } },
              title: { display: true, text: 'Millions m³', font: { size: 10 }, color: '#64748B' }
            }
          }
        }
      };
      var chart = new Chart(ctx, config);
      chartInstances.push(chart);
      return;
    }

    // Evolution population — graphique linéaire
    if (indId) {
      var ind = INDICATEURS_ELU.find(function(i) { return i.id === indId; });
      if (!ind || !ind.fakeData || !ind.fakeData.chartData) return;
      var cd = ind.fakeData.chartData;
      var ctx2 = canvas.getContext('2d');
      var config2 = {
        type: 'line',
        data: {
          labels: cd.labels,
          datasets: [{
            label: ind.nom || '',
            data: cd.values,
            borderColor: '#1565C0',
            backgroundColor: 'rgba(21,101,192,0.08)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#1565C0',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { beginAtZero: false, grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 },
              callback: function(v) { return v.toFixed(2) + ' M'; } },
              title: { display: true, text: 'Millions hab.', font: { size: 10 }, color: '#64748B' }
            }
          }
        }
      };
      var chart2 = new Chart(ctx2, config2);
      chartInstances.push(chart2);
    }
  }

  function destroyCharts() {
    chartInstances.forEach(function(c) { c.destroy(); });
    chartInstances = [];
  }

  // ══════════════════════════════════════════════════════════════════════
  // MINI-CARTES OPENLAYERS — Initialisation et destruction
  // ══════════════════════════════════════════════════════════════════════

  var minimapInstances = [];

  function initMinimaps() {
    if (typeof ol === 'undefined') {
      console.warn('[TDB-ELU] OpenLayers non chargé');
      return;
    }
    if (typeof GEO_DATA_ELU === 'undefined' || typeof GEO_MAPPING_ELU === 'undefined') {
      console.warn('[TDB-ELU] Données géo non chargées');
      return;
    }

    // Only init minimaps in active (visible) panels
    var containers = contentContainer.querySelectorAll('.tdb-elu-tile__panel.is-active .tdb-elu-tile__minimap[data-ind-id]');
    containers.forEach(function(container) {
      var indId = container.dataset.indId;
      var geoInfo = GEO_MAPPING_ELU[indId];
      if (!geoInfo || geoInfo.type === 'none' || geoInfo.type === 'lien_externe') return;

      var geoColor = geoInfo.color || '#1565C0';
      var dataKey = geoInfo.data;
      var geoData = GEO_DATA_ELU[dataKey];
      if (!geoData) return;

      // Fond de carte (CartoDB Positron – libre, pas de clé requise)
      var tileLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          attributions: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/">OSM</a>'
        })
      });

      // Créer les features
      var features = [];

      if (geoInfo.type === 'points') {
        geoData.forEach(function(coord) {
          var feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
          });
          features.push(feature);
        });
      } else if (geoInfo.type === 'polygons') {
        geoData.forEach(function(ring) {
          var coords = ring.map(function(c) { return ol.proj.fromLonLat(c); });
          var feature = new ol.Feature({
            geometry: new ol.geom.Polygon([coords])
          });
          features.push(feature);
        });
      }

      // Style
      var style;
      if (geoInfo.type === 'points') {
        style = new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({ color: geoColor }),
            stroke: new ol.style.Stroke({ color: '#fff', width: 1.5 })
          })
        });
      } else {
        style = new ol.style.Style({
          fill: new ol.style.Fill({ color: hexToRgba(geoColor, 0.25) }),
          stroke: new ol.style.Stroke({ color: geoColor, width: 1.5 })
        });
      }

      // Couche vecteur
      var vectorSource = new ol.source.Vector({ features: features });
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: style
      });

      // Créer la carte
      var map = new ol.Map({
        target: container,
        layers: [tileLayer, vectorLayer],
        view: new ol.View({
          center: ol.proj.fromLonLat([6.5, 48.5]),
          zoom: 7
        }),
        controls: [],
        interactions: []
      });

      // Ajuster la vue aux features si possible
      if (features.length > 0) {
        var extent = vectorSource.getExtent();
        if (extent && extent[0] !== Infinity) {
          map.getView().fit(extent, { padding: [20, 20, 20, 20], maxZoom: 10 });
        }
      }

      minimapInstances.push(map);
    });

    // ── Mini-map territoire (tuile Fiche d'identité) ──
    var cartoTerritoires = contentContainer.querySelectorAll('.tdb-elu-minimap--territoire');
    cartoTerritoires.forEach(function(ct) {
      if (!ct.dataset.olInit) {
        initMinimapTerritoire(ct);
      }
    });
  }

  function destroyMinimaps() {
    minimapInstances.forEach(function(m) {
      m.setTarget(null);
    });
    minimapInstances = [];
  }

  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // ── Mini-map territoire (contour Grand Est avec limites départements) ──
  function initMinimapTerritoire(container) {
    if (typeof ol === 'undefined') return;

    container.dataset.olInit = 'true';

    // Contour simplifié du Grand Est (polygone approximatif)
    var grandEstCoords = [
      [3.38, 49.06], [3.57, 49.25], [3.87, 49.53], [4.23, 49.79], [4.45, 49.94],
      [4.87, 49.99], [5.19, 49.95], [5.45, 49.55], [5.82, 49.54], [6.17, 49.47],
      [6.56, 49.47], [6.86, 49.22], [7.42, 49.18], [7.87, 48.97], [8.23, 48.96],
      [8.23, 48.69], [7.80, 48.51], [7.61, 48.33], [7.53, 48.09], [7.52, 47.90],
      [7.55, 47.59], [7.38, 47.43], [7.02, 47.49], [6.84, 47.64], [6.45, 47.69],
      [5.97, 47.72], [5.65, 47.68], [5.47, 47.57], [5.12, 47.62], [4.85, 47.72],
      [4.58, 47.98], [4.35, 48.11], [4.08, 48.31], [3.89, 48.41], [3.58, 48.52],
      [3.42, 48.65], [3.38, 48.86], [3.38, 49.06]
    ];

    var coords = grandEstCoords.map(function(c) { return ol.proj.fromLonLat(c); });
    var feature = new ol.Feature({
      geometry: new ol.geom.Polygon([coords])
    });

    var vectorSource = new ol.source.Vector({ features: [feature] });
    var vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({ color: 'rgba(21,101,192,0.15)' }),
        stroke: new ol.style.Stroke({ color: '#1565C0', width: 2.5 })
      })
    });

    // Fond de carte
    var tileLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        attributions: '© CARTO © OSM'
      })
    });

    var map = new ol.Map({
      target: container,
      layers: [tileLayer, vectorLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat([6.2, 48.6]),
        zoom: 7
      }),
      controls: [],
      interactions: []
    });

    // Ajuster la vue au polygone
    var extent = vectorSource.getExtent();
    if (extent && extent[0] !== Infinity) {
      map.getView().fit(extent, { padding: [15, 15, 15, 15], maxZoom: 8 });
    }

    minimapInstances.push(map);
  }

  // ══════════════════════════════════════════════════════════════════════
  // UTILITAIRES
  // ══════════════════════════════════════════════════════════════════════

  function getIndicateursForSection(sectionId) {
    return INDICATEURS_ELU.filter(function(ind) {
      var mappedId = SECTION_MAP[ind.section];
      return mappedId === sectionId;
    });
  }

  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function lightenColor(hex, percent) {
    // Simple hex color lightener
    hex = hex.replace('#', '');
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    r = Math.min(255, r + Math.round((255 - r) * percent / 100));
    g = Math.min(255, g + Math.round((255 - g) * percent / 100));
    b = Math.min(255, b + Math.round((255 - b) * percent / 100));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // ══════════════════════════════════════════════════════════════════════
  // TOOLTIP — Popover interactif (colonne F : description)
  // ══════════════════════════════════════════════════════════════════════

  var tooltipEl = null;
  var tooltipHideTimeout = null;

  function createTooltipEl() {
    if (tooltipEl) return;
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tdb-elu-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.id = 'tdb-elu-tooltip-popover';
    document.body.appendChild(tooltipEl);
  }

  function showTooltip(btn) {
    createTooltipEl();
    clearTimeout(tooltipHideTimeout);

    var text = btn.getAttribute('data-tooltip');
    if (!text) return;

    tooltipEl.textContent = text;
    tooltipEl.classList.remove('is-visible', 'tdb-elu-tooltip--above');

    // Position calculation
    var rect = btn.getBoundingClientRect();
    var tooltipW = 300; // approximate
    var tooltipH = 60;

    // First render to get actual size
    tooltipEl.style.left = '0px';
    tooltipEl.style.top = '0px';
    tooltipEl.style.visibility = 'hidden';
    tooltipEl.style.display = 'block';
    tooltipEl.classList.add('is-visible');

    var actualW = tooltipEl.offsetWidth;
    var actualH = tooltipEl.offsetHeight;

    tooltipEl.classList.remove('is-visible');
    tooltipEl.style.visibility = '';
    tooltipEl.style.display = '';

    // Position below the button by default
    var top = rect.bottom + 8;
    var left = rect.left + (rect.width / 2) - (actualW / 2);

    // Flip above if not enough space below
    if (top + actualH > window.innerHeight - 10) {
      top = rect.top - actualH - 8;
      tooltipEl.classList.add('tdb-elu-tooltip--above');
    }

    // Keep within horizontal viewport
    if (left < 8) left = 8;
    if (left + actualW > window.innerWidth - 8) left = window.innerWidth - actualW - 8;

    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';

    // Show with animation
    requestAnimationFrame(function() {
      tooltipEl.classList.add('is-visible');
    });

    // ARIA link
    btn.setAttribute('aria-describedby', 'tdb-elu-tooltip-popover');
  }

  function hideTooltip(btn) {
    tooltipHideTimeout = setTimeout(function() {
      if (tooltipEl) {
        tooltipEl.classList.remove('is-visible');
      }
      if (btn) {
        btn.removeAttribute('aria-describedby');
      }
    }, 120);
  }

  // Event delegation on document for tooltip buttons
  document.addEventListener('mouseenter', function(e) {
    var btn = e.target.closest('.tdb-elu-tile__tooltip-btn');
    if (btn) showTooltip(btn);
  }, true);

  document.addEventListener('mouseleave', function(e) {
    var btn = e.target.closest('.tdb-elu-tile__tooltip-btn');
    if (btn) hideTooltip(btn);
  }, true);

  document.addEventListener('focusin', function(e) {
    var btn = e.target.closest('.tdb-elu-tile__tooltip-btn');
    if (btn) showTooltip(btn);
  });

  document.addEventListener('focusout', function(e) {
    var btn = e.target.closest('.tdb-elu-tile__tooltip-btn');
    if (btn) hideTooltip(btn);
  });

  // Click toggle for mobile / touch
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.tdb-elu-tile__tooltip-btn');
    if (btn) {
      e.preventDefault();
      if (tooltipEl && tooltipEl.classList.contains('is-visible')) {
        hideTooltip(btn);
      } else {
        showTooltip(btn);
      }
      return;
    }
    // Click elsewhere closes tooltip
    if (tooltipEl && tooltipEl.classList.contains('is-visible')) {
      tooltipEl.classList.remove('is-visible');
    }
  });

  // Escape key closes tooltip
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && tooltipEl && tooltipEl.classList.contains('is-visible')) {
      tooltipEl.classList.remove('is-visible');
    }
  });

  // ══════════════════════════════════════════════════════════════════════
  // ONGLETS DE TUILE — Basculer entre Chiffre / Graphique / Carto
  // ══════════════════════════════════════════════════════════════════════

  document.addEventListener('click', function(e) {
    var tabBtn = e.target.closest('.tdb-elu-tile__tab');
    if (!tabBtn) return;

    var tabsBar = tabBtn.closest('.tdb-elu-tile__tabs');
    if (!tabsBar) return;

    var tile = tabBtn.closest('.tdb-elu-tile');
    if (!tile) return;

    var targetPanel = tabBtn.getAttribute('data-tab');

    // Désactiver tous les onglets
    tabsBar.querySelectorAll('.tdb-elu-tile__tab').forEach(function(t) {
      t.classList.remove('is-active');
    });
    tabBtn.classList.add('is-active');

    // Basculer les panneaux
    tile.querySelectorAll('.tdb-elu-tile__panel').forEach(function(panel) {
      if (panel.getAttribute('data-panel') === targetPanel) {
        panel.classList.add('is-active');
      } else {
        panel.classList.remove('is-active');
      }
    });

    // Si on affiche un panel carto, initialiser la mini-carte si pas déjà fait
    if (targetPanel === 'carto') {
      var minimap = tile.querySelector('.tdb-elu-tile__minimap');
      if (minimap && !minimap.dataset.initialized) {
        initSingleMinimap(minimap);
        minimap.dataset.initialized = 'true';
      }
    }

    // Si on affiche un panel graphique, re-render le chart (Canvas resize)
    if (targetPanel === 'graphique') {
      var canvas = tile.querySelector('.tdb-elu-tile__panel[data-panel="graphique"] canvas');
      if (canvas && canvas.id) {
        var existingChart = chartInstances.find(function(c) {
          return c.canvas && c.canvas.id === canvas.id;
        });
        if (existingChart) {
          existingChart.resize();
        } else {
          // Chart pas encore créé (panel était masqué) → le créer
          initSingleChart(canvas);
        }
      }
    }
  });

  // Initialiser une seule mini-carte
  function initSingleMinimap(container) {
    if (typeof ol === 'undefined' || typeof GEO_DATA_ELU === 'undefined') return;

    var indId = container.dataset.indId;
    var geoInfo = GEO_MAPPING_ELU[indId];
    if (!geoInfo || geoInfo.type === 'none' || geoInfo.type === 'lien_externe') return;

    var geoColor = geoInfo.color || '#1565C0';
    var geoData = GEO_DATA_ELU[geoInfo.data];
    if (!geoData) return;

    var tileLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        attributions: '© CARTO © OSM'
      })
    });

    var features = [];
    if (geoInfo.type === 'points') {
      geoData.forEach(function(coord) {
        features.push(new ol.Feature({ geometry: new ol.geom.Point(ol.proj.fromLonLat(coord)) }));
      });
    } else if (geoInfo.type === 'polygons') {
      geoData.forEach(function(ring) {
        var coords = ring.map(function(c) { return ol.proj.fromLonLat(c); });
        features.push(new ol.Feature({ geometry: new ol.geom.Polygon([coords]) }));
      });
    }

    var style = (geoInfo.type === 'points') ?
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({ color: geoColor }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 1.5 })
        })
      }) :
      new ol.style.Style({
        fill: new ol.style.Fill({ color: hexToRgba(geoColor, 0.25) }),
        stroke: new ol.style.Stroke({ color: geoColor, width: 1.5 })
      });

    var vectorSource = new ol.source.Vector({ features: features });
    var vectorLayer = new ol.layer.Vector({ source: vectorSource, style: style });

    var map = new ol.Map({
      target: container,
      layers: [tileLayer, vectorLayer],
      view: new ol.View({ center: ol.proj.fromLonLat([6.5, 48.5]), zoom: 7 }),
      controls: [],
      interactions: []
    });

    if (features.length > 0) {
      var extent = vectorSource.getExtent();
      if (extent && extent[0] !== Infinity) {
        map.getView().fit(extent, { padding: [20, 20, 20, 20], maxZoom: 10 });
      }
    }

    minimapInstances.push(map);
  }

  // Initialiser un seul chart (pour lazy init quand onglet graphique est cliqué)
  function initSingleChart(canvas) {
    if (typeof Chart === 'undefined') return;

    var indId = canvas.dataset.indId;
    var chartType = canvas.dataset.chartType || 'donut';
    var ind = INDICATEURS_ELU.find(function(i) { return i.id === indId; });
    if (!ind || !ind.fakeData || !ind.fakeData.chartData) return;

    var cd = ind.fakeData.chartData;
    var ctx = canvas.getContext('2d');

    var config;
    if (chartType === 'donut') {
      config = {
        type: 'doughnut',
        data: {
          labels: cd.labels,
          datasets: [{ data: cd.values, backgroundColor: cd.colors, borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8 } } }
        }
      };
    } else {
      config = {
        type: 'bar',
        data: {
          labels: cd.labels,
          datasets: [{ data: cd.values, backgroundColor: cd.colors.length > 1 ? cd.colors : cd.colors[0], borderRadius: 4, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 } } },
            y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 9 } } }
          }
        }
      };
    }

    var chart = new Chart(ctx, config);
    chartInstances.push(chart);
  }

  // ══════════════════════════════════════════════════════════════════════
  // MODE COMPARAISON
  // ══════════════════════════════════════════════════════════════════════

  function renderCompareLayout(indicateurs, sec, sectionId) {
    var html = '';
    html += '<div class="tdb-elu-compare-layout">';

    // ── Colonne gauche : territoire principal ──
    html += '<div class="tdb-elu-compare-col">';
    html += '  <div class="tdb-elu-compare-col__header tdb-elu-compare-col__header--left">';
    html += '    <i class="ph ph-map-pin"></i>';
    html += '    <span>' + escHtml(eluTerritoire || 'Territoire principal') + '</span>';
    html += '  </div>';
    html += '  <div class="tdb-elu-grid" id="tdb-elu-tiles-grid">';
    if (sectionId === 'fiche-identite') {
      html += renderTileCartoTerritoire();
      html += renderTilePresentation();
    }
    html += renderTiles(indicateurs, sec.color);
    html += '  </div>';
    html += '</div>';

    // ── Colonne droite : territoire comparé ──
    html += '<div class="tdb-elu-compare-col">';
    html += '  <div class="tdb-elu-compare-col__header tdb-elu-compare-col__header--right">';
    html += '    <i class="ph ph-map-pin"></i>';
    html += '    <span>' + escHtml(compareTerritoire.nom) + '</span>';
    html += '  </div>';
    html += '  <div class="tdb-elu-grid" id="tdb-elu-tiles-grid-compare">';
    if (sectionId === 'fiche-identite') {
      html += renderTileCartoTerritoire('-cmp');
      html += renderTilePresentation();
    }
    html += renderTilesCompare(indicateurs, sec.color);
    html += '  </div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderTilesCompare(indicateurs, color) {
    // Rendu des tuiles pour le territoire comparé (fake data variée)
    var html = '';
    indicateurs.forEach(function(ind) {
      html += renderTileUnified(ind, color, true);
    });
    return html;
  }

  function bindCompareButton() {
    var btn = document.getElementById('tdb-elu-btn-compare');
    if (!btn) return;

    btn.addEventListener('click', function() {
      if (compareMode) {
        // Fermer la comparaison
        compareMode = false;
        compareTerritoire = null;
        renderSection(activeSection);
      } else {
        // Ouvrir la lightbox
        openCompareModal();
      }
    });
  }

  // ── Lightbox de sélection ──────────────────────────────────────────
  function openCompareModal() {
    var overlay = document.getElementById('tdb-elu-compare-overlay');
    if (!overlay) return;

    // Remplir le select échelle
    var selEchelle = document.getElementById('tdb-elu-compare-echelle');
    if (selEchelle && typeof TERRITOIRES !== 'undefined') {
      selEchelle.innerHTML = '';
      Object.keys(TERRITOIRES).forEach(function(e) {
        var opt = document.createElement('option');
        opt.value = e;
        opt.textContent = e;
        if (e === 'Commune' && TERRITOIRES[e].length === 0) {
          opt.textContent = 'Commune (chargement…)';
        }
        selEchelle.appendChild(opt);
      });
      selEchelle.value = eluEchelle;
    }

    // Reset
    var searchInput = document.getElementById('tdb-elu-compare-search');
    var validateBtn = document.getElementById('tdb-elu-compare-validate');
    var sugList = document.getElementById('tdb-elu-compare-suggestions');
    if (searchInput) searchInput.value = '';
    if (validateBtn) validateBtn.disabled = true;
    if (sugList) { sugList.innerHTML = ''; sugList.classList.remove('is-visible'); }

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');

    // Focus sur le champ recherche
    setTimeout(function() { if (searchInput) searchInput.focus(); }, 200);
  }

  function closeCompareModal() {
    var overlay = document.getElementById('tdb-elu-compare-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  // ── Gestion événements lightbox (delegation au DOMContentLoaded) ──
  document.addEventListener('DOMContentLoaded', function() {
    var selectedCompare = null;

    // Fermer overlay
    var closeBtn = document.getElementById('tdb-elu-compare-close');
    var overlay = document.getElementById('tdb-elu-compare-overlay');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCompareModal);
    }
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeCompareModal();
      });
    }

    // Échap ferme la modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) {
        closeCompareModal();
      }
    });

    // Select échelle change → reset search
    var selEchelle = document.getElementById('tdb-elu-compare-echelle');
    var searchInput = document.getElementById('tdb-elu-compare-search');
    var sugList = document.getElementById('tdb-elu-compare-suggestions');
    var validateBtn = document.getElementById('tdb-elu-compare-validate');

    if (selEchelle) {
      selEchelle.addEventListener('change', function() {
        if (searchInput) {
          searchInput.value = '';
          searchInput.placeholder = 'Rechercher dans ' + this.value + '…';
        }
        if (sugList) { sugList.innerHTML = ''; sugList.classList.remove('is-visible'); }
        selectedCompare = null;
        if (validateBtn) validateBtn.disabled = true;
      });
    }

    // Recherche dans la lightbox
    if (searchInput && sugList) {
      var debounce = null;

      searchInput.addEventListener('input', function() {
        clearTimeout(debounce);
        var q = this.value.trim();
        selectedCompare = null;
        if (validateBtn) validateBtn.disabled = true;
        if (q.length < 2) {
          sugList.innerHTML = '';
          sugList.classList.remove('is-visible');
          return;
        }
        debounce = setTimeout(function() {
          showCompareResults(q);
        }, 150);
      });

      searchInput.addEventListener('focus', function() {
        var q = this.value.trim();
        if (q.length >= 2) {
          showCompareResults(q);
        } else {
          showCompareDefaults();
        }
      });
    }

    function showCompareResults(query) {
      if (typeof TERRITOIRES === 'undefined') return;
      var q = query.toLowerCase();
      var ech = selEchelle ? selEchelle.value : 'Département';
      var items = TERRITOIRES[ech] || [];
      var resultats = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].toLowerCase().indexOf(q) !== -1) {
          resultats.push(items[i]);
        }
        if (resultats.length >= 10) break;
      }
      renderCompareList(resultats, ech);
    }

    function showCompareDefaults() {
      if (typeof TERRITOIRES === 'undefined') return;
      var ech = selEchelle ? selEchelle.value : 'Département';
      var items = TERRITOIRES[ech] || [];
      var resultats = items.slice(0, 10);
      renderCompareList(resultats, ech);
    }

    function renderCompareList(resultats, echelle) {
      sugList.innerHTML = '';
      if (resultats.length === 0) {
        sugList.innerHTML = '<li style="color:#94A3B8;font-style:italic;padding:10px 14px;font-size:12px;">Aucun résultat</li>';
      } else {
        resultats.forEach(function(nom) {
          var li = document.createElement('li');
          li.textContent = nom;
          li.addEventListener('click', function() {
            selectedCompare = { nom: nom, echelle: echelle };
            if (searchInput) searchInput.value = nom;
            sugList.classList.remove('is-visible');
            if (validateBtn) validateBtn.disabled = false;
          });
          sugList.appendChild(li);
        });
      }
      sugList.classList.add('is-visible');
    }

    // Validation
    if (validateBtn) {
      validateBtn.addEventListener('click', function() {
        if (!selectedCompare) return;
        compareTerritoire = selectedCompare;
        compareMode = true;
        closeCompareModal();
        renderSection(activeSection);
      });
    }
  });

})();
