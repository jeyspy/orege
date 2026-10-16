/* ============================================================
   js/retex-detail.js
   Page-specific JavaScript for retex-detail.html
   (Fiche Retour d'expérience — detail view)

   Responsibilities:
     1. RETEX_DATA  — static dataset of 11 sample feedback projects
     2. DOM injection — populates all page sections from RETEX_DATA
        based on the ?id=<number> URL query parameter
     3. Active TOC — highlights the current section in the sticky
        table of contents while the user scrolls

   Dependencies:
     - jQuery (loaded before this file)
     - nav.js (injects site navigation)
     - a11y.js (applies RGAA 4.1 accessibility patches)
     - css/retex-detail.css (page-specific styles)
============================================================ */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     1. RETEX DATA — static catalogue of feedback project sheets
     Each entry corresponds to a ?id=N URL parameter and contains
     all the metadata used to populate the page sections.
  ──────────────────────────────────────────────────────────── */
  var RETEX_DATA = {
    1: {
      titre: "Restauration de zones humides dans la vallée de la Seille — PNR Lorraine",
      porteur: "PNR Lorraine",
      territoire: "Moselle (57)",
      dateDebut: "Janvier 2020",
      duree: "3 ans",
      localisation: "Moselle (57) – Vallée de la Seille, Vic-sur-Seille",
      cat: "Aménagement &amp; Zonage",
      thematiques: [
        { icon: "fa-city",       label: "Aménagement du territoire &amp; Zonage" },
        { icon: "fa-fish",       label: "Connaissance des milieux aquatiques" },
        { icon: "fa-cloud-bolt", label: "Vulnérabilité &amp; Adaptation climatique" }
      ],
      profils: ["elu", "tech"],
      presentation: "Le Parc Naturel Régional de Lorraine, en partenariat avec l'Agence de l'Eau Rhin-Meuse et plusieurs exploitants agricoles riverains, a engagé un vaste programme de restauration des zones humides dégradées de la vallée de la Seille entre 2020 et 2023. Ce projet s'inscrit dans la continuité du SDAGE Rhin-Meuse 2022–2027 et répond aux objectifs DCE de bon état écologique des masses d'eau de la Seille. Le contexte local était celui d'une dégradation progressive des zones humides riveraines depuis les années 1970, avec une perte estimée à 65 % des surfaces humides originelles du secteur entre Vic-sur-Seille et Marsal.",
      objectifs: "Restaurer 120 ha de zones humides dégradées pour améliorer l'autoépuration naturelle et la biodiversité aquatique ; réduire les apports diffus en azote et phosphore vers la Seille de 30 % sur les secteurs traités ; constituer un réseau de haies et de ripisylve pour limiter l'érosion des berges ; créer des conditions favorables au retour du sonneur à ventre jaune (espèce prioritaire Natura 2000) ; sensibiliser les exploitants agricoles riverains aux services écosystémiques rendus par les zones humides.",
      actions: "Le projet s'est articulé en quatre phases successives. La <strong>phase de diagnostic (2020)</strong> a mobilisé un bureau d'études spécialisé pour cartographier 320 ha de zones potentiellement restaurables. La <strong>phase de concertation (2020–2021)</strong> a réuni 18 exploitants agricoles en ateliers participatifs aboutissant à des conventions d'engagement sur 5 ans. La <strong>phase de travaux (2021–2022)</strong> a porté sur l'installation de 14 batardeaux, la replantation de 8 500 ml de haies bocagères et la suppression de 12 km de drains agricoles. La <strong>phase de suivi écologique (2022–2023)</strong> a mis en place 24 stations de surveillance des niveaux phréatiques.",
      kpis: [
        { label: "Surface restaurée",    value: "120 ha"   },
        { label: "Haies replantées",     value: "8 500 ml" },
        { label: "Exploitants engagés",  value: "18"       },
        { label: "Réduction nutriments", value: "−27 %"    },
        { label: "Budget total",         value: "2,4 M€"   },
        { label: "Drains supprimés",     value: "12 km"    }
      ],
      resultatsTexte: "À l'issue du projet, le bilan écologique (automne 2023) fait état d'un retour du sonneur à ventre jaune sur 3 des 6 secteurs traités prioritairement. La qualité physico-chimique de l'eau a montré une amélioration nette des teneurs en nitrates (passage de 18 mg/L à 13,2 mg/L en moyenne) en aval des zones restaurées.",
      financeurs: ["Agence de l'Eau Rhin-Meuse", "Région Grand Est"],
      budgetTotal: "2 400 000 €"
    },
    2: {
      titre: "Mise en place d'un SAGE sur le bassin de l'Orne Mosellane",
      porteur: "EPTB Moselle",
      territoire: "Moselle (57)",
      dateDebut: "Mars 2022",
      duree: "2 ans",
      localisation: "Moselle (57) – Bassin de l'Orne Mosellane",
      cat: "Gouvernance",
      thematiques: [
        { icon: "fa-gavel", label: "Gouvernance &amp; Actions menées" }
      ],
      profils: ["elu", "tech"],
      presentation: "Démarche de concertation innovante impliquant 42 communes et une CLE de 68 membres pour l'élaboration du Schéma d'Aménagement et de Gestion des Eaux sur le bassin de l'Orne Mosellane. Ce SAGE définit les orientations de gestion de la ressource en eau pour les 10 prochaines années.",
      objectifs: "Définir des objectifs partagés de gestion durable de la ressource en eau, coordonner les actions des acteurs du territoire, réduire les conflits d'usage et améliorer la qualité écologique des cours d'eau du bassin de l'Orne Mosellane.",
      actions: "Organisation de 12 ateliers territoriaux, diagnostic territorial approfondi, rédaction du PAGD (Plan d'Aménagement et de Gestion Durable) et du règlement du SAGE, enquête publique de 2 mois et validation par le Préfet de Région.",
      kpis: [
        { label: "Communes impliquées", value: "42"        },
        { label: "Membres de la CLE",   value: "68"        },
        { label: "Ateliers organisés",  value: "12"        },
        { label: "Budget",              value: "850 000 €" }
      ],
      resultatsTexte: "Le SAGE a été approuvé par arrêté préfectoral en décembre 2024. Il définit 48 dispositions réglementaires et 120 actions opérationnelles à mettre en œuvre sur le territoire.",
      financeurs: ["Agence de l'Eau Rhin-Meuse", "Région Grand Est"],
      budgetTotal: "850 000 €"
    },
    3: {
      titre: "Révision du PLU intégrant les zones d'expansion des crues — Reims Métropole",
      porteur: "Reims Métropole",
      territoire: "Marne (51)",
      dateDebut: "Janvier 2023",
      duree: "12 mois",
      localisation: "Marne (51) – Reims Métropole",
      cat: "Aménagement &amp; Zonage",
      thematiques: [
        { icon: "fa-city",       label: "Aménagement du territoire &amp; Zonage" },
        { icon: "fa-cloud-bolt", label: "Vulnérabilité &amp; Adaptation climatique" }
      ],
      profils: ["elu", "tech"],
      presentation: "Intégration des données de l'observatoire dans la révision du Plan Local d'Urbanisme intercommunal de Reims Métropole, avec une attention particulière portée aux zones d'expansion des crues identifiées par les études hydrologiques récentes.",
      objectifs: "Cartographier précisément les zones inondables, intégrer les contraintes hydrologiques dans le règlement du PLUi, préserver les champs d'expansion des crues de l'urbanisation future sur les 143 communes de la métropole.",
      actions: "Collecte et analyse des données hydrométriques depuis l'observatoire régional, modélisation des scénarios de crue centennale et bidécentennale, concertation avec les 143 communes, intégration dans les documents réglementaires du PLUi.",
      kpis: [
        { label: "Communes couvertes",   value: "143"       },
        { label: "Zones cartographiées", value: "58 km²"    },
        { label: "Scénarios modélisés",  value: "3"         },
        { label: "Budget",               value: "320 000 €" }
      ],
      resultatsTexte: "Le PLUi révisé a été approuvé en conseil métropolitain. Les zones à risque inondation représentent 58 km² du territoire, dont 12 km² nouvellement classés en zones inconstructibles.",
      financeurs: ["État / DREAL Grand Est", "Reims Métropole"],
      budgetTotal: "320 000 €"
    },
    4: {
      titre: "Interconnexion de réseaux AEP en situation de sécheresse — Vosges",
      porteur: "Syndicat des eaux du Sud-Vosges",
      territoire: "Vosges (88)",
      dateDebut: "Juin 2022",
      duree: "18 mois",
      localisation: "Vosges (88) – Sud-Vosges",
      cat: "Ressources &amp; Usages",
      thematiques: [
        { icon: "fa-droplet", label: "Ressources &amp; Usages"   },
        { icon: "fa-gauge",   label: "Gestion quantitative" }
      ],
      profils: ["elu", "tech"],
      presentation: "Mise en place d'une interconnexion d'urgence entre 3 syndicats d'eau potable pour sécuriser l'alimentation en eau de 8 000 habitants pendant les périodes d'étiage sévère, suite aux épisodes de sécheresse records de 2022.",
      objectifs: "Garantir la continuité d'approvisionnement en eau potable lors des crises hydrologiques, mutualiser les ressources entre syndicats en période d'étiage, réduire la vulnérabilité du territoire aux sécheresses futures.",
      actions: "Diagnostic des ressources alternatives disponibles, étude de faisabilité de l'interconnexion, pose de 4,2 km de canalisation de liaison, installation d'une station de pompage de secours, mise en place d'un protocole d'activation inter-syndicats.",
      kpis: [
        { label: "Habitants sécurisés",        value: "8 000"    },
        { label: "Canalisation posée",          value: "4,2 km"  },
        { label: "Syndicats interconnectés",    value: "3"        },
        { label: "Budget total",               value: "1,1 M€"  }
      ],
      resultatsTexte: "L'interconnexion a été activée pour la première fois lors de l'étiage de l'été 2023, sécurisant l'alimentation de 8 000 habitants pendant 6 semaines sans restriction d'usage.",
      financeurs: ["Agence de l'Eau Rhin-Meuse", "Région Grand Est"],
      budgetTotal: "1 100 000 €"
    },
    5: {
      titre: "Plan de désimperméabilisation urbaine — Strasbourg",
      porteur: "Eurométropole de Strasbourg",
      territoire: "Bas-Rhin (67)",
      dateDebut: "Septembre 2021",
      duree: "3 ans",
      localisation: "Bas-Rhin (67) – Eurométropole de Strasbourg",
      cat: "Vulnérabilité &amp; Climat",
      thematiques: [
        { icon: "fa-cloud-bolt", label: "Vulnérabilité &amp; Adaptation climatique" },
        { icon: "fa-city",       label: "Aménagement du territoire &amp; Zonage"   }
      ],
      profils: ["elu", "tech", "hab"],
      presentation: "Programme de 450 actions de désimperméabilisation sur le territoire de l'Eurométropole pour réduire le ruissellement urbain et recharger la nappe rhénane, inscrit dans le Plan Climat Air Énergie Territorial (PCAET) de l'Eurométropole de Strasbourg.",
      objectifs: "Réduire le ruissellement urbain de 25 %, augmenter la recharge de la nappe phréatique rhénane de 15 %, végétaliser 80 ha de surface imperméabilisée, améliorer le cadre de vie des habitants.",
      actions: "Désimperméabilisation de 45 cours d'école, création de 120 jardins de pluie, installation de 6 500 m² de toitures végétalisées, déconnexion des eaux pluviales de 28 secteurs de réseaux unitaires.",
      kpis: [
        { label: "Actions réalisées",       value: "450"      },
        { label: "Cours d'école traitées",  value: "45"       },
        { label: "Jardins de pluie",        value: "120"      },
        { label: "Toitures végétalisées",   value: "6 500 m²" },
        { label: "Budget total",            value: "18 M€"    },
        { label: "Réduction ruissellement", value: "−23 %"    }
      ],
      resultatsTexte: "À mi-programme (2023), 285 actions réalisées sur 450. La mesure de l'impact sur la nappe rhénane montre une légère amélioration des niveaux phréatiques dans les zones traitées (+0,4 m en moyenne).",
      financeurs: ["Union Européenne – FEDER", "Région Grand Est"],
      budgetTotal: "18 000 000 €"
    },
    6: {
      titre: "Contrat de rivière Vezouze : bilan d'étape 2024",
      porteur: "Syndicat Mixte du Bassin Versant de la Vezouze",
      territoire: "Meurthe-et-Moselle (54)",
      dateDebut: "Janvier 2019",
      duree: "6 ans",
      localisation: "Meurthe-et-Moselle (54) – Bassin de la Vezouze",
      cat: "Gouvernance",
      thematiques: [
        { icon: "fa-gavel", label: "Gouvernance &amp; Actions menées"        },
        { icon: "fa-fish",  label: "Connaissance des milieux aquatiques" }
      ],
      profils: ["elu", "tech"],
      presentation: "Bilan à mi-parcours du Contrat de rivière Vezouze avec 78 actions réalisées sur 120 programmées, pour un budget engagé de 8,4 M€. Ce contrat vise l'atteinte du bon état écologique de la Vezouze et de ses affluents à l'horizon 2027.",
      objectifs: "Améliorer la qualité des eaux de la Vezouze pour atteindre le bon état écologique DCE, restaurer la continuité piscicole sur 14 ouvrages prioritaires, réduire les rejets polluants d'origine agricole et domestique.",
      actions: "Effacement de 3 seuils, installation de 5 passes à poissons sur les ouvrages prioritaires, réhabilitation de 12 stations d'épuration, mise en place de 18 bandes enherbées en bordure de cours d'eau, animation foncière sur les berges prioritaires.",
      kpis: [
        { label: "Actions réalisées", value: "78 / 120" },
        { label: "Budget engagé",     value: "8,4 M€"  },
        { label: "Seuils effacés",    value: "3"        },
        { label: "Passes à poissons", value: "5"        },
        { label: "STEP réhabilitées", value: "12"       }
      ],
      resultatsTexte: "Le bilan 2024 montre une amélioration de l'indice biologique des macroinvertébrés (IBD passé de 9 à 13/20 sur les stations de référence), signe d'une amélioration progressive de la qualité des eaux.",
      financeurs: ["Agence de l'Eau Rhin-Meuse"],
      budgetTotal: "14 200 000 €"
    },
    7: {
      titre: "Programme d'économies d'eau dans les industries agroalimentaires — Alsace",
      porteur: "Chambre d'agriculture Alsace",
      territoire: "Bas-Rhin (67)",
      dateDebut: "Avril 2022",
      duree: "2 ans",
      localisation: "Bas-Rhin (67) – Plaine d'Alsace",
      cat: "Ressources &amp; Usages",
      thematiques: [
        { icon: "fa-droplet", label: "Ressources &amp; Usages" },
        { icon: "fa-gauge",   label: "Gestion quantitative" }
      ],
      profils: ["tech"],
      presentation: "Démarche collective impliquant 14 entreprises du secteur agroalimentaire alsacien pour réduire leur prélèvement en eau de 20 % grâce à des audits individualisés et des investissements mutualisés dans les équipements de recyclage.",
      objectifs: "Réduire les prélèvements d'eau industriels de 20 % en 2 ans, mutualiser les équipements de recyclage d'eau entre industriels d'un même bassin versant, créer un réseau de partage de bonnes pratiques.",
      actions: "Réalisation de 14 audits eau individualisés par un bureau d'études spécialisé, conception et installation de 8 projets de recyclage des eaux de process, formation de 45 opérateurs, publication d'un guide de bonnes pratiques diffusé à 200 entreprises.",
      kpis: [
        { label: "Entreprises impliquées", value: "14"        },
        { label: "Objectif réduction",     value: "−20 %"     },
        { label: "Opérateurs formés",      value: "45"        },
        { label: "Budget total",           value: "560 000 €" }
      ],
      resultatsTexte: "À l'issue du programme, les 14 entreprises ont réduit leurs prélèvements de 18 % en moyenne, soit une économie de 240 000 m³/an sur le bassin. Le guide de bonnes pratiques a été téléchargé 850 fois.",
      financeurs: ["Agence de l'Eau Rhin-Meuse"],
      budgetTotal: "560 000 €"
    },
    8: {
      titre: "Adaptation au changement climatique du SAGE Ill Nappe Rhin",
      porteur: "Institution Interdépartementale des Bassins Rhin-Meuse",
      territoire: "Haut-Rhin (68)",
      dateDebut: "Janvier 2023",
      duree: "12 mois",
      localisation: "Haut-Rhin (68) – Nappe Ill Rhin",
      cat: "Vulnérabilité &amp; Climat",
      thematiques: [
        { icon: "fa-cloud-bolt", label: "Vulnérabilité &amp; Adaptation climatique" },
        { icon: "fa-gavel",      label: "Gouvernance &amp; Actions menées"          }
      ],
      profils: ["elu", "tech"],
      presentation: "Intégration de scénarios climatiques RCP 4.5 et 8.5 dans la révision du SAGE Ill Nappe Rhin pour anticiper les étiages sévères et redéfinir les objectifs de débit de référence à l'horizon 2050, en tenant compte des projections du GIEC.",
      objectifs: "Intégrer les projections climatiques dans les règles du SAGE, anticiper les conflits d'usage en période d'étiage prolongé, définir des seuils d'alerte adaptés au changement climatique, sécuriser l'alimentation en eau de la plaine d'Alsace.",
      actions: "Modélisation hydrologique sous scénarios RCP 4.5 et 8.5 sur la période 2025–2050, révision des VCN10 de référence, élaboration de 3 scénarios de gestion de crise, consultation de la CLE (36 membres) sur 3 sessions, délibération et adoption du SAGE révisé.",
      kpis: [
        { label: "Horizon de projection",  value: "2050"       },
        { label: "Scénarios climatiques",  value: "2 (RCP)"    },
        { label: "Membres CLE",            value: "36"         },
        { label: "Budget",                 value: "210 000 €"  }
      ],
      resultatsTexte: "Le SAGE révisé intègre désormais des règles de partage de la ressource en eau adaptées aux projections climatiques. Les nouveaux seuils d'alerte étiage ont été abaissés de 15 % par rapport aux valeurs précédentes.",
      financeurs: ["Région Grand Est", "Agence de l'Eau Rhin-Meuse"],
      budgetTotal: "210 000 €"
    },
    9: {
      titre: "Renaturation des berges de la Moselle — Épinal",
      porteur: "Ville d'Épinal",
      territoire: "Vosges (88)",
      dateDebut: "Mars 2021",
      duree: "2 ans",
      localisation: "Vosges (88) – Moselle à Épinal",
      cat: "Aménagement &amp; Zonage",
      thematiques: [
        { icon: "fa-city", label: "Aménagement du territoire &amp; Zonage"   },
        { icon: "fa-fish", label: "Connaissance des milieux aquatiques" }
      ],
      profils: ["elu", "tech", "hab"],
      presentation: "Projet de renaturation de 3,2 km de berges urbaines sur la Moselle à Épinal : suppression des enrochements béton, replantation d'une ripisylve diversifiée et création de zones de loisirs nature accessibles aux habitants.",
      objectifs: "Restaurer la fonctionnalité écologique des berges de la Moselle, améliorer la continuité latérale du fleuve, créer un corridor écologique urbain de 3,2 km et valoriser le fleuve comme espace de nature en ville.",
      actions: "Suppression de 2,1 km d'enrochements béton, génie végétal sur l'ensemble du linéaire, replantation de 3 200 arbres et arbustes rivulaires, aménagement de 5 accès à l'eau pour la pêche et les loisirs, pose de mobiliers pédagogiques sur la biodiversité.",
      kpis: [
        { label: "Berges renaturées",       value: "3,2 km" },
        { label: "Enrochements supprimés",  value: "2,1 km" },
        { label: "Végétaux replantés",      value: "3 200"  },
        { label: "Accès à l'eau créés",    value: "5"       },
        { label: "Budget total",            value: "3,2 M€" }
      ],
      resultatsTexte: "Deux ans après les travaux, le suivi écologique montre un retour de 14 espèces d'oiseaux nicheurs et une amélioration de l'indice poissons rivière (IPR) sur les stations de suivi. La fréquentation des berges a augmenté de 40 % selon les comptages.",
      financeurs: ["Agence de l'Eau Rhin-Meuse", "Région Grand Est"],
      budgetTotal: "3 200 000 €"
    },
    10: {
      titre: "Mise en œuvre d'un tableau de bord eau partagé — Pays de Sarrebourg",
      porteur: "Communauté de communes Pays de Sarrebourg",
      territoire: "Moselle (57)",
      dateDebut: "Septembre 2023",
      duree: "15 mois",
      localisation: "Moselle (57) – Pays de Sarrebourg",
      cat: "Gouvernance",
      thematiques: [
        { icon: "fa-gavel", label: "Gouvernance &amp; Actions menées" }
      ],
      profils: ["elu", "tech"],
      presentation: "Déploiement d'un outil de suivi mutualisé des indicateurs eau (prélèvements, qualité, assainissement) entre 5 collectivités du Pays de Sarrebourg, alimenté par les données de l'observatoire régional Orège.",
      objectifs: "Améliorer le suivi partagé des indicateurs eau entre les collectivités du territoire, faciliter la prise de décision collective, réduire les coûts de reporting en mutualisant les outils de visualisation.",
      actions: "Paramétrage du tableau de bord sur la plateforme Orège selon les besoins des 5 collectivités, formation de 12 agents communautaires à l'utilisation des outils, mise en place de 15 indicateurs partagés avec des alertes automatiques.",
      kpis: [
        { label: "Collectivités utilisatrices", value: "5"        },
        { label: "Agents formés",               value: "12"       },
        { label: "Indicateurs partagés",        value: "15"       },
        { label: "Budget",                      value: "85 000 €" }
      ],
      resultatsTexte: "Le tableau de bord est opérationnel depuis janvier 2024. Il est consulté en moyenne 3 fois par semaine par les équipes techniques des 5 collectivités. Un premier bilan partagé a été présenté aux élus en mars 2024.",
      financeurs: ["Région Grand Est"],
      budgetTotal: "85 000 €"
    },
    11: {
      titre: "Réutilisation des eaux usées traitées pour l'irrigation agricole — Reims",
      porteur: "Grand Reims",
      territoire: "Marne (51)",
      dateDebut: "Avril 2022",
      duree: "2 ans",
      localisation: "Marne (51) – Grand Reims, bassin de la Vesle",
      cat: "Ressources &amp; Usages",
      thematiques: [
        { icon: "fa-droplet", label: "Ressources &amp; Usages"   },
        { icon: "fa-gauge",   label: "Gestion quantitative" }
      ],
      profils: ["elu", "tech"],
      presentation: "Projet pilote de REUT (Réutilisation des Eaux Usées Traitées) associant la station d'épuration de Reims et 8 exploitations agricoles céréalières pour irriguer 450 ha en période d'étiage, dans le cadre du décret REUT de 2023.",
      objectifs: "Réduire les prélèvements en eau souterraine en période d'étiage, valoriser les eaux traitées comme ressource alternative à l'irrigation, expérimenter un modèle de REUT agricole réplicable sur d'autres territoires du Grand Est.",
      actions: "Construction d'un réseau de distribution de 12 km entre la STEP et les parcelles agricoles, mise en conformité de la station d'épuration avec les normes REUT (traitement tertiaire UV), suivi agronomique et sanitaire sur 2 campagnes d'irrigation, concertation avec les filières agricoles.",
      kpis: [
        { label: "Surface irriguée",       value: "450 ha"   },
        { label: "Exploitations agricoles", value: "8"       },
        { label: "Réseau REUT",            value: "12 km"    },
        { label: "Budget total",           value: "4,8 M€"   }
      ],
      resultatsTexte: "La première campagne d'irrigation REUT (été 2023) a permis d'économiser 1,2 million de m³ de prélèvements en eau souterraine. La qualité sanitaire des eaux distribuées est conforme aux normes réglementaires sur 100 % des prélèvements.",
      financeurs: ["Union Européenne – LIFE", "Agence de l'Eau Rhin-Meuse"],
      budgetTotal: "4 800 000 €"
    }
  };

  /* ────────────────────────────────────────────────────────────
     2. URL PARAMETER HELPER
     Reads a single query parameter from the current URL.
  ──────────────────────────────────────────────────────────── */
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* Resolve which retex entry to display (defaults to id=1) */
  var id   = parseInt(getParam('id')) || 1;
  var data = RETEX_DATA[id] || RETEX_DATA[1];

  /* ────────────────────────────────────────────────────────────
     3. DOM HELPER — set innerHTML of an element by its id
  ──────────────────────────────────────────────────────────── */
  function setText(sel, val) {
    var el = document.getElementById(sel);
    if (el) el.innerHTML = val;
  }

  /* Profile label definitions (audience tags) */
  var PROFIL_LABELS = {
    elu:  { label: 'Élus &amp; décideurs',          cls: 'rd-profil-tag--elu',  icon: 'fa-user-tie' },
    tech: { label: 'Techniciens &amp; spécialistes', cls: 'rd-profil-tag--tech', icon: 'fa-hard-hat' },
    hab:  { label: 'Habitants',                      cls: 'rd-profil-tag--hab',  icon: 'fa-users'    }
  };

  /* ────────────────────────────────────────────────────────────
     4. POPULATE DOM — inject project data into all page sections
  ──────────────────────────────────────────────────────────── */

  /* Browser tab title + hero text */
  document.title = data.titre + ' – Retex Orège';
  setText('breadcrumb-porteur', data.porteur);
  setText('hero-title', data.titre);
  setText('hero-sub', data.porteur + ' · ' + data.territoire + (data.periode ? ' · ' + data.periode : ''));

  /* Section category label */
  setText('rd-cat-label', data.cat);

  /* Synthesis metadata row */
  setText('syn-porteur',    data.porteur);
  setText('syn-territoire', data.territoire);
  setText('syn-debut',      data.dateDebut);
  setText('syn-duree',      data.duree);

  /* Funder list in synthesis row — join multiple funders with comma */
  var synFinEl = document.getElementById('syn-financeur');
  if (synFinEl) {
    var synFunders = data.financeurs || (data.financeur ? [data.financeur] : []);
    synFinEl.textContent = synFunders.length > 0 ? synFunders.join(', ') : '—';
  }
  setText('syn-localisation', data.localisation);

  /* Thematic chips — map each thematic to a chip element */
  var themEl = document.getElementById('rd-thematiques');
  if (themEl) {
    themEl.innerHTML = (data.thematiques || []).map(function(t) {
      return '<span class="rd-chip"><i class="fa ' + t.icon + '"></i> ' + t.label + '</span>';
    }).join('');
  }

  /* Main text sections */
  setText('rd-presentation', data.presentation);
  setText('rd-objectifs',    data.objectifs);
  setText('rd-actions',      data.actions);

  /* Financers — rendered as chips inside the financing block */
  var financeurEl = document.getElementById('rd-financeur');
  if (financeurEl) {
    var funders = data.financeurs || (data.financeur ? [data.financeur] : []);
    if (funders.length > 0) {
      financeurEl.innerHTML = funders.map(function(f) {
        return '<span class="rd-chip">' + f + '</span>';
      }).join(' ');
    } else {
      financeurEl.textContent = '—';
    }
  }

  /* Budget total in the data grid */
  var budgetEl = document.getElementById('rd-budget-grid');
  if (budgetEl && data.budgetTotal) {
    budgetEl.innerHTML =
      '<div class="rd-data-item">' +
        '<div class="rd-data-item__label">Budget total</div>' +
        '<div class="rd-data-item__value">' + data.budgetTotal + '</div>' +
      '</div>';
  } else if (budgetEl) {
    budgetEl.innerHTML = '';
  }

  /* Contact section */
  setText('rd-porteur-contact',    data.porteur);
  setText('rd-territoire-contact', data.territoire);
  setText('rd-periode-contact',    data.periode || '');

  /* ────────────────────────────────────────────────────────────
     5. ACTIVE TOC — highlight the current section while scrolling
     Uses getBoundingClientRect to find which section is in view,
     then toggles the 'is-active' class on the matching TOC item.
  ──────────────────────────────────────────────────────────── */
  var sections = Array.from(document.querySelectorAll('.rd-anchor'));
  var tocItems = Array.from(document.querySelectorAll('.article-toc__list li'));

  function updateToc() {
    /* Add 140px offset to account for the fixed header + subnav */
    var scrollY = window.scrollY + 140;
    var current = sections[0];

    /* Walk through sections — keep the last one whose top is above the scroll threshold */
    sections.forEach(function(s) {
      if (s.getBoundingClientRect().top + window.scrollY <= scrollY) current = s;
    });

    /* Toggle is-active on the TOC item whose href matches the current section id */
    tocItems.forEach(function(li) {
      var a = li.querySelector('a');
      li.classList.toggle('is-active', a && a.getAttribute('href') === '#' + current.id);
    });
  }

  /* Passive listener — does not block scrolling performance */
  window.addEventListener('scroll', updateToc, { passive: true });
  /* Initial call to set the correct state before the user scrolls */
  updateToc();

})();
