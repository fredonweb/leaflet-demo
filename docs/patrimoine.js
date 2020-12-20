// HP1 / HP2 / HP3
// Numero / rue / cp / localite
// Libellé
// Résidence familiale / étudiante / sociale
// Nom du gestionnaire
// Nombre de logements
// Nombre PLAI / PLUS / PLS
// Nombre Studio/T1/T2/T3/T4/T5
// Nombre de locataires / Répartition par classe d'âges
// Date de construction
// Date de conventionnement
// Proportion d'impayés
// Montant mensuel des loyers
// Travaux en cours

const debug = true;
const ouBatir = '[OuBatir]: ';

//
// Set map, layers and markers
const zoomLevel = 17;
const markerGroupHp1 = new L.layerGroup();
const markerGroupHp3 = new L.LayerGroup();
const url = 'https://fredonweb.github.io/leaflet-demo/patrimoine.geojson';
const map = L.map('map', {
  zoomSnap: 0.25,
  zoomDelta: 0.25,
  minZoom: 11,
  maxZoom: 19
});
const tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  minZoom: 1,
  maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Search control plugin
const searchControl = new L.Control.Search({
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

tile.addTo(map);
map.addControl( searchControl );

// Set hp levels view
const hpLevels = true;
if (!hpLevels) map.addLayer(markerGroupHp3);

//
// Resquest patrimoine.geojson
fetchRequest(url)
  .then(data => {
    _log('fetchRequest done,');
    _log('datas : ');
    if (debug) console.log(data.features);

    const markersLayer = new L.geoJSON(data.features, {
      pointToLayer: function (feature, latlng) {
        let markerCustomColour = 'rgba(255, 255, 255, .9)';
        if (feature.properties.NB_UG > 1) markerCustomColour = 'rgba(255, 255, 255, .6)';
        if (feature.properties.NB_UG > 5) markerCustomColour = 'rgba(255, 255, 255, .3)';
        if (feature.properties.NB_UG > 10) markerCustomColour = 'rgba(255, 255, 255, 0)';
        let markerStyle = 'markerStyle3';
        let insideMarkerStyle = `
          width: 18px;
          height: 18px;
          display: block;
          position: relative;
          transform: rotate(45deg);
          border-radius: 50%;
          border: 1px solid #FFFFFF;
          margin: 2px;
          background-color: ${markerCustomColour};`;
        let x = 2;
        let y = -14;
        let tooltipText = feature.properties.LIBELLE;
        let abbr = '';

        if (hpLevels && feature.properties.HP2 == '') {
          markerCustomColour = 'rgba(255, 255, 255, .5);';
          markerStyle = 'markerStyle1';
          insideMarkerStyle = `
            width: 22px;
            height: 22px;
            display: block;
            position: relative;
            transform: rotate(45deg);
            border-radius: 50%;
            border: 1px solid #FFFFFF;
            margin: 2px;
            padding: 1px 0 0 1px;
            background-color: ${markerCustomColour};
            color: rgba(0, 0, 0, .9);
            font-weight: 900;
            font-size: .8rem;`
          x = 0;
          y = -14;
          abbr = abbrev(feature.properties.LIBELLE);
        }
        if (feature.properties.LIBELLE == 'MULHOUSE') {
          markerStyle = 'markerStyle1';
          insideMarkerStyle = `
            width: 22px;
            height: 22px;
            display: block;
            position: relative;
            transform: rotate(45deg);
            border-radius: 50%;
            border: 2px solid ${markerCustomColour};
            margin: 2px;
            background-color: ${markerCustomColour};
            color: rgba(0, 0, 0, .9);
            font-weight: 900;
            font-size: .65rem;`
          x = 0;
          y = -14;
          abbr = '<i class="tiny material-icons">school</i>';
        }
        if (feature.properties.LIBELLE == 'MICHEL SERVET') {
          markerStyle = 'markerStyle1';
          insideMarkerStyle = `
            width: 22px;
            height: 22px;
            display: block;
            position: relative;
            transform: rotate(45deg);
            border-radius: 50%;
            border: 2px solid ${markerCustomColour};
            margin: 2px;
            background-color: ${markerCustomColour};
            color: rgba(0, 0, 0, .9);
            font-weight: 900;
            font-size: .65rem;`
          x = 0;
          y = -14;
          abbr = '<i class="tiny material-icons">hotel</i>';
        }
        return L.marker(latlng, {
          icon: L.divIcon({
            className: markerStyle,
            //iconAnchor: [0, 24],
            //labelAnchor: [-6, 0],
            popupAnchor: [x, y],
            iconSize: null,
            html: '<span style="' + insideMarkerStyle + '" />' + abbr + '</span>'
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

    map.fitBounds(markersLayer.getBounds(), {padding: [50, 50]});

    _log('load datas done');
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
  _log('fetchRequest datas...');
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

// Some util functions
function _log(msg) {
  if (debug) {
		console.log(ouBatir + msg);
	}
}

function abbrev(value) {
  let nb = value.split(' ');
  if (nb.length > 1) {
    var x = value.split(' ').map(function(item){return item[0]}).join('.');
  } else {
    x = value.substr(0, 2);
  }
  console.log(x);
  return x;
}
