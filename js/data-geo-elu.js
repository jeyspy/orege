/**
 * data-geo-elu.js
 * ═══════════════════════════════════════════════════════════════════════
 * Données géographiques fake pour les mini-cartes du Tableau de bord Élu
 * Points et polygones dans le Grand Est (EPSG:4326 → convertis en EPSG:3857 par OL)
 * 
 * Centre Grand Est : [6.5, 48.5], zoom 7
 * ═══════════════════════════════════════════════════════════════════════
 */

// eslint-disable-next-line no-unused-vars
var GEO_DATA_ELU = {

  // ── Points de mesure (stations, captages, barrages, etc.) ──────────
  points_stations_hydro: [
    [5.45, 48.52], [6.18, 48.69], [7.05, 48.35], [6.75, 47.65],
    [5.85, 49.12], [7.45, 48.58], [6.32, 49.05], [5.12, 48.78],
    [7.28, 47.78], [6.92, 48.92], [5.68, 48.35], [6.55, 49.22],
    [7.12, 48.12], [5.92, 48.88], [6.78, 48.45]
  ],

  points_barrages: [
    [6.12, 48.25], [5.88, 48.75], [6.85, 48.08], [7.18, 47.95],
    [5.42, 48.92], [6.55, 49.08], [7.32, 48.42], [6.28, 48.55],
    [5.78, 49.18], [6.95, 48.72], [5.55, 48.42], [7.08, 48.88]
  ],

  points_zones_humides: [
    [5.38, 48.65], [6.22, 48.82], [7.15, 48.28], [6.68, 47.72],
    [5.92, 49.05], [7.38, 48.52], [6.45, 48.98], [5.18, 48.85],
    [7.22, 47.85], [6.85, 48.88], [5.75, 48.28], [6.48, 49.15],
    [7.02, 48.18], [5.98, 48.92], [6.72, 48.38], [5.55, 49.22],
    [7.45, 48.15], [6.12, 48.48], [5.82, 48.62], [6.98, 49.02]
  ],

  points_step: [
    [7.34, 48.58], [6.17, 49.12], [5.83, 48.70], [7.25, 47.75],
    [6.52, 48.35], [5.55, 48.95], [7.08, 48.85], [6.78, 49.25],
    [5.38, 48.45], [6.95, 48.15], [7.42, 48.38], [5.72, 49.08],
    [6.32, 48.65], [7.18, 48.62], [6.45, 47.95]
  ],

  points_captages: [
    [6.08, 48.42], [7.12, 48.55], [5.65, 48.88], [6.72, 49.18],
    [7.35, 47.82], [5.42, 48.72], [6.38, 48.15], [7.28, 48.92],
    [5.92, 49.28], [6.55, 48.68], [7.02, 48.28], [5.78, 48.52]
  ],

  points_nitrates: [
    [5.88, 48.55], [6.42, 48.92], [7.18, 48.38], [6.15, 49.08],
    [5.52, 48.78], [7.05, 47.92], [6.68, 48.62], [5.35, 49.15],
    [7.38, 48.18], [6.85, 49.02], [5.72, 48.38], [6.28, 48.72]
  ],

  points_icpe: [
    [7.34, 48.58], [6.17, 49.12], [5.35, 48.78], [7.08, 47.75],
    [6.55, 48.98], [5.88, 49.22], [7.22, 48.28], [6.42, 48.45],
    [5.62, 48.55], [7.45, 48.72], [6.78, 49.08], [5.18, 48.92]
  ],

  points_baignade: [
    [6.82, 47.88], [5.92, 48.35], [7.15, 48.52], [6.28, 49.05],
    [5.48, 48.68], [7.42, 48.12], [6.65, 48.78]
  ],

  points_prix_eau: [
    [7.34, 48.58], [6.17, 49.12], [5.83, 48.70], [7.08, 47.75],
    [6.52, 48.98], [5.55, 49.22], [7.25, 48.28], [6.42, 48.45],
    [5.72, 48.85], [7.38, 48.72], [6.88, 49.08], [5.28, 48.55],
    [6.65, 48.62], [7.12, 48.92], [5.95, 48.38]
  ],

  // ── Polygones simplifiés (bounding boxes / zones) ─────────────────
  
  // Polygones masses d'eau superficielles (zones DCE)
  polygons_masses_eau: [
    [[5.2, 48.3], [5.8, 48.3], [5.8, 48.8], [5.2, 48.8], [5.2, 48.3]],
    [[5.9, 48.6], [6.5, 48.6], [6.5, 49.1], [5.9, 49.1], [5.9, 48.6]],
    [[6.6, 48.0], [7.2, 48.0], [7.2, 48.5], [6.6, 48.5], [6.6, 48.0]],
    [[7.0, 48.4], [7.5, 48.4], [7.5, 48.9], [7.0, 48.9], [7.0, 48.4]],
    [[6.0, 47.6], [6.6, 47.6], [6.6, 48.1], [6.0, 48.1], [6.0, 47.6]],
    [[5.4, 49.0], [6.0, 49.0], [6.0, 49.4], [5.4, 49.4], [5.4, 49.0]]
  ],

  // Polygones SAGE / PTGE / Contrats
  polygons_gouvernance: [
    [[5.1, 48.5], [5.9, 48.5], [5.9, 49.0], [5.1, 49.0], [5.1, 48.5]],
    [[6.0, 48.2], [6.8, 48.2], [6.8, 48.7], [6.0, 48.7], [6.0, 48.2]],
    [[6.8, 48.6], [7.5, 48.6], [7.5, 49.1], [6.8, 49.1], [6.8, 48.6]],
    [[5.5, 49.0], [6.3, 49.0], [6.3, 49.4], [5.5, 49.4], [5.5, 49.0]],
    [[6.4, 47.6], [7.2, 47.6], [7.2, 48.2], [6.4, 48.2], [6.4, 47.6]]
  ],

  // Polygones obstacles / PPRI / PAPI
  polygons_risques: [
    [[5.3, 48.4], [6.0, 48.4], [6.0, 48.9], [5.3, 48.9], [5.3, 48.4]],
    [[6.1, 48.7], [6.8, 48.7], [6.8, 49.2], [6.1, 49.2], [6.1, 48.7]],
    [[6.9, 48.0], [7.5, 48.0], [7.5, 48.5], [6.9, 48.5], [6.9, 48.0]],
    [[5.8, 49.1], [6.5, 49.1], [6.5, 49.5], [5.8, 49.5], [5.8, 49.1]]
  ],

  // Polygones ZRE
  polygons_zre: [
    [[5.5, 48.2], [6.2, 48.2], [6.2, 48.7], [5.5, 48.7], [5.5, 48.2]],
    [[6.8, 47.7], [7.4, 47.7], [7.4, 48.3], [6.8, 48.3], [6.8, 47.7]],
    [[5.8, 48.8], [6.5, 48.8], [6.5, 49.3], [5.8, 49.3], [5.8, 48.8]]
  ],

  // Polygones plans d'eau / cours d'eau
  polygons_hydro: [
    [[5.4, 48.3], [5.9, 48.3], [5.9, 48.7], [5.4, 48.7], [5.4, 48.3]],
    [[6.2, 48.5], [6.8, 48.5], [6.8, 49.0], [6.2, 49.0], [6.2, 48.5]],
    [[6.9, 47.8], [7.4, 47.8], [7.4, 48.3], [6.9, 48.3], [6.9, 47.8]],
    [[7.0, 48.5], [7.5, 48.5], [7.5, 48.9], [7.0, 48.9], [7.0, 48.5]],
    [[5.2, 48.8], [5.8, 48.8], [5.8, 49.2], [5.2, 49.2], [5.2, 48.8]]
  ],

  // Polygones zones sensibles (assainissement)
  polygons_zones_sensibles: [
    [[5.3, 48.5], [6.1, 48.5], [6.1, 49.0], [5.3, 49.0], [5.3, 48.5]],
    [[6.2, 48.1], [7.0, 48.1], [7.0, 48.6], [6.2, 48.6], [6.2, 48.1]],
    [[6.8, 48.7], [7.5, 48.7], [7.5, 49.2], [6.8, 49.2], [6.8, 48.7]],
    [[5.6, 49.0], [6.4, 49.0], [6.4, 49.5], [5.6, 49.5], [5.6, 49.0]],
    [[6.0, 47.5], [6.8, 47.5], [6.8, 48.0], [6.0, 48.0], [6.0, 47.5]]
  ],

  // Polygones AAC
  polygons_aac: [
    [[5.6, 48.4], [6.1, 48.4], [6.1, 48.8], [5.6, 48.8], [5.6, 48.4]],
    [[6.5, 48.2], [7.0, 48.2], [7.0, 48.6], [6.5, 48.6], [6.5, 48.2]],
    [[7.0, 48.6], [7.4, 48.6], [7.4, 49.0], [7.0, 49.0], [7.0, 48.6]],
    [[5.3, 48.8], [5.9, 48.8], [5.9, 49.2], [5.3, 49.2], [5.3, 48.8]]
  ],

  // Polygones collectivités (EPCI)
  polygons_collectivites: [
    [[5.1, 48.3], [5.7, 48.3], [5.7, 48.8], [5.1, 48.8], [5.1, 48.3]],
    [[5.8, 48.6], [6.4, 48.6], [6.4, 49.1], [5.8, 49.1], [5.8, 48.6]],
    [[6.5, 48.0], [7.1, 48.0], [7.1, 48.5], [6.5, 48.5], [6.5, 48.0]],
    [[7.0, 48.5], [7.5, 48.5], [7.5, 49.0], [7.0, 49.0], [7.0, 48.5]],
    [[6.2, 47.6], [6.8, 47.6], [6.8, 48.1], [6.2, 48.1], [6.2, 47.6]],
    [[5.4, 49.0], [6.1, 49.0], [6.1, 49.5], [5.4, 49.5], [5.4, 49.0]]
  ]
};

// Mapping indicateur → jeu de données géo
// eslint-disable-next-line no-unused-vars
var GEO_MAPPING_ELU = {
  "IND-001": { type: "points", data: "points_zones_humides", color: "#1565C0" },
  "IND-006": { type: "points", data: "points_zones_humides", color: "#00796B" },
  "IND-009": { type: "points", data: "points_captages", color: "#D84315" },
  "IND-012": { type: "lien_externe", url: "https://ocs.datagrandest.fr" },
  "IND-016": { type: "polygons", data: "polygons_zones_sensibles", color: "#6A1B9A" },
  "IND-017": { type: "polygons", data: "polygons_risques", color: "#E65100" },
  "IND-018": { type: "polygons", data: "polygons_risques", color: "#D84315" },
  "IND-019": { type: "points", data: "points_barrages", color: "#455A64" },
  "IND-020": { type: "polygons", data: "polygons_gouvernance", color: "#1565C0" },
  "IND-021": { type: "polygons", data: "polygons_gouvernance", color: "#00796B" },
  "IND-022": { type: "polygons", data: "polygons_gouvernance", color: "#2E7D32" },
  "IND-024": { type: "polygons", data: "polygons_gouvernance", color: "#F57F17" },
  "IND-025": { type: "polygons", data: "polygons_gouvernance", color: "#1565C0" },
  "IND-026": { type: "polygons", data: "polygons_gouvernance", color: "#6A1B9A" },
  "IND-028": { type: "polygons", data: "polygons_gouvernance", color: "#00796B" },
  "IND-029": { type: "polygons", data: "polygons_collectivites", color: "#1565C0" },
  "IND-030": { type: "polygons", data: "polygons_collectivites", color: "#0288D1" },
  "IND-031": { type: "polygons", data: "polygons_collectivites", color: "#6A1B9A" },
  "IND-032": { type: "polygons", data: "polygons_collectivites", color: "#455A64" },
  "IND-033": { type: "polygons", data: "polygons_collectivites", color: "#2E7D32" },
  "IND-034": { type: "polygons", data: "polygons_risques", color: "#E65100" },
  "IND-036": { type: "polygons", data: "polygons_risques", color: "#D84315" },
  "IND-038": { type: "polygons", data: "polygons_risques", color: "#F57F17" },
  "IND-039": { type: "polygons", data: "polygons_hydro", color: "#0277BD" },
  "IND-040": { type: "polygons", data: "polygons_hydro", color: "#0288D1" },
  "IND-041": { type: "polygons", data: "polygons_hydro", color: "#01579B" },
  "IND-042": { type: "points", data: "points_stations_hydro", color: "#1565C0" },
  "IND-044": { type: "points", data: "points_stations_hydro", color: "#D84315" },
  "IND-046": { type: "points", data: "points_stations_hydro", color: "#0277BD" },
  "IND-047": { type: "polygons", data: "polygons_masses_eau", color: "#4CAF50" },
  "IND-048": { type: "polygons", data: "polygons_masses_eau", color: "#F44336" },
  "IND-049": { type: "polygons", data: "polygons_masses_eau", color: "#4CAF50" },
  "IND-050": { type: "polygons", data: "polygons_masses_eau", color: "#FF9800" },
  "IND-051": { type: "points", data: "points_nitrates", color: "#F57F17" },
  "IND-052": { type: "polygons", data: "polygons_collectivites", color: "#D84315" },
  "IND-053": { type: "points", data: "points_icpe", color: "#6A1B9A" },
  "IND-058": { type: "points", data: "points_step", color: "#00796B" },
  "IND-060": { type: "points", data: "points_step", color: "#2E7D32" },
  "IND-061": { type: "points", data: "points_prix_eau", color: "#1565C0" },
  "IND-063": { type: "points", data: "points_captages", color: "#0277BD" },
  "IND-064": { type: "points", data: "points_prix_eau", color: "#2E7D32" },
  "IND-065": { type: "points", data: "points_prix_eau", color: "#6A1B9A" },
  "IND-066": { type: "polygons", data: "polygons_aac", color: "#F57F17" },
  "IND-067": { type: "none" },
  "IND-068": { type: "lien_externe", url: "https://baignades.sante.gouv.fr/baignades/homeMap.do#a", points: "points_baignade", color: "#0288D1" },
  "IND-103": { type: "points", data: "points_prix_eau", color: "#1565C0" },
  "IND-104": { type: "polygons", data: "polygons_aac", color: "#F57F17" },
  "IND-105": { type: "points", data: "points_captages", color: "#D84315" }
};
