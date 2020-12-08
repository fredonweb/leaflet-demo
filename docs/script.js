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
  const zoomLevel = 16;
  const map = L.map('map').setView([45.780364, 4.89267], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 1,
    maxZoom: 20,
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

  var markerIcon0 = L.divIcon({
    className: 'markerStyle0',
    popupAnchor: [6, -14],
    iconSize: null,
    html: ''
  });
  var markerIcon1 = L.divIcon({
    className: 'markerStyle1',
    popupAnchor: [2, -14],
    iconSize: null,
    html: ''
  });

  const layer0 = new L.geoJSON(datas, {
    pointToLayer: function (feature, latlng) {
      if (feature.properties.HP2 == undefined) {
        return L.marker(latlng, {
          icon: markerIcon0,
          rotation: -45,
          draggable: true
        });
      };
    },
    onEachFeature: function (f, l) {
      l.bindPopup('<pre>'+JSON.stringify(f.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');
    }
  }).addTo(map);

  const layer = new L.geoJSON(datas, {
    pointToLayer: function (feature, latlng) {
      if (feature.properties.HP2 !== undefined) {
        return L.marker(latlng, {
          icon: markerIcon1,
          rotation: -45,
          draggable: true
        });
      };
    },
    onEachFeature: function (f, l) {
      l.bindPopup('<pre>'+JSON.stringify(f.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>');
    }
  });//.addTo(map);

  map.on('zoomend', function () {
    if (map.getZoom() < zoomLevel && map.hasLayer(layer)) {
        map.removeLayer(layer);
        map.addLayer(layer0);
    }
    if (map.getZoom() > zoomLevel && map.hasLayer(layer) == false)
    {
        map.removeLayer(layer0);
        map.addLayer(layer);
    }
  });

  /*var popup = L.popup();
  function onMapClick(e) {
      popup
          .setLatLng(e.latlng)
          .setContent(e.latlng.toString())
          .openOn(map);
  }

  map.on('click', onMapClick);*/
