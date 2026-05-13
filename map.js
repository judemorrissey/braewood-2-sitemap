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
