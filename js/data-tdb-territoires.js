/**
 * data-tdb-territoires.js
 * ============================================================
 * Données de territoires pour les Tableaux de bord
 * Observatoire de l'Eau – Grand Est
 *
 * ── CONFIGURATION FACILE ──────────────────────────────────
 * Pour modifier les territoires phares (vignettes),
 * éditez uniquement le tableau TDB_PLEBISCITES ci-dessous.
 * Chaque entrée peut avoir :
 *   id        : identifiant unique (slug)
 *   nom       : nom affiché
 *   type      : catégorie (col. A du listing_territoires.xlsx)
 *   photo     : URL image (Unsplash ou autre)
 *   description : courte phrase d'accroche (optionnel)
 *   importance  : rang de tri (1 = le plus important)
 *
 * ── TOTAL PHARES ─────────────────────────────────────────
 * 26 territoires phares par défaut (modifiable)
 * ============================================================
 */

// ============================================================
// A. PHOTOS PAR TERRITOIRE
//    Clé = nom exact du territoire
//    Modifier ici pour changer les visuels
// ============================================================
var TDB_PHOTOS = {
  /* ── Grand Est ─────────────────────────────────────────── */
  "Grand Est":                         "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75",

  /* ── Départements ──────────────────────────────────────── */
  "Ardennes":                          "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=75",
  "Aube":                              "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=75",
  "Marne":                             "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=75",
  "Haute-Marne":                       "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=600&q=75",
  "Meurthe-et-Moselle":                "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=75",
  "Meuse":                             "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=75",
  "Moselle":                           "https://images.unsplash.com/photo-1416339698674-4f118329b5cf?w=600&q=75",
  "Bas-Rhin":                          "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=75",
  "Haut-Rhin":                         "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=600&q=75",
  "Vosges":                            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=75",

  /* ── EPCI majeurs ───────────────────────────────────────── */
  "Eurométropole de Strasbourg":        "https://images.unsplash.com/photo-1567942712661-82b9b407abbf?w=600&q=75",
  "CA Grand Reims":                     "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=75",
  "CA Metz Métropole":                  "https://images.unsplash.com/photo-1551893665-f843f600794e?w=600&q=75",
  "CA Mulhouse Alsace Agglomération":   "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=75",
  "CA Nancy Grand Cœur":               "https://images.unsplash.com/photo-1551279076-52e1d4e11a2d?w=600&q=75",
  "CA Châlons-en-Champagne":            "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=75",
  "CA Colmar Alsace Agglomération":     "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=75",
  "CA Épernay Cœur de Champagne":       "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=75",

  /* ── PNR ────────────────────────────────────────────────── */
  "PNR Vosges du Nord":                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=75",
  "PNR Ballons des Vosges":            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75",
  "PNR Forêt d'Orient":               "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=75",
  "PNR Lorraine":                      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=75",
  "PNR Montagne de Reims":             "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=75",
  "PNR Ardennes":                      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=75",

  /* ── SCoT emblématiques ─────────────────────────────────── */
  "SCoT de la Région de Strasbourg":   "https://images.unsplash.com/photo-1567942712661-82b9b407abbf?w=600&q=75",
  "SCoT de Metz Métropole":            "https://images.unsplash.com/photo-1551893665-f843f600794e?w=600&q=75",
  "SCoT de Reims":                     "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=75",

  /* ── SAGE ───────────────────────────────────────────────── */
  "SAGE Nappe du Rhin":                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75",
  "SAGE Doller":                       "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=600&q=75",
  "SAGE Bassin Ferrifère":             "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=75",

  /* ── Agences de l'eau ───────────────────────────────────── */
  "Agence de l'eau Rhin-Meuse":       "https://images.unsplash.com/photo-1416339698674-4f118329b5cf?w=600&q=75",
  "Agence de l'eau Seine-Normandie":  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=75",
  "Agence de l'eau RMC":              "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=600&q=75"
};

// ============================================================
// B. TERRITOIRES PHARES – LISTE CONFIGURABLE
//    ► Modifier ici pour changer les 26 vignettes
//    ► importance : 1 = priorité max (affiché en 1er et plus grand)
//    ► ordre d'affichage : importance ASC, puis type, puis nom
// ============================================================
var TDB_PLEBISCITES = [

  /* ── 1. Grand Est ── importance maximale ─────────────────── */
  {
    id: "grand-est",
    nom: "Grand Est",
    type: "Région",
    description: "L'ensemble de la région Grand Est – 10 départements, 5 115 communes",
    importance: 1
  },

  /* ── 2. Les 10 départements ──────────────────────────────── */
  { id: "bas-rhin",           nom: "Bas-Rhin",           type: "Département", description: "Département du Bas-Rhin (67) – Strasbourg",          importance: 2 },
  { id: "moselle",            nom: "Moselle",             type: "Département", description: "Département de la Moselle (57) – Metz",               importance: 2 },
  { id: "marne",              nom: "Marne",               type: "Département", description: "Département de la Marne (51) – Châlons-en-Champagne", importance: 2 },
  { id: "meurthe-et-moselle", nom: "Meurthe-et-Moselle",  type: "Département", description: "Département de M.-et-M. (54) – Nancy",                importance: 2 },
  { id: "haut-rhin",          nom: "Haut-Rhin",           type: "Département", description: "Département du Haut-Rhin (68) – Colmar / Mulhouse",   importance: 2 },
  { id: "ardennes",           nom: "Ardennes",            type: "Département", description: "Département des Ardennes (08) – Charleville-Mézières", importance: 2 },
  { id: "vosges",             nom: "Vosges",              type: "Département", description: "Département des Vosges (88) – Épinal",                importance: 2 },
  { id: "aube",               nom: "Aube",                type: "Département", description: "Département de l'Aube (10) – Troyes",                 importance: 2 },
  { id: "meuse",              nom: "Meuse",               type: "Département", description: "Département de la Meuse (55) – Bar-le-Duc",           importance: 2 },
  { id: "haute-marne",        nom: "Haute-Marne",         type: "Département", description: "Département de la Haute-Marne (52) – Chaumont",       importance: 2 },

  /* ── 3. Grandes agglomérations (EPCI) ────────────────────── */
  { id: "eurome-strasbourg",   nom: "Eurométropole de Strasbourg",      type: "EPCI", description: "Eurométropole – 33 communes, ~490 000 hab.",  importance: 3 },
  { id: "ca-grand-reims",      nom: "CA Grand Reims",                   type: "EPCI", description: "Agglomération de Reims – 143 communes",        importance: 3 },
  { id: "ca-metz-metropole",   nom: "CA Metz Métropole",                type: "EPCI", description: "Metz Métropole – 44 communes",                importance: 3 },
  { id: "ca-mulhouse",         nom: "CA Mulhouse Alsace Agglomération", type: "EPCI", description: "M2A – 39 communes, ~265 000 hab.",             importance: 3 },
  { id: "ca-nancy",            nom: "CA Nancy Grand Cœur",              type: "EPCI", description: "Grand Cœur – 20 communes",                    importance: 3 },

  /* ── 4. PNR – parcs naturels régionaux ──────────────────── */
  { id: "pnr-vosges-nord",    nom: "PNR Vosges du Nord",    type: "PNR", description: "Parc naturel régional Vosges du Nord",      importance: 4 },
  { id: "pnr-ballons",        nom: "PNR Ballons des Vosges", type: "PNR", description: "Parc naturel régional Ballons des Vosges",  importance: 4 },
  { id: "pnr-foret-orient",   nom: "PNR Forêt d'Orient",   type: "PNR", description: "Parc naturel régional Forêt d'Orient",       importance: 4 },
  { id: "pnr-lorraine",       nom: "PNR Lorraine",           type: "PNR", description: "Parc naturel régional de Lorraine",         importance: 4 },
  { id: "pnr-montagne-reims", nom: "PNR Montagne de Reims",  type: "PNR", description: "Parc naturel régional Montagne de Reims",   importance: 4 },
  { id: "pnr-ardennes",       nom: "PNR Ardennes",           type: "PNR", description: "Parc naturel régional Ardennes",            importance: 5 },

  /* ── 5. SCoT importants ─────────────────────────────────── */
  { id: "scot-strasbourg", nom: "SCoT de la Région de Strasbourg", type: "SCoT", description: "Schéma de cohérence territoriale de Strasbourg", importance: 5 },
  { id: "scot-metz",       nom: "SCoT de Metz Métropole",          type: "SCoT", description: "SCoT de Metz Métropole",                         importance: 5 },
  { id: "scot-reims",      nom: "SCoT de Reims",                   type: "SCoT", description: "SCoT de la région de Reims",                     importance: 5 },

  /* ── 6. SAGE emblématiques ───────────────────────────────── */
  { id: "sage-nappe-rhin", nom: "SAGE Nappe du Rhin", type: "SAGE", description: "SAGE Nappe de la Plaine du Rhin", importance: 6 }

];
// Nombre total de phares (modifiable dynamiquement)
var TDB_NB_PLEBISCITES = TDB_PLEBISCITES.length; // 26 par défaut

// ============================================================
// C. TOUS LES TERRITOIRES (complet, classé col. A = type)
//    Utilisé pour la liste texte + recherche
//    Source : listing_territoires.xlsx
// ============================================================
var TDB_TOUS_TERRITOIRES = [

  /* ── Région ─────────────────────────────────────────────── */
  { id: "grand-est",           nom: "Grand Est",               type: "Région",     rang: 1 },

  /* ── Agences de l'eau ───────────────────────────────────── */
  { id: "ae-rhin-meuse",      nom: "Agence de l'eau Rhin-Meuse",      type: "Agence de l'eau", rang: 1 },
  { id: "ae-seine-normandie", nom: "Agence de l'eau Seine-Normandie", type: "Agence de l'eau", rang: 2 },
  { id: "ae-rmc",             nom: "Agence de l'eau RMC",             type: "Agence de l'eau", rang: 3 },

  /* ── Départements ──────────────────────────────────────── */
  { id: "dept-08", nom: "Ardennes (08)",            type: "Département", rang: 1 },
  { id: "dept-10", nom: "Aube (10)",                type: "Département", rang: 2 },
  { id: "dept-51", nom: "Marne (51)",               type: "Département", rang: 3 },
  { id: "dept-52", nom: "Haute-Marne (52)",         type: "Département", rang: 4 },
  { id: "dept-54", nom: "Meurthe-et-Moselle (54)",  type: "Département", rang: 5 },
  { id: "dept-55", nom: "Meuse (55)",               type: "Département", rang: 6 },
  { id: "dept-57", nom: "Moselle (57)",             type: "Département", rang: 7 },
  { id: "dept-67", nom: "Bas-Rhin (67)",            type: "Département", rang: 8 },
  { id: "dept-68", nom: "Haut-Rhin (68)",           type: "Département", rang: 9 },
  { id: "dept-88", nom: "Vosges (88)",              type: "Département", rang: 10 },

  /* ── Maisons de Région ──────────────────────────────────── */
  { id: "mr-troyes-chaumont",   nom: "Maison de Région Troyes / Chaumont",     type: "Maison de Région", rang: 1 },
  { id: "mr-reims",             nom: "Maison de Région Reims",                 type: "Maison de Région", rang: 2 },
  { id: "mr-chalons-epernay",   nom: "Maison de Région Châlons / Épernay",     type: "Maison de Région", rang: 3 },
  { id: "mr-charleville",       nom: "Maison de Région Charleville-Mézières", type: "Maison de Région", rang: 4 },
  { id: "mr-nancy",             nom: "Maison de Région Nancy",                 type: "Maison de Région", rang: 5 },
  { id: "mr-metz",              nom: "Maison de Région Metz",                  type: "Maison de Région", rang: 6 },
  { id: "mr-strasbourg",        nom: "Maison de Région Strasbourg",            type: "Maison de Région", rang: 7 },
  { id: "mr-colmar",            nom: "Maison de Région Colmar",                type: "Maison de Région", rang: 8 },
  { id: "mr-mulhouse",          nom: "Maison de Région Mulhouse",              type: "Maison de Région", rang: 9 },
  { id: "mr-epinal",            nom: "Maison de Région Épinal",                type: "Maison de Région", rang: 10 },
  { id: "mr-bar-le-duc",        nom: "Maison de Région Bar-le-Duc",            type: "Maison de Région", rang: 11 },
  { id: "mr-saint-dizier",      nom: "Maison de Région Saint-Dizier",          type: "Maison de Région", rang: 12 },

  /* ── EPCI (représentatif des 150) ───────────────────────── */
  { id: "eurome-strasbourg",   nom: "Eurométropole de Strasbourg",             type: "EPCI", rang: 1 },
  { id: "ca-grand-reims",      nom: "CA Grand Reims",                          type: "EPCI", rang: 2 },
  { id: "ca-metz-metropole",   nom: "CA Metz Métropole",                       type: "EPCI", rang: 3 },
  { id: "ca-mulhouse",         nom: "CA Mulhouse Alsace Agglomération",        type: "EPCI", rang: 4 },
  { id: "ca-nancy",            nom: "CA Nancy Grand Cœur",                     type: "EPCI", rang: 5 },
  { id: "ca-chalons",          nom: "CA Châlons-en-Champagne",                 type: "EPCI", rang: 6 },
  { id: "ca-colmar",           nom: "CA Colmar Alsace Agglomération",          type: "EPCI", rang: 7 },
  { id: "ca-epernay",          nom: "CA Épernay Cœur de Champagne",            type: "EPCI", rang: 8 },
  { id: "ca-haguenau",         nom: "CA de Haguenau",                          type: "EPCI", rang: 9 },
  { id: "ca-sarreguemines",    nom: "CA Sarreguemines Confluences",            type: "EPCI", rang: 10 },
  { id: "ca-bar-le-duc",       nom: "CA de Bar-le-Duc – Sud Meuse",            type: "EPCI", rang: 11 },
  { id: "ca-grand-verdun",     nom: "CA du Grand Verdun",                      type: "EPCI", rang: 12 },
  { id: "cc-grand-langres",    nom: "CC du Grand Langres",                     type: "EPCI", rang: 13 },
  { id: "ca-grand-longwy",     nom: "Grand Longwy Agglomération",              type: "EPCI", rang: 14 },
  { id: "cc-seine-aube",       nom: "CC Seine et Aube",                        type: "EPCI", rang: 15 },
  { id: "cc-argonne",          nom: "CC de l'Argonne Champenoise",             type: "EPCI", rang: 16 },
  { id: "cc-moivre",           nom: "CC de la Moivre à la Coole",              type: "EPCI", rang: 17 },
  { id: "cc-bruche",           nom: "CC de la Vallée de la Bruche",            type: "EPCI", rang: 18 },
  { id: "cc-rouffach",         nom: "CC du Pays de Rouffach, Vignobles et Châteaux", type: "EPCI", rang: 19 },
  { id: "cc-alsace-largue",    nom: "CC Sud Alsace Largue",                    type: "EPCI", rang: 20 },
  { id: "cc-orne-lorraine",    nom: "CC Orne Lorraine Confluences",            type: "EPCI", rang: 21 },
  { id: "cc-bouzonvillois",    nom: "CC Bouzonvillois-Trois Frontières",       type: "EPCI", rang: 22 },
  { id: "cc-mirecourt",        nom: "CC de Mirecourt Dompaire",                type: "EPCI", rang: 23 },
  { id: "cc-cotes-meuse",      nom: "CC Côtes de Meuse Woëvre",               type: "EPCI", rang: 24 },
  { id: "cc-kaysersberg",      nom: "CC de la Vallée de Kaysersberg",          type: "EPCI", rang: 25 },

  /* ── Pays / PETR ────────────────────────────────────────── */
  { id: "petr-chaumont",        nom: "Pays de Chaumont",                   type: "Pays / PETR", rang: 1 },
  { id: "petr-bruche-mossig",   nom: "Pays Bruche Mossig",                 type: "Pays / PETR", rang: 2 },
  { id: "petr-seine-champagne", nom: "Pays Seine en Plaine Champenoise",   type: "Pays / PETR", rang: 3 },
  { id: "petr-othe-armance",    nom: "Pays Othe-Armance",                  type: "Pays / PETR", rang: 4 },
  { id: "petr-vitryat",         nom: "Pays Vitryat",                       type: "Pays / PETR", rang: 5 },
  { id: "petr-epernay",         nom: "Pays d'Épernay Terres de Champagne", type: "Pays / PETR", rang: 6 },
  { id: "petr-alsace-nord",     nom: "Pays d'Alsace du Nord",              type: "Pays / PETR", rang: 7 },
  { id: "petr-saverne",         nom: "Pays de Saverne, Plaine et Plateau", type: "Pays / PETR", rang: 8 },
  { id: "petr-ribeauville",     nom: "Pays de Ribeauvillé",                type: "Pays / PETR", rang: 9 },
  { id: "petr-barr",            nom: "Pays de Barr",                       type: "Pays / PETR", rang: 10 },
  { id: "petr-mulhouse",        nom: "Pays de Mulhouse",                   type: "Pays / PETR", rang: 11 },
  { id: "petr-ardennes-meuse",  nom: "Pays Ardennes-Meuse",                type: "Pays / PETR", rang: 12 },
  { id: "petr-deodatie",        nom: "Pays de la Déodatie",                type: "Pays / PETR", rang: 13 },
  { id: "petr-sarreguemines",   nom: "Pays de Sarreguemines",              type: "Pays / PETR", rang: 14 },
  { id: "petr-sundgau",         nom: "Pays du Sundgau",                    type: "Pays / PETR", rang: 15 },

  /* ── PNR ────────────────────────────────────────────────── */
  { id: "pnr-ardennes",       nom: "PNR Ardennes",                  type: "PNR", rang: 1 },
  { id: "pnr-ballons",        nom: "PNR Ballons des Vosges",        type: "PNR", rang: 2 },
  { id: "pnr-foret-orient",   nom: "PNR Forêt d'Orient",           type: "PNR", rang: 3 },
  { id: "pnr-lorraine",       nom: "PNR Lorraine",                  type: "PNR", rang: 4 },
  { id: "pnr-montagne-reims", nom: "PNR Montagne de Reims",         type: "PNR", rang: 5 },
  { id: "pnr-vosges-nord",    nom: "PNR Vosges du Nord",            type: "PNR", rang: 6 },

  /* ── PTRTE (représentatif des 93) ───────────────────────── */
  { id: "ptrte-argonne-ardennaise", nom: "PTRTE de la CC de l'Argonne Ardennaise",     type: "PTRTE", rang: 1 },
  { id: "ptrte-lacs-champagne",     nom: "PTRTE de la CC des Lacs de Champagne",       type: "PTRTE", rang: 2 },
  { id: "ptrte-epernay",            nom: "PTRTE du PETR du Pays d'Épernay",            type: "PTRTE", rang: 3 },
  { id: "ptrte-kaysersberg",        nom: "PTRTE de la CC de la Vallée de Kaysersberg", type: "PTRTE", rang: 4 },
  { id: "ptrte-guebwiller",         nom: "PTRTE de la CC de la Région de Guebwiller",  type: "PTRTE", rang: 5 },
  { id: "ptrte-haut-rhin-centre",   nom: "PTRTE de la CC du Centre du Haut-Rhin",      type: "PTRTE", rang: 6 },
  { id: "ptrte-rouffach",           nom: "PTRTE de la CC du Pays de Rouffach",         type: "PTRTE", rang: 7 },
  { id: "ptrte-bruche",             nom: "PTRTE de la CC de la Vallée de la Bruche",   type: "PTRTE", rang: 8 },
  { id: "ptrte-alsace-largue",      nom: "PTRTE de la CC Sud Alsace Largue",           type: "PTRTE", rang: 9 },
  { id: "ptrte-orne-lorraine",      nom: "PTRTE de la CC Orne Lorraine Confluences",   type: "PTRTE", rang: 10 },

  /* ── SAGE ───────────────────────────────────────────────── */
  { id: "sage-bassin-ferrifere", nom: "SAGE Bassin Ferrifère",   type: "SAGE", rang: 1 },
  { id: "sage-doller",           nom: "SAGE Doller",              type: "SAGE", rang: 2 },
  { id: "sage-ill-nappe-rhin",   nom: "SAGE Ill Nappe Rhin",     type: "SAGE", rang: 3 },
  { id: "sage-lauter",           nom: "SAGE Lauter",              type: "SAGE", rang: 4 },
  { id: "sage-meurthe",          nom: "SAGE Meurthe",             type: "SAGE", rang: 5 },
  { id: "sage-meuse-amont",      nom: "SAGE Meuse Amont",         type: "SAGE", rang: 6 },
  { id: "sage-moselle-amont",    nom: "SAGE Moselle Amont",       type: "SAGE", rang: 7 },
  { id: "sage-nappe-rhin",       nom: "SAGE Nappe du Rhin",       type: "SAGE", rang: 8 },
  { id: "sage-aisne-vesle",      nom: "SAGE Aisne Vesle Suippe",  type: "SAGE", rang: 9 },
  { id: "sage-ornain",           nom: "SAGE Ornain",              type: "SAGE", rang: 10 },
  { id: "sage-saulx",            nom: "SAGE Saulx",               type: "SAGE", rang: 11 },
  { id: "sage-seille",           nom: "SAGE Seille",              type: "SAGE", rang: 12 },
  { id: "sage-thur-doller",      nom: "SAGE Thur Doller",         type: "SAGE", rang: 13 },
  { id: "sage-vesle",            nom: "SAGE Vesle",               type: "SAGE", rang: 14 },
  { id: "sage-vire",             nom: "SAGE Vire",                type: "SAGE", rang: 15 },

  /* ── SCoT ───────────────────────────────────────────────── */
  { id: "scot-aube",           nom: "SCoT de l'Aube",                       type: "SCoT", rang: 1 },
  { id: "scot-sarreguemines",  nom: "SCoT de Sarreguemines",                type: "SCoT", rang: 2 },
  { id: "scot-strasbourg",     nom: "SCoT de la Région de Strasbourg",      type: "SCoT", rang: 3 },
  { id: "scot-metz",           nom: "SCoT de Metz Métropole",               type: "SCoT", rang: 4 },
  { id: "scot-reims",          nom: "SCoT de Reims",                        type: "SCoT", rang: 5 },
  { id: "scot-nancy",          nom: "SCoT du Pays de Nancy",                type: "SCoT", rang: 6 },
  { id: "scot-mulhouse",       nom: "SCoT de Mulhouse",                     type: "SCoT", rang: 7 },
  { id: "scot-colmar",         nom: "SCoT de la Région de Colmar",          type: "SCoT", rang: 8 },
  { id: "scot-haguenau",       nom: "SCoT de la Région de Haguenau",        type: "SCoT", rang: 9 },
  { id: "scot-thionville",     nom: "SCoT du Pays Thionvillois",            type: "SCoT", rang: 10 },
  { id: "scot-troyes",         nom: "SCoT du Grand Troyes",                 type: "SCoT", rang: 11 },
  { id: "scot-charleville",    nom: "SCoT de Charleville-Mézières",        type: "SCoT", rang: 12 },
  { id: "scot-bar-le-duc",     nom: "SCoT du Grand Bar-le-Duc",             type: "SCoT", rang: 13 },
  { id: "scot-verdun",         nom: "SCoT du Grand Verdun",                 type: "SCoT", rang: 14 },
  { id: "scot-epinal",         nom: "SCoT d'Épinal",                        type: "SCoT", rang: 15 },
  { id: "scot-chaumont",       nom: "SCoT de Chaumont",                     type: "SCoT", rang: 16 },
  { id: "scot-saverne",        nom: "SCoT de Saverne",                      type: "SCoT", rang: 17 }

];

// ============================================================
// D. CONFIG DES TYPES DE TERRITOIRES (ordre + couleurs)
//    Source : colonne A de listing_territoires.xlsx
// ============================================================
var TDB_TYPES_CONFIG = {
  "Région":          { couleur: "#1565C0", icone: "fa-globe",            rang: 1 },
  "Département":     { couleur: "#00796B", icone: "fa-map",              rang: 2 },
  "EPCI":            { couleur: "#6A1B9A", icone: "fa-city",             rang: 3 },
  "Maison de Région":{ couleur: "#4527A0", icone: "fa-landmark",         rang: 4 },
  "Pays / PETR":     { couleur: "#0277BD", icone: "fa-compass",          rang: 5 },
  "PNR":             { couleur: "#2E7D32", icone: "fa-tree",             rang: 6 },
  "PTRTE":           { couleur: "#558B2F", icone: "fa-leaf",             rang: 7 },
  "SAGE":            { couleur: "#00838F", icone: "fa-water",            rang: 8 },
  "SCoT":            { couleur: "#E65100", icone: "fa-compass-drafting", rang: 9 },
  "Agence de l'eau": { couleur: "#0D47A1", icone: "fa-droplet",          rang: 10 },
  "Commune":         { couleur: "#C62828", icone: "fa-house",            rang: 11 }
};

// ============================================================
// E. MÉGA-MENU : top phares par type (max 10 par colonne)
//    Prêt à être consommé par le méga-menu du header
// ============================================================
var TDB_MEGAMENU = (function() {
  var groupes = {};
  // Trier par importance puis nom
  var sorted = TDB_PLEBISCITES.slice().sort(function(a, b) {
    return (a.importance - b.importance) || a.nom.localeCompare(b.nom, 'fr');
  });
  sorted.forEach(function(t) {
    if (!groupes[t.type]) groupes[t.type] = [];
    if (groupes[t.type].length < 10) groupes[t.type].push(t);
  });
  return groupes;
})();

// ============================================================
// F. HELPER : générer l'URL d'un tableau de bord
// ============================================================
// Destination : tableau de bord élu V2 (le V1 tableau-de-bord.html est obsolète).
// L'échelle est déduite du type du territoire ; un nom absent des listes est une commune.
// Le V2 ouvre départements, EPCI, bassins versants et communes ; les autres types
// (PNR, SCoT, SAGE…) n'ont pas encore de données et affichent le Grand Est.
var TDB_V2_NOMS = {
  // Noms des listes ci-dessus → noms exacts de js/data-territoires.js
  'CA Grand Reims':      'CU du Grand Reims',
  'CA Metz Métropole':   'Metz Métropole',
  'CA Nancy Grand Cœur': 'Métropole du Grand Nancy'
};
function tdbUrl(territoireNom, annee, prefix) {
  prefix = (prefix !== undefined) ? prefix : '';
  var type = null;
  [TDB_PLEBISCITES, TDB_TOUS_TERRITOIRES].forEach(function(liste) {
    liste.forEach(function(t) { if (!type && t.nom === territoireNom) type = t.type; });
  });
  if (type === 'Région') return prefix + 'tableau-de-bord-elu-v2.html';
  return prefix + 'tableau-de-bord-elu-v2.html?echelle=' + encodeURIComponent(type || 'Commune') +
    '&territoire=' + encodeURIComponent(TDB_V2_NOMS[territoireNom] || territoireNom);
}

// ============================================================
// G. HELPER : obtenir la photo d'un territoire
// ============================================================
function tdbPhoto(nom) {
  return TDB_PHOTOS[nom] || null;
}

console.log('[data-tdb-territoires] Chargé –',
  TDB_PLEBISCITES.length, 'territoires phares (' + TDB_NB_PLEBISCITES + '),',
  TDB_TOUS_TERRITOIRES.length, 'territoires au total');
