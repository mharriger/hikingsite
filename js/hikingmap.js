var map;
var trailsGroup;
var topoTrailStyle = {color:'black', dashArray: [5, 5], weight: 2};
var imageTrailStyle = {color:'orange', dashArray: [5, 5], weight: 2};
var highlightTrailStyle = {color:'blue', dashArray: [5, 5], weight: 2};
var currentStyle = topoTrailStyle;

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

    iaTrailsLayer.bindPopup(function (layer) {
        return L.Util.template('<p>{Name}</p>', layer.feature.properties);
    });

    var neTrailsLayer = L.esri.featureLayer({
        url: 'https://maps.outdoornebraska.gov/arcgis/rest/services/OpenData/OpenDataLayers/MapServer/31',
        where: "Type <> 'Water Trail'",
        style: topoTrailStyle
    });

    neTrailsLayer.bindPopup(function (layer) {
        return L.Util.template('<p>{TrailName}</p>', layer.feature.properties);
    });

    var localTrailsLayer = new L.GeoJSON.AJAX("data/trails.geojson",  {style: topoTrailStyle});

    localTrailsLayer.bindPopup(function (layer) {
        return L.Util.template('<p>{name}</p>', layer.feature.properties);
    });

    trailsGroup = L.layerGroup([iaTrailsLayer, neTrailsLayer, localTrailsLayer]);
    
    map = L.map('map', {layers: [tnmLayer]}).setView([41.58, -95.89], 8);
 
    L.control.layers(baseMaps).addTo(map);
    iaParksLayer.addTo(map);
    neParksLayer.addTo(map);
    iaTrailsLayer.addTo(map);
    neTrailsLayer.addTo(map);
    localTrailsLayer.addTo(map);


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
        iaTrailsLayer.setStyle(currentStyle);
        neTrailsLayer.setStyle(currentStyle);
        localTrailsLayer.setStyle(currentStyle);
    });
    
    var onTrailLayerClick = function(e) {
        iaTrailsLayer.setStyle(currentStyle);
        neTrailsLayer.setStyle(currentStyle);
        localTrailsLayer.setStyle(currentStyle);
        e.layer.setStyle(highlightTrailStyle);
        //TODO: Handle popup here so length can be calculated
    };

    iaTrailsLayer.on('click', onTrailLayerClick);
    neTrailsLayer.on('click', onTrailLayerClick);
    localTrailsLayer.on('click', onTrailLayerClick);

}


