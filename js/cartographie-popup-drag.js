/**
 * cartographie-popup-drag.js
 * Observatoire de l'Eau Grand Est
 *
 * MODULE ADDITIONNEL — rend la popup cartographique déplaçable par drag
 * sur sa barre haute (topbar), sans modifier le comportement existant.
 *
 * Comportement :
 *  - Drag souris (mousedown/mousemove/mouseup) sur la topbar
 *  - Drag tactile (touchstart/touchmove/touchend) sur la topbar
 *  - Quand l'utilisateur déplace la popup, un offset {dx, dy} est calculé
 *    par rapport au point géo d'ancrage. Le postrender dans cartographie.js
 *    applique cet offset, donc la popup SUIT la carte avec le décalage.
 *  - Double-clic sur la topbar → remet l'offset à zéro (recentre sur le point)
 *  - Le clic sur le bouton Fermer, la nav dates, la nav couches restent inchangés
 *
 * Dépendances : cartographie.js (carto.popupNav, repositionnerPopup)
 */

(function() {
  'use strict';

  var _dragState = {
    active:  false,
    startX:  0,
    startY:  0,
    popupX:  0,
    popupY:  0
  };

  // Attendre que la popup et la carte soient prêtes
  var _initTimer = setInterval(function() {
    var topbar = document.querySelector('.carto-popup__topbar');
    if (topbar && typeof carto !== 'undefined' && carto.map) {
      clearInterval(_initTimer);
      initPopupDrag(topbar);
    }
  }, 150);

  function initPopupDrag(topbar) {
    var popup = document.getElementById('carto-popup');
    if (!popup) return;

    // ── Style curseur sur la topbar ──
    topbar.style.cursor = 'grab';
    topbar.style.touchAction = 'none';

    // ══════════════════════════════════════════════
    // SOURIS
    // ══════════════════════════════════════════════
    topbar.addEventListener('mousedown', function(e) {
      if (e.target.closest('.carto-popup__close')) return;
      e.preventDefault();
      startDrag(e.clientX, e.clientY, popup, topbar);
    });

    document.addEventListener('mousemove', function(e) {
      if (!_dragState.active) return;
      e.preventDefault();
      moveDrag(e.clientX, e.clientY, popup);
    });

    document.addEventListener('mouseup', function() {
      if (!_dragState.active) return;
      endDrag(popup, topbar);
    });

    // ══════════════════════════════════════════════
    // TACTILE
    // ══════════════════════════════════════════════
    topbar.addEventListener('touchstart', function(e) {
      if (e.target.closest('.carto-popup__close')) return;
      if (e.touches.length !== 1) return;
      e.preventDefault();
      var t = e.touches[0];
      startDrag(t.clientX, t.clientY, popup, topbar);
    }, { passive: false });

    document.addEventListener('touchmove', function(e) {
      if (!_dragState.active) return;
      if (e.touches.length !== 1) return;
      e.preventDefault();
      var t = e.touches[0];
      moveDrag(t.clientX, t.clientY, popup);
    }, { passive: false });

    document.addEventListener('touchend', function() {
      if (!_dragState.active) return;
      endDrag(popup, topbar);
    });

    document.addEventListener('touchcancel', function() {
      if (!_dragState.active) return;
      endDrag(popup, topbar);
    });

    // ══════════════════════════════════════════════
    // DOUBLE-CLIC → recentrer sur le point d'origine
    // ══════════════════════════════════════════════
    topbar.addEventListener('dblclick', function(e) {
      if (e.target.closest('.carto-popup__close')) return;
      e.preventDefault();

      // Remettre l'offset à zéro
      carto.popupNav._dragOffset = null;

      // Repositionner sur le point géo si dispo
      if (carto.popupNav._coord) {
        var pixel = carto.map.getPixelFromCoordinate(carto.popupNav._coord);
        if (pixel && typeof repositionnerPopup === 'function') {
          repositionnerPopup(pixel);
        }
      }
    });

    console.log('[popup-drag] Drag activé sur la popup cartographique');
  }

  // ──────────────────────────────────────────────
  // Fonctions de drag
  // ──────────────────────────────────────────────

  function startDrag(clientX, clientY, popup, topbar) {
    _dragState.active = true;
    _dragState.startX = clientX;
    _dragState.startY = clientY;

    // Position actuelle de la popup (fixed)
    var rect = popup.getBoundingClientRect();
    _dragState.popupX = rect.left;
    _dragState.popupY = rect.top;

    popup.style.pointerEvents = 'auto';
    popup.style.transition = 'none';
    topbar.style.cursor = 'grabbing';

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }

  function moveDrag(clientX, clientY, popup) {
    var dx = clientX - _dragState.startX;
    var dy = clientY - _dragState.startY;

    var newX = _dragState.popupX + dx;
    var newY = _dragState.popupY + dy;

    // Contraindre dans le viewport
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var pw = popup.offsetWidth;
    var ph = popup.offsetHeight;

    newX = Math.max(0, Math.min(newX, vw - pw));
    newY = Math.max(0, Math.min(newY, vh - ph));

    popup.style.left = newX + 'px';
    popup.style.top  = newY + 'px';
    popup.style.bottom = '';
    popup.style.transform = '';

    // Calculer l'offset par rapport au point géo d'ancrage
    // pour que postrender maintienne ce décalage quand la carte bouge
    if (carto.popupNav._coord) {
      var pixel = carto.map.getPixelFromCoordinate(carto.popupNav._coord);
      if (pixel) {
        var mapRect = carto.map.getTargetElement().getBoundingClientRect();
        var anchorX = mapRect.left + pixel[0];
        var anchorY = mapRect.top  + pixel[1];
        carto.popupNav._dragOffset = {
          dx: newX - anchorX,
          dy: newY - anchorY
        };
      }
    }
  }

  function endDrag(popup, topbar) {
    _dragState.active = false;
    topbar.style.cursor = 'grab';

    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }

})();
