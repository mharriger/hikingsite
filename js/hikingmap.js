var map;
var trailsGroup;
var trailsGroupInvis;
var parksGroup;
var localTrailsLayer;
var lhhtLegend;
var esriTransLayer;

//Styles
var topoTrailStyle = {color:'black', dashArray: [5, 5], weight: 2};
var imageTrailStyle = {color:'orange', dashArray: [5, 5], weight: 2};
var highlightTrailStyle = {color:'blue', weight: 8, opacity: 0.25};
var invisTrailStyle = {color:'blue', weight: 8, opacity: 0.0};
var lhhtExistStyle = {color:'blue', dashArray: [1, 5], weight: 3};
var lhhtRoadStyle = {color:'red', dashArray: [1, 5], weight: 3};
var lhhtFutureTrailStyle = {color:'#09b1ff', dashArray: [1, 5], weight: 3};
var currentStyle = topoTrailStyle;
var lhhtLayerGroup;


function init() {
    var lhhtLayer;
    var tnmLayer = L.tileLayer('https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'USGS',
      maxZoom: 15,
    }
    );

    var esriImageryLayer = L.esri.basemapLayer("Imagery");
    var esriLabelsLayer = L.esri.basemapLayer("ImageryLabels");
    esriTransLayer = L.esri.basemapLayer("ImageryTransportation");
    var esriImageryGroup = L.layerGroup([esriImageryLayer, esriTransLayer, esriLabelsLayer]);

    var baseMaps = {
        "Topo": tnmLayer,
        "Imagery": esriImageryGroup
    };

    var iaParksLayer = L.esri.featureLayer({
        url: 'https://programs.iowadnr.gov/geospatial/rest/services/Recreation/Recreation/MapServer/10',
        style: {color: 'green', weight: 1},
        onEachFeature: function (feature, layer) {
            layer.bindTooltip(feature.properties['NameUnit'], { 'noHide': true });
        }
    });

    var hide;
    iaParksLayer.on('load', function(e) {
        var nameGeoDict = {};
        iaParksLayer.eachFeature(function(layer) {
            hide = 0;
            if (layer.feature.properties.NameUnit in nameGeoDict) {
                if (nameGeoDict[layer.feature.properties.NameUnit].indexOf(layer.feature.properties['Shape.area']) > 0) {
                    iaParksLayer.setFeatureStyle(layer.feature.id, {stroke: false, fill: false})
                    hide = 1;
                }
            }
            else {
                nameGeoDict[layer.feature.properties.NameUnit] = [];
            }
            if (!hide) {
                nameGeoDict[layer.feature.properties.NameUnit].push(layer.feature.properties['Shape.area']);
            }
        })
        map.removeLayer(trailsGroupInvis);
        map.addLayer(trailsGroupInvis);
        if (map.hasLayer(lhhtLayer)) {
            map.removeLayer(lhhtLayerGroup);
            map.addLayer(lhhtLayerGroup);
        }
    });

    var neParksLayer = L.esri.featureLayer({
        url: 'https://maps.outdoornebraska.gov/arcgis/rest/services/OpenData/OpenDataLayers/MapServer/33',
        style: {color: 'green', weight: 1},
        onEachFeature: function (feature, layer) {
            layer.bindTooltip(feature.properties['AreaName'], { 'noHide': true });
        }
    });

    neParksLayer.on('load', function(e) {
        map.removeLayer(trailsGroupInvis);
        map.addLayer(trailsGroupInvis);
        if (map.hasLayer(lhhtLayer)) {
            map.removeLayer(lhhtLayerGroup);
            map.addLayer(lhhtLayerGroup);
        }
    });

    var iaTrailsLayer = L.esri.featureLayer({
        url: 'https://programs.iowadnr.gov/geospatial/rest/services/Recreation/Recreation/MapServer/7',
        where: "Hike = 'Y' or Hike = '1'",
        style: topoTrailStyle
    });

    iaTrailsLayerInvis  = L.esri.featureLayer({
        url: 'https://programs.iowadnr.gov/geospatial/rest/services/Recreation/Recreation/MapServer/7',
        where: "Hike = 'Y' or Hike = '1'",
        style: invisTrailStyle
    });

    var neTrailsLayer = L.esri.featureLayer({
        url: 'https://maps.outdoornebraska.gov/arcgis/rest/services/OpenData/OpenDataLayers/MapServer/31',
        where: "Type <> 'Water Trail'",
        style: topoTrailStyle
    });

    neTrailsLayerInvis = L.esri.featureLayer({
        url: 'https://maps.outdoornebraska.gov/arcgis/rest/services/OpenData/OpenDataLayers/MapServer/31',
        where: "Type <> 'Water Trail'",
        style: invisTrailStyle
    });

    localTrailsLayer = new L.GeoJSON.AJAX("data/trails.geojson",  {style: topoTrailStyle});
    localTrailsLayerInvis = new L.GeoJSON.AJAX("data/trails.geojson",  {style: invisTrailStyle});

    lhhtStyleFunc = function(feature) {
        if (feature.properties["type"] == "road") {
            return lhhtRoadStyle;
        }
        else {
            if (feature.properties["existing"] == 1) {
               return lhhtExistStyle;
            }
            else {
                return lhhtFutureTrailStyle;
            }
        }
    };

    if (location.toString().search("lhht=yes") > 0) {
        lhhtLayer = new L.GeoJSON.AJAX("data/lhht.geojson",  {style: lhhtStyleFunc});
        lhhtLayerInvis = new L.GeoJSON.AJAX("data/lhht.geojson",  {style: invisTrailStyle});
        lhhtLayerGroup = new L.layerGroup([lhhtLayer, lhhtLayerInvis]);
    }

    trailsGroup = L.layerGroup([iaTrailsLayer, neTrailsLayer, localTrailsLayer]);
    trailsGroupInvis = L.layerGroup([iaTrailsLayerInvis, neTrailsLayerInvis, localTrailsLayerInvis]);
    parksGroup = L.layerGroup([neParksLayer, iaParksLayer]);
    
    map = L.map('map', {layers: [tnmLayer]}).setView([41.58, -95.89], 8);
 
    var overlays;
    if (lhhtLayerGroup) {
    	overlays = {"Proposed LHHT Route": lhhtLayerGroup};
    }

    iaParksLayer.addTo(map);
    neParksLayer.addTo(map);
    iaTrailsLayer.addTo(map);
    iaTrailsLayerInvis.addTo(map);
    neTrailsLayer.addTo(map);
    neTrailsLayerInvis.addTo(map);
    localTrailsLayer.addTo(map);
    localTrailsLayerInvis.addTo(map);
    if (lhhtLayerGroup) {
        lhhtLayerGroup.addTo(map);
    }
    L.control.layers(baseMaps, overlays).addTo(map);


    map.on('baselayerchange', function(e) {
        if (e.name == "Imagery") {
            iaTrailsLayer.setStyle(imageTrailStyle);
            neTrailsLayer.setStyle(imageTrailStyle);
            localTrailsLayer.setStyle(imageTrailStyle);
            currentStyle = imageTrailStyle;
        }
        else {
            iaTrailsLayer.setStyle(topoTrailStyle);
            neTrailsLayer.setStyle(topoTrailStyle);
            localTrailsLayer.setStyle(topoTrailStyle);
            currentStyle = topoTrailStyle;
        }
    });

    map.on('click', function(e) {
        iaTrailsLayerInvis.setStyle(invisTrailStyle);
        neTrailsLayerInvis.setStyle(invisTrailStyle);
        localTrailsLayerInvis.setStyle(invisTrailStyle);
        if (lhhtLayerGroup) {
            lhhtLayerInvis.setStyle(invisTrailStyle);
        }
    });
    
    var onTrailLayerClick = function(e) {
        iaTrailsLayerInvis.setStyle(invisTrailStyle);
        neTrailsLayerInvis.setStyle(invisTrailStyle);
        localTrailsLayerInvis.setStyle(invisTrailStyle);
        if (lhhtLayerGroup) {
            lhhtLayerInvis.setStyle(invisTrailStyle);
        }
        e.layer.setStyle(highlightTrailStyle);
        var popup = L.popup()
            .setLatLng(e.latlng)
        if (e.target === iaTrailsLayerInvis) {
            popup.setContent(L.Util.template('<p>{Name}<br>{Length_m} miles</p>', e.layer.feature.properties));
        }
        else if (e.target === neTrailsLayerInvis) {
            var length = e.layer.feature.properties["Length"].toFixed(2)
            popup.setContent(L.Util.template('<p>{TrailName}<br>{Length_Rounded} {Length_Units}</p>', jQuery.extend(e.layer.feature.properties, {Length_Rounded:length})));
        }
        else if (e.target === localTrailsLayerInvis) {
            popup.setContent(L.Util.template('<p>{name}<br>{Length_mi} miles</p>', e.layer.feature.properties));
        }
        popup.openOn(map);
        L.DomEvent.stopPropagation(e);
    };

    var onLHHTLayerClick = function(e) {
        iaTrailsLayerInvis.setStyle(invisTrailStyle);
        neTrailsLayerInvis.setStyle(invisTrailStyle);
        localTrailsLayerInvis.setStyle(invisTrailStyle);
        if (lhhtLayerGroup) {
            lhhtLayerInvis.setStyle(invisTrailStyle);
        }
        e.layer.setStyle(highlightTrailStyle);
        var popup = L.popup()
            .setLatLng(e.latlng);
        if (e.layer.feature.properties["type"] == "trail" && e.layer.feature.properties["existing"] == 1) {
            popup.setContent(L.Util.template('<p><b>Proposed LHHT Route</b></br>Type: existing {type}<br>{length_mi} miles</p>', e.layer.feature.properties));
        }
        else if (e.layer.feature.properties["type"] == "trail" && e.layer.feature.properties["existing"] == 0) {
            popup.setContent(L.Util.template('<p><b>Proposed LHHT Route</b></br>Type: new {type}<br>{length_mi} miles</p>', e.layer.feature.properties));
        }
        else {
            popup.setContent(L.Util.template('<p><b>Proposed LHHT Route</b></br>Type: {type}<br>{length_mi} miles</p>', e.layer.feature.properties));
        }
        popup.openOn(map);
        L.DomEvent.stopPropagation(e);
    };

    iaTrailsLayerInvis.on('click', onTrailLayerClick);
    neTrailsLayerInvis.on('click', onTrailLayerClick);
    localTrailsLayerInvis.on('click', onTrailLayerClick);
    if (lhhtLayerGroup) {
        lhhtLayerInvis.on('click', onLHHTLayerClick);
    }


    //Legend for LHHT
    lhhtLegend = L.control({position: 'bottomright'});

    lhhtLegend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend leaflet-bar');
        div.innerHTML = '<p><h4>LHHT Legend</h4><br><svg width="20" height = "10"><line x1="2" y1="5" x2="15" y2="5" stroke="red" stroke-width="3" stroke-dasharray="1, 5" stroke-linecap="round" /></svg>Roadwalk<br><svg width="20" height = "10"><line x1="2" y1="5" x2="15" y2="5" stroke="blue" stroke-width="3" stroke-dasharray="1, 5" stroke-linecap="round" /></svg>Existing Trail<br><svg width="20" height = "10"><line x1="2" y1="5" x2="15" y2="5" stroke="#09b1ff" stroke-width="3" stroke-dasharray="1, 5" stroke-linecap="round" /></svg>New Trail</p>';

        return div;
    };
    //
    //Disclaimer for LHHT
    lhhtWarning = L.control({position: 'bottomleft'});

    lhhtWarning.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info warning leaflet-bar');
        div.innerHTML = '<p><h4>Important Note</h4><br>The Loess Hills Hiking Trail route presented here is a concept intended for inspiration, it is not a real hiking trail yet. Errors may be present in the route, and some of the roads included may not be suitable for pedestrian use. Hiking any portion of the LHHT route presented here is done at your own risk, and should be undertaken only after independent confirmation of the existence and suitability of trails, and of access rights to the land areas in question.</p>';

        return div;
    };

    if (lhhtLayerGroup) {
        lhhtLegend.addTo(map);
        lhhtWarning.addTo(map);
        map.on('overlayadd', function(e) {
            if (e.layer == lhhtLayerGroup) {
                lhhtLegend._container.style["display"] = "block";
                lhhtWarning._container.style["display"] = "block";
            }
        });
        map.on('overlayremove', function(e) {
            if (e.layer == lhhtLayerGroup) {
                lhhtLegend._container.style["display"] = "none";
                lhhtWarning._container.style["display"] = "none";
            }
        });
    }

}


