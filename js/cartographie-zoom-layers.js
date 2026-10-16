/**
 * cartographie-zoom-layers.js
 * Observatoire de l'Eau Grand Est
 *
 * MODULE ADDITIONNEL — ne modifie AUCUN fichier existant.
 *
 * Responsabilités :
 *  1. Initialiser le bloc "zoom indicator" (barre verticale, graduations, curseur)
 *  2. Écouter les changements de zoom OL et mettre à jour le curseur
 *  3. Surveiller les couches actives (P1 + P2) : si une couche possède
 *     une propriété `zoomMin` ou `zoomMax` dans ses données source,
 *     afficher un marqueur sur la barre et un item dans la liste.
 *  4. Montrer/masquer dynamiquement les couches OL lorsque le zoom
 *     sort de la plage [zoomMin, zoomMax] de chaque couche.
 *
 * Convention des données :
 *   Dans DONNEES_SOURCES (data-carto-sources.js) ou DONNEES_TERRITOIRES,
 *   un filtre peut avoir :
 *     zoomMin: 10     → couche visible uniquement à partir du zoom 10
 *     zoomMax: 14     → couche visible jusqu'au zoom 14 (masquée au-delà)
 *   Si aucune des deux propriétés n'est définie, la couche est libre.
 *
 * Dépendances : jQuery, cartographie.js (chargé avant), OpenLayers 9
 */

(function() {
  'use strict';

  // Attendre l'init de la carte (cartographie.js crée carto.map dans DOMContentLoaded)
  // On utilise un petit poll pour laisser cartographie.js s'initialiser d'abord.
  var _initTimer = setInterval(function() {
    if (typeof carto !== 'undefined' && carto.map && carto.view) {
      clearInterval(_initTimer);
      initZoomIndicator();
    }
  }, 100);

  // ───────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ───────────────────────────────────────────────────────────────
  var MIN_ZOOM, MAX_ZOOM, ZOOM_RANGE;

  // Cache des restrictions connues (par filtreId)
  // { filtreId: { zoomMin, zoomMax, label, couleur, panel } }
  var _zoomRestrictions = {};

  // ───────────────────────────────────────────────────────────────
  // INITIALISATION
  // ───────────────────────────────────────────────────────────────
  function initZoomIndicator() {
    MIN_ZOOM   = carto.view.getMinZoom();
    MAX_ZOOM   = carto.view.getMaxZoom();
    ZOOM_RANGE = MAX_ZOOM - MIN_ZOOM;

    // Affiche les limites dans le HTML
    var elMin = document.getElementById('zoom-indicator-min');
    var elMax = document.getElementById('zoom-indicator-max');
    if (elMin) elMin.textContent = MIN_ZOOM;
    if (elMax) elMax.textContent = MAX_ZOOM;

    // Construire les graduations
    buildScale();

    // Écouter le zoom
    carto.view.on('change:resolution', onZoomChange);
    onZoomChange(); // init

    // Surveiller les couches actives (polling léger, 500ms)
    setInterval(syncActiveLayers, 500);

    // Clic sur la jauge → zoomer au niveau correspondant
    initTrackClick();

    // Clic sur les marqueurs de flux → zoomer au niveau du seuil
    initMarkerClick();

    // Décorer les items de filtre dans le sidebar avec un badge zoom
    decorateSidebarFilters();

    console.log('[zoom-layers] Indicateur de zoom initialisé — plage', MIN_ZOOM, '→', MAX_ZOOM);
  }

  // ───────────────────────────────────────────────────────────────
  // GRADUATION (ticks)
  // ───────────────────────────────────────────────────────────────
  function buildScale() {
    var el = document.getElementById('zoom-indicator-scale');
    if (!el) return;
    el.innerHTML = '';

    // Afficher un tick tous les 2 niveaux, plus le min et le max
    var ticks = [];
    for (var z = MAX_ZOOM; z >= MIN_ZOOM; z--) {
      if (z === MAX_ZOOM || z === MIN_ZOOM || z % 2 === 0) {
        ticks.push(z);
      }
    }

    ticks.forEach(function(z) {
      var div = document.createElement('div');
      div.className = 'zoom-indicator__tick';
      div.innerHTML =
        '<span class="zoom-indicator__tick-label">' + z + '</span>' +
        '<span class="zoom-indicator__tick-line"></span>';
      el.appendChild(div);
    });
  }

  // ───────────────────────────────────────────────────────────────
  // MISE À JOUR DU CURSEUR
  // ───────────────────────────────────────────────────────────────
  function onZoomChange() {
    var z = carto.view.getZoom();
    var pct = ((z - MIN_ZOOM) / ZOOM_RANGE) * 100;
    pct = Math.max(0, Math.min(100, pct));

    // Valeur affichée
    var zRound = Math.round(z * 10) / 10;
    var elValue = document.getElementById('zoom-indicator-value');
    if (elValue) elValue.textContent = zRound;

    // Curseur
    var elCursor = document.getElementById('zoom-indicator-cursor');
    if (elCursor) elCursor.style.bottom = pct + '%';

    // Remplissage
    var elFill = document.getElementById('zoom-indicator-fill');
    if (elFill) elFill.style.height = pct + '%';

    // Label curseur (mobile)
    var elCurLabel = document.getElementById('zoom-indicator-cursor-label');
    if (elCurLabel) elCurLabel.textContent = zRound;

    // Mettre à jour la visibilité des couches zoom-restreintes
    updateLayerVisibility(z);

    // Mettre à jour les badges dans la liste
    updateLayerListBadges(z);

    // Mettre à jour l'état warning des marqueurs
    updateMarkerStates(z);
  }

  // ───────────────────────────────────────────────────────────────
  // SYNC DES COUCHES ACTIVES
  // Détecte les couches P1/P2 actives ayant des restrictions de zoom
  // et met à jour les marqueurs + la liste
  // ───────────────────────────────────────────────────────────────
  function syncActiveLayers() {
    var oldIds = Object.keys(_zoomRestrictions);
    var newRestrictions = {};

    // P1 — Données sources
    carto.filtresActifsP1.forEach(function(filtreId) {
      var filtre = trouverFiltreP1(filtreId);
      if (!filtre) return;
      if (filtre.zoomMin != null || filtre.zoomMax != null) {
        var cat = trouverCategorieP1(filtreId);
        newRestrictions[filtreId] = {
          zoomMin: filtre.zoomMin != null ? filtre.zoomMin : MIN_ZOOM,
          zoomMax: filtre.zoomMax != null ? filtre.zoomMax : MAX_ZOOM,
          label:   filtre.label,
          couleur: cat ? (cat.color || cat.couleur) : '#1565C0',
          panel:   'p1'
        };
      }
    });

    // P2 — Territoires
    carto.filtresActifsP2.forEach(function(filtreId) {
      var filtre = trouverFiltreP2(filtreId);
      if (!filtre) return;
      if (filtre.zoomMin != null || filtre.zoomMax != null) {
        var cat = trouverCategorieP2(filtreId);
        newRestrictions[filtreId] = {
          zoomMin: filtre.zoomMin != null ? filtre.zoomMin : MIN_ZOOM,
          zoomMax: filtre.zoomMax != null ? filtre.zoomMax : MAX_ZOOM,
          label:   filtre.label,
          couleur: cat ? (cat.color || cat.couleur || '#546E7A') : '#546E7A',
          panel:   'p2'
        };
      }
    });

    var newIds = Object.keys(newRestrictions);

    // Si rien n'a changé, skip
    if (arraysEqual(oldIds.sort(), newIds.sort())) return;

    _zoomRestrictions = newRestrictions;
    rebuildMarkers();
    rebuildLayerList();
    updateContainerWidth();

    // Forcer la visibilité immédiate
    updateLayerVisibility(carto.view.getZoom());
    updateLayerListBadges(carto.view.getZoom());
    updateMarkerStates(carto.view.getZoom());
  }

  // ───────────────────────────────────────────────────────────────
  // MARQUEURS SUR LA BARRE
  // ───────────────────────────────────────────────────────────────
  function rebuildMarkers() {
    var container = document.getElementById('zoom-indicator-markers');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(_zoomRestrictions).forEach(function(filtreId) {
      var r = _zoomRestrictions[filtreId];

      // Marqueur pour zoomMin (seuil d'apparition)
      if (r.zoomMin > MIN_ZOOM) {
        var pct = ((r.zoomMin - MIN_ZOOM) / ZOOM_RANGE) * 100;
        var marker = document.createElement('div');
        marker.className = 'zoom-marker';
        marker.setAttribute('data-filtre', filtreId);
        marker.setAttribute('data-type', 'min');
        marker.style.bottom = pct + '%';

        marker.innerHTML =
          '<span class="zoom-marker__line" style="background:' + r.couleur + ';"></span>' +
          '<span class="zoom-marker__arrow" style="border-left-color:' + r.couleur + ';"></span>' +
          '<span class="zoom-marker__tooltip">≥ ' + r.zoomMin + ' : ' + truncate(r.label, 30) + '</span>';

        container.appendChild(marker);
      }

      // Marqueur pour zoomMax (seuil de disparition)
      if (r.zoomMax < MAX_ZOOM) {
        var pctMax = ((r.zoomMax - MIN_ZOOM) / ZOOM_RANGE) * 100;
        var markerMax = document.createElement('div');
        markerMax.className = 'zoom-marker';
        markerMax.setAttribute('data-filtre', filtreId);
        markerMax.setAttribute('data-type', 'max');
        markerMax.style.bottom = pctMax + '%';

        markerMax.innerHTML =
          '<span class="zoom-marker__line" style="background:' + r.couleur + '; opacity:.4;"></span>' +
          '<span class="zoom-marker__arrow" style="border-left-color:' + r.couleur + '; opacity:.4;"></span>' +
          '<span class="zoom-marker__tooltip">≤ ' + r.zoomMax + ' : ' + truncate(r.label, 30) + '</span>';

        container.appendChild(markerMax);
      }
    });
  }

  function updateMarkerStates(z) {
    var markers = document.querySelectorAll('.zoom-marker');
    markers.forEach(function(marker) {
      var filtreId = marker.getAttribute('data-filtre');
      var type     = marker.getAttribute('data-type');
      var r        = _zoomRestrictions[filtreId];
      if (!r) return;

      if (type === 'min') {
        // Clignote si le zoom est en dessous du seuil
        if (z < r.zoomMin) {
          marker.classList.add('zoom-marker--warning');
        } else {
          marker.classList.remove('zoom-marker--warning');
        }
      } else {
        // Clignote si le zoom est au-dessus du seuil max
        if (z > r.zoomMax) {
          marker.classList.add('zoom-marker--warning');
        } else {
          marker.classList.remove('zoom-marker--warning');
        }
      }
    });
  }

  // ───────────────────────────────────────────────────────────────
  // LISTE DES COUCHES RESTREINTES (sous la barre)
  // ───────────────────────────────────────────────────────────────
  function rebuildLayerList() {
    var container = document.getElementById('zoom-indicator-layers');
    if (!container) return;
    container.innerHTML = '';

    var ids = Object.keys(_zoomRestrictions);
    if (!ids.length) {
      container.style.display = 'none';
      return;
    }
    container.style.display = '';

    ids.forEach(function(filtreId) {
      var r = _zoomRestrictions[filtreId];
      var item = document.createElement('div');
      item.className = 'zoom-layer-item';
      item.setAttribute('data-filtre', filtreId);

      // Pastille
      var dot = document.createElement('span');
      dot.className = 'zoom-layer-item__dot';
      dot.style.background = r.couleur;

      // Label
      var label = document.createElement('span');
      label.className = 'zoom-layer-item__label';
      label.title = r.label;
      label.textContent = truncate(r.label, 22);

      // Badge
      var badge = document.createElement('span');
      badge.className = 'zoom-layer-item__badge';
      badge.setAttribute('data-filtre-badge', filtreId);

      item.appendChild(dot);
      item.appendChild(label);
      item.appendChild(badge);
      container.appendChild(item);
    });
  }

  function updateLayerListBadges(z) {
    Object.keys(_zoomRestrictions).forEach(function(filtreId) {
      var r     = _zoomRestrictions[filtreId];
      var badge = document.querySelector('[data-filtre-badge="' + filtreId + '"]');
      var item  = document.querySelector('.zoom-layer-item[data-filtre="' + filtreId + '"]');
      if (!badge || !item) return;

      var visible = z >= r.zoomMin && z <= r.zoomMax;

      if (visible) {
        badge.className = 'zoom-layer-item__badge zoom-layer-item__badge--ok';
        badge.textContent = '✓ visible';
        item.classList.remove('is-hidden');
        item.classList.add('is-visible');
      } else {
        var needed = z < r.zoomMin ? r.zoomMin : r.zoomMax;
        var direction = z < r.zoomMin ? '≥ ' + needed : '≤ ' + needed;
        badge.className = 'zoom-layer-item__badge zoom-layer-item__badge--need';
        badge.textContent = 'zoom ' + direction;
        item.classList.remove('is-visible');
        item.classList.add('is-hidden');
      }
    });
  }

  // ───────────────────────────────────────────────────────────────
  // VISIBILITÉ DES COUCHES OL
  // Ne modifie pas les fonctions existantes (ajouterCoucheP1, etc.)
  // On utilise layer.setVisible() pour montrer/masquer.
  // ───────────────────────────────────────────────────────────────
  function updateLayerVisibility(z) {
    Object.keys(_zoomRestrictions).forEach(function(filtreId) {
      var r = _zoomRestrictions[filtreId];
      var layer = r.panel === 'p1' ? carto.couchesP1[filtreId] : carto.couchesP2[filtreId];
      if (!layer) return;

      var shouldBeVisible = z >= r.zoomMin && z <= r.zoomMax;
      // Seulement changer si nécessaire
      if (layer.getVisible() !== shouldBeVisible) {
        layer.setVisible(shouldBeVisible);
      }
    });
  }

  // ───────────────────────────────────────────────────────────────
  // LARGEUR DU CONTENEUR
  // ───────────────────────────────────────────────────────────────
  function updateContainerWidth() {
    var el = document.getElementById('zoom-indicator');
    if (!el) return;
    var hasLayers = Object.keys(_zoomRestrictions).length > 0;
    el.classList.toggle('has-layers', hasLayers);
  }

  // ───────────────────────────────────────────────────────────────
  // DÉCORATION DES FILTRES SIDEBAR
  // Ajoute un petit badge « zoom ≥ X » sur les items de filtre dans
  // les panneaux latéraux, sans modifier creerItemFiltre().
  // ───────────────────────────────────────────────────────────────
  function decorateSidebarFilters() {
    // Attendre que les panels soient construits (petit délai)
    setTimeout(function() {
      // P1
      if (typeof DONNEES_SOURCES !== 'undefined') {
        DONNEES_SOURCES.forEach(function(cat) {
          cat.filtres.forEach(function(f) {
            if (f.zoomMin != null || f.zoomMax != null) {
              addSidebarBadge('p1-' + f.id, f.zoomMin, f.zoomMax);
            }
          });
        });
      }
      // P2
      if (typeof DONNEES_TERRITOIRES !== 'undefined') {
        DONNEES_TERRITOIRES.forEach(function(cat) {
          var list = cat.territoires || cat.filtres || [];
          list.forEach(function(f) {
            if (f.zoomMin != null || f.zoomMax != null) {
              addSidebarBadge('p2-' + f.id, f.zoomMin, f.zoomMax);
            }
          });
        });
      }
    }, 600);
  }

  function addSidebarBadge(prefixedId, zoomMin, zoomMax) {
    var el = document.querySelector('.filtre-item[data-id="' + prefixedId + '"]');
    if (!el) return;
    // Don't add twice
    if (el.querySelector('.zoom-sidebar-badge')) return;

    var badge = document.createElement('span');
    badge.className = 'zoom-sidebar-badge';
    badge.title = 'Cette couche nécessite un niveau de zoom spécifique pour être visible';

    var parts = [];
    if (zoomMin != null && zoomMin > MIN_ZOOM) parts.push('≥ ' + zoomMin);
    if (zoomMax != null && zoomMax < MAX_ZOOM) parts.push('≤ ' + zoomMax);
    badge.innerHTML = '<i class="ph ph-magnifying-glass-plus" style="font-size:9px;"></i> ' + parts.join(' ');

    el.appendChild(badge);
  }

  // ───────────────────────────────────────────────────────────────
  // CLIC SUR LA JAUGE (TRACK) → ZOOM AU NIVEAU CORRESPONDANT
  // ───────────────────────────────────────────────────────────────
  function initTrackClick() {
    // Écouter le clic sur la piste, le remplissage et la zone d'échelle
    var elTrack = document.getElementById('zoom-indicator-track');
    var elScale = document.getElementById('zoom-indicator-scale');
    var elWrap  = document.querySelector('.zoom-indicator__track-wrap');

    if (elWrap) {
      elWrap.addEventListener('click', function(e) {
        // Ignorer les clics sur le curseur lui-même
        if (e.target.closest('.zoom-indicator__cursor')) return;
        // Ignorer les clics sur les marqueurs (traités séparément)
        if (e.target.closest('.zoom-marker')) return;

        // Calculer le % depuis le bas de la track-wrap
        var rect = elWrap.getBoundingClientRect();
        var clickY = e.clientY - rect.top;
        // Inverser : le haut = zoom max, le bas = zoom min
        var pctFromBottom = 1 - (clickY / rect.height);
        pctFromBottom = Math.max(0, Math.min(1, pctFromBottom));

        var targetZoom = MIN_ZOOM + (pctFromBottom * ZOOM_RANGE);
        // Arrondir au 0.5 le plus proche pour un zoom propre
        targetZoom = Math.round(targetZoom * 2) / 2;
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));

        carto.view.animate({
          zoom: targetZoom,
          duration: 300
        });
      });
    }
  }

  // ───────────────────────────────────────────────────────────────
  // CLIC SUR LES MARQUEURS DE FLUX → ZOOM AU NIVEAU DU SEUIL
  // ───────────────────────────────────────────────────────────────
  function initMarkerClick() {
    // Délégation d'événements sur le conteneur de marqueurs
    var container = document.getElementById('zoom-indicator-markers');
    if (!container) return;

    container.addEventListener('click', function(e) {
      var marker = e.target.closest('.zoom-marker');
      if (!marker) return;

      var filtreId = marker.getAttribute('data-filtre');
      var type     = marker.getAttribute('data-type');
      var r        = _zoomRestrictions[filtreId];
      if (!r) return;

      // Zoomer au seuil du marqueur
      var targetZoom = (type === 'min') ? r.zoomMin : r.zoomMax;

      carto.view.animate({
        zoom: targetZoom,
        duration: 400
      });
    });

    // Aussi : clic sur les items de la liste de couches
    var layerList = document.getElementById('zoom-indicator-layers');
    if (layerList) {
      layerList.addEventListener('click', function(e) {
        var item = e.target.closest('.zoom-layer-item');
        if (!item) return;

        var filtreId = item.getAttribute('data-filtre');
        var r = _zoomRestrictions[filtreId];
        if (!r) return;

        var z = carto.view.getZoom();
        var targetZoom;

        // Si le zoom actuel est en dessous du min, zoomer au min
        if (z < r.zoomMin) {
          targetZoom = r.zoomMin;
        // Si au-dessus du max, zoomer au max
        } else if (z > r.zoomMax) {
          targetZoom = r.zoomMax;
        // Sinon on est déjà dans la plage, ne rien faire
        } else {
          return;
        }

        carto.view.animate({
          zoom: targetZoom,
          duration: 400
        });
      });
    }
  }

  // ───────────────────────────────────────────────────────────────
  // UTILITAIRES
  // ───────────────────────────────────────────────────────────────
  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max - 1) + '…' : str;
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

})();
