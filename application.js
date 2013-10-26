var map;
var markers = [];
var circle;

var clientId = '43d195c597994fe78183ef23824933cd';

var radius = 5000;
var photosCount = 0;
var maxPhotosCount = 10000;
var delay = 720;
var photoIntervalId = -1
var photos = [];

var lastDate;

function initialize() {
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(54.31865, 48.39765),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  google.maps.event.addListener(map, 'click', function(event) {   
    if (photoIntervalId != -1) {     
      photoIntervalId = -1;      
    }   
               
    photosCount = 0;
    clearMarkers();
    clearInterval(photoIntervalId);
    
    lastDate = Math.round(new Date().getTime() / 1000);
    
    addCircle(event.latLng, radius);    
    photoIntervalId = setInterval(function() { getPhotos(event.latLng, radius, lastDate); }, delay);
  });
}

function getPhotos(location, radius, maxDate) {    
  $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    cache: false,
    url: getPhotoUrl(location, radius, maxDate),
    success: function(result) {  
      addPhotos(photos, result.data);
      showPhotos(result.data);      
      addMarkers(result.data);
      
      newPhotosCount = result.data.length;
      photosCount += newPhotosCount;
      
      if (photosCount < maxPhotosCount && newPhotosCount != 0) {
        lastDate = findMinDate(result.data) - 100;
      } else {
        clearInterval(photoIntervalId);
        photoIntervalId = -1;
      }    
      
      $('#photos').text(photosCount);
    }
  });
}

function addPhotos(photos, data) {
  for (var i = 0; i < data.length; i++) {
    var photo = {
      img: data[i].images.thumbnail.url,
      latitude: data[i].location.latitude,
      longitude: data[i].location.longitude,
    };
    
    photos.push(photo);
  }
}

function showPhotos(data) {  
  for (var i = 0; i < data.length; i++) {
    $('#result').prepend("<a target='_blank' href='" + data[i].link + "'><img src='" + data[i].images.thumbnail.url +"'></img></a>");
  }
}

function addMarkers(data) {  
  for (var i = 0; i < data.length; i++) {
    var marker = new google.maps.Marker({
      map: map,
      position: new google.maps.LatLng(data[i].location.latitude, data[i].location.longitude),
      title: data[i].user.username
    });
    
    google.maps.event.addListener(marker, 'click', function(event) {
      showPhoto(marker.location, '', '');
    });
    
    markers.push(marker);
  }
}

function showInfoWindow(location, img, link) {
  var coordInfoWindow = new google.maps.InfoWindow();
  coordInfoWindow.setPosition(location);
  coordInfoWindow.setContent("<a target='_blank' href='" + img + "'><img src='" + link +"'></img></a>");
  coordInfoWindow.open(map);
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  
  markers = [];
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

google.maps.event.addDomListener(window, 'load', initialize);
