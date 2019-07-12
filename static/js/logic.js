// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function getColor(d) {
  return d > 7 ? '#BF0066' :
         d > 6 ? '#C60C00' :
         d > 5 ? '#CE8900' :
         d > 4 ? '#9DD500' :
         d > 3 ? '#00CFDD' :
         d > 2 ? '#00E569' :
                  '#D3D3D3';
}

function chooseRadius(value) {
    return value * 18000
}

function createFeatures(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
          layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        },
        
        pointToLayer: function (feature, latlng) {
          return L.circle(latlng, {
            radius: chooseRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            fillOpacity: .7,
            color: "#000",
            stroke: true,
            weight: .7
        })
      }
      });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Street Map": streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [39.7392, -104.9903],
    zoom: 4,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 //Create a legend on the bottom left
 var legend = L.control({position: 'bottomright'});

 legend.onAdd = function(myMap){
   var div = L.DomUtil.create('div', 'info legend'),
     grades = [2, 3, 4, 5, 6, 7],
     labels = [];

// loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
 return div;
};

legend.addTo(myMap);
}
