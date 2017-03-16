var map;

function init() {
    var tnmSource = new ol.source.XYZ({
        url: "https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"
    });

    var tnmLayer = new ol.layer.Tile({source: tnmSource});


    map = new ol.Map({
        target: 'map',
        layers: [tnmLayer, iaPubLandLayer, nePubLandLayer, trailsLayer, neTrailsLayer, iaTrailsLayer],
	overlays: [overlay],
        view: new ol.View({
            center: [-10686671, 4984302],
            zoom: 8,
            maxZoom: 15,
        })
    });
    map.addInteraction(selInteract);
}


