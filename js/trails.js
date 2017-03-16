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

var hideStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'rgba(0, 0, 0, 0)',
    width: 0.0,
  }),
});

var trailsLayer = new ol.layer.Vector({
    source: trailsSource,
    maxResolution: 150,
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
    maxResolution: 150,
    style: function(feature){
      if (feature.getProperties()["Type"] !== "Water Trail"){
        return trailStyle;
      }
      else {
        return hideStyle;
      }
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
    maxResolution: 150,
    style: function(feature){
        return trailStyle;
    }
});

iaTrailsSel = new ol.interaction.Select({
    layers: [iaTrailsLayer],
});

iaTrailsSel.on('select', function(evt){
  var coordinate = evt.mapBrowserEvent.coordinate;
  var contentStr = "<p>";
  contentStr = contentStr.concat("Name: " + evt.target.getFeatures().getArray()[0].getProperties()["Name"] + '<br />');
  contentStr = contentStr.concat("Length (miles): " + evt.target.getFeatures().getArray()[0].getProperties()["Length_m"] + '<br />');
  contentStr = contentStr.concat("Uses: " + evt.target.getFeatures().getArray()[0].getProperties()["Rec_uses"] + '<br />');
  contentStr = contentStr.concat('</p>');
  content.innerHTML = contentStr;
  overlay.setPosition(coordinate);
});

neTrailsSel = new ol.interaction.Select({
    layers: [neTrailsLayer],
});

neTrailsSel.on('select', function(evt){
  var coordinate = evt.mapBrowserEvent.coordinate;
  var contentStr = "<p>";
  contentStr = contentStr.concat("Name: " + evt.target.getFeatures().getArray()[0].getProperties()["TrailName"] + '<br />');
  contentStr = contentStr.concat("Length (" + + evt.target.getFeatures().getArray()[0].getProperties()["Length_Units"] + "): " + evt.target.getFeatures().getArray()[0].getProperties()["Length"] + '<br />');
  contentStr = contentStr.concat('</p>');
  content.innerHTML = contentStr;
  overlay.setPosition(coordinate);
});

trailsSel = new ol.interaction.Select({
    layers: [trailsLayer],
});

trailsSel.on('select', function(evt){
  var coordinate = evt.mapBrowserEvent.coordinate;
  var contentStr = "<p>";
  contentStr = contentStr.concat("Name: " + evt.target.getFeatures().getArray()[0].getProperties()["Name"] + '<br />');
  contentStr = contentStr.concat('</p>');
  content.innerHTML = contentStr;
  overlay.setPosition(coordinate);
});
