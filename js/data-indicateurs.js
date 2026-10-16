/**
 * data-indicateurs.js
 * Données de référence – Observatoire de l'Eau Grand Est
 * Source : matrice_indicateur_observatoire_gd_est_v20260213.xlsx (Antea Group)
 * Onglet : Indicateurs_Observatoire
 *
 * Seuls les indicateurs ayant "cartographie" dans "Type de représentation"
 * sont inclus dans INDICATEURS_CARTO.
 *
 * Les valeurs (valeurs_par_territoire, valeurs_par_annee) sont fictives
 * mais cohérentes avec l'unité et différentes par indicateur / année / territoire.
 *
 * SOMMAIRE
 *  1. Helpers de génération de données fictives
 *  2. INDICATEURS_CARTO  (tous les indicateurs cartographiables de la matrice)
 *  3. INDICATEURS_DASHBOARD (9 indicateurs pour le tableau de bord)
 *  4. TERRITOIRES
 *  5. ANNEES
 */

// ============================================================
// 0. ANNÉES (déclaré en premier car utilisé dans les helpers)
// ============================================================

var ANNEES = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

// ============================================================
// 1. HELPERS DE GÉNÉRATION DE DONNÉES FICTIVES
// ============================================================

/**
 * Génère une valeur fictive cohérente avec l'unité de l'indicateur,
 * légèrement variée selon un seed (id + annee + territoire).
 */
function genValeur(base, amplitude, seed) {
  var rng = Math.sin(seed * 9301 + 49297) * 0.5 + 0.5; // pseudo-random déterministe
  return Math.round((base + (rng - 0.5) * amplitude) * 10) / 10;
}

/**
 * Génère un objet { territoire: valeur } pour les 10 départements Grand Est
 * autour d'une valeur de base, avec une amplitude de variation.
 */
function genValeursDepts(base, amplitude, indicateurId) {
  var depts = [
    "Ardennes", "Aube", "Marne", "Haute-Marne",
    "Meurthe-et-Moselle", "Meuse", "Moselle",
    "Bas-Rhin", "Haut-Rhin", "Vosges"
  ];
  var result = {};
  depts.forEach(function(d, i) {
    var seed = (indicateurId || 1) * 100 + i;
    result[d] = genValeur(base, amplitude, seed);
  });
  return result;
}

/**
 * Génère un objet { annee: valeur } pour les années 2015→2026.
 */
function genValeursAnnees(base, amplitude, indicateurId, tendance) {
  tendance = tendance || 0; // valeur de drift par année
  var result = {};
  ANNEES.forEach(function(annee, i) {
    var seed = (indicateurId || 1) * 50 + i;
    result[annee] = genValeur(base + tendance * i, amplitude, seed);
  });
  return result;
}


// ============================================================
// 2. INDICATEURS CARTOGRAPHIQUES (source : matrice Antea)
//    Filtre : "Type de représentation" contient "cartographie"
// ============================================================

var INDICATEURS_CARTO = [

  // ────────────────────────────────────────────────────────────────────────
  // CATÉGORIE : Connaissance des milieux aquatiques
  // ────────────────────────────────────────────────────────────────────────

  // Thématique : Biodiversité / Poissons migrateurs
  {
    id: "CMA-BD-PM-01",
    categorie: "Connaissance des milieux aquatiques",
    thematique: "Biodiversité",
    sous_thematique: "Poissons migrateurs",
    nom: "Linéaire de cours d'eau disponibles pour les espèces migratrices",
    unite: "km",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: 420, valeur_amplitude: 80
  },
  {
    id: "CMA-BD-PM-02",
    categorie: "Connaissance des milieux aquatiques",
    thematique: "Biodiversité",
    sous_thematique: "Poissons migrateurs",
    nom: "Carte de présence du saumon",
    unite: "occurrence spatiale",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: null, valeur_amplitude: null
  },
  {
    id: "CMA-BD-PM-03",
    categorie: "Connaissance des milieux aquatiques",
    thematique: "Biodiversité",
    sous_thematique: "Poissons migrateurs",
    nom: "Carte de présence de l'anguille",
    unite: "occurrence spatiale",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: null, valeur_amplitude: null
  },
  {
    id: "CMA-BD-PM-04",
    categorie: "Connaissance des milieux aquatiques",
    thematique: "Biodiversité",
    sous_thematique: "Poissons migrateurs",
    nom: "Carte de présence de la grande alose",
    unite: "occurrence spatiale",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: null, valeur_amplitude: null
  },
  {
    id: "CMA-BD-PM-05",
    categorie: "Connaissance des milieux aquatiques",
    thematique: "Biodiversité",
    sous_thematique: "Poissons migrateurs",
    nom: "Carte de présence de la lamproie marine",
    unite: "occurrence spatiale",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: null, valeur_amplitude: null
  },

  // Thématique : Zonage / Zones humides
  {
    id: "CMA-ZO-ZH-01",
    categorie: "Connaissance des milieux aquatiques",
    thematique: "Zonage",
    sous_thematique: "Zones humides",
    nom: "Surface de zones humides référencées",
    unite: "km²",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: 1420, valeur_amplitude: 180
  },

  // Thématique : Zonage / Habitats
  {
    id: "CMA-ZO-HA-01",
    categorie: "Connaissance des milieux aquatiques",
    thematique: "Zonage",
    sous_thematique: "Habitats",
    nom: "Superficie des sites Natura 2000",
    unite: "km² de Natura 2000",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: 3800, valeur_amplitude: 400
  },
  {
    id: "CMA-ZO-HA-02",
    categorie: "Connaissance des milieux aquatiques",
    thematique: "Zonage",
    sous_thematique: "Habitats",
    nom: "Superficie des ZNIEFF",
    unite: "km² de ZNIEFF",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: 5200, valeur_amplitude: 600
  },

  // ────────────────────────────────────────────────────────────────────────
  // CATÉGORIE : Qualité des Eaux
  // ────────────────────────────────────────────────────────────────────────

  // Thématique : Evaluation DCE / MESU
  {
    id: "QE-DCE-MESU-01",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESU – Eaux superficielles",
    nom: "État écologique des masses d'eau superficielles",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 42, valeur_amplitude: 12
  },
  {
    id: "QE-DCE-MESU-02",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESU – Eaux superficielles",
    nom: "État biologique des masses d'eau superficielles",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 38, valeur_amplitude: 14
  },
  {
    id: "QE-DCE-MESU-03",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESU – Eaux superficielles",
    nom: "État physico-chimique (éléments généraux)",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 51, valeur_amplitude: 15
  },
  {
    id: "QE-DCE-MESU-04",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESU – Eaux superficielles",
    nom: "État physico-chimique (polluants spécifiques)",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 44, valeur_amplitude: 11
  },
  {
    id: "QE-DCE-MESU-05",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESU – Eaux superficielles",
    nom: "État hydromorphologique",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 33, valeur_amplitude: 10
  },
  {
    id: "QE-DCE-MESU-06",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESU – Eaux superficielles",
    nom: "État chimique ESU",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 29, valeur_amplitude: 10
  },

  // Thématique : Evaluation DCE / MESO
  {
    id: "QE-DCE-MESO-01",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESO – Eaux souterraines",
    nom: "État quantitatif des masses d'eau souterraines",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 71, valeur_amplitude: 10
  },
  {
    id: "QE-DCE-MESO-02",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESO – Eaux souterraines",
    nom: "État chimique ESO",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 58, valeur_amplitude: 14
  },

  // Thématique : Evaluation DCE / MESU+MESO
  {
    id: "QE-DCE-MIX-01",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESU/MESO – Objectifs",
    nom: "Risque de non atteinte des objectifs environnementaux",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 48, valeur_amplitude: 15
  },
  {
    id: "QE-DCE-MIX-02",
    categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE",
    sous_thematique: "MESU/MESO – Objectifs",
    nom: "Pressions s'exerçant sur les masses d'eau",
    unite: "%",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 55, valeur_amplitude: 12
  },

  // Thématique : Eau de baignade
  {
    id: "QE-BAI-01",
    categorie: "Qualité des Eaux",
    thematique: "Eau de baignade",
    sous_thematique: "Qualité baignade",
    nom: "Nombre de sites de baignade",
    unite: "nombre",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 18, valeur_amplitude: 5
  },

  // Thématique : Eau potable (Qualité des eaux)
  {
    id: "QE-AEP-01",
    categorie: "Qualité des Eaux",
    thematique: "Eau potable",
    sous_thematique: "Qualité eaux brutes",
    nom: "Qualité des eaux brutes – Pesticides",
    unite: "µg/L",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 0.18, valeur_amplitude: 0.12
  },
  {
    id: "QE-AEP-02",
    categorie: "Qualité des Eaux",
    thematique: "Eau potable",
    sous_thematique: "Qualité eaux brutes",
    nom: "Qualité des eaux brutes – Nitrates",
    unite: "mg/L",
    echelle_territoire: "région Grand Est / département",
    annee: "Multiple",
    valeur_base: 24, valeur_amplitude: 12
  },

  // Thématique : Zonage / ZSCE
  {
    id: "QE-ZO-01",
    categorie: "Qualité des Eaux",
    thematique: "Zonage",
    sous_thematique: "Zones soumises à contrainte",
    nom: "Zones soumises à contrainte environnementale (ZSCE)",
    unite: "km²",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 4200, valeur_amplitude: 500
  },

  // ────────────────────────────────────────────────────────────────────────
  // CATÉGORIE : Gouvernance de l'eau
  // ────────────────────────────────────────────────────────────────────────

  // Thématique : Organisation des acteurs
  {
    id: "GO-ACT-01",
    categorie: "Gouvernance de l'eau",
    thematique: "Organisation des acteurs",
    sous_thematique: "Structures de gestion",
    nom: "Couverture par Agences de l'Eau",
    unite: "km²",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 17000, valeur_amplitude: 1500
  },
  {
    id: "GO-ACT-02",
    categorie: "Gouvernance de l'eau",
    thematique: "Organisation des acteurs",
    sous_thematique: "Structures de gestion",
    nom: "Couverture par EPTB",
    unite: "km²",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 8500, valeur_amplitude: 900
  },
  {
    id: "GO-ACT-03",
    categorie: "Gouvernance de l'eau",
    thematique: "Organisation des acteurs",
    sous_thematique: "Structures de gestion",
    nom: "Couverture par EPAGE",
    unite: "km²",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 6200, valeur_amplitude: 700
  },
  {
    id: "GO-ACT-04",
    categorie: "Gouvernance de l'eau",
    thematique: "Organisation des acteurs",
    sous_thematique: "Compétences collectivités",
    nom: "Collectivités compétentes en production d'eau potable",
    unite: "nb collectivités",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 312, valeur_amplitude: 20
  },
  {
    id: "GO-ACT-05",
    categorie: "Gouvernance de l'eau",
    thematique: "Organisation des acteurs",
    sous_thematique: "Compétences collectivités",
    nom: "Collectivités compétentes en distribution d'eau potable",
    unite: "nb collectivités",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 428, valeur_amplitude: 30
  },
  {
    id: "GO-ACT-06",
    categorie: "Gouvernance de l'eau",
    thematique: "Organisation des acteurs",
    sous_thematique: "Compétences collectivités",
    nom: "Collectivités compétentes en traitement des eaux usées",
    unite: "nb collectivités",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 380, valeur_amplitude: 25
  },
  {
    id: "GO-ACT-07",
    categorie: "Gouvernance de l'eau",
    thematique: "Organisation des acteurs",
    sous_thematique: "Compétences collectivités",
    nom: "Collectivités compétentes en assainissement non collectif",
    unite: "nb collectivités",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 510, valeur_amplitude: 40
  },
  {
    id: "GO-ACT-08",
    categorie: "Gouvernance de l'eau",
    thematique: "Organisation des acteurs",
    sous_thematique: "Compétences collectivités",
    nom: "Collectivités compétentes en matière de GEMAPI",
    unite: "nb collectivités",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 89, valeur_amplitude: 8
  },
  {
    id: "GO-ACT-09",
    categorie: "Gouvernance de l'eau",
    thematique: "Organisation des acteurs",
    sous_thematique: "Compétences collectivités",
    nom: "Organismes Uniques de Gestion Collective (OUGC)",
    unite: "nb collectivités",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 14, valeur_amplitude: 3
  },

  // Thématique : Plans et programmes – gestion de l'eau
  {
    id: "GO-PP-EAU-01",
    categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes – gestion de l'eau",
    sous_thematique: "SAGE",
    nom: "Couverture et avancement des SAGE",
    unite: "nb SAGE",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 22, valeur_amplitude: 2
  },
  {
    id: "GO-PP-EAU-02",
    categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes – gestion de l'eau",
    sous_thematique: "SAGE",
    nom: "SAGE nécessaires et avancement",
    unite: "nb SAGE",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 8, valeur_amplitude: 2
  },
  {
    id: "GO-PP-EAU-03",
    categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes – gestion de l'eau",
    sous_thematique: "Contrats milieux",
    nom: "Démarches concertées – Contrats milieux aquatiques",
    unite: "nb contrats",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 34, valeur_amplitude: 5
  },
  {
    id: "GO-PP-EAU-04",
    categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes – gestion de l'eau",
    sous_thematique: "PTGE",
    nom: "Démarches concertées de gestion de la ressource (PTGE)",
    unite: "nb contrats",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 7, valeur_amplitude: 2
  },

  // Thématique : Plans et programmes – risques naturels
  {
    id: "GO-PP-RI-01",
    categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes – risques naturels",
    sous_thematique: "PAPI",
    nom: "Programme d'Actions de Prévention des Inondations (PAPI)",
    unite: "nb PAPI",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 11, valeur_amplitude: 2
  },
  {
    id: "GO-PP-RI-02",
    categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes – risques naturels",
    sous_thematique: "SLGRI",
    nom: "Stratégie Locale de Gestion du Risque Inondation (SLGRI)",
    unite: "nb SLGRI",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 8, valeur_amplitude: 2
  },
  {
    id: "GO-PP-RI-03",
    categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes – risques naturels",
    sous_thematique: "PPRI",
    nom: "Plans de Prévention des Risques Inondation (PPRI)",
    unite: "linéaire km",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 2800, valeur_amplitude: 300
  },

  // Thématique : Documents d'urbanisme
  {
    id: "GO-URB-01",
    categorie: "Gouvernance de l'eau",
    thematique: "Documents d'urbanisme",
    sous_thematique: "SCoT",
    nom: "Couverture et avancement des SCoT",
    unite: "km²",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 38000, valeur_amplitude: 3000
  },
  {
    id: "GO-URB-02",
    categorie: "Gouvernance de l'eau",
    thematique: "Documents d'urbanisme",
    sous_thematique: "SCoT",
    nom: "SCoT intégrant la gestion des eaux pluviales à la source",
    unite: "oui / non / partiellement",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: null, valeur_amplitude: null
  },
  {
    id: "GO-URB-03",
    categorie: "Gouvernance de l'eau",
    thematique: "Documents d'urbanisme",
    sous_thematique: "PLU/PLUi",
    nom: "Documents d'urbanisme locaux (CC/POS/PLU/PLUi)",
    unite: "nb communes",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 1742, valeur_amplitude: 50
  },
  {
    id: "GO-URB-04",
    categorie: "Gouvernance de l'eau",
    thematique: "Documents d'urbanisme",
    sous_thematique: "Imperméabilisation",
    nom: "Surface désimperméabilisée",
    unite: "%",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: 3.2, valeur_amplitude: 1.2
  },

  // Thématique : Coûts de la gestion de l'eau
  {
    id: "GO-COUT-01",
    categorie: "Gouvernance de l'eau",
    thematique: "Coûts de la gestion de l'eau",
    sous_thematique: "Tarification",
    nom: "Prix de l'eau",
    unite: "€/m³",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 2.35, valeur_amplitude: 0.9
  },
  {
    id: "GO-COUT-02",
    categorie: "Gouvernance de l'eau",
    thematique: "Coûts de la gestion de l'eau",
    sous_thematique: "Investissements",
    nom: "Coût de la gestion de l'eau",
    unite: "€/unité hydrographique",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 4800000, valeur_amplitude: 1200000
  },

  // ────────────────────────────────────────────────────────────────────────
  // CATÉGORIE : Climat / risques climatiques
  // ────────────────────────────────────────────────────────────────────────

  // Thématique : Normales climatiques
  {
    id: "CL-NOR-TEMP-01",
    categorie: "Climat / risques climatiques",
    thematique: "Normales climatiques",
    sous_thematique: "Température",
    nom: "Températures moyennes annuelles",
    unite: "°C",
    echelle_territoire: "région Grand Est / Masse d'eau",
    annee: "Multiple",
    valeur_base: 10.8, valeur_amplitude: 2.5
  },
  {
    id: "CL-NOR-PREC-01",
    categorie: "Climat / risques climatiques",
    thematique: "Normales climatiques",
    sous_thematique: "Précipitations",
    nom: "Cumuls de précipitations annuels",
    unite: "mm",
    echelle_territoire: "région Grand Est / Masse d'eau",
    annee: "Multiple",
    valeur_base: 680, valeur_amplitude: 180
  },
  {
    id: "CL-NOR-ETP-01",
    categorie: "Climat / risques climatiques",
    thematique: "Normales climatiques",
    sous_thematique: "ETP",
    nom: "ETP annuelle",
    unite: "mm",
    echelle_territoire: "région Grand Est / Masse d'eau",
    annee: "Multiple",
    valeur_base: 610, valeur_amplitude: 90
  },

  // Thématique : Évolution climat futur
  {
    id: "CL-FUT-TEMP-01",
    categorie: "Climat / risques climatiques",
    thematique: "Évolution climat futur",
    sous_thematique: "Projection des températures",
    nom: "Carte des écarts de températures en climat futur (horizon 2050)",
    unite: "°C",
    echelle_territoire: "région Grand Est / Masse d'eau",
    annee: "Multiple",
    valeur_base: 1.8, valeur_amplitude: 0.6
  },
  {
    id: "CL-FUT-PREC-01",
    categorie: "Climat / risques climatiques",
    thematique: "Évolution climat futur",
    sous_thematique: "Projection des précipitations",
    nom: "Carte des écarts de précipitation en climat futur (horizon 2050)",
    unite: "mm",
    echelle_territoire: "région Grand Est / Masse d'eau",
    annee: "Multiple",
    valeur_base: -42, valeur_amplitude: 30
  },
  {
    id: "CL-FUT-ETP-01",
    categorie: "Climat / risques climatiques",
    thematique: "Évolution climat futur",
    sous_thematique: "Projection de l'ETP",
    nom: "Carte des écarts d'ETP en climat futur (horizon 2050)",
    unite: "mm",
    echelle_territoire: "région Grand Est / Masse d'eau",
    annee: "Multiple",
    valeur_base: 85, valeur_amplitude: 25
  },

  // Thématique : Risques climatiques
  {
    id: "CL-RI-INO-01",
    categorie: "Climat / risques climatiques",
    thematique: "Risques climatiques",
    sous_thematique: "Inondation",
    nom: "Nombre d'arrêtés CatNat inondation",
    unite: "nb arrêtés",
    echelle_territoire: "communes",
    annee: "Multiple",
    valeur_base: 28, valeur_amplitude: 15
  },
  {
    id: "CL-RI-INO-02",
    categorie: "Climat / risques climatiques",
    thematique: "Risques climatiques",
    sous_thematique: "Inondation",
    nom: "Repères de crue",
    unite: "nb repères",
    echelle_territoire: "région Grand Est / Masse d'eau",
    annee: "Multiple",
    valeur_base: 145, valeur_amplitude: 40
  },
  {
    id: "CL-RI-INO-03",
    categorie: "Climat / risques climatiques",
    thematique: "Risques climatiques",
    sous_thematique: "Inondation",
    nom: "Évolution des débits de crue (Q90)",
    unite: "m³/s",
    echelle_territoire: "stations de suivi",
    annee: "Multiple",
    valeur_base: 320, valeur_amplitude: 120
  },
  {
    id: "CL-RI-SEC-01",
    categorie: "Climat / risques climatiques",
    thematique: "Risques climatiques",
    sous_thematique: "Sécheresse",
    nom: "Évolution des sécheresses météorologiques",
    unite: "jours",
    echelle_territoire: "région Grand Est / Masse d'eau",
    annee: "Multiple",
    valeur_base: 38, valeur_amplitude: 18
  },

  // Thématique : Hydrologie (projections)
  {
    id: "CL-HYD-01",
    categorie: "Climat / risques climatiques",
    thematique: "Hydrologie",
    sous_thematique: "Projection des pluies efficaces",
    nom: "Projection de la recharge des nappes",
    unite: "mm",
    echelle_territoire: "région Grand Est / Masse d'eau",
    annee: "Multiple",
    valeur_base: 220, valeur_amplitude: 60
  },

  // Thématique : Vulnérabilité
  {
    id: "CL-VUL-01",
    categorie: "Climat / risques climatiques",
    thematique: "Vulnérabilité",
    sous_thematique: "Vulnérabilité au changement climatique",
    nom: "Vulnérabilité au changement climatique",
    unite: "indice",
    echelle_territoire: "sous BV",
    annee: "Année précise",
    valeur_base: 0.52, valeur_amplitude: 0.25
  },

  // ────────────────────────────────────────────────────────────────────────
  // CATÉGORIE : Usages sectoriels de l'eau
  // ────────────────────────────────────────────────────────────────────────

  // Thématique : Occupation du sol
  {
    id: "US-OCC-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Occupation du sol",
    sous_thematique: "Occupation du sol",
    nom: "Occupation du sol (par type)",
    unite: "km²",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: 5800, valeur_amplitude: 800
  },

  // Thématique : Prélèvements & consommation
  {
    id: "US-PREL-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Prélèvement & consommation d'eau",
    sous_thematique: "Prélèvement annuel",
    nom: "Prélèvement et consommation d'eau annuelle (tous usages)",
    unite: "m³/an",
    echelle_territoire: "région Grand Est / BV",
    annee: "Multiple",
    valeur_base: 520000000, valeur_amplitude: 80000000
  },
  {
    id: "US-PREL-02",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Prélèvement & consommation d'eau",
    sous_thematique: "Prélèvement étiage",
    nom: "Prélèvement et consommation d'eau à l'étiage",
    unite: "m³/étiage",
    echelle_territoire: "région Grand Est / BV",
    annee: "Multiple",
    valeur_base: 85000000, valeur_amplitude: 20000000
  },

  // Thématique : Eau potable (Usages)
  {
    id: "US-AEP-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable",
    sous_thematique: "Prélèvement AEP",
    nom: "Prélèvement d'eau pour l'alimentation en eau potable",
    unite: "m³/an",
    echelle_territoire: "région Grand Est / points AEP",
    annee: "Multiple",
    valeur_base: 320000000, valeur_amplitude: 50000000
  },
  {
    id: "US-AEP-02",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable",
    sous_thematique: "Rendement réseau",
    nom: "Fuites d'eau – Rendement des réseaux AEP",
    unite: "%",
    echelle_territoire: "région Grand Est / collectivités distribution",
    annee: "Multiple",
    valeur_base: 78, valeur_amplitude: 12
  },
  {
    id: "US-AEP-03",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable",
    sous_thematique: "Rendement réseau",
    nom: "Indice Linéaire de Pertes (ILP) des réseaux AEP",
    unite: "m³/km/j",
    echelle_territoire: "région Grand Est / collectivités distribution",
    annee: "Multiple",
    valeur_base: 3.4, valeur_amplitude: 1.8
  },
  {
    id: "US-AEP-04",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable",
    sous_thematique: "Qualité eau distribuée",
    nom: "Qualité de l'eau distribuée – Conformité bactériologie",
    unite: "%",
    echelle_territoire: "région Grand Est / collectivités distribution",
    annee: "Multiple",
    valeur_base: 97.2, valeur_amplitude: 3.5
  },
  {
    id: "US-AEP-05",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable",
    sous_thematique: "Qualité eau distribuée",
    nom: "Qualité de l'eau distribuée – Conformité physico-chimie",
    unite: "%",
    echelle_territoire: "région Grand Est / collectivités distribution",
    annee: "Multiple",
    valeur_base: 94.8, valeur_amplitude: 4.5
  },
  {
    id: "US-AEP-06",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable",
    sous_thematique: "AAC",
    nom: "Avancement des procédures de reconquête qualité sur les AAC",
    unite: "% avancement",
    echelle_territoire: "région Grand Est / AAC",
    annee: "Multiple",
    valeur_base: 54, valeur_amplitude: 20
  },
  {
    id: "US-AEP-07",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable",
    sous_thematique: "AAC",
    nom: "Contractualisation agricole sur les AAC (surface MAE)",
    unite: "%",
    echelle_territoire: "région Grand Est / AAC",
    annee: "Multiple",
    valeur_base: 38, valeur_amplitude: 18
  },
  {
    id: "US-AEP-08",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable",
    sous_thematique: "Conformité captages",
    nom: "Conformité des captages AEP",
    unite: "%",
    echelle_territoire: "région Grand Est / points AEP",
    annee: "Multiple",
    valeur_base: 82, valeur_amplitude: 10
  },

  // Thématique : Industrie
  {
    id: "US-IND-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Industrie",
    sous_thematique: "ICPE",
    nom: "Installations Classées pour la Protection de l'Environnement (ICPE)",
    unite: "nb ICPE",
    echelle_territoire: "région Grand Est / ICPE",
    annee: "Multiple",
    valeur_base: 840, valeur_amplitude: 80
  },
  {
    id: "US-IND-02",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Industrie",
    sous_thematique: "Prélèvement industrie",
    nom: "Prélèvement d'eau pour l'industrie",
    unite: "m³/an",
    echelle_territoire: "région Grand Est / points prélèvement",
    annee: "Multiple",
    valeur_base: 48000000, valeur_amplitude: 12000000
  },
  {
    id: "US-IND-03",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Industrie",
    sous_thematique: "Sites pollués",
    nom: "Sites et sols pollués",
    unite: "nb sites",
    echelle_territoire: "région Grand Est / sites industriels",
    annee: "Multiple",
    valeur_base: 1240, valeur_amplitude: 120
  },

  // Thématique : Agriculture – Irrigation
  {
    id: "US-AGR-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Agriculture – Irrigation",
    sous_thematique: "Prélèvement irrigation",
    nom: "Prélèvement d'eau pour l'irrigation",
    unite: "m³/an",
    echelle_territoire: "région Grand Est / points prélèvement",
    annee: "Multiple",
    valeur_base: 92000000, valeur_amplitude: 25000000
  },
  {
    id: "US-AGR-02",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Agriculture – Irrigation",
    sous_thematique: "Occupation agricole",
    nom: "Surface Agricole Utilisée (SAU) – part communale",
    unite: "%",
    echelle_territoire: "région Grand Est / communes",
    annee: "Multiple",
    valeur_base: 54, valeur_amplitude: 18
  },
  {
    id: "US-AGR-03",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Agriculture – Irrigation",
    sous_thematique: "Occupation agricole",
    nom: "Surface Agricole Utilisée (SAU) irriguée",
    unite: "%",
    echelle_territoire: "région Grand Est / communes",
    annee: "Multiple",
    valeur_base: 8.4, valeur_amplitude: 5.2
  },
  {
    id: "US-AGR-04",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Agriculture – Irrigation",
    sous_thematique: "Élevage",
    nom: "Nombre d'animaux d'élevage (UGB)",
    unite: "UGB / commune",
    echelle_territoire: "région Grand Est / communes",
    annee: "Multiple",
    valeur_base: 4200, valeur_amplitude: 1800
  },
  {
    id: "US-AGR-05",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Agriculture – Irrigation",
    sous_thematique: "Zones vulnérables",
    nom: "Zones vulnérables (directive Nitrates)",
    unite: "nb communes en ZV",
    echelle_territoire: "région Grand Est / communes",
    annee: "Multiple",
    valeur_base: 620, valeur_amplitude: 40
  },

  // Thématique : Canaux de navigation
  {
    id: "US-CAN-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Canaux de navigation",
    sous_thematique: "Navigation loisirs",
    nom: "Navigation de loisirs sur les canaux",
    unite: "bateaux/an",
    echelle_territoire: "région Grand Est / canaux",
    annee: "Multiple",
    valeur_base: 18400, valeur_amplitude: 4200
  },
  {
    id: "US-CAN-02",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Canaux de navigation",
    sous_thematique: "Navigation commerciale",
    nom: "Fréquentation des canaux par la navigation commerciale",
    unite: "tonnes/an",
    echelle_territoire: "région Grand Est / canaux",
    annee: "Multiple",
    valeur_base: 8200000, valeur_amplitude: 1500000
  },

  // Thématique : Activités de loisirs
  {
    id: "US-LOI-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Activités de loisirs liées à l'eau",
    sous_thematique: "Baignade",
    nom: "Qualité d'eau pour la baignade",
    unite: "classe qualité",
    echelle_territoire: "région Grand Est / sites baignade",
    annee: "Multiple",
    valeur_base: null, valeur_amplitude: null
  },

  // Thématique : Rejets STEP
  {
    id: "US-STEP-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Rejets des stations d'épuration",
    sous_thematique: "Rejets annuels",
    nom: "Rejets annuels par les STEP collectives et industrielles",
    unite: "m³/an",
    echelle_territoire: "région Grand Est / BV",
    annee: "Multiple",
    valeur_base: 185000000, valeur_amplitude: 35000000
  },
  {
    id: "US-STEP-02",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Rejets des stations d'épuration",
    sous_thematique: "Rejets étiage",
    nom: "Rejets étiage par les STEP collectives et industrielles",
    unite: "m³/étiage",
    echelle_territoire: "région Grand Est / BV",
    annee: "Multiple",
    valeur_base: 22000000, valeur_amplitude: 6000000
  },

  // Thématique : Assainissement collectif
  {
    id: "US-ASC-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Assainissement collectif",
    sous_thematique: "Zones sensibles",
    nom: "Zones sensibles (directive ERU)",
    unite: "nb communes en ZS",
    echelle_territoire: "région Grand Est / communes",
    annee: "Multiple",
    valeur_base: 480, valeur_amplitude: 35
  },
  {
    id: "US-ASC-02",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Assainissement collectif",
    sous_thematique: "STEP collectivités",
    nom: "Caractéristiques des STEP des collectivités (capacité EH)",
    unite: "EH",
    echelle_territoire: "région Grand Est / STEP",
    annee: "Multiple",
    valeur_base: 15000, valeur_amplitude: 8000
  },
  {
    id: "US-ASC-03",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Assainissement collectif",
    sous_thematique: "STEP collectivités",
    nom: "Conformité équipement des STEP des collectivités",
    unite: "conforme / non conforme",
    echelle_territoire: "région Grand Est / STEP",
    annee: "Multiple",
    valeur_base: null, valeur_amplitude: null
  },
  {
    id: "US-ASC-04",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Assainissement collectif",
    sous_thematique: "STEP collectivités",
    nom: "Conformité performance des STEP des collectivités",
    unite: "conforme / non conforme",
    echelle_territoire: "région Grand Est / STEP",
    annee: "Multiple",
    valeur_base: null, valeur_amplitude: null
  },

  // Thématique : Assainissement non collectif
  {
    id: "US-ANC-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Assainissement non collectif",
    sous_thematique: "Part ANC",
    nom: "Part des installations ANC à la commune",
    unite: "%",
    echelle_territoire: "région Grand Est / communes",
    annee: "Multiple",
    valeur_base: 22, valeur_amplitude: 10
  },
  {
    id: "US-ANC-02",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Assainissement non collectif",
    sous_thematique: "Conformité ANC",
    nom: "Taux de conformité des installations ANC",
    unite: "%",
    echelle_territoire: "région Grand Est / communes",
    annee: "Multiple",
    valeur_base: 64, valeur_amplitude: 16
  },

  // Thématique : Assainissement industriel
  {
    id: "US-ASI-01",
    categorie: "Usages sectoriels de l'eau",
    thematique: "Assainissement industriel",
    sous_thematique: "STEP industrielles",
    nom: "Caractéristiques des STEP industrielles (capacité EH)",
    unite: "EH",
    echelle_territoire: "région Grand Est / STEP industrielles",
    annee: "Multiple",
    valeur_base: 45000, valeur_amplitude: 18000
  },

  // ────────────────────────────────────────────────────────────────────────
  // CATÉGORIE : Gestion quantitative de l'eau
  // ────────────────────────────────────────────────────────────────────────

  // Thématique : Connaissance – Équilibre quantitatif
  {
    id: "GQ-CON-01",
    categorie: "Gestion quantitative de l'eau",
    thematique: "Connaissance",
    sous_thematique: "Équilibre quantitatif",
    nom: "Zones à risque quantitatif (SDAGE)",
    unite: "nb zones",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 12, valeur_amplitude: 3
  },
  {
    id: "GQ-CON-02",
    categorie: "Gestion quantitative de l'eau",
    thematique: "Connaissance",
    sous_thematique: "Équilibre quantitatif",
    nom: "Zones de Répartition des Eaux (ZRE)",
    unite: "nb ZRE",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 8, valeur_amplitude: 2
  },

  // Thématique : Caractérisation de la ressource – Hydrologie
  {
    id: "GQ-RES-HYD-01",
    categorie: "Gestion quantitative de l'eau",
    thematique: "Caractérisation de la ressource",
    sous_thematique: "Hydrologie",
    nom: "Régime hydrologique moyen",
    unite: "m³/s",
    echelle_territoire: "stations de suivi",
    annee: "Multiple",
    valeur_base: 185, valeur_amplitude: 80
  },
  {
    id: "GQ-RES-HYD-02",
    categorie: "Gestion quantitative de l'eau",
    thematique: "Caractérisation de la ressource",
    sous_thematique: "Hydrologie",
    nom: "Hydrologie d'étiage (QMNA)",
    unite: "m³/s",
    echelle_territoire: "stations de suivi",
    annee: "Multiple",
    valeur_base: 28, valeur_amplitude: 18
  },

  // Thématique : Gestion – Sécheresse
  {
    id: "GQ-GES-SEC-01",
    categorie: "Gestion quantitative de l'eau",
    thematique: "Gestion",
    sous_thematique: "Suivi sécheresse",
    nom: "Arrêtés cadres sécheresse",
    unite: "nb arrêtés",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 24, valeur_amplitude: 8
  },
  {
    id: "GQ-GES-SEC-02",
    categorie: "Gestion quantitative de l'eau",
    thematique: "Gestion",
    sous_thematique: "Suivi sécheresse",
    nom: "Déclenchement des restrictions sécheresse",
    unite: "nb jours de restriction",
    echelle_territoire: "région Grand Est",
    annee: "Multiple",
    valeur_base: 42, valeur_amplitude: 28
  },

  // Thématique : Gestion des prélèvements
  {
    id: "GQ-GES-PREL-01",
    categorie: "Gestion quantitative de l'eau",
    thematique: "Gestion",
    sous_thematique: "Gestion des prélèvements",
    nom: "Volumes prélevables opposables",
    unite: "m³/an",
    echelle_territoire: "région Grand Est",
    annee: "Année précise",
    valeur_base: 145000000, valeur_amplitude: 30000000
  }

];

// ── Enrichissement automatique : ajout valeurs fictives par département / année ──
// (exécuté une seule fois à l'initialisation)
(function enrichirIndicateurs() {
  INDICATEURS_CARTO.forEach(function(ind) {
    if (ind.valeur_base !== null) {
      // Valeurs par département Grand Est
      ind.valeurs_par_territoire = genValeursDepts(ind.valeur_base, ind.valeur_amplitude, parseInt(ind.id.replace(/\D/g, '').slice(0, 5) || '1'));
      // Valeurs par année 2015→2026
      var tendance = 0;
      // Quelques indicateurs ont une tendance temporelle réaliste
      if (ind.unite === '°C') tendance = 0.05;         // réchauffement
      if (ind.unite === 'mm' && ind.valeur_base < 800) tendance = -4; // baisse précipitations
      if (ind.unite === '%' && ind.nom.indexOf('écologique') !== -1) tendance = 0.8; // amélioration DCE
      ind.valeurs_par_annee = genValeursAnnees(ind.valeur_base, ind.valeur_amplitude, parseInt(ind.id.replace(/\D/g, '').slice(0, 5) || '1'), tendance);
    } else {
      ind.valeurs_par_territoire = null;
      ind.valeurs_par_annee = null;
    }
  });
})();


// ============================================================
// 3. INDICATEURS DASHBOARD
//    Chaque entrée référence un indicateur de INDICATEURS_CARTO via carto_id.
//    Les champs valeurs_exemple / valeur_exemple sont remplis automatiquement
//    depuis les données générées (valeurs_par_territoire / valeurs_par_annee)
//    par la IIFE enrichirDashboard() exécutée après INDICATEURS_CARTO.
// ============================================================

var INDICATEURS_DASHBOARD = [

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  THÈME 1 – GOUVERNANCE & ACTIONS MENÉES                     ║
  // ╚══════════════════════════════════════════════════════════════╝

  {
    id: "DB-GOV-01", theme: "gouvernance",
    nom: "Couverture et avancement des SAGE",
    unite: "nb SAGE", categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes – gestion de l'eau",
    sous_thematique: "SAGE",
    widget_type: "progress_list", couleur: "#1B5E20", icone: "fa-list-check",
    stades_sage: { "Approuvé – Mis en œuvre": 8, "En révision": 3, "En instruction": 4, "En élaboration": 5, "Non engagé": 2 },
    valeurs_exemple: { "Approuvé – Mis en œuvre": 8, "En révision": 3, "En instruction": 4, "En élaboration": 5, "Non engagé": 2 },
    description: "Avancement des Schémas d'Aménagement et de Gestion des Eaux – SDAGE / EPTB / EPAGE"
  },

  {
    id: "DB-GOV-02", theme: "gouvernance",
    nom: "Budget eau – investissements collectivités",
    unite: "M€/an", categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes", sous_thematique: "Budget eau",
    widget_type: "kpi", couleur: "#1565C0", icone: "fa-euro-sign",
    valeur_exemple: 4.2, valeur_affichee: 4.2, unite_affichee: "M€",
    evolution: "+8 %",
    valeurs_par_annee: { 2015:2.4, 2016:2.6, 2017:2.8, 2018:3.0, 2019:3.2, 2020:3.5, 2021:3.7, 2022:3.9, 2023:4.2, 2024:4.5, 2025:4.8, 2026:5.0 },
    description: "Investissements annuels eau potable, assainissement et protection des milieux aquatiques"
  },

  {
    id: "DB-GOV-03", theme: "gouvernance",
    nom: "Contrats de milieux actifs (SAGE, contrats rivière, PAT)",
    unite: "contrats", categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes", sous_thematique: "Contractualisation",
    widget_type: "bar", couleur: "#0288D1", icone: "fa-file-contract",
    valeurs_exemple: { "SAGE": 8, "Contrats rivière": 5, "PAT": 12, "PAPI": 3, "Contrats territoriaux": 7, "ZRE déclarées": 2 },
    valeurs_par_annee: { 2015:20, 2016:22, 2017:24, 2018:27, 2019:29, 2020:31, 2021:33, 2022:34, 2023:37, 2024:39, 2025:41, 2026:43 },
    description: "Nombre de contrats de gestion territoriale de l'eau actifs sur le territoire"
  },

  {
    id: "DB-GOV-04", theme: "gouvernance",
    nom: "Taux de couverture SAGE du territoire",
    unite: "%", categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes", sous_thematique: "SAGE",
    widget_type: "gauge", couleur: "#2E7D32", icone: "fa-circle-check",
    valeur_exemple: 78,
    valeurs_par_territoire: { "Ardennes (08)":72, "Aube (10)":68, "Marne (51)":81, "Haute-Marne (52)":58, "Meurthe-et-Moselle (54)":85, "Meuse (55)":75, "Moselle (57)":88, "Bas-Rhin (67)":95, "Haut-Rhin (68)":91, "Vosges (88)":79 },
    valeurs_par_annee: { 2015:62, 2016:64, 2017:66, 2018:68, 2019:70, 2020:72, 2021:74, 2022:76, 2023:78, 2024:80, 2025:82, 2026:83 },
    description: "Part du territoire couverte par un SAGE approuvé ou en cours d'élaboration"
  },

  {
    id: "DB-GOV-05", theme: "gouvernance",
    nom: "Actions eau réalisées dans les bilans annuels",
    unite: "actions/an", categorie: "Gouvernance de l'eau",
    thematique: "Plans et programmes", sous_thematique: "Bilan actions",
    widget_type: "kpi", couleur: "#F57F17", icone: "fa-circle-check",
    valeur_exemple: 14, valeur_affichee: 14, unite_affichee: "/ an",
    evolution: "+3 vs 2022",
    valeurs_par_annee: { 2015:6, 2016:7, 2017:7, 2018:8, 2019:9, 2020:10, 2021:11, 2022:11, 2023:14, 2024:15, 2025:16, 2026:17 },
    description: "Nombre d'actions eau inscrites et réalisées dans les bilans annuels des collectivités"
  },

  {
    id: "DB-GOV-06", theme: "gouvernance",
    nom: "Nombre d'arrêtés CatNat inondation",
    unite: "nb arrêtés", categorie: "Gouvernance de l'eau",
    thematique: "Risques – procédures", sous_thematique: "CatNat inondation",
    widget_type: "kpi", couleur: "#E65100", icone: "fa-triangle-exclamation",
    valeur_exemple: 247, valeur_affichee: 247, unite_affichee: "arrêtés",
    evolution: "+18",
    valeurs_par_annee: { 2015:141, 2016:163, 2017:152, 2018:178, 2019:169, 2020:194, 2021:188, 2022:203, 2023:247, 2024:231, 2025:258, 2026:244 },
    description: "Nombre cumulé d'arrêtés de catastrophe naturelle liés aux inondations – GASPAR / DGPR"
  },

  {
    id: "DB-GOV-07", theme: "gouvernance",
    nom: "Cumuls de précipitations annuels",
    unite: "mm", categorie: "Gouvernance de l'eau",
    thematique: "Contexte climatique", sous_thematique: "Précipitations",
    widget_type: "line", couleur: "#0277BD", icone: "fa-cloud-rain",
    valeurs_exemple: { 2015:612, 2016:704, 2017:672, 2018:541, 2019:638, 2020:728, 2021:689, 2022:518, 2023:574, 2024:603, 2025:588, 2026:561 },
    valeurs_par_annee: { 2015:612, 2016:704, 2017:672, 2018:541, 2019:638, 2020:728, 2021:689, 2022:518, 2023:574, 2024:603, 2025:588, 2026:561 },
    description: "Évolution des cumuls de précipitations annuels – Météo-France / DRIAS"
  },

  {
    id: "DB-GOV-08", theme: "gouvernance",
    nom: "Partenaires financeurs eau identifiés",
    unite: "acteurs", categorie: "Gouvernance de l'eau",
    thematique: "Financement", sous_thematique: "Partenaires",
    widget_type: "donut", couleur: "#6A1B9A", icone: "fa-handshake",
    valeurs_exemple: { "Agences de l'eau": 3, "Région Grand Est": 1, "FEDER/FEADER": 2, "Conseils dép.": 10, "État (DETR)": 1 },
    valeurs_par_annee: { 2015:12, 2016:13, 2017:14, 2018:15, 2019:15, 2020:16, 2021:16, 2022:17, 2023:17, 2024:17, 2025:18, 2026:18 },
    description: "Répartition des partenaires financeurs des actions eau sur le territoire"
  },

  {
    id: "DB-GOV-09", theme: "gouvernance",
    nom: "Prélèvements par usage (tous usages)",
    unite: "M m³/an", categorie: "Gouvernance de l'eau",
    thematique: "Prélèvements", sous_thematique: "Prélèvement annuel",
    widget_type: "heatmap_bar", couleur: "#1565C0", icone: "fa-faucet",
    valeurs_exemple: { "Ardennes":38.4, "Aube":51.2, "Marne":74.8, "Haute-Marne":24.3, "M-et-Moselle":62.7, "Meuse":19.6, "Moselle":88.1, "Bas-Rhin":93.4, "Haut-Rhin":71.5, "Vosges":29.8 },
    valeurs_par_annee: { 2015:563, 2016:548, 2017:571, 2018:592, 2019:576, 2020:558, 2021:569, 2022:584, 2023:553, 2024:541, 2025:537, 2026:528 },
    description: "Volume total prélevé annuellement par département (tous usages) – Agence de l'eau"
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  THÈME 2 – AMÉNAGEMENT DU TERRITOIRE & ZONAGE              ║
  // ╚══════════════════════════════════════════════════════════════╝

  {
    id: "DB-AME-01", theme: "amenagement",
    nom: "Surface de zones humides référencées",
    unite: "km²", categorie: "Connaissance des milieux aquatiques",
    thematique: "Zonage", sous_thematique: "Zones humides",
    widget_type: "minimap", couleur: "#2E7D32", icone: "fa-map-location",
    valeurs_par_territoire: { "Ardennes (08)":148, "Aube (10)":204, "Marne (51)":186, "Haute-Marne (52)":92, "Meurthe-et-Moselle (54)":113, "Meuse (55)":87, "Moselle (57)":124, "Bas-Rhin (67)":185, "Haut-Rhin (68)":142, "Vosges (88)":143 },
    valeurs_par_annee: { 2015:1392, 2016:1398, 2017:1402, 2018:1407, 2019:1411, 2020:1415, 2021:1418, 2022:1420, 2023:1424, 2024:1428, 2025:1431, 2026:1434 },
    valeur_exemple: 1424,
    description: "Répartition cartographique des surfaces de zones humides référencées (Ramsar + ZNIEFF + Natura 2000 + PNR)"
  },

  {
    id: "DB-AME-02", theme: "amenagement",
    nom: "Zones humides – taux de protection",
    unite: "%", categorie: "Aménagement & Zonage",
    thematique: "Zonage", sous_thematique: "Protection zones humides",
    widget_type: "gauge", couleur: "#388E3C", icone: "fa-shield-halved",
    valeur_exemple: 34,
    valeurs_par_territoire: { "Ardennes (08)":28, "Aube (10)":41, "Marne (51)":32, "Haute-Marne (52)":38, "Meurthe-et-Moselle (54)":31, "Meuse (55)":27, "Moselle (57)":29, "Bas-Rhin (67)":48, "Haut-Rhin (68)":52, "Vosges (88)":44 },
    valeurs_par_annee: { 2015:22, 2016:24, 2017:25, 2018:27, 2019:28, 2020:30, 2021:31, 2022:33, 2023:34, 2024:36, 2025:37, 2026:38 },
    description: "Part des zones humides protégées par un statut réglementaire (APB, RN, Ramsar, ENS)"
  },

  {
    id: "DB-AME-03", theme: "amenagement",
    nom: "Surfaces imperméabilisées par département",
    unite: "%", categorie: "Aménagement & Zonage",
    thematique: "Occupation des sols", sous_thematique: "Imperméabilisation",
    widget_type: "bar", couleur: "#455A64", icone: "fa-city",
    valeurs_exemple: { "Ardennes":8.2, "Aube":6.4, "Marne":7.1, "Haute-Marne":5.8, "M-et-Moselle":11.3, "Meuse":5.2, "Moselle":13.7, "Bas-Rhin":18.4, "Haut-Rhin":14.2, "Vosges":7.9 },
    valeurs_par_annee: { 2015:9.2, 2016:9.4, 2017:9.6, 2018:9.8, 2019:10.0, 2020:10.2, 2021:10.3, 2022:10.4, 2023:10.6, 2024:10.7, 2025:10.8, 2026:10.9 },
    description: "Part de surfaces artificialisées et imperméabilisées par département (Corine Land Cover)"
  },

  {
    id: "DB-AME-04", theme: "amenagement",
    nom: "Espaces naturels protégés (Natura 2000 + RN + APB)",
    unite: "%", categorie: "Aménagement & Zonage",
    thematique: "Zonage", sous_thematique: "Espaces naturels",
    widget_type: "kpi", couleur: "#1B5E20", icone: "fa-leaf",
    valeur_exemple: 29, valeur_affichee: 29, unite_affichee: "%",
    evolution: "+2 pts",
    valeurs_par_annee: { 2015:22, 2016:23, 2017:24, 2018:25, 2019:26, 2020:27, 2021:27, 2022:28, 2023:29, 2024:30, 2025:31, 2026:31 },
    description: "Part du territoire couverte par des espaces naturels protégés"
  },

  {
    id: "DB-AME-05", theme: "amenagement",
    nom: "Communes situées en zone inondable (PPRi)",
    unite: "communes", categorie: "Aménagement & Zonage",
    thematique: "Risques", sous_thematique: "Inondation / PPRi",
    widget_type: "kpi", couleur: "#D84315", icone: "fa-house-flood-water",
    valeur_exemple: 312, valeur_affichee: 312, unite_affichee: "communes",
    evolution: "stable",
    valeurs_par_annee: { 2015:298, 2016:300, 2017:302, 2018:304, 2019:306, 2020:308, 2021:309, 2022:310, 2023:312, 2024:312, 2025:312, 2026:313 },
    description: "Nombre de communes avec un plan de prévention du risque inondation (PPRi) approuvé ou prescrit"
  },

  {
    id: "DB-AME-06", theme: "amenagement",
    nom: "Répartition occupation des sols liée à l'eau",
    unite: "%", categorie: "Aménagement & Zonage",
    thematique: "Occupation des sols", sous_thematique: "Usages eau",
    widget_type: "donut", couleur: "#00695C", icone: "fa-chart-pie",
    valeurs_exemple: { "Zones humides": 12, "Prairies (risque lessivage)": 31, "Cultures irriguées": 18, "Forêts (recharge nappes)": 28, "Zones artificialisées": 11 },
    valeurs_par_annee: { 2015:9, 2016:10, 2017:10, 2018:11, 2019:11, 2020:12, 2021:12, 2022:12, 2023:12, 2024:12, 2025:13, 2026:13 },
    description: "Répartition de l'occupation du sol selon les usages liés à l'eau – Corine Land Cover"
  },

  {
    id: "DB-AME-07", theme: "amenagement",
    nom: "Avancement des SCOT intégrant le volet eau",
    unite: "nb SCoT", categorie: "Aménagement & Zonage",
    thematique: "Planification territoriale", sous_thematique: "SCoT / eau",
    widget_type: "progress_list", couleur: "#4A148C", icone: "fa-compass-drafting",
    valeurs_exemple: { "SCoT approuvés avec volet eau": 14, "SCoT en révision": 5, "SCoT sans volet eau": 4 },
    description: "État d'avancement des SCoT intégrant un volet eau (ressource, zones humides, risques)"
  },

  {
    id: "DB-AME-08", theme: "amenagement",
    nom: "Évolution de la surface agricole irriguée",
    unite: "ha", categorie: "Aménagement & Zonage",
    thematique: "Usages agricoles", sous_thematique: "Irrigation",
    widget_type: "line", couleur: "#558B2F", icone: "fa-wheat-awn",
    valeurs_exemple: { 2015:38400, 2016:37800, 2017:39200, 2018:41000, 2019:40200, 2020:38700, 2021:39800, 2022:43200, 2023:41500, 2024:40800, 2025:40200, 2026:39600 },
    valeurs_par_annee: { 2015:38400, 2016:37800, 2017:39200, 2018:41000, 2019:40200, 2020:38700, 2021:39800, 2022:43200, 2023:41500, 2024:40800, 2025:40200, 2026:39600 },
    description: "Évolution de la surface agricole irriguée sur le territoire – Agreste / Recensement agricole"
  },

  {
    id: "DB-AME-09", theme: "amenagement",
    nom: "Prélèvements agricoles par département",
    unite: "M m³/an", categorie: "Aménagement & Zonage",
    thematique: "Prélèvements", sous_thematique: "Irrigation agricole",
    widget_type: "heatmap_bar", couleur: "#33691E", icone: "fa-tractor",
    valeurs_exemple: { "Ardennes":4.1, "Aube":18.4, "Marne":32.1, "Haute-Marne":5.2, "M-et-Moselle":3.8, "Meuse":4.3, "Moselle":5.1, "Bas-Rhin":8.2, "Haut-Rhin":11.4, "Vosges":3.2 },
    valeurs_par_annee: { 2015:98, 2016:94, 2017:102, 2018:118, 2019:109, 2020:95, 2021:103, 2022:121, 2023:95.8, 2024:93, 2025:91, 2026:89 },
    description: "Volume prélevé pour l'irrigation agricole par département – Agence de l'eau"
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  THÈME 3 – RESSOURCES & USAGES                              ║
  // ╚══════════════════════════════════════════════════════════════╝

  {
    id: "DB-RES-01", theme: "ressources",
    nom: "Qualité de l'eau distribuée – Conformité bactériologie",
    unite: "%", categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable", sous_thematique: "Qualité eau distribuée",
    widget_type: "gauge", couleur: "#1565C0", icone: "fa-droplet",
    valeur_exemple: 97.3,
    valeurs_par_territoire: { "Ardennes (08)":96.1, "Aube (10)":97.8, "Marne (51)":95.3, "Haute-Marne (52)":98.2, "Meurthe-et-Moselle (54)":97.4, "Meuse (55)":98.9, "Moselle (57)":96.8, "Bas-Rhin (67)":98.1, "Haut-Rhin (68)":97.6, "Vosges (88)":97.0 },
    valeurs_par_annee: { 2015:95.2, 2016:95.6, 2017:96.1, 2018:96.4, 2019:96.8, 2020:97.0, 2021:97.1, 2022:97.2, 2023:97.3, 2024:97.5, 2025:97.6, 2026:97.7 },
    description: "Part des analyses bactériologiques conformes sur l'ensemble des collectivités de distribution (ARS)"
  },

  {
    id: "DB-RES-02", theme: "ressources",
    nom: "État écologique des masses d'eau superficielles",
    unite: "%", categorie: "Qualité des Eaux",
    thematique: "Evaluation DCE", sous_thematique: "MESU – Eaux superficielles",
    widget_type: "donut", couleur: "#00796B", icone: "fa-water",
    valeurs_exemple: { "Très bon":9, "Bon":33, "Moyen":30, "Médiocre":19, "Mauvais":9 },
    valeurs_par_annee: { 2015:38, 2016:39, 2017:40, 2018:40, 2019:41, 2020:42, 2021:42, 2022:42, 2023:42, 2024:43, 2025:44, 2026:44 },
    description: "Répartition des masses d'eau superficielles par classe d'état écologique (directive DCE – SDAGE)"
  },

  {
    id: "DB-RES-03", theme: "ressources",
    nom: "Indice Linéaire de Pertes (ILP) des réseaux AEP",
    unite: "m³/km/j", categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable", sous_thematique: "Rendement réseau",
    widget_type: "bar", couleur: "#0288D1", icone: "fa-gauge-simple",
    valeurs_exemple: { "Ardennes":4.2, "Aube":2.9, "Marne":4.8, "Haute-Marne":2.4, "M-et-Moselle":3.6, "Meuse":2.7, "Moselle":5.1, "Bas-Rhin":3.2, "Haut-Rhin":2.8, "Vosges":3.9 },
    valeurs_par_annee: { 2015:4.8, 2016:4.6, 2017:4.4, 2018:4.2, 2019:4.0, 2020:3.8, 2021:3.7, 2022:3.6, 2023:3.6, 2024:3.5, 2025:3.4, 2026:3.4 },
    description: "Indice Linéaire de Pertes (m³ perdus par km de réseau et par jour) – SISPEA / collectivités"
  },

  {
    id: "DB-RES-04", theme: "ressources",
    nom: "Taux de conformité des installations ANC",
    unite: "%", categorie: "Usages sectoriels de l'eau",
    thematique: "Assainissement non collectif", sous_thematique: "Conformité ANC",
    widget_type: "kpi", couleur: "#6A1B9A", icone: "fa-filter-circle-xmark",
    valeur_exemple: 63.8, valeur_affichee: 63.8, unite_affichee: "%",
    evolution: "+2.1 pt",
    valeurs_par_annee: { 2015:51.2, 2016:53.0, 2017:54.8, 2018:56.3, 2019:57.9, 2020:59.4, 2021:60.7, 2022:61.7, 2023:63.8, 2024:65.2, 2025:66.8, 2026:68.1 },
    description: "Part des installations d'assainissement non collectif conformes à la réglementation – SPANC"
  },

  {
    id: "DB-RES-05", theme: "ressources",
    nom: "Consommation d'eau potable par habitant",
    unite: "L/j/hab", categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable", sous_thematique: "Consommation",
    widget_type: "kpi", couleur: "#0288D1", icone: "fa-person-drowning",
    valeur_exemple: 127, valeur_affichee: 127, unite_affichee: "L/j/hab",
    evolution: "−4 L vs 2022",
    valeurs_par_annee: { 2015:142, 2016:140, 2017:139, 2018:137, 2019:136, 2020:134, 2021:133, 2022:131, 2023:127, 2024:125, 2025:124, 2026:122 },
    description: "Consommation journalière d'eau potable par habitant – SISPEA (réf. nationale : 143 L/j/hab)"
  },

  {
    id: "DB-RES-06", theme: "ressources",
    nom: "Rendement du réseau AEP",
    unite: "%", categorie: "Usages sectoriels de l'eau",
    thematique: "Eau potable", sous_thematique: "Rendement réseau",
    widget_type: "gauge", couleur: "#00838F", icone: "fa-pipe-valve",
    valeur_exemple: 81,
    valeurs_par_territoire: { "Ardennes (08)":78, "Aube (10)":83, "Marne (51)":79, "Haute-Marne (52)":85, "Meurthe-et-Moselle (54)":82, "Meuse (55)":87, "Moselle (57)":80, "Bas-Rhin (67)":84, "Haut-Rhin (68)":86, "Vosges (88)":82 },
    valeurs_par_annee: { 2015:74, 2016:75, 2017:76, 2018:77, 2019:78, 2020:79, 2021:79, 2022:80, 2023:81, 2024:82, 2025:83, 2026:84 },
    description: "Part de l'eau mise en distribution qui atteint effectivement les abonnés – SISPEA"
  },

  {
    id: "DB-RES-07", theme: "ressources",
    nom: "Évolution des prélèvements industriels",
    unite: "M m³/an", categorie: "Usages sectoriels de l'eau",
    thematique: "Prélèvements", sous_thematique: "Usage industriel",
    widget_type: "line", couleur: "#37474F", icone: "fa-industry",
    valeurs_exemple: { 2015:198, 2016:192, 2017:188, 2018:182, 2019:176, 2020:161, 2021:168, 2022:171, 2023:164, 2024:158, 2025:154, 2026:149 },
    valeurs_par_annee: { 2015:198, 2016:192, 2017:188, 2018:182, 2019:176, 2020:161, 2021:168, 2022:171, 2023:164, 2024:158, 2025:154, 2026:149 },
    description: "Évolution des prélèvements industriels (hors énergie) – Agence de l'eau"
  },

  {
    id: "DB-RES-08", theme: "ressources",
    nom: "Avancement des procédures d'autorisation de prélèvement",
    unite: "dossiers", categorie: "Ressources & Usages",
    thematique: "Réglementation eau", sous_thematique: "Autorisations",
    widget_type: "progress_list", couleur: "#006064", icone: "fa-file-signature",
    valeurs_exemple: { "Autorisations accordées": 142, "En instruction": 28, "Dérogations actives": 14, "Refus / contentieux": 8 },
    description: "État des dossiers d'autorisation de prélèvement en eau (IOTA) – DDT / Agence de l'eau"
  },

  {
    id: "DB-RES-09", theme: "ressources",
    nom: "Prélèvement AEP par département",
    unite: "M m³/an", categorie: "Ressources & Usages",
    thematique: "Prélèvements", sous_thematique: "Eau potable",
    widget_type: "heatmap_bar", couleur: "#0277BD", icone: "fa-faucet-drip",
    valeurs_exemple: { "Ardennes":18.2, "Aube":21.4, "Marne":28.6, "Haute-Marne":10.1, "M-et-Moselle":32.4, "Meuse":8.9, "Moselle":41.2, "Bas-Rhin":48.6, "Haut-Rhin":34.1, "Vosges":16.3 },
    valeurs_par_annee: { 2015:278, 2016:272, 2017:269, 2018:265, 2019:262, 2020:258, 2021:255, 2022:252, 2023:259.8, 2024:255, 2025:251, 2026:248 },
    description: "Volume prélevé pour l'alimentation en eau potable par département – Agence de l'eau"
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  THÈME 4 – VULNÉRABILITÉ & ADAPTATION CLIMATIQUE           ║
  // ╚══════════════════════════════════════════════════════════════╝

  {
    id: "DB-VUL-01", theme: "vulnerabilite",
    nom: "Température moyenne annuelle – écart à la normale",
    unite: "°C", categorie: "Climat / risques climatiques",
    thematique: "Normales climatiques", sous_thematique: "Températures",
    widget_type: "line", couleur: "#BF360C", icone: "fa-temperature-high",
    valeurs_exemple: { 2015:+0.9, 2016:+1.1, 2017:+1.2, 2018:+1.4, 2019:+1.5, 2020:+1.6, 2021:+1.4, 2022:+1.7, 2023:+1.8, 2024:+1.9, 2025:+2.0, 2026:+2.1 },
    valeurs_par_annee: { 2015:+0.9, 2016:+1.1, 2017:+1.2, 2018:+1.4, 2019:+1.5, 2020:+1.6, 2021:+1.4, 2022:+1.7, 2023:+1.8, 2024:+1.9, 2025:+2.0, 2026:+2.1 },
    description: "Écart de la température moyenne annuelle à la normale 1981-2010 – Météo-France"
  },

  {
    id: "DB-VUL-02", theme: "vulnerabilite",
    nom: "Jours de sécheresse météorologique / an",
    unite: "jours/an", categorie: "Climat / risques climatiques",
    thematique: "Risques climatiques", sous_thematique: "Sécheresse",
    widget_type: "kpi", couleur: "#D84315", icone: "fa-sun",
    valeur_exemple: 47, valeur_affichee: 47, unite_affichee: "j/an",
    evolution: "+12 j vs 2010",
    valeurs_par_annee: { 2015:31, 2016:28, 2017:34, 2018:42, 2019:38, 2020:29, 2021:33, 2022:51, 2023:47, 2024:49, 2025:50, 2026:52 },
    description: "Jours avec déficit hydrique modéré à sévère (SPI < −1) – Météo-France / BRGM"
  },

  {
    id: "DB-VUL-03", theme: "vulnerabilite",
    nom: "Niveaux des nappes – situation par département",
    unite: "nb dpts", categorie: "Climat / risques climatiques",
    thematique: "Risques climatiques", sous_thematique: "Nappes phréatiques",
    widget_type: "bar", couleur: "#1565C0", icone: "fa-layer-group",
    valeurs_exemple: { "Niveau normal": 4, "Bas": 3, "Sous alerte": 2, "En crise": 1 },
    valeurs_par_annee: { 2015:2, 2016:1, 2017:1, 2018:3, 2019:2, 2020:1, 2021:2, 2022:4, 2023:3, 2024:3, 2025:3, 2026:4 },
    description: "Nombre de départements selon le niveau de leur nappe phréatique principale – BRGM"
  },

  {
    id: "DB-VUL-04", theme: "vulnerabilite",
    nom: "Qualité de l'eau distribuée – Conformité pesticides",
    unite: "%", categorie: "Vulnérabilité & Adaptation",
    thematique: "Eau potable – vulnérabilité", sous_thematique: "Pesticides",
    widget_type: "gauge", couleur: "#558B2F", icone: "fa-flask",
    valeur_exemple: 88.4,
    valeurs_par_territoire: { "Ardennes (08)":84.1, "Aube (10)":79.3, "Marne (51)":81.7, "Haute-Marne (52)":91.2, "Meurthe-et-Moselle (54)":89.4, "Meuse (55)":92.8, "Moselle (57)":87.6, "Bas-Rhin (67)":90.1, "Haut-Rhin (68)":88.9, "Vosges (88)":93.0 },
    valeurs_par_annee: { 2015:80.1, 2016:81.4, 2017:82.8, 2018:83.7, 2019:84.9, 2020:85.8, 2021:86.7, 2022:87.5, 2023:88.4, 2024:89.1, 2025:89.9, 2026:90.5 },
    description: "Part des analyses pesticides conformes sur les captages AEP – ARS"
  },

  {
    id: "DB-VUL-05", theme: "vulnerabilite",
    nom: "Population en zone inondable",
    unite: "hab.", categorie: "Vulnérabilité & Adaptation",
    thematique: "Risques", sous_thematique: "Inondation – exposition",
    widget_type: "kpi", couleur: "#37474F", icone: "fa-house-flood-water",
    valeur_exemple: 62000, valeur_affichee: "62 k", unite_affichee: "hab.",
    evolution: "stable (PPRi)",
    valeurs_par_annee: { 2015:63200, 2016:63000, 2017:62800, 2018:62600, 2019:62400, 2020:62200, 2021:62100, 2022:62050, 2023:62000, 2024:61900, 2025:61850, 2026:61800 },
    description: "Population résidente en zone d'aléa inondation fort ou moyen – PPRI / Géorisques"
  },

  {
    id: "DB-VUL-06", theme: "vulnerabilite",
    nom: "Arrêtés de restriction d'eau – étiages",
    unite: "arrêtés", categorie: "Vulnérabilité & Adaptation",
    thematique: "Gestion de crise", sous_thematique: "Étiages / sécheresse",
    widget_type: "kpi", couleur: "#E65100", icone: "fa-triangle-exclamation",
    valeur_exemple: 34, valeur_affichee: 34, unite_affichee: "arrêtés",
    evolution: "+11 vs 2022",
    valeurs_par_annee: { 2015:12, 2016:9, 2017:14, 2018:22, 2019:18, 2020:11, 2021:16, 2022:23, 2023:34, 2024:29, 2025:31, 2026:33 },
    description: "Nombre d'arrêtés préfectoraux de restriction d'usage de l'eau en période d'étiage – DDT"
  },

  {
    id: "DB-VUL-07", theme: "vulnerabilite",
    nom: "Risque de vulnérabilité eau par thématique",
    unite: "score", categorie: "Vulnérabilité & Adaptation",
    thematique: "Risques climatiques", sous_thematique: "Évaluation globale",
    widget_type: "progress_list", couleur: "#BF360C", icone: "fa-chart-line",
    valeurs_exemple: { "Risque sécheresse (0–100)": 72, "Stress hydrique estival": 65, "Risque inondation": 48, "Vulnérabilité AEP": 41, "Engagement adaptation": 35 },
    description: "Scores de vulnérabilité eau par risque – analyse multicritères Observatoire"
  },

  {
    id: "DB-VUL-08", theme: "vulnerabilite",
    nom: "Cours d'eau sous le QMNA5 (étiages sévères)",
    unite: "cours d'eau", categorie: "Vulnérabilité & Adaptation",
    thematique: "Risques climatiques", sous_thematique: "Étiages",
    widget_type: "donut", couleur: "#0277BD", icone: "fa-water",
    valeurs_exemple: { "Étiage sévère (< QMNA5)": 6, "Étiage modéré": 9, "Débit normal": 18, "Débit soutenu": 5 },
    valeurs_par_annee: { 2015:3, 2016:2, 2017:4, 2018:7, 2019:5, 2020:3, 2021:4, 2022:9, 2023:6, 2024:7, 2025:7, 2026:8 },
    description: "Cours d'eau principaux selon leur débit estival par rapport au QMNA5 – HYDRO / DREAL"
  },

  {
    id: "DB-VUL-09", theme: "vulnerabilite",
    nom: "Précipitations annuelles – tendance",
    unite: "mm", categorie: "Vulnérabilité & Adaptation",
    thematique: "Normales climatiques", sous_thematique: "Précipitations",
    widget_type: "heatmap_bar", couleur: "#01579B", icone: "fa-cloud-showers-heavy",
    valeurs_exemple: { "Ardennes":762, "Aube":641, "Marne":623, "Haute-Marne":834, "M-et-Moselle":758, "Meuse":801, "Moselle":812, "Bas-Rhin":619, "Haut-Rhin":902, "Vosges":1248 },
    valeurs_par_annee: { 2015:612, 2016:704, 2017:672, 2018:541, 2019:638, 2020:728, 2021:689, 2022:518, 2023:574, 2024:603, 2025:588, 2026:561 },
    description: "Précipitations annuelles moyennes par département – Météo-France / DRIAS"
  }

];

// ── Validation des widgets dashboard ──────────────────────────────────────
// Tous les indicateurs dashboard ont leurs données directement intégrées.
// Cette fonction s'assure que chaque widget dispose bien des champs requis.
(function validerDashboard() {

  INDICATEURS_DASHBOARD.forEach(function(widget) {

    // Vérification minimale
    if (!widget.nom)    console.warn('[Dashboard] Widget ' + widget.id + ' sans nom');
    if (!widget.unite)  console.warn('[Dashboard] Widget ' + widget.id + ' sans unité');

    // Garantir que valeur_affichee et unite_affichee existent pour les KPI
    if (widget.widget_type === 'kpi') {
      if (!widget.valeur_affichee) widget.valeur_affichee = widget.valeur_exemple;
      if (!widget.unite_affichee)  widget.unite_affichee  = widget.unite;
    }

    // Garantir que valeurs_exemple existe pour progress_list
    if (widget.widget_type === 'progress_list' && !widget.valeurs_exemple) {
      widget.valeurs_exemple = widget.stades_sage || {};
    }
  });

  console.log('[Dashboard] ' + INDICATEURS_DASHBOARD.length + ' widgets dashboard chargés.');

})();


// ============================================================
// 4. TERRITOIRES
// ============================================================

var TERRITOIRES = {

  // ── Grand Est ──────────────────────────────────────────────
  "Grand Est": ["Tout le territoire Grand Est"],

  // ── Départements (10) ──────────────────────────────────────
  "Département": [
    "Ardennes (08)", "Aube (10)", "Marne (51)", "Haute-Marne (52)",
    "Meurthe-et-Moselle (54)", "Meuse (55)", "Moselle (57)",
    "Bas-Rhin (67)", "Haut-Rhin (68)", "Vosges (88)"
  ],

  // ── EPCI (150) — les plus peuplées/connues affichées par défaut, toutes disponibles via recherche ──
  "EPCI": [
    // Métropoles & grandes CA (top 20 plébiscitées)
    "Eurométropole de Strasbourg",
    "Métropole du Grand Nancy",
    "Metz Métropole",
    "Ardenne Métropole",
    "CU du Grand Reims",
    "CA Troyes Champagne Métropole",
    "CA Mulhouse Alsace Agglomération",
    "CA de Châlons-en-Champagne",
    "CA de Saint-Dié-des-Vosges",
    "CA d'Epinal",
    "CA Sarreguemines Confluences",
    "CA du Grand Verdun",
    "CA du Grand Saint-Dizier, Der et Vallées",
    "CA de Bar-le-Duc - Sud Meuse",
    "CA de Forbach Porte de France",
    "CA Colmar Agglomération",
    "CA Saint-Louis Agglomération",
    "CA Portes de France-Thionville",
    "CA du Val de Fensch",
    "CA Saint-Avold Synergie",
    "Grand Longwy Agglomération",
    "CA de Haguenau",
    // Communautés de communes importantes
    "CC de la Vallée de la Bruche",
    "CC du Pays Rhénan",
    "CC Sundgau",
    "CC des Hautes Vosges",
    "CC Gérardmer Hautes Vosges",
    "CC du Pays de Saverne",
    "CC de Sélestat",
    "CC du Pays de Niederbronn-les-Bains",
    // TOUTES LES AUTRES (accessibles via la recherche)
    "CC Seine et Aube","CC de l'Aire à l'Argonne","CC du Pays de Wissembourg","CC de Vitry, Champagne et Der",
    "CC Alsace Rhin Brisach","CC de Chaumont","CC du Territoire de Lunéville à Baccarat",
    "CC des Ballons des Hautes-Vosges","CC d'Auberive Vingeanne et Montsaugeonnais","CC de l'Argonne Champenoise",
    "CC Côtes de Champagne et Val de Saulx","CC du Sud Messin","CC du Saulnois","CC du Pays de Bitche",
    "CC Mad et Moselle","CC du Ried de Marckolsheim","CC Ardenne, Rives de Meuse","CC du Chaourçois et du Val d'Armance",
    "CC Ardennes Thiérache","CC des Portes du Luxembourg","CC Perthois-Bocage et Der","CC Haut Chemin-Pays de Pange",
    "CC de l'Outre-Forêt","CC du Pays d'Othe","CC des Portes de Romilly sur Seine","CC de l'Orvin et de l'Ardusson",
    "CC de la Région de Bar sur Aube","CC des Lacs de Champagne","CC du Pays de Sainte-Odile",
    "CA Epernay, Coteaux et Plaine de Champagne","CC de Hanau-La Petite Pierre",
    "CC Argonne-Meuse","CC d'Arcis, Mailly, Ramerupt","CC du Pays Réthelois","CC du Barséquanais en Champagne",
    "CC de Vendeuvre-Soulaines","CC Vallées et Plateau d'Ardenne","CC des Crêtes Préardennaises",
    "CC des Trois Forêts","CC Terre Lorraine du Longuyonnais",
    "CC des Paysages de la Champagne","CC de Sézanne-Sud Ouest Marnais","CC Sarrebourg Moselle Sud",
    "CC du Bassin de Joinville en Champagne","CC Forêts, Lacs, Terres en Champagne","CC de la Vallée de Villé",
    "CC du Pays de la Zorn","CC du Pays d'Etain","CC du Pays Rhénan",
    "CC Sauer-Pechelbronn","CC Val de Meuse - Voie Sacrée","CC Bruyères-Vallons des Vosges",
    "CC du Pays de Rouffach, Vignobles et Châteaux","CC du Territoire de Fresnes en Woëvre",
    "CC de la Région de Suippes","CC de la Brie Champenoise","CC de Cattenom et Environs","CC de l'Arc Mosellan",
    "CC de l'Ouest Vosgien","CC de la Région de Molsheim-Mutzig","CC du Val d'Argent","CC de la Vallée de Munster",
    "CC de la Vallée de Kaysersberg","CC du Centre du Haut-Rhin","CC du Pays de Saverne",
    "CC du Pays de Barr","CC de la Moivre à la Coole",
    "CC de la Grande Vallée de la Marne","CC du Bassin de Pompey","CC Moselle et Madon",
    "CC Houve-Pays Boulageois","CC de la Région de Guebwiller","CC de la Basse-Zorn",
    "CC du Kochersberg","CC du Canton d'Erstein","CC du Bassin de Pont-à-Mousson","CC du Pays de Ribeauvillé",
    "CC de la Vallée de la Doller et du Soultzbach","CC de Thann-Cernay","CC du Warndt","CC du Sud Marnais",
    "CC du Pays Haut Val d'Alzette","CC du Pays du Sanon","CC du Pays Orne Moselle","CC de Freyming-Merlebach",
    "CC de Commercy - Void - Vaucouleurs","CC de Damvillers Spincourt",
    "CC du Pays de Stenay et du Val Dunois","CC Coeur du Pays Haut","CC de Seille et Grand Couronné",
    "CC du Sammiellois","CC de la Vallée de Saint-Amarin","CC du Pays de Phalsbourg","CC des Pays du Sel et du Vermois",
    "CC Terres Touloises","CC du Pays de Montmédy","CC Rives de Moselle",
    "CC des Portes de Rosheim","CC de la Plaine du Rhin","CC de l'Argonne Ardennaise","CC de la Mossig et du Vignoble",
    "CC du Nogentais","CC du Pays de Colombey et du Sud Toulois","CC du Pays du Saintois",
    "CC Meurthe Mortagne Moselle","CC Meuse Rognon","CC du District Urbain de Faulquemont (DUF)",
    "CC du Pays de Revigny sur Ornain","CC des Vosges côté Sud Ouest","CC de l'Alsace Bossue","CC Terre d'Eau",
    "CC des Savoir-Faire","CC des Portes de Meuse","CC de Vezouze en Piémont",
    "CC de la Région de Rambervillers","CC Orne Lorraine Confluences","CC Bouzonvillois-Trois Frontières",
    "CC du Grand Langres","CC Côtes de Meuse Woëvre","CC de Mirecourt Dompaire","CC Sud Alsace Largue",
    "CC de la Porte des Vosges Méridionales"
  ],

  // ── Maisons de Région (12) ─────────────────────────────────
  "Maison de Région": [
    "TROYES / CHAUMONT","EPINAL","CHALONS-EN-CHAMPAGNE","SAINT-DIZIER / BAR-LE-DUC",
    "STRASBOURG","METZ","THIONVILLE / LONGWY","SELESTAT",
    "CHARLEVILLE-MEZIERES","MULHOUSE","NANCY","SAVERNE / HAGUENAU"
  ],

  // ── Pays / PETR (29) ──────────────────────────────────────
  "Pays / PETR": [
    "Chaumont","Bruche Mossig","Seine en Plaine Champenoise","Othe-Armance",
    "Vitryat","Brie et Champagne","Sélestat-Alsace centrale","Remiremont et ses vallées",
    "Barrois","Bassin de Briey","Val de Lorraine","Châlons-en-Champagne",
    "Langres","Sundgau","Epinal, Coeur des Vosges","Ouest des Vosges",
    "Epernay - Terres de Champagne","Sarrebourg","Verdun","Bande rhénane Nord",
    "Rhin, Vignoble Grand Ballon","Thur Doller","Terres de Lorraine","Lunévillois",
    "Coeur de Lorraine","Saverne, Plaine et Plateau","Déodatie","Piémont des Vosges",
    "Alsace du Nord"
  ],

  // ── PNR (6) ───────────────────────────────────────────────
  "PNR": [
    "PNR ARDENNES","PNR BALLONS des VOSGES","PNR FORET d'ORIENT",
    "PNR LORRAINE","PNR MONTAGNE de REIMS","PNR VOSGES du NORD"
  ],

  // ── PTRTE (93) — top 20 + tous via recherche ───────────────
  "PTRTE": [
    // Top plébiscités (métropoles, grandes CA)
    "PTRTE Eurométropole de Strasbourg",
    "PTRTE de Metz Métropole",
    "PTRTE de la Métropole Rémoise",
    "PTRTE de la Métropole du Grand Nancy",
    "PTRTE de la CA Troyes Champagne Métropole",
    "PTRTE de la CA Mulhouse Alsace Agglomération",
    "PTRTE de la CA Ardenne Métropole",
    "PTRTE de la CA de Longwy et de la CC Terre Lorraine du Longuyonnais",
    "PTRTE de la CA de Forbach Porte de France",
    "PTRTE de la CA Sarreguemines Confluences",
    "PTRTE de la CA Portes de France-Thionville",
    "PTRTE de la CA Colmar Agglomération",
    "PTRTE de la CA Saint-Louis Agglomération",
    "PTRTE de la CA du Val de Fensch",
    "PTRTE de la CA de Saint-Dizier Der et Blaise",
    "PTRTE de la CA de Chaumont",
    "PTRTE du PETR du Pays d'Epernay Terres de Champagne",
    "PTRTE du PETR Châlons étendu aux 2 CC voisines",
    "PTRTE du PETR Val de Lorraine",
    "PTRTE du PETR du pays de Langres",
    // Tous les autres
    "PTRTE de la CC de l'Argonne Ardennaise","PTRTE de la CC des Lacs de Champagne",
    "PTRTE de la CC de l'Argonne Champenoise","PTRTE de la CC des Trois Forêts",
    "PTRTE du PETR du Lunévillois","PTRTE de la CC du Saulnois",
    "PTRTE Saverne plaine et plateau","PTRTE de la CC Sundgau",
    "PTRTE du Plaine et Saône Vosgienne","PTRTE de la CC Ardennes Thiérache",
    "PTRTE de la CC Vendeuvre-Soulaines","PTRTE du PETR de Brie et Champagne",
    "PTRTE de la CC du Bassin de Joinville en Champagne",
    "PTRTE de la CC Orne Lorraine Confluences","PTRTE de la CC du Barséquanais en Champagne",
    "PTRTE de la CC Meuse Rognon","PTRTE du Pays Terres de Lorraine",
    "PTRTE du Territoire Warndt Naborien","PTRTE de la CC de Commercy-Void-Vaucouleurs",
    "PTRTE de l'Alsace du Nord","PTRTE Sélestat - Alsace centrale",
    "PTRTE de la CC Ardenne, Rives de Meuse","PTRTE de la CC des Portes du Luxembourg",
    "PTRTE de la CC d'Arcis-Mailly-Ramerupt","PTRTE de la CC des Forêts, Lacs, Terres en Champagne",
    "PTRTE de la CC de la Région de Bar-sur-Aube","PTRTE de la CC des Pays du Sel et du Vermois",
    "PTRTE du PETR Coeur de Lorraine","PTRTE de la CC Rives de Moselle",
    "PTRTE de la CC Bouzonvillois-Trois Frontières","PTRTE de la CC Houve-Pays Boulageois",
    "PTRTE de la CC de Cattenom et Environs","PTRTE de la CC du Pays de Bitche",
    "PTRTE du Pays d'Epinal, Coeur des Vosges","PTRTE de la CC des Crêtes Préardennaises",
    "PTRTE de la CC Vallées et Plateau d'Ardenne","PTRTE du PETR Seine en Plaine Champenoise",
    "PTRTE du Perthois et Val de Saulx","PTRTE de la CC Vitry Champagne et Der",
    "PTRTE du PETR du Pays de Verdun","PTRTE de la CC du Pays de Phalsbourg",
    "PTRTE du Kochersberg","PTRTE de la Plaine du Rhin",
    "PTRTE du Pays Rhénan","PTRTE du Canton d'Erstein",
    "PTRTE de la Mossig et du Vignoble","PTRTE de la Vallée de la Bruche",
    "PTRTE du Pays de la Zorn","PTRTE de la Région de Molsheim-Mutzig",
    "PTRTE de la CC de Thann-Cernay","PTRTE de la CC Pays Rhin - Brisach",
    "PTRTE de la CC de la Vallée de Saint-Amarin","PTRTE de la CC du Centre du Haut-Rhin",
    "PTRTE de la CC du Pays de Rouffach, Vignobles et Châteaux",
    "PTRTE de la CC de la Vallée de Kaysersberg","PTRTE de la CC de la Région de Guebwiller",
    "PTRTE de la CC de Sélestat","PTRTE de la CC du Pays de la Zorn (Sud)","PTRTE Pays Barrois et Argonne"
  ],

  // ── SAGE (15) ─────────────────────────────────────────────
  "SAGE": [
    "SAGE Bassin Ferrifère","SAGE Doller","SAGE Giessen Liepvrette",
    "SAGE Ill Nappe Rhin","SAGE Largue","SAGE Lauch","SAGE Bassée Voulzie",
    "SAGE Nappe des Grès du Trias Inférieur","SAGE Petit et Grand Morin",
    "SAGE Rupt de Mad, Esch, Trey","SAGE Tille","SAGE Moder",
    "SAGE Bassin Houiller","SAGE Armançon","SAGE Aisne Vesle Suippe"
  ],

  // ── SCoT (23) ─────────────────────────────────────────────
  "SCoT": [
    "SCOT des Territoires de l'Aube",
    "SCOT de l'arrondissement de Sarreguemines",
    "SCOT Bande Rhénane Nord",
    "SCOT Rhin-Vignoble-Grand-Ballon",
    "SCOT du PETR d'Alsace Centrale",
    "SCOT Colmar-Rhin-Vosges",
    "SCOT du pays Barrois",
    "SCOT de l'Agglomération Messine",
    "SCOT d'Epernay et sa région",
    "SCOT Région de Strasbourg (SCOTERS)",
    "SCOT du PETR du Sundgau",
    "SCOT Bruche-Mossig",
    "SCOT de la Région Rémoise",
    "SCOT Sud Meurthe-et-Moselle",
    "SCOT Pays Thur Doller",
    "SCOT des Vosges centrales",
    "SCOT Montagne Vignoble Ried",
    "SCOT Région mulhousienne",
    "SCOT Piémont des Vosges",
    "SCOTAN",
    "SCOT du pays de Saint Louis et des Trois Frontières",
    "SCOT Val de Rosselle",
    "SCOT Région de Saverne"
  ],

  // ── Agence de l'eau (3) ────────────────────────────────────
  "Agence de l'eau": [
    "RHIN-MEUSE","SEINE-NORMANDIE","RHONE-MEDITERRANEE"
  ],

  // ── Commune (5 115) — rempli dynamiquement par data-communes.js ──
  // Le tableau est vide au départ ; l'événement 'communes:loaded' l'alimente.
  "Commune": []

};


// ============================================================
// 5. ANNÉES – déjà déclaré en section 0
// ============================================================
// (pas de redéclaration ici pour éviter les conflits)


// ============================================================
// 6. MOTEUR DE DONNÉES DYNAMIQUES
//    getDataWidget(widget, territoire, annee)
//    Retourne les données calculées pour un widget donné,
//    selon le territoire et l'année sélectionnés.
// ============================================================

/**
 * Hash déterministe : transforme une chaîne en nombre stable (0–1).
 * Même entrée → toujours même sortie. Pas de Math.random().
 */
function hashTerritoire(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return (h >>> 0) / 4294967295; // valeur entre 0 et 1
}

/**
 * Facteur de variation pour un territoire donné (stable, entre 0.72 et 1.28).
 * Permet d'avoir des valeurs différentes selon le territoire.
 */
function facteurTerritoire(territoire) {
  return 0.72 + hashTerritoire(territoire) * 0.56;
}

/**
 * Facteur de variation pour un territoire + un widget (seed différent par widget).
 */
function facteurTerritoireWidget(territoire, widgetId) {
  return 0.78 + hashTerritoire(territoire + '|' + widgetId) * 0.44;
}

/**
 * Retourne les données à afficher pour un widget,
 * adaptées au territoire et à l'année sélectionnés.
 *
 * @param {Object} widget      - Un objet INDICATEURS_DASHBOARD
 * @param {string} territoire  - Nom du territoire sélectionné
 * @param {number} annee       - Année sélectionnée
 * @param {string} echelle     - Echelle territoriale ("Département", "EPCI", etc.)
 * @returns {Object} résultat  - Contient les champs nécessaires au widget
 */
function getDataWidget(widget, territoire, annee, echelle) {

  // Facteur lié au territoire (stable par territoire+widget)
  var fT = facteurTerritoireWidget(territoire, widget.id);

  // ── Helper : valeur scalaire pour une année donnée ──────────────────
  // Part des valeurs_par_annee (base Grand Est) et applique le facteur territoire
  function valeurPourAnnee(a) {
    var vpA = widget.valeurs_par_annee || {};
    var base = vpA[a] || widget.valeur_exemple || 0;
    // Ajout d'un bruit stable lié à (territoire, annee, widgetId)
    var bruit = hashTerritoire(territoire + a + widget.id) * 0.12 - 0.06;
    var v = base * (fT + bruit);
    // Arrondi selon l'unité
    if (widget.unite === '%') return Math.min(100, Math.max(0, Math.round(v * 10) / 10));
    if (widget.unite === 'nb arrêtés' || widget.unite === 'nb SAGE') return Math.round(v);
    if (widget.unite === 'm³/km/j') return Math.round(v * 100) / 100;
    if (widget.unite === 'M m³/an' || widget.unite === 'km²') return Math.round(v * 10) / 10;
    return Math.round(v * 10) / 10;
  }

  // ── Séries temporelles (pour widget line) ──────────────────────────
  function serieAnnees() {
    var res = {};
    ANNEES.forEach(function(a) {
      res[a] = valeurPourAnnee(a);
    });
    return res;
  }

  // ── Série par sous-territoires (barres, heatmap) ────────────────────
  // Génère une liste de N sous-territoires fictifs selon l'échelle
  function serieParSousTerritoires(nombreItems) {
    var labels = obtenirSousTerritoires(echelle, territoire, nombreItems);
    var res = {};
    labels.forEach(function(label) {
      var fL = facteurTerritoireWidget(label, widget.id);
      var bruit = hashTerritoire(label + annee + widget.id) * 0.16 - 0.08;
      var vpA = widget.valeurs_par_annee || {};
      var base = (vpA[annee] || widget.valeur_exemple || 0);
      // Normalise la base selon l'échelle (les petits territoires ont des valeurs plus faibles)
      var facteurEchelle = echelle === 'Grand Est' ? 1 :
                           echelle === 'Département' ? 0.15 :
                           echelle === 'EPCI' ? 0.08 :
                           echelle === 'Bassin versant' ? 0.25 :
                           echelle === 'Commune' ? 0.02 : 0.05;
      var v = base * facteurEchelle * (fL + bruit);
      if (widget.unite === '%') v = Math.min(100, Math.max(0, v * (1 / facteurEchelle)));
      if (widget.unite === 'm³/km/j') v = Math.abs(v * (1 / facteurEchelle));
      if (widget.unite === '%') res[label] = Math.round(v * 10) / 10;
      else if (widget.unite === 'm³/km/j') res[label] = Math.round(v * 10) / 10;
      else if (widget.unite === 'M m³/an') res[label] = Math.round(v * 10) / 10;
      else if (widget.unite === 'km²') res[label] = Math.round(v * 10) / 10;
      else res[label] = Math.round(v * 10) / 10;
    });
    return res;
  }

  // ── Résultat selon le type de widget ──────────────────────────────
  var result = { valeur: valeurPourAnnee(annee) };

  switch (widget.widget_type) {

    case 'gauge':
      result.valeur = Math.min(100, Math.max(0, valeurPourAnnee(annee)));
      break;

    case 'kpi':
      var vCourante = valeurPourAnnee(annee);
      var vPrec = valeurPourAnnee(annee - 1);
      var diff = Math.round((vCourante - vPrec) * 10) / 10;
      var signe = diff >= 0 ? '+' : '';
      result.valeur = vCourante;
      result.valeur_affichee = vCourante;
      result.unite_affichee = widget.unite_affichee || widget.unite;
      if (widget.unite === '%') result.evolution = signe + diff + ' pt';
      else if (widget.unite === 'nb arrêtés') result.evolution = signe + Math.round(diff) + ' arrêtés';
      else result.evolution = signe + diff + ' ' + widget.unite;
      break;

    case 'bar':
      // Barres par sous-territoires de l'échelle courante
      result.series = serieParSousTerritoires(10);
      break;

    case 'line':
      // Courbe temporelle adaptée au territoire
      result.series = serieAnnees();
      // Ajoute un repère sur l'année courante
      result.annee_courante = annee;
      break;

    case 'donut':
      // Répartition DCE adaptée à l'année + territoire
      var pctBonEtat = Math.min(95, Math.max(5, valeurPourAnnee(annee)));
      // La part "bon+très bon" varie
      var pTresBon  = Math.round(pctBonEtat * 0.20);
      var pBon      = Math.round(pctBonEtat * 0.80);
      var reste     = 100 - pTresBon - pBon;
      var pMoyen    = Math.round(reste * 0.44);
      var pMediocre = Math.round(reste * 0.34);
      var pMauvais  = 100 - pTresBon - pBon - pMoyen - pMediocre;
      result.series = {
        "Très bon":  Math.max(1, pTresBon),
        "Bon":       Math.max(1, pBon),
        "Moyen":     Math.max(1, pMoyen),
        "Médiocre":  Math.max(1, pMediocre),
        "Mauvais":   Math.max(1, pMauvais)
      };
      break;

    case 'minimap':
      // Valeur scalaire + nombre de points proportionnel
      result.valeur = Math.round(valeurPourAnnee(annee));
      result.nb_points = Math.max(5, Math.min(30, Math.round(result.valeur / 50)));
      break;

    case 'progress_list':
      // Répartition SAGE qui évolue légèrement selon l'année
      var totalSage = 22;
      var pctApprouves = 0.20 + (annee - 2015) * 0.025; // progression dans le temps
      pctApprouves = Math.min(0.65, Math.max(0.15, pctApprouves * fT));
      var nbApp  = Math.round(totalSage * pctApprouves);
      var nbRev  = Math.max(1, Math.round(totalSage * 0.12 * fT));
      var nbInst = Math.max(1, Math.round(totalSage * 0.15 * fT));
      var nbElab = Math.max(1, Math.round(totalSage * 0.20 * fT));
      var nbNonE = Math.max(0, totalSage - nbApp - nbRev - nbInst - nbElab);
      result.series = {
        "Approuvé – Mis en œuvre": nbApp,
        "En révision":             nbRev,
        "En instruction":          nbInst,
        "En élaboration":          nbElab,
        "Non engagé":              nbNonE
      };
      break;

    case 'heatmap_bar':
      // Volumes par sous-territoires
      result.series = serieParSousTerritoires(10);
      break;
  }

  return result;
}

/**
 * Retourne une liste de noms de sous-territoires selon l'échelle.
 * Utilisé pour les widgets bar et heatmap (qui montrent une répartition spatiale).
 */
function obtenirSousTerritoires(echelle, territoire, nb) {
  var DEPTS_COURTS = ["Ardennes", "Aube", "Marne", "Hte-Marne", "M-et-Moselle",
                      "Meuse", "Moselle", "Bas-Rhin", "Haut-Rhin", "Vosges"];
  var EPCI_COURTS = ["Châlons", "Colmar Aggl.", "Épernay", "Grand Reims",
                     "Eurométropole Stbg", "Metz Métropole", "Mulhouse Aggl.", "Nancy Grand Cœur"];
  var COMMUNES = ["Châlons-en-Ch.", "Colmar", "Épinal", "Metz",
                  "Mulhouse", "Nancy", "Reims", "Strasbourg", "Troyes", "Thionville"];
  var BV_COURTS = ["Rhin", "Moselle", "Meuse", "Marne", "Aube", "Sarre", "Ill"];
  var SCOT_COURTS = ["SCoT Stras.", "SCoT Sud 54", "SCoT Metz", "SCoT Reims"];
  var PCAET_COURTS = ["PCAET Stras.", "PCAET Metz", "PCAET Reims", "PCAET Mulhouse"];

  var liste;
  switch (echelle) {
    case 'Département':     liste = DEPTS_COURTS; break;
    case 'EPCI':            liste = EPCI_COURTS;  break;
    case 'Commune':         liste = COMMUNES;     break;
    case 'Bassin versant':  liste = BV_COURTS;    break;
    case 'SCoT':            liste = SCOT_COURTS;  break;
    case 'PCAET':           liste = PCAET_COURTS; break;
    case 'Grand Est':
    default:                liste = DEPTS_COURTS; break;
  }

  return liste.slice(0, nb || liste.length);
}
