/**
 * tableau-de-bord-elu-v2.js
 * ═══════════════════════════════════════════════════════════════════════
 * V2 — Moteur de rendu du Tableau de bord Élu
 * 1 Tuile = N indicateurs (logique zoning Canva)
 * Carte interactive drill-down (style DVF Notaires)
 * ═══════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  var navContainer, contentContainer;
  var activeSection = null;
  var chartInstances = [];
  var govChartInstances = []; // Charts sous-onglets Usages (séparés pour ne pas détruire les charts Ressource)

  // Territoire courant (null = Grand Est / région)
  var currentTerritoire = null; // { code, nom, type, data } ou null

  // Sous-onglet actif dans la section Gouvernance
  var govActiveTab = 'eau-potable';

  // Carte drill-down
  var drillMap = null;
  var drillLayer = null;
  var drillLevel = 'region'; // 'region' | 'departement' | 'epci'
  var drillParent = null;    // code département courant si drill epci
  var drillTooltipEl = null;

  // ── Initialisation ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    navContainer = document.getElementById('tdb-elu2-nav');
    contentContainer = document.getElementById('tdb-elu2-content');
    if (!navContainer || !contentContainer) return;

    renderNav();
    activateSection(SECTIONS_ELU_V2[0].id);
    initMiniHeroScroll();
    initInfoTooltip();
  });

  // ── API minimale exposée pour l'outil de comparaison (js/tdb-elu-v2-compare.js) ──
  window.__tdbActivateSection = function(id) { activateSection(id); };
  window.__tdbGetSection = function() { return activeSection; };
  window.__tdbRecheckSticky = function() { recheckMiniHero(); };
  window.__tdbSwitchTerritoire = function(code, nom) { switchTerritoire(code, nom); };
  window.__tdbGetTerritoire = function() {
    return currentTerritoire
      ? { code: currentTerritoire.code, nom: currentTerritoire.nom, type: currentTerritoire.data ? currentTerritoire.data.type : '' }
      : null;
  };

  // ── Mini-bandeau territoire + masquage page-header au scroll ────────
  var miniHeroEl = null;
  var miniHeroVisible = false;
  var pageHeader = null;

  function initMiniHeroScroll() {
    pageHeader = document.getElementById('tdb-page-header');

    // Créer le mini-bandeau
    var el = document.createElement('div');
    el.id = 'tdb-elu2-mini-hero';
    el.className = 'tdb-elu2-mini-hero';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="tdb-elu2-mini-hero__inner">'
      + '<div class="tdb-elu2-mini-hero__left">'
      + '<span class="tdb-elu2-mini-hero__name" id="tdb-elu2-mini-hero-name">Grand Est</span>'
      + '<span class="tdb-elu2-mini-hero__type" id="tdb-elu2-mini-hero-type">R\u00e9gion</span>'
      + '</div>'
      + '<div class="tdb-elu2-mini-hero__kpis">'
      + '<span class="tdb-elu2-mini-hero__kpi"><i class="ph ph-ruler"></i> <span id="tdb-elu2-mini-hero-surf">57 441</span> km\u00b2</span>'
      + '<span class="tdb-elu2-mini-hero__sep"></span>'
      + '<span class="tdb-elu2-mini-hero__kpi"><i class="ph ph-users"></i> <span id="tdb-elu2-mini-hero-pop">5 562 651</span> hab.</span>'
      + '</div></div>';
    document.body.appendChild(el);
    miniHeroEl = el;

    window.addEventListener('scroll', onStickyScroll, { passive: true });
  }

  function onStickyScroll() {
    if (!miniHeroEl) return;

    // En mode comparaison, l'en-tête des deux colonnes joue le rôle du Hero
    var hero = document.querySelector('.tdb-elu2-compare.is-active .tdb-elu2-compare__col') || document.querySelector('.tdb-elu2-hero');
    // En comparaison, on mesure le haut de la colonne (son en-tête est collant et ne sort jamais de l'écran)
    var cmpCol = hero && hero.classList.contains('tdb-elu2-compare__col');
    var siteHeader = document.querySelector('.orege-header');
    var headerH = siteHeader ? siteHeader.offsetHeight : 72;
    // Le bandeau s'affiche dès que le Hero (ou l'en-tête de colonne en comparaison) passe sous les barres collantes
    // Seuil fixe (hauteur mémorisée de la barre bleu foncé) pour éviter tout clignotement
    if (pageHeader && !pageHeader.classList.contains('is-hidden') && pageHeader.offsetHeight) pageHeader._stickyH = pageHeader.offsetHeight;
    var stickyBottom = headerH + ((pageHeader && pageHeader._stickyH) || 0);
    var heroGone = hero
      ? (cmpCol ? hero.getBoundingClientRect().top + 80 < stickyBottom : hero.getBoundingClientRect().bottom < stickyBottom)
      : false;

    // 1) Masquer le page-header violet quand le Hero sort
    if (pageHeader) {
      pageHeader.classList.toggle('is-hidden', heroGone);
    }

    // 2) Positionner le mini-hero juste sous le header site (à la place du page-header)
    miniHeroEl.style.top = headerH + 'px';

    // 3) Montrer/cacher le mini-hero
    if (heroGone !== miniHeroVisible) {
      miniHeroVisible = heroGone;
      miniHeroEl.classList.toggle('is-visible', heroGone);
      miniHeroEl.setAttribute('aria-hidden', heroGone ? 'false' : 'true');
    }
  }

  // Appelé après chaque switch d'onglet pour re-évaluer l'état
  function recheckMiniHero() {
    // Petit délai pour laisser le DOM se mettre à jour
    setTimeout(function() { onStickyScroll(); }, 50);
  }

  function updateMiniHero() {
    var d = currentTerritoire ? currentTerritoire.data : null;
    var nameEl = document.getElementById('tdb-elu2-mini-hero-name');
    var typeEl = document.getElementById('tdb-elu2-mini-hero-type');
    var surfEl = document.getElementById('tdb-elu2-mini-hero-surf');
    var popEl  = document.getElementById('tdb-elu2-mini-hero-pop');
    if (nameEl) nameEl.textContent = d ? d.nom : 'Grand Est';
    if (typeEl) typeEl.textContent = d ? d.type : 'R\u00e9gion';
    if (surfEl) surfEl.textContent = d ? d.superficie : '57 441';
    if (popEl)  popEl.textContent  = d ? d.population : '5 562 651';
  }

  // ══════════════════════════════════════════════════════════════════════
  // NAVIGATION ONGLETS
  // ══════════════════════════════════════════════════════════════════════
  function renderNav() {
    var html = '';
    SECTIONS_ELU_V2.forEach(function(sec) {
      // RGAA 7.1 : motif d'onglets ARIA (role=tab + aria-selected + aria-controls)
      html += '<button class="tdb-elu2-nav__btn" data-section="' + sec.id + '" type="button" role="tab" id="tdb-elu2-tab-' + sec.id + '" aria-controls="tdb-elu2-content" aria-selected="false" tabindex="-1">';
      html += '  <i class="ph ' + sec.icon + '" aria-hidden="true"></i>';
      html += '  <span class="tdb-elu2-nav__label-full">' + escHtml(sec.label) + '</span>';
      html += '  <span class="tdb-elu2-nav__label-short">' + escHtml(sec.shortLabel || sec.label) + '</span>';
      html += '</button>';
    });
    navContainer.innerHTML = html;

    navContainer.addEventListener('click', function(e) {
      var btn = e.target.closest('.tdb-elu2-nav__btn');
      if (!btn) return;
      activateSection(btn.dataset.section);
    });
  }

  function activateSection(sectionId) {
    activeSection = sectionId;

    // Update nav
    navContainer.querySelectorAll('.tdb-elu2-nav__btn').forEach(function(b) {
      var isA = b.dataset.section === sectionId;
      b.classList.toggle('is-active', isA);
      b.setAttribute('aria-selected', isA ? 'true' : 'false');
      b.setAttribute('tabindex', isA ? '0' : '-1');
    });
    contentContainer.setAttribute('role', 'tabpanel');
    contentContainer.setAttribute('aria-labelledby', 'tdb-elu2-tab-' + sectionId);

    destroyCharts();
    destroyGovCharts();
    destroyGovActionCharts();
    destroyVulnCharts();
    destroyDrillMap();
    destroyAmenagementMaps();
    destroyRessourceUsageMaps();
    destroyGouvernanceMaps();
    renderSection(sectionId);
    recheckMiniHero();

    // Remonter en haut de la page au changement d'onglet
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ══════════════════════════════════════════════════════════════════════
  // RENDU SECTION
  // ══════════════════════════════════════════════════════════════════════
  function renderSection(sectionId) {
    var tuiles = TUILES_ELU_V2[sectionId];

    if (!tuiles || tuiles.length === 0) {
      contentContainer.innerHTML = '<div class="tdb-elu2-section">' + renderTerritoryBanner() + '<div id="tdb-elu2-section-body"><p style="color:var(--elu2-muted);font-style:italic;text-align:center;padding:60px 0">Cette section sera disponible prochainement avec le zoning correspondant.</p></div></div>';
      initDrillMap();
      return;
    }

    if (sectionId === 'fiche-identite') {
      contentContainer.innerHTML = renderFicheIdentite(tuiles);
      initFicheCharts();
      initDrillMap();
    } else if (sectionId === 'amenagement') {
      contentContainer.innerHTML = renderAmenagement(tuiles);
      initAmenagementCharts();
      initDrillMap();
      initAmenagementMaps();
    } else if (sectionId === 'gouvernance') {
      contentContainer.innerHTML = renderGouvernancePage(tuiles);
      initDrillMap();
      bindGouvernanceTree();
      initGovActionCharts();
    } else if (sectionId === 'ressource-usage') {
      govActiveTab = 'eau-potable';
      contentContainer.innerHTML = renderRessourceUsage(tuiles);
      initRessourceUsageCharts();
      initRessourceUsageMaps();
      initDrillMap();
      initGouvernanceCharts();
      initGouvernanceMaps();
    } else if (sectionId === 'vulnerabilite') {
      vulnActiveView = 'annuel';
      contentContainer.innerHTML = renderVulnerabilitePage(tuiles);
      initDrillMap();
      initVulnerabiliteCharts();
    }
    // Injecter les sources en bas de chaque tuile
    setTimeout(injectTuileSources, 100);
  }

  // ══════════════════════════════════════════════════════════════════════
  // BANDEAU TERRITOIRE — Tuile compacte en haut de chaque onglet
  // ══════════════════════════════════════════════════════════════════════
  function renderTerritoryBanner() {
    // Réutilise la tuile Hero de la section fiche-identite
    var heroTuile = null;
    var ficheTuiles = TUILES_ELU_V2['fiche-identite'];
    if (ficheTuiles) {
      ficheTuiles.forEach(function(tu) {
        if (tu.zone === 'hero') heroTuile = tu;
      });
    }
    return renderHero(heroTuile);
  }

  // ══════════════════════════════════════════════════════════════════════
  // FICHE D'IDENTITÉ — Rendu complet
  // ══════════════════════════════════════════════════════════════════════
  function renderFicheIdentite(tuiles) {
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });

    var html = '<div class="tdb-elu2-section">';

    // ── HERO : Nom du territoire ──────────────────────────────
    html += renderHero(t['hero']);

    // ── Banner : Démographie ──────────────────────────────────
    html += '<div class="tdb-elu2-banner"><i class="ph ph-users-three"></i> Démographie</div>';
    html += renderDemographie(t['demographie']);

    // ── Banner : Ressources en eau ────────────────────────────
    html += '<div class="tdb-elu2-banner"><i class="ph ph-drop"></i> Ressources en eau</div>';

    // ── Eaux superficielles + souterraines ────────────────────
    html += '<div class="tdb-elu2-ressources-row">';
    html += renderRessourceCard(t['ressources-superficielles'], 'surface');
    html += renderRessourceCard(t['ressources-souterraines'], 'souterrain');
    html += '</div>';

    // ── Banner : Usages et pressions ──────────────────────────
    html += '<div class="tdb-elu2-banner"><i class="ph ph-factory"></i> Usages et pressions</div>';

    // ── Services + Captages ───────────────────────────────────
    html += '<div class="tdb-elu2-bottom-row">';
    html += renderServices(t['services']);
    html += renderCaptages(t['captages']);
    html += '</div>';

    // ── Prélèvements (pleine largeur) ─────────────────────────
    html += renderPrelevements(t['prelevements']);

    html += '</div>';
    return html;
  }

  // ── Hero tile ───────────────────────────────────────────────
  function renderHero(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);

    var html = '<div class="tdb-elu2-card tdb-elu2-hero">';
    html += '<div class="tdb-elu2-hero__info">';
    html += '  <div>';
    // RGAA 9.1 : un seul H1 par page (« Tableau de bord Élu ») → le nom du territoire est un H2
    html += '    <h2 class="tdb-elu2-hero__title">' + escHtml(ind['TERRITOIRE_NOM'] ? ind['TERRITOIRE_NOM'].fakeValue : 'Grand Est') + '</h2>';
    html += '    <div class="tdb-elu2-hero__type">' + escHtml(ind['TERRITOIRE_TYPE'] ? ind['TERRITOIRE_TYPE'].fakeValue : '') + '</div>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-hero__kpis">';
    // Superficie
    var surf = ind['TERRITOIRE_SURF'];
    if (surf) {
      html += '<div class="tdb-elu2-hero__kpi">';
      html += '  <div class="tdb-elu2-hero__kpi-icon"><i class="ph ph-ruler"></i></div>';
      html += '  <div><div class="tdb-elu2-hero__kpi-label">Superficie' + renderInfobulle('TERRITOIRE_SURF') + '</div>';
      html += '  <div class="tdb-elu2-hero__kpi-val">' + escHtml(surf.fakeValue) + ' <span class="tdb-elu2-hero__kpi-unit">' + escHtml(surf.unite) + '</span></div></div>';
      html += '</div>';
    }
    // Population
    var pop = ind['TERRITOIRE_POP'];
    if (pop) {
      html += '<div class="tdb-elu2-hero__kpi">';
      html += '  <div class="tdb-elu2-hero__kpi-icon"><i class="ph ph-users"></i></div>';
      html += '  <div><div class="tdb-elu2-hero__kpi-label">Population' + renderInfobulle('TERRITOIRE_POP') + '</div>';
      html += '  <div class="tdb-elu2-hero__kpi-val">' + escHtml(pop.fakeValue) + ' <span class="tdb-elu2-hero__kpi-unit">' + escHtml(pop.unite) + '</span></div></div>';
      html += '</div>';
    }
    html += '  </div>';
    html += '</div>';

    // Carte
    html += '<div class="tdb-elu2-hero__map">';
    html += '  <div id="tdb-elu2-drillmap" class="tdb-elu2-drillmap"></div>';
    html += '  <div id="tdb-elu2-drillmap-breadcrumb" class="tdb-elu2-drillmap__breadcrumb"></div>';
    html += '  <div id="tdb-elu2-drillmap-tooltip" class="tdb-elu2-drillmap__tooltip"></div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ── Démographie ─────────────────────────────────────────────
  function renderDemographie(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var densite = ind['TERRITOIRE_DENSITE'];
    var ruralite = ind['TERRITOIRE_RURALITE'];
    var tendance = ind['TERRITOIRE_POP_TENDANCE'];
    var evol = ind['TERRITOIRE_POP_EVOL'];

    var html = '<div class="tdb-elu2-card tdb-elu2-demo">';

    // KPIs gauche (1/3) — avec icônes comme le Hero
    html += '<div class="tdb-elu2-demo__kpis">';
    if (densite) {
      html += '<div class="tdb-elu2-demo__kpi">';
      html += '  <div class="tdb-elu2-demo__kpi-icon"><i class="ph ph-grid-four"></i></div>';
      html += '  <div>';
      html += '    <div class="tdb-elu2-demo__kpi-label">Densit\u00e9' + renderInfobulle('TERRITOIRE_DENSITE') + '</div>';
      html += '    <div class="tdb-elu2-demo__kpi-val">' + escHtml(densite.fakeValue) + ' <span class="tdb-elu2-demo__kpi-unit">' + escHtml(densite.unite) + '</span></div>';
      html += '    <div class="tdb-elu2-demo__kpi-sub">Moyenne Grand Est : 97 hab/km\u00b2</div>';
      html += '  </div>';
      html += '</div>';
    }
    if (ruralite) {
      html += '<div class="tdb-elu2-demo__kpi">';
      html += '  <div class="tdb-elu2-demo__kpi-icon"><i class="ph ph-tree"></i></div>';
      html += '  <div>';
      html += '    <div class="tdb-elu2-demo__kpi-label">Ruralit\u00e9' + renderInfobulle('TERRITOIRE_RURALITE') + '</div>';
      html += '    <div class="tdb-elu2-demo__kpi-val">' + escHtml(ruralite.fakeValue) + '</div>';
      
      html += '  </div>';
      html += '</div>';
    }
    html += '</div>';

    // Graphique droite
    html += '<div class="tdb-elu2-demo__chart-wrap">';
    html += '<div class="tdb-elu2-demo__chart-header">';
    html += '  <span class="tdb-elu2-demo__chart-title">Évolution de la population' + renderInfobulle('TERRITOIRE_POP_EVOL') + '</span>';
    if (tendance) {
      // Tendance calculée sur toute la période du graphique (2006-2023)
      var evolInd = (tu.indicateurs || []).find(function(i) { return i.id === 'TERRITOIRE_POP_EVOL'; });
      var cdEvol = evolInd && evolInd.fakeChartData;
      var tr = cdEvol ? popTrend(cdEvol.values, cdEvol.labels) : null;
      var dir = tr ? tr.dir : (tendance.fakeTrendDir || 'neutral');
      var icon = dir === 'up' ? 'ph-arrow-up-right' : dir === 'down' ? 'ph-arrow-down-right' : 'ph-arrow-right';
      html += '  <span class="tdb-elu2-trend-badge tdb-elu2-trend-badge--' + dir + '">';
      html += '    <i class="ph ' + icon + '"></i> ' + escHtml(tr ? tr.label : (tendance.fakeTrend || tendance.fakeValue || ''));
      html += '  </span>';
    }
    html += '</div>';
    html += '<div class="tdb-elu2-demo__chart-canvas">';
    html += '  <canvas id="chart-v2-evolution" data-chart-v2="evolution"></canvas>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ── Ressource card ──────────────────────────────────────────
  function renderRessourceCard(tu, variant) {
    if (!tu) return '';
    var html = '<div class="tdb-elu2-card tdb-elu2-ressource-card--' + variant + '">';
    html += '<div class="tdb-elu2-ressource-card__title">';
    html += '  <i class="ph ' + (variant === 'surface' ? 'ph-waves' : 'ph-drop-half-bottom') + '"></i>';
    html += '  ' + escHtml(tu.tuile) + renderTuileInfobulle(tu);
    html += '</div>';
    html += '<div class="tdb-elu2-ressource-card__list">';

    // Séparer indicateurs normaux et indicateurs % (état des masses d'eau)
    var normalInds = [];
    var gaugeInds = [];
    tu.indicateurs.forEach(function(ind) {
      var isEtat = ind.unite === '%' && (ind.nom.indexOf('en bon') >= 0 || ind.nom.indexOf('en très') >= 0 || ind.nom.indexOf('en tres') >= 0);
      if (isEtat) {
        gaugeInds.push(ind);
      } else {
        normalInds.push(ind);
      }
    });

    // Afficher les indicateurs normaux (liste classique)
    normalInds.forEach(function(ind) {
      html += '<div class="tdb-elu2-ressource-card__item">';
      html += '  <span class="tdb-elu2-ressource-card__item-label">' + escHtml(ind.nom) + renderInfobulle(ind.id) + '</span>';
      html += '  <span class="tdb-elu2-ressource-card__item-val">' + escHtml(ind.fakeValue || '—');
      if (ind.unite && ind.unite !== '' && ind.unite !== 'Nombre') {
        html += ' <small style="font-size:12px;font-weight:500;color:var(--elu2-muted)">' + escHtml(ind.unite) + '</small>';
      }
      html += '</span>';
      html += '</div>';
    });

    html += '</div>';

    // Afficher les jauges état des masses d'eau
    if (gaugeInds.length > 0) {
      html += '<div class="tdb-elu2-ressource-card__etat">';
      html += '  <div class="tdb-elu2-ressource-card__etat-title">État des masses d\'eau (DCE 2025) :</div>';
      html += '  <div class="tdb-elu2-ressource-card__etat-gauges">';
      gaugeInds.forEach(function(ind) {
        var pct = parseFloat(ind.fakeValue) || 0;
        // Raccourcir le label : retirer "Masses d'eau superficielles/souterraines "
        var label = ind.nom.replace(/Masses d'eau (superficielles|souterraines) /i, '');
        label = label.charAt(0).toUpperCase() + label.slice(1);
        // Couleur : bleu pour écolo/quanti, vert pour chimique
        var color = (label.indexOf('chimique') >= 0) ? '#2E7D32' : '#1565C0';
        html += renderGaugeSVG(pct, color, label);
      });
      html += '  </div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // ── Prélèvements ────────────────────────────────────────────
  function renderPrelevements(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var volAnnee = ind['PREL_ANNEE'];

    var html = '<div class="tdb-elu2-card tdb-elu2-prelevements">';
    html += '<div class="tdb-elu2-prelevements__title"><i class="ph ph-chart-bar"></i> Historique des pr\u00e9l\u00e8vements' + renderInfobulle('PREL_USAGE_PAR_CAT') + '</div>';
    html += '<div class="tdb-elu2-prelevements__body">';
    html += '  <div class="tdb-elu2-prelevements__chart">';
    html += '    <canvas id="chart-v2-prelevements" data-chart-v2="prelevements"></canvas>';
    html += '    <div class="tdb-elu2-prelevements__scroll-hint"><i class="ph ph-arrow-right"></i> Glisser pour voir toutes les années</div>';
    html += '  </div>';
    if (volAnnee) {
      html += '  <div class="tdb-elu2-prelevements__kpi">';
      html += '    <div class="tdb-elu2-prelevements__volume-val">' + escHtml(volAnnee.fakeValue) + '</div>';
      html += '    <div class="tdb-elu2-prelevements__volume-unit">' + escHtml(volAnnee.unite) + '</div>';
      html += '    <div class="tdb-elu2-prelevements__volume-label">Volume prélevé 2023' + renderInfobulle('PREL_ANNEE') + '</div>';
      html += '  </div>';
    }
    html += '</div>';

    // Légende custom avec pictos (couleurs charte Grand Est)
    html += '<div class="tdb-elu2-prelevements__legend">';
    html += '  <div class="tdb-elu2-prelevements__legend-item">';
    html += '    <span class="tdb-elu2-prelevements__legend-dot" style="background:#ED7D31"></span>';
    html += '    <i class="ph ph-tractor" style="color:#ED7D31"></i>';
    html += '    <span>Usages agricoles</span>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-prelevements__legend-item">';
    html += '    <span class="tdb-elu2-prelevements__legend-dot" style="background:#A5A5A5"></span>';
    html += '    <i class="ph ph-factory" style="color:#A5A5A5"></i>';
    html += '    <span>Usages industriels</span>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-prelevements__legend-item">';
    html += '    <span class="tdb-elu2-prelevements__legend-dot" style="background:#4472C4"></span>';
    html += '    <i class="ph ph-lightning" style="color:#4472C4"></i>';
    html += '    <span>Refroidissement centrales</span>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-prelevements__legend-item">';
    html += '    <span class="tdb-elu2-prelevements__legend-dot" style="background:#FFC000"></span>';
    html += '    <i class="ph ph-boat" style="color:#FFC000"></i>';
    html += '    <span>Alimentation des canaux</span>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-prelevements__legend-item">';
    html += '    <span class="tdb-elu2-prelevements__legend-dot" style="background:#5B9BD5"></span>';
    html += '    <i class="ph ph-drop" style="color:#5B9BD5"></i>';
    html += '    <span>Production d\'eau potable</span>';
    html += '  </div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ── Services ────────────────────────────────────────────────
  function renderServices(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var prixEau = ind['PRIX_AEP_CARTO'];
    var prixAss = ind['PRIX_AC_CARTO'];

    var html = '<div class="tdb-elu2-card tdb-elu2-services">';
    html += '<div class="tdb-elu2-services__title"><i class="ph ph-wrench"></i> Services de l\'eau' + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-services__grid">';
    if (prixEau) {
      html += '<div class="tdb-elu2-services__item">';
      html += '  <div class="tdb-elu2-services__item-val">' + escHtml(prixEau.fakeValue) + '</div>';
      html += '  <div class="tdb-elu2-services__item-unit">' + escHtml(prixEau.unite) + '</div>';
      html += '  <div class="tdb-elu2-services__item-label">Prix de l\'eau' + renderInfobulle('PRIX_AEP_CARTO') + '</div>';
      html += '</div>';
    }
    if (prixAss) {
      html += '<div class="tdb-elu2-services__item">';
      html += '  <div class="tdb-elu2-services__item-val">' + escHtml(prixAss.fakeValue) + '</div>';
      html += '  <div class="tdb-elu2-services__item-unit">' + escHtml(prixAss.unite) + '</div>';
      html += '  <div class="tdb-elu2-services__item-label">Prix assainissement' + renderInfobulle('PRIX_AC_CARTO') + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  // ── Captages ────────────────────────────────────────────────
  function renderCaptages(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var captDeg = ind['CAPTAGE_DEGRADE_NB'];
    var aac = ind['AAC_RATIO'];

    var html = '<div class="tdb-elu2-card tdb-elu2-captages">';
    html += '<div class="tdb-elu2-captages__title"><i class="ph ph-target"></i> Captages' + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-captages__grid">';
    if (captDeg) {
      html += '<div class="tdb-elu2-captages__item">';
      html += '  <div class="tdb-elu2-captages__item-val">' + escHtml(captDeg.fakeValue) + '</div>';
      html += '  <div class="tdb-elu2-captages__item-label">Captages dégradés' + renderInfobulle('CAPTAGE_DEGRADE_NB') + '</div>';
      html += '</div>';
    }
    if (aac) {
      html += '<div class="tdb-elu2-captages__item tdb-elu2-captages__item--gauge">';
      html += renderGaugeSVG(parseFloat(aac.fakeValue) || 0, '#7B1FA2', 'Territoire couvert par une AAC');
      html += '</div>';
    }
    html += '</div>';
    html += '<a href="https://www.deaumineau.fr" target="_blank" rel="noopener" class="tdb-elu2-captages__link">';
    html += '  <i class="ph ph-arrow-square-out"></i> Accéder à Deaumin\'eau';
    html += '</a>';
    html += '</div>';
    return html;
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHARTS — Initialisation des graphiques Chart.js
  // ══════════════════════════════════════════════════════════════════════
  function initFicheCharts() {
    if (typeof Chart === 'undefined') return;

    // Évolution population (line chart)
    var evoCanvas = document.getElementById('chart-v2-evolution');
    if (evoCanvas) {
      var tuDemo = findTuile('fiche-identite', 'demographie');
      if (tuDemo) {
        var indEvol = tuDemo.indicateurs.find(function(i) { return i.id === 'TERRITOIRE_POP_EVOL'; });
        if (indEvol && indEvol.fakeChartData) {
          var cd = indEvol.fakeChartData;
          var chart1 = new Chart(evoCanvas.getContext('2d'), {
            type: 'line',
            data: {
              labels: cd.labels,
              datasets: [{
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
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                y: { beginAtZero: false, grid: { color: '#F1F5F9' },
                  ticks: { font: { size: 10 }, callback: function(v) { return v.toFixed(2) + ' M'; } },
                  title: { display: true, text: 'Millions hab.', font: { size: 10 }, color: '#64748B' }
                }
              }
            }
          });
          chartInstances.push(chart1);
        }
      }
    }

    // Prélèvements (stacked bar)
    var prelCanvas = document.getElementById('chart-v2-prelevements');
    if (prelCanvas) {
      var tuPrel = findTuile('fiche-identite', 'prelevements');
      if (tuPrel) {
        var indPrel = tuPrel.indicateurs.find(function(i) { return i.id === 'PREL_USAGE_PAR_CAT'; });
        if (indPrel && indPrel.fakeChartData) {
          var cpd = indPrel.fakeChartData;
          var datasets = cpd.datasets.map(function(ds) {
            return {
              label: ds.label,
              data: ds.data,
              backgroundColor: ds.color,
              borderRadius: 2
            };
          });
          var needsScroll = window.matchMedia('(max-width: 900px)').matches;
          var chart2 = new Chart(prelCanvas.getContext('2d'), {
            type: 'bar',
            data: { labels: cpd.labels, datasets: datasets },
            options: {
              responsive: !needsScroll, maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
                y: { stacked: true, beginAtZero: true, grid: { color: '#F1F5F9' },
                  ticks: { font: { size: 10 }, callback: function(v) { return v + ' Mm³'; } },
                  title: { display: true, text: 'Millions m³', font: { size: 10 }, color: '#64748B' }
                }
              }
            }
          });
          chartInstances.push(chart2);
        }
      }
    }
  }

  function destroyCharts() {
    chartInstances.forEach(function(c) { c.destroy(); });
    chartInstances = [];
  }

  // ══════════════════════════════════════════════════════════════════════
  // AMÉNAGEMENT DU TERRITOIRE — Rendu complet
  // ══════════════════════════════════════════════════════════════════════

  function renderAmenagement(tuiles) {
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });

    var html = '<div class="tdb-elu2-section">';

    // ── Tuile territoire (persistante en haut) ────────────────
    html += renderTerritoryBanner();

    // ── Contenu section (re-rendu au switch de territoire) ────
    html += '<div id="tdb-elu2-section-body">';
    html += renderAmenagementBody(tuiles);
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAmenagementBody(tuiles) {
    applyTerritoryOverrides(tuiles);
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });
    var html = '';

    // ── Banner : Zonages ──────────────────────────────────────
    html += '<div class="tdb-elu2-banner"><i class="ph ph-polygon"></i> Zonages</div>';

    // ── Row 1 : Zones humides + Sites RAMSAR ──────────────────
    html += '<div class="tdb-elu2-amenag-row2">';
    html += renderZonesHumides(t['zones-humides']);
    html += renderRamsar(t['ramsar']);
    html += '</div>';

    // ── Row 2 : ZRE pleine largeur ────────────────────────────
    html += renderZRE(t['zre']);

    // ── Banner : Aménagements ─────────────────────────────────
    html += '<div class="tdb-elu2-banner"><i class="ph ph-buildings"></i> Aménagements</div>';

    // ── Row 3 : Occupation du sol + Obstacles ─
    html += '<div class="tdb-elu2-amenag-row2">';
    html += renderOccupationSol(t['occupation-sol']);
    html += renderObstacles(t['obstacles']);
    html += '</div>';

    restoreTerritoryOverrides(tuiles);
    return html;
  }

  // ── Zones humides ───────────────────────────────────────────
  function renderZonesHumides(tu) {
    if (!tu) return '';
    var html = '<div class="tdb-elu2-card tdb-elu2-amenag-card">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-plant"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    if (tu.enAttente) {
      html += '<div class="tdb-elu2-amenag-card__body tdb-elu2-amenag-card__pending">';
      html += '  <i class="ph ph-hourglass-medium"></i>';
      html += '  <span>En attente des données</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // ── Sites RAMSAR ────────────────────────────────────────────
  function renderRamsar(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var nb = ind['RAMSAR_NB'];
    var surf = ind['RAMSAR_SURF'];

    var html = '<div class="tdb-elu2-card tdb-elu2-amenag-card">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-map-pin-area"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-amenag-card__body">';

    // Mini carte + tooltip conteneur
    html += '<div class="tdb-elu2-amenag-card__minimap-wrap">';
    html += '  <div class="tdb-elu2-amenag-card__minimap" id="minimap-ramsar" data-minimap="ramsar"></div>';
    html += '  <div id="minimap-ramsar-tooltip" class="tdb-elu2-minimap-tooltip"></div>';
    html += '</div>';

    // KPIs
    html += '<div class="tdb-elu2-amenag-card__kpis">';
    if (nb) {
      html += '<div class="tdb-elu2-amenag-kpi">';
      html += '  <span class="tdb-elu2-amenag-kpi__label">Nombre de sites RAMSAR' + renderInfobulle('RAMSAR_NB') + '</span>';
      html += '  <span class="tdb-elu2-amenag-kpi__val">' + escHtml(nb.fakeValue) + '</span>';
      html += '</div>';
    }
    if (surf) {
      html += '<div class="tdb-elu2-amenag-kpi">';
      html += '  <span class="tdb-elu2-amenag-kpi__label">Superficie du territoire couvert' + renderInfobulle('RAMSAR_SURF') + '</span>';
      html += '  <span class="tdb-elu2-amenag-kpi__val">' + escHtml(surf.fakeValue) + ' <small>' + escHtml(surf.unite) + '</small></span>';
      html += '</div>';
    }
    html += '</div></div>';
    html += '</div>';
    return html;
  }

  // ── Zones de répartition des eaux ───────────────────────────
  function renderZRE(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var nb = ind['ZRE_NB'];
    var ratio = ind['ZRE_RATIO'];

    var html = '<div class="tdb-elu2-card tdb-elu2-zre">';
    html += '<div class="tdb-elu2-zre__inner">';

    // Infos GAUCHE
    html += '<div class="tdb-elu2-zre__info">';
    html += '<div class="tdb-elu2-amenag-card__title" style="padding:0;margin-bottom:16px"><i class="ph ph-drop-half-bottom"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';

    // Types de ZRE
    if (tu.fakeTypes) {
      html += '<div class="tdb-elu2-zre__types">';
      var zreColors = ['#FF9800', '#1565C0'];
      tu.fakeTypes.forEach(function(t, i) {
        // RGAA 3.2 : bordure et pastille colorées, texte en encre foncée (contraste ≥ 4,5:1)
      html += '<span class="tdb-elu2-zre__type-tag" style="border-color:' + zreColors[i] + '"><i class="ph ph-circle-fill" style="font-size:8px;color:' + zreColors[i] + '" aria-hidden="true"></i> ' + escHtml(t) + '</span>';
      });
      html += '</div>';
    }

    // KPIs
    if (nb) {
      html += '<div class="tdb-elu2-amenag-kpi" style="margin-top:16px">';
      html += '  <span class="tdb-elu2-amenag-kpi__label">Nombre de ZRE' + renderInfobulle('ZRE_NB') + '</span>';
      html += '  <span class="tdb-elu2-amenag-kpi__val">' + escHtml(nb.fakeValue) + '</span>';
      html += '</div>';
    }
    if (ratio) {
      html += renderGaugeSVG(parseFloat(ratio.fakeValue) || 0, '#0277BD', 'Part du territoire couvert');
    }
    html += '</div>';

    // Carte DROITE
    html += '<div class="tdb-elu2-zre__map" id="minimap-zre" data-minimap="zre"></div>';

    html += '</div></div>';
    return html;
  }

  // ── Occupation du sol ───────────────────────────────────────
  function renderOccupationSol(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var ocs = ind['OCS_RATIO_PAR_CAT'];
    var lien = ind['OCS_CARTO'];

    var html = '<div class="tdb-elu2-card tdb-elu2-amenag-card tdb-elu2-amenag-card--ocs">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-tree"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';

    // Treemap HTML bord-à-bord (pas de padding)
    if (ocs && ocs.fakeChartData) {
      html += renderTreemap(ocs.fakeChartData);
    }

    // Lien externe (paddé en bas)
    if (lien && lien.url) {
      html += '<div class="tdb-elu2-amenag-card--ocs__footer">';
      html += '<a href="' + escHtml(lien.url) + '" target="_blank" rel="noopener" class="tdb-elu2-captages__link">';
      html += '  <i class="ph ph-arrow-square-out"></i> OCS Grand Est';
      html += '</a>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // ── Zones sensibles ────────────────────────────────────────
  function renderZonesSensibles(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var ratio = ind['ZONE_SENSIBLE_RATIO'];

    var html = '<div class="tdb-elu2-card tdb-elu2-amenag-card">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-warning-circle"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-amenag-card__body">';

    // Mini carte placeholder
    html += '<div class="tdb-elu2-amenag-card__minimap" id="minimap-zones-sensibles" data-minimap="zones-sensibles"></div>';

    // KPI
    if (ratio) {
      html += '<div style="margin-top:12px">';
      html += renderGaugeSVG(parseFloat(ratio.fakeValue) || 0, '#FF9800', 'Part du territoire couvert');
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  // ── Obstacles à l'écoulement ────────────────────────────────
  function renderObstacles(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var nb = ind['OBST_ECOUL_NB'];
    var typo = ind['OBST_ECOUL_NB_PART_CAT'];

    var html = '<div class="tdb-elu2-card tdb-elu2-amenag-card">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-barricade"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-amenag-card__body">';

    // Chiffre clé
    if (nb) {
      html += '<div class="tdb-elu2-amenag-card__big-number">';
      html += '  <span class="tdb-elu2-amenag-card__big-val">' + escHtml(nb.fakeValue) + '</span>';
      html += '  <span class="tdb-elu2-amenag-card__big-label">obstacles' + renderInfobulle('OBST_ECOUL_NB') + '</span>';
      html += '</div>';
    }

    // Liste typologies avec icônes + barres de progression
    if (typo && typo.fakeChartData) {
      var cd = typo.fakeChartData;
      var maxVal = Math.max.apply(null, cd.values);
      html += '<div class="tdb-elu2-obst-list">';
      for (var i = 0; i < cd.labels.length; i++) {
        var pct = maxVal > 0 ? Math.round((cd.values[i] / maxVal) * 100) : 0;
        var icon = (cd.icons && cd.icons[i]) ? cd.icons[i] : 'ph-circle';
        var color = (cd.colors && cd.colors[i]) ? cd.colors[i] : '#64748B';
        html += '<div class="tdb-elu2-obst-item">';
        html += '  <div class="tdb-elu2-obst-item__head">';
        html += '    <span class="tdb-elu2-obst-item__icon" style="color:' + color + '"><i class="ph ' + escHtml(icon) + '"></i></span>';
        html += '    <span class="tdb-elu2-obst-item__label">' + escHtml(cd.labels[i]) + '</span>';
        html += '    <span class="tdb-elu2-obst-item__val" style="color:' + color + '">' + cd.values[i] + '</span>';
        html += '  </div>';
        html += '  <div class="tdb-elu2-obst-item__bar-track">';
        html += '    <div class="tdb-elu2-obst-item__bar-fill" style="width:' + pct + '%;background:' + color + '"></div>';
        html += '  </div>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // ── Charts Aménagement ──────────────────────────────────────
  function initAmenagementCharts() {
    // Tooltips treemap OCS
    bindTreemapTooltips();

    if (typeof Chart === 'undefined') return;

    // Occupation du sol — treemap HTML (plus de canvas/Chart.js)

    // Obstacles — rendu HTML (plus de canvas Chart.js)

    // Mini-cartes OL
    initAmenagementMaps();
  }

  // Instances des mini-cartes pour nettoyage
  var amenagMapInstances = [];

  function destroyAmenagementMaps() {
    amenagMapInstances.forEach(function(m) { m.setTarget(null); });
    amenagMapInstances = [];
  }

  function initAmenagementMaps() {
    if (typeof ol === 'undefined') return;
    destroyAmenagementMaps();

    // Contour du territoire courant (département ou Grand Est)
    var geContourCoords = getCurrentContour();
    var currentCenter = getCurrentCenter();

    // Données géo spécifiques au territoire courant
    var deptGeo = getDeptMapData();

    // Données RAMSAR (polygones)
    var ramsarPolys = deptGeo && deptGeo.ramsar && deptGeo.ramsar.polygons ? deptGeo.ramsar.polygons : [
      {coords:[[6.68,48.72],[6.82,48.72],[6.84,48.76],[6.82,48.82],[6.70,48.82],[6.66,48.77],[6.68,48.72]], color:'rgba(0,150,136,0.25)', stroke:'#00796B', label:'\u00c9tang de Lindre et for\u00eats'},
      {coords:[[7.65,48.35],[7.90,48.35],[7.92,48.50],[7.88,48.65],[7.70,48.68],[7.62,48.55],[7.65,48.35]], color:'rgba(0,150,136,0.25)', stroke:'#00796B', label:'Rhin sup\u00e9rieur / Oberrhein'}
    ];

    // Données ZRE
    var zrePolys = deptGeo ? deptGeo.zre : [
      { coords:[[5.8,48.2],[6.5,48.2],[6.5,48.8],[5.8,48.8],[5.8,48.2]], color:'rgba(255,152,0,0.25)', stroke:'#FF9800', label:'ZRE Superficielle' },
      { coords:[[6.6,48.4],[7.3,48.4],[7.3,49.0],[6.6,49.0],[6.6,48.4]], color:'rgba(21,101,192,0.2)', stroke:'#1565C0', label:'ZRE Souterraine' }
    ];

    // Données Zones sensibles
    var zsPolys = deptGeo ? deptGeo.zs : [
      { coords:[[5.5,48.0],[7.0,48.0],[7.0,49.0],[5.5,49.0],[5.5,48.0]], color:'rgba(255,152,0,0.2)', stroke:'#FF9800', label:'Zone sensible' },
      { coords:[[6.2,48.5],[7.8,48.5],[7.8,49.3],[6.2,49.3],[6.2,48.5]], color:'rgba(33,150,243,0.2)', stroke:'#2196F3', label:'Zone sensible' }
    ];

    var mapConfigs = [
      { id: 'minimap-ramsar', polygons: ramsarPolys },
      { id: 'minimap-zre', polygons: zrePolys }
    ];

    mapConfigs.forEach(function(cfg) {
      var container = document.getElementById(cfg.id);
      if (!container) return;

      // ── Fixer la taille du conteneur AVANT de créer la carte ──
      var w = container.clientWidth || container.offsetWidth || 300;
      var isZre = cfg.id === 'minimap-zre';
      var isRamsar = cfg.id === 'minimap-ramsar';
      var h = isZre ? 372 : (isRamsar ? Math.round(w * 0.7) : 160);
      container.style.width  = w + 'px';
      container.style.height = h + 'px';
      container.style.maxHeight = h + 'px';
      container.style.overflow = 'hidden';

      // Fond de carte N&B + masque + contour noir (comme Ressource/usage)
      var layers = [buildGreyscaleTileLayer()];
      var vectorSource = new ol.source.Vector();

      // Masque + contour noir
      buildMaskAndContour(geContourCoords).forEach(function(f) { vectorSource.addFeature(f); });

      // Polygons (ZRE, zones sensibles, RAMSAR…)
      if (cfg.polygons) {
        cfg.polygons.forEach(function(poly) {
          var coords = poly.coords.map(function(c) { return ol.proj.fromLonLat(c); });
          var f = new ol.Feature({ geometry: new ol.geom.Polygon([coords]) });
          if (poly.label) f.set('label', poly.label);

          var textConf = { text: poly.label || '', font: '11px "Satoshi",sans-serif',
            fill: new ol.style.Fill({ color: '#1a2332' }), stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
            overflow: true };
          var baseStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({ color: poly.stroke, width: 2 }),
            fill: new ol.style.Fill({ color: poly.color }),
            text: new ol.style.Text(textConf)
          });
          f.set('baseStyle', baseStyle);

          // Style hover (polygone plus opaque + texte gras)
          var hoverFill = poly.color.replace(/[\d.]+\)$/, '0.45)');
          var hoverStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({ color: poly.stroke, width: 3 }),
            fill: new ol.style.Fill({ color: hoverFill }),
            text: new ol.style.Text({ text: poly.label || '', font: 'bold 12px "Satoshi",sans-serif',
              fill: new ol.style.Fill({ color: '#1a2332' }), stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
              overflow: true })
          });
          f.set('hoverStyle', hoverStyle);

          f.setStyle(baseStyle);
          vectorSource.addFeature(f);
        });
      }

      layers.push(new ol.layer.Vector({ source: vectorSource }));

      var map = new ol.Map({
        target: container,
        layers: layers,
        view: new ol.View({ center: currentCenter, zoom: currentTerritoire ? 8 : 7 }),
        controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
        interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
      });

      // Fit sur le contour du territoire courant (pas sur vectorSource qui inclut le masque monde)
      if (geContourCoords) {
        var fitMaxZoom = (cfg.id === 'minimap-ramsar') ? (currentTerritoire ? 9 : 7) : (currentTerritoire ? 10 : 9);
        var fitPad = (cfg.id === 'minimap-ramsar') ? [30, 40, 30, 40] : [15, 15, 15, 15];
        var contourPoly = new ol.geom.Polygon([geContourCoords]);
        map.getView().fit(contourPoly.getExtent(), { padding: fitPad, maxZoom: fitMaxZoom });
      }

      // Forcer updateSize après rendu DOM stabilisé
      setTimeout(function() { map.updateSize(); }, 200);

      // ── Tooltip hover pour la carte RAMSAR ──
      if (cfg.id === 'minimap-ramsar') {
        var ramsarTooltip = document.getElementById('minimap-ramsar-tooltip');
        // Activer le pointermove pour cette carte
        map.addInteraction(new ol.interaction.Pointer({
          handleMoveEvent: function(e) {
            var hit = false;
            map.forEachFeatureAtPixel(e.pixel, function(f) {
              var name = f.get('label');
              if (name && ramsarTooltip) {
                ramsarTooltip.textContent = name;
                posMapTooltip(ramsarTooltip, container, e.pixel);
                ramsarTooltip.classList.add('is-visible');
                f.setStyle(f.get('hoverStyle'));
                hit = true;
              }
            });
            if (!hit) {
              if (ramsarTooltip) ramsarTooltip.classList.remove('is-visible');
              vectorSource.getFeatures().forEach(function(f) {
                if (f.get('baseStyle')) f.setStyle(f.get('baseStyle'));
              });
            }
            container.style.cursor = hit ? 'pointer' : '';
          }
        }));
        // Masquer le tooltip si la souris quitte le container de la carte
        container.addEventListener('mouseleave', function() {
          if (ramsarTooltip) ramsarTooltip.classList.remove('is-visible');
          vectorSource.getFeatures().forEach(function(f) {
            if (f.get('baseStyle')) f.setStyle(f.get('baseStyle'));
          });
        });
      }

      amenagMapInstances.push(map);
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // GOUVERNANCE ET ACTIONS MENÉES — Section complète
  // ══════════════════════════════════════════════════════════════════════

  function renderGouvernancePage(tuiles) {
    var html = '<div class="tdb-elu2-section">';
    html += renderTerritoryBanner();
    html += '<div id="tdb-elu2-section-body">';
    html += renderGouvernanceBody(tuiles);
    html += '</div></div>';
    return html;
  }

  function renderGouvernanceBody(tuiles) {
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });
    var html = '';

    // ── Bannière "Gouvernance de l'eau" ──
    html += '<div class="tdb-elu2-banner"><i class="ph ph-handshake"></i> Gouvernance de l\u2019eau</div>';

    // ── Arborescence interactive ──
    html += renderGovTree(t['gouvernance-arbre']);

    // ── Bannière "Avancement des engagements" ──
    html += '<div class="tdb-elu2-banner"><i class="ph ph-chart-bar-horizontal"></i> Avancement des engagements eau</div>';

    // ── Tuile État d'avancement des SAGE ──
    html += renderSageAvancement(t['sage-avancement']);

    // ── Bannière "Actions menées" ──
    html += '<div class="tdb-elu2-banner"><i class="ph ph-rocket-launch"></i> Actions men\u00e9es</div>';

    // ── 3 cartes Actions menées (grille) ──
    html += '<div class="tdb-elu2-gov-actions__row">';
    html += renderActionCard(t['contrats-milieux'], 'contrats-milieux');
    html += renderActionCard(t['projets-territoire'], 'projets-territoire');
    html += renderActionCardInondations(t['gestion-inondations']);
    html += '</div>';

    return html;
  }

  // ── Arborescence Gouvernance de l'eau — 4 niveaux cliquables ──────
  function renderGovTree(tu) {
    if (!tu || !tu.fakeTree) return '';
    var tree = tu.fakeTree;
    var territoireNom = currentTerritoire ? currentTerritoire.nom : 'Grand Est';
    var d = currentTerritoire ? currentTerritoire.data : null;

    // Helper : obtenir le count d'un noeud (override par département si dispo)
    function getCount(node) {
      if (!d || !d.ind) return node.count;
      var map = {
        'agences-eau': 'GOV_AGENCES', 'eptb-epage': 'GOV_EPTB', 'sage': 'GOV_SAGE',
        'gemapi-inondations': 'GOV_GEMAPI_PI', 'gemapi-milieux': 'GOV_GEMAPI_GMA',
        'production-ep': 'GOV_PROD_EP', 'distribution-ep': 'GOV_DIST_EP',
        'assain-collectif': 'GOV_ASSAIN_C', 'assain-non-collectif': 'GOV_ASSAIN_NC'
      };
      if (map[node.id] && d.ind[map[node.id]] !== undefined) return d.ind[map[node.id]];
      return node.count;
    }

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-tree">';
    html += '<div class="tdb-elu2-gov-tree__body">';

    // Niveau 1 : Territoire (racine)
    html += '<ul class="tdb-elu2-gov-tree__list tdb-elu2-gov-tree__list--root">';
    html += '<li class="tdb-elu2-gov-tree__node tdb-elu2-gov-tree__node--root is-open">';
    html += '<div class="tdb-elu2-gov-tree__toggle" data-tree-toggle="root">';
    html += '<i class="ph ph-caret-right tdb-elu2-gov-tree__arrow"></i>';
    html += '<span class="tdb-elu2-gov-tree__label tdb-elu2-gov-tree__label--n1"><i class="ph ph-map-pin"></i> ' + escHtml(territoireNom) + '</span>';
    html += '</div>';

    // Niveau 2 : sous-catégories côte à côte (grand cycle | petit cycle)
    html += '<div class="tdb-elu2-gov-tree__cols">';
    tree.branches.forEach(function(branche, brIdx) {
      html += '<div class="tdb-elu2-gov-tree__col">';
      html += '<ul class="tdb-elu2-gov-tree__list tdb-elu2-gov-tree__list--n2">';
      html += '<li class="tdb-elu2-gov-tree__node tdb-elu2-gov-tree__node--n2 is-open">';
      html += '<div class="tdb-elu2-gov-tree__toggle" data-tree-toggle="' + branche.id + '">';
      html += '<i class="ph ph-caret-right tdb-elu2-gov-tree__arrow"></i>';
      html += '<span class="tdb-elu2-gov-tree__label tdb-elu2-gov-tree__label--n2 tdb-elu2-gov-tree__label--' + branche.id + '"><i class="ph ' + branche.icon + '"></i> ' + escHtml(branche.label) + '</span>';
      html += '</div>';

      // Niveau 3 : types de structures (tuiles)
      html += '<ul class="tdb-elu2-gov-tree__list tdb-elu2-gov-tree__list--n3">';
      branche.children.forEach(function(child) {
        var cnt = getCount(child);
        var isGemapi = child.children && child.children.length > 0;
        var hasDisplayableStructures = child.structures && child.structures.length > 0 && child.structures.length <= 5;
        var hasChildren = hasDisplayableStructures || isGemapi;
        var cartoLien = child.structures && child.structures.length > 0 ? child.structures[0].lien : (child.cartoLien || '');

        html += '<li class="tdb-elu2-gov-tree__node tdb-elu2-gov-tree__node--n3">';
        html += '<div class="tdb-elu2-gov-tree__toggle" data-tree-toggle="' + child.id + '">';
        if (hasChildren) {
          html += '<i class="ph ph-caret-right tdb-elu2-gov-tree__arrow"></i>';
        } else {
          html += '<span class="tdb-elu2-gov-tree__arrow-spacer"></span>';
        }
        html += '<span class="tdb-elu2-gov-tree__label tdb-elu2-gov-tree__label--n3"><i class="ph ' + child.icon + '"></i> ' + escHtml(child.label);
        if (cnt !== null && cnt !== undefined) {
          html += ' <span class="tdb-elu2-gov-tree__count">' + cnt + '</span>';
        }
        html += '</span>';
        // Bouton Cartographie sur le nœud N3 (sauf GEMAPI qui l'a sur ses sous-nœuds)
        if (!isGemapi && cartoLien) {
          html += '<a href="' + escHtml(cartoLien) + '" target="_blank" rel="noopener" class="tdb-elu2-gov-tree__carto-link" title="Voir sur la cartographie">';
          html += '<i class="ph ph-map-trifold"></i> Cartographie';
          html += '</a>';
        }
        html += '</div>';

        // Niveau 3.5 : sous-nœuds GEMAPI (children intermédiaires)
        if (child.children && child.children.length > 0) {
          html += '<ul class="tdb-elu2-gov-tree__list tdb-elu2-gov-tree__list--n3sub">';
          child.children.forEach(function(sub) {
            var subCnt = getCount(sub);
            var subCartoLien = sub.structures && sub.structures.length > 0 ? sub.structures[0].lien : '';
            var subHasDisplayableChildren = sub.structures && sub.structures.length > 0 && sub.structures.length <= 5;

            html += '<li class="tdb-elu2-gov-tree__node tdb-elu2-gov-tree__node--n3sub">';
            html += '<div class="tdb-elu2-gov-tree__toggle" data-tree-toggle="' + sub.id + '">';
            if (subHasDisplayableChildren) {
              html += '<i class="ph ph-caret-right tdb-elu2-gov-tree__arrow"></i>';
            } else {
              html += '<span class="tdb-elu2-gov-tree__arrow-spacer"></span>';
            }
            html += '<span class="tdb-elu2-gov-tree__label tdb-elu2-gov-tree__label--n3"><i class="ph ' + sub.icon + '"></i> ' + escHtml(sub.label);
            if (subCnt !== null && subCnt !== undefined) {
              html += ' <span class="tdb-elu2-gov-tree__count">' + subCnt + '</span>';
            }
            html += '</span>';
            // Bouton Cartographie sur les sous-nœuds GEMAPI
            if (subCartoLien) {
              html += '<a href="' + escHtml(subCartoLien) + '" target="_blank" rel="noopener" class="tdb-elu2-gov-tree__carto-link" title="Voir sur la cartographie">';
              html += '<i class="ph ph-map-trifold"></i> Cartographie';
              html += '</a>';
            }
            html += '</div>';

            // Niveau 4 : structures (affichées seulement si ≤5)
            if (sub.structures && sub.structures.length > 0) {
              html += renderTreeStructures(sub.structures);
            }

            html += '</li>';
          });
          html += '</ul>';
        }

        // Niveau 4 : structures directes (affichées seulement si ≤5)
        if (child.structures && child.structures.length > 0 && !(child.children && child.children.length > 0)) {
          html += renderTreeStructures(child.structures);
        }

        html += '</li>';
      });
      html += '</ul>';

      html += '</li>';
      html += '</ul>';
      html += '</div>'; // ferme .tdb-elu2-gov-tree__col
    });
    html += '</div>'; // ferme .tdb-elu2-gov-tree__cols

    html += '</li></ul>';
    html += '</div></div>';
    return html;
  }

  // ── Structures de niveau 4 (feuilles) ────────────────────────────
  // Si ≤5 structures : afficher toutes. Si >5 : ne rien afficher (le count dans la bulle suffit).
  function renderTreeStructures(structures) {
    if (!structures || structures.length === 0 || structures.length > 5) return '';
    var html = '<ul class="tdb-elu2-gov-tree__list tdb-elu2-gov-tree__list--n4">';
    structures.forEach(function(s) {
      html += '<li class="tdb-elu2-gov-tree__node tdb-elu2-gov-tree__node--n4">';
      html += '<div class="tdb-elu2-gov-tree__leaf">';
      html += '<i class="ph ph-dot-outline tdb-elu2-gov-tree__dot"></i>';
      html += '<span class="tdb-elu2-gov-tree__leaf-name">' + escHtml(s.nom) + '</span>';
      html += '</div>';
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }

  // ── Tuile État d'avancement du SAGE ───────────────────────────────
  function renderSageAvancement(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var d = currentTerritoire ? currentTerritoire.data : null;

    // Valeurs (avec override département)
    function sageVal(id, defVal) {
      if (d && d.ind && d.ind[id] !== undefined) return d.ind[id];
      var indicator = ind[id];
      return indicator ? indicator.fakeValue : defVal;
    }

    var items = [
      { id: 'SAGE_MISE_OEUVRE',  label: 'Mise en \u0153uvre',   val: sageVal('SAGE_MISE_OEUVRE', '7'),  color: '#2E7D32', icon: 'ph-check-circle' },
      { id: 'SAGE_REVISION',     label: 'dont en r\u00e9vision', val: sageVal('SAGE_REVISION', '2'),    color: '#66BB6A', icon: 'ph-arrow-clockwise', isSub: true },
      { id: 'SAGE_ELABORATION',  label: '\u00c9laboration',     val: sageVal('SAGE_ELABORATION', '3'),  color: '#F57F17', icon: 'ph-pencil-line' },
      { id: 'SAGE_INSTRUCTION',  label: 'Instruction',          val: sageVal('SAGE_INSTRUCTION', '2'),  color: '#1565C0', icon: 'ph-clipboard-text' }
    ];

    // Total pour les barres proportionnelles
    var total = 0;
    items.forEach(function(item) { if (!item.isSub) total += parseInt(item.val, 10) || 0; });

    var html = '<div class="tdb-elu2-card tdb-elu2-sage-card">';
    html += '<div class="tdb-elu2-sage-card__body">';

    items.forEach(function(item) {
      var val = parseInt(item.val, 10) || 0;
      var pct = total > 0 ? Math.round((val / total) * 100) : 0;
      var subClass = item.isSub ? ' tdb-elu2-sage-card__row--sub' : '';
      html += '<div class="tdb-elu2-sage-card__row' + subClass + '">';
      html += '<span class="tdb-elu2-sage-card__icon" style="color:' + item.color + '"><i class="ph ' + item.icon + '"></i></span>';
      html += '<span class="tdb-elu2-sage-card__label">' + escHtml(item.label) + renderInfobulle(item.id) + '</span>';
      html += '<div class="tdb-elu2-sage-card__bar-wrap">';
      html += '<div class="tdb-elu2-sage-card__bar" style="width:' + pct + '%;background:' + item.color + '"></div>';
      html += '</div>';
      html += '<span class="tdb-elu2-sage-card__val" style="color:' + item.color + '">' + val + '</span>';
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  }

  // ── Carte Action menée générique (Contrats de milieux / Projets de territoire) ──
  function renderActionCard(tu, zone) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var d = currentTerritoire ? currentTerritoire.data : null;

    // Indicateurs
    var nomId = zone === 'contrats-milieux' ? 'ACT_CM_NB' : 'ACT_PT_NB';
    var couvId = zone === 'contrats-milieux' ? 'ACT_CM_COUV' : 'ACT_PT_COUV';
    var avancId = zone === 'contrats-milieux' ? 'ACT_CM_AVANC' : 'ACT_PT_AVANC';

    var nomVal = (d && d.ind && d.ind[nomId]) ? d.ind[nomId] : (ind[nomId] ? ind[nomId].fakeValue : '—');
    var couvVal = (d && d.ind && d.ind[couvId]) ? d.ind[couvId] : (ind[couvId] ? ind[couvId].fakeValue : '—');
    var avancInd = ind[avancId];

    var icon = zone === 'contrats-milieux' ? 'ph-handshake' : 'ph-map-pin-area';

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-action-card">';
    html += '<div class="tdb-elu2-gov-action-card__header"><i class="ph ' + icon + '"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-action-card__body">';

    // KPIs
    html += '<ul class="tdb-elu2-gov-action-card__kpis">';
    html += '<li><span class="tdb-elu2-gov-action-card__kpi-label">Nombre' + renderInfobulle(nomId) + '</span> <span class="tdb-elu2-gov-action-card__kpi-val">' + escHtml(nomVal) + '</span></li>';
    html += '<li style="display:flex;align-items:center;gap:12px">' + renderGaugeSVG(parseFloat(couvVal) || 0, '#0277BD', 'Couverture du territoire') + '</li>';
    html += '</ul>';

    // Filet séparateur entre jauge et camembert
    html += '<div class="tdb-elu2-gov-action-card__separator"></div>';

    // Pie chart avancement (même charte que Ressource/usage)
    if (avancInd && avancInd.fakeChartData) {
      var chartId = 'chart-v2-gov-action-' + zone;
      var cd = avancInd.fakeChartData;
      html += '<div class="tdb-elu2-ru-etat__chart-block">';
      html += '<div class="tdb-elu2-ru-etat__chart-title">Avancement de la proc\u00e9dure</div>';
      html += '<div class="tdb-elu2-ru-etat__chart-wrap">';
      html += '<canvas id="' + chartId + '" data-chart-v2="gov-action-' + zone + '"></canvas>';
      html += '</div>';
      // Légende HTML identique aux pies Ressource/usage
      html += '<div class="tdb-elu2-ru-etat__legend tdb-elu2-ru-etat__legend--inline">';
      for (var li = 0; li < cd.labels.length; li++) {
        html += '<span class="tdb-elu2-ru-etat__legend-item"><span class="tdb-elu2-ru-etat__legend-dot" style="background:' + cd.colors[li] + '"></span>' + escHtml(cd.labels[li]) + '</span>';
      }
      html += '</div>';
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // ── Carte Action menée : Gestion des inondations (pas de pie chart) ──
  function renderActionCardInondations(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var d = currentTerritoire ? currentTerritoire.data : null;

    var plansVal = (d && d.ind && d.ind['ACT_GI_PLANS']) ? d.ind['ACT_GI_PLANS'] : (ind['ACT_GI_PLANS'] ? ind['ACT_GI_PLANS'].fakeValue : '—');
    var slgriVal = (d && d.ind && d.ind['ACT_GI_SLGRI']) ? d.ind['ACT_GI_SLGRI'] : (ind['ACT_GI_SLGRI'] ? ind['ACT_GI_SLGRI'].fakeValue : '—');

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-action-card tdb-elu2-gov-action-card--inondations">';
    html += '<div class="tdb-elu2-gov-action-card__header"><i class="ph ph-cloud-rain"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-action-card__body">';

    // KPIs grands chiffres
    html += '<div class="tdb-elu2-gov-action-card__big-kpis">';

    html += '<div class="tdb-elu2-gov-action-card__big-kpi">';
    html += '<span class="tdb-elu2-gov-action-card__big-val">' + escHtml(plansVal) + '</span>';
    html += '<span class="tdb-elu2-gov-action-card__big-label">Plans de pr\u00e9ventions existants sur le territoire' + renderInfobulle('PPRI_NB') + '</span>';
    html += '</div>';

    html += '<div class="tdb-elu2-gov-action-card__big-kpi">';
    html += renderGaugeSVG(parseFloat(slgriVal) || 0, '#F57F17', 'Couverture SLGRI');
    html += '</div>';

    html += '</div>';
    html += '</div></div>';
    return html;
  }

  // ── Init charts Actions menées (pie charts avancement) ─────────────
  var govActionChartInstances = [];

  function destroyGovActionCharts() {
    govActionChartInstances.forEach(function(c) { c.destroy(); });
    govActionChartInstances = [];
  }

  function initGovActionCharts() {
    destroyGovActionCharts();
    if (typeof Chart === 'undefined') return;

    var tuiles = TUILES_ELU_V2['gouvernance'];
    if (!tuiles) return;
    var d = currentTerritoire ? currentTerritoire.data : null;

    // Pour chaque tuile avec un pie chart avancement
    ['contrats-milieux', 'projets-territoire'].forEach(function(zone) {
      var tu = null;
      tuiles.forEach(function(t) { if (t.zone === zone) tu = t; });
      if (!tu) return;

      var avancId = zone === 'contrats-milieux' ? 'ACT_CM_AVANC' : 'ACT_PT_AVANC';
      var ind = indexInds(tu.indicateurs);
      var avancInd = ind[avancId];
      if (!avancInd || !avancInd.fakeChartData) return;

      var chartData = avancInd.fakeChartData;
      var vals = chartData.values;
      // Override par département
      if (d && d.ind && d.ind[avancId]) {
        vals = d.ind[avancId];
      }

      var canvasId = 'chart-v2-gov-action-' + zone;
      var canvas = document.getElementById(canvasId);
      if (!canvas) return;

      // Même config que les pies Ressource/usage : responsive:false, 200×200, padding 30, pieOuterLabelsPlugin
      canvas.style.width  = '200px';
      canvas.style.height = '200px';

      govActionChartInstances.push(new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
          labels: chartData.labels,
          datasets: [{
            data: vals,
            backgroundColor: chartData.colors,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        plugins: [pieOuterLabelsPlugin],
        options: {
          responsive: false,
          layout: { padding: 30 },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  return ctx.label + ' : ' + ctx.parsed + ' %';
                }
              }
            }
          }
        }
      }));
    });
  }

  // ── Binding : ouverture/fermeture des nœuds de l'arborescence ────
  function bindGouvernanceTree() {
    var treeEl = document.querySelector('.tdb-elu2-gov-tree');
    if (!treeEl) return;

    treeEl.addEventListener('click', function(e) {
      // Ne pas toggler si on clique sur un lien cartographie
      if (e.target.closest('.tdb-elu2-gov-tree__carto-link')) return;
      // Toggle ouverture/fermeture des nœuds
      var toggle = e.target.closest('[data-tree-toggle]');
      if (toggle) {
        var node = toggle.closest('.tdb-elu2-gov-tree__node');
        if (node) node.classList.toggle('is-open');
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // RESSOURCE / USAGE / PRESSION — Rendu complet
  // ══════════════════════════════════════════════════════════════════════

  function renderRessourceUsage(tuiles) {
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });

    var html = '<div class="tdb-elu2-section">';

    // ── Tuile territoire (persistante en haut) ────────────────
    html += renderTerritoryBanner();

    // ── Contenu section (re-rendu au switch de territoire) ────
    html += '<div id="tdb-elu2-section-body">';
    html += renderRessourceUsageBody(tuiles);
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderRessourceUsageBody(tuiles) {
    applyTerritoryOverrides(tuiles);
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });
    var html = '';

    // ── Banner : Ressources ───────────────────────────────────
    html += '<div class="tdb-elu2-banner" style="background:#0277BD"><i class="ph ph-drop"></i> Ressources</div>';

    // ── Banner : Eaux superficielles ──────────────────────────
    html += '<div class="tdb-elu2-ru-sub-banner"><i class="ph ph-waves"></i> Eaux superficielles</div>';

    // ── Hydrologie (pleine largeur, 2 cartes) ─────────────────
    html += renderHydrologie(t['hydrologie']);

    // ── Caractéristiques + État des ressources (2 colonnes) ───
    html += '<div class="tdb-elu2-ru-row2">';
    html += renderCaractSurface(t['caract-surface']);
    html += renderEtatRessources(t['etat-surface'], 'surface');
    html += '</div>';

    // ── Banner : Eaux souterraines ────────────────────────────
    html += '<div class="tdb-elu2-ru-sub-banner"><i class="ph ph-drop-half-bottom"></i> Eaux souterraines</div>';

    // ── Caractéristiques pleine largeur ──
    html += renderCaractSouterrain(t['caract-souterrain']);

    // ── État + Piézométrie sur 2 colonnes ──
    html += '<div class="tdb-elu2-ru-row2">';
    html += renderEtatRessources(t['etat-souterrain'], 'souterrain');
    html += renderPiezometrie(t['piezometrie']);
    html += '</div>';

    // ── Banner : Usages de l'eau & pressions ──────────────────
    html += '<div class="tdb-elu2-banner" style="background:#0277BD"><i class="ph ph-drop"></i> Usages de l\'eau &amp; pressions</div>';

    // ── Sous-onglets filles (Eau potable, Assainissement…) ────
    html += renderUsagesTabs(tuiles);

    restoreTerritoryOverrides(tuiles);
    return html;
  }

  // ══════════════════════════════════════════════════════════════════════
  // USAGES — Sous-onglets filles dans Ressource / usage / pression
  // ══════════════════════════════════════════════════════════════════════

  var USAGE_TABS = [
    { id: 'eau-potable',      label: 'Eau potable',      icon: 'ph-drop' },
    { id: 'assainissement',   label: 'Assainissement',   icon: 'ph-funnel' },
    { id: 'agriculture',      label: 'Agriculture',      icon: 'ph-tractor' },
    { id: 'industrie',        label: 'Industrie',        icon: 'ph-factory' },
    { id: 'loisirs',          label: 'Loisirs',          icon: 'ph-person-simple-swim' }
  ];

  function renderUsagesTabs(tuiles) {
    var html = '';
    html += '<div class="tdb-elu2-gov-tabs" id="tdb-elu2-gov-tabs" role="tablist" aria-label="Sous-cat\u00e9gories usages">';
    USAGE_TABS.forEach(function(tab) {
      var isActive = tab.id === govActiveTab;
      html += '<button class="tdb-elu2-gov-tabs__btn' + (isActive ? ' is-active' : '') + '" data-gov-tab="' + tab.id + '" type="button" role="tab" id="tdb-elu2-govtab-' + tab.id + '" aria-controls="tdb-elu2-gov-content" aria-selected="' + isActive + '" tabindex="' + (isActive ? '0' : '-1') + '">';
      html += '<i class="ph ' + tab.icon + '" aria-hidden="true"></i> ' + escHtml(tab.label);
      html += '</button>';
    });
    html += '</div>';

    html += '<div id="tdb-elu2-gov-content" role="tabpanel" aria-labelledby="tdb-elu2-govtab-' + govActiveTab + '">';
    html += renderGovTabContent(tuiles, govActiveTab);
    html += '</div>';

    return html;
  }

  // ── Hydrologie ──────────────────────────────────────────────
  function renderHydrologie(tu) {
    if (!tu) return '';

    var html = '<div class="tdb-elu2-card tdb-elu2-ru-hydro">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-waves"></i> Hydrologie' + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-ru-hydro__inner">';

    // ── Carte gauche : Hydrologie moyenne ────────────────────
    html += '<div class="tdb-elu2-ru-hydro__block">';
    html += '  <div class="tdb-elu2-ru-hydro__block-header">';
    html += '    <span class="tdb-elu2-ru-hydro__block-title">Hydrologie moyenne</span>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-ru-hydro__map-wrap">';
    html += '    <div class="tdb-elu2-ru-hydro__map tdb-elu2-ru-hydro__map--interactive" id="minimap-hydro-moy" data-minimap="hydro-moy"></div>';
    html += '    <div id="tooltip-hydro-moy" class="tdb-elu2-hydro-tooltip"></div>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-source tdb-elu2-source--tuile tdb-elu2-source--hydro-block">';
    html += '    <span class="tdb-elu2-source__label">Source\u00a0: Hub\u2019Eau (Hydrom\u00e9trie)</span>';
    html += '    <span class="tdb-elu2-methodo-links"><span class="tdb-elu2-methodo-links__title">M\u00e9thodologie\u00a0:</span>';
    html += '      <a href="#methodo-hydro-debit" target="_blank" rel="noopener" class="tdb-elu2-methodo-link" title="Fiche m\u00e9thodologique \u2014 Hydrologie \u2014 d\u00e9bit moyen"><i class="ph ph-file-pdf" aria-hidden="true"></i> Hydrologie \u2014 d\u00e9bit moyen</a>';
    html += '    </span>';
    html += '  </div>';
    html += '</div>';

    // ── Carte droite : Hydrologie d'étiage ───────────────────
    html += '<div class="tdb-elu2-ru-hydro__block">';
    html += '  <div class="tdb-elu2-ru-hydro__block-header">';
    html += '    <span class="tdb-elu2-ru-hydro__block-title">Hydrologie d\'étiage</span>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-ru-hydro__map-wrap">';
    html += '    <div class="tdb-elu2-ru-hydro__map tdb-elu2-ru-hydro__map--interactive" id="minimap-hydro-etiage" data-minimap="hydro-etiage"></div>';
    html += '    <div id="tooltip-hydro-etiage" class="tdb-elu2-hydro-tooltip"></div>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-source tdb-elu2-source--tuile tdb-elu2-source--hydro-block">';
    html += '    <span class="tdb-elu2-source__label">Source\u00a0: Hub\u2019Eau (Hydrom\u00e9trie)</span>';
    html += '    <span class="tdb-elu2-methodo-links"><span class="tdb-elu2-methodo-links__title">M\u00e9thodologie\u00a0:</span>';
    html += '      <a href="#methodo-hydro-etiage" target="_blank" rel="noopener" class="tdb-elu2-methodo-link" title="Fiche m\u00e9thodologique \u2014 Hydrologie \u2014 \u00e9tiage"><i class="ph ph-file-pdf" aria-hidden="true"></i> Hydrologie \u2014 \u00e9tiage</a>';
    html += '    </span>';
    html += '  </div>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ── Caractéristiques eaux superficielles ────────────────────
  function renderCaractSurface(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var coursEau = ind['SURF_COURS_EAU'];
    var plansNb = ind['SURF_PLANS_EAU_NB'];
    var plansSurf = ind['SURF_PLANS_EAU_SURF'];

    var html = '<div class="tdb-elu2-card tdb-elu2-ru-caract-surf">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-list-bullets"></i> Caract\u00e9ristiques' + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-ru-caract-surf__body">';

    // Bloc 1 : Cours d'eau
    if (coursEau) {
      html += '<div class="tdb-elu2-ru-caract-surf__block">';
      html += '  <div class="tdb-elu2-ru-caract-surf__icon"><i class="ph ph-waves"></i></div>';
      html += '  <div class="tdb-elu2-ru-caract-surf__val">' + escHtml(coursEau.fakeValue) + ' <span class="tdb-elu2-ru-caract-surf__unit">' + escHtml(coursEau.unite) + '</span></div>';
      html += '  <div class="tdb-elu2-ru-caract-surf__label">Cours d\u2019eau' + renderInfobulle('SURF_COURS_EAU') + '</div>';
      html += '</div>';
    }

    // Bloc 2 : Plans d'eau
    html += '<div class="tdb-elu2-ru-caract-surf__block">';
    if (plansNb) {
      html += '  <div class="tdb-elu2-ru-caract-surf__icon"><i class="ph ph-drop"></i></div>';
      html += '  <div class="tdb-elu2-ru-caract-surf__val">' + escHtml(plansNb.fakeValue) + '</div>';
      html += '  <div class="tdb-elu2-ru-caract-surf__label">Nombre de plans d\u2019eau' + renderInfobulle('SURF_PLANS_EAU_NB') + '</div>';
    }
    if (plansSurf) {
      html += '  <div class="tdb-elu2-ru-caract-surf__sub-val">' + escHtml(plansSurf.fakeValue) + ' <span class="tdb-elu2-ru-caract-surf__unit">' + escHtml(plansSurf.unite) + '</span></div>';
      html += '  <div class="tdb-elu2-ru-caract-surf__label tdb-elu2-ru-caract-surf__label--sub">Superficie totale' + renderInfobulle('SURF_PLANS_EAU_SURF') + '</div>';
    }
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ── État des ressources (surface OU souterrain) ─────────────
  function renderEtatRessources(tu, variant) {
    if (!tu) return '';
    var html = '<div class="tdb-elu2-card tdb-elu2-ru-etat">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-chart-pie-slice"></i> État des ressources' + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-ru-etat__sub">État des lieux Directive cadre sur l\'eau 2025</div>';
    html += '<div class="tdb-elu2-ru-etat__charts">';

    tu.indicateurs.forEach(function(ind, idx) {
      var chartId = 'chart-v2-etat-' + variant + '-' + idx;
      html += '<div class="tdb-elu2-ru-etat__chart-block">';
      html += '  <div class="tdb-elu2-ru-etat__chart-title">' + escHtml(ind.nom) + renderInfobulle(ind.id) + '</div>';
      html += '  <div class="tdb-elu2-ru-etat__chart-wrap">';
      html += '    <canvas id="' + chartId + '" data-chart-v2="etat-' + variant + '-' + idx + '"></canvas>';
      html += '  </div>';

      // Légende propre à chaque chart (conformément au zoning)
      if (ind.fakeChartData) {
        var cd = ind.fakeChartData;
        html += '<div class="tdb-elu2-ru-etat__legend tdb-elu2-ru-etat__legend--inline">';
        for (var li = 0; li < cd.labels.length; li++) {
          html += '<span class="tdb-elu2-ru-etat__legend-item"><span class="tdb-elu2-ru-etat__legend-dot" style="background:' + cd.colors[li] + '"></span>' + escHtml(cd.labels[li]) + '</span>';
        }
        html += '</div>';
      }
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  }

  // ── Jauge semi-circulaire SVG (utilisée dans Fiche d'identité) ─
  function renderGaugeSVG(pct, color, label) {
    // Approche stroke-dasharray sur un seul path demi-cercle
    // Garantit alignement parfait : même path, juste la couleur change via dasharray
    var r = 45;
    var stroke = 10;
    var cx = 60;
    var cy = 56;
    var halfCirc = Math.PI * r;           // longueur du demi-cercle
    var fill = halfCirc * (pct / 100);    // portion colorée
    var gap = halfCirc - fill;            // portion restante
    var displayPct = (pct % 1 === 0) ? String(pct) : pct.toFixed(1);
    // Le path demi-cercle (de gauche à droite, passant par le haut)
    var d = 'M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy;

    var html = '<div class="tdb-elu2-gauge">';
    html += '<div class="tdb-elu2-gauge__svg-wrap">';
    html += '<svg viewBox="0 0 120 62" class="tdb-elu2-gauge__svg">';
    // Track gris clair par défaut (visible sur fond blanc)
    html += '<path d="' + d + '" fill="none" stroke="#E2E8F0" stroke-width="' + stroke + '" stroke-linecap="round"/>';
    // Arc coloré : même path, clippé via dasharray
    html += '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" ';
    html += 'stroke-dasharray="' + fill.toFixed(1) + ' ' + gap.toFixed(1) + '"/>';
    html += '</svg>';
    // Valeur + % côte à côte (pas empilés)
    // RGAA 3.2 : la valeur chiffrée utilise une version assombrie de la couleur si le contraste est insuffisant
    html += '<div class="tdb-elu2-gauge__value" style="color:' + readableColor(color) + '">' + displayPct + '<span class="tdb-elu2-gauge__pct">%</span></div>';
    html += '</div>';
    html += '<div class="tdb-elu2-gauge__label">' + escHtml(label) + '</div>';
    html += '</div>';
    return html;
  }

  // ── Caractéristiques eaux souterraines ──────────────────────
  function renderCaractSouterrain(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var nb = ind['SOUT_MESO_NB'];

    var html = '<div class="tdb-elu2-card tdb-elu2-ru-caract-sout">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-list-bullets"></i> Caractéristiques' + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-ru-caract-sout__body">';

    // KPI à gauche (1/3)
    if (nb) {
      html += '<div class="tdb-elu2-ru-caract-sout__kpi">';
      html += '  <div class="tdb-elu2-ru-caract-sout__kpi-val">' + escHtml(nb.fakeValue) + '</div>';
      html += '  <div class="tdb-elu2-ru-caract-sout__kpi-label">Masses d\'eau souterraines' + renderInfobulle('SOUT_MESO_NB') + '</div>';
      html += '</div>';
    }

    // Noms en colonne à droite (2/3)
    if (tu.fakeLabels) {
      html += '<div class="tdb-elu2-ru-caract-sout__names">';
      html += '  <div class="tdb-elu2-ru-caract-sout__names-title">Nom des masses d\'eau :</div>';
      html += '  <div class="tdb-elu2-ru-caract-sout__names-list">';
      tu.fakeLabels.forEach(function(lbl) {
        html += '<span class="tdb-elu2-ru-caract-sout__name-tag"><i class="ph ph-drop-half-bottom"></i> ' + escHtml(lbl) + '</span>';
      });
      html += '  </div>';
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // ── Piézométrie ────────────────────────────────────────────
  function renderPiezometrie(tu) {
    if (!tu) return '';

    var html = '<div class="tdb-elu2-card tdb-elu2-ru-piezo">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-chart-line-up"></i> Piézométrie' + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-ru-piezo__body">';

    // Carte interactive avec tooltip
    html += '<div class="tdb-elu2-ru-piezo__map-wrap">';
    html += '  <div class="tdb-elu2-ru-piezo__map tdb-elu2-ru-piezo__map--interactive" id="minimap-piezometrie" data-minimap="piezometrie"></div>';
    html += '  <div id="tooltip-piezometrie" class="tdb-elu2-hydro-tooltip tdb-elu2-hydro-tooltip--piezo"></div>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ── Plugin Chart.js : labels % AUTOUR du camembert (en dehors) ──
  var pieOuterLabelsPlugin = {
    id: 'pieOuterLabelsV2',
    afterDraw: function(chart) {
      var ctx = chart.ctx;
      var meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data) return;
      ctx.save();

      var cx = (chart.chartArea.left + chart.chartArea.right) / 2;
      var cy = (chart.chartArea.top + chart.chartArea.bottom) / 2;

      meta.data.forEach(function(arc, i) {
        var val = chart.data.datasets[0].data[i];
        if (val < 0.5) { return; } // skip if tiny

        // Milieu de l'arc
        var startAngle = arc.startAngle;
        var endAngle = arc.endAngle;
        var midAngle = (startAngle + endAngle) / 2;

        // Point sur le bord du camembert
        var outerRadius = arc.outerRadius;
        var edgeX = cx + Math.cos(midAngle) * outerRadius;
        var edgeY = cy + Math.sin(midAngle) * outerRadius;

        // Point du label (au-delà du bord)
        var labelDist = outerRadius + 18;
        var labelX = cx + Math.cos(midAngle) * labelDist;
        var labelY = cy + Math.sin(midAngle) * labelDist;

        // Ligne de rappel : bord → label
        ctx.beginPath();
        ctx.moveTo(edgeX, edgeY);
        ctx.lineTo(labelX, labelY);
        ctx.strokeStyle = '#90A4AE';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Texte
        var txt = val + '%';
        ctx.font = 'bold 11px "Satoshi", sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) ? 'right' : 'left';
        ctx.fillStyle = '#1a2332';
        var nudge = (ctx.textAlign === 'right') ? -4 : 4;
        ctx.fillText(txt, labelX + nudge, labelY);
      });

      ctx.restore();
    }
  };

  // Variante : étiquettes en nombre (sans « % ») — utilisée pour les captages dégradés
  var pieCountLabelsPlugin = {
    id: 'pieCountLabelsV2',
    afterDraw: function(chart) {
      var ctx = chart.ctx;
      var meta = chart.getDatasetMeta(0);
      if (!meta || !meta.data) return;
      ctx.save();
      var cx = (chart.chartArea.left + chart.chartArea.right) / 2;
      var cy = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      meta.data.forEach(function(arc, i) {
        var val = chart.data.datasets[0].data[i];
        if (!val) return;
        var midAngle = (arc.startAngle + arc.endAngle) / 2;
        var r = arc.outerRadius;
        var ex = cx + Math.cos(midAngle) * r, ey = cy + Math.sin(midAngle) * r;
        var lx = cx + Math.cos(midAngle) * (r + 18), ly = cy + Math.sin(midAngle) * (r + 18);
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(lx, ly);
        ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 1; ctx.stroke();
        ctx.font = 'bold 11px "Satoshi", sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) ? 'right' : 'left';
        ctx.fillStyle = '#1a2332';
        ctx.fillText(String(val), lx + (ctx.textAlign === 'right' ? -4 : 4), ly);
      });
      ctx.restore();
    }
  };

  // ── Charts Ressource/Usage ─────────────────────────────────
  function initRessourceUsageCharts() {
    if (typeof Chart === 'undefined') return;

    // Créer les pie charts pour chaque état des ressources
    var variants = ['surface', 'souterrain'];
    variants.forEach(function(variant) {
      var zoneName = 'etat-' + variant;
      var tu = findTuile('ressource-usage', zoneName);
      if (!tu) return;

      tu.indicateurs.forEach(function(ind, idx) {
        if (!ind.fakeChartData) return;
        var canvasId = 'chart-v2-etat-' + variant + '-' + idx;
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;

        var cd = ind.fakeChartData;
        // État quantitatif (Bon / Médiocre) : suit le territoire sélectionné
        if (ind.id === 'ETAT_QUANTI_SOUT' && currentTerritoire && currentTerritoire.data) {
          var bonQ = parseFloat(currentTerritoire.data.etatQuantiSout);
          if (!isNaN(bonQ)) cd = { labels: cd.labels, colors: cd.colors, values: [bonQ, Math.round((100 - bonQ) * 10) / 10] };
        }
        canvas.style.width  = '200px';
        canvas.style.height = '200px';

        chartInstances.push(new Chart(canvas.getContext('2d'), {
          type: 'pie',
          data: {
            labels: cd.labels,
            datasets: [{ data: cd.values, backgroundColor: cd.colors, borderWidth: 2, borderColor: '#fff' }]
          },
          plugins: [pieOuterLabelsPlugin],
          options: {
            responsive: false,
            layout: { padding: 30 },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(ctx) { return ctx.label + ' : ' + ctx.parsed + ' %'; }
                }
              }
            }
          }
        }));
      });
    });
  }

  // ── Mini-cartes Ressource/Usage ─────────────────────────────
  var ressourceUsageMapInstances = [];

  function destroyRessourceUsageMaps() {
    ressourceUsageMapInstances.forEach(function(m) { m.setTarget(null); });
    ressourceUsageMapInstances = [];
  }

  // Récupérer les données stations hydro (département ou Grand Est)
  function getHydroStations() {
    var deptGeo = getDeptMapData();
    if (deptGeo) {
      return { moyenne: deptGeo.hydroMoy || [], etiage: deptGeo.hydroEti || [] };
    }
    var tu = findTuile('ressource-usage', 'hydrologie');
    if (tu && tu.fakeStations) return tu.fakeStations;
    return { moyenne: [], etiage: [] };
  }

  // Récupérer les données stations piézo (département ou Grand Est)
  function getPiezoStations() {
    var deptGeo = getDeptMapData();
    if (deptGeo) return deptGeo.piezo || [];
    var tu = findTuile('ressource-usage', 'piezometrie');
    if (tu && tu.fakeStations) return tu.fakeStations;
    return [];
  }

  // Récupérer les données stations STEP (département ou Grand Est)
  function getStepStations() {
    var deptGeo = getDeptMapData();
    if (deptGeo) return deptGeo.step || [];
    var tu = findTuile('ressource-usage', 'stations-epuration');
    if (tu && tu.fakeStations) return tu.fakeStations;
    return [];
  }

  function initRessourceUsageMaps() {
    if (typeof ol === 'undefined') return;
    destroyRessourceUsageMaps();

    var stations = getHydroStations();

    // ── Contour territoire courant (arrière-plan vecteur) ──
    var geContourCoords = getCurrentContour();

    // ══════════════════════════════════════════════════════
    // CARTE 1 : Hydrologie moyenne — interactive
    // ══════════════════════════════════════════════════════
    initHydroMapMoyenne(stations.moyenne, geContourCoords);

    // ══════════════════════════════════════════════════════
    // CARTE 2 : Hydrologie étiage — interactive
    // ══════════════════════════════════════════════════════
    initHydroMapEtiage(stations.etiage, geContourCoords);

    // ══════════════════════════════════════════════════════
    // CARTE 3 : Piézométrie (simple, inchangée)
    // ══════════════════════════════════════════════════════
    initPiezoMap(geContourCoords);
  }

  // ── Helper : créer le masque extérieur blanc + contour noir épais ──
  function buildMaskAndContour(contourCoords) {
    var features = [];
    if (!contourCoords) return features;

    // Grand rectangle monde (EPSG:3857)
    var worldBox = [
      [-20037508, -20037508], [20037508, -20037508],
      [20037508, 20037508], [-20037508, 20037508], [-20037508, -20037508]
    ];

    // Masque : polygone "monde" avec trou = territoire → blanc semi-opaque à l'extérieur
    var maskGeom = new ol.geom.Polygon([worldBox, contourCoords]);
    var maskF = new ol.Feature({ geometry: maskGeom });
    maskF.setStyle(new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(255,255,255,0.7)' })
    }));
    features.push(maskF);

    // Contour noir épais du territoire
    var contourF = new ol.Feature({ geometry: new ol.geom.Polygon([contourCoords]) });
    contourF.setStyle(new ol.style.Style({
      stroke: new ol.style.Stroke({ color: '#1a2332', width: 2.5 }),
      fill: new ol.style.Fill({ color: 'rgba(0,0,0,0)' })
    }));
    features.push(contourF);

    return features;
  }

  // ── Helper : positionner un tooltip fixed par rapport au viewport ──
  // Bascule automatiquement en dessous du point si le tooltip ne tient pas au-dessus.
  // On force un reflow synchrone pour mesurer la vraie hauteur du tooltip
  // (même si l'image piézo n'est pas encore chargée, scrollHeight donne la hauteur CSS).
  function posMapTooltip(tooltipEl, container, pixel) {
    var rect = container.getBoundingClientRect();
    var anchorX = rect.left + pixel[0];
    var anchorY = rect.top  + pixel[1];

    // 1) Placer le tooltip en haut à gauche hors-écran pour mesurer sa taille réelle
    tooltipEl.classList.remove('tdb-elu2-hydro-tooltip--below');
    tooltipEl.style.marginTop = '';
    tooltipEl.style.transform = 'none';
    tooltipEl.style.left = '0px';
    tooltipEl.style.top  = '0px';
    tooltipEl.style.visibility = 'hidden';
    tooltipEl.style.display = 'block';

    // 2) Forcer le reflow et mesurer
    var tipH = tooltipEl.offsetHeight;
    var tipW = tooltipEl.offsetWidth;

    // 3) Restaurer le style normal
    tooltipEl.style.visibility = '';
    tooltipEl.style.display = '';
    tooltipEl.style.transform = '';

    // 4) Décider : au-dessus ou en dessous ?
    // Le CSS par défaut place le tooltip au-dessus : transform translate(-50%, -100%) + margin-top -14px
    // Donc le haut du tooltip serait à : anchorY - tipH - 14
    var vh = window.innerHeight;
    var spaceAbove = anchorY - tipH - 14;
    var fitsBelow = anchorY + 14 + tipH <= vh - 4;
    if (spaceAbove < 4 && !fitsBelow) {
      // Ni au-dessus ni en dessous (ex. carte coupée par le bas de l'écran) :
      // on place le tooltip à côté du point, recalé verticalement dans l'écran,
      // pour qu'il ne recouvre jamais le point survolé.
      var vwS = window.innerWidth;
      var gap = 16;
      var leftS = (anchorX + gap + tipW <= vwS - 4) ? anchorX + gap : anchorX - gap - tipW;
      leftS = Math.max(4, leftS);
      var topS = Math.min(Math.max(4, anchorY - tipH / 2), vh - tipH - 4);
      tooltipEl.style.transform = 'none';
      tooltipEl.style.marginTop = '0';
      tooltipEl.style.left = leftS + 'px';
      tooltipEl.style.top = Math.max(4, topS) + 'px';
      return;
    }
    if (spaceAbove < 4) {
      // Pas assez de place au-dessus → basculer en dessous
      tooltipEl.classList.add('tdb-elu2-hydro-tooltip--below');
    }

    // 5) Positionner l'ancre
    tooltipEl.style.left = anchorX + 'px';
    tooltipEl.style.top  = anchorY + 'px';

    // 6) Recaler horizontalement si débordement gauche/droite
    var vw = window.innerWidth;
    var halfW = tipW / 2;
    if (anchorX - halfW < 4) {
      tooltipEl.style.left = (halfW + 4) + 'px';
    } else if (anchorX + halfW > vw - 4) {
      tooltipEl.style.left = (vw - halfW - 4) + 'px';
    }
  }

  // ── Helper : masquer le tooltip quand la souris sort de la carte ──
  // Sans ça, si le curseur quitte la carte alors qu'il est sur un point,
  // le dernier pointermove a hit=true → le tooltip reste affiché.
  function bindMapLeaveHide(container, tooltipEl, getHovered, clearHovered) {
    container.addEventListener('mouseleave', function(ev) {
      // Passage de la carte vers le tooltip interactif (piézo) : ne pas le masquer
      if (tooltipEl && ev && ev.relatedTarget && tooltipEl.contains(ev.relatedTarget) && tooltipEl.classList.contains('is-visible')) return;
      if (tooltipEl) {
        tooltipEl.classList.remove('is-visible');
      }
      var h = getHovered();
      if (h && h.get && h.get('baseStyle')) {
        h.setStyle(h.get('baseStyle'));
      }
      clearHovered();
    });
  }

  // ── Helper : couche « Cours d'eau » (mêmes données et même style que la page Cartographie) ──
  // Source : DONNEES_SOURCES (js/data-carto-sources.js) → thème Hydrologie → filtre 'cours-deau'
  function buildCoursEauLayer() {
    if (typeof DONNEES_SOURCES === 'undefined') return null;
    var filtre = null, couleur = '#0288D1';
    DONNEES_SOURCES.forEach(function(cat) {
      (cat.filtres || []).forEach(function(fi) {
        if (fi.id === 'cours-deau') { filtre = fi; couleur = cat.color || couleur; }
      });
    });
    if (!filtre || !filtre.features) return null;
    var style = new ol.style.Style({ stroke: new ol.style.Stroke({ color: couleur, width: 3 }) });
    var src = new ol.source.Vector();
    filtre.features.forEach(function(feat) {
      if (!feat.coords || feat.coords.length < 2) return;
      var f = new ol.Feature({
        geometry: new ol.geom.LineString(feat.coords.map(function(c) { return ol.proj.fromLonLat(c); }))
      });
      f.set('coursEauName', feat.label);
      f.setStyle(style);
      src.addFeature(f);
    });
    // Sous les stations (zIndex plus faible que la couche des points)
    return new ol.layer.Vector({ source: src, zIndex: 1 });
  }

  // ── Helper : fond de carte N&B (OSM France + filtre CSS grayscale) ──
  function buildGreyscaleTileLayer() {
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://{a-c}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
        attributions: '© OSM', maxZoom: 19
      }),
      className: 'ol-layer-greyscale'
    });
  }

  // ── Carte Hydrologie moyenne ───────────────────────────────
  function initHydroMapMoyenne(stationsData, contourCoords) {
    var container = document.getElementById('minimap-hydro-moy');
    if (!container) return;

    var tooltipEl = document.getElementById('tooltip-hydro-moy');
    var w = container.clientWidth || container.offsetWidth || 400;
    var h = 360;
    container.style.width  = w + 'px';
    container.style.height = h + 'px';
    container.style.maxHeight = h + 'px';

    var vectorSource = new ol.source.Vector();

    // Masque + contour noir épais
    buildMaskAndContour(contourCoords).forEach(function(f) { vectorSource.addFeature(f); });

    // Stations — points colorés par état, SANS label texte
    stationsData.forEach(function(st) {
      var f = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.fromLonLat(st.coord)) });
      f.set('stationName', st.nom);
      f.set('stationData', st);
      f.set('mapType', 'moyenne');
      f.set('baseStyle', new ol.style.Style({
        image: new ol.style.Circle({
          radius: 9,
          fill: new ol.style.Fill({ color: st.etatColor }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 2.5 })
        })
      }));
      f.set('hoverStyle', new ol.style.Style({
        image: new ol.style.Circle({
          radius: 13,
          fill: new ol.style.Fill({ color: st.etatColor }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 3 })
        })
      }));
      f.setStyle(f.get('baseStyle'));
      vectorSource.addFeature(f);
    });

    var map = new ol.Map({
      target: container,
      layers: [buildGreyscaleTileLayer(), buildCoursEauLayer(), new ol.layer.Vector({ source: vectorSource, zIndex: 2 })].filter(Boolean),
      view: new ol.View({ center: getCurrentCenter(), zoom: currentTerritoire ? 8 : 7 }),
      controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
      interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
    });

    if (contourCoords) {
      var cPoly = new ol.geom.Polygon([contourCoords]);
      map.getView().fit(cPoly.getExtent(), { padding: [35, 35, 35, 35], maxZoom: currentTerritoire ? 10 : 9 });
    }

    setTimeout(function() { map.updateSize(); }, 200);

    // Hover + tooltip (SANS ligne "État")
    var hoveredFeature = null;
    map.on('pointermove', function(e) {
      var hit = false;
      if (hoveredFeature && hoveredFeature.get('baseStyle')) {
        hoveredFeature.setStyle(hoveredFeature.get('baseStyle'));
        hoveredFeature = null;
      }
      map.forEachFeatureAtPixel(e.pixel, function(f) {
        if (!f.get('stationName')) return;
        hit = true;
        hoveredFeature = f;
        f.setStyle(f.get('hoverStyle'));
        var st = f.get('stationData');
        if (tooltipEl && st) {
          var mTDir = st.tendance || 'neutral';
          var mTIconCls = mTDir === 'up' ? 'ph-arrow-up-right' : mTDir === 'down' ? 'ph-arrow-down-right' : 'ph-arrow-right';
          var mTCls = mTDir === 'up' ? 'tdb-elu2-hydro-tooltip__trend--up' : mTDir === 'down' ? 'tdb-elu2-hydro-tooltip__trend--down' : 'tdb-elu2-hydro-tooltip__trend--neutral';
          tooltipEl.innerHTML = '<strong>' + escHtml(st.nom) + '</strong>'
            + '<div class="tdb-elu2-hydro-tooltip__row"><span>D\u00e9bit moyen annuel 2025 :</span> <strong>' + escHtml(st.debit2025) + ' m\u00b3/s</strong></div>'
            + '<div class="tdb-elu2-hydro-tooltip__row"><span>D\u00e9bit moyen annuel : tendance :</span> <span class="' + mTCls + '"><i class="ph ' + mTIconCls + '"></i> ' + escHtml(st.tendanceLabel || '') + '</span></div>'
            + '<div class="tdb-elu2-hydro-tooltip__row"><span>Module (1995-2024) :</span> <strong>' + escHtml(st.module) + ' m\u00b3/s</strong></div>';
          posMapTooltip(tooltipEl, container, e.pixel);
          tooltipEl.classList.add('is-visible');
        }
      });
      container.style.cursor = hit ? 'pointer' : '';
      if (!hit && tooltipEl) {
        tooltipEl.classList.remove('is-visible');
      }
    });

    bindMapLeaveHide(container, tooltipEl, function() { return hoveredFeature; }, function() { hoveredFeature = null; });

    ressourceUsageMapInstances.push(map);
  }

  // ── Carte Hydrologie étiage ────────────────────────────────
  function initHydroMapEtiage(stationsData, contourCoords) {
    var container = document.getElementById('minimap-hydro-etiage');
    if (!container) return;

    var tooltipEl = document.getElementById('tooltip-hydro-etiage');
    var w = container.clientWidth || container.offsetWidth || 400;
    var h = 360;
    container.style.width  = w + 'px';
    container.style.height = h + 'px';
    container.style.maxHeight = h + 'px';

    var vectorSource = new ol.source.Vector();

    // Masque + contour noir épais
    buildMaskAndContour(contourCoords).forEach(function(f) { vectorSource.addFeature(f); });

    // Stations étiage — points sombres, SANS label texte
    stationsData.forEach(function(st) {
      var f = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.fromLonLat(st.coord)) });
      f.set('stationName', st.nom);
      f.set('stationData', st);
      f.set('mapType', 'etiage');
      f.set('baseStyle', new ol.style.Style({
        image: new ol.style.Circle({
          radius: 8,
          fill: new ol.style.Fill({ color: '#37474F' }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
        })
      }));
      f.set('hoverStyle', new ol.style.Style({
        image: new ol.style.Circle({
          radius: 12,
          fill: new ol.style.Fill({ color: '#0D47A1' }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 3 })
        })
      }));
      f.setStyle(f.get('baseStyle'));
      vectorSource.addFeature(f);
    });

    var map = new ol.Map({
      target: container,
      layers: [buildGreyscaleTileLayer(), buildCoursEauLayer(), new ol.layer.Vector({ source: vectorSource, zIndex: 2 })].filter(Boolean),
      view: new ol.View({ center: getCurrentCenter(), zoom: currentTerritoire ? 8 : 7 }),
      controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
      interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
    });

    if (contourCoords) {
      var cPoly2 = new ol.geom.Polygon([contourCoords]);
      map.getView().fit(cPoly2.getExtent(), { padding: [35, 35, 35, 35], maxZoom: currentTerritoire ? 10 : 9 });
    }

    setTimeout(function() { map.updateSize(); }, 200);

    // Hover + tooltip (QMNA 5 uniquement, sans tendance)
    var hoveredFeature = null;
    map.on('pointermove', function(e) {
      var hit = false;
      if (hoveredFeature && hoveredFeature.get('baseStyle')) {
        hoveredFeature.setStyle(hoveredFeature.get('baseStyle'));
        hoveredFeature = null;
      }
      map.forEachFeatureAtPixel(e.pixel, function(f) {
        if (!f.get('stationName')) return;
        hit = true;
        hoveredFeature = f;
        f.setStyle(f.get('hoverStyle'));
        var st = f.get('stationData');
        if (tooltipEl && st) {
          tooltipEl.innerHTML = '<strong>' + escHtml(st.nom) + '</strong>'
            + '<div class="tdb-elu2-hydro-tooltip__row"><span>QMNA 5 :</span> <strong>' + escHtml(st.qnma) + ' m\u00b3/s</strong></div>';
          posMapTooltip(tooltipEl, container, e.pixel);
          tooltipEl.classList.add('is-visible');
        }
      });
      container.style.cursor = hit ? 'pointer' : '';
      if (!hit && tooltipEl) {
        tooltipEl.classList.remove('is-visible');
      }
    });

    bindMapLeaveHide(container, tooltipEl, function() { return hoveredFeature; }, function() { hoveredFeature = null; });

    ressourceUsageMapInstances.push(map);
  }

  // ── Carte Piézométrie (interactive avec tooltips) ───────────
  // Série fictive (déterministe par station) : profondeur de la nappe sur ~3 semaines
  function buildPiezoSerie(st) {
    var seed = 0, nom = String(st.nom || '');
    for (var k = 0; k < nom.length; k++) seed = (seed * 31 + nom.charCodeAt(k)) % 9973;
    var base = 3 + (seed % 900) / 100;          // 3 → 12 m
    var trend = ((seed % 7) - 3) * 0.004;        // légère tendance
    var labels = [], values = [];
    var d0 = new Date(2026, 8, 7);
    for (var j = 0; j < 21; j++) {
      var d = new Date(d0.getTime() + j * 86400000);
      labels.push(d.getDate() + ' sept.');
      values.push(base + trend * j + Math.sin((j + seed) / 2.3) * 0.012);
    }
    return { labels: labels, values: values };
  }

  function drawPiezoTipChart(tooltipEl, serie) {
    var cv = tooltipEl.querySelector('canvas');
    if (!cv || typeof Chart === 'undefined') return;
    tooltipEl._piezoChart = new Chart(cv.getContext('2d'), {
      type: 'line',
      data: { labels: serie.labels, datasets: [{
        data: serie.values, borderColor: '#1565C0', backgroundColor: 'rgba(21,101,192,.12)',
        fill: true, borderWidth: 2, pointRadius: 0, tension: 0.3
      }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 4, maxRotation: 0 } },
          y: { reverse: true, title: { display: true, text: 'Profondeur (m)', font: { size: 10 } },
               ticks: { font: { size: 10 }, maxTicksLimit: 5, callback: function(v) { return v.toFixed(2); } } }
        }
      }
    });
  }

  function initPiezoMap(contourCoords) {
    var container = document.getElementById('minimap-piezometrie');
    if (!container) return;

    var tooltipEl = document.getElementById('tooltip-piezometrie');

    // Récupérer les stations piézo (département ou Grand Est)
    var stationsData = getPiezoStations();

    var w = container.clientWidth || container.offsetWidth || 300;
    var h = 340;
    container.style.width  = w + 'px';
    container.style.height = h + 'px';
    container.style.maxHeight = h + 'px';

    var vectorSource = new ol.source.Vector();

    // Masque extérieur + contour noir épais
    buildMaskAndContour(contourCoords).forEach(function(f) { vectorSource.addFeature(f); });

    // Stations piézométriques
    stationsData.forEach(function(st) {
      var f = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.fromLonLat(st.coord)) });
      f.set('stationName', st.nom);
      f.set('stationData', st);
      f.set('baseStyle', new ol.style.Style({
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({ color: '#37474F' }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
        })
      }));
      f.set('hoverStyle', new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          fill: new ol.style.Fill({ color: '#0D47A1' }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 3 })
        })
      }));
      f.setStyle(f.get('baseStyle'));
      vectorSource.addFeature(f);
    });

    var map = new ol.Map({
      target: container,
      layers: [buildGreyscaleTileLayer(), new ol.layer.Vector({ source: vectorSource })],
      view: new ol.View({ center: getCurrentCenter(), zoom: currentTerritoire ? 8 : 7 }),
      controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
      interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
    });

    // Fit au contour du territoire courant
    if (contourCoords) {
      var cPoly3 = new ol.geom.Polygon([contourCoords]);
      map.getView().fit(cPoly3.getExtent(), { padding: [30, 30, 30, 30], maxZoom: currentTerritoire ? 10 : 9 });
    }

    setTimeout(function() { map.updateSize(); }, 200);

    // Hover + tooltip (piézo : tooltip cliquable avec graphique)
    var hoveredFeature = null;
    var tooltipHovered = false;
    if (tooltipEl) {
      tooltipEl.addEventListener('mouseenter', function() { tooltipHovered = true; });
      tooltipEl.addEventListener('mouseleave', function() {
        tooltipHovered = false;
        tooltipEl.classList.remove('is-visible');
        if (hoveredFeature && hoveredFeature.get('baseStyle')) {
          hoveredFeature.setStyle(hoveredFeature.get('baseStyle'));
          hoveredFeature = null;
        }
      });
    }
    map.on('pointermove', function(e) {
      var hit = false;
      if (hoveredFeature && hoveredFeature.get('baseStyle') && !tooltipHovered) {
        hoveredFeature.setStyle(hoveredFeature.get('baseStyle'));
        hoveredFeature = null;
      }
      map.forEachFeatureAtPixel(e.pixel, function(f) {
        if (!f.get('stationName')) return;
        hit = true;
        if (hoveredFeature && hoveredFeature !== f && hoveredFeature.get('baseStyle')) {
          hoveredFeature.setStyle(hoveredFeature.get('baseStyle'));
        }
        hoveredFeature = f;
        f.setStyle(f.get('hoverStyle'));
        var st = f.get('stationData');
        if (tooltipEl && st) {
          var piezoHtml = '<strong>' + escHtml(st.nom) + '</strong>';
          piezoHtml += '<div class="tdb-elu2-hydro-tooltip__row"><span>Nappe :</span> <strong>' + escHtml(st.nappe) + '</strong></div>';
          piezoHtml += '<div class="tdb-elu2-hydro-tooltip__row"><span>Niveau :</span> <strong>' + escHtml(st.niveau) + '</strong></div>';
          // Graphique profondeur de la nappe
          piezoHtml += '<div class="tdb-elu2-hydro-tooltip__graph">';
          piezoHtml += '  <div class="tdb-elu2-hydro-tooltip__graph-title">Profondeur de la nappe</div>';
          // Graphique dessiné (format paysage 520 × 250 px) à la place de l'ancienne capture portrait
          var piezoSerie = buildPiezoSerie(st);
          piezoHtml += '  <div class="tdb-elu2-hydro-tooltip__graph-img">';
          piezoHtml += '    <canvas role="img" aria-label="Profondeur de la nappe (m) du ' + escHtml(piezoSerie.labels[0]) + ' au ' + escHtml(piezoSerie.labels[piezoSerie.labels.length - 1]) + ' : de ' + piezoSerie.values[0].toFixed(2) + ' à ' + piezoSerie.values[piezoSerie.values.length - 1].toFixed(2) + ' m"></canvas>';
          piezoHtml += '  </div>';
          piezoHtml += '</div>';
          var sameStation = tooltipEl.getAttribute('data-station') === st.nom && tooltipEl.classList.contains('is-visible');
          if (!sameStation) {
            if (tooltipEl._piezoChart) { tooltipEl._piezoChart.destroy(); tooltipEl._piezoChart = null; }
            tooltipEl.innerHTML = piezoHtml;
            tooltipEl.setAttribute('data-station', st.nom);
            drawPiezoTipChart(tooltipEl, piezoSerie);
          }
          posMapTooltip(tooltipEl, container, e.pixel);
          tooltipEl.classList.add('is-visible');
        }
      });
      container.style.cursor = hit ? 'pointer' : '';
      if (!hit && !tooltipHovered && tooltipEl) {
        tooltipEl.classList.remove('is-visible');
      }
    });

    bindMapLeaveHide(container, tooltipEl, function() { return hoveredFeature; }, function() { tooltipHovered = false; hoveredFeature = null; });

    ressourceUsageMapInstances.push(map);
  }

  // ══════════════════════════════════════════════════════════════════════
  // GOUVERNANCE ET ACTIONS MENÉES — Sous-onglets filles
  // ══════════════════════════════════════════════════════════════════════

  function renderGovTabContent(tuiles, tabId) {
    // Filtrer les tuiles qui appartiennent à ce sous-onglet
    var tabTuiles = tuiles.filter(function(tu) { return tu.sousOnglet === tabId; });

    if (tabTuiles.length === 0) {
      return '<div class="tdb-elu2-amenag-card__pending" style="min-height:200px">'
        + '<i class="ph ph-hourglass-medium"></i>'
        + '<span>Cette sous-section sera disponible prochainement</span></div>';
    }

    if (tabId === 'eau-potable')    return renderGovEauPotable(tabTuiles);
    if (tabId === 'assainissement') return renderGovAssainissement(tabTuiles);
    if (tabId === 'agriculture')    return renderGovAgriculture(tabTuiles);
    if (tabId === 'industrie')      return renderGovIndustrie(tabTuiles);
    if (tabId === 'loisirs')        return renderGovLoisirs(tabTuiles);

    return '<div class="tdb-elu2-amenag-card__pending" style="min-height:200px">'
      + '<i class="ph ph-hourglass-medium"></i>'
      + '<span>Cette sous-section sera disponible prochainement</span></div>';
  }

  // ── Sous-onglet : Eau Potable ──────────────────────────────
  function renderGovEauPotable(tuiles) {
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });
    var html = '';

    // Row 1 : Prix de l'eau (50%) + Rendement réseau (50%)
    html += '<div class="tdb-elu2-gov-row2">';
    html += renderGovPrixEau(t['prix-eau']);
    html += renderGovRendement(t['rendement-reseau']);
    html += '</div>';

    // Row 2 : AAC + Captages dégradés (2 colonnes)
    html += '<div class="tdb-elu2-gov-row2">';
    html += renderGovAAC(t['aac-gov']);
    html += renderGovCaptagesDegrades(t['captages-degrades']);
    html += '</div>';

    // Row 3 : Prélèvements (pleine largeur)
    html += renderGovPrelevements(t['prelevements-ep']);

    return html;
  }

  // ── Sous-onglet : Assainissement ───────────────────────────
  function renderGovAssainissement(tuiles) {
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });
    var html = '';

    // Row 1 : Prix assainissement + Stations d'épuration (2 colonnes)
    html += '<div class="tdb-elu2-gov-row2">';
    html += renderGovPrixAssain(t['prix-assainissement']);
    html += renderGovStationsEpuration(t['stations-epuration']);
    html += '</div>';

    return html;
  }

  // ── Sous-onglet : Agriculture ──────────────────────────────
  function renderGovAgriculture(tuiles) {
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });
    var html = '';

    // Row 1 : Caractérisation surfaces agricoles (pleine largeur)
    html += renderGovSurfacesAgricoles(t['surfaces-agricoles']);

    // Row 2 : Prélèvements agriculture (pleine largeur)
    html += renderGovPrelevements(t['prelevements-agri']);

    return html;
  }

  // ── Sous-onglet : Industrie ────────────────────────────────
  function renderGovIndustrie(tuiles) {
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });
    var html = '';

    // Row 1 : ICPE (1/2) + Sites pollués (1/2)
    html += '<div class="tdb-elu2-gov-row2">';
    html += renderGovICPE(t['icpe']);
    html += renderGovSitesPollues(t['sites-pollues']);
    html += '</div>';

    // Row 2 : Prélèvements industriels (pleine largeur)
    html += renderGovPrelevements(t['prelevements-industrie']);

    return html;
  }

  // ── Sous-onglet : Loisirs ──────────────────────────────────
  function renderGovLoisirs(tuiles) {
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });
    var html = '';

    // Sites de baignade (pleine largeur)
    html += renderGovBaignades(t['sites-baignade']);

    return html;
  }

  // ══════════════════════════════════════════════════════════════
  // TUILES GOUVERNANCE — Rendus individuels
  // ══════════════════════════════════════════════════════════════

  // ── Prix de l'eau / Assainissement ─────────────────────────
  function renderGovPrixCard(tu, typeService) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var isEau = typeService === 'eau';
    var prixId = isEau ? 'GOV_PRIX_EAU' : 'GOV_PRIX_ASSAIN';
    var deptId = isEau ? 'GOV_PRIX_EAU_DEPT' : 'GOV_PRIX_ASSAIN_DEPT';
    var regId  = isEau ? 'GOV_PRIX_EAU_REG' : 'GOV_PRIX_ASSAIN_REG';
    var frId   = isEau ? 'GOV_PRIX_EAU_FR' : 'GOV_PRIX_ASSAIN_FR';
    var lienId = isEau ? 'GOV_LIEN_SISPEA_EP' : 'GOV_LIEN_SISPEA_AC';
    var prix = ind[prixId];
    var dept = ind[deptId];
    var reg  = ind[regId];
    var fr   = ind[frId];
    var lien = ind[lienId];

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-prix">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ' + (isEau ? 'ph-coin' : 'ph-coins') + '"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-prix__body">';

    // Valeur principale
    if (prix) {
      html += '<div class="tdb-elu2-gov-prix__main">';
      html += '  <span class="tdb-elu2-gov-prix__val">' + escHtml(prix.fakeValue) + '</span>';
      html += '  <span class="tdb-elu2-gov-prix__unit">' + escHtml(prix.unite) + '</span>';
      html += '</div>';
    }

    // Barre de comparaison stylisée
    html += '<div class="tdb-elu2-gov-prix__bar-wrap">';
    var pMin = 0.50;
    var pMax = 5.00;
    var pVal = parseFloat(prix.fakeValue) || 0;
    var pPct = Math.min(100, Math.max(0, ((pVal - pMin) / (pMax - pMin)) * 100));
    html += '  <div class="tdb-elu2-gov-prix__bar">';
    html += '    <div class="tdb-elu2-gov-prix__bar-fill" style="width:' + pPct + '%"></div>';
    html += '    <div class="tdb-elu2-gov-prix__bar-marker" style="left:' + pPct + '%"></div>';
    html += '  </div>';
    html += '  <div class="tdb-elu2-gov-prix__bar-labels"><span>' + pMin.toFixed(2) + ' \u20ac</span><span>' + pMax.toFixed(2) + ' \u20ac</span></div>';
    html += '</div>';

    // Moyennes comparatives
    html += '<div class="tdb-elu2-gov-prix__comparatifs">';
    if (dept) {
      html += '<div class="tdb-elu2-gov-prix__comp"><span class="tdb-elu2-gov-prix__comp-label">Minimum R\u00e9gion' + renderInfobulle(isEau ? 'GOV_PRIX_EAU' : 'GOV_PRIX_ASSAIN') + '</span><span class="tdb-elu2-gov-prix__comp-val">' + escHtml(dept.fakeValue) + ' ' + escHtml(dept.unite) + '</span></div>';
    }
    if (reg) {
      html += '<div class="tdb-elu2-gov-prix__comp"><span class="tdb-elu2-gov-prix__comp-label">Moyenne R\u00e9gion' + renderInfobulle(isEau ? 'GOV_PRIX_EAU' : 'GOV_PRIX_ASSAIN') + '</span><span class="tdb-elu2-gov-prix__comp-val">' + escHtml(reg.fakeValue) + ' ' + escHtml(reg.unite) + '</span></div>';
    }
    if (fr) {
      html += '<div class="tdb-elu2-gov-prix__comp"><span class="tdb-elu2-gov-prix__comp-label">Maximum R\u00e9gion' + renderInfobulle(isEau ? 'GOV_PRIX_EAU' : 'GOV_PRIX_ASSAIN') + '</span><span class="tdb-elu2-gov-prix__comp-val">' + escHtml(fr.fakeValue) + ' ' + escHtml(fr.unite) + '</span></div>';
    }
    html += '</div>';

    // Lien SISPEA
    if (lien && lien.url) {
      html += '<a href="' + escHtml(lien.url) + '" target="_blank" rel="noopener" class="tdb-elu2-captages__link" style="margin-top:12px">';
      html += '  <i class="ph ph-arrow-square-out"></i> Lien SISPEA';
      html += '</a>';
    }

    html += '</div></div>';
    return html;
  }

  function renderGovPrixEau(tu) { return renderGovPrixCard(tu, 'eau'); }
  function renderGovPrixAssain(tu) { return renderGovPrixCard(tu, 'assainissement'); }

  // ── Rendement du réseau ────────────────────────────────────
  function renderGovRendement(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var d = currentTerritoire ? currentTerritoire.data : null;
    var rMoy = ind['GOV_REND_MOY'];
    var rGE  = ind['GOV_REND_GE'];

    // Valeurs réelles ou fake
    var moyVal = (d && d.ind && d.ind['GOV_REND_MOY']) ? parseFloat(d.ind['GOV_REND_MOY']) : (rMoy ? parseFloat(rMoy.fakeValue) : 0);
    var geVal  = (d && d.ind && d.ind['GOV_REND_GE'])  ? parseFloat(d.ind['GOV_REND_GE'])  : (rGE  ? parseFloat(rGE.fakeValue)  : 0);
    if (isNaN(moyVal)) moyVal = 0;
    if (isNaN(geVal))  geVal  = 0;

    var moyColor = '#1565C0';

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-rendement">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-pipe"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-rendement__body">';

    // 2 jauges côte à côte, même taille
    html += '<div class="tdb-elu2-gov-rendement__kpis tdb-elu2-gov-rendement__kpis--gauges">';
    if (rMoy) {
      // Rendement du territoire : toujours en couleur (c'est l'indicateur mis en avant)
      html += '<div class="tdb-elu2-gov-rendement__gauge-col">';
      html += renderGaugeSVG(moyVal, moyColor, 'Rendement moyen du territoire');
      html += '</div>';
    }
    if (rGE)  {
      html += '<div class="tdb-elu2-gov-rendement__gauge-col">';
      // Grand Est = valeur de comparaison → gris soutenu (le territoire reste en couleur)
      html += renderGaugeSVG(geVal, '#607D8B', 'Rendement moyen Grand Est');
      html += '</div>';
    }
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ── AAC (carte interactive + couverture) ────────────────────
  function renderGovAAC(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var couv = ind['GOV_AAC_COUV'];

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-aac">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-shield-check"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-aac__body">';

    // Layout horizontal : carte carrée + KPI
    html += '<div class="tdb-elu2-gov-aac__inner">';

    // Carte interactive (même style que rendement)
    html += '<div class="tdb-elu2-gov-aac__map-wrap">';
    html += '  <div class="tdb-elu2-amenag-card__minimap tdb-elu2-ru-hydro__map--interactive" id="minimap-gov-aac" data-minimap="gov-aac"></div>';
    html += '</div>';

    // Couverture
    if (couv) {
      html += '<div class="tdb-elu2-gov-aac__kpi">';
      html += renderGaugeSVG(parseFloat(couv.fakeValue) || 0, '#7B1FA2', 'Couverture du territoire');
      html += '</div>';
    }
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ── Captages dégradés (pie chart) ──────────────────────────
  function renderGovCaptagesDegrades(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var pie = ind['GOV_CAPT_DEG_PIE'];
    var cd = getCaptDegData(tu);

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-captdeg">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-warning-octagon"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-captdeg__body">';

    // KPI : nombre de captages dégradés du territoire
    html += '<div class="tdb-elu2-gov-captdeg__kpi">';
    html += '  <i class="ph ph-drop-slash tdb-elu2-gov-captdeg__kpi-icon" aria-hidden="true"></i>';
    html += '  <div>';
    html += '    <div class="tdb-elu2-gov-captdeg__kpi-val">' + escHtml(cd.total) + '</div>';
    html += '    <div class="tdb-elu2-gov-captdeg__kpi-label">Captages d\u00e9grad\u00e9s sur le territoire' + renderInfobulle('CAPTAGE_DEGRADE_NB') + '</div>';
    html += '  </div>';
    html += '</div>';

    if (pie) {
      html += '<div class="tdb-elu2-gov-captdeg__pie">';
      html += '<div class="tdb-elu2-gov-captdeg__pie-title">R\u00e9partition par cause de d\u00e9gradation' + renderInfobulle('GOV_CAPT_DEG_PIE') + '</div>';
      html += '<div class="tdb-elu2-gov-captdeg__chart-wrap">';
      html += '  <canvas id="chart-v2-gov-captdeg" data-chart-v2="gov-captdeg"></canvas>';
      html += '</div>';

      // Légende (avec nombre de captages)
      html += '<div class="tdb-elu2-ru-etat__legend tdb-elu2-ru-etat__legend--inline">';
      for (var i = 0; i < cd.labels.length; i++) {
        html += '<span class="tdb-elu2-ru-etat__legend-item"><span class="tdb-elu2-ru-etat__legend-dot" style="background:' + cd.colors[i] + '"></span>' + escHtml(cd.labels[i]) + ' (' + cd.values[i] + ')</span>';
      }
      html += '</div>';
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // Données « captages dégradés » du territoire courant :
  // total = CAPTAGE_DEGRADE_NB (Grand Est) ou GOV_CAPTDEG_NB du département ;
  // la répartition par cause conserve les proportions de référence.
  function getCaptDegData(tu) {
    tu = tu || findTuile('ressource-usage', 'captages-degrades');
    var pieInd = tu ? tu.indicateurs.find(function(i) { return i.id === 'GOV_CAPT_DEG_PIE'; }) : null;
    var nbInd = tu ? tu.indicateurs.find(function(i) { return i.id === 'CAPTAGE_DEGRADE_NB'; }) : null;
    var base = (pieInd && pieInd.fakeChartData) || { labels: [], values: [], colors: [] };
    var baseTotal = base.values.reduce(function(a, v) { return a + v; }, 0) || 1;
    var total = parseInt(getIndVal('GOV_CAPTDEG_NB', nbInd ? nbInd.fakeValue : baseTotal), 10);
    if (isNaN(total)) total = baseTotal;
    var values = base.values.slice();
    if (total !== baseTotal) {
      // Répartition proportionnelle (méthode du plus fort reste) pour que la somme = total
      var raw = base.values.map(function(v) { return v / baseTotal * total; });
      values = raw.map(Math.floor);
      var rest = total - values.reduce(function(a, v) { return a + v; }, 0);
      raw.map(function(v, i) { return { i: i, r: v - Math.floor(v) }; })
        .sort(function(a, b) { return b.r - a.r; })
        .slice(0, rest).forEach(function(o) { values[o.i]++; });
    }
    return { labels: base.labels, colors: base.colors, values: values, total: total };
  }

  // ── Prélèvements (même structure que fiche d'identité) — réutilisé EP + Agri
  function renderGovPrelevements(tu) {
    if (!tu) return '';
    var volInd = tu.indicateurs.find(function(i) { return i.type === 'chiffre_cle'; });
    var histInd = tu.indicateurs.find(function(i) { return i.type === 'graphique'; });
    var chartId = 'chart-v2-gov-prel-' + tu.zone;

    var html = '<div class="tdb-elu2-card tdb-elu2-prelevements">';
    html += '<div class="tdb-elu2-prelevements__title"><i class="ph ph-chart-bar"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-prelevements__body">';
    html += '  <div class="tdb-elu2-prelevements__chart">';
    html += '    <canvas id="' + chartId + '" data-chart-v2="' + chartId + '"></canvas>';
    html += '  </div>';
    if (volInd) {
      html += '  <div class="tdb-elu2-prelevements__kpi">';
      html += '    <div class="tdb-elu2-prelevements__volume-val">' + escHtml(volInd.fakeValue) + '</div>';
      html += '    <div class="tdb-elu2-prelevements__volume-unit">' + escHtml(volInd.unite) + '</div>';
      html += '    <div class="tdb-elu2-prelevements__volume-label">' + escHtml(volInd.nom) + renderInfobulle(volInd.id) + '</div>';
      html += '  </div>';
    }
    html += '</div>';

    // Légende pictos
    if (histInd && histInd.fakeChartData) {
      html += '<div class="tdb-elu2-prelevements__legend">';
      histInd.fakeChartData.datasets.forEach(function(ds) {
        var icon = ds.label.indexOf('souterrain') >= 0 ? 'ph-drop-half-bottom' : ds.label.indexOf('superficiel') >= 0 ? 'ph-waves' : ds.label.indexOf('agric') >= 0 ? 'ph-tractor' : ds.label.indexOf('ndustr') >= 0 ? 'ph-factory' : 'ph-drop';
        html += '<div class="tdb-elu2-prelevements__legend-item">';
        html += '  <span class="tdb-elu2-prelevements__legend-dot" style="background:' + ds.color + '"></span>';
        html += '  <i class="ph ' + icon + '" style="color:' + ds.color + '"></i>';
        html += '  <span>' + escHtml(ds.label) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // ── Stations d'épuration ───────────────────────────────────
  function renderGovStationsEpuration(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var nb = ind['GOV_STEP_NB'];
    var reut = ind['GOV_STEP_REUT'];

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-step">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-gear-six"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-step__body">';

    // Carte interactive
    html += '<div class="tdb-elu2-gov-step__map-wrap">';
    html += '  <div class="tdb-elu2-ru-hydro__map tdb-elu2-ru-hydro__map--interactive" id="minimap-gov-step" data-minimap="gov-step" style="height:220px;max-height:220px"></div>';
    html += '  <div id="tooltip-gov-step" class="tdb-elu2-hydro-tooltip"></div>';
    html += '</div>';

    // KPIs
    html += '<div class="tdb-elu2-gov-step__kpis">';
    if (nb) {
      html += '<div class="tdb-elu2-amenag-kpi"><span class="tdb-elu2-amenag-kpi__label">Nombre de stations' + renderInfobulle('GOV_STEP_NB') + '</span><span class="tdb-elu2-amenag-kpi__val">' + escHtml(nb.fakeValue) + '</span></div>';
    }
    // Ligne « Capacité totale » retirée (demande client) — la capacité reste visible station par station (info-bulle de la carte)
    if (reut) {
      html += '<div class="tdb-elu2-amenag-kpi"><span class="tdb-elu2-amenag-kpi__label">Projets REUT' + renderInfobulle('GOV_STEP_REUT') + '</span><span class="tdb-elu2-amenag-kpi__val">' + escHtml(reut.fakeValue) + '</span></div>';
    }
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ── Surfaces agricoles (carte + pie + KPI SAU) ─────────────
  function renderGovSurfacesAgricoles(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var pie = ind['GOV_AGRI_COUV_PIE'];
    var sau = ind['GOV_AGRI_SAU_IRRIG'];

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-agri-surf">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-plant"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-agri-surf__body">';

    // 3 colonnes : carte | pie | KPI SAU
    html += '<div class="tdb-elu2-gov-agri-surf__inner">';

    // Colonne 1 : carte
    html += '<div class="tdb-elu2-gov-agri-surf__col tdb-elu2-gov-agri-surf__col--map">';
    html += '  <div class="tdb-elu2-gov-agri-surf__map-label">Localisation des surfaces cultiv\u00e9es par type de culture</div>';
    html += '  <div class="tdb-elu2-amenag-card__minimap" id="minimap-gov-agri" data-minimap="gov-agri" style="height:200px;max-height:200px"></div>';
    html += '</div>';

    // Colonne 2 : pie chart
    html += '<div class="tdb-elu2-gov-agri-surf__col tdb-elu2-gov-agri-surf__col--pie">';
    html += '  <div class="tdb-elu2-gov-agri-surf__pie-label">% de couverture par type de culture</div>';
    html += '  <div class="tdb-elu2-gov-agri-surf__pie-wrap">';
    html += '    <canvas id="chart-v2-gov-agri-pie" data-chart-v2="gov-agri-pie"></canvas>';
    html += '  </div>';

    // Légende sous le pie
    if (pie && pie.fakeChartData) {
      var cd = pie.fakeChartData;
      html += '<div class="tdb-elu2-ru-etat__legend tdb-elu2-ru-etat__legend--inline">';
      for (var i = 0; i < cd.labels.length; i++) {
        html += '<span class="tdb-elu2-ru-etat__legend-item"><span class="tdb-elu2-ru-etat__legend-dot" style="background:' + cd.colors[i] + '"></span>' + escHtml(cd.labels[i]) + '</span>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Colonne 3 : KPI SAU
    html += '<div class="tdb-elu2-gov-agri-surf__col tdb-elu2-gov-agri-surf__col--kpi">';
    if (sau) {
      html += '<div class="tdb-elu2-gov-agri-surf__kpi tdb-elu2-gov-agri-surf__kpi--big">';
      html += renderGaugeSVG(parseFloat(sau.fakeValue) || 0, '#8BC34A', 'Surface Agricole Utile irrigu\u00e9e');
      html += renderInfobulle('GOV_AGRI_SAU_IRRIG');
      html += '</div>';
    }
    html += '</div>';

    html += '</div>'; // inner
    html += '</div></div>';
    return html;
  }

  // ── Installations classées ICPE (pie SEVESO / non SEVESO) ──
  function renderGovICPE(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var pie = ind['ICPE_NB_PAR_CAT'];

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-industrie-card">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-factory"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-industrie-card__body">';

    if (pie && pie.fakeChartData) {
      var chartId = 'chart-v2-gov-icpe';
      html += '<div class="tdb-elu2-gov-industrie-card__chart-wrap">';
      html += '<canvas id="' + chartId + '" data-chart-v2="' + chartId + '"></canvas>';
      html += '</div>';
      // Légende
      var cd = pie.fakeChartData;
      html += '<div class="tdb-elu2-ru-etat__legend tdb-elu2-ru-etat__legend--inline">';
      for (var i = 0; i < cd.labels.length; i++) {
        html += '<span class="tdb-elu2-ru-etat__legend-item"><span class="tdb-elu2-ru-etat__legend-dot" style="background:' + cd.colors[i] + '"></span>' + escHtml(cd.labels[i]) + ' (' + cd.values[i] + '\u00a0%)</span>';
      }
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  // ── Sites et sols pollués (KPI + carte interactive) ─────────
  function renderGovSitesPollues(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var nb = ind['BASOL_NB'];

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-industrie-card">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-warning-octagon"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';
    html += '<div class="tdb-elu2-gov-industrie-card__body">';

    // KPI
    if (nb) {
      html += '<div class="tdb-elu2-amenag-card__big-number" style="justify-content:center">';
      html += '<span class="tdb-elu2-amenag-card__big-val">' + escHtml(nb.fakeValue) + '</span>';
      html += '<span class="tdb-elu2-amenag-card__big-label">sites sur le territoire' + renderInfobulle('BASOL_NB') + '</span>';
      html += '</div>';
    }

    // Carte interactive
    html += '<div class="tdb-elu2-gov-industrie-card__map-wrap">';
    html += '<div class="tdb-elu2-ru-hydro__map tdb-elu2-ru-hydro__map--interactive" id="minimap-sites-pollues" style="height:220px;max-height:220px"></div>';
    html += '<div id="tooltip-sites-pollues" class="tdb-elu2-hydro-tooltip" style="display:none"></div>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ── Sites de baignade (KPI + jauge qualité + carte + pie) ──
  function renderGovBaignades(tu) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var nb = ind['SITE_BAIGNADE_NB'];
    var pie = ind['SITE_BAIGNADE_NB_PAR_CAT'];

    var html = '<div class="tdb-elu2-card tdb-elu2-gov-baignade">';
    html += '<div class="tdb-elu2-amenag-card__title"><i class="ph ph-person-simple-swim"></i> ' + escHtml(tu.tuile) + renderTuileInfobulle(tu) + '</div>';

    // Ligne unique : KPI + Pie (gauche) | Carte (droite)
    html += '<div class="tdb-elu2-gov-baignade__body">';

    // Colonne gauche : KPI + camembert empilés verticalement
    html += '<div class="tdb-elu2-gov-baignade__left">';

    // KPI centré avec icône
    html += '<div class="tdb-elu2-gov-baignade__kpi">';
    if (nb) {
      html += '<i class="ph ph-map-pin-area tdb-elu2-gov-baignade__kpi-icon"></i>';
      html += '<span class="tdb-elu2-gov-baignade__kpi-val">' + escHtml(nb.fakeValue) + '</span>';
      html += '<span class="tdb-elu2-gov-baignade__kpi-label">Sites de baignade sur le territoire' + renderInfobulle('SITE_BAIGNADE_NB') + '</span>';
    }
    html += '</div>';

    // Pie chart répartition par catégorie
    if (pie && pie.fakeChartData) {
      var chartId = 'chart-v2-gov-baignade-pie';
      html += '<div class="tdb-elu2-gov-baignade__pie-title">R\u00e9partition par classe de qualit\u00e9 (2025)</div>';
      html += '<div class="tdb-elu2-gov-baignade__chart-wrap">';
      html += '<canvas id="' + chartId + '" data-chart-v2="' + chartId + '"></canvas>';
      html += '</div>';
      var cd = pie.fakeChartData;
      html += '<div class="tdb-elu2-gov-baignade__legend">';
      for (var i = 0; i < cd.labels.length; i++) {
        html += '<span class="tdb-elu2-gov-baignade__legend-item"><span class="tdb-elu2-gov-baignade__legend-dot" style="background:' + cd.colors[i] + '"></span>' + escHtml(cd.labels[i]) + '</span>';
      }
      html += '</div>';
    }

    html += '</div>'; // fin left

    // Colonne droite : carte interactive
    html += '<div class="tdb-elu2-gov-baignade__map">';
    html += '<div class="tdb-elu2-ru-hydro__map tdb-elu2-ru-hydro__map--interactive" id="minimap-baignades"></div>';
    html += '<div id="tooltip-baignade" class="tdb-elu2-hydro-tooltip tdb-elu2-hydro-tooltip--dark" style="display:none"></div>';
    html += '</div>';

    html += '</div>'; // fin body

    // Lien externe
    if (tu.lienExterne) {
      html += '<div class="tdb-elu2-vuln-risque-card__link">';
      html += '<a href="' + escHtml(tu.lienExterne.url) + '" target="_blank" rel="noopener">';
      html += '<i class="ph ' + escHtml(tu.lienExterne.icon) + '"></i> ' + escHtml(tu.lienExterne.label);
      html += '</a></div>';
    }
    html += '</div>';
    return html;
  }

  // ══════════════════════════════════════════════════════════════
  // GOUVERNANCE — Event binding sous-onglets
  // ══════════════════════════════════════════════════════════════

  function bindGovTabs() {
    var tabContainer = document.getElementById('tdb-elu2-gov-tabs');
    if (!tabContainer) return;
    tabContainer.addEventListener('click', function(e) {
      var btn = e.target.closest('.tdb-elu2-gov-tabs__btn');
      if (!btn) return;
      var tabId = btn.dataset.govTab;
      if (tabId === govActiveTab) return;
      govActiveTab = tabId;

      // Mise à jour visuelle des boutons
      tabContainer.querySelectorAll('.tdb-elu2-gov-tabs__btn').forEach(function(b) {
        var isA = b.dataset.govTab === tabId;
        b.classList.toggle('is-active', isA);
        b.setAttribute('aria-selected', isA);
        b.setAttribute('tabindex', isA ? '0' : '-1');
      });
      var govPanel = document.getElementById('tdb-elu2-gov-content');
      if (govPanel) govPanel.setAttribute('aria-labelledby', 'tdb-elu2-govtab-' + tabId);

      // Détruire charts + maps du sous-onglet (pas ceux de Ressource)
      destroyGovCharts();
      destroyGouvernanceMaps();

      // Re-render contenu
      var contentEl = document.getElementById('tdb-elu2-gov-content');
      if (contentEl) {
        var tuiles = TUILES_ELU_V2['ressource-usage'] || [];
        contentEl.innerHTML = renderGovTabContent(tuiles, tabId);
        initGouvernanceCharts();
        initGouvernanceMaps();
        setTimeout(injectTuileSources, 100);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // USAGES — Charts (pie + stacked bar)
  // ══════════════════════════════════════════════════════════════

  function destroyGovCharts() {
    govChartInstances.forEach(function(c) { c.destroy(); });
    govChartInstances = [];
  }

  function initGouvernanceCharts() {
    if (typeof Chart === 'undefined') return;

    // Bind les sous-onglets (chaque fois qu'on re-render)
    bindGovTabs();

    // ── Captages dégradés pie chart ──
    var captCanvas = document.getElementById('chart-v2-gov-captdeg');
    if (captCanvas) {
      var tuCapt = findTuile('ressource-usage', 'captages-degrades');
      if (tuCapt) {
        var indPie = tuCapt.indicateurs.find(function(i) { return i.graphType === 'pie'; });
        if (indPie && indPie.fakeChartData) {
          var cd = getCaptDegData(tuCapt);
          var size = 200;
          captCanvas.style.width  = size + 'px';
          captCanvas.style.height = size + 'px';
          govChartInstances.push(new Chart(captCanvas.getContext('2d'), {
            type: 'pie',
            data: {
              labels: cd.labels,
              datasets: [{ label: 'Nombre de captages', data: cd.values, backgroundColor: cd.colors, borderWidth: 2, borderColor: '#fff' }]
            },
            plugins: [pieCountLabelsPlugin],
            options: {
              responsive: false,
              layout: { padding: 30 },
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) {
                var pct = cd.total ? Math.round(ctx.parsed / cd.total * 1000) / 10 : 0;
                return ctx.label + ' : ' + ctx.parsed + ' captage' + (ctx.parsed > 1 ? 's' : '') + ' (' + pct + ' %)';
              } } } }
            }
          }));
        }
      }
    }

    // ── Agriculture : pie couverture cultures ──
    var agriPieCanvas = document.getElementById('chart-v2-gov-agri-pie');
    if (agriPieCanvas) {
      var tuAgri = findTuile('ressource-usage', 'surfaces-agricoles');
      if (tuAgri) {
        var indAgriPie = tuAgri.indicateurs.find(function(i) { return i.graphType === 'pie'; });
        if (indAgriPie && indAgriPie.fakeChartData) {
          var cdA = indAgriPie.fakeChartData;
          var sizeA = 200;
          agriPieCanvas.style.width  = sizeA + 'px';
          agriPieCanvas.style.height = sizeA + 'px';
          govChartInstances.push(new Chart(agriPieCanvas.getContext('2d'), {
            type: 'pie',
            data: {
              labels: cdA.labels,
              datasets: [{ data: cdA.values, backgroundColor: cdA.colors, borderWidth: 2, borderColor: '#fff' }]
            },
            plugins: [pieOuterLabelsPlugin],
            options: {
              responsive: false,
              layout: { padding: 30 },
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return ctx.label + ' : ' + ctx.parsed + ' %'; } } } }
            }
          }));
        }
      }
    }

    // ── ICPE pie chart ──
    var icpeCanvas = document.getElementById('chart-v2-gov-icpe');
    if (icpeCanvas) {
      var tuIcpe = findTuile('ressource-usage', 'icpe');
      if (tuIcpe) {
        var indIcpe = tuIcpe.indicateurs.find(function(i) { return i.graphType === 'pie'; });
        if (indIcpe && indIcpe.fakeChartData) {
          var cdI = indIcpe.fakeChartData;
          var sizeI = 200;
          icpeCanvas.style.width  = sizeI + 'px';
          icpeCanvas.style.height = sizeI + 'px';
          govChartInstances.push(new Chart(icpeCanvas.getContext('2d'), {
            type: 'pie',
            data: {
              labels: cdI.labels,
              datasets: [{ data: cdI.values, backgroundColor: cdI.colors, borderWidth: 2, borderColor: '#fff' }]
            },
            plugins: [pieOuterLabelsPlugin],
            options: {
              responsive: false,
              layout: { padding: 30 },
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return ctx.label + ' : ' + ctx.parsed + ' %'; } } } }
            }
          }));
        }
      }
    }

    // ── Baignades pie chart ──
    var baignCanvas = document.getElementById('chart-v2-gov-baignade-pie');
    if (baignCanvas) {
      var tuBaign = findTuile('ressource-usage', 'sites-baignade');
      if (tuBaign) {
        var indBaign = tuBaign.indicateurs.find(function(i) { return i.graphType === 'pie'; });
        if (indBaign && indBaign.fakeChartData) {
          var cdB = indBaign.fakeChartData;
          var sizeB = 260;
          baignCanvas.style.width  = sizeB + 'px';
          baignCanvas.style.height = sizeB + 'px';
          govChartInstances.push(new Chart(baignCanvas.getContext('2d'), {
            type: 'pie',
            data: {
              labels: cdB.labels,
              datasets: [{ data: cdB.values, backgroundColor: cdB.colors, borderWidth: 2, borderColor: '#fff' }]
            },
            plugins: [pieOuterLabelsPlugin],
            options: {
              responsive: false,
              layout: { padding: 30 },
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { return ctx.label + ' : ' + ctx.parsed; } } } }
            }
          }));
        }
      }
    }

    // ── Prélèvements stacked bar (EP, Agri ou Industrie selon onglet actif) ──
    var prelZones = ['prelevements-ep', 'prelevements-agri', 'prelevements-industrie'];
    prelZones.forEach(function(zone) {
      var canvasId = 'chart-v2-gov-prel-' + zone;
      var canvas = document.getElementById(canvasId);
      if (!canvas) return;
      var tu = findTuile('ressource-usage', zone);
      if (!tu) return;
      var histInd = tu.indicateurs.find(function(i) { return i.type === 'graphique'; });
      if (!histInd || !histInd.fakeChartData) return;

      var cpd = histInd.fakeChartData;
      var datasets = cpd.datasets.map(function(ds) {
        return { label: ds.label, data: ds.data, backgroundColor: ds.color, borderRadius: 2 };
      });
      govChartInstances.push(new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: { labels: cpd.labels, datasets: datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { stacked: true, beginAtZero: true, grid: { color: '#F1F5F9' },
              ticks: { font: { size: 10 }, callback: function(v) { return v + ' Mm\u00b3'; } },
              title: { display: true, text: 'Millions m\u00b3', font: { size: 10 }, color: '#64748B' }
            }
          }
        }
      }));
    });
  }

  // ══════════════════════════════════════════════════════════════
  // GOUVERNANCE — Mini-cartes OL
  // ══════════════════════════════════════════════════════════════

  var gouvernanceMapInstances = [];

  function destroyGouvernanceMaps() {
    gouvernanceMapInstances.forEach(function(m) { m.setTarget(null); });
    gouvernanceMapInstances = [];
  }

  function initGouvernanceMaps() {
    if (typeof ol === 'undefined') return;
    destroyGouvernanceMaps();

    var geContourCoords = getCurrentContour();

    // (Carte rendement supprimée — remplacée par jauges)

    // Carte AAC — fond N&B + masque + contour noir (comme rendement)
    var aacContainer = document.getElementById('minimap-gov-aac');
    if (aacContainer) {
      aacContainer.style.width  = '100%';
      aacContainer.style.height = '265px';
      var aacVS = new ol.source.Vector();
      buildMaskAndContour(geContourCoords).forEach(function(f) { aacVS.addFeature(f); });
      var aacMap = new ol.Map({
        target: aacContainer,
        layers: [buildGreyscaleTileLayer(), new ol.layer.Vector({ source: aacVS })],
        view: new ol.View({ center: getCurrentCenter(), zoom: currentTerritoire ? 8 : 7 }),
        controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
        interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
      });
      if (geContourCoords) {
        aacMap.getView().fit(new ol.geom.Polygon([geContourCoords]).getExtent(), { padding: [15, 15, 15, 15], maxZoom: currentTerritoire ? 10 : 8 });
      }
      setTimeout(function() { aacMap.updateSize(); }, 200);
      gouvernanceMapInstances.push(aacMap);
    }

    // Cartes simples (agriculture) — fond N&B + masque + contour noir
    var simpleMaps = ['minimap-gov-agri'];
    simpleMaps.forEach(function(id) {
      var container = document.getElementById(id);
      if (!container) return;
      var w = container.clientWidth || container.offsetWidth || 300;
      var h = parseInt(container.style.maxHeight) || 160;
      container.style.width  = w + 'px';
      container.style.height = h + 'px';

      var vectorSource = new ol.source.Vector();
      buildMaskAndContour(geContourCoords).forEach(function(f) { vectorSource.addFeature(f); });

      var map = new ol.Map({
        target: container,
        layers: [buildGreyscaleTileLayer(), new ol.layer.Vector({ source: vectorSource })],
        view: new ol.View({ center: getCurrentCenter(), zoom: currentTerritoire ? 8 : 7 }),
        controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
        interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
      });
      if (geContourCoords) {
        var cExtent = new ol.geom.Polygon([geContourCoords]).getExtent();
        map.getView().fit(cExtent, { padding: [15, 15, 15, 15], maxZoom: currentTerritoire ? 10 : 8 });
      }
      setTimeout(function() { map.updateSize(); }, 200);
      gouvernanceMapInstances.push(map);
    });

    // Carte interactive des stations d'épuration
    initGovStepMap(geContourCoords);

    // Carte interactive des sites pollués
    initSitesPolluésMap(geContourCoords);

    // Carte interactive des sites de baignade
    initBaignadeMap(geContourCoords);
  }

  function initGovStepMap(contourCoords) {
    var container = document.getElementById('minimap-gov-step');
    if (!container) return;
    var tooltipEl = document.getElementById('tooltip-gov-step');
    // Sortir le tooltip (position:fixed) de la carte pour éviter tout masquage par un conteneur parent
    if (tooltipEl && tooltipEl.parentNode !== document.body) {
      var oldTip = document.body.querySelector(':scope > #tooltip-gov-step');
      if (oldTip && oldTip !== tooltipEl) oldTip.remove();
      document.body.appendChild(tooltipEl);
    }

    // Récupérer les stations STEP (département ou Grand Est)
    var stationsData = getStepStations();

    var w = container.clientWidth || container.offsetWidth || 400;
    var h = 220;
    container.style.width  = w + 'px';
    container.style.height = h + 'px';
    container.style.maxHeight = h + 'px';

    var vectorSource = new ol.source.Vector();

    // Masque + contour noir (comme Ressource/usage)
    buildMaskAndContour(contourCoords).forEach(function(f) { vectorSource.addFeature(f); });

    stationsData.forEach(function(st) {
      var f = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.fromLonLat(st.coord)) });
      f.set('stationName', st.nom);
      f.set('stationData', st);
      // reut peut être 'oui'/'non' (Grand Est) ou true/false (départements)
      st.reutOk = (st.reut === true || st.reut === 'oui');
      var ptColor = st.reutOk ? '#2E7D32' : '#455A64';
      f.set('baseStyle', new ol.style.Style({
        image: new ol.style.Circle({ radius: 7, fill: new ol.style.Fill({ color: ptColor }), stroke: new ol.style.Stroke({ color: '#fff', width: 2 }) }),
        text: new ol.style.Text({ text: st.nom.replace('STEP ', ''), offsetY: -18, font: '10px "Satoshi",sans-serif',
          fill: new ol.style.Fill({ color: '#1a2332' }), stroke: new ol.style.Stroke({ color: '#fff', width: 3 }), overflow: true })
      }));
      f.set('hoverStyle', new ol.style.Style({
        image: new ol.style.Circle({ radius: 10, fill: new ol.style.Fill({ color: '#0D47A1' }), stroke: new ol.style.Stroke({ color: '#fff', width: 3 }) }),
        text: new ol.style.Text({ text: st.nom, offsetY: -22, font: 'bold 12px "Satoshi",sans-serif',
          fill: new ol.style.Fill({ color: '#1a2332' }), stroke: new ol.style.Stroke({ color: '#fff', width: 3.5 }), overflow: true })
      }));
      f.setStyle(f.get('baseStyle'));
      vectorSource.addFeature(f);
    });

    var map = new ol.Map({
      target: container,
      layers: [buildGreyscaleTileLayer(), new ol.layer.Vector({ source: vectorSource })],
      view: new ol.View({ center: getCurrentCenter(), zoom: currentTerritoire ? 8 : 7 }),
      controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
      interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
    });

    // Fit au contour du territoire courant
    if (contourCoords) {
      var cPoly4 = new ol.geom.Polygon([contourCoords]);
      map.getView().fit(cPoly4.getExtent(), { padding: [30, 30, 30, 30], maxZoom: currentTerritoire ? 10 : 9 });
    }
    setTimeout(function() { map.updateSize(); }, 200);

    // Hover + tooltip
    var hoveredFeature = null;
    map.on('pointermove', function(e) {
      var hit = false;
      if (e.dragging) return;
      if (hoveredFeature && hoveredFeature.get('baseStyle')) { hoveredFeature.setStyle(hoveredFeature.get('baseStyle')); hoveredFeature = null; }
      map.forEachFeatureAtPixel(e.pixel, function(f) {
        if (!f.get('stationName') || hit) return;
        hit = true;
        hoveredFeature = f;
        f.setStyle(f.get('hoverStyle'));
        var st = f.get('stationData');
        if (tooltipEl && st) {
          var reutHtml = st.reutOk
            ? '<span style="color:#2E7D32;font-weight:700">\u2713 Oui</span>'
            : '<span style="color:#C62828;font-weight:700">\u2717 Non</span>';
          tooltipEl.innerHTML = '<strong>' + escHtml(st.nom) + '</strong>'
            + '<div class="tdb-elu2-hydro-tooltip__row"><span>Capacit\u00e9 :</span> <strong>' + escHtml(st.capacite) + '</strong></div>'
            + '<div class="tdb-elu2-hydro-tooltip__row"><span>Projet REUT :</span> ' + reutHtml + '</div>'
            + '<div class="tdb-elu2-hydro-tooltip__link-hint"><i class="ph ph-arrow-square-out"></i> Cliquer pour acc\u00e9der \u00e0 la fiche station</div>';
          posMapTooltip(tooltipEl, container, e.pixel);
          tooltipEl.classList.add('is-visible');
        }
      }, { hitTolerance: 6 });
      container.style.cursor = hit ? 'pointer' : '';
      if (!hit && tooltipEl) { tooltipEl.classList.remove('is-visible'); }
    });

    bindMapLeaveHide(container, tooltipEl, function() { return hoveredFeature; }, function() { hoveredFeature = null; });

    // Click sur une station = ouvrir la fiche sur le portail assainissement
    map.on('click', function(e) {
      var opened = false;
      map.forEachFeatureAtPixel(e.pixel, function(f) {
        if (!f.get('stationName') || opened) return;
        opened = true;
        window.open('https://assainissement.developpement-durable.gouv.fr', '_blank');
      }, { hitTolerance: 6 });
    });

    gouvernanceMapInstances.push(map);
  }

  // ── Carte interactive sites et sols pollués ──────────────────────────
  function initSitesPolluésMap(contourCoords) {
    var container = document.getElementById('minimap-sites-pollues');
    if (!container) return;
    var tooltipEl = document.getElementById('tooltip-sites-pollues');

    var tuPol = findTuile('ressource-usage', 'sites-pollues');
    if (!tuPol || !tuPol.fakeSites) return;
    var sites = tuPol.fakeSites;

    var w = container.clientWidth || container.offsetWidth || 400;
    container.style.width  = w + 'px';

    var vectorSource = new ol.source.Vector();
    buildMaskAndContour(contourCoords).forEach(function(f) { vectorSource.addFeature(f); });

    sites.forEach(function(site) {
      var f = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.fromLonLat(site.coord)) });
      f.set('siteName', site.nom);
      f.set('baseStyle', new ol.style.Style({
        image: new ol.style.Circle({ radius: 6, fill: new ol.style.Fill({ color: '#FF9800' }), stroke: new ol.style.Stroke({ color: '#fff', width: 2 }) })
      }));
      f.set('hoverStyle', new ol.style.Style({
        image: new ol.style.Circle({ radius: 9, fill: new ol.style.Fill({ color: '#E65100' }), stroke: new ol.style.Stroke({ color: '#fff', width: 2.5 }) })
      }));
      f.setStyle(f.get('baseStyle'));
      vectorSource.addFeature(f);
    });

    var map = new ol.Map({
      target: container,
      layers: [buildGreyscaleTileLayer(), new ol.layer.Vector({ source: vectorSource })],
      view: new ol.View({ center: getCurrentCenter(), zoom: currentTerritoire ? 8 : 7 }),
      controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
      interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
    });
    if (contourCoords) {
      map.getView().fit(new ol.geom.Polygon([contourCoords]).getExtent(), { padding: [15, 15, 15, 15], maxZoom: currentTerritoire ? 10 : 8 });
    }
    setTimeout(function() { map.updateSize(); }, 200);

    // Tooltip hover
    var hoveredF = null;
    map.on('pointermove', function(e) {
      var hit = false;
      map.forEachFeatureAtPixel(e.pixel, function(f) {
        if (!f.get('siteName')) return;
        hit = true;
        if (hoveredF && hoveredF !== f) hoveredF.setStyle(hoveredF.get('baseStyle'));
        hoveredF = f;
        f.setStyle(f.get('hoverStyle'));
        if (tooltipEl) {
          tooltipEl.innerHTML = '<div style="font-weight:700;font-size:13px">' + f.get('siteName') + '</div>';
          tooltipEl.style.display = 'block';
          tooltipEl.classList.add('is-visible');
          posMapTooltip(tooltipEl, container, e.pixel);
        }
      });
      container.style.cursor = hit ? 'pointer' : '';
      if (!hit) {
        if (hoveredF) { hoveredF.setStyle(hoveredF.get('baseStyle')); hoveredF = null; }
        if (tooltipEl) { tooltipEl.classList.remove('is-visible'); tooltipEl.style.display = 'none'; }
      }
    });

    bindMapLeaveHide(container, tooltipEl, function() { return hoveredF; }, function() { hoveredF = null; });

    gouvernanceMapInstances.push(map);
  }

  // ── Carte interactive sites de baignade avec tooltip jauge ──────────
  function initBaignadeMap(contourCoords) {
    var container = document.getElementById('minimap-baignades');
    if (!container) return;
    var tooltipEl = document.getElementById('tooltip-baignade');

    // Récupérer les sites depuis la tuile
    var tuBaign = findTuile('ressource-usage', 'sites-baignade');
    if (!tuBaign || !tuBaign.fakeSites) return;
    var sites = tuBaign.fakeSites;

    // La carte est en position absolute, taille gérée par CSS

    var vectorSource = new ol.source.Vector();
    buildMaskAndContour(contourCoords).forEach(function(f) { vectorSource.addFeature(f); });

    // Couleur selon qualité (0-10)
    function qualColor(q) {
      if (q >= 8) return '#007BB8';  // Excellent
      if (q >= 5) return '#009B55';  // Bon
      if (q >= 3) return '#F58A1F';  // Suffisant
      return '#BA1C28';              // Insuffisant
    }

    sites.forEach(function(site) {
      var f = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.fromLonLat(site.coord)) });
      f.set('siteName', site.nom);
      f.set('siteData', site);
      var col = qualColor(site.qualite);
      f.set('baseStyle', new ol.style.Style({
        image: new ol.style.Circle({ radius: 8, fill: new ol.style.Fill({ color: col }), stroke: new ol.style.Stroke({ color: '#fff', width: 2 }) })
      }));
      f.set('hoverStyle', new ol.style.Style({
        image: new ol.style.Circle({ radius: 11, fill: new ol.style.Fill({ color: col }), stroke: new ol.style.Stroke({ color: '#fff', width: 3 }) })
      }));
      f.setStyle(f.get('baseStyle'));
      vectorSource.addFeature(f);
    });

    var ptLayer = new ol.layer.Vector({ source: vectorSource });
    var bMap = new ol.Map({
      target: container,
      layers: [buildGreyscaleTileLayer(), ptLayer],
      view: new ol.View({ center: getCurrentCenter(), zoom: currentTerritoire ? 8 : 7 }),
      controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
      interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
    });
    // Cadrage sur le territoire entier, recalculé quand la carte change de taille
    // (la hauteur finale n'est connue qu'après rendu du camembert / de la légende)
    var bExtent = contourCoords ? new ol.geom.Polygon([contourCoords]).getExtent() : null;
    var bUserMoved = false;
    function fitBaignade() {
      bMap.updateSize();
      var sz = bMap.getSize();
      if (!bExtent || !sz || !sz[0] || !sz[1] || bUserMoved) return;
      bMap.getView().fit(bExtent, { padding: [30, 30, 30, 30], maxZoom: currentTerritoire ? 9 : 8 });
    }
    fitBaignade();
    setTimeout(fitBaignade, 200);
    bMap.on('pointerdrag', function() { bUserMoved = true; });
    container.addEventListener('click', function(ev) { if (ev.target.closest('.ol-zoom')) bUserMoved = true; });
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(fitBaignade).observe(container);
    }

    // Hover tooltip avec jauge SVG compteur
    var hoveredFeature = null;
    bMap.on('pointermove', function(e) {
      var hit = false;
      bMap.forEachFeatureAtPixel(e.pixel, function(f) {
        if (!f.get('siteName')) return;
        hit = true;
        if (hoveredFeature && hoveredFeature !== f) {
          hoveredFeature.setStyle(hoveredFeature.get('baseStyle'));
        }
        hoveredFeature = f;
        f.setStyle(f.get('hoverStyle'));

        if (tooltipEl) {
          var sd = f.get('siteData');
          tooltipEl.innerHTML = buildBaignadeTooltip(sd);
          tooltipEl.style.display = 'block';
          tooltipEl.classList.add('is-visible');
          posMapTooltip(tooltipEl, container, e.pixel);
        }
      });
      container.style.cursor = hit ? 'pointer' : '';
      if (!hit) {
        if (hoveredFeature) { hoveredFeature.setStyle(hoveredFeature.get('baseStyle')); hoveredFeature = null; }
        if (tooltipEl) { tooltipEl.classList.remove('is-visible'); tooltipEl.style.display = 'none'; }
      }
    });

    bindMapLeaveHide(container, tooltipEl, function() { return hoveredFeature; }, function() { hoveredFeature = null; });

    gouvernanceMapInstances.push(bMap);
  }

  // ── SVG jauge compteur (Excellent→Insuffisant, couleurs ARS) pour tooltip baignade ──
  function buildBaignadeTooltip(site) {
    // L'aiguille pointe le centre du segment de la classe affichée sous la jauge
    // (segments de gauche à droite : Insuffisant, Suffisant, Bon, Excellent),
    // pour que l'aiguille et la mention indiquent toujours la même chose.
    var CLASSES_ORDRE = ['Insuffisant', 'Suffisant', 'Bon', 'Excellent'];
    var segIdx = CLASSES_ORDRE.indexOf(site.classe);
    if (segIdx < 0) segIdx = Math.min(3, Math.max(0, Math.floor((site.qualite || 0) / 2.5)));
    // Même repère angulaire que les segments ci-dessous (π = gauche → 0 = droite).
    // L'ancien calcul inversait gauche/droite (cos(π − a)) : l'aiguille pointait du mauvais côté.
    var needleRad = Math.PI - ((segIdx + 0.5) / 4) * Math.PI;
    var nx = 60 + 38 * Math.cos(needleRad);
    var ny = 55 - 38 * Math.sin(needleRad);

    // SVG jauge compteur — 4 segments ARS (rouge à gauche → bleu à droite)
    var svg = '<svg viewBox="0 0 120 65" width="150" height="82" xmlns="http://www.w3.org/2000/svg">';
    var colors = ['#FF6B6B','#F58A1F','#009B55','#007BB8'];
    var r = 45;
    var cx = 60, cy = 55;
    for (var i = 0; i < 4; i++) {
      var a1 = Math.PI - (i / 4) * Math.PI;
      var a2 = Math.PI - ((i + 1) / 4) * Math.PI;
      var x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
      var x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
      svg += '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + r + ',' + r + ' 0 0,1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + '" fill="none" stroke="' + colors[i] + '" stroke-width="10" stroke-linecap="butt"/>';
    }
    // Aiguille
    svg += '<line x1="60" y1="55" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>';
    svg += '<circle cx="60" cy="55" r="4" fill="#fff"/>';
    // Labels
    svg += '<text x="1" y="63" font-size="7" fill="#FF6B6B" font-family="Satoshi,sans-serif" font-weight="600">Insuffisant</text>';
    svg += '<text x="84" y="63" font-size="7" fill="#007BB8" font-family="Satoshi,sans-serif" font-weight="600">Excellent</text>';
    svg += '</svg>';

    var html = '<div style="text-align:center;min-width:190px">';
    html += '<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#fff">' + site.nom + '</div>';
    html += svg;
    // Catégorie de qualité sous la jauge (sans la note chiffrée)
    // Teintes éclaircies pour rester lisibles sur le fond sombre du tooltip
    var classeColors = { 'Excellent': '#4FC3F7', 'Bon': '#4ADE80', 'Suffisant': '#FFB74D', 'Insuffisant': '#FF8A80' };
    if (site.classe) {
      html += '<div style="margin-top:4px;font-size:13px;font-weight:700;color:' + (classeColors[site.classe] || '#fff') + '">' + escHtml(site.classe) + '</div>';
    }
    html += '</div>';
    return html;
  }

  // ══════════════════════════════════════════════════════════════════════
  // SWITCH DE TERRITOIRE — Rafraîchir toutes les tuiles
  // ══════════════════════════════════════════════════════════════════════

  function switchTerritoire(code, nom) {
    if (code && typeof FAKE_DATA_DEPARTEMENTS !== 'undefined' && FAKE_DATA_DEPARTEMENTS[code]) {
      currentTerritoire = { code: code, nom: nom, data: FAKE_DATA_DEPARTEMENTS[code] };
    } else {
      currentTerritoire = null;
    }
    updateHeaderTerritory();
    refreshHero();
    updateMiniHero();

    if (activeSection === 'fiche-identite') {
      refreshFicheIdentite();
    } else {
      refreshSectionBody();
    }
    // Notifie l'outil de comparaison du changement de territoire
    document.dispatchEvent(new CustomEvent('tdb:territoire', { detail: window.__tdbGetTerritoire() }));
  }

  // Met à jour le Hero (titre, type, KPIs) quel que soit l'onglet
  function refreshHero() {
    var d = currentTerritoire ? currentTerritoire.data : null;
    var heroTitle = document.querySelector('.tdb-elu2-hero__title');
    var heroType = document.querySelector('.tdb-elu2-hero__type');
    if (heroTitle) heroTitle.textContent = d ? d.nom : 'Grand Est';
    if (heroType) heroType.textContent = d ? d.type : 'Région';
    var kpiVals = document.querySelectorAll('.tdb-elu2-hero__kpi-val');
    if (kpiVals.length >= 2) {
      kpiVals[0].innerHTML = escHtml(d ? d.superficie : '57 441') + ' <span class="tdb-elu2-hero__kpi-unit">km\u00b2</span>';
      kpiVals[1].innerHTML = escHtml(d ? d.population : '5 562 651') + ' <span class="tdb-elu2-hero__kpi-unit">habitants</span>';
    }
  }

  // Re-rend le contenu de section (sous le Hero) pour les onglets non fiche-identite
  function refreshSectionBody() {
    var bodyEl = document.getElementById('tdb-elu2-section-body');
    if (!bodyEl) return;
    var tuiles = TUILES_ELU_V2[activeSection];
    if (!tuiles) return;

    // Détruire charts et cartes OL de la section
    destroyCharts();
    destroyGovCharts();
    destroyGovActionCharts();
    destroyVulnCharts();
    destroyAmenagementMaps();
    destroyRessourceUsageMaps();
    destroyGouvernanceMaps();

    if (activeSection === 'amenagement') {
      bodyEl.innerHTML = renderAmenagementBody(tuiles);
      initAmenagementCharts();
      initAmenagementMaps();
    } else if (activeSection === 'gouvernance') {
      bodyEl.innerHTML = renderGouvernanceBody(tuiles);
      bindGouvernanceTree();
      initGovActionCharts();
    } else if (activeSection === 'ressource-usage') {
      govActiveTab = 'eau-potable';
      bodyEl.innerHTML = renderRessourceUsageBody(tuiles);
      initRessourceUsageCharts();
      initRessourceUsageMaps();
      initGouvernanceCharts();
      initGouvernanceMaps();
    } else if (activeSection === 'vulnerabilite') {
      vulnActiveView = 'annuel';
      bodyEl.innerHTML = renderVulnerabiliteBody(tuiles);
      initVulnerabiliteCharts();
    }
    setTimeout(injectTuileSources, 100);
  }

  // Met à jour le nom du territoire dans le bandeau sticky
  function updateHeaderTerritory() {
    var el = document.getElementById('tdb-elu2-territory-name');
    if (el) {
      el.textContent = currentTerritoire ? currentTerritoire.nom : 'Grand Est';
    }
  }

  function getVal(field) {
    // Retourne la valeur du territoire courant ou la valeur Grand Est par défaut
    if (currentTerritoire && currentTerritoire.data) {
      return currentTerritoire.data[field];
    }
    return null; // caller uses default
  }

  // Retourne le contour OL du territoire courant (département ou Grand Est)
  function getCurrentContour() {
    if (currentTerritoire && currentTerritoire.code && typeof GEO_DEPARTEMENTS_GE !== 'undefined') {
      var dept = GEO_DEPARTEMENTS_GE.find(function(d) { return d.code === currentTerritoire.code; });
      if (dept && dept.contour) {
        return dept.contour.map(function(c) { return ol.proj.fromLonLat(c); });
      }
    }
    if (typeof GEO_CONTOUR_GRAND_EST !== 'undefined') {
      return GEO_CONTOUR_GRAND_EST.map(function(c) { return ol.proj.fromLonLat(c); });
    }
    return null;
  }

  // Retourne les données géo de la carte pour le territoire courant (ou null = Grand Est)
  function getDeptMapData() {
    if (currentTerritoire && currentTerritoire.code && typeof GEO_DEPT_MAP_DATA !== 'undefined') {
      return GEO_DEPT_MAP_DATA[currentTerritoire.code] || null;
    }
    return null;
  }

  // Retourne le centre OL du territoire courant
  function getCurrentCenter() {
    if (currentTerritoire && currentTerritoire.code && typeof GEO_DEPARTEMENTS_GE !== 'undefined') {
      var dept = GEO_DEPARTEMENTS_GE.find(function(d) { return d.code === currentTerritoire.code; });
      if (dept && dept.center) {
        return ol.proj.fromLonLat(dept.center);
      }
    }
    return ol.proj.fromLonLat([6.3, 48.65]);
  }

  // Retourne la valeur indicateur du territoire courant, ou defaultVal si région/absent
  function getIndVal(indicatorId, defaultVal) {
    if (currentTerritoire && currentTerritoire.data && currentTerritoire.data.ind) {
      var v = currentTerritoire.data.ind[indicatorId];
      if (v !== undefined && v !== null) return v;
    }
    return defaultVal;
  }

  // Applique les données du territoire courant aux fakeValue des tuiles
  // (écrase temporairement pour que toutes les fonctions de rendu reflètent le bon territoire)
  function applyTerritoryOverrides(tuiles) {
    if (!currentTerritoire || !currentTerritoire.data || !currentTerritoire.data.ind) return;
    var ind = currentTerritoire.data.ind;
    tuiles.forEach(function(tu) {
      tu.indicateurs.forEach(function(indicator) {
        if (ind[indicator.id] !== undefined) {
          indicator._origFakeValue = indicator.fakeValue;
          indicator.fakeValue = ind[indicator.id];
        }
      });
      // Obstacles : override chartData
      if (tu.zone === 'obstacles' && ind.obstData) {
        var obstInd = tu.indicateurs.find(function(i) { return i.id === 'OBST_ECOUL_NB_PART_CAT'; });
        if (obstInd && obstInd.fakeChartData) {
          obstInd._origChartValues = obstInd.fakeChartData.values;
          obstInd.fakeChartData.values = ind.obstData;
        }
      }
      // OCS : override treemap
      if (tu.zone === 'occupation-sol' && ind.ocsData) {
        var ocsInd = tu.indicateurs.find(function(i) { return i.id === 'OCS_RATIO_PAR_CAT'; });
        if (ocsInd && ocsInd.fakeChartData) {
          ocsInd._origChartValues = ocsInd.fakeChartData.values;
          ocsInd.fakeChartData.values = ind.ocsData;
        }
      }
      // Vulnérabilité : override temp / précip KPIs
      if (tu.zone === 'temp-annuelle' || tu.zone === 'temp-mensuelle') {
        if (ind.VULN_TEMP_N1) {
          var tn = tu.indicateurs.find(function(i) { return i.id === 'VULN_TEMP_MOY_N1'; });
          if (tn) { tn._origFakeValue = tn.fakeValue; tn.fakeValue = ind.VULN_TEMP_N1; }
        }
        if (ind.VULN_TEMP_REF) {
          var tr = tu.indicateurs.find(function(i) { return i.id === 'VULN_TEMP_REF'; });
          if (tr) { tr._origFakeValue = tr.fakeValue; tr.fakeValue = ind.VULN_TEMP_REF; }
        }
      }
      if (tu.zone === 'precip-annuelle' || tu.zone === 'precip-mensuelle') {
        if (ind.VULN_PRECIP_N1) {
          var pn = tu.indicateurs.find(function(i) { return i.id === 'VULN_PRECIP_MOY_N1'; });
          if (pn) { pn._origFakeValue = pn.fakeValue; pn.fakeValue = ind.VULN_PRECIP_N1; }
        }
        if (ind.VULN_PRECIP_REF) {
          var pr = tu.indicateurs.find(function(i) { return i.id === 'VULN_PRECIP_REF'; });
          if (pr) { pr._origFakeValue = pr.fakeValue; pr.fakeValue = ind.VULN_PRECIP_REF; }
        }
      }
    });
  }

  // Restaure les fakeValue originaux après le rendu
  function restoreTerritoryOverrides(tuiles) {
    tuiles.forEach(function(tu) {
      tu.indicateurs.forEach(function(indicator) {
        if (indicator._origFakeValue !== undefined) {
          indicator.fakeValue = indicator._origFakeValue;
          delete indicator._origFakeValue;
        }
      });
      if (tu.zone === 'obstacles') {
        var obstInd = tu.indicateurs.find(function(i) { return i.id === 'OBST_ECOUL_NB_PART_CAT'; });
        if (obstInd && obstInd._origChartValues) {
          obstInd.fakeChartData.values = obstInd._origChartValues;
          delete obstInd._origChartValues;
        }
      }
      if (tu.zone === 'occupation-sol') {
        var ocsInd = tu.indicateurs.find(function(i) { return i.id === 'OCS_RATIO_PAR_CAT'; });
        if (ocsInd && ocsInd._origChartValues) {
          ocsInd.fakeChartData.values = ocsInd._origChartValues;
          delete ocsInd._origChartValues;
        }
      }
    });
  }

  function refreshFicheIdentite() {
    var d = currentTerritoire ? currentTerritoire.data : null;
    var isRegion = !currentTerritoire;
    var labels = ['2006','2008','2010','2012','2014','2016','2018','2020','2022','2023'];
    var prelLabels = ['2008','2010','2012','2014','2016','2018','2020','2022','2023'];

    // ── HERO ──────────────────────────────────────────────────
    var heroTitle = document.querySelector('.tdb-elu2-hero__title');
    var heroType = document.querySelector('.tdb-elu2-hero__type');
    if (heroTitle) heroTitle.textContent = d ? d.nom : 'Grand Est';
    if (heroType) heroType.textContent = d ? d.type : 'Région';

    var kpiVals = document.querySelectorAll('.tdb-elu2-hero__kpi-val');
    if (kpiVals.length >= 2) {
      kpiVals[0].innerHTML = escHtml(d ? d.superficie : '57 441') + ' <span class="tdb-elu2-hero__kpi-unit">km²</span>';
      kpiVals[1].innerHTML = escHtml(d ? d.population : '5 562 651') + ' <span class="tdb-elu2-hero__kpi-unit">habitants</span>';
    }

    // ── DÉMOGRAPHIE ───────────────────────────────────────────
    var demoVals = document.querySelectorAll('.tdb-elu2-demo__kpi-val');
    if (demoVals.length >= 2) {
      demoVals[0].innerHTML = escHtml(d ? d.densite : '97') + ' <small style="font-size:13px;font-weight:500;color:var(--elu2-muted)">hab/km²</small>';
      demoVals[1].textContent = d ? d.ruralite : 'Semi-rural';
    }
    var demoSubs = document.querySelectorAll('.tdb-elu2-demo__kpi-sub');
    if (demoSubs.length >= 1) {
      demoSubs[0].textContent = isRegion ? 'Moy. France : 119 hab/km²' : 'Moy. Grand Est : 97 hab/km²';
    }

    // Trend badge
    var trendBadge = document.querySelector('.tdb-elu2-trend-badge');
    if (trendBadge) {
      // Tendance calculée sur la même période que la courbe (2006-2023)
      var trSeries = d ? d.popEvol : [5.48,5.50,5.52,5.53,5.54,5.55,5.55,5.56,5.56,5.56];
      var tr = popTrend(trSeries, labels);
      var dir = tr ? tr.dir : 'neutral';
      var icon = dir === 'up' ? 'ph-arrow-up-right' : dir === 'down' ? 'ph-arrow-down-right' : 'ph-arrow-right';
      trendBadge.className = 'tdb-elu2-trend-badge tdb-elu2-trend-badge--' + dir;
      trendBadge.innerHTML = '<i class="ph ' + icon + '" aria-hidden="true"></i> ' + escHtml(tr ? tr.label : '');
    }

    // ── RESSOURCES EN EAU ─────────────────────────────────────
    // Les % d'état sont affichés en jauges (et non plus en lignes) : on re-rend les deux tuiles
    // à partir des données du territoire, ce qui met à jour valeurs ET jauges.
    var ficheTuiles = TUILES_ELU_V2['fiche-identite'] || [];
    [['ressources-superficielles', 'surface', { RES_SURF_COURS_EAU: d && d.coursEau, RES_SURF_PLANS_EAU: d && d.plansEau, RES_SURF_ETAT_CHIM: d && d.etatChimSurf, RES_SURF_ETAT_ECO: d && d.etatEcoSurf }],
     ['ressources-souterraines', 'souterrain', { RES_SOUT_MESO_NB: d && d.mesoNb, RES_SOUT_ETAT_CHIM: d && d.etatChimSout, RES_SOUT_ETAT_QUANTI: d && d.etatQuantiSout }]
    ].forEach(function(cfg) {
      var tu = ficheTuiles.find(function(t) { return t.zone === cfg[0]; });
      var card = document.querySelector('.tdb-elu2-ressource-card--' + cfg[1]);
      if (!tu || !card) return;
      // Valeurs du territoire, appliquées par position (même ordre que les champs ci-dessus)
      var vals = Object.keys(cfg[2]).map(function(k) { return cfg[2][k]; });
      var saved = tu.indicateurs.map(function(ind) { return ind.fakeValue; });
      if (d) tu.indicateurs.forEach(function(ind, i) { if (vals[i] != null && vals[i] !== '') ind.fakeValue = vals[i]; });
      var tmp = document.createElement('div');
      tmp.innerHTML = renderRessourceCard(tu, cfg[1]);
      tu.indicateurs.forEach(function(ind, i) { ind.fakeValue = saved[i]; });
      if (tmp.firstElementChild) card.replaceWith(tmp.firstElementChild);
    });

    // ── PRÉLÈVEMENTS ──────────────────────────────────────────
    var volEl = document.querySelector('.tdb-elu2-prelevements__volume-val');
    if (volEl) volEl.textContent = d ? d.volumeAnnee : '875';

    // ── SERVICES DE L'EAU ─────────────────────────────────────
    var svcVals = document.querySelectorAll('.tdb-elu2-services__item-val');
    if (svcVals.length >= 2) {
      svcVals[0].textContent = d ? d.prixEau : '4.32';
      svcVals[1].textContent = d ? d.prixAssain : '2.18';
    }

    // ── CAPTAGES ──────────────────────────────────────────────
    var capVals = document.querySelectorAll('.tdb-elu2-captages__item-val');
    if (capVals.length >= 2) {
      capVals[0].textContent = d ? d.captages : '134';
      capVals[1].innerHTML = escHtml(d ? d.aac : '28.6') + '<small style="font-size:14px"> %</small>';
    }

    // ── CHARTS — Détruire et recréer ──────────────────────────
    destroyCharts();

    // Évolution population
    var evoCanvas = document.getElementById('chart-v2-evolution');
    if (evoCanvas && typeof Chart !== 'undefined') {
      var evoValues = d ? d.popEvol : [5.48,5.50,5.52,5.53,5.54,5.55,5.55,5.56,5.56,5.56];
      var maxV = Math.max.apply(null, evoValues);
      var unitLabel = maxV > 2 ? 'Millions hab.' : 'Milliers hab.';
      var tickFn = maxV > 2
        ? function(v) { return v.toFixed(2) + ' M'; }
        : function(v) { return (v * 1000).toFixed(0) + ' k'; };

      chartInstances.push(new Chart(evoCanvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: evoValues,
            borderColor: '#1565C0',
            backgroundColor: 'rgba(21,101,192,0.08)',
            fill: true, tension: 0.3,
            pointBackgroundColor: '#1565C0', pointBorderColor: '#fff',
            pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
            borderWidth: 2.5
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { beginAtZero: false, grid: { color: '#F1F5F9' },
              ticks: { font: { size: 10 }, callback: tickFn },
              title: { display: true, text: unitLabel, font: { size: 10 }, color: '#64748B' }
            }
          }
        }
      }));
    }

    // Prélèvements (stacked bar)
    var prelCanvas = document.getElementById('chart-v2-prelevements');
    if (prelCanvas && typeof Chart !== 'undefined') {
      var defaultPrel = [[85,92,88,95,90,98,102,96,94],[210,205,195,188,180,172,165,158,152],[420,415,405,398,385,370,355,340,332],[45,44,42,40,38,36,35,33,32],[310,305,298,292,285,280,275,270,265]];
      var prel = d ? d.prelData : defaultPrel;
      var colors = ['#8BC34A','#455A64','#F57F17','#0288D1','#1565C0'];
      var dsLabels = ['Usages agricoles','Usages industriels','Refroidissement centrales','Alimentation des canaux',"Production d'eau potable"];

      chartInstances.push(new Chart(prelCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: prelLabels,
          datasets: prel.map(function(vals, i) {
            return { label: dsLabels[i], data: vals, backgroundColor: colors[i], borderRadius: 2 };
          })
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { stacked: true, beginAtZero: true, grid: { color: '#F1F5F9' },
              ticks: { font: { size: 10 }, callback: function(v) { return v + ' Mm³'; } },
              title: { display: true, text: 'Millions m³', font: { size: 10 }, color: '#64748B' }
            }
          }
        }
      }));
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // CARTE INTERACTIVE DRILL-DOWN (style DVF Notaires)
  // ══════════════════════════════════════════════════════════════════════
  function initDrillMap() {
    if (typeof ol === 'undefined') return;
    var container = document.getElementById('tdb-elu2-drillmap');
    if (!container) return;

    drillTooltipEl = document.getElementById('tdb-elu2-drillmap-tooltip');

    // Fond de carte N&B (comme toutes les autres cartes)
    var basemapLayer = buildGreyscaleTileLayer();

    // Masque + contour noir du Grand Est (couche fixe sous les départements)
    var maskSource = new ol.source.Vector();
    var geContour = null;
    if (typeof GEO_CONTOUR_GRAND_EST !== 'undefined') {
      geContour = GEO_CONTOUR_GRAND_EST.map(function(c) { return ol.proj.fromLonLat(c); });
      buildMaskAndContour(geContour).forEach(function(f) { maskSource.addFeature(f); });
    }
    var maskLayer = new ol.layer.Vector({ source: maskSource });

    // Palette alternée pour les zones (semi-transparent pour voir le fond)
    var zonePalette = [
      'rgba(187,222,251,0.55)', 'rgba(178,223,219,0.55)', 'rgba(225,190,231,0.45)',
      'rgba(179,229,252,0.55)', 'rgba(200,230,201,0.55)', 'rgba(255,224,178,0.45)',
      'rgba(255,236,179,0.50)', 'rgba(207,216,220,0.50)', 'rgba(197,202,233,0.50)',
      'rgba(178,223,219,0.45)'
    ];
    var zoneHoverPalette = [
      'rgba(100,181,246,0.65)', 'rgba(77,182,172,0.65)', 'rgba(186,104,200,0.55)',
      'rgba(79,195,247,0.65)', 'rgba(129,199,132,0.55)', 'rgba(255,183,77,0.55)',
      'rgba(255,213,79,0.55)', 'rgba(144,164,174,0.55)', 'rgba(121,134,203,0.55)',
      'rgba(77,182,172,0.55)'
    ];

    // Vector layer pour les zones
    drillLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: function(feature) {
        var hovered = feature.get('hovered');
        var idx = feature.get('colorIdx') || 0;
        var fillColor = hovered ? zoneHoverPalette[idx % zoneHoverPalette.length] : zonePalette[idx % zonePalette.length];
        return new ol.style.Style({
          stroke: new ol.style.Stroke({ color: hovered ? '#0D47A1' : '#1565C0', width: hovered ? 2.5 : 1.5 }),
          fill: new ol.style.Fill({ color: fillColor }),
          text: new ol.style.Text({
            text: feature.get('label') || '',
            font: (hovered ? 'bold 12px' : '11px') + ' "Satoshi", sans-serif',
            fill: new ol.style.Fill({ color: '#1a2332' }),
            stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
            overflow: true
          })
        });
      }
    });

    drillMap = new ol.Map({
      target: container,
      layers: [basemapLayer, maskLayer, drillLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat([6.2, 48.7]),
        zoom: 7
      }),
      controls: ol.control.defaults.defaults({ attribution: false, zoom: true, rotate: false }),
      interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false, dragPan: true })
    });

    // Afficher les départements
    loadDepartements();
    updateBreadcrumb();

    // Forcer le recalcul de la taille après le rendu DOM
    setTimeout(function() {
      if (drillMap) drillMap.updateSize();
    }, 200);

    // Hover — ne cibler que les features du drillLayer (pas le masque)
    drillMap.on('pointermove', function(e) {
      var hit = false;
      drillLayer.getSource().getFeatures().forEach(function(f) { f.set('hovered', false); });
      drillMap.forEachFeatureAtPixel(e.pixel, function(f, layer) {
        if (layer !== drillLayer) return;
        var lbl = f.get('label');
        if (!lbl) return;
        f.set('hovered', true);
        hit = true;
        if (drillTooltipEl) {
          drillTooltipEl.textContent = lbl;
          drillTooltipEl.style.left = e.pixel[0] + 'px';
          drillTooltipEl.style.top = e.pixel[1] + 'px';
          drillTooltipEl.classList.add('is-visible');
        }
      });
      container.style.cursor = hit ? 'pointer' : '';
      if (!hit && drillTooltipEl) {
        drillTooltipEl.classList.remove('is-visible');
        drillTooltipEl.textContent = '';
      }
    });

    // Sélection d'un département (clic carte OU liste alternative clavier)
    function selectDeptFeature(f) {
      if (!f || drillLevel !== 'region') return;
      var code = f.get('code');
      var nom = f.get('label');
      // Drill vers le département
      drillLevel = 'departement';
      drillParent = { code: code, nom: nom };
      zoomToFeature(f);
      // Simuler des EPCI à l'intérieur
      setTimeout(function() { loadEPCI(code, nom); }, 400);
      updateBreadcrumb();
      // Rafraîchir toutes les tuiles avec les données du département
      switchTerritoire(code, nom);
      if (window.a11yAnnounce) window.a11yAnnounce('Donn\u00e9es affich\u00e9es pour : ' + nom);
    }

    // Click = drill-down — ne cibler que les features du drillLayer
    drillMap.on('click', function(e) {
      var done = false;
      drillMap.forEachFeatureAtPixel(e.pixel, function(f, layer) {
        if (layer !== drillLayer || done) return;
        done = true;
        selectDeptFeature(f);
      });
    });

    // RGAA 7.3 : alternative clavier à la carte (utilisée par js/tdb-elu-v2-a11y.js)
    window.__tdbSelectTerritoire = function(code) {
      if (!drillLayer) return;
      var f = drillLayer.getSource().getFeatures().find(function(x) { return x.get('code') === code; });
      selectDeptFeature(f);
    };
    window.__tdbDrillLevel = function() { return drillLevel; };
  }

  function loadDepartements() {
    if (!drillLayer || typeof GEO_DEPARTEMENTS_GE === 'undefined') return;
    var source = drillLayer.getSource();
    source.clear();

    GEO_DEPARTEMENTS_GE.forEach(function(dept, idx) {
      // Zones synthétiques (EPCI, commune, bassin versant) créées par l'outil de comparaison : pas dans la carte des départements
      if (dept.synthetic) return;
      var coords = dept.contour.map(function(c) { return ol.proj.fromLonLat(c); });
      var polygon = new ol.geom.Polygon([coords]);
      var feature = new ol.Feature({ geometry: polygon });
      feature.set('code', dept.code);
      feature.set('label', dept.nom);
      feature.set('type', 'departement');
      feature.set('colorIdx', idx);
      source.addFeature(feature);
    });

    // Fit view
    var extent = source.getExtent();
    drillMap.getView().fit(extent, { padding: [30, 30, 30, 30], duration: 300 });
    drillLevel = 'region';
    drillParent = null;
  }

  function loadEPCI(deptCode, deptNom) {
    if (!drillLayer) return;
    var source = drillLayer.getSource();
    source.clear();

    // Fake EPCI data based on département
    var dept = GEO_DEPARTEMENTS_GE.find(function(d) { return d.code === deptCode; });
    if (!dept) return;

    // Générer 4-6 subdivisions fake dans le bbox du département
    var b = dept.bbox;
    var nx = 3, ny = 2;
    var dxStep = (b[2] - b[0]) / nx;
    var dyStep = (b[3] - b[1]) / ny;
    var epciNames = [
      'CC du Pays de ', 'CA de ', 'CU de ', 'CC des Vallées de ',
      'CA du Grand ', 'CC du Canton de '
    ];
    var idx = 0;
    for (var ix = 0; ix < nx; ix++) {
      for (var iy = 0; iy < ny; iy++) {
        var x0 = b[0] + ix * dxStep;
        var y0 = b[1] + iy * dyStep;
        var x1 = x0 + dxStep;
        var y1 = y0 + dyStep;
        var coords = [
          ol.proj.fromLonLat([x0, y0]),
          ol.proj.fromLonLat([x1, y0]),
          ol.proj.fromLonLat([x1, y1]),
          ol.proj.fromLonLat([x0, y1]),
          ol.proj.fromLonLat([x0, y0])
        ];
        var polygon = new ol.geom.Polygon([coords]);
        var feature = new ol.Feature({ geometry: polygon });
        feature.set('code', deptCode + '-EPCI-' + idx);
        feature.set('label', epciNames[idx % epciNames.length] + deptNom);
        feature.set('type', 'epci');
        feature.set('colorIdx', idx);
        source.addFeature(feature);
        idx++;
      }
    }

    var extent = source.getExtent();
    drillMap.getView().fit(extent, { padding: [30, 30, 30, 30], duration: 300 });
  }

  function zoomToFeature(feature) {
    if (!drillMap) return;
    var extent = feature.getGeometry().getExtent();
    drillMap.getView().fit(extent, { padding: [30, 30, 30, 30], duration: 400 });
  }

  function updateBreadcrumb() {
    var el = document.getElementById('tdb-elu2-drillmap-breadcrumb');
    if (!el) return;

    var html = '';
    if (drillLevel === 'region') {
      html = '<span class="current">Grand Est</span>';
    } else if (drillLevel === 'departement' && drillParent) {
      html = '<button type="button" onclick="window.__drillBack && window.__drillBack()">Grand Est</button>';
      html += '<span>›</span>';
      html += '<span class="current">' + escHtml(drillParent.nom) + '</span>';
    }
    el.innerHTML = html;

    // Expose back function
    window.__drillBack = function() {
      loadDepartements();
      updateBreadcrumb();
      // Revenir aux données Grand Est
      switchTerritoire(null, null);
    };
  }

  function destroyDrillMap() {
    if (drillMap) {
      drillMap.setTarget(null);
      drillMap = null;
    }
    drillLayer = null;
    drillLevel = 'region';
    drillParent = null;
  }

  // ══════════════════════════════════════════════════════════════════════
  // UTILITAIRES
  // ══════════════════════════════════════════════════════════════════════
  // ── Contraste (WCAG / RGAA 3.2) ──
  function hexToRgbArr(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function(c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    if (isNaN(n)) return [0, 0, 0];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function relLum(rgb) {
    var a = rgb.map(function(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrastRatio(c1, c2) {
    var l1 = relLum(hexToRgbArr(c1)), l2 = relLum(hexToRgbArr(c2));
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  // Assombrit une couleur jusqu'à atteindre 4,5:1 sur fond blanc (conserve la teinte)
  function readableColor(hex) {
    if (!/^#?[0-9a-f]{3,6}$/i.test(String(hex || ''))) return hex;
    var rgb = hexToRgbArr(hex), i = 0;
    function toHex(a) { return '#' + a.map(function(v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
    while (contrastRatio(toHex(rgb), '#ffffff') < 4.5 && i < 40) {
      rgb = rgb.map(function(v) { return v * 0.92; });
      i++;
    }
    return toHex(rgb);
  }

  // Évolution de la population entre la première et la dernière année de la série
  // ex. { dir:'up', label:'+1.46% entre 2006 et 2023' }
  function popTrend(values, labels) {
    if (!values || values.length < 2) return null;
    var first = parseFloat(values[0]), last = parseFloat(values[values.length - 1]);
    if (!first || isNaN(last)) return null;
    var pct = (last - first) / first * 100;
    var rounded = Math.round(pct * 100) / 100;
    var dir = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'neutral';
    var y0 = labels && labels[0] ? labels[0] : '2006';
    var y1 = labels && labels[labels.length - 1] ? labels[labels.length - 1] : '2023';
    return { dir: dir, label: (rounded > 0 ? '+' : '') + rounded.toFixed(2) + '% entre ' + y0 + ' et ' + y1 };
  }

  function escHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Infobulle : petit rond "i" avec tooltip rollover ──────
  // Descriptions issues de la colonne J du fichier Excel (ID indicateur → texte)
  // À remplir avec les vrais textes du fichier Excel
  // Lien : https://www.datagrandest.fr/portal/dw/oeditor?docId=4233587fac10800e50cc0e44346bc13a
  var INFO_DESCRIPTIONS = {
    // Descriptions issues de la colonne J du fichier Excel "Indicateurs elus-en cours"
    // Source : https://www.datagrandest.fr/portal/dw/oeditor?docId=4233587fac10800e50cc0e44346bc13a
    //
    // methodo : tableau de {nom, url} — liens méthodologie (fiches PDF) affichés en bas de chaque tuile.
    // Peut contenir plusieurs entrées par indicateur. Laisser vide ou omettre si pas de fiche.

    // ── Aménagement du territoire et zonage ──
    'ZH_NB':             {desc:'Recencement en nombre des zones humides (ZH DREAL Grand-Est + Ramsar) diff\u00e9renci\u00e9 selon la typologie', src:'DREAL GE', methodo:[{nom:'Zones humides', url:'#methodo-zh'}]},
    'ZH_CARTO':          {desc:'Localisation des zones humides (ZH DREAL Grand-Est + Ramsar)', src:'DREAL GE', methodo:[{nom:'Zones humides', url:'#methodo-zh'}]},
    'ZH_SURF':           {desc:'Recencement en nombre des zones humides (ZH DREAL Grand-Est + Ramsar) diff\u00e9renci\u00e9 selon la typologie', src:'DREAL GE', methodo:[{nom:'Zones humides', url:'#methodo-zh'}]},
    'ZH_RATIO_PAR_CAT':  {desc:'Pr\u00e9sentation du % de chaque typologie de ZH (% de superficie ou de nombre)', src:'DREAL GE', methodo:[{nom:'Zones humides', url:'#methodo-zh'}]},
    'ZH_RATIO':          {desc:'% du territoire couvert par des zones humides inventori\u00e9es', src:'DREAL GE', methodo:[{nom:'Zones humides', url:'#methodo-zh'}]},
    'RAMSAR_CARTO':      {desc:'Localisation des sites RAMSAR', src:'R\u00e9gion Grand Est', methodo:[{nom:'Sites Ramsar', url:'#methodo-ramsar'}]},
    'RAMSAR_NB':         {desc:'Nombre de sites RAMSAR et nom', src:'R\u00e9gion Grand Est', methodo:[{nom:'Sites Ramsar', url:'#methodo-ramsar'}]},
    'RAMSAR_SURF':       {desc:'Superficie en ha des sites RAMSAR par territoire', src:'R\u00e9gion Grand Est', methodo:[{nom:'Sites Ramsar', url:'#methodo-ramsar'}]},
    'ZRE_CARTO':         {desc:'Localisation des ZRE', src:'Sandre (Eau France)', methodo:[{nom:'Zones de r\u00e9partition des eaux', url:'#methodo-zre'}]},
    'ZRE_NB':            {desc:'Nombre de zones de r\u00e9partition des eaux (ZRE)', src:'Sandre (Eau France)', methodo:[{nom:'Zones de r\u00e9partition des eaux', url:'#methodo-zre'}]},
    'ZRE_RATIO':         {desc:'% du territoire couvert par une ZRE', src:'Sandre (Eau France)', methodo:[{nom:'Zones de r\u00e9partition des eaux', url:'#methodo-zre'}]},
    'OCS_RATIO_PAR_CAT': {desc:'Couverture du territoire par type d\u2019occupation du sol', src:'R\u00e9gion Grand Est', methodo:[{nom:'Occupation du sol', url:'#methodo-ocs'}]},
    'ZONE_SENSIBLE_CARTO':{desc:'Localisation des zones sensibles', src:'Sandre (Eau France)', methodo:[{nom:'Zones sensibles', url:'#methodo-zone-sensible'}]},
    'ZONE_SENSIBLE_RATIO':{desc:'% de territoire concern\u00e9 par l\u2019application de la Directive (UE) 2024/3019 relative au traitement des eaux r\u00e9siduaires urbaines', src:'Sandre (Eau France)', methodo:[{nom:'Zones sensibles', url:'#methodo-zone-sensible'}]},
    'OBST_ECOUL_NB':     {desc:'Sur un territoire donn\u00e9 r\u00e9f\u00e9rence le nombre d\u2019obstacle \u00e0 l\u2019\u00e9coulement', src:'Sandre (Eau France)', methodo:[{nom:'Obstacles \u00e0 l\u2019\u00e9coulement', url:'#methodo-obst-ecoul'}]},
    'OBST_ECOUL_NB_PART_CAT':{desc:'Indique si ce sont des barrages, seuils en rivi\u00e8re, digues, obstacles induit par un pont, \u00e9pis en rivi\u00e8re ou Grille', src:'Sandre (Eau France)', methodo:[{nom:'Obstacles \u00e0 l\u2019\u00e9coulement', url:'#methodo-obst-ecoul'}]},

    // ── Gouvernance et actions menées ──
    'AGENCE_NB':         {desc:'Nombre d\u2019agences de l\u2019Eau sur le territoire', src:'Sandre (Eau France)', methodo:[{nom:'Agences de l\u2019eau', url:'#methodo-agence'}]},
    'EPTB_NB':           {desc:'Nombre d\u2019EPTB sur le territoire', src:'DREAL Grand Est', methodo:[{nom:'EPTB', url:'#methodo-eptb'}]},
    'EPAGE_NB':          {desc:'Nombre d\u2019EPAGE sur le territoire', src:'Banatic', methodo:[{nom:'EPAGE', url:'#methodo-epage'}]},
    'GEMAPI_1_NB':       {desc:'Nombre de collectivit\u00e9s comp\u00e9tentes sur le territoire', src:'Banatic', methodo:[{nom:'GEMAPI', url:'#methodo-gemapi'}]},
    'GEMAPI_2_NB':       {desc:'Nombre de collectivit\u00e9s comp\u00e9tentes sur le territoire', src:'Banatic', methodo:[{nom:'GEMAPI', url:'#methodo-gemapi'}]},
    'GEMAPI_5_NB':       {desc:'Nombre de collectivit\u00e9s comp\u00e9tentes sur le territoire', src:'Banatic', methodo:[{nom:'GEMAPI', url:'#methodo-gemapi'}]},
    'GEMAPI_8_NB':       {desc:'Nombre de collectivit\u00e9s comp\u00e9tentes sur le territoire', src:'Banatic', methodo:[{nom:'GEMAPI', url:'#methodo-gemapi'}]},
    'SAGE_NB':           {desc:'Nombre de SAGE sur le territoire', src:'R\u00e9gion Grand Est', methodo:[{nom:'SAGE', url:'#methodo-sage'}]},
    'SAGE_RATIO_PAR_CAT':{desc:'Couverture du territoire par les SAGE par avancement des proc\u00e9dures', src:'R\u00e9gion Grand Est', methodo:[{nom:'SAGE', url:'#methodo-sage'}]},
    'AEP_PROD_NB':       {desc:'Nombre de collectivit\u00e9s comp\u00e9tentes sur le territoire', src:'SISPEA', methodo:[{nom:'Eau potable — production', url:'#methodo-aep-prod'}]},
    'AEP_DISTRI_NB':     {desc:'Nombre de collectivit\u00e9s comp\u00e9tentes sur le territoire', src:'SISPEA', methodo:[{nom:'Eau potable — distribution', url:'#methodo-aep-distri'}]},
    'AC_DEPOL_NB':       {desc:'Nombre de collectivit\u00e9s comp\u00e9tentes sur le territoire', src:'SISPEA', methodo:[{nom:'Assainissement collectif', url:'#methodo-ac-depol'}]},
    'ANC_NB':            {desc:'Nombre de collectivit\u00e9s comp\u00e9tentes sur le territoire', src:'SISPEA', methodo:[{nom:'Assainissement non collectif', url:'#methodo-anc'}]},
    'CONTRAT_MILIEU_RATIO':{desc:'Couverture du territoire par les contrats de milieu', src:'Sandre (Eau France)', methodo:[{nom:'Contrats de milieu', url:'#methodo-contrat-milieu'}]},
    'CONTRAT_MILIEU_RATIO_PAR_CAT':{desc:'Couverture du territoire par les contrats de milieu par avancement des proc\u00e9dures', src:'Sandre (Eau France)', methodo:[{nom:'Contrats de milieu', url:'#methodo-contrat-milieu'}]},
    'PTGE_RATIO':        {desc:'Couverture du territoire par les PTGE', src:'OiEau', methodo:[{nom:'PTGE', url:'#methodo-ptge'}]},
    'PTGE_RATIO_PAR_CAT':{desc:'Couverture du territoire par les PTGE par avancement des proc\u00e9dures', src:'OiEau', methodo:[{nom:'PTGE', url:'#methodo-ptge'}]},
    'SLGRI_RATIO':       {desc:'Couverture du territoire par les proc\u00e9dures SLGRI', src:'DREAL GE', methodo:[{nom:'SLGRI', url:'#methodo-slgri'}]},
    'PPRI_NB':           {desc:'Nombre de cours d\u2019eau du territoire couvert par un PPRI sur le territoire', src:'G\u00e9orisques', methodo:[{nom:'PPRI', url:'#methodo-ppri'}]},
    'SAGE_MISE_OEUVRE':  {desc:'Nombre de SAGE en phase de mise en \u0153uvre sur le territoire', src:'Gest\u2019eau', methodo:[{nom:'SAGE', url:'#methodo-sage'}]},
    'SAGE_REVISION':     {desc:'Nombre de SAGE en r\u00e9vision parmi ceux en mise en \u0153uvre', src:'Gest\u2019eau', methodo:[{nom:'SAGE', url:'#methodo-sage'}]},
    'SAGE_ELABORATION':  {desc:'Nombre de SAGE en cours d\u2019\u00e9laboration sur le territoire', src:'Gest\u2019eau', methodo:[{nom:'SAGE', url:'#methodo-sage'}]},
    'SAGE_INSTRUCTION':  {desc:'Nombre de SAGE en phase d\u2019instruction sur le territoire', src:'Gest\u2019eau', methodo:[{nom:'SAGE', url:'#methodo-sage'}]},
    'ACT_CM_NOM':        {desc:'Couverture du territoire par les contrats de milieu', src:'Sandre (Eau France)', methodo:[{nom:'Contrats de milieu', url:'#methodo-contrat-milieu'}]},
    'ACT_CM_NB':         {desc:'Nombre de contrats de milieux sur le territoire', src:'Sandre (Eau France)', methodo:[{nom:'Contrats de milieu', url:'#methodo-contrat-milieu'}]},
    'ACT_CM_COUV':       {desc:'Couverture du territoire par les contrats de milieu', src:'Sandre (Eau France)', methodo:[{nom:'Contrats de milieu', url:'#methodo-contrat-milieu'}]},
    'ACT_CM_AVANC':      {desc:'Couverture du territoire par les contrats de milieu par avancement des proc\u00e9dures', src:'Sandre (Eau France)', methodo:[{nom:'Contrats de milieu', url:'#methodo-contrat-milieu'}]},
    'ACT_PT_NOM':        {desc:'Couverture du territoire par les PTGE', src:'OiEau', methodo:[{nom:'PTGE', url:'#methodo-ptge'}]},
    'ACT_PT_NB':         {desc:'Nombre de projets de territoire pour la gestion de l\u2019eau', src:'OiEau', methodo:[{nom:'PTGE', url:'#methodo-ptge'}]},
    'ACT_PT_COUV':       {desc:'Couverture du territoire par les PTGE', src:'OiEau', methodo:[{nom:'PTGE', url:'#methodo-ptge'}]},
    'ACT_PT_AVANC':      {desc:'Couverture du territoire par les PTGE par avancement des proc\u00e9dures', src:'OiEau', methodo:[{nom:'PTGE', url:'#methodo-ptge'}]},
    'ACT_GI_PLANS':      {desc:'Nombre de cours d\u2019eau du territoire couvert par un PPRI sur le territoire', src:'G\u00e9orisques', methodo:[{nom:'PPRI', url:'#methodo-ppri'}]},
    'ACT_GI_SLGRI':      {desc:'Couverture du territoire par les proc\u00e9dures SLGRI', src:'DREAL GE', methodo:[{nom:'SLGRI', url:'#methodo-slgri'}]},

    // ── Ressource / usage / pression ──
    'PLAN_EAU_NB':       {desc:'Nombre de plans d\u2019eau sur le territoire s\u00e9lectionn\u00e9', src:'IGN (INPE)', methodo:[{nom:'Plans d\u2019eau', url:'#methodo-plan-eau'}]},
    'PLAN_EAU_SURF':     {desc:'Superficie de plans d\u2019eau sur le territoire s\u00e9lectionn\u00e9', src:'IGN (INPE)', methodo:[{nom:'Plans d\u2019eau', url:'#methodo-plan-eau'}]},
    'COURS_EAU_LONG':    {desc:'Lin\u00e9aire de cours d\u2019eau sur l\u2019entit\u00e9 g\u00e9ographique s\u00e9lectionn\u00e9e', src:'IGN (BD TOPAGE)', methodo:[{nom:'Cours d\u2019eau', url:'#methodo-cours-eau'}]},
    'SURF_COURS_EAU':    {desc:'Lin\u00e9aire de cours d\u2019eau sur l\u2019entit\u00e9 g\u00e9ographique s\u00e9lectionn\u00e9e', src:'IGN (BD TOPAGE)', methodo:[{nom:'Cours d\u2019eau', url:'#methodo-cours-eau'}]},
    'SURF_PLANS_EAU_NB': {desc:'Nombre de plans d\u2019eau sur le territoire s\u00e9lectionn\u00e9', src:'IGN (INPE)', methodo:[{nom:'Plans d\u2019eau', url:'#methodo-plan-eau'}]},
    'SURF_PLANS_EAU_SURF':{desc:'Superficie de plans d\u2019eau sur le territoire s\u00e9lectionn\u00e9', src:'IGN (INPE)', methodo:[{nom:'Plans d\u2019eau', url:'#methodo-plan-eau'}]},
    'HYDRO_MODULE':      {desc:'Identification du module des stations de mesure sur le territoire. Repr\u00e9sentativit\u00e9 = 25/30 ans', src:'Hub\u2019Eau (Hydrom\u00e9trie)', methodo:[{nom:'Hydrologie — module', url:'#methodo-hydro-module'}]},
    'HYDRO_DEBIT_MOY':   {desc:'D\u00e9bit moyen ann\u00e9e n-1', src:'Hub\u2019Eau (Hydrom\u00e9trie)', methodo:[{nom:'Hydrologie — d\u00e9bit moyen', url:'#methodo-hydro-debit'}]},
    'HYDRO_DEBIT_2025':  {desc:'D\u00e9bit moyen ann\u00e9e n-1', src:'Hub\u2019Eau (Hydrom\u00e9trie)', methodo:[{nom:'Hydrologie — d\u00e9bit moyen', url:'#methodo-hydro-debit'}]},
    'HYDRO_QNMA5':       {desc:'Identification du QMNA5 sur le territoire. Repr\u00e9sentativit\u00e9 = 25/30 ans', src:'Hub\u2019Eau (Hydrom\u00e9trie)', methodo:[{nom:'Hydrologie — QMNA5', url:'#methodo-hydro-qmna'}]},
    'HYDRO_ETIAGE_TENDANCE':{desc:'Evolution du QMA sur le territoire. Tendance Mann-Kendall', src:'Hub\u2019Eau (Hydrom\u00e9trie)', methodo:[{nom:'Hydrologie — \u00e9tiage', url:'#methodo-hydro-etiage'}]},
    'PIEZO_CARTO':       {desc:'Evolution de la pi\u00e9zom\u00e9trie sur l\u2019ensemble de la chronique disponible', src:'Hub\u2019Eau (Pi\u00e9zom\u00e9trie)', methodo:[{nom:'Pi\u00e9zom\u00e9trie', url:'#methodo-piezo'}]},
    'PIEZO_TENDANCE':    {desc:'Evolution de la pi\u00e9zom\u00e9trie sur l\u2019ensemble de la chronique disponible', src:'Hub\u2019Eau (Pi\u00e9zom\u00e9trie)', methodo:[{nom:'Pi\u00e9zom\u00e9trie', url:'#methodo-piezo'}]},
    'ETAT_ECO_MECE_RATIO_PAR_CAT':{desc:'Pr\u00e9sentation du % de masse d\u2019eau superficielle dans chacune des classes d\u2019\u00e9tat - \u00e9tat \u00e9cologique', src:'SIE Agences de l\u2019eau', methodo:[{nom:'\u00c9tat \u00e9cologique des masses d\u2019eau', url:'#methodo-etat-eco'}]},
    'ETAT_CHIM_MECE_RATIO_PAR_CAT':{desc:'Pr\u00e9sentation du % de masse d\u2019eau superficielle dans chacune des classes d\u2019\u00e9tat - \u00e9tat chimique', src:'SIE Agences de l\u2019eau', methodo:[{nom:'\u00c9tat chimique des masses d\u2019eau', url:'#methodo-etat-chim'}]},
    'ETAT_ECO_SURF':     {desc:'Pr\u00e9sentation du % de masse d\u2019eau superficielle dans chacune des classes d\u2019\u00e9tat - \u00e9tat \u00e9cologique', src:'SIE Agences de l\u2019eau', methodo:[{nom:'\u00c9tat \u00e9cologique des masses d\u2019eau', url:'#methodo-etat-eco'}]},
    'ETAT_CHIM_SURF':    {desc:'Pr\u00e9sentation du % de masse d\u2019eau superficielle dans chacune des classes d\u2019\u00e9tat - \u00e9tat chimique', src:'SIE Agences de l\u2019eau', methodo:[{nom:'\u00c9tat chimique des masses d\u2019eau', url:'#methodo-etat-chim'}]},
    'MESO_NB':           {desc:'Nombre de masses d\u2019eau souterraine sur le territoire s\u00e9lectionn\u00e9', src:'Sandre (Eau France)', methodo:[{nom:'Masses d\u2019eau souterraine', url:'#methodo-meso'}]},
    'SOUT_MESO_NB':      {desc:'Nombre de masses d\u2019eau souterraine sur le territoire s\u00e9lectionn\u00e9', src:'Sandre (Eau France)', methodo:[{nom:'Masses d\u2019eau souterraine', url:'#methodo-meso'}]},
    'ETAT_QUANTI_MESO_RATIO_PAR_CAT':{desc:'Pr\u00e9sentation du % de masse d\u2019eau souterraines dans chacune des classes d\u2019\u00e9tat - \u00e9tat quantitatif', src:'SIE Agences de l\u2019eau', methodo:[{nom:'\u00c9tat quantitatif des eaux souterraines', url:'#methodo-etat-quanti'}]},
    'ETAT_CHIM_MESO_RATIO_PAR_CAT':{desc:'Pr\u00e9sentation du % de masse d\u2019eau souterraines dans chacune des classes d\u2019\u00e9tat - \u00e9tat chimique', src:'SIE Agences de l\u2019eau', methodo:[{nom:'\u00c9tat chimique des eaux souterraines', url:'#methodo-etat-chim-sout'}]},
    'ETAT_QUANTI_SOUT':  {desc:'Pr\u00e9sentation du % de masse d\u2019eau souterraines dans chacune des classes d\u2019\u00e9tat - \u00e9tat quantitatif', src:'SIE Agences de l\u2019eau', methodo:[{nom:'\u00c9tat quantitatif des eaux souterraines', url:'#methodo-etat-quanti'}]},
    'ETAT_CHIM_SOUT':    {desc:'Pr\u00e9sentation du % de masse d\u2019eau souterraines dans chacune des classes d\u2019\u00e9tat - \u00e9tat chimique', src:'SIE Agences de l\u2019eau', methodo:[{nom:'\u00c9tat chimique des eaux souterraines', url:'#methodo-etat-chim-sout'}]},

    // ── Usages ──
    'ICPE_NB_PAR_CAT':   {desc:'R\u00e9partition des ICPE entre non Seveso, Seveso seuil bas et Seveso seuil haut', src:'G\u00e9orisques', methodo:[{nom:'ICPE', url:'#methodo-icpe'}]},
    'BASOL_NB':          {desc:'Sites et sols pollu\u00e9s ou potentiellement pollu\u00e9s (ex-BASOL)', src:'G\u00e9orisques', methodo:[{nom:'Sites pollu\u00e9s (BASOL)', url:'#methodo-basol'}]},
    'BASOL_CARTO':       {desc:'Sites et sols pollu\u00e9s ou potentiellement pollu\u00e9s (ex-BASOL)', src:'G\u00e9orisques', methodo:[{nom:'Sites pollu\u00e9s (BASOL)', url:'#methodo-basol'}]},
    'PREL_IND_PAR_CAT':  {desc:'Evolution des volumes d\u2019eau pr\u00e9lev\u00e9s pour un usage industrie par type d\u2019eau (ESU, ESO) sur toute la chronique disponible (2008->2023)', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements industriels', url:'#methodo-prel-ind'}]},
    'RPG_CARTO':         {desc:'Localiser les surfaces cultiv\u00e9es par type de culture', src:'IGN (RPG)', methodo:[{nom:'Registre parcellaire graphique', url:'#methodo-rpg'}]},
    'RPG_RATIO_PAR_CAT': {desc:'Caract\u00e9riser les surfaces cultiv\u00e9es par type de culture', src:'IGN (RPG)', methodo:[{nom:'Registre parcellaire graphique', url:'#methodo-rpg'}]},
    'GOV_AGRI_CARTO':    {desc:'Localiser les surfaces cultiv\u00e9es par type de culture', src:'IGN (RPG)', methodo:[{nom:'Registre parcellaire graphique', url:'#methodo-rpg'}]},
    'GOV_AGRI_COUV_PIE': {desc:'Caract\u00e9riser les surfaces cultiv\u00e9es par type de culture', src:'IGN (RPG)', methodo:[{nom:'Registre parcellaire graphique', url:'#methodo-rpg'}]},
    'PREL_IRR_PAR_CAT':  {desc:'Evolution des volumes d\u2019eau pr\u00e9lev\u00e9s pour un usage irrigation par type d\u2019eau (ESU, ESO) sur toute la chronique disponible (2008->2023)', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements irrigation', url:'#methodo-prel-irr'}]},
    'GOV_PREL_AGRI_HIST':{desc:'Evolution des volumes d\u2019eau pr\u00e9lev\u00e9s pour un usage irrigation par type d\u2019eau (ESU, ESO) sur toute la chronique disponible (2008->2023)', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements irrigation', url:'#methodo-prel-irr'}]},
    'SAU_RATIO':         {desc:'Part de la SAU irrigu\u00e9e dans la superficie territoriale', src:'Agreste', methodo:[{nom:'SAU irrigu\u00e9e', url:'#methodo-sau'}]},
    'GOV_AGRI_SAU_IRRIG':{desc:'Part de la SAU irrigu\u00e9e dans la superficie territoriale', src:'Agreste', methodo:[{nom:'SAU irrigu\u00e9e', url:'#methodo-sau'}]},
    'STEU_CARTO':        {desc:'Capacit\u00e9s des stations d\u2019\u00e9puration des collectivit\u00e9s (EH) par station', src:'Sandre (Eau France)', methodo:[{nom:'Stations d\u2019\u00e9puration', url:'#methodo-steu'}]},
    'GOV_STEP_CARTO':    {desc:'Capacit\u00e9s des stations d\u2019\u00e9puration des collectivit\u00e9s (EH) par station', src:'Sandre (Eau France)', methodo:[{nom:'Stations d\u2019\u00e9puration', url:'#methodo-steu'}]},
    'GOV_STEP_NB':       {desc:'Capacit\u00e9s des stations d\u2019\u00e9puration des collectivit\u00e9s (EH) par station', src:'Sandre (Eau France)', methodo:[{nom:'Stations d\u2019\u00e9puration', url:'#methodo-steu'}]},
    'GOV_STEP_CAP_TOT':  {desc:'Capacit\u00e9s des stations d\u2019\u00e9puration des collectivit\u00e9s (EH) par station', src:'Sandre (Eau France)', methodo:[{nom:'Stations d\u2019\u00e9puration', url:'#methodo-steu'}]},
    'REUT_NB':           {desc:'Pr\u00e9sence d\u2019un projet de REUT sur la STEU', src:'MTES', methodo:[{nom:'R\u00e9utilisation des eaux us\u00e9es', url:'#methodo-reut'}]},
    'GOV_STEP_REUT':     {desc:'Pr\u00e9sence d\u2019un projet de REUT sur la STEU', src:'MTES', methodo:[{nom:'R\u00e9utilisation des eaux us\u00e9es', url:'#methodo-reut'}]},
    'PRIX_AC_CARTO':     {desc:'\u20ac/m3 pour une consommation moyenne de 120m3 max (Min, Max, Moy) sur le territoire', src:'SISPEA', methodo:[{nom:'Prix de l\u2019assainissement', url:'#methodo-prix-ac'}]},
    'GOV_PRIX_ASSAIN':   {desc:'\u20ac/m3 pour une consommation moyenne de 120m3 max (Min, Max, Moy) sur le territoire', src:'SISPEA', methodo:[{nom:'Prix de l\u2019assainissement', url:'#methodo-prix-ac'}]},
    'PREL_AEP_PAR_CAT':  {desc:'Evolution des volumes d\u2019eau pr\u00e9lev\u00e9s pour un usage AEP par type d\u2019eau (ESU, ESO) sur toute la chronique disponible (2008->2023)', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements eau potable', url:'#methodo-prel-aep'}]},
    'GOV_PREL_EP_HIST':  {desc:'Evolution des volumes d\u2019eau pr\u00e9lev\u00e9s pour un usage AEP par type d\u2019eau (ESU, ESO) sur toute la chronique disponible (2008->2023)', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements eau potable', url:'#methodo-prel-aep'}]},
    'RDT_RESEAU_CARTO':  {desc:'% de r\u00e9seau efficace (Min, Max, Moy) sur le territoire / Comparatif moyenne GE', src:'SISPEA', methodo:[{nom:'Rendement r\u00e9seau AEP', url:'#methodo-rdt-reseau'}]},
    'GOV_REND_CARTO':    {desc:'% de r\u00e9seau efficace (Min, Max, Moy) sur le territoire / Comparatif moyenne GE', src:'SISPEA', methodo:[{nom:'Rendement r\u00e9seau AEP', url:'#methodo-rdt-reseau'}]},
    'GOV_REND_MIN':      {desc:'% de r\u00e9seau efficace (Min, Max, Moy) sur le territoire / Comparatif moyenne GE', src:'SISPEA', methodo:[{nom:'Rendement r\u00e9seau AEP', url:'#methodo-rdt-reseau'}]},
    'GOV_REND_MAX':      {desc:'% de r\u00e9seau efficace (Min, Max, Moy) sur le territoire / Comparatif moyenne GE', src:'SISPEA', methodo:[{nom:'Rendement r\u00e9seau AEP', url:'#methodo-rdt-reseau'}]},
    'GOV_REND_MOY':      {desc:'% de r\u00e9seau efficace (Min, Max, Moy) sur le territoire / Comparatif moyenne GE', src:'SISPEA', methodo:[{nom:'Rendement r\u00e9seau AEP', url:'#methodo-rdt-reseau'}]},
    'GOV_REND_GE':       {desc:'% de r\u00e9seau efficace (Min, Max, Moy) sur le territoire / Comparatif moyenne GE', src:'SISPEA', methodo:[{nom:'Rendement r\u00e9seau AEP', url:'#methodo-rdt-reseau'}]},
    'PRIX_AEP_CARTO':    {desc:'\u20ac/m3 pour une consommation moyenne de 120m3 max sur le territoire', src:'SISPEA', methodo:[{nom:'Prix de l\u2019eau potable', url:'#methodo-prix-aep'}]},
    'GOV_PRIX_EAU':      {desc:'\u20ac/m3 pour une consommation moyenne de 120m3 max sur le territoire', src:'SISPEA', methodo:[{nom:'Prix de l\u2019eau potable', url:'#methodo-prix-aep'}]},
    'GOV_PRIX_EAU_DEPT': {desc:'Prix moyen d\u00e9partemental du service d\u2019eau potable', src:'SISPEA', methodo:[{nom:'Prix de l\u2019eau potable', url:'#methodo-prix-aep'}]},
    'GOV_PRIX_EAU_REG':  {desc:'Prix moyen r\u00e9gional du service d\u2019eau potable', src:'SISPEA', methodo:[{nom:'Prix de l\u2019eau potable', url:'#methodo-prix-aep'}]},
    'GOV_PRIX_EAU_FR':   {desc:'Prix moyen national du service d\u2019eau potable en France', src:'SISPEA', methodo:[{nom:'Prix de l\u2019eau potable', url:'#methodo-prix-aep'}]},
    'GOV_PRIX_ASSAIN_DEPT':{desc:'Prix moyen d\u00e9partemental de l\u2019assainissement collectif', src:'SISPEA', methodo:[{nom:'Prix de l\u2019assainissement', url:'#methodo-prix-ac'}]},
    'GOV_PRIX_ASSAIN_REG':{desc:'Prix moyen r\u00e9gional de l\u2019assainissement collectif', src:'SISPEA', methodo:[{nom:'Prix de l\u2019assainissement', url:'#methodo-prix-ac'}]},
    'GOV_PRIX_ASSAIN_FR':{desc:'Prix moyen national de l\u2019assainissement collectif en France', src:'SISPEA', methodo:[{nom:'Prix de l\u2019assainissement', url:'#methodo-prix-ac'}]},
    'GOV_PREL_EP_VOL':   {desc:'Volume pr\u00e9lev\u00e9 pour la production d\u2019eau potable', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements eau potable', url:'#methodo-prel-aep'}]},
    'GOV_PREL_AGRI_VOL': {desc:'Volume pr\u00e9lev\u00e9 pour l\u2019agriculture', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements irrigation', url:'#methodo-prel-irr'}]},
    'AAC_RATIO':         {desc:'% du territoire couvert par une AAC', src:'Sandre (Eau France)', methodo:[{nom:'Aires d\u2019alimentation de captages', url:'#methodo-aac'}]},
    'GOV_AAC_COUV':      {desc:'% du territoire couvert par une AAC', src:'Sandre (Eau France)', methodo:[{nom:'Aires d\u2019alimentation de captages', url:'#methodo-aac'}]},
    'AAC_CARTO':         {desc:'R\u00e9partition des AAC', src:'Sandre (Eau France)', methodo:[{nom:'Aires d\u2019alimentation de captages', url:'#methodo-aac'}]},
    'GOV_AAC_CARTO':     {desc:'R\u00e9partition des AAC', src:'Sandre (Eau France)', methodo:[{nom:'Aires d\u2019alimentation de captages', url:'#methodo-aac'}]},
    'CAPTAGE_DEGRADE_NB':{desc:'Nombre de captages sensibles ou captages prioritaires sur le territoire (SDAGE)', src:'R\u00e9gion Grand Est', methodo:[{nom:'Captages sensibles', url:'#methodo-captage'}]},
    'GOV_CAPT_DEG_PIE':  {desc:'R\u00e9partition des captages d\u00e9grad\u00e9s (sensibles ou prioritaires SDAGE) selon la cause de d\u00e9gradation : nitrates, pesticides, nitrates et pesticides, non indiqu\u00e9', src:'R\u00e9gion Grand Est', methodo:[{nom:'Captages sensibles', url:'#methodo-captage'}]},

    // ── Fiche d'identité ──
    'TERRITOIRE_NOM':    {desc:'Indique le nom du territoire', src:'Multi-source'},
    'TERRITOIRE_TYPE':   {desc:'Indique le type de territoire (commune, EPCI, etc.)', src:'Multi-source'},
    'TERRITOIRE_SURF':   {desc:'Indique la superficie du territoire donn\u00e9e', src:'Multi-source'},
    'TERRITOIRE_POP':    {desc:'Population totale sur un territoire donn\u00e9', src:'R\u00e9gion Grand Est', methodo:[{nom:'Population', url:'#methodo-population'}]},
    'TERRITOIRE_DENSITE':{desc:'Indique le nombre d\u2019habitant au km2 / pr\u00e9voir un comparatif par rapport au GE', src:'R\u00e9gion Grand Est', methodo:[{nom:'Densit\u00e9', url:'#methodo-densite'}]},
    'TERRITOIRE_RURALITE':{desc:'Indique la typologie du territoire (selon l\u2019\u00e9chelle, pr\u00e9voir des comparatifs)', src:'R\u00e9gion Grand Est', methodo:[{nom:'Ruralit\u00e9', url:'#methodo-ruralite'}]},
    'TERRITOIRE_POP_TENDANCE':{desc:'Tendance d\u2019\u00e9volution de la population entre 2006 et 2023 (premi\u00e8re et derni\u00e8re ann\u00e9e de la chronique)', src:'R\u00e9gion Grand Est', methodo:[{nom:'\u00c9volution population', url:'#methodo-pop-tendance'}]},
    'TERRITOIRE_POP_EVOL':{desc:'Evolution de la population totale sur toute la chronique disponible', src:'R\u00e9gion Grand Est', methodo:[{nom:'\u00c9volution population', url:'#methodo-pop-evol'}]},
    'PREL_USAGE_PAR_CAT':{desc:'Somme des volumes d\u2019eau pr\u00e9lev\u00e9s par type d\u2019usages tous types de ressources confondus sur toute la chronique disponible (BNPE 2008-2023)', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements par usage', url:'#methodo-prel-usage'}]},
    'PREL_ANNEE':        {desc:'Volume pr\u00e9lev\u00e9 l\u2019ann\u00e9e N', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements annuels', url:'#methodo-prel-annee'}]},

    // ── Vulnérabilité et risques — Températures ──
    'VULN_TEMP_MENS_N1': {desc:'Temp\u00e9ratures moyennes mensuelles de l\u2019ann\u00e9e n-1', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Temp\u00e9ratures', url:'#methodo-vuln-temp'}]},
    'VULN_TEMP_MENS_REF':{desc:'Temp\u00e9ratures moyennes mensuelles sur la p\u00e9riode de r\u00e9f\u00e9rence (1991-2020)', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Temp\u00e9ratures', url:'#methodo-vuln-temp'}]},
    'VULN_TEMP_MOY_N1':  {desc:'Temp\u00e9rature moyenne annuelle de l\u2019ann\u00e9e n-1', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Temp\u00e9ratures', url:'#methodo-vuln-temp'}]},
    'VULN_TEMP_REF':     {desc:'Temp\u00e9rature moyenne annuelle sur la p\u00e9riode de r\u00e9f\u00e9rence (1991-2020)', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Temp\u00e9ratures', url:'#methodo-vuln-temp'}]},
    'VULN_TEMP_SURPLUS': {desc:'Temp\u00e9ratures moyennes annuelles sur la p\u00e9riode 1991 \u2013 ann\u00e9e n-1', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Temp\u00e9ratures', url:'#methodo-vuln-temp'}]},
    // ── Vulnérabilité — Précipitations ──
    'VULN_PRECIP_MENS_N1':{desc:'Cumuls de pr\u00e9cipitations mensuelles de l\u2019ann\u00e9e n-1', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Pr\u00e9cipitations', url:'#methodo-vuln-precip'}]},
    'VULN_PRECIP_MENS_REF':{desc:'Cumuls de pr\u00e9cipitations moyennes mensuelles sur la p\u00e9riode de r\u00e9f\u00e9rence (1991-2020)', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Pr\u00e9cipitations', url:'#methodo-vuln-precip'}]},
    'VULN_PRECIP_MOY_N1':{desc:'Cumul de pr\u00e9cipitation moyenne annuelle de l\u2019ann\u00e9e n-1', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Pr\u00e9cipitations', url:'#methodo-vuln-precip'}]},
    'VULN_PRECIP_REF':   {desc:'Cumul de pr\u00e9cipitation moyenne annuelle sur la p\u00e9riode de r\u00e9f\u00e9rence (1991-2020)', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Pr\u00e9cipitations', url:'#methodo-vuln-precip'}]},
    'VULN_PRECIP_SURPLUS':{desc:'Cumuls de pr\u00e9cipitations moyennes annuelles sur la p\u00e9riode 1991 \u2013 ann\u00e9e n-1', src:'M\u00e9t\u00e9o France (SAFRAN)', methodo:[{nom:'Pr\u00e9cipitations', url:'#methodo-vuln-precip'}]},
    // ── Vulnérabilité — Risques : Sécheresse ──
    'VULN_SECH_PIE_N1':  {desc:'Nombre de jours sous arr\u00eat\u00e9s de restrictions d\u2019eau par niveau de gravit\u00e9 (Vigilance, Alerte, Alerte renforc\u00e9e et Crise) de l\u2019ann\u00e9e n-1', src:'Data.gouv (VigiEau)', methodo:[{nom:'S\u00e9cheresse', url:'#methodo-vuln-sech'}]},
    'VULN_SECH_EVOL':    {desc:'\u00c9volution annuelle du nombre de jours sous arr\u00eat\u00e9s de restrictions d\u2019eau par niveau de gravit\u00e9 (Vigilance, Alerte, Alerte renforc\u00e9e et Crise) sur la p\u00e9riode disponible', src:'Data.gouv (VigiEau)', methodo:[{nom:'S\u00e9cheresse', url:'#methodo-vuln-sech'}]},
    // ── Vulnérabilité — Risques : Étiages ──
    'VULN_ETIAGE_N1':    {desc:'R\u00e9partition mensuelle (de mai \u00e0 septembre) des observations visuelles sur l\u2019\u00e9coulement des cours d\u2019eau par modalit\u00e9s d\u2019\u00e9coulement (\u00c9coulement visible, \u00c9coulement non visible et Assec) de l\u2019ann\u00e9e n-1', src:'Hub\u2019Eau (ONDE)', methodo:[{nom:'\u00c9tiages', url:'#methodo-vuln-etiage'}]},
    'VULN_ETIAGE_EVOL':  {desc:'Observations visuelles sur l\u2019\u00e9coulement des cours d\u2019eau sur la p\u00e9riode disponible (de 2012 \u00e0 l\u2019ann\u00e9e n-1)', src:'Hub\u2019Eau (ONDE)', methodo:[{nom:'\u00c9tiages', url:'#methodo-vuln-etiage'}]},
    // ── Vulnérabilité — Risques : CatNat ──
    'VULN_CATNAT_PIE_N1':{desc:'Nombre d\u2019arr\u00eat\u00e9s de catastrophes naturelles par type de risque (S\u00e9cheresse, Inondations, etc.) de l\u2019ann\u00e9e n-1', src:'G\u00e9orisques', methodo:[{nom:'Catastrophes naturelles', url:'#methodo-vuln-catnat'}]},
    'VULN_CATNAT_EVOL':  {desc:'\u00c9volution du nombre d\u2019arr\u00eat\u00e9s de catastrophes naturelles par type de risque (S\u00e9cheresse, Inondations, etc.) sur la p\u00e9riode disponible', src:'G\u00e9orisques', methodo:[{nom:'Catastrophes naturelles', url:'#methodo-vuln-catnat'}]},
    'ICPE_NB_PAR_CAT':   {desc:'R\u00e9partition des Installations Class\u00e9es pour la Protection de l\u2019Environnement (ICPE) entre non Seveso, Seveso seuil bas et Seveso seuil haut', src:'G\u00e9orisques', methodo:[{nom:'ICPE', url:'#methodo-icpe'}]},
    'BASOL_NB':          {desc:'Nombre de sites et sols pollu\u00e9s ou potentiellement pollu\u00e9s (ex-BASOL) sur le territoire', src:'G\u00e9orisques', methodo:[{nom:'Sites pollu\u00e9s (BASOL)', url:'#methodo-basol'}]},
    'BASOL_CARTO':       {desc:'Localisation des sites et sols pollu\u00e9s ou potentiellement pollu\u00e9s', src:'G\u00e9orisques', methodo:[{nom:'Sites pollu\u00e9s (BASOL)', url:'#methodo-basol'}]},
    'PREL_IND_PAR_CAT':  {desc:'\u00c9volution des volumes d\u2019eau pr\u00e9lev\u00e9s \u00e0 usage industrie par type d\u2019eau (ESU, ESO) sur la chronique disponible', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements industriels', url:'#methodo-prel-ind'}]},
    'PREL_IND_VOL':      {desc:'Volume d\u2019eau pr\u00e9lev\u00e9 \u00e0 usage industrie pour l\u2019ann\u00e9e N', src:'Hub\u2019Eau (BNPE)', methodo:[{nom:'Pr\u00e9l\u00e8vements industriels', url:'#methodo-prel-ind'}]},
    'SITE_BAIGNADE_NB':  {desc:'Nombre de sites de baignade sur le territoire', src:'Minist\u00e8re de la Sant\u00e9 (data.gouv)', methodo:[{nom:'Sites de baignade', url:'#methodo-baignade'}]},
    'SITE_BAIGNADE_CLASSE':{desc:'Classe de qualit\u00e9 des eaux de baignade', src:'Minist\u00e8re de la Sant\u00e9 (data.gouv)', methodo:[{nom:'Sites de baignade', url:'#methodo-baignade'}]},
    'SITE_BAIGNADE_CARTO':{desc:'R\u00e9partition g\u00e9ographique des sites de baignade', src:'Minist\u00e8re de la Sant\u00e9 (data.gouv)', methodo:[{nom:'Sites de baignade', url:'#methodo-baignade'}]},
    'SITE_BAIGNADE_NB_PAR_CAT':{desc:'R\u00e9partition des sites de baignade par classe de qualit\u00e9 des eaux (Excellent, Bon, Suffisant, Insuffisant, Non class\u00e9)', src:'Minist\u00e8re de la Sant\u00e9 (data.gouv)', methodo:[{nom:'Sites de baignade', url:'#methodo-baignade'}]}
  };

  // ── Infobulle "i" sur un indicateur ──
  function renderInfobulle(indicatorId) {
    if (!indicatorId) return '';
    var entry = INFO_DESCRIPTIONS[indicatorId];
    // RGAA 8.9 : plus de texte factice → description du dictionnaire, sinon libellé de l'indicateur
    var tipText = entry && entry.desc ? entry.desc : findIndicatorName(indicatorId);
    if (!tipText) return '';
    // aria-label complété par le module a11y (contexte + description)
    return '<span class="tdb-elu2-info" data-info-tip="' + escHtml(tipText) + '" data-ind-id="' + escHtml(indicatorId) + '" tabindex="0" role="button" aria-label="Information : ' + escHtml(tipText) + '"><i aria-hidden="true">i</i></span>';
  }

  // Libellé d'un indicateur (toutes sections) — repli quand aucune description n'existe
  function findIndicatorName(indicatorId) {
    if (typeof TUILES_ELU_V2 === 'undefined') return '';
    var found = '';
    Object.keys(TUILES_ELU_V2).some(function(sec) {
      return (TUILES_ELU_V2[sec] || []).some(function(tu) {
        return (tu.indicateurs || []).some(function(ind) {
          if (ind.id === indicatorId) { found = ind.description || ind.nom || ''; return true; }
          return false;
        });
      });
    });
    return found;
  }

  // ── Infobulle "i" sur un titre de tuile (lorem ipsum factice) ──
  function renderTuileInfobulle(tu) {
    if (!tu || !tu.indicateurs || !tu.indicateurs.length) return '';
    var firstId = tu.indicateurs[0].id;
    return renderInfobulle(firstId);
  }


  // ── Source affichée en bas à gauche d'une tuile ──
  // ids : un seul id string OU un array d'ids (prend la 1ère source trouvée)
  function renderTuileSource(ids) {
    if (!ids) return '';
    var arr = typeof ids === 'string' ? [ids] : ids;
    var src = '';
    for (var i = 0; i < arr.length; i++) {
      var entry = INFO_DESCRIPTIONS[arr[i]];
      if (entry && entry.src) { src = entry.src; break; }
    }
    if (!src) return '';
    return '<div class="tdb-elu2-source tdb-elu2-source--tuile">Source\u00a0: ' + escHtml(src) + '</div>';
  }

  // ── Source affichée centrée sous un indicateur ──
  function renderIndicSource(indicatorId) {
    if (!indicatorId) return '';
    var entry = INFO_DESCRIPTIONS[indicatorId];
    if (!entry || !entry.src) return '';
    return '<div class="tdb-elu2-source tdb-elu2-source--indic">Source\u00a0: ' + escHtml(entry.src) + '</div>';
  }

  // ── Post-traitement : injecter les sources + méthodologies en bas de chaque tuile ──
  // Parcourt les .tdb-elu2-info dans chaque .tdb-elu2-card
  // et ajoute la 1ère source trouvée + les liens méthodologie dédupliqués
  function injectTuileSources() {
    var cards = document.querySelectorAll('.tdb-elu2-card, .tdb-elu2-gov-tree, .tdb-elu2-sage-card, .tdb-elu2-prelevements, .tdb-elu2-gov-baignade, .tdb-elu2-vuln-surplus-card, .tdb-elu2-vuln-mensuel-card, .tdb-elu2-vuln-risque-card');
    cards.forEach(function(card) {
      // Ne pas doubler si déjà présent
      if (card.querySelector('.tdb-elu2-source--tuile')) return;
      // Trouver toutes les infobulles dans cette card
      var infos = card.querySelectorAll('.tdb-elu2-info');
      var src = '';
      var methodoMap = {}; // dédupliqué par url
      var methodoList = [];
      for (var i = 0; i < infos.length; i++) {
        var indId = infos[i].getAttribute('data-ind-id');
        if (!indId) continue;
        var entry = INFO_DESCRIPTIONS[indId];
        if (!entry) continue;
        // Source (première trouvée)
        if (!src && entry.src) src = entry.src;
        // Méthodologies (toutes, dédupliquées par url)
        if (entry.methodo && entry.methodo.length) {
          for (var m = 0; m < entry.methodo.length; m++) {
            var met = entry.methodo[m];
            if (met.url && !methodoMap[met.url]) {
              methodoMap[met.url] = true;
              methodoList.push(met);
            }
          }
        }
      }
      if (src || methodoList.length) {
        var footEl = document.createElement('div');
        footEl.className = 'tdb-elu2-source tdb-elu2-source--tuile';

        // Ligne source
        var html = '';
        if (src) {
          html += '<span class="tdb-elu2-source__label">Source\u00a0: ' + escHtml(src) + '</span>';
        }
        // Liens méthodologie
        if (methodoList.length) {
          html += '<span class="tdb-elu2-methodo-links">';
          html += '<span class="tdb-elu2-methodo-links__title">M\u00e9thodologie\u00a0:</span>';
          for (var j = 0; j < methodoList.length; j++) {
            html += '<a href="' + escHtml(methodoList[j].url) + '" target="_blank" rel="noopener" class="tdb-elu2-methodo-link" title="Fiche m\u00e9thodologique — ' + escHtml(methodoList[j].nom) + '">';
            html += '<i class="ph ph-file-pdf" aria-hidden="true"></i> ';
            html += escHtml(methodoList[j].nom);
            html += '</a>';
          }
          html += '</span>';
        }
        footEl.innerHTML = html;
        card.appendChild(footEl);
      }
    });
  }

  // ── Tooltip global (position: fixed, échappe à overflow:hidden) ──
  var infoTipEl = null;
  function initInfoTooltip() {
    if (infoTipEl) return;
    infoTipEl = document.createElement('div');
    infoTipEl.className = 'tdb-elu2-info-tooltip';
    infoTipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(infoTipEl);

    document.addEventListener('mouseover', function(e) {
      var trigger = e.target.closest('.tdb-elu2-info');
      if (!trigger) { infoTipEl.classList.remove('is-visible'); return; }
      var text = trigger.getAttribute('data-info-tip');
      if (!text) { infoTipEl.classList.remove('is-visible'); return; }
      infoTipEl.textContent = text;
      infoTipEl.classList.add('is-visible');
      positionInfoTip(trigger);
    });

    document.addEventListener('mouseout', function(e) {
      var trigger = e.target.closest('.tdb-elu2-info');
      if (trigger) {
        var related = e.relatedTarget;
        if (related && (related === infoTipEl || related.closest('.tdb-elu2-info') === trigger)) return;
        infoTipEl.classList.remove('is-visible');
      }
    });

    // Fermer au scroll
    document.addEventListener('scroll', function() {
      infoTipEl.classList.remove('is-visible');
    }, { passive: true });

    // ── RGAA 7.1 / 10.13 : infobulle accessible au clavier et au toucher ──
    infoTipEl.id = 'tdb-elu2-info-tooltip';
    var tipOwner = null;
    function showTip(trigger) {
      var text = trigger.getAttribute('data-info-tip');
      if (!text) return;
      infoTipEl.textContent = text;
      infoTipEl.classList.add('is-visible');
      trigger.setAttribute('aria-expanded', 'true');
      positionInfoTip(trigger);
      tipOwner = trigger;
    }
    function hideTip() {
      infoTipEl.classList.remove('is-visible');
      if (tipOwner) tipOwner.setAttribute('aria-expanded', 'false');
      tipOwner = null;
    }
    document.addEventListener('focusin', function(e) {
      var trigger = e.target.closest && e.target.closest('.tdb-elu2-info');
      if (trigger) showTip(trigger); else if (tipOwner) hideTip();
    });
    document.addEventListener('focusout', function(e) {
      if (e.target.closest && e.target.closest('.tdb-elu2-info')) hideTip();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && infoTipEl.classList.contains('is-visible')) { hideTip(); return; }
      var trigger = e.target.closest && e.target.closest('.tdb-elu2-info');
      if (trigger && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (tipOwner === trigger && infoTipEl.classList.contains('is-visible')) hideTip(); else showTip(trigger);
      }
    });
    // Toucher / clic : bascule l'affichage
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest && e.target.closest('.tdb-elu2-info');
      if (!trigger) { if (tipOwner) hideTip(); return; }
      e.preventDefault();
      e.stopPropagation();
      if (tipOwner === trigger && infoTipEl.classList.contains('is-visible')) hideTip(); else showTip(trigger);
    });
  }

  function positionInfoTip(trigger) {
    if (!infoTipEl) return;
    var rect = trigger.getBoundingClientRect();
    var tipW = infoTipEl.offsetWidth;
    var tipH = infoTipEl.offsetHeight;

    // Positionner au-dessus du trigger, centré horizontalement
    var left = rect.left + rect.width / 2 - tipW / 2;
    var top = rect.top - tipH - 10;

    // Empêcher le débordement à gauche
    if (left < 8) left = 8;
    // Empêcher le débordement à droite
    if (left + tipW > window.innerWidth - 8) left = window.innerWidth - 8 - tipW;
    // Si pas de place au-dessus, afficher en dessous
    if (top < 8) top = rect.bottom + 10;

    infoTipEl.style.left = left + 'px';
    infoTipEl.style.top = top + 'px';

    // Positionner la flèche
    var arrowLeft = rect.left + rect.width / 2 - left;
    infoTipEl.style.setProperty('--arrow-left', arrowLeft + 'px');
  }

  function indexInds(indicateurs) {
    var map = {};
    indicateurs.forEach(function(ind) { map[ind.id] = ind; });
    return map;
  }

  // ── Treemap HTML — Rectangles proportionnels ────────────
  // Icônes Phosphor par catégorie d'occupation du sol
  var OCS_ICONS = {
    'eau':       'ph-drop',
    'naturel':   'ph-plant',
    'agricole':  'ph-tractor',
    'bois':      'ph-tree',
    'urbain':    'ph-buildings'
  };
  function ocsIcon(label) {
    var l = label.toLowerCase();
    if (l.indexOf('naturel') >= 0 || l.indexOf('milieu') >= 0)  return OCS_ICONS['naturel'];
    if (l.indexOf('eau') >= 0 || l.indexOf('surface en') >= 0)  return OCS_ICONS['eau'];
    if (l.indexOf('agricol') >= 0 || l.indexOf('emprise') >= 0)  return OCS_ICONS['agricole'];
    if (l.indexOf('bois') >= 0 || l.indexOf('for') >= 0)        return OCS_ICONS['bois'];
    if (l.indexOf('urban') >= 0 || l.indexOf('espaces u') >= 0) return OCS_ICONS['urbain'];
    return 'ph-square';
  }

  function renderTreemap(chartData) {
    var labels = chartData.labels;
    var values = chartData.values;
    var colors = chartData.colors;
    var total = 0;
    var i;
    for (i = 0; i < values.length; i++) { total += values[i]; }

    // Trier par valeur décroissante, garder l'index original pour couleur
    var items = [];
    for (i = 0; i < values.length; i++) {
      items.push({ label: labels[i], value: values[i], color: colors[i], pct: Math.round(values[i] / total * 100) });
    }
    items.sort(function(a, b) { return b.value - a.value; });

    // Layout : le plus grand en haut (pleine largeur),
    // les restants en ligne en dessous, largeur proportionnelle
    var topItem = items[0];
    var rest = items.slice(1);

    // Déterminer si le texte doit être clair ou foncé
    // RGAA 3.2 : couleur de texte choisie selon le meilleur contraste calculé (blanc ou encre)
    function textColor(bg) {
      return contrastRatio(bg, '#ffffff') >= contrastRatio(bg, '#1a2332') ? '#fff' : '#1a2332';
    }

    function cellHtml(item, extraClass) {
      var cls = 'tdb-elu2-treemap__cell' + (extraClass ? ' ' + extraClass : '');
      // RGAA 3.2 : si ni le blanc ni l'encre n'atteignent 4,5:1, on fonce l\u00e9g\u00e8rement le fond
      var bg = item.color;
      if (Math.max(contrastRatio(bg, '#ffffff'), contrastRatio(bg, '#1a2332')) < 4.5) bg = readableColor(bg);
      var h = '<div class="' + cls + '" style="background:' + bg + ';color:' + textColor(bg) + '"';
      h += ' data-tm-label="' + escHtml(item.label) + '" data-tm-pct="' + item.pct + ' %" data-tm-color="' + item.color + '">';
      h += '<i class="ph ' + ocsIcon(item.label) + ' tdb-elu2-treemap__icon"></i>';
      h += '<span class="tdb-elu2-treemap__label">' + escHtml(item.label) + '</span>';
      h += '<span class="tdb-elu2-treemap__pct">' + item.pct + ' %</span>';
      h += '</div>';
      return h;
    }

    // Calculer les flex proportionnels : surface de chaque bloc = son %
    var topPct = topItem.pct;
    var restPct = 0;
    for (i = 0; i < rest.length; i++) { restPct += rest[i].pct; }

    var html = '<div class="tdb-elu2-treemap">';

    // Rangée du haut (plus grand) — hauteur proportionnelle à son %
    html += '<div style="flex:' + topPct + ' 1 0%">';
    html += cellHtml(topItem, 'tdb-elu2-treemap__cell--top');
    html += '</div>';

    // Rangée du bas — hauteur proportionnelle au cumul des %
    html += '<div class="tdb-elu2-treemap__row" style="flex:' + restPct + ' 1 0%">';
    for (i = 0; i < rest.length; i++) {
      html += '<div style="flex:' + rest[i].value + ' 1 0%;min-width:0">';
      html += cellHtml(rest[i], '');
      html += '</div>';
    }
    html += '</div>';

    // Tooltip rollover
    html += '<div class="tdb-elu2-treemap__tooltip"></div>';

    html += '</div>';
    return html;
  }

  // ── Tooltip treemap : binding events ──────────────────────
  function bindTreemapTooltips() {
    var treemaps = document.querySelectorAll('.tdb-elu2-treemap');
    treemaps.forEach(function(tm) {
      var tip = tm.querySelector('.tdb-elu2-treemap__tooltip');
      if (!tip) return;

      tm.addEventListener('mouseover', function(e) {
        var cell = e.target.closest('.tdb-elu2-treemap__cell');
        if (!cell) { tip.classList.remove('is-visible'); return; }
        var bgColor = cell.getAttribute('data-tm-color') || '#1565C0';
        tip.innerHTML = '<strong>' + (cell.getAttribute('data-tm-label') || '') + '</strong><span class="tdb-elu2-treemap__tooltip-pct" style="background:' + bgColor + '">' + (cell.getAttribute('data-tm-pct') || '') + '</span>';
        tip.classList.add('is-visible');
      });

      tm.addEventListener('mousemove', function(e) {
        if (!tip.classList.contains('is-visible')) return;
        tip.style.left = e.clientX + 'px';
        tip.style.top = (e.clientY - 10) + 'px';
      });

      tm.addEventListener('mouseleave', function() {
        tip.classList.remove('is-visible');
      });
    });
  }

  function findTuile(sectionId, zone) {
    var tuiles = TUILES_ELU_V2[sectionId];
    if (!tuiles) return null;
    return tuiles.find(function(t) { return t.zone === zone; }) || null;
  }

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 5 : VULNÉRABILITÉ ET RISQUES
  // ══════════════════════════════════════════════════════════════════════

  var vulnChartInstances = [];
  var vulnActiveView = 'annuel'; // 'annuel' | 'mensuel'

  function destroyVulnCharts() {
    vulnChartInstances.forEach(function(c) { c.destroy(); });
    vulnChartInstances = [];
  }

  // ── Page wrapper ──
  function renderVulnerabilitePage(tuiles) {
    var html = '<div class="tdb-elu2-section">';
    html += renderTerritoryBanner();
    html += '<div id="tdb-elu2-section-body">';
    html += renderVulnerabiliteBody(tuiles);
    html += '</div></div>';
    return html;
  }

  // ── Corps de la section (re-rendu au switch territoire) ──
  function renderVulnerabiliteBody(tuiles) {
    applyTerritoryOverrides(tuiles);
    var t = {};
    tuiles.forEach(function(tu) { t[tu.zone] = tu; });
    var html = '';

    // ══ BLOC 1 : Températures & Précipitations ══
    html += '<div class="tdb-elu2-banner"><i class="ph ph-thermometer-hot"></i> \u00c9volutions des temp\u00e9ratures & pr\u00e9cipitations</div>';

    html += '<div class="tdb-elu2-vuln-climat">';

    // Toggle Annuel / Mensuel
    // RGAA 7.1 : boutons bascule avec état restitué (aria-pressed)
    html += '<div class="tdb-elu2-vuln-toggle" role="group" aria-label="P\u00e9riode d\u2019affichage des temp\u00e9ratures et pr\u00e9cipitations">';
    html += '<button type="button" class="tdb-elu2-vuln-toggle__btn' + (vulnActiveView === 'annuel' ? ' is-active' : '') + '" data-vuln-view="annuel" aria-pressed="' + (vulnActiveView === 'annuel') + '">Annuel</button>';
    html += '<button type="button" class="tdb-elu2-vuln-toggle__btn' + (vulnActiveView === 'mensuel' ? ' is-active' : '') + '" data-vuln-view="mensuel" aria-pressed="' + (vulnActiveView === 'mensuel') + '">Mensuel</button>';
    html += '</div>';

    // ── Vue Annuel ──
    html += '<div class="tdb-elu2-vuln-view' + (vulnActiveView === 'annuel' ? ' is-active' : '') + '" data-vuln-panel="annuel">';
    html += renderVulnClimatAnnuel(t);
    html += '</div>';

    // ── Vue Mensuel ──
    html += '<div class="tdb-elu2-vuln-view' + (vulnActiveView === 'mensuel' ? ' is-active' : '') + '" data-vuln-panel="mensuel">';
    html += renderVulnClimatMensuel(t);
    html += '</div>';

    html += '</div>'; // .tdb-elu2-vuln-climat

    // ══ BLOC 2 : Risques ══
    html += '<div class="tdb-elu2-banner"><i class="ph ph-warning"></i> Risques</div>';

    // ── Suivi des arrêtés sécheresse ──
    html += renderVulnSecheresse(t);

    // ── Étiages et écoulements ──
    html += renderVulnEtiages(t);

    // ── Arrêtés catastrophes naturelles (CatNat) ──
    html += renderVulnCatNat(t);

    restoreTerritoryOverrides(tuiles);
    return html;
  }

  // ══ Vue Annuel — Température + Précipitation ══
  function renderVulnClimatAnnuel(t) {
    var html = '';

    // ── Température annuelle ──
    html += '<div class="tdb-elu2-vuln-row">';
    html += renderVulnSurplusCard(t['temp-annuelle'], 'temp', '\u00c9volution annuelle de la temp\u00e9rature par rapport \u00e0 la p\u00e9riode de r\u00e9f\u00e9rence (1991-2020)');
    html += '</div>';

    // ── Précipitation annuelle ──
    html += '<div class="tdb-elu2-vuln-row">';
    html += renderVulnSurplusCard(t['precip-annuelle'], 'precip', '\u00c9volution annuelle des pr\u00e9cipitations par rapport \u00e0 la p\u00e9riode de r\u00e9f\u00e9rence (1991-2020)');
    html += '</div>';

    return html;
  }

  // ── Carte surplus/déficit (Température ou Précipitation annuelles) ──
  function renderVulnSurplusCard(tu, prefix, title) {
    if (!tu) return '';
    var ind = indexInds(tu.indicateurs);
    var P = prefix.toUpperCase();
    var kpiN1 = ind['VULN_' + P + '_MOY_N1'];
    var kpiRef = ind['VULN_' + P + '_REF'];

    var kpiN1Val = kpiN1 ? kpiN1.fakeValue : '\u2014';
    var kpiRefVal = kpiRef ? kpiRef.fakeValue : '\u2014';
    var unite = kpiN1 ? kpiN1.unite : '';

    // Titre contextuel au-dessus des KPIs
    var kpiTitle = prefix === 'temp' ? 'Temp\u00e9rature moyenne annuelle' : 'Pr\u00e9cipitations moyennes annuelles';
    var refSubLabel = 'P\u00e9riode de r\u00e9f\u00e9rence (1991-2020)';

    var html = '<div class="tdb-elu2-card tdb-elu2-vuln-surplus-card">';
    html += '<div class="tdb-elu2-vuln-surplus-card__header">';
    html += '<h3 class="tdb-elu2-vuln-surplus-card__title">' + escHtml(title) + renderInfobulle('VULN_' + P + '_SURPLUS') + '</h3>';
    html += '</div>';

    html += '<div class="tdb-elu2-vuln-surplus-card__body">';

    // KPI à gauche
    html += '<div class="tdb-elu2-vuln-surplus-card__kpi">';
    html += '<span class="tdb-elu2-vuln-kpi__heading">' + escHtml(kpiTitle) + '</span>';
    html += '<div class="tdb-elu2-vuln-kpi">';
    html += '<span class="tdb-elu2-vuln-kpi__val-inline">' + escHtml(kpiN1Val) + '\u00a0' + escHtml(unite) + '</span>';
    html += '<span class="tdb-elu2-vuln-kpi__label">Ann\u00e9e N-1' + renderInfobulle('VULN_' + P + '_MOY_N1') + '</span>';
    html += '</div>';
    html += '<div class="tdb-elu2-vuln-kpi tdb-elu2-vuln-kpi--ref">';
    html += '<span class="tdb-elu2-vuln-kpi__val-inline">' + escHtml(kpiRefVal) + '\u00a0' + escHtml(unite) + '</span>';
    html += '<span class="tdb-elu2-vuln-kpi__label">' + escHtml(refSubLabel) + renderInfobulle('VULN_' + P + '_REF') + '</span>';
    html += '</div>';
    html += '</div>';

    // Graphique surplus/déficit à droite
    html += '<div class="tdb-elu2-vuln-surplus-card__chart">';
    html += '<canvas id="chart-v2-vuln-' + prefix + '-surplus" data-chart-v2="vuln-' + prefix + '-surplus"></canvas>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ══ Vue Mensuel — Température + Précipitation ══
  function renderVulnClimatMensuel(t) {
    var html = '';

    // ── Température mensuelle ──
    html += '<div class="tdb-elu2-vuln-row">';
    html += renderVulnMensuelCard(t['temp-mensuelle'], 'temp', '\u00c9volution mensuelle de la temp\u00e9rature de l\u2019ann\u00e9e N-1 par rapport \u00e0 la p\u00e9riode de r\u00e9f\u00e9rence (1991-2020)', t['temp-annuelle']);
    html += '</div>';

    // ── Précipitation mensuelle ──
    html += '<div class="tdb-elu2-vuln-row">';
    html += renderVulnMensuelCard(t['precip-mensuelle'], 'precip', '\u00c9volution mensuelle des pr\u00e9cipitations de l\u2019ann\u00e9e N-1 par rapport \u00e0 la p\u00e9riode de r\u00e9f\u00e9rence (1991-2020)', t['precip-annuelle']);
    html += '</div>';

    return html;
  }

  // ── Carte mensuelle comparaison barres + ligne ──
  function renderVulnMensuelCard(tu, prefix, title, tuAnnuelle) {
    if (!tu) return '';
    var P = prefix.toUpperCase();
    var indMens = tu.indicateurs[0];
    var cd = (indMens && indMens.fakeChartData) || {};
    var unite = (indMens && indMens.unite) || (prefix === 'temp' ? '\u00b0C' : 'mm');

    // KPI annuels (identiques à la carte annuelle pour rester cohérents).
    // Repli si la tuile annuelle est absente : moyenne des 12 mois (température)
    // ou cumul des 12 mois (précipitations).
    function annuelDepuisMois(arr) {
      if (!arr || !arr.length) return '\u2014';
      var s = arr.reduce(function(a, v) { return a + (parseFloat(v) || 0); }, 0);
      return prefix === 'temp' ? (s / arr.length).toFixed(1) : String(Math.round(s));
    }
    var indAnn = tuAnnuelle ? indexInds(tuAnnuelle.indicateurs) : {};
    var annN1 = indAnn['VULN_' + P + '_MOY_N1'];
    var annRef = indAnn['VULN_' + P + '_REF'];
    var kpiN1Val = annN1 ? annN1.fakeValue : annuelDepuisMois(cd.barValues);
    var kpiRefVal = annRef ? annRef.fakeValue : annuelDepuisMois(cd.lineValues);

    // Même structure que la vue annuelle (titre + N-1 + référence)
    var kpiTitle = prefix === 'temp' ? 'Temp\u00e9rature moyenne annuelle' : 'Pr\u00e9cipitations moyennes annuelles';
    var refSubLabel = 'P\u00e9riode de r\u00e9f\u00e9rence (1991-2020)';

    var html = '<div class="tdb-elu2-card tdb-elu2-vuln-mensuel-card">';
    html += '<div class="tdb-elu2-vuln-mensuel-card__header">';
    html += '<h3 class="tdb-elu2-vuln-mensuel-card__title">' + escHtml(title) + renderInfobulle('VULN_' + P + '_MENS_N1') + '</h3>';
    html += '</div>';

    html += '<div class="tdb-elu2-vuln-mensuel-card__body">';

    // KPI à gauche (identique à l'annuel, chiffres mensuels)
    html += '<div class="tdb-elu2-vuln-surplus-card__kpi">';
    html += '<span class="tdb-elu2-vuln-kpi__heading">' + escHtml(kpiTitle) + '</span>';
    html += '<div class="tdb-elu2-vuln-kpi">';
    html += '<span class="tdb-elu2-vuln-kpi__val-inline">' + escHtml(kpiN1Val) + '\u00a0' + escHtml(unite) + '</span>';
    html += '<span class="tdb-elu2-vuln-kpi__label">Ann\u00e9e N-1' + renderInfobulle('VULN_' + P + '_MOY_N1') + '</span>';
    html += '</div>';
    html += '<div class="tdb-elu2-vuln-kpi tdb-elu2-vuln-kpi--ref">';
    html += '<span class="tdb-elu2-vuln-kpi__val-inline">' + escHtml(kpiRefVal) + '\u00a0' + escHtml(unite) + '</span>';
    html += '<span class="tdb-elu2-vuln-kpi__label">' + escHtml(refSubLabel) + renderInfobulle('VULN_' + P + '_REF') + '</span>';
    html += '</div>';
    html += '</div>';

    // Graphique barres + ligne
    html += '<div class="tdb-elu2-vuln-mensuel-card__chart">';
    html += '<canvas id="chart-v2-vuln-' + prefix + '-mensuel" data-chart-v2="vuln-' + prefix + '-mensuel"></canvas>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  // ══ Suivi des arrêtés sécheresse ══
  function renderVulnSecheresse(t) {
    var tuN1 = t['secheresse-n1'];
    var tuEvol = t['secheresse-evol'];
    if (!tuN1 && !tuEvol) return '';

    var html = '<div class="tdb-elu2-card tdb-elu2-vuln-risque-card">';
    html += '<h3 class="tdb-elu2-vuln-risque-card__title"><i class="ph ph-sun-dim"></i> Suivi des arr\u00eat\u00e9s s\u00e9cheresse' + renderInfobulle('VULN_SECH_PIE_N1') + '</h3>';

    html += '<div class="tdb-elu2-vuln-risque-card__body">';

    // Colonne gauche : pie chart Année N-1
    html += '<div class="tdb-elu2-vuln-risque-card__col">';
    html += '<h4 class="tdb-elu2-vuln-risque-card__subtitle">Ann\u00e9e N-1</h4>';
    html += '<div class="tdb-elu2-vuln-risque-card__chart-wrap">';
    html += '<canvas id="chart-v2-vuln-sech-pie" data-chart-v2="vuln-sech-pie"></canvas>';
    html += '</div>';
    html += '</div>';

    // Colonne droite : stacked bar évolution annuelle
    html += '<div class="tdb-elu2-vuln-risque-card__col tdb-elu2-vuln-risque-card__col--wide">';
    html += '<h4 class="tdb-elu2-vuln-risque-card__subtitle">\u00c9volution annuelle</h4>';
    html += '<div class="tdb-elu2-vuln-risque-card__chart-wrap">';
    html += '<canvas id="chart-v2-vuln-sech-evol" data-chart-v2="vuln-sech-evol"></canvas>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // body

    // Lien Vigi'Eau
    if (tuEvol && tuEvol.lienExterne) {
      html += '<div class="tdb-elu2-vuln-risque-card__link">';
      html += '<a href="' + escHtml(tuEvol.lienExterne.url) + '" target="_blank" rel="noopener">';
      html += '<i class="ph ' + escHtml(tuEvol.lienExterne.icon) + '"></i> ' + escHtml(tuEvol.lienExterne.label);
      html += '</a></div>';
    }
    html += '</div>';
    return html;
  }

  // ══ Étiages et écoulements ══
  function renderVulnEtiages(t) {
    var tuN1 = t['etiages-n1'];
    var tuEvol = t['etiages-evol'];
    if (!tuN1 && !tuEvol) return '';

    var html = '<div class="tdb-elu2-card tdb-elu2-vuln-risque-card">';
    html += '<h3 class="tdb-elu2-vuln-risque-card__title"><i class="ph ph-waves"></i> \u00c9volution des \u00e9tiages et modalit\u00e9s d\u2019\u00e9coulements d\u2019eau observ\u00e9s' + renderInfobulle('VULN_ETIAGE_N1') + '</h3>';

    html += '<div class="tdb-elu2-vuln-risque-card__body">';

    // Colonne gauche : camembert Année N-1
    html += '<div class="tdb-elu2-vuln-risque-card__col">';
    html += '<h4 class="tdb-elu2-vuln-risque-card__subtitle">Ann\u00e9e N-1</h4>';
    html += '<div class="tdb-elu2-vuln-risque-card__chart-wrap">';
    html += '<canvas id="chart-v2-vuln-etiage-n1" data-chart-v2="vuln-etiage-n1"></canvas>';
    html += '</div>';
    html += '</div>';

    // Colonne droite : stacked bar évolution annuelle
    html += '<div class="tdb-elu2-vuln-risque-card__col tdb-elu2-vuln-risque-card__col--wide">';
    html += '<h4 class="tdb-elu2-vuln-risque-card__subtitle">\u00c9volution annuelle</h4>';
    html += '<div class="tdb-elu2-vuln-risque-card__chart-wrap">';
    html += '<canvas id="chart-v2-vuln-etiage-evol" data-chart-v2="vuln-etiage-evol"></canvas>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // body

    // Lien ONDE
    if (tuEvol && tuEvol.lienExterne) {
      html += '<div class="tdb-elu2-vuln-risque-card__link">';
      html += '<a href="' + escHtml(tuEvol.lienExterne.url) + '" target="_blank" rel="noopener">';
      html += '<i class="ph ' + escHtml(tuEvol.lienExterne.icon) + '"></i> ' + escHtml(tuEvol.lienExterne.label);
      html += '</a></div>';
    }
    html += '</div>';
    return html;
  }

  // ══ Suivi des arrêtés de catastrophes naturelles (CatNat) ══
  function renderVulnCatNat(t) {
    var tuN1 = t['catnat-n1'];
    var tuEvol = t['catnat-evol'];
    if (!tuN1 && !tuEvol) return '';

    var html = '<div class="tdb-elu2-card tdb-elu2-vuln-risque-card">';
    html += '<h3 class="tdb-elu2-vuln-risque-card__title"><i class="ph ph-warning-diamond"></i> Suivi des arr\u00eat\u00e9s de catastrophes naturelles (CatNat)' + renderInfobulle('VULN_CATNAT_PIE_N1') + '</h3>';

    html += '<div class="tdb-elu2-vuln-risque-card__body">';

    // Colonne gauche : pie chart Année N-1
    html += '<div class="tdb-elu2-vuln-risque-card__col">';
    html += '<h4 class="tdb-elu2-vuln-risque-card__subtitle">Ann\u00e9e N-1</h4>';
    html += '<div class="tdb-elu2-vuln-risque-card__chart-wrap">';
    html += '<canvas id="chart-v2-vuln-catnat-pie" data-chart-v2="vuln-catnat-pie"></canvas>';
    html += '</div>';
    html += '</div>';

    // Colonne droite : stacked bar évolution annuelle
    html += '<div class="tdb-elu2-vuln-risque-card__col tdb-elu2-vuln-risque-card__col--wide">';
    html += '<h4 class="tdb-elu2-vuln-risque-card__subtitle">\u00c9volution annuelle</h4>';
    html += '<div class="tdb-elu2-vuln-risque-card__chart-wrap">';
    html += '<canvas id="chart-v2-vuln-catnat-evol" data-chart-v2="vuln-catnat-evol"></canvas>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // body

    // Lien Géorisques
    if (tuEvol && tuEvol.lienExterne) {
      html += '<div class="tdb-elu2-vuln-risque-card__link">';
      html += '<a href="' + escHtml(tuEvol.lienExterne.url) + '" target="_blank" rel="noopener">';
      html += '<i class="ph ' + escHtml(tuEvol.lienExterne.icon) + '"></i> ' + escHtml(tuEvol.lienExterne.label);
      html += '</a></div>';
    }
    html += '</div>';
    return html;
  }

  // ══ CHARTS : Initialisation de tous les graphiques Vulnérabilité ══
  function initVulnerabiliteCharts() {
    if (typeof Chart === 'undefined') return;
    bindVulnToggle();
    createVulnSurplusChart('temp');
    createVulnSurplusChart('precip');
    createVulnMensuelChart('temp');
    createVulnMensuelChart('precip');
    createVulnSechPie();
    createVulnSechEvol();
    createVulnEtiageN1();
    createVulnEtiageEvol();
    createVulnCatNatPie();
    createVulnCatNatEvol();
  }

  // ── Toggle Annuel / Mensuel ──
  function bindVulnToggle() {
    var btns = document.querySelectorAll('.tdb-elu2-vuln-toggle__btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var view = btn.dataset.vulnView;
        if (view === vulnActiveView) return;
        vulnActiveView = view;
        btns.forEach(function(b) {
          var on = b.dataset.vulnView === view;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (window.a11yAnnounce) window.a11yAnnounce('Vue ' + (view === 'annuel' ? 'annuelle' : 'mensuelle') + ' affich\u00e9e');
        var panels = document.querySelectorAll('.tdb-elu2-vuln-view');
        panels.forEach(function(p) { p.classList.toggle('is-active', p.dataset.vulnPanel === view); });
        // Re-render charts for the newly visible panel
        destroyVulnCharts();
        initVulnerabiliteCharts();
      });
    });
  }

  // ── Graphique Surplus/Déficit — axe Y = valeurs réelles, barres partent de la référence ──
  // Les values sont des valeurs absolues (ex: 10.4°C, 810mm).
  // L'axe Y affiche les températures / précipitations réelles.
  // Les barres partent de la ligne de référence (10.1°C / 780mm)
  // vers le haut (rouge) ou vers le bas (bleu).
  // Chart.js "floating bars" : data = [[refValue, value], …]
  // Régression linéaire (moindres carrés) sur une série annuelle régulière :
  // pente par pas (= par an) + valeurs de la droite pour chaque point
  function linearTrend(values) {
    var n = values.length;
    if (n < 2) return null;
    var sx = 0, sy = 0, sxy = 0, sxx = 0;
    for (var i = 0; i < n; i++) {
      sx += i; sy += values[i]; sxy += i * values[i]; sxx += i * i;
    }
    var slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    var intercept = (sy - slope * sx) / n;
    var points = values.map(function(v, j) { return Math.round((intercept + slope * j) * 1000) / 1000; });
    return { slope: slope, points: points };
  }

  function createVulnSurplusChart(prefix) {
    var canvas = document.getElementById('chart-v2-vuln-' + prefix + '-surplus');
    if (!canvas) return;
    var tuZone = prefix === 'temp' ? 'temp-annuelle' : 'precip-annuelle';
    var tu = findTuile('vulnerabilite', tuZone);
    if (!tu) return;
    var surplusInd = tu.indicateurs.find(function(i) { return i.graphType === 'bar_surplus'; });
    if (!surplusInd || !surplusInd.fakeChartData) return;
    var cd = surplusInd.fakeChartData;

    // Récupérer la valeur de référence depuis le KPI REF de la même tuile
    var P = prefix.toUpperCase();
    var refInd = tu.indicateurs.find(function(i) { return i.id === 'VULN_' + P + '_REF'; });
    var refValue = refInd ? parseFloat(refInd.fakeValue) : 0;

    // Barres partant de 0 ; couleur selon la comparaison à la référence
    var floatingData = cd.values.slice();
    var bgColors = cd.values.map(function(v) { return v >= refValue ? 'rgba(244,67,54,0.7)' : 'rgba(21,101,192,0.7)'; });
    var borderColors = cd.values.map(function(v) { return v >= refValue ? '#F44336' : '#1565C0'; });
    var unitSuffix = prefix === 'temp' ? ' \u00b0C' : ' mm';

    // Axe Y partant de 0 (0 °C / 0 mm), avec ~10 % de marge au-dessus du max
    var dataMax = Math.max.apply(null, cd.values.concat([refValue]));
    var yMin = 0;
    var yMax = dataMax * 1.1;

    var size = 320;
    canvas.style.width = '100%';
    canvas.style.height = size + 'px';
    canvas.width = canvas.parentElement.offsetWidth || 500;
    canvas.height = size;

    // Étiquette « Réf. » placée sur l'axe Y : on mesure sa largeur pour réserver la place
    var refLabelText = 'R\u00e9f. ' + refValue + unitSuffix;
    var REF_LABEL_FONT = 'bold 11px Satoshi, sans-serif';
    var measureCtx = canvas.getContext('2d');
    measureCtx.save();
    measureCtx.font = REF_LABEL_FONT;
    var refLabelMinAxisW = Math.ceil(measureCtx.measureText(refLabelText).width) + 14 + 5 + 4;
    measureCtx.restore();

    var datasets = [{
      label: prefix === 'temp' ? 'Température moyenne annuelle' : 'Précipitations annuelles',
      data: floatingData,
      backgroundColor: bgColors,
      borderColor: borderColors,
      borderWidth: 1,
      barPercentage: 0.85,
      categoryPercentage: 0.9,
      order: 2
    }];

    // Températures : droite de tendance (régression linéaire, pente en °C/an)
    var trend = prefix === 'temp' ? linearTrend(cd.values) : null;
    if (trend) {
      var slopeTxt = (trend.slope >= 0 ? '+' : '') + trend.slope.toFixed(3).replace('.', ',');
      datasets.push({
        type: 'line',
        label: 'Tendance : ' + slopeTxt + ' °C/an',
        isTrend: true,
        data: trend.points,
        borderColor: '#B0003A',
        backgroundColor: '#B0003A',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: false,
        order: 1
      });
    }

    vulnChartInstances.push(new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: cd.labels,
        datasets: datasets
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: !!trend,
            position: 'top',
            align: 'end',
            labels: {
              filter: function(item, data) { return !!data.datasets[item.datasetIndex].isTrend; },
              boxWidth: 22,
              boxHeight: 2,
              color: '#1a2332',
              font: { size: 11, weight: 'bold' }
            }
          },
          tooltip: {
            callbacks: {
              title: function(items) { return items[0].label; },
              label: function(ctx) {
                if (ctx.dataset.isTrend) {
                  return 'Tendance : ' + (Math.round(ctx.raw * 10) / 10) + unitSuffix;
                }
                var val = Array.isArray(ctx.raw) ? ctx.raw[1] : ctx.raw;
                var ecart = Math.round((val - refValue) * 100) / 100;
                return val + unitSuffix + ' (' + (ecart >= 0 ? '+' : '') + ecart + unitSuffix + ')';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 90,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 18,
              font: { size: 10 }
            }
          },
          y: {
            min: yMin,
            suggestedMax: yMax,
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,.08)' },
            // Axe assez large pour accueillir l'étiquette « Réf. »
            afterFit: function(scale) {
              if (scale.width < refLabelMinAxisW) scale.width = refLabelMinAxisW;
            },
            ticks: {
              font: { size: 11 },
              callback: function(v) {
                // Arrondir pour éviter les décimales parasites
                var rounded = Math.round(v * 10) / 10;
                return rounded + unitSuffix;
              }
            }
          }
        }
      },
      plugins: [{
        id: 'refLine',
        afterDatasetsDraw: function(chart) {
          var yScale = chart.scales.y;
          var yPixel = yScale.getPixelForValue(refValue);
          var ctx = chart.ctx;
          ctx.save();
          // Ligne en pointillé
          ctx.beginPath();
          ctx.moveTo(chart.chartArea.left, yPixel);
          ctx.lineTo(chart.chartArea.right, yPixel);
          ctx.strokeStyle = '#455A64';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Étiquette de référence : à gauche de l'axe Y, par-dessus les graduations,
          // centrée verticalement sur la ligne en pointillé, avec une pointe vers la ligne
          var label = refLabelText;
          ctx.font = REF_LABEL_FONT;
          var textW = ctx.measureText(label).width;
          var padH = 7;
          var bubbleW = textW + padH * 2;
          var bubbleH = 20;
          var arrowSize = 5;
          var bubbleRight = chart.chartArea.left - arrowSize - 1; // la pointe touche l'axe
          var bubbleX = Math.max(1, bubbleRight - bubbleW);
          var bubbleY = yPixel - bubbleH / 2;
          var rr = 4;

          ctx.fillStyle = '#455A64';
          ctx.beginPath();
          ctx.moveTo(bubbleX + rr, bubbleY);
          ctx.lineTo(bubbleX + bubbleW - rr, bubbleY);
          ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + rr);
          // Pointe vers la droite (vers la ligne de référence)
          ctx.lineTo(bubbleX + bubbleW, yPixel - arrowSize);
          ctx.lineTo(bubbleX + bubbleW + arrowSize, yPixel);
          ctx.lineTo(bubbleX + bubbleW, yPixel + arrowSize);
          ctx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - rr);
          ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX + bubbleW - rr, bubbleY + bubbleH);
          ctx.lineTo(bubbleX + rr, bubbleY + bubbleH);
          ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH - rr);
          ctx.lineTo(bubbleX, bubbleY + rr);
          ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + rr, bubbleY);
          ctx.closePath();
          ctx.fill();

          // Texte dans la bulle
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, bubbleX + bubbleW / 2, bubbleY + bubbleH / 2);
          ctx.restore();
        }
      }]
    }));
  }

  // ── Graphique Mensuel : barres (N-1) + ligne (référence) ──
  function createVulnMensuelChart(prefix) {
    var canvas = document.getElementById('chart-v2-vuln-' + prefix + '-mensuel');
    if (!canvas) return;
    var tuZone = prefix === 'temp' ? 'temp-mensuelle' : 'precip-mensuelle';
    var tu = findTuile('vulnerabilite', tuZone);
    if (!tu) return;
    var indMens = tu.indicateurs[0];
    if (!indMens || !indMens.fakeChartData) return;
    var cd = indMens.fakeChartData;

    var size = 320;
    canvas.style.width = '100%';
    canvas.style.height = size + 'px';
    canvas.width = canvas.parentElement.offsetWidth || 500;
    canvas.height = size;

    vulnChartInstances.push(new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: cd.labels,
        datasets: [
          {
            label: cd.barLabel || 'Ann\u00e9e N-1',
            data: cd.barValues,
            backgroundColor: prefix === 'temp' ? 'rgba(244,67,54,0.5)' : 'rgba(21,101,192,0.5)',
            borderColor: prefix === 'temp' ? '#F44336' : '#1565C0',
            borderWidth: 1,
            order: 2
          },
          {
            label: cd.lineLabel || 'P\u00e9riode de r\u00e9f\u00e9rence',
            data: cd.lineValues,
            type: 'line',
            borderColor: '#455A64',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#455A64',
            tension: 0.3,
            order: 1
          }
        ]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { usePointStyle: true, padding: 12, font: { size: 12 } }
          },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(0,0,0,.08)' },
            ticks: { callback: function(v) { return v + (prefix === 'temp' ? ' \u00b0C' : ' mm'); } }
          }
        }
      }
    }));
  }

  // ── Pie chart sécheresse N-1 ──
  function createVulnSechPie() {
    var canvas = document.getElementById('chart-v2-vuln-sech-pie');
    if (!canvas) return;
    var tu = findTuile('vulnerabilite', 'secheresse-n1');
    if (!tu) return;
    var indPie = tu.indicateurs[0];
    if (!indPie || !indPie.fakeChartData) return;
    var cd = indPie.fakeChartData;

    // Territory override for pie data
    var pieValues = cd.values;
    if (currentTerritoire && currentTerritoire.data && currentTerritoire.data.ind && currentTerritoire.data.ind.VULN_SECH_PIE) {
      pieValues = currentTerritoire.data.ind.VULN_SECH_PIE;
    }

    var sz = 220;
    canvas.style.width = sz + 'px';
    canvas.style.height = sz + 'px';
    canvas.width = sz;
    canvas.height = sz;

    vulnChartInstances.push(new Chart(canvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels: cd.labels,
        datasets: [{ data: pieValues, backgroundColor: cd.colors, borderWidth: 2, borderColor: '#fff' }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 10, font: { size: 12 } } },
          tooltip: { callbacks: { label: function(ctx) { return ctx.label + ' : ' + ctx.raw + ' %'; } } }
        }
      }
    }));
  }

  // ── Stacked bar sécheresse évolution ──
  function createVulnSechEvol() {
    var canvas = document.getElementById('chart-v2-vuln-sech-evol');
    if (!canvas) return;
    var tu = findTuile('vulnerabilite', 'secheresse-evol');
    if (!tu) return;
    var indEvol = tu.indicateurs[0];
    if (!indEvol || !indEvol.fakeChartData) return;
    var cd = indEvol.fakeChartData;

    var sz = 280;
    canvas.style.width = '100%';
    canvas.style.height = sz + 'px';
    canvas.width = canvas.parentElement.offsetWidth || 500;
    canvas.height = sz;

    var datasets = cd.datasets.map(function(ds) {
      return { label: ds.label, data: ds.data, backgroundColor: ds.color, borderColor: ds.color, borderWidth: 1 };
    });

    vulnChartInstances.push(new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: cd.labels, datasets: datasets },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 10, font: { size: 12 } } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, grid: { color: 'rgba(0,0,0,.08)' } }
        }
      }
    }));
  }

  // ── Stacked bar 100% étiages N-1 (France vs Grand Est) ──
  function createVulnEtiageN1() {
    var canvas = document.getElementById('chart-v2-vuln-etiage-n1');
    if (!canvas) return;
    var tu = findTuile('vulnerabilite', 'etiages-n1');
    if (!tu) return;
    var ind = tu.indicateurs[0];
    if (!ind || !ind.fakeChartData) return;
    var cd = ind.fakeChartData;

    // Territory override for pie values
    var pieValues = cd.values.slice();
    if (currentTerritoire && currentTerritoire.data && currentTerritoire.data.ind) {
      var di = currentTerritoire.data.ind;
      if (di.VULN_ETIAGE_N1_VIS !== undefined) pieValues[0] = di.VULN_ETIAGE_N1_VIS;
      if (di.VULN_ETIAGE_N1_NV !== undefined)  pieValues[1] = di.VULN_ETIAGE_N1_NV;
      if (di.VULN_ETIAGE_N1_AS !== undefined)  pieValues[2] = di.VULN_ETIAGE_N1_AS;
    }

    var sz = 220;
    canvas.style.width = sz + 'px';
    canvas.style.height = sz + 'px';
    canvas.width = sz;
    canvas.height = sz;

    vulnChartInstances.push(new Chart(canvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels: cd.labels,
        datasets: [{ data: pieValues, backgroundColor: cd.colors, borderWidth: 2, borderColor: '#fff' }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 10, font: { size: 12 } } },
          tooltip: { callbacks: { label: function(ctx) { return ctx.label + ' : ' + ctx.raw + ' %'; } } }
        }
      }
    }));
  }

  // ── Stacked bar étiages évolution ──
  function createVulnEtiageEvol() {
    var canvas = document.getElementById('chart-v2-vuln-etiage-evol');
    if (!canvas) return;
    var tu = findTuile('vulnerabilite', 'etiages-evol');
    if (!tu) return;
    var indEvol = tu.indicateurs[0];
    if (!indEvol || !indEvol.fakeChartData) return;
    var cd = indEvol.fakeChartData;

    var sz = 280;
    canvas.style.width = '100%';
    canvas.style.height = sz + 'px';
    canvas.width = canvas.parentElement.offsetWidth || 500;
    canvas.height = sz;

    var datasets = cd.datasets.map(function(ds) {
      return { label: ds.label, data: ds.data, backgroundColor: ds.color, borderColor: ds.color, borderWidth: 1 };
    });

    vulnChartInstances.push(new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: cd.labels, datasets: datasets },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 10, font: { size: 12 } } },
          tooltip: { mode: 'index', intersect: false, callbacks: { label: function(ctx) { return ctx.dataset.label + ' : ' + ctx.raw + ' %'; } } }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, max: 100, grid: { color: 'rgba(0,0,0,.08)' }, ticks: { callback: function(v) { return v + '%'; } } }
        }
      }
    }));
  }

  // ── Pie CatNat Année N-1 ──
  function createVulnCatNatPie() {
    var canvas = document.getElementById('chart-v2-vuln-catnat-pie');
    if (!canvas) return;
    var tu = findTuile('vulnerabilite', 'catnat-n1');
    if (!tu) return;
    var indPie = tu.indicateurs[0];
    if (!indPie || !indPie.fakeChartData) return;
    var cd = indPie.fakeChartData;

    var sz = 220;
    canvas.style.width = sz + 'px';
    canvas.style.height = sz + 'px';
    canvas.width = sz;
    canvas.height = sz;

    vulnChartInstances.push(new Chart(canvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels: cd.labels,
        datasets: [{ data: cd.values, backgroundColor: cd.colors, borderWidth: 2, borderColor: '#fff' }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 10, font: { size: 12 } } },
          tooltip: { callbacks: { label: function(ctx) { return ctx.label + ' : ' + ctx.raw + ' %'; } } }
        }
      }
    }));
  }

  // ── Stacked bar CatNat évolution annuelle ──
  function createVulnCatNatEvol() {
    var canvas = document.getElementById('chart-v2-vuln-catnat-evol');
    if (!canvas) return;
    var tu = findTuile('vulnerabilite', 'catnat-evol');
    if (!tu) return;
    var indEvol = tu.indicateurs[0];
    if (!indEvol || !indEvol.fakeChartData) return;
    var cd = indEvol.fakeChartData;

    var sz = 280;
    canvas.style.width = '100%';
    canvas.style.height = sz + 'px';
    canvas.width = canvas.parentElement.offsetWidth || 500;
    canvas.height = sz;

    var datasets = cd.datasets.map(function(ds) {
      return { label: ds.label, data: ds.data, backgroundColor: ds.color, borderColor: ds.color, borderWidth: 1 };
    });

    vulnChartInstances.push(new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: cd.labels, datasets: datasets },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 10, font: { size: 12 } } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, grid: { color: 'rgba(0,0,0,.08)' } }
        }
      }
    }));
  }

})();
