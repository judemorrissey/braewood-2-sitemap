# Braewood 2 Community Map — Phase 1 Design

## Overview

A public-facing, static community map for Westborough Braewood 2 Condominium (SSF, CA). Replaces a manually maintained Photoshop map with a live, interactive Leaflet map. Data is maintained in plain JS files. No backend, no build step, no auth. Deployable to GitHub Pages.

## Goals

- Show HOA landscaping responsibility zones as shaded polygons
- Support pins for community infrastructure (fire hydrants, backflow preventers, sprinkler controllers, etc.)
- Show building/area text annotations
- Layer toggles to show/hide categories
- Bundler script to export a single shareable HTML file

## Non-Goals (Phase 1)

- Authentication or access control
- Geotagged photos
- Polylines (irrigation lines, utility runs)
- Backend or database
- Build pipeline (npm, webpack, vite)

## File Structure

```
braewood-2-sitemap/
├── index.html          # map shell — loads Leaflet from CDN, loads all local scripts
├── map.js              # Leaflet init and rendering logic
├── bundle.js           # Node script: inlines local files → dist/braewood2-map.html
├── data/
│   ├── polygons.js     # const POLYGONS = [...]
│   ├── pins.js         # const PINS = [...]
│   └── labels.js       # const LABELS = [...]
└── dist/               # gitignored — bundled output lives here
    └── braewood2-map.html
```

No `package.json` or `node_modules`. `bundle.js` uses Node built-ins only.

## Data Schemas

### `data/polygons.js`

```js
const POLYGONS = [
  {
    id: "landscaping-athy-north",  // unique string
    label: "HOA Landscaping",      // shown in hover tooltip
    color: "#4ade80",              // hex fill color
    opacity: 0.35,                 // fill opacity
    coords: [                      // array of [lat, lng] pairs (closed ring)
      [37.654, -122.447],
      // ...
    ]
  }
]
```

Coords are sourced by drawing on [geojson.io](https://geojson.io) and copying the coordinate pairs.

### `data/pins.js`

```js
const PINS = [
  {
    id: "hydrant-1",               // unique string
    type: "fire-hydrant",          // determines icon color and layer group
    label: "Hydrant #1",           // shown in click popup
    coords: [37.654, -122.447],    // [lat, lng]
    notes: ""                      // optional detail shown in popup
  }
]
```

Pin types (extensible): `fire-hydrant`, `backflow-preventer`, `sprinkler-controller`.

### `data/labels.js`

```js
const LABELS = [
  {
    id: "building-1",             // unique string
    text: "Building 1",           // displayed on map
    coords: [37.654, -122.447]    // [lat, lng]
  }
]
```

## Map Behavior

- **Tile layer:** CartoDB Voyager (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`) — clean light theme, free, no API key
- **Default center:** Braewood 2 community, Westborough, SSF, CA — hardcoded lat/lng in `map.js`, zoom level chosen to frame Athy Dr, Meath Dr, Duhallow Way, Kilconway Ln, and Carter Dr
- **Polygons:** `L.polygon` with fill color + opacity; `bindTooltip` shows label on hover
- **Pins:** `L.circleMarker` colored by type; `bindPopup` shows label + notes on click
- **Labels:** `L.marker` with `L.divIcon` containing styled text; no click behavior
- **Layer toggles:** `L.control.layers` with one overlay per pin type, plus overlays for Polygons and Labels. Built-in Leaflet control, no custom UI.

## Bundler

`bundle.js` is a standalone Node script (~30 lines):

1. Reads `index.html`
2. For each `<script src="...">` or `<link rel="stylesheet" href="...">` pointing to a local file: replaces the tag with the file contents inlined (`<script>...</script>` or `<style>...</style>`)
3. CDN URLs are left untouched
4. Writes result to `dist/braewood2-map.html`

Run with: `node bundle.js`

## Deployment

GitHub Pages on the `main` branch root. No build step — `index.html` is served directly.

## Future Considerations

- Geotagged photos attached to pins or polygons
- Polylines for irrigation lines or utility runs
- Migrate to Astro if the project grows beyond one page
- Info panel sidebar for selected feature details
