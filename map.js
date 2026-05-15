const PIN_TYPE_LABELS = {
  'fire-extinguisher': 'Fire Extinguishers',
  'backflow-preventer': 'Backflow Preventers',
  'sprinkler-controller': 'Sprinkler Controllers',
  'building-type': 'Building Types'
}

const PIN_COLORS = {
  'fire-extinguisher': '#ef4444',
  'backflow-preventer': '#f97316',
  'sprinkler-controller': '#3b82f6',
  'building-type': '#a855f7'
}

function renderPolygons(map) {
  const group = L.layerGroup()

  for (const poly of POLYGONS) {
    L.polygon(poly.coords, {
      color: poly.strokeColor ?? poly.color,
      fillColor: poly.fillColor ?? poly.color,
      fillOpacity: poly.fillOpacity ?? poly.opacity,
      opacity: poly.strokeOpacity ?? 1,
      weight: poly.weight ?? 2
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

    const marker = L.circleMarker(pin.coords, {
      radius: 7,
      color: '#fff',
      weight: 2,
      fillColor: color,
      fillOpacity: 0.9
    })

    if (pin.permanentLabel) {
      marker.bindTooltip(pin.label, { permanent: true, direction: 'right', offset: [8, 0] })
    } else {
      marker.bindPopup(popupContent)
    }

    marker.addTo(groups.get(pin.type))
  }

  return groups
}


function communityBounds() {
  const allCoords = POLYGONS.flatMap(p => p.coords)
  return L.latLngBounds(allCoords)
}

function initMap() {
  const bounds = communityBounds().pad(2)
  const map = L.map('map', {
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
  })

  const baseLayers = {
    'Default': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxNativeZoom: 19,
      maxZoom: 22
    }),
    'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      maxNativeZoom: 19,
      maxZoom: 22
    }),
  }

  baseLayers['Default'].addTo(map)

  const polygonGroup = renderPolygons(map)
  map.fitBounds(communityBounds(), { padding: [40, 40] })
  map.setMinZoom(map.getZoom())
  const pinGroups = renderPins(map)

  const overlays = {
    'Community Property Lines': polygonGroup
  }

  for (const [type, group] of pinGroups) {
    const label = PIN_TYPE_LABELS[type] ?? type
    overlays[label] = group
  }

  L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map)
}

document.addEventListener('DOMContentLoaded', initMap)
