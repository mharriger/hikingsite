var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
}));


/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

selInteract = new ol.interaction.Select({
    layers: [iaPubLandLayer, nePubLandLayer, iaTrailsLayer, neTrailsLayer, trailsLayer],
});

selInteract.on('select', function(evt){
  var coordinate = evt.mapBrowserEvent.coordinate;
  var contentStr = "<p>";
  selLayer = evt.target.getLayer(evt.target.getFeatures().getArray()[0]);
  if (selLayer === iaTrailsLayer)
  {
    contentStr = contentStr.concat("Name: " + evt.target.getFeatures().getArray()[0].getProperties()["Name"] + '<br />');
    contentStr = contentStr.concat("Length (miles): " + evt.target.getFeatures().getArray()[0].getProperties()["Length_m"] + '<br />');
    contentStr = contentStr.concat("Uses: " + evt.target.getFeatures().getArray()[0].getProperties()["Rec_uses"] + '<br />');
  }
  else if (selLayer === neTrailsLayer)
  {
    contentStr = contentStr.concat("Name: " + evt.target.getFeatures().getArray()[0].getProperties()["TrailName"] + '<br />');
    contentStr = contentStr.concat("Length (" + + evt.target.getFeatures().getArray()[0].getProperties()["Length_Units"] + "): " + evt.target.getFeatures().getArray()[0].getProperties()["Length"] + '<br />');
  }
  else if (selLayer === trailsLayer)
  {
    contentStr = contentStr.concat("Name: " + evt.target.getFeatures().getArray()[0].getProperties()["name"] + '<br />');
  }
  else if (selLayer === iaPubLandLayer)
  {
    contentStr = contentStr.concat("Name: " + evt.target.getFeatures().getArray()[0].getProperties()["NameUnit"] + '<br />');
  }
  else if (selLayer === nePubLandLayer)
  {
    contentStr = contentStr.concat("Name: " + evt.target.getFeatures().getArray()[0].getProperties()["AreaName"] + '<br />');
  }
  else
  {
    for (i in evt.target.getFeatures().getArray()[0].getProperties()){
      contentStr = contentStr.concat(i + ": " + evt.target.getFeatures().getArray()[0].getProperties()[i] + '<br />');
    }
  }
  contentStr = contentStr.concat('</p>');
  content.innerHTML = contentStr;
  overlay.setPosition(coordinate);
});

