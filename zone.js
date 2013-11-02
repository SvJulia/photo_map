// Зона поиска фотграфий. 
// Хранит в себе координату центра, радиус, фотографии и их позиции, а так же маркеры
var Zone = (function() {
  function Zone(location, polylinePath, radius) {
    this.location = location;
    this.radius = radius;

    this.hex = new google.maps.Polyline({
      path: polylinePath,
      strokeColor: '#CC0099',
      strokeOpacity: 1,
    });

    this.circle = new google.maps.Circle({
      center: this.location,
      radius: this.radius,
      strokeColor: '#0099CC',
      strokeOpacity: 0.2,
      fillColor: '#0099CC', 
      fillOpacity: 0.2
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

  Zone.prototype.showHex = function(map) {
    this.hex.setMap(map);
  }

  Zone.prototype.hideHex = function() {
    this.hex.setMap(null);
  }

  Zone.prototype.clear = function() {
    this.location = 0;
    this.radius = 0;
    this.hex.setMap(null);
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
