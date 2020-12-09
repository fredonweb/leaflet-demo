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

// Set map, layers and markers
const zoomLevel = 17;
const hp1 = new L.layerGroup;
const hp3 = new L.LayerGroup();
//const url = 'datas.json';
const url = 'https://fredonweb.github.io/leaflet-demo/test.json';
const map = L.map('map').setView([45.780364, 4.89267], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  minZoom: 1,
  maxZoom: 22,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

fetchRequest(url)
  .then(data => {
    new L.geoJSON(data.features, {
      pointToLayer: function (feature, latlng) {

        if (feature.properties.logement == 0) {
          var markerStyle = 'markerStyle1';
          var x = 6;
          var y = -14;
        } else {
          markerStyle = 'markerStyle3';
          x = 2;
          y = -14;
        }
        if((feature.properties.logement == 0 && feature.properties.hp2 < 1) || (feature.properties.hp3 > 1)) {
          return L.marker(latlng, {
            icon: L.divIcon({
              className: markerStyle,
              popupAnchor: [x, y],
              iconSize: null,
              html: '',
            }),
            rotation: -45,
            draggable: true
          })
        }
      },
      onEachFeature: onEachFeature
    });
  })
  .catch(err => {
    console.log('> fetchRequest(), Error :', err);
  });

function onEachFeature (feature, layer) {
  if (feature.properties.logement == 0) {
    hp1.addLayer(layer);
    layer.bindPopup('<p class="hp3-popup hp3-title">' + feature.properties.nom + '</p>');
    //layer.bindPopup('<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');
  } else {
    hp3.addLayer(layer);
    //layer.bindPopup('<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');
    layer.bindPopup('<p class="hp3-popup hp3-title">Résidence ' + feature.properties.nom + '</p>' +
                    '<p class="hp3-popup hp3-title">' + feature.properties.logement + ' logements</p>' +
                    '<p class="hp3-popup hp3-adresse">----</p>' +
                    '<p class="hp3-popup hp3-adresse">' + feature.properties.numero + ' ' + feature.properties.rue + '</p>' +
                    '<p class="hp3-popup hp3-adresse">' + feature.properties.cp + ' ' + feature.properties.commune + '</p>' +
                    '<p class="hp3-popup hp3-adresse">HP1: ' + feature.properties.hp1 + ' / HP2: ' + feature.properties.hp2 + ' / HP3: ' + feature.properties.hp3 + '</p>'
    );
  }
}

map.addLayer(hp1);


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
  let response = await fetch(url);
  let data = await response.json();
  return data;
}
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
