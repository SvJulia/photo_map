var SearchBounds = (function() {
  function SearchBounds(polyline, zoneRadius) {
    this.zoneRadius = zoneRadius;
    this.polygon = createPolygon(polyline);
    this.zones = createZones(this.polygon, this.zoneRadius);
  }

  SearchBounds.prototype.showPolygon = function(map) {
    this.polygon.setMap(map);
  }

  SearchBounds.prototype.hidePolygon = function() {
    this.polygon.setMap(null);
  }

  SearchBounds.prototype.showCircles = function(map) {
    for (var i = 0; i < this.zones.length; i++) {
      this.zones[i].showCircle(map);  
    }
  }

  SearchBounds.prototype.hideCircles = function() {
    for (var i = 0; i < this.zones.length; i++) {
      this.zones[i].hideCircle();  
    }
  }

  SearchBounds.prototype.clear = function() {
    this.hidePolygon();
    for (var i = 0; i < this.zones.length; i++) {
      this.zones[i].clear();  
    }
  }

  function createPolygon(polyline) {
    return new google.maps.Polygon({
      paths: polyline.getPath(), 
      strokeColor: '#FF8833',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      fillColor: '#FF8833', 
      fillOpacity: 0.15
    });
  }

  function createZones(polygon, radius) {
    var polygonLocations = polygon.getPath().getArray();
    var centralLocation = getCentralLocation(polygonLocations);

    var zones = [];
    var zoneLocations = [];

    var hexMap = new HexMap(centralLocation);
    zoneLocations.push({ location: centralLocation, q: 0, r: 0 });

    for(var i = 0; i < zoneLocations.length; i++) {
      var mapElement = zoneLocations[i];
      zones.push(new Zone(mapElement.location, radius));

      if(polygon.containsLatLng(mapElement.location)) {
        var newLocations = getNewLocations(mapElement.location, radius);

        for(var j = 0; j < newLocations.length; j++) {
          var coord = hexMap.getNearCoordinate(mapElement.q, mapElement.r, j);

          if(!hexMap.getLocation(coord.q, coord.r)) {
            hexMap.setLocation(coord.q, coord.r, newLocations[j]);
            zoneLocations.push({ location: newLocations[j], q: coord.q, r: coord.r });;
          }
        }
      }
    }

    return zones;
  }

  function getNewLocations(location, radius) {
    var newLocations = [];
    var angle = 30;
    var step = 60;

    while (angle <= 360) {
      var newLocation = google.maps.geometry.spherical.computeOffset(location, radius * Math.sqrt(3), angle);
      newLocations.push(newLocation);
      angle += step;
    }

    return newLocations;    
  }

  function getCentralLocation(locations) {
    var centralLat = 0;
    var centralLng = 0;
    
    for (var i = 0; i < locations.length; i++) {
      centralLat += locations[i].lat();
      centralLng += locations[i].lng();
    }
    
    return new google.maps.LatLng(centralLat / locations.length, centralLng / locations.length);
  }

  return SearchBounds;
})();

// Класс для описания гексагональной карты. Она нужна, для того, чтобы запоминать позиции зон поиска картинок.
// Зоны поиска строятся как шестиугольники, с ребром radius. Затем шестиугольник описывает круг, с радиусом radius.
// Для хранения этих зон нужен класс. Идеи для реализации гексагональной карты взяты с сайта http://www.redblobgames.com/grids/hexagons/
var HexMap = (function() {
  var neighbors = [
    [+1, -1], [+1,  0], [ 0, +1],
    [-1, +1], [-1,  0], [ 0, -1]
  ];

  function HexMap(firstLocation) {
    this.map = [];
    this.setLocation(0, 0, firstLocation);
  }

  HexMap.prototype.getLocation = function(q, r) {
    if(this.map[q]) {
      return this.map[q][r];
    } 

    return null;
  }

  HexMap.prototype.setLocation = function(q, r, location) {
    if(!this.map[q]) {
      this.map[q] = [];
    } 

    this.map[q][r] = location;
  }

  HexMap.prototype.getNearLocation = function(q, r, direction) {
    var dir = neighbors[direction];
    return getLocation(q + dir[0], r + dir[1]);
  }

  HexMap.prototype.getNearCoordinate = function(q, r, direction) {
    var dir = neighbors[direction];
    return { q: q + dir[0], r: r + dir[1] };
  }

  return HexMap;
})();