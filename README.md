# Braewood 2 Community Map

Interactive map for the Braewood 2 neighborhood — building types, property lines, and utility infrastructure (fire extinguishers, backflow preventers, sprinkler controllers).

**Live:** https://judemorrissey.com/braewood-2-sitemap/

## Stack

Vanilla JS + [Leaflet](https://leafletjs.com/) loaded from CDN. No build step, no npm, no dependencies to install. Open `index.html` directly in a browser to run locally.

Basemaps: CartoCDN (Default) and Esri World Imagery (Satellite), toggled via the layer control.

## Data

All map data lives in `data/` as plain JS global arrays, loaded as `<script>` tags:

| File | Global | Contents |
|---|---|---|
| `data/pins.js` | `PINS[]` | Point markers (building types, utilities) |
| `data/polygons.js` | `POLYGONS[]` | Filled property line polygons |
| `data/labels.js` | `LABELS[]` | Text annotations (currently unused) |

### Adding a pin

```js
// data/pins.js
{ type: 'fire-extinguisher', coords: [37.644, -122.467], label: 'Bldg 12', notes: 'Under stairs' }
```

`permanentLabel: true` renders the label directly on the map instead of in a popup.

### Pin types

| `type` | Layer label | Color |
|---|---|---|
| `building-type` | Building Types | purple |
| `fire-extinguisher` | Fire Extinguishers | red |
| `backflow-preventer` | Backflow Preventers | orange |
| `sprinkler-controller` | Sprinkler Controllers | blue |

To add a new type, add entries to both `PIN_TYPE_LABELS` and `PIN_COLORS` in `map.js`.

### Adding a polygon

```js
// data/polygons.js
{
  id: 'community-2',
  label: 'North Parcel',
  strokeColor: '#22d3ee',
  fillColor: '#22d3ee',
  fillOpacity: 0.15,
  coords: [[lat, lng], ...]
}
```

## Offline bundle

`bundle.js` is a Node script that inlines all local scripts and styles into a single self-contained HTML file for offline distribution:

```sh
node bundle.js
# → dist/braewood2-map.html
```

## Versioning

Bump `const VERSION` in `version.js` when shipping meaningful changes. The version appears in the map's UI badge.
