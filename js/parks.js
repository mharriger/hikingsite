var esrijsonFormat = new ol.format.EsriJSON();
var iaPubLandSource = new ol.source.Vector({
loader: function(extent, resolution, projection) {
  var url = 'https://programs.iowadnr.gov/geospatial/rest/services/Recreation/Recreation/MapServer/10/query/?f=json&' +
      'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
      encodeURIComponent('{"xmin":' + extent[0] + ',"ymin":' +
	  extent[1] + ',"xmax":' + extent[2] + ',"ymax":' + extent[3] +
	  ',"spatialReference":{"wkid":102100}}') +
      '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
      '&outSR=102100';
  $.ajax({url: url, dataType: 'jsonp', success: function(response) {
    if (response.error) {
      alert(response.error.message + '\n' +
	  response.error.details.join('\n'));
    } else {
      // dataProjection will be read from document
      var features = esrijsonFormat.readFeatures(response, {
	featureProjection: projection
      });
      console.debug(features.length);
      if (features.length > 0) {
        iaPubLandSource.addFeatures(features);
      }
    }
  }});
},
strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
  tileSize: 512
}))
});

var iaPubLandLayer = new ol.layer.Vector({
source: iaPubLandSource,
style: function(feature){
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
	color: 'rgba(27, 191, 18, 1)',
	width: 1.0
      }),
      fill: new ol.style.Fill({
	color: 'rgba(178, 223, 138, .25)',  
      }),
});
}
})

var nePubLandSource = new ol.source.Vector({
loader: function(extent, resolution, projection) {
  var url = 'https://maps.outdoornebraska.gov/arcgis/rest/services/OpenData/OpenDataLayers/MapServer/33/query?f=json&' +
      'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
      encodeURIComponent('{"xmin":' + extent[0] + ',"ymin":' +
	  extent[1] + ',"xmax":' + extent[2] + ',"ymax":' + extent[3] +
	  ',"spatialReference":{"wkid":102100}}') +
      '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
      '&outSR=102100';
  $.ajax({url: url, dataType: 'jsonp', success: function(response) {
    if (response.error) {
      alert(response.error.message + '\n' +
	  response.error.details.join('\n'));
    } else {
      // dataProjection will be read from document
      var features = esrijsonFormat.readFeatures(response, {
	featureProjection: projection
      });
      console.debug(features.length);
      if (features.length > 0) {
	nePubLandSource.addFeatures(features);
      }
    }
  }});
},
strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
  tileSize: 512
}))
});

var nePubLandLayer = new ol.layer.Vector({
source: nePubLandSource,
style: function(feature){
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
	color: 'rgba(27, 191, 18, 1)',
	width: 1.0
      }),
      fill: new ol.style.Fill({
	color: 'rgba(178, 223, 138, .25)',  
      }),
});
}
})
