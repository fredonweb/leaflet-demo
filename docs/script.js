// Set map, layers and markers
const zoomLevel = 17;
const hp1 = new L.layerGroup;
const hp3 = new L.LayerGroup();
const url = 'https://fredonweb.github.io/leaflet-demo/test.json';
const map = L.map('map');
//const map = L.map('map').setView([45.733025, 4.925995], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  minZoom: 1,
  maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Resquest datas.json
fetchRequest(url)
  .then(data => {
    console.log('> fetchRequest done,')
    console.log('> datas : ')
    console.log(data.features);
    const markersLayer = new L.geoJSON(data.features, {
      pointToLayer: function (feature, latlng) {
        if (feature.properties.HP2 == '') {
          var markerStyle = 'markerStyle1';
          var x = 0;
          var y = -14;
          //var tooltipText = feature.properties.HP1;
        } else {
          markerStyle = 'markerStyle3';
          x = 2;
          y = -14;
          //tooltipText = '';
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
        })/*.bindTooltip(tooltipText,{
          permanent: true,
          direction: 'top',
          offset: [5, 2]
        })*/;
      },
      onEachFeature: onEachFeature
    });
    map.fitBounds(markersLayer.getBounds());
  })
  .catch(err => {
    console.log('> fetchRequest(), Error :', err);
  });

function onEachFeature (feature, layer) {
  if (feature.properties.HP2 == '') {
    hp1.addLayer(layer);
    layer.bindPopup('<p class="popup-style popup-style-title">' + feature.properties.LIBELLE + '</p>');
    //layer.bindPopup('<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');
  } else {
    hp3.addLayer(layer);
    var position = layer.getLatLng();

    let popupContent = '<p class="popup-style popup-style-title">Résidence<br />' + feature.properties.LIBELLE + '</p>' +
                       '<p class="popup-style popup-style-subtitle">' + feature.properties.Nb + ' logements</p>' +
                       '<p class="popup-style popup-style-adresse">----</p>' +
                       '<p class="popup-style popup-style-adresse">' + feature.properties.numero + ' ' + feature.properties.rue + '</p>' +
                       '<p class="popup-style popup-style-adresse">' + feature.properties.cp + ' ' + feature.properties.commune + '</p>' +
                       '<p class="popup-style popup-style-adresse">' + position.lat + ', ' + position.lng + '</p>' +
                       '<p class="popup-style popup-style-adresse">----</p>' +
                       '<p class="popup-style popup-style-HP">HP1: ' + feature.properties.HP1 + ' / HP2: ' + feature.properties.HP2 + ' / HP3: ' + feature.properties.HP3 + '</p>';

    layer.bindPopup(popupContent);

    // Update popupContent after dragend marker
    layer.on('dragend', function(event){
      position = layer.getLatLng();
      layer.setLatLng(position);
      let popupContent = '<p class="popup-style popup-style-title">Résidence<br />' + feature.properties.LIBELLE + '</p>' +
                         '<p class="popup-style popup-style-subtitle">' + feature.properties.Nb + ' logements</p>' +
                         '<p class="popup-style popup-style-adresse">----</p>' +
                         '<p class="popup-style popup-style-adresse">Nouvelles coordonnées géographiques :</p>' +
                         '<p class="popup-style popup-style-adresse">' + position.lat + ', ' + position.lng + '</p>' +
                         '<p class="popup-style popup-style-adresse">----</p>' +
                         '<p class="popup-style popup-style-HP">HP1: ' + feature.properties.HP1 + ' / HP2: ' + feature.properties.HP2 + ' / HP3: ' + feature.properties.HP3 + '</p>';
      layer.setPopupContent(popupContent);
    });
  }
}

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

// Show/Hide layer with zoom level
map.on('zoomend', function () {
  if (map.getZoom() < zoomLevel && map.hasLayer(hp3)) {
      map.removeLayer(hp3);
      map.addLayer(hp1);
  }
  if (map.getZoom() > zoomLevel && map.hasLayer(hp3) == false) {
      map.removeLayer(hp1);
      map.addLayer(hp3);
  }
});

// Return latlng on map click
function onMapClick(e) {
  console.log(e.latlng.toString())
}
map.on('click', onMapClick);

// Fetch async function
async function fetchRequest(url) {
  console.log('> fetchRequest...');
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





// Fetch avec methode forEach
/*data.features.forEach(data => {
  console.log(data.properties);
  if (data.properties.HP2 == undefined) {
    var markerStyle = 'markerStyle1';
  } else {
    markerStyle = 'markerStyle3';
  }
  var marker = new L.marker([data.geometry.coordinates[1],data.geometry.coordinates[0]],{
    icon: L.divIcon({
      className: markerStyle,
      popupAnchor: [2, -14],
      iconSize: null,
      html: '',
    }),
    rotation: -45,
    draggable: true
  }).bindPopup('<pre>'+JSON.stringify(data.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');

  if (data.properties.HP2 == undefined) {
    console.log('hp1');
    hp1.addLayer(marker);
  } else {
    console.log('hp3');
    hp3.addLayer(marker);
  }
});*/


/*new L.geoJSON(datas, {
  pointToLayer: function (feature, latlng) {
    if (feature.properties.HP2 == undefined) {
      var markerStyle = 'markerStyle1'
    } else {
      markerStyle = 'markerStyle3'
    }
    return L.marker(latlng, {
      icon: L.divIcon({
        className: markerStyle,
        popupAnchor: [2, -14],
        iconSize: null,
        html: '',
      }),
      rotation: -45,
      draggable: true
    });
  },
  onEachFeature: onEachFeature
});*/
