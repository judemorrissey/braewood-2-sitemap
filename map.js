const PIN_TYPE_LABELS = {
  'fire-extinguisher': 'Fire Extinguishers',
  'backflow-preventer': 'Backflow Preventers',
  'sprinkler-controller': 'Sprinkler Controllers',
  'building-type': 'Building Types'
}

const POLYGON_CATEGORY_LABELS = {
  'community-property-lines': 'Community Property Lines',
  'parking': 'Parking Spots'
}

const PIN_COLORS = {
  'fire-extinguisher': '#ef4444',
  'backflow-preventer': '#f97316',
  'sprinkler-controller': '#3b82f6',
  'building-type': '#a855f7'
}

function renderPolygons(map) {
  const categories = new Map()

  for (const poly of POLYGONS) {
    const category = poly.category ?? 'community-property-lines'
    if (!categories.has(category)) {
      const group = L.layerGroup()
      group.addTo(map)
      categories.set(category, { group, labelLayers: [] })
    }

    const entry = categories.get(category)
    const layer = L.polygon(poly.coords, {
      color: poly.strokeColor ?? poly.color,
      fillColor: poly.fillColor ?? poly.color,
      fillOpacity: poly.fillOpacity ?? poly.opacity,
      opacity: poly.strokeOpacity ?? 1,
      weight: poly.weight ?? 2
    }).addTo(entry.group)

    if (poly.permanentLabel) {
      layer.bindTooltip(poly.label, { permanent: true, direction: 'center' })
      entry.labelLayers.push(layer)
    } else {
      layer.bindTooltip(poly.label, { sticky: true })
    }
  }

  return categories
}

function renderPins(map) {
  const categories = new Map()

  for (const pin of PINS) {
    if (!categories.has(pin.type)) {
      const group = L.layerGroup()
      group.addTo(map)
      categories.set(pin.type, { group, labelLayers: [] })
    }

    const entry = categories.get(pin.type)
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
    }).addTo(entry.group)

    if (pin.permanentLabel) {
      marker.bindTooltip(pin.label, { permanent: true, direction: 'right', offset: [8, 0] })
      entry.labelLayers.push(marker)
    } else {
      marker.bindPopup(popupContent)
    }
  }

  return categories
}


function communityBounds() {
  const allCoords = POLYGONS.flatMap(p => p.coords)
  return L.latLngBounds(allCoords)
}

function buildLayersControl(map, baseLayers, sections) {
  const control = L.control({ position: 'topright' })

  control.onAdd = function () {
    const container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control-layers-expanded')
    L.DomEvent.disableClickPropagation(container)
    L.DomEvent.disableScrollPropagation(container)

    const baseSection = L.DomUtil.create('div', 'leaflet-control-layers-base', container)
    const baseNames = Object.keys(baseLayers)
    let activeBaseLayer = baseNames[0]

    for (const name of baseNames) {
      const label = L.DomUtil.create('label', '', baseSection)
      const input = L.DomUtil.create('input', '', label)
      input.type = 'radio'
      input.name = 'base-layer'
      input.checked = name === activeBaseLayer
      label.appendChild(document.createTextNode(' ' + name))

      L.DomEvent.on(input, 'change', () => {
        if (!input.checked) return
        map.removeLayer(baseLayers[activeBaseLayer])
        baseLayers[name].addTo(map)
        activeBaseLayer = name
      })
    }

    L.DomUtil.create('div', 'leaflet-control-layers-separator', container)

    const overlaySection = L.DomUtil.create('div', 'leaflet-control-layers-overlays', container)

    for (const section of sections) {
      const label = L.DomUtil.create('label', '', overlaySection)
      const input = L.DomUtil.create('input', '', label)
      input.type = 'checkbox'
      input.checked = true
      label.appendChild(document.createTextNode(' ' + section.label))

      let labelInput = null
      if (section.labelLayers.length > 0) {
        const labelRow = L.DomUtil.create('label', 'layers-label-toggle', overlaySection)
        labelInput = L.DomUtil.create('input', '', labelRow)
        labelInput.type = 'checkbox'
        labelInput.checked = true
        labelRow.appendChild(document.createTextNode(' Show Labels'))

        L.DomEvent.on(labelInput, 'change', () => {
          for (const layer of section.labelLayers) {
            if (labelInput.checked) {
              layer.openTooltip()
            } else {
              layer.closeTooltip()
            }
          }
        })
      }

      L.DomEvent.on(input, 'change', () => {
        if (input.checked) {
          section.group.addTo(map)
        } else {
          map.removeLayer(section.group)
        }

        if (labelInput) {
          labelInput.disabled = !input.checked
          labelInput.parentElement.classList.toggle('is-disabled', !input.checked)
        }
      })
    }

    return container
  }

  control.addTo(map)
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

  const polygonCategories = renderPolygons(map)
  map.fitBounds(communityBounds(), { padding: [40, 40] })
  map.setMinZoom(map.getZoom())
  const pinCategories = renderPins(map)

  const sections = []

  const communityEntry = polygonCategories.get('community-property-lines')
  if (communityEntry) {
    sections.push({ label: POLYGON_CATEGORY_LABELS['community-property-lines'], ...communityEntry })
  }

  for (const [type, entry] of pinCategories) {
    const label = PIN_TYPE_LABELS[type] ?? type
    sections.push({ label, ...entry })
  }

  for (const [category, entry] of polygonCategories) {
    if (category === 'community-property-lines') continue
    const label = POLYGON_CATEGORY_LABELS[category] ?? category
    sections.push({ label, ...entry })
  }

  buildLayersControl(map, baseLayers, sections)
}

document.addEventListener('DOMContentLoaded', initMap)
