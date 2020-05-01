//const API_KEY="pk.eyJ1Ijoic2hhZGkwaXIiLCJhIjoiY2s4MXY3NW40MHVrbTNtcnkxdjl1aWhrcSJ9.cHcNw2uazJ5pDfJtpot0UA"
// Set up variables for our tile layers
const Grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: "pk.eyJ1Ijoic2hhZGkwaXIiLCJhIjoiY2s4MXY3NW40MHVrbTNtcnkxdjl1aWhrcSJ9.cHcNw2uazJ5pDfJtpot0UA"
});
const Outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: "pk.eyJ1Ijoic2hhZGkwaXIiLCJhIjoiY2s4MXY3NW40MHVrbTNtcnkxdjl1aWhrcSJ9.cHcNw2uazJ5pDfJtpot0UA"
});
const Satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: "pk.eyJ1Ijoic2hhZGkwaXIiLCJhIjoiY2s4MXY3NW40MHVrbTNtcnkxdjl1aWhrcSJ9.cHcNw2uazJ5pDfJtpot0UA"
});
// Create the fault line and earthquake layers
let fault_lines = new L.LayerGroup();
let earthquakes = new L.LayerGroup();
// Create a baseMaps object to contain the Satellite,Grayscale and outdoors
let baseLayers = {
    "Satellite": Satellite,
    "Grayscale": Grayscale,
    "Outdoors": Outdoors 
}
// Create an overlayMaps object here to contain the "Fault lines" and "Earthquakes"
let overLayers = {
    "Fault lines": fault_lines,
    "Earthquakes": earthquakes
}
// Set up map using map library 
const myMap = L.map("map", {
    center: [36.778259, -110.417931],
    zoom: 5,
    layers: [Grayscale, Satellite, Outdoors]
});
// Set up layer control, containing our baseMaps and overlayMaps, and add them to the map
L.control.layers(baseLayers, overLayers).addTo(myMap);

// Store earthquake geoJSON data.
const geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
d3.json(geoData, function(data) {
    console.log("response data", data);
    L.geoJson(data, {
        pointToLayer: function(features, coordinates) {
            return L.circleMarker(coordinates);
        },
        style: function(features) {        
            return {
                opacity: 1,
                fillOpacity: 1,
                fillColor: getColor(features.properties.mag),
                color: "#000000",
                radius: getRadius(features.properties.mag),
                stroke: true,
                weight: 0.5
            };
        },
        onEachFeature: function(features, layer) {
            layer.bindPopup("Magnitude: " + features.properties.mag + "<br>Location: " + features.properties.place);
        }
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);
    // Define the color of the marker based on the magnitude of the earthquake.
    function getColor(magnitude) {
        switch (true) {
        case magnitude > 5:
            return "#FF4500";
        case magnitude > 4:
            return "#FF8C00";
        case magnitude > 3:
            return "#FFA500";
        case magnitude > 2:
            return "#FFD700";
        case magnitude > 1:
            return "#F0E68C";
        default:
            return "#ADFF2F";
        }
    }
    // define the radius of the earthquake marker based on its magnitude.
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 3;
    }
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let range = [0, 1, 2, 3, 4, 5];
        let colors = ["#ADFF2F", "#F0E68C", "#FFD700", "#FFA500", "#FF8C00", "#FF4500"];
        for (var i = 0; i < range.length; i++) {
            div.innerHTML +=
              "<i style='background: " + colors[i] + "'></i> " +
              range[i] + (range[i + 1] ? "&ndash;" + range[i + 1] + "<br>" : "+");
          }
          return div;
      
    };
    legend.addTo(myMap);
    // retrive Tectonic Plate geoJSON data.
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
        L.geoJson(platedata, {
            color: "orange",
            weight: 2
        }).addTo(fault_lines);
        // add the tectonicplates layer to the map.
        fault_lines.addTo(myMap);
    });
});