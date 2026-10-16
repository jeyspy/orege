/* ============================================================
 *  data-carto-sources.js
 *  Panel 1 – Données sources cartographiques
 *  Source : matrice_indicateurs.xlsx → feuille Donnees_sources
 *  Col A = "Données (libellés)", Col B = "Thèmes carto - Légende", 
 *  Col C = "Type géométrie"
 *
 *  ITEMS EXCLUS DE CE PANEL (gérés dans Panel 2 – Territoires) :
 *    - Territoire : Commune, Département, EPCI, Maison de Région,
 *      Pays/PETR, PCAET, PTRTE, Région, SCOT
 *
 *  THEMES : Gouvernance de l'eau | Hydrogéologie | Hydrologie |
 *           Qualité des eaux | Usages sectoriels de l'eau |
 *           Gestion quantitative de l'eau | Vulnérabilité et risques climatiques
 * ============================================================ */

/* ── Région Grand Est – emprise et centres départementaux ────── */
const GE_BBOX = { minLon: 4.7, maxLon: 8.2, minLat: 47.4, maxLat: 49.7 };
const GE_DEPTS = [
  { nom: 'Ardennes',          cx: 4.75, cy: 49.60 },
  { nom: 'Aube',              cx: 4.10, cy: 48.30 },
  { nom: 'Marne',             cx: 4.35, cy: 49.00 },
  { nom: 'Haute-Marne',       cx: 5.15, cy: 48.10 },
  { nom: 'Meurthe-et-Moselle',cx: 6.20, cy: 48.70 },
  { nom: 'Meuse',             cx: 5.35, cy: 49.00 },
  { nom: 'Moselle',           cx: 6.65, cy: 49.10 },
  { nom: 'Bas-Rhin',          cx: 7.55, cy: 48.55 },
  { nom: 'Haut-Rhin',         cx: 7.35, cy: 47.85 },
  { nom: 'Vosges',            cx: 6.45, cy: 48.20 }
];

/* ── Générateurs géométriques ─────────────────────────────────── */

/** Points déterministes (seed-based) */
function gePts(seed, n, cx, cy, radius) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const angle = ((seed * 137.5 + i * 73.7) % 360) * Math.PI / 180;
    const r = radius * (0.3 + ((seed + i * 31) % 70) / 100);
    pts.push([
      Math.round((cx + Math.cos(angle) * r) * 10000) / 10000,
      Math.round((cy + Math.sin(angle) * r) * 10000) / 10000
    ]);
  }
  return pts;
}

/** Distribue n points sur tous les départements */
function geAllPts(seed, n) {
  const pts = [];
  const perDept = Math.ceil(n / GE_DEPTS.length);
  GE_DEPTS.forEach((d, di) => {
    const sub = gePts(seed + di * 17, perDept, d.cx, d.cy, 0.35);
    sub.forEach(p => pts.push(p));
  });
  return pts.slice(0, n);
}

/** Polyligne simulée */
function geLine(seed, cx, cy, n) {
  const coords = [];
  let lon = cx, lat = cy;
  for (let i = 0; i < n; i++) {
    lon += ((seed + i * 43) % 20 - 10) / 100;
    lat += ((seed + i * 67) % 20 - 10) / 100;
    coords.push([Math.round(lon * 10000) / 10000, Math.round(lat * 10000) / 10000]);
  }
  return coords;
}

/** Polygone convexe simulé */
function gePoly(seed, cx, cy, w, h) {
  const sides = 6 + (seed % 4);
  const coords = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    const rx = (w / 2) * (0.7 + ((seed + i * 23) % 30) / 100);
    const ry = (h / 2) * (0.7 + ((seed + i * 37) % 30) / 100);
    coords.push([
      Math.round((cx + rx * Math.cos(angle)) * 10000) / 10000,
      Math.round((cy + ry * Math.sin(angle)) * 10000) / 10000
    ]);
  }
  coords.push(coords[0]); // fermeture
  return coords;
}

/** Année simulée de dernière mesure */
function derniereAnnee(seed) {
  const annees = [2022, 2023, 2024, 2025];
  return annees[seed % annees.length];
}

/**
 * Génère un historique de 5 mesures (max) pour une feature, triées du plus récent au plus ancien.
 * Chaque entrée : { date, valeur }
 *   date = chaîne dans l'un des formats :
 *     - "YYYY"           → précision annuelle
 *     - "YYYY-MM"        → précision mensuelle
 *     - "YYYY-MM-DD"     → précision journalière
 * Le format varie de façon déterministe selon le seed et le type.
 */
function historiqueDates(seed, type, n) {
  n = n || 5;
  const result = [];
  // Précisions possibles (déterministe selon seed)
  const precisions = ['year', 'year', 'month', 'month', 'day'];
  // Année de départ : la plus récente, on remonte dans le temps
  const anneBase = 2021 + ((seed * 3 + 7) % 5); // entre 2021 et 2025

  for (let i = 0; i < n; i++) {
    const an    = anneBase - i;
    const prec  = precisions[(seed + i) % precisions.length];
    const mois  = 1 + ((seed * 7 + i * 13) % 12);       // 1–12
    const jour  = 1 + ((seed * 11 + i * 17) % 28);      // 1–28

    let date;
    if (prec === 'year') {
      date = String(an);
    } else if (prec === 'month') {
      date = an + '-' + String(mois).padStart(2, '0');
    } else {
      date = an + '-' + String(mois).padStart(2, '0') + '-' + String(jour).padStart(2, '0');
    }

    result.push({
      date:   date,
      valeur: valeurSimulee(seed + i * 7, type)
    });
  }
  return result; // index 0 = plus récent
}

/** Valeur simulée selon type d'indicateur */
function valeurSimulee(seed, type) {
  const base = seed % 100;
  switch (type) {
    case 'debit':    return (12 + base * 0.39).toFixed(1) + ' m³/s';
    case 'surface':  return (42 + base * 2).toFixed(0) + ' ha';
    case 'lineaire': return (8 + base * 0.30).toFixed(1) + ' km';
    case 'qualite':  return (75 + base * 0.20).toFixed(0) + ' %';
    case 'niveau':   return (2.1 + base * 0.029).toFixed(2) + ' m NGF';
    case 'indice':   return (3 + base * 0.04).toFixed(1) + '/20';
    case 'nombre':   return (5 + base).toString();
    case 'taux':     return (60 + base * 0.35).toFixed(0) + ' %';
    case 'charge':   return (50 + base * 4).toFixed(0) + ' EH';
    case 'volume':   return (100 + base * 100).toFixed(0) + ' m³/j';
    default:         return (10 + base * 0.9).toFixed(1);
  }
}

/* ── Couleurs par thème ─────────────────────────────────────── */
const THEME_COLORS = {
  'Gestion quantitative de l\'eau':        '#1565C0',
  'Gouvernance de l\'eau':                 '#6A1B9A',
  'Hydrogéologie':                         '#4E342E',
  'Hydrologie':                            '#0288D1',
  'Qualité des eaux':                      '#00838F',
  'Usages sectoriels de l\'eau':           '#E65100',
  'Vulnérabilité et risques climatiques':  '#B71C1C'
};

const THEME_ICONS = {
  'Gestion quantitative de l\'eau':        'fa-droplet',
  'Gouvernance de l\'eau':                 'fa-landmark',
  'Hydrogéologie':                         'fa-mountain',
  'Hydrologie':                            'fa-water',
  'Qualité des eaux':                      'fa-flask',
  'Usages sectoriels de l\'eau':           'fa-industry',
  'Vulnérabilité et risques climatiques':  'fa-triangle-exclamation'
};

/* ====================================================================
 *  DONNEES_SOURCES
 *  Structure : catégorie (thème col B) → filtres (données col A)
 * ==================================================================== */
const DONNEES_SOURCES = [

  /* ================================================================
   *  1. GESTION QUANTITATIVE DE L'EAU
   * ================================================================ */
  {
    id:    'gestion-quantitative',
    label: 'Gestion quantitative de l\'eau',
    color: THEME_COLORS['Gestion quantitative de l\'eau'],
    icon:  THEME_ICONS['Gestion quantitative de l\'eau'],
    filtres: [
      {
        id:        'prelevements-eau-bnpe',
        label:     'Prélèvements en eau (BNPE)',
        geometrie: 'point',
        source:    'Hub\'eau',
        zoomMin:   9,
        lien:      'https://hubeau.eaufrance.fr/page/api-prelevements-eau',
        description: 'Données issues de la Banque Nationale des Prélèvements en eau (BNPE)',
        derniereAnnee: 2024,
        features: (function() {
          const pts = geAllPts(11, 35);
          const types = ['AEP', 'Irrigation', 'Industrie', 'Hydroélectricité', 'Autres'];
          return pts.map((p, i) => ({
            coords: p,
            geometrie: 'point',
            annee: derniereAnnee(i + 11),
            valeur: valeurSimulee(i + 11, 'volume'),
            label: 'Prélèvement ' + types[i % types.length],
            attributs: { type: types[i % types.length], volume: valeurSimulee(i + 11, 'volume') }
          }));
        })()
      }
    ]
  },

  /* ================================================================
   *  2. GOUVERNANCE DE L'EAU
   * ================================================================ */
  {
    id:    'gouvernance-eau',
    label: 'Gouvernance de l\'eau',
    color: THEME_COLORS['Gouvernance de l\'eau'],
    icon:  THEME_ICONS['Gouvernance de l\'eau'],
    filtres: [
      {
        id:        'bassins-hydrographiques',
        label:     'Bassins hydrographiques ou Circonscriptions administratives de bassin (Agence de l\'eau)',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(21, 5.5, 48.8, 2.2, 1.5), geometrie: 'polygone', annee: 2024, valeur: 'Bassin Rhin-Meuse', label: 'Rhin-Meuse' },
          { coords: gePoly(22, 4.8, 48.5, 1.8, 1.4), geometrie: 'polygone', annee: 2024, valeur: 'Bassin Seine-Normandie', label: 'Seine-Normandie' },
          { coords: gePoly(23, 6.8, 47.7, 1.5, 1.0), geometrie: 'polygone', annee: 2024, valeur: 'Bassin Rhône-Méditerranée-Corse', label: 'Rhône-Méd.-Corse' }
        ]
      },
      {
        id:        'collectivites-competentes-ac',
        groupe:    'Collectivités compétentes',
        label:     'Collectivités compétentes AC',
        geometrie: 'polygone',
        source:    'SISPEA',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 6).map((d, i) => ({
          coords: gePoly(30 + i, d.cx, d.cy, 0.6, 0.4),
          geometrie: 'polygone', annee: derniereAnnee(30 + i),
          valeur: valeurSimulee(30 + i, 'taux'), label: 'Collectivité AC – ' + d.nom
        }))
      },
      {
        id:        'collectivites-aep-distri',
        groupe:    'Collectivités compétentes',
        label:     'Collectivités compétentes AEP (DISTRI)',
        geometrie: 'polygone',
        source:    'SISPEA',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(40 + i, d.cx, d.cy, 0.55, 0.38),
          geometrie: 'polygone', annee: derniereAnnee(40 + i),
          valeur: valeurSimulee(40 + i, 'taux'), label: 'AEP Distri – ' + d.nom
        }))
      },
      {
        id:        'collectivites-aep-prod',
        groupe:    'Collectivités compétentes',
        label:     'Collectivités compétentes AEP (PROD)',
        geometrie: 'polygone',
        source:    'SISPEA',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 8).map((d, i) => ({
          coords: gePoly(50 + i, d.cx - 0.1, d.cy + 0.05, 0.5, 0.35),
          geometrie: 'polygone', annee: derniereAnnee(50 + i),
          valeur: valeurSimulee(50 + i, 'taux'), label: 'AEP Prod – ' + d.nom
        }))
      },
      {
        id:        'collectivites-anc',
        groupe:    'Collectivités compétentes',
        label:     'Collectivités compétentes ANC',
        geometrie: 'polygone',
        source:    'SISPEA',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 7).map((d, i) => ({
          coords: gePoly(60 + i, d.cx + 0.05, d.cy - 0.05, 0.45, 0.32),
          geometrie: 'polygone', annee: derniereAnnee(60 + i),
          valeur: valeurSimulee(60 + i, 'taux'), label: 'ANC – ' + d.nom
        }))
      },
      {
        id:        'collectivites-gemapi',
        groupe:    'Collectivités compétentes',
        label:     'Collectivités compétentes GEMAPI',
        geometrie: 'polygone',
        source:    'BANATIC',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(70 + i, d.cx - 0.05, d.cy + 0.08, 0.52, 0.36),
          geometrie: 'polygone', annee: derniereAnnee(70 + i),
          valeur: valeurSimulee(70 + i, 'taux'), label: 'GEMAPI – ' + d.nom
        }))
      },
      {
        id:        'contrats-milieu',
        label:     'Contrats de Milieu',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(81, 6.2, 48.8, 0.9, 0.7), geometrie: 'polygone', annee: 2024, valeur: 'Contrat de rivière Moselle', label: 'Contrat Moselle' },
          { coords: gePoly(82, 7.5, 48.6, 0.7, 0.6), geometrie: 'polygone', annee: 2023, valeur: 'Contrat de nappe Rhin', label: 'Contrat Rhin' },
          { coords: gePoly(83, 5.3, 48.9, 0.8, 0.6), geometrie: 'polygone', annee: 2024, valeur: 'Contrat de bassin versant Meuse', label: 'Contrat Meuse' },
          { coords: gePoly(84, 4.4, 48.9, 0.7, 0.5), geometrie: 'polygone', annee: 2023, valeur: 'Contrat rivière Marne', label: 'Contrat Marne' }
        ]
      },
      {
        id:        'epage',
        label:     'EPAGE',
        geometrie: 'polygone',
        source:    'DREAL Grand Est',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(91, 7.4, 48.1, 0.6, 0.5), geometrie: 'polygone', annee: 2024, valeur: 'EPAGE Doller', label: 'EPAGE Doller' },
          { coords: gePoly(92, 6.6, 48.3, 0.7, 0.5), geometrie: 'polygone', annee: 2024, valeur: 'EPAGE Vologne', label: 'EPAGE Vologne' },
          { coords: gePoly(93, 5.8, 48.6, 0.65, 0.5), geometrie: 'polygone', annee: 2023, valeur: 'EPAGE Meurthe', label: 'EPAGE Meurthe' }
        ]
      },
      {
        id:        'eptb',
        label:     'EPTB',
        geometrie: 'polygone',
        source:    'DATA GOUV',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(101, 5.4, 49.1, 1.1, 0.8), geometrie: 'polygone', annee: 2024, valeur: 'EPTB Meuse', label: 'EPTB Meuse' },
          { coords: gePoly(102, 6.7, 49.0, 1.0, 0.7), geometrie: 'polygone', annee: 2024, valeur: 'EPTB Moselle', label: 'EPTB Moselle' },
          { coords: gePoly(103, 4.3, 49.1, 0.9, 0.7), geometrie: 'polygone', annee: 2023, valeur: 'EPTB Marne', label: 'EPTB Marne' }
        ]
      },
      {
        id:        'ougc',
        label:     'OUGC',
        geometrie: 'polygone',
        source:    'DREAL Grand Est',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 5).map((d, i) => ({
          coords: gePoly(110 + i, d.cx + 0.12, d.cy - 0.1, 0.55, 0.4),
          geometrie: 'polygone', annee: derniereAnnee(110 + i),
          valeur: 'OUGC ' + d.nom, label: 'OUGC ' + d.nom
        }))
      },
      {
        id:        'pgc',
        label:     'Périmètre de Gestion Collective (PGC)',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(121, 4.2, 48.4, 0.8, 0.6), geometrie: 'polygone', annee: 2024, valeur: 'PGC Champagne crayeuse', label: 'PGC Champagne crayeuse' },
          { coords: gePoly(122, 5.2, 48.2, 0.7, 0.5), geometrie: 'polygone', annee: 2023, valeur: 'PGC Plaine de Neufchâteau', label: 'PGC Plaine Neufchâteau' },
          { coords: gePoly(123, 6.4, 48.4, 0.6, 0.45), geometrie: 'polygone', annee: 2024, valeur: 'PGC Val de Lorraine', label: 'PGC Val de Lorraine' }
        ]
      },
      {
        id:        'ptge',
        label:     'PTGE',
        geometrie: 'polygone',
        source:    'OIEAU',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(131, 4.9, 49.3, 0.9, 0.6), geometrie: 'polygone', annee: 2024, valeur: 'PTGE Argonne', label: 'PTGE Argonne' },
          { coords: gePoly(132, 5.7, 48.0, 0.8, 0.55), geometrie: 'polygone', annee: 2024, valeur: 'PTGE Saône-Haute-Marne', label: 'PTGE Saône-Haute-Marne' }
        ]
      },
      {
        id:        'sage',
        label:     'Schémas d\'Aménagement et de Gestion des Eaux (SAGE)',
        geometrie: 'polygone',
        source:    'RGE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(141, 7.6, 48.0, 0.8, 0.6), geometrie: 'polygone', annee: 2024, valeur: 'SAGE Ill Nappe Rhin', label: 'SAGE Ill Nappe Rhin' },
          { coords: gePoly(142, 7.3, 47.9, 0.6, 0.45), geometrie: 'polygone', annee: 2024, valeur: 'SAGE Doller', label: 'SAGE Doller' },
          { coords: gePoly(143, 7.5, 47.8, 0.5, 0.4), geometrie: 'polygone', annee: 2023, valeur: 'SAGE Largue', label: 'SAGE Largue' },
          { coords: gePoly(144, 7.4, 48.4, 0.65, 0.5), geometrie: 'polygone', annee: 2024, valeur: 'SAGE Moder', label: 'SAGE Moder' },
          { coords: gePoly(145, 6.3, 48.9, 0.7, 0.5), geometrie: 'polygone', annee: 2023, valeur: 'SAGE Rupt de Mad Esch Trey', label: 'SAGE Rupt de Mad' },
          { coords: gePoly(146, 6.1, 48.7, 0.75, 0.55), geometrie: 'polygone', annee: 2024, valeur: 'SAGE Bassin Ferrifère', label: 'SAGE Bassin Ferrifère' },
          { coords: gePoly(147, 4.6, 49.5, 0.8, 0.6), geometrie: 'polygone', annee: 2024, valeur: 'SAGE Aisne Vesle Suippe', label: 'SAGE Aisne Vesle Suippe' }
        ]
      },
      {
        id:        'dpf',
        label:     'Segments du Domaine Public Fluvial (DPF)',
        geometrie: 'ligne',
        source:    'SANDRE',
        zoomMin:   9,
        derniereAnnee: 2024,
        features: [
          { coords: geLine(151, 7.7, 48.2, 8), geometrie: 'ligne', annee: 2024, valeur: '48 km', label: 'DPF Rhin amont' },
          { coords: geLine(152, 7.5, 48.8, 7), geometrie: 'ligne', annee: 2024, valeur: '38 km', label: 'DPF Rhin aval' },
          { coords: geLine(153, 6.6, 48.9, 8), geometrie: 'ligne', annee: 2023, valeur: '52 km', label: 'DPF Moselle' },
          { coords: geLine(154, 5.3, 49.2, 7), geometrie: 'ligne', annee: 2024, valeur: '41 km', label: 'DPF Meuse' },
          { coords: geLine(155, 4.3, 49.0, 6), geometrie: 'ligne', annee: 2023, valeur: '35 km', label: 'DPF Marne' }
        ]
      }
    ]
  },

  /* ================================================================
   *  3. HYDROGÉOLOGIE
   * ================================================================ */
  {
    id:    'hydrogeologie',
    label: 'Hydrogéologie',
    color: THEME_COLORS['Hydrogéologie'],
    icon:  THEME_ICONS['Hydrogéologie'],
    filtres: [
      {
        id:        'entites-hydrogeologiques-bd-lisa',
        label:     'Entités hydrogéologiques (BD LISA)',
        geometrie: 'polygone',
        source:    'BRGM',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(201, 7.5, 48.4, 0.9, 0.7), geometrie: 'polygone', annee: 2024, valeur: 'Aquifère alluvial du Rhin', label: 'Aquifère Rhin' },
          { coords: gePoly(202, 6.5, 48.2, 1.0, 0.8), geometrie: 'polygone', annee: 2024, valeur: 'Grès du Trias inférieur (GTI)', label: 'Grès Trias inf.' },
          { coords: gePoly(203, 4.5, 48.6, 1.1, 0.9), geometrie: 'polygone', annee: 2023, valeur: 'Craie Champagne', label: 'Craie Champagne' },
          { coords: gePoly(204, 5.5, 48.2, 0.9, 0.7), geometrie: 'polygone', annee: 2024, valeur: 'Calcaires Dogger', label: 'Calcaires Dogger' }
        ]
      },
      {
        id:        'geologie',
        label:     'Géologie',
        geometrie: 'polygone',
        source:    'BRGM',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(211, 7.6, 48.1, 0.7, 0.6), geometrie: 'polygone', annee: 2024, valeur: 'Socle granitique Vosges', label: 'Socle Vosges' },
          { coords: gePoly(212, 7.4, 48.5, 0.8, 0.65), geometrie: 'polygone', annee: 2024, valeur: 'Dépôts alluviaux plaine du Rhin', label: 'Alluvions Rhin' },
          { coords: gePoly(213, 5.8, 48.8, 0.9, 0.7), geometrie: 'polygone', annee: 2023, valeur: 'Grès Trias inférieur', label: 'Grès Trias' },
          { coords: gePoly(214, 4.4, 48.7, 1.2, 0.9), geometrie: 'polygone', annee: 2024, valeur: 'Formation crayeuse', label: 'Craie' }
        ]
      },
      {
        id:        'masse-eau-souterraine',
        label:     'Masse d\'eau souterraine',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(221, 7.5, 48.3, 0.85, 0.65), geometrie: 'polygone', annee: 2024, valeur: 'ME souterraine FR_GW_006 – Rhin', label: 'ME FR_GW_006 Rhin' },
          { coords: gePoly(222, 5.8, 48.6, 1.0, 0.8), geometrie: 'polygone', annee: 2024, valeur: 'ME souterraine FR_GW_113 – Grès Trias', label: 'ME FR_GW_113 Grès' },
          { coords: gePoly(223, 4.5, 48.8, 1.1, 0.85), geometrie: 'polygone', annee: 2023, valeur: 'ME souterraine FR_GW_160 – Craie', label: 'ME FR_GW_160 Craie' }
        ]
      },
      {
        id:        'ouvrages-bss',
        label:     'Ouvrages BSS',
        geometrie: 'point',
        source:    'BRGM',
        zoomMin:   10,
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(231, 40);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(231 + i),
            valeur: 'BSS' + String(231 + i).padStart(6, '0'),
            label: 'Ouvrage BSS ' + String(231 + i).padStart(6, '0')
          }));
        })()
      },
      {
        id:        'piezometres',
        label:     'Piézomètres (piézométrie)',
        geometrie: 'point',
        source:    'Hub\'eau',
        zoomMin:   9,
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(241, 28);
          const niveaux = [3.2, 4.1, 2.8, 5.3, 1.9, 4.7, 3.5, 2.1, 4.4, 3.8];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(241 + i),
            valeur: niveaux[i % niveaux.length].toFixed(2) + ' m NGF',
            label: 'Piézomètre PE-' + (241 + i)
          }));
        })()
      },
      {
        id:        'qualitometres',
        label:     'Qualitomètres',
        geometrie: 'point',
        source:    'Hub\'eau',
        zoomMin:   10,
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(251, 22);
          const etats = ['Bon état', 'État médiocre', 'Mauvais état', 'Bon état'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(251 + i),
            valeur: etats[i % etats.length],
            label: 'Qualitomètre Q-' + (251 + i)
          }));
        })()
      },
      {
        id:        'zones-alterites-meubles',
        label:     'Zones altérites meubles',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(261, 6.8, 48.2, 0.75, 0.6), geometrie: 'polygone', annee: 2024, valeur: valeurSimulee(261, 'surface'), label: 'Zone altérites Vosges N' },
          { coords: gePoly(262, 6.5, 47.9, 0.65, 0.5), geometrie: 'polygone', annee: 2023, valeur: valeurSimulee(262, 'surface'), label: 'Zone altérites Vosges S' },
          { coords: gePoly(263, 7.2, 48.3, 0.7, 0.55), geometrie: 'polygone', annee: 2024, valeur: valeurSimulee(263, 'surface'), label: 'Zone altérites Alsace' }
        ]
      },
      {
        id:        'zones-karstiques',
        label:     'Zones karstiques',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(271, 5.8, 48.0, 0.9, 0.7), geometrie: 'polygone', annee: 2024, valeur: valeurSimulee(271, 'surface'), label: 'Karst calcaires jurassiques S' },
          { coords: gePoly(272, 5.4, 48.9, 0.8, 0.65), geometrie: 'polygone', annee: 2024, valeur: valeurSimulee(272, 'surface'), label: 'Karst Lorraine' },
          { coords: gePoly(273, 4.8, 48.4, 0.85, 0.65), geometrie: 'polygone', annee: 2023, valeur: valeurSimulee(273, 'surface'), label: 'Craie fissurée Champagne' }
        ]
      }
    ]
  },

  /* ================================================================
   *  4. HYDROLOGIE
   * ================================================================ */
  {
    id:    'hydrologie',
    label: 'Hydrologie',
    color: THEME_COLORS['Hydrologie'],
    icon:  THEME_ICONS['Hydrologie'],
    filtres: [
      {
        id:        'bassins-versants-hydrographiques',
        label:     'Bassins versants hydrographiques',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(301, 6.8, 48.8, 2.0, 1.5), geometrie: 'polygone', annee: 2024, valeur: '11 800 km²', label: 'BV Moselle' },
          { coords: gePoly(302, 7.6, 48.3, 1.2, 1.8), geometrie: 'polygone', annee: 2024, valeur: '15 000 km²', label: 'BV Rhin alsacien' },
          { coords: gePoly(303, 5.3, 49.1, 1.8, 1.4), geometrie: 'polygone', annee: 2024, valeur: '6 200 km²', label: 'BV Meuse' },
          { coords: gePoly(304, 4.4, 48.7, 1.9, 1.5), geometrie: 'polygone', annee: 2023, valeur: '12 600 km²', label: 'BV Marne' },
          { coords: gePoly(305, 4.1, 48.3, 1.4, 1.0), geometrie: 'polygone', annee: 2024, valeur: '4 300 km²', label: 'BV Aube' }
        ]
      },
      {
        id:        'bassins-versants-specifiques',
        label:     'Bassins versants spécifiques',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(311, 7.3, 47.9, 0.5, 0.4), geometrie: 'polygone', annee: 2024, valeur: valeurSimulee(311, 'surface'), label: 'BV spécifique Doller' },
          { coords: gePoly(312, 6.5, 48.2, 0.6, 0.45), geometrie: 'polygone', annee: 2024, valeur: valeurSimulee(312, 'surface'), label: 'BV spécifique Moselotte' },
          { coords: gePoly(313, 6.9, 49.3, 0.7, 0.5), geometrie: 'polygone', annee: 2023, valeur: valeurSimulee(313, 'surface'), label: 'BV spécifique Orne' },
          { coords: gePoly(314, 4.7, 49.6, 0.65, 0.5), geometrie: 'polygone', annee: 2024, valeur: valeurSimulee(314, 'surface'), label: 'BV spécifique Aisne' }
        ]
      },
      {
        id:        'canaux',
        label:     'Canaux',
        geometrie: 'ligne',
        source:    'VNF / IGN',
        derniereAnnee: 2024,
        features: [
          { coords: geLine(321, 7.6, 47.8, 10), geometrie: 'ligne', annee: 2024, valeur: '130 km', label: 'Canal du Rhône au Rhin' },
          { coords: geLine(322, 7.5, 48.6, 9), geometrie: 'ligne', annee: 2024, valeur: '86 km', label: 'Canal de la Marne au Rhin' },
          { coords: geLine(323, 5.8, 49.1, 9), geometrie: 'ligne', annee: 2024, valeur: '112 km', label: 'Canal de l\'Est (branche Nord)' },
          { coords: geLine(324, 6.5, 47.9, 8), geometrie: 'ligne', annee: 2023, valeur: '95 km', label: 'Canal de l\'Est (branche Sud)' },
          { coords: geLine(325, 4.2, 48.7, 8), geometrie: 'ligne', annee: 2024, valeur: '74 km', label: 'Canal latéral à la Marne' }
        ]
      },
      {
        id:        'cours-deau',
        label:     'Cours d\'eau',
        geometrie: 'ligne',
        source:    'BD CARTHAGE – IGN',
        derniereAnnee: 2024,
        features: [
          { coords: geLine(331, 6.7, 49.3, 12), geometrie: 'ligne', annee: 2024, valeur: '560 km', label: 'Moselle' },
          { coords: geLine(332, 7.7, 47.6, 14), geometrie: 'ligne', annee: 2024, valeur: '346 km (GE)', label: 'Rhin' },
          { coords: geLine(333, 5.2, 49.5, 11), geometrie: 'ligne', annee: 2024, valeur: '486 km', label: 'Meuse' },
          { coords: geLine(334, 4.3, 49.3, 10), geometrie: 'ligne', annee: 2024, valeur: '525 km', label: 'Marne' },
          { coords: geLine(335, 4.0, 48.5, 9), geometrie: 'ligne', annee: 2023, valeur: '248 km', label: 'Aube' },
          { coords: geLine(336, 6.9, 48.8, 9), geometrie: 'ligne', annee: 2024, valeur: '175 km', label: 'Seille' },
          { coords: geLine(337, 7.5, 48.2, 9), geometrie: 'ligne', annee: 2024, valeur: '195 km', label: 'Ill' },
          { coords: geLine(338, 6.5, 48.1, 8), geometrie: 'ligne', annee: 2024, valeur: '124 km', label: 'Moselotte' }
        ]
      },
      {
        id:        'masse-eau-superficielle',
        label:     'Masse d\'eau superficielle',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(341, 6.7, 49.1, 1.2, 0.8), geometrie: 'polygone', annee: 2024, valeur: 'ME FR_207_05 – Moselle', label: 'ME Moselle amont' },
          { coords: gePoly(342, 7.6, 48.4, 0.8, 1.2), geometrie: 'polygone', annee: 2024, valeur: 'ME FR_IG_01 – Rhin alsacien', label: 'ME Rhin alsacien' },
          { coords: gePoly(343, 4.4, 49.2, 1.4, 0.9), geometrie: 'polygone', annee: 2024, valeur: 'ME FR_GR_02 – Marne', label: 'ME Marne' },
          { coords: gePoly(344, 5.3, 49.3, 1.0, 0.7), geometrie: 'polygone', annee: 2023, valeur: 'ME FR_ME_01 – Meuse', label: 'ME Meuse' }
        ]
      },
      {
        id:        'plan-deau',
        label:     'Plan d\'eau',
        geometrie: 'polygone',
        source:    'BD CARTHAGE – IGN',
        zoomMin:   11,
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(351, 4.1, 48.3, 0.4, 0.3), geometrie: 'polygone', annee: 2024, valeur: '4 800 ha', label: 'Lacs de Der-Chantecoq' },
          { coords: gePoly(352, 4.5, 48.4, 0.25, 0.2), geometrie: 'polygone', annee: 2024, valeur: '1 500 ha', label: 'Lac du Temple' },
          { coords: gePoly(353, 4.6, 48.5, 0.2, 0.15), geometrie: 'polygone', annee: 2024, valeur: '680 ha', label: 'Lac d\'Orient' },
          { coords: gePoly(354, 7.3, 48.0, 0.15, 0.12), geometrie: 'polygone', annee: 2023, valeur: '140 ha', label: 'Grand Lac de Longemer' },
          { coords: gePoly(355, 7.2, 48.1, 0.12, 0.1), geometrie: 'polygone', annee: 2024, valeur: '92 ha', label: 'Lac de Gérardmer' }
        ]
      },
      {
        id:        'regions-hydrographiques',
        label:     'Régions hydrographiques',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(361, 5.0, 48.6, 1.5, 1.2), geometrie: 'polygone', annee: 2024, valeur: 'Région hydro. Seine-Normandie (GE)', label: 'RH Seine-Normandie' },
          { coords: gePoly(362, 6.2, 48.7, 1.8, 1.4), geometrie: 'polygone', annee: 2024, valeur: 'Région hydro. Rhin-Meuse', label: 'RH Rhin-Meuse' },
          { coords: gePoly(363, 7.1, 47.9, 1.0, 0.8), geometrie: 'polygone', annee: 2024, valeur: 'Région hydro. Rhône-Méd. (GE)', label: 'RH Rhône-Méd. (GE)' }
        ]
      },
      {
        id:        'secteurs-hydrographiques',
        label:     'Secteurs hydrographiques',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 7).map((d, i) => ({
          coords: gePoly(370 + i, d.cx, d.cy, 0.8, 0.65),
          geometrie: 'polygone', annee: derniereAnnee(370 + i),
          valeur: 'Secteur hydro. ' + (370 + i), label: 'Secteur H' + String(370 + i).slice(-3)
        }))
      },
      {
        id:        'sous-secteurs-hydrographiques',
        label:     'Sous-secteurs hydrographiques',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(380 + i, d.cx + 0.1, d.cy - 0.1, 0.55, 0.42),
          geometrie: 'polygone', annee: derniereAnnee(380 + i),
          valeur: 'Sous-secteur H' + String(380 + i).slice(-3), label: 'Sous-sect. H' + String(380 + i).slice(-3)
        }))
      },
      {
        id:        'stations-hydrometriques',
        label:     'Stations/sites hydrométriques (hydrométrie)',
        geometrie: 'point',
        source:    'Hub\'eau',
        zoomMin:   9,
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(391, 32);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(391 + i),
            valeur: valeurSimulee(391 + i, 'debit'),
            label: 'Station hydro ' + String(391 + i).padStart(8, '0')
          }));
        })()
      },
      {
        id:        'zones-hydrographiques',
        label:     'Zones hydrographiques',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(400 + i, d.cx - 0.05, d.cy + 0.05, 0.6, 0.45),
          geometrie: 'polygone', annee: derniereAnnee(400 + i),
          valeur: 'Zone hydro. ' + String(400 + i).slice(-3), label: 'Zone H' + String(400 + i).slice(-3)
        }))
      }
    ]
  },

  /* ================================================================
   *  5. QUALITÉ DES EAUX
   * ================================================================ */
  {
    id:    'qualite-eaux',
    label: 'Qualité des eaux',
    color: THEME_COLORS['Qualité des eaux'],
    icon:  THEME_ICONS['Qualité des eaux'],
    filtres: [
      {
        id:        'hydrobiologie',
        label:     'Hydrobiologie',
        geometrie: 'point',
        source:    'Hub\'eau',
        zoomMin:   10,
        derniereAnnee: 2024,
        features: (function() {
          const pts = geAllPts(411, 26);
          const indices = ['IBD 12/20', 'IBMR 8/20', 'IPR 14/20', 'IPS 10/20'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(411 + i),
            valeur: indices[i % indices.length],
            label: 'Station hydrobiologie ' + (411 + i)
          }));
        })()
      },
      {
        id:        'points-nodaux',
        label:     'Points nodaux',
        geometrie: 'point',
        source:    'Agences de l\'eau',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(421, 18);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(421 + i),
            valeur: valeurSimulee(421 + i, 'debit'),
            label: 'Point nodal PN-' + (421 + i)
          }));
        })()
      },
      {
        id:        'poissons',
        label:     'Poissons',
        geometrie: 'point',
        source:    'Hub\'eau',
        derniereAnnee: 2024,
        features: (function() {
          const pts = geAllPts(431, 24);
          const especes = ['Truite fario', 'Brochet', 'Ombre commun', 'Chabot', 'Lamproie de Planer'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(431 + i),
            valeur: (5 + (431 + i) % 40) + ' ind./passage',
            label: especes[i % especes.length] + ' – station ' + (431 + i)
          }));
        })()
      },
      {
        id:        'polluants-nitrate',
        label:     'Polluants – Nitrate',
        geometrie: 'point',
        source:    'EauFrance – ADES',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(441, 30);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(441 + i),
            valeur: (10 + (441 + i) % 40) + ' mg/L NO₃',
            label: 'Nitrate – station ' + (441 + i)
          }));
        })()
      },
      {
        id:        'polluants-pfas',
        label:     'Polluants – PFAS',
        geometrie: 'point',
        source:    'EauFrance – ADES',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(451, 22);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(451 + i),
            valeur: (0.01 + ((451 + i) % 50) * 0.008).toFixed(3) + ' µg/L PFAS',
            label: 'PFAS – station ' + (451 + i)
          }));
        })()
      },
      {
        id:        'polluants-phyto',
        label:     'Polluants – Phyto',
        geometrie: 'point',
        source:    'EauFrance – ADES',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(461, 25);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(461 + i),
            valeur: (0.05 + ((461 + i) % 60) * 0.004).toFixed(3) + ' µg/L phyto',
            label: 'Phyto – station ' + (461 + i)
          }));
        })()
      },
      {
        id:        'qualite-cours-deau',
        label:     'Qualité des cours d\'eau (et des plans d\'eau)',
        geometrie: 'point',
        source:    'Hub\'eau',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(471, 28);
          const etats = ['Très bon', 'Bon', 'Moyen', 'Médiocre', 'Mauvais'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(471 + i),
            valeur: etats[i % etats.length] + ' état écologique',
            label: 'Station qualité ' + (471 + i)
          }));
        })()
      },
      {
        id:        'stations-dce',
        label:     'Stations DCE',
        geometrie: 'point',
        source:    'Agences de l\'eau',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(481, 35);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(481 + i),
            valeur: 'DCE-' + String(481 + i).padStart(6, '0'),
            label: 'Station DCE ' + String(481 + i).padStart(6, '0')
          }));
        })()
      },
      {
        id:        'stations-comptage-migrateurs',
        label:     'Stations de comptage des migrateurs',
        geometrie: 'point',
        source:    'OFB',
        derniereAnnee: 2025,
        features: [
          { coords: [7.897, 48.546], geometrie: 'point', annee: 2025, valeur: '482 saumons', label: 'Station Iffezheim' },
          { coords: [4.815, 49.774], geometrie: 'point', annee: 2025, valeur: '127 saumons', label: 'Station Givet' },
          { coords: [6.718, 49.035], geometrie: 'point', annee: 2024, valeur: '38 anguilles', label: 'Station Hauconcourt' },
          { coords: [5.145, 49.256], geometrie: 'point', annee: 2025, valeur: '64 aloses', label: 'Station Stenay' }
        ]
      },
      {
        id:        'temperature-cours-deau',
        label:     'Température des cours d\'eau',
        geometrie: 'point',
        source:    'Hub\'eau',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(491, 25);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(491 + i),
            valeur: (8.5 + ((491 + i) % 120) * 0.07).toFixed(1) + ' °C (moy. ann.)',
            label: 'Thermo-station T-' + (491 + i)
          }));
        })()
      }
    ]
  },

  /* ================================================================
   *  6. USAGES SECTORIELS DE L'EAU
   * ================================================================ */
  {
    id:    'usages-sectoriels',
    label: 'Usages sectoriels de l\'eau',
    color: THEME_COLORS['Usages sectoriels de l\'eau'],
    icon:  THEME_ICONS['Usages sectoriels de l\'eau'],
    filtres: [
      {
        id:        'aac',
        label:     'Aires d\'Alimentation de Captage (AAC)',
        geometrie: 'polygone',
        source:    'RGE / DREAL',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 8).map((d, i) => ({
          coords: gePoly(501 + i, d.cx + 0.1, d.cy - 0.12, 0.5, 0.38),
          geometrie: 'polygone', annee: derniereAnnee(501 + i),
          valeur: valeurSimulee(501 + i, 'surface'), label: 'AAC ' + d.nom
        }))
      },
      {
        id:        'basol',
        label:     'BASOL',
        geometrie: 'point',
        source:    'GEORISQUES',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(511, 28);
          const etats = ['En surveillance', 'Traité', 'En cours de traitement', 'Site géré'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(511 + i),
            valeur: etats[i % etats.length],
            label: 'Site BASOL ' + (511 + i)
          }));
        })()
      },
      {
        id:        'captages-aep',
        label:     'Captages AEP',
        geometrie: 'point',
        source:    'ARS / Agence de l\'eau',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(521, 38);
          const types = ['Forage', 'Source', 'Prise d\'eau superficielle'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(521 + i),
            valeur: (500 + (521 + i) % 12000) + ' m³/j',
            label: types[i % types.length] + ' AEP ' + (521 + i)
          }));
        })()
      },
      {
        id:        'casias-ex-basias',
        label:     'CASIAS (ex BASIAS)',
        geometrie: 'point',
        source:    'GEORISQUES',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(531, 22);
          const etats = ['Activité terminée', 'En activité', 'Usage sensible'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(531 + i),
            valeur: etats[i % etats.length],
            label: 'Site CASIAS ' + (531 + i)
          }));
        })()
      },
      {
        id:        'centrales-hydroelectriques',
        label:     'Centrales hydroélectriques',
        geometrie: 'point',
        source:    'RTE / Agence de l\'eau',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(541, 16);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(541 + i),
            valeur: (2 + (541 + i) % 150) + ' MW',
            label: 'Centrale hydro CH-' + (541 + i)
          }));
        })()
      },
      {
        id:        'etablissements-pollueurs-irep',
        label:     'Établissements pollueurs IREP',
        geometrie: 'point',
        source:    'GEORISQUES',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(551, 20);
          const types = ['Chimie', 'Métallurgie', 'Papeterie', 'Agroalimentaire'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(551 + i),
            valeur: types[i % types.length],
            label: 'Établissement IREP ' + (551 + i)
          }));
        })()
      },
      {
        id:        'icpe-seveso',
        label:     'Installations classées, ICPE, SEVESO',
        geometrie: 'point',
        source:    'GEORISQUES',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(561, 24);
          const niveaux = ['SEVESO seuil bas', 'SEVESO seuil haut', 'ICPE A', 'ICPE D'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(561 + i),
            valeur: niveaux[i % niveaux.length],
            label: 'Installation ' + (561 + i)
          }));
        })()
      },
      {
        id:        'inb',
        label:     'Installation nucléaires de base (INB)',
        geometrie: 'point',
        source:    'GEORISQUES / ASN',
        derniereAnnee: 2025,
        features: [
          { coords: [7.863, 47.911], geometrie: 'point', annee: 2025, valeur: 'Centrale nucléaire', label: 'CNS Fessenheim (arrêtée)' },
          { coords: [7.739, 48.762], geometrie: 'point', annee: 2025, valeur: 'Réacteur de recherche', label: 'ILL Grenoble (hors GE – ref.)' }
        ]
      },
      {
        id:        'loisirs',
        label:     'Loisirs',
        geometrie: 'point',
        source:    'Collectivités / OFB',
        derniereAnnee: 2024,
        features: (function() {
          const pts = geAllPts(571, 20);
          const types = ['Plage', 'Pêche', 'Canoë-kayak', 'Baignade naturelle'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(571 + i),
            valeur: types[i % types.length],
            label: 'Zone loisirs ' + types[i % types.length] + ' ' + (571 + i)
          }));
        })()
      },
      {
        id:        'obstacles-ecoulement',
        label:     'Obstacles à l\'écoulement',
        geometrie: 'point',
        source:    'SANDRE / OFB (ROE)',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(581, 40);
          const types = ['Barrage', 'Seuil', 'Buse', 'Pont', 'Chute naturelle'];
          const etats = ['Franchissable', 'Non franchissable', 'Partiellement franchissable'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(581 + i),
            valeur: etats[i % etats.length],
            label: types[i % types.length] + ' – ROE' + String(581 + i).padStart(6, '0')
          }));
        })()
      },
      {
        id:        'orientation-technico-eco',
        label:     'Orientation Technico-économique des Exploitations Agricoles (RA)',
        geometrie: 'polygone',
        source:    'AGRESTE',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(591 + i, d.cx, d.cy, 0.7, 0.55),
          geometrie: 'polygone', annee: derniereAnnee(591 + i),
          valeur: valeurSimulee(591 + i, 'surface'), label: 'OTEX – ' + d.nom
        }))
      },
      {
        id:        'perimetres-protection',
        label:     'Périmètres de protection (immédiat, rapproché, éloigné)',
        geometrie: 'polygone',
        source:    'ARS Grand Est',
        derniereAnnee: 2024,
        features: (function() {
          const zones = [];
          GE_DEPTS.slice(0, 6).forEach((d, i) => {
            zones.push({ coords: gePoly(601 + i * 3, d.cx, d.cy, 0.08, 0.06), geometrie: 'polygone', annee: derniereAnnee(601 + i * 3), valeur: 'Périmètre immédiat', label: 'PPE Immédiat ' + d.nom });
            zones.push({ coords: gePoly(602 + i * 3, d.cx, d.cy, 0.25, 0.2), geometrie: 'polygone', annee: derniereAnnee(602 + i * 3), valeur: 'Périmètre rapproché', label: 'PPE Rapproché ' + d.nom });
            zones.push({ coords: gePoly(603 + i * 3, d.cx, d.cy, 0.55, 0.42), geometrie: 'polygone', annee: derniereAnnee(603 + i * 3), valeur: 'Périmètre éloigné', label: 'PPE Éloigné ' + d.nom });
          });
          return zones;
        })()
      },
      {
        id:        'qualite-eau-potable',
        label:     'Qualité de l\'eau potable',
        geometrie: 'point',
        source:    'Hub\'eau / ARS',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(631, 35);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(631 + i),
            valeur: (85 + (631 + i) % 15) + ' % conforme bactério.',
            label: 'UDI eau potable ' + (631 + i)
          }));
        })()
      },
      {
        id:        'rejets-industriels',
        label:     'Rejets industriels',
        geometrie: 'point',
        source:    'Agences de l\'eau',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(641, 20);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(641 + i),
            valeur: (50 + (641 + i) % 500) + ' m³/j',
            label: 'Rejet industriel ' + (641 + i)
          }));
        })()
      },
      {
        id:        'sau',
        label:     'SAU (RA)',
        geometrie: 'polygone',
        source:    'AGRESTE',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(651 + i, d.cx + 0.08, d.cy - 0.07, 0.65, 0.5),
          geometrie: 'polygone', annee: derniereAnnee(651 + i),
          valeur: (40000 + (651 + i) * 150) + ' ha SAU',
          label: 'SAU – ' + d.nom
        }))
      },
      {
        id:        'sites-baignade',
        label:     'Sites de baignade',
        geometrie: 'point',
        source:    'DATA GOUV / ARS',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(661, 22);
          const qualites = ['Excellente', 'Bonne', 'Suffisante'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(661 + i),
            valeur: qualites[i % qualites.length] + ' qualité',
            label: 'Baignade – site ' + (661 + i)
          }));
        })()
      },
      {
        id:        'steu',
        label:     'STEU',
        geometrie: 'point',
        source:    'SANDRE / SISPEA',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(671, 35);
          const caps = [500, 1200, 5000, 15000, 50000, 150000, 450000];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(671 + i),
            valeur: caps[i % caps.length] + ' EH',
            label: 'STEU – ' + caps[i % caps.length] + ' EH ' + (671 + i)
          }));
        })()
      },
      {
        id:        'unite-methanisation',
        label:     'Unité de méthanisation',
        geometrie: 'point',
        source:    'ADEME / Région Grand Est',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(681, 18);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(681 + i),
            valeur: (100 + (681 + i) % 2000) + ' Nm³/h biogaz',
            label: 'Méthaniseur M-' + (681 + i)
          }));
        })()
      }
    ]
  },

  /* ================================================================
   *  7. VULNÉRABILITÉ ET RISQUES CLIMATIQUES
   * ================================================================ */
  {
    id:    'vulnerabilite-risques',
    label: 'Vulnérabilité et risques climatiques',
    color: THEME_COLORS['Vulnérabilité et risques climatiques'],
    icon:  THEME_ICONS['Vulnérabilité et risques climatiques'],
    filtres: [
      {
        id:        'alea-debordement-hauteurs',
        groupe:    'Aléa',
        label:     'Aléa débordement de cours d\'eau (hauteurs d\'eau)',
        geometrie: 'polygone',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 6).map((d, i) => ({
          coords: gePoly(701 + i, d.cx, d.cy, 0.7, 0.5),
          geometrie: 'polygone', annee: derniereAnnee(701 + i),
          valeur: (0.5 + (701 + i) % 4) + ' m hauteur max.',
          label: 'Aléa débordement (h) – ' + d.nom
        }))
      },
      {
        id:        'alea-debordement-surfaces',
        groupe:    'Aléa',
        label:     'Aléa débordement de cours d\'eau (surfaces inondables)',
        geometrie: 'polygone',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 7).map((d, i) => ({
          coords: gePoly(711 + i, d.cx - 0.05, d.cy + 0.05, 0.8, 0.6),
          geometrie: 'polygone', annee: derniereAnnee(711 + i),
          valeur: valeurSimulee(711 + i, 'surface'),
          label: 'Surface inondable – ' + d.nom
        }))
      },
      {
        id:        'alea-ruissellement-hauteurs',
        groupe:    'Aléa',
        label:     'Aléa ruissellement (hauteurs d\'eau)',
        geometrie: 'polygone',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(2, 8).map((d, i) => ({
          coords: gePoly(721 + i, d.cx + 0.08, d.cy - 0.08, 0.65, 0.5),
          geometrie: 'polygone', annee: derniereAnnee(721 + i),
          valeur: (0.2 + (721 + i) % 3) + ' m hauteur max.',
          label: 'Ruissellement (h) – ' + d.nom
        }))
      },
      {
        id:        'alea-ruissellement-surfaces',
        groupe:    'Aléa',
        label:     'Aléa ruissellement (surfaces inondables)',
        geometrie: 'polygone',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(1, 7).map((d, i) => ({
          coords: gePoly(731 + i, d.cx + 0.05, d.cy - 0.05, 0.7, 0.52),
          geometrie: 'polygone', annee: derniereAnnee(731 + i),
          valeur: valeurSimulee(731 + i, 'surface'),
          label: 'Ruissellement (surf.) – ' + d.nom
        }))
      },
      {
        id:        'arretes-secheresse-vigieau',
        label:     'Arrêtés sécheresse VigiEau',
        geometrie: 'polygone',
        source:    'Préfectures / VigiEau',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(741 + i, d.cx, d.cy, 0.8, 0.6),
          geometrie: 'polygone', annee: derniereAnnee(741 + i),
          valeur: ['Vigilance', 'Alerte', 'Alerte renforcée', 'Crise'][i % 4],
          label: 'Arrêté sécheresse – ' + d.nom
        }))
      },
      {
        id:        'azi',
        label:     'Atlas de Zones Inondables (AZI)',
        geometrie: 'polygone',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 8).map((d, i) => ({
          coords: gePoly(751 + i, d.cx - 0.1, d.cy + 0.1, 0.9, 0.7),
          geometrie: 'polygone', annee: derniereAnnee(751 + i),
          valeur: valeurSimulee(751 + i, 'surface'),
          label: 'AZI – ' + d.nom
        }))
      },
      {
        id:        'catastrophe-naturelle',
        label:     'Catastrophe Naturelle',
        geometrie: 'polygone',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 6).map((d, i) => ({
          coords: gePoly(761 + i, d.cx + 0.03, d.cy - 0.03, 0.65, 0.5),
          geometrie: 'polygone', annee: derniereAnnee(761 + i),
          valeur: (1980 + (761 + i) % 44) + ' – Inondation',
          label: 'CatNat – ' + d.nom
        }))
      },
      {
        id:        'cavites-souterraines',
        label:     'Cavités souterraines',
        geometrie: 'point',
        source:    'GEORISQUES / BRGM',
        derniereAnnee: 2024,
        features: (function() {
          const pts = geAllPts(771, 20);
          const types = ['Carrière souterraine', 'Grotte', 'Cave / cellier', 'Ouvrage civil'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(771 + i),
            valeur: types[i % types.length],
            label: 'Cavité C-' + (771 + i)
          }));
        })()
      },
      {
        id:        'dicrim',
        label:     'DICRIM',
        geometrie: 'polygone',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(781 + i, d.cx, d.cy, 0.75, 0.58),
          geometrie: 'polygone', annee: derniereAnnee(781 + i),
          valeur: 'Approuvé ' + (2018 + i % 7),
          label: 'DICRIM – ' + d.nom
        }))
      },
      {
        id:        'ecoulements-cours-deau',
        label:     'Écoulements des cours d\'eau',
        geometrie: 'point',
        source:    'Hub\'eau',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(791, 28);
          const etats = ['Écoulement vif', 'Écoulement faible', 'Assec', 'Non observé'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(791 + i),
            valeur: etats[i % etats.length],
            label: 'Écoulement – station ' + (791 + i)
          }));
        })()
      },
      {
        id:        'etablissements-sensibles',
        label:     'Établissements sensibles',
        geometrie: 'point',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: (function() {
          const pts = geAllPts(801, 22);
          const types = ['École', 'Hôpital', 'EHPAD', 'Centre sportif'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(801 + i),
            valeur: types[i % types.length],
            label: 'Établissement sensible ' + (801 + i)
          }));
        })()
      },
      {
        id:        'maille-safran',
        label:     'Maille SAFRAN',
        geometrie: 'polygone',
        source:    'Météo France',
        derniereAnnee: 2025,
        features: (function() {
          const mailles = [];
          for (let lon = 5; lon <= 8; lon++) {
            for (let lat = 47; lat <= 50; lat++) {
              mailles.push({
                coords: [[lon, lat], [lon + 1, lat], [lon + 1, lat + 1], [lon, lat + 1], [lon, lat]],
                geometrie: 'polygone',
                annee: 2025,
                valeur: (700 + ((lon + lat) * 37) % 800) + ' mm/an précip.',
                label: 'Maille SAFRAN ' + lon + '.' + lat
              });
            }
          }
          return mailles;
        })()
      },
      {
        id:        'mouvements-terrain',
        label:     'Mouvements de terrain',
        geometrie: 'point',
        source:    'GEORISQUES / BRGM',
        derniereAnnee: 2024,
        features: (function() {
          const pts = geAllPts(811, 18);
          const types = ['Glissement de terrain', 'Coulée de boue', 'Effondrement', 'Tassement'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(811 + i),
            valeur: types[i % types.length],
            label: 'MVT ' + types[i % types.length] + ' ' + (811 + i)
          }));
        })()
      },
      {
        id:        'papi',
        label:     'PAPI',
        geometrie: 'polygone',
        source:    'DREAL / MTECT',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(821, 6.7, 49.0, 1.2, 0.9), geometrie: 'polygone', annee: 2024, valeur: 'PAPI Moselle', label: 'PAPI Moselle' },
          { coords: gePoly(822, 5.3, 49.2, 1.1, 0.8), geometrie: 'polygone', annee: 2024, valeur: 'PAPI Meuse', label: 'PAPI Meuse' },
          { coords: gePoly(823, 4.4, 49.0, 1.0, 0.7), geometrie: 'polygone', annee: 2023, valeur: 'PAPI Marne', label: 'PAPI Marne' }
        ]
      },
      {
        id:        'phec',
        label:     'PHEC',
        geometrie: 'polygone',
        source:    'DREAL / SANDRE',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 6).map((d, i) => ({
          coords: gePoly(831 + i, d.cx - 0.08, d.cy + 0.08, 0.75, 0.55),
          geometrie: 'polygone', annee: derniereAnnee(831 + i),
          valeur: valeurSimulee(831 + i, 'surface'),
          label: 'PHEC – ' + d.nom
        }))
      },
      {
        id:        'pprn',
        label:     'PPRN',
        geometrie: 'polygone',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 8).map((d, i) => ({
          coords: gePoly(841 + i, d.cx + 0.04, d.cy - 0.04, 0.8, 0.62),
          geometrie: 'polygone', annee: derniereAnnee(841 + i),
          valeur: 'Approuvé ' + (2005 + i % 19),
          label: 'PPRN – ' + d.nom
        }))
      },
      {
        id:        'remontee-nappe',
        label:     'Remontée de nappe',
        geometrie: 'polygone',
        source:    'GEORISQUES / BRGM',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(851, 7.5, 48.4, 0.9, 0.7), geometrie: 'polygone', annee: 2024, valeur: 'Très sensible', label: 'Remontée nappe – Plaine du Rhin' },
          { coords: gePoly(852, 4.5, 48.7, 1.1, 0.8), geometrie: 'polygone', annee: 2024, valeur: 'Sensible', label: 'Remontée nappe – Champagne' },
          { coords: gePoly(853, 6.6, 48.9, 0.9, 0.7), geometrie: 'polygone', annee: 2023, valeur: 'Modérément sensible', label: 'Remontée nappe – Moselle' }
        ]
      },
      {
        id:        'reperes-crue',
        label:     'Repères de crue',
        geometrie: 'point',
        source:    'DREAL / communes',
        derniereAnnee: 2024,
        features: (function() {
          const pts = geAllPts(861, 20);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(861 + i),
            valeur: (1876 + (861 + i) % 148) + ' – ' + (0.8 + (861 + i) % 5) + ' m',
            label: 'Repère crue RC-' + (861 + i)
          }));
        })()
      },
      {
        id:        'retrait-gonflement-argiles',
        label:     'Retrait gonflement des argiles',
        geometrie: 'polygone',
        source:    'GEORISQUES / BRGM',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(871 + i, d.cx + 0.02, d.cy - 0.02, 0.85, 0.65),
          geometrie: 'polygone', annee: derniereAnnee(871 + i),
          valeur: ['Exposition forte', 'Exposition moyenne', 'Exposition faible'][i % 3],
          label: 'RGA – ' + d.nom
        }))
      },
      {
        id:        'slgri',
        label:     'SLGRI',
        geometrie: 'polygone',
        source:    'DREAL',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(881, 6.9, 49.1, 1.0, 0.75), geometrie: 'polygone', annee: 2024, valeur: 'SLGRI Moselle', label: 'SLGRI Moselle' },
          { coords: gePoly(882, 5.2, 49.4, 0.9, 0.7), geometrie: 'polygone', annee: 2024, valeur: 'SLGRI Meuse', label: 'SLGRI Meuse' },
          { coords: gePoly(883, 4.3, 48.9, 0.85, 0.65), geometrie: 'polygone', annee: 2023, valeur: 'SLGRI Marne', label: 'SLGRI Marne' }
        ]
      },
      {
        id:        'stations-hydro-vigilance-crues',
        label:     'Stations hydrométriques de vigilance crues',
        geometrie: 'point',
        source:    'SANDRE / Vigicrues',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(891, 18);
          const niveaux = ['Vert', 'Jaune', 'Orange', 'Rouge'];
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(891 + i),
            valeur: 'Vigilance ' + niveaux[i % niveaux.length],
            label: 'Station Vigicrues ' + (891 + i)
          }));
        })()
      },
      {
        id:        'stations-meteorologiques',
        label:     'Stations météorologiques',
        geometrie: 'point',
        source:    'Météo France',
        derniereAnnee: 2025,
        features: (function() {
          const pts = geAllPts(901, 15);
          return pts.map((p, i) => ({
            coords: p, geometrie: 'point',
            annee: derniereAnnee(901 + i),
            valeur: (9 + (901 + i) % 5) + ' °C Tmoy / ' + (650 + (901 + i) % 500) + ' mm/an',
            label: 'Station météo MF-' + (901 + i)
          }));
        })()
      },
      {
        id:        'tcc',
        label:     'Territoires de Compétence Crues (TCC)',
        geometrie: 'polygone',
        source:    'SANDRE',
        derniereAnnee: 2024,
        features: GE_DEPTS.slice(0, 7).map((d, i) => ({
          coords: gePoly(911 + i, d.cx - 0.07, d.cy + 0.07, 0.9, 0.7),
          geometrie: 'polygone', annee: derniereAnnee(911 + i),
          valeur: 'TCC – ' + d.nom, label: 'TCC ' + d.nom
        }))
      },
      {
        id:        'territoires-vigilance-crues',
        label:     'Territoires de vigilance crues',
        geometrie: 'polygone',
        source:    'SANDRE / Vigicrues',
        derniereAnnee: 2025,
        features: GE_DEPTS.slice(0, 8).map((d, i) => ({
          coords: gePoly(921 + i, d.cx + 0.06, d.cy - 0.06, 0.85, 0.65),
          geometrie: 'polygone', annee: derniereAnnee(921 + i),
          valeur: 'Vigilance ' + ['Vert', 'Jaune', 'Orange'][i % 3],
          label: 'Territoire vigilance – ' + d.nom
        }))
      },
      {
        id:        'tri',
        label:     'TRI',
        geometrie: 'polygone',
        source:    'GEORISQUES',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(931, 7.7, 48.5, 0.6, 0.5), geometrie: 'polygone', annee: 2024, valeur: 'TRI Strasbourg', label: 'TRI Strasbourg' },
          { coords: gePoly(932, 6.7, 49.1, 0.7, 0.55), geometrie: 'polygone', annee: 2024, valeur: 'TRI Metz', label: 'TRI Metz' },
          { coords: gePoly(933, 5.3, 49.3, 0.65, 0.5), geometrie: 'polygone', annee: 2024, valeur: 'TRI Charleville-Verdun', label: 'TRI Charleville-Verdun' },
          { coords: gePoly(934, 4.3, 49.2, 0.6, 0.48), geometrie: 'polygone', annee: 2023, valeur: 'TRI Reims', label: 'TRI Reims' }
        ]
      },
      {
        id:        'troncons-vigilance-crues',
        label:     'Tronçons de vigilance crues',
        geometrie: 'ligne',
        source:    'SANDRE / Vigicrues',
        derniereAnnee: 2025,
        features: [
          { coords: geLine(941, 6.7, 49.3, 10), geometrie: 'ligne', annee: 2025, valeur: 'Vigilance Orange', label: 'Tronçon Moselle amont' },
          { coords: geLine(942, 7.7, 47.7, 9), geometrie: 'ligne', annee: 2025, valeur: 'Vigilance Jaune', label: 'Tronçon Rhin GE' },
          { coords: geLine(943, 5.3, 49.3, 9), geometrie: 'ligne', annee: 2024, valeur: 'Vigilance Vert', label: 'Tronçon Meuse' },
          { coords: geLine(944, 4.3, 49.1, 8), geometrie: 'ligne', annee: 2025, valeur: 'Vigilance Jaune', label: 'Tronçon Marne' }
        ]
      },
      {
        id:        'zones-alerte-secheresse',
        label:     'Zones d\'Alerte Sécheresse (ZAS)',
        geometrie: 'polygone',
        source:    'SANDRE / Préfectures',
        derniereAnnee: 2024,
        features: GE_DEPTS.map((d, i) => ({
          coords: gePoly(951 + i, d.cx + 0.03, d.cy + 0.03, 0.8, 0.6),
          geometrie: 'polygone', annee: derniereAnnee(951 + i),
          valeur: ['Vigilance', 'Alerte', 'Alerte renforcée', 'Crise'][i % 4],
          label: 'ZAS – ' + d.nom
        }))
      },
      {
        id:        'zre',
        label:     'Zones de répartition des eaux (ZRE)',
        geometrie: 'polygone',
        source:    'SANDRE / Préfectures',
        derniereAnnee: 2024,
        features: [
          { coords: gePoly(961, 7.5, 48.2, 0.9, 0.7), geometrie: 'polygone', annee: 2024, valeur: 'ZRE nappe alluviale Rhin', label: 'ZRE Rhin alluvial' },
          { coords: gePoly(962, 6.3, 48.6, 1.0, 0.8), geometrie: 'polygone', annee: 2024, valeur: 'ZRE Grès du Trias', label: 'ZRE Grès Trias' },
          { coords: gePoly(963, 4.5, 48.7, 1.2, 0.9), geometrie: 'polygone', annee: 2023, valeur: 'ZRE Craie Champagne', label: 'ZRE Craie Champagne' }
        ]
      }
    ]
  }

]; // fin DONNEES_SOURCES

console.log('[data-carto-sources] Chargé –', DONNEES_SOURCES.length, 'thèmes,',
  DONNEES_SOURCES.reduce((s, c) => s + c.filtres.length, 0), 'filtres/couches');
