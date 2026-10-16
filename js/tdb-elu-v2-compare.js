/**
 * tdb-elu-v2-compare.js
 * ═══════════════════════════════════════════════════════════════════════
 * Outil « Comparer » du Tableau de bord Élu V2.
 *
 *  PAGE PRINCIPALE
 *   • Bouton « Comparer » dans la barre bleu foncé (.tdb-page-header)
 *     et dans le bandeau sticky (#tdb-elu2-mini-hero), à droite des KPI.
 *   • Lightbox : choix d'une zone (Départements / Agglomérations /
 *     Bassins versants / Communes), recherche, zones au profil proche.
 *   • Mode comparaison : deux colonnes (zone initiale à gauche, zone
 *     comparée à droite) ; chaque colonne est une vue embarquée de la
 *     même page (?embed=1) → toutes les tuiles, graphiques et cartes.
 *   • L'onglet de section, les sous-onglets (Eau potable…) et la bascule
 *     Annuel/Mensuel sont synchronisés entre les deux colonnes.
 *   • Le bouton (état actif « Quitter la comparaison ») revient à
 *     l'affichage normal de la zone initiale.
 *
 *  VUE EMBARQUÉE (?embed=1)
 *   • Masque l'en-tête, la navigation, le pied de page et la carte du Hero.
 *   • Crée à la volée les données fictives des zones qui n'en ont pas
 *     (agglomération, bassin versant, commune) à partir du département
 *     de rattachement, puis affiche la section demandée.
 *
 * Chargé après les fichiers de données et AVANT tableau-de-bord-elu-v2.js.
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var EMBED = params.get('embed') === '1';

  // ── Utilitaires ─────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, ' ');
  }
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }
  function num(v) {
    if (typeof v === 'number') return v;
    var n = parseFloat(String(v == null ? '' : v).replace(/[\s\u202f\u00a0]/g, '').replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  function fmtInt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); }

  function polyCenter(coords) {
    var x = 0, y = 0, n = 0;
    coords.forEach(function (c, i) { if (i === coords.length - 1 && coords.length > 3 && c[0] === coords[0][0] && c[1] === coords[0][1]) return; x += c[0]; y += c[1]; n++; });
    return [x / n, y / n];
  }
  function bboxOf(coords) {
    var b = [Infinity, Infinity, -Infinity, -Infinity];
    coords.forEach(function (c) { b[0] = Math.min(b[0], c[0]); b[1] = Math.min(b[1], c[1]); b[2] = Math.max(b[2], c[0]); b[3] = Math.max(b[3], c[1]); });
    return b;
  }
  function octagon(center, radiusDeg) {
    var pts = [];
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * 2 * Math.PI;
      pts.push([+(center[0] + radiusDeg * 1.45 * Math.cos(a)).toFixed(4), +(center[1] + radiusDeg * Math.sin(a)).toFixed(4)]);
    }
    pts.push(pts[0]);
    return pts;
  }
  function nearestDept(lonlat) {
    if (typeof GEO_DEPARTEMENTS_GE === 'undefined') return '51';
    var best = null, bd = Infinity;
    GEO_DEPARTEMENTS_GE.forEach(function (d) {
      if (d.synthetic) return;
      var dx = (d.center[0] - lonlat[0]) * 0.66, dy = d.center[1] - lonlat[1];
      var dist = dx * dx + dy * dy;
      if (dist < bd) { bd = dist; best = d.code; }
    });
    return best || '51';
  }
  function deptPop(code) {
    var d = typeof FAKE_DATA_DEPARTEMENTS !== 'undefined' ? FAKE_DATA_DEPARTEMENTS[code] : null;
    return d ? num(d.population) : null;
  }

  var KIND_LABELS = { dept: 'Département', agglo: 'Agglomération', bv: 'Bassin versant', commune: 'Commune', region: 'Région' };

  // Population / superficie estimées (déterministes) pour les zones sans données
  function estimateZone(kind, name, extra) {
    var r = hash(kind + '|' + name);
    var pop, sup;
    if (kind === 'agglo') {
      var big = /m[ée]tropole|eurom|CU /i.test(name);
      pop = big ? 220000 + r * 300000 : 45000 + r * 140000;
      sup = big ? 300 + r * 800 : 250 + r * 900;
    } else if (kind === 'bv') {
      sup = (extra && extra.sup) || (900 + r * 6000);
      pop = sup * (55 + r * 90);
    } else { // commune
      pop = 250 + Math.pow(r, 3) * 60000;
      sup = 6 + r * 45;
    }
    return { pop: Math.round(pop), sup: Math.round(sup) };
  }

  // ════════════════════════════════════════════════════════════════════
  // VUE EMBARQUÉE (une colonne de la comparaison)
  // ════════════════════════════════════════════════════════════════════
  if (EMBED) {
    document.documentElement.classList.add('tdb-cmp-embed');
    var FRAME = params.get('f') || 'L';
    var T = params.get('t') || '';
    var N = params.get('n') || '';
    var S = params.get('s') || '';

    // Zone synthétique (agglomération, bassin versant, commune)
    var kind = params.get('k');
    if (kind && T && typeof FAKE_DATA_DEPARTEMENTS !== 'undefined') {
      try { buildSyntheticZone(kind, T, N, params); } catch (err) { console.warn('[compare] zone synthétique', err); }
    }

    var reportTimer = null;
    var reportHeight = function () {
      clearTimeout(reportTimer);
      reportTimer = setTimeout(function () {
        var main = document.getElementById('main-content');
        var h = main ? Math.ceil(main.getBoundingClientRect().height) + 8 : document.documentElement.scrollHeight;
        try { if (window.parent && window.parent.__tdbCmpFromFrame) window.parent.__tdbCmpFromFrame(FRAME, { type: 'height', h: h }); } catch (e) { /* cross-origin */ }
      }, 60);
    };

    var notify = function (msg) {
      try { if (window.parent && window.parent.__tdbCmpFromFrame) window.parent.__tdbCmpFromFrame(FRAME, msg); } catch (e) { /* cross-origin */ }
    };

    var applyZone = function () {
      if (T && window.__tdbSwitchTerritoire) window.__tdbSwitchTerritoire(T, N);
    };

    // Appelés par la page principale
    window.__tdbCmpSection = function (sectionId) {
      if (window.__tdbActivateSection) window.__tdbActivateSection(sectionId);
      applyZone();
      reportHeight();
      setTimeout(reportHeight, 800);
      setTimeout(reportHeight, 2000);
    };
    var replaying = false;
    window.__tdbCmpClick = function (sel) {
      var el = document.querySelector(sel);
      if (!el || el.classList.contains('is-active')) return;
      replaying = true;
      el.click();
      replaying = false;
      setTimeout(reportHeight, 400);
      setTimeout(reportHeight, 1500);
    };

    // Synchronisation des sous-onglets vers l'autre colonne
    document.addEventListener('click', function (e) {
      if (replaying) return;
      var t = e.target.closest && e.target.closest('[data-gov-tab], [data-vuln-view]');
      if (!t) return;
      var sel = t.hasAttribute('data-gov-tab') ? '[data-gov-tab="' + t.getAttribute('data-gov-tab') + '"]' : '[data-vuln-view="' + t.getAttribute('data-vuln-view') + '"]';
      notify({ type: 'sync', sel: sel });
      setTimeout(reportHeight, 400);
    }, true);

    document.addEventListener('DOMContentLoaded', function () {
      // S'exécute après l'initialisation du moteur (même tâche, listener suivant)
      setTimeout(function () {
        if (S && window.__tdbGetSection && window.__tdbGetSection() !== S) window.__tdbActivateSection(S);
        applyZone();
        if (typeof ResizeObserver !== 'undefined') {
          var main = document.getElementById('main-content');
          if (main) new ResizeObserver(reportHeight).observe(main);
        }
        reportHeight();
        setTimeout(reportHeight, 1000);
        notify({ type: 'ready' });
      }, 0);
    });
    window.addEventListener('load', reportHeight);
    return; // pas d'UI de comparaison dans une vue embarquée
  }

  // Données fictives d'une zone sans jeu de données (dérivées du département de rattachement)
  function buildSyntheticZone(kind, code, name, p) {
    var parentCode = p.get('p') || '51';
    var parent = FAKE_DATA_DEPARTEMENTS[parentCode] || FAKE_DATA_DEPARTEMENTS[Object.keys(FAKE_DATA_DEPARTEMENTS)[0]];
    var pop = num(p.get('pop')) || 50000;
    var sup = num(p.get('sup')) || 500;
    var parentPop = num(parent.population) || 300000;
    var f = pop / parentPop;
    var seed = kind + '|' + name;
    var jit = function (key, amp) { return 1 + (hash(seed + key) - 0.5) * 2 * (amp || 0.12); };

    var scaleStr = function (v, key, minVal, decimals) {
      var n = num(v);
      if (n === null) return v;
      var out = Math.max(minVal || 0, n * f * jit(key, 0.15));
      return decimals ? out.toFixed(decimals) : fmtInt(out);
    };
    var jitStr = function (v, key, amp, max) {
      var n = num(v);
      if (n === null) return v;
      var dec = (String(v).split('.')[1] || '').length;
      var out = n * jit(key, amp);
      if (max) out = Math.min(max, out);
      return dec ? out.toFixed(dec) : String(Math.round(out));
    };

    var d = JSON.parse(JSON.stringify(parent));
    var type;
    if (kind === 'agglo') type = /^CU /.test(name) ? 'Communauté urbaine' : (/m[ée]tropole/i.test(name) ? 'Métropole' : 'Communauté d\u2019agglomération');
    else if (kind === 'bv') type = 'Bassin versant';
    else type = 'Commune';

    d.nom = name;
    d.type = type;
    d.population = fmtInt(pop);
    d.superficie = fmtInt(sup);
    var dens = pop / sup;
    d.densite = String(Math.round(dens));
    d.ruralite = dens < 60 ? 'Rural' : dens < 200 ? 'Semi-rural' : 'Urbain';
    d.popEvol = (parent.popEvol || []).map(function (v) { return +(v * f).toFixed(4); });
    d.coursEau = scaleStr(parent.coursEau, 'ce', 1);
    d.plansEau = scaleStr(parent.plansEau, 'pe', 0);
    d.etatChimSurf = jitStr(parent.etatChimSurf, 'cs', 0.15, 100);
    d.etatEcoSurf = jitStr(parent.etatEcoSurf, 'es', 0.18, 100);
    d.mesoNb = scaleStr(parent.mesoNb, 'me', 1);
    d.etatChimSout = jitStr(parent.etatChimSout, 'co', 0.12, 100);
    d.etatQuantiSout = jitStr(parent.etatQuantiSout, 'qo', 0.08, 100);
    d.prelData = (parent.prelData || []).map(function (row, i) { return row.map(function (v) { return +(v * f * jit('pr' + i, 0.2)).toFixed(2); }); });
    d.volumeAnnee = scaleStr(parent.volumeAnnee, 'va', 0, f < 0.05 ? 2 : 0);
    d.prixEau = jitStr(parent.prixEau, 'px', 0.1);
    d.prixAssain = jitStr(parent.prixAssain, 'pa', 0.1);
    d.captages = scaleStr(parent.captages, 'ca', 0);
    d.aac = jitStr(parent.aac, 'aa', 0.25, 100);

    var COUNT = /^(RAMSAR_NB|ZRE_NB|OBST_ECOUL_NB|SOUT_MESO_NB|GOV_CAPTDEG_NB|GOV_STEP_NB|SAGE_[A-Z_]+|GOV_AGENCES|GOV_EPTB|GOV_SAGE|GOV_GEMAPI_PI|GOV_GEMAPI_GMA|GOV_PROD_EP|GOV_DIST_EP|GOV_ASSAIN_C|GOV_ASSAIN_NC|ACT_GI_PLANS)$/;
    var VOLUME = /^(GOV_PREL_VOL|SURF_COURS_EAU|SURF_PLANS_EAU_NB|SURF_PLANS_EAU_SURF|RAMSAR_SURF)$/;
    var ind = d.ind || {};
    Object.keys(ind).forEach(function (k) {
      var v = ind[k];
      if (Array.isArray(v)) {
        if (k === 'obstData') ind[k] = v.map(function (x, i) { return Math.max(0, Math.round(x * Math.max(f * 3, 0.1) * jit(k + i, 0.3))); });
        return;
      }
      if (/_NOM$/.test(k)) return;
      if (/^VULN_(TEMP|PRECIP)/.test(k)) {
        var n0 = num(v);
        if (n0 !== null) ind[k] = /TEMP/.test(k) ? (n0 + (hash(seed + k) - 0.5) * 0.8).toFixed(1) : String(Math.round(n0 * jit(k, 0.08)));
        return;
      }
      if (COUNT.test(k)) {
        var n1 = num(v);
        if (n1 !== null) ind[k] = typeof v === 'number' ? Math.max(/^GOV_(AGENCES|EPTB)$/.test(k) ? 1 : 0, Math.round(n1 * Math.max(f * 2, 0.05) * jit(k, 0.2))) : String(Math.max(0, Math.round(n1 * f * jit(k, 0.2))));
        return;
      }
      if (VOLUME.test(k)) { ind[k] = scaleStr(v, k, 0); return; }
      if (typeof v === 'string' && num(v) !== null) ind[k] = jitStr(v, k, 0.12, /RATIO|COUV|SLGRI|REND/.test(k) ? 100 : 0);
    });
    d.ind = ind;
    FAKE_DATA_DEPARTEMENTS[code] = d;

    // Géométrie
    var contour = null;
    try { contour = JSON.parse(p.get('c') || 'null'); } catch (e) { contour = null; }
    var center = p.get('cx') ? p.get('cx').split(',').map(Number) : (contour ? polyCenter(contour) : [6.2, 48.7]);
    if (!contour || contour.length < 4) contour = octagon(center, Math.max(0.03, Math.sqrt(sup) / 111 / 1.4));
    var bbox = bboxOf(contour);
    if (typeof GEO_DEPARTEMENTS_GE !== 'undefined') {
      GEO_DEPARTEMENTS_GE.push({ code: code, nom: name, center: center, bbox: bbox, contour: contour, synthetic: true });
    }

    // Points des cartes : stations du département proches de la zone
    if (typeof GEO_DEPT_MAP_DATA !== 'undefined' && GEO_DEPT_MAP_DATA[parentCode]) {
      var src = JSON.parse(JSON.stringify(GEO_DEPT_MAP_DATA[parentCode]));
      var mx = (bbox[2] - bbox[0]) * 0.6 + 0.08, my = (bbox[3] - bbox[1]) * 0.6 + 0.06;
      ['hydroMoy', 'hydroEti', 'piezo', 'step'].forEach(function (key) {
        var arr = src[key] || [];
        var inside = arr.filter(function (s) { return Math.abs(s.coord[0] - center[0]) <= mx && Math.abs(s.coord[1] - center[1]) <= my; });
        if (!inside.length && arr.length) {
          inside = arr.slice().sort(function (a, b) {
            var da = Math.pow(a.coord[0] - center[0], 2) + Math.pow(a.coord[1] - center[1], 2);
            var db = Math.pow(b.coord[0] - center[0], 2) + Math.pow(b.coord[1] - center[1], 2);
            return da - db;
          }).slice(0, 1);
        }
        src[key] = inside;
      });
      GEO_DEPT_MAP_DATA[code] = src;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // PAGE PRINCIPALE — bouton, lightbox, mode comparaison
  // ════════════════════════════════════════════════════════════════════
  var state = { active: false, left: null, right: null, frames: {}, ready: {}, opener: null };
  var ZONES = { dept: null, agglo: null, bv: null, commune: null };
  var activeKind = 'dept';
  var selectedZone = null;
  var urlZone = null; // zone sans données ouverte depuis l'URL (agglomération, bassin versant)

  function currentZone() {
    var t = window.__tdbGetTerritoire ? window.__tdbGetTerritoire() : null;
    if (!t) {
      return { kind: 'region', code: '', nom: 'Grand Est', type: 'Région', pop: 5562651 };
    }
    if (urlZone && t.code === urlZone.code) return urlZone;
    return { kind: 'dept', code: t.code, nom: t.nom, type: t.type || 'Département', pop: deptPop(t.code) };
  }

  // ── Chargement paresseux de scripts ─────────────────────────────────
  var scriptPromises = {};
  function loadScript(src) {
    if (!scriptPromises[src]) {
      scriptPromises[src] = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error('Chargement impossible : ' + src)); };
        document.head.appendChild(s);
      });
    }
    return scriptPromises[src];
  }
  function siteUrl(rel) { return new URL(rel, window.location.href).href; }

  // ── Listes de zones ────────────────────────────────────────────────
  function getDepts() {
    if (ZONES.dept) return Promise.resolve(ZONES.dept);
    ZONES.dept = (typeof GEO_DEPARTEMENTS_GE !== 'undefined' ? GEO_DEPARTEMENTS_GE : []).filter(function (d) { return !d.synthetic; }).map(function (d) {
      var pop = deptPop(d.code);
      return { kind: 'dept', code: d.code, nom: d.nom, type: 'Département', pop: pop, meta: d.code + (pop ? ' \u00b7 ' + fmtInt(pop) + ' hab.' : '') };
    });
    return Promise.resolve(ZONES.dept);
  }

  function getAgglos() {
    if (ZONES.agglo) return Promise.resolve(ZONES.agglo);
    return loadScript(siteUrl('../js/data-territoires.js')).then(function () {
      var cat = (typeof DONNEES_TERRITOIRES !== 'undefined' ? DONNEES_TERRITOIRES : []).filter(function (c) { return c.id === 'epci'; })[0];
      var items = (cat ? cat.territoires : []).filter(function (t) {
        return /^(CA |CU )|m[ée]tropole|agglom[ée]ration/i.test(t.label);
      }).map(function (t) {
        var center = polyCenter(t.coords);
        var parent = nearestDept(center);
        var est = estimateZone('agglo', t.label);
        var type = /^CU /.test(t.label) ? 'Communauté urbaine' : (/m[ée]tropole/i.test(t.label) ? 'Métropole' : 'Communauté d\u2019agglomération');
        return { kind: 'agglo', code: 'AG-' + slug(t.label), nom: t.label, type: type, pop: est.pop, sup: est.sup, parent: parent, coords: t.coords, meta: type + ' \u00b7 ' + fmtInt(est.pop) + ' hab.' };
      }).sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr'); });
      ZONES.agglo = items;
      return items;
    });
  }

  function getBassins() {
    if (ZONES.bv) return Promise.resolve(ZONES.bv);
    var items = [];
    if (typeof DONNEES_SOURCES !== 'undefined') {
      DONNEES_SOURCES.forEach(function (cat) {
        (cat.filtres || []).forEach(function (fi) {
          if (fi.id !== 'bassins-versants-hydrographiques' && fi.id !== 'bassins-versants-specifiques') return;
          (fi.features || []).forEach(function (ft) {
            var label = String(ft.label || '').replace(/^BV (sp[ée]cifique )?/i, 'Bassin versant ' + (/sp[ée]cifique/i.test(ft.label) ? '' : 'de la ')).replace(/de la (Rhin|Aube)/, function (m, r) { return r === 'Rhin' ? 'du Rhin' : 'de l\u2019Aube'; });
            var supFromVal = num(String(ft.valeur || '').replace(/km.*$/, ''));
            var center = polyCenter(ft.coords);
            var est = estimateZone('bv', label, { sup: /km/.test(ft.valeur || '') ? supFromVal : null });
            items.push({ kind: 'bv', code: 'BV-' + slug(label), nom: label, type: fi.id === 'bassins-versants-specifiques' ? 'Bassin versant spécifique' : 'Bassin versant hydrographique', pop: est.pop, sup: est.sup, parent: nearestDept(center), coords: ft.coords, meta: fmtInt(est.sup) + ' km\u00b2' });
          });
        });
      });
    }
    ZONES.bv = items.sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr'); });
    return Promise.resolve(ZONES.bv);
  }

  function getCommunes() {
    if (ZONES.commune) return Promise.resolve(ZONES.commune);
    var go = typeof XLSX !== 'undefined' ? Promise.resolve() : loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
    return go.then(function () {
      return fetch(siteUrl('../data/listing_territoires.xlsx'));
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.arrayBuffer();
    }).then(function (buf) {
      var wb = XLSX.read(buf, { type: 'array' });
      var ws = wb.Sheets.Feuil1 || wb.Sheets[wb.SheetNames[0]];
      var rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      var list = [];
      rows.forEach(function (row, i) {
        if (String(row['Typologie territoire'] || '').trim() !== 'Commune') return;
        var nom = String(row['Nom territoire'] || '').trim();
        if (!nom) return;
        var m = nom.match(/\((\d{5})\)/);
        var dept = m ? m[1].substring(0, 2) : nearestDept([6.2, 48.7]);
        var dRef = (typeof GEO_DEPARTEMENTS_GE !== 'undefined' ? GEO_DEPARTEMENTS_GE : []).filter(function (x) { return x.code === dept; })[0];
        var base = dRef ? dRef.center : [6.2, 48.7];
        var a = (i * 2.399963) % (2 * Math.PI), rr = 0.05 + ((i * 31 + 7) % 90) / 100 * 0.38;
        var center = [+(base[0] + rr * 1.3 * Math.cos(a)).toFixed(4), +(base[1] + rr * Math.sin(a)).toFixed(4)];
        var clean = nom.replace(/\s*\(\d{5}\)\s*$/, '');
        var est = estimateZone('commune', nom);
        list.push({ kind: 'commune', code: 'CO-' + slug(nom), nom: clean, full: nom, type: 'Commune', pop: est.pop, sup: est.sup, parent: dept, center: center, meta: (m ? m[1] + ' \u00b7 ' : '') + fmtInt(est.pop) + ' hab.', n: norm(nom) });
      });
      ZONES.commune = list;
      return list;
    });
  }

  var KINDS = [
    { id: 'dept', label: 'Départements', icon: 'ph-map-trifold', loader: getDepts },
    { id: 'agglo', label: 'Agglomérations', icon: 'ph-buildings', loader: getAgglos },
    { id: 'bv', label: 'Bassins versants', icon: 'ph-waves', loader: getBassins },
    { id: 'commune', label: 'Communes', icon: 'ph-house-line', loader: getCommunes }
  ];

  // ── Boutons « Comparer » ────────────────────────────────────────────
  function buttonHtml(variant) {
    return '<button type="button" class="tdb-cmp-btn tdb-cmp-btn--' + variant + '" data-tdb-cmp-toggle aria-haspopup="dialog" aria-pressed="false">'
      + '<i class="ph ph-arrows-left-right" aria-hidden="true"></i>'
      + '<span class="tdb-cmp-btn__label">Comparer</span>'
      + '<span class="tdb-cmp-btn__sub">avec une zone géographique</span>'
      + '</button>';
  }

  function injectButtons() {
    var inner = document.querySelector('#tdb-page-header .tdb-page-header__inner');
    if (inner && !inner.querySelector('[data-tdb-cmp-toggle]')) {
      var ctrl = document.createElement('div');
      ctrl.className = 'tdb-page-header__controls tdb-cmp-header-controls';
      ctrl.innerHTML = buttonHtml('header');
      inner.appendChild(ctrl);
    }
    var mini = document.querySelector('#tdb-elu2-mini-hero .tdb-elu2-mini-hero__inner');
    if (mini && !mini.querySelector('[data-tdb-cmp-toggle]')) {
      var right = document.createElement('div');
      right.className = 'tdb-elu2-mini-hero__right';
      var kpis = mini.querySelector('.tdb-elu2-mini-hero__kpis');
      if (kpis) right.appendChild(kpis);
      var act = document.createElement('div');
      act.className = 'tdb-elu2-mini-hero__actions';
      act.innerHTML = buttonHtml('mini');
      right.appendChild(act);
      mini.appendChild(right);
      var left = mini.querySelector('.tdb-elu2-mini-hero__left');
      if (left && !left.querySelector('.tdb-elu2-mini-hero__vs')) {
        var vs = document.createElement('span');
        vs.className = 'tdb-elu2-mini-hero__vs';
        vs.hidden = true;
        left.appendChild(vs);
      }
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-tdb-cmp-toggle]');
      if (!b) return;
      if (state.active) stopCompare(); else openModal(b);
    });
  }

  function updateButtons() {
    document.querySelectorAll('[data-tdb-cmp-toggle]').forEach(function (b) {
      b.classList.toggle('is-active', state.active);
      b.setAttribute('aria-pressed', state.active ? 'true' : 'false');
      if (state.active) b.removeAttribute('aria-haspopup'); else b.setAttribute('aria-haspopup', 'dialog');
      b.querySelector('i').className = 'ph ' + (state.active ? 'ph-x-circle' : 'ph-arrows-left-right');
      b.querySelector('.tdb-cmp-btn__label').textContent = state.active ? 'Quitter la comparaison' : 'Comparer';
      b.querySelector('.tdb-cmp-btn__sub').textContent = state.active ? 'Revenir à ' + state.left.nom : 'avec une zone géographique';
      b.setAttribute('title', state.active ? 'Quitter la comparaison et revenir à l\u2019affichage de ' + state.left.nom : 'Comparer ' + currentZone().nom + ' avec une autre zone géographique');
    });
    var mini = document.getElementById('tdb-elu2-mini-hero');
    var vs = document.querySelector('.tdb-elu2-mini-hero__vs');
    if (mini) mini.classList.toggle('is-comparing', state.active);
    if (vs) {
      vs.hidden = !state.active;
      vs.innerHTML = state.active ? '<i class="ph ph-arrows-left-right" aria-hidden="true"></i> ' + esc(state.right.nom) : '';
    }
  }

  // ── Lightbox ────────────────────────────────────────────────────────
  function buildModal() {
    if (document.getElementById('tdb-cmp-overlay')) return;
    var ov = document.createElement('div');
    ov.id = 'tdb-cmp-overlay';
    ov.className = 'tdb-cmp-overlay';
    ov.hidden = true;
    var tabs = KINDS.map(function (k) {
      return '<button type="button" role="tab" id="tdb-cmp-kind-' + k.id + '" class="tdb-cmp-kind" data-kind="' + k.id + '" aria-controls="tdb-cmp-panel" aria-selected="false" tabindex="-1">'
        + '<i class="ph ' + k.icon + '" aria-hidden="true"></i> ' + esc(k.label) + ' <span class="tdb-cmp-kind__count" data-count="' + k.id + '"></span></button>';
    }).join('');
    ov.innerHTML = ''
      + '<div class="tdb-cmp-modal" role="dialog" aria-modal="true" aria-labelledby="tdb-cmp-title" aria-describedby="tdb-cmp-desc">'
      + '  <button type="button" class="tdb-cmp-modal__close" data-tdb-cmp-close aria-label="Fermer la fenêtre de comparaison"><i class="ph ph-x" aria-hidden="true"></i></button>'
      + '  <h2 class="tdb-cmp-modal__title" id="tdb-cmp-title"><i class="ph ph-arrows-left-right" aria-hidden="true"></i> Comparer avec une autre zone géographique</h2>'
      + '  <p class="tdb-cmp-modal__desc" id="tdb-cmp-desc"></p>'
      + '  <div class="tdb-cmp-kinds" role="tablist" aria-label="Type de zone géographique">' + tabs + '</div>'
      + '  <div class="tdb-cmp-panel" id="tdb-cmp-panel" role="tabpanel">'
      + '    <label class="tdb-cmp-search__label" for="tdb-cmp-search" id="tdb-cmp-search-label">Rechercher</label>'
      + '    <div class="tdb-cmp-search"><i class="ph ph-magnifying-glass" aria-hidden="true"></i>'
      + '      <input type="search" id="tdb-cmp-search" class="tdb-cmp-search__input" autocomplete="off" aria-describedby="tdb-cmp-status"></div>'
      + '    <p class="tdb-cmp-status" id="tdb-cmp-status" role="status" aria-live="polite"></p>'
      + '    <fieldset class="tdb-cmp-list-wrap"><legend class="sr-only" id="tdb-cmp-legend">Zones disponibles</legend>'
      + '      <div class="tdb-cmp-list" id="tdb-cmp-list"></div></fieldset>'
      + '  </div>'
      + '  <div class="tdb-cmp-modal__footer">'
      + '    <button type="button" class="tdb-cmp-modal__cancel" data-tdb-cmp-close>Annuler</button>'
      + '    <button type="button" class="tdb-cmp-modal__validate" id="tdb-cmp-validate" disabled><i class="ph ph-check-circle" aria-hidden="true"></i> Comparer</button>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(ov);

    ov.addEventListener('click', function (e) {
      if (e.target === ov || (e.target.closest && e.target.closest('[data-tdb-cmp-close]'))) closeModal();
      var k = e.target.closest && e.target.closest('.tdb-cmp-kind');
      if (k) setKind(k.getAttribute('data-kind'));
    });
    ov.addEventListener('change', function (e) {
      if (e.target.name !== 'tdb-cmp-zone') return;
      selectedZone = findZone(e.target.value);
      document.getElementById('tdb-cmp-validate').disabled = !selectedZone;
    });
    ov.addEventListener('dblclick', function (e) {
      var opt = e.target.closest && e.target.closest('.tdb-cmp-opt');
      if (opt && selectedZone) validate();
    });
    document.getElementById('tdb-cmp-search').addEventListener('input', function () { renderList(); });
    document.getElementById('tdb-cmp-validate').addEventListener('click', validate);
    ov.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key === 'Enter' && e.target.name === 'tdb-cmp-zone' && selectedZone) { e.preventDefault(); validate(); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(ov.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), input:not([type="radio"])'), function (el) {
        return el.offsetParent !== null;
      });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function findZone(code) {
    var all = [].concat(ZONES.dept || [], ZONES.agglo || [], ZONES.bv || [], ZONES.commune || []);
    return all.filter(function (z) { return z.code === code; })[0] || null;
  }

  function setInert(on) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el.id === 'tdb-cmp-overlay' || el.tagName === 'SCRIPT') return;
      // Ne marque que les éléments qui n'étaient pas déjà inertes (ex. bandeau compact masqué),
      // pour ne pas leur retirer `inert` à la fermeture
      if (on) { if (!el.hasAttribute('inert')) { el.setAttribute('inert', ''); el.setAttribute('data-tdb-cmp-inert', ''); } }
      else if (el.hasAttribute('data-tdb-cmp-inert')) { el.removeAttribute('inert'); el.removeAttribute('data-tdb-cmp-inert'); }
    });
  }

  function openModal(opener) {
    buildModal();
    state.opener = opener || null;
    var cur = currentZone();
    var ov = document.getElementById('tdb-cmp-overlay');
    document.getElementById('tdb-cmp-desc').innerHTML = 'Zone affichée : <strong>' + esc(cur.nom) + '</strong> (' + esc(cur.type) + '). '
      + 'Choisissez la zone à afficher à droite : les tuiles des deux zones seront présentées côte à côte.';
    selectedZone = null;
    document.getElementById('tdb-cmp-validate').disabled = true;
    document.getElementById('tdb-cmp-search').value = '';
    ov.hidden = false;
    requestAnimationFrame(function () { ov.classList.add('is-open'); });
    setInert(true);
    document.documentElement.classList.add('tdb-cmp-noscroll');
    // Zones « similaires » : même type que la zone affichée
    setKind(cur.kind === 'region' ? 'dept' : (cur.kind || 'dept'), true);
    // Compteurs
    getDepts().then(function (l) { setCount('dept', l.length - (cur.kind === 'dept' ? 1 : 0)); });
    getBassins().then(function (l) { setCount('bv', l.length); });
    if (ZONES.agglo) setCount('agglo', ZONES.agglo.length);
    if (ZONES.commune) setCount('commune', ZONES.commune.length);
  }

  function setCount(kind, n) {
    var el = document.querySelector('[data-count="' + kind + '"]');
    if (el) el.textContent = n ? '(' + fmtInt(n) + ')' : '';
  }

  function closeModal() {
    var ov = document.getElementById('tdb-cmp-overlay');
    if (!ov || ov.hidden) return;
    ov.classList.remove('is-open');
    setInert(false);
    document.documentElement.classList.remove('tdb-cmp-noscroll');
    setTimeout(function () { ov.hidden = true; }, 200);
    if (state.opener && state.opener.isConnected && state.opener.offsetParent !== null) state.opener.focus();
    else { var b = document.querySelector('.tdb-cmp-btn--header'); if (b) b.focus(); }
  }

  function setKind(kind, focusSearch) {
    activeKind = kind;
    selectedZone = null;
    document.getElementById('tdb-cmp-validate').disabled = true;
    document.querySelectorAll('.tdb-cmp-kind').forEach(function (b) {
      var on = b.getAttribute('data-kind') === kind;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
      b.classList.toggle('is-active', on);
    });
    var panel = document.getElementById('tdb-cmp-panel');
    panel.setAttribute('aria-labelledby', 'tdb-cmp-kind-' + kind);
    var k = KINDS.filter(function (x) { return x.id === kind; })[0];
    document.getElementById('tdb-cmp-search-label').textContent = 'Rechercher parmi les ' + k.label.toLowerCase();
    var input = document.getElementById('tdb-cmp-search');
    input.placeholder = kind === 'commune' ? 'Saisissez le nom ou le code postal d\u2019une commune…' : 'Filtrer la liste…';
    input.value = '';
    document.getElementById('tdb-cmp-legend').textContent = k.label + ' disponibles';
    var list = document.getElementById('tdb-cmp-list');
    list.innerHTML = '';
    setStatus(kind === 'commune' && !ZONES.commune ? 'Chargement des communes du Grand Est…' : 'Chargement…');
    k.loader().then(function (items) {
      setCount(kind, items.length - (kind === 'dept' && currentZone().kind === 'dept' ? 1 : 0));
      if (activeKind === kind) renderList();
    }).catch(function (err) {
      setStatus('Impossible de charger la liste (' + err.message + ').');
    });
    if (focusSearch) setTimeout(function () { input.focus(); }, 60);
  }

  function setStatus(msg) { document.getElementById('tdb-cmp-status').textContent = msg; }

  function renderList() {
    var items = ZONES[activeKind];
    if (!items) return;
    var cur = currentZone();
    var q = norm(document.getElementById('tdb-cmp-search').value.trim());
    var list = items.filter(function (z) { return !(z.kind === cur.kind && z.code === cur.code); });
    var html = '';
    var similar = {};

    if (activeKind === 'dept' && cur.pop) {
      // Profil proche : départements à la population la plus proche
      list = list.slice().sort(function (a, b) { return Math.abs((a.pop || 0) - cur.pop) - Math.abs((b.pop || 0) - cur.pop); });
      if (cur.kind === 'dept') list.slice(0, 3).forEach(function (z) { similar[z.code] = true; });
    }
    if (activeKind === 'commune') {
      if (q.length < 2) {
        setStatus(fmtInt(items.length) + ' communes. Saisissez au moins 2 caractères pour lancer la recherche.');
        document.getElementById('tdb-cmp-list').innerHTML = '';
        return;
      }
      list = list.filter(function (z) { return z.n.indexOf(q) !== -1; });
      list.sort(function (a, b) { return (b.n.indexOf(q) === 0) - (a.n.indexOf(q) === 0) || b.pop - a.pop; });
    } else if (q) {
      list = list.filter(function (z) { return norm(z.nom + ' ' + z.meta).indexOf(q) !== -1; });
    }

    var total = list.length;
    var shown = list.slice(0, 60);
    shown.forEach(function (z) {
      var id = 'tdb-cmp-opt-' + z.code.replace(/[^a-zA-Z0-9_-]/g, '');
      html += '<label class="tdb-cmp-opt" for="' + id + '">'
        + '<input type="radio" name="tdb-cmp-zone" id="' + id + '" value="' + esc(z.code) + '">'
        + '<span class="tdb-cmp-opt__name">' + esc(z.nom) + '</span>'
        + '<span class="tdb-cmp-opt__meta">' + esc(z.meta || z.type) + '</span>'
        + (similar[z.code] ? '<span class="tdb-cmp-opt__badge">Profil proche</span>' : '')
        + '</label>';
    });
    document.getElementById('tdb-cmp-list').innerHTML = html || '<p class="tdb-cmp-empty">Aucune zone ne correspond à votre recherche.</p>';
    setStatus(total === 0 ? 'Aucun résultat.' : (total > shown.length ? total + ' résultats, ' + shown.length + ' affichés : précisez la recherche.' : total + ' zone' + (total > 1 ? 's' : '') + ' disponible' + (total > 1 ? 's' : '') + '.'));
    selectedZone = null;
    document.getElementById('tdb-cmp-validate').disabled = true;
  }

  function validate() {
    if (!selectedZone) return;
    var zone = selectedZone;
    closeModal();
    startCompare(zone);
  }

  // ── Mode comparaison ────────────────────────────────────────────────
  function frameUrl(side, zone, section) {
    var q = zoneParams(zone);
    q.set('embed', '1');
    q.set('f', side);
    if (section) q.set('s', section);
    return window.location.pathname + '?' + q.toString();
  }

  // Paramètres décrivant une zone (lus par buildSyntheticZone pour les zones sans données)
  function zoneParams(zone) {
    var q = new URLSearchParams();
    if (zone.kind === 'dept') { q.set('t', zone.code); q.set('n', zone.nom); }
    else if (zone.kind !== 'region') {
      q.set('t', zone.code); q.set('n', zone.nom); q.set('k', zone.kind);
      q.set('p', zone.parent || '51'); q.set('pop', String(zone.pop || '')); q.set('sup', String(zone.sup || ''));
      if (zone.coords) q.set('c', JSON.stringify(zone.coords.map(function (c) { return [+c[0].toFixed(3), +c[1].toFixed(3)]; })));
      if (zone.center) q.set('cx', zone.center.join(','));
    }
    return q;
  }

  function headHtml(side, zone) {
    var meta = [zone.type];
    if (zone.pop) meta.push(fmtInt(zone.pop) + ' hab.');
    return '<div class="tdb-elu2-compare__head tdb-elu2-compare__head--' + (side === 'L' ? 'left' : 'right') + '">'
      + '<span class="tdb-elu2-compare__tag">' + (side === 'L' ? 'Zone initiale' : 'Zone comparée') + '</span>'
      + '<h2 class="tdb-elu2-compare__name"><i class="ph ph-map-pin" aria-hidden="true"></i><span class="tdb-elu2-compare__name-text" title="' + esc(zone.nom) + '">' + esc(zone.nom) + '</span></h2>'
      + '<span class="tdb-elu2-compare__meta" title="' + esc(meta.join(' \u00b7 ')) + '">' + esc(meta.join(' \u00b7 ')) + '</span>'
      + (side === 'R' ? '<button type="button" class="tdb-elu2-compare__change" data-tdb-cmp-change><i class="ph ph-swap" aria-hidden="true"></i> Changer de zone</button>' : '')
      + '</div>';
  }

  function startCompare(zone) {
    var section = window.__tdbGetSection ? window.__tdbGetSection() : '';
    state.left = currentZone();
    state.right = zone;
    state.active = true;
    state.ready = {};

    var wrap = document.getElementById('tdb-elu2-compare');
    if (!wrap) {
      wrap = document.createElement('section');
      wrap.id = 'tdb-elu2-compare';
      wrap.className = 'tdb-elu2-compare';
      var content = document.getElementById('tdb-elu2-content');
      content.parentNode.insertBefore(wrap, content);
      wrap.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('[data-tdb-cmp-change]')) openModal(e.target.closest('[data-tdb-cmp-change]'));
      });
    }
    wrap.setAttribute('aria-label', 'Comparaison : ' + state.left.nom + ' et ' + state.right.nom);
    wrap.innerHTML = ''
      + '<div class="tdb-elu2-compare__cols">'
      + colHtml('L', state.left, section)
      + colHtml('R', state.right, section)
      + '</div>';
    state.frames = { L: wrap.querySelector('[data-side="L"] iframe'), R: wrap.querySelector('[data-side="R"] iframe') };

    wrap.classList.add('is-active');
    document.body.classList.add('tdb-cmp-active');
    updateButtons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.__tdbRecheckSticky) window.__tdbRecheckSticky();
    updateHeadTop();
    if (window.a11yAnnounce) window.a11yAnnounce('Comparaison affichée : ' + state.left.nom + ' à gauche, ' + state.right.nom + ' à droite.');
  }

  function colHtml(side, zone, section) {
    return '<div class="tdb-elu2-compare__col" data-side="' + side + '">'
      + headHtml(side, zone)
      + '<div class="tdb-elu2-compare__loading" aria-hidden="true"><i class="ph ph-spinner ph-spin"></i> Chargement de ' + esc(zone.nom) + '…</div>'
      + '<iframe class="tdb-elu2-compare__frame" src="' + esc(frameUrl(side, zone, section)) + '" title="Tableau de bord — ' + esc(zone.nom) + (side === 'L' ? ' (zone initiale)' : ' (zone comparée)') + '" loading="eager" scrolling="no"></iframe>'
      + '</div>';
  }

  function stopCompare() {
    if (!state.active) return;
    var left = state.left;
    state.active = false;
    var wrap = document.getElementById('tdb-elu2-compare');
    if (wrap) { wrap.classList.remove('is-active'); wrap.innerHTML = ''; }
    state.frames = {};
    document.body.classList.remove('tdb-cmp-active');
    updateButtons();
    if (window.__tdbRecheckSticky) window.__tdbRecheckSticky();
    // Ré-affiche proprement la zone initiale (le contenu a pu être rendu masqué)
    var section = window.__tdbGetSection ? window.__tdbGetSection() : null;
    if (section && window.__tdbActivateSection) window.__tdbActivateSection(section);
    // Le Hero ré-rendu repart des valeurs par défaut : on réapplique la zone initiale
    if (left && left.kind === 'dept' && window.__tdbSwitchTerritoire) window.__tdbSwitchTerritoire(left.code, left.nom);
    if (window.a11yAnnounce) window.a11yAnnounce('Comparaison fermée. Affichage de ' + (left ? left.nom : 'la zone initiale') + '.');
    var b = document.querySelector('.tdb-cmp-btn--header');
    if (b) setTimeout(function () { b.focus({ preventScroll: true }); }, 50);
  }

  // Messages des vues embarquées
  window.__tdbCmpFromFrame = function (side, msg) {
    if (!state.active) return;
    var frame = state.frames[side];
    if (!frame) return;
    if (msg.type === 'height') {
      frame.style.height = Math.max(400, msg.h) + 'px';
      if (window.__tdbRecheckSticky) window.__tdbRecheckSticky();
    } else if (msg.type === 'ready') {
      state.ready[side] = true;
      var col = frame.parentElement;
      if (col) col.classList.add('is-ready');
    } else if (msg.type === 'sync') {
      var other = state.frames[side === 'L' ? 'R' : 'L'];
      try { if (other && other.contentWindow && other.contentWindow.__tdbCmpClick) other.contentWindow.__tdbCmpClick(msg.sel); } catch (e) { /* ignore */ }
    }
  };

  // Changement de section (onglets principaux) → les deux colonnes suivent
  function bindSectionSync() {
    var nav = document.getElementById('tdb-elu2-nav');
    if (!nav) return;
    nav.addEventListener('click', function (e) {
      if (!state.active || !(e.target.closest && e.target.closest('.tdb-elu2-nav__btn'))) return;
      setTimeout(function () {
        var s = window.__tdbGetSection ? window.__tdbGetSection() : '';
        ['L', 'R'].forEach(function (side) {
          var fr = state.frames[side];
          if (!fr) return;
          try {
            if (state.ready[side] && fr.contentWindow.__tdbCmpSection) fr.contentWindow.__tdbCmpSection(s);
            else fr.src = frameUrl(side, side === 'L' ? state.left : state.right, s);
          } catch (err) { fr.src = frameUrl(side, side === 'L' ? state.left : state.right, s); }
        });
      }, 0);
    });
  }

  // En-têtes de colonnes collants : positionnés juste sous la barre d'onglets collante
  // (sa position varie selon que la barre bleu foncé est affichée ou remplacée par le mini-bandeau)
  function updateHeadTop() {
    if (!state.active) return;
    var nav = document.getElementById('tdb-elu2-nav');
    if (!nav) return;
    var navTop = parseFloat(getComputedStyle(nav).top) || 0;
    // +10 px = largeur du halo opaque : il rejoint exactement le bas de la barre d'onglets
    var v = Math.round(navTop + nav.offsetHeight + 10);
    document.documentElement.style.setProperty('--tdb-cmp-head-top', v + 'px');
  }
  var headTopRaf = 0;
  function scheduleHeadTop() {
    if (headTopRaf) return;
    headTopRaf = requestAnimationFrame(function () { headTopRaf = 0; updateHeadTop(); });
  }
  window.addEventListener('scroll', scheduleHeadTop, { passive: true });
  window.addEventListener('resize', scheduleHeadTop);
  // La barre bleu foncé s'escamote avec une transition de 0,3 s : on recalcule à la fin
  document.addEventListener('transitionend', function (e) {
    if (e.target && e.target.id === 'tdb-page-header') updateHeadTop();
  });

  // ── Ouverture sur un territoire passé dans l'URL (liens du méga-menu) ──
  //   ?echelle=Département&territoire=Bas-Rhin (67)
  //   ?echelle=EPCI&territoire=Metz Métropole
  //   ?echelle=Bassin versant&territoire=Moselle
  function findByName(items, name) {
    var n = norm(name).trim();
    var re = new RegExp('(^|[^a-z])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)');
    return items.filter(function (z) { return norm(z.nom) === n || (z.full && norm(z.full) === n); })[0]
      || items.filter(function (z) { return re.test(norm(z.nom)); })[0]
      || null;
  }

  function openUrlZone() {
    var echelle = norm(params.get('echelle'));
    var territoire = params.get('territoire') || '';
    if (!territoire || !echelle || echelle === 'grand est') return;

    if (echelle === 'departement') {
      var m = territoire.match(/\((\d{2})\)/);
      var code = m ? m[1] : null;
      if (!code) {
        var d = findByName(ZONES.dept || [], territoire);
        code = d ? d.code : null;
      }
      if (!code || typeof FAKE_DATA_DEPARTEMENTS === 'undefined' || !FAKE_DATA_DEPARTEMENTS[code]) return;
      // Même parcours qu'un clic sur la carte (zoom + EPCI), dès que la carte est prête
      var tries = 0;
      (function selectDept() {
        if (window.__tdbSelectTerritoire) window.__tdbSelectTerritoire(code);
        if (window.__tdbDrillLevel && window.__tdbDrillLevel() === 'departement') return;
        if (++tries < 30) { setTimeout(selectDept, 100); return; }
        if (window.__tdbSwitchTerritoire) window.__tdbSwitchTerritoire(code, FAKE_DATA_DEPARTEMENTS[code].nom);
      })();
      return;
    }

    var loader = echelle === 'epci' ? getAgglos
      : echelle.indexOf('bassin') === 0 ? getBassins
      : echelle === 'commune' ? getCommunes : null;
    if (!loader) return;
    loader().then(function (items) {
      var zone = findByName(items, territoire);
      if (!zone) { console.warn('[tdb] territoire introuvable :', territoire); return; }
      buildSyntheticZone(zone.kind, zone.code, zone.nom, zoneParams(zone));
      urlZone = zone;
      if (window.__tdbSwitchTerritoire) window.__tdbSwitchTerritoire(zone.code, zone.nom);
    }).catch(function (err) { console.warn('[tdb] territoire de l’URL', err); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Après l'initialisation du moteur (mini-bandeau créé)
    setTimeout(function () {
      injectButtons();
      updateButtons();
      bindSectionSync();
      // Le libellé du bouton suit la zone affichée
      document.addEventListener('tdb:territoire', function () { if (!state.active) updateButtons(); });
      getDepts().then(openUrlZone);
    }, 0);
  });
})();
