# Braewood 2 Community Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public-facing, static interactive map for Westborough Braewood 2 Condominium showing landscaping polygons, infrastructure pins, and building labels — deployable to GitHub Pages with no build step.

**Architecture:** Single `index.html` loads Leaflet from CDN and three local data files (`polygons.js`, `pins.js`, `labels.js`), each declaring a plain JS `const`. A separate `map.js` reads those consts and renders everything onto the Leaflet map. A standalone `bundle.js` Node script inlines all local files into a single portable HTML for sharing.

**Tech Stack:** Leaflet 1.9.x (CDN), CartoDB Voyager tiles, plain HTML/CSS/JS, Node.js built-ins for bundler.

---

### Task 1: Repo scaffold

**Files:**
- Create: `index.html`
- Create: `.gitignore`
- Create: `data/polygons.js`
- Create: `data/pins.js`
- Create: `data/labels.js`
- Create: `map.js`

- [ ] **Step 1: Create `.gitignore`**

```
dist/
.DS_Store
```

- [ ] **Step 2: Create empty data files**

`data/polygons.js`:
```js
const POLYGONS = []
```

`data/pins.js`:
```js
const PINS = []
```

`data/labels.js`:
```js
const LABELS = []
```

- [ ] **Step 3: Create `map.js` stub**

```js
function initMap() {
  const map = L.map('map').setView([37.6548, -122.4477], 16)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)
}

document.addEventListener('DOMContentLoaded', initMap)
```

- [ ] **Step 4: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Braewood 2 Community Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: sans-serif; }
    #header {
      padding: 10px 16px;
      background: #1e3a5f;
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    #map { height: calc(100vh - 42px); width: 100%; }
  </style>
</head>
<body>
  <div id="header">Braewood 2 Community Map</div>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="data/polygons.js"></script>
  <script src="data/pins.js"></script>
  <script src="data/labels.js"></script>
  <script src="map.js"></script>
</body>
</html>
```

- [ ] **Step 5: Open `index.html` in a browser and verify**

Expected: map loads centered on Westborough SSF, CartoDB Voyager tiles visible, header bar shows "Braewood 2 Community Map". No console errors.

- [ ] **Step 6: Commit**

```
git add index.html map.js data/polygons.js data/pins.js data/labels.js .gitignore
git commit -m "chore: scaffold repo with Leaflet map shell and empty data files"
```

---

### Task 2: Polygon rendering

**Files:**
- Modify: `data/polygons.js`
- Modify: `map.js`

- [ ] **Step 1: Add a sample polygon to `data/polygons.js`**

Use a rough rectangle around the Braewood 2 community as a placeholder. Real coordinates will be drawn on https://geojson.io and pasted here later.

```js
const POLYGONS = [
  {
    id: "landscaping-sample",
    label: "HOA Landscaping (sample)",
    color: "#4ade80",
    opacity: 0.35,
    coords: [
      [37.6552, -122.4490],
      [37.6552, -122.4465],
      [37.6538, -122.4465],
      [37.6538, -122.4490]
    ]
  }
]
```

- [ ] **Step 2: Add `renderPolygons` to `map.js`**

Replace the `initMap` function with the version below. The polygon layer group is returned so it can be used in the layer control later.

```js
function renderPolygons(map) {
  const group = L.layerGroup()

  for (const poly of POLYGONS) {
    L.polygon(poly.coords, {
      color: poly.color,
      fillColor: poly.color,
      fillOpacity: poly.opacity,
      weight: 2
    })
      .bindTooltip(poly.label, { sticky: true })
      .addTo(group)
  }

  group.addTo(map)
  return group
}

function initMap() {
  const map = L.map('map').setView([37.6548, -122.4477], 16)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  renderPolygons(map)
}

document.addEventListener('DOMContentLoaded', initMap)
```

- [ ] **Step 3: Open `index.html` in browser and verify**

Expected: green shaded rectangle visible over the map. Hovering it shows the tooltip "HOA Landscaping (sample)". No console errors.

- [ ] **Step 4: Commit**

```
git add data/polygons.js map.js
git commit -m "feat: render landscaping polygons from POLYGONS data"
```

---

### Task 3: Pin rendering

**Files:**
- Modify: `data/pins.js`
- Modify: `map.js`

- [ ] **Step 1: Define pin type colors in `map.js`**

Add this constant at the top of `map.js` (before `renderPolygons`):

```js
const PIN_COLORS = {
  'fire-hydrant': '#ef4444',
  'backflow-preventer': '#f97316',
  'sprinkler-controller': '#3b82f6'
}
```

- [ ] **Step 2: Add sample pins to `data/pins.js`**

```js
const PINS = [
  {
    id: "hydrant-1",
    type: "fire-hydrant",
    label: "Hydrant #1",
    coords: [37.6550, -122.4480],
    notes: "Near Athy Dr entrance"
  },
  {
    id: "backflow-1",
    type: "backflow-preventer",
    label: "Backflow Preventer #1",
    coords: [37.6545, -122.4475],
    notes: ""
  },
  {
    id: "sprinkler-1",
    type: "sprinkler-controller",
    label: "Sprinkler Controller #1",
    coords: [37.6540, -122.4470],
    notes: "Controls zones 1-4"
  }
]
```

- [ ] **Step 3: Add `renderPins` to `map.js`**

Returns a `Map<string, L.LayerGroup>` keyed by pin type so the layer control can reference them.

```js
function renderPins(map) {
  const groups = new Map()

  for (const pin of PINS) {
    if (!groups.has(pin.type)) {
      const group = L.layerGroup()
      group.addTo(map)
      groups.set(pin.type, group)
    }

    const color = PIN_COLORS[pin.type] ?? '#6b7280'
    const popupContent = pin.notes
      ? `<strong>${pin.label}</strong><br/>${pin.notes}`
      : `<strong>${pin.label}</strong>`

    L.circleMarker(pin.coords, {
      radius: 7,
      color: '#fff',
      weight: 2,
      fillColor: color,
      fillOpacity: 0.9
    })
      .bindPopup(popupContent)
      .addTo(groups.get(pin.type))
  }

  return groups
}
```

- [ ] **Step 4: Call `renderPins` in `initMap`**

Update `initMap` to call `renderPins`:

```js
function initMap() {
  const map = L.map('map').setView([37.6548, -122.4477], 16)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  renderPolygons(map)
  renderPins(map)
}
```

- [ ] **Step 5: Open `index.html` in browser and verify**

Expected: three colored circle markers visible. Red for hydrant, orange for backflow preventer, blue for sprinkler controller. Clicking each opens a popup with label and notes. No console errors.

- [ ] **Step 6: Commit**

```
git add data/pins.js map.js
git commit -m "feat: render infrastructure pins from PINS data with type-based colors"
```

---

### Task 4: Label rendering

**Files:**
- Modify: `data/labels.js`
- Modify: `map.js`

- [ ] **Step 1: Add sample labels to `data/labels.js`**

```js
const LABELS = [
  { id: "building-1", text: "Building 1", coords: [37.6551, -122.4488] },
  { id: "building-2", text: "Building 2", coords: [37.6546, -122.4482] },
  { id: "building-3", text: "Building 3", coords: [37.6541, -122.4476] }
]
```

- [ ] **Step 2: Add label styles to `index.html`**

Inside the `<style>` block, add:

```css
.map-label {
  background: none;
  border: none;
  box-shadow: none;
  font-size: 11px;
  font-weight: 700;
  color: #1e3a5f;
  text-shadow: 0 0 3px #fff, 0 0 3px #fff;
  white-space: nowrap;
  pointer-events: none;
}
```

- [ ] **Step 3: Add `renderLabels` to `map.js`**

```js
function renderLabels(map) {
  const group = L.layerGroup()

  for (const lbl of LABELS) {
    L.marker(lbl.coords, {
      icon: L.divIcon({
        className: 'map-label',
        html: lbl.text,
        iconAnchor: [0, 0]
      }),
      interactive: false
    }).addTo(group)
  }

  group.addTo(map)
  return group
}
```

- [ ] **Step 4: Call `renderLabels` in `initMap`**

```js
function initMap() {
  const map = L.map('map').setView([37.6548, -122.4477], 16)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  renderPolygons(map)
  renderPins(map)
  renderLabels(map)
}
```

- [ ] **Step 5: Open `index.html` in browser and verify**

Expected: "Building 1", "Building 2", "Building 3" text labels visible on the map. Labels are non-interactive (no pointer cursor, no click). No console errors.

- [ ] **Step 6: Commit**

```
git add data/labels.js map.js index.html
git commit -m "feat: render building/area text labels from LABELS data"
```

---

### Task 5: Layer toggle control

**Files:**
- Modify: `map.js`

- [ ] **Step 1: Replace `initMap` with version that wires up `L.control.layers`**

This is the final version of `initMap`. It collects all layer groups and registers them as named overlays.

```js
const PIN_TYPE_LABELS = {
  'fire-hydrant': 'Fire Hydrants',
  'backflow-preventer': 'Backflow Preventers',
  'sprinkler-controller': 'Sprinkler Controllers'
}

function initMap() {
  const map = L.map('map').setView([37.6548, -122.4477], 16)

  const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  const polygonGroup = renderPolygons(map)
  const pinGroups = renderPins(map)
  const labelGroup = renderLabels(map)

  const overlays = {
    'Landscaping Zones': polygonGroup,
    'Building Labels': labelGroup
  }

  for (const [type, group] of pinGroups) {
    const label = PIN_TYPE_LABELS[type] ?? type
    overlays[label] = group
  }

  L.control.layers(null, overlays, { collapsed: false }).addTo(map)
}
```

Also add `PIN_TYPE_LABELS` before `PIN_COLORS` at the top of `map.js`. The full top of `map.js` should now read:

```js
const PIN_TYPE_LABELS = {
  'fire-hydrant': 'Fire Hydrants',
  'backflow-preventer': 'Backflow Preventers',
  'sprinkler-controller': 'Sprinkler Controllers'
}

const PIN_COLORS = {
  'fire-hydrant': '#ef4444',
  'backflow-preventer': '#f97316',
  'sprinkler-controller': '#3b82f6'
}
```

- [ ] **Step 2: Open `index.html` in browser and verify**

Expected: layer control panel visible in top-right corner showing checkboxes for "Landscaping Zones", "Building Labels", "Fire Hydrants", "Backflow Preventers", "Sprinkler Controllers". Unchecking any hides that layer. No console errors.

- [ ] **Step 3: Commit**

```
git add map.js
git commit -m "feat: add layer toggle control for all overlay types"
```

---

### Task 6: Bundler script

**Files:**
- Create: `bundle.js`

- [ ] **Step 1: Create `bundle.js`**

```js
const fs = require('fs')
const path = require('path')

const src = fs.readFileSync('index.html', 'utf8')

const result = src
  .replace(/<script src="([^"]+)"><\/script>/g, (match, file) => {
    if (file.startsWith('http')) return match
    const content = fs.readFileSync(file, 'utf8')
    return `<script>\n${content}\n</script>`
  })
  .replace(/<link rel="stylesheet" href="([^"]+)"[^>]*\/>/g, (match, file) => {
    if (file.startsWith('http')) return match
    const content = fs.readFileSync(file, 'utf8')
    return `<style>\n${content}\n</style>`
  })

fs.mkdirSync('dist', { recursive: true })
fs.writeFileSync(path.join('dist', 'braewood2-map.html'), result, 'utf8')
console.log('Bundled → dist/braewood2-map.html')
```

- [ ] **Step 2: Run the bundler**

```
node bundle.js
```

Expected output: `Bundled → dist/braewood2-map.html`

- [ ] **Step 3: Open `dist/braewood2-map.html` directly in a browser (no server)**

Expected: map loads identically to `index.html`. All layers and layer toggle work. No 404s or console errors. The file is fully self-contained.

- [ ] **Step 4: Commit**

```
git add bundle.js
git commit -m "feat: add bundle.js to produce single-file shareable HTML"
```

---

### Task 7: GitHub Pages setup

**Files:**
- No code changes — configuration only.

- [ ] **Step 1: Push `main` to GitHub**

```
git push -u origin main
```

- [ ] **Step 2: Enable GitHub Pages**

1. Go to the repo on GitHub → Settings → Pages
2. Under "Build and deployment", set Source to **Deploy from a branch**
3. Set Branch to `main`, folder to `/ (root)`
4. Click Save

- [ ] **Step 3: Verify deployment**

Wait ~60 seconds, then open: `https://juderiffic.github.io/braewood-2-sitemap/`

Expected: map loads in the browser exactly as it does locally.

- [ ] **Step 4: Commit `dist/` exclusion reminder**

Verify `dist/` is in `.gitignore` (done in Task 1). The bundled file should never be committed.

---

## Adding Real Polygon Data (Post-Build Guide)

Once the map is live, draw real landscaping zones:

1. Go to https://geojson.io
2. Use the polygon tool to draw each landscaping area
3. Click a polygon → copy the coordinates from the right-hand JSON panel
4. GeoJSON uses `[lng, lat]` order — **Leaflet uses `[lat, lng]`**. Swap each pair.
5. Add an entry to `data/polygons.js` following the schema in Task 2
6. Commit and push — GitHub Pages updates automatically

## Commits Summary

| Task | Commit message |
|------|---------------|
| 1 | `chore: scaffold repo with Leaflet map shell and empty data files` |
| 2 | `feat: render landscaping polygons from POLYGONS data` |
| 3 | `feat: render infrastructure pins from PINS data with type-based colors` |
| 4 | `feat: render building/area text labels from LABELS data` |
| 5 | `feat: add layer toggle control for all overlay types` |
| 6 | `feat: add bundle.js to produce single-file shareable HTML` |
| 7 | GitHub Pages config — no commit needed |
