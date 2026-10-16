/**
 * tableau-de-bord.js
 * Logique du gabarit "Mon tableau de bord" – Observatoire de l'Eau Grand Est
 *
 * Dépendances : jQuery 3, Bootstrap 5, Chart.js, OpenLayers 9, data-indicateurs.js
 *
 * SOMMAIRE
 *  1.  État global du tableau de bord
 *  2.  Initialisation des sélecteurs (échelle / territoire / année)
 *  3.  Rendu initial de la grille de widgets
 *  4.  Mise à jour dynamique des widgets (sans reconstruire le DOM)
 *  5.  Widget KPI
 *  6.  Widget Jauge (gauge demi-cercle)
 *  7.  Widget Graphique en barres
 *  8.  Widget Graphique en courbes
 *  9.  Widget Graphique en donut
 *  10. Widget Mini-carte OpenLayers
 *  11. Widget Liste de progression
 *  12. Widget Heatmap bar
 *  13. Helpers & utilitaires
 *  14. Initialisation (DOMContentLoaded)
 */

// ============================================================
// 1. ÉTAT GLOBAL
// ============================================================

var dashboard = {
  echelle:          'Département',
  territoireValeur: 'Ardennes (08)',
  annee:             2023,
  theme:            'gouvernance',   // ← thème actif (gouvernance / amenagement / ressources / vulnerabilite)
  chartsInstances:  {},
  minimap:          null,
  minimapFeatures:  null
};

// Lecture des paramètres URL (injectés par le script inline dans le HTML)
(function() {
  var p = window.__TDB_PARAMS || {};
  if (p.echelle    && TERRITOIRES[p.echelle])   dashboard.echelle = p.echelle;
  if (p.territoire) dashboard.territoireValeur = p.territoire;
  if (p.annee)      dashboard.annee            = p.annee;
})();

// ============================================================
// 1b. CHANGEMENT DE THÈME (appelé par les onglets)
// ============================================================

/**
 * Appelée depuis tableau-de-bord.html quand on clique sur un onglet.
 * Met à jour le thème actif et recharge la grille de widgets.
 */
function changerThemeTdb(themeId) {
  dashboard.theme = themeId;
  rendreGrilleWidgets();
}
// ============================================================

function initialiserSelecteursTdb() {

  // ── Sélecteur Échelle ────────────────────────────────────
  var $selEchelle = $('#tdb-select-echelle');
  $selEchelle.empty();

  var echelles = Object.keys(TERRITOIRES);
  echelles.forEach(function(e) {
    var label = e;
    // Indiquer que les communes sont en cours de chargement
    if (e === 'Commune' && TERRITOIRES[e].length === 0) {
      label = 'Commune (chargement…)';
    }
    $selEchelle.append($('<option>').val(e).text(label));
  });
  $selEchelle.val(dashboard.echelle);

  $selEchelle.on('change', function() {
    dashboard.echelle = $(this).val();
    remplirSelecteurTerritoire(dashboard.echelle);
    mettreAJourTout();
  });

  // ── Sélecteur Territoire ─────────────────────────────────
  remplirSelecteurTerritoire(dashboard.echelle, dashboard.territoireValeur);

  $('#tdb-select-territoire').on('change', function() {
    dashboard.territoireValeur = $(this).val();
    mettreAJourIntroTdb();
    mettreAJourTout();
  });

  // ── Sélecteur Année ──────────────────────────────────────
  var $selAnnee = $('#tdb-select-annee');
  $selAnnee.empty();
  ANNEES.forEach(function(a) {
    var $opt = $('<option>').val(a).text(a);
    if (a === dashboard.annee) $opt.attr('selected', true);
    $selAnnee.append($opt);
  });

  $selAnnee.on('change', function() {
    dashboard.annee = parseInt($(this).val(), 10);
    mettreAJourIntroTdb();
    mettreAJourTout();
  });

  // ── Quand les communes sont chargées, mettre à jour le label de l'option ──
  document.addEventListener('communes:loaded', function(evt) {
    var count = evt.detail && evt.detail.count ? evt.detail.count : 0;
    $('#tdb-select-echelle option[value="Commune"]').text('Commune (' + count + ')');
    // Si l'échelle courante est Commune, rafraîchir le sélecteur
    if (dashboard.echelle === 'Commune') {
      remplirSelecteurTerritoire('Commune', dashboard.territoireValeur);
    }
  });
}

function remplirSelecteurTerritoire(echelle, territoireDefaut) {
  var $sel = $('#tdb-select-territoire');
  $sel.empty();
  var liste = TERRITOIRES[echelle] || [];
  liste.forEach(function(nom) {
    $sel.append($('<option>').val(nom).text(nom));
  });
  // Pré-sélectionner si fourni et dans la liste
  if (territoireDefaut && liste.indexOf(territoireDefaut) !== -1) {
    $sel.val(territoireDefaut);
    dashboard.territoireValeur = territoireDefaut;
  } else {
    dashboard.territoireValeur = liste[0] || '';
  }
  mettreAJourIntroTdb();
}

function mettreAJourIntroTdb() {
  var label = dashboard.territoireValeur || 'Grand Est';
  $('#tdb-intro-territoire').text(label);
  $('#tdb-intro-annee').text(dashboard.annee);
  // Synchroniser le territoire dans les panneaux thématiques
  $('.js-theme-territoire').text(label);
  // Mettre à jour tous les footers de widgets
  $('.widget__footer-info.js-footer-lieu').each(function() {
    $(this).html('<i class="fa fa-map-marker-alt"></i> ' + (dashboard.territoireValeur || 'Grand Est'));
  });
  $('.widget__footer-info.js-footer-annee').each(function() {
    $(this).html('<i class="fa fa-calendar-days"></i> Données ' + dashboard.annee);
  });
}

// ============================================================
// 3. RENDU INITIAL DE LA GRILLE DE WIDGETS
// ============================================================

function rendreGrilleWidgets() {
  var $grille = $('#dashboard-grille');
  $grille.empty();

  // Détruire instances Chart.js existantes
  Object.values(dashboard.chartsInstances).forEach(function(chart) {
    if (chart && typeof chart.destroy === 'function') chart.destroy();
  });
  dashboard.chartsInstances = {};

  // Détruire mini-carte si elle existe
  if (dashboard.minimap) {
    dashboard.minimap.setTarget(null);
    dashboard.minimap = null;
    dashboard.minimapFeatures = null;
  }

  // Filtrer les widgets selon le thème actif
  var widgetsDuTheme = INDICATEURS_DASHBOARD.filter(function(ind) {
    return !ind.theme || ind.theme === dashboard.theme;
  });

  // Construire les widgets
  widgetsDuTheme.forEach(function(ind) {
    $grille.append(construireWidgetHTML(ind));
  });

  // Initialiser les widgets après insertion DOM
  setTimeout(function() {
    widgetsDuTheme.forEach(function(ind) {
      var data = getDataWidget(ind, dashboard.territoireValeur, dashboard.annee, dashboard.echelle);
      switch (ind.widget_type) {
        case 'gauge':         initialiserWidgetGauge(ind, data);      break;
        case 'kpi':           initialiserWidgetKpi(ind, data);        break;
        case 'bar':           initialiserWidgetBar(ind, data);        break;
        case 'line':          initialiserWidgetLine(ind, data);       break;
        case 'donut':         initialiserWidgetDonut(ind, data);      break;
        case 'minimap':       initialiserWidgetMinimap(ind, data);    break;
        case 'progress_list': initialiserWidgetProgress(ind, data);   break;
        case 'heatmap_bar':   initialiserWidgetHeatmap(ind, data);    break;
      }
    });
  }, 60);
}

/**
 * Construit le squelette HTML d'un widget.
 */
function construireWidgetHTML(ind) {
  var $widget = $('<div>')
    .addClass('widget widget--' + ind.widget_type)
    .attr('id', 'widget-' + ind.id)
    .css('--widget-accent-color', ind.couleur);

  // Header
  var $header = $('<div>').addClass('widget__header');
  var $icone  = $('<div>').addClass('widget__icone').css('background-color', ind.couleur)
                  .html('<i class="fa ' + ind.icone + '"></i>');
  var $titre  = $('<h3>').addClass('widget__titre').text(ind.nom);
  var $badge  = $('<span>').addClass('widget__badge-thematique')
                  .text(ind.thematique)
                  .css({ 'background-color': hexToRgbaCss(ind.couleur, 0.12), 'color': ind.couleur });
  var $actions = $('<div>').addClass('widget__actions').append(
    $('<button>').addClass('widget__action-btn').attr('title','Agrandir').html('<i class="fa fa-expand"></i>'),
    $('<button>').addClass('widget__action-btn').attr('title','Exporter').html('<i class="fa fa-download"></i>'),
    $('<button>').addClass('widget__action-btn').attr('title','Informations').html('<i class="fa fa-circle-info"></i>')
  );
  $header.append($icone, $titre, $badge, $actions);

  // Body
  var $body = $('<div>').addClass('widget__body').attr('id', 'widget-body-' + ind.id);

  // Footer
  var $footer = $('<div>').addClass('widget__footer');
  $footer.append(
    $('<span>').addClass('widget__footer-info js-footer-annee')
      .html('<i class="fa fa-calendar-days"></i> Données ' + dashboard.annee),
    $('<span>').addClass('widget__footer-info js-footer-lieu')
      .html('<i class="fa fa-map-marker-alt"></i> ' + (dashboard.territoireValeur || 'Grand Est'))
  );

  $widget.append($header, $body, $footer);
  return $widget;
}

// ============================================================
// 4. MISE À JOUR DYNAMIQUE (sans reconstruire le DOM)
// ============================================================

/**
 * Appelée à chaque changement d'échelle, territoire ou année.
 * Met à jour les données de chaque widget avec une animation flash.
 */
function mettreAJourTout() {

  INDICATEURS_DASHBOARD.forEach(function(ind) {
    var data = getDataWidget(ind, dashboard.territoireValeur, dashboard.annee, dashboard.echelle);

    // Effet flash sur le widget
    var $widget = $('#widget-' + ind.id);
    $widget.addClass('widget--updating');
    setTimeout(function() { $widget.removeClass('widget--updating'); }, 400);

    switch (ind.widget_type) {
      case 'gauge':         mettreAJourGauge(ind, data);      break;
      case 'kpi':           mettreAJourKpi(ind, data);        break;
      case 'bar':           mettreAJourBar(ind, data);        break;
      case 'line':          mettreAJourLine(ind, data);       break;
      case 'donut':         mettreAJourDonut(ind, data);      break;
      case 'minimap':       mettreAJourMinimap(ind, data);    break;
      case 'progress_list': mettreAJourProgress(ind, data);   break;
      case 'heatmap_bar':   mettreAJourHeatmap(ind, data);    break;
    }
  });

  mettreAJourIntroTdb();
}

// ============================================================
// 5. WIDGET KPI
// ============================================================

function initialiserWidgetKpi(ind, data) {
  var $body = $('#widget-body-' + ind.id);
  $body.empty();
  $body.html(htmlKpi(ind, data));
}

function mettreAJourKpi(ind, data) {
  var $body = $('#widget-body-' + ind.id);
  // Animation compteur
  var valeurCible = data.valeur_affichee !== undefined ? data.valeur_affichee : data.valeur;
  animerCompteur($body.find('.widget-kpi__valeur-principale'), valeurCible, ind.unite);
  // Évolution
  $body.find('.widget-kpi__evolution')
    .removeClass('widget-kpi__evolution--hausse widget-kpi__evolution--baisse')
    .addClass(data.evolution && data.evolution.indexOf('+') === 0
      ? 'widget-kpi__evolution--hausse' : 'widget-kpi__evolution--baisse')
    .html('<i class="fa ' + (data.evolution && data.evolution.indexOf('+') === 0
      ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down') + '"></i> '
      + (data.evolution || '–') + ' vs année préc.');
  // Description
  $body.find('.widget-kpi__description').text(ind.nom + ' pour ' + (dashboard.territoireValeur || 'Grand Est'));
}

function htmlKpi(ind, data) {
  var valeurAff = data.valeur_affichee !== undefined ? data.valeur_affichee : data.valeur;
  var uniteAff  = data.unite_affichee  || ind.unite;
  var isHausse  = data.evolution && data.evolution.indexOf('+') === 0;
  return '<div>' +
    '<span class="widget-kpi__valeur-principale" style="color:' + ind.couleur + '">' + valeurAff + '</span>' +
    '<span class="widget-kpi__unite">' + uniteAff + '</span>' +
  '</div>' +
  (data.evolution
    ? '<span class="widget-kpi__evolution ' + (isHausse ? 'widget-kpi__evolution--hausse' : 'widget-kpi__evolution--baisse') + '">' +
        '<i class="fa ' + (isHausse ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down') + '"></i> ' +
        data.evolution + ' vs année préc.' +
      '</span>'
    : '') +
  '<p class="widget-kpi__description">' + ind.nom + ' pour ' + (dashboard.territoireValeur || 'Grand Est') + '</p>';
}

// ============================================================
// 6. WIDGET JAUGE (gauge demi-cercle)
// ============================================================

function initialiserWidgetGauge(ind, data) {
  var $body    = $('#widget-body-' + ind.id);
  var canvasId = 'canvas-gauge-' + ind.id;
  $body.css({ 'align-items': 'center', 'gap': '12px' });
  $body.html(
    '<div class="widget-gauge__container">' +
      '<canvas id="' + canvasId + '" class="widget-gauge__canvas" width="160" height="100" role="img" aria-label="' + ind.nom + ' : ' + data.valeur + ' ' + ind.unite + '"></canvas>' +
      '<div class="widget-gauge__valeur-centre">' +
        '<span class="widget-gauge__nombre" style="color:' + ind.couleur + '">' + data.valeur + '</span>' +
        '<span class="widget-gauge__label">' + ind.unite + '</span>' +
      '</div>' +
    '</div>' +
    '<p class="text-muted text-small text-center" style="max-width:160px;">' + ind.nom + '</p>'
  );

  var valeur = Math.min(100, Math.max(0, data.valeur));
  var ctx = document.getElementById(canvasId).getContext('2d');
  var chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [valeur, 100 - valeur],
        backgroundColor: [ind.couleur, '#EEF2F7'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: false, cutout: '72%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { animateRotate: true, duration: 900 }
    }
  });
  dashboard.chartsInstances['gauge-' + ind.id] = chart;
}

function mettreAJourGauge(ind, data) {
  var chart  = dashboard.chartsInstances['gauge-' + ind.id];
  var valeur = Math.min(100, Math.max(0, data.valeur));
  if (chart) {
    chart.data.datasets[0].data = [valeur, 100 - valeur];
    chart.update('active');
  }
  // Mise à jour du chiffre central
  var $nb = $('#widget-body-' + ind.id).find('.widget-gauge__nombre');
  animerCompteur($nb, valeur, ind.unite);
}

// ============================================================
// 7. WIDGET GRAPHIQUE EN BARRES
// ============================================================

function initialiserWidgetBar(ind, data) {
  var $body    = $('#widget-body-' + ind.id);
  var canvasId = 'canvas-bar-' + ind.id;
  $body.empty();
  var series = data.series || {};
  var labels = Object.keys(series);
  var vals   = Object.values(series);
  /* RGAA 5.1 — aria-label + tableau accessible sr-only */
  var a11yLabel = ind.nom + ' (' + ind.unite + ')';
  $body.html(
    '<div class="widget-chart__canvas-wrapper"><canvas id="' + canvasId + '" role="img" aria-label="' + a11yLabel + '"></canvas></div>' +
    genererTableA11y(a11yLabel, labels, vals, ind.unite)
  );

  var ctx = document.getElementById(canvasId).getContext('2d');
  var chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: ind.unite,
        data: vals,
        backgroundColor: ind.couleur + 'CC',
        borderColor: ind.couleur,
        borderWidth: 1.5,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(c) { return c.parsed.y + ' ' + ind.unite; } } }
      },
      scales: {
        x: { ticks: { font: { size: 9, family: 'Inter' }, color: '#6B7A99', maxRotation: 45 }, grid: { display: false } },
        y: { ticks: { font: { size: 9, family: 'Inter' }, color: '#6B7A99' }, grid: { color: '#EEF2F7' } }
      }
    }
  });
  dashboard.chartsInstances['bar-' + ind.id] = chart;
}

function mettreAJourBar(ind, data) {
  var chart  = dashboard.chartsInstances['bar-' + ind.id];
  var series = data.series || {};
  if (chart) {
    chart.data.labels = Object.keys(series);
    chart.data.datasets[0].data = Object.values(series);
    chart.update('active');
  }
}

// ============================================================
// 8. WIDGET GRAPHIQUE EN COURBES
// ============================================================

function initialiserWidgetLine(ind, data) {
  var $body    = $('#widget-body-' + ind.id);
  var canvasId = 'canvas-line-' + ind.id;
  $body.empty();
  var series = data.series || {};
  var labels = Object.keys(series);
  var vals   = Object.values(series);
  /* RGAA 5.1 — aria-label + tableau accessible sr-only */
  var a11yLabel = ind.nom + ' (' + ind.unite + ')';
  $body.html(
    '<div class="widget-chart__canvas-wrapper"><canvas id="' + canvasId + '" role="img" aria-label="' + a11yLabel + '"></canvas></div>' +
    genererTableA11y(a11yLabel, labels, vals, ind.unite)
  );

  var ctx = document.getElementById(canvasId).getContext('2d');
  var gradient = ctx.createLinearGradient(0, 0, 0, 180);
  gradient.addColorStop(0, ind.couleur + '55');
  gradient.addColorStop(1, ind.couleur + '00');

  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: ind.unite,
        data: vals,
        borderColor: ind.couleur,
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointBackgroundColor: labels.map(function(l) {
          return String(l) === String(data.annee_courante) ? '#FF6F00' : ind.couleur;
        }),
        pointRadius: labels.map(function(l) {
          return String(l) === String(data.annee_courante) ? 6 : 4;
        }),
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(c) { return c.parsed.y + ' ' + ind.unite; } } }
      },
      scales: {
        x: { ticks: { font: { size: 10, family: 'Inter' }, color: '#6B7A99' }, grid: { display: false } },
        y: { ticks: { font: { size: 10, family: 'Inter' }, color: '#6B7A99' }, grid: { color: '#EEF2F7' } }
      }
    }
  });
  dashboard.chartsInstances['line-' + ind.id] = chart;
}

function mettreAJourLine(ind, data) {
  var chart  = dashboard.chartsInstances['line-' + ind.id];
  var series = data.series || {};
  var labels = Object.keys(series);
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = Object.values(series);
    // Recolorer le point de l'année courante
    chart.data.datasets[0].pointBackgroundColor = labels.map(function(l) {
      return String(l) === String(data.annee_courante) ? '#FF6F00' : ind.couleur;
    });
    chart.data.datasets[0].pointRadius = labels.map(function(l) {
      return String(l) === String(data.annee_courante) ? 6 : 4;
    });
    chart.update('active');
  }
}

// ============================================================
// 9. WIDGET GRAPHIQUE EN DONUT
// ============================================================

function initialiserWidgetDonut(ind, data) {
  var $body    = $('#widget-body-' + ind.id);
  var canvasId = 'canvas-donut-' + ind.id;
  $body.empty();
  var series = data.series || {};
  var labels = Object.keys(series);
  var vals   = Object.values(series);
  var total  = vals.reduce(function(a, b) { return a + b; }, 0) || 1;
  /* RGAA 5.1 — aria-label + tableau accessible sr-only */
  var a11yLabel = ind.nom + ' — répartition';
  $body.html(
    '<div class="widget-chart__canvas-wrapper"><canvas id="' + canvasId + '" role="img" aria-label="' + a11yLabel + '"></canvas></div>' +
    genererTableA11y(a11yLabel, labels, vals, ind.unite)
  );
  var couleursDCE = ["#2E7D32", "#66BB6A", "#FDD835", "#FB8C00", "#E53935"];

  var ctx = document.getElementById(canvasId).getContext('2d');
  var chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: vals,
        backgroundColor: couleursDCE,
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: {
        legend: { position: 'right', labels: { font: { size: 10, family: 'Inter' }, color: '#1A2233', boxWidth: 12, padding: 8 } },
        tooltip: {
          callbacks: {
            label: function(c) {
              var pct = Math.round(c.parsed / total * 100);
              return c.label + ' : ' + c.parsed + ' (' + pct + '%)';
            }
          }
        }
      }
    }
  });
  dashboard.chartsInstances['donut-' + ind.id] = chart;
}

function mettreAJourDonut(ind, data) {
  var chart  = dashboard.chartsInstances['donut-' + ind.id];
  var series = data.series || {};
  if (chart) {
    chart.data.labels = Object.keys(series);
    chart.data.datasets[0].data = Object.values(series);
    chart.update('active');
  }
}

// ============================================================
// 10. WIDGET MINI-CARTE OPENLAYERS
// ============================================================

function initialiserWidgetMinimap(ind, data) {
  var $body     = $('#widget-body-' + ind.id);
  var minimapId = 'minimap-ol-' + ind.id;
  $body.css('padding', '0').empty();
  $body.html(
    '<div class="widget-minimap__container"><div id="' + minimapId + '" style="width:100%;height:100%;"></div></div>' +
    '<div class="widget-minimap__gradient">' +
      '<span class="widget-minimap__gradient-label">Faible</span>' +
      '<div class="widget-minimap__gradient-barre"></div>' +
      '<span class="widget-minimap__gradient-label">Élevé</span>' +
    '</div>'
  );

  // Couche de fond OSM
  var tileLayer = new ol.layer.Tile({ source: new ol.source.OSM() });

  // Source vecteur
  var vectorSource = new ol.source.Vector();
  dashboard.minimapFeatures = vectorSource;

  var vectorLayer = new ol.layer.Vector({ source: vectorSource });

  dashboard.minimap = new ol.Map({
    target: minimapId,
    layers: [tileLayer, vectorLayer],
    view: new ol.View({ center: ol.proj.fromLonLat([6.5, 48.5]), zoom: 6 }),
    controls: [],
    interactions: ol.interaction.defaults.defaults({ mouseWheelZoom: false })
  });

  // Générer les points selon les données
  rafraichirPointsMinimap(data);
}

function rafraichirPointsMinimap(data) {
  if (!dashboard.minimapFeatures) return;
  dashboard.minimapFeatures.clear();

  var nb = data.nb_points || 15;
  // Seed stable basé sur territoire + année
  var seedBase = hashTerritoire(dashboard.territoireValeur + dashboard.annee);

  for (var i = 0; i < nb; i++) {
    // Positions pseudo-aléatoires mais stables pour ce territoire/année
    var sx = hashTerritoire(dashboard.territoireValeur + dashboard.annee + 'lon' + i);
    var sy = hashTerritoire(dashboard.territoireValeur + dashboard.annee + 'lat' + i);
    var sv = hashTerritoire(dashboard.territoireValeur + dashboard.annee + 'val' + i);

    var lon = 4.8 + sx * 3.4;
    var lat = 47.4 + sy * 2.1;
    var couleur = sv < 0.33
      ? [129, 212, 250, 0.85]
      : sv < 0.66
        ? [255, 183, 77, 0.85]
        : [239, 83, 80, 0.85];

    var feature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });
    feature.setStyle(new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5 + sv * 4,
        fill: new ol.style.Fill({ color: couleur }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 1 })
      })
    }));
    dashboard.minimapFeatures.addFeature(feature);
  }
}

function mettreAJourMinimap(ind, data) {
  rafraichirPointsMinimap(data);
  // Mettre à jour la valeur affichée dans le titre si elle existe
  var $titre = $('#widget-' + ind.id + ' .widget__titre');
  if ($titre.length) {
    $titre.text(ind.nom);
  }
  // Ajouter ou mettre à jour une etiquette de valeur dans le footer
  $('#widget-' + ind.id + ' .widget__footer-info.js-footer-annee')
    .html('<i class="fa fa-calendar-days"></i> ' + dashboard.annee + ' · ' + data.valeur + ' ' + ind.unite);
}

// ============================================================
// 11. WIDGET LISTE DE PROGRESSION
// ============================================================

function initialiserWidgetProgress(ind, data) {
  var $body = $('#widget-body-' + ind.id);
  $body.css('justify-content', 'flex-start').empty();
  rendreLignesProgress($body, ind, data);
}

function mettreAJourProgress(ind, data) {
  var $body = $('#widget-body-' + ind.id);
  $body.empty();
  rendreLignesProgress($body, ind, data);
}

function rendreLignesProgress($body, ind, data) {
  var series = data.series || ind.valeurs_exemple || {};
  var labels = Object.keys(series);
  var valeurs = Object.values(series);
  var total  = valeurs.reduce(function(a, b) { return a + b; }, 0) || 1;

  labels.forEach(function(label, i) {
    var valeur = valeurs[i];
    var pct    = Math.round(valeur / total * 100);
    var $item  = $('<div>').addClass('widget-progress__item');
    $item.html(
      '<div class="widget-progress__label-row">' +
        '<span class="widget-progress__label">' + label + '</span>' +
        '<span class="widget-progress__valeur" style="color:' + ind.couleur + '">' +
          valeur + ' ' + (ind.unite || 'SAGE') +
        '</span>' +
      '</div>' +
      '<div class="widget-progress__barre-bg">' +
        '<div class="widget-progress__barre-fill" style="width:' + pct + '%;background-color:' + ind.couleur + '"></div>' +
      '</div>'
    );
    $body.append($item);
  });
}

// ============================================================
// 12. WIDGET HEATMAP BAR
// ============================================================

function initialiserWidgetHeatmap(ind, data) {
  var $body = $('#widget-body-' + ind.id);
  $body.css('justify-content', 'flex-start').empty();
  rendreLignesHeatmap($body, ind, data);
}

function mettreAJourHeatmap(ind, data) {
  var $body = $('#widget-body-' + ind.id);
  $body.empty();
  rendreLignesHeatmap($body, ind, data);
}

function rendreLignesHeatmap($body, ind, data) {
  var series     = data.series || ind.valeurs_exemple || {};
  var territoires = Object.keys(series);
  var valeurs    = Object.values(series);
  var maxVal     = Math.max.apply(null, valeurs) || 1;

  territoires.forEach(function(terr, i) {
    var valeur   = valeurs[i];
    var pct      = Math.round((valeur / maxVal) * 100);
    var ratioMax = valeur / maxVal;
    var classe   = ratioMax < 0.30 ? 'heatmap-faible'
                 : ratioMax < 0.55 ? 'heatmap-moyen'
                 : ratioMax < 0.80 ? 'heatmap-eleve'
                 : 'heatmap-critique';

    var $item = $('<div>').addClass('widget-heatmap__item');
    $item.html(
      '<span class="widget-heatmap__territoire">' + terr + '</span>' +
      '<div class="widget-heatmap__barre-bg">' +
        '<div class="widget-heatmap__barre-fill ' + classe + '" style="width:' + pct + '%"></div>' +
      '</div>' +
      '<span class="widget-heatmap__valeur">' + valeur + ' ' + (ind.unite || '') + '</span>'
    );
    $body.append($item);
  });

  // Légende
  var $legende = $('<div>').css({ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' });
  [
    { label: '< 30% Faible',   classe: 'heatmap-faible'   },
    { label: '30–55% Moyen',   classe: 'heatmap-moyen'    },
    { label: '55–80% Élevé',   classe: 'heatmap-eleve'    },
    { label: '> 80% Fort',     classe: 'heatmap-critique' }
  ].forEach(function(c) {
    $legende.append(
      $('<span>').css({ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6B7A99' })
        .html('<span class="widget-heatmap__barre-fill ' + c.classe + '" style="width:14px;height:10px;border-radius:2px;display:inline-block;flex-shrink:0;"></span>' + c.label)
    );
  });
  $body.append($legende);
}

// ============================================================
// 13. HELPERS & UTILITAIRES
// ============================================================

function hexToRgbaCss(hex, alpha) {
  var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return 'rgba(21,101,192,' + alpha + ')';
  return 'rgba(' + parseInt(r[1],16) + ',' + parseInt(r[2],16) + ',' + parseInt(r[3],16) + ',' + alpha + ')';
}

/**
 * RGAA 5.1 — Génère un tableau de données accessible (.sr-only) en alternative
 * à un graphique Chart.js rendu dans un <canvas>.
 * @param {string} caption - Titre du tableau (repris du nom de l'indicateur)
 * @param {Array} labels   - Labels (colonnes ou lignes)
 * @param {Array} values   - Valeurs correspondantes
 * @param {string} unite   - Unité des valeurs
 * @returns {string} HTML du tableau
 */
function genererTableA11y(caption, labels, values, unite) {
  if (!labels || !labels.length) return '';
  var html = '<table class="chart-table-a11y sr-only">';
  html += '<caption>' + caption + '</caption>';
  html += '<thead><tr><th scope="col">Catégorie</th><th scope="col">Valeur (' + (unite || '') + ')</th></tr></thead>';
  html += '<tbody>';
  for (var i = 0; i < labels.length; i++) {
    html += '<tr><td>' + labels[i] + '</td><td>' + (values[i] != null ? values[i] : '–') + '</td></tr>';
  }
  html += '</tbody></table>';
  return html;
}

/**
 * Animation compteur : fait passer un élément DOM de sa valeur actuelle à la cible.
 */
function animerCompteur($el, cible, unite) {
  if (!$el.length) return;
  var debut   = parseFloat($el.text()) || 0;
  var duree   = 600;
  var debut_t = performance.now();
  var isFloat = String(cible).indexOf('.') !== -1;

  function step(now) {
    var t = Math.min(1, (now - debut_t) / duree);
    // Ease out cubic
    t = 1 - Math.pow(1 - t, 3);
    var val = debut + (cible - debut) * t;
    $el.text(isFloat ? Math.round(val * 10) / 10 : Math.round(val));
    if (t < 1) requestAnimationFrame(step);
    else $el.text(cible);
  }
  requestAnimationFrame(step);
}

// ============================================================
// 14. INITIALISATION (DOMContentLoaded)
// ============================================================

$(document).ready(function() {

  // N'initialiser que sur la page qui contient la grille de widgets fixes
  if (!document.getElementById('dashboard-grille')) return;

  // Sélecteurs
  initialiserSelecteursTdb();

  // Rendu initial
  rendreGrilleWidgets();

  console.log('[Dashboard] Initialisation complète. ' + INDICATEURS_DASHBOARD.length + ' widgets chargés.');
});
