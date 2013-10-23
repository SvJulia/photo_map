var map;
var circle;
var clientId = '43d195c597994fe78183ef23824933cd';

function initialize() {
  var mapOptions = {
    zoom: 15,
    center: new google.maps.LatLng(54.31865, 48.39765),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  google.maps.event.addListener(map, 'click', function(event) {   
    var radius = 500;
    addCircle(event.latLng, radius);
    getPhotos(event.latLng, radius);
  });
}
/*
function showPhotos(location, radius) {  
  var photos = 
}
*/
function getPhotos(location, radius) {
  
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    cache: false,
    url: getPhotoUrl(location, radius),
    success: function(result)  {
      showPhotos(result.data);
    }
  });
}

function showPhotos(data) {  
  $("#result").empty();
  for (var i = 0; i < data.length; i++) {
    $("#result").append("<a target='_blank' href='" + data[i].link +"'><img src='" + data[i].images.thumbnail.url +"'></img></a>");
  }
}

function getPhotoUrl(location, radius){
  return "https://api.instagram.com/v1/media/search?lat=" + location.lat() + "&lng=" + location.lng() + "&distance=" + radius + "&client_id=" + clientId; 
}

function addCircle(location, radius) {  
  if (circle != null) {
    circle.setMap(null);
  }
  
  circle = new google.maps.Circle({
    center: location, 
    strokeColor: '#EAC',
    strokeOpacity: 0.7,
    fillColor: '#EAC', 
    fillOpacity: 0.4, 
    radius: radius
  });
  
  circle.setMap(map);
}

function _genKey() {
  var S4;
  S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return "" + (S4()) + (S4()) + (S4()) + (S4());
};

google.maps.event.addDomListener(window, 'load', initialize);
