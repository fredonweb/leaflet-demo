// Set log messages
const ouBatir = '[OuBatir]: '

// Set map, layers and markers
const zoomLevel = 17;
const markerGroupHp1 = new L.layerGroup();
const markerGroupHp3 = new L.LayerGroup();
const url = 'https://fredonweb.github.io/leaflet-demo/patrimoine.geojson';
//const map = L.map('map').setView([45.733025, 4.925995], 12);
const map = L.map('map', {
  zoomSnap: 0.25,
  zoomDelta: 0.25,
  minZoom: 11,
  maxZoom: 19
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  minZoom: 1,
  maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Set hp levels view
const hpLevels = true;
if (!hpLevels) map.addLayer(markerGroupHp3);

// Search control plugin
var searchControl = new L.Control.Search({
  layer: markerGroupHp1,
  propertyName: 'LIBELLE',
  zoom: 16,
  delayType: 200,
  textPlaceholder: 'Rechercher',
  textErr: 'Aucun résultat',
  textCancel: 'Annuler',
  initial: false,
  marker: false
});
searchControl.on('search:locationfound', function(e) {
	if(e.layer._popup)
		e.layer.openPopup();
    map.setView(e.layer.getLatLng());
});

map.addControl( searchControl );

// Resquest patrimoine.json
fetchRequest(url)
  .then(data => {
    console.log(ouBatir + 'fetchRequest done,')
    console.log(ouBatir + 'datas : ')
    console.log(data.features);

    const markersLayer = new L.geoJSON(data.features, {
      pointToLayer: function (feature, latlng) {
        let markerStyle = 'markerStyle3';
        let x = 2;
        let y = -14;
        let tooltipText = feature.properties.LIBELLE;
        if (hpLevels && feature.properties.HP2 == '') {
          markerStyle = 'markerStyle1';
          x = 0;
          y = -14;
        }

        return L.marker(latlng, {
          icon: L.divIcon({
            className: markerStyle,
            //iconAnchor: [0, 24],
            //labelAnchor: [-6, 0],
            popupAnchor: [x, y],
            iconSize: null
          }),
          rotation: -45,
          draggable: true,
          riseOnHover: true
        }).bindTooltip(tooltipText,{
            direction: 'top',
            sticky: true
          });
      },
      onEachFeature: onEachFeature
    });

    map.fitBounds(markersLayer.getBounds());

    console.log(ouBatir + 'load datas done');
  })
  .catch(err => {
    console.log(ouBatir + 'fetchRequest(), Error :', err);
  });

function onEachFeature (feature, layer) {
  let position = layer.getLatLng();
  let popupContent = setPopupContent(feature, position);

  if (hpLevels && feature.properties.HP2 == '') {
    markerGroupHp1.addLayer(layer);
    //layer.style.backgroundColor = 'red';
    layer.bindPopup(popupContent, {className: 'une-Classe'});
  } else {
    if (feature.properties.HP2 !== '') markerGroupHp3.addLayer(layer);
    popupContent = setPopupContent(feature, position);
    layer.bindPopup(popupContent);

    // Update popupContent after dragend marker
    layer.on('dragend', function(event){
      position = layer.getLatLng();
      layer.setLatLng(position);
      popupContent = setPopupContent(feature, position)
      layer.bindPopup(popupContent, {className: 'une-Autre-Classe'});
    });
  }
}

function setPopupContent(feature, position) {
  let popupContent = '<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>';
  /*let popupContent = '<p class="popup-style popup-style-title">Résidence<br />' + feature.properties.LIBELLE + '</p>' +
                     '<p class="popup-style popup-style-subtitle">' + feature.properties.NB_UG + ' logements</p>' +
                     '<p class="popup-style popup-style-adresse">----</p>' +
                     '<p class="popup-style popup-style-adresse">' + feature.properties.NUMERO + ' ' + feature.properties.RUE + '</p>' +
                     '<p class="popup-style popup-style-adresse">' + feature.properties.CODE_POSTAL + ' ' + feature.properties.LOC + '</p>' +
                     '<p class="popup-style popup-style-adresse">' + position.lat + ', ' + position.lng + '</p>' +
                     '<p class="popup-style popup-style-adresse">----</p>' +
                     '<p class="popup-style popup-style-HP">markerGroupHp1: ' + feature.properties.markerGroupHp1 + ' / HP2: ' + feature.properties.HP2 + ' / markerGroupHp3: ' + feature.properties.markerGroupHp3 + '</p>';*/
  return popupContent
}

// Show/Hide layers with zoom level
map.on('zoomend', function () {
  if (hpLevels) {
    if (map.getZoom() < zoomLevel) {
      map.removeLayer(markerGroupHp3);
      map.addLayer(markerGroupHp1);
    }
    if (map.getZoom() > zoomLevel) {
      map.removeLayer(markerGroupHp1);
      map.addLayer(markerGroupHp3);
    }
  } else {
    map.addLayer(markerGroupHp3);
  }
});

// Fetch async function
async function fetchRequest(url) {
  console.log(ouBatir + 'fetchRequest datas...');
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

// Rotate markers function
(function() {
  // Save original method before overwriting it below.
  const _setPosOriginal = L.Marker.prototype._setPos

  L.Marker.addInitHook(function() {
    const anchor = this.options.icon.options.iconAnchor
    this.options.rotationOrigin = anchor ? `${anchor[0]}px ${anchor[1]}px` : 'center center'
    // Ensure marker remains rotated during dragging.
    this.on('drag', data => { this._rotate() })
  })

  L.Marker.include({
    // _setPos is alled when update() is called, e.g. on setLatLng()
    _setPos: function(pos) {
      _setPosOriginal.call(this, pos)
      if (this.options.rotation) this._rotate()
    },
    _rotate: function() {
      this._icon.style[`${L.DomUtil.TRANSFORM}Origin`] = this.options.rotationOrigin
      this._icon.style[L.DomUtil.TRANSFORM] += ` rotate(${this.options.rotation}deg)`
    }
  })
})()
