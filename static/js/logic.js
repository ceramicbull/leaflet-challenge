//map object
let myMap = L.map("map", {
    center: [0, 0],
    zoom: 2.5
  });

//tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);


//function to designate marker size proportional to earthquake magnitude:
function markerSize(magnitude) {
    return magnitude * 10;
  };

function markerColor(val,thresholds){
  if(+val>+thresholds[4]) return "#ff0000";
  else if(+val>+thresholds[3]) return "#f96000";
  else if(+val>+thresholds[2]) return "#e59100";
  else if (+val>+thresholds[1]) return "#c4ba00";
  else if (+val>+thresholds[0]) return "#91df00";
  else return "#00ff00"
};

//link to the Earthquake GeoJSON data:
let link="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//process the data:
d3.json(link).then(function(data) {
    //array of all depth info
    let depthInfo=data.features.map(feature => feature.geometry.coordinates[2]);

    //determine max value of depth
    let depthMax=Math.max(...depthInfo);
    console.log(depthMax);

    //generate array of thresholds
    let percArray=[.1, .3, .5, .7, .9];
    depthThresh=percArray.map(perc=>perc*depthMax);
    console.log(depthThresh);

    // Creating a GeoJSON layer with the retrieved data
    L.geoJson(data, {
        //style each quake event:
       pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius:markerSize(feature.properties.mag),
                color:"black",
                fillColor:markerColor(feature.geometry.coordinates[2],depthThresh),
                fillOpacity:0.5,
                weight:1.5
            });
       },
       // This is called on each feature.
        onEachFeature: function(feature, layer) {
            // Set the mouse events to change the map styling.
            layer.on({
            // When a user's mouse cursor touches a map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
            mouseover: function(event) {
                layer = event.target;
                layer.setStyle({
                    fillOpacity: 0.9,
                    color: "blue"
                    });
                },
            //reset settings when mouse cursor leaves
            mouseout: function(event) {
                layer = event.target;
                layer.setStyle({
                    fillOpacity: 0.5,
                    color: "black"
                    });
                }});
            //bind popup containing magnitude, location, and depth
            layer.bindPopup("<h1>"+feature.properties.title+"</h1> <hr> <h2>Depth: " + feature.geometry.coordinates[2] + " km</h2>");
            
        }
    }).addTo(myMap);
    
    //Set up legend
    //code inspired by Leaflet's example choropleth map:
    // (https://leafletjs.com/examples/choropleth/)
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
      const div = L.DomUtil.create("div", "info legend");
      const grades=depthThresh
      //const colors = ["#00ff00","#91df00","#c4ba00","#e59100","#f96000","#ff0000"]
      const labels = [];
      let from, to;
    
      for (let i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            labels.push(`<i style="background:${markerColor(from + 1,grades)}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
        }

        div.innerHTML = labels.join('<br>');
			return div;

        
    }

    // Adding the legend to the map
    legend.addTo(myMap);
});



// //function to designate marker color respective to depth:
// function markerColor(depth) {
    
// }
