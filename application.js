var map = null;
var firstMarker = null;
var polygon = null;
var polyline = null;
var markers = [];
var circles = [];

var clientId = '43d195c597994fe78183ef23824933cd';

var delay = 720;
var photosCount = 0;
var maxPhotosCount = 500;

function initialize() {
  var radius = 2500;

  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(54.31865, 48.39765),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  
  google.maps.event.addListener(map, 'click', function(event) { 
    setFirstMarker(event.latLng);
    setPoint(event.latLng);
  });
}

function setFirstMarker(location) {
  if(firstMarker != null) {
    return;
  }

  var polyOptions = {
    strokeColor: '#000000',
    strokeOpacity: 0.5,
    strokeWeight: 3
  };
 
  polyline = new google.maps.Polyline(polyOptions);
  polyline.setMap(map);

  firstMarker = new google.maps.Marker({
    map: map,
    title: "Кликните на маркер, чтобы замкнуть фигуру.",
    position: location
  });
  
  google.maps.event.addListener(firstMarker, 'click', function(event) {
    polygon = getPolygon(polyline);    
    polyline.setMap(null);
    polyline = null;
    firstMarker.setMap(null);
    firstMarker = null;
        
    showPhotosInPolygon(polygon);
  });
}

function setPoint(location) {
  var path = polyline.getPath();
  path.push(location);
}

function getPolygon(polyline) {
  var polygon = new google.maps.Polygon({
    map: map,
    paths: polyline.getPath(), 
    strokeColor: '#F00',
    strokeOpacity: 0.5,
    strokeWeight: 2,
    fillColor: '#F00', 
    fillOpacity: 0.15
  });
  
  return polygon;
}

function showPhotosInPolygon(polygon) {
}

function startShowPhotos(location, radius, delay) {
  photosCount = 0;
  clearObjects(markers);
  clearObjects(circles);

  addCircle(location, radius); 
  getPhotos(location, radius, delay);   
}

function getPhotos(location, radius, delay, maxDate) {    
  $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    cache: false,
    url: getPhotoUrl(location, radius, maxDate),
    success: function(result) {  
      addMarkers(result.data);
      
      newPhotosCount = result.data.length;
      photosCount += newPhotosCount;
      
      if (photosCount < maxPhotosCount && newPhotosCount != 0) {
        var lastDate = findMinDate(result.data) - 100;
        setTimeout(function() { getPhotos(location, radius, lastDate); }, delay);
      }    
      
      $('#photos').text(photosCount);
     }
  });
}

function addMarkers(data) {  
  for (var i = 0; i < data.length; i++) {
    var marker = new google.maps.Marker({
      map: map,
      position: new google.maps.LatLng(data[i].location.latitude, data[i].location.longitude),
      title: data[i].user.username
    });
        
    showInfoWindow(marker, data[i].images.thumbnail.url, data[i].link);
    markers.push(marker);
  }
}

function showInfoWindow(marker, image, link) {
  var coordInfoWindow = new google.maps.InfoWindow();
  coordInfoWindow.setPosition(marker.position);
  coordInfoWindow.setContent("<a target='_blank' href='" + link + "'><img src='" + image + "'></img></a>");
 
  google.maps.event.addListener(marker, 'click', function(event) {
     coordInfoWindow.open(map);
  });
}

function clearObjects(objects) {
  for (var i = 0; i < objects.length; i++) {
    objects[i].setMap(null);
  }
  
  objects = [];
}

function findMinDate(data) {
  var minDate = data[0].created_time;
  
  for(var i = 0; i < data.length; i++) {
    if (minDate > data[i].created_time) {
      minDate = data[i].created_time;
    }
  }
  
  return minDate;
}

function getPhotoUrl(location, radius, maxDate) {
  var date = maxDate || Math.round(new Date().getTime() / 1000);
  return 'https://api.instagram.com/v1/media/search?lat=' + location.lat() + '&lng=' + location.lng() + '&distance=' + radius + '&max_timestamp=' + maxDate + '&client_id=' + clientId; 
}

function addCircle(location, radius) {  
  var circle = new google.maps.Circle({
    map: map,
    center: location, 
    strokeColor: '#3CF',
    strokeOpacity: 0.5,
    fillColor: '#3CF', 
    fillOpacity: 0.3, 
    radius: radius
  });
  
  circles.push(circle);
}

google.maps.event.addDomListener(window, 'load', initialize);
