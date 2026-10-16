# Observatoire de l'Eau Grand Est — Orège

> **Regional water data platform** for the Grand Est region (France).  
> Centralises, harmonises and disseminates water-related indicators for elected officials, technicians and citizens.

---

## Project overview

**Orège** is a static UX prototype of a regional water observatory platform.  
It aggregates water indicators across all scales (region, département, EPCI, river basin, commune) and provides:
- Interactive territory dashboards
- GIS cartography
- Thematic indicators (water quality, aquatic environments, quantitative management, climate, governance, uses)
- Retex (case studies / feedback) library
- Document base and useful links

> **Status:** UX prototype (indicative data — not production-ready)  
> **Version:** v2026.09

---

## ✅ Completed features

### Navigation & layout
- Site-wide header + footer injected by `js/nav.js` (DRY, single source of truth)
- Full-width mega-menus: Territories, News, Resources, L'Observatoire, Je suis…
- Full-screen territory search overlay (keyboard-accessible: `/` or `Ctrl+K`)
- Mobile-responsive hamburger navigation
- Anti-FOUC body visibility guard (`nav-loading` → `nav-ready`)
- Skip-to-content link (RGAA 12.1)

### Home page (`index.html`)
- Hero section with territory search autocomplete (powered by `data-territoires.js`)
- KPI counter animation (IntersectionObserver)
- Three profile entry cards (élu, spécialiste, habitant)
- Six thematic issue cards
- Latest news section (static demo data)
- Key regional figures strip

### Profile pages
- `je-suis-elu.html` — Elected officials / decision-makers
- `je-suis-specialiste.html` — Technicians / specialists
- `je-suis-habitant.html` — Citizens / residents
- Sticky table of contents with scroll-active highlighting
- Hero image with right-side photo panel

### Territory dashboard (`template/tableau-de-bord.html`)
- URL parameters: `?echelle=Département&territoire=Moselle+%2857%29&annee=2025`
- Thematic indicator widgets (36 widgets)
- Territory selector (26 featured territories + 114 total)
- Export PDF / share buttons (UI only)

### Tableau de bord Élu V1 (`template/tableau-de-bord-elu.html`)
- Dashboard for elected officials with 105 indicators
- Territory selector + year selector
- Tiles: presentation, population evolution (line chart), resources, prélèvements, services, captages
- Row 4 added: Prix de l'eau, AAC, Captages tiles
- Files: `js/tableau-de-bord-elu.js`, `js/data-indicateurs-elu.js`, `css/tdb-elu.css`

### Tableau de bord Élu V2 (`template/tableau-de-bord-elu-v2.html`) ⭐ NEW
- Complete rebuild based on new Excel data + Canva zoning mockups
- **New data model**: 1 tuile = N indicateurs (grouped by `zone` property)
- **5 sections** (tabs): Fiche d'identité ✅, Aménagement ✅, Gouvernance ⏳, Ressource/usage ✅, Vulnérabilité ⏳
- **3 sections fully implemented** (19 tuiles, 10+ charts, 10+ OL maps):
  - **Fiche d'identité** (7 tuiles): Hero with interactive drill-down map (departments → EPCI), Démographie, Ressources en eau (surface + underground), Prélèvements (stacked bar + pictogram legend), Services, Captages
  - **Aménagement** (6 tuiles): Zones humides (pending data), RAMSAR (minimap with permanent labels + hover tooltip), ZRE (info left / map right), Occupation du sol (HTML treemap with Phosphor icons), Zones sensibles, Obstacles
  - **Ressource/usage/pression** (6 tuiles): Hydrologie (2 OL maps), Caractéristiques surface, État des ressources (pie charts), Caractéristiques souterraines (horizontal compact), État souterrain (pie charts), Piézométrie
- **Territory switching**: clicking a department refreshes ALL Fiche d'identité tiles + header badge (10 departments fake data)
- **Territory badge** in sticky header: shows selected territory name, updates on drill-down
- **OpenLayers 9** with OSM France basemap tiles, Phosphor Icons, Chart.js 4
- Files: `js/tableau-de-bord-elu-v2.js` (75KB), `js/data-indicateurs-elu-v2.js` (31KB), `css/tdb-elu-v2.css` (30KB)
- Detailed recap: see `FICHE-RECAP-V2.md`

#### Recent changes (October 2026)
- **Map tooltips**: STEP tooltip fixed (REUT `true`/`false` and `'oui'`/`'non'` both handled, 6 px hit tolerance); baignade tooltip without the x/10 score
- **Baignade map**: fills the full tile height, refits to the territory on resize
- **Zoom buttons + / −**: one shared style for all maps, top-right corner
- **Vulnérabilité**: monthly cards show the same KPIs as annual cards (N-1 / reference, monthly averages); "Réf." label placed on the Y axis, on the dashed line
- **Hydrologie maps**: "Cours d'eau" layer added (shared data: `js/data-carto-sources.js`, filter `cours-deau`)

#### Compare tool "Comparer" (October 2026)
Files: `js/tdb-elu-v2-compare.js`, `css/tdb-elu-v2-compare.css` (loaded before the V2 engine).
- **Buttons**: "Comparer avec une zone géographique" in the dark blue bar (`.tdb-page-header`) and in the sticky blue bar (`#tdb-elu2-mini-hero`), right of the KPIs. When active they become yellow "Quitter la comparaison", which brings back the initial zone.
- **Lightbox** (accessible dialog: focus trap, Escape, `inert` background): 4 zone types as tabs, namely Départements (10, "Profil proche" badge by population), Agglomérations (CA/CU/Métropoles from `js/data-territoires.js`, loaded lazily), Bassins versants (from `DONNEES_SOURCES`) and Communes (5 115, from `data/listing_territoires.xlsx` via SheetJS, searched with ≥ 2 characters).
- **Comparison mode**: two columns, initial zone on the left and compared zone on the right. Each column is an embedded view of the same page (`?embed=1&t=…&n=…&s=…`, plus `k`, `p`, `pop`, `sup`, `c` for synthetic zones), so all tiles, charts and maps are shown. Section tabs, Usages sub-tabs and Annuel/Mensuel stay in sync between the two columns. The iframe height follows its content.
- **Zones without data** (agglomeration, basin, commune): fake data derived from the parent department, scaled by population, plus nearest stations.
- Engine API: `__tdbActivateSection`, `__tdbGetSection`, `__tdbSwitchTerritoire`, `__tdbGetTerritoire`, `__tdbRecheckSticky`, event `tdb:territoire`.
- Fixed at the same time: the "Eaux superficielles / souterraines" tiles did not update when a department was selected (values and gauges now refresh).

#### RGAA 4.1 accessibility (October 2026)
New file `js/tdb-elu-v2-a11y.js` (loaded after `ol.js`, before the V2 engine), plus targeted edits in the engine and CSS:
| RGAA | Fix |
|---|---|
| 1.1 / 1.3 | Every Chart.js canvas: `role="img"` + contextual `aria-label` + hidden data table (`.sr-only`, `<caption>`, `th scope`) |
| 1.1 / 7.3 | Every OL map: accessible name + collapsible text list under the map (`<details>`), including values and rivers; main map: department selection buttons (keyboard) + "Revenir au Grand Est" |
| 1.2 | Decorative icons `aria-hidden="true"` |
| 3.2 | Muted text `#5A6779`, ZRE tags in dark text, gauge values darkened to ≥ 4.5:1, treemap text colour computed by contrast, disabled gauge no longer faded |
| 6.1 | "Méthodologie" links without a target sheet are shown as "fiche bientôt disponible" (to be relinked when the PDFs exist) |
| 7.1 | Section nav, Usages sub-tabs: full ARIA tabs pattern (`role=tab`, `aria-selected`, `aria-controls`, `tabpanel`, roving tabindex, ← → Home End); Annuel/Mensuel: `aria-pressed` + live announcement |
| 7.1 / 10.13 | "i" info bubbles: descriptive `aria-label`, open on focus / Enter / Space / tap, close with Escape |
| 8.9 | Lorem ipsum removed (real descriptions or indicator name) |
| 9.1 | Single H1; territory name = H2, banners = level 2, tiles = level 3, sub-blocks = level 4, no level jumps |
| 13.2 | New-window links announced ("nouvelle fenêtre") |

Automated check run on all 5 tabs: no remaining issue detected. **Still to be done manually**: screen reader test (NVDA/VoiceOver), keyboard pass on map station tooltips (covered by the text list), real methodology PDF URLs.

### Cartography (`template/cartographie.html`)
- OpenLayers 9.2.4 map
- Two collapsible sidebars (layers panel + territory panel)
- Basemap toggle (data-viz / OSM / satellite)
- **Zoom-dependent layer visibility**: layers can declare `zoomMin` / `zoomMax` in their data definition; they are automatically shown/hidden as the user zooms in/out
- **Zoom indicator widget** (right side): vertical gauge with current zoom level, scale ticks, and per-layer markers showing at which zoom level each restricted layer appears
- Sidebar filter items display a small orange badge (`≥ 10`) when a layer has zoom restrictions

### Resources
- `ressources-retex.html` — Case studies with category filter + search + load more
- `retex-detail.html` — Individual case study detail page (data from `RETEX_DATA` JS object, 11 demo entries)
- `ressources-docs.html` — Document library
- `ressources-outils.html` — Useful tools & portals (10 cards, no organism labels)
- `ressources-dispositifs.html` — Funding & action programmes (profil-page layout)
- `ressources-depot.html` — Submit a retex project form

### Informational pages
- `observatoire.html` — Observatory presentation
- `enjeux.html` — Understanding water issues (6 themes)
- `equipe.html` — Team & partners
- `actualites.html` — News listing
- `article.html` — Article detail
- `faq.html` — FAQ with search + filters
- `mentions-legales.html` — Legal notices + GDPR + contact
- `accessibilite.html` — Accessibility declaration
- `en-construction.html` — Under construction placeholder

### Code organisation — CSS/JS separation
Every page now has its inline styles and scripts extracted into dedicated external files:

| Page | CSS file | JS file |
|------|----------|---------|
| `template/cartographie.html` | `css/cartographie.css` (section 12 — basemap & layout overrides) | `js/cartographie.js` |
| `en-construction.html` | `css/en-construction.css` | *(no page JS needed)* |
| `retex-detail.html` | `css/retex-detail.css` | `js/retex-detail.js` |
| `ressources-depot.html` | `css/ressources-depot.css` | `js/ressources-depot.js` |
| `ressources-docs.html` | `css/ressources-docs.css` | `js/ressources-docs.js` |
| `ressources-outils.html` | `css/ressources-outils.css` | `js/ressources-outils.js` |

No `<style>` blocks or inline `<script>` blocks remain in any of the above pages.

### Performance & SEO
- `<link rel="preconnect">` + `<link rel="preload">` for Bunny Fonts on all 24 pages
- Hero images preloaded on all relevant pages (LCP optimisation)
- `defer` attribute on Phosphor Icons CDN script (prevents render blocking)
- Explicit `width`/`height` on header logo and hero images (CLS prevention)
- `loading="lazy"` on partner logos and retex card images
- Meta description on all 24 public pages
- Open Graph / Twitter Card tags: **not yet implemented**
- `robots.txt` and `sitemap.xml`: **not yet implemented**
- JSON-LD structured data: **not yet implemented**

### Accessibility (RGAA 4.1)
- `<html lang="fr">` on all pages
- `aria-hidden="true"` on all decorative icons
- `aria-label` on icon-only buttons
- `role="dialog"` + `aria-modal="true"` on search overlay
- `aria-expanded` / `aria-haspopup` on nav buttons
- `aria-current="page"` on active nav links
- Keyboard navigation in search overlay (↑↓ Enter Escape)
- `.sr-only` class for screen-reader-only content
- WCAG AA contrast ratios in `css/a11y.css`
- `prefers-reduced-motion` media query

---

## 📁 Project structure

```
/
├── index.html                        # Home page
├── observatoire.html                 # Observatory presentation
├── enjeux.html                       # Water issues overview
├── equipe.html                       # Team & partners
├── actualites.html                   # News listing
├── article.html                      # Article detail
├── je-suis-elu.html                  # Profile: elected officials
├── je-suis-specialiste.html          # Profile: technicians
├── je-suis-habitant.html             # Profile: citizens
├── ressources-retex.html             # Case studies listing
├── retex-detail.html                 # Case study detail
├── ressources-docs.html              # Document library
├── ressources-outils.html            # Useful tools
├── ressources-dispositifs.html       # Funding programmes
├── ressources-depot.html             # Submit a project
├── faq.html                          # FAQ
├── mentions-legales.html             # Legal notices
├── accessibilite.html                # Accessibility declaration
├── en-construction.html              # Under construction placeholder
│
├── template/
│   ├── tableau-de-bord.html          # Territory dashboard
│   ├── cartographie.html             # GIS map
│   ├── tableaux-de-bord.html         # Dashboards listing
│   ├── decouvrir-mon-territoire.html # Territory discovery
│   ├── mon-tableau-de-bord.html      # My personal dashboard
│   ├── tableau-de-bord-elu.html      # Élu dashboard V1
│   └── tableau-de-bord-elu-v2.html   # Élu dashboard V2 ⭐
│
├── css/
│   ├── style.css                     # Global UI (design tokens, typography, components)
│   ├── nav.css                       # Navigation + mega-menus + footer
│   ├── pages.css                     # Shared secondary page styles
│   ├── profil-page.css               # Profile page layout (sticky ToC, sections)
│   ├── a11y.css                      # Accessibility (RGAA 4.1)
│   ├── fonts.css                     # Font @import declarations
│   ├── index.css                     # Home page specific styles
│   ├── je-suis-elu.css               # Hero image override (élu)
│   ├── je-suis-habitant.css          # Hero image override (habitant)
│   ├── ressources-retex.css          # Retex listing card styles
│   ├── ressources-dispositifs.css    # Legacy/fallback for dispositifs page
│   ├── observatoire.css              # Observatoire page styles
│   ├── enjeux.css                    # Enjeux page styles
│   ├── equipe.css                    # Équipe page styles
│   ├── cartographie.css              # Map page styles (incl. basemap switcher, layout overrides)
│   ├── tableau-de-bord.css           # Dashboard page styles
│   ├── tdb-v2.css                    # Dashboard v2 styles
│   ├── tdb-elu.css                   # Élu dashboard V1 styles
│   ├── tdb-elu-v2.css                # Élu dashboard V2 styles ⭐
│   ├── retex-detail.css              # Case study detail page
│   ├── en-construction.css           # Under construction page
│   ├── ressources-depot.css          # Submit a project form
│   ├── ressources-docs.css           # Document library
│   └── ressources-outils.css         # Useful tools & portals
│
├── js/
│   ├── nav.js                        # ★ Main: nav HTML injection + mega-menus
│   ├── a11y.js                       # Accessibility patches (load last)
│   ├── index.js                      # Home page: KPI counter + territory search
│   ├── profil-page.js                # Shared: sticky ToC scroll highlight
│   ├── je-suis-elu.js                # Profile alias (je-suis-elu page)
│   ├── ressources-retex.js           # Retex listing: filter + search + load more
│   ├── observatoire.js               # Observatoire: sticky ToC
│   ├── enjeux.js                     # Enjeux: sticky ToC
│   ├── equipe.js                     # Équipe: sticky ToC
│   ├── data-indicateurs.js           # Global INDICATEURS object (94 indicators)
│   ├── data-territoires.js           # Global TERRITOIRES object (114 territories)
│   ├── data-communes.js              # Communes dataset (5500+, lazy-loaded)
│   ├── data-carto-sources.js         # Cartography layer definitions
│   ├── data-tdb-territoires.js       # Dashboard territory metadata
│   ├── cartographie.js               # Map interactive behaviour (OpenLayers)
│   ├── cartographie-zoom-layers.js   # Zoom indicator + zoom-dependent layer visibility (additive module)
│   ├── tableau-de-bord.js            # Dashboard widgets logic
│   ├── tableau-de-bord-elu.js        # Élu dashboard V1 engine
│   ├── tableau-de-bord-elu-v2.js     # Élu dashboard V2 engine ⭐
│   ├── data-indicateurs-elu.js       # Élu V1 data (105 indicators)
│   ├── data-indicateurs-elu-v2.js    # Élu V2 data (sections, tuiles, fake data) ⭐
│   ├── data-geo-elu.js               # Élu geo data (shared V1/V2)
│   ├── megamenu.js                   # (Legacy) standalone mega-menu script
│   ├── retex-detail.js               # Case study detail: RETEX_DATA + DOM injection + ToC
│   ├── ressources-depot.js           # Submit form: validation, upload preview, API submission
│   ├── ressources-docs.js            # Document library: search, filters, load more, modal
│   └── ressources-outils.js          # Tools page: search, category filters, load more
│
├── images/
│   ├── logo-observatoire-grandest.png
│   ├── logo-grandest-region.png
│   ├── hero-*.jpg                    # Hero images (riviere, elu, specialiste, citoyen…)
│   └── partners/                     # Partner organisation logos
│
└── favicon.svg
```

---

## 🔗 Key URLs & parameters

| Page | URL | Key parameters |
|------|-----|----------------|
| Home | `index.html` | — |
| Territory dashboard | `template/tableau-de-bord.html` | `?echelle=Département&territoire=Moselle+(57)&annee=2025` |
| Élu dashboard V1 | `template/tableau-de-bord-elu.html` | — |
| **Élu dashboard V2** ⭐ | `template/tableau-de-bord-elu-v2.html` | — |
| Cartography | `template/cartographie.html` | — |
| Case study detail | `retex-detail.html` | `?id=1` (1–11 in demo data) |
| Article detail | `article.html` | — |

---

## 🗃️ Data models

### RETEX_DATA (js/retex-detail.js)
Demo data object with 11 case study entries. Each entry contains:
```js
{
  id: 1,
  titre: "...",
  porteur: "...",
  territoire: "...",
  dateDebut: "...",
  duree: "...",
  localisation: "...",
  categorie: "...",
  thematiques: ["..."],
  profils: ["elu", "tech"],
  presentation: "...",
  objectifs: "...",
  actions: "...",
  kpis: [{ value: "...", label: "..." }],
  resultats: "...",
  financeurs: ["..."],  // Array (replaces old single `financeur` field)
  budgetTotal: "..."    // Single total (replaces old budgetGrid breakdown)
}
```

### TERRITOIRES (data-territoires.js)
Global object keyed by territory scale:
```js
TERRITOIRES = {
  "Grand Est": [...],
  "Département": [...],
  "EPCI": [...],
  "Bassin versant": [...],
  "Commune": [...]  // Loaded async by data-communes.js
}
```

### INDICATEURS (data-indicateurs.js)
Global object with 94 water indicator definitions, thematic breakdowns and territory data.

---

## ⚠️ Features not yet implemented

| Feature | Notes |
|---------|-------|
| `robots.txt` | Create with `Allow: /` and `Sitemap:` directive |
| `sitemap.xml` | List all public pages with `<lastmod>` dates |
| Open Graph / Twitter Card meta tags | Add `og:title`, `og:description`, `og:image` to all pages |
| JSON-LD structured data | `WebSite` + `Organization` schema on index.html |
| `<link rel="canonical">` | Prevent duplicate content indexing |
| Real CMS / API data | Replace static JS objects with REST API calls |
| User authentication | Not feasible as a static site |
| Server-side processing | Not feasible as a static site |
| PDF export (dashboard) | Requires server-side rendering |
| Élu V2 — Gouvernance section | Awaiting Canva zoning mockup |
| Élu V2 — Ressource/usage/pression section | Awaiting Canva zoning mockup |
| Élu V2 — Vulnérabilité section | Awaiting Canva zoning mockup |
| Élu V2 — Zones humides data | Currently shows "En attente des données" |
| Élu V2 — Territory switching for Aménagement | Only Fiche d'identité refreshes on drill-down |

---

## 🚀 Recommended next steps

1. **Add `robots.txt` and `sitemap.xml`** — critical for search engine indexing
2. **Add Open Graph meta tags** — improves social sharing previews
3. **Add JSON-LD structured data** on index.html and article.html
4. **Connect to a real CMS or REST API** for news, retex, and indicators
5. **Implement `<link rel="canonical">`** to avoid SEO duplicate content issues
6. ~~**Create a proper 404.html** page~~ ✅ **Réalisé** – `404.html` avec illustration SVG animée eau + message humoristique

---

## 🛠 Technology stack

| Layer | Technology |
|-------|-----------|
| HTML | HTML5 semantic markup |
| CSS | Custom (design tokens in `style.css`) + Bootstrap 5.3.3 (grid & utilities) |
| JavaScript | Vanilla JS + jQuery 3.7.1 (nav.js only) |
| Icons | Phosphor Icons 2.1.1 (CDN, deferred) |
| Fonts | Cabinet Grotesk 800 + Satoshi 400/700 via Bunny Fonts |
| Map | OpenLayers 9.2.4 |
| Hosting | Static file server (no backend required) |

---

## 📞 Contact

- **Email:** observatoire-eau@antea.fr  
- **Partners:** Région Grand Est · Agences de l'eau · DREAL Grand Est · Antea Group

---

*© 2025–2026 Observatoire de l'Eau Grand Est — Antea Group — Indicative data (UX prototype)*
