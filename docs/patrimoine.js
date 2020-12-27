// Gestion HP1 / HP3
// OVERLAYS http://plnkr.co/edit/cHPSLKDbltxr9jFZotOD?p=preview&preview
// https://stackoverflow.com/questions/32449111/set-different-l-divicon-style-depending-on-geojson-properties

// Global variables
const debug = true;
const ouBatir = '[OuBatir]: ';
const hpLevels = false;
const hpLevelsZoom = 17;
const markerGroupHp1 = new L.layerGroup();
const markerGroupHp3 = new L.LayerGroup();
const url = 'https://fredonweb.github.io/leaflet-demo/patrimoine.geojson';
//const url = 'http://srvssoikos/JSON/patrimoine.json'; //EMH srvssoikos

// Set map, layers and markers
const map = L.map('map', {
  zoomSnap: 0.25,
  zoomDelta: 0.5,
  minZoom: 11,
  maxZoom: 19,
  /* Del after update markers coords */
  center: [45.775377, 4.892275],
  zoom: 14
  /* ------------------------------- */
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

// Load map
tile.addTo(map);
map.addControl(searchControl);

// Set hpLevels view
if (!hpLevels) map.addLayer(markerGroupHp3);

function getColor(colorPalett, feature) {
  if (colorPalett == 'noColor') {
    var color = 'rgba(255, 255, 255, .5)';
  } else {
    color = 'rgba(255, 255, 255, .9)';
    if (feature.properties.NB_UG > 1) color = 'rgba(255, 255, 255, .6)';
    if (feature.properties.NB_UG > 5) color = 'rgba(255, 255, 255, .3)';
    if (feature.properties.NB_UG > 9) color = 'rgba(255, 255, 255, 0)';
    if (feature.properties.NB_UG > 19) color = 'rgba(132, 13, 90, 1)';
  }
  return color;
}

// Request patrimoine.geojson
fetchRequest(url)
  .then(data => {
    _log('fetchRequest done,');
    _log('datas : ');
    if (debug) console.log(data.features);

    const markersLayer = new L.geoJSON(data.features, {
      pointToLayer: function (feature, latlng) {
        let markerCustomColor = getColor('palett1', feature);
        let markerStyle = 'marker-style-medium';
        let markerStyleCenter = 'marker-style-center-medium';
        let markerStyleColor =  `background-color: ${markerCustomColor}`;
        let x = 2;
        let y = -14;
        let tooltipText = feature.properties.LIBELLE;
        let markerTextAbbr = '';

        if (hpLevels && feature.properties.HP2 == '') {
          markerCustomColor = getColor('noColor');
          markerStyle = 'marker-style-big';
          markerStyleCenter = 'marker-style-center-big';
          markerStyleColor =  `background-color: ${markerCustomColor}`;
          x = 0;
          y = -14;
          markerTextAbbr = abbrev(feature.properties.LIBELLE);
        }

        let marker =  L.marker(latlng, {
          icon: L.divIcon({
            className: 'marker-style-base ' + markerStyle,
            popupAnchor: [x, y],
            iconSize: null,
            html: '<span class="' + markerStyleCenter + '" style="' + markerStyleColor + '" /><p class="marker-style-text">' + markerTextAbbr + '</p></span>'
          }),
          rotation: -45,
          draggable: true,
          riseOnHover: true
        }).bindTooltip(tooltipText,{
            direction: 'top',
            sticky: true
          });
        return marker;
      },
      onEachFeature: onEachFeature
    });
    //map.fitBounds(markersLayer.getBounds(), {padding: [50, 50]});

    _log('load datas done');
  })
  .catch(err => {
    console.log(ouBatir + 'fetchRequest(), Error :', err);
  });

CanvasJS.addColorSet('customColorSet1',
  [
    '#8FAABB', '#3EA0DD', '#4661EE','#1BCDD1',
  ]
);
CanvasJS.addColorSet('customColorSet2',
  [
    '#FAA586','#EC5657','#F5A52A','#EB8CC6'
  ]
);

function onEachFeature (feature, layer) {
  let position = layer.getLatLng();
  let popupContent = setPopupContent(feature, position);

  if (hpLevels && feature.properties.HP2 == '') {
    markerGroupHp1.addLayer(layer);
    layer.bindPopup(popupContent, {className: 'une-Classe'});
  } else {
    if (feature.properties.HP2 !== '') markerGroupHp3.addLayer(layer);
    //popupContent = setPopupContent(feature, position);
    layer.bindPopup(popupContent, {className: 'une-Classe'});
    layer.on({
      click: function() {
        setChartColumn(feature);
        setChartDoughnut(feature);
      }
    });

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
  let popupContent = //'<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\},"]/g,'')+'</pre>' +
                     '<p><b>Résidence ' + feature.properties.LIBELLE + '</b></p>' +
                     '<div id="chartContainer1" style="height: 150px; max-width: 200px; margin: 0px auto;"></div><br />' +
                     '<div id="chartContainer2" style="height: 150px; max-width: 200px; margin: 0px auto;"></div><br />' +
                     '<p>Classe énergétique : <b>' + feature.properties.Classe_Energetique + '</b></p>'
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

// Set charts
function getValuesForChart(feature, name) {
  let JSON_Obj = feature.properties;
  let dps = [];
  for (let key in JSON_Obj) {
    for (let j = 0; j < name.length; j++) {
      if (key == name[j] && JSON_Obj[key] > 0 ) {
        dps.push({y: Number(JSON_Obj[key]), label: name[j]});
      }
    }
  }
  return dps;
}

function setChartColumn(feature) {
  let name = ['Studio', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6&+'];
  let dps = getValuesForChart(feature, name);
  if (dps.length === 0) {
    document.getElementById('chartContainer1').style.height = "1px";
    return;
  }

  let chart = new CanvasJS.Chart('chartContainer1', {
    animationEnabled: true,
    animationDuration: 250,
    colorSet: 'customColorSet1',
    title:{
      text: 'Granulométrie',
      fontFamily: 'Lato',
      fontWeight: 'bold',
      fontSize: 14
	  },
    data: [{
      type: 'column',
      indexLabel: '{y}',
      indexLabelPlacement: 'inside',
      indexLabelOrientation: 'horizontal',
      indexLabelFontSize: 12,
      dataPoints: dps
    }]
  });
  chart.render();
}

function setChartDoughnut(feature){
  let name = ['PLAI', 'PLUS', 'PLS'];
  let dps = getValuesForChart(feature, name);
  if (dps.length === 0) {
    document.getElementById('chartContainer2').style.height = "1px";
    return;
  }
  let chart = new CanvasJS.Chart('chartContainer2', {
    animationEnabled: true,
    animationDuration: 250,
    colorSet: 'customColorSet2',
    title:{
      text: 'Conventionnement',
      fontFamily: 'Lato',
      fontWeight: 'bold',
      fontSize: 14
	  },
    data: [{
      type: 'doughnut',
      indexLabelFontSize: 12,
      indexLabel: '{y} {label} (#percent%)',
      toolTipContent: '<b>{y} {label}</b> - #percent%',
      dataPoints: dps
    }]
  });
  chart.render();
}

// Show/Hide layers with zoom level
map.on('zoomend', function () {
  if (hpLevels) {
    if (map.getZoom() < hpLevelsZoom) {
      map.removeLayer(markerGroupHp3);
      map.addLayer(markerGroupHp1);
    }
    if (map.getZoom() > hpLevelsZoom) {
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
  return x;
}


/*if (feature.properties.LIBELLE == 'MULHOUSE') {
  markerStyle = 'markerStyle1';
  markerStyleCenter = `
    width: 22px;
    height: 22px;
    border: 1px solid #FFFFFF;
    margin: 2px;
    padding: 0px 0 0 0px;
    background-color: ${markerCustomColor}`;
  x = 0;
  y = -14;
  markerTextAbbr = '<i class="tiny material-icons">school</i>';
}*/

/*markerStyleCenter = `
  width: 22px;
  height: 22px;
  border: 1px solid #FFFFFF;
  background-color: ${markerCustomColor}`;*/

/*
const overlays = {};
if (!overlays.hasOwnProperty(feature.properties.LIBELLE)) {
  overlays[feature.properties.LIBELLE] = new L.LayerGroup().addTo(map);
}
if (hpLevels && feature.properties.HP2 == '') {
  marker.addTo(overlays[feature.properties.LIBELLE]);
}
new L.Control.Layers(null, overlays, { collapsed: false }).addTo(map);
*/
