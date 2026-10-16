/* ============================================================
 *  data-communes.js
 *  5 115 communes Grand Est — chargées dynamiquement depuis
 *  data/listing_territoires.xlsx (feuille Feuil1)
 *
 *  Ce script :
 *   1. Charge le fichier Excel via fetch + SheetJS
 *   2. Extrait toutes les lignes Typologie = "Commune"
 *   3. Calcule des coordonnées déterministes pour chaque commune
 *   4. Remplit COMMUNES_TERRITOIRES
 *   5. Injecte les communes dans DONNEES_TERRITOIRES (catégorie 'commune')
 *   6. Émet l'événement 'communes:loaded' sur document
 *
 *  Dépendances : SheetJS (doit être inclus AVANT ce script dans le HTML)
 * ============================================================ */

/* ── Centres départementaux ────────────────────────────────── */
var COMMUNES_DEPT_CENTERS = {
  '08': [4.75, 49.60], '10': [4.10, 48.30], '51': [4.35, 49.00],
  '52': [5.15, 48.10], '54': [6.20, 48.70], '55': [5.35, 49.00],
  '57': [6.65, 49.10], '67': [7.55, 48.55], '68': [7.35, 47.85],
  '88': [6.45, 48.20]
};

var COMMUNES_DEPT_SPREAD = {
  '08': [1.0, 0.75], '10': [0.9, 0.65], '51': [1.1, 0.85], '52': [0.95, 0.80],
  '54': [0.80, 0.70], '55': [0.90, 0.80], '57': [0.95, 0.80],
  '67': [0.65, 1.00], '68': [0.60, 0.85], '88': [0.72, 0.88]
};

/** Calcule les coordonnées d'une commune de façon déterministe */
function _communeCoords(nom, seed) {
  var m    = nom.match(/\((\d{5})\)/);
  var dept = m ? m[1].substring(0, 2) : '51';
  var c    = COMMUNES_DEPT_CENTERS[dept] || [6.0, 48.5];
  var s    = COMMUNES_DEPT_SPREAD[dept]  || [0.8, 0.7];
  var a    = (seed * 2.399963) % (2 * Math.PI);
  var r    = 0.05 + ((seed * 31 + 7) % 90) / 100 * 0.95;
  return [
    Math.round((c[0] + s[0] * 0.5 * r * Math.cos(a)) * 10000) / 10000,
    Math.round((c[1] + s[1] * 0.5 * r * Math.sin(a)) * 10000) / 10000
  ];
}

/* ── Tableau global (rempli de façon asynchrone) ────────────── */
var COMMUNES_TERRITOIRES = [];

/* ── Chemin vers le fichier Excel ───────────────────────────── */
var _COMMUNES_EXCEL_PATH = (function() {
  // Détecter si on est dans /template/ ou à la racine
  var base = '';
  if (typeof window !== 'undefined' && window.location) {
    var path = window.location.pathname;
    if (path.indexOf('/template/') !== -1) {
      base = '../';
    }
  }
  return base + 'data/listing_territoires.xlsx';
})();

/* ── Chargement asynchrone depuis l'Excel ───────────────────── */
(function() {
  // Vérifier que SheetJS est disponible
  if (typeof XLSX === 'undefined') {
    console.warn('[data-communes] SheetJS (XLSX) non disponible – communes non chargées');
    document.dispatchEvent(new CustomEvent('communes:loaded', { detail: { count: 0 } }));
    return;
  }

  fetch(_COMMUNES_EXCEL_PATH)
    .then(function(resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status + ' pour ' + _COMMUNES_EXCEL_PATH);
      return resp.arrayBuffer();
    })
    .then(function(buf) {
      var wb   = XLSX.read(buf, { type: 'array' });
      var ws   = wb.Sheets['Feuil1'];
      var data = XLSX.utils.sheet_to_json(ws, { defval: '' });

      // Extraire uniquement les communes
      var noms = [];
      data.forEach(function(row) {
        var typ = (row['Typologie territoire'] || '').trim();
        var nom = (row['Nom territoire'] || '').trim();
        if (typ === 'Commune' && nom) {
          noms.push(nom);
        }
      });

      // Construire COMMUNES_TERRITOIRES
      COMMUNES_TERRITOIRES = noms.map(function(nom, i) {
        var coords = _communeCoords(nom, i + 1);
        return {
          id:        'com-' + (i + 1),
          label:     nom,
          geometrie: 'point',
          coords:    coords
        };
      });

      console.log('[data-communes] Chargé –', COMMUNES_TERRITOIRES.length, 'communes depuis Excel');

      // Stats par département
      var stats = {};
      COMMUNES_TERRITOIRES.forEach(function(c) {
        var m = c.label.match(/\((\d{5})\)/);
        var d = m ? m[1].substring(0,2) : '??';
        stats[d] = (stats[d] || 0) + 1;
      });
      console.log('[data-communes] Répartition:', JSON.stringify(stats));

      // Injecter dans DONNEES_TERRITOIRES si disponible
      if (typeof DONNEES_TERRITOIRES !== 'undefined') {
        var catCommune = DONNEES_TERRITOIRES.filter(function(c) { return c.id === 'commune'; })[0];
        if (catCommune) {
          catCommune.territoires = COMMUNES_TERRITOIRES;
          console.log('[data-communes] Communes injectées dans DONNEES_TERRITOIRES');
        }
      }

      // Émettre un événement pour que cartographie.js puisse réagir
      document.dispatchEvent(new CustomEvent('communes:loaded', {
        detail: { count: COMMUNES_TERRITOIRES.length }
      }));
    })
    .catch(function(err) {
      console.error('[data-communes] Erreur chargement Excel:', err.message);
      document.dispatchEvent(new CustomEvent('communes:loaded', { detail: { count: 0, error: err.message } }));
    });
})();
