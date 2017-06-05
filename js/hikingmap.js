var map;
var trailsGroup;
var topoTrailStyle = {color:'black', dashArray: [5, 5], weight: 2};
var imageTrailStyle = {color:'orange', dashArray: [5, 5], weight: 2};
var highlightTrailStyle = {color:'blue', weight: 8, opacity: 0.25};
var invisTrailStyle = {color:'blue', weight: 8, opacity: 0.0};
var currentStyle = topoTrailStyle;
var localTrailsLayer;

function init() {
    var tnmLayer = L.tileLayer('https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'USGS',
      maxZoom: 15,
    }
    );

    var esriImageryLayer = L.esri.basemapLayer("Imagery");
    var esriLabelsLayer = L.esri.basemapLayer("ImageryLabels");
    var esriTransLayer = L.esri.basemapLayer("ImageryTransportation");
    var esriImageryGroup = L.layerGroup([esriImageryLayer, esriTransLayer, esriLabelsLayer]);

    var baseMaps = {
        "Topo": tnmLayer,
        "Imagery": esriImageryGroup
    };


    var iaParksLayer = L.esri.featureLayer({
        url: 'https://programs.iowadnr.gov/geospatial/rest/services/Recreation/Recreation/MapServer/10',
        style: {color: 'green', weight: 1}
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
	iaTrailsLayerInvis.bringToFront();
	neTrailsLayerInvis.bringToFront();
	localTrailsLayerInvis.bringToFront();
    });

    var neParksLayer = L.esri.featureLayer({
        url: 'https://maps.outdoornebraska.gov/arcgis/rest/services/OpenData/OpenDataLayers/MapServer/33',
        style: {color: 'green', weight: 1}
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

    trailsGroup = L.layerGroup([iaTrailsLayer, neTrailsLayer, localTrailsLayer]);
    
    map = L.map('map', {layers: [tnmLayer]}).setView([41.58, -95.89], 8);
 
    L.control.layers(baseMaps).addTo(map);
    iaParksLayer.addTo(map);
    neParksLayer.addTo(map);
    iaTrailsLayer.addTo(map);
    iaTrailsLayerInvis.addTo(map);
    neTrailsLayer.addTo(map);
    neTrailsLayerInvis.addTo(map);
    localTrailsLayer.addTo(map);
    localTrailsLayerInvis.addTo(map);


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
    });
    
    var onTrailLayerClick = function(e) {
        iaTrailsLayerInvis.setStyle(invisTrailStyle);
        neTrailsLayerInvis.setStyle(invisTrailStyle);
        localTrailsLayerInvis.setStyle(invisTrailStyle);
        e.layer.setStyle(highlightTrailStyle);
        //TODO: Handle popup here so length can be calculated
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
        map.originalEvent.preventDefault();
    };

    iaTrailsLayerInvis.on('click', onTrailLayerClick);
    neTrailsLayerInvis.on('click', onTrailLayerClick);
    localTrailsLayerInvis.on('click', onTrailLayerClick);
}


