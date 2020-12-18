const ouBatir = '[OuBatir]: '
// Set map, layers and markers
const zoomLevel = 17;
const hp1 = new L.layerGroup();
const hp3 = new L.LayerGroup();
const url = 'https://fredonweb.github.io/leaflet-demo/patrimoine.json';
//const map = L.map('map').setView([45.733025, 4.925995], 12);
const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  minZoom: 1,
  maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Set hp levels view
const hpLevels = true;
if (!hpLevels) map.addLayer(hp3);

// Search control plugin
var searchControl = new L.Control.Search({
  layer: hp1,
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
        var markerStyle = 'markerStyle3';
        var x = 2;
        var y = -14;

        if (hpLevels && feature.properties.HP2 == '') {
          markerStyle = 'markerStyle1';
          x = 0;
          y = -14;
        }
        return L.marker(latlng, {
          icon: L.divIcon({
            className: markerStyle,
            popupAnchor: [x, y],
            iconSize: null,
            html: '',
          }),
          rotation: -45,
          draggable: true
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
  if (hpLevels && feature.properties.HP2 == '') {
    hp1.addLayer(layer);
    var position = layer.getLatLng();
    var popup = popupContentFct(feature, position);
    layer.bindPopup(popup);
    //layer.bindPopup('<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');
  } else {
    if (feature.properties.HP2 !== '') hp3.addLayer(layer);
    var position = layer.getLatLng();
    var popup = popupContentFct(feature, position);
    layer.bindPopup(popup);

    // Update popupContent after dragend marker
    layer.on('dragend', function(event){
      position = layer.getLatLng();
      layer.setLatLng(position);
      popup = popupContentFct(feature, position)
      layer.bindPopup(popup);
    });
  }
}

function popupContentFct(feature, position) {
  let popupContent = '<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>';
  /*let popupContent = '<p class="popup-style popup-style-title">Résidence<br />' + feature.properties.LIBELLE + '</p>' +
                     '<p class="popup-style popup-style-subtitle">' + feature.properties.NB_UG + ' logements</p>' +
                     '<p class="popup-style popup-style-adresse">----</p>' +
                     '<p class="popup-style popup-style-adresse">' + feature.properties.NUMERO + ' ' + feature.properties.RUE + '</p>' +
                     '<p class="popup-style popup-style-adresse">' + feature.properties.CODE_POSTAL + ' ' + feature.properties.LOC + '</p>' +
                     '<p class="popup-style popup-style-adresse">' + position.lat + ', ' + position.lng + '</p>' +
                     '<p class="popup-style popup-style-adresse">----</p>' +
                     '<p class="popup-style popup-style-HP">HP1: ' + feature.properties.HP1 + ' / HP2: ' + feature.properties.HP2 + ' / HP3: ' + feature.properties.HP3 + '</p>';*/
  return popupContent
}

// Show/Hide layers with zoom level
map.on('zoomend', function () {
  if (hpLevels) {
    if (map.getZoom() < zoomLevel) {
      map.removeLayer(hp3);
      map.addLayer(hp1);
    }
    if (map.getZoom() > zoomLevel) {
      map.removeLayer(hp1);
      map.addLayer(hp3);
    }
  } else {
    map.addLayer(hp3);
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
