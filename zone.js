var Zone = (function() {
  function Zone(location, radius) {
    this.location = location;
    this.radius = radius;

    this.circle = new google.maps.Circle({
      center: this.location,
      radius: this.radius,
      strokeColor: '#3CF',
      strokeOpacity: 0.5,
      fillColor: '#3CF', 
      fillOpacity: 0.3,
      draggable: true
    });

    this.photos = [];
    this.photoPositions = [];

    this.markers = [];
  }

  Zone.prototype.addPhotos = function(data) {
    for (var i = 0; i < data.length; i++) {
      var location = new google.maps.LatLng(data[i].location.latitude, data[i].location.longitude);

      this.photos.push({
        link: data[i].link,
        image: data[i].images.thumbnail.url,
        location: location
      });
      
      this.photoPositions.push(location);
    }
  }

  Zone.prototype.showPhotos = function(map) {
    var bounds = map.getBounds();

    for(var i = 0; i < this.markers.length; i++) {
      var markerPosition = this.markers[i].getPosition();
      if(!bounds.contains(markerPosition)) {
        this.markers[i].setMap(null);
      }
    }

    for(var i = 0; i < this.photos.length; i++) {
      var photo = this.photos[i];
      if(bounds.contains(photo.location)) {
        var marker = new google.maps.Marker({
          map: map,
          position: photo.location
        });        

        google.maps.event.addListener(marker, 'click', showInfoWindow(marker, photo));  

        this.markers.push(marker);
      }
    }    
  }

  function showInfoWindow(marker, photo) {
    return function() {
      var infoWindow = new google.maps.InfoWindow({
        position: photo.location,
        content: "<a target='_blank' href='" + photo.link + "'><img src='" + photo.image + "'></img></a>"
      });

      infoWindow.open(map);
    }
  }

  Zone.prototype.showCircle = function(map) {
    this.circle.setMap(map);
  }

  Zone.prototype.hideCircle = function() {
    this.circle.setMap(null);
  }

  Zone.prototype.clear = function() {
    this.location = 0;
    this.radius = 0;
    this.circle.setMap(null);
    this.photos = [];
    this.photoPositions = [];

    for(var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
  }

  return Zone;
})();