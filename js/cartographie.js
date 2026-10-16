/**
 * cartographie.js – v2
 * Observatoire de l'Eau Grand Est
 *
 * Architecture :
 *   Panel 1 – Données sources  (DONNEES_SOURCES  de data-carto-sources.js)
 *   Panel 2 – Territoires      (DONNEES_TERRITOIRES de data-territoires.js)
 *
 * Dépendances : jQuery, OpenLayers 9,
 *               data-carto-sources.js, data-territoires.js
 *
 * SOMMAIRE
 *  1.  Configuration
 *  2.  Initialisation carte OL
 *  3.  Gestionnaire couches – Panel 1 (points / lignes / polygones données)
 *  4.  Gestionnaire couches – Panel 2 (zones territoire semi-transparentes)
 *  5.  Construction accordéon Panel 1
 *  6.  Construction accordéon Panel 2
 *  7.  Autocomplete & recherche – générique, appelé pour P1 et P2
 *  8.  Popup cartographique
 *  9.  Légende dynamique
 * 10.  Tags couches actives
 * 11.  Bouton "Tout effacer" global
 * 12.  Toggle affichage des 2 sidebars
 * 13.  Utilitaires
 * 14.  Initialisation générale (DOMContentLoaded)
 */

// ============================================================
// 1. CONFIGURATION
// ============================================================

var CENTRE_GE = [6.5, 48.5];
var ZOOM_INIT  = 7;

// Couleurs par catégorie (Panel 1)
var COULEURS_P1 = {
  "Milieux aquatiques":        "#00796B",
  "Qualité des eaux":          "#0288D1",
  "Quantité / Ressource":      "#1565C0",
  "Usages de l'eau":           "#6A1B9A",
  "Risques / Inondations":     "#E65100",
  "Gouvernance":               "#1B5E20",
  "Autres":                    "#546E7A"
};

// État global
var carto = {
  map:              null,
  view:             null,
  couchesP1:        {},   // { filtreId : ol.layer }
  couchesP2:        {},   // { filtreId : ol.layer }
  filtresActifsP1:  [],
  filtresActifsP2:  [],
  panel2Defaut:     ["t-region-grand-est"],  // actif par défaut
  // Navigation temporelle dans la popup
  popupNav: {
    feature:    null,  // feature OL active (couche en cours)
    features:   [],    // toutes les features au point cliqué (multi-couches)
    layerIdx:   0,     // index couche active dans features[]
    index:      0,     // index dans feature.get('historique') (0 = plus récent)
    _coord:     null,  // coordonnée géographique OL du point cliqué (EPSG:3857)
    _lastPixel: null,  // dernier pixel calculé (pour ré-affichage sans pixel)
    _dragOffset: null   // {dx, dy} offset appliqué par le drag utilisateur (null = pas de drag)
  }
};

// ============================================================
// 2. INITIALISATION CARTE OL
// ============================================================

function initialiserCarte() {
  cartographie = carto; // compatibilité ancienne variable globale

  // ── Clé MapTiler (remplacer par votre propre clé sur https://cloud.maptiler.com) ──
  var MAPTILER_KEY = 'o29odzq7uenIukGHfDTV';

  // ── Fonds de carte disponibles ────────────────────────────────
  var BASEMAPS = {
    dataviz: {
      label:  'MapTiler Dataviz',
      icon:   '🗺️',
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/dataviz/{z}/{x}/{y}.png?key=' + MAPTILER_KEY,
        tileSize: 512,
        maxZoom: 20,
        attributions:
          '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> ' +
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
      })
    },
    osm: {
      label:  'OpenStreetMap',
      icon:   '🌍',
      source: new ol.source.OSM({
        attributions: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    },
    satellite: {
      label:  'Satellite',
      icon:   '🛰️',
      source: new ol.source.XYZ({
        url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + MAPTILER_KEY,
        tileSize: 512,
        maxZoom: 20,
        attributions:
          '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> ' +
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
      })
    }
  };

  // ── Couche de fond active (Dataviz par défaut) ────────────────
  carto.coucheFond = new ol.layer.Tile({
    source: BASEMAPS.dataviz.source
  });

  carto.view = new ol.View({
    center: ol.proj.fromLonLat(CENTRE_GE),
    zoom:    ZOOM_INIT,
    minZoom: 5,
    maxZoom: 18
  });

  carto.map = new ol.Map({
    target: 'ol-map',
    layers: [carto.coucheFond],
    view:   carto.view,
    controls: ol.control.defaults.defaults({ attribution: true, zoom: true, rotate: false })
  });

  // ── Sélecteur de fond de carte ────────────────────────────────
  var basemapToggle = document.getElementById('basemap-toggle');
  var basemapPanel  = document.getElementById('basemap-panel');
  var basemapBtns   = document.querySelectorAll('[data-basemap]');

  // Ouvrir/fermer le panneau au clic sur le bouton
  if (basemapToggle && basemapPanel) {
    basemapToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = basemapPanel.classList.toggle('is-open');
      basemapToggle.classList.toggle('is-open', isOpen);
      basemapToggle.setAttribute('aria-expanded', isOpen);
    });
    // Fermer en cliquant ailleurs
    document.addEventListener('click', function(e) {
      if (!basemapPanel.contains(e.target) && e.target !== basemapToggle) {
        basemapPanel.classList.remove('is-open');
        basemapToggle.classList.remove('is-open');
        basemapToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Changer le fond de carte + fermer le panneau
  basemapBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var key = this.dataset.basemap;
      if (!BASEMAPS[key]) return;
      carto.coucheFond.setSource(BASEMAPS[key].source);
      basemapBtns.forEach(function(b) { b.classList.remove('is-active'); });
      this.classList.add('is-active');
      // Fermer le panneau après sélection
      if (basemapPanel) {
        basemapPanel.classList.remove('is-open');
        basemapToggle.classList.remove('is-open');
        basemapToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
  // Marquer Dataviz comme actif par défaut
  var defaultBtn = document.querySelector('[data-basemap="dataviz"]');
  if (defaultBtn) defaultBtn.classList.add('is-active');

  carto.map.on('singleclick',   gererClicCarte);
  carto.map.on('pointermove', function(evt) {
    var hit = carto.map.hasFeatureAtPixel(evt.pixel);
    carto.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  });

  // ── Suivi de la popup pendant le déplacement de la carte ──
  // postrender se déclenche à chaque frame de rendu (drag, zoom, pan).
  // On recalcule le pixel depuis la coordonnée géo stockée et on repositionne.
  carto.map.on('postrender', function() {
    if (!carto.popupNav._coord || !carto.popupNav.feature) return;
    var pixel = carto.map.getPixelFromCoordinate(carto.popupNav._coord);
    if (!pixel) return;
    // Si l'utilisateur a déplacé la popup, appliquer l'offset
    if (carto.popupNav._dragOffset) {
      var off = carto.popupNav._dragOffset;
      var popup = document.getElementById('carto-popup');
      if (popup) {
        var mapRect = carto.map.getTargetElement().getBoundingClientRect();
        var cx = mapRect.left + pixel[0];
        var cy = mapRect.top  + pixel[1];
        popup.style.left = (cx + off.dx) + 'px';
        popup.style.top  = (cy + off.dy) + 'px';
        popup.style.bottom = '';
        popup.style.transform = '';
      }
    } else {
      repositionnerPopup(pixel);
    }
  });

  // ── Indicateur de niveau de zoom ──────────────────────────────
  // Géré par js/cartographie-zoom-layers.js (module additionnel)
}

// ============================================================
// 3. COUCHES PANEL 1 – DONNÉES SOURCES
// ============================================================

/**
 * Génère un historique de 5 mesures cohérentes à partir d'une valeur de référence.
 *
 * Principe :
 *  - On parse la valeur réelle de la feature (ex. "6 200 km²", "75 %", "3.2 m NGF")
 *    pour extraire : le nombre (float) et tout ce qui suit (unité + éventuel suffixe).
 *  - Chaque entrée historique est une variation déterministe ±20 % du nombre,
 *    reformatée avec la même unité.
 *  - Les dates sont générées avec précisions mixtes (année, mois/an, jour/mois/an).
 *
 * @param {string} valeurRef  Valeur de la feature la plus récente  (ex. "6 200 km²")
 * @param {string|number} anneeRef  Année de référence (la plus récente)
 * @param {number} seed  Seed déterministe (unique par feature)
 * @returns {Array<{date:string, valeur:string}>}  5 entrées, index 0 = plus récent
 */
function genererHistorique(valeurRef, anneeRef, seed) {
  var N = 5;

  // ── 1. Parser valeurRef pour extraire nombre + unité ──────────
  var nombreRef = NaN;
  var unite     = '';
  var decimales = 0;

  if (valeurRef && valeurRef !== '–') {
    // Remplacer les espaces insécables/espace dans les nombres (ex. "6 200")
    var cleaned = String(valeurRef).replace(/\s+(?=\d)/g, '').replace(/\u00a0/g, '');
    // Chercher le premier nombre (entier ou décimal)
    var m = cleaned.match(/^([+-]?\d+(?:[.,]\d+)?)\s*(.*)/);
    if (m) {
      nombreRef = parseFloat(m[1].replace(',', '.'));
      unite     = m[2] ? (' ' + m[2].trim()) : '';
      decimales = (m[1].indexOf('.') !== -1 || m[1].indexOf(',') !== -1)
                  ? m[1].replace(/.*[.,]/, '').length : 0;
    }
  }

  // Si le parsing échoue, on garde la valeur brute pour toutes les dates
  var valeurBrute = isNaN(nombreRef);

  // ── 2. Générer les dates (précisions mixtes, déterministes) ───
  var precisions = ['year', 'month', 'year', 'day', 'month']; // pattern fixe
  var anneeBase  = parseInt(anneeRef, 10) || 2024;

  var entrees = [];
  for (var i = 0; i < N; i++) {
    var an   = anneeBase - i;
    var prec = precisions[(seed + i) % precisions.length];
    var mois = 1 + ((seed * 7  + i * 13) % 12);   // 1–12
    var jour = 1 + ((seed * 11 + i * 17) % 28);   // 1–28

    var date;
    if (prec === 'year') {
      date = String(an);
    } else if (prec === 'month') {
      date = an + '-' + String(mois).padStart(2, '0');
    } else {
      date = an + '-' + String(mois).padStart(2, '0') + '-' + String(jour).padStart(2, '0');
    }

    // ── 3. Générer la valeur ──────────────────────────────────
    var valeur;
    if (valeurBrute) {
      // Pas de nombre parseable → répéter la valeur telle quelle
      valeur = valeurRef;
    } else if (i === 0) {
      // Entrée 0 = valeur réelle exacte
      valeur = valeurRef;
    } else {
      // Variation déterministe ±20 % autour de la valeur de référence
      // Facteur entre 0.80 et 1.20, déterministe via seed
      var facteur = 0.80 + ((seed * 13 + i * 29) % 41) / 100; // 0.80 … 1.20
      var nb = nombreRef * facteur;
      var nbFormate = decimales > 0 ? nb.toFixed(decimales) : String(Math.round(nb));
      valeur = nbFormate + unite;
    }

    entrees.push({ date: date, valeur: valeur });
  }

  return entrees; // index 0 = plus récent
}

/**
 * Crée une couche OL à partir d'un filtre P1 et l'ajoute à la carte.
 * Gère Point, LineString et Polygon selon filtre.geometrie.
 */
function ajouterCoucheP1(filtreId) {
  if (carto.couchesP1[filtreId]) {
    carto.couchesP1[filtreId].setVisible(true);
    return;
  }

  var filtre  = trouverFiltreP1(filtreId);
  if (!filtre) return;

  var cat     = trouverCategorieP1(filtreId);
  var couleur = cat ? (cat.color || cat.couleur) : "#1565C0";
  var rgb     = hexToRgb(couleur);

  var features = [];
  filtre.features.forEach(function(feat, idx) {
    // Normalise les noms de géométrie (ponctuel/point, linéaire/ligne/polyligne, polygone)
    var geomRaw  = feat.geometrie || filtre.geometrie || 'point';
    var geomType = normaliserGeom(geomRaw);
    var geomOL;

    if (geomType === 'point') {
      if (!feat.coords || feat.coords.length !== 2 || typeof feat.coords[0] !== 'number') return;
      geomOL = new ol.geom.Point(ol.proj.fromLonLat(feat.coords));

    } else if (geomType === 'ligne') {
      if (!feat.coords || feat.coords.length < 2) return;
      geomOL = new ol.geom.LineString(feat.coords.map(function(c) {
        return ol.proj.fromLonLat(c);
      }));

    } else { // polygone
      if (!feat.coords || feat.coords.length < 3) return;
      geomOL = new ol.geom.Polygon([feat.coords.map(function(c) {
        return ol.proj.fromLonLat(c);
      })]);
    }

    // Historique des 5 dernières dates — valeurs cohérentes (même unité, variation ±20 %)
    var histo = feat.historique;
    if (!histo || !histo.length) {
      histo = genererHistorique(
        feat.valeur || '–',
        feat.annee  || filtre.derniereAnnee || 2024,
        idx + 1 + (filtreId.length % 17)   // seed déterministe
      );
    }

    var f = new ol.Feature({ geometry: geomOL });
    f.set('panel',      'p1');
    f.set('filtreId',   filtreId);
    f.set('label',      feat.label || filtre.label);
    f.set('categorie',  cat ? (cat.label || cat.categorie || '') : '');
    f.set('couleur',    couleur);
    f.set('valeur',     histo[0] ? histo[0].valeur : (feat.valeur  || '–'));
    f.set('territoire', feat.territoire || '–');
    f.set('annee',      histo[0] ? histo[0].date  : (feat.annee   || filtre.derniereAnnee || '–'));
    f.set('source',     filtre.source || '–');
    f.set('geometrie',  geomType);
    f.set('historique', histo);  // tableau [{date, valeur}, …] du plus récent au plus ancien
    features.push(f);
  });

  var source = new ol.source.Vector({ features: features });

  var layer = new ol.layer.Vector({
    source: source,
    style: function(feature) {
      return styleP1(feature, couleur, rgb);
    },
    zIndex: 10
  });

  // Géométrie dominante de la couche (premier feature ou filtre global)
  var geomDom = normaliserGeom(filtre.geometrie || (filtre.features[0] && filtre.features[0].geometrie) || 'point');
  layer.set('filtreId',   filtreId);
  layer.set('label',      filtre.label);
  layer.set('couleur',    couleur);
  layer.set('panel',      'p1');
  layer.set('geometrie',  geomDom);

  carto.map.addLayer(layer);
  carto.couchesP1[filtreId] = layer;

  ajouterTagCoucheActive(filtreId, filtre.label, couleur, 'p1');
  mettreAJourLegende();
  mettreAJourCompteurGlobal();
}

function styleP1(feature, couleur, rgb) {
  var geomType = feature.get('geometrie');

  if (geomType === 'point') {
    var valeur = feature.get('valeur');
    var rayon  = 6;
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: rayon,
        fill:   new ol.style.Fill({ color: 'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.80)' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 1.5 })
      })
    });

  } else if (geomType === 'ligne') {
    return new ol.style.Style({
      stroke: new ol.style.Stroke({ color: couleur, width: 3 })
    });

  } else { // polygone
    return new ol.style.Style({
      fill:   new ol.style.Fill({ color: 'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.25)' }),
      stroke: new ol.style.Stroke({ color: couleur, width: 2 })
    });
  }
}

function supprimerCoucheP1(filtreId) {
  if (!carto.couchesP1[filtreId]) return;
  // Fermer la popup si elle affiche un élément de cette couche
  fermerPopupSiCoucheSupprimee(filtreId);
  carto.map.removeLayer(carto.couchesP1[filtreId]);
  delete carto.couchesP1[filtreId];
  carto.filtresActifsP1 = carto.filtresActifsP1.filter(function(x) { return x !== filtreId; });
  $('#filtre-p1-' + filtreId).prop('checked', false);
  supprimerTagCouche(filtreId, 'p1');
  mettreAJourLegende();
  mettreAJourCompteurGlobal();
  mettreAJourBadgesCategories();
  mettreAJourMessageAucunFiltre();
}

function supprimerToutesLesCouchesP1() {
  fermerPopup();
  Object.keys(carto.couchesP1).forEach(function(id) {
    carto.map.removeLayer(carto.couchesP1[id]);
    supprimerTagCouche(id, 'p1');
  });
  carto.couchesP1       = {};
  carto.filtresActifsP1 = [];
  $('#p1-filtres-corps input[type="checkbox"]').prop('checked', false);
  mettreAJourBadgeP1();
  mettreAJourLegende();
  mettreAJourCompteurGlobal();
  mettreAJourBadgesCategories();
}

// ============================================================
// 4. COUCHES PANEL 2 – TERRITOIRES
// ============================================================

/**
 * Polygone à remplissage alpha=0.03, bordure couleur 2 px.
 * Les points et linéaires sont traités différemment (cercle marqueur, trait fin).
 */
function ajouterCoucheP2(filtreId) {
  if (carto.couchesP2[filtreId]) {
    carto.couchesP2[filtreId].setVisible(true);
    return;
  }

  var filtre  = trouverFiltreP2(filtreId);
  if (!filtre) return;

  var cat     = trouverCategorieP2(filtreId);
  var couleur = cat ? (cat.color || cat.couleur || '#546E7A') : '#546E7A';
  var rgb     = hexToRgb(couleur);

  var features = [];
  filtre.coords = filtre.coords || null;

  // Cas territoire simple (un seul polygone / point défini par filtre.coords)
  var srcFeatures = (filtre.features && filtre.features.length) ? filtre.features :
    [{ coords: filtre.coords, geometrie: filtre.geometrie, label: filtre.label, annee: '–', valeur: '–', source: '' }];

  srcFeatures.forEach(function(feat) {
    var geomRaw  = feat.geometrie || filtre.geometrie || 'polygone';
    var geomType = normaliserGeom(geomRaw);
    var geomOL;

    if (geomType === 'point') {
      if (!feat.coords || feat.coords.length !== 2 || typeof feat.coords[0] !== 'number') return;
      geomOL = new ol.geom.Point(ol.proj.fromLonLat(feat.coords));

    } else if (geomType === 'ligne') {
      if (!feat.coords || feat.coords.length < 2) return;
      geomOL = new ol.geom.LineString(feat.coords.map(function(c) {
        return ol.proj.fromLonLat(c);
      }));

    } else { // polygone
      if (!feat.coords || feat.coords.length < 3) return;
      geomOL = new ol.geom.Polygon([feat.coords.map(function(c) {
        return ol.proj.fromLonLat(c);
      })]);
    }

    var f = new ol.Feature({ geometry: geomOL });
    f.set('panel',      'p2');
    f.set('filtreId',   filtreId);
    f.set('label',      feat.label || filtre.label);
    f.set('categorie',  cat ? (cat.label || cat.categorie || '') : '');
    f.set('couleur',    couleur);
    f.set('valeur',     feat.valeur     || '–');
    f.set('territoire', feat.territoire || filtre.label || '–');
    f.set('annee',      feat.annee      || filtre.derniereAnnee || '–');
    f.set('source',     filtre.source   || feat.source || '–');
    f.set('geometrie',  geomType);
    features.push(f);
  });

  var source = new ol.source.Vector({ features: features });

  var layer = new ol.layer.Vector({
    source: source,
    style: function(feature) {
      return styleP2(feature, couleur, rgb);
    },
    zIndex: 5  // sous les couches P1
  });

  // Géométrie dominante P2
  var geomDomP2 = normaliserGeom((filtre.features && filtre.features[0] && filtre.features[0].geometrie) || filtre.geometrie || 'polygone');
  layer.set('filtreId', filtreId);
  layer.set('label',    filtre.label);
  layer.set('couleur',  couleur);
  layer.set('panel',    'p2');
  layer.set('geometrie', geomDomP2);

  carto.map.addLayer(layer);
  carto.couchesP2[filtreId] = layer;

  ajouterTagCoucheActive(filtreId, filtre.label, couleur, 'p2');
  mettreAJourLegende();
  mettreAJourCompteurGlobal();
}

function styleP2(feature, couleur, rgb) {
  var geomType = feature.get('geometrie');

  if (geomType === 'point') {
    return new ol.style.Style({
      image: new ol.style.RegularShape({
        points:  4,
        radius:  7,
        angle:   Math.PI / 4,
        fill:    new ol.style.Fill({ color: 'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.75)' }),
        stroke:  new ol.style.Stroke({ color: couleur, width: 1.5 })
      })
    });

  } else if (geomType === 'ligne') {
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: couleur,
        width: 2,
        lineDash: [6, 4]
      })
    });

  } else { // polygone – alpha 3% fill, 2px stroke
    return new ol.style.Style({
      fill:   new ol.style.Fill({ color: 'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.03)' }),
      stroke: new ol.style.Stroke({ color: couleur, width: 2 })
    });
  }
}

function supprimerCoucheP2(filtreId) {
  if (!carto.couchesP2[filtreId]) return;
  // Fermer la popup si elle affiche un élément de cette couche
  fermerPopupSiCoucheSupprimee(filtreId);
  carto.map.removeLayer(carto.couchesP2[filtreId]);
  delete carto.couchesP2[filtreId];
  carto.filtresActifsP2 = carto.filtresActifsP2.filter(function(x) { return x !== filtreId; });
  $('#filtre-p2-' + filtreId).prop('checked', false);
  supprimerTagCouche(filtreId, 'p2');
  mettreAJourLegende();
  mettreAJourCompteurGlobal();
  mettreAJourBadgesCategories();
}

function supprimerToutesLesCouchesP2() {
  fermerPopup();
  Object.keys(carto.couchesP2).forEach(function(id) {
    carto.map.removeLayer(carto.couchesP2[id]);
    supprimerTagCouche(id, 'p2');
  });
  carto.couchesP2       = {};
  carto.filtresActifsP2 = [];
  $('#p2-filtres-corps input[type="checkbox"]').prop('checked', false);
  mettreAJourBadgeP2();
  mettreAJourLegende();
  mettreAJourCompteurGlobal();
  mettreAJourBadgesCategories();
  mettreAJourMessageAucunFiltre();
}

// ============================================================
// 5. CONSTRUCTION ACCORDÉON PANEL 1
// ============================================================

function construirePanel1() {
  var $corps = $('#p1-filtres-corps');
  $corps.empty();

  DONNEES_SOURCES.forEach(function(cat) {
    var couleur = cat.color || cat.couleur || '#1565C0';
    var icone   = cat.icon  || cat.icone  || 'ph-stack';
    var $groupe = creerGroupeAccordeon(cat.label || cat.categorie, couleur, icone, cat.filtres.length);
    var $contenu = $groupe.find('.filtre-groupe__contenu');

    // Sous-groupes repliables (propriété `groupe` d'un filtre, ex. « Aléa ») :
    // créés à l'emplacement du 1er filtre du groupe, dans le même ordre
    var sousGroupes = {};
    cat.filtres.forEach(function(filtre) {
      var $cible = $contenu;
      var label = filtre.label;
      if (filtre.groupe) {
        if (!sousGroupes[filtre.groupe]) {
          var nb = cat.filtres.filter(function(f) { return f.groupe === filtre.groupe; }).length;
          var $sg = creerGroupeAccordeon(filtre.groupe, couleur, 'ph-folder-simple', nb, cat.id);
          $sg.addClass('filtre-groupe--sous');
          $contenu.append($sg);
          sousGroupes[filtre.groupe] = $sg.find('> .filtre-groupe__contenu');
        }
        $cible = sousGroupes[filtre.groupe];
        // « Aléa débordement… » → « Débordement… » (le nom du groupe porte déjà le préfixe)
        var prefixe = new RegExp('^' + filtre.groupe + '\\s+', 'i');
        if (prefixe.test(label)) {
          label = label.replace(prefixe, '');
          label = label.charAt(0).toUpperCase() + label.slice(1);
        }
      }
      var $item = creerItemFiltre('p1-' + filtre.id, label, normaliserGeom(filtre.geometrie), filtre.derniereAnnee, couleur);
      $item.find('input[type="checkbox"]').on('change', function() {
        if ($(this).is(':checked')) {
          if (carto.filtresActifsP1.indexOf(filtre.id) === -1) carto.filtresActifsP1.push(filtre.id);
          ajouterCoucheP1(filtre.id);
        } else {
          carto.filtresActifsP1 = carto.filtresActifsP1.filter(function(x) { return x !== filtre.id; });
          supprimerCoucheP1(filtre.id);
        }
        mettreAJourBadgeP1();
        mettreAJourMessageAucunFiltre();
        mettreAJourBadgesCategories();
      });
      $cible.append($item);
    });

    $corps.append($groupe);
  });
}

// ============================================================
// 6. CONSTRUCTION ACCORDÉON PANEL 2
// ============================================================

/**
 * Met à jour le libellé et le style du bouton « Tout sélectionner / Tout désélectionner ».
 * @param {jQuery} $btn   – le bouton
 * @param {boolean} allChecked – true si toutes les cases sont cochées
 * @param {string} couleur – couleur de la catégorie
 */
function _updateSelectAllLabel($btn, allChecked, couleur) {
  if (allChecked) {
    $btn.html('<i class="ph ph-x" style="margin-right:4px;font-size:11px;"></i> Tout désélectionner')
        .css({ background: couleur, color: '#fff', borderColor: couleur });
  } else {
    $btn.html('<i class="ph ph-checks" style="margin-right:4px;font-size:11px;"></i> Tout sélectionner')
        .css({ background: 'none', color: couleur, borderColor: couleur });
  }
}

/**
 * Synchronise l'état du bouton « Tout sélectionner » avec les checkboxes du groupe.
 */
function _syncSelectAllBtn($contenu, $btn, couleur) {
  if (!$btn) return; // pas de bouton pour cette catégorie (ex. Grand Est, Communes)
  var $cbs = $contenu.find('input[type="checkbox"]');
  var allChecked = $cbs.length > 0 && $cbs.filter(':checked').length === $cbs.length;
  _updateSelectAllLabel($btn, allChecked, couleur);
}

function construirePanel2() {
  var $corps = $('#p2-filtres-corps');
  $corps.empty();
  carto.filtresActifsP2 = [];

  DONNEES_TERRITOIRES.forEach(function(cat) {
    var couleur     = cat.color || cat.couleur || '#546E7A';
    var icone       = cat.icon  || cat.icone  || 'ph-map';
    var territoires = cat.territoires || cat.filtres || [];
    var catLabel    = cat.label || cat.categorie || '';

    // ── Cas spécial : Communes (5 115) → recherche uniquement, pas de liste dans l'accordéon
    if (cat.id === 'commune') {
      var $groupe  = creerGroupeAccordeon(catLabel, couleur, icone, territoires.length);
      var $contenu = $groupe.find('.filtre-groupe__contenu');
      $contenu.empty().append(
        $('<div>').css({
          padding: '10px 12px',
          fontSize: '12px',
          color: '#546e7a',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }).append(
          $('<i>').addClass('ph ph-magnifying-glass').css({ marginTop: '2px', color: couleur }),
          $('<span>').html(
            '<strong>5 115 communes</strong> disponibles.<br>' +
            'Utilisez la <strong>barre de recherche</strong> ci-dessus pour trouver et activer une commune.'
          )
        )
      );
      $corps.append($groupe);
      return; // passer à la catégorie suivante
    }

    var $groupe  = creerGroupeAccordeon(catLabel, couleur, icone, territoires.length);
    var $contenu = $groupe.find('.filtre-groupe__contenu');

    // ── Bouton « Tout sélectionner / Tout désélectionner » ──────────
    // Exceptions : pas de bouton pour les catégories avec ≤ 1 élément (ex. Grand Est)
    var $selectAllBtn = null;

    if (territoires.length > 1) {
      var $selectAllBar = $('<div>').addClass('filtre-select-all-bar');
      $selectAllBtn = $('<button>')
        .addClass('filtre-select-all-btn')
        .attr('type', 'button')
        .attr('data-cat-id', cat.id)
        .attr('title', 'Sélectionner tous les ' + catLabel)
        .html('<i class="ph ph-checks" style="margin-right:4px;font-size:11px;"></i> Tout sélectionner')
        .css({ border: '1px solid ' + couleur, color: couleur });
      var $selectAllCount = $('<span>').css({
        fontSize: '10px',
        color: '#90A4AE',
        fontWeight: '500'
      }).text(territoires.length + ' éléments');

      // ── Logique toggle ──
      (function($btn, $cont, col) {
        $btn.on('click', function(e) {
          e.stopPropagation();
          var $checkboxes = $cont.find('input[type="checkbox"]');
          var allChecked  = $checkboxes.length > 0 && $checkboxes.filter(':checked').length === $checkboxes.length;
          $checkboxes.each(function() {
            var shouldCheck = !allChecked;
            if ($(this).is(':checked') !== shouldCheck) {
              $(this).prop('checked', shouldCheck).trigger('change');
            }
          });
          _updateSelectAllLabel($btn, !allChecked, col);
        });
      })($selectAllBtn, $contenu, couleur);

      $selectAllBar.append($selectAllBtn, $selectAllCount);
      $contenu.append($selectAllBar);
    }

    territoires.forEach(function(terr) {
      var isDefaut = terr.actif === true || carto.panel2Defaut.indexOf(terr.id) !== -1;
      var geom     = normaliserGeom(terr.geometrie || 'polygone');
      var $item    = creerItemFiltre('p2-' + terr.id, terr.label, geom, null, couleur, isDefaut);

      $item.find('input[type="checkbox"]').on('change', function() {
        if ($(this).is(':checked')) {
          if (carto.filtresActifsP2.indexOf(terr.id) === -1) carto.filtresActifsP2.push(terr.id);
          ajouterCoucheP2(terr.id);
        } else {
          carto.filtresActifsP2 = carto.filtresActifsP2.filter(function(x) { return x !== terr.id; });
          supprimerCoucheP2(terr.id);
        }
        mettreAJourBadgeP2();
        mettreAJourMessageAucunFiltre();
        mettreAJourBadgesCategories();
        // Met à jour le bouton « Tout sélectionner » de cette catégorie
        _syncSelectAllBtn($contenu, $selectAllBtn, couleur);
      });
      $contenu.append($item);

      if (isDefaut) {
        carto.filtresActifsP2.push(terr.id);
      }
    });

    $corps.append($groupe);
  });
}

function initDefauts() {
  // Cocher et afficher les couches Panel 2 par défaut
  var toActive = carto.filtresActifsP2.slice();
  carto.filtresActifsP2 = [];
  toActive.forEach(function(id) {
    var $cb = $('#p2-filtre-p2-' + id);
    if ($cb.length) {
      $cb.prop('checked', true).trigger('change');
    } else {
      // fallback direct
      if (carto.filtresActifsP2.indexOf(id) === -1) carto.filtresActifsP2.push(id);
      ajouterCoucheP2(id);
    }
  });
  mettreAJourBadgeP2();
  mettreAJourMessageAucunFiltre();
  mettreAJourBadgesCategories();

  // Ouvrir automatiquement le groupe Grand Est
  $('#p2-filtres-corps .filtre-groupe').first().find('.filtre-groupe__entete').trigger('click');
}

// ============================================================
// 7. HELPERS UI : ACCORDÉON, ITEMS, RECHERCHE
// ============================================================

function creerGroupeAccordeon(categorie, couleur, icone, count, parentId) {
  var id = 'grp-' + (parentId ? parentId + '-' : '') + categorie.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
  var $groupe = $('<div>').addClass('filtre-groupe').attr('data-categorie', categorie).attr('id', id);

  var $entete = $('<div>').addClass('filtre-groupe__entete');
  var $titre  = $('<h4>').addClass('filtre-groupe__titre');
  var $puce   = $('<span>').addClass('filtre-groupe__puce').css('background-color', couleur);
  var $icon   = $('<i>').addClass('ph ' + (icone || 'ph-stack')).css({ color: couleur, marginRight: '6px', fontSize: '11px' });
  var $texte  = $('<span>').text(categorie);
  var $count  = $('<span>').addClass('filtre-badge-count').text(count);
  var $actif   = $('<span>').addClass('filtre-badge-actif').hide(); // visible si ≥ 1 couche active
  var $chev   = $('<i>').addClass('ph ph-caret-down filtre-groupe__chevron');

  $titre.append($puce, $icon, $texte);
  $entete.append($titre, $actif, $count, $chev);

  var $contenu = $('<div>').addClass('filtre-groupe__contenu').hide();
  $groupe.append($entete, $contenu);

  $entete.on('click', function() {
    var $g = $(this).closest('.filtre-groupe');
    $g.toggleClass('is-open');
    $g.find('> .filtre-groupe__contenu').slideToggle(200);
    $chev.toggleClass('ph-caret-down ph-caret-up');
  });

  return $groupe;
}

/**
 * Met à jour le badge "couches actives" de chaque catégorie dans les deux panels.
 * Compte les checkboxes cochées dans chaque .filtre-groupe et affiche/masque
 * le badge .filtre-badge-actif en conséquence.
 */
function mettreAJourBadgesCategories() {
  $('.filtre-groupe').each(function() {
    var $groupe = $(this);
    var total   = $groupe.find('input[type="checkbox"]:checked').length;
    var $badge  = $groupe.find('> .filtre-groupe__entete > .filtre-badge-actif');
    if (total > 0) {
      $badge.text(total).show();
      $groupe.addClass('has-active');
    } else {
      $badge.hide();
      $groupe.removeClass('has-active');
    }
  });
}

function creerItemFiltre(id, label, geometrie, derniereAnnee, couleur, checked) {
  // id est déjà préfixé par 'p1-' ou 'p2-' lors de l'appel
  var $item = $('<label>').addClass('filtre-item').attr('data-id', id);

  var $checkbox = $('<input type="checkbox">')
    .attr('id', 'filtre-' + id)
    .attr('value', id);

  if (checked) $checkbox.prop('checked', true);

  // Icône géométrie
  var geomIcon  = { 'point': 'ph-dot-outline', 'ligne': 'ph-minus', 'polygone': 'ph-polygon' };
  var geomColor = { 'point': '#4CAF50',          'ligne': '#2196F3',  'polygone': '#FF9800' };
  var $geomBadge = $('<span>').addClass('filtre-geom-badge')
    .attr('title', geometrie || '')
    .html('<i class="ph ' + (geomIcon[geometrie] || 'ph-stack') + '"></i>')
    .css('color', geomColor[geometrie] || '#546E7A');

  var $label = $('<span>').addClass('filtre-item__label').text(label);

  // Badge année
  var $anneeBadge = $('<span>').addClass('filtre-item__annee').text(derniereAnnee || '');

  $item.append($checkbox, $geomBadge, $label, $anneeBadge);

  // Hover
  $item.on('mouseenter', function() { $(this).addClass('is-hover'); });
  $item.on('mouseleave', function() { $(this).removeClass('is-hover'); });

  return $item;
}

// ── RECHERCHE / AUTOCOMPLETE GÉNÉRIQUE ───────────────────────────────────

function initialiserRecherchePanel(opts) {
  /**
   * opts = {
   *   inputId, clearId, acId, resultsId, corpsId,
   *   getData:  function() → [ { id, label, categorie, geometrie, couleur, derniereAnnee } ]
   *   onToggle: function(id, checked) → void
   *   isChecked: function(id) → bool
   * }
   */
  var $input   = $('#' + opts.inputId);
  var $clear   = $('#' + opts.clearId);
  var $ac      = $('#' + opts.acId);
  var $results = $('#' + opts.resultsId);

  // Déplace le dropdown AC dans le <body> pour échapper aux overflow:hidden
  $('body').append($ac.detach());

  function highlight(text, q) {
    if (!q) return escHtml(text);
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escHtml(text).replace(re, '<em>$1</em>');
  }

  function filtrer(q) {
    if (!q || q.trim().length < 1) return [];
    q = q.toLowerCase();
    return opts.getData().filter(function(item) {
      return item.label.toLowerCase().indexOf(q) !== -1 ||
             item.categorie.toLowerCase().indexOf(q) !== -1 ||
             (item.geometrie && item.geometrie.toLowerCase().indexOf(q) !== -1);
    });
  }

  function positionnerAC() {
    // Positionne le dropdown AC sous l'input via fixed (échappe aux overflow:hidden)
    var rect = $input[0].getBoundingClientRect();
    $ac.css({
      top:   rect.bottom + 4 + 'px',
      left:  rect.left + 'px',
      width: rect.width + 'px'
    });
  }

  function afficherAC(q) {
    $ac.empty();
    if (!q || q.length < 2) { $ac.removeClass('is-open'); return; }
    var sugg = filtrer(q).slice(0, 6);
    if (!sugg.length) { $ac.removeClass('is-open'); return; }

    sugg.forEach(function(item) {
      var $s = $('<div>').addClass('carto-ac-item');
      $s.append(
        $('<div>').addClass('carto-ac-item__name').html(highlight(item.label, q)),
        $('<div>').addClass('carto-ac-item__meta').append(
          $('<span>').addClass('carto-ac-badge')
            .css({ background: item.couleur + '22', color: item.couleur })
            .text(item.categorie),
          $('<span>').text(item.geometrie || '')
        )
      );
      $s.on('mousedown', function(e) {
        e.preventDefault();
        $input.val(item.label);
        $ac.removeClass('is-open');
        // Cache les résultats inline et affiche le panneau corps
        $results.hide().empty();
        $('#' + opts.corpsId).show();
        afficherResultats(item.label);
      });
      $ac.append($s);
    });
    positionnerAC();
    $ac.addClass('is-open');
    // Masque le panneau résultats quand l'AC est visible
    $results.hide().empty();
    $('#' + opts.corpsId).show();
  }

  function afficherResultats(q) {
    if (!q || q.trim() === '') {
      $results.hide().empty();
      $('#' + opts.corpsId).show();
      return;
    }

    var liste = filtrer(q);
    $results.empty().show();
    $('#' + opts.corpsId).hide();

    var $header = $('<div>').addClass('carto-search-results__header').html(
      '<span><i class="ph ph-magnifying-glass" style="margin-right:4px;opacity:.5;"></i>' +
      liste.length + ' résultat' + (liste.length !== 1 ? 's' : '') + '</span>' +
      '<span style="cursor:pointer;color:var(--color-primary);" class="search-cancel-btn">' +
      '<i class="ph ph-x"></i> Fermer</span>'
    );
    $results.append($header);

    if (liste.length === 0) {
      $results.append($('<div>').addClass('carto-search-empty')
        .html('<i class="ph ph-magnifying-glass"></i>Aucun résultat pour «&nbsp;' + escHtml(q) + '&nbsp;»'));
    } else {
      liste.slice(0, 50).forEach(function(item) {
        var isOk = opts.isChecked(item.id);
        var $it  = $('<div>').addClass('carto-search-result-item' + (isOk ? ' is-checked' : ''))
          .attr('data-id', item.id);
        $it.append(
          $('<span>').addClass('carto-search-result-item__dot').css('background', item.couleur),
          $('<span>').addClass('carto-search-result-item__name').html(highlight(item.label, q)),
          $('<i>').addClass('ph ph-check carto-search-result-item__check')
        );
        $it.on('click', function() {
          var checked = !$(this).hasClass('is-checked');
          $(this).toggleClass('is-checked', checked);
          opts.onToggle(item.id, checked);
        });
        $results.append($it);
      });
      if (liste.length > 50) {
        $results.append($('<div>').css({ textAlign:'center', padding:'8px', fontSize:'11px', color:'#6B7A99' })
          .text('+ ' + (liste.length - 50) + ' autres — affinez votre recherche'));
      }
    }

    $results.find('.search-cancel-btn').on('click', function() {
      $input.val('');
      $clear.hide();
      $results.hide().empty();
      $ac.removeClass('is-open');
      $('#' + opts.corpsId).show();
    });
  }

  // Événements
  $input.on('input', function() {
    var q = $(this).val();
    $clear.toggle(q.length > 0);
    // L'AC s'affiche pendant la frappe (masque $results)
    // Sur sélection d'une suggestion → afficherResultats() est appelé depuis mousedown
    afficherAC(q);
    // Si l'AC n'a pas de suggestions, on affiche les résultats complets
    if (!$ac.hasClass('is-open')) {
      afficherResultats(q);
    }
  });
  $input.on('keydown', function(e) {
    if (e.key === 'Enter') {
      var q = $(this).val();
      $ac.removeClass('is-open');
      afficherResultats(q);
    }
  });
  $input.on('focus', function() {
    var q = $(this).val();
    if (q.length >= 2) afficherAC(q);
  });
  $input.on('blur', function() {
    setTimeout(function() { $ac.removeClass('is-open'); }, 150);
  });
  $clear.on('click', function() {
    $input.val('').focus();
    $clear.hide();
    $results.hide().empty();
    $ac.removeClass('is-open');
    $('#' + opts.corpsId).show();
  });
}

// ── Données aplaties pour la recherche ───────────────────────────────────

function getDonneesP1Aplaties() {
  var items = [];
  DONNEES_SOURCES.forEach(function(cat) {
    var couleur = cat.color || cat.couleur || '#1565C0';
    cat.filtres.forEach(function(f) {
      items.push({
        id:            f.id,
        label:         f.label,
        categorie:     cat.label || cat.categorie || '',
        geometrie:     normaliserGeom(f.geometrie),
        couleur:       couleur,
        derniereAnnee: f.derniereAnnee
      });
    });
  });
  return items;
}

function getDonneesP2Aplaties() {
  var items = [];
  DONNEES_TERRITOIRES.forEach(function(cat) {
    var couleur     = cat.color || cat.couleur || '#546E7A';
    var territoires = cat.territoires || cat.filtres || [];
    territoires.forEach(function(t) {
      items.push({
        id:            t.id,
        label:         t.label,
        categorie:     cat.label || cat.categorie || '',
        geometrie:     normaliserGeom(t.geometrie || 'polygone'),
        couleur:       couleur,
        derniereAnnee: null
      });
    });
  });
  return items;
}

// ============================================================
// 8. POPUP CARTOGRAPHIQUE
// ============================================================

function gererClicCarte(evt) {
  var features = [];
  carto.map.forEachFeatureAtPixel(evt.pixel, function(f) { features.push(f); });
  if (!features.length) { fermerPopup(); return; }

  // Stocker toutes les features superposées + coordonnée géo pour le suivi
  carto.popupNav.features  = features;
  carto.popupNav.layerIdx  = 0;
  carto.popupNav.feature   = features[0];
  carto.popupNav.index     = 0;
  carto.popupNav._coord    = carto.map.getCoordinateFromPixel(evt.pixel);

  afficherPopupItem(0, evt.pixel);
}

/**
 * Formate une date selon sa précision pour affichage dans les boutons de navigation.
 *   "2024"           → "2024"
 *   "2024-05"        → "05/24"
 *   "2024-05-17"     → "17/05/24"
 */
function formaterDateNav(dateStr) {
  if (!dateStr || dateStr === '–') return dateStr;
  var parts = String(dateStr).split('-');
  if (parts.length === 1) {
    // Année seule
    return parts[0];
  } else if (parts.length === 2) {
    // Année + mois  →  MM/YY
    var yy = parts[0].slice(-2);
    return parts[1] + '/' + yy;
  } else {
    // Année + mois + jour  →  JJ/MM/YY
    var yy2 = parts[0].slice(-2);
    return parts[2] + '/' + parts[1] + '/' + yy2;
  }
}

/**
 * Formate une date pour la ligne de métadonnée "Année mesure" (format long lisible).
 *   "2024"        → "2024"
 *   "2024-05"     → "Mai 2024"
 *   "2024-05-17" → "17 mai 2024"
 */
var _MOIS_FR = ['', 'jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin',
                    'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
function formaterDateMeta(dateStr) {
  if (!dateStr || dateStr === '–') return dateStr;
  var parts = String(dateStr).split('-');
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return _MOIS_FR[parseInt(parts[1], 10)] + ' ' + parts[0];
  return parseInt(parts[2], 10) + ' ' + _MOIS_FR[parseInt(parts[1], 10)] + ' ' + parts[0];
}

function afficherPopupItem(idx, pixel) {
  var feature = carto.popupNav.feature;
  if (!feature) return;

  // ── Navigation inter-couches ──────────────────────────────────
  var allFeatures  = carto.popupNav.features || [feature];
  var layerTotal   = allFeatures.length;
  var layerIdx     = carto.popupNav.layerIdx || 0;

  if (layerTotal > 1) {
    $('#popup-layer-nav').show();
    $('#popup-layer-current').text(layerIdx + 1);
    $('#popup-layer-total').text(layerTotal);
    $('#popup-layer-prev').prop('disabled', layerIdx === 0);
    $('#popup-layer-next').prop('disabled', layerIdx === layerTotal - 1);
  } else {
    $('#popup-layer-nav').hide();
  }

  var panel     = feature.get('panel');
  var histo     = (panel === 'p1') ? (feature.get('historique') || []) : [];
  var total     = histo.length;

  // Borner l'index
  idx = Math.max(0, Math.min(idx, total - 1));
  carto.popupNav.index = idx;

  // Valeur et date courantes
  var valeurCourante, dateCourante;
  if (total > 0) {
    valeurCourante = histo[idx].valeur || '–';
    dateCourante   = histo[idx].date   || '–';
  } else {
    valeurCourante = feature.get('valeur') || '–';
    dateCourante   = feature.get('annee')  || '–';
  }

  var label     = feature.get('label')      || feature.get('nom') || 'Élément';
  var territoire= feature.get('territoire') || '–';
  var categorie = feature.get('categorie')  || '–';
  var source    = feature.get('source')     || '–';
  var couleur   = feature.get('couleur')    || '#1565C0';

  // Badge
  $('#popup-badge')
    .text(panel === 'p2' ? 'Territoire' : 'Données')
    .css({ background: couleur + '22', color: couleur });

  // Titre
  $('#popup-titre').text(label);

  // Valeur
  $('#popup-valeur').text(valeurCourante);
  $('#popup-unite').text('');

  // Métadonnée date (format long)
  $('#popup-annee').text(formaterDateMeta(dateCourante));
  $('#popup-territoire').text(territoire);
  $('#popup-categorie').text(categorie);
  $('#popup-source').text(source);

  // ── Navigation temporelle ──────────────────────────────────
  if (panel === 'p1' && total > 1) {
    $('#popup-nav').show();

    // Reconstruire les boutons de date
    var $nav = $('#popup-nav');
    $nav.empty();

    histo.forEach(function(entry, i) {
      var libelle = formaterDateNav(entry.date);
      var $btn = $('<button>')
        .addClass('carto-popup__nav-date')
        .text(libelle)
        .attr('title', formaterDateMeta(entry.date))
        .toggleClass('is-active', i === idx)
        .on('click', (function(capturedIdx) {
          return function() { afficherPopupItem(capturedIdx, null); };
        })(i));
      $nav.append($btn);
    });
  } else {
    $('#popup-nav').hide().empty();
  }

  // Bordure couleur
  $('#carto-popup').css('border-top-color', couleur).addClass('is-visible');

  // Positionnement initial (si pixel fourni)
  if (pixel) {
    repositionnerPopup(pixel);
  }
}

/**
 * Repositionne la popup en fonction d'un pixel carte (coordonnées relatives à la carte).
 * Appelée à l'ouverture ET à chaque frame de rendu pendant le drag/zoom.
 *
 * @param {number[]} pixel  [x, y] en pixels relatifs à l'élément carte OL
 */
function repositionnerPopup(pixel) {
  var mapRect = carto.map.getTargetElement().getBoundingClientRect();
  var vw      = window.innerWidth;
  var vh      = window.innerHeight;
  var pw      = 330;  // largeur max popup
  var ph      = 260;  // hauteur estimée popup
  var margin  = 12;   // marge par rapport aux bords du viewport

  // Coordonnées viewport = offset carte + pixel dans la carte
  var cx = mapRect.left + pixel[0];
  var cy = mapRect.top  + pixel[1];

  // Placement horizontal : à droite du point si possible, sinon à gauche
  var x = cx + 16;
  if (x + pw + margin > vw) { x = cx - pw - 16; }
  x = Math.max(margin, Math.min(x, vw - pw - margin));

  // Placement vertical : en dessous du point si possible, sinon au-dessus
  var y = cy + 16;
  if (y + ph + margin > vh) { y = cy - ph - 16; }
  y = Math.max(margin, Math.min(y, vh - ph - margin));

  $('#carto-popup').css({ left: x + 'px', top: y + 'px', bottom: '', transform: '' });
}

function afficherPopup(feature, pixel) {
  // Compatibilité ascendante
  carto.popupNav.features  = [feature];
  carto.popupNav.layerIdx  = 0;
  carto.popupNav.feature   = feature;
  carto.popupNav.index     = 0;
  carto.popupNav._dragOffset = null; // nouvelle popup → offset réinitialisé
  afficherPopupItem(0, pixel);
}

/**
 * Ferme la popup si elle affiche actuellement un élément de la couche supprimée.
 * Vérifie la feature active ET toutes les features superposées :
 * si la couche supprimée est la seule source → ferme la popup,
 * sinon retire les features de cette couche et rebascule.
 */
function fermerPopupSiCoucheSupprimee(filtreId) {
  if (!carto.popupNav.feature) return;

  // Vérifier si au moins une feature affichée appartient à cette couche
  var restantes = carto.popupNav.features.filter(function(f) {
    return f.get('filtreId') !== filtreId;
  });

  if (restantes.length === 0) {
    // Toutes les features venaient de cette couche → fermer
    fermerPopup();
  } else if (restantes.length < carto.popupNav.features.length) {
    // Il reste des features d'autres couches → retirer celles de la couche supprimée
    carto.popupNav.features = restantes;
    carto.popupNav.layerIdx = 0;
    carto.popupNav.feature  = restantes[0];
    carto.popupNav.index    = 0;
    afficherPopupItem(0, null);
  }
  // Si aucune feature de cette couche dans la popup → rien à faire
}

function fermerPopup() {
  $('#carto-popup').removeClass('is-visible');
  carto.popupNav.feature   = null;
  carto.popupNav.features  = [];
  carto.popupNav.layerIdx  = 0;
  carto.popupNav.index     = 0;
  carto.popupNav._coord    = null;  // stoppe le suivi postrender
  carto.popupNav._dragOffset = null;  // réinitialise l'offset de drag
}

// ============================================================
// 9. LÉGENDE
// ============================================================

function mettreAJourLegende() {
  var $legende = $('#carto-legende');
  var $liste   = $('#legende-liste');

  // Mémorise l'ordre existant avant de vider
  var ordreActuel = [];
  $liste.children('[data-id]').each(function() {
    ordreActuel.push($(this).attr('data-id'));
  });

  $liste.empty();

  var toutesLesCouches = Object.assign({}, carto.couchesP2, carto.couchesP1);
  var ids = Object.keys(toutesLesCouches);

  if (!ids.length) { $legende.hide(); return; }
  $legende.show();

  // Accessibilité : liste ordonnée de couches
  $liste.attr('role', 'list').attr('aria-label', 'Couches affichées, réordonnables');

  // Conserve l'ordre drag & drop existant ; nouvelles couches en haut
  var idsTries = ordreActuel.filter(function(id) { return toutesLesCouches[id]; });
  ids.forEach(function(id) {
    if (idsTries.indexOf(id) === -1) idsTries.unshift(id);
  });

  // Par défaut (1ère fois) : points/lignes devant les polygones
  if (ordreActuel.length === 0) {
    var geomPriorite = function(id) {
      var l = toutesLesCouches[id];
      if (!l) return 99;
      var g = l.get('geometrie') || 'point';
      return g === 'point' ? 0 : (g === 'ligne' ? 1 : 2);
    };
    idsTries.sort(function(a, b) { return geomPriorite(a) - geomPriorite(b); });
  }

  idsTries.forEach(function(id, rank) {
    var layer   = toutesLesCouches[id];
    var couleur = layer.get('couleur');
    var label   = layer.get('label');
    var panel   = layer.get('panel');
    var court   = label.length > 35 ? label.substring(0, 33) + '…' : label;

    var geomLayer = layer.get('geometrie') || 'point';
    if (geomLayer !== 'point' && geomLayer !== 'ligne') geomLayer = 'polygone';


    var $item = $('<div>')
      .addClass('carto-legende__item')
      .attr('data-id', id)
      .attr('data-panel', panel)
      .attr('data-geom', geomLayer)
      .attr('role', 'listitem');

    // Poignée drag & drop
    var $handle = $('<span>')
      .addClass('carto-legende__handle')
      .attr('title', 'Glisser pour réordonner')
      .html('<i class="ph ph-dots-six-vertical"></i>');

    var $puce;
    if (panel === 'p2') {
      $puce = $('<span>').addClass('carto-legende__couleur carto-legende__couleur--zone')
        .css({ background: couleur + '18', border: '2px solid ' + couleur });
    } else {
      $puce = $('<span>').addClass('carto-legende__couleur carto-legende__couleur--point')
        .css('background-color', couleur);
    }

    var $label = $('<span>').addClass('carto-legende__label').text(court);

    // Indicateur de rang (1 = priorité haute = cliquable en premier)
    var $rang = $('<span>').addClass('carto-legende__rang').text(rank + 1);

    // Bouton supprimer la couche
    var $remove = $('<button>')
      .addClass('carto-legende__remove')
      .attr('title', 'Retirer cette couche')
      .attr('aria-label', 'Retirer la couche : ' + court)
      .html('<i class="ph ph-x" aria-hidden="true"></i>');

    // ── Boutons ▲/▼ — alternative clavier au drag-and-drop (RGAA 7.1) ──
    var $btnUp = $('<button>')
      .addClass('carto-legende__reorder-btn carto-legende__reorder-btn--up')
      .attr('aria-label', 'Monter la couche : ' + court)
      .attr('title', 'Monter')
      .html('▲');

    var $btnDown = $('<button>')
      .addClass('carto-legende__reorder-btn carto-legende__reorder-btn--down')
      .attr('aria-label', 'Descendre la couche : ' + court)
      .attr('title', 'Descendre')
      .html('▼');

    var $reorder = $('<div>')
      .addClass('carto-legende__reorder')
      .attr('aria-label', 'Réordonner la couche')
      .append($btnUp, $btnDown);

    (function(capturedId, capturedPanel, capturedLabel) {
      // Suppression
      $remove.on('click', function(e) {
        e.stopPropagation();
        var $cb = $('#filtre-' + capturedPanel + '-' + capturedId);
        if ($cb.length) {
          $cb.prop('checked', false).trigger('change');
        } else {
          if (capturedPanel === 'p1') { supprimerCoucheP1(capturedId); }
          else                        { supprimerCoucheP2(capturedId); }
        }
      });

      // Monter ▲
      $btnUp.on('click', function(e) {
        e.stopPropagation();
        var $item = $(this).closest('[data-id]');
        var $prev = $item.prev('[data-id]');
        if ($prev.length) {
          $prev.before($item);
          appliquerOrdreZIndex();
          // Remettre le focus sur le bouton ▲ du même item après déplacement
          $item.find('.carto-legende__reorder-btn--up').focus();
          // Annonce AT
          if (window.a11yAnnounce) {
            var pos = $item.index() + 1;
            var total = $('#legende-liste [data-id]').length;
            window.a11yAnnounce('Couche « ' + capturedLabel + ' » montée. Position ' + pos + ' sur ' + total + '.');
          }
        }
      });

      // Descendre ▼
      $btnDown.on('click', function(e) {
        e.stopPropagation();
        var $item = $(this).closest('[data-id]');
        var $next = $item.next('[data-id]');
        if ($next.length) {
          $next.after($item);
          appliquerOrdreZIndex();
          // Remettre le focus sur le bouton ▼ du même item après déplacement
          $item.find('.carto-legende__reorder-btn--down').focus();
          // Annonce AT
          if (window.a11yAnnounce) {
            var pos = $item.index() + 1;
            var total = $('#legende-liste [data-id]').length;
            window.a11yAnnounce('Couche « ' + capturedLabel + ' » descendue. Position ' + pos + ' sur ' + total + '.');
          }
        }
      });
    })(id, panel, court);

    $item.append($handle, $reorder, $puce, $label, $rang, $remove);
    $liste.append($item);
  });

  // Applique les zIndex selon l'ordre affiché (premier = zIndex le plus élevé)
  appliquerOrdreZIndex();

  // Initialise (ou réinitialise) SortableJS sur la liste
  initialiserSortableLegende();
}

function appliquerOrdreZIndex() {
  var $liste = $('#legende-liste');
  var items  = $liste.children('[data-id]');
  var total  = items.length;

  // zIndex simple : position dans la liste → premier = le plus haut
  // Plage 100 à 100+total (100 réservé au fond de carte)
  items.each(function(i) {
    var id    = $(this).attr('data-id');
    var panel = $(this).attr('data-panel');
    var z     = 100 + total - i; // premier item = zIndex le plus élevé

    var layer = panel === 'p1' ? carto.couchesP1[id] : carto.couchesP2[id];
    if (layer) layer.setZIndex(z);

    $(this).find('.carto-legende__rang').text(i + 1);
    $(this).find('.carto-legende__handle').attr('title', 'Glisser pour réordonner');

    // Mettre à jour l'état disabled des boutons ▲/▼
    // Premier item : ▲ désactivé | Dernier item : ▼ désactivé
    var $up   = $(this).find('.carto-legende__reorder-btn--up');
    var $down = $(this).find('.carto-legende__reorder-btn--down');
    if ($up.length)   $up.prop('disabled', i === 0);
    if ($down.length) $down.prop('disabled', i === total - 1);
  });
}

var _sortableLegende = null;
function initialiserSortableLegende() {
  var el = document.getElementById('legende-liste');
  if (!el) return;

  // Détruit l'instance précédente si elle existe
  if (_sortableLegende) {
    _sortableLegende.destroy();
    _sortableLegende = null;
  }

  if (typeof Sortable === 'undefined') return;

  _sortableLegende = Sortable.create(el, {
    animation:   150,
    handle:      '.carto-legende__handle',
    ghostClass:  'carto-legende__item--ghost',
    chosenClass: 'carto-legende__item--chosen',
    onEnd: function() {
      appliquerOrdreZIndex();
    }
  });
}

// ============================================================
// 10. TAGS COUCHES ACTIVES
// ============================================================

function ajouterTagCoucheActive(filtreId, label, couleur, panel) {
  var tagId = 'tag-' + panel + '-' + filtreId;
  if ($('#' + tagId).length) return;

  var court = label.length > 28 ? label.substring(0, 26) + '…' : label;
  var $tag  = $('<div>').addClass('carto-couche-tag').attr('id', tagId)
    .css({ 'border-color': couleur, 'color': couleur });
  if (panel === 'p2') $tag.addClass('carto-couche-tag--territoire');

  var $remove = $('<span>').addClass('carto-couche-tag__remove')
    .css('background-color', couleur)
    .html('<i class="ph ph-x"></i>');

  $remove.on('click', function() {
    var $cb = $('#filtre-' + panel + '-' + filtreId);
    if ($cb.length) {
      $cb.prop('checked', false).trigger('change');
    } else {
      if (panel === 'p1') { supprimerCoucheP1(filtreId); }
      else                 { supprimerCoucheP2(filtreId); }
    }
  });

  $tag.append($('<span>').text(court), $remove);
  $('#couches-actives').append($tag);
}

function supprimerTagCouche(filtreId, panel) {
  $('#tag-' + panel + '-' + filtreId).remove();
}

// ============================================================
// 11. BADGES ET COMPTEURS
// ============================================================

function mettreAJourBadgeP1() {
  var n = carto.filtresActifsP1.length;
  var $b = $('#p1-count-badge');
  if (n > 0) $b.text(n).show(); else $b.hide();
}

function mettreAJourBadgeP2() {
  var n = carto.filtresActifsP2.length;
  var $b = $('#p2-count-badge');
  if (n > 0) $b.text(n).show(); else $b.hide();
}

function mettreAJourCompteurGlobal() {
  var n = carto.filtresActifsP1.length + carto.filtresActifsP2.length;
  $('#subnav-filtres-count').text(n);
}

function mettreAJourMessageAucunFiltre() {
  var total = carto.filtresActifsP1.length + carto.filtresActifsP2.length;
  var $msg  = $('#message-aucun-filtre');
  if (total > 0) $msg.removeClass('is-visible');
  else            $msg.addClass('is-visible');
}

// ============================================================
// 12. TOGGLE DES SIDEBARS
// ============================================================

function isMobileCarto() { return window.innerWidth <= 768; }

// Mémorise le dernier panel fermé ('p1' ou 'p2')
var _dernierPanelFerme = 'p1';

// ── Tirette unique : mise à jour (mobile uniquement) ─────────────────────
function mettreAJourTirette() {
  if (!isMobileCarto()) {
    $('#carto-tirette').hide();
    return;
  }
  var p1Ouverte = $('#panel1-sidebar').hasClass('is-open');
  var p2Ouverte = $('#panel2-sidebar').hasClass('is-open');
  var unPanelOuvert = p1Ouverte || p2Ouverte;

  if (unPanelOuvert) {
    // Un panel est visible : pas besoin de tirette
    $('#carto-tirette').hide();
  } else {
    // Aucun panel ouvert : affiche la tirette avec l'icône du dernier fermé
    var $t = $('#carto-tirette');
    var icone = _dernierPanelFerme === 'p2' ? 'ph-map-pin' : 'ph-layer-group';
    $('#tirette-icon').attr('class', 'ph ' + icone);
    $t.toggleClass('is-p2', _dernierPanelFerme === 'p2');
    $t.show();
  }
}

function ouvrirSidebar(panelId, btnId, autrePanelId, autreBtnId) {
  $('#' + btnId).addClass('is-active');
  $('#' + autreBtnId).removeClass('is-active');
  $('#' + panelId).addClass('is-open');
  $('#' + autrePanelId).removeClass('is-open');
  if (isMobileCarto()) {
    $('#carto-sidebar-overlay').addClass('is-visible');
  }
  mettreAJourTirette();
}

function fermerSidebar(panelId, btnId) {
  _dernierPanelFerme = panelId === 'panel1-sidebar' ? 'p1' : 'p2';
  $('#' + panelId).removeClass('is-open');
  $('#' + btnId).removeClass('is-active');
  if (isMobileCarto()) {
    $('#carto-sidebar-overlay').removeClass('is-visible');
  }
  mettreAJourTirette();
}

function fermerSidebarsMobile() {
  // Mémorise lequel était ouvert avant de tout fermer
  if ($('#panel2-sidebar').hasClass('is-open')) _dernierPanelFerme = 'p2';
  else _dernierPanelFerme = 'p1';
  $('#panel1-sidebar, #panel2-sidebar').removeClass('is-open');
  $('#btn-toggle-panel1, #btn-toggle-panel2').removeClass('is-active');
  $('#carto-sidebar-overlay').removeClass('is-visible');
  mettreAJourTirette();
}

function initialiserTogglePanels() {
  // Sur mobile : panel Données ouvert par défaut
  // Sur desktop : panel Données ouvert par défaut (déjà is-open dans le HTML)
  if (isMobileCarto()) {
    // Mobile : on garde le panel1 ouvert par défaut (comportement demandé)
    $('#panel1-sidebar').addClass('is-open');
    $('#btn-toggle-panel1').addClass('is-active');
    $('#carto-sidebar-overlay').addClass('is-visible');
  }

  // Initialise la tirette
  mettreAJourTirette();

  // Boutons subnav : ouvrir/basculer
  $('#btn-toggle-panel1').on('click', function() {
    if ($('#panel1-sidebar').hasClass('is-open')) {
      fermerSidebar('panel1-sidebar', 'btn-toggle-panel1');
    } else {
      ouvrirSidebar('panel1-sidebar', 'btn-toggle-panel1', 'panel2-sidebar', 'btn-toggle-panel2');
    }
  });

  $('#btn-toggle-panel2').on('click', function() {
    if ($('#panel2-sidebar').hasClass('is-open')) {
      fermerSidebar('panel2-sidebar', 'btn-toggle-panel2');
    } else {
      ouvrirSidebar('panel2-sidebar', 'btn-toggle-panel2', 'panel1-sidebar', 'btn-toggle-panel1');
    }
  });

  // Boutons fermer internes aux sidebars
  $('#btn-close-sidebar1').on('click', function() {
    fermerSidebar('panel1-sidebar', 'btn-toggle-panel1');
  });
  $('#btn-close-sidebar2').on('click', function() {
    fermerSidebar('panel2-sidebar', 'btn-toggle-panel2');
  });

  // Tirette unique : rouvre le dernier panel fermé
  $('#carto-tirette').on('click', function() {
    if (_dernierPanelFerme === 'p2') {
      ouvrirSidebar('panel2-sidebar', 'btn-toggle-panel2', 'panel1-sidebar', 'btn-toggle-panel1');
    } else {
      ouvrirSidebar('panel1-sidebar', 'btn-toggle-panel1', 'panel2-sidebar', 'btn-toggle-panel2');
    }
  });

  // Overlay : clic pour fermer (mobile)
  $('#carto-sidebar-overlay').on('click', fermerSidebarsMobile);

  // Touche Escape pour fermer
  $(document).on('keydown', function(e) {
    if (e.key === 'Escape') { fermerSidebarsMobile(); }
  });

  // Redimensionnement : recalcule la tirette
  $(window).on('resize', function() {
    mettreAJourTirette();
  });
}

// ============================================================
// 13. EFFACER TOUT
// ============================================================

function effacerTout() {
  supprimerToutesLesCouchesP1();
  supprimerToutesLesCouchesP2();
  fermerPopup();
  mettreAJourBadgeP1();
  mettreAJourBadgeP2();
  mettreAJourCompteurGlobal();
  mettreAJourMessageAucunFiltre();
  mettreAJourBadgesCategories();
  // Vider les recherches
  ['p1', 'p2'].forEach(function(p) {
    $('#' + p + '-search-input').val('');
    $('#' + p + '-search-clear').hide();
    $('#' + p + '-search-results').hide().empty();
    $('#' + p + '-search-ac').removeClass('is-open');
    $('#' + p + '-filtres-corps').show();
  });
}

// ============================================================
// 14. UTILITAIRES
// ============================================================

/** Normalise les valeurs de géométrie vers 'point', 'ligne', 'polygone' */
function normaliserGeom(g) {
  if (!g) return 'polygone';
  var g2 = g.toString().toLowerCase().trim();
  if (g2 === 'ponctuel' || g2 === 'point' || g2 === 'ponctuell') return 'point';
  if (g2 === 'linéaire' || g2 === 'lineaire' || g2 === 'ligne' || g2 === 'polyligne') return 'ligne';
  return 'polygone';
}

function trouverFiltreP1(id) {
  for (var i = 0; i < DONNEES_SOURCES.length; i++) {
    var filtres = DONNEES_SOURCES[i].filtres;
    for (var j = 0; j < filtres.length; j++) {
      if (filtres[j].id === id) return filtres[j];
    }
  }
  return null;
}

function trouverCategorieP1(filtreId) {
  for (var i = 0; i < DONNEES_SOURCES.length; i++) {
    var cat = DONNEES_SOURCES[i];
    for (var j = 0; j < cat.filtres.length; j++) {
      if (cat.filtres[j].id === filtreId) return cat;
    }
  }
  return null;
}

function trouverFiltreP2(id) {
  for (var i = 0; i < DONNEES_TERRITOIRES.length; i++) {
    var territoires = DONNEES_TERRITOIRES[i].territoires || DONNEES_TERRITOIRES[i].filtres || [];
    for (var j = 0; j < territoires.length; j++) {
      if (territoires[j].id === id) return territoires[j];
    }
  }
  return null;
}

function trouverCategorieP2(filtreId) {
  for (var i = 0; i < DONNEES_TERRITOIRES.length; i++) {
    var cat = DONNEES_TERRITOIRES[i];
    var territoires = cat.territoires || cat.filtres || [];
    for (var j = 0; j < territoires.length; j++) {
      if (territoires[j].id === filtreId) return cat;
    }
  }
  return null;
}

function hexToRgb(hex) {
  var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : {r:0,g:0,b:0};
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Compatibilité ancienne variable globale ───────────────────────────────
var cartographie = carto;

// Exposition pour compatibilité externe (couches:changed event)
function ajouterCoucheIndicateur(id) { ajouterCoucheP1(id); }
function supprimerCoucheIndicateur(id) { supprimerCoucheP1(id); }

// ============================================================
// 15. INITIALISATION GÉNÉRALE
// ============================================================

document.addEventListener('DOMContentLoaded', function() {

  // 1. Carte OL
  initialiserCarte();

  // Forcer la mise à jour de la taille après rendu CSS (fix "width/height = 0")
  // Double rAF + timeout pour garantir que le layout est calculé
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      if (carto.map) {
        carto.map.updateSize();
      }
    });
  });
  setTimeout(function() {
    if (carto.map) {
      carto.map.updateSize();
      console.log('[cartographie] updateSize() appliqué');
    }
  }, 300);

  // 2. Panneaux
  construirePanel1();
  construirePanel2();

  // 3. Défauts P2 (Grand Est actif)
  initDefauts();

  // 4. Toggle sidebars
  initialiserTogglePanels();

  // 5. Recherche Panel 1
  initialiserRecherchePanel({
    inputId:  'p1-search-input',
    clearId:  'p1-search-clear',
    acId:     'p1-search-ac',
    resultsId:'p1-search-results',
    corpsId:  'p1-filtres-corps',
    getData:  getDonneesP1Aplaties,
    onToggle: function(id, checked) {
      var $cb = $('#filtre-p1-' + id);
      if ($cb.length) {
        $cb.prop('checked', checked).trigger('change');
      } else {
        if (checked) {
          if (carto.filtresActifsP1.indexOf(id) === -1) carto.filtresActifsP1.push(id);
          ajouterCoucheP1(id);
        } else {
          carto.filtresActifsP1 = carto.filtresActifsP1.filter(function(x) { return x !== id; });
          supprimerCoucheP1(id);
        }
        mettreAJourBadgeP1();
        mettreAJourMessageAucunFiltre();
      }
    },
    isChecked: function(id) { return carto.filtresActifsP1.indexOf(id) !== -1; }
  });

  // Log
  var totalP1 = DONNEES_SOURCES.reduce(function(s, c) { return s + c.filtres.length; }, 0);
  var totalP2 = DONNEES_TERRITOIRES.reduce(function(s, c) { return s + (c.territoires || c.filtres || []).length; }, 0);
  console.log('[cartographie] Panel 1 :', totalP1, 'filtres – Panel 2 :', totalP2, 'territoires');

  // 6. Recherche Panel 2
  initialiserRecherchePanel({
    inputId:  'p2-search-input',
    clearId:  'p2-search-clear',
    acId:     'p2-search-ac',
    resultsId:'p2-search-results',
    corpsId:  'p2-filtres-corps',
    getData:  getDonneesP2Aplaties,
    onToggle: function(id, checked) {
      var $cb = $('#filtre-p2-' + id);
      if ($cb.length) {
        $cb.prop('checked', checked).trigger('change');
      } else {
        if (checked) {
          if (carto.filtresActifsP2.indexOf(id) === -1) carto.filtresActifsP2.push(id);
          ajouterCoucheP2(id);
        } else {
          carto.filtresActifsP2 = carto.filtresActifsP2.filter(function(x) { return x !== id; });
          supprimerCoucheP2(id);
        }
        mettreAJourBadgeP2();
        mettreAJourMessageAucunFiltre();
      }
    },
    isChecked: function(id) { return carto.filtresActifsP2.indexOf(id) !== -1; }
  });

  // 7. Bouton "Tout effacer"
  $('#btn-effacer-criteres').on('click', effacerTout);
  $('#btn-effacer-panel1').on('click',   supprimerToutesLesCouchesP1);
  $('#btn-effacer-panel2').on('click',   supprimerToutesLesCouchesP2);

  // 8. Fermer popup (la navigation entre dates se fait via les boutons injectés dynamiquement)
  $('#popup-fermer').on('click', fermerPopup);

  // Navigation inter-couches superposées (flèches gauche / droite)
  $('#popup-layer-prev').on('click', function() {
    var newIdx = (carto.popupNav.layerIdx || 0) - 1;
    if (newIdx < 0) return;
    carto.popupNav.layerIdx = newIdx;
    carto.popupNav.feature  = carto.popupNav.features[newIdx];
    carto.popupNav.index    = 0;
    afficherPopupItem(0, null);
  });

  $('#popup-layer-next').on('click', function() {
    var allF   = carto.popupNav.features || [];
    var newIdx = (carto.popupNav.layerIdx || 0) + 1;
    if (newIdx >= allF.length) return;
    carto.popupNav.layerIdx = newIdx;
    carto.popupNav.feature  = allF[newIdx];
    carto.popupNav.index    = 0;
    afficherPopupItem(0, null);
  });

  // Log
  var nbP1 = getDonneesP1Aplaties().length;
  var nbP2 = getDonneesP2Aplaties().length;
  console.log('[Cartographie] Initialisation complète. Panel 1 : ' + nbP1 + ' filtres – Panel 2 : ' + nbP2 + ' territoires.');

  // 9. Écouter le chargement asynchrone des communes (data-communes.js)
  document.addEventListener('communes:loaded', function(evt) {
    var count = evt.detail && evt.detail.count ? evt.detail.count : 0;
    console.log('[cartographie] communes:loaded –', count, 'communes disponibles');

    if (count === 0) return;

    // Mettre à jour le badge de comptage dans l'accordéon Commune
    var $grpCommune = $('#p2-filtres-corps .filtre-groupe[data-categorie="Commune"]');
    if ($grpCommune.length) {
      $grpCommune.find('.filtre-badge-count').text(count);
      // Mettre à jour le texte dans le contenu
      $grpCommune.find('.filtre-groupe__contenu strong:first').text(count + ' communes');
    }

    // La recherche autocomplete utilisera getDonneesP2Aplaties() qui accède
    // dynamiquement à DONNEES_TERRITOIRES, donc les communes seront
    // automatiquement incluses (COMMUNES_TERRITOIRES est déjà rempli)
    console.log('[cartographie] Recherche autocomplete mise à jour avec', count, 'communes');
  });
});
