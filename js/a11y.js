/**
 * a11y.js
 * Script d'accessibilité RGAA 4.1 – Observatoire de l'Eau Grand Est
 * À inclure en DERNIER sur toutes les pages (après jQuery et les autres scripts).
 *
 * Corrections :
 *  1. Méga-menu : navigation clavier (Tab, Escape, flèches)
 *  2. Autocomplétion : role=combobox, aria-activedescendant, flèches haut/bas
 *  3. aria-hidden sur toutes les icônes Font Awesome décoratives
 *  4. aria-current="page" sur le lien actif
 *  5. Annonceur live region pour les messages dynamiques
 *  6. Chips de filtre : aria-pressed
 *  7. Accordéons : aria-expanded / aria-controls
 *  8. SVG logos : role="img" + aria-label
 */
(function () {
  'use strict';

  /* ── Utilitaire : attendre le DOM ─────────────────────────── */
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ============================================================
     1. ANNONCEUR ARIA LIVE REGION
     Permet d'annoncer n'importe quel message aux AT via :
       window.a11yAnnounce('3 résultats trouvés');
     ============================================================ */
  var _announcer = null;
  function createAnnouncer() {
    if (_announcer) return;
    _announcer = document.createElement('div');
    _announcer.setAttribute('role', 'status');
    _announcer.setAttribute('aria-live', 'polite');
    _announcer.setAttribute('aria-atomic', 'true');
    _announcer.className = 'a11y-announcer sr-only';
    _announcer.id = 'a11y-announcer';
    document.body.appendChild(_announcer);
  }
  window.a11yAnnounce = function (msg) {
    if (!_announcer) createAnnouncer();
    /* Reset puis set pour forcer la lecture même si le message est identique */
    _announcer.textContent = '';
    setTimeout(function () { _announcer.textContent = msg; }, 50);
  };

  /* ============================================================
     2. ARIA-HIDDEN SUR LES ICÔNES DÉCORATIVES FONT AWESOME
     Critères RGAA 1.1, 1.2 : toute icône purement décorative
     doit avoir aria-hidden="true" pour être ignorée par les AT.
     ============================================================ */
  function patchIcones() {
    /* Sélectionne tous les <i> et <span> avec classes Font Awesome */
    var icones = document.querySelectorAll(
      'i.fa, i.fas, i.far, i.fab, i.fal, i.fad, i.fa-solid, i.fa-regular, i.fa-brands'
    );
    icones.forEach(function (el) {
      /* Ne pas écraser si déjà géré */
      if (el.getAttribute('aria-hidden') || el.getAttribute('aria-label')) return;
      /* Si le parent est un lien ou bouton sans autre texte → ajouter aria-label au parent */
      var parent = el.parentElement;
      var parentText = parent ? (parent.textContent || '').trim() : '';
      if (parentText === '' && parent && (parent.tagName === 'A' || parent.tagName === 'BUTTON')) {
        /* Icône seule dans un lien/bouton sans texte → besoin d'un label */
        var title = parent.getAttribute('title') || parent.getAttribute('data-label') || '';
        if (title) {
          parent.setAttribute('aria-label', title);
        }
      }
      el.setAttribute('aria-hidden', 'true');
    });
  }

  /* ============================================================
     3. SVG LOGOS : role="img" + aria-label
     Critère RGAA 1.1 : les SVG porteurs de sens doivent avoir
     un rôle et un label.
     ============================================================ */
  function patchSVGLogos() {
    var svgs = document.querySelectorAll('.site-header__logo-img, .hp-nav__logo-img');
    svgs.forEach(function (el) {
      if (el.tagName === 'svg') {
        el.setAttribute('role', 'img');
        if (!el.getAttribute('aria-label')) {
          el.setAttribute('aria-label', 'Observatoire de l\'Eau Grand Est');
        }
        /* Masquer les paths décoratifs internes */
        el.querySelectorAll('circle, path').forEach(function (p) {
          p.setAttribute('aria-hidden', 'true');
        });
      }
    });
    /* Logo img */
    var imgs = document.querySelectorAll('img.hp-nav__logo-img, img.site-header__logo-img');
    imgs.forEach(function (img) {
      if (!img.getAttribute('alt')) {
        img.setAttribute('alt', 'Région Grand Est');
      }
    });
  }

  /* ============================================================
     4. NAVIGATION PRINCIPALE : aria-label + aria-current
     Critères RGAA 12.6, 6.1
     ============================================================ */
  function patchNav() {
    /* aria-label sur les <nav> sans label */
    var navs = document.querySelectorAll('nav, .site-header__nav, .hp-nav__links');
    navs.forEach(function (nav) {
      if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
        nav.setAttribute('aria-label', 'Navigation principale');
      }
    });

    /* aria-current="page" sur le lien actif */
    var actifs = document.querySelectorAll(
      '.site-header__nav-link.is-active, .hp-nav__link.is-active, [aria-current="page"]'
    );
    actifs.forEach(function (lien) {
      if (!lien.getAttribute('aria-current')) {
        lien.setAttribute('aria-current', 'page');
      }
    });

    /* Liens href="#" : ajouter un avertissement accessible */
    var liensVides = document.querySelectorAll('a[href="#"]:not([aria-label]):not([aria-disabled])');
    liensVides.forEach(function (lien) {
      var texte = (lien.textContent || '').trim();
      if (texte) {
        lien.setAttribute('aria-label', texte + ' (page en construction)');
        lien.setAttribute('aria-disabled', 'true');
        lien.addEventListener('click', function (e) { e.preventDefault(); });
      }
    });
  }

  /* ============================================================
     5. MÉGA-MENU ACCESSIBLE AU CLAVIER
     Critère RGAA 7.1 : composant JS accessible clavier.
     - Ouverture au focus (focus-within géré en CSS)
     - Escape : ferme le menu et replace le focus sur le bouton
     - Tab : navigation naturelle dans le menu
     ============================================================ */
  function patchMegaMenu() {
    var containers = document.querySelectorAll('.has-megamenu');
    containers.forEach(function (container) {
      var trigger = container.querySelector('a, button');
      var menu = container.querySelector('.megamenu');
      if (!trigger || !menu) return;

      /* Attributs ARIA sur le déclencheur */
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      var menuId = 'megamenu-' + Math.random().toString(36).slice(2, 7);
      menu.id = menu.id || menuId;
      trigger.setAttribute('aria-controls', menu.id);

      /* Mettre à jour aria-expanded selon focus-within */
      function setExpanded(val) {
        trigger.setAttribute('aria-expanded', val ? 'true' : 'false');
      }

      container.addEventListener('focusin', function () { setExpanded(true); });
      container.addEventListener('focusout', function (e) {
        if (!container.contains(e.relatedTarget)) setExpanded(false);
      });
      container.addEventListener('mouseenter', function () { setExpanded(true); });
      container.addEventListener('mouseleave', function () { setExpanded(false); });

      /* Escape : ferme le menu et replace le focus */
      container.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          setExpanded(false);
          trigger.focus();
        }
      });

      /* Flèche bas depuis le trigger : entre dans le menu */
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          var premier = menu.querySelector('a, button');
          if (premier) premier.focus();
        }
      });
    });
  }

  /* ============================================================
     6. AUTOCOMPLÉTION ACCESSIBLE (role=combobox)
     Critère RGAA 7.1, 11.13
     Appliqué sur les champs de recherche avec dropdown
     ============================================================ */
  function patchAutocomplete() {
    var paires = [
      /* { input: '#id-input', listbox: '#id-dropdown' } */
      { input: '#listing-search',   listbox: '#listing-autocomplete' },
      { input: '#tdbv2-search',     listbox: '#tdbv2-autocomplete' },
      { input: '#p1-search-input',  listbox: '#p1-search-ac' },
      { input: '#p2-search-input',  listbox: '#p2-search-ac' }
    ];

    paires.forEach(function (paire) {
      var input   = document.querySelector(paire.input);
      var listbox = document.querySelector(paire.listbox);
      if (!input || !listbox) return;

      /* Vérifier qu'un label existe */
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby') &&
          !document.querySelector('label[for="' + input.id + '"]')) {
        input.setAttribute('aria-label', input.getAttribute('placeholder') || 'Rechercher');
      }

      /* Rôle combobox */
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('autocomplete', 'off');

      var listboxId = listbox.id || ('listbox-' + Math.random().toString(36).slice(2, 7));
      listbox.id = listboxId;
      listbox.setAttribute('role', 'listbox');
      input.setAttribute('aria-controls', listboxId);

      /* Observer les mutations du listbox pour mettre à jour aria-expanded */
      var observer = new MutationObserver(function () {
        var ouvert = listbox.classList.contains('is-open');
        input.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      });
      observer.observe(listbox, { attributes: true, attributeFilter: ['class'] });

      /* Attribuer role="option" + id aux items au moment où ils sont créés.
         RGAA 7.3 — On utilise requestAnimationFrame pour garantir que le DOM
         est stabilisé avant d'injecter les rôles ARIA, même en cas de rendu
         très rapide ou de batch innerHTML.                                     */
      function appliquerRolesOptions() {
        requestAnimationFrame(function () {
          var items = listbox.querySelectorAll(
            '.autocomplete-item, .tdbv2-ac-item, li'
          );
          items.forEach(function (item, idx) {
            if (!item.getAttribute('role')) {
              item.setAttribute('role', 'option');
              item.id = listboxId + '-opt-' + idx;
              item.setAttribute('aria-selected', 'false');
            }
          });
        });
      }
      var itemObserver = new MutationObserver(appliquerRolesOptions);
      itemObserver.observe(listbox, { childList: true, subtree: true });

      /* Navigation clavier : flèches haut/bas, Entrée, Escape */
      var activeIdx = -1;
      input.addEventListener('keydown', function (e) {
        var items = Array.from(listbox.querySelectorAll('[role="option"]'));
        if (!items.length || !listbox.classList.contains('is-open')) {
          if (e.key === 'Escape') { input.blur(); }
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeIdx = Math.min(activeIdx + 1, items.length - 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeIdx = Math.max(activeIdx - 1, 0);
        } else if (e.key === 'Enter' && activeIdx >= 0) {
          e.preventDefault();
          items[activeIdx].click();
          activeIdx = -1;
          return;
        } else if (e.key === 'Escape') {
          listbox.classList.remove('is-open');
          input.setAttribute('aria-expanded', 'false');
          activeIdx = -1;
          return;
        } else {
          return;
        }

        /* Mettre à jour aria-activedescendant et la classe active */
        items.forEach(function (item, i) {
          item.setAttribute('aria-selected', i === activeIdx ? 'true' : 'false');
          item.classList.toggle('is-active', i === activeIdx);
        });
        if (items[activeIdx]) {
          input.setAttribute('aria-activedescendant', items[activeIdx].id);
          items[activeIdx].scrollIntoView({ block: 'nearest' });
        }
      });

      /* Reset activeIdx quand le listbox se ferme */
      input.addEventListener('blur', function () {
        setTimeout(function () { activeIdx = -1; }, 200);
      });
    });
  }

  /* ============================================================
     7. CHIPS DE FILTRE : aria-pressed
     Critère RGAA 7.1 : les boutons à bascule doivent avoir
     aria-pressed reflétant leur état.
     ============================================================ */
  function patchChips() {
    /* Cible les chips de filtre de tous types (filter-chip, tdbv2-chip, cat-btn, faq-filter-btn) */
    var chips = document.querySelectorAll(
      '.filter-chip, .tdbv2-chip[data-type], .tdbv2-chip[data-echelle], .cat-btn, .faq-filter-btn, .outils-filter-btn'
    );
    chips.forEach(function (chip) {
      if (!chip.getAttribute('aria-pressed')) {
        chip.setAttribute('aria-pressed', chip.classList.contains('is-active') ? 'true' : 'false');
      }
      /* Observateur pour synchroniser aria-pressed avec la classe is-active */
      var obs = new MutationObserver(function () {
        chip.setAttribute('aria-pressed', chip.classList.contains('is-active') ? 'true' : 'false');
      });
      obs.observe(chip, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ============================================================
     8. ACCORDÉONS : aria-expanded + aria-controls
     Critère RGAA 7.1
     ============================================================ */
  function patchAccordeons() {
    /* Accordéons du panneau Territoires (cartographie) */
    document.querySelectorAll('.accordion-button, .tdbv2-acc-header').forEach(function (btn) {
      var bodyId = btn.getAttribute('data-bs-target') ||
                   btn.getAttribute('aria-controls') ||
                   (btn.nextElementSibling && btn.nextElementSibling.id) || '';
      if (bodyId && !btn.getAttribute('aria-controls')) {
        btn.setAttribute('aria-controls', bodyId.replace('#', ''));
      }
      if (!btn.hasAttribute('aria-expanded')) {
        btn.setAttribute('aria-expanded', btn.classList.contains('is-open') ? 'true' : 'false');
      }
      /* Synchroniser aria-expanded au clic */
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
  }

  /* ============================================================
     9. LABELS MANQUANTS SUR LES SÉLECTEURS D'ANNÉE
     Critère RGAA 11.1
     ============================================================ */
  function patchLabels() {
    var selects = [
      { id: 'listing-filtre-annee', label: 'Filtrer par année' },
      { id: 'tdbv2-year',           label: 'Filtrer par année' }
    ];
    selects.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (!el) return;
      if (!document.querySelector('label[for="' + s.id + '"]') &&
          !el.getAttribute('aria-label')) {
        el.setAttribute('aria-label', s.label);
      }
    });

    /* Champs de recherche sans label */
    var inputs = [
      { id: 'listing-search', label: 'Rechercher un tableau de bord ou territoire' },
      { id: 'tdbv2-search',   label: 'Rechercher un territoire ou une commune' },
      { id: 'p1-search-input', label: 'Rechercher une donnée source' },
      { id: 'p2-search-input', label: 'Rechercher un territoire' }
    ];
    inputs.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (!el) return;
      if (!document.querySelector('label[for="' + s.id + '"]') &&
          !el.getAttribute('aria-label')) {
        el.setAttribute('aria-label', s.label);
      }
    });
  }

  /* ============================================================
     10. MAIN LANDMARK MANQUANT
     Critère RGAA 9.2 : <main> doit être présent et unique
     ============================================================ */
  function patchMain() {
    /* Si pas de <main> sur la page, chercher le premier grand conteneur */
    if (!document.querySelector('main')) {
      var candidats = [
        document.querySelector('.listing-page'),
        document.querySelector('.tdbv2-body')?.parentElement,
        document.querySelector('.dashboard-page'),
        document.querySelector('.my-tdb-page')
      ].filter(Boolean);
      if (candidats[0]) {
        /* Changer le rôle plutôt que la balise pour éviter de casser le rendu */
        candidats[0].setAttribute('role', 'main');
        if (!candidats[0].id) candidats[0].id = 'main-content';
      }
    } else {
      var main = document.querySelector('main');
      if (!main.id) main.id = 'main-content';
    }
  }

  /* ============================================================
     11. RÉGIONS LIVE POUR LES MISES À JOUR DYNAMIQUES
     Critère RGAA 7.3
     ============================================================ */
  function patchLiveRegions() {
    /* Compteurs de résultats → annoncer les changements */
    var compteurs = [
      document.getElementById('listing-count'),
      document.getElementById('tdbv2-count'),
      document.getElementById('subnav-filtres-count')
    ];
    compteurs.forEach(function (el) {
      if (el && !el.getAttribute('aria-live')) {
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-atomic', 'true');
      }
    });

    /* Popup cartographique */
    var popup = document.getElementById('carto-popup');
    if (popup && !popup.getAttribute('aria-live')) {
      popup.setAttribute('role', 'dialog');
      popup.setAttribute('aria-modal', 'false');
      popup.setAttribute('aria-label', 'Informations sur la donnée sélectionnée');
    }
  }

  /* ============================================================
     12. LIENS OUVRANT UNE NOUVELLE FENETRE
     Critere RGAA 13.2 : tout lien target="_blank" doit signaler
     l'ouverture d'une nouvelle fenetre aux technologies d'assistance.
     Strategie : ajout d'un span.sr-only si non deja present.
     ============================================================ */
  function patchLiensNouvelleFenetre() {
    var liens = document.querySelectorAll('a[target="_blank"]');
    liens.forEach(function (lien) {
      /* Ne pas ajouter si deja mentionne dans aria-label */
      var ariaLabel = lien.getAttribute('aria-label') || '';
      if (ariaLabel.toLowerCase().indexOf('nouvelle fen') !== -1 ||
          ariaLabel.toLowerCase().indexOf('nouvel onglet') !== -1) return;

      /* Ne pas ajouter si deja present dans le texte visible */
      var texte = (lien.textContent || '').toLowerCase();
      if (texte.indexOf('nouvelle fen') !== -1 ||
          texte.indexOf('nouvel onglet') !== -1) return;

      /* Ajouter le span sr-only */
      var span = document.createElement('span');
      span.className = 'sr-only';
      span.textContent = ' (nouvelle fenetre)';
      lien.appendChild(span);

      /* S'assurer que rel contient noopener noreferrer */
      var rel = lien.getAttribute('rel') || '';
      if (rel.indexOf('noopener') === -1) {
        lien.setAttribute('rel', (rel + ' noopener noreferrer').trim());
      }
    });
  }

  /* ============================================================
     13. IMAGES FALLBACK (onerror) — RGAA 1.1 / 1.2
     Quand une image se casse et injecte un fallback via onerror,
     les icônes FA dans ce fallback ne sont pas patchées par
     patchIcones() car elles sont créées après l'observation.
     On écoute l'événement 'error' sur toutes les images et on
     patche les icônes dans le parent immédiatement après injection.
     ============================================================ */
  function patchImgFallbacks() {
    /* Écoute globale sur les images — délégation depuis document */
    document.addEventListener('error', function (e) {
      var img = e.target;
      if (img.tagName !== 'IMG') return;
      /* Petit délai pour laisser le onerror inline s'exécuter et injecter le HTML */
      setTimeout(function () {
        var parent = img.parentElement;
        if (!parent) return;
        /* Masquer toutes les icônes FA générées dans le fallback */
        parent.querySelectorAll(
          'i[class*="fa "], i[class*="fa-"], i.fa, i.fas, i.far, i.fab'
        ).forEach(function (ico) {
          if (!ico.getAttribute('aria-hidden')) {
            ico.setAttribute('aria-hidden', 'true');
          }
        });
        /* Marquer le conteneur fallback comme décoratif */
        var fallback = parent.querySelector(
          '.actu-card__img-fallback, .carto-actu-une__img-fallback, ' +
          '.carto-actu-item__fallback, .article-hero__img-fallback, ' +
          '.sugg-card__img-fallback'
        );
        if (fallback && !fallback.getAttribute('aria-hidden')) {
          fallback.setAttribute('aria-hidden', 'true');
        }
      }, 0);
    }, true /* capture pour attraper l'événement avant qu'il remonte */);
  }

  /* ============================================================
     14. BOUTONS SANS TEXTE ACCESSIBLE
     Critère RGAA 6.1, 11.9 : tout bouton doit avoir un intitulé
     ============================================================ */
  function patchBoutons() {
    var boutons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    boutons.forEach(function (btn) {
      var texte = (btn.textContent || '').trim();
      var titre = btn.getAttribute('title') || '';
      if (!texte && titre) {
        btn.setAttribute('aria-label', titre);
      } else if (!texte && !titre) {
        /* Bouton vraiment vide : utiliser le premier icône trouvé */
        var icone = btn.querySelector('[class*="fa-"]');
        if (icone) {
          var classe = Array.from(icone.classList).find(function (c) { return c.startsWith('fa-'); });
          if (classe) {
            btn.setAttribute('aria-label', classe.replace('fa-', '').replace(/-/g, ' '));
          }
        }
      }
    });
  }

  /* ============================================================
     INITIALISATION
     ============================================================ */
  onReady(function () {
    createAnnouncer();
    patchIcones();
    patchSVGLogos();
    patchNav();
    patchMegaMenu();
    patchAutocomplete();
    patchChips();
    patchAccordeons();
    patchLabels();
    patchMain();
    patchLiveRegions();
    patchLiensNouvelleFenetre();
    patchImgFallbacks();
    patchBoutons();

    /* Observer les mutations DOM futures (contenu chargé dynamiquement) */
    var observer = new MutationObserver(function (mutations) {
      var hasNewNodes = mutations.some(function (m) { return m.addedNodes.length > 0; });
      if (hasNewNodes) {
        patchIcones();
        patchChips();
        patchAccordeons();
        patchBoutons();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[a11y] Patch RGAA 4.1 appliqué');
  });

})();
