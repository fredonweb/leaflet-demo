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
  const zoomLevel = 16;
  const HP1 = new L.LayerGroup();
  const HP3 = new L.LayerGroup();
  const url = 'datas.json';
  const map = L.map('map').setView([45.780364, 4.89267], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 1,
    maxZoom: 22,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var datas = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            4.89267,
            45.780364
          ]
        },
        'properties': {
          'nom': 'Résidence Pranard',
          'logements': 80
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            4.891909,
            45.78049
          ]
        },
        'properties': {
          'HP1': '1',
          'HP2': '1',
          'HP3': '1',
          'nom': 'Résidence Pranard',
          'logements': 12,
          'numero': '2',
          'rue': 'rue de la Boube',
          'ville': 'Villeurbanne',
          'cp' : 69100
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
          4.89236,
          45.780549
          ]
        },
        'properties': {
          'HP1': '1',
          'HP2': '1',
          'HP3': '2',
          'nom': 'Résidence Pranard',
          'logements': 12,
          'numero': '4',
          'rue': 'rue de la Boube',
          'ville': 'Villeurbanne',
          'cp' : 69100
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
          4.892808,
          45.780609
          ]
        },
        'properties': {
          'HP1': '1',
          'HP2': '1',
          'HP3': '3',
          'nom': 'Résidence Pranard',
          'logements': 12,
          'numero': '6',
          'rue': 'rue de la Boube',
          'ville': 'Villeurbanne',
          'cp' : 69100
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
          4.893079,
          45.780147
          ]
        },
        'properties': {
          'HP1': '1',
          'HP2': '2',
          'HP3': '1',
          'nom': 'Résidence Pranard',
          'logements': 16,
          'numero': '41',
          'rue': 'rue du 8 mai 1945',
          'ville': 'Villeurbanne',
          'cp' : 69100
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
          4.893621,
          45.780209
          ]
        },
        'properties': {
          'HP1': '1',
          'HP2': '2',
          'HP3': '2',
          'nom': 'Résidence Pranard',
          'logements': 16,
          'numero': '43',
          'rue': 'rue du 8 mai 1945',
          'ville': 'Villeurbanne',
          'cp' : 69100
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
          4.893253,
          45.780664
          ]
        },
        'properties': {
          'HP1': '1',
          'HP2': '1',
          'HP3': '4',
          'nom': 'Résidence Pranard',
          'numero': '8',
          'rue': 'rue de la Boube',
          'ville': 'Villeurbanne',
          'cp' : 69100
        }
      }
    ]
  };

  fetchRequest(url)
    .then(data => {
      data.features.forEach(data => {
        console.log(data);
        //pointToLayer: function (feature, latlng) {
          /*if (data.properties.HP2 == undefined) {
            var markerStyle = 'markerStyle1'
          } else {
            markerStyle = 'markerStyle3'
          }*/
          var marker = new L.marker(data.geometry.coordinates[0], data.geometry.coordinates[1], {
            icon: L.divIcon({
              className: markerStyle,
              popupAnchor: [2, -14],
              iconSize: null,
              html: '',
            }),
            rotation: -45,
            draggable: true
          }).bindPopup('<pre>'+JSON.stringify(data.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');
        //},
        //onEachFeature: onEachFeature
        //if (data.properties.HP2 == undefined) {
          HP1.addLayer(marker);
        /*} else {
          HP3.addLayer(marker);
        }*/
      })
    })
    .catch(err => {
      console.log('> fetchRequest(), Error :', err);
    });


  new L.geoJSON(datas, {
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
  });

  function onEachFeature (feature, layer) {
    if (feature.properties.HP2 == undefined) {
      HP1.addLayer(layer);
    } else {
      HP3.addLayer(layer);
    }
    layer.bindPopup('<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');
  }

  HP1.addTo(map);

  // Show/Hide layer with zoom level
  map.on('zoomend', function () {
    if (map.getZoom() < zoomLevel && map.hasLayer(HP3)) {
        map.removeLayer(HP3);
        map.addLayer(HP1);
    }
    if (map.getZoom() > zoomLevel && map.hasLayer(HP3) == false) {
        map.removeLayer(HP1);
        map.addLayer(HP3);
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
  let data = await response.json()
  return data;
}
