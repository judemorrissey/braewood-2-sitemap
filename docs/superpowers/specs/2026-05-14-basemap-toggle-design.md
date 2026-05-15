# Basemap Toggle Design

## Summary

Add Default / Satellite / Topo basemap switching to the existing Leaflet layers control.

## Basemaps

| Name | Tile URL | Notes |
|------|----------|-------|
| Default | `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png` | Current tile, added to map on init |
| Satellite | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` | ESRI World Imagery, no API key required |
| Topo | `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}` | ESRI World Topo Map, no API key required |

## Implementation

All changes are in `initMap()` in `map.js`:

1. Define three `L.tileLayer` instances for Default, Satellite, and Topo.
2. Add the Default tile layer to the map on init (as today).
3. Pass all three as a `baseLayers` object to the first argument of `L.control.layers`.
4. Remove the current standalone `.addTo(map)` call for the tile layer (it's now managed by the control).

Leaflet renders basemaps as radio buttons at the top of the layers panel, above existing overlay checkboxes. Attribution updates automatically on switch.

## Out of Scope

- No custom toggle buttons or separate UI
- No satellite + labels hybrid layer
- No changes to overlay layers
