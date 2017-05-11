var map;

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

    var neParksLayer = L.esri.featureLayer({
        url: 'https://maps.outdoornebraska.gov/arcgis/rest/services/OpenData/OpenDataLayers/MapServer/33',
        style: {color: 'green', weight: 1}
    });


    var iaTrailsLayer = L.esri.featureLayer({
        url: 'https://programs.iowadnr.gov/geospatial/rest/services/Recreation/Recreation/MapServer/7',
        where: "Hike = 'Y' or Hike = '1'",
        style: {color: 'black', dashArray: [5, 5], weight: 2}
    });

    var neTrailsLayer = L.esri.featureLayer({
        url: 'https://maps.outdoornebraska.gov/arcgis/rest/services/OpenData/OpenDataLayers/MapServer/31',
        where: "Type <> 'Water Trail'",
        style: {color: 'black', dashArray: [5, 5], weight: 2}
    });

    var localTrailsLayer = new L.GeoJSON.AJAX("data/trails.geojson",  {style: {color: 'black', dashArray: [5, 5], weight: 2}});

    map = L.map('map', {layers: [tnmLayer]}).setView([41.58, -95.89], 8);
 
    L.control.layers(baseMaps).addTo(map);
    iaParksLayer.addTo(map);
    neParksLayer.addTo(map);
    iaTrailsLayer.addTo(map);
    neTrailsLayer.addTo(map);
    localTrailsLayer.addTo(map);
}


