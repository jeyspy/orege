/**
 * data-indicateurs-elu-v2.js
 * ═══════════════════════════════════════════════════════════════════════
 * V2 — Données indicateurs Tableau de bord Élu
 * Basé sur le fichier Excel "Indicateurs elus-en cours.xlsx"
 * Onglet unique : "Découvrir mon territoire (ELU)" — 138 lignes
 *
 * Nouvelle logique : 1 TUILE = N indicateurs (regroupés par col. D "Nom tuile")
 * ═══════════════════════════════════════════════════════════════════════
 */

// eslint-disable-next-line no-unused-vars
var SECTIONS_ELU_V2 = [
  { id: 'fiche-identite',        label: "Fiche d'identité",                   shortLabel: "Identité",       icon: 'ph-identification-card', color: '#1565C0' },
  { id: 'amenagement',           label: 'Aménagement du territoire et zonage', shortLabel: 'Aménagement',   icon: 'ph-map-trifold',         color: '#00796B' },
  { id: 'gouvernance',           label: 'Gouvernance et actions menées',       shortLabel: 'Gouvernance',   icon: 'ph-handshake',           color: '#6A1B9A' },
  { id: 'ressource-usage',       label: 'Ressource / usage / pression',       shortLabel: 'Ressources',    icon: 'ph-drop',                color: '#0277BD' },
  { id: 'vulnerabilite',         label: 'Vulnérabilité et risques',            shortLabel: 'Vulnérabilité', icon: 'ph-thermometer-hot',     color: '#D84315' }
];

// ══════════════════════════════════════════════════════════════════════
// TUILES — Chaque tuile agrège plusieurs indicateurs
// Les IDs (col H) correspondent au fichier Excel
// ══════════════════════════════════════════════════════════════════════

// eslint-disable-next-line no-unused-vars
var TUILES_ELU_V2 = {

  // ────────────────────────────────────────────────────────────────────
  // SECTION : Fiche d'identité (lignes 112-134)
  // ────────────────────────────────────────────────────────────────────
  'fiche-identite': [

    // ── TUILE : Nom du territoire (Hero) ──────────────────────────
    {
      tuile: 'Nom du territoire',
      zone: 'hero',
      indicateurs: [
        { id: 'TERRITOIRE_CARTO',  ligne: 112, nom: 'Représentation du territoire',  type: 'cartographie',  unite: '',           fakeValue: null },
        { id: 'TERRITOIRE_NOM',    ligne: 113, nom: 'Nom du territoire',             type: 'chiffre_cle',   unite: 'Nom',        fakeValue: 'Grand Est' },
        { id: 'TERRITOIRE_TYPE',   ligne: 114, nom: 'Typologie du territoire',       type: 'chiffre_cle',   unite: 'Typologie',  fakeValue: 'Région' },
        { id: 'TERRITOIRE_SURF',   ligne: 115, nom: 'Superficie',                    type: 'chiffre_cle',   unite: 'km²',        fakeValue: '57 441' },
        { id: 'TERRITOIRE_POP',    ligne: 116, nom: 'Population totale',             type: 'chiffre_cle',   unite: 'habitants',  fakeValue: '5 562 651' }
      ]
    },

    // ── TUILE : Démographie ───────────────────────────────────────
    {
      tuile: 'Démographie',
      zone: 'demographie',
      indicateurs: [
        { id: 'TERRITOIRE_DENSITE',       ligne: 117, nom: 'Densité',                          type: 'chiffre_cle',  unite: 'hab/km²',         fakeValue: '97' },
        { id: 'TERRITOIRE_RURALITE',       ligne: 118, nom: 'Ruralité',                         type: 'chiffre_cle',  unite: '',                fakeValue: 'Semi-rural' },
        { id: 'TERRITOIRE_POP_TENDANCE',   ligne: 119, nom: 'Évolution de la population totale', type: 'chiffre_cle',  unite: '%',               fakeValue: '+1.46',
          // Libellé de secours : en pratique la tendance est recalculée à partir de la courbe (1re → dernière année)
          fakeTrend: '+1.46% entre 2006 et 2023', fakeTrendDir: 'up' },
        { id: 'TERRITOIRE_POP_EVOL',       ligne: 120, nom: 'Évolution de la population totale', type: 'graphique',    unite: "Nombre d'habitants",
          graphType: 'line',
          fakeChartData: {
            labels: ['2006','2008','2010','2012','2014','2016','2018','2020','2022','2023'],
            values: [5.48, 5.50, 5.52, 5.53, 5.54, 5.55, 5.55, 5.56, 5.56, 5.56],
            colors: ['#1565C0']
          }
        }
      ]
    },

    // ── TUILE : Eaux superficielles ───────────────────────────────
    {
      tuile: 'Eaux superficielles',
      zone: 'ressources-superficielles',
      sousCategorie: 'Ressource en eau',
      indicateurs: [
        { id: 'COURS_EAU_LONG',                ligne: 121, nom: 'Linéaire de cours d\'eau',                                      type: 'chiffre_cle', unite: 'km',  fakeValue: '52 800' },
        { id: 'PLAN_EAU_NB',                   ligne: 122, nom: 'Nombre de plans d\'eau',                                        type: 'chiffre_cle', unite: '',    fakeValue: '1 842' },
        { id: 'ETAT_CHIM_MECE_RATIO_PAR_CAT',  ligne: 124, nom: 'Masses d\'eau superficielles en bon état chimique',             type: 'chiffre_cle', unite: '%',   fakeValue: '62' },
        { id: 'ETAT_ECO_MECE_RATIO_PAR_CAT',   ligne: 125, nom: 'Masses d\'eau superficielles en très bon et bon état écologique', type: 'chiffre_cle', unite: '%',   fakeValue: '44' }
      ]
    },

    // ── TUILE : Eaux souterraines ─────────────────────────────────
    {
      tuile: 'Eaux souterraines',
      zone: 'ressources-souterraines',
      sousCategorie: 'Ressource en eau',
      indicateurs: [
        { id: 'MESO_NB',                         ligne: 123, nom: 'Nombre de masses d\'eau souterraines',       type: 'chiffre_cle', unite: '',  fakeValue: '53' },
        { id: 'ETAT_CHIM_MESO_RATIO_PAR_CAT',    ligne: 126, nom: 'Masses d\'eau souterraines en bon état chimique',     type: 'chiffre_cle', unite: '%', fakeValue: '72' },
        { id: 'ETAT_QUANTI_MESO_RATIO_PAR_CAT',  ligne: 127, nom: 'Masses d\'eau souterraines en bon état quantitatif',  type: 'chiffre_cle', unite: '%', fakeValue: '89' }
      ]
    },

    // ── TUILE : Historique des prélèvements (pleine largeur) ──────
    {
      tuile: 'Historique des prélèvements',
      zone: 'prelevements',
      categorie: 'Usages et pressions',
      indicateurs: [
        { id: 'PREL_USAGE_PAR_CAT', ligne: 128, nom: 'Évolution des volumes prélevés',  type: 'graphique',   unite: 'm³',
          graphType: 'stacked_bar',
          description: 'Somme des volumes prélevés par type d\'usages (BNPE 2008-2023)',
          fakeChartData: {
            labels: ['2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023'],
            datasets: [
              { label: 'Usages agricoles',                     data: [85,88,92,90,88,91,95,93,90,94,98,100,102,99,96,94],    color: '#ED7D31' },
              { label: 'Usages industriels',                   data: [210,208,205,200,195,192,188,185,180,176,172,168,165,162,158,152], color: '#A5A5A5' },
              { label: 'Refroidissement centrales électriques', data: [420,418,415,410,405,402,398,392,385,378,370,362,355,348,340,332], color: '#4472C4' },
              { label: 'Alimentation des canaux',              data: [45,45,44,43,42,41,40,39,38,37,36,36,35,34,33,32],     color: '#FFC000' },
              { label: 'Production d\'eau potable',            data: [310,308,305,302,298,295,292,289,285,282,280,278,275,272,270,265], color: '#5B9BD5' }
            ]
          }
        },
        { id: 'PREL_ANNEE', ligne: 130, nom: 'Volume prélevé année N',  type: 'chiffre_cle', unite: 'Mm³', fakeValue: '875',
          description: 'Volume prélevé l\'année N' }
      ]
    },

    // ── TUILE : Services de l'eau ─────────────────────────────────
    {
      tuile: 'Services de l\'eau',
      zone: 'services',
      categorie: 'Usages et pressions',
      indicateurs: [
        { id: 'PRIX_AEP_CARTO', ligne: 131, nom: 'Prix de l\'eau',              type: 'chiffre_cle', unite: '€ TTC/m³', fakeValue: '4.32',
          description: '€/m³ pour une consommation moyenne de 120 m³' },
        { id: 'PRIX_AC_CARTO',  ligne: 132, nom: 'Prix de l\'assainissement',   type: 'chiffre_cle', unite: '€ TTC/m³', fakeValue: '2.18',
          description: '€/m³ pour une consommation moyenne de 120 m³' }
      ]
    },

    // ── TUILE : Captages ──────────────────────────────────────────
    {
      tuile: 'Captages',
      zone: 'captages',
      categorie: 'Usages et pressions',
      indicateurs: [
        { id: 'CAPTAGE_DEGRADE_NB', ligne: 133, nom: 'Captages dégradés',                    type: 'chiffre_cle', unite: '',   fakeValue: '134',
          description: 'Captages sensibles ou prioritaires sur le territoire (SDAGE)' },
        { id: 'AAC_RATIO',          ligne: 134, nom: 'Part du territoire couvert par une AAC', type: 'chiffre_cle', unite: '%',  fakeValue: '28.6' }
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────
  // SECTION : Aménagement du territoire et zonage (lignes 2-23)
  // ────────────────────────────────────────────────────────────────────
  'amenagement': [

    // ── TUILE : Zones humides effectives (L2-L6) ─────────────────
    {
      tuile: 'Zones humides effectives',
      zone: 'zones-humides',
      categorie: 'Zonages',
      indicateurs: [
        { id: 'ZH_NB',            ligne: 2,  nom: 'Nombre de zones humides',                        type: 'chiffre_cle',  unite: '',   fakeValue: '—', description: 'En attente des données' },
        { id: 'ZH_CARTO',         ligne: 3,  nom: 'Répartition des zones humides',                  type: 'cartographie', unite: '',   fakeValue: null },
        { id: 'ZH_SURF',          ligne: 4,  nom: 'Surface de zones humides',                       type: 'chiffre_cle',  unite: 'ha', fakeValue: '—' },
        { id: 'ZH_RATIO_PAR_CAT', ligne: 5,  nom: 'Typologie des zones humides',                    type: 'graphique',    unite: '%',  fakeValue: null, graphType: 'donut' },
        { id: 'ZH_RATIO',         ligne: 6,  nom: 'Pourcentage de territoire couvert par une ZH',   type: 'chiffre_cle',  unite: '%',  fakeValue: '—' }
      ],
      enAttente: true
    },

    // ── TUILE : Sites RAMSAR (L8-L10) ─────────────────────────────
    {
      tuile: 'Sites RAMSAR',
      zone: 'ramsar',
      categorie: 'Zonages',
      indicateurs: [
        { id: 'RAMSAR_CARTO', ligne: 8,  nom: 'Répartition des sites RAMSAR',  type: 'cartographie', unite: '',   fakeValue: null },
        { id: 'RAMSAR_NB',    ligne: 9,  nom: 'Nombre de sites RAMSAR',        type: 'chiffre_cle',  unite: '',   fakeValue: '2' },
        { id: 'RAMSAR_SURF',  ligne: 10, nom: 'Superficie des sites RAMSAR',   type: 'chiffre_cle',  unite: 'ha', fakeValue: '50' }
      ],
      fakeLabels: ['Étang de Lindre et forêts', 'Rhin supérieur / Oberrhein']
    },

    // ── TUILE : Zones de répartition des eaux ZRE (L12-L14) ──────
    {
      tuile: 'Zones de répartition des eaux (ZRE)',
      zone: 'zre',
      categorie: 'Zonages',
      indicateurs: [
        { id: 'ZRE_CARTO', ligne: 12, nom: 'Répartition des ZRE',                  type: 'cartographie', unite: '',  fakeValue: null },
        { id: 'ZRE_NB',    ligne: 13, nom: 'Nombre de ZRE',                        type: 'chiffre_cle',  unite: '',  fakeValue: '2' },
        { id: 'ZRE_RATIO', ligne: 14, nom: 'Part du territoire couvert par une ZRE', type: 'chiffre_cle',  unite: '%', fakeValue: '20' }
      ],
      fakeTypes: ['ZRE Superficielle', 'ZRE Souterraine']
    },

    // ── TUILE : Occupation du sol (L15-L16) ───────────────────────
    {
      tuile: 'Occupation du sol',
      zone: 'occupation-sol',
      categorie: 'Aménagements',
      indicateurs: [
        { id: 'OCS_CARTO',          ligne: 15, nom: 'Répartition des types d\'occupation du sol', type: 'lien_externe', unite: '', fakeValue: null,
          url: 'https://ocs.datagrandest.fr' },
        { id: 'OCS_RATIO_PAR_CAT',  ligne: 16, nom: 'Typologie de l\'occupation du sol', type: 'graphique', unite: '%', fakeValue: null,
          graphType: 'treemap',
          fakeChartData: {
            labels: ['Milieux naturels liés à l\'eau', 'Surface en eau', 'Emprise agricole', 'Espaces boisés', 'Espaces urbanisés'],
            values: [35, 12, 28, 18, 7],
            colors: ['#1565C0', '#4FC3F7', '#8BC34A', '#2E7D32', '#D84315']
          }
        }
      ]
    },

    // ── TUILE : Zones sensibles assainissement (L20-L21) ──────────
    {
      tuile: 'Zones sensibles (Assainissement collectif)',
      zone: 'zones-sensibles',
      categorie: 'Aménagements',
      indicateurs: [
        { id: 'ZONE_SENSIBLE_CARTO', ligne: 20, nom: 'Répartition des zones sensibles', type: 'cartographie', unite: '',  fakeValue: null },
        { id: 'ZONE_SENSIBLE_RATIO', ligne: 21, nom: 'Part du territoire couvert',       type: 'chiffre_cle',  unite: '%', fakeValue: '100' }
      ]
    },

    // ── TUILE : Obstacles à l'écoulement (L22-L23) ────────────────
    {
      tuile: 'Obstacles à l\'écoulement',
      zone: 'obstacles',
      categorie: 'Aménagements',
      indicateurs: [
        { id: 'OBST_ECOUL_NB',           ligne: 22, nom: 'Nombre d\'obstacles à l\'écoulement', type: 'chiffre_cle', unite: '', fakeValue: '40' },
        { id: 'OBST_ECOUL_NB_PART_CAT',  ligne: 23, nom: 'Typologie d\'obstacles',              type: 'graphique',   unite: '', fakeValue: null,
          graphType: 'horizontal_bar',
          fakeChartData: {
            labels: ['Barrages', 'Seuils en rivi\u00e8re', 'Digues', 'Obstacles induits par un pont', '\u00c9pis'],
            values: [8, 15, 7, 6, 4],
            colors: ['#D84315', '#1565C0', '#00796B', '#6A1B9A', '#f5a623'],
            icons:  ['ph-barricade', 'ph-waves', 'ph-wall', 'ph-bridge', 'ph-arrows-out-line-vertical']
          }
        }
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────
  // SECTION : Ressource / usage / pression (lignes 43-63)
  // Sous-sections : Eaux superficielles + Eaux souterraines
  // ────────────────────────────────────────────────────────────────────
  'ressource-usage': [

    // ── TUILE : Hydrologie (L43-L47, L50-L56) ─ pleine largeur ──────
    {
      tuile: 'Hydrologie',
      zone: 'hydrologie',
      sousCategorie: 'Eaux superficielles',
      indicateurs: [
        { id: 'HYDRO_CARTO_MOY',     ligne: 50, nom: 'Cartographie hydrologie moyenne',    type: 'cartographie', unite: '',     fakeValue: null },
        { id: 'HYDRO_MODULE',         ligne: 51, nom: 'Module (1995-2024)',                 type: 'chiffre_cle',  unite: 'm³/s', fakeValue: '142' },
        { id: 'HYDRO_DEBIT_MOY',      ligne: 52, nom: 'Hydrologie moyenne',                type: 'chiffre_cle',  unite: '',     fakeValue: 'TB',
          description: 'État hydrologie moyenne' },
        { id: 'HYDRO_DEBIT_2025',     ligne: 53, nom: 'Débit 2025',                        type: 'chiffre_cle',  unite: 'm³/s', fakeValue: '128' },
        { id: 'HYDRO_QNMA5',          ligne: 54, nom: 'QMNA 5',                            type: 'chiffre_cle',  unite: 'm³/s', fakeValue: '38.5' },
        { id: 'HYDRO_CARTO_ETIAGE',   ligne: 55, nom: 'Cartographie hydrologie d\'étiage', type: 'cartographie', unite: '',     fakeValue: null },
        { id: 'HYDRO_ETIAGE_TENDANCE', ligne: 56, nom: 'Tendance étiage',                  type: 'chiffre_cle',  unite: '',     fakeValue: 'Hausse',
          fakeTrendDir: 'up', fakeTrend: 'Tendance à la hausse' }
      ],
      // ── Stations hydrométriques fake pour les cartes OL ──
      fakeStations: {
        // Hydrologie moyenne : stations avec état coloré (TB/B/Moyen/Médiocre)
        moyenne: [
          { nom: 'Moselle à Custines',       coord: [6.15, 48.79], debit2025: '128', module: '142', etat: 'TB',       etatColor: '#7B1FA2', etatLabel: 'Tr\u00e8s bon', tendance: 'down', tendanceLabel: 'Baisse' },
          { nom: 'Meurthe à Laneuveville',   coord: [6.21, 48.63], debit2025: '34.5', module: '38.2', etat: 'TB',     etatColor: '#7B1FA2', etatLabel: 'Tr\u00e8s bon', tendance: 'neutral', tendanceLabel: 'Stable' },
          { nom: 'Meuse à Stenay',           coord: [5.19, 49.49], debit2025: '62.4', module: '71.8', etat: 'B',      etatColor: '#4CAF50', etatLabel: 'Bon', tendance: 'down', tendanceLabel: 'Baisse' },
          { nom: 'Marne à Saint-Dizier',     coord: [4.95, 48.64], debit2025: '41.2', module: '45.6', etat: 'Moyen',  etatColor: '#FFC107', etatLabel: 'Moyen', tendance: 'down', tendanceLabel: 'Baisse' },
          { nom: 'Rhin à Strasbourg',        coord: [7.75, 48.57], debit2025: '1 080', module: '1 060', etat: 'TB',   etatColor: '#7B1FA2', etatLabel: 'Tr\u00e8s bon', tendance: 'up', tendanceLabel: 'Hausse' },
          { nom: 'Ill à Strasbourg',         coord: [7.74, 48.58], debit2025: '52.8', module: '56.1', etat: 'B',      etatColor: '#4CAF50', etatLabel: 'Bon', tendance: 'neutral', tendanceLabel: 'Stable' },
          { nom: 'Sarre à Sarrebourg',       coord: [7.05, 48.74], debit2025: '18.4', module: '21.0', etat: 'Moyen',  etatColor: '#FFC107', etatLabel: 'Moyen', tendance: 'down', tendanceLabel: 'Baisse' }
        ],
        // Hydrologie d'étiage : stations avec QMNA 5
        etiage: [
          { nom: 'Moselle à Custines',       coord: [6.15, 48.79], qnma: '38.5', qnmaPeriode: '2020-2025', tendance: 'up',   tendanceLabel: 'Hausse' },
          { nom: 'Meuse à Stenay',           coord: [5.19, 49.49], qnma: '12.4', qnmaPeriode: '2020-2025', tendance: 'up',   tendanceLabel: 'Hausse' },
          { nom: 'Marne à Saint-Dizier',     coord: [4.95, 48.64], qnma: '8.7',  qnmaPeriode: '2020-2025', tendance: 'down', tendanceLabel: 'Baisse' },
          { nom: 'Rhin à Strasbourg',        coord: [7.75, 48.57], qnma: '425',  qnmaPeriode: '2020-2025', tendance: 'up',   tendanceLabel: 'Hausse' },
          { nom: 'Sarre à Sarrebourg',       coord: [7.05, 48.74], qnma: '4.2',  qnmaPeriode: '2020-2025', tendance: 'up',   tendanceLabel: 'Hausse' }
        ]
      }
    },

    // ── TUILE : Caractéristiques eaux superficielles (L47-L49) ──────
    {
      tuile: 'Caractéristiques',
      zone: 'caract-surface',
      sousCategorie: 'Eaux superficielles',
      indicateurs: [
        { id: 'SURF_COURS_EAU',      ligne: 49, nom: 'Cours d\'eau',                       type: 'chiffre_cle', unite: 'km',  fakeValue: '52 800' },
        { id: 'SURF_PLANS_EAU_NB',   ligne: 47, nom: 'Plans d\'eau',                       type: 'chiffre_cle', unite: '',    fakeValue: '1 842' },
        { id: 'SURF_PLANS_EAU_SURF', ligne: 48, nom: 'Superficie totale des plans d\'eau', type: 'chiffre_cle', unite: 'ha',  fakeValue: '12 500' }
      ]
    },

    // ── TUILE : État des ressources superficielles (L59-L60) ────────
    {
      tuile: 'État des ressources',
      zone: 'etat-surface',
      sousCategorie: 'Eaux superficielles',
      indicateurs: [
        { id: 'ETAT_ECO_SURF',  ligne: 59, nom: 'État écologique',  type: 'graphique', unite: '%', fakeValue: null,
          graphType: 'pie',
          description: 'État des lieux Directive cadre sur l\'eau 2025',
          fakeChartData: {
            labels: ['Très bon', 'Bon', 'Moyen', 'Médiocre', 'Mauvais'],
            values: [0.5, 32.2, 37.8, 17.9, 11.6],
            colors: ['#1565C0', '#4CAF50', '#FFC107', '#FF9800', '#F44336']
          }
        },
        { id: 'ETAT_CHIM_SURF', ligne: 60, nom: 'État chimique',    type: 'graphique', unite: '%', fakeValue: null,
          graphType: 'pie',
          description: 'État des lieux Directive cadre sur l\'eau 2025',
          fakeChartData: {
            labels: ['Bon état', 'Mauvais état'],
            values: [22.3, 77.7],
            colors: ['#1565C0', '#F44336']
          }
        }
      ]
    },

    // ── TUILE : Caractéristiques eaux souterraines (L61) ────────────
    {
      tuile: 'Caractéristiques',
      zone: 'caract-souterrain',
      sousCategorie: 'Eaux souterraines',
      indicateurs: [
        { id: 'SOUT_MESO_NB',   ligne: 61, nom: 'Nombre de masses d\'eau',  type: 'chiffre_cle', unite: '',  fakeValue: '53' },
        { id: 'SOUT_MESO_NOMS', ligne: 61, nom: 'Nom des masses d\'eau',    type: 'liste',       unite: '',  fakeValue: null }
      ],
      fakeLabels: ['Grès du Trias inférieur', 'Calcaires du Dogger', 'Alluvions de la Moselle', 'Calcaires du Muschelkalk']
    },

    // ── TUILE : État des ressources souterraines (L62-L63) ──────────
    {
      tuile: 'État des ressources',
      zone: 'etat-souterrain',
      sousCategorie: 'Eaux souterraines',
      indicateurs: [
        // 2 classes uniquement : Bon / Médiocre (cf. tableau indicateurs élus, ETAT_QUANTI_MESO_RATIO_PAR_CAT — référentiel Sandre 650)
        // Valeur Grand Est cohérente avec la Fiche d'identité (89 % en bon état quantitatif)
        { id: 'ETAT_QUANTI_SOUT', ligne: 62, nom: 'État quantitatif', type: 'graphique', unite: '%', fakeValue: null,
          graphType: 'pie',
          description: 'État des lieux Directive cadre sur l\'eau 2025',
          fakeChartData: {
            labels: ['Bon', 'Médiocre'],
            values: [89, 11],
            colors: ['#1565C0', '#FFC107']
          }
        },
        { id: 'ETAT_CHIM_SOUT',  ligne: 63, nom: 'État chimique',    type: 'graphique', unite: '%', fakeValue: null,
          graphType: 'pie',
          description: 'État des lieux Directive cadre sur l\'eau 2025',
          fakeChartData: {
            labels: ['Bon état', 'Mauvais état'],
            values: [22.3, 77.7],
            colors: ['#1565C0', '#F44336']
          }
        }
      ]
    },

    // ── TUILE : Piézométrie (L57-L58) ───────────────────────────────
    {
      tuile: 'Piézométrie',
      zone: 'piezometrie',
      sousCategorie: 'Eaux souterraines',
      indicateurs: [
        { id: 'PIEZO_CARTO',     ligne: 57, nom: 'Cartographie piézométrie',  type: 'cartographie', unite: '',  fakeValue: null },
        { id: 'PIEZO_TENDANCE',  ligne: 58, nom: 'Tendance piézométrique',    type: 'chiffre_cle',  unite: '',  fakeValue: 'Stable',
          fakeTrendDir: 'neutral', fakeTrend: 'Tendance stable' }
      ],
      fakeStations: [
        { nom: 'Pi\u00e9zom\u00e8tre Gr\u00e8s du Trias \u2014 Lun\u00e9ville',     coord: [6.50, 48.59], nappe: 'Gr\u00e8s du Trias inf\u00e9rieur',      niveau: '182.4 m NGF', tendance: 'neutral', tendanceLabel: 'Stable' },
        { nom: 'Pi\u00e9zom\u00e8tre Dogger \u2014 Bar-le-Duc',           coord: [5.16, 48.77], nappe: 'Calcaires du Dogger',           niveau: '210.1 m NGF', tendance: 'down',    tendanceLabel: 'Baisse' },
        { nom: 'Pi\u00e9zom\u00e8tre Alluvions \u2014 Metz',              coord: [6.18, 49.12], nappe: 'Alluvions de la Moselle',       niveau: '164.8 m NGF', tendance: 'up',      tendanceLabel: 'Hausse' },
        { nom: 'Pi\u00e9zom\u00e8tre Muschelkalk \u2014 Haguenau',        coord: [7.79, 48.82], nappe: 'Calcaires du Muschelkalk',      niveau: '135.6 m NGF', tendance: 'neutral', tendanceLabel: 'Stable' },
        { nom: 'Pi\u00e9zom\u00e8tre Alluvions Rhin \u2014 Colmar',       coord: [7.36, 48.08], nappe: 'Alluvions du Rhin',             niveau: '192.3 m NGF', tendance: 'up',      tendanceLabel: 'Hausse' }
      ]
    },

    // ────────────────────────────────────────────────────────────────────
    // BLOC : Usages de l'eau & pressions (lignes 69-83 Excel)
    // Sous-onglets filles : Eau potable, Assainissement, Agriculture,
    //                       Industrie (à venir), Loisirs (à venir)
    // ────────────────────────────────────────────────────────────────────

    // ══════════════════════════════════════════════════════════════════
    // SOUS-ONGLET : EAU POTABLE
    // ══════════════════════════════════════════════════════════════════

    // ── TUILE : Prix de l'eau (L80) ─────────────────────────────────
    {
      tuile: 'Prix de l\'eau',
      zone: 'prix-eau',
      sousOnglet: 'eau-potable',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'GOV_PRIX_EAU',      ligne: 80, nom: 'Prix de l\'eau',                          type: 'chiffre_cle',   unite: '\u20ac TTC/m\u00b3', fakeValue: '1.89',
          description: 'Prix du service d\'eau potable au 1er janvier 2024 en 2023' },
        { id: 'GOV_PRIX_EAU_DEPT', ligne: 80, nom: 'Moyenne D\u00e9partement',                type: 'chiffre_cle',   unite: '\u20ac TTC/m\u00b3', fakeValue: '2.43' },
        { id: 'GOV_PRIX_EAU_REG',  ligne: 80, nom: 'Moyenne R\u00e9gion',                     type: 'chiffre_cle',   unite: '\u20ac TTC/m\u00b3', fakeValue: '2.22' },
        { id: 'GOV_PRIX_EAU_FR',   ligne: 80, nom: 'Moyenne France',                          type: 'chiffre_cle',   unite: '\u20ac TTC/m\u00b3', fakeValue: '2.32' },
        { id: 'GOV_LIEN_SISPEA_EP', ligne: 80, nom: 'Lien SISPEA',                            type: 'lien_externe',  unite: '',                    fakeValue: null,
          url: 'https://www.services.eaufrance.fr/' }
      ]
    },

    // ── TUILE : Rendement du réseau d'eau potable (L79) ─────────────
    {
      tuile: 'Rendement du r\u00e9seau d\'eau potable',
      zone: 'rendement-reseau',
      sousOnglet: 'eau-potable',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'GOV_REND_CARTO',  ligne: 79, nom: 'Cartographie du rendement r\u00e9seau',   type: 'cartographie',  unite: '',  fakeValue: null },
        { id: 'GOV_REND_MIN',    ligne: 79, nom: 'Rendement minimum',                        type: 'chiffre_cle',   unite: '%', fakeValue: '52' },
        { id: 'GOV_REND_MAX',    ligne: 79, nom: 'Rendement maximum',                        type: 'chiffre_cle',   unite: '%', fakeValue: '94' },
        { id: 'GOV_REND_MOY',    ligne: 79, nom: 'Rendement moyen',                          type: 'chiffre_cle',   unite: '%', fakeValue: '78.5' },
        { id: 'GOV_REND_GE',     ligne: 79, nom: 'Comparatif Grand Est',                     type: 'chiffre_cle',   unite: '%', fakeValue: '76.2' }
      ]
    },

    // ── TUILE : Aires d'alimentation de captage AAC (L81-L82) ───────
    {
      tuile: 'Aires d\'alimentation de captage (AAC)',
      zone: 'aac-gov',
      sousOnglet: 'eau-potable',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'GOV_AAC_CARTO',     ligne: 82, nom: 'Cartographie des AAC',                   type: 'cartographie',  unite: '',  fakeValue: null },
        { id: 'GOV_AAC_COUV',      ligne: 81, nom: 'Couverture du territoire',               type: 'chiffre_cle',   unite: '%', fakeValue: '20' }
      ]
    },

    // ── TUILE : Captages dégradés (L83) ─────────────────────────────
    {
      tuile: 'Captages d\u00e9grad\u00e9s',
      zone: 'captages-degrades',
      sousOnglet: 'eau-potable',
      sousCategorie: 'Usages',
      // cf. tableau indicateurs élus : CAPTAGE_DEGRADE_NB (chiffre clé) + CAPTAGE_DEGRADE_NB_PAR_CAT (camembert, unité « Nombre »)
      indicateurs: [
        { id: 'CAPTAGE_DEGRADE_NB', ligne: 83, nom: 'Nombre de captages d\u00e9grad\u00e9s', type: 'chiffre_cle', unite: 'captages', fakeValue: '134' },
        { id: 'GOV_CAPT_DEG_PIE',  ligne: 83, nom: 'R\u00e9partition des captages d\u00e9grad\u00e9s par cause de d\u00e9gradation', type: 'graphique', unite: 'Nombre', fakeValue: null,
          graphType: 'pie',
          fakeChartData: {
            // 4 catégories demandées ; valeurs en nombre de captages (total = 134, cohérent avec la Fiche d'identité)
            labels: ['Nitrates', 'Pesticides', 'Nitrates et pesticides', 'Non indiqu\u00e9'],
            values: [52, 38, 31, 13],
            colors: ['#1565C0', '#F57F17', '#7B1FA2', '#90A4AE']
          }
        }
      ]
    },

    // ── TUILE : Historique des prélèvements en eau potable (L77) ────
    {
      tuile: 'Historique des pr\u00e9l\u00e8vements en eau potable',
      zone: 'prelevements-ep',
      sousOnglet: 'eau-potable',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'GOV_PREL_EP_HIST',  ligne: 77, nom: '\u00c9volution des volumes pr\u00e9lev\u00e9s (eau potable)', type: 'graphique', unite: 'm\u00b3',
          graphType: 'stacked_bar',
          fakeChartData: {
            labels: ['2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023'],
            datasets: [
              { label: 'Eau souterraine',    data: [185,184,182,180,178,177,175,173,171,170,168,167,165,164,162,159], color: '#0277BD' },
              { label: 'Eau superficielle',  data: [125,124,123,122,120,119,117,116,114,113,112,111,110,109,108,106], color: '#4FC3F7' }
            ]
          }
        },
        { id: 'GOV_PREL_EP_VOL',   ligne: 77, nom: 'Volume pr\u00e9lev\u00e9 Ann\u00e9e N-3', type: 'chiffre_cle', unite: 'Mm\u00b3', fakeValue: '265' }
      ]
    },

    // ══════════════════════════════════════════════════════════════════
    // SOUS-ONGLET : ASSAINISSEMENT
    // ══════════════════════════════════════════════════════════════════

    // ── TUILE : Prix de l'assainissement collectif (L76) ────────────
    {
      tuile: 'Prix de l\'assainissement collectif',
      zone: 'prix-assainissement',
      sousOnglet: 'assainissement',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'GOV_PRIX_ASSAIN',      ligne: 76, nom: 'Prix de l\'assainissement collectif',   type: 'chiffre_cle',   unite: '\u20ac TTC/m\u00b3', fakeValue: '1.63',
          description: 'Prix du service d\'assainissement au 1er janvier 2024 en 2023' },
        { id: 'GOV_PRIX_ASSAIN_DEPT', ligne: 76, nom: 'Moyenne D\u00e9partement',              type: 'chiffre_cle',   unite: '\u20ac TTC/m\u00b3', fakeValue: '2.35' },
        { id: 'GOV_PRIX_ASSAIN_REG',  ligne: 76, nom: 'Moyenne R\u00e9gion',                   type: 'chiffre_cle',   unite: '\u20ac TTC/m\u00b3', fakeValue: '2.08' },
        { id: 'GOV_PRIX_ASSAIN_FR',   ligne: 76, nom: 'Moyenne France',                        type: 'chiffre_cle',   unite: '\u20ac TTC/m\u00b3', fakeValue: '2.39' },
        { id: 'GOV_LIEN_SISPEA_AC',   ligne: 76, nom: 'Lien SISPEA',                          type: 'lien_externe',  unite: '',                    fakeValue: null,
          url: 'https://www.services.eaufrance.fr/' }
      ]
    },

    // ── TUILE : Stations d'épuration (L73, L75) ─────────────────────
    {
      tuile: 'Stations d\'\u00e9puration',
      zone: 'stations-epuration',
      sousOnglet: 'assainissement',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'GOV_STEP_CARTO',     ligne: 73, nom: 'Cartographie des stations d\'\u00e9puration', type: 'cartographie', unite: '',     fakeValue: null },
        { id: 'GOV_STEP_NB',        ligne: 73, nom: 'Nombre de stations',                         type: 'chiffre_cle',  unite: '',     fakeValue: '142' },
        { id: 'GOV_STEP_CAP_TOT',   ligne: 73, nom: 'Capacit\u00e9 totale',                       type: 'chiffre_cle',  unite: 'EH',   fakeValue: '2 450 000' },
        { id: 'GOV_STEP_REUT',      ligne: 75, nom: 'Existance d\'un projet de REUT',             type: 'chiffre_cle',  unite: '',     fakeValue: '12 stations',
          description: 'Nombre de stations avec un projet de r\u00e9utilisation des eaux us\u00e9es trait\u00e9es' }
      ],
      fakeStations: [
        { nom: 'STEP Metz - La Maxe',       coord: [6.17, 49.13], capacite: '450 000 EH', reut: 'oui' },
        { nom: 'STEP Strasbourg - La Wantzenau', coord: [7.78, 48.64], capacite: '900 000 EH', reut: 'non' },
        { nom: 'STEP Nancy - Maxéville',     coord: [6.16, 48.71], capacite: '380 000 EH', reut: 'oui' },
        { nom: 'STEP Reims - Boulingrin',    coord: [3.93, 49.26], capacite: '310 000 EH', reut: 'non' },
        { nom: 'STEP Mulhouse - Île Napoléon', coord: [7.30, 47.76], capacite: '280 000 EH', reut: 'non' }
      ]
    },

    // ══════════════════════════════════════════════════════════════════
    // SOUS-ONGLET : AGRICULTURE
    // ══════════════════════════════════════════════════════════════════

    // ── TUILE : Caractérisation des surfaces agricoles (L69, L70, L72)
    {
      tuile: 'Caract\u00e9risation des surfaces agricoles',
      zone: 'surfaces-agricoles',
      sousOnglet: 'agriculture',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'GOV_AGRI_CARTO',       ligne: 69, nom: 'Localisation des surfaces cultiv\u00e9es par type de culture', type: 'cartographie', unite: '',  fakeValue: null },
        { id: 'GOV_AGRI_COUV_PIE',    ligne: 70, nom: '% de couverture par type de culture',                          type: 'graphique',    unite: '%', fakeValue: null,
          graphType: 'pie',
          fakeChartData: {
            labels: ['C\u00e9r\u00e9ales', 'Ol\u00e9agineux', 'Prairies permanentes', 'Vignoble', 'Cultures industrielles'],
            values: [42, 15, 22, 12, 9],
            colors: ['#F57F17', '#8BC34A', '#4CAF50', '#7B1FA2', '#0288D1']
          }
        },
        { id: 'GOV_AGRI_SAU_IRRIG',   ligne: 72, nom: 'Part de SAU irrigu\u00e9es',                                  type: 'chiffre_cle',  unite: '%', fakeValue: '5' }
      ]
    },

    // ── TUILE : Historique des prélèvements en agriculture (L71) ────
    {
      tuile: 'Historique des pr\u00e9l\u00e8vements en agriculture',
      zone: 'prelevements-agri',
      sousOnglet: 'agriculture',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'GOV_PREL_AGRI_HIST', ligne: 71, nom: '\u00c9volution des volumes pr\u00e9lev\u00e9s (agriculture)', type: 'graphique', unite: 'm\u00b3',
          graphType: 'stacked_bar',
          fakeChartData: {
            labels: ['2008','2010','2012','2014','2016','2018','2020','2022','2023'],
            datasets: [
              { label: 'Eaux souterraines',  data: [62,66,64,68,65,70,73,69,67],  color: '#0277BD' },
              { label: 'Eaux de surface',    data: [50,55,52,57,54,58,61,57,55],   color: '#4FC3F7' }
            ]
          }
        },
        { id: 'GOV_PREL_AGRI_VOL', ligne: 71, nom: 'Volume pr\u00e9lev\u00e9 Ann\u00e9e N',  type: 'chiffre_cle', unite: 'Mm\u00b3', fakeValue: '7' }
      ]
    },

    // ── TUILE : Installations classées — ICPE (L65) ──────────────────
    {
      tuile: 'Installations class\u00e9es',
      zone: 'icpe',
      sousOnglet: 'industrie',
      sousCategorie: 'Usages',
      indicateurs: [
        // 3 catégories (demande client) ; unité « Pourcentage » (cf. tableau indicateurs élus, ICPE_NB_PAR_CAT)
        { id: 'ICPE_NB_PAR_CAT', ligne: 65, nom: 'R\u00e9partition des ICPE (Non Seveso / Seveso seuil bas / Seveso seuil haut)', type: 'graphique', unite: '%', fakeValue: null,
          graphType: 'pie',
          fakeChartData: {
            labels: ['Non Seveso', 'Seveso seuil bas', 'Seveso seuil haut'],
            values: [91, 5, 4],
            colors: ['#1565C0', '#FFA726', '#C62828']
          }
        }
      ]
    },

    // ── TUILE : Sites et sols pollués (L66-67) ───────────────────────
    {
      tuile: 'Sites et sols pollu\u00e9s',
      zone: 'sites-pollues',
      sousOnglet: 'industrie',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'BASOL_NB', ligne: 66, nom: 'Nombre de sites et sols pollu\u00e9s', type: 'chiffre_cle', unite: '', fakeValue: '124' },
        { id: 'BASOL_CARTO', ligne: 67, nom: 'R\u00e9partition des sites et sols pollu\u00e9s', type: 'cartographie', unite: '', fakeValue: null }
      ],
      fakeSites: [
        { nom: 'Ancienne usine chimique Wittelsheim',  coord: [7.24, 47.81] },
        { nom: 'D\u00e9charge industrielle Stocamine', coord: [7.22, 47.83] },
        { nom: 'Friche Solvay Dombasle',               coord: [6.35, 48.63] },
        { nom: 'Site m\u00e9tallurgique Hayange',       coord: [6.07, 49.33] },
        { nom: 'Ancienne cokerie Carling',              coord: [6.72, 49.17] },
        { nom: 'D\u00e9p\u00f4t p\u00e9trolier Reichstett', coord: [7.72, 48.65] },
        { nom: 'Friche textile Mulhouse',               coord: [7.34, 47.75] },
        { nom: 'Site PCUK Wattwiller',                  coord: [7.17, 47.84] },
        { nom: 'Ancienne mine Sainte-Fontaine',         coord: [6.62, 49.22] },
        { nom: 'Terrain pollu\u00e9 Troyes-Sud',        coord: [4.08, 48.27] },
        { nom: 'D\u00e9charge Romilly-sur-Seine',       coord: [3.73, 48.51] },
        { nom: 'Site industriel Reims-Nord',            coord: [3.93, 49.28] }
      ]
    },

    // ── TUILE : Historique des prélèvements industriels (L68) ─────────
    {
      tuile: 'Historique des pr\u00e9l\u00e8vements industriels',
      zone: 'prelevements-industrie',
      sousOnglet: 'industrie',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'PREL_IND_PAR_CAT', ligne: 68, nom: '\u00c9volution des volumes pr\u00e9lev\u00e9s (industrie)', type: 'graphique', unite: 'm\u00b3',
          graphType: 'stacked_bar',
          fakeChartData: {
            labels: ['2008','2010','2012','2014','2016','2018','2020','2022','2023'],
            datasets: [
              { label: 'Eaux superficielles', data: [145,138,132,128,122,118,112,108,105], color: '#1565C0' },
              { label: 'Eaux souterraines',   data: [55,52,50,48,46,44,42,40,38],         color: '#00b4d8' }
            ]
          }
        },
        { id: 'PREL_IND_VOL', ligne: 68, nom: 'Volume pr\u00e9lev\u00e9 Ann\u00e9e N', type: 'chiffre_cle', unite: 'Mm\u00b3', fakeValue: '143' }
      ]
    },

    // ── TUILE : Sites de baignade (L84-87) ───────────────────────────
    {
      tuile: 'Sites de baignade',
      zone: 'sites-baignade',
      sousOnglet: 'loisirs',
      sousCategorie: 'Usages',
      indicateurs: [
        { id: 'SITE_BAIGNADE_NB', ligne: 86, nom: 'Nombre de sites de baignade', type: 'chiffre_cle', unite: '', fakeValue: '68' },
        { id: 'SITE_BAIGNADE_CARTO', ligne: 84, nom: 'R\u00e9partition des sites de baignade', type: 'cartographie', unite: '', fakeValue: null },
        { id: 'SITE_BAIGNADE_NB_PAR_CAT', ligne: 87, nom: 'Sites par classe de qualit\u00e9', type: 'graphique', unite: '', fakeValue: null,
          graphType: 'pie',
          fakeChartData: {
            labels: ['Excellent', 'Bon', 'Suffisant', 'Insuffisant'],
            values: [38, 18, 8, 2],
            colors: ['#007BB8', '#009B55', '#F58A1F', '#BA1C28']
          }
        }
      ],
      lienExterne: { label: 'Baignades Sant\u00e9', url: 'https://baignades.sante.gouv.fr/baignades/homeMap.do', icon: 'ph-link' },
      // Sites avec coordonnées et qualité (0-10, 10=Excellent, 0=Insuffisant)
      fakeSites: [
        { nom: 'Lac de G\u00e9rardmer',           coord: [6.86, 48.07], qualite: 9,  classe: 'Excellent', detail: 'Qualit\u00e9 excellente, eau claire et limpide' },
        { nom: 'Lac de Longemer',                  coord: [6.95, 48.06], qualite: 8,  classe: 'Excellent', detail: 'Qualit\u00e9 excellente, baignade surveill\u00e9e' },
        { nom: 'Plan d\u2019eau de Hanau',         coord: [7.38, 49.00], qualite: 7,  classe: 'Bon',       detail: 'Bonne qualit\u00e9 g\u00e9n\u00e9rale des eaux' },
        { nom: 'Base de loisirs du Lac Vert',      coord: [7.07, 48.09], qualite: 9,  classe: 'Excellent', detail: 'Qualit\u00e9 excellente, environnement pr\u00e9serv\u00e9' },
        { nom: 'Lac de Madine',                    coord: [5.72, 48.93], qualite: 6,  classe: 'Bon',       detail: 'Bonne qualit\u00e9, l\u00e9ger d\u00e9veloppement algal en \u00e9t\u00e9' },
        { nom: 'Lac du Der-Chantecoq',             coord: [4.75, 48.57], qualite: 7,  classe: 'Bon',       detail: 'Bonne qualit\u00e9, lac artificiel' },
        { nom: 'Plan d\u2019eau de la Li\u00e8ze', coord: [6.87, 47.63], qualite: 5,  classe: 'Suffisant', detail: 'Qualit\u00e9 suffisante, taux de nitrates surveill\u00e9' },
        { nom: 'Lac de Pierre-Perc\u00e9e',       coord: [6.93, 48.45], qualite: 8,  classe: 'Excellent', detail: 'Qualit\u00e9 excellente, lac de montagne' },
        { nom: 'Plan d\u2019eau de Bouzey',        coord: [6.30, 48.17], qualite: 4,  classe: 'Suffisant', detail: 'Qualit\u00e9 suffisante, eutrophisation mod\u00e9r\u00e9e' },
        { nom: 'Base nautique de Reims',           coord: [3.98, 49.22], qualite: 3,  classe: 'Insuffisant', detail: 'Qualit\u00e9 insuffisante, taux trop \u00e9lev\u00e9 de nitrate' }
      ]
    }
  ],

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 3 : GOUVERNANCE ET ACTIONS MENÉES (lignes 25-37)
  // ══════════════════════════════════════════════════════════════════════
  'gouvernance': [
    // ── TUILE : Arborescence Gouvernance de l'eau (lignes 25-32, 34-37) ──
    {
      tuile: "Gouvernance de l'eau",
      zone: 'gouvernance-arbre',
      categorie: 'Gouvernance',
      indicateurs: [
        { id: 'GOUV_ARBRE', ligne: 25, nom: "Arborescence Gouvernance de l'eau", type: 'liste', unite: '', fakeValue: null }
      ],
      // Arborescence à 4 niveaux — données fake par défaut (Grand Est)
      fakeTree: {
        niveaux: ['territoire', 'sous-categorie', 'type-structure', 'structure'],
        branches: [
          {
            id: 'grand-cycle', label: 'Grand cycle de l\u2019eau', icon: 'ph-waves',
            children: [
              {
                id: 'agences-eau', label: "Agences de l'eau", ligne: 25, icon: 'ph-buildings', count: 2,
                structures: [
                  { nom: 'Agence de l\u2019eau Rhin-Meuse', lien: 'template/cartographie.html?type=agence&id=rhin-meuse' },
                  { nom: 'Agence de l\u2019eau Seine-Normandie', lien: 'template/cartographie.html?type=agence&id=seine-normandie' }
                ]
              },
              {
                id: 'eptb-epage', label: 'EPTB / EPAGE', ligne: 26, icon: 'ph-flow-arrow', count: 8,
                structures: [
                  { nom: 'EPTB Meuse', lien: 'template/cartographie.html?type=eptb&territoire=grand-est' },
                  { nom: 'EPTB Moselle-Sarre', lien: 'template/cartographie.html?type=eptb&territoire=grand-est' },
                  { nom: 'EPAGE Ource-Seine', lien: 'template/cartographie.html?type=epage&territoire=grand-est' },
                  { nom: 'EPTB Marne', lien: 'template/cartographie.html?type=eptb&territoire=grand-est' },
                  { nom: 'EPAGE Largue', lien: 'template/cartographie.html?type=epage&territoire=grand-est' },
                  { nom: 'EPTB Seine Grands Lacs', lien: 'template/cartographie.html?type=eptb&territoire=grand-est' },
                  { nom: 'EPAGE Ill', lien: 'template/cartographie.html?type=epage&territoire=grand-est' },
                  { nom: 'EPTB Rhin', lien: 'template/cartographie.html?type=eptb&territoire=grand-est' }
                ]
              },
              {
                id: 'sage', label: 'SAGE', ligne: 32, icon: 'ph-scroll', count: 12,
                structures: [
                  { nom: 'SAGE Ill-Nappe-Rhin', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Bassin Houiller', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Nappe de la Craie', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Aisne-Vesle-Suippe', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Moder', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Giessen Liepvrette', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Nied', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Rupt de Mad', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Largue', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Doller', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Vair', lien: 'template/cartographie.html?type=sage&territoire=grand-est' },
                  { nom: 'SAGE Ornain', lien: 'template/cartographie.html?type=sage&territoire=grand-est' }
                ]
              },
              {
                id: 'gemapi', label: 'Collectivit\u00e9s comp\u00e9tentes en GEMAPI', ligne: 28, icon: 'ph-tree-structure', count: 97,
                children: [
                  {
                    id: 'gemapi-inondations', label: 'Pr\u00e9vention des inondations', ligne: 30, icon: 'ph-cloud-rain', count: 45,
                    structures: [
                      { nom: 'CC du Pays de Bitche', lien: 'template/cartographie.html?type=gemapi-pi&territoire=grand-est' },
                      { nom: 'Eurm\u00e9tropole de Strasbourg', lien: 'template/cartographie.html?type=gemapi-pi&territoire=grand-est' },
                      { nom: 'CC du Grand Nancy', lien: 'template/cartographie.html?type=gemapi-pi&territoire=grand-est' },
                      { nom: 'CA de Metz M\u00e9tropole', lien: 'template/cartographie.html?type=gemapi-pi&territoire=grand-est' },
                      { nom: 'CC du Val de Moder', lien: 'template/cartographie.html?type=gemapi-pi&territoire=grand-est' },
                      { nom: 'CC de la R\u00e9gion de Haguenau', lien: 'template/cartographie.html?type=gemapi-pi&territoire=grand-est' },
                      { nom: 'CC de Thann-Cernay', lien: 'template/cartographie.html?type=gemapi-pi&territoire=grand-est' }
                    ]
                  },
                  {
                    id: 'gemapi-milieux', label: 'Gestion des milieux aquatiques', ligne: 29, icon: 'ph-fish', count: 52,
                    structures: [
                      { nom: 'CC de la Plan\u00e8ze', lien: 'template/cartographie.html?type=gemapi-gma&territoire=grand-est' },
                      { nom: 'CA Mulhouse Alsace Agglom\u00e9ration', lien: 'template/cartographie.html?type=gemapi-gma&territoire=grand-est' },
                      { nom: 'CC du Pays Rhin-Brisach', lien: 'template/cartographie.html?type=gemapi-gma&territoire=grand-est' },
                      { nom: 'CC du Bassin de Pompey', lien: 'template/cartographie.html?type=gemapi-gma&territoire=grand-est' },
                      { nom: 'CC de S\u00e9lestat', lien: 'template/cartographie.html?type=gemapi-gma&territoire=grand-est' },
                      { nom: 'CC du Pays de Sarreguemines', lien: 'template/cartographie.html?type=gemapi-gma&territoire=grand-est' },
                      { nom: 'CC de la Vall\u00e9e de la Bruche', lien: 'template/cartographie.html?type=gemapi-gma&territoire=grand-est' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'petit-cycle', label: 'Petit cycle de l\u2019eau', icon: 'ph-recycle',
            children: [
              {
                id: 'agences-eau-pc', label: "Agences de l'eau", ligne: 25, icon: 'ph-buildings', count: 2,
                structures: [
                  { nom: 'Agence de l\u2019eau Rhin-Meuse', lien: 'template/cartographie.html?type=agence&id=rhin-meuse' },
                  { nom: 'Agence de l\u2019eau Seine-Normandie', lien: 'template/cartographie.html?type=agence&id=seine-normandie' }
                ]
              },
              {
                id: 'production-ep', label: "Collectivit\u00e9s comp\u00e9tentes en production d'eau potable", ligne: 34, icon: 'ph-factory', count: 68,
                structures: [
                  { nom: 'SI des Eaux de Colmar', lien: 'template/cartographie.html?type=prod-ep&territoire=grand-est' },
                  { nom: 'R\u00e9gie des eaux de Metz M\u00e9tropole', lien: 'template/cartographie.html?type=prod-ep&territoire=grand-est' },
                  { nom: 'SI de la R\u00e9gion de Saverne', lien: 'template/cartographie.html?type=prod-ep&territoire=grand-est' },
                  { nom: 'R\u00e9gie des eaux de Nancy', lien: 'template/cartographie.html?type=prod-ep&territoire=grand-est' },
                  { nom: 'SI des Eaux de Thionville', lien: 'template/cartographie.html?type=prod-ep&territoire=grand-est' },
                  { nom: 'R\u00e9gie des eaux de Reims', lien: 'template/cartographie.html?type=prod-ep&territoire=grand-est' },
                  { nom: 'SI des Eaux de Haguenau', lien: 'template/cartographie.html?type=prod-ep&territoire=grand-est' }
                ]
              },
              {
                id: 'distribution-ep', label: "Collectivit\u00e9s comp\u00e9tentes en distribution d'eau potable", ligne: 35, icon: 'ph-pipe', count: 112,
                structures: [
                  { nom: 'R\u00e9gie des eaux de Strasbourg', lien: 'template/cartographie.html?type=dist-ep&territoire=grand-est' },
                  { nom: 'SDEA (Bas-Rhin)', lien: 'template/cartographie.html?type=dist-ep&territoire=grand-est' },
                  { nom: 'SI des Eaux Vive Nancy', lien: 'template/cartographie.html?type=dist-ep&territoire=grand-est' },
                  { nom: 'R\u00e9gie des eaux de Mulhouse', lien: 'template/cartographie.html?type=dist-ep&territoire=grand-est' },
                  { nom: 'SI des Eaux de Troyes', lien: 'template/cartographie.html?type=dist-ep&territoire=grand-est' },
                  { nom: 'R\u00e9gie des eaux de Ch\u00e2lons-en-Champagne', lien: 'template/cartographie.html?type=dist-ep&territoire=grand-est' },
                  { nom: 'SI des Eaux de Verdun', lien: 'template/cartographie.html?type=dist-ep&territoire=grand-est' }
                ]
              },
              {
                id: 'assain-collectif', label: "Collectivit\u00e9s comp\u00e9tentes en assainissement collectif", ligne: 36, icon: 'ph-funnel', count: 95,
                structures: [
                  { nom: 'SDEA Assainissement (Bas-Rhin)', lien: 'template/cartographie.html?type=assain-c&territoire=grand-est' },
                  { nom: 'Communaut\u00e9 urbaine du Grand Reims', lien: 'template/cartographie.html?type=assain-c&territoire=grand-est' },
                  { nom: 'CA Metz M\u00e9tropole Assainissement', lien: 'template/cartographie.html?type=assain-c&territoire=grand-est' },
                  { nom: 'CA Mulhouse Alsace Agglom\u00e9ration', lien: 'template/cartographie.html?type=assain-c&territoire=grand-est' },
                  { nom: 'CC de Sarreguemines Confluences', lien: 'template/cartographie.html?type=assain-c&territoire=grand-est' },
                  { nom: 'CA d\u2019\u00c9pinal', lien: 'template/cartographie.html?type=assain-c&territoire=grand-est' },
                  { nom: 'CC du Grand Nancy', lien: 'template/cartographie.html?type=assain-c&territoire=grand-est' }
                ]
              },
              {
                id: 'assain-non-collectif', label: "Collectivit\u00e9s comp\u00e9tentes en assainissement non collectif", ligne: 37, icon: 'ph-house-line', count: 78,
                structures: [
                  { nom: 'SPANC Eurm\u00e9tropole de Strasbourg', lien: 'template/cartographie.html?type=assain-nc&territoire=grand-est' },
                  { nom: 'SPANC du Grand Nancy', lien: 'template/cartographie.html?type=assain-nc&territoire=grand-est' },
                  { nom: 'SPANC du Bassin de Pompey', lien: 'template/cartographie.html?type=assain-nc&territoire=grand-est' },
                  { nom: 'SPANC de Colmar Agglom\u00e9ration', lien: 'template/cartographie.html?type=assain-nc&territoire=grand-est' },
                  { nom: 'SPANC du Pays de Bitche', lien: 'template/cartographie.html?type=assain-nc&territoire=grand-est' },
                  { nom: 'SPANC de Thionville', lien: 'template/cartographie.html?type=assain-nc&territoire=grand-est' },
                  { nom: 'SPANC de Ch\u00e2lons-en-Champagne', lien: 'template/cartographie.html?type=assain-nc&territoire=grand-est' }
                ]
              }
            ]
          }
        ]
      }
    },

    // ── TUILE : État d'avancement du SAGE (ligne 33) ────────────────
    {
      tuile: '\u00c9tat d\u2019avancement du SAGE',
      zone: 'sage-avancement',
      categorie: 'Gouvernance',
      indicateurs: [
        { id: 'SAGE_MISE_OEUVRE',   ligne: 33, nom: 'Mise en \u0153uvre',              type: 'chiffre_cle', unite: '', fakeValue: '7' },
        { id: 'SAGE_REVISION',      ligne: 33, nom: 'dont en r\u00e9vision',           type: 'chiffre_cle', unite: '', fakeValue: '2' },
        { id: 'SAGE_ELABORATION',   ligne: 33, nom: '\u00c9laboration',                type: 'chiffre_cle', unite: '', fakeValue: '3' },
        { id: 'SAGE_INSTRUCTION',   ligne: 33, nom: 'Instruction',                     type: 'chiffre_cle', unite: '', fakeValue: '2' }
      ]
    },

    // ── TUILE : Contrats de milieux (lignes 38-39) ───────────────────
    {
      tuile: 'Contrats de milieux',
      zone: 'contrats-milieux',
      categorie: 'Actions men\u00e9es',
      indicateurs: [
        { id: 'ACT_CM_NOM',   ligne: 38, nom: 'Nom du contrat',             type: 'liste',       unite: '', fakeValue: 'Contrat de rivi\u00e8re Meuse amont' },
        { id: 'ACT_CM_COUV',  ligne: 38, nom: 'Couverture du territoire',   type: 'chiffre_cle', unite: '%', fakeValue: '42' },
        { id: 'ACT_CM_AVANC', ligne: 39, nom: 'Avancement de la proc\u00e9dure', type: 'graphique', unite: '', fakeValue: null,
          graphType: 'pie',
          fakeChartData: {
            labels: ['\u00c9laboration', 'Sign\u00e9 en cours d\u2019ex\u00e9cution', 'Achev\u00e9', 'Abandonn\u00e9'],
            values: [20, 55, 25, 0],
            colors: ['#1565C0', '#2E7D32', '#9E9E9E', '#C62828']
          }
        }
      ]
    },

    // ── TUILE : Projets de territoire pour la gestion de l'eau (lignes 40-41) ──
    {
      tuile: "Projets de territoire pour la gestion de l'eau",
      zone: 'projets-territoire',
      categorie: 'Actions men\u00e9es',
      indicateurs: [
        { id: 'ACT_PT_NB',    ligne: 40, nom: 'Nombre de projets de territoire', type: 'chiffre_cle', unite: '', fakeValue: '7' },
        { id: 'ACT_PT_COUV',  ligne: 40, nom: 'Couverture du territoire',   type: 'chiffre_cle', unite: '%', fakeValue: '38' },
        { id: 'ACT_PT_AVANC', ligne: 41, nom: 'Avancement de la proc\u00e9dure', type: 'graphique', unite: '', fakeValue: null,
          graphType: 'pie',
          fakeChartData: {
            labels: ['\u00c9mergence', '\u00c9tat des lieux et diagnostic', '\u00c9laboration, co-construction', 'Mise en \u0153uvre', 'R\u00e9vision', 'Achev\u00e9'],
            values: [10, 15, 20, 30, 15, 10],
            colors: ['#90CAF9', '#1565C0', '#F57F17', '#2E7D32', '#FF9800', '#9E9E9E']
          }
        }
      ]
    },

    // ── TUILE : Gestion des inondations (lignes 44-46) ───────────────
    {
      tuile: 'Gestion des inondations',
      zone: 'gestion-inondations',
      categorie: 'Actions men\u00e9es',
      indicateurs: [
        { id: 'ACT_GI_PLANS', ligne: 46, nom: 'Plans de pr\u00e9ventions existants sur le territoire', type: 'chiffre_cle', unite: '', fakeValue: '14' },
        { id: 'ACT_GI_SLGRI', ligne: 44, nom: 'Couverture du territoire par des proc\u00e9dures SLGRI', type: 'chiffre_cle', unite: '%', fakeValue: '62' }
      ]
    }
  ],

  // ════════════════════════════════════════════════════════════════════
  // SECTION 5 : VULNÉRABILITÉ ET RISQUES (lignes 84-105)
  // ════════════════════════════════════════════════════════════════════
  'vulnerabilite': [

    // ── TUILE : Évolution annuelle de la température (lignes 92-93-95) ──
    {
      tuile: '\u00c9volution annuelle de la temp\u00e9rature',
      zone: 'temp-annuelle',
      categorie: 'Temp\u00e9ratures & pr\u00e9cipitations',
      indicateurs: [
        { id: 'VULN_TEMP_MOY_N1',    ligne: 92,  nom: 'Temp\u00e9rature moyenne annuelle de l\u2019ann\u00e9e N-1',     type: 'chiffre_cle', unite: '\u00b0C',  fakeValue: '11.2' },
        { id: 'VULN_TEMP_REF',       ligne: 93,  nom: 'Temp\u00e9rature moyenne annuelle de r\u00e9f\u00e9rence',       type: 'chiffre_cle', unite: '\u00b0C',  fakeValue: '10.1' },
        { id: 'VULN_TEMP_SURPLUS',   ligne: 95,  nom: '\u00c9volution annuelle temp\u00e9rature (surplus-d\u00e9ficit)', type: 'graphique',   unite: '\u00b0C',  fakeValue: null,
          graphType: 'bar_surplus',
          description: '\u00c9cart \u00e0 la p\u00e9riode de r\u00e9f\u00e9rence 1991-2020',
          fakeChartData: {
            labels: ['1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'],
            values: [9.4,9.8,9.5,10.3,9.9,9.2,10.0,10.2,10.4,10.6,10.3,10.7,10.9,10.1,9.8,10.5,10.8,10.3,10.4,9.7,10.9,10.2,9.9,11.0,10.8,10.6,10.7,11.3,11.5,11.1,10.4,11.6,11.2,11.4,11.2],
            refLabel: 'P\u00e9riode de r\u00e9f\u00e9rence (1991-2020)'
          }
        }
      ]
    },

    // ── TUILE : Évolution mensuelle de la température N-1 (lignes 90-91-93) ──
    {
      tuile: '\u00c9volution mensuelle de la temp\u00e9rature N-1',
      zone: 'temp-mensuelle',
      categorie: 'Temp\u00e9ratures & pr\u00e9cipitations',
      indicateurs: [
        { id: 'VULN_TEMP_MENS_N1',   ligne: 90, nom: 'Temp\u00e9rature moyenne mensuelle de l\u2019ann\u00e9e N-1',       type: 'graphique', unite: '\u00b0C', fakeValue: null,
          graphType: 'bar_line_compare',
          fakeChartData: {
            labels: ['Jan','F\u00e9v','Mar','Avr','Mai','Jun','Jul','Ao\u00fb','Sep','Oct','Nov','D\u00e9c'],
            barValues: [2.8,4.1,7.5,11.2,14.8,18.5,21.2,20.8,16.4,11.5,6.2,3.1],
            lineValues: [1.5,2.8,6.2,9.8,13.5,16.8,18.9,18.4,15.0,10.2,5.5,2.2],
            barLabel: 'Ann\u00e9e N-1',
            lineLabel: 'P\u00e9riode de r\u00e9f\u00e9rence (1991-2020)'
          }
        },
        { id: 'VULN_TEMP_MENS_REF',  ligne: 91, nom: 'Temp\u00e9rature moyenne mensuelle de r\u00e9f\u00e9rence',         type: 'graphique', unite: '\u00b0C', fakeValue: null }
      ]
    },

    // ── TUILE : Évolution annuelle des précipitations (lignes 98-100) ──
    {
      tuile: '\u00c9volution annuelle des pr\u00e9cipitations',
      zone: 'precip-annuelle',
      categorie: 'Temp\u00e9ratures & pr\u00e9cipitations',
      indicateurs: [
        { id: 'VULN_PRECIP_MOY_N1',  ligne: 98,  nom: 'Pr\u00e9cipitation moyenne annuelle de l\u2019ann\u00e9e N-1',    type: 'chiffre_cle', unite: 'mm',  fakeValue: '820' },
        { id: 'VULN_PRECIP_REF',     ligne: 99,  nom: 'Pr\u00e9cipitations moyennes annuelles de r\u00e9f\u00e9rence',    type: 'chiffre_cle', unite: 'mm',  fakeValue: '780' },
        { id: 'VULN_PRECIP_SURPLUS', ligne: 100, nom: '\u00c9volution annuelle pr\u00e9cipitations (surplus-d\u00e9ficit)', type: 'graphique',   unite: 'mm',  fakeValue: null,
          graphType: 'bar_surplus',
          description: '\u00c9cart \u00e0 la p\u00e9riode de r\u00e9f\u00e9rence 1991-2020',
          fakeChartData: {
            labels: ['1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'],
            values: [750,810,720,790,830,710,770,800,760,820,740,850,690,780,810,730,790,860,700,780,820,750,800,690,770,830,710,760,850,790,820,870,730,810,820],
            refLabel: 'P\u00e9riode de r\u00e9f\u00e9rence (1991-2020)'
          }
        }
      ]
    },

    // ── TUILE : Évolution mensuelle des précipitations N-1 (lignes 84-85-96-97-99) ──
    {
      tuile: '\u00c9volution mensuelle des pr\u00e9cipitations N-1',
      zone: 'precip-mensuelle',
      categorie: 'Temp\u00e9ratures & pr\u00e9cipitations',
      indicateurs: [
        { id: 'VULN_PRECIP_MENS_N1', ligne: 96, nom: 'Pr\u00e9cipitation moyenne mensuelle de l\u2019ann\u00e9e N-1',     type: 'graphique', unite: 'mm', fakeValue: null,
          graphType: 'bar_line_compare',
          fakeChartData: {
            labels: ['Jan','F\u00e9v','Mar','Avr','Mai','Jun','Jul','Ao\u00fb','Sep','Oct','Nov','D\u00e9c'],
            barValues: [72,58,65,52,78,62,55,68,48,82,75,80],
            lineValues: [60,52,58,55,70,65,62,60,55,68,65,72],
            barLabel: 'Ann\u00e9e N-1',
            lineLabel: 'P\u00e9riode de r\u00e9f\u00e9rence (1991-2020)'
          }
        },
        { id: 'VULN_PRECIP_MENS_REF', ligne: 97, nom: 'Pr\u00e9cipitation moyenne mensuelle de r\u00e9f\u00e9rence',      type: 'graphique', unite: 'mm', fakeValue: null }
      ]
    },

    // ── TUILE : Suivi des arrêtés sécheresse — Année N-1 (ligne 102) ──
    {
      tuile: 'Suivi des arr\u00eat\u00e9s s\u00e9cheresse',
      zone: 'secheresse-n1',
      categorie: 'Risques',
      indicateurs: [
        { id: 'VULN_SECH_PIE_N1', ligne: 102, nom: 'R\u00e9partition des arr\u00eat\u00e9s s\u00e9cheresse ann\u00e9e N-1', type: 'graphique', unite: '%', fakeValue: null,
          graphType: 'pie',
          fakeChartData: {
            labels: ['Vigilance', 'Alerte', 'Alerte renforc\u00e9e', 'Crise'],
            values: [35, 30, 20, 15],
            colors: ['#FDD835', '#FF9800', '#F44336', '#B71C1C']
          }
        }
      ]
    },

    // ── TUILE : Évolution annuelle des arrêtés sécheresse (ligne 103) ──
    {
      tuile: '\u00c9volution annuelle des arr\u00eat\u00e9s s\u00e9cheresse',
      zone: 'secheresse-evol',
      categorie: 'Risques',
      indicateurs: [
        { id: 'VULN_SECH_EVOL', ligne: 103, nom: '\u00c9volution annuelle des arr\u00eat\u00e9s s\u00e9cheresse', type: 'graphique', unite: '', fakeValue: null,
          graphType: 'stacked_bar',
          fakeChartData: {
            labels: ['2017','2018','2019','2020','2021','2022','2023','2024','2025'],
            datasets: [
              { label: 'Vigilance',         data: [12,18,22,15,20,28,25,30,24],  color: '#FDD835' },
              { label: 'Alerte',            data: [8,12,15,10,14,20,18,22,16],   color: '#FF9800' },
              { label: 'Alerte renforc\u00e9e', data: [3,5,8,4,7,12,10,14,9],   color: '#F44336' },
              { label: 'Crise',             data: [1,2,4,2,3,6,5,8,4],           color: '#B71C1C' }
            ]
          }
        }
      ],
      lienExterne: { label: 'Vigi\u2019Eau', url: 'https://vigieau.gouv.fr/', icon: 'ph-link' }
    },

    // ── TUILE : Étiages et écoulements — Année N-1 (ligne 104) ──
    {
      tuile: '\u00c9tiages et modalit\u00e9s d\u2019\u00e9coulements — Ann\u00e9e N-1',
      zone: 'etiages-n1',
      categorie: 'Risques',
      indicateurs: [
        { id: 'VULN_ETIAGE_N1', ligne: 104, nom: 'Modalit\u00e9s d\u2019\u00e9coulements observ\u00e9s N-1', type: 'graphique', unite: '%', fakeValue: null,
          graphType: 'pie',
          description: 'Donn\u00e9es source : ONDE',
          fakeChartData: {
            labels: ['\u00c9coulement visible', '\u00c9coulement non visible', 'Assec'],
            values: [70, 7, 23],
            colors: ['#1565C0', '#FFC107', '#F44336']
          }
        }
      ]
    },

    // ── TUILE : Évolution annuelle étiages (ligne 105) ──
    {
      tuile: '\u00c9volution annuelle des \u00e9tiages',
      zone: 'etiages-evol',
      categorie: 'Risques',
      indicateurs: [
        { id: 'VULN_ETIAGE_EVOL', ligne: 105, nom: '\u00c9volution annuelle des \u00e9tiages observ\u00e9s', type: 'graphique', unite: '%', fakeValue: null,
          graphType: 'stacked_bar',
          fakeChartData: {
            labels: ['2017','2018','2019','2020','2021','2022','2023','2024','2025'],
            datasets: [
              { label: '\u00c9coulement visible',     data: [78,75,72,74,70,68,72,71,70], color: '#1565C0' },
              { label: '\u00c9coulement non visible',  data: [8,9,10,9,10,11,9,10,7],      color: '#FFC107' },
              { label: 'Assec',                        data: [14,16,18,17,20,21,19,19,23], color: '#F44336' }
            ]
          }
        }
      ],
      lienExterne: { label: 'R\u00e9seau ONDE', url: 'https://onde.eaufrance.fr/', icon: 'ph-link' }
    },

    // ── TUILE : Arrêtés CatNat — Année N-1 (ligne 108) ──
    {
      tuile: 'Arr\u00eat\u00e9s CatNat l\u2019ann\u00e9e N-1',
      zone: 'catnat-n1',
      categorie: 'Risques',
      indicateurs: [
        { id: 'VULN_CATNAT_PIE_N1', ligne: 108, nom: 'Arr\u00eat\u00e9s CatNat l\u2019ann\u00e9e N-1', type: 'graphique', unite: '', fakeValue: null,
          graphType: 'pie',
          fakeChartData: {
            labels: ['S\u00e9cheresse', 'Inondations / Coul\u00e9es de boue', 'Inondations Remont\u00e9e Nappe'],
            values: [45, 40, 15],
            colors: ['#FF9800', '#1565C0', '#7E57C2']
          }
        }
      ]
    },

    // ── TUILE : Évolution annuelle des arrêtés CatNat (ligne 109) ──
    {
      tuile: '\u00c9volution annuelle des arr\u00eat\u00e9s CatNat',
      zone: 'catnat-evol',
      categorie: 'Risques',
      indicateurs: [
        { id: 'VULN_CATNAT_EVOL', ligne: 109, nom: '\u00c9volution annuelle des arr\u00eat\u00e9s CatNat', type: 'graphique', unite: '', fakeValue: null,
          graphType: 'stacked_bar',
          fakeChartData: {
            labels: ['2017','2018','2019','2020','2021','2022','2023','2024','2025'],
            datasets: [
              { label: 'S\u00e9cheresse',                      data: [5,8,12,6,10,18,14,20,16],   color: '#FF9800' },
              { label: 'Inondations / Coul\u00e9es de boue',   data: [15,12,18,20,14,10,16,12,18], color: '#1565C0' },
              { label: 'Inondations Remont\u00e9e Nappe',      data: [3,4,5,3,6,4,5,3,4],          color: '#7E57C2' }
            ]
          }
        }
      ],
      lienExterne: { label: 'G\u00e9orisques', url: 'https://www.georisques.gouv.fr/', icon: 'ph-link' }
    }
  ]
};

// ── Données géo pour la carte interactive drill-down ────────────────
// Contours simplifiés des 10 départements du Grand Est (GeoJSON-like)
// eslint-disable-next-line no-unused-vars
var GEO_DEPARTEMENTS_GE = [
  { code: '08', nom: 'Ardennes',       center: [4.63, 49.62], bbox: [4.02, 49.22, 5.39, 50.17],
    contour: [[4.23,49.96],[4.05,49.57],[4.15,49.35],[4.86,49.24],[5.39,49.60],[5.28,50.09],[4.87,50.17],[4.23,49.96]] },
  { code: '10', nom: 'Aube',           center: [4.08, 48.32], bbox: [3.38, 47.92, 4.79, 48.72],
    contour: [[3.58,48.69],[3.38,48.34],[3.50,47.92],[4.32,47.92],[4.79,48.18],[4.67,48.65],[4.18,48.72],[3.58,48.69]] },
  { code: '51', nom: 'Marne',          center: [3.94, 48.95], bbox: [3.39, 48.52, 4.96, 49.41],
    contour: [[3.42,49.37],[3.39,48.87],[3.55,48.52],[4.35,48.53],[4.96,48.78],[4.82,49.24],[4.30,49.41],[3.42,49.37]] },
  { code: '52', nom: 'Haute-Marne',    center: [5.33, 48.13], bbox: [4.87, 47.58, 5.89, 48.69],
    contour: [[4.87,48.52],[4.88,48.06],[5.02,47.58],[5.52,47.60],[5.89,47.92],[5.84,48.42],[5.51,48.69],[4.87,48.52]] },
  { code: '54', nom: 'Meurthe-et-Moselle', center: [6.17, 48.78], bbox: [5.43, 48.35, 6.95, 49.56],
    contour: [[5.70,49.52],[5.43,49.06],[5.54,48.62],[5.72,48.35],[6.35,48.38],[6.82,48.55],[6.95,49.05],[6.56,49.56],[5.70,49.52]] },
  { code: '55', nom: 'Meuse',          center: [5.45, 49.01], bbox: [4.89, 48.41, 5.86, 49.62],
    contour: [[5.04,49.60],[4.89,49.10],[4.96,48.68],[5.12,48.41],[5.64,48.44],[5.86,48.82],[5.82,49.35],[5.42,49.62],[5.04,49.60]] },
  { code: '57', nom: 'Moselle',        center: [6.66, 49.04], bbox: [5.89, 48.53, 7.64, 49.52],
    contour: [[6.08,49.45],[5.89,49.02],[6.05,48.65],[6.20,48.53],[6.85,48.55],[7.42,48.88],[7.64,49.12],[7.42,49.48],[6.65,49.52],[6.08,49.45]] },
  { code: '67', nom: 'Bas-Rhin',       center: [7.45, 48.65], bbox: [7.02, 48.12, 8.23, 49.08],
    contour: [[7.12,49.05],[7.02,48.72],[7.08,48.32],[7.25,48.12],[7.72,48.18],[8.23,48.42],[8.10,48.82],[7.82,49.08],[7.12,49.05]] },
  { code: '68', nom: 'Haut-Rhin',      center: [7.24, 47.86], bbox: [6.84, 47.42, 7.62, 48.31],
    contour: [[6.92,48.28],[6.84,47.92],[6.95,47.58],[7.12,47.42],[7.52,47.48],[7.62,47.82],[7.55,48.15],[7.22,48.31],[6.92,48.28]] },
  { code: '88', nom: 'Vosges',         center: [6.42, 48.18], bbox: [5.82, 47.82, 7.12, 48.52],
    contour: [[5.95,48.48],[5.82,48.12],[5.92,47.88],[6.15,47.82],[6.72,47.85],[7.12,48.02],[7.05,48.35],[6.62,48.52],[5.95,48.48]] }
];

// ══════════════════════════════════════════════════════════════════════
// DONNÉES GÉO FAKE PAR DÉPARTEMENT — points / polygones pour les cartes
// ══════════════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
var GEO_DEPT_MAP_DATA = {
  '08': {
    ramsar: { polygons: [] },
    zre: [{ coords:[[4.4,49.3],[4.9,49.3],[4.9,49.7],[4.4,49.7],[4.4,49.3]], color:'rgba(255,152,0,0.25)', stroke:'#FF9800', label:'ZRE Superficielle' }],
    zs: [{ coords:[[4.1,49.3],[5.3,49.3],[5.3,50.0],[4.1,50.0],[4.1,49.3]], color:'rgba(255,152,0,0.2)', stroke:'#FF9800', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Aisne à Rethel', coord:[4.36,49.51], debit2025:'18', module:'22', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' },
      { nom:'Meuse à Sedan', coord:[4.94,49.70], debit2025:'42', module:'48', etat:'Moyen', etatColor:'#FFC107', etatLabel:'Moyen' }
    ],
    hydroEti: [
      { nom:'Aisne à Rethel', coord:[4.36,49.51], qnma:'4.2', qnmaPeriode:'2020-2025', tendance:'down', tendanceLabel:'Baisse' },
      { nom:'Meuse à Sedan', coord:[4.94,49.70], qnma:'8.5', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' }
    ],
    piezo: [
      { nom:'Piézo Craie — Rethel', coord:[4.36,49.50], nappe:'Craie du Sénonais', niveau:'145.2 m NGF', tendance:'neutral', tendanceLabel:'Stable' },
      { nom:'Piézo Alluvions — Charleville', coord:[4.72,49.77], nappe:'Alluvions de la Meuse', niveau:'152.8 m NGF', tendance:'down', tendanceLabel:'Baisse' }
    ],
    step: [
      { nom:'STEP Charleville-Mézières', coord:[4.72,49.76], capacite:'120 000 EH', reut:false },
      { nom:'STEP Sedan', coord:[4.94,49.70], capacite:'45 000 EH', reut:false },
      { nom:'STEP Rethel', coord:[4.36,49.51], capacite:'12 000 EH', reut:false }
    ]
  },
  '10': {
    ramsar: { polygons:[{coords:[[4.10,48.28],[4.35,48.28],[4.40,48.33],[4.38,48.40],[4.18,48.42],[4.08,48.35],[4.10,48.28]], color:'rgba(0,150,136,0.25)', stroke:'#00796B', label:'Lac de la Forêt d\'Orient'}] },
    zre: [{ coords:[[3.6,48.0],[4.3,48.0],[4.3,48.5],[3.6,48.5],[3.6,48.0]], color:'rgba(21,101,192,0.2)', stroke:'#1565C0', label:'ZRE Souterraine' }],
    zs: [{ coords:[[3.4,48.0],[4.7,48.0],[4.7,48.7],[3.4,48.7],[3.4,48.0]], color:'rgba(255,152,0,0.2)', stroke:'#FF9800', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Seine à Troyes', coord:[4.07,48.30], debit2025:'28', module:'32', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' },
      { nom:'Aube à Bar-sur-Aube', coord:[4.70,48.23], debit2025:'12', module:'15', etat:'Moyen', etatColor:'#FFC107', etatLabel:'Moyen' }
    ],
    hydroEti: [
      { nom:'Seine à Troyes', coord:[4.07,48.30], qnma:'5.8', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' }
    ],
    piezo: [
      { nom:'Piézo Craie — Troyes', coord:[4.07,48.30], nappe:'Craie du Crétacé', niveau:'118.5 m NGF', tendance:'up', tendanceLabel:'Hausse' }
    ],
    step: [
      { nom:'STEP Troyes', coord:[4.07,48.30], capacite:'200 000 EH', reut:true },
      { nom:'STEP Bar-sur-Aube', coord:[4.70,48.23], capacite:'8 000 EH', reut:false }
    ]
  },
  '51': {
    ramsar: { polygons: [] },
    zre: [],
    zs: [{ coords:[[3.4,48.6],[4.9,48.6],[4.9,49.4],[3.4,49.4],[3.4,48.6]], color:'rgba(255,152,0,0.2)', stroke:'#FF9800', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Marne à Châlons', coord:[4.36,48.96], debit2025:'38', module:'42', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' },
      { nom:'Vesle à Reims', coord:[3.93,49.25], debit2025:'8', module:'10', etat:'Moyen', etatColor:'#FFC107', etatLabel:'Moyen' }
    ],
    hydroEti: [
      { nom:'Marne à Châlons', coord:[4.36,48.96], qnma:'7.2', qnmaPeriode:'2020-2025', tendance:'down', tendanceLabel:'Baisse' }
    ],
    piezo: [
      { nom:'Piézo Craie — Reims', coord:[3.93,49.25], nappe:'Craie champenoise', niveau:'88.4 m NGF', tendance:'neutral', tendanceLabel:'Stable' }
    ],
    step: [
      { nom:'STEP Reims', coord:[3.93,49.25], capacite:'400 000 EH', reut:true },
      { nom:'STEP Châlons-en-Champagne', coord:[4.36,48.96], capacite:'85 000 EH', reut:false },
      { nom:'STEP Épernay', coord:[3.95,49.04], capacite:'55 000 EH', reut:false }
    ]
  },
  '52': {
    ramsar: { polygons: [] },
    zre: [{ coords:[[5.1,47.8],[5.6,47.8],[5.6,48.3],[5.1,48.3],[5.1,47.8]], color:'rgba(255,152,0,0.25)', stroke:'#FF9800', label:'ZRE Superficielle' }],
    zs: [{ coords:[[4.9,47.6],[5.8,47.6],[5.8,48.6],[4.9,48.6],[4.9,47.6]], color:'rgba(255,152,0,0.2)', stroke:'#FF9800', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Marne à Chaumont', coord:[5.14,48.11], debit2025:'15', module:'19', etat:'TB', etatColor:'#7B1FA2', etatLabel:'Très bon' }
    ],
    hydroEti: [
      { nom:'Marne à Chaumont', coord:[5.14,48.11], qnma:'3.2', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' }
    ],
    piezo: [
      { nom:'Piézo Calcaires — Langres', coord:[5.33,47.86], nappe:'Calcaires du Dogger', niveau:'320.5 m NGF', tendance:'down', tendanceLabel:'Baisse' }
    ],
    step: [
      { nom:'STEP Chaumont', coord:[5.14,48.11], capacite:'42 000 EH', reut:false },
      { nom:'STEP Saint-Dizier', coord:[4.95,48.64], capacite:'35 000 EH', reut:false }
    ]
  },
  '54': {
    ramsar: { polygons: [] },
    zre: [{ coords:[[5.8,48.5],[6.4,48.5],[6.4,49.0],[5.8,49.0],[5.8,48.5]], color:'rgba(21,101,192,0.2)', stroke:'#1565C0', label:'ZRE Souterraine' }],
    zs: [{ coords:[[5.5,48.4],[6.9,48.4],[6.9,49.5],[5.5,49.5],[5.5,48.4]], color:'rgba(33,150,243,0.2)', stroke:'#2196F3', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Moselle à Custines', coord:[6.15,48.79], debit2025:'58', module:'62', etat:'TB', etatColor:'#7B1FA2', etatLabel:'Très bon' },
      { nom:'Meurthe à Laneuveville', coord:[6.21,48.63], debit2025:'32', module:'36', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' },
      { nom:'Seille à Nomeny', coord:[6.22,48.88], debit2025:'8', module:'11', etat:'Moyen', etatColor:'#FFC107', etatLabel:'Moyen' }
    ],
    hydroEti: [
      { nom:'Moselle à Custines', coord:[6.15,48.79], qnma:'14.2', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' },
      { nom:'Meurthe à Laneuveville', coord:[6.21,48.63], qnma:'6.8', qnmaPeriode:'2020-2025', tendance:'down', tendanceLabel:'Baisse' }
    ],
    piezo: [
      { nom:'Piézo Grès — Lunéville', coord:[6.50,48.59], nappe:'Grès du Trias', niveau:'182.4 m NGF', tendance:'neutral', tendanceLabel:'Stable' },
      { nom:'Piézo Alluvions — Nancy', coord:[6.18,48.69], nappe:'Alluvions Moselle', niveau:'196.2 m NGF', tendance:'up', tendanceLabel:'Hausse' }
    ],
    step: [
      { nom:'STEP Nancy-Maxéville', coord:[6.15,48.71], capacite:'350 000 EH', reut:true },
      { nom:'STEP Toul', coord:[5.89,48.68], capacite:'25 000 EH', reut:false },
      { nom:'STEP Lunéville', coord:[6.50,48.59], capacite:'22 000 EH', reut:false }
    ]
  },
  '55': {
    ramsar: { polygons: [] },
    zre: [],
    zs: [{ coords:[[4.9,48.5],[5.8,48.5],[5.8,49.5],[4.9,49.5],[4.9,48.5]], color:'rgba(255,152,0,0.2)', stroke:'#FF9800', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Meuse à Verdun', coord:[5.38,49.16], debit2025:'15', module:'18', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' }
    ],
    hydroEti: [
      { nom:'Meuse à Verdun', coord:[5.38,49.16], qnma:'3.8', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' }
    ],
    piezo: [
      { nom:'Piézo Calcaires — Bar-le-Duc', coord:[5.16,48.77], nappe:'Calcaires du Dogger', niveau:'210.1 m NGF', tendance:'down', tendanceLabel:'Baisse' }
    ],
    step: [
      { nom:'STEP Verdun', coord:[5.38,49.16], capacite:'42 000 EH', reut:false },
      { nom:'STEP Bar-le-Duc', coord:[5.16,48.77], capacite:'28 000 EH', reut:false }
    ]
  },
  '57': {
    ramsar: { polygons:[{coords:[[6.68,48.72],[6.82,48.72],[6.84,48.76],[6.82,48.82],[6.70,48.82],[6.66,48.77],[6.68,48.72]], color:'rgba(0,150,136,0.25)', stroke:'#00796B', label:'Étang de Lindre et forêts'}] },
    zre: [
      { coords:[[5.9,48.6],[6.5,48.6],[6.5,49.1],[5.9,49.1],[5.9,48.6]], color:'rgba(255,152,0,0.25)', stroke:'#FF9800', label:'ZRE Superficielle' },
      { coords:[[6.6,48.7],[7.3,48.7],[7.3,49.3],[6.6,49.3],[6.6,48.7]], color:'rgba(21,101,192,0.2)', stroke:'#1565C0', label:'ZRE Souterraine' }
    ],
    zs: [{ coords:[[5.9,48.5],[7.6,48.5],[7.6,49.5],[5.9,49.5],[5.9,48.5]], color:'rgba(33,150,243,0.2)', stroke:'#2196F3', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Moselle à Metz', coord:[6.18,49.12], debit2025:'78', module:'85', etat:'TB', etatColor:'#7B1FA2', etatLabel:'Très bon' },
      { nom:'Sarre à Sarrebourg', coord:[7.05,48.74], debit2025:'16', module:'21', etat:'Moyen', etatColor:'#FFC107', etatLabel:'Moyen' },
      { nom:'Nied à Boulay', coord:[6.50,49.18], debit2025:'6', module:'8', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' }
    ],
    hydroEti: [
      { nom:'Moselle à Metz', coord:[6.18,49.12], qnma:'22.4', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' },
      { nom:'Sarre à Sarrebourg', coord:[7.05,48.74], qnma:'4.2', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' }
    ],
    piezo: [
      { nom:'Piézo Grès — Forbach', coord:[6.90,49.18], nappe:'Grès du Trias', niveau:'245.8 m NGF', tendance:'up', tendanceLabel:'Hausse' },
      { nom:'Piézo Alluvions — Metz', coord:[6.18,49.12], nappe:'Alluvions Moselle', niveau:'164.8 m NGF', tendance:'neutral', tendanceLabel:'Stable' }
    ],
    step: [
      { nom:'STEP Metz', coord:[6.18,49.12], capacite:'450 000 EH', reut:true },
      { nom:'STEP Thionville', coord:[6.17,49.36], capacite:'120 000 EH', reut:false },
      { nom:'STEP Sarreguemines', coord:[7.07,49.11], capacite:'65 000 EH', reut:false },
      { nom:'STEP Forbach', coord:[6.90,49.18], capacite:'55 000 EH', reut:true }
    ]
  },
  '67': {
    ramsar: { polygons:[{coords:[[7.65,48.35],[7.90,48.35],[7.92,48.50],[7.88,48.65],[7.70,48.68],[7.62,48.55],[7.65,48.35]], color:'rgba(0,150,136,0.25)', stroke:'#00796B', label:'Rhin supérieur / Oberrhein'}] },
    zre: [{ coords:[[7.3,48.2],[7.9,48.2],[7.9,48.8],[7.3,48.8],[7.3,48.2]], color:'rgba(21,101,192,0.2)', stroke:'#1565C0', label:'ZRE Nappe Rhin' }],
    zs: [{ coords:[[7.0,48.1],[8.2,48.1],[8.2,49.0],[7.0,49.0],[7.0,48.1]], color:'rgba(33,150,243,0.2)', stroke:'#2196F3', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Rhin à Strasbourg', coord:[7.75,48.57], debit2025:'1 080', module:'1 060', etat:'TB', etatColor:'#7B1FA2', etatLabel:'Très bon' },
      { nom:'Ill à Strasbourg', coord:[7.74,48.58], debit2025:'52', module:'56', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' },
      { nom:'Bruche à Molsheim', coord:[7.49,48.54], debit2025:'12', module:'14', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' }
    ],
    hydroEti: [
      { nom:'Rhin à Strasbourg', coord:[7.75,48.57], qnma:'425', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' },
      { nom:'Ill à Strasbourg', coord:[7.74,48.58], qnma:'11.2', qnmaPeriode:'2020-2025', tendance:'down', tendanceLabel:'Baisse' }
    ],
    piezo: [
      { nom:'Piézo Alluvions Rhin — Strasbourg', coord:[7.75,48.57], nappe:'Alluvions du Rhin', niveau:'138.2 m NGF', tendance:'up', tendanceLabel:'Hausse' },
      { nom:'Piézo Muschelkalk — Haguenau', coord:[7.79,48.82], nappe:'Calcaires Muschelkalk', niveau:'135.6 m NGF', tendance:'neutral', tendanceLabel:'Stable' }
    ],
    step: [
      { nom:'STEP Strasbourg-La Wantzenau', coord:[7.82,48.65], capacite:'900 000 EH', reut:true },
      { nom:'STEP Haguenau', coord:[7.79,48.82], capacite:'65 000 EH', reut:false },
      { nom:'STEP Saverne', coord:[7.36,48.74], capacite:'22 000 EH', reut:false }
    ]
  },
  '68': {
    ramsar: { polygons:[{coords:[[7.28,47.70],[7.44,47.70],[7.46,47.74],[7.43,47.80],[7.30,47.81],[7.26,47.75],[7.28,47.70]], color:'rgba(0,150,136,0.25)', stroke:'#00796B', label:'Petite Camargue alsacienne'}] },
    zre: [{ coords:[[7.0,47.5],[7.5,47.5],[7.5,48.0],[7.0,48.0],[7.0,47.5]], color:'rgba(21,101,192,0.2)', stroke:'#1565C0', label:'ZRE Nappe Rhin' }],
    zs: [{ coords:[[6.8,47.4],[7.6,47.4],[7.6,48.3],[6.8,48.3],[6.8,47.4]], color:'rgba(33,150,243,0.2)', stroke:'#2196F3', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Ill à Mulhouse', coord:[7.34,47.75], debit2025:'45', module:'50', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' },
      { nom:'Thur à Thann', coord:[7.10,47.81], debit2025:'8', module:'10', etat:'Moyen', etatColor:'#FFC107', etatLabel:'Moyen' }
    ],
    hydroEti: [
      { nom:'Ill à Mulhouse', coord:[7.34,47.75], qnma:'10.5', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' }
    ],
    piezo: [
      { nom:'Piézo Alluvions Rhin — Colmar', coord:[7.36,48.08], nappe:'Alluvions du Rhin', niveau:'192.3 m NGF', tendance:'up', tendanceLabel:'Hausse' }
    ],
    step: [
      { nom:'STEP Mulhouse', coord:[7.34,47.75], capacite:'280 000 EH', reut:true },
      { nom:'STEP Colmar', coord:[7.36,48.08], capacite:'140 000 EH', reut:false }
    ]
  },
  '88': {
    ramsar: { polygons: [] },
    zre: [{ coords:[[6.0,47.9],[6.6,47.9],[6.6,48.3],[6.0,48.3],[6.0,47.9]], color:'rgba(255,152,0,0.25)', stroke:'#FF9800', label:'ZRE Superficielle' }],
    zs: [{ coords:[[5.8,47.8],[7.1,47.8],[7.1,48.5],[5.8,48.5],[5.8,47.8]], color:'rgba(255,152,0,0.2)', stroke:'#FF9800', label:'Zone sensible' }],
    hydroMoy: [
      { nom:'Moselle à Épinal', coord:[6.45,48.17], debit2025:'28', module:'32', etat:'TB', etatColor:'#7B1FA2', etatLabel:'Très bon' },
      { nom:'Vologne à Granges', coord:[6.77,48.14], debit2025:'6', module:'8', etat:'B', etatColor:'#4CAF50', etatLabel:'Bon' }
    ],
    hydroEti: [
      { nom:'Moselle à Épinal', coord:[6.45,48.17], qnma:'7.0', qnmaPeriode:'2020-2025', tendance:'up', tendanceLabel:'Hausse' }
    ],
    piezo: [
      { nom:'Piézo Grès — Remiremont', coord:[6.59,48.02], nappe:'Grès vosgiens', niveau:'380.5 m NGF', tendance:'neutral', tendanceLabel:'Stable' }
    ],
    step: [
      { nom:'STEP Épinal', coord:[6.45,48.17], capacite:'85 000 EH', reut:false },
      { nom:'STEP Saint-Dié', coord:[6.95,48.29], capacite:'35 000 EH', reut:false }
    ]
  }
};

// Contour simplifié du Grand Est (enveloppe)
// eslint-disable-next-line no-unused-vars
var GEO_CONTOUR_GRAND_EST = [
  [3.38, 48.34],[3.42, 49.37],[4.23, 49.96],[4.87, 50.17],[5.28, 50.09],
  [5.70, 49.52],[6.65, 49.52],[7.42, 49.48],[7.82, 49.08],[8.23, 48.42],
  [7.62, 47.82],[7.12, 47.42],[6.95, 47.58],[6.15, 47.82],[5.02, 47.58],
  [4.32, 47.92],[3.50, 47.92],[3.38, 48.34]
];

// ══════════════════════════════════════════════════════════════════════
// DONNÉES FAKE PAR DÉPARTEMENT — pour le rafraîchissement au drill-down
// ══════════════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
var FAKE_DATA_DEPARTEMENTS = {
  '08': { nom:'Ardennes', type:'Département', superficie:'5 229', population:'268 557', densite:'51', ruralite:'Rural',
    tendance:'-0.82', tendanceDir:'down', tendanceLabel:'-0.82% entre 2017 et 2023',
    popEvol:[0.284,0.282,0.280,0.278,0.276,0.274,0.272,0.271,0.270,0.269],
    coursEau:'4 820', plansEau:'185', etatChimSurf:'58', etatEcoSurf:'38',
    mesoNb:'6', etatChimSout:'67', etatQuantiSout:'83',
    prelData:[[12,14,13,15,14,16,15,14,13],[32,30,28,27,25,24,22,21,20],[55,53,50,48,46,44,42,40,38],[5,5,4,4,4,3,3,3,3],[38,37,36,35,34,33,32,31,30]],
    volumeAnnee:'104', prixEau:'3.85', prixAssain:'1.92', captages:'12', aac:'22.1',
    ind:{ RAMSAR_NB:'0', RAMSAR_SURF:'0', ZRE_NB:'1', ZRE_RATIO:'15', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'18',
      obstData:[3,7,4,2,2], ocsData:[28,8,38,20,6],
      HYDRO_MODULE:'28', HYDRO_DEBIT_2025:'24', HYDRO_QNMA5:'6.2', SURF_COURS_EAU:'4 820', SURF_PLANS_EAU_NB:'185', SURF_PLANS_EAU_SURF:'2 100',
      SOUT_MESO_NB:'6', GOV_PRIX_EAU:'1.72', GOV_PRIX_EAU_DEPT:'2.10', GOV_REND_MOY:'72', GOV_REND_MIN:'48', GOV_REND_MAX:'88',
      GOV_AAC_RATIO:'22', GOV_CAPTDEG_NB:'12', GOV_PREL_VOL:'104', GOV_PRIX_ASSAIN:'1.68', GOV_STEP_NB:'85', GOV_SAU_IRR:'3',
      SAGE_MISE_OEUVRE:'5', SAGE_REVISION:'1', SAGE_ELABORATION:'2', SAGE_INSTRUCTION:'1',
      GOV_AGENCES:1, GOV_EPTB:1, GOV_SAGE:2, GOV_GEMAPI_PI:4, GOV_GEMAPI_GMA:5, GOV_PROD_EP:6, GOV_DIST_EP:10, GOV_ASSAIN_C:8, GOV_ASSAIN_NC:7,
      ACT_CM_NOM:'Contrat de rivi\u00e8re Aisne', ACT_CM_COUV:'35', ACT_CM_AVANC:[25,50,25,0], ACT_PT_NOM:'PTGE Aisne amont', ACT_PT_COUV:'28', ACT_PT_AVANC:[12,18,15,28,17,10], ACT_GI_PLANS:'8', ACT_GI_SLGRI:'48',
      VULN_TEMP_N1:'10.5', VULN_TEMP_REF:'9.8', VULN_PRECIP_N1:'790', VULN_PRECIP_REF:'750',
      VULN_SECH_PIE:[40,28,18,14], VULN_ETIAGE_N1_VIS:68, VULN_ETIAGE_N1_NV:8, VULN_ETIAGE_N1_AS:24 } },
  '10': { nom:'Aube', type:'Département', superficie:'6 004', population:'312 434', densite:'52', ruralite:'Rural',
    tendance:'+0.12', tendanceDir:'up', tendanceLabel:'+0.12% entre 2017 et 2023',
    popEvol:[0.306,0.307,0.308,0.309,0.310,0.310,0.311,0.311,0.312,0.312],
    coursEau:'5 150', plansEau:'210', etatChimSurf:'60', etatEcoSurf:'42',
    mesoNb:'5', etatChimSout:'70', etatQuantiSout:'85',
    prelData:[[10,11,12,13,12,14,13,12,11],[28,27,26,24,23,22,21,20,19],[48,46,44,42,40,38,36,35,34],[6,6,5,5,5,5,4,4,4],[35,34,33,32,31,30,30,29,28]],
    volumeAnnee:'96', prixEau:'4.05', prixAssain:'2.10', captages:'18', aac:'31.2',
    ind:{ RAMSAR_NB:'1', RAMSAR_SURF:'24', ZRE_NB:'1', ZRE_RATIO:'12', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'22',
      obstData:[4,9,4,3,2], ocsData:[30,10,35,18,7],
      HYDRO_MODULE:'35', HYDRO_DEBIT_2025:'31', HYDRO_QNMA5:'7.8', SURF_COURS_EAU:'5 150', SURF_PLANS_EAU_NB:'210', SURF_PLANS_EAU_SURF:'3 200',
      SOUT_MESO_NB:'5', GOV_PRIX_EAU:'1.85', GOV_PRIX_EAU_DEPT:'2.25', GOV_REND_MOY:'75', GOV_REND_MIN:'52', GOV_REND_MAX:'91',
      GOV_AAC_RATIO:'31', GOV_CAPTDEG_NB:'18', GOV_PREL_VOL:'96', GOV_PRIX_ASSAIN:'1.82', GOV_STEP_NB:'110', GOV_SAU_IRR:'8',
      SAGE_MISE_OEUVRE:'6', SAGE_REVISION:'2', SAGE_ELABORATION:'3', SAGE_INSTRUCTION:'1',
      GOV_AGENCES:1, GOV_EPTB:1, GOV_SAGE:1, GOV_GEMAPI_PI:3, GOV_GEMAPI_GMA:4, GOV_PROD_EP:5, GOV_DIST_EP:8, GOV_ASSAIN_C:7, GOV_ASSAIN_NC:6,
      ACT_CM_NOM:'Contrat de rivi\u00e8re Seine sup\u00e9rieure', ACT_CM_COUV:'40', ACT_CM_AVANC:[20,55,25,0], ACT_PT_NOM:'PTGE Seine amont', ACT_PT_COUV:'32', ACT_PT_AVANC:[8,14,22,32,14,10], ACT_GI_PLANS:'10', ACT_GI_SLGRI:'55',
      VULN_TEMP_N1:'11.0', VULN_TEMP_REF:'10.0', VULN_PRECIP_N1:'800', VULN_PRECIP_REF:'760',
      VULN_SECH_PIE:[38,30,18,14], VULN_ETIAGE_N1_VIS:70, VULN_ETIAGE_N1_NV:7, VULN_ETIAGE_N1_AS:23 } },
  '51': { nom:'Marne', type:'Département', superficie:'8 162', population:'568 895', densite:'70', ruralite:'Semi-rural',
    tendance:'-0.21', tendanceDir:'down', tendanceLabel:'-0.21% entre 2017 et 2023',
    popEvol:[0.572,0.571,0.571,0.570,0.570,0.569,0.569,0.569,0.569,0.569],
    coursEau:'6 280', plansEau:'245', etatChimSurf:'65', etatEcoSurf:'46',
    mesoNb:'7', etatChimSout:'74', etatQuantiSout:'91',
    prelData:[[14,15,14,16,15,17,16,15,14],[35,34,32,31,29,28,27,26,25],[62,60,58,55,53,51,49,47,46],[7,7,6,6,6,5,5,5,5],[45,44,43,42,41,40,39,38,37]],
    volumeAnnee:'127', prixEau:'4.18', prixAssain:'2.05', captages:'22', aac:'35.4',
    ind:{ RAMSAR_NB:'0', RAMSAR_SURF:'0', ZRE_NB:'0', ZRE_RATIO:'0', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'28',
      obstData:[5,11,5,4,3], ocsData:[25,9,40,19,7],
      HYDRO_MODULE:'45', HYDRO_DEBIT_2025:'41', HYDRO_QNMA5:'8.7', SURF_COURS_EAU:'6 280', SURF_PLANS_EAU_NB:'245', SURF_PLANS_EAU_SURF:'4 100',
      SOUT_MESO_NB:'7', GOV_PRIX_EAU:'1.95', GOV_PRIX_EAU_DEPT:'2.35', GOV_REND_MOY:'78', GOV_REND_MIN:'55', GOV_REND_MAX:'93',
      GOV_AAC_RATIO:'35', GOV_CAPTDEG_NB:'22', GOV_PREL_VOL:'127', GOV_PRIX_ASSAIN:'1.78', GOV_STEP_NB:'145', GOV_SAU_IRR:'6',
      SAGE_MISE_OEUVRE:'4', SAGE_REVISION:'1', SAGE_ELABORATION:'2', SAGE_INSTRUCTION:'2',
      GOV_AGENCES:1, GOV_EPTB:2, GOV_SAGE:2, GOV_GEMAPI_PI:6, GOV_GEMAPI_GMA:7, GOV_PROD_EP:9, GOV_DIST_EP:14, GOV_ASSAIN_C:12, GOV_ASSAIN_NC:10,
      ACT_CM_NOM:'Contrat Marne-Saulx', ACT_CM_COUV:'48', ACT_CM_AVANC:[15,55,30,0], ACT_PT_NOM:'PTGE Craie de Champagne', ACT_PT_COUV:'42', ACT_PT_AVANC:[10,16,18,30,16,10], ACT_GI_PLANS:'16', ACT_GI_SLGRI:'65',
      VULN_TEMP_N1:'11.4', VULN_TEMP_REF:'10.2', VULN_PRECIP_N1:'680', VULN_PRECIP_REF:'650',
      VULN_SECH_PIE:[30,32,22,16], VULN_ETIAGE_N1_VIS:72, VULN_ETIAGE_N1_NV:6, VULN_ETIAGE_N1_AS:22 } },
  '52': { nom:'Haute-Marne', type:'Département', superficie:'6 211', population:'172 512', densite:'28', ruralite:'Très rural',
    tendance:'-1.45', tendanceDir:'down', tendanceLabel:'-1.45% entre 2017 et 2023',
    popEvol:[0.180,0.179,0.178,0.177,0.176,0.175,0.174,0.173,0.173,0.173],
    coursEau:'4 580', plansEau:'165', etatChimSurf:'55', etatEcoSurf:'40',
    mesoNb:'4', etatChimSout:'68', etatQuantiSout:'88',
    prelData:[[6,7,6,7,6,7,7,6,6],[18,17,16,15,14,14,13,12,12],[30,29,27,26,25,24,23,22,21],[3,3,3,3,2,2,2,2,2],[22,21,21,20,20,19,19,18,18]],
    volumeAnnee:'59', prixEau:'3.72', prixAssain:'1.78', captages:'8', aac:'18.5',
    ind:{ RAMSAR_NB:'0', RAMSAR_SURF:'0', ZRE_NB:'1', ZRE_RATIO:'18', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'14',
      obstData:[2,6,3,2,1], ocsData:[32,11,30,22,5],
      HYDRO_MODULE:'22', HYDRO_DEBIT_2025:'19', HYDRO_QNMA5:'4.5', SURF_COURS_EAU:'4 580', SURF_PLANS_EAU_NB:'165', SURF_PLANS_EAU_SURF:'1 800',
      SOUT_MESO_NB:'4', GOV_PRIX_EAU:'1.65', GOV_PRIX_EAU_DEPT:'1.98', GOV_REND_MOY:'68', GOV_REND_MIN:'42', GOV_REND_MAX:'85',
      GOV_AAC_RATIO:'19', GOV_CAPTDEG_NB:'8', GOV_PREL_VOL:'59', GOV_PRIX_ASSAIN:'1.55', GOV_STEP_NB:'65', GOV_SAU_IRR:'2',
      SAGE_MISE_OEUVRE:'3', SAGE_REVISION:'1', SAGE_ELABORATION:'1', SAGE_INSTRUCTION:'1',
      GOV_AGENCES:1, GOV_EPTB:0, GOV_SAGE:1, GOV_GEMAPI_PI:3, GOV_GEMAPI_GMA:3, GOV_PROD_EP:4, GOV_DIST_EP:6, GOV_ASSAIN_C:5, GOV_ASSAIN_NC:5,
      ACT_CM_NOM:'Contrat Marne amont', ACT_CM_COUV:'30', ACT_CM_AVANC:[30,45,25,0], ACT_PT_NOM:'PTGE Rognon', ACT_PT_COUV:'22', ACT_PT_AVANC:[15,12,20,25,18,10], ACT_GI_PLANS:'6', ACT_GI_SLGRI:'40',
      VULN_TEMP_N1:'10.8', VULN_TEMP_REF:'9.9', VULN_PRECIP_N1:'850', VULN_PRECIP_REF:'820',
      VULN_SECH_PIE:[42,26,20,12], VULN_ETIAGE_N1_VIS:74, VULN_ETIAGE_N1_NV:6, VULN_ETIAGE_N1_AS:20 } },
  '54': { nom:'Meurthe-et-Moselle', type:'Département', superficie:'5 246', population:'733 760', densite:'140', ruralite:'Urbain',
    tendance:'+0.28', tendanceDir:'up', tendanceLabel:'+0.28% entre 2017 et 2023',
    popEvol:[0.725,0.727,0.728,0.729,0.730,0.731,0.732,0.733,0.733,0.734],
    coursEau:'5 920', plansEau:'198', etatChimSurf:'64', etatEcoSurf:'48',
    mesoNb:'8', etatChimSout:'76', etatQuantiSout:'92',
    prelData:[[8,9,8,9,9,10,9,9,8],[42,40,38,37,35,34,32,31,30],[72,70,67,65,62,60,58,56,54],[5,5,5,4,4,4,4,3,3],[52,51,50,49,48,47,46,45,44]],
    volumeAnnee:'139', prixEau:'4.45', prixAssain:'2.30', captages:'19', aac:'30.8',
    ind:{ RAMSAR_NB:'0', RAMSAR_SURF:'0', ZRE_NB:'1', ZRE_RATIO:'10', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'35',
      obstData:[7,14,6,5,3], ocsData:[22,7,32,28,11],
      HYDRO_MODULE:'62', HYDRO_DEBIT_2025:'58', HYDRO_QNMA5:'14.2', SURF_COURS_EAU:'5 920', SURF_PLANS_EAU_NB:'198', SURF_PLANS_EAU_SURF:'2 900',
      SOUT_MESO_NB:'8', GOV_PRIX_EAU:'2.12', GOV_PRIX_EAU_DEPT:'2.55', GOV_REND_MOY:'80', GOV_REND_MIN:'58', GOV_REND_MAX:'94',
      GOV_AAC_RATIO:'31', GOV_CAPTDEG_NB:'19', GOV_PREL_VOL:'139', GOV_PRIX_ASSAIN:'2.05', GOV_STEP_NB:'168', GOV_SAU_IRR:'4',
      SAGE_MISE_OEUVRE:'8', SAGE_REVISION:'3', SAGE_ELABORATION:'2', SAGE_INSTRUCTION:'1',
      GOV_AGENCES:2, GOV_EPTB:2, GOV_SAGE:3, GOV_GEMAPI_PI:8, GOV_GEMAPI_GMA:9, GOV_PROD_EP:12, GOV_DIST_EP:18, GOV_ASSAIN_C:15, GOV_ASSAIN_NC:12,
      ACT_CM_NOM:'Contrat Moselle', ACT_CM_COUV:'52', ACT_CM_AVANC:[15,60,25,0], ACT_PT_NOM:'PTGE Moselle', ACT_PT_COUV:'45', ACT_PT_AVANC:[8,12,20,35,15,10], ACT_GI_PLANS:'18', ACT_GI_SLGRI:'68',
      VULN_TEMP_N1:'11.1', VULN_TEMP_REF:'10.0', VULN_PRECIP_N1:'810', VULN_PRECIP_REF:'770',
      VULN_SECH_PIE:[32,30,22,16], VULN_ETIAGE_N1_VIS:71, VULN_ETIAGE_N1_NV:7, VULN_ETIAGE_N1_AS:22 } },
  '55': { nom:'Meuse', type:'Département', superficie:'6 211', population:'184 083', densite:'30', ruralite:'Très rural',
    tendance:'-1.12', tendanceDir:'down', tendanceLabel:'-1.12% entre 2017 et 2023',
    popEvol:[0.190,0.189,0.188,0.187,0.186,0.186,0.185,0.185,0.184,0.184],
    coursEau:'4 350', plansEau:'142', etatChimSurf:'56', etatEcoSurf:'36',
    mesoNb:'5', etatChimSout:'65', etatQuantiSout:'86',
    prelData:[[8,9,8,9,8,9,9,8,8],[15,14,13,13,12,12,11,11,10],[28,27,26,25,24,23,22,21,20],[3,3,3,2,2,2,2,2,2],[20,19,19,18,18,17,17,17,16]],
    volumeAnnee:'56', prixEau:'3.90', prixAssain:'1.85', captages:'9', aac:'20.3',
    ind:{ RAMSAR_NB:'0', RAMSAR_SURF:'0', ZRE_NB:'0', ZRE_RATIO:'0', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'12',
      obstData:[2,5,2,2,1], ocsData:[30,12,32,20,6],
      HYDRO_MODULE:'18', HYDRO_DEBIT_2025:'15', HYDRO_QNMA5:'3.8', SURF_COURS_EAU:'4 350', SURF_PLANS_EAU_NB:'142', SURF_PLANS_EAU_SURF:'1 500',
      SOUT_MESO_NB:'5', GOV_PRIX_EAU:'1.70', GOV_PRIX_EAU_DEPT:'2.05', GOV_REND_MOY:'66', GOV_REND_MIN:'40', GOV_REND_MAX:'84',
      GOV_AAC_RATIO:'20', GOV_CAPTDEG_NB:'9', GOV_PREL_VOL:'56', GOV_PRIX_ASSAIN:'1.60', GOV_STEP_NB:'72', GOV_SAU_IRR:'2',
      SAGE_MISE_OEUVRE:'2', SAGE_REVISION:'0', SAGE_ELABORATION:'1', SAGE_INSTRUCTION:'1',
      GOV_AGENCES:1, GOV_EPTB:1, GOV_SAGE:1, GOV_GEMAPI_PI:2, GOV_GEMAPI_GMA:3, GOV_PROD_EP:3, GOV_DIST_EP:5, GOV_ASSAIN_C:4, GOV_ASSAIN_NC:4,
      ACT_CM_NOM:'Contrat Meuse aval', ACT_CM_COUV:'38', ACT_CM_AVANC:[25,50,25,0], ACT_PT_NOM:'PTGE Meuse', ACT_PT_COUV:'30', ACT_PT_AVANC:[10,15,18,30,17,10], ACT_GI_PLANS:'7', ACT_GI_SLGRI:'45',
      VULN_TEMP_N1:'10.4', VULN_TEMP_REF:'9.6', VULN_PRECIP_N1:'830', VULN_PRECIP_REF:'790',
      VULN_SECH_PIE:[38,28,20,14], VULN_ETIAGE_N1_VIS:73, VULN_ETIAGE_N1_NV:7, VULN_ETIAGE_N1_AS:20 } },
  '57': { nom:'Moselle', type:'Département', superficie:'6 216', population:'1 046 468', densite:'168', ruralite:'Urbain',
    tendance:'-0.15', tendanceDir:'down', tendanceLabel:'-0.15% entre 2017 et 2023',
    popEvol:[1.050,1.050,1.049,1.049,1.048,1.048,1.047,1.047,1.046,1.046],
    coursEau:'7 120', plansEau:'312', etatChimSurf:'60', etatEcoSurf:'41',
    mesoNb:'9', etatChimSout:'71', etatQuantiSout:'87',
    prelData:[[10,11,10,12,11,12,12,11,10],[48,46,44,42,40,38,37,35,34],[85,82,79,76,73,70,68,65,63],[8,8,7,7,7,6,6,6,5],[58,57,55,54,53,52,51,50,49]],
    volumeAnnee:'161', prixEau:'4.52', prixAssain:'2.25', captages:'21', aac:'26.7',
    ind:{ RAMSAR_NB:'1', RAMSAR_SURF:'50', ZRE_NB:'2', ZRE_RATIO:'22', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'42',
      obstData:[9,16,7,6,4], ocsData:[20,6,35,28,11],
      HYDRO_MODULE:'85', HYDRO_DEBIT_2025:'78', HYDRO_QNMA5:'22.4', SURF_COURS_EAU:'7 120', SURF_PLANS_EAU_NB:'312', SURF_PLANS_EAU_SURF:'4 800',
      SOUT_MESO_NB:'9', GOV_PRIX_EAU:'2.08', GOV_PRIX_EAU_DEPT:'2.48', GOV_REND_MOY:'79', GOV_REND_MIN:'56', GOV_REND_MAX:'93',
      GOV_AAC_RATIO:'27', GOV_CAPTDEG_NB:'21', GOV_PREL_VOL:'161', GOV_PRIX_ASSAIN:'1.98', GOV_STEP_NB:'195', GOV_SAU_IRR:'5',
      SAGE_MISE_OEUVRE:'5', SAGE_REVISION:'2', SAGE_ELABORATION:'3', SAGE_INSTRUCTION:'2',
      GOV_AGENCES:2, GOV_EPTB:3, GOV_SAGE:3, GOV_GEMAPI_PI:10, GOV_GEMAPI_GMA:11, GOV_PROD_EP:15, GOV_DIST_EP:22, GOV_ASSAIN_C:18, GOV_ASSAIN_NC:14,
      ACT_CM_NOM:'Contrat Moselle-Sarre', ACT_CM_COUV:'55', ACT_CM_AVANC:[15,60,25,0], ACT_PT_NOM:'PTGE Nied', ACT_PT_COUV:'48', ACT_PT_AVANC:[8,14,20,32,16,10], ACT_GI_PLANS:'22', ACT_GI_SLGRI:'72',
      VULN_TEMP_N1:'11.3', VULN_TEMP_REF:'10.1', VULN_PRECIP_N1:'780', VULN_PRECIP_REF:'740',
      VULN_SECH_PIE:[34,32,20,14], VULN_ETIAGE_N1_VIS:69, VULN_ETIAGE_N1_NV:8, VULN_ETIAGE_N1_AS:23 } },
  '67': { nom:'Bas-Rhin', type:'Département', superficie:'4 755', population:'1 148 073', densite:'242', ruralite:'Urbain',
    tendance:'+0.65', tendanceDir:'up', tendanceLabel:'+0.65% entre 2017 et 2023',
    popEvol:[1.130,1.133,1.135,1.137,1.140,1.142,1.144,1.146,1.147,1.148],
    coursEau:'5 480', plansEau:'225', etatChimSurf:'68', etatEcoSurf:'50',
    mesoNb:'6', etatChimSout:'78', etatQuantiSout:'93',
    prelData:[[6,7,6,7,7,8,7,7,6],[38,37,35,34,32,31,30,28,27],[65,63,60,58,56,54,52,50,48],[4,4,4,3,3,3,3,3,3],[48,47,46,45,44,43,42,41,40]],
    volumeAnnee:'124', prixEau:'4.68', prixAssain:'2.42', captages:'15', aac:'32.5',
    ind:{ RAMSAR_NB:'1', RAMSAR_SURF:'22', ZRE_NB:'1', ZRE_RATIO:'25', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'32',
      obstData:[6,13,5,5,3], ocsData:[18,5,38,25,14],
      HYDRO_MODULE:'120', HYDRO_DEBIT_2025:'115', HYDRO_QNMA5:'32.0', SURF_COURS_EAU:'5 480', SURF_PLANS_EAU_NB:'225', SURF_PLANS_EAU_SURF:'3 600',
      SOUT_MESO_NB:'6', GOV_PRIX_EAU:'2.25', GOV_PRIX_EAU_DEPT:'2.62', GOV_REND_MOY:'82', GOV_REND_MIN:'60', GOV_REND_MAX:'95',
      GOV_AAC_RATIO:'33', GOV_CAPTDEG_NB:'15', GOV_PREL_VOL:'124', GOV_PRIX_ASSAIN:'2.15', GOV_STEP_NB:'180', GOV_SAU_IRR:'7',
      SAGE_MISE_OEUVRE:'7', SAGE_REVISION:'2', SAGE_ELABORATION:'4', SAGE_INSTRUCTION:'1',
      GOV_AGENCES:2, GOV_EPTB:2, GOV_SAGE:4, GOV_GEMAPI_PI:7, GOV_GEMAPI_GMA:8, GOV_PROD_EP:10, GOV_DIST_EP:16, GOV_ASSAIN_C:14, GOV_ASSAIN_NC:11,
      ACT_CM_NOM:'Contrat Ill-Nappe-Rhin', ACT_CM_COUV:'60', ACT_CM_AVANC:[10,60,30,0], ACT_PT_NOM:'PTGE Nappe d\u2019Alsace', ACT_PT_COUV:'52', ACT_PT_AVANC:[6,12,22,35,15,10], ACT_GI_PLANS:'12', ACT_GI_SLGRI:'70',
      VULN_TEMP_N1:'11.6', VULN_TEMP_REF:'10.3', VULN_PRECIP_N1:'750', VULN_PRECIP_REF:'700',
      VULN_SECH_PIE:[28,34,22,16], VULN_ETIAGE_N1_VIS:68, VULN_ETIAGE_N1_NV:9, VULN_ETIAGE_N1_AS:23 } },
  '68': { nom:'Haut-Rhin', type:'Département', superficie:'3 525', population:'765 313', densite:'217', ruralite:'Semi-urbain',
    tendance:'+0.18', tendanceDir:'up', tendanceLabel:'+0.18% entre 2017 et 2023',
    popEvol:[0.758,0.759,0.760,0.761,0.762,0.763,0.763,0.764,0.765,0.765],
    coursEau:'4 180', plansEau:'195', etatChimSurf:'66', etatEcoSurf:'47',
    mesoNb:'5', etatChimSout:'75', etatQuantiSout:'90',
    prelData:[[5,6,5,6,6,7,6,6,5],[30,29,28,27,26,25,24,23,22],[52,50,48,46,44,43,41,40,38],[3,3,3,3,2,2,2,2,2],[40,39,38,37,36,36,35,34,34]],
    volumeAnnee:'101', prixEau:'4.55', prixAssain:'2.35', captages:'11', aac:'29.8',
    ind:{ RAMSAR_NB:'1', RAMSAR_SURF:'28', ZRE_NB:'1', ZRE_RATIO:'20', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'26',
      obstData:[5,10,4,4,3], ocsData:[20,7,35,26,12],
      HYDRO_MODULE:'55', HYDRO_DEBIT_2025:'50', HYDRO_QNMA5:'12.8', SURF_COURS_EAU:'4 180', SURF_PLANS_EAU_NB:'195', SURF_PLANS_EAU_SURF:'2 700',
      SOUT_MESO_NB:'5', GOV_PRIX_EAU:'2.18', GOV_PRIX_EAU_DEPT:'2.58', GOV_REND_MOY:'81', GOV_REND_MIN:'58', GOV_REND_MAX:'94',
      GOV_AAC_RATIO:'30', GOV_CAPTDEG_NB:'11', GOV_PREL_VOL:'101', GOV_PRIX_ASSAIN:'2.10', GOV_STEP_NB:'155', GOV_SAU_IRR:'6',
      SAGE_MISE_OEUVRE:'6', SAGE_REVISION:'1', SAGE_ELABORATION:'2', SAGE_INSTRUCTION:'2',
      GOV_AGENCES:1, GOV_EPTB:1, GOV_SAGE:2, GOV_GEMAPI_PI:5, GOV_GEMAPI_GMA:6, GOV_PROD_EP:7, GOV_DIST_EP:12, GOV_ASSAIN_C:10, GOV_ASSAIN_NC:8,
      ACT_CM_NOM:'Contrat Doller', ACT_CM_COUV:'45', ACT_CM_AVANC:[20,55,25,0], ACT_PT_NOM:'PTGE Thur', ACT_PT_COUV:'40', ACT_PT_AVANC:[10,15,18,28,19,10], ACT_GI_PLANS:'9', ACT_GI_SLGRI:'58',
      VULN_TEMP_N1:'11.5', VULN_TEMP_REF:'10.2', VULN_PRECIP_N1:'860', VULN_PRECIP_REF:'810',
      VULN_SECH_PIE:[30,30,24,16], VULN_ETIAGE_N1_VIS:67, VULN_ETIAGE_N1_NV:9, VULN_ETIAGE_N1_AS:24 } },
  '88': { nom:'Vosges', type:'Département', superficie:'5 874', population:'362 556', densite:'62', ruralite:'Rural',
    tendance:'-0.68', tendanceDir:'down', tendanceLabel:'-0.68% entre 2017 et 2023',
    popEvol:[0.370,0.369,0.368,0.367,0.366,0.365,0.364,0.363,0.363,0.363],
    coursEau:'5 920', plansEau:'165', etatChimSurf:'57', etatEcoSurf:'43',
    mesoNb:'4', etatChimSout:'69', etatQuantiSout:'85',
    prelData:[[7,8,7,8,7,8,8,7,7],[22,21,20,19,18,17,16,16,15],[42,40,38,37,35,34,32,31,30],[4,4,4,3,3,3,3,3,2],[32,31,30,29,28,28,27,27,26]],
    volumeAnnee:'80', prixEau:'4.12', prixAssain:'2.08', captages:'14', aac:'24.6',
    ind:{ RAMSAR_NB:'0', RAMSAR_SURF:'0', ZRE_NB:'1', ZRE_RATIO:'14', ZONE_SENSIBLE_RATIO:'100', OBST_ECOUL_NB:'20',
      obstData:[4,8,3,3,2], ocsData:[28,10,25,30,7],
      HYDRO_MODULE:'32', HYDRO_DEBIT_2025:'28', HYDRO_QNMA5:'7.0', SURF_COURS_EAU:'5 920', SURF_PLANS_EAU_NB:'165', SURF_PLANS_EAU_SURF:'2 400',
      SOUT_MESO_NB:'4', GOV_PRIX_EAU:'1.82', GOV_PRIX_EAU_DEPT:'2.15', GOV_REND_MOY:'70', GOV_REND_MIN:'45', GOV_REND_MAX:'87',
      GOV_AAC_RATIO:'25', GOV_CAPTDEG_NB:'14', GOV_PREL_VOL:'80', GOV_PRIX_ASSAIN:'1.75', GOV_STEP_NB:'120', GOV_SAU_IRR:'3',
      SAGE_MISE_OEUVRE:'4', SAGE_REVISION:'1', SAGE_ELABORATION:'2', SAGE_INSTRUCTION:'1',
      GOV_AGENCES:1, GOV_EPTB:1, GOV_SAGE:1, GOV_GEMAPI_PI:4, GOV_GEMAPI_GMA:5, GOV_PROD_EP:5, GOV_DIST_EP:9, GOV_ASSAIN_C:8, GOV_ASSAIN_NC:6,
      ACT_CM_NOM:'Contrat Moselle amont', ACT_CM_COUV:'38', ACT_CM_AVANC:[25,50,25,0], ACT_PT_NOM:'PTGE Vosges', ACT_PT_COUV:'35', ACT_PT_AVANC:[10,15,18,30,17,10], ACT_GI_PLANS:'11', ACT_GI_SLGRI:'52',
      VULN_TEMP_N1:'10.2', VULN_TEMP_REF:'9.5', VULN_PRECIP_N1:'1020', VULN_PRECIP_REF:'980',
      VULN_SECH_PIE:[45,24,18,13], VULN_ETIAGE_N1_VIS:76, VULN_ETIAGE_N1_NV:5, VULN_ETIAGE_N1_AS:19 } }
};

console.log('[DATA-ELU-V2] ' + TUILES_ELU_V2['fiche-identite'].length + ' tuiles fiche, ' + TUILES_ELU_V2['gouvernance'].length + ' tuiles gouvernance, ' + TUILES_ELU_V2['ressource-usage'].length + ' tuiles ressource-usage, ' + TUILES_ELU_V2['vulnerabilite'].length + ' tuiles vulnerabilite, ' + SECTIONS_ELU_V2.length + ' sections');
