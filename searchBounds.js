// Границы поиска. Объекту надо передать polyline, и он заполнит её зонами поиска с радиусами zoneRadius
// Так же создаст внутри закрашенный polygon.

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

  SearchBounds.prototype.showHexes = function(map) {
    for (var i = 0; i < this.zones.length; i++) {
      this.zones[i].showHex(map);  
    }
  }

  SearchBounds.prototype.hideHexes = function() {
    for (var i = 0; i < this.zones.length; i++) {
      this.zones[i].hideHex();  
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

  // Создаёт зоны. Для этого использует Гексагональную карту.
  function createZones(polygon, radius) {
    var polygonLocations = polygon.getPath().getArray();
    var centralLocation = getCentralLocation(polygonLocations);

    var zones = [];
    var zoneLocations = [];

    // Центр карты, это центр полигона - среднее значение координат.
    var hexMap = new HexMap(centralLocation);
    zoneLocations.push({ location: centralLocation, q: 0, r: 0 });

    // Затем проходимся по зонам в массиве
    for(var i = 0; i < zoneLocations.length; i++) {
      var mapElement = zoneLocations[i];

      var polylinePath = getLocationsOnCircle(mapElement.location, radius, 0, 60);
      zones.push(new Zone(mapElement.location, polylinePath, radius));

      // Если центр зоны поиска внутри полигона
      if(polygon.containsLatLng(mapElement.location)) {
        // то, мы берём 6 соседних точек, относительно текущей. Эти точки центра шестиугольников с ребром radius
        var newLocations = getLocationsOnCircle(mapElement.location, radius * Math.sqrt(3), 30, 60);

        // Далее проходимся по этим точкам. Если их нет на Гексагональной карте, то мы добавляем их туда
        // и добавляем в массив точек, чтобы найти её соседей.
        for(var j = 0; j < newLocations.length; j++) {
          var coord = hexMap.getCoordinate(mapElement.q, mapElement.r, j);

          if(!hexMap.getLocation(coord.q, coord.r)) {
            hexMap.setLocation(coord.q, coord.r, newLocations[j]);
            zoneLocations.push({ location: newLocations[j], q: coord.q, r: coord.r });;
          }
        }
      }
    }

    return zones;
  }

  function getLocationsOnCircle(location, radius, startAngle, stepAngle) {
    var newLocations = [];
    var angle = startAngle || 0;
    var step = stepAngle || 60;

    while (angle <= 360) {
      var newLocation = google.maps.geometry.spherical.computeOffset(location, radius, angle);
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
