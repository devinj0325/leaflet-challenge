// Store API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // streetmap layer
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  // darkmap layer
  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  //Array that holds all circles
  var myCircleArray = new Array();

  // Loop through the cities array 
  for (var i = 0; i < earthquakeData.length; i++) {

    coordinates = [earthquakeData[i].geometry.coordinates[1],earthquakeData[i].geometry.coordinates[0]]
    properties = earthquakeData[i].properties;

    var color = "#d7191c";
    if (properties.mag < 1) {
      color = "#00ccbc";
    }
    else if (properties.mag < 2) {
      color = "#90eb9d";
    }
    else if (properties.mag < 3) {
      color = "#f9d057";
    }
    else if (properties.mag < 4) {
      color = "#f29e2e";
    }
    else if (properties.mag < 5) {
      color = "#e76818";
    }

    // Add circles to map
    var myCircle = L.circle(coordinates, {
      fillOpacity: 0.75,
     
      color: color,
      fillColor: color,
      
      radius: (properties.mag * 15000)
    }).bindPopup("<h1>" + properties.place + "</h1> <hr> <h3>Magnitud: " + properties.mag.toFixed(2) + "</h3>");
   
    myCircleArray.push(myCircle);
  }

  //Create the layer for the circles
  var earthquakes = L.layerGroup(myCircleArray);

  // Define a baseMaps object to hold base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Add the layer to the map
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap,earthquakes]
  });

  // Create a layer control

  L.control.layers(baseMaps,overlayMaps, {
     collapsed: false
  }).addTo(myMap);

  //create the legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  	var div = L.DomUtil.create('div', 'info legend');
  	var grades = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
    var color = ["#00ccbc","#90eb9d","#f9d057","#f29e2e","#e76818","#d7191c"];

  	for (var i = 0; i < grades.length; i++) {
  		div.innerHTML +=
  			'<p style="margin-left: 15px">' + '<i style="background:' + color[i] + ' "></i>' + '&nbsp;&nbsp;' + grades[i]+ '<\p>';
  	}

  	return div;
  };

  //Add the legend by default
  legend.addTo(myMap)

  myMap.on('overlayadd', function(a) {
    //Add the legend
    legend.addTo(myMap);
  });

  myMap.on('overlayremove', function(a) {
    //Remove the legend
    myMap.removeControl(legend);
  });
}