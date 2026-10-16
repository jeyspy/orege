/**
 * megamenu.js
 * ============================================================
 * Méga-menu "Tableaux de bord" partagé par toutes les pages
 * Observatoire de l'Eau – Grand Est
 *
 * Dépend de : data-tdb-territoires.js (TDB_MEGAMENU, TDB_TYPES_CONFIG)
 * Utilisation : inclure ce script APRÈS data-tdb-territoires.js
 *
 * Le script cherche tous les éléments .js-megamenu-tdb dans la page
 * et les peuple avec le contenu du méga-menu.
 * ============================================================
 */
(function() {
  'use strict';

  var ANNEE_DEFAUT = 2025;

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function typeCfg(type) {
    if (typeof TDB_TYPES_CONFIG !== 'undefined' && TDB_TYPES_CONFIG[type]) {
      return TDB_TYPES_CONFIG[type];
    }
    return { couleur: '#546E7A', icone: 'fa-map', rang: 99 };
  }

  /**
   * Détermine le préfixe de chemin relatif
   * selon la profondeur de la page courante.
   */
  function getPathPrefix() {
    var path = window.location.pathname;
    // Si on est dans /template/ → préfixe vide (tableau-de-bord.html est au même niveau)
    if (path.indexOf('/template/') !== -1) {
      return '';
    }
    // Sinon (index.html à la racine)
    return 'template/';
  }

  /**
   * Construit le HTML du méga-menu et l'injecte dans les conteneurs.
   */
  function buildMegaMenu() {
    if (typeof TDB_MEGAMENU === 'undefined') {
      console.warn('[megamenu] TDB_MEGAMENU non défini – data-tdb-territoires.js chargé ?');
      return;
    }

    var prefix = getPathPrefix();
    var tdbListUrl = prefix + 'tableaux-de-bord.html';
    var monTdbUrl = prefix + 'mon-tableau-de-bord.html';

    // Trier les types par rang
    var ordreTypes = Object.keys(TDB_TYPES_CONFIG).filter(function(type) {
      return TDB_MEGAMENU[type] && TDB_MEGAMENU[type].length > 0;
    });
    ordreTypes.sort(function(a, b) {
      return (typeCfg(a).rang || 99) - (typeCfg(b).rang || 99);
    });

    // Construire les colonnes HTML
    var colsHtml = '';
    ordreTypes.forEach(function(type) {
      var items = TDB_MEGAMENU[type];
      var cfg = typeCfg(type);
      var linksHtml = items.map(function(t) {
        var url = prefix + 'tableau-de-bord.html?territoire=' +
          encodeURIComponent(t.nom) + '&annee=' + ANNEE_DEFAUT;
        return '<a href="' + url + '" class="megamenu__link">' +
          '<span class="megamenu__link-dot" style="background:' + cfg.couleur + '"></span>' +
          escHtml(t.nom) +
          '</a>';
      }).join('');

      colsHtml += '<div class="megamenu__col">' +
        '<div class="megamenu__col-title" style="color:' + cfg.couleur + '">' +
          '<i class="fa ' + cfg.icone + '"></i> ' + escHtml(type) +
        '</div>' +
        linksHtml +
        '</div>';
    });

    // Footer
    var footerHtml = '<div class="megamenu__footer">' +
      '<a href="' + tdbListUrl + '" class="megamenu__footer-link"><i class="fa fa-th"></i> Tous les territoires</a>' +
      '<a href="' + monTdbUrl + '" class="megamenu__footer-link"><i class="fa fa-sliders"></i> Mon tableau de bord</a>' +
      '</div>';

    var html = colsHtml + footerHtml;

    // Injecter dans tous les conteneurs
    var containers = document.querySelectorAll('.js-megamenu-tdb');
    containers.forEach(function(el) {
      el.innerHTML = html;
    });

    console.log('[megamenu] Construit –',
      ordreTypes.length, 'types,',
      ordreTypes.reduce(function(n, t) { return n + (TDB_MEGAMENU[t] || []).length; }, 0),
      'territoires phares');
  }

  // Lancer après le DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildMegaMenu);
  } else {
    buildMegaMenu();
  }

})();
