const loadMap = (station_informations, station_status) => {
    const getStationStatus = station_id => {
        return station_status.data.stations.find(station => station.station_id == station_id)
    }

    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/Graphic",
        "esri/layers/FeatureLayer",
        "esri/symbols/PictureMarkerSymbol",
        "esri/layers/support/FeatureReductionCluster",
        "esri/widgets/Search",
    ], (Map, MapView, Graphic, FeatureLayer, PictureMarkerSymbol,FeatureReductionCluster, Search) => {
        const map = new Map({
            basemap: "topo-vector"
        });

        const view = new MapView({
            container: "map",
            map: map,
            center: [10.738411, 59.908908], // longitude, latitude

            zoom: 15
        });

        // popup that appears when user clicks on a marker
        const popupTemplate = {
            title: "Station Name: {NAME}",
            content: `
                I am located at <b>{address}</b>
                <br>
                Installed ? : {is_installed_string}
                <br>
                Bikes Available: {num_bikes}
                <br>
                Docks Available: {num_docks}
            `
        };

 		// marker clustering
        const clusterConfig = {
			  type: "cluster",
			  clusterRadius: "40px",
			  popupTemplate: {
			    content: "There is {cluster_count} stations there."
			  },
			  // You should adjust the clusterMinSize to properly fit labels
			  clusterMinSize: "20px",
			  clusterMaxSize: "40px",
			  labelingInfo: [{
			    // turn off deconfliction to ensure all clusters are labeled
			    deconflictionStrategy: "none",
			    labelExpressionInfo: {
			      expression: "Text($feature.cluster_count, '#,###')"
			    },
			    symbol: {
			      type: "text",
			      color: "#004a5d",
			      font: {
			        weight: "bold",
			        family: "Noto Sans",
			        size: "12px"
			      }
			    },
			    labelPlacement: "center-center",
			  }]
		};

		function getCircle(color) {
			return {
				type: "simple-marker",
				style: "circle",
				size: "20px",  // pixels
				color: color
			}
		}

		const bikesRenderer = {
			type: "unique-value",  // autocasts as new UniqueValueRenderer()
			field: "bikes_quantity",
			uniqueValueInfos: [{
				// All features with value of "North" will be blue
				value: "low",
				symbol: getCircle("#ff0000")
			}, {
				// All features with value of "East" will be green
				value: "medium",
				symbol: getCircle("#ffa500")
			}, {
				// All features with value of "South" will be red
				value: "high",
				symbol: getCircle("#00ff00")
			}]
		};

		const docksRenderer = {
			type: "unique-value",  // autocasts as new UniqueValueRenderer()
			field: "docks_quantity",
			uniqueValueInfos: [{
				// All features with value of "North" will be blue
				value: "low",
				symbol: {
					type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
					color: "#ff0000"
				}
			}, {
				// All features with value of "East" will be green
				value: "medium",
				symbol: {
					type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
					color: "#ffa500"
				}
			}, {
				// All features with value of "South" will be red
				value: "high",
				symbol: {
					type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
					color: "#00ff00"
				}
			}]
		};

		let graphics = [];
        station_informations.data.stations.forEach(station => {

        	const status = getStationStatus(station.station_id);

        	if (status.is_installed)
            	status.is_installed_string = "Yes"
            else
            	status.is_installed_string = "No"

            status.bikes_quantity = "low"
            if (status.num_bikes_available > 2)
            	status.bikes_quantity = "medium"
            if (status.num_bikes_available > 10)
            	status.bikes_quantity = "high"

            status.docks_quantity = "low"
            if (status.num_docks_available > 2)
            	status.docks_quantity = "medium"
            if (status.num_docks_available > 10)
            	status.docks_quantity = "high"



            const attributes = {
            	ObjectID: station.station_id,
                //station: station,
                NAME: station.name,
                address: station.address,
                num_bikes: status.num_bikes_available,
                num_docks: status.num_docks_available,
                bikes_quantity: status.bikes_quantity,
                docks_quantity: status.docks_quantity,
                is_installed_string: status.is_installed_string
            };

            const point = {
                type: "point",
                longitude: station.lon,
                latitude: station.lat
            };


            const graphic = new Graphic({
                attributes: attributes,
                geometry: point
            });

            graphics.push(graphic);
        })

		const fields = [{
				name: "ObjectID",
				alias: "ObjectID",
				type: "oid"
			},
			{
				name: "NAME",
				alias: "NAME",
				type: "string"
			},
			{
				name: "address",
				alias: "address",
				type: "string"
			},
			{
				name: "num_bikes",
				alias: "num_bikes",
				type: "integer"
			},
			{
				name: "num_docks",
				alias: "num_docks",
				type: "integer"
			},
			{
				name: "bikes_quantity",
				alias: "bikes_quantity",
				type: "string"
			},
			{
				name: "docks_quantity",
				alias: "docks_quantity",
				type: "string"
			},
			{
				name: "is_installed_string",
				alias: "is_installed_string",
				type: "string"
			}]

		const flBikes = new FeatureLayer({
			source: graphics,
			renderer: bikesRenderer,
			objectIDField: "ObjectID",
			fields: fields,
			outFields: ["ObjectID", "NAME","address", "num_bikes", "num_docks","bikes_quantity","docks_quantity", "is_installed_string"],
			popupTemplate: popupTemplate,
			featureReduction: clusterConfig
		});

		const flDocks = new FeatureLayer({
			visible: false,
			source: graphics,
			renderer: docksRenderer,
			objectIDField: "ObjectID",
			fields: fields,
			outFields: ["ObjectID", "NAME","address", "num_bikes", "num_docks","bikes_quantity","docks_quantity", "is_installed_string"],
			popupTemplate: popupTemplate,
			featureReduction: clusterConfig
		});

		map.add(flBikes);
		map.add(flDocks);

		const searchWidget = new Search({
			view: view,
			sources: [{
				layer: flBikes,
				searchFields: ["NAME"],
				suggestionTemplate: "{NAME}",
				exactMatch: false,
				outFields: ["NAME", "address", "is_installed_string", "num_bikes", "num_docks"],
				placeholder: "Enter the name of a station"
			}],
			includeDefaultSources: false
		});
       
		view.ui.add([searchWidget],{ 
			position: "manual"
		});
        	

        const bikesLayerToggle = document.getElementById("bikesLayer");
        const docksLayerToggle = document.getElementById("docksLayer");

        bikesLayerToggle.addEventListener("change", function () {
          flBikes.visible = bikesLayerToggle.checked;
          flDocks.visible = docksLayerToggle.checked;
        });

        docksLayerToggle.addEventListener("change", function () {
          flBikes.visible = bikesLayerToggle.checked;
          flDocks.visible = docksLayerToggle.checked;
        });
    });
}

$.get("http://gbfs.urbansharing.com/oslobysykkel.no/station_information.json", function (station_informations) {
    $.get("http://gbfs.urbansharing.com/oslobysykkel.no/station_status.json", function (station_status) {
        loadMap(station_informations, station_status);
        $('#menu').fadeIn();
        $('#loader').fadeOut();
    });
});