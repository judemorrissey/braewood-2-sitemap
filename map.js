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

document.addEventListener('DOMContentLoaded', initMap)
