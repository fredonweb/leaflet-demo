// Set map, layers and markers
const zoomLevel = 17;
const hp1 = new L.layerGroup;
const hp3 = new L.LayerGroup();
const url = 'https://fredonweb.github.io/leaflet-demo/patrimoine.json';
//const map = L.map('map');
const map = L.map('map').setView([45.733025, 4.925995], 12);
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
        return L.marker(latlng, {
          icon: L.divIcon({
            className: 'markerStyle3',
            popupAnchor: [2, -14],
            iconSize: null,
            html: '',
          }),
          rotation: -45,
          draggable: true
        });
      },
      onEachFeature: onEachFeature
    });
  })
  .catch(err => {
    console.log('> fetchRequest(), Error :', err);
  });

function onEachFeature (feature, layer) {
  hp1.addLayer(layer);
  layer.bindPopup('<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');
}

map.addLayer(hp1);

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
