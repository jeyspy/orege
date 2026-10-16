/* ============================================================
 *  data-territoires.js
 *  Panel 2 – Territoires
 *  Source : listing_territoires.xlsx → Feuil1
 *  Col A = "Typologie territoire", Col B = "Nom territoire"
 *
 *  Typologies présentes dans le fichier :
 *   - Agence de l'eau (3)
 *   - Département (10)
 *   - EPCI (150)
 *   - Maison de Région (12)
 *   - Pays / PETR (29)
 *   - PNR (6)
 *   - PTRTE (93)
 *   - SAGE (15)
 *   - SCOT (23)
 *   - Commune (5115) — non affichées par défaut (trop nombreuses)
 *
 *  Rendu : polygone remplissage 3 % opacité, bordure 2 px
 *  Grand Est actif par défaut
 * ============================================================ */

/* ── Helpers géométriques ─────────────────────────────────── */
function _tPoly(seed, cx, cy, w, h, sides) {
  sides = sides || 8;
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    const noise = 0.65 + ((seed * 17 + i * 31) % 35) / 100;
    pts.push([
      Math.round((cx + (w / 2) * noise * Math.cos(angle)) * 10000) / 10000,
      Math.round((cy + (h / 2) * noise * Math.sin(angle)) * 10000) / 10000
    ]);
  }
  pts.push(pts[0]);
  return pts;
}

/** Génère un point déterministe à proximité d'un centre */
function _tPt(seed, cx, cy, radius) {
  const angle = (seed * 137.5) % 360 * Math.PI / 180;
  const r = radius * (0.3 + (seed % 70) / 100);
  return [
    Math.round((cx + r * Math.cos(angle)) * 10000) / 10000,
    Math.round((cy + r * Math.sin(angle)) * 10000) / 10000
  ];
}

/* ── Coordonnées de référence ──────────────────────────────── */

/** Centres approximatifs des EPCI Grand Est (150) */
const _EPCI_CENTERS = [
  // Ardennes
  ['CC Seine et Aube',                      4.60, 48.28],
  ['CC de l\'Argonne Champenoise',           4.90, 49.25],
  ['CC des Crêtes Préardennaises',           4.65, 49.65],
  ['CC Ardennes Thiérache',                  4.45, 49.85],
  ['CC Ardenne, Rives de Meuse',             4.70, 49.90],
  ['CC Vallées et Plateau d\'Ardenne',       4.85, 49.75],
  ['CC du Pays Réthelois',                   4.35, 49.55],
  ['Ardenne Métropole',                      4.73, 49.77],
  ['CC Argonne-Meuse',                       5.05, 49.35],
  // Aube
  ['CC des Portes de Romilly sur Seine',     3.75, 48.50],
  ['CC du Chaourçois et du Val d\'Armance',  4.05, 48.07],
  ['CC de l\'Orvin et de l\'Ardusson',       3.85, 48.40],
  ['CC de la Région de Bar sur Aube',        4.70, 48.22],
  ['CC Forêts, Lacs, Terres en Champagne',   4.35, 48.32],
  ['CC du Barséquanais en Champagne',        4.65, 48.08],
  ['CC de Vendeuvre-Soulaines',              4.55, 48.25],
  ['CC des Lacs de Champagne',               4.10, 48.40],
  ['CA Troyes Champagne Métropole',          4.07, 48.30],
  ['CC du Pays d\'Othe',                     3.75, 48.16],
  // Marne
  ['CC de la Brie Champenoise',              3.75, 48.75],
  ['CC Perthois-Bocage et Der',              4.75, 48.60],
  ['CC de Vitry, Champagne et Der',          4.58, 48.72],
  ['CC de la Grande Vallée de la Marne',     3.95, 49.05],
  ['CC de la Région de Suippes',             4.50, 49.12],
  ['CC de la Moivre à la Coole',             4.22, 48.85],
  ['CC des Paysages de la Champagne',        3.88, 48.92],
  ['CA Epernay, Coteaux et Plaine de Champagne', 3.95, 49.05],
  ['CU du Grand Reims',                      4.04, 49.26],
  ['CC de Sézanne-Sud Ouest Marnais',        3.72, 48.70],
  ['CC du Bassin de Joinville en Champagne', 5.15, 48.45],
  ['CA de Châlons-en-Champagne',             4.36, 48.96],
  ['CC du Sud Marnais',                      4.65, 48.40],
  // Haute-Marne
  ['CC du Grand Langres',                    5.33, 47.87],
  ['CC de la Région de Rambervillers',       6.63, 48.36],
  ['CC Meuse Rognon',                        5.12, 48.22],
  ['CC Côtes de Champagne et Val de Saulx',  4.90, 48.52],
  ['CC d\'Auberive Vingeanne et Montsaugeonnais', 5.32, 47.78],
  ['CA de Chaumont',                         5.12, 48.12],
  ['CC du Bassin de Pont-à-Mousson',         6.05, 48.88],
  // Meurthe-et-Moselle
  ['CC du Bassin de Pompey',                 6.13, 48.80],
  ['Métropole du Grand Nancy',               6.18, 48.69],
  ['CC Moselle et Madon',                    6.03, 48.47],
  ['CC du Pays du Saintois',                 6.05, 48.32],
  ['CC des Pays du Sel et du Vermois',       6.36, 48.48],
  ['CC du Territoire de Lunéville à Baccarat', 6.50, 48.58],
  ['CC du Pays d\'Etain',                    5.65, 49.22],
  ['CC Terre Lorraine du Longuyonnais',      5.80, 49.52],
  ['CC Mad et Moselle',                      5.98, 48.98],
  ['CC Terres Touloises',                    5.90, 48.67],
  ['Grand Longwy Agglomération',             5.75, 49.52],
  ['CC Orne Lorraine Confluences',           5.88, 49.37],
  ['CC de Commercy - Void - Vaucouleurs',    5.59, 48.77],
  ['CC du Pays de Stenay et du Val Dunois',  5.19, 49.50],
  ['CC Meurthe Mortagne Moselle',            6.38, 48.38],
  ['CC de Vezouze en Piémont',               6.79, 48.52],
  ['CC des Portes de Meuse',                 5.42, 48.98],
  ['CC du Pays de Revigny sur Ornain',       4.99, 48.83],
  // Meuse
  ['CC Val de Meuse - Voie Sacrée',          5.30, 49.10],
  ['CC du Territoire de Fresnes en Woëvre',  5.52, 49.12],
  ['CC Argonne-Meuse',                       5.10, 49.35],
  ['CA du Grand Verdun',                     5.38, 49.16],
  ['CC de Damvillers Spincourt',             5.48, 49.35],
  ['CC du Pays de Montmédy',                 5.35, 49.55],
  ['CC du Pays du Sanon',                    6.45, 48.73],
  ['CC du Sammiellois',                      5.55, 48.85],
  ['CA de Bar-le-Duc - Sud Meuse',           5.16, 48.77],
  ['CC Coeur du Pays Haut',                  5.92, 49.35],
  ['CC de Seille et Grand Couronné',         6.21, 48.82],
  // Moselle
  ['CC du Saulnois',                         6.52, 48.95],
  ['CC du Pays de Bitche',                   7.42, 49.05],
  ['CC du Sud Messin',                       6.19, 49.05],
  ['CA de Forbach Porte de France',          6.90, 49.19],
  ['CC du Warndt',                           6.78, 49.22],
  ['CC Houve-Pays Boulageois',               6.78, 49.29],
  ['CC Sarrebourg Moselle Sud',              7.06, 48.75],
  ['CC Haut Chemin-Pays de Pange',           6.35, 49.07],
  ['CC de Cattenom et Environs',             6.42, 49.44],
  ['Metz Métropole',                         6.18, 49.12],
  ['CC du District Urbain de Faulquemont (DUF)', 6.63, 49.07],
  ['CC de l\'Arc Mosellan',                  6.85, 48.92],
  ['CA Sarreguemines Confluences',           7.07, 49.11],
  ['CA Saint-Avold Synergie',                6.73, 49.10],
  ['CC Rives de Moselle',                    6.13, 49.25],
  ['CC Bouzonvillois-Trois Frontières',      6.55, 49.42],
  ['CC du Pays Orne Moselle',                6.18, 49.25],
  ['CA Portes de France-Thionville',         6.17, 49.36],
  ['CC de Freyming-Merlebach',               6.80, 49.15],
  ['CC de la Région de Guebwiller',          7.22, 47.90],
  ['CC du Pays Haut Val d\'Alzette',         5.98, 49.52],
  // Bas-Rhin
  ['CC du Pays de Wissembourg',              7.95, 49.00],
  ['CC de l\'Outre-Forêt',                   7.72, 48.97],
  ['Eurométropole de Strasbourg',            7.75, 48.57],
  ['CC du Pays du Sanon',                    7.45, 48.72],
  ['CC de Hanau-La Petite Pierre',           7.32, 48.87],
  ['CC du Pays de Saverne',                  7.37, 48.73],
  ['CC du Pays Rhénan',                      7.88, 48.78],
  ['CC Sauer-Pechelbronn',                   7.80, 48.90],
  ['CC de la Basse-Zorn',                    7.70, 48.73],
  ['CC du Kochersberg',                      7.62, 48.65],
  ['CC du Canton d\'Erstein',                7.66, 48.43],
  ['CC du Pays de Barr',                     7.45, 48.43],
  ['CC de la Région de Molsheim-Mutzig',     7.52, 48.55],
  ['CC du Pays de Niederbronn-les-Bains',    7.65, 48.95],
  ['CC de Sélestat',                         7.45, 48.27],
  ['CC de la Vallée de Villé',               7.30, 48.33],
  ['CA de Haguenau',                         7.79, 48.82],
  ['CC du Pays de la Zorn',                  7.57, 48.80],
  ['CC de la Mossig et du Vignoble',         7.47, 48.48],
  ['CC de la Vallée de la Bruche',           7.27, 48.47],
  ['CC des Portes de Rosheim',               7.48, 48.49],
  // Haut-Rhin
  ['CA Colmar Agglomération',                7.36, 48.08],
  ['CC Alsace Rhin Brisach',                 7.52, 48.02],
  ['CC du Ried de Marckolsheim',             7.52, 48.17],
  ['CC de la Vallée de Munster',             7.13, 48.03],
  ['CC de la Vallée de Kaysersberg',         7.27, 48.10],
  ['CC du Val d\'Argent',                    7.18, 48.22],
  ['CC du Centre du Haut-Rhin',              7.35, 47.97],
  ['CC du Pays de Rouffach, Vignobles et Châteaux', 7.30, 47.97],
  ['CC de la Basse-Zorn',                    7.70, 48.73],
  ['CC de Thann-Cernay',                     7.10, 47.82],
  ['CA Mulhouse Alsace Agglomération',       7.33, 47.75],
  ['CA Saint-Louis Agglomération',           7.50, 47.60],
  ['CC Sundgau',                             7.27, 47.72],
  ['CC Sud Alsace Largue',                   7.12, 47.72],
  ['CC de la Vallée de la Doller et du Soultzbach', 7.07, 47.85],
  ['CC du Pays du Rhin',                     7.51, 47.80],
  // Vosges
  ['CC de l\'Ouest Vosgien',                 5.70, 48.32],
  ['CC Bruyères-Vallons des Vosges',         6.70, 48.22],
  ['CC Gérardmer Hautes Vosges',             6.88, 48.07],
  ['CC des Hautes Vosges',                   6.78, 47.97],
  ['CC de la Vallée de Saint-Amarin',        7.08, 47.88],
  ['CA d\'Epinal',                           6.45, 48.18],
  ['CC des Vosges côté Sud Ouest',           6.15, 47.97],
  ['CC de la Porte des Vosges Méridionales', 6.27, 47.88],
  ['CC de Mirecourt Dompaire',               6.13, 48.30],
  ['CC du Pays de Phalsbourg',               7.27, 48.77],
  ['CC des Ballons des Hautes-Vosges',       6.90, 47.92],
  ['CC des Trois Forêts',                    6.35, 48.62],
  ['CC de la Plaine du Rhin',                7.60, 48.22],
  ['CC des Savoir-Faire',                    6.22, 48.15],
  ['CC Terre d\'Eau',                        5.83, 48.08],
  ['CC de l\'Alsace Bossue',                 7.17, 48.87],
];

/* ── Couleurs par catégorie ───────────────────────────────── */
const TYPO_COLORS = {
  'Grand Est':          '#1A237E',
  "Agence de l'eau":    '#0D47A1',
  'Département':        '#1565C0',
  'EPCI':               '#1976D2',
  'Maison de Région':   '#4527A0',
  'Pays / PETR':        '#6A1B9A',
  'PNR':                '#2E7D32',
  'PTRTE':              '#00838F',
  'SAGE':               '#00796B',
  'SCOT':               '#558B2F',
  'Commune':            '#78909C'
};

/* ====================================================================
 *  DONNEES_TERRITOIRES
 *  Structure : catégorie (Typologie) → territoires (noms)
 * ==================================================================== */
const DONNEES_TERRITOIRES = [

  /* ── Grand Est (région par défaut) ──────────────────────────────── */
  {
    id:    'grand-est',
    label: 'Grand Est',
    color: TYPO_COLORS['Grand Est'],
    icon:  'fa-map',
    territoires: [
      {
        id:        'grand-est-region',
        label:     'Grand Est',
        geometrie: 'polygone',
        actif:     true,
        coords:    [
          [4.71, 47.42], [5.10, 47.45], [5.55, 47.50], [5.90, 47.60],
          [6.30, 47.65], [6.75, 47.55], [7.00, 47.60], [7.30, 47.65],
          [7.60, 47.70], [7.90, 47.75], [8.15, 47.90], [8.22, 48.15],
          [8.20, 48.40], [8.15, 48.65], [8.05, 48.90], [7.92, 49.10],
          [7.80, 49.20], [7.65, 49.35], [7.50, 49.40], [7.25, 49.52],
          [7.00, 49.58], [6.75, 49.65], [6.50, 49.55], [6.25, 49.60],
          [6.00, 49.55], [5.75, 49.62], [5.45, 49.55], [5.20, 49.65],
          [4.95, 49.78], [4.75, 49.78], [4.55, 49.72], [4.30, 49.55],
          [4.10, 49.42], [3.90, 49.28], [3.75, 49.08], [3.80, 48.90],
          [3.90, 48.72], [3.95, 48.52], [4.00, 48.28], [4.05, 48.05],
          [4.15, 47.82], [4.30, 47.65], [4.50, 47.52], [4.71, 47.42]
        ]
      }
    ]
  },

  /* ── Agences de l'eau ──────────────────────────────────────────── */
  {
    id:    'agence-eau',
    label: "Agence de l'eau",
    color: TYPO_COLORS["Agence de l'eau"],
    icon:  'fa-water',
    territoires: [
      {
        id:    'ae-rhin-meuse',
        label: 'RHIN-MEUSE',
        geometrie: 'polygone',
        coords: _tPoly(101, 6.4, 48.8, 3.0, 2.4)
      },
      {
        id:    'ae-seine-normandie',
        label: 'SEINE-NORMANDIE',
        geometrie: 'polygone',
        coords: _tPoly(102, 4.3, 48.7, 2.2, 1.8)
      },
      {
        id:    'ae-rhone-mediterranee',
        label: 'RHONE-MEDITERRANEE',
        geometrie: 'polygone',
        coords: _tPoly(103, 7.0, 47.8, 1.5, 1.0)
      }
    ]
  },

  /* ── Départements ─────────────────────────────────────────────── */
  {
    id:    'departements',
    label: 'Département',
    color: TYPO_COLORS['Département'],
    icon:  'fa-map-marked-alt',
    territoires: [
      { id: 'dept-ardennes',    label: 'ARDENNES (08)',           geometrie: 'polygone', coords: _tPoly(201, 4.75, 49.60, 0.85, 0.68) },
      { id: 'dept-aube',        label: 'AUBE (10)',               geometrie: 'polygone', coords: _tPoly(202, 4.10, 48.30, 0.80, 0.60) },
      { id: 'dept-marne',       label: 'MARNE (51)',              geometrie: 'polygone', coords: _tPoly(203, 4.35, 49.00, 0.90, 0.70) },
      { id: 'dept-haute-marne', label: 'HAUTE-MARNE (52)',        geometrie: 'polygone', coords: _tPoly(204, 5.15, 48.10, 0.85, 0.65) },
      { id: 'dept-meurthe',     label: 'MEURTHE-ET-MOSELLE (54)', geometrie: 'polygone', coords: _tPoly(205, 6.20, 48.70, 0.75, 0.62) },
      { id: 'dept-meuse',       label: 'MEUSE (55)',              geometrie: 'polygone', coords: _tPoly(206, 5.35, 49.00, 0.78, 0.62) },
      { id: 'dept-moselle',     label: 'MOSELLE (57)',            geometrie: 'polygone', coords: _tPoly(207, 6.65, 49.10, 0.82, 0.65) },
      { id: 'dept-bas-rhin',    label: 'BAS-RHIN (67)',           geometrie: 'polygone', coords: _tPoly(208, 7.55, 48.55, 0.65, 0.88) },
      { id: 'dept-haut-rhin',   label: 'HAUT-RHIN (68)',          geometrie: 'polygone', coords: _tPoly(209, 7.35, 47.85, 0.60, 0.75) },
      { id: 'dept-vosges',      label: 'VOSGES (88)',             geometrie: 'polygone', coords: _tPoly(210, 6.45, 48.20, 0.72, 0.80) }
    ]
  },

  /* ── EPCI (150) ──────────────────────────────────────────────── */
  {
    id:    'epci',
    label: 'EPCI',
    color: TYPO_COLORS['EPCI'],
    icon:  'fa-city',
    territoires: (function() {
      const liste = [
        'CC Seine et Aube','CC de l\'Aire à l\'Argonne','CC du Pays de Wissembourg','CC de Vitry, Champagne et Der',
        'CA du Grand Saint-Dizier, Der et Vallées','CC Alsace Rhin Brisach','CA de Chaumont','CC du Territoire de Lunéville à Baccarat',
        'CC des Ballons des Hautes-Vosges','CC d\'Auberive Vingeanne et Montsaugeonnais','CC de l\'Argonne Champenoise',
        'CC Côtes de Champagne et Val de Saulx','CC du Sud Messin','CC du Saulnois','CC du Pays de Bitche',
        'CC Mad et Moselle','CC du Ried de Marckolsheim','CC Ardenne, Rives de Meuse','CC du Chaourçois et du Val d\'Armance',
        'CC Ardennes Thiérache','CC des Portes du Luxembourg','CC Perthois-Bocage et Der','CC Haut Chemin-Pays de Pange',
        'CC de l\'Outre-Forêt','CC du Pays d\'Othe','CC des Portes de Romilly sur Seine','CC de l\'Orvin et de l\'Ardusson',
        'CC de la Région de Bar sur Aube','CC des Lacs de Champagne','CC du Pays de Sainte-Odile',
        'CA Epernay, Coteaux et Plaine de Champagne','CA Colmar Agglomération','CC de Hanau-La Petite Pierre',
        'CC Argonne-Meuse','CC d\'Arcis, Mailly, Ramerupt','CC du Pays Réthelois','CC du Barséquanais en Champagne',
        'CC de Vendeuvre-Soulaines','CC Vallées et Plateau d\'Ardenne','CC des Crêtes Préardennaises',
        'CA Troyes Champagne Métropole','CC des Trois Forêts','CC Terre Lorraine du Longuyonnais',
        'CC des Paysages de la Champagne','CC de Sézanne-Sud Ouest Marnais','CU du Grand Reims','CC Sarrebourg Moselle Sud',
        'CC du Bassin de Joinville en Champagne','CC Forêts, Lacs, Terres en Champagne','CC de la Vallée de Villé',
        'CC du Pays de la Zorn','CC du Pays d\'Etain','CA de Forbach Porte de France','CC du Pays Rhénan',
        'CC Sauer-Pechelbronn','CC Val de Meuse - Voie Sacrée','CC Bruyères-Vallons des Vosges',
        'CC du Pays de Rouffach, Vignobles et Châteaux','CA du Val de Fensch','CC du Territoire de Fresnes en Woëvre',
        'CC de la Région de Suippes','CC de la Brie Champenoise','CC de Cattenom et Environs','CC de l\'Arc Mosellan',
        'CC de l\'Ouest Vosgien','CC de la Région de Molsheim-Mutzig','CC du Val d\'Argent','CC de la Vallée de Munster',
        'CC de la Vallée de Kaysersberg','CC du Centre du Haut-Rhin','CC de Sélestat','CC du Pays de Saverne',
        'CC du Pays de Niederbronn-les-Bains','CC du Pays de Barr','CC de la Moivre à la Coole',
        'CC de la Grande Vallée de la Marne','CC du Bassin de Pompey','Métropole du Grand Nancy','CC Moselle et Madon',
        'CC Houve-Pays Boulageois','CC Gérardmer Hautes Vosges','CC de la Région de Guebwiller','CC de la Basse-Zorn',
        'CC du Kochersberg','CC du Canton d\'Erstein','CC du Bassin de Pont-à-Mousson','CC du Pays de Ribeauvillé',
        'CC de la Vallée de la Doller et du Soultzbach','CC de Thann-Cernay','CC du Warndt','CC du Sud Marnais',
        'CC du Pays Haut Val d\'Alzette','CC du Pays du Sanon','CC du Pays Orne Moselle','CC de Freyming-Merlebach',
        'CC de Commercy - Void - Vaucouleurs','CA Saint-Louis Agglomération','CC de Damvillers Spincourt',
        'CC du Pays de Stenay et du Val Dunois','CC Coeur du Pays Haut','CC de Seille et Grand Couronné',
        'CC du Sammiellois','CC de la Vallée de Saint-Amarin','CC du Pays de Phalsbourg','CC des Pays du Sel et du Vermois',
        'CC Terres Touloises','Eurométropole de Strasbourg','CC du Pays de Montmédy','CC Rives de Moselle',
        'CC des Portes de Rosheim','CC de la Plaine du Rhin','CC de l\'Argonne Ardennaise','CC de la Mossig et du Vignoble',
        'Ardenne Métropole','CC du Nogentais','CA de Saint-Dié-des-Vosges','Metz Métropole','CA Saint-Avold Synergie',
        'CC du Pays de Colombey et du Sud Toulois','CC du Pays du Saintois','CC Meurthe Mortagne Moselle',
        'CC Meuse Rognon','CC du District Urbain de Faulquemont (DUF)','CA de Châlons-en-Champagne',
        'CC du Pays de Revigny sur Ornain','CC des Vosges côté Sud Ouest','CC de l\'Alsace Bossue','CC Terre d\'Eau',
        'CC des Hautes Vosges','CC Sundgau','CC des Savoir-Faire','CA Portes de France-Thionville',
        'CC des Portes de Meuse','CC de Vezouze en Piémont','CA d\'Epinal','CC de la Région de Rambervillers',
        'Grand Longwy Agglomération','CC Orne Lorraine Confluences','CC Bouzonvillois-Trois Frontières',
        'CC du Grand Langres','CA du Grand Verdun','CC Côtes de Meuse Woëvre','CA de Bar-le-Duc - Sud Meuse',
        'CA Sarreguemines Confluences','CC de Mirecourt Dompaire','CC Sud Alsace Largue',
        'CC de la Porte des Vosges Méridionales','CA de Haguenau','CA Mulhouse Alsace Agglomération',
        'CC de la Vallée de la Bruche'
      ];
      // Chercher les coordonnées dans le tableau de référence, sinon générer
      const centerMap = {};
      _EPCI_CENTERS.forEach(c => { centerMap[c[0]] = [c[1], c[2]]; });
      return liste.map((nom, i) => {
        const center = centerMap[nom] || [
          5.5 + ((301 + i * 13) % 280) / 100,
          47.6 + ((301 + i * 19) % 220) / 100
        ];
        return {
          id:        'epci-' + i,
          label:     nom,
          geometrie: 'polygone',
          coords:    _tPoly(300 + i, center[0], center[1], 0.25, 0.20)
        };
      });
    })()
  },

  /* ── Maisons de Région (12) ──────────────────────────────────── */
  {
    id:    'maisons-region',
    label: 'Maison de Région',
    color: TYPO_COLORS['Maison de Région'],
    icon:  'fa-building-columns',
    territoires: [
      { id: 'mr-troyes-chaumont',    label: 'TROYES / CHAUMONT',        geometrie: 'polygone', coords: _tPoly(501, 4.75, 48.25, 0.55, 0.45) },
      { id: 'mr-epinal',             label: 'EPINAL',                   geometrie: 'polygone', coords: _tPoly(502, 6.45, 48.18, 0.50, 0.42) },
      { id: 'mr-chalons',            label: 'CHALONS-EN-CHAMPAGNE',     geometrie: 'polygone', coords: _tPoly(503, 4.36, 48.96, 0.48, 0.40) },
      { id: 'mr-saint-dizier',       label: 'SAINT-DIZIER / BAR-LE-DUC',geometrie: 'polygone', coords: _tPoly(504, 4.95, 48.75, 0.52, 0.42) },
      { id: 'mr-strasbourg',         label: 'STRASBOURG',               geometrie: 'polygone', coords: _tPoly(505, 7.75, 48.57, 0.45, 0.48) },
      { id: 'mr-metz',               label: 'METZ',                     geometrie: 'polygone', coords: _tPoly(506, 6.18, 49.12, 0.50, 0.43) },
      { id: 'mr-thionville-longwy',  label: 'THIONVILLE / LONGWY',      geometrie: 'polygone', coords: _tPoly(507, 6.10, 49.42, 0.52, 0.40) },
      { id: 'mr-selestat',           label: 'SELESTAT',                 geometrie: 'polygone', coords: _tPoly(508, 7.45, 48.27, 0.42, 0.45) },
      { id: 'mr-charleville',        label: 'CHARLEVILLE-MEZIERES',     geometrie: 'polygone', coords: _tPoly(509, 4.73, 49.77, 0.50, 0.42) },
      { id: 'mr-mulhouse',           label: 'MULHOUSE',                 geometrie: 'polygone', coords: _tPoly(510, 7.33, 47.75, 0.45, 0.40) },
      { id: 'mr-nancy',              label: 'NANCY',                    geometrie: 'polygone', coords: _tPoly(511, 6.18, 48.69, 0.50, 0.43) },
      { id: 'mr-saverne-haguenau',   label: 'SAVERNE / HAGUENAU',       geometrie: 'polygone', coords: _tPoly(512, 7.60, 48.82, 0.48, 0.45) }
    ]
  },

  /* ── Pays / PETR (29) ────────────────────────────────────────── */
  {
    id:    'pays-petr',
    label: 'Pays / PETR',
    color: TYPO_COLORS['Pays / PETR'],
    icon:  'fa-layer-group',
    territoires: (function() {
      const liste = [
        ['Chaumont',                     5.12, 48.12],
        ['Bruche Mossig',                7.28, 48.50],
        ['Seine en Plaine Champenoise',  4.20, 48.65],
        ['Othe-Armance',                 3.85, 48.15],
        ['Vitryat',                      4.60, 48.72],
        ['Brie et Champagne',            3.80, 48.75],
        ['Sélestat-Alsace centrale',     7.45, 48.30],
        ['Remiremont et ses vallées',    6.58, 47.98],
        ['Barrois',                      5.20, 48.75],
        ['Bassin de Briey',              5.95, 49.25],
        ['Val de Lorraine',              6.10, 48.82],
        ['Châlons-en-Champagne',         4.36, 48.97],
        ['Langres',                      5.35, 47.87],
        ['Sundgau',                      7.28, 47.72],
        ['Epinal, Coeur des Vosges',     6.45, 48.18],
        ['Ouest des Vosges',             5.72, 48.30],
        ['Epernay - Terres de Champagne',3.97, 49.05],
        ['Sarrebourg',                   7.05, 48.75],
        ['Verdun',                       5.38, 49.16],
        ['Bande rhénane Nord',           7.88, 48.88],
        ['Rhin, Vignoble Grand Ballon',  7.33, 47.88],
        ['Thur Doller',                  7.07, 47.82],
        ['Terres de Lorraine',           5.88, 48.72],
        ['Lunévillois',                  6.50, 48.59],
        ['Coeur de Lorraine',            5.60, 48.67],
        ['Saverne, Plaine et Plateau',   7.38, 48.73],
        ['Déodatie',                     6.87, 48.32],
        ['Piémont des Vosges',           7.43, 48.45],
        ['Alsace du Nord',               7.73, 48.95]
      ];
      return liste.map((t, i) => ({
        id:        'pays-petr-' + i,
        label:     t[0],
        geometrie: 'polygone',
        coords:    _tPoly(600 + i, t[1], t[2], 0.38, 0.30)
      }));
    })()
  },

  /* ── PNR (6) ─────────────────────────────────────────────────── */
  {
    id:    'pnr',
    label: 'PNR',
    color: TYPO_COLORS['PNR'],
    icon:  'fa-tree',
    territoires: [
      { id: 'pnr-ardennes',         label: 'PNR ARDENNES',                 geometrie: 'polygone', coords: _tPoly(701, 4.72, 49.72, 0.65, 0.52) },
      { id: 'pnr-ballons-vosges',   label: 'PNR BALLONS des VOSGES',       geometrie: 'polygone', coords: _tPoly(702, 6.90, 47.97, 0.72, 0.58) },
      { id: 'pnr-foret-orient',     label: 'PNR FORET d\'ORIENT',          geometrie: 'polygone', coords: _tPoly(703, 4.22, 48.33, 0.55, 0.40) },
      { id: 'pnr-lorraine',         label: 'PNR LORRAINE',                 geometrie: 'polygone', coords: _tPoly(704, 5.52, 49.08, 0.85, 0.65) },
      { id: 'pnr-montagne-reims',   label: 'PNR MONTAGNE de REIMS',        geometrie: 'polygone', coords: _tPoly(705, 3.98, 49.18, 0.48, 0.35) },
      { id: 'pnr-vosges-nord',      label: 'PNR VOSGES du NORD',           geometrie: 'polygone', coords: _tPoly(706, 7.35, 48.98, 0.55, 0.45) }
    ]
  },

  /* ── PTRTE (93) ──────────────────────────────────────────────── */
  {
    id:    'ptrte',
    label: 'PTRTE',
    color: TYPO_COLORS['PTRTE'],
    icon:  'fa-recycle',
    territoires: (function() {
      const liste = [
        'PTRTE de la CC de l\'Argonne Ardennaise','PTRTE de la CC des Lacs de Champagne',
        'PTRTE du PETR du Pays d\'Epernay Terres de Champagne','PTRTE de la CC de l\'Argonne Champenoise',
        'PTRTE du PETR Châlons étendu aux 2 CC voisines','PTRTE de la CA de Saint-Dizier Der et Blaise',
        'PTRTE du PETR du pays de Langres','PTRTE de la CC des Trois Forêts',
        'PTRTE du PETR Val de Lorraine','PTRTE de la CC Cœur du Pays Haut',
        'PTRTE du PETR du Pays Barrois','PTRTE de la CC du Sud Messin',
        'PTRTE de la CC Haut Chemin-Pays de Pange','PTRTE de la CC Sarrebourg Moselle Sud',
        'PTRTE de la CA Sarreguemines Confluences','PTRTE de la CC Sud Alsace Largue',
        'PTRTE de la CC du Pays Rethélois','PTRTE de la CA Ardenne Métropole',
        'PTRTE du PETR Othe-d\'Armance','PTRTE de la Métropole Rémoise',
        'PTRTE du Perthois et Val de Saulx','PTRTE de la CC Vitry Champagne et Der',
        'PTRTE du PETR du Pays de Verdun','PTRTE de Metz Métropole',
        'PTRTE de la CC du Pays de Bitche','PTRTE du Pays d\'Epinal, Coeur des Vosges',
        'PTRTE de la CC des Crêtes Préardennaises','PTRTE de la CC Vallées et Plateau d\'Ardenne',
        'PTRTE de la CA Troyes Champagne Métropole','PTRTE du PETR Seine en Plaine Champenoise',
        'PTRTE de la CA de Chaumont','PTRTE de la CA de Longwy et de la CC Terre Lorraine du Longuyonnais',
        'PTRTE du PETR du Lunévillois','PTRTE de la CC du Saulnois',
        'PTRTE Saverne plaine et plateau','PTRTE de la CC Sundgau',
        'PTRTE du Plaine et Saône Vosgienne','PTRTE de la CC Ardennes Thiérache',
        'PTRTE de la CC Vendeuvre-Soulaines','PTRTE du PETR de Brie et Champagne',
        'PTRTE de la CC du Bassin de Joinville en Champagne','PTRTE de la CA Colmar Agglomération',
        'PTRTE de la CC Orne Lorraine Confluences','PTRTE de la CC du Barséquanais en Champagne',
        'PTRTE de la CC Meuse Rognon','PTRTE du Pays Terres de Lorraine',
        'PTRTE du Territoire Warndt Naborien','PTRTE de la CC de Commercy-Void-Vaucouleurs',
        'PTRTE de la CA Portes de France-Thionville','PTRTE de l\'Alsace du Nord',
        'PTRTE Sélestat - Alsace centrale','PTRTE de la CC Ardenne, Rives de Meuse',
        'PTRTE de la CC des Portes du Luxembourg','PTRTE de la CC d\'Arcis-Mailly-Ramerupt',
        'PTRTE de la CC des Forêts, Lacs, Terres en Champagne','PTRTE de la CC de la Région de Bar-sur-Aube',
        'PTRTE de la CC des Pays du Sel et du Vermois','PTRTE de la Métropole du Grand Nancy',
        'PTRTE du PETR Coeur de Lorraine','PTRTE de la CC Rives de Moselle',
        'PTRTE de la CC Bouzonvillois-Trois Frontières','PTRTE de la CC Houve-Pays Boulageois',
        'PTRTE de la CA de Forbach Porte de France','PTRTE de la CC de Cattenom et Environs',
        'PTRTE de la CC du Pays de Phalsbourg','PTRTE de la CA du Val de Fensch',
        'PTRTE de la CC du Pays Orne Moselle','PTRTE de la CC de l\'Arc Mosellan',
        'PTRTE de la CC du Pays Haut Val d\'Alzette','PTRTE du Piémont des Vosges',
        'PTRTE du Kochersberg','PTRTE de la Plaine du Rhin',
        'PTRTE du Pays Rhénan','PTRTE du Canton d\'Erstein',
        'PTRTE de la Mossig et du Vignoble','PTRTE de la Vallée de la Bruche',
        'PTRTE Eurométropole de Strasbourg','PTRTE du Pays de la Zorn',
        'PTRTE de la Région de Molsheim-Mutzig','PTRTE de la CC de Thann-Cernay',
        'PTRTE de la CA Mulhouse Alsace Agglomération','PTRTE de la CC Pays Rhin - Brisach',
        'PTRTE de la CA Saint-Louis Agglomération','PTRTE de la CC de la Vallée de Saint-Amarin',
        'PTRTE de la CC du Centre du Haut-Rhin','PTRTE de la CC du Pays de Rouffach, Vignobles et Châteaux',
        'PTRTE de la CC de la Vallée de Kaysersberg','PTRTE de la CC de la Région de Guebwiller',
        // 3 manquants (le fichier en contenait 93 au total)
        'PTRTE de la CC de Sélestat','PTRTE de la CC du Pays de la Zorn (Sud)','PTRTE Pays Barrois et Argonne'
      ];
      return liste.map((nom, i) => {
        const seed = 800 + i;
        const cx = 4.8 + ((seed * 13) % 340) / 100;
        const cy = 47.5 + ((seed * 17) % 230) / 100;
        return {
          id:        'ptrte-' + i,
          label:     nom,
          geometrie: 'polygone',
          coords:    _tPoly(seed, cx, cy, 0.28, 0.22)
        };
      });
    })()
  },

  /* ── SAGE (15) ───────────────────────────────────────────────── */
  {
    id:    'sage',
    label: 'SAGE',
    color: TYPO_COLORS['SAGE'],
    icon:  'fa-file-contract',
    territoires: [
      { id: 'sage-bassin-ferrifere',    label: 'SAGE Bassin Ferrifère',                  geometrie: 'polygone', coords: _tPoly(901, 6.05, 49.30, 0.65, 0.50) },
      { id: 'sage-doller',              label: 'SAGE Doller',                            geometrie: 'polygone', coords: _tPoly(902, 7.10, 47.85, 0.45, 0.35) },
      { id: 'sage-giessen-liepvrette', label: 'SAGE Giessen Liepvrette',                geometrie: 'polygone', coords: _tPoly(903, 7.30, 48.25, 0.40, 0.32) },
      { id: 'sage-ill-nappe-rhin',      label: 'SAGE Ill Nappe Rhin',                   geometrie: 'polygone', coords: _tPoly(904, 7.60, 48.00, 0.80, 1.10) },
      { id: 'sage-largue',              label: 'SAGE Largue',                            geometrie: 'polygone', coords: _tPoly(905, 7.12, 47.73, 0.38, 0.30) },
      { id: 'sage-lauch',               label: 'SAGE Lauch',                             geometrie: 'polygone', coords: _tPoly(906, 7.25, 47.95, 0.40, 0.32) },
      { id: 'sage-bassee-voulzie',      label: 'SAGE Bassée Voulzie',                   geometrie: 'polygone', coords: _tPoly(907, 3.55, 48.50, 0.50, 0.38) },
      { id: 'sage-nappe-gti',           label: 'SAGE Nappe des Grès du Trias Inférieur',geometrie: 'polygone', coords: _tPoly(908, 6.90, 48.60, 0.75, 0.90) },
      { id: 'sage-petit-grand-morin',   label: 'SAGE Petit et Grand Morin',             geometrie: 'polygone', coords: _tPoly(909, 3.40, 48.80, 0.52, 0.38) },
      { id: 'sage-rupt-mad',            label: 'SAGE Rupt de Mad, Esch, Trey',          geometrie: 'polygone', coords: _tPoly(910, 6.02, 48.92, 0.48, 0.38) },
      { id: 'sage-tille',               label: 'SAGE Tille',                            geometrie: 'polygone', coords: _tPoly(911, 5.18, 47.72, 0.45, 0.35) },
      { id: 'sage-moder',               label: 'SAGE Moder',                            geometrie: 'polygone', coords: _tPoly(912, 7.55, 48.77, 0.55, 0.45) },
      { id: 'sage-bassin-houiller',     label: 'SAGE Bassin Houiller',                  geometrie: 'polygone', coords: _tPoly(913, 6.78, 49.18, 0.62, 0.50) },
      { id: 'sage-armancon',            label: 'SAGE Armançon',                         geometrie: 'polygone', coords: _tPoly(914, 4.12, 47.78, 0.55, 0.42) },
      { id: 'sage-aisne-vesle-suippe',  label: 'SAGE Aisne Vesle Suippe',               geometrie: 'polygone', coords: _tPoly(915, 4.62, 49.45, 0.70, 0.55) }
    ]
  },

  /* ── SCOT (23) ───────────────────────────────────────────────── */
  {
    id:    'scot',
    label: 'SCOT',
    color: TYPO_COLORS['SCOT'],
    icon:  'fa-compass-drafting',
    territoires: [
      { id: 'scot-aube',           label: 'SCOT des Territoires de l\'Aube',      geometrie: 'polygone', coords: _tPoly(1001, 4.15, 48.28, 0.75, 0.55) },
      { id: 'scot-sarreguemines',  label: 'SCOT de l\'arrondissement de Sarreguemines', geometrie: 'polygone', coords: _tPoly(1002, 7.05, 49.12, 0.55, 0.45) },
      { id: 'scot-bande-rhenane-nord', label: 'SCOT Bande Rhénane Nord',          geometrie: 'polygone', coords: _tPoly(1003, 7.88, 48.90, 0.48, 0.55) },
      { id: 'scot-rhin-vignoble',  label: 'SCOT Rhin-Vignoble-Grand-Ballon',      geometrie: 'polygone', coords: _tPoly(1004, 7.30, 47.90, 0.58, 0.62) },
      { id: 'scot-alsace-centrale',label: 'SCOT du PETR d\'Alsace Centrale',      geometrie: 'polygone', coords: _tPoly(1005, 7.48, 48.32, 0.52, 0.58) },
      { id: 'scot-colmar',         label: 'SCOT Colmar-Rhin-Vosges',              geometrie: 'polygone', coords: _tPoly(1006, 7.30, 48.10, 0.55, 0.50) },
      { id: 'scot-barrois',        label: 'SCOT du pays Barrois',                 geometrie: 'polygone', coords: _tPoly(1007, 5.15, 48.82, 0.60, 0.48) },
      { id: 'scot-messin',         label: 'SCOT de l\'Agglomération Messine',     geometrie: 'polygone', coords: _tPoly(1008, 6.18, 49.12, 0.52, 0.45) },
      { id: 'scot-epernay',        label: 'SCOT d\'Epernay et sa région',         geometrie: 'polygone', coords: _tPoly(1009, 3.97, 49.05, 0.48, 0.40) },
      { id: 'scot-ers',            label: 'SCOT Région de Strasbourg (SCOTERS)',  geometrie: 'polygone', coords: _tPoly(1010, 7.75, 48.57, 0.55, 0.60) },
      { id: 'scot-sundgau',        label: 'SCOT du PETR du Sundgau',              geometrie: 'polygone', coords: _tPoly(1011, 7.28, 47.72, 0.48, 0.42) },
      { id: 'scot-bruche-mossig',  label: 'SCOT Bruche-Mossig',                  geometrie: 'polygone', coords: _tPoly(1012, 7.32, 48.50, 0.50, 0.45) },
      { id: 'scot-remois',         label: 'SCOT de la Région Rémoise',            geometrie: 'polygone', coords: _tPoly(1013, 4.05, 49.27, 0.60, 0.50) },
      { id: 'scot-sud-meurthe',    label: 'SCOT Sud Meurthe-et-Moselle',          geometrie: 'polygone', coords: _tPoly(1014, 6.12, 48.42, 0.65, 0.52) },
      { id: 'scot-pays-thur',      label: 'SCOT Pays Thur Doller',               geometrie: 'polygone', coords: _tPoly(1015, 7.08, 47.82, 0.52, 0.45) },
      { id: 'scot-vosges-centrales',label: 'SCOT des Vosges centrales',           geometrie: 'polygone', coords: _tPoly(1016, 6.60, 48.20, 0.60, 0.62) },
      { id: 'scot-montagne-vignoble',label:'SCOT Montagne Vignoble Ried',         geometrie: 'polygone', coords: _tPoly(1017, 7.22, 48.22, 0.50, 0.55) },
      { id: 'scot-mulhouse',       label: 'SCOT Région mulhousienne',             geometrie: 'polygone', coords: _tPoly(1018, 7.30, 47.77, 0.52, 0.45) },
      { id: 'scot-piemont',        label: 'SCOT Piémont des Vosges',              geometrie: 'polygone', coords: _tPoly(1019, 7.43, 48.47, 0.52, 0.55) },
      { id: 'scot-scotan',         label: 'SCOTAN',                               geometrie: 'polygone', coords: _tPoly(1020, 6.20, 48.85, 0.65, 0.55) },
      { id: 'scot-saint-louis',    label: 'SCOT du pays de Saint Louis et des Trois Frontières', geometrie: 'polygone', coords: _tPoly(1021, 7.53, 47.60, 0.45, 0.38) },
      { id: 'scot-val-rosselle',   label: 'SCOT Val de Rosselle',                 geometrie: 'polygone', coords: _tPoly(1022, 6.95, 49.20, 0.48, 0.40) },
      { id: 'scot-saverne',        label: 'SCOT Région de Saverne',               geometrie: 'polygone', coords: _tPoly(1023, 7.37, 48.73, 0.52, 0.48) }
    ]
  },

  /* ── Communes ────────────────────────────────────────────────── */
  /* 5 115 communes Grand Est — issues de data-communes.js (COMMUNES_TERRITOIRES) */
  {
    id:         'commune',
    label:      'Commune',
    color:      TYPO_COLORS['Commune'],
    icon:       'fa-house-chimney',
    note:       '5 115 communes Grand Est',
    territoires: [] // rempli ci-dessous après déclaration
  }

]; // fin DONNEES_TERRITOIRES

// Note : les communes sont chargées de façon asynchrone par data-communes.js
// qui injecte COMMUNES_TERRITOIRES dans la catégorie 'commune' via l'événement 'communes:loaded'

console.log('[data-territoires] Chargé –', DONNEES_TERRITOIRES.length, 'catégories (communes en attente de chargement Excel)');
