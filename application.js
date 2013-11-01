var map = null;
var firstMarker = null;
var polyline = null;

var searchBounds = null;

var clientId = '43d195c597994fe78183ef23824933cd';

var delay = 720;
var radius = 2000;
var photosCount = 0;
var maxPhotosCount = 500;

function initialize() {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(54.31865, 48.39765),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  
  google.maps.event.addListener(map, 'click', function(event) { 
    var location = event.latLng;

    if(!markerExists(firstMarker)) {
      firstMarker = createFirstMarker(location);
      polyline = createPolyline();
    }
 
    addLocation(polyline, location);
  });
}

function markerExists(marker) {
  return marker && marker.getMap();
}

function createFirstMarker(location) {
  var marker = new google.maps.Marker({
    map: map,
    title: "Кликните на маркер, чтобы замкнуть фигуру.",
    position: location
  });
  
  google.maps.event.addListener(marker, 'click', function(event) {    
    showPhotosInPolyline(polyline);

    marker.setMap(null);
    polyline.setMap(null);
  });

  return marker;
}

function createPolyline() {
  return new google.maps.Polyline({
    map: map,
    strokeColor: '#000000',
    strokeOpacity: 0.5,
    strokeWeight: 3
  });
}

function addLocation(polyline, location) {
  var path = polyline.getPath();
  path.push(location);
}

function showPhotosInPolyline(polyline) {
  photosCount = 0;

  if(searchBounds) {
    searchBounds.clear();
  }

  searchBounds = new SearchBounds(polyline, radius);
  searchBounds.showPolygon(map);
  searchBounds.showCircles(map);

  /*
  var searchLocations = polygon.getPath().getArray();

  for (var i = 0; i < searchLocations.length; i++) {
    zones[i] = new Zone(searchLocations[i], radius);  
    startShowPhotos(zones[i], delay, delay * i)
  }
  */
}

function startShowPhotos(zone, delay, runDelay) {  
  zone.showCircle(map);
  setTimeout(function() { 
    getPhotos(zone, delay);   
  }, runDelay);
}

function getPhotos(zone, delay, maxDate) {
  $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    cache: false,
    url: getPhotoUrl(zone.location, zone.radius, maxDate),
    success: function(result) {  
      zone.addPhotos(result.data);
      zone.showPhotos(map);

      newPhotosCount = result.data.length;
      photosCount += newPhotosCount;

      if (photosCount < maxPhotosCount && newPhotosCount != 0) {
        var lastDate = findMinDate(result.data) - 100;
        setTimeout(function() { getPhotos(zone, delay, lastDate); }, delay);
      }    

      $('#photos').text(photosCount); 
    },
    error: function(result) {  
      alert(result);
    }
  });
}

function showPhotos(data) {  
  for (var i = 0; i < data.length; i++) {
    $('#result').prepend("<a target='_blank' href='" + data[i].link + "'><img src='" + data[i].images.thumbnail.url + "'></img>");
  }
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

google.maps.event.addDomListener(window, 'load', initialize);