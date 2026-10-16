# 📋 FICHE RÉCAPITULATIVE — Tableau de bord Élu V2
## Observatoire de l'Eau Grand Est
> **Date** : 2026-09-18 | **Version** : V2.11 | **Statut** : 5 sections sur 5 implémentées — Vulnérabilité complète (climat + risques) + Gouvernance complète (arborescence + SAGE + Actions menées) + sous-onglets Usages dans Ressource/usage + Hero persistant

---

## 1. 🛠 Stack & Setup

### Langages & Frameworks
| Technologie | Version | CDN / Source | Usage |
|---|---|---|---|
| **HTML5** | — | Natif | Structure sémantique, RGAA 4.1 |
| **CSS3** | — | Natif | Styles custom (pas de Tailwind) |
| **JavaScript ES5** | — | Natif (IIFE strict) | Moteur de rendu, aucun build step |
| **Bootstrap** | 5.3.3 | `cdn.jsdelivr.net/npm/bootstrap@5.3.3` | Grille + utilitaires (usage minimal) |
| **Chart.js** | 4.4.3 | `cdn.jsdelivr.net/npm/chart.js@4.4.3` | Line, bar empilé, pie charts |
| **OpenLayers** | 9.2.4 | `cdn.jsdelivr.net/npm/ol@9.2.4` | Carte drill-down + minimaps vectorielles |
| **jQuery** | 3.7.1 | `cdn.jsdelivr.net/npm/jquery@3.7.1` | Requis par nav.js legacy |
| **Phosphor Icons** | 2.1.1 | `unpkg.com/@phosphor-icons/web@2.1.1` | Icônes `ph ph-*` partout |

### Fonts (GDPR-compliant via Bunny Fonts)
| Police | Graisses | Usage |
|---|---|---|
| **Cabinet Grotesk** | 800 | H1 héroïques uniquement |
| **Satoshi** | 400, 700 | Corps de texte, H2-H4, labels, boutons |

### Environnement
- **Pas de build** : fichiers statiques purs (pas de npm, webpack, Vite…)
- **Pas de backend** : données fake côté client (`FAKE_DATA_DEPARTEMENTS`)
- **Architecture IIFE** : `(function() { 'use strict'; ... })()` — pas de modules ES6
- **Compatibilité** : ES5 strict (pas de `const`, `let`, arrow functions)
- **Accessibilité** : RGAA 4.1 — skip links, aria-labels, rôle `tablist` sur la nav

---

## 2. 🎨 Design System & UI/UX

### Variables CSS (`:root`)
```css
--elu2-bg: #F4F7FA;          /* Fond page */
--elu2-card: #ffffff;         /* Fond cartes */
--elu2-radius: 14px;          /* Border-radius cartes */
--elu2-shadow: 0 2px 12px rgba(0,0,0,.06);
--elu2-shadow-hover: 0 6px 24px rgba(0,0,0,.10);
--elu2-text: #1a2332;         /* Texte principal */
--elu2-muted: #64748B;        /* Texte secondaire */
--elu2-border: #E2E8F0;       /* Bordures */
--elu2-blue: #1565C0;         /* Accent principal */
--elu2-blue-light: #E3F2FD;   /* Bleu clair fond */
--elu2-accent: #0277BD;       /* Accent icônes */
```

### Palette couleurs
| Rôle | Code | Usage |
|---|---|---|
| Bleu principal | `#1565C0` | Nav active, tendances, liens, graphiques |
| Bleu clair | `#E3F2FD` | Fonds hover, badges, badge territoire header |
| Bleu profond | `#0D47A1` | Hover carte |
| Accent | `#0277BD` | Icônes titres cartes, bandeau Ressources |
| Vert | `#8BC34A` | Usages agricoles (prélèvements) |
| Gris foncé | `#455A64` | Usages industriels |
| Orange | `#F57F17` | Refroidissement centrales |
| Bleu moyen | `#0288D1` | Alimentation canaux |
| Vert trend | `#2E7D32` / `#E8F5E9` | Tendance hausse |
| Rouge trend | `#C62828` / `#FFEBEE` | Tendance baisse |
| Eaux superficielles | `#0288D1` (border-top) | Accent carte surface |
| Eaux souterraines | `#00796B` (border-top) | Accent carte souterrain |

### Palette carte (10 départements, alternée style DVF Notaires)
```javascript
zonePalette = [
  'rgba(187,222,251,0.55)', 'rgba(178,223,219,0.55)', 'rgba(225,190,231,0.45)',
  'rgba(179,229,252,0.55)', 'rgba(200,230,201,0.55)', 'rgba(255,224,178,0.45)',
  'rgba(255,236,179,0.50)', 'rgba(207,216,220,0.50)', 'rgba(197,202,233,0.50)',
  'rgba(178,223,219,0.45)'
];
```

### Règles UX validées
- **Carte drill-down** : Click département → zoom + EPCI fake + MAJ toutes les tuiles
- **Breadcrumb carte** : `Grand Est > [Département]` — clic "Grand Est" = retour région
- **Tooltip carte** : Fond `rgba(21,35,50,.9)`, apparaît au hover, suit le curseur
- **Onglets** : 5 sections, sticky (top: 128px), scroll horizontal sur mobile
- **Tendance** : Badge coloré (vert/rouge/neutre) avec flèche Phosphor
- **Légende prélèvements** : HTML custom avec pictogrammes Phosphor (tractor, factory, lightning, boat, drop)
- **Treemap OCS** : Rectangles proportionnels HTML/CSS (pas de Chart.js) avec icônes Phosphor par catégorie
- **Tooltip RAMSAR** : Rollover interactif sur les points carte avec nom complet du site + labels permanents
- **Nom territoire dans bandeau** : Badge bleu clair dans le header sticky `Tableau de bord Élu V2 — Grand Est`
- **En attente** : Placeholder avec icône sablier + message italique
- **Responsive** : Breakpoint unique à 900px → toutes les grilles passent en 1 colonne
- **Bannières bleues** : Séparent les sous-sections (font-size 18px, icône 23px)
- **Sous-bannières catégorie fille** : Fond bleu transparent + bordure (Eaux superficielles / Eaux souterraines)

---

## 3. 📁 Architecture Front

### Structure des dossiers (fichiers V2 uniquement)
```
template/
  └── tableau-de-bord-elu-v2.html     # Template HTML V2

js/
  ├── tableau-de-bord-elu-v2.js        # Moteur de rendu V2 (~2 200 lignes)
  ├── data-indicateurs-elu-v2.js       # Données V2 : SECTIONS, TUILES, GEO, FAKE_DATA
  └── data-geo-elu.js                  # Données géo partagées V1/V2 (10 291 octets)

css/
  └── tdb-elu-v2.css                   # Styles V2 (30 076 octets, ~1 180 lignes)
```

### Fichiers V1 (intacts, NON modifiés par V2)
```
template/tableau-de-bord-elu.html      # V1 template
js/tableau-de-bord-elu.js              # V1 engine (80 688 octets)
js/data-indicateurs-elu.js             # V1 data (72 053 octets, 105 indicateurs)
css/tdb-elu.css                        # V1 styles (34 275 octets)
```

### Fichiers partagés (V1 + V2)
```
js/data-geo-elu.js          # GEO_DATA_ELU points/polygones + GEO_MAPPING_ELU
js/a11y.js                  # Module accessibilité RGAA
js/nav.js                   # Navigation principale (header, megamenu, footer)
css/fonts.css               # @import Cabinet Grotesk + Satoshi
css/style.css               # Reset + variables globales
css/nav.css                 # Navigation header/footer
css/pages.css               # Styles pages génériques
css/tableau-de-bord.css     # Styles partagés TDB (page-header sticky)
css/a11y.css                # Barre accessibilité
```

### Composants JS clés (tableau-de-bord-elu-v2.js)

| Fonction | Rôle |
|---|---|
| `renderNav()` | Génère les 5 boutons onglets dynamiquement |
| `activateSection(sectionId)` | Switch entre sections, détruit/recrée charts+maps |
| `renderSection(sectionId)` | Dispatch vers renderFicheIdentite, renderAmenagement ou renderRessourceUsage |
| **── Fiche d'identité ──** | |
| `renderFicheIdentite(tuiles)` | Hero + Démographie + Ressources + Prélèvements + Services + Captages |
| `renderHero(tu)` | Carte + KPIs Superficie/Population |
| `renderDemographie(tu)` | Densité + Ruralité + Graphe évolution population |
| `renderRessourceCard(tu, variant)` | Carte ressource (surface ou souterrain) avec liste items |
| `renderPrelevements(tu)` | Graphe stacked bar + légende pictos |
| `renderServices(tu)` | Prix eau + prix assainissement |
| `renderCaptages(tu)` | Captages dégradés + AAC + lien Deaumin'eau |
| `initFicheCharts()` | Crée line chart population + stacked bar prélèvements |
| **── Aménagement ──** | |
| `renderAmenagement(tuiles)` | Zonages (ZH + RAMSAR + ZRE) + Aménagements (OCS + ZS + Obstacles) |
| **── Gouvernance et actions menées ──** | |
| `renderGouvernancePage(tuiles)` | Wrapper section complète (Hero + body) |
| `renderGouvernanceBody(tuiles)` | Bannière + Arborescence + Bannière SAGE + Tuile SAGE |
| `renderGovTree(tu)` | Arborescence interactive 4 niveaux (territoire → cycle → type → structures) |
| `renderTreeStructures(structures)` | Feuilles niveau 4 avec liens Cartographie |
| `renderSageAvancement(tu)` | Tuile SAGE : 5 barres de progression horizontales |
| `bindGouvernanceTree()` | Event binding click toggle ouverture/fermeture nœuds |
| `renderActionCard(tu, zone)` | Carte Action menée avec KPIs + pie chart avancement |
| `renderActionCardInondations(tu)` | Carte Gestion des inondations (big numbers) |
| `initGovActionCharts()` | Crée les 2 pie charts avancement (Contrats + Projets) |
| `destroyGovActionCharts()` | Détruit les charts Actions menées |
| **── Sous-onglets Usages (dans Ressource/usage) ──** | |
| `renderGovEauPotable(tuiles)` | Prix eau + Rendement + AAC + Captages dégradés + Prélèvements |
| `renderGovAssainissement(tuiles)` | Prix assainissement + Stations d'épuration |
| `renderGovAgriculture(tuiles)` | Surfaces agricoles (carte+pie+KPI) + Prélèvements |
| `renderGovPrixCard(tu, type)` | Carte prix générique (eau ou assainissement) avec barre + comparatifs |
| `renderGovRendement(tu)` | Carte + KPIs min/max/moy/comparatif GE |
| `renderGovAAC(tu)` | Carte OL + KPI couverture territoire |
| `renderGovCaptagesDegrades(tu)` | Pie chart typologie captages dégradés |
| `renderGovPrelevements(tu)` | Stacked bar + volume (réutilisé EP + Agri) |
| `renderGovStationsEpuration(tu)` | Carte OL interactive STEP + tooltips + KPIs |
| `renderGovSurfacesAgricoles(tu)` | 3 colonnes : carte + pie cultures + KPI SAU irriguées |
| `bindGovTabs()` | Event binding click sous-onglets Gouvernance |
| `initGouvernanceCharts()` | Crée pie charts + stacked bars Gouvernance |
| `initGouvernanceMaps()` | Crée cartes OL simples + carte STEP interactive |
| `initGovStepMap(contour)` | Carte OL stations d'épuration avec tooltips REUT |
| `destroyGouvernanceMaps()` | Détruit les instances cartes OL gouvernance |
| `renderZonesHumides(tu)` | Placeholder "En attente des données" |
| **── Vulnérabilité et risques ──** | |
| `renderVulnerabilitePage(tuiles)` | Wrapper section complète (Hero + body) |
| `renderVulnerabiliteBody(tuiles)` | Bannières + cartes climat + cartes risques |
| `renderVulnClimatAnnuel(t)` | Vue Annuel : 2 cartes surplus/déficit (temp + précip) |
| `renderVulnClimatMensuel(t)` | Vue Mensuel : 2 cartes barres+ligne (temp + précip) |
| `renderVulnSurplusCard(tu, prefix, title)` | Carte surplus/déficit : KPIs gauche + chart barres rouges/bleues droite |
| `renderVulnMensuelCard(tu, prefix, title, tuAnnuelle)` | Carte mensuelle : KPI ref gauche + chart barres+ligne droite |
| `renderVulnSecheresse(t)` | Carte sécheresse : pie N-1 + stacked bar évolution + lien Vigi'Eau |
| `renderVulnEtiages(t)` | Carte étiages : stacked bar 100% N-1 + stacked bar évolution + lien ONDE |
| `initVulnerabiliteCharts()` | Crée 8 charts (2 surplus + 2 mensuel + 1 pie + 3 stacked bars) |
| `bindVulnToggle()` | Toggle Annuel/Mensuel : switch panels + recréation charts |
| `destroyVulnCharts()` | Détruit les instances Chart.js vulnérabilité |
| `renderRamsar(tu)` | Minimap + NB sites + superficie (sans tags labels en bas) |
| `renderZRE(tu)` | Infos GAUCHE + carte DROITE + types + KPIs |
| `renderOccupationSol(tu)` | Treemap HTML + lien OCS Grand Est |
| `renderTreemap(chartData)` | Rectangles proportionnels HTML avec icônes Phosphor |
| `ocsIcon(label)` | Mappe label OCS → icône Phosphor |
| `renderZonesSensibles(tu)` | Minimap + ratio couverture |
| `renderObstacles(tu)` | Big number + barres horizontales par type |
| `initAmenagementCharts()` | Crée horizontal bar obstacles (doughnut OCS supprimé → treemap HTML) |
| `initAmenagementMaps()` | 3 mini-cartes OL (RAMSAR points avec labels+tooltip, ZRE polygones, Zones sensibles) |
| `destroyAmenagementMaps()` | Détruit toutes les instances mini-cartes OL aménagement |
| **── Ressource / usage / pression ──** | |
| `renderRessourceUsage(tuiles)` | Eaux superficielles (Hydro + Caract + État) + Eaux souterraines (Caract + État + Piézo) |
| `renderHydrologie(tu)` | 2 cartes OL **interactives** côte à côte (moyenne + étiage) + KPIs + tooltips |
| `renderCaractSurface(tu)` | Liste : cours d'eau, plans d'eau, superficie |
| `renderEtatRessources(tu, variant)` | 2 pie charts avec % extérieurs + légende individuelle par chart |
| `renderTerritoryBanner()` | Réutilise `renderHero()` avec la tuile Hero de fiche-identite — tuile identique affichée en haut de chaque onglet |
| `renderAmenagementBody(tuiles)` | Contenu Aménagement sous le Hero (bannières + tuiles) — re-rendu au switch territoire |
| `renderRessourceUsageBody(tuiles)` | Contenu Ressource/usage sous le Hero (bannières + tuiles + sous-onglets) — re-rendu au switch territoire |
| `refreshHero()` | Met à jour titre, type, KPIs du Hero dans le DOM (sans recréer la carte) |
| `refreshSectionBody()` | Détruit charts/maps OL, re-rend le body de la section active, ré-initialise charts+maps |
| `renderGaugeSVG(pct, color, label)` | Génère une jauge SVG semi-circulaire avec arc coloré + % centré + label (Fiche d'identité) |
| `renderCaractSouterrain(tu)` | Layout horizontal : KPI big number + tags noms masses d'eau |
| `renderPiezometrie(tu)` | Carte OL **interactive** + 5 piézomètres + tooltips + badge tendance |
| `initRessourceUsageCharts()` | 4 pie charts (état surface + souterrain) |
| `initHydroMapMoyenne(stations, contour)` | Carte OL interactive hydro moyenne : stations colorées + tooltip riche |
| `initHydroMapEtiage(stations, contour)` | Carte OL interactive hydro étiage : stations QNMA + tooltip riche |
| `initPiezoMap(contour)` | Carte OL piézométrie **interactive** (5 stations + tooltips) |
| `initRessourceUsageMaps()` | Dispatch vers les 3 fonctions carte ci-dessus |
| `getHydroStations()` | Récupère les données `fakeStations` de la tuile Hydrologie |
| `destroyRessourceUsageMaps()` | Nettoie les instances cartes OL ressource |
| **── Territoire ──** | |
| `switchTerritoire(code, nom)` | Met à jour currentTerritoire + header + refreshFicheIdentite() |
| `updateHeaderTerritory()` | Met à jour le badge territoire dans le bandeau sticky |
| `refreshFicheIdentite()` | MAJ DOM de TOUTES les tuiles fiche d'identité + recréation charts |
| `initDrillMap()` | Carte OL vectorielle interactive avec hover + click |
| `loadDepartements()` | Charge 10 polygones départements dans la carte |
| `loadEPCI(code, nom)` | Génère 6 faux EPCI dans le bbox du département |
| `updateBreadcrumb()` | MAJ breadcrumb carte (expose `window.__drillBack`) |
| `destroyCharts()` | Détruit toutes les instances Chart.js |
| `destroyDrillMap()` | Détruit la carte OL + reset état drill-down |
| **── Utilitaires ──** | |
| `escHtml(s)` | Échappement HTML |
| `indexInds(indicateurs)` | Indexe indicateurs par ID dans un objet |
| `findTuile(sectionId, zone)` | Cherche une tuile par section + zone |

---

## 4. 📄 Sections implémentées

### ✅ Section 1 : Fiche d'identité (7 tuiles)
- Hero (carte drill-down + KPIs)
- Démographie (densité, ruralité, graphe évolution)
- Ressources en eau (superficielles + souterraines)
- Prélèvements (stacked bar + légende pictos)
- Services de l'eau (prix eau + assainissement)
- Captages (dégradés + AAC + lien Deaumin'eau)
- **Territory switching complet** (10 départements fake)

### ✅ Section 2 : Aménagement du territoire (6 tuiles)
- Zones humides effectives (en attente données)
- Sites RAMSAR (minimap avec labels permanents + tooltip rollover, KPIs)
- ZRE (infos GAUCHE, carte DROITE)
- Occupation du sol (treemap HTML rectangles proportionnels avec icônes Phosphor)
- Zones sensibles (minimap + ratio)
- Obstacles à l'écoulement (big number + barres horizontales)
- Tuiles ZH / RAMSAR hauteurs égalisées (align-items: stretch)

### ✅ Section 3 : Ressource / usage / pression (15 tuiles : 6 ressources + 9 usages)
- **Eaux superficielles** (sous-bannière catégorie fille) :
  - Hydrologie (2 cartes OL côte à côte + KPIs)
  - Caractéristiques (liste items)
  - État des ressources (2 pie charts écologique + chimique + légende)
- **Eaux souterraines** (sous-bannière catégorie fille) :
  - Caractéristiques (layout horizontal compact : KPI big number + tags noms)
  - État des ressources (2 pie charts quantitatif + chimique + légende)
  - Piézométrie (carte OL + tendance)
- **Usages de l'eau & pressions** (bannière + sous-onglets filles) :
  - Sous-onglets : Eau potable (5 tuiles), Assainissement (2 tuiles), Agriculture (2 tuiles), Industrie (à venir), Loisirs (à venir)
  - **Eau potable** : Prix eau (L80, barre gradient + comparatifs + SISPEA), Rendement réseau (L79, carte + KPIs), AAC (L81-82, carte + couverture), Captages dégradés (L83, pie), Prélèvements EP (L77, stacked bar)
  - **Assainissement** : Prix assainissement (L76, barre + comparatifs + SISPEA), Stations d'épuration (L73/75, carte OL interactive + tooltips REUT)
  - **Agriculture** : Surfaces agricoles (L69/70/72, carte + pie cultures + KPI SAU 5%), Prélèvements agri (L71, stacked bar)

### ✅ Section 4 : Gouvernance et actions menées (2 tuiles)
- **Arborescence Gouvernance de l'eau** — schéma interactif cliquable à 4 niveaux :
  - Niveau 1 : Nom du territoire (racine, dynamique selon sélection)
  - Niveau 2 : Grand cycle de l'eau / Petit cycle de l'eau (badges colorés)
  - Niveau 3 : Types de structures (Agences, EPTB/EPAGE, SAGE, GEMAPI, Production EP, Distribution EP, Assainissement C/NC)
  - Niveau 3.5 : Sous-nœuds GEMAPI (Prévention inondations + Gestion milieux aquatiques)
  - Niveau 4 : Noms des structures individuelles + lien "Cartographie" vers la carto
  - Badges count par nœud (override par département)
  - Lignes de connexion verticales CSS
  - Animation déploiement (slide-down)
- **État d'avancement des SAGE** — 5 barres de progression horizontales :
  - SAGE approuvé (100% / Effectif, vert)
  - Plan eau local adopté (68%, orange)
  - Contrat rivière signé (45%, bleu)
  - PAT avec volet eau (30%, violet)
  - Intégration DCE dans SCoT (15%, rouge)
  - Valeurs overridées par département
- **Actions menées** — 3 cartes côte à côte (grille 3 colonnes) :
  - **Contrats de milieux** : Nom + Couverture territoire + Pie chart avancement (4 phases)
  - **Projets de territoire pour la gestion de l'eau** : Nom + Couverture + Pie chart avancement
  - **Gestion des inondations** : Big number plans de prévention + % SLGRI
  - Pie charts `govActionChartInstances[]` séparés
- **Territory switching complet** : arbre + SAGE + Actions menées mis à jour au switch département

### ✅ Section 5 : Vulnérabilité et risques (8 tuiles)
- **Évolutions des températures & précipitations** (englobées dans un bloc unique) :
  - Toggle Annuel / Mensuel (switch entre 2 panels)
  - Vue Annuel : 2 cartes surplus/déficit (température + précipitation) avec KPIs N-1 et Référence + graphe barres positives rouges / négatives bleues
  - Vue Mensuel : 2 cartes comparaison barres (N-1) + ligne (référence) avec KPI moyenne annuelle de référence
- **Risques** :
  - Suivi des arrêtés sécheresse : pie chart N-1 (Vigilance/Alerte/Alerte renforcée/Crise) + stacked bar évolution mensuelle + lien Vigi'Eau
  - Étiages et modalités d'écoulements : stacked bar 100% N-1 (France vs Grand Est/Département) + stacked bar évolution annuelle + lien réseau ONDE
- Territory switching complet (données fake par département)

---

## 5. 📋 TODO & Backlog

| # | Tâche | Priorité | Statut |
|---|---|---|---|
| 1 | Fix étirement vertical Aménagement | 🔴 HAUTE | ✅ Corrigé |
| 2 | Réactiver minimaps OL Aménagement | 🟡 MOYENNE | ✅ Corrigé |
| 3 | **Section Gouvernance** — arborescence interactive + SAGE | 🟡 MOYENNE | ✅ Implémentée (S10) |
| 4 | **Section Ressource/usage/pression** | 🟡 MOYENNE | ✅ Implémentée |
| 5 | **Section Vulnérabilité et risques** — construire quand zoning fourni | 🟡 MOYENNE | ✅ Implémentée (S11) |
| 6 | Données zones humides | 🟢 BASSE | ⏳ En attente données |
| 7 | Territory switching pour Aménagement + Ressource/usage | 🟡 MOYENNE | ✅ Implémenté (S8) |
| 8 | Lien retour EPCI → Département | 🟢 BASSE | ⏳ Non commencé |
| 9 | Export PDF | 🟢 BASSE | ⏳ Non commencé |
| 10 | Partager | 🟢 BASSE | ⏳ Non commencé |
| 11 | Sélecteur année | 🟢 BASSE | ⏳ Non commencé |
| 12 | Nom territoire dans bandeau header | 🟡 MOYENNE | ✅ Implémenté |
| 13 | Treemap OCS (rectangles proportionnels + icônes) | 🟡 MOYENNE | ✅ Implémenté |
| 14 | Tooltip RAMSAR rollover + labels permanents | 🟡 MOYENNE | ✅ Implémenté |
| 15 | ZRE inversé (infos gauche, carte droite) | 🟡 MOYENNE | ✅ Implémenté |
| 16 | Bannières séparatrices +30% typo | 🟢 BASSE | ✅ Implémenté |
| 21 | Augmentation globale typo +1-2px toute la page | 🟢 BASSE | ✅ Implémenté |
| 17 | Cartes Hydrologie interactives + stations + tooltips | 🔴 HAUTE | ✅ Implémenté (S4-S5) |
| 18 | Pie charts % en dehors + légendes par chart | 🔴 HAUTE | ✅ Implémenté (S5) |
| 19 | Piézométrie interactive + 5 stations + tooltips | 🔴 HAUTE | ✅ Implémenté (S5) |
| 20 | Tooltips fond blanc lisible (hydro + piézo) | 🟡 MOYENNE | ✅ Implémenté (S5) |

### Prochaine tâche prioritaire
→ **Usages sous-onglets Industrie + Loisirs** : à construire quand zonings fournis.
→ **Stations Hydro/Piézo par département** : adapter `fakeStations` pour chaque département lors du territory switching.
→ **Gouvernance : enrichir les données** avec de vraies structures par département (actuellement données fake partagées).
→ **Zones humides** : données en attente.

---

## 6. 🗂 Modèle de Données

### Structure `TUILES_ELU_V2`
```
TUILES_ELU_V2 = {
  'fiche-identite':   [ 7 tuiles ],
  'amenagement':      [ 6 tuiles ],
  'gouvernance':      [ 5 tuiles — arborescence + SAGE + 3 actions menées ],
  'ressource-usage':  [ 15 tuiles — 6 ressources + 9 usages (sousOnglet: eau-potable/assainissement/agriculture) ],
  'vulnerabilite':    [ 8 tuiles — 4 climat (toggle annuel/mensuel) + 4 risques (sécheresse + étiages) ]
}
```

### Structure par tuile
```
{
  tuile: string,               // Nom de la tuile
  zone: string,                // Identifiant zone CSS/JS
  categorie?: string,          // Catégorie
  sousCategorie?: string,      // Sous-catégorie (sections avec bannières filles)
  sousOnglet?: string,         // Sous-onglet fille (section Gouvernance : 'eau-potable' | 'assainissement' | 'agriculture')
  enAttente?: boolean,         // Données pas encore disponibles
  fakeLabels?: string[],       // Labels fictifs
  fakeTypes?: string[],        // Types fictifs
  indicateurs: [{
    id: string,                // ID unique
    ligne: number,             // Numéro de ligne Excel
    nom: string,               // Nom indicateur
    type: 'chiffre_cle' | 'graphique' | 'cartographie' | 'lien_externe' | 'liste',
    unite: string,
    fakeValue: string | null,
    graphType?: 'line' | 'stacked_bar' | 'pie' | 'treemap' | 'horizontal_bar',
    fakeChartData?: object,
    fakeTrend?: string,
    fakeTrendDir?: 'up' | 'down' | 'neutral',
    url?: string
  }]
}
```

### Départements inclus (FAKE_DATA_DEPARTEMENTS)
`08` Ardennes, `10` Aube, `51` Marne, `52` Haute-Marne, `54` Meurthe-et-Moselle, `55` Meuse, `57` Moselle, `67` Bas-Rhin, `68` Haut-Rhin, `88` Vosges

---

## 7. 🔗 URIs Fonctionnels

| URI | Description |
|---|---|
| `template/tableau-de-bord-elu-v2.html` | **V2 — Tableau de bord Élu** |
| `template/tableau-de-bord-elu.html` | V1 — Tableau de bord Élu (inchangé) |
| `index.html` | Page d'accueil Observatoire |
| `template/cartographie.html` | Cartographie interactive |
| `template/mon-tableau-de-bord.html` | Mon TDB personnalisé |

---

## 8. ⚙️ Conventions de Code

- **Pattern IIFE** : `(function() { 'use strict'; ... })();`
- **Pas de `let`/`const`** : tout en `var` (ES5 strict)
- **Pas d'arrow functions** : `function(x) { ... }`
- **Nommage CSS BEM-like** : `.tdb-elu2-[bloc]__[element]--[modifier]`
- **Préfixe V2** : toutes les classes commencent par `tdb-elu2-`
- **Préfixe Ressource/usage** : `.tdb-elu2-ru-[composant]`
- **IDs charts** : `chart-v2-[nom]` avec `data-chart-v2="[nom]"`
- **IDs minimaps** : `minimap-[zone]` avec `data-minimap="[zone]"`
- **Fonctions render** : retournent du HTML string, jamais de DOM direct
- **Fonctions init** : créent les objets Chart.js / OL Map après injection du HTML
- **Icônes** : Phosphor Icons `ph ph-*`
- **Fonts** : Bunny Fonts (Cabinet Grotesk 800 + Satoshi 400/700)

---

## 9. 🐛 Bugs Connus & Corrections

### Corrections appliquées (toutes sessions)

| # | Correction | Session |
|---|---|---|
| 1 | `responsive:false` sur charts Aménagement (anti cycle resize) | S1 |
| 2 | Dimensions canvas fixées en JS avant création Chart | S1 |
| 3 | `overflow:hidden` sur conteneurs amenag | S1 |
| 4 | ZRE height fixe 220px | S1 |
| 5 | `initAmenagementMaps()` réécrite avec taille fixée | S2 |
| 6 | `destroyAmenagementMaps()` ajoutée | S2 |
| 7 | Fond de carte OSM France sur toutes les cartes OL | S2 |
| 8 | Tuile Démographie réduite à 210px | S2 |
| 9 | Bannières séparatrices +30% (14→18px, icône 18→23px) | S3 |
| 10 | Tooltip RAMSAR rollover + labels permanents noms complets | S3 |
| 11 | ZH / RAMSAR hauteurs égalisées (align-items: stretch) | S3 |
| 12 | ZRE inversé (infos gauche, carte droite) | S3 |
| 13 | Treemap OCS rectangles HTML + icônes Phosphor (remplace doughnut) | S3 |
| 14 | Section Ressource/usage/pression complète (6 tuiles + 4 pies + 3 cartes OL) | S3 |
| 15 | Sous-bannières catégorie fille (fond bleu léger, pleine largeur) | S3 |
| 16 | Caractéristiques souterraines : layout horizontal compact | S3 |
| 17 | Badge territoire dans bandeau sticky header | S3 |
| 18 | Cartes Hydrologie interactives (zoom, drag) avec stations colorées | S4 |
| 19 | Badge état global TB (Très Bon) sur Hydrologie moyenne | S4 |
| 20 | Tooltips riches rollover sur stations hydro (Débit, Module, État, QNMA, Tendance) | S4 |
| 21 | Labels texte permanents QNMA + tendance sur carte étiage | S4 |
| 22 | Fix `ol.interaction.defaults.defaults()` pour OL9 | S4 |
| 23 | Données `fakeStations` ajoutées à la tuile Hydrologie | S4 |
| 24 | Augmentation globale typographie +1-2px (106 font-size) | S7 |
| 25 | Boost typo tuiles & onglets +1-2px supplémentaires (57 font-size) | S7 |
| 26 | Jauges SVG semi-circulaires Fiche d'identité (Eaux superficielles/souterraines) | S7 |
| 27 | Espacement `#tdb-elu2-section-body` (flex column + gap 20px) — tuiles Aménagement & Ressource/usage correctement espacées | S9 |

### Points techniques critiques à retenir
- **Charts Aménagement** : `responsive: false` obligatoire (sinon cycle resize infini)
- **Cartes OL** : fixer dimensions conteneur en JS AVANT de créer la carte
- **Fond de carte** : `https://{a-c}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png` (pas OSM standard, pas CartoDB)
- **Treemap OCS** : HTML/CSS pur, pas de Chart.js (plus stable)
- **Pie charts Ressource/usage** : `responsive: false` + dimensions canvas fixées
- **Cartes Hydro interactives** : `ol.interaction.defaults.defaults()` + `ol.control.defaults.defaults()` (OL9 syntax)
- **Stations Hydro** : données dans `fakeStations.moyenne[]` et `fakeStations.etiage[]` sur la tuile Hydrologie
- **Badge TB** : classe `.tdb-elu2-hydro-badge--tb` (fond violet #7B1FA2)

---

## 10. 📊 Source de Données Excel

- **Fichier** : `data/indicateurs-elus.xlsx` (457 KB)
- **Onglet** : "Découvrir mon territoire (ELU)"
- **Lignes** : 138
- **Colonnes clés** : A=Enjeux, B=Catégorie, C=Sous-catégorie, D=Nom tuile, H=ID, I=Nom indicateur, J=Description, K=Unités, M=Type de représentation
- **Intégrées** : Fiche d'identité (L112-134), Aménagement (L2-23), Ressource/usage (L43-63), Gouvernance partiel (L69-83)
- **Non encore intégrées** : Gouvernance restant (L24-68 Industrie+Loisirs)

---

## 11. 📝 Historique des sessions

### Session 1
- Création complète V2 : 4 fichiers (HTML, JS engine, JS data, CSS)
- Fiche d'identité complète + Aménagement complet
- Territory switching (10 départements fake data)

### Session 2 (2026-09-10)
- Fix étirement vertical Aménagement (3 causes)
- Réactivation minimaps OL
- Fond de carte OSM France
- Tuile Démographie réduite

### Session 3 (2026-09-10)
1. ✅ Bannières séparatrices +30% (14→18px)
2. ✅ Tooltip RAMSAR rollover + labels permanents noms complets
3. ✅ Hauteurs égalisées ZH / RAMSAR
4. ✅ ZRE inversé (infos gauche, carte droite)
5. ✅ Tags labels RAMSAR supprimés en bas de tuile
6. ✅ Carte RAMSAR dézoomée (maxZoom 7, padding 30/40)
7. ✅ Treemap OCS rectangles HTML + icônes Phosphor (remplace doughnut)
8. ✅ **Section Ressource/usage/pression** complète (6 tuiles, 4 pies, 3 cartes OL)
9. ✅ Sous-bannières catégorie fille (fond bleu léger, pleine largeur, icônes)
10. ✅ Caractéristiques souterraines : layout horizontal compact (KPI + tags)
11. ✅ Badge territoire dans bandeau sticky header (dynamique au switch)

### Fichiers modifiés session 3
| Fichier | Octets | Modifications |
|---|---|---|
| `js/tableau-de-bord-elu-v2.js` | ~80 000 | Section RU complète, treemap HTML, tooltip RAMSAR, badge territoire header |
| `js/data-indicateurs-elu-v2.js` | 31 302 | 6 tuiles `ressource-usage` ajoutées |
| `css/tdb-elu-v2.css` | 30 076 | Styles RU (~200 lignes), treemap, tooltip minimap, badge header, sous-bannières |
| `template/tableau-de-bord-elu-v2.html` | ~6 400 | Badge territoire dans H1 header |
| `FICHE-RECAP-V2.md` | — | Mise à jour complète |

### Session 4 (2026-09-10)
1. ✅ **Cartes Hydrologie interactives** : zoom (molette + boutons +/-), drag pan
2. ✅ **Stations Hydro moyenne** : 7 stations avec points colorés par état (violet=TB, vert=Bon, jaune=Moyen)
3. ✅ **Stations Hydro étiage** : 5 stations avec points noirs + labels permanents QNMA + tendance
4. ✅ **Tooltips riches rollover hydro** : nom station, état, débit 2025, module (moyenne) / QNMA, tendance (étiage)
5. ✅ **Contour Grand Est** léger en arrière-plan des cartes hydro
6. ✅ **Données fakeStations hydro** enrichies dans data-indicateurs-elu-v2.js
7. ✅ Fix `ol.interaction.defaults.defaults()` et `ol.control.defaults.defaults()` (syntaxe OL9)

### Session 5 (2026-09-10)
1. ✅ **Badge TB retiré** du header Hydrologie moyenne (c'était une annotation Canva, pas un élément UI)
2. ✅ **Tooltips hydro fond blanc** : fond `#fff` au lieu de `rgba(21,35,50,.94)` pour lisibilité (texte sombre sur fond clair)
3. ✅ **Pie charts % en dehors** : plugin `pieOuterLabelsPlugin` — labels % positionnés AUTOUR du camembert avec lignes de rappel (au lieu de sur les parts), tooltip hover Chart.js réparé
4. ✅ **Légendes par chart** : chaque camembert a sa propre légende (5-niveaux pour écologique/quantitatif, 2-niveaux pour chimique) — conformément au zoning
5. ✅ **Piézométrie interactive** : carte OL zoomable/draggable avec 5 piézomètres + tooltips (nappe, niveau NGF, tendance)
6. ✅ **Données fakeStations piézo** : 5 stations piézométriques ajoutées (nom, coord, nappe, niveau, tendance)
7. ✅ Pie charts plus grands (220px max, padding 30) pour accueillir les labels extérieurs

### Fichiers modifiés session 5
| Fichier | Modifications |
|---|---|
| `js/tableau-de-bord-elu-v2.js` | Badge TB retiré, plugin `pieOuterLabelsPlugin` (labels % extérieurs + lignes de rappel), `renderEtatRessources()` légendes par chart, `renderPiezometrie()` carte interactive + tooltip, `initPiezoMap()` refait avec stations + interactions |
| `js/data-indicateurs-elu-v2.js` | `fakeStations` ajouté à la tuile Piézométrie (5 piézomètres avec nappe, niveau, tendance) |
| `css/tdb-elu-v2.css` | Tooltip hydro fond blanc, piézométrie interactive 240px + zoom OL, légende inline `.tdb-elu2-ru-etat__legend--inline`, canvas max 220px |
| `FICHE-RECAP-V2.md` | Mise à jour complète |

### Session 6 (2026-09-10)
1. ✅ **Sous-onglets Usages déplacés** dans Ressource/usage/pression (sous Eaux souterraines) — 9 tuiles, 3 sous-onglets filles
2. ✅ **Barre sous-onglets** : 5 boutons (Eau potable, Assainissement, Agriculture, Industrie, Loisirs) + switch dynamique
3. ✅ **Eau Potable** : Prix eau (barre gradient + comparatifs Dept/Région/France + Lien SISPEA), Rendement réseau (carte OL + 4 KPIs), AAC (carte OL + couverture 20%), Captages dégradés (pie chart + légende), Prélèvements (stacked bar + volume)
4. ✅ **Assainissement** : Prix assainissement (même layout), Stations d'épuration (carte OL interactive + 5 STEP + tooltips REUT)
5. ✅ **Agriculture** : Surfaces agricoles (3 colonnes : carte | pie cultures | KPI SAU 5%), Prélèvements agri (stacked bar + volume)
6. ✅ **Industrie + Loisirs** : placeholder "prochainement"
7. ✅ **Charts séparés** : `govChartInstances[]` isolés des charts Ressource (pas de destruction croisée au switch sous-onglet)
8. ✅ **Section Gouvernance** : remise en placeholder (en attente vrai zoning Gouvernance)

### Fichiers modifiés session 6
| Fichier | Modifications |
|---|---|
| `js/tableau-de-bord-elu-v2.js` | Sous-onglets Usages dans Ressource/usage (~450 lignes) : renderUsagesTabs(), 3 rendus sous-onglets, 7 rendus tuiles, govChartInstances séparés, charts pie+bar, 4 cartes OL (simples + STEP interactive), bindGovTabs |
| `js/data-indicateurs-elu-v2.js` | 9 tuiles usages déplacées dans `ressource-usage` (15 tuiles total), fakeStations STEP, données cultures + prélèvements |
| `css/tdb-elu-v2.css` | ~280 lignes : sous-onglets `.tdb-elu2-gov-tabs`, prix (barre gradient + comparatifs), rendement (grid KPIs), AAC (horizontal), captages dégradés, prélèvements, STEP, surfaces agricoles (3 colonnes), responsive |
| `FICHE-RECAP-V2.md` | Mise à jour complète |

### Session 8 (2026-09-17) — CETTE SESSION
1. ✅ **Tuile Hero persistante** — la même tuile Hero complète (titre territoire + KPIs superficie/population + carte drill-down interactive) est affichée en haut de **chaque onglet**
   - `renderTerritoryBanner()` : appelle directement `renderHero()` avec la tuile Hero de `TUILES_ELU_V2['fiche-identite']`
   - Injecté en haut de `renderAmenagement()`, `renderRessourceUsage()`, et les placeholders sections vides (Gouvernance, Vulnérabilité)
   - `initDrillMap()` appelé sur **tous** les onglets (pas seulement fiche-identite) → carte interactive partout
   - `refreshFicheIdentite()` fonctionne quel que soit l’onglet actif (les selectors `.tdb-elu2-hero__title` etc. trouvent le Hero présent partout)
   - Aucun CSS supplémentaire nécessaire : réutilise les styles `.tdb-elu2-hero*` existants
2. ✅ **Onglets pleine largeur** — les 5 boutons d’onglets s’étirent pour occuper toute la largeur du conteneur
   - `flex: 1 1 0%` + `justify-content: center` sur `.tdb-elu2-nav__btn`
   - Font-size : 14→15.5px, icônes : 19→21px
   - Padding : 10px 14px → 12px 16px, gap : 4→6px
   - Responsive 1100px : labels courts + `flex: 1 1 0%` conservé
3. ✅ **KPIs colorés Services / Captages** — les 4 KPI de la fiche d'identité ont chacun un fond pastel distinct + bordure gauche colorée
   - Prix eau : bleu clair `#E3F2FD` + bordure `#1565C0`
   - Prix assainissement : vert menthe `#E0F2F1` + bordure `#00897B`
   - Captages dégradés : pêche `#FFF3E0` + bordure `#EF6C00`
   - AAC : lavande `#EDE7F6` + bordure `#7B1FA2`
   - CSS pur `nth-child` (aucun changement JS)
4. ✅ **Services + Captages remontés** au-dessus de l'Historique des prélèvements dans la fiche d'identité
5. ✅ **Territory switching global** — le clic sur un département dans la carte drill-down rafraîchit les tuiles de **toutes** les sections (pas seulement fiche d'identité)
   - `renderAmenagementBody(tuiles)` et `renderRessourceUsageBody(tuiles)` extraites : contenu sous le Hero dans `<div id="tdb-elu2-section-body">`
   - `switchTerritoire()` : appelle `refreshHero()` (met à jour nom/type/KPIs) + `refreshSectionBody()` pour les onglets non fiche-identité
   - `refreshSectionBody()` : détruit charts/cartes OL, re-rend le body de la section active, ré-initialise charts+maps
   - `refreshHero()` : met à jour titre, type, superficie, population dans le DOM du Hero (sans recréer la carte)
   - La carte drill-down est préservée (pas détruite/recréée au switch) → zoom + état drill conservés
6. ✅ **Données fake par département** pour Aménagement + Ressource/usage
   - `FAKE_DATA_DEPARTEMENTS[code].ind` : objet avec ~25 valeurs indicateurs par département (RAMSAR, ZRE, obstacles, OCS, hydro, caract, usages…)
   - `applyTerritoryOverrides(tuiles)` : avant le rendu, écrase `fakeValue` des indicateurs avec les données du territoire courant
   - `restoreTerritoryOverrides(tuiles)` : après le rendu, restaure les `fakeValue` originaux
   - Override aussi `fakeChartData.values` pour obstacles (barres horizontales) et OCS (treemap)
   - `getIndVal(id, defaultVal)` : helper pour lire une valeur indicateur du territoire courant
7. ✅ **Cartes OL adaptatives** — toutes les mini-cartes zooment sur le contour du département sélectionné
   - `getCurrentContour()` : retourne le contour OL du territoire courant (département ou Grand Est)
   - `getCurrentCenter()` : retourne le centre OL du territoire courant
   - 8 cartes modifiées : RAMSAR, ZRE, Zones sensibles, Hydro moyenne, Hydro étiage, Piézométrie, Gouvernance simples (rendement/AAC/agri), STEP
   - Zoom adaptatif : `maxZoom` plus élevé en département (10) qu'en région (8-9)
   - Contour département affiché en arrière-plan (au lieu du contour Grand Est)
8. ✅ **Points et polygones par département** — chaque carte affiche les éléments géo spécifiques au territoire sélectionné
   - `GEO_DEPT_MAP_DATA` : objet global avec 10 départements, chacun contenant : `ramsar` (points+labels), `zre` (polygones), `zs` (polygones), `hydroMoy` (stations), `hydroEti` (stations), `piezo` (piézomètres), `step` (STEP avec capacité+REUT)
   - `getDeptMapData()` : helper retourne les données géo du département courant ou null (Grand Est)
   - `getHydroStations()`, `getPiezoStations()`, `getStepStations()` : retournent les stations du département courant (fallback tuile statique Grand Est)
   - `initAmenagementMaps()` : utilise `deptGeo.ramsar`, `deptGeo.zre`, `deptGeo.zs` au lieu des coords codées en dur
   - Chaque département a des noms de stations/STEP réalistes avec coordonnées GPS dans le bon département
9. ✅ **Layout Aménagement nettoyé** — hauteurs égalisées et contenus bien répartis
   - `amenag-row3` : `align-items: stretch` (les 3 cartes OCS/ZS/Obstacles même hauteur)
   - Treemap OCS : `flex: 1` (remplit l'espace disponible, plus de hauteur fixe)
   - Mini-cartes : `flex: 1` + `min-height: 160px` (s'étirent pour remplir la carte)
   - Chart Obstacles : `flex: 1` + `min-height: 180px`
   - `.tdb-elu2-amenag-card__body` : `flex: 1` (le contenu s'étire dans la carte)

### Session 7 (2026-09-17)
1. ✅ **Augmentation globale typographie +1-2px** sur toute la page V2 (106 font-size modifiées)
   - Titres cartes : 15→16px
   - Bannières : 18→20px, icônes 23→25px
   - Onglets nav : 13→14px
   - KPI labels : 11→12px, 11.5→12.5px
   - KPI valeurs : 20→22px, 22→24px, 28→30px, 32→34px
   - Texte courant : 12→13px, 13→14px
   - Sous-bannières : 15→16px
   - Tooltips : 12→13px
   - Légendes : 11→12px
   - Trend badges : 12→13px
   - Treemap : labels 11→12px, pct 13→14px
   - Responsive mobile : hero title 24→26px, gov tabs 12→13px
2. ✅ **Deuxième boost typo tuiles + onglets** (57 font-size supplémentaires)
   - Onglets nav principaux : 14→15.5px, icônes 17→19px
   - Sous-onglets gov : 14→15.5px, icônes 16→18px
   - Titres toutes tuiles : 16→18px (ressource, prélèvements, services, captages, aménag)
   - Contenu tuiles labels : 14→15px (items ressource, caract, KPI hydro, aménag)
   - Contenu tuiles valeurs : 16→17px (items val, KPI val, caract val, rendement)
   - Big numbers : 30→32px (services, captages, prix, caract-sout), 34→36px (obstacles, AAC, agri)
   - Légendes/tags : 12→13px (treemap, légendes pie), 13→14px (site tags, ZRE, name tags)
   - Sous-bannières catégorie : 16→17px, block title hydro : 14→15px
   - Volume prélèvements : 26→28px
   - Rendement highlight : 20→22px
   - Responsive mobile gov tabs : 13→14px
3. ✅ **Jauges semi-circulaires SVG dans Fiche d'identité** — tuiles Eaux superficielles & souterraines
   - Eaux superficielles : 2 jauges (44% écologique bleu + 62% chimique vert)
   - Eaux souterraines : 2 jauges (89% quantitatif bleu + 72% chimique vert)
   - Titre « État des masses d'eau (DCE 2025) : » au-dessus des jauges
   - SVG pur (r=50, stroke=11, viewBox 130x80) : arc semi-circulaire + track gris + % centré + label
   - `renderRessourceCard()` modifié : sépare indicateurs normaux (liste) et indicateurs % (état → jauges)
   - `renderGaugeSVG()` ajouté : génère le SVG + overlay % + label
   - Onglet 3 (Ressource/usage/pression) inchangé : pie charts conservés

### Fichiers modifiés session 8
| Fichier | Modifications |
|---|---|
| `js/tableau-de-bord-elu-v2.js` | `renderTerritoryBanner()` (appelle `renderHero()`), injecté dans `renderAmenagement()`, `renderRessourceUsage()`, placeholders ; `initDrillMap()` appelé sur tous les onglets |
| `css/tdb-elu-v2.css` | Nettoyage : suppression styles `.tdb-elu2-territory-banner*` compactes (réutilise `.tdb-elu2-hero*` existants) |
| `FICHE-RECAP-V2.md` | Mise à jour complète |

### Fichiers modifiés session 7
| Fichier | Modifications |
|---|---|
| `css/tdb-elu-v2.css` | 163 font-size augmentées + jauges SVG (`.tdb-elu2-gauge*`, `.tdb-elu2-ressource-card__etat*`) + responsive mobile jauges |
| `js/tableau-de-bord-elu-v2.js` | `renderRessourceCard()` modifié (séparation liste + jauges), `renderGaugeSVG()` ajouté |
| `FICHE-RECAP-V2.md` | Mise à jour complète |

### Session 9 (2026-09-18)
1. ✅ **Espacement tuiles Aménagement** — ajout du style `#tdb-elu2-section-body { display: flex; flex-direction: column; gap: 20px; }`
   - Le conteneur `#tdb-elu2-section-body` (qui enveloppe tout le contenu sous le Hero dans les onglets Aménagement et Ressource/usage) n'avait aucun style → les bannières, grilles et tuiles étaient collées entre elles
   - Le gap 20px est identique à celui du parent `.tdb-elu2-section` → espacement cohérent dans toute la page
   - Vérifié sur les 3 onglets : Fiche d'identité (pas impacté, n'utilise pas section-body), Aménagement ✅, Ressource/usage ✅

2. ✅ **Treemap OCS bord-à-bord** — le graphique Occupation du sol flush avec les bords de la carte, coins droits
   - `renderOccupationSol()` restructuré : treemap sorti du `.tdb-elu2-amenag-card__body`, placé directement dans la carte avec classe `.tdb-elu2-amenag-card--ocs`
   - Lien "OCS Grand Est" isolé dans `.tdb-elu2-amenag-card--ocs__footer` (paddé)
   - CSS : `border-radius: 0` sur le treemap, gap réduit à 2px, fond blanc entre cellules
3. ✅ **Treemap proportionnel** — hauteur haut/bas calculée dynamiquement (`flex: topPct` / `flex: restPct`)
   - Le bloc du haut (35%) prend ~1/3 de la hauteur, la rangée du bas (65%) prend ~2/3
   - CSS nettoyé : suppression flex fixes `55%`/`45%` remplacé par flex inline proportionnel en JS
4. ✅ **Infobulles treemap OCS** — tooltip rollover au survol de chaque bloc du treemap
   - Attributs `data-tm-label` + `data-tm-pct` sur chaque cellule
   - Tooltip `position: fixed` (z-index 9999) pour échapper au `overflow: hidden` de la carte parente
   - Fond sombre `rgba(21,35,50,.94)`, nom en gras + badge % semi-transparent
   - `bindTreemapTooltips()` appelé dans `initAmenagementCharts()` après le rendu

5. ✅ **Cartes Hydrologie refondues** — style cartographique conforme au zoning Canva
   - **Fond de carte N&B** : OSM France + filtre CSS `grayscale(1)` via classe `ol-layer-greyscale` (helper `buildGreyscaleTileLayer()`)
   - **Contour territoire noir épais** : trait `#1a2332` width 2.5 (helper `buildMaskAndContour()`)
   - **Masque extérieur** : polygone "monde inversé" `rgba(255,255,255,0.7)` — tout ce qui est hors du territoire est atténué
   - **Labels texte supprimés** : les pins n'ont plus de label OL Text, seul le tooltip apparaît au hover
   - **KPIs sous les cartes supprimés** : plus de texte Débit/Module/QNMA/Tendance sous les cartes
   - **Cartes agrandies** : 260px → 360px de hauteur
   - **Tooltip Hydrologie moyenne** : ligne "État" supprimée (pas d'indicateur), garde Débit 2025 + Module
   - **Tooltip Hydrologie étiage** : inchangé (QNMA + Tendance colorée)
   - **Couleurs pins conservées** : Moyenne = coloré par état (violet/vert/jaune), Étiage = sombres `#37474F`
6. ✅ **Tooltip treemap couleur dynamique** — le badge % dans l'infobulle OCS prend la couleur de fond du bloc survolé via `data-tm-color`

### Fichiers modifiés session 9
| Fichier | Modifications |
|---|---|
| `css/tdb-elu-v2.css` | `#tdb-elu2-section-body`, `.tdb-elu2-amenag-card--ocs`, treemap proportionnel, `.tdb-elu2-treemap__tooltip`, `.ol-layer-greyscale` (filtre N&B), hauteur cartes hydro 260→360px |
| `js/tableau-de-bord-elu-v2.js` | `renderOccupationSol()`, `renderTreemap()`, `bindTreemapTooltips()`, `renderHydrologie()` (KPIs supprimés), `buildGreyscaleTileLayer()`, `buildMaskAndContour()`, `initHydroMapMoyenne()` refait (N&B + masque + sans labels + sans État), `initHydroMapEtiage()` refait (N&B + masque + sans labels) |
| `FICHE-RECAP-V2.md` | Mise à jour complète |

### Session 10 (2026-09-18) — CETTE SESSION
1. ✅ **Labels Rendement réseau** — Noms indicateurs normalisés dans data : `Rendement min` → `Rendement minimum`, `Rendement max` → `Rendement maximum` (les labels affichés étaient déjà corrects)
2. ✅ **Section Gouvernance complète** — arborescence interactive 4 niveaux + tuile SAGE
   - **Arborescence cliquable** (`renderGovTree()`) : schéma dynamique qui se déploie au clic
     - Niveau 1 : Nom du territoire (dynamique — Grand Est ou département sélectionné)
     - Niveau 2 : Grand cycle de l'eau (bleu foncé) / Petit cycle de l'eau (teal)
     - Niveau 3 : Types de structures (Agences, EPTB/EPAGE, SAGE, GEMAPI, Production EP, Distribution EP, Assainissement C/NC) avec badges count
     - Niveau 3.5 : Sous-nœuds GEMAPI (Prévention inondations + Gestion milieux aquatiques)
     - Niveau 4 : Noms des structures individuelles + lien « Cartographie » (renvoi vers carto)
   - **Lignes de connexion** CSS (::before/::after pseudo-éléments)
   - **Animation slide-down** à l'ouverture des nœuds
   - **Counts par département** : chaque `FAKE_DATA_DEPARTEMENTS[code].ind` contient `GOV_AGENCES`, `GOV_EPTB`, etc.
   - **Tuile SAGE** (`renderSageAvancement()`) : 5 barres de progression horizontales avec couleurs distinctes
   - **Territory switching** : l'arbre et les barres SAGE se mettent à jour au switch département
3. ✅ **Données par département** enrichies avec indicateurs gouvernance (GOV_AGENCES, GOV_EPTB, GOV_SAGE, GOV_GEMAPI_PI, GOV_GEMAPI_GMA, GOV_PROD_EP, GOV_DIST_EP, GOV_ASSAIN_C, GOV_ASSAIN_NC, SAGE_*)
4. ✅ **Section "Actions menées"** — 3 cartes côte à côte sous la tuile SAGE
   - **Contrats de milieux** : Nom du contrat + Couverture territoire (%) + Pie chart avancement (4 phases : Élaboration, Mise en œuvre, Bilan, Renouvellement)
   - **Projets de territoire pour la gestion de l'eau** : Nom + Couverture + Pie chart avancement
   - **Gestion des inondations** : 2 big numbers (Plans de prévention + % SLGRI)
   - Cartes avec bordure bleue (`border: 2px solid var(--elu2-blue)`), icônes Phosphor, layout cohérent
   - `govActionChartInstances[]` : charts pie séparés, détruits/recréés au switch territoire
   - Données par département : `ACT_CM_NOM`, `ACT_CM_COUV`, `ACT_CM_AVANC` (array 4 vals), `ACT_PT_*`, `ACT_GI_*`
5. ✅ **Arborescence ouverte jusqu'au niveau 3** — niveaux 1+2 `is-open` par défaut, niveau 3 visible mais fermé

### Fichiers modifiés session 10
| Fichier | Modifications |
|---|---|
| `js/data-indicateurs-elu-v2.js` | Section `gouvernance` (5 tuiles : arborescence + SAGE + 3 actions menées), `fakeTree`, données SAGE + Actions par département, noms indicateurs rendement normalisés |
| `js/tableau-de-bord-elu-v2.js` | `renderGouvernancePage()`, `renderGouvernanceBody()`, `renderGovTree()`, `renderTreeStructures()`, `renderSageAvancement()`, `renderActionCard()`, `renderActionCardInondations()`, `initGovActionCharts()`, `destroyGovActionCharts()`, `bindGouvernanceTree()`, case `gouvernance` dans `renderSection()` et `refreshSectionBody()` |
| `css/tdb-elu-v2.css` | ~330 lignes : `.tdb-elu2-gov-tree*`, `.tdb-elu2-sage-card*`, `.tdb-elu2-gov-actions__row`, `.tdb-elu2-gov-action-card*`, responsive mobile |
| `FICHE-RECAP-V2.md` | Mise à jour complète |

### Session 11 (2026-09-18) — CETTE SESSION
1. ✅ **Section Vulnérabilité et risques complète** — 8 tuiles, 8 charts Chart.js
   - **Bloc Climat** englobé dans une carte blanche avec toggle Annuel/Mensuel :
     - **Vue Annuel** : 2 cartes surplus/déficit (température + précipitation) — KPIs (N-1 + Référence) à gauche, graphe barres rouges (+) / bleues (−) à droite
     - **Vue Mensuel** : 2 cartes barres+ligne (température + précipitation) — KPI référence à gauche, graphe barres N-1 + ligne référence à droite
   - **Bloc Risques** :
     - **Suivi des arrêtés sécheresse** : pie chart N-1 (Vigilance/Alerte/Alerte renforcée/Crise) à gauche, stacked bar évolution mensuelle à droite, lien Vigi'Eau en bas
     - **Étiages et écoulements** : stacked bar 100% N-1 (France vs Grand Est/Département) à gauche, stacked bar évolution annuelle à droite, lien réseau ONDE en bas
2. ✅ **Territory switching complet** — toutes les tuiles Vulnérabilité se mettent à jour au switch département
   - KPIs température et précipitation (N-1 + référence) overridés via `applyTerritoryOverrides()`
   - Pie chart sécheresse : données `VULN_SECH_PIE` par département
   - Étiages : données `VULN_ETIAGE_N1_VIS`, `_NV`, `_AS` par département
   - Label "Grand Est" remplacé par le nom du département dans le chart étiages N-1
3. ✅ **Charts instances isolées** — `vulnChartInstances[]` séparés des autres charts (pas de destruction croisée)
4. ✅ **Toggle Annuel/Mensuel** — boutons toggle stylisés, switch entre panels avec recréation des charts
5. ✅ **Responsive** — grilles passent en colonne sur mobile (< 900px)

### Fichiers modifiés session 11
| Fichier | Modifications |
|---|---|
| `js/data-indicateurs-elu-v2.js` | Section `vulnerabilite` (8 tuiles : 4 climat + 4 risques), données VULN_* par département (10 départements), console.log mis à jour |
| `js/tableau-de-bord-elu-v2.js` | `renderVulnerabilitePage()`, `renderVulnerabiliteBody()`, `renderVulnClimatAnnuel()`, `renderVulnClimatMensuel()`, `renderVulnSurplusCard()`, `renderVulnMensuelCard()`, `renderVulnSecheresse()`, `renderVulnEtiages()`, `initVulnerabiliteCharts()`, `bindVulnToggle()`, 6 create chart functions, `destroyVulnCharts()`, case `vulnerabilite` dans `renderSection()` et `refreshSectionBody()`, `applyTerritoryOverrides()` enrichi pour vuln |
| `css/tdb-elu-v2.css` | ~200 lignes : `.tdb-elu2-vuln-climat`, `.tdb-elu2-vuln-toggle*`, `.tdb-elu2-vuln-view`, `.tdb-elu2-vuln-surplus-card*`, `.tdb-elu2-vuln-kpi*`, `.tdb-elu2-vuln-mensuel-card*`, `.tdb-elu2-vuln-risque-card*`, responsive mobile |
| `FICHE-RECAP-V2.md` | Mise à jour complète |

---

## 12. 🚀 Pour la prochaine session

### Message à coller :
```
Continue le projet "Observatoire de l'Eau Grand Est" — Tableau de bord Élu V2.
Lis d'abord FICHE-RECAP-V2.md pour le contexte complet.

Fichiers V2 :
- template/tableau-de-bord-elu-v2.html
- js/tableau-de-bord-elu-v2.js  
- js/data-indicateurs-elu-v2.js
- css/tdb-elu-v2.css

Les fichiers V1 (sans "-v2") ne doivent PAS être modifiés.

Ma prochaine tâche : [VOTRE DEMANDE ICI]
```

### Règles critiques à rappeler si l'IA les oublie :
- **ES5 strict** : pas de `const`, `let`, arrow functions — tout en `var` + `function`
- **IIFE** : tout le code est dans `(function() { 'use strict'; ... })()`
- **Charts Aménagement** : `responsive: false` obligatoire (sinon cycle resize infini)
- **Cartes OL** : fixer dimensions conteneur en JS AVANT de créer la carte
- **Fond de carte** : `https://{a-c}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png` (pas OSM standard, pas CartoDB)
- **Préfixe CSS** : toutes les classes V2 commencent par `tdb-elu2-`
- **Préfixe CSS Ressource/usage** : `.tdb-elu2-ru-*`
- **Icônes** : Phosphor Icons `ph ph-*`
- **Fonts** : Bunny Fonts (Cabinet Grotesk 800 + Satoshi 400/700)
- **Treemap OCS** : HTML/CSS pur (pas de Chart.js)
- **5 sections implémentées** : fiche-identite, amenagement, gouvernance (arborescence+SAGE), ressource-usage (+ sous-onglets Usages), vulnerabilite (climat + risques)
- **Arborescence gouvernance** : `renderGovTree()` génère un `<ul>` imbriqué, `bindGouvernanceTree()` toggle `is-open` au clic
- **SAGE** : `renderSageAvancement()` barres horizontales + override par département via `sageVal()`
- **Actions menées** : `renderActionCard()` + `renderActionCardInondations()`, `govActionChartInstances[]` séparés
- **Données Actions par dept** : `ACT_CM_NOM`, `ACT_CM_COUV`, `ACT_CM_AVANC` (array [4 valeurs]), `ACT_PT_*`, `ACT_GI_PLANS`, `ACT_GI_SLGRI`
- **Sous-onglets Usages** : `sousOnglet` property sur 9 tuiles dans `ressource-usage`, filtrage par `tabId`
- **USAGE_TABS[]** array, `govActiveTab` state, `bindGovTabs()` event
- **govChartInstances[]** : charts des sous-onglets séparés de `chartInstances[]`
- **Carte STEP** : stations vertes (REUT oui) / grises (REUT non), tooltip capacité + REUT
- **Prix barre** : gradient CSS `#4FC3F7 → #0D47A1`, marker absolu positionné en %
- **Préfixe CSS Usages** : `.tdb-elu2-gov-*`
- **Badge territoire** : `#tdb-elu2-territory-name` dans le header sticky, mis à jour par `updateHeaderTerritory()`
- **Cartes Hydro** : interactives (zoom + drag), `ol.interaction.defaults.defaults()` (pas `.defaults()`)
- **Badge TB** : `.tdb-elu2-hydro-badge--tb` (violet), `--b` (vert), `--moyen` (jaune)
- **Stations Hydro** : `fakeStations.moyenne[]` + `fakeStations.etiage[]` sur la tuile Hydrologie
- **Stations Piézo** : `fakeStations[]` sur la tuile Piézométrie (5 stations avec nappe, niveau, tendance)
- **Tooltip hydro/piézo** : `.tdb-elu2-hydro-tooltip` fond blanc, `.is-visible` + sous-classes `__row`, `__badge`, `__trend--up/down`
- **Jauges SVG Fiche d'identité** : `renderGaugeSVG(pct, color, label)` — arc semi-circulaire SVG pur (r=50, stroke=11, viewBox 130x80)
- **Pie charts onglet 3** : plugin `pieOuterLabelsPlugin` + `initRessourceUsageCharts()` intacts (inchangés)
- **vulnChartInstances[]** : charts Vulnérabilité séparés, `destroyVulnCharts()` appelé au switch section/territoire
- **Toggle Annuel/Mensuel** : `vulnActiveView` state, `bindVulnToggle()` event, recréation charts au switch
- **Données Vulnérabilité par dept** : `VULN_TEMP_N1`, `VULN_TEMP_REF`, `VULN_PRECIP_N1`, `VULN_PRECIP_REF`, `VULN_SECH_PIE` (array [4 valeurs]), `VULN_ETIAGE_N1_VIS`, `VULN_ETIAGE_N1_NV`, `VULN_ETIAGE_N1_AS`
- **Préfixe CSS Vulnérabilité** : `.tdb-elu2-vuln-*`
- **Badge TB** : retiré — c'était une annotation Canva, pas un élément d'interface
- **Jauges Fiche d'identité** : `.tdb-elu2-gauge`, `.tdb-elu2-gauge__svg-wrap`, `.tdb-elu2-gauge__value`, `.tdb-elu2-gauge__pct`, `.tdb-elu2-gauge__label`
- **Zone État dans carte ressource** : `.tdb-elu2-ressource-card__etat`, `__etat-title` (14px bold), `__etat-gauges` (flex, gap 12)
- **Hero persistant** : `renderTerritoryBanner()` appelle `renderHero()` avec la tuile Hero de fiche-identite — même rendu exact sur tous les onglets
- **initDrillMap() global** : la carte drill-down est initialisée sur tous les onglets (Aménagement, Ressource/usage, placeholders), pas seulement Fiche d’identité
