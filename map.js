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

function communityBounds() {
  const allCoords = POLYGONS.flatMap(p => p.coords)
  return L.latLngBounds(allCoords)
}

function initMap() {
  const map = L.map('map')

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  const polygonGroup = renderPolygons(map)
  map.fitBounds(communityBounds(), { padding: [40, 40] })
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

document.addEventListener('DOMContentLoaded', initMap)
