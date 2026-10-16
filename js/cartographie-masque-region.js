/* ============================================================
 *  cartographie-masque-region.js
 *  Masque semi-transparent hors région Grand Est
 *
 *  Technique : polygone inversé (world polygon avec un trou
 *  en forme de Grand Est). Tout ce qui est hors de la région
 *  est recouvert d'un voile blanc semi-opaque.
 *
 *  Le masque est activé/désactivé automatiquement selon que
 *  la couche Grand Est est visible ou non.
 *
 *  Dépendances : ol (OpenLayers), cartographie.js (carto.map),
 *                data-territoires.js (DONNEES_TERRITOIRES)
 * ============================================================ */

(function () {
  'use strict';

  /* ── Configuration ─────────────────────────────────────────── */
  var MASQUE_FILL_COLOR   = 'rgba(255, 255, 255, 0.55)'; // voile blanc 55 %
  var MASQUE_STROKE_COLOR = '#1A237E';                    // contour Grand Est
  var MASQUE_STROKE_WIDTH = 3;                            // épaisseur contour
  var MASQUE_ZINDEX       = 2;                            // au-dessus du fond, sous P2 (5) et P1 (10)

  /* Le « monde » : très grand rectangle en lon/lat qui couvre tout */
  var WORLD = [
    [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]
  ];

  /* ── Récupération des coordonnées Grand Est ────────────────── */
  function getGrandEstCoords() {
    for (var i = 0; i < DONNEES_TERRITOIRES.length; i++) {
      var cat = DONNEES_TERRITOIRES[i];
      if (cat.id === 'grand-est') {
        var territoires = cat.territoires || [];
        for (var j = 0; j < territoires.length; j++) {
          if (territoires[j].coords && territoires[j].coords.length > 2) {
            return territoires[j].coords;
          }
        }
      }
    }
    return null;
  }

  /* ── Construction du masque inversé ────────────────────────── */
  function creerMasqueRegion() {
    var geCoords = getGrandEstCoords();
    if (!geCoords) {
      console.warn('[masque-region] Coordonnées Grand Est introuvables.');
      return null;
    }

    // Anneau extérieur (monde) et anneau intérieur (trou = Grand Est)
    // OpenLayers Polygon : premier anneau = extérieur, suivants = trous
    var worldRing = WORLD.map(function (c) { return ol.proj.fromLonLat(c); });
    var holeRing  = geCoords.map(function (c) { return ol.proj.fromLonLat(c); });

    var masqueGeom = new ol.geom.Polygon([worldRing, holeRing]);
    var masqueFeature = new ol.Feature({ geometry: masqueGeom });
    masqueFeature.set('type', 'masque-region');

    /* ── Couche contour séparé (pour un trait net autour de la région) ── */
    var contourGeom = new ol.geom.Polygon([geCoords.map(function (c) {
      return ol.proj.fromLonLat(c);
    })]);
    var contourFeature = new ol.Feature({ geometry: contourGeom });
    contourFeature.set('type', 'contour-region');

    var source = new ol.source.Vector({
      features: [masqueFeature, contourFeature]
    });

    var layer = new ol.layer.Vector({
      source: source,
      style: function (feature) {
        if (feature.get('type') === 'masque-region') {
          return new ol.style.Style({
            fill: new ol.style.Fill({ color: MASQUE_FILL_COLOR })
          });
        }
        // Contour de la région
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: MASQUE_STROKE_COLOR,
            width: MASQUE_STROKE_WIDTH
          }),
          fill: new ol.style.Fill({ color: 'rgba(0,0,0,0)' }) // transparent
        });
      },
      zIndex: MASQUE_ZINDEX,
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });

    layer.set('id', 'masque-grand-est');
    layer.set('label', 'Masque Grand Est');

    return layer;
  }

  /* ── Initialisation ────────────────────────────────────────── */
  function init() {
    if (typeof carto === 'undefined' || !carto.map) {
      // Ré-essayer après un court délai si la carte n'est pas encore prête
      setTimeout(init, 200);
      return;
    }

    var masqueLayer = creerMasqueRegion();
    if (!masqueLayer) return;

    carto.map.addLayer(masqueLayer);
    carto.masqueRegion = masqueLayer;

    console.log('[masque-region] Masque Grand Est activé');

    // ── Synchronisation visibilité avec la couche P2 Grand Est ──
    // Le masque est toujours visible par défaut (la région Grand Est
    // est cochée par défaut). Si l'utilisateur décoche Grand Est,
    // on masque le masque également.
    _observerCoucheGrandEst();
  }

  /**
   * Observe les changements sur la couche P2 Grand Est et synchronise
   * la visibilité du masque.
   */
  function _observerCoucheGrandEst() {
    // Monkey-patch ajouterCoucheP2 et supprimerCoucheP2 pour intercepter
    // les toggles de la couche Grand Est.
    var _origAjouter   = window.ajouterCoucheP2;
    var _origSupprimer = window.supprimerCoucheP2;

    if (typeof _origAjouter === 'function') {
      window.ajouterCoucheP2 = function (filtreId) {
        _origAjouter.apply(this, arguments);
        if (_isGrandEst(filtreId) && carto.masqueRegion) {
          carto.masqueRegion.setVisible(true);
        }
      };
    }

    if (typeof _origSupprimer === 'function') {
      window.supprimerCoucheP2 = function (filtreId) {
        _origSupprimer.apply(this, arguments);
        if (_isGrandEst(filtreId) && carto.masqueRegion) {
          carto.masqueRegion.setVisible(false);
        }
      };
    }
  }

  function _isGrandEst(filtreId) {
    return filtreId === 'grand-est-region' || filtreId === 't-region-grand-est';
  }

  /* ── Lancement ─────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Petit délai pour laisser cartographie.js initialiser la carte
    setTimeout(init, 300);
  }

})();
