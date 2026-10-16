/**
 * data-indicateurs-elu.js
 * ═══════════════════════════════════════════════════════════════════════
 * Base de données des 105 indicateurs du Tableau de bord Élu
 * Source : 2026_06_05_Indicateurs OREGE_v5_ELU.xlsx
 *
 * Structure :
 *   INDICATEURS_ELU[] — tableau de 105 objets
 *   Chaque objet contient :
 *     - id            : identifiant unique (ex: "IND-001")
 *     - section       : enjeu principal (colonne A)
 *     - exposition    : Exposition / Sensibilité / Vulnérabilité (colonne B)
 *     - categorie     : catégorie (colonne C)
 *     - sousCategorie : sous-catégorie (colonne D)
 *     - nom           : nom de l'indicateur (colonne E)
 *     - description   : description complète (colonne F)
 *     - unite         : unité de mesure (colonne G)
 *     - affichage     : objet {carto, graphique, chiffre} — booléens
 *     - graphType     : type de graphique si applicable ("donut"|"histogramme"|null)
 *     - labels        : libellés de catégories (colonne L)
 *     - fakeData      : données fictives pour le Grand Est
 * ═══════════════════════════════════════════════════════════════════════
 */

// eslint-disable-next-line no-unused-vars
var INDICATEURS_ELU = [

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 1 : Aménagement du territoire et zonage (19 indicateurs)
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "IND-001", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Zonage", sousCategorie: "Zones humides",
    nom: "Nombre de zones humides",
    description: "Recencement en nombre des zones humides (ZH DREAL Grand-Est + Ramsar) différencié selon la typologie",
    unite: "Nombre", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "donut", labels: "ZHE-LsE / ZHE-LsE-AM08",
    fakeData: {value: 2847, trend: "+124 depuis 2022", trendDir: "up", details: "dont 1 892 ZHE-LsE et 955 ZHE-LsE-AM08",
      chartData: {labels:["ZHE-LsE","ZHE-LsE-AM08"], values:[1892,955], colors:["#1565C0","#42A5F5"]}}
  },
  {
    id: "IND-002", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Zonage", sousCategorie: "Zones humides",
    nom: "Surface de zones humides",
    description: "Recencement en nombre des zones humides (ZH DREAL Grand-Est + Ramsar) différencié selon la typologie",
    unite: "Hectare", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "ZHE-LsE / ZHE-LsE-AM08",
    fakeData: {value: 148500, trend: "+3 200 ha depuis 2020", trendDir: "up",
      chartData: {labels:["ZHE-LsE","ZHE-LsE-AM08"], values:[112000,36500], colors:["#1565C0","#42A5F5"]}}
  },
  {
    id: "IND-003", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Zonage", sousCategorie: "Zones humides",
    nom: "Typologie des zones humides",
    description: "Présentation du % de chaque typologie de ZH (% de superficie ou de nombre)",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "ZHE-LsE / ZHE-LsE-AM08",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Prairies humides","Forêts alluviales","Tourbières","Mares","Autres"], values:[38,26,15,12,9], colors:["#2E7D32","#1B5E20","#4527A0","#0277BD","#78909C"]}}
  },
  {
    id: "IND-004", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Zonage", sousCategorie: "Zones humides",
    nom: "Pourcentage de territoire couvert par une zone humide",
    description: "% du territoire couvert par des zones humides inventoriées",
    unite: "Pourcentage", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 5.8, unit: "%", trend: "+0.3 pt depuis 2020", trendDir: "up", details: "Moyenne nationale : 4.2%"}
  },
  {
    id: "IND-005", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Zonage", sousCategorie: "Zones humides",
    nom: "Evolution des ZH effectives (inventaire)",
    description: "Evolution de la superficie des ZH effectives où il y a eu un inventaire par rapport au ZH potentielles (voir avec DREAL si on peut avoir le territoire total de l'inventaire en flux)",
    unite: "Hectare", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: "+3 200", unit: "ha", trend: "Période 2018-2024", trendDir: "up", details: "Inventaires en cours sur 12 territoires"}
  },
  {
    id: "IND-006", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Zonage", sousCategorie: "RAMSAR",
    nom: "Nombre de zones RAMSAR",
    description: "Présence ou non d'une zone RAMSAR sur le territoire et nom",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 4, unit: "zones", trend: "Stable", trendDir: "neutral", details: "Rhin supérieur, Étangs de la Champagne humide, Petite Camargue alsacienne, Étangs de Lindre"}
  },
  {
    id: "IND-007", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Zonage", sousCategorie: "RAMSAR",
    nom: "Surface de zones RAMSAR",
    description: "Superficie en ha des zones RAMSAR par territoire",
    unite: "Hectare", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 43700, unit: "ha", trend: "Stable", trendDir: "neutral", details: "Dont Étangs Champagne humide : 25 500 ha"}
  },
  {
    id: "IND-008", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Zonage", sousCategorie: "RAMSAR",
    nom: "Evolution des zones RAMSAR",
    description: "Peut-on avoir un indicateur d'évolution des zones",
    unite: "Nombre/Hectare", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: "+1", unit: "site", trend: "Depuis 2018", trendDir: "up", details: "Petite Camargue alsacienne inscrite en 2022"}
  },
  {
    id: "IND-009", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "ZRE",
    nom: "Nombre de zones de répartition des eaux (ZRE)",
    description: "Carte des ZRE superficielles et souterraines",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 12, unit: "ZRE", trend: "+2 depuis 2020", trendDir: "up", details: "8 souterraines, 4 superficielles"}
  },
  {
    id: "IND-010", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "ZRE",
    nom: "Pourcentage de territoire couvert par une zone de répartition des eaux (ZRE)",
    description: "% du territoire couvert par une ZRE",
    unite: "Pourcentage", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 18.4, unit: "%", trend: "+3.2 pt depuis 2020", trendDir: "up", details: "Principalement nappe de la Craie (Champagne)"}
  },
  {
    id: "IND-011", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "ZRE",
    nom: "Pourcentage de territoire couvert par une zone de répartition des eaux (ZRE)",
    description: "% du territoire couvert par typologie de ZRE (nappe captive, surface, nappe affleurante,…)",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "Inconnu / ZRESup / ZRESout / Mixte",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["ZRE Souterraine","ZRE Superficielle","Mixte","Inconnu"], values:[52,28,15,5], colors:["#1565C0","#42A5F5","#7E57C2","#B0BEC5"]}}
  },
  {
    id: "IND-012", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "Occupation du sol",
    nom: "Typologie de l'occupation du sol",
    description: "Couverture de la Région par type d'occupation du sol",
    unite: "Pourcentage", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "donut", labels: "Niveau 1",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Terres agricoles","Forêts","Territoires artificialisés","Plans d'eau","Autres"], values:[49,33,11,4,3], colors:["#F57F17","#2E7D32","#455A64","#0277BD","#BDBDBD"]}}
  },
  {
    id: "IND-013", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "Occupation du sol",
    nom: "Imperméabilisation des sols urbanisés",
    description: "% de sols perméables urbain, Imperméable non bâti, Impérméable bâti sur les territoires de l'OCS Grand Est - 2021",
    unite: "Pourcentage", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 34.2, unit: "% imperméabilisé", trend: "+1.8 pt depuis 2010", trendDir: "down", details: "Sols urbains (11% du territoire régional)"}
  },
  {
    id: "IND-014", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "Occupation du sol",
    nom: "Mutations d'occupation du sol",
    description: "Evolution d'une typologie d'espace vers une autre (exemple milieux naturels vers urbains) - disponible dans l'OCS GE entre 2010 et 2021",
    unite: "Hectare", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 8420, unit: "ha artificialisés", trend: "Période 2010-2021", trendDir: "down", details: "Dont 65% sur terres agricoles"}
  },
  {
    id: "IND-015", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "Surface en eau",
    nom: "Nouvelles surfaces en eau",
    description: "Ha de nouvelles surfaces en eau sur le territoire OCS entre 2010 et 2021",
    unite: "Hectare", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 1240, unit: "ha", trend: "Période 2010-2021", trendDir: "up", details: "Gravières reconverties, bassins de rétention"}
  },
  {
    id: "IND-016", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "Assainissement collectif",
    nom: "Zones sensibles",
    description: "% de territoire concerné par l'application de la Directive (UE) 2024/3019 relative au traitement des eaux résiduaires urbaines",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 72, unit: "% du territoire", trend: "+8 pt depuis 2020", trendDir: "up", details: "Bassins Rhin-Meuse et Seine-Normandie"}
  },
  {
    id: "IND-017", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "Obstacles à l'écoulement",
    nom: "Nombre d'obstacles à l'écoulement",
    description: "Sur un territoire donné référence le nombre d'obstacle à l'écoulement",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 4832, unit: "obstacles", trend: "−87 depuis 2020", trendDir: "up", details: "Programme d'effacement continuité écologique"}
  },
  {
    id: "IND-018", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "Obstacles à l'écoulement",
    nom: "Typologie d'obstacles à l'écoulement",
    description: "Indique si ce sont des barrages, seuils en rivière, digues, obstacles induit par un pont, épis en rivière ou Grille",
    unite: "Nombre", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "donut", labels: "Niveau 2 Sandre",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Seuils","Barrages","Digues","Ponts","Épis","Grilles"], values:[2100,890,720,640,312,170], colors:["#1565C0","#D84315","#6A1B9A","#455A64","#F57F17","#00796B"]}}
  },
  {
    id: "IND-019", section: "Aménagement du territoire et zonage",
    exposition: "Sensibilité", categorie: "Aménagement", sousCategorie: "Obstacles à l'écoulement",
    nom: "Nombre de principaux barrages",
    description: "Localisation des principaux barrages",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 24, unit: "barrages", trend: "Stable", trendDir: "neutral", details: "Dont 6 grands barrages (H > 15m) — Bouzey, Pierre-Percée, Madine…"}
  },

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 2 : Gouvernance et action menées (19 indicateurs)
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "IND-020", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Gouvernance", sousCategorie: "Organisation des acteurs",
    nom: "Agence de l'eau",
    description: "Couverture du territoire par les agences de l'Eau",
    unite: "Pourcentage", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "donut", labels: "RHIN-MEUSE / SEINE-NORMANDIE / RHONE-MEDITERRANEE",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Rhin-Meuse","Seine-Normandie","Rhône-Méditerranée"], values:[58,36,6], colors:["#1565C0","#6A1B9A","#00796B"]}}
  },
  {
    id: "IND-021", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Gouvernance", sousCategorie: "Organisation des acteurs",
    nom: "Etablissement Public Territorial de Bassin (EPTB)",
    description: "Couverture du territoire par les EPTB",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 6, unit: "EPTB", trend: "Stable", trendDir: "neutral", details: "EPTB Meuse, Moselle, Marne, Sarre, Ill, Sauer"}
  },
  {
    id: "IND-022", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de gestion de l'eau",
    nom: "Schémas d'Aménagement et de Gestion des Eaux (SAGE)",
    description: "Couverture du territoire par les SAGE",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 64, unit: "% couvert", trend: "+4 pt depuis 2022", trendDir: "up", details: "18 SAGE en vigueur sur le Grand Est"}
  },
  {
    id: "IND-023", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de gestion de l'eau",
    nom: "Schémas d'Aménagement et de Gestion des Eaux (SAGE)",
    description: "Couverture du territoire par les SAGE par avancement des procédures",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "Nomenclature Sandre avancement",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Mis en œuvre","Élaboration","Instruction","Émergence"], values:[48,22,18,12], colors:["#2E7D32","#F57F17","#1565C0","#B0BEC5"]}}
  },
  {
    id: "IND-024", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de gestion de l'eau",
    nom: "Démarches concertées pour la gestion et la restauration des MA (Contrats milieux, Contrats bassin, ...)",
    description: "Couverture du territoire par les contrats de milieu",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 42, unit: "% couvert", trend: "+6 pt depuis 2021", trendDir: "up", details: "14 contrats actifs sur le Grand Est"}
  },
  {
    id: "IND-025", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de gestion de l'eau",
    nom: "Démarches concertées pour la gestion et la restauration des MA (Contrats milieux, Contrats bassin, ...)",
    description: "Couverture du territoire par les contrats de milieu par avancement des procédures",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "Nomenclature Sandre",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["En cours","Signé","Élaboration","Achevé"], values:[35,28,22,15], colors:["#2E7D32","#1565C0","#F57F17","#78909C"]}}
  },
  {
    id: "IND-026", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de gestion de l'eau",
    nom: "Démarches concertées de gestion de la ressource en eau (PTGE, ...)",
    description: "Couverture du territoire par les PTGE",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 28, unit: "% couvert", trend: "+12 pt depuis 2021", trendDir: "up", details: "5 PTGE en cours, 2 signés"}
  },
  {
    id: "IND-027", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de gestion de l'eau",
    nom: "Démarches concertées de gestion de la ressource en eau (PTGE, ...)",
    description: "Couverture du territoire par les PTGE par avancement des procédures",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "Nomenclature Sandre avancement",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Signé","Élaboration","Instruction","Émergence"], values:[22,38,25,15], colors:["#2E7D32","#F57F17","#1565C0","#B0BEC5"]}}
  },
  {
    id: "IND-028", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Gouvernance", sousCategorie: "Organisation des acteurs",
    nom: "Etablissements Publics d'Aménagement et de Gestion de l'Eau (EPAGE)",
    description: "Couverture du territoire par les EPAGE",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 9, unit: "EPAGE", trend: "+2 depuis 2022", trendDir: "up", details: "Couverture territoriale : 34%"}
  },
  {
    id: "IND-029", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Gouvernance", sousCategorie: "Organisation des acteurs",
    nom: "Collectivités compétentes en matière de production d'eau potable",
    description: "Nombre de collectivités compétentes sur le territoire",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 287, unit: "collectivités", trend: "−12 depuis 2022 (mutualisations)", trendDir: "up", details: "Tendance à la rationalisation"}
  },
  {
    id: "IND-030", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Gouvernance", sousCategorie: "Organisation des acteurs",
    nom: "Collectivités compétentes en matière de distribution d'eau potable",
    description: "Nombre de collectivités compétentes sur le territoire",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 342, unit: "collectivités", trend: "−18 depuis 2022", trendDir: "up", details: "Transferts GEMAPI en cours"}
  },
  {
    id: "IND-031", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Gouvernance", sousCategorie: "Organisation des acteurs",
    nom: "Collectivités compétentes en matière d'assainissement collectif (Dépollution)",
    description: "Nombre de collectivités compétentes sur le territoire",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 298, unit: "collectivités", trend: "−8 depuis 2022", trendDir: "up", details: "Concentration progressive des compétences"}
  },
  {
    id: "IND-032", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Gouvernance", sousCategorie: "Organisation des acteurs",
    nom: "Collectivités compétentes en matière d'assainissement non collectif",
    description: "Nombre de collectivités compétentes sur le territoire",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 156, unit: "SPANC", trend: "Stable", trendDir: "neutral", details: "Services Publics d'ANC"}
  },
  {
    id: "IND-033", section: "Gouvernance et action menées",
    exposition: "Sensibilité", categorie: "Gouvernance", sousCategorie: "Organisation des acteurs",
    nom: "Collectivités compétentes en matière de GEMAPI (1,2,5,8)",
    description: "Nombre de collectivités compétentes sur le territoire",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 54, unit: "EPCI", trend: "Stable depuis transfert 2018", trendDir: "neutral", details: "Compétence obligatoire EPCI"}
  },
  {
    id: "IND-034", section: "Gouvernance et action menées",
    exposition: "Vulnérabilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de réduction des risques naturels",
    nom: "Programme d'Actions de Prévention des Inondations (PAPI)",
    description: "Couverture du territoire par les procédures (PEP/PAPI)",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 38, unit: "% couvert", trend: "+5 pt depuis 2022", trendDir: "up", details: "7 PAPI actifs sur le Grand Est"}
  },
  {
    id: "IND-035", section: "Gouvernance et action menées",
    exposition: "Vulnérabilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de réduction des risques naturels",
    nom: "Programme d'Actions de Prévention des Inondations (PAPI)",
    description: "Couverture du territoire par les procédures (PEP/PAPI) par avancement des procédures",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["PAPI complet","PAPI intention","PEP","En attente"], values:[42,28,18,12], colors:["#2E7D32","#F57F17","#1565C0","#B0BEC5"]}}
  },
  {
    id: "IND-036", section: "Gouvernance et action menées",
    exposition: "Vulnérabilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de réduction des risques naturels",
    nom: "Stratégie Locale de Gestion du Risque Inondation (SLGRI)",
    description: "Couverture du territoire par les procédures SLGRI",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 52, unit: "% couvert", trend: "+8 pt depuis 2020", trendDir: "up", details: "12 SLGRI sur le territoire"}
  },
  {
    id: "IND-037", section: "Gouvernance et action menées",
    exposition: "Vulnérabilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de réduction des risques naturels",
    nom: "Stratégie Locale de Gestion du Risque Inondation (SLGRI)",
    description: "Couverture du territoire par les procédures SLGRI par avancement des procédures",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Approuvée","En cours","Émergence"], values:[55,30,15], colors:["#2E7D32","#F57F17","#B0BEC5"]}}
  },
  {
    id: "IND-038", section: "Gouvernance et action menées",
    exposition: "Vulnérabilité", categorie: "Actions menées", sousCategorie: "Plans et programmes en matière de réduction des risques naturels",
    nom: "Plans de Préventions des Risques Inondation ( PPRI )",
    description: "Nombre de cours d'eau du territoire couvert par un PPRI sur le territoire",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 89, unit: "PPRI", trend: "+4 depuis 2022", trendDir: "up", details: "Couvrant 1 247 communes du Grand Est"}
  },

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 3 : Ressource / usage / pression (35 indicateurs)
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "IND-039", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Eaux de surface",
    nom: "Indicateurs descriptifs des plans d'eau",
    description: "Nombre de plans d'eau sur le territoire sélectionné",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 1842, unit: "plans d'eau", trend: "+24 depuis 2020", trendDir: "up", details: "Étangs, lacs, gravières, retenues"}
  },
  {
    id: "IND-040", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Eaux de surface",
    nom: "Indicateurs descriptifs des plans d'eau",
    description: "Superficie de plans d'eau sur le territoire sélectionné",
    unite: "Hectare", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 28400, unit: "ha", trend: "Stable", trendDir: "neutral", details: "Dont lac de Der-Chantecoq : 4 800 ha"}
  },
  {
    id: "IND-041", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Eaux de surface",
    nom: "Indicateurs descriptifs des cours d'eau",
    description: "Linéaire de cours d'eau sur l'entité géographique sélectionnée",
    unite: "Km", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 52800, unit: "km", trend: "Stable", trendDir: "neutral", details: "Densité réseau : 0,92 km/km²"}
  },
  {
    id: "IND-042", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Eaux de surface",
    nom: "Hydrologie moyenne",
    description: "Identification du module des stations de mesure sur le territoire\nReprésentatité = 30 ans",
    unite: "m3/s", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 145, unit: "m³/s (moy.)", trend: "−8% vs réf. 1991-2020", trendDir: "down", details: "Stations principales : Moselle, Meuse, Rhin, Marne"}
  },
  {
    id: "IND-043", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Eaux de surface",
    nom: "Hydrologie moyenne",
    description: "Comparaison du module des stations de mesure sur le territoire par rapport au Qmoyen année n, donc module n-31 à n-1 => n= 2025 donc Module 1995-2024",
    unite: "m3/s", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: "−8", unit: "% vs moy.", trend: "Baisse tendancielle", trendDir: "down", details: "Module 1995-2024 vs référence 1961-1990"}
  },
  {
    id: "IND-044", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Eaux de surface",
    nom: "Hydrologie d'étiage",
    description: "Identification du QMNA5 sur le territoire\nCalcul sur 5 ans à l'année N-1",
    unite: "m3/s", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 32.4, unit: "m³/s", trend: "−12% vs période réf.", trendDir: "down", details: "Débit minimum biologique : seuil critique"}
  },
  {
    id: "IND-045", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Eaux de surface",
    nom: "Hydrologie d'étiage",
    description: "Evolution du QMNA5 sur le territoire (depuis quand?)\nTendance Mann-Kendall",
    unite: "m3/s", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: "Tendance à la baisse", trendDir: "down",
      chartData: {labels:["2015","2016","2017","2018","2019","2020","2021","2022","2023","2024"], values:[38,42,35,28,31,36,29,25,30,27], colors:["#1565C0"]}}
  },
  {
    id: "IND-046", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Eaux souterraines",
    nom: "Evolution de la piézométrie",
    description: "Evolution de la piézométrie sur l'ensemble de la chronique disponible",
    unite: "m", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: "Tendance à la baisse", trendDir: "down",
      chartData: {labels:["2015","2016","2017","2018","2019","2020","2021","2022","2023","2024"], values:[12.4,12.1,11.8,11.2,11.5,10.9,10.6,10.2,10.8,10.3], colors:["#0277BD"]}}
  },
  {
    id: "IND-047", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Evaluation DCE",
    nom: "Etat écologique ESU",
    description: "Présentation du % de masse d'eau superficielle (et des stations) dans chacune des classes d'état - état écologique - MECE+MEPE",
    unite: "Pourcentage", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "donut", labels: "Très bon / Bon / Moyen / Médiocre / Mauvais",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Très bon","Bon","Moyen","Médiocre","Mauvais"], values:[8,37,32,18,5], colors:["#1B5E20","#4CAF50","#FFC107","#FF9800","#F44336"]}}
  },
  {
    id: "IND-048", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Evaluation DCE",
    nom: "Etat chimique ESU",
    description: "Présentation du % de masse d'eau superficielle (et des stations) dans chacune des classes d'état - état chimique - MECE+MEPE",
    unite: "Pourcentage", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "donut", labels: "Bon / Mauvais",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Bon","Mauvais"], values:[62,38], colors:["#4CAF50","#F44336"]}}
  },
  {
    id: "IND-049", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Evaluation DCE",
    nom: "Etat quantitatif ESO",
    description: "Présentation du % de masse d'eau souterraines dans chacune des classes d'état - état  quantitatif - MESO",
    unite: "Pourcentage", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "donut", labels: "Bon / Médiocre",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Bon","Médiocre"], values:[78,22], colors:["#4CAF50","#FF9800"]}}
  },
  {
    id: "IND-050", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Evaluation DCE",
    nom: "Etat chimique ESO",
    description: "Présentation du % de masse d'eau souterraines dans chacune des classes d'état - état  chimique - MESO",
    unite: "Pourcentage", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "donut", labels: "Bon / Médiocre",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Bon","Médiocre"], values:[56,44], colors:["#4CAF50","#FF9800"]}}
  },
  {
    id: "IND-051", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Ressources", sousCategorie: "Qualité de l'eau",
    nom: "Nitrates Eaux de surface",
    description: "% de stations avec un niveau de nitrates > 18 mg/l (eutrophisation) — réseau DCE/RCS",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 34, unit: "% stations > 18 mg/l", trend: "−3 pt depuis 2020", trendDir: "up", details: "Zones vulnérables : plaine d'Alsace, Champagne"}
  },
  {
    id: "IND-052", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Industrie",
    nom: "Installations Classées pour Protecrtion de l'Environnement (ICPE)",
    description: "Répartition des ICPE entre SEVESO et non-SEVESO",
    unite: "Nombre", affichage: {carto: true, graphique: true, chiffre: false},
    graphType: "donut", labels: "Seveso / Non Seveso",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["SEVESO seuil haut","SEVESO seuil bas","Non SEVESO"], values:[48,72,1420], colors:["#D84315","#FF8A65","#78909C"]}}
  },
  {
    id: "IND-053", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Pression", sousCategorie: "Industrie",
    nom: "Sites et sols pollués",
    description: "Sites et sols pollués ou potentiellement pollués (ex-BASOL)",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "Seveso / Non Seveso / NULL",
    fakeData: {value: 847, unit: "sites", trend: "+12 nouvelles inscriptions 2024", trendDir: "down", details: "Dont 124 en traitement actif"}
  },
  {
    id: "IND-054", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Agriculture",
    nom: "Surfaces agricoles du Registre Parcellaire Graphique (RPG) par catégorie",
    description: "Localiser et caractériser les surfaces cultivées par type de culture",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "-",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Céréales","Prairies","Oléagineux","Viticulture","Maraîchage","Autres"], values:[42,28,12,9,4,5], colors:["#F57F17","#2E7D32","#FF8F00","#6A1B9A","#00796B","#B0BEC5"]}}
  },
  {
    id: "IND-055", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Agriculture",
    nom: "Evolution des volumes d'eau prélevés à usage irrigation par type d'eau",
    description: "Evolution des volumes d'eau prélevés pour un usage irrigation par type d'eau (ESU, ESO) sur toute la chronique disponible (2008->2023)",
    unite: "m3", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: "Hausse depuis 2018", trendDir: "up",
      chartData: {labels:["2016","2017","2018","2019","2020","2021","2022","2023"], values:[18.2,19.1,22.4,24.8,21.3,26.1,28.7,25.4], colors:["#2E7D32"]}}
  },
  {
    id: "IND-056", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Agriculture",
    nom: "Indicateur Deaumin'eau",
    description: "?",
    unite: "", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: "—", unit: "", trend: "À définir (V3)", trendDir: "neutral", details: "Indicateur en cours de construction"}
  },
  {
    id: "IND-057", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Agriculture - Irrigation",
    nom: "Surface Agricole Utilisée (SAU) irrigée",
    description: "Part de la SAU irriguée dans la superficie territoriale",
    unite: "Pourcentage", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 4.7, unit: "% SAU", trend: "+1.2 pt depuis 2018", trendDir: "up", details: "Principalement plaine d'Alsace et Champagne"}
  },
  {
    id: "IND-058", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Assainissement",
    nom: "Caractéristiques des stations d'épuration des collectivités",
    description: "Capacités des stations d'épuration des collectivités (EH) par station",
    unite: "EH", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 1247, unit: "STEP", trend: "+18 mises aux normes 2024", trendDir: "up", details: "Capacité totale : 8,4 M EH"}
  },
  {
    id: "IND-059", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Assainissement",
    nom: "Personnes couvertes par l'assainissement collectif",
    description: "Indique le nombre d'habitants qui sont raccordé à l'assainissement collectif",
    unite: "Nombre", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: "4,82", unit: "M hab.", trend: "+45 000 depuis 2022", trendDir: "up", details: "87% de la population régionale"}
  },
  {
    id: "IND-060", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Assainissement",
    nom: "Projet de REUT",
    description: "Présence d'un projet de REUT sur la STEU",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 8, unit: "projets", trend: "+4 depuis 2023", trendDir: "up", details: "Strasbourg, Metz, Nancy, Reims…"}
  },
  {
    id: "IND-061", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Assainissement",
    nom: "Prix de l'assainissement collectif",
    description: "Prix de l'assainissement collectif",
    unite: "€/m3", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 2.18, unit: "€/m³", trend: "+3.2% vs 2023", trendDir: "down", details: "Moy. nationale : 2.05 €/m³"}
  },
  {
    id: "IND-062", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Eau potable",
    nom: "Evolution des volumes d'eau prélevés à usage AEP par type d'eau",
    description: "Evolution des volumes d'eau prélevés pour un usage AEP par type d'eau (ESU, ESO) sur toute la chronique disponible (2008->2023)",
    unite: "m3", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: "Stable", trendDir: "neutral",
      chartData: {labels:["2016","2017","2018","2019","2020","2021","2022","2023"], values:[412,408,415,402,398,404,396,401], colors:["#0277BD"]}}
  },
  {
    id: "IND-063", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Eau potable",
    nom: "Volume prélevé à usage AEP",
    description: "M3/habitant",
    unite: "m3/hab", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 72, unit: "m³/hab/an", trend: "−2 m³ vs 2022", trendDir: "up", details: "Moy. nationale : 78 m³/hab/an"}
  },
  {
    id: "IND-064", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Eau potable",
    nom: "Indicateurs rendement des réseaux",
    description: "%  de réseau efficace (Min, Max, Moy) sur le territoire",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 79.4, unit: "%", trend: "+1.2 pt vs 2022", trendDir: "up", details: "Min: 52% — Max: 96% — Seuil Grenelle: 80%"}
  },
  {
    id: "IND-065", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Eau potable",
    nom: "Indicateurs prix de l'eau",
    description: "€/m3 pour une consommation moyenne de 120m3 max (Min, Max, Moy) sur le territoire",
    unite: "€/m3", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 4.32, unit: "€/m³", trend: "+4.1% vs 2023", trendDir: "down", details: "Min: 2.80 — Max: 6.95 — Moy. France: 4.14"}
  },
  {
    id: "IND-066", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Eau potable",
    nom: "AAC",
    description: "% du territoire couvert par une AAC",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 28.6, unit: "% territoire", trend: "+2.4 pt depuis 2022", trendDir: "up", details: "Protection des ressources en eau potable"}
  },
  {
    id: "IND-067", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Eau potable",
    nom: "Captages sensibles/prioritaire",
    description: "Nombre de captages sensibles ou captages prioritaires sur le territoire (SDAGE)\nReboucler les sources de données avec Lajlah (cf. mail transmis par Lajlah sur la différence entre les 2)",
    unite: "Nombre", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "-",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Captages Grenelle","Captages SDAGE","Captages conférence env."], values:[42,68,24], colors:["#D84315","#F57F17","#1565C0"]}}
  },
  {
    id: "IND-068", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Plans eau",
    nom: "Nombre de sites de baignade",
    description: "Nombre de sites de baignade",
    unite: "Nombre", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 87, unit: "sites", trend: "+3 depuis 2023", trendDir: "up", details: "Répartis sur 8 départements"}
  },
  {
    id: "IND-069", section: "Ressource / usage / pression",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Plans eau",
    nom: "Sites de baignade par classe de qualité des eaux de baignade",
    description: "Sites de baignade par classe de qualité des eaux de baignade",
    unite: "Nombre", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "Excellent / Bon / Suffisant / Insuffisant",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Excellent","Bon","Suffisant","Insuffisant","Non classé"], values:[38,29,12,5,3], colors:["#1B5E20","#4CAF50","#FFC107","#F44336","#B0BEC5"]}}
  },
  {
    id: "IND-070", section: "Ressource / usage / pression",
    exposition: "Vulnérabilité", categorie: "Pression", sousCategorie: "Prélèvement",
    nom: "Evolution des volumes d'eau prélevés tous usages confondus par type d'eau",
    description: "Evolution des volumes d'eau prélevés tous usages confondus par type d'eau (ESU, ESO) sur toute la chronique disponible (2008->2023)",
    unite: "m3", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "CONT / LIT / SOUT / STOC",
    fakeData: {value: null, trend: "Baisse légère", trendDir: "up",
      chartData: {labels:["2016","2017","2018","2019","2020","2021","2022","2023"], values:[780,765,792,748,735,752,728,721], colors:["#455A64"]}}
  },
  {
    id: "IND-071", section: "Ressource / usage / pression",
    exposition: "Vulnérabilité", categorie: "Pression", sousCategorie: "Industrie",
    nom: "Evolution des volumes d'eau prélevés à usage industrie par type d'eau",
    description: "Evolution des volumes d'eau prélevés pour un usage industrie par type d'eau (ESU, ESO) sur toute la chronique disponible (2008->2023)",
    unite: "m3", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: "Baisse continue", trendDir: "up",
      chartData: {labels:["2016","2017","2018","2019","2020","2021","2022","2023"], values:[245,238,232,218,205,212,198,192], colors:["#37474F"]}}
  },
  {
    id: "IND-072", section: "Ressource / usage / pression",
    exposition: "Vulnérabilité", categorie: "Pression", sousCategorie: "Prélèvement",
    nom: "Ecart par rapport à une moyenne annuelle",
    description: "Prévoir une période de référence et indiquer l'écart (à discuter)",
    unite: "Nombre", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: "−4.2", unit: "% vs moy.", trend: "Période réf. 2008-2018", trendDir: "up", details: "Effort de sobriété mesuré"}
  },
  {
    id: "IND-073", section: "Ressource / usage / pression",
    exposition: "Vulnérabilité", categorie: "Pression", sousCategorie: "Industrie",
    nom: "Indicateur d'impact / zone à risque ou non",
    description: "Emission polluantes par industrie? Géoriques",
    unite: "", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: "—", unit: "", trend: "À définir (V3)", trendDir: "neutral", details: "En attente de consolidation des données Géorisques"}
  },

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 4 : Vulnérabilité et adaptation climatique (19 indicateurs)
  // (18 officiels + 1 row 87 avec section " " rattaché ici)
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "IND-074", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Normales climatiques",
    nom: "Températures moyennes mensuelles de l'année n-1",
    description: "Valeur de températures moyennes mensuelles sur l'année n-1",
    unite: "°C", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"], values:[2.8,3.4,7.2,11.4,15.8,19.2,22.1,21.4,16.8,11.2,6.4,3.1], colors:["#D84315"]}}
  },
  {
    id: "IND-075", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Normales climatiques",
    nom: "Températures moyennes mensuelles sur la période de référence (1991-2020)",
    description: "Valeur de températures moyennes mensuelles sur la période de référence (1991-2020)",
    unite: "°C", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"], values:[1.8,2.6,6.1,9.8,14.2,17.8,20.1,19.6,15.4,10.4,5.8,2.4], colors:["#1565C0"]}}
  },
  {
    id: "IND-076", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Normales climatiques",
    nom: "Température moyenne annuelle de l'année n-1",
    description: "Valeur de température moyenne annuelle sur l'année n-1",
    unite: "°C", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 11.7, unit: "°C", trend: "+0.9°C vs réf. 1991-2020", trendDir: "down", details: "Année n-1 : 2024 — Réf : 10.8°C"}
  },
  {
    id: "IND-077", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Normales climatiques",
    nom: "Température moyenne annuelle sur la période de référence (1991-2020)",
    description: "Valeur de température moyenne annuelle sur la période de référence (1991-2020)",
    unite: "°C", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 10.8, unit: "°C", trend: "Référence climatologique", trendDir: "neutral", details: "Normale 1991-2020 Météo-France"}
  },
  {
    id: "IND-078", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Normales climatiques",
    nom: "Cumuls de précipitations mensuelles de l'année n-1",
    description: "Valeur de précipitations moyennes mensuelles sur l'année n-1",
    unite: "mm", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"], values:[62,48,55,52,72,68,58,64,54,68,72,78], colors:["#0277BD"]}}
  },
  {
    id: "IND-079", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Normales climatiques",
    nom: "Cumuls de précipitations moyennes mensuelles sur la période de référence (1991-2020)",
    description: "Valeur de précipitations moyennes mensuelles sur la période de référence (1991-2020)",
    unite: "mm", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"], values:[68,54,58,56,74,72,62,68,58,72,76,82], colors:["#1565C0"]}}
  },
  {
    id: "IND-080", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Normales climatiques",
    nom: "Cumul de précipitation moyenne annuelle de l'année n-1",
    description: "Valeur de précipitation moyenne annuelle sur l'année n-1",
    unite: "mm", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 751, unit: "mm", trend: "−49 mm vs réf.", trendDir: "down", details: "Année 2024 — Déficit hydrique modéré"}
  },
  {
    id: "IND-081", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Normales climatiques",
    nom: "Cumul de précipitation moyenne annuelle sur la période de référence (1991-2020)",
    description: "Valeur de précipitation moyenne annuelle sur la période de référence (1991-2020)",
    unite: "mm", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 800, unit: "mm", trend: "Référence climatologique", trendDir: "neutral", details: "Normale 1991-2020 Météo-France"}
  },
  {
    id: "IND-082", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Evolution climat passé",
    nom: "Evolution des températures moyennes annuelles sur la période de référence (1991-2020)",
    description: "Tendance d'évolution des températures moyennes annuelles sur la période de référence (1991-2020)",
    unite: "°C/an", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: "+0.04", unit: "°C/an", trend: "Tendance significative", trendDir: "down", details: "+1.2°C en 30 ans — Mann-Kendall significatif"}
  },
  {
    id: "IND-083", section: "Vulnérabilité et adaptation climatique",
    exposition: "Exposition", categorie: "Vulnérabilité", sousCategorie: "Evolution climat passé",
    nom: "Evolution des cumuls de précipitations moyennes annuelles sur la période de référence (1991-2020)",
    description: "Tendance d'évolution des cumuls de précipitations moyennes annuelles sur la période de référence (1991-2020)",
    unite: "mm/an", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: "−1.8", unit: "mm/an", trend: "Tendance non significative", trendDir: "neutral", details: "Variabilité interannuelle importante"}
  },
  {
    id: "IND-084", section: "Vulnérabilité et adaptation climatique",
    exposition: "Vulnérabilité", categorie: "Vulnérabilité", sousCategorie: "Vulnérabilité",
    nom: "Vulnérabilité au changement climatique",
    description: "Reprise des résultats des atlas de vulnérabilité des comités de bassins Seine Normandie et Rhin Meuse et RMC",
    unite: "", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: "Élevée", unit: "", trend: "Atlas comités de bassin", trendDir: "down", details: "Scores élevés sur bassins Marne, Aisne et Ill"}
  },
  {
    id: "IND-085", section: "Vulnérabilité et adaptation climatique",
    exposition: "Vulnérabilité", categorie: "Vulnérabilité", sousCategorie: "Gestion",
    nom: "Nombre de jours sous arrêtés de restrictions d'eau de l'année n-1",
    description: "Nombre de jours sous arrêtés de restrictions d'eau par niveau de gravité (Vigilance, Alerte, Alerte renforcée et Crise) de l'année n-1\n+ Faire un renvoi vers VIGIEAU pour année en cours",
    unite: "Nombre", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "Vigilance / Alerte / Alerte renforcée / Crise",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Vigilance","Alerte","Alerte renforcée","Crise"], values:[42,28,18,7], colors:["#FFC107","#FF9800","#F44336","#B71C1C"]}}
  },
  {
    id: "IND-086", section: "Vulnérabilité et adaptation climatique",
    exposition: "Vulnérabilité", categorie: "Vulnérabilité", sousCategorie: "Gestion",
    nom: "Evolution annuelle du nombre de jours sous arrêtés de restrictions d'eau sur la période disponible",
    description: "Evolution annuelle du nombre de jours sous arrêtés de restrictions d'eau par niveau de gravité (Vigilance, Alerte, Alerte renforcée et Crise) sur la période disponible",
    unite: "Nombre", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "Vigilance / Alerte / Alerte renforcée / Crise",
    fakeData: {value: null, trend: "Hausse depuis 2018", trendDir: "down",
      chartData: {labels:["2018","2019","2020","2021","2022","2023","2024"], values:[32,48,55,42,72,68,95], colors:["#D84315"]}}
  },
  {
    id: "IND-087", section: "Vulnérabilité et adaptation climatique",
    exposition: "Vulnérabilité", categorie: "Vulnérabilité", sousCategorie: "Eaux superficielles",
    nom: "Observations visuelles sur l'écoulement des cours d'eau de l'année n-1",
    description: "Répartition mensuelle (de mai à septembre) des observations visuelles sur l'écoulement des cours d'eau par modalités d'écoulement (Ecoulement visible, Ecoulement non visible et Assec) de l'année n-1\n+ Faire un renvoi vers ONDE pour année en cours",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "Ecoulement visible / non visible / Assec",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Mai","Juin","Juillet","Août","Septembre"], values:[92,85,72,64,78], colors:["#0277BD"]}}
  },
  {
    id: "IND-088", section: "Vulnérabilité et adaptation climatique",
    exposition: "Vulnérabilité", categorie: "Vulnérabilité", sousCategorie: "Eaux superficielles",
    nom: "Observations visuelles sur l'écoulement des cours d'eau sur la période disponible (de 2012 à l'année n-1)",
    description: "Répartition mensuelle (de mai à septembre) des observations visuelles sur l'écoulement des cours d'eau par modalités d'écoulement (Ecoulement visible, Ecoulement non visible et Assec) sur la période disponible\n+ Faire un renvoi vers ONDE pour année en cours",
    unite: "Pourcentage", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "Ecoulement visible / non visible / Assec",
    fakeData: {value: null, trend: "Dégradation progressive", trendDir: "down",
      chartData: {labels:["2012","2014","2016","2018","2020","2022","2024"], values:[96,94,91,87,84,80,78], colors:["#0277BD"]}}
  },
  {
    id: "IND-089", section: "Vulnérabilité et adaptation climatique",
    exposition: "Sensibilité", categorie: "Vulnérabilité", sousCategorie: "Eau potable",
    nom: "Pénurie eau potable",
    description: "Captages avec interruption d'alimentation AEP",
    unite: "Nombre", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 14, unit: "captages", trend: "+6 vs 2022", trendDir: "down", details: "Interruptions liées aux étiages sévères"}
  },
  {
    id: "IND-090", section: "Vulnérabilité et adaptation climatique",
    exposition: "Vulnérabilité", categorie: "Vulnérabilité", sousCategorie: "Hydrologie",
    nom: "Indicateurs d'impact sur la population (surface inondable vs nbre d'hab par exemple)",
    description: "",
    unite: "", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: "—", unit: "", trend: "À définir (V3)", trendDir: "neutral", details: "Croisement données PPRI × population INSEE"}
  },
  {
    id: "IND-091", section: "Vulnérabilité et adaptation climatique",
    exposition: "Vulnérabilité", categorie: "Vulnérabilité", sousCategorie: "CatNat",
    nom: "Nombre d'arrêtés de catastrophes naturelles de l'année n-1",
    description: "Nombre d'arrêtés de catastrophes naturelles par type de risque (Sécheresse, Inondations, etc.) de l'année n-1",
    unite: "Nombre", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "donut", labels: "Sécheresse / Inondations / Coulées de boue",
    fakeData: {value: null, trend: null, trendDir: "neutral",
      chartData: {labels:["Inondations","Sécheresse","Coulées de boue","Remontée nappe","Autres"], values:[124,87,42,18,12], colors:["#1565C0","#D84315","#6A1B9A","#00796B","#B0BEC5"]}}
  },
  {
    id: "IND-092", section: "Vulnérabilité et adaptation climatique",
    exposition: "Vulnérabilité", categorie: "Vulnérabilité", sousCategorie: "CatNat",
    nom: "Evolution du nombre d'arrêtés de catastrophes naturelles sur la période disponible",
    description: "Evolution du nombre d'arrêtés de catastrophes naturelles par type de risque (Sécheresse, Inondations, etc.) sur la période disponible",
    unite: "Nombre", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "Sécheresse / Inondations / Coulées de boue",
    fakeData: {value: null, trend: "Hausse marquée", trendDir: "down",
      chartData: {labels:["2015","2016","2017","2018","2019","2020","2021","2022","2023","2024"], values:[145,168,132,198,212,178,224,256,242,283], colors:["#D84315"]}}
  },

  // ══════════════════════════════════════════════════════════════════════
  // SECTION 5 : Fiche d'identité (13 indicateurs)
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "IND-093", section: "Fiche d'identité",
    exposition: "", categorie: "Eaux de surface", sousCategorie: "Prélèvement",
    nom: "Volume prélevé",
    description: "Somme des volumes d'eau prélevée tous usages confondus par le type de ressource ESU sur toute la chronique disponible (BNPE 2008-2023)",
    unite: "Mm3", affichage: {carto: false, graphique: true, chiffre: true},
    graphType: "histogramme", labels: "",
    fakeData: {value: 312, unit: "Mm³/an", trend: "−4% vs 2022", trendDir: "up",
      chartData: {labels:["2018","2019","2020","2021","2022","2023"], values:[335,328,318,325,320,312], colors:["#0277BD"]}}
  },
  {
    id: "IND-094", section: "Fiche d'identité",
    exposition: "", categorie: "Eaux souterraines", sousCategorie: "Prélèvement",
    nom: "Volume prélevé",
    description: "Somme des volumes d'eau prélevée tous usages confondus par le type de ressource ESO sur toute la chronique disponible (BNPE 2008-2023)",
    unite: "Mm3", affichage: {carto: false, graphique: true, chiffre: true},
    graphType: "histogramme", labels: "",
    fakeData: {value: 428, unit: "Mm³/an", trend: "Stable", trendDir: "neutral",
      chartData: {labels:["2018","2019","2020","2021","2022","2023"], values:[435,422,418,430,425,428], colors:["#1565C0"]}}
  },
  {
    id: "IND-095", section: "Fiche d'identité",
    exposition: "", categorie: "Données administratives", sousCategorie: "Population",
    nom: "Population totale",
    description: "Population totale sur un territoire donné",
    unite: "Nombre d'habitants", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: "5,56", unit: "M hab.", trend: "+0.1% vs 2023", trendDir: "up", details: "INSEE 2024 — Région Grand Est"}
  },
  {
    id: "IND-096", section: "Fiche d'identité",
    exposition: "", categorie: "Données administratives", sousCategorie: "Population",
    nom: "Evolution de la population totale",
    description: "Evolution de la population totale sur toute la chronique disponible (source Région)",
    unite: "Nombre d'habitants", affichage: {carto: false, graphique: true, chiffre: false},
    graphType: "histogramme", labels: "-",
    fakeData: {value: null, trend: "Quasi-stable", trendDir: "neutral",
      chartData: {labels:["2015","2016","2017","2018","2019","2020","2021","2022","2023","2024"], values:[5.54,5.55,5.55,5.55,5.56,5.55,5.56,5.56,5.56,5.56], colors:["#455A64"]}}
  },
  {
    id: "IND-097", section: "Fiche d'identité",
    exposition: "", categorie: "Données administratives", sousCategorie: "Population",
    nom: "Densité",
    description: "Indique le nombre d'habitant au km2 / prévoir un comparatif par rapport au GE",
    unite: "hab/km2", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: 97, unit: "hab/km²", trend: "Moy. France : 119 hab/km²", trendDir: "neutral", details: "Territoire peu dense comparé au national"}
  },
  {
    id: "IND-098", section: "Fiche d'identité",
    exposition: "", categorie: "Données administratives", sousCategorie: "Population",
    nom: "Ruralité",
    description: "Indique la typologie du territoire (selon l'échelle, prévoir des comparatifs)",
    unite: "-", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: "Semi-rural", unit: "", trend: "Grille communale INSEE", trendDir: "neutral", details: "62% communes rurales, 38% urbaines"}
  },
  {
    id: "IND-099", section: "Fiche d'identité",
    exposition: "", categorie: "Données administratives", sousCategorie: "Superficie du territoire",
    nom: "Superficie",
    description: "Indique la superficie du territoire donnée",
    unite: "km2", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: "57 441", unit: "km²", trend: "Plus grande région de France métropolitaine", trendDir: "neutral", details: "10 départements — 5 115 communes"}
  },
  {
    id: "IND-100", section: "Fiche d'identité",
    exposition: "", categorie: "Données administratives", sousCategorie: "Echelles administratives",
    nom: "Nom du territoire",
    description: "Indique si le territoire donné est une commune, une EPCI….",
    unite: "oui/non", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: "Région", unit: "", trend: "Grand Est", trendDir: "neutral", details: "10 départements, 155 EPCI, 5 115 communes"}
  },
  {
    id: "IND-101", section: "Fiche d'identité",
    exposition: "", categorie: "Données administratives", sousCategorie: "Echelles géographiques",
    nom: "Nom du territoire",
    description: "Indique si le territoire donné est un BV…",
    unite: "oui/non", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: "Multi-bassins", unit: "", trend: "3 bassins hydrographiques", trendDir: "neutral", details: "Rhin-Meuse, Seine-Normandie, Rhône-Méditerranée"}
  },
  {
    id: "IND-102", section: "Fiche d'identité",
    exposition: "", categorie: "Données administratives", sousCategorie: "Echelles territoires de projet",
    nom: "Nom du territoire",
    description: "Indique si le territoire donné est un SCOT, PAOT, PTG, SAGE,…",
    unite: "oui/non", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "-",
    fakeData: {value: "18 SAGE", unit: "", trend: "Territoires de projet eau", trendDir: "neutral", details: "18 SAGE, 14 contrats milieu, 7 PTGE, 24 SCoT"}
  },
  {
    id: "IND-103", section: "Fiche d'identité",
    exposition: "", categorie: "Eau potable", sousCategorie: "Coûts de la gestion de l'eau",
    nom: "Prix de l'eau",
    description: "Présenter prix des services de l'eau des collectivités compétentes en matière de distribution",
    unite: "€/m3", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 4.32, unit: "€/m³", trend: "+4.1% vs 2023", trendDir: "down", details: "Eau + assainissement pour 120 m³/an"}
  },
  {
    id: "IND-104", section: "Fiche d'identité",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Eau potable",
    nom: "AAC",
    description: "% du territoire couvert par une AAC",
    unite: "Pourcentage", affichage: {carto: true, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 28.6, unit: "% territoire", trend: "+2.4 pt depuis 2022", trendDir: "up", details: "Reprise indicateur Ressources"}
  },
  {
    id: "IND-105", section: "Fiche d'identité",
    exposition: "Sensibilité", categorie: "Usages", sousCategorie: "Eau potable",
    nom: "Captages sensibles",
    description: "Nombre de captages sensibles sur le territoire",
    unite: "Nombre", affichage: {carto: false, graphique: false, chiffre: true},
    graphType: null, labels: "",
    fakeData: {value: 134, unit: "captages", trend: "+8 depuis 2022", trendDir: "up", details: "Captages Grenelle + SDAGE + conf. environnementale"}
  }
];

// ═══════════════════════════════════════════════════════════════════════
// Configuration des sections (couleurs, icônes, descriptions)
// ═══════════════════════════════════════════════════════════════════════

// eslint-disable-next-line no-unused-vars
var SECTIONS_ELU = [
  {
    id: "fiche-identite",
    nom: "Fiche d'identité",
    icon: "ph-identification-card",
    color: "#455A64",
    gradient: "linear-gradient(135deg, #455A64, #607D8B)",
    description: "Données de contexte : population, superficie, organisation territoriale et données de cadrage."
  },
  {
    id: "gouvernance",
    nom: "Gouvernance et action menées",
    icon: "ph-gavel",
    color: "#1565C0",
    gradient: "linear-gradient(135deg, #1565C0, #1976D2)",
    description: "Pilotage, acteurs, couverture par les démarches concertées et plans de gestion de l'eau."
  },
  {
    id: "amenagement",
    nom: "Aménagement du territoire et zonage",
    icon: "ph-buildings",
    color: "#6A1B9A",
    gradient: "linear-gradient(135deg, #6A1B9A, #8E24AA)",
    description: "Zones humides, RAMSAR, ZRE, occupation du sol, obstacles à l'écoulement et documents d'urbanisme."
  },
  {
    id: "ressources",
    nom: "Ressource / usage / pression",
    icon: "ph-drop",
    color: "#00796B",
    gradient: "linear-gradient(135deg, #00796B, #00897B)",
    description: "État des eaux, prélèvements, AEP, assainissement, qualité, agriculture et pressions industrielles."
  },
  {
    id: "vulnerabilite",
    nom: "Vulnérabilité et adaptation climatique",
    icon: "ph-cloud-lightning",
    color: "#D84315",
    gradient: "linear-gradient(135deg, #D84315, #E64A19)",
    description: "Normales climatiques, évolution du climat, restrictions d'eau, étiages et catastrophes naturelles."
  }
];

// Mapping section name → section id pour filtrage
// eslint-disable-next-line no-unused-vars
var SECTION_MAP = {
  "Fiche d'identité": "fiche-identite",
  "fiche d'identité": "fiche-identite",
  "Gouvernance et action menées": "gouvernance",
  "Aménagement du territoire et zonage": "amenagement",
  "Ressource / usage / pression": "ressources",
  "Vulnérabilité et adaptation climatique": "vulnerabilite",
  " ": "vulnerabilite" // row 87 — rattaché à vulnérabilité
};

console.log('[DATA-ELU] ' + INDICATEURS_ELU.length + ' indicateurs chargés, ' + SECTIONS_ELU.length + ' sections');
