# Basemap Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Default / Satellite / Topo basemap radio buttons to the existing Leaflet layers control.

**Architecture:** Define three `L.tileLayer` instances in `initMap()`, add Default to the map on init, pass all three as `baseLayers` to the first argument of `L.control.layers`. Leaflet renders them as radio buttons above existing overlay checkboxes.

**Tech Stack:** Leaflet (vanilla JS, no build step), ESRI ArcGIS REST tile services, CartoDB tile CDN.

---

### Task 1: Add basemap tile layers and wire up the control

**Files:**
- Modify: `map.js` — `initMap()` function (lines 83–113)

This project has no test framework — it's vanilla JS loaded directly in the browser. Manual verification steps replace automated tests.

- [ ] **Step 1: Replace the existing tile layer block with three named basemap layers**

In `map.js`, replace:

```js
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map)
```

With:

```js
const baseLayers = {
  'Default': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }),
  'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxZoom: 19
  }),
  'Topo': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, Intermap, USGS, NGA, EPA, NPS',
    maxZoom: 19
  })
}

baseLayers['Default'].addTo(map)
```

- [ ] **Step 2: Pass `baseLayers` as the first argument to `L.control.layers`**

Replace:

```js
L.control.layers(null, overlays, { collapsed: false }).addTo(map)
```

With:

```js
L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map)
```

- [ ] **Step 3: Open `index.html` in a browser and verify**

- The layers panel shows a **"Default / Satellite / Topo"** radio group at the top, above existing overlay checkboxes
- Default is selected on load and the map looks unchanged
- Switching to Satellite shows ESRI aerial imagery
- Switching to Topo shows ESRI topographic map
- Attribution text updates in the bottom-right corner when switching
- Switching back to Default works correctly
- All overlay toggles (Landscaping Zones, Building Labels, pins) still work on all three basemaps

- [ ] **Step 4: Commit**

```
git add map.js
git commit -m "feat(map): add Default/Satellite/Topo basemap toggle"
```
