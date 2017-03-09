var trailsSource = new ol.source.Vector({
    url: "data/trails.geojson",
    format: new ol.format.GeoJSON()
});

var trailStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'rgba(0, 0, 0, 1)',
    width: 2.0,
    lineDash: [5, 5],      
  }),
});

var trailsLayer = new ol.layer.Vector({
    source: trailsSource,
    style: function(feature){
        return trailStyle;
    }
});

var neTrailsSource = new ol.source.Vector({
    url: "https://opendata.arcgis.com/datasets/8ad5f73cc4324bbaaf459362b6b880fc_31.geojson",
    format: new ol.format.GeoJSON()
});

var neTrailsLayer = new ol.layer.Vector({
    source: neTrailsSource,
    style: function(feature){
        return trailStyle;
    }
});

var esrijsonFormat = new ol.format.EsriJSON();
var iaTrailsSource = new ol.source.Vector({
loader: function(extent, resolution, projection) {
  var url = 'https://programs.iowadnr.gov/geospatial/rest/services/Recreation/Recreation/MapServer/7/query/?f=json&' +
      'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
      encodeURIComponent('{"xmin":' + extent[0] + ',"ymin":' +
	  extent[1] + ',"xmax":' + extent[2] + ',"ymax":' + extent[3] +
	  ',"spatialReference":{"wkid":102100}}') +
      '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
      '&outSR=102100&where=type%3D%27path%27';
  $.ajax({url: url, dataType: 'jsonp', success: function(response) {
    if (response.error) {
      alert(response.error.message + '\n' +
	  response.error.details.join('\n'));
    } else {
      // dataProjection will be read from document
      var features = esrijsonFormat.readFeatures(response, {
	featureProjection: projection
      });
      for (i in features) {
        if (features[i].getProperties()["Hike"] === "Y" || features[i].getProperties()["Hike"] === "1") {
          iaTrailsSource.addFeature(features[i]);
        }
      }
    }
  }});
},
strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
  tileSize: 512
}))
});

var iaTrailsLayer = new ol.layer.Vector({
    source: iaTrailsSource,
    style: function(feature){
        return trailStyle;
    }
});
