/* ============================================================
   js/cartographie-drawers.js
   Gestion des drawers latéraux et des panneaux flottants
   de la page template/cartographie.html

   Responsabilités :
     1. Drawers (Actualités · Retex · Liens utiles)
        – Ouverture / fermeture via boutons flottants
        – Fermeture via overlay, bouton ✕, touche Échap
        – Un seul drawer ouvert à la fois
     2. Panneaux flottants bas-droite (onglets RETEX / Liens utiles)
        – Toggle actif sur les onglets
        – Affichage / masquage des panels correspondants

   Dépendances :
     - cartographie.js  (logique carte OpenLayers)
     - nav.js           (navigation principale)
     - a11y.js          (correctifs RGAA)
     - css/cartographie.css (styles des drawers et boutons)
============================================================ */

/* ================================================================
   1. GESTION UNIFIÉE DES 3 DRAWERS : Actualités · Retex · Liens utiles
   Les drawers s'affichent sous la barre subnav (top:154px)
   et sont fermables via : bouton ✕ | clic overlay | touche Échap
================================================================ */
(function() {
  'use strict';

  var DRAWERS = [
    { btnId: 'btn-open-actu',   drawerId: 'carto-actu-drawer',   closeId: 'btn-close-actu'  },
    { btnId: 'btn-open-retex',  drawerId: 'carto-retex-drawer',  closeId: 'btn-close-retex' },
    { btnId: 'btn-open-liens',  drawerId: 'carto-liens-drawer',  closeId: 'btn-close-liens' }
  ];
  var overlay = document.getElementById('carto-actu-overlay');

  /* ----- fermer tous les drawers ----- */
  function closeAll() {
    DRAWERS.forEach(function(d) {
      var el  = document.getElementById(d.drawerId);
      var btn = document.getElementById(d.btnId);
      if (!el) return;
      el.style.transform = 'translateX(100%)';
      if (btn) btn.setAttribute('aria-expanded', 'false');
      setTimeout(function() { el.setAttribute('hidden', ''); }, 300);
    });
    if (overlay) overlay.classList.remove('is-open');
  }

  /* ----- ouvrir un drawer spécifique ----- */
  function openDrawer(targetBtnId, targetDrawerId) {
    /* Fermer immédiatement tout drawer déjà ouvert */
    DRAWERS.forEach(function(d) {
      if (d.drawerId === targetDrawerId) return;
      var el  = document.getElementById(d.drawerId);
      var btn = document.getElementById(d.btnId);
      if (!el) return;
      el.style.transform = 'translateX(100%)';
      if (btn) btn.setAttribute('aria-expanded', 'false');
      setTimeout(function() { el.setAttribute('hidden', ''); }, 300);
    });

    var drawer = document.getElementById(targetDrawerId);
    var btn    = document.getElementById(targetBtnId);
    if (!drawer) return;

    drawer.removeAttribute('hidden');
    if (overlay) overlay.classList.add('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'true');

    /* On force le reflow avant d'appliquer la transition */
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        drawer.style.transform = 'translateX(0)';
      });
    });
  }

  /* ----- brancher chaque bouton d'ouverture ----- */
  DRAWERS.forEach(function(d) {
    var btn   = document.getElementById(d.btnId);
    var close = document.getElementById(d.closeId);

    if (btn) {
      btn.addEventListener('click', function() {
        var drawer = document.getElementById(d.drawerId);
        /* Toggle : si déjà ouvert → fermer ; sinon → ouvrir */
        if (drawer && !drawer.hasAttribute('hidden')) {
          closeAll();
        } else {
          openDrawer(d.btnId, d.drawerId);
        }
      });
    }

    /* Bouton ✕ dans l'en-tête du drawer */
    if (close) {
      close.addEventListener('click', function() { closeAll(); });
    }
  });

  /* ----- clic sur l'overlay → fermer tout ----- */
  if (overlay) overlay.addEventListener('click', function() { closeAll(); });

  /* ----- touche Échap → fermer tout ----- */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var anyOpen = DRAWERS.some(function(d) {
        var el = document.getElementById(d.drawerId);
        return el && !el.hasAttribute('hidden');
      });
      if (anyOpen) closeAll();
    }
  });

})();

/* ================================================================
   2. PANNEAUX FLOTTANTS BAS-DROITE (onglets RETEX / Liens utiles)
================================================================ */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var tabs   = document.querySelectorAll('.carto-float-tab');
    var panels = document.querySelectorAll('.carto-float-panel');

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var targetId = tab.dataset.panel;

        /* Onglets — activer le tab cliqué */
        tabs.forEach(function(t) {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-expanded', t === tab ? 'true' : 'false');
        });

        /* Panneaux — afficher le panel correspondant */
        panels.forEach(function(p) {
          if (p.id === targetId) {
            p.removeAttribute('hidden');
          } else {
            p.setAttribute('hidden', '');
          }
        });
      });
    });
  });

})();
