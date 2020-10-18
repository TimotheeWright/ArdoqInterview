const loadMap = (station_informations, station_status) => {
    const getStationStatus = station_id => {
        return station_status.data.stations.find(station => station.station_id == station_id)
    }

    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
    ], (Map, MapView, Graphic, GraphicsLayer) => {
        const map = new Map({
            basemap: "topo-vector"
        });

        const view = new MapView({
            container: "map",
            map: map,
            center: [10.752, 59.923], // longitude, latitude

            zoom: 13
        });

        const popupTemplate = {
            title: "{station.name}",
            content: `
                I am located at <b>{station.address}</b>
                <br>
                Installed ? : {status.is_installed_string}
                <br>
                Bikes Available: {status.num_bikes_available}
                <br>
                Docks Available: {status.num_docks_available}
            `
        };

        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);

        station_informations.data.stations.forEach(station => {

            const attributes = {
                station: station,
                status: getStationStatus(station.station_id)
            };

            const point = {
                type: "point",
                longitude: station.lon,
                latitude: station.lat
            };

            if (attributes.status.is_installed)
            	attributes.status.is_installed_string = "Yes"
            else
            	attributes.status.is_installed_string = "No"

            let colorBikesAvailable = [255, 0, 0]; // red
            if (attributes.status.num_bikes_available > 2)
            colorBikesAvailable = [255, 165, 0];
            if (attributes.status.num_bikes_available > 10)
            colorBikesAvailable = [0, 255, 0];

            let colorDocksAvailable = [255, 0, 0]; // red
            if (attributes.status.num_docks_available > 2)
                colorDocksAvailable = [255, 165, 0];
            if (attributes.status.num_docks_available > 10)
                colorDocksAvailable = [0, 255, 0];

            const symbol = {
                type: "simple-marker",
                color: colorBikesAvailable,
                outline: {
                    color: colorDocksAvailable,
                    width: 4
                }
            };

            const pointGraphic = new Graphic({
                attributes: attributes,
                geometry: point,
                symbol: symbol,
                popupTemplate: popupTemplate
            });

            graphicsLayer.add(pointGraphic);
        })
    });
}

$.get("http://gbfs.urbansharing.com/oslobysykkel.no/station_information.json", function (station_informations) {
    $.get("http://gbfs.urbansharing.com/oslobysykkel.no/station_status.json", function (station_status) {
        loadMap(station_informations, station_status);
        $('#loader').fadeOut();
    });
});