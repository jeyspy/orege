/**
 * nav.js — Navigation principale + mégamenu pleine largeur
 * Observatoire de l'Eau Grand Est
 *
 * Usage : inclure après jQuery + ce fichier dans chaque page.
 * Le HTML du header + footer est injecté automatiquement.
 */

(function($) {
  'use strict';

  /* ── Config des chemins ────────────────────────────────────── */
  var isTemplate = window.location.pathname.indexOf('/template/') !== -1;
  var ROOT = isTemplate ? '../' : '';
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function tplHref(page) {
    return isTemplate ? page : 'template/' + page;
  }

  /* MM_TERRITOIRES — noms exacts + échelle correspondant à data-indicateurs.js / TERRITOIRES {}
     echelle  = clé de l'objet TERRITOIRES (Grand Est, Département, EPCI, Bassin versant, SCoT…)
     territoire = valeur exacte dans la liste (utilisée comme ?territoire= dans l'URL)
  */
  var MM_TERRITOIRES = {
    region: [
      { nom: 'Tout le territoire Grand Est', label: 'Grand Est', echelle: 'Grand Est' }
    ],
    departements: [
      { nom: 'Bas-Rhin (67)',           label: 'Bas-Rhin',           echelle: 'Département' },
      { nom: 'Moselle (57)',             label: 'Moselle',             echelle: 'Département' },
      { nom: 'Marne (51)',               label: 'Marne',               echelle: 'Département' },
      { nom: 'Meurthe-et-Moselle (54)', label: 'Meurthe-et-Moselle', echelle: 'Département' },
      { nom: 'Haut-Rhin (68)',           label: 'Haut-Rhin',           echelle: 'Département' },
      { nom: 'Ardennes (08)',            label: 'Ardennes',            echelle: 'Département' },
      { nom: 'Vosges (88)',              label: 'Vosges',              echelle: 'Département' },
      { nom: 'Aube (10)',                label: 'Aube',                echelle: 'Département' },
      { nom: 'Meuse (55)',               label: 'Meuse',               echelle: 'Département' },
      { nom: 'Haute-Marne (52)',         label: 'Haute-Marne',         echelle: 'Département' }
    ],
    epci: [
      { nom: 'Eurométropole de Strasbourg',    label: 'Eurométropole de Strasbourg',    echelle: 'EPCI' },
      { nom: 'CU du Grand Reims',              label: 'CU du Grand Reims',              echelle: 'EPCI' },
      { nom: 'Metz Métropole',                 label: 'Metz Métropole',                 echelle: 'EPCI' },
      { nom: 'CA Mulhouse Alsace Agglomération', label: 'CA Mulhouse Alsace Agglomération', echelle: 'EPCI' },
      { nom: 'Métropole du Grand Nancy',       label: 'Métropole du Grand Nancy',       echelle: 'EPCI' }
    ],
    bassins: [
      { nom: 'Rhin',    label: 'Rhin',    echelle: 'Bassin versant' },
      { nom: 'Moselle', label: 'Moselle', echelle: 'Bassin versant' },
      { nom: 'Meuse',   label: 'Meuse',   echelle: 'Bassin versant' },
      { nom: 'Marne',   label: 'Marne',   echelle: 'Bassin versant' },
      { nom: 'Aube',    label: 'Aube',    echelle: 'Bassin versant' }
    ]
  };

  /* ── Construction du mégamenu Territoires ─────────────────── */
  function buildTerritoiresMegamenuHTML(id, label, listingPage) {
    var iconGroupe = {
      region:       'ph-map-trifold',
      departements: 'ph-map-trifold',
      epci:         'ph-buildings',
      bassins:      'ph-wave-sine'
    };
    var labelGroupe = {
      region:       'Région',
      departements: 'Départements',
      epci:         'Agglomérations (EPCI)',
      bassins:      'Bassins versants'
    };

    // Dashboard destination URL — tableau de bord élu V2 (with echelle + territoire params)
    var tdbPage = tplHref('tableau-de-bord-elu-v2.html');

    var html = '<div class="orege-megamenu orege-megamenu--territoires" id="mm-' + id + '" role="dialog" aria-label="Menu ' + label + '">';
    html += '<div class="orege-megamenu__inner orege-megamenu__inner--territoires">';

    ['region', 'departements', 'epci', 'bassins'].forEach(function(groupe) {
      var items = MM_TERRITOIRES[groupe];
      html += '<div class="orege-megamenu__col">'
        + '<div class="orege-megamenu__col-title">'
        + '<i class="ph ' + iconGroupe[groupe] + '"></i>'
        + labelGroupe[groupe]
        + '</div>'
        + '<ul class="orege-megamenu__links">';

      items.forEach(function(t) {
        var href = tdbPage
          + '?echelle=' + encodeURIComponent(t.echelle)
          + '&territoire=' + encodeURIComponent(t.nom);
        html += '<li><a class="orege-megamenu__link orege-mm-territoire-link" href="' + href + '">' 
          + '<span class="orege-megamenu__link-body">'
          + '<span class="orege-megamenu__link-label">' + t.label + '</span>'
          + '</span></a></li>';
      });

      html += '</ul></div>';
    });

    // 'Explorer' column: link to the territory listing page
    html += '<div class="orege-megamenu__col orege-mm-territoire-all-col">'
      + '<div class="orege-megamenu__col-title"><i class="ph ph-list" aria-hidden="true"></i> Explorer</div>'
      + '<ul class="orege-megamenu__links">'
      + '<li><a class="orege-megamenu__link" href="' + listingPage + '">'
      + '<i class="ph ph-magnifying-glass" aria-hidden="true"></i>'
      + '<span class="orege-megamenu__link-body">'
      + '<span class="orege-megamenu__link-label">Rechercher un territoire</span>'
      + '<span class="orege-megamenu__link-desc">Commune, EPCI, SAGE, bassin versant…</span>'
      + '</span></a></li>'
      + '<li><a class="orege-megamenu__link" href="' + tdbPage + '">'
      + '<i class="ph ph-squares-four" aria-hidden="true"></i>'
      + '<span class="orege-megamenu__link-body">'
      + '<span class="orege-megamenu__link-label">Tous les territoires</span>'
      + '<span class="orege-megamenu__link-desc">Vue d\'ensemble du Grand Est</span>'
      + '</span></a></li>'
      + '</ul>'
      + '</div>';

    html += '</div>'; // Close orege-megamenu__inner
    html += '</div>'; // Close orege-megamenu
    return html;
  }
  var ACTU_UNE = {
    href: ROOT + 'article.html',
    cat: 'Climat &amp; Sécheresse',
    catBg: '#FFF3E0',
    catFg: '#E65100',
    title: 'Bilan de la sécheresse 2024 en Grand Est : des nappes sous tension continue',
    excerpt: "Les nappes phréatiques ont atteint des seuils d'alerte dans le Bas-Rhin, la Marne et les Ardennes, prolongeant une tendance déficitaire depuis 2021.",
    date: '15 fév. 2025',
    author: 'Équipe Orège',
    img: 'https://sspark.genspark.ai/cfimages?u1=asdnvMq1ObDpkYobNurc3IjPYnwUA45yge9rGkxbD%2BEHwdnUFpL%2Fo9ZqxcDwzWwMdUKp72KGdiw0UeKlOwwjG62M5K%2F7InbHJLfae0l7gdokau3rtBbOfBGeF0mjEb6C9D6nDspANA%3D%3D&u2=FBy%2Bg5wVC%2B4Gp1a1&width=400'
  };

  var ACTU_LISTE = [
    { href: ROOT + 'article.html', cat: 'Gouvernance',       catFg: '#2E7D32', title: 'Révision du SDAGE 2028-2033 : quels enjeux pour la région ?',            date: '3 fév. 2025'  },
    { href: ROOT + 'article.html', cat: 'Milieux aquatiques', catFg: '#00796B', title: 'Retour du saumon atlantique dans la Moselle : un signal positif',        date: '20 jan. 2025' },
    { href: ROOT + 'article.html', cat: 'Qualité des eaux',   catFg: '#0288D1', title: 'Nitrates dans les eaux souterraines : tendances 2024 en Grand Est',     date: '8 jan. 2025'  },
    { href: ROOT + 'article.html', cat: "Usages de l'eau",    catFg: '#1565C0', title: 'Rendement des réseaux AEP : où en est le Grand Est en 2024 ?',          date: '15 déc. 2024' },
    { href: ROOT + 'article.html', cat: 'Gestion quantitative', catFg: '#6A1B9A', title: 'Nappe rhénane : bilan 2024 et perspectives climatiques',              date: '2 déc. 2024'  }
  ];

  /* ── NAV_CONFIG ────────────────────────────────────────────── */
  var NAV_CONFIG = [

    // ── L'Observatoire ──────────────────────────────────────────
    {
      id: 'observatoire',
      label: "L'observatoire",
      icon: 'ph-info',
      megaType: 'observatoire',
      entries: [
        { label: 'Présentation',          desc: 'Contexte, objectifs et sources de données',    icon: 'ph-info',           href: ROOT + 'observatoire.html' },
        { label: 'Comprendre les enjeux', desc: "Enjeux de l'eau à court, moyen et long terme", icon: 'ph-chart-line',  href: ROOT + 'enjeux.html' },
        { label: "L'équipe",              desc: 'Les acteurs derrière la plateforme',            icon: 'ph-users',          href: ROOT + 'equipe.html' }
      ]
    },

    // ── Je suis ──────────────────────────────────────────────────
    {
      id: 'je-suis',
      label: 'Je suis…',
      icon: 'ph-user',
      megaType: 'je-suis',
      entries: [
        { label: 'Élu / Décideur',           icon: 'ph-bank',        badge: 'elu',  href: ROOT + 'je-suis-elu.html' },
        { label: 'Technicien / Spécialiste', icon: 'ph-microscope',  badge: 'tech', href: ROOT + 'je-suis-specialiste.html' },
        { label: 'Citoyen / Habitant',         icon: 'ph-house',       badge: null,   href: ROOT + 'je-suis-habitant.html' }
      ]
    },

    // ── Découvrir mon territoire (mégamenu territoires) ──────────
    {
      id: 'territoire',
      label: 'Découvrir mon territoire',
      icon: 'ph-map-pin',
      badge: 'elu',
      megaType: 'territoires',
      targetPage: tplHref('decouvrir-mon-territoire.html'),
      href: ROOT + 'en-construction.html'
    },

    // ── Les Indicateurs (mégamenu territoires) ────────────────────
    {
      id: 'indicateurs',
      label: 'Les Indicateurs',
      icon: 'ph-chart-bar',
      badge: 'tech',
      megaType: 'indicateurs',
      targetPage: tplHref('tableaux-de-bord.html'),
      href: ROOT + 'en-construction.html'
    },

    // ── Cartographie (lien direct) ───────────────────────────────
    {
      id: 'cartographie',
      label: 'Cartographie',
      icon: 'ph-map-trifold',
      href: tplHref('cartographie.html')
    },

    // ── Ressources ───────────────────────────────────────────────
    {
      id: 'ressources',
      label: 'Ressources',
      icon: 'ph-folder-open',
      megaType: 'ressources',
      entries: [
        { label: "M'inspirer & Retours d'expérience",      desc: 'Projets inspirants classés par thème',    icon: 'ph-star',           href: ROOT + 'ressources-retex.html' },
        { label: 'Je souhaite renseigner mon projet',     desc: "Partager un retour d'expérience",          icon: 'ph-pencil-simple',  href: ROOT + 'ressources-depot.html' },
        { label: 'Base documentaire',                     desc: 'Études, rapports et publications',         icon: 'ph-file-pdf',       href: ROOT + 'ressources-docs.html' },
        { label: "Les dispositifs qui me permettent d'agir", desc: 'Programmes et financements régionaux',  icon: 'ph-currency-eur',   href: ROOT + 'ressources-dispositifs.html' },
        { label: 'Outils et liens utiles',                desc: 'Portails et références partenaires',       icon: 'ph-link',           href: ROOT + 'ressources-outils.html' }
      ]
    },

    // ── FAQ (lien direct) ────────────────────────────────────────
    {
      id: 'faq',
      label: 'FAQ',
      icon: 'ph-question',
      href: ROOT + 'faq.html'
    }
  ];

  /* ── Génération du HTML de navigation ────────────────────── */

  function buildBadge(badge) {
    if (!badge) return '';
    var map = { elu: ['elu', 'Élu'], tech: ['tech', 'Expert'], 'new': ['new', 'Nouveau'] };
    var b = map[badge];
    if (!b) return '';
    return '<span class="orege-mm-badge orege-mm-badge--' + b[0] + '">' + b[1] + '</span>';
  }

  function buildNavHTML() {
    var html = '';
    NAV_CONFIG.forEach(function(item) {
      var hasMegamenu = (item.megaType === 'actu') || (item.megaType === 'territoires') || (item.megaType === 'indicateurs') || (item.megaType === 'je-suis') || (item.megaType === 'observatoire') || (item.megaType === 'ressources') || (item.groups && item.groups.length);

      if (hasMegamenu) {
        // Determine `is-active` state based on the current page filename
        var isActive = false;
        if (item.megaType === 'actu') {
          isActive = (currentPage === 'actualites.html' || currentPage === 'article.html');
        } else if (item.megaType === 'territoires') {
          isActive = (currentPage === 'decouvrir-mon-territoire.html');
        } else if (item.megaType === 'indicateurs') {
          isActive = (currentPage === 'tableaux-de-bord.html');
        } else if (item.megaType === 'je-suis') {
          isActive = item.entries.some(function(e) {
            return currentPage === e.href.split('/').pop();
          });
        } else if (item.megaType === 'observatoire') {
          isActive = item.entries.some(function(e) {
            return currentPage === e.href.split('/').pop();
          });
        } else if (item.megaType === 'ressources') {
          isActive = item.entries.some(function(e) {
            return currentPage === e.href.split('/').pop();
          });
        } else {
          isActive = item.groups && item.groups.some(function(g) {
            return g.links.some(function(l) {
              return currentPage === l.href.split('/').pop();
            });
          });
        }
        // If the item has an href (e.g. Actualités), render as a clickable <a>
        // that also carries data-menu so the mega-menu still opens on click
        if (item.href) {
          html += '<li class="orege-nav__item">'
            + '<a class="orege-nav__link' + (isActive ? ' is-active' : '') + '" '
            + 'href="' + item.href + '" '
            + 'aria-expanded="false" aria-haspopup="true" data-menu="' + item.id + '">'
            + '<i class="ph ' + item.icon + '"></i> '
            + item.label
            + buildBadge(item.badge || null)
            + ' <i class="ph ph-caret-down orege-nav__chevron"></i>'
            + '</a></li>';
        } else {
          html += '<li class="orege-nav__item">'
            + '<button class="orege-nav__link' + (isActive ? ' is-active' : '') + '" '
            + 'aria-expanded="false" aria-haspopup="true" data-menu="' + item.id + '" type="button">'
            + '<i class="ph ' + item.icon + '"></i> '
            + item.label
            + buildBadge(item.badge || null)
            + ' <i class="ph ph-caret-down orege-nav__chevron"></i>'
            + '</button></li>';
        }
      } else {
        // Plain direct link — no mega-menu triggered
        var isActiveDirect = item.href && (currentPage === item.href.split('/').pop());
        html += '<li class="orege-nav__item">'
          + '<a class="orege-nav__link' + (isActiveDirect ? ' is-active' : '') + '" href="' + item.href + '">'
          + '<i class="ph ' + item.icon + '"></i> '
          + item.label
          + buildBadge(item.badge || null)
          + '</a></li>';
      }
    });
    return html;
  }

  /* ── Mégamenu standard (groups) ───────────────────────────── */
  /* ── Mégamenu "Je suis" – liste verticale compacte ─────────── */
  /* ── Mégamenu Ressources (liste verticale + description) ───── */
  function buildRessourcesMegamenuHTML(item) {
    var html = '<div class="orege-megamenu orege-megamenu--ressources" id="mm-' + item.id + '" role="dialog" aria-label="Menu ' + item.label + '">'
      + '<div class="orege-mm-res__header">' + item.label + '</div>'
      + '<ul class="orege-mm-res__list">';

    item.entries.forEach(function(e) {
      html += '<li>'
        + '<a class="orege-mm-res__link" href="' + e.href + '">'
        + '<span class="orege-mm-res__icon"><i class="ph ' + e.icon + '"></i></span>'
        + '<span class="orege-mm-res__body">'
        + '<span class="orege-mm-res__label">' + e.label + '</span>'
        + (e.desc ? '<span class="orege-mm-res__desc">' + e.desc + '</span>' : '')
        + '</span>'
        + '<i class="ph ph-chevron-right orege-mm-res__arrow" aria-hidden="true"></i>'
        + '</a>'
        + '</li>';
    });

    html += '</ul></div>';
    return html;
  }

  /* ── Mégamenu L'observatoire (liste verticale avec desc) ───── */
  function buildObservatoireMegamenuHTML(item) {
    var html = '<div class="orege-megamenu orege-megamenu--observatoire" id="mm-' + item.id + '" role="dialog" aria-label="Menu ' + item.label + '">'
      + '<div class="orege-mm-obs__header"><i class="ph ph-info-circle" aria-hidden="true"></i> ' + item.label + '</div>'
      + '<ul class="orege-mm-obs__list">';

    item.entries.forEach(function(e) {
      html += '<li>'
        + '<a class="orege-mm-obs__link" href="' + e.href + '">'
        + '<span class="orege-mm-obs__icon"><i class="ph ' + e.icon + '"></i></span>'
        + '<span class="orege-mm-obs__body">'
        + '<span class="orege-mm-obs__label">' + e.label + '</span>'
        + (e.desc ? '<span class="orege-mm-obs__desc">' + e.desc + '</span>' : '')
        + '</span>'
        + '<i class="ph ph-chevron-right orege-mm-obs__arrow" aria-hidden="true"></i>'
        + '</a>'
        + '</li>';
    });

    html += '</ul></div>';
    return html;
  }

  /* ── Mégamenu Je suis (liste verticale simple) ──────────────── */
  function buildJeSuisMegamenuHTML(item) {
    var html = '<div class="orege-megamenu orege-megamenu--je-suis" id="mm-' + item.id + '" role="dialog" aria-label="Menu ' + item.label + '">'
      + '<div class="orege-mm-jesuis__header">' + item.label + '</div>'
      + '<ul class="orege-mm-jesuis__list">';

    item.entries.forEach(function(e) {
      /* Classe modificatrice selon le badge pour la couleur */
      var linkClass = 'orege-mm-jesuis__link'
        + (e.badge === 'elu'  ? ' orege-mm-jesuis__link--elu'  :
           e.badge === 'tech' ? ' orege-mm-jesuis__link--tech' :
           ' orege-mm-jesuis__link--hab');

      html += '<li>'
        + '<a class="' + linkClass + '" href="' + e.href + '">'
        + '<span class="orege-mm-jesuis__icon"><i class="ph ' + e.icon + '"></i></span>'
        + '<span class="orege-mm-jesuis__label">' + e.label + buildBadge(e.badge) + '</span>'
        + '<i class="ph ph-chevron-right orege-mm-jesuis__arrow" aria-hidden="true"></i>'
        + '</a>'
        + '</li>';
    });

    html += '</ul></div>';
    return html;
  }

  /* ── Mégamenu standard (colonnes) ──────────────────────────── */
  function buildMegamenuHTML(item) {
    var colClass = 'orege-megamenu__inner--' + item.cols + 'col';
    var html = '<div class="orege-megamenu" id="mm-' + item.id + '" role="dialog" aria-label="Menu ' + item.label + '">'
      + '<div class="orege-megamenu__inner ' + colClass + '">';

    item.groups.forEach(function(g) {
      html += '<div class="orege-megamenu__col">'
        + '<div class="orege-megamenu__col-title"><i class="ph ' + g.icon + '"></i>' + g.title + '</div>'
        + '<ul class="orege-megamenu__links">';
      g.links.forEach(function(l) {
        html += '<li><a class="orege-megamenu__link" href="' + l.href + '">'
          + '<i class="ph ' + l.icon + '"></i>'
          + '<span class="orege-megamenu__link-body">'
          + '<span class="orege-megamenu__link-label">' + l.label + buildBadge(l.badge || null) + '</span>'
          + (l.desc ? '<span class="orege-megamenu__link-desc">' + l.desc + '</span>' : '')
          + '</span></a></li>';
      });
      html += '</ul></div>';
    });

    html += '</div></div>';
    return html;
  }

  /* ── Mégamenu Actualités (template spécial) ────────────────── */
  function buildActuMegamenuHTML() {
    var u = ACTU_UNE;

    // Build the recent articles list HTML
    var listeHTML = '';
    ACTU_LISTE.forEach(function(a) {
      listeHTML += '<li>'
        + '<a class="orege-mm-actu-article" href="' + a.href + '">'
        + '<span class="orege-mm-actu-article__cat" style="color:' + a.catFg + '">' + a.cat + '</span>'
        + '<span class="orege-mm-actu-article__title">' + a.title + '</span>'
        + '<span class="orege-mm-actu-article__date"><i class="ph ph-calendar" aria-hidden="true"></i> ' + a.date + '</span>'
        + '</a>'
        + '</li>';
    });

    return '<div class="orege-megamenu orege-megamenu--actu" id="mm-actualites" role="dialog" aria-label="Menu Actualités">'
      + '<div class="orege-megamenu__inner orege-megamenu__inner--actu">'

      // Left column: featured article
      + '<div class="orege-mm-actu-une">'
      + '<div class="orege-megamenu__col-title"><i class="ph ph-star" aria-hidden="true"></i> À la une</div>'
      + '<a class="orege-mm-actu-une__card" href="' + u.href + '">'
      + '<div class="orege-mm-actu-une__img-wrap">'
      + '<img src="' + u.img + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
      + '<div class="orege-mm-actu-une__img-fallback"><i class="ph ph-cloud-sun-rain"></i></div>'
      + '</div>'
      + '<div class="orege-mm-actu-une__body">'
      + '<span class="orege-mm-actu-une__cat" style="background:' + u.catBg + ';color:' + u.catFg + '">' + u.cat + '</span>'
      + '<h3 class="orege-mm-actu-une__title">' + u.title + '</h3>'
      + '<p class="orege-mm-actu-une__excerpt">' + u.excerpt + '</p>'
      + '<div class="orege-mm-actu-une__meta"><i class="ph ph-calendar" aria-hidden="true"></i> ' + u.date + ' &nbsp;·&nbsp; ' + u.author + '</div>'
      + '<span class="orege-mm-actu-une__cta"><i class="ph ph-arrow-right" aria-hidden="true"></i> Lire l\'article</span>'
      + '</div>'
      + '</a>'
      + '</div>'

      // Right column: recent articles list
      + '<div class="orege-mm-actu-liste">'
      + '<div class="orege-megamenu__col-title"><i class="ph ph-clock" aria-hidden="true"></i> Publications récentes</div>'
      + '<ul class="orege-mm-actu-articles">'
      + listeHTML
      + '</ul>'
      + '</div>'

      + '</div>'

      // Pied du megamenu : bouton centré sous les deux colonnes
      + '<div class="orege-mm-actu-footer">'
      + '<a class="orege-mm-actu-liste__all" href="' + ROOT + 'actualites.html">'
      + '<i class="ph ph-newspaper" aria-hidden="true"></i> Voir toutes les actualités'
      + '</a>'
      + '</div>'

      + '</div>';
  }

  /* ── Footer ────────────────────────────────────────────────── */
  function buildFooterHTML() {
    return '<footer class="orege-footer" role="contentinfo">'
      + '<div class="orege-footer__inner">'

      + '<div class="orege-footer__brand">'
      + '<a href="' + ROOT + 'index.html" class="orege-footer__brand-logo">'
      + '<img src="' + ROOT + 'images/logo-grandest-region.png" alt="La Région Grand Est" class="orege-footer__brand-img">'
      + '</a>'
      + '<p class="orege-footer__brand-desc">Plateforme régionale de la donnée eau — centralisation, harmonisation et diffusion des indicateurs pour les élus, techniciens et citoyens du Grand Est.</p>'
      + '<p class="orege-footer__brand-partners">Antea Group · Région Grand Est · Agences de l\'eau · DREAL</p>'
      + '</div>'

      + '<div><div class="orege-footer__col-title">L\'observatoire</div><ul class="orege-footer__links">'
      + '<li><a href="' + ROOT + 'observatoire.html">Présentation</a></li>'
      + '<li><a href="' + ROOT + 'enjeux.html">Comprendre les enjeux</a></li>'
      + '<li><a href="' + ROOT + 'equipe.html">L\'équipe</a></li>'
      + '<li><a href="' + ROOT + 'actualites.html">Actualités</a></li>'
      + '</ul></div>'

      + '<div><div class="orege-footer__col-title">Je suis…</div><ul class="orege-footer__links">'
      + '<li><a href="' + ROOT + 'je-suis-elu.html">Élu / Décideur</a></li>'
      + '<li><a href="' + ROOT + 'je-suis-specialiste.html">Technicien / Spécialiste</a></li>'
      + '<li><a href="' + ROOT + 'je-suis-habitant.html">Citoyen / Habitant</a></li>'
      + '</ul></div>'

      + '<div><div class="orege-footer__col-title">Explorer</div><ul class="orege-footer__links">'
      + '<li><a href="' + tplHref('decouvrir-mon-territoire.html') + '">Découvrir mon territoire</a></li>'
      + '<li><a href="' + tplHref('tableaux-de-bord.html') + '">Les Indicateurs</a></li>'
      + '<li><a href="' + tplHref('cartographie.html') + '">Cartographie</a></li>'
      + '</ul></div>'

      + '<div><div class="orege-footer__col-title">Ressources</div><ul class="orege-footer__links">'
      + '<li><a href="' + ROOT + 'ressources-retex.html">M\'inspirer &amp; RE-ex</a></li>'
      + '<li><a href="' + ROOT + 'ressources-depot.html">Renseigner mon projet</a></li>'
      + '<li><a href="' + ROOT + 'ressources-docs.html">Base documentaire</a></li>'
      + '<li><a href="' + ROOT + 'ressources-dispositifs.html">Les dispositifs pour agir</a></li>'
      + '<li><a href="' + ROOT + 'ressources-outils.html">Outils et liens utiles</a></li>'
      + '<li><a href="' + ROOT + 'faq.html">FAQ</a></li>'
      + '</ul></div>'

      + '</div>'
      + '<div class="orege-footer__bottom">'
      + '<span>© 2025–2026 Observatoire de l\'Eau Grand Est — Antea Group — Données indicatives (prototype UX) v2026.02</span>'
      + '<div class="orege-footer__bottom-links">'
      + '<a href="' + ROOT + 'accessibilite.html">Accessibilité : partiellement conforme</a>'
      + '<a href="' + ROOT + 'mentions-legales.html#cgu">CGU</a>'
      + '<a href="' + ROOT + 'mentions-legales.html">Mentions légales</a>'
      + '<a href="' + ROOT + 'mentions-legales.html#rgpd">RGPD</a>'
      + '<a href="' + ROOT + 'contact.html">Contact</a>'
      + '</div>'
      + '</div>'
      + '</footer>';
  }

  /* ══════════════════════════════════════════════════════════════
     RECHERCHE TERRITOIRE — overlay plein écran
     ══════════════════════════════════════════════════════════════ */

  var searchOpen = false;

  function buildSearchOverlay() {
    if (document.getElementById('orege-search-overlay')) return;

    var html = '<div id="orege-search-overlay" class="orege-search-overlay" role="dialog" aria-modal="true" aria-label="Rechercher un territoire" hidden>'
      + '<div class="orege-search-overlay__backdrop"></div>'
      + '<div class="orege-search-overlay__panel">'

      // Titre
      + '<div class="orege-search-overlay__header">'
      + '<span class="orege-search-overlay__title"><i class="ph ph-map-location-dot" aria-hidden="true"></i> Trouver mon territoire</span>'
      + '<button class="orege-search-overlay__close" id="orege-search-close" aria-label="Fermer la recherche" type="button">'
      + '<i class="ph ph-xmark" aria-hidden="true"></i>'
      + '</button>'
      + '</div>'

      // Champ de recherche
      + '<div class="orege-search-overlay__field-wrap">'
      + '<i class="ph ph-magnifying-glass orege-search-overlay__field-icon" aria-hidden="true"></i>'
      + '<input type="search" id="orege-search-input" class="orege-search-overlay__input"'
      + ' placeholder="Mon territoire"'
      + ' autocomplete="off" spellcheck="false" aria-autocomplete="list" aria-controls="orege-search-results">'
      + '<button class="orege-search-overlay__clear" id="orege-search-clear" type="button" aria-label="Effacer" hidden>'
      + '<i class="ph ph-circle-xmark" aria-hidden="true"></i>'
      + '</button>'
      + '</div>'

      // Hint raccourci
      + '<div class="orege-search-overlay__hint">Appuyez sur <kbd>↑</kbd> <kbd>↓</kbd> pour naviguer, <kbd>Entrée</kbd> pour valider, <kbd>Échap</kbd> pour fermer</div>'

      // Résultats
      + '<ul id="orege-search-results" class="orege-search-overlay__results" role="listbox" aria-label="Résultats de recherche"></ul>'

      // État vide / aide
      + '<div class="orege-search-overlay__empty" id="orege-search-empty" hidden>'
      + '<i class="ph ph-circle-info" aria-hidden="true"></i> Aucun territoire trouvé pour cette recherche.'
      + '</div>'
      + '<div class="orege-search-overlay__welcome" id="orege-search-welcome">'
      + '<div class="orege-search-overlay__welcome-grid">'
      + _buildQuickTerritoires()
      + '</div>'
      + '</div>'

      + '</div>'
      + '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    _bindSearchEvents();
  }

  /**
   * Build the HTML for the quick-access territory chips shown
   * in the search overlay before the user starts typing.
   * @returns {string} HTML string of <button> elements
   */
  function _buildQuickTerritoires() {
    var quick = [
      { label: 'Grand Est',          echelle: 'Grand Est',    val: 'Tout le territoire Grand Est', icon: 'ph-globe' },
      { label: 'Ardennes (08)',       echelle: 'Département',  val: 'Ardennes (08)',                icon: 'ph-map-trifold' },
      { label: 'Aube (10)',           echelle: 'Département',  val: 'Aube (10)',                    icon: 'ph-map-trifold' },
      { label: 'Marne (51)',          echelle: 'Département',  val: 'Marne (51)',                   icon: 'ph-map-trifold' },
      { label: 'Meurthe-et-Moselle', echelle: 'Département',  val: 'Meurthe-et-Moselle (54)',      icon: 'ph-map-trifold' },
      { label: 'Meuse (55)',          echelle: 'Département',  val: 'Meuse (55)',                   icon: 'ph-map-trifold' },
      { label: 'Moselle (57)',        echelle: 'Département',  val: 'Moselle (57)',                 icon: 'ph-map-trifold' },
      { label: 'Bas-Rhin (67)',       echelle: 'Département',  val: 'Bas-Rhin (67)',                icon: 'ph-map-trifold' },
      { label: 'Haut-Rhin (68)',      echelle: 'Département',  val: 'Haut-Rhin (68)',               icon: 'ph-map-trifold' },
      { label: 'Vosges (88)',         echelle: 'Département',  val: 'Vosges (88)',                  icon: 'ph-map-trifold' },
      { label: 'Eurométropole Strasbourg', echelle: 'EPCI',   val: 'Eurométropole de Strasbourg',  icon: 'ph-buildings' },
      { label: 'Metz Métropole',      echelle: 'EPCI',         val: 'Metz Métropole',               icon: 'ph-buildings' }
    ];
    var h = '';
    quick.forEach(function(q) {
      h += '<button class="orege-search-overlay__quick" type="button"'
        + ' data-echelle="' + q.echelle + '" data-val="' + q.val + '">'
        + '<i class="ph ' + q.icon + '"></i> ' + q.label
        + '</button>';
    });
    return h;
  }

  /**
   * Flatten the TERRITOIRES global object into a searchable array.
   * Communes are included once data-communes.js has loaded.
   * @returns {Array<{label:string, echelle:string, icon:string}>}
   */
  // Construire la liste de tous les territoires (sauf communes → chargées async)
  function _getAllTerritoires() {
    var all = [];
    if (typeof TERRITOIRES === 'undefined') return all;

    var ECHELLE_ICONS = {
      'Grand Est':         'ph-globe',
      'Département':       'ph-map-trifold',
      'EPCI':              'ph-buildings',
      'Maison de Région':  'ph-bank',
      'Pays / PETR':       'ph-tree-evergreen',
      'PNR':               'ph-leaf',
      'PTRTE':             'ph-users-three',
      'SAGE':              'ph-wave-sine',
      'SCoT':              'ph-compass',
      'Agence de l\u2019eau': 'ph-drop',
      'Commune':           'ph-house'
    };

    Object.keys(TERRITOIRES).forEach(function(echelle) {
      var icon = ECHELLE_ICONS[echelle] || 'ph-map-pin';
      (TERRITOIRES[echelle] || []).forEach(function(nom) {
        all.push({ label: nom, echelle: echelle, icon: icon });
      });
    });
    return all;
  }

  // Recherche fuzzy simple : contient tous les mots de la requête (insensible casse/accents)
  function _normalize(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');
  }

  function _searchTerritoires(query) {
    var all = _getAllTerritoires();
    if (!query.trim()) return [];
    var words = _normalize(query).split(/\s+/).filter(Boolean);
    var results = all.filter(function(t) {
      var norm = _normalize(t.label);
      return words.every(function(w) { return norm.indexOf(w) !== -1; });
    });
    // Trier : commence par la query en premier
    var normQ = _normalize(query);
    results.sort(function(a, b) {
      var aN = _normalize(a.label), bN = _normalize(b.label);
      var aS = aN.indexOf(normQ) === 0, bS = bN.indexOf(normQ) === 0;
      if (aS && !bS) return -1;
      if (!aS && bS) return 1;
      return a.label.localeCompare(b.label, 'fr');
    });
    return results.slice(0, 40);
  }

  // Surligner le terme recherché dans le label
  function _highlight(label, query) {
    if (!query.trim()) return label;
    var esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return label.replace(new RegExp('(' + esc + ')', 'gi'), '<mark>$1</mark>');
    } catch(e) { return label; }
  }

  // Construire la destination URL
  function _buildTdbUrl(echelle, val) {
    var inTemplate = window.location.pathname.indexOf('/template/') !== -1;
    var base = inTemplate ? '../template/tableau-de-bord.html' : 'template/tableau-de-bord.html';
    return base + '?echelle=' + encodeURIComponent(echelle) + '&territoire=' + encodeURIComponent(val) + '&annee=2023';
  }

  var _searchActiveIdx = -1;

  function _renderResults(query) {
    var $results = $('#orege-search-results');
    var $empty   = $('#orege-search-empty');
    var $welcome = $('#orege-search-welcome');
    _searchActiveIdx = -1;

    if (!query.trim()) {
      $results.empty().hide();
      $empty.hide();
      $welcome.show();
      return;
    }

    var hits = _searchTerritoires(query);
    $welcome.hide();

    if (!hits.length) {
      $results.empty().hide();
      $empty.show();
      return;
    }

    $empty.hide();
    var html = '';
    hits.forEach(function(t, i) {
      html += '<li class="orege-search-overlay__result" role="option" tabindex="-1"'
        + ' data-echelle="' + t.echelle + '" data-val="' + t.label + '" data-idx="' + i + '">'
        + '<span class="orege-search-overlay__result-icon"><i class="ph ' + t.icon + '"></i></span>'
        + '<span class="orege-search-overlay__result-body">'
        + '<span class="orege-search-overlay__result-label">' + _highlight(t.label, query) + '</span>'
        + '<span class="orege-search-overlay__result-echelle">' + t.echelle + '</span>'
        + '</span>'
        + '<span class="orege-search-overlay__result-arrow"><i class="ph ph-arrow-right" aria-hidden="true"></i></span>'
        + '</li>';
    });
    $results.html(html).show();
  }

  function _navigateResult(dir) {
    var $items = $('#orege-search-results .orege-search-overlay__result');
    if (!$items.length) return;
    $items.removeClass('is-active');
    _searchActiveIdx += dir;
    if (_searchActiveIdx < 0) _searchActiveIdx = $items.length - 1;
    if (_searchActiveIdx >= $items.length) _searchActiveIdx = 0;
    var $active = $items.eq(_searchActiveIdx);
    $active.addClass('is-active');
    $active[0].scrollIntoView({ block: 'nearest' });
  }

  function _selectResult(echelle, val) {
    closeSearch();
    window.location.href = _buildTdbUrl(echelle, val);
  }

  function openSearch() {
    if (searchOpen) return;
    searchOpen = true;
    var $ov = $('#orege-search-overlay');
    $ov.removeAttr('hidden').addClass('is-open');
    document.body.style.overflow = 'hidden';
    // Focus immédiat sur le champ
    setTimeout(function() {
      var inp = document.getElementById('orege-search-input');
      if (inp) inp.focus();
    }, 60);
  }

  function closeSearch() {
    if (!searchOpen) return;
    searchOpen = false;
    var $ov = $('#orege-search-overlay');
    $ov.removeClass('is-open');
    setTimeout(function() { $ov.attr('hidden', ''); }, 260);
    document.body.style.overflow = '';
    $('#orege-search-input').val('');
    $('#orege-search-results').empty().hide();
    $('#orege-search-empty').hide();
    $('#orege-search-welcome').show();
    $('#orege-search-clear').attr('hidden', '');
  }

  function _bindSearchEvents() {
    // Close via backdrop click or the × button
    $(document).on('click', '#orege-search-overlay .orege-search-overlay__backdrop, #orege-search-close', closeSearch);

    // Clear button: wipe the input and show the welcome chips again
    $(document).on('click', '#orege-search-clear', function() {
      $('#orege-search-input').val('').focus();
      $('#orege-search-results').empty().hide();
      $('#orege-search-empty').hide();
      $('#orege-search-welcome').show();
      $(this).attr('hidden', '');
    });

    // Saisie
    $(document).on('input', '#orege-search-input', function() {
      var q = $(this).val();
      $('#orege-search-clear').prop('hidden', !q);
      _renderResults(q);
    });

    // Keyboard navigation: ArrowDown/Up/Enter/Escape in the search input
    $(document).on('keydown', '#orege-search-input', function(e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); _navigateResult(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); _navigateResult(-1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var $active = $('#orege-search-results .orege-search-overlay__result.is-active');
        if ($active.length) { // Navigate to the highlighted row
          _selectResult($active.data('echelle'), $active.data('val'));
        } else {
          // No highlighted row: navigate to the first result
          var $first = $('#orege-search-results .orege-search-overlay__result').first();
          if ($first.length) _selectResult($first.data('echelle'), $first.data('val'));
        }
      }
      else if (e.key === 'Escape') { closeSearch(); }
    });

    // Click on a result row
    $(document).on('click', '.orege-search-overlay__result', function() {
      _selectResult($(this).data('echelle'), $(this).data('val'));
    });

    // Keyboard navigation within the results list
    $(document).on('keydown', '.orege-search-overlay__result', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        _selectResult($(this).data('echelle'), $(this).data('val'));
      } else if (e.key === 'ArrowDown') { e.preventDefault(); _navigateResult(1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); _navigateResult(-1); }
      else if (e.key === 'Escape')    { closeSearch(); }
    });

    // Quick-access territory chip clicks
    $(document).on('click', '.orege-search-overlay__quick', function() {
      _selectResult($(this).data('echelle'), $(this).data('val'));
    });

    // Prevent the global Escape handler (mega-menus) from firing
    // when the search overlay is already open and consuming that key event
    $(document).on('keydown.searchEsc', function(e) {
      if (e.key === 'Escape' && searchOpen) { e.stopImmediatePropagation(); closeSearch(); }
    });
  }

  /* ── Main init function ──────────────────────────────────────
     Build and inject the navigation, mega-menus, footer, and search overlay.
     Runs once on $(document).ready via jQuery.
     Ends by removing nav-loading to reveal the page (anti-FOUC guard).
     ──────────────────────────────────────────────────────────── */
  function initNav() {
    var $header = $('.orege-header');
    if (!$header.length) {
      // No .orege-header element found: still reveal the page to avoid blank screen
      document.body.classList.remove('nav-loading');
      document.body.classList.add('nav-ready');
      return;
    }

    // Build and inject the <nav> element
    var $nav = $('<nav class="orege-nav" id="orege-nav" role="navigation" aria-label="Navigation principale">'
      + '<ul style="display:contents;list-style:none;margin:0;padding:0">'
      + buildNavHTML()
      + '</ul></nav>');

    // Magnifying-glass button in the header: open the territory search overlay
    var $searchBtn = $('<button class="orege-nav__search-btn" id="orege-search-btn" aria-label="Rechercher mon territoire" type="button">'
      + '<i class="ph ph-magnifying-glass" aria-hidden="true"></i>'
      + '</button>');

    // Hamburger button for mobile — built with pure CSS spans, not Phosphor icons,
    // to ensure it renders before the icon font has fully loaded
    var $toggle = $('<button class="orege-nav__toggle" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="orege-nav">'
      + '<span class="orege-nav__toggle-icon" aria-hidden="true">'
      + '<span></span><span></span><span></span>'
      + '</span></button>');
    $header.append($searchBtn).append($toggle).append($nav);

    // Semi-transparent overlay behind open mega-menus (desktop only)
    var $overlay = $('<div class="orege-megamenu-overlay" id="orege-mm-overlay" aria-hidden="true"></div>');
    $header.after($overlay);

    // Build and inject the full-screen territory search overlay (search.overlay)
    buildSearchOverlay();

    NAV_CONFIG.forEach(function(item) {
      if (item.megaType === 'actu') {
        $overlay.after(buildActuMegamenuHTML());
      } else if (item.megaType === 'territoires') {
        $overlay.after(buildTerritoiresMegamenuHTML(item.id, item.label, item.targetPage));
      } else if (item.megaType === 'indicateurs') {
        $overlay.after(buildTerritoiresMegamenuHTML(item.id, item.label, item.targetPage));
      } else if (item.megaType === 'je-suis') {
        $overlay.after(buildJeSuisMegamenuHTML(item));
      } else if (item.megaType === 'observatoire') {
        $overlay.after(buildObservatoireMegamenuHTML(item));
      } else if (item.megaType === 'ressources') {
        $overlay.after(buildRessourcesMegamenuHTML(item));
      } else if (item.groups && item.groups.length) {
        $overlay.after(buildMegamenuHTML(item));
      }
    });

    // Remember each mega-menu's original DOM index so it can be
    // restored to the correct order after inline-placement on mobile
    $('.orege-megamenu').each(function(i) { $(this).attr('data-mm-index', i); });

    // Inject footer HTML into the placeholder element
    var $fp = $('.orege-footer-placeholder');
    if ($fp.length) $fp.replaceWith(buildFooterHTML());

    // ── Ouverture / fermeture ──
    var currentOpen = null;
    var closeTimer  = null;

    function isMobile() { return window.innerWidth <= 1100; }

    /* Hauteur du header selon la largeur courante */
    function headerHeight() {
      if (window.innerWidth <= 480) return 56;
      if (window.innerWidth <= 1100) return 60;
      return 72;
    }

    function openMenu(id) {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      if (currentOpen === id) return;
      closeAllNow();
      currentOpen = id;
      var $mm = $('#mm-' + id);
      $mm.addClass('is-open');

      if (isMobile()) {
        // Mode mobile : afficher le sous-menu inline dans la nav, pas de positionnement
        $mm.css({ left: '', width: '', top: '', position: '' });
        // Déplacer le mégamenu après l'item nav qui l'a déclenché
        var $btn2 = $('[data-menu="' + id + '"]');
        if ($btn2.length) {
          var $navItem = $btn2.closest('.orege-nav__item');
          if ($navItem.length) { $navItem.after($mm); }
        }
      } else {
        // Mode desktop : positionnement absolu sous le bouton
        var $btn = $('[data-menu="' + id + '"]');
        if ($btn.length) {
          var rect = $btn[0].getBoundingClientRect();
          var viewportW = window.innerWidth;

          if (id === 'je-suis' || id === 'observatoire' || id === 'ressources') {
            // Menus compacts : largeur auto, alignés sous le bouton
            var mmWidth = $mm.outerWidth() || 320;
            var leftPos = rect.left;
            if (leftPos + mmWidth > viewportW - 8) { leftPos = rect.right - mmWidth; }
            if (leftPos < 8) leftPos = 8;
            $mm.css({ left: leftPos + 'px', width: 'auto' });
          } else {
            // Wide mega-menus (territories, news, indicators…): max 1080 px, viewport-clipped
            var maxW = Math.min(1080, viewportW - 16);
            var leftPos = rect.left;
            if (leftPos + maxW > viewportW - 8) { leftPos = viewportW - maxW - 8; }
            if (leftPos < 8) leftPos = 8;
            $mm.css({ left: leftPos + 'px', width: maxW + 'px' });
          }
        }
        $overlay.addClass('is-open');
      }
      $('[data-menu="' + id + '"]').attr('aria-expanded', 'true');
    }
    function closeAllNow() {
      // Remettre tous les mégamenus après l'overlay (position d'origine dans le DOM)
      if (isMobile()) {
        var $ref = $overlay;
        // Trier par data-mm-index pour restaurer l'ordre d'origine
        var $mms = $('.orege-megamenu').toArray().sort(function(a,b){
          return ($(a).data('mm-index')||0) - ($(b).data('mm-index')||0);
        });
        $($mms).each(function() { $ref.after($(this)); $ref = $(this); });
      }
      $('.orege-megamenu').removeClass('is-open');
      // Remettre tous les mégamenus en position et parent par défaut
      $('.orege-megamenu').css({ left: '', width: '', top: '', position: '' });
      $overlay.removeClass('is-open');
      $('[data-menu]').attr('aria-expanded', 'false');
      currentOpen = null;
    }
    function closeAll() {
      closeTimer = setTimeout(closeAllNow, 120);
    }
    function cancelClose() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    }

    /* ── Desktop hover ── */
    // Open the mega-menu when hovering a nav item (desktop only)
    $(document).on('mouseenter', '.orege-nav__item', function() {
      if (isMobile()) return;
      var $btn = $(this).find('[data-menu]');
      if ($btn.length) { openMenu($btn.data('menu')); } else { closeAll(); }
    });
    $(document).on('mouseleave', '.orege-nav__item', function() {
      if (isMobile()) return;
      closeAll();
    });

    // Hover mégamenu (desktop uniquement)
    $(document).on('mouseenter', '.orege-megamenu', function() {
      if (isMobile()) return;
      cancelClose();
    });
    $(document).on('mouseleave', '.orege-megamenu', function() {
      if (isMobile()) return;
      closeAll();
    });

    // Clic bouton (clavier / touch)
    $(document).on('click', '[data-menu]', function(e) {
      e.stopPropagation();
      var $el = $(this);
      var id = $el.data('menu');
      // Si c'est un <a> avec href (ex: en-construction), laisser naviguer
      if ($el.is('a') && $el.attr('href') && $el.attr('href') !== '#') {
        closeAllNow();
        return; // navigation naturelle
      }
      e.preventDefault();
      if (currentOpen === id) { closeAllNow(); } else { openMenu(id); }
    });

    $overlay.on('click', closeAllNow);
    $(document).on('keydown', function(e) { if (e.key === 'Escape') closeAllNow(); });

    // Hamburger mobile
    $toggle.on('click', function() {
      var open = $nav.hasClass('is-open');
      $nav.toggleClass('is-open');
      $toggle.attr('aria-expanded', String(!open));
      // Icône hamburger ↔ croix via classe CSS
      $toggle.toggleClass('is-open', !open);
      // Adapter le top du panneau nav à la hauteur du header
      $nav.css('top', headerHeight() + 'px');
      $nav.css('max-height', 'calc(100vh - ' + headerHeight() + 'px)');
      // Fermer tous les sous-menus en fermant le menu principal
      if (open) { closeAllNow(); }
      // Bloquer le scroll du body quand le menu est ouvert
      document.body.style.overflow = (!open) ? 'hidden' : '';
    });

    // Fermer le menu mobile au clic en dehors
    $(document).on('click.navOutside', function(e) {
      if (!isMobile()) return;
      if (!$nav.hasClass('is-open')) return;
      if ($(e.target).closest('.orege-nav, .orege-header').length) return;
      $nav.removeClass('is-open');
      $toggle.attr('aria-expanded', 'false');
      $toggle.removeClass('is-open');
      document.body.style.overflow = '';
      closeAllNow();
    });

    // Fermer le menu mobile après clic sur un lien direct (sans sous-menu)
    $(document).on('click', '.orege-nav__link:not([data-menu])', function() {
      if (!isMobile()) return;
      $nav.removeClass('is-open');
      $toggle.attr('aria-expanded', 'false');
      $toggle.removeClass('is-open');
      document.body.style.overflow = '';
    });

    // Clic loupe → ouvrir recherche
    $searchBtn.on('click', function() {
      openSearch();
    });

    // Raccourci clavier / (slash) ou Ctrl+K pour ouvrir la recherche
    $(document).on('keydown', function(e) {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !$(e.target).is('input,textarea,select,[contenteditable]')) {
        e.preventDefault();
        openSearch();
      }
    });

    console.log('[nav] Navigation initialisée – ' + NAV_CONFIG.length + ' entrées');

    // Anti-FOUC : révéler la page maintenant que la nav est injectée
    document.body.classList.remove('nav-loading');
    document.body.classList.add('nav-ready');

    // Phosphor Icons : le MutationObserver détecte automatiquement les nouveaux éléments
  }

  $(document).ready(initNav);

})(jQuery);
