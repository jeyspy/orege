/**
 * tdb-elu-v2-a11y.js
 * ═══════════════════════════════════════════════════════════════════════
 * Couche d'accessibilité RGAA 4.1 du Tableau de bord Élu V2.
 * S'applique automatiquement à chaque (re)rendu du contenu (MutationObserver),
 * sans modifier le moteur de rendu.
 *
 *  1.1 / 1.3  Graphiques Chart.js : role="img" + aria-label + tableau de données (.sr-only)
 *  1.1 / 7.3  Cartes OpenLayers   : nom accessible + liste alternative (clavier)
 *             Carte principale    : sélection d'un département au clavier
 *  1.2        Icônes décoratives  : aria-hidden="true"
 *  6.1        Liens « Méthodologie » sans cible : désactivés (« bientôt disponible »)
 *  9.1        Titres de tuiles    : role="heading" + aria-level (hiérarchie H2 > H3 > H4)
 *  7.1        Onglets             : navigation flèches / Début / Fin
 * 13.2        Liens nouvelle fenêtre : signalés
 *
 * Doit être chargé APRÈS ol.js et AVANT tableau-de-bord-elu-v2.js.
 */
(function () {
  'use strict';

  // ── Registre des cartes OpenLayers (le moteur ne les expose pas) ─────────
  var mapRegistry = [];
  if (window.ol && ol.Map) {
    var OrigMap = ol.Map;
    var WrappedMap = function (opts) {
      var m = new OrigMap(opts);
      mapRegistry.push(m);
      bindMap(m);
      return m;
    };
    WrappedMap.prototype = OrigMap.prototype;
    Object.keys(OrigMap).forEach(function (k) { WrappedMap[k] = OrigMap[k]; });
    ol.Map = WrappedMap;
  }

  var uid = 0;
  function nextId(prefix) { uid += 1; return prefix + '-' + uid; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Texte propre d'un élément (sans le contenu des infobulles « i »)
  function cleanText(el) {
    if (!el) return '';
    var c = el.cloneNode(true);
    c.querySelectorAll('.tdb-elu2-info, .sr-only, i').forEach(function (n) { n.remove(); });
    return c.textContent.replace(/\s+/g, ' ').replace(/\s*:\s*$/, '').trim();
  }

  var TITLE_SEL = '[class*="__title"], [class*="-title"], h2, h3, h4';
  function isTitleCandidate(n) {
    if (!n || !n.classList) return false;
    if (n.closest('[class*="tooltip"], .ol-viewport, .tdb-elu2-a11y-alt')) return false;
    if (n.classList.contains('tdb-elu2-methodo-links__title')) return false;
    return cleanText(n).length > 1;
  }

  // Titre le plus proche d'un élément (remonte les ancêtres)
  function nearestTitle(el) {
    var node = el.parentElement;
    while (node && node.id !== 'tdb-elu2-content' && node !== document.body) {
      var cands = node.querySelectorAll(TITLE_SEL);
      for (var i = 0; i < cands.length; i++) {
        if (!cands[i].contains(el) && isTitleCandidate(cands[i])) return cleanText(cands[i]);
      }
      node = node.parentElement;
    }
    return '';
  }

  function cardOf(el) {
    return el.closest('.tdb-elu2-card, .tdb-elu2-gov-tree, .tdb-elu2-sage-card, .tdb-elu2-prelevements, .tdb-elu2-gov-action-card');
  }
  function cardTitle(el) {
    var card = cardOf(el);
    if (!card) return '';
    var cands = card.querySelectorAll(TITLE_SEL);
    for (var i = 0; i < cands.length; i++) { if (isTitleCandidate(cands[i])) return cleanText(cands[i]); }
    return '';
  }
  function contextName(el) {
    var near = nearestTitle(el), top = cardTitle(el);
    if (top && near && top !== near) return top + ' \u2014 ' + near;
    return near || top || 'Indicateur';
  }

  // ════════════════════════════════════════════════════════════════════
  // 1. GRAPHIQUES (Chart.js)
  // ════════════════════════════════════════════════════════════════════
  function fmt(v) {
    if (Array.isArray(v)) v = v[v.length - 1];
    if (v && typeof v === 'object' && 'y' in v) v = v.y;
    if (typeof v === 'number') return (Math.round(v * 100) / 100).toLocaleString('fr-FR');
    return v == null ? '\u2014' : String(v);
  }

  function enhanceCharts(root) {
    if (typeof Chart === 'undefined' || !Chart.getChart) return;
    root.querySelectorAll('canvas').forEach(function (cv) {
      if (cv.closest('.ol-viewport')) return; // canvas de carte
      var chart = Chart.getChart(cv);
      if (!chart || !chart.data) return;
      var name = contextName(cv);
      var labels = chart.data.labels || [];
      var sets = (chart.data.datasets || []).filter(function (d) { return d && d.data && d.data.length; });
      var sig = name + '|' + labels.length + '|' + sets.map(function (d) { return d.data.length + ':' + fmt(d.data[0]); }).join(',');
      if (cv.getAttribute('data-a11y-sig') === sig) return;
      cv.setAttribute('data-a11y-sig', sig);

      cv.setAttribute('role', 'img');
      cv.setAttribute('aria-label', 'Graphique : ' + name + '. Les donn\u00e9es sont d\u00e9taill\u00e9es dans le tableau qui suit.');

      // Tableau de données équivalent (masqué visuellement)
      var tId = cv.getAttribute('data-a11y-table') || nextId('tdb-a11y-table');
      var old = document.getElementById(tId);
      if (old) old.remove();
      var h = '<table class="sr-only" id="' + tId + '"><caption>Donn\u00e9es du graphique : ' + esc(name) + '</caption>';
      h += '<thead><tr><th scope="col">Cat\u00e9gorie</th>';
      sets.forEach(function (d, i) { h += '<th scope="col">' + esc(d.label || ('S\u00e9rie ' + (i + 1))) + '</th>'; });
      h += '</tr></thead><tbody>';
      var n = labels.length || (sets[0] ? sets[0].data.length : 0);
      for (var r = 0; r < n; r++) {
        h += '<tr><th scope="row">' + esc(Array.isArray(labels[r]) ? labels[r].join(' ') : (labels[r] != null ? labels[r] : (r + 1))) + '</th>';
        sets.forEach(function (d) { h += '<td>' + esc(fmt(d.data[r])) + '</td>'; });
        h += '</tr>';
      }
      h += '</tbody></table>';
      cv.insertAdjacentHTML('afterend', h);
      cv.setAttribute('data-a11y-table', tId);
    });
  }

  // ════════════════════════════════════════════════════════════════════
  // 2. CARTES (OpenLayers) — nom accessible + liste alternative
  // ════════════════════════════════════════════════════════════════════
  var FIELD_LABELS = [
    ['etatLabel', '\u00c9tat'], ['debit2025', 'D\u00e9bit moyen annuel 2025', ' m\u00b3/s'], ['module', 'Module (1995-2024)', ' m\u00b3/s'],
    ['qnma', 'QMNA5', ' m\u00b3/s'], ['tendanceLabel', 'Tendance'],
    ['nappe', 'Nappe'], ['niveau', 'Niveau'], ['capacite', 'Capacit\u00e9'], ['classe', 'Qualit\u00e9 des eaux']
  ];

  function describeFeature(f) {
    var d = f.get('stationData') || f.get('siteData') || {};
    var name = f.get('stationName') || f.get('siteName') || d.nom || f.get('label');
    if (!name) return null;
    var parts = [];
    FIELD_LABELS.forEach(function (fl) {
      if (d[fl[0]] != null && d[fl[0]] !== '') parts.push(fl[1] + ' : ' + d[fl[0]] + (fl[2] || ''));
    });
    if ('reut' in d) parts.push('Projet REUT : ' + ((d.reut === true || d.reut === 'oui') ? 'oui' : 'non'));
    return { name: String(name), details: parts.join(' ; '), code: f.get('code'), type: f.get('type') };
  }

  function bindMap(map) {
    var t = null;
    map.on('rendercomplete', function () {
      clearTimeout(t);
      t = setTimeout(function () { buildMapAlternative(map); }, 150);
    });
  }

  function buildMapAlternative(map) {
    var target = map.getTargetElement && map.getTargetElement();
    if (!target || !target.isConnected) return;

    var items = [], rivers = [];
    map.getLayers().forEach(function (layer) {
      var src = layer.getSource && layer.getSource();
      if (!src || !src.getFeatures) return;
      src.getFeatures().forEach(function (f) {
        if (f.get('coursEauName')) { rivers.push(f.get('coursEauName')); return; }
        var d = describeFeature(f);
        if (d) items.push(d);
      });
    });

    var isDrill = target.id === 'tdb-elu2-drillmap';
    var level = isDrill && window.__tdbDrillLevel ? window.__tdbDrillLevel() : '';
    var name = isDrill ? 'Carte de s\u00e9lection du territoire' : 'Carte : ' + contextName(target);
    var sig = name + '|' + level + '|' + items.map(function (i) { return i.name + i.details; }).join('#') + '|' + rivers.join(',');
    if (target.getAttribute('data-a11y-sig') === sig) return;
    target.setAttribute('data-a11y-sig', sig);

    // Nom accessible de la carte
    var altId = target.getAttribute('data-a11y-alt') || nextId('tdb-a11y-map');
    target.setAttribute('role', 'group');
    target.setAttribute('aria-label', name);
    target.setAttribute('aria-describedby', altId + '-summary');
    var cv = target.querySelectorAll('canvas');
    cv.forEach(function (c) { c.setAttribute('aria-hidden', 'true'); });

    // Contenu de la liste alternative
    var kind = isDrill ? 'territoires'
      : items.some(function (i) { return /^STEP|station|Pi\u00e9zo/i.test(i.name); }) || items.some(function (i) { return i.details && /D\u00e9bit|QMNA|Nappe|Capacit/.test(i.details); }) ? 'stations'
      : items.some(function (i) { return /Qualit\u00e9/.test(i.details); }) ? 'sites' : '\u00e9l\u00e9ments';

    var body = '';
    if (isDrill) {
      if (level === 'region') {
        body += '<p>S\u00e9lectionnez un d\u00e9partement pour afficher ses donn\u00e9es :</p><ul class="tdb-elu2-a11y-alt__list tdb-elu2-a11y-alt__list--btns">';
        items.forEach(function (i) {
          body += '<li><button type="button" class="tdb-elu2-a11y-alt__btn" data-a11y-territoire="' + esc(i.code) + '">' + esc(i.name) + '</button></li>';
        });
        body += '</ul>';
      } else {
        body += '<p>Intercommunalit\u00e9s du d\u00e9partement s\u00e9lectionn\u00e9 :</p><ul class="tdb-elu2-a11y-alt__list">';
        items.forEach(function (i) { body += '<li>' + esc(i.name) + '</li>'; });
        body += '</ul><p><button type="button" class="tdb-elu2-a11y-alt__btn" data-a11y-back="1">Revenir au Grand Est</button></p>';
      }
    } else {
      if (items.length) {
        body += '<ul class="tdb-elu2-a11y-alt__list">';
        items.forEach(function (i) {
          body += '<li><strong>' + esc(i.name) + '</strong>' + (i.details ? ' \u2014 ' + esc(i.details) : '') + '</li>';
        });
        body += '</ul>';
      } else {
        body += '<p>Cette carte pr\u00e9sente le contour du territoire s\u00e9lectionn\u00e9, sans \u00e9l\u00e9ment ponctuel.</p>';
      }
      if (rivers.length) body += '<p>Cours d\u2019eau repr\u00e9sent\u00e9s : ' + esc(rivers.join(', ')) + '.</p>';
    }

    var summary = isDrill
      ? (level === 'region' ? 'Choisir un territoire sans la carte (' + items.length + ' d\u00e9partements)' : 'Liste des intercommunalit\u00e9s (' + items.length + ')')
      : 'Afficher les donn\u00e9es de la carte sous forme de liste' + (items.length ? ' (' + items.length + ' ' + kind + ')' : '');

    var details = document.getElementById(altId);
    var wasOpen = details ? details.open : false;
    if (!details) {
      details = document.createElement('details');
      details.id = altId;
      details.className = 'tdb-elu2-a11y-alt';
      var host = cardOf(target) || target.parentElement;
      host.appendChild(details);
      target.setAttribute('data-a11y-alt', altId);
    }
    details.innerHTML = '<summary id="' + altId + '-summary">' + esc(summary) + '</summary><div class="tdb-elu2-a11y-alt__body">' + body + '</div>';
    details.open = wasOpen;
  }

  // Actions de la liste alternative (sélection d'un département)
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-a11y-territoire], [data-a11y-back]');
    if (!b) return;
    if (b.hasAttribute('data-a11y-back')) { if (window.__drillBack) window.__drillBack(); }
    else if (window.__tdbSelectTerritoire) window.__tdbSelectTerritoire(b.getAttribute('data-a11y-territoire'));
    // Replacer le focus sur la liste reconstruite
    setTimeout(function () {
      var s = document.querySelector('#tdb-elu2-drillmap') && document.getElementById(document.getElementById('tdb-elu2-drillmap').getAttribute('data-a11y-alt'));
      if (s) { s.open = true; var first = s.querySelector('button, summary'); if (first) first.focus(); }
    }, 900);
  });

  // ════════════════════════════════════════════════════════════════════
  // 3. STRUCTURE, ICÔNES, LIENS
  // ════════════════════════════════════════════════════════════════════
  var SUB_TITLES = '.tdb-elu2-ru-hydro__block-title, .tdb-elu2-demo__chart-title, .tdb-elu2-ressource-card__etat-title, .tdb-elu2-gov-baignade__pie-title, .tdb-elu2-gov-captdeg__pie-title, .tdb-elu2-gov-agri-surf__map-label, .tdb-elu2-gov-agri-surf__pie-label';

  function enhanceStructure(root) {
    // Bandeaux de section → niveau 2
    root.querySelectorAll('.tdb-elu2-banner').forEach(function (b) {
      b.setAttribute('role', 'heading'); b.setAttribute('aria-level', '2');
    });
    // Titres de tuiles → niveau 3, sous-titres internes → niveau 4
    root.querySelectorAll('[class*="__title"]').forEach(function (t) {
      if (/^H[1-6]$/.test(t.tagName) || !isTitleCandidate(t)) return;
      if (t.closest('h1,h2,h3,h4,h5,h6,[role="heading"]') && t.closest('[role="heading"]') !== t) return;
      if (t.matches('.tdb-elu2-ressource-card__etat-title')) return; // traité en sous-titre
      t.setAttribute('role', 'heading'); t.setAttribute('aria-level', '3');
    });
    // Sous-titres : niveau 4 s'ils sont dans une tuile titrée, sinon niveau 3 (pas de saut)
    root.querySelectorAll(SUB_TITLES).forEach(function (t) {
      if (/^H[1-6]$/.test(t.tagName)) return;
      var card = cardOf(t);
      var hasCardHeading = card && Array.prototype.some.call(card.querySelectorAll('[role="heading"][aria-level="3"], h3'), function (h) { return h !== t && !h.contains(t); });
      t.setAttribute('role', 'heading'); t.setAttribute('aria-level', hasCardHeading ? '4' : '3');
    });

    // Icônes décoratives
    root.querySelectorAll('i.ph, i[class*="ph-"], i.fa, i[class*="fa-"]').forEach(function (i) {
      if (!i.hasAttribute('aria-hidden')) i.setAttribute('aria-hidden', 'true');
    });

    // Liens « Méthodologie » sans fiche cible → désactivés proprement
    root.querySelectorAll('a[href^="#methodo"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (document.getElementById(id)) return;
      var s = document.createElement('span');
      s.className = a.className + ' is-pending';
      s.innerHTML = a.innerHTML + '<span class="sr-only"> (fiche bient\u00f4t disponible)</span>';
      s.setAttribute('title', 'Fiche m\u00e9thodologique bient\u00f4t disponible');
      a.replaceWith(s);
    });

    // Liens ouvrant une nouvelle fenêtre
    document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      if (a.getAttribute('data-a11y-blank')) return;
      a.setAttribute('data-a11y-blank', '1');
      var txt = (a.textContent || '').trim();
      if (!/nouvelle fen\u00eatre/i.test(txt)) a.insertAdjacentHTML('beforeend', '<span class="sr-only"> (nouvelle fen\u00eatre)</span>');
      var title = a.getAttribute('title') || txt;
      if (!/nouvelle fen\u00eatre/i.test(title)) a.setAttribute('title', title + ' (nouvelle fen\u00eatre)');
      var rel = (a.getAttribute('rel') || '');
      if (!/noopener/.test(rel)) a.setAttribute('rel', (rel + ' noopener').trim());
    });

    // Boutons sans type explicite
    root.querySelectorAll('button:not([type])').forEach(function (b) { b.setAttribute('type', 'button'); });
  }

  // ════════════════════════════════════════════════════════════════════
  // 4. ONGLETS — navigation clavier (flèches / Début / Fin)
  // ════════════════════════════════════════════════════════════════════
  document.addEventListener('keydown', function (e) {
    var tab = e.target.closest && e.target.closest('[role="tab"]');
    if (!tab) return;
    var list = tab.closest('[role="tablist"]');
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var i = tabs.indexOf(tab), next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    var id = tabs[next].id;
    tabs[next].click();
    // Le contenu peut être re-rendu : on retrouve l'onglet par son id
    setTimeout(function () { var t = document.getElementById(id); if (t) t.focus(); }, 30);
  });

  // ════════════════════════════════════════════════════════════════════
  // Orchestration
  // ════════════════════════════════════════════════════════════════════
  var pending = null;
  function runAll() {
    pending = null;
    var root = document.getElementById('tdb-elu2-content') || document.body;
    try { enhanceStructure(root); } catch (err) { /* silencieux */ }
    try { enhanceCharts(root); } catch (err) { /* silencieux */ }
    mapRegistry = mapRegistry.filter(function (m) { var t = m.getTargetElement && m.getTargetElement(); return t && t.isConnected; });
    // Cartes initialisées hors écran (taille 0) : pas d'événement rendercomplete → on construit l'alternative ici
    mapRegistry.forEach(function (m) { try { buildMapAlternative(m); } catch (err) { /* silencieux */ } });
  }
  function schedule() {
    if (pending) clearTimeout(pending);
    pending = setTimeout(runAll, 250);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('tdb-elu2-content');
    if (!root) return;
    new MutationObserver(function (muts) {
      // Ignorer nos propres insertions
      var relevant = muts.some(function (m) {
        return Array.prototype.some.call(m.addedNodes, function (n) {
          return n.nodeType === 1 && !(n.classList && (n.classList.contains('sr-only') || n.classList.contains('tdb-elu2-a11y-alt')));
        });
      });
      if (relevant) schedule();
    }).observe(root, { childList: true, subtree: true });
    schedule();
    // Les graphiques de la vue Annuel/Mensuel sont recréés sans mutation DOM
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.tdb-elu2-vuln-toggle__btn')) schedule();
    });
  });
})();
