// Класс для описания гексагональной карты. Она нужна, для того, чтобы запоминать позиции зон поиска картинок.
// Зоны поиска строятся как шестиугольники, с ребром radius. Затем шестиугольник описывает круг, с радиусом radius.
// Для хранения этих зон нужен класс. Идеи для реализации гексагональной карты взяты с сайта http://www.redblobgames.com/grids/hexagons/

var HexMap = (function() {
  //            _____                                                                 
  //           /     \                                                                    
  //     _____/ 0, -1 \_____                                                               
  //    /     \       /     \                                                               
  //   / -1, 0 \_____/ +1,-1 \                                                             
  //   \       /     \       /                                                           
  //    \_____/ 0, 0  \_____/                                                            
  //    /     \       /     \                                                            
  //   / -1,+1 \_____/ +1, 0 \                                                          
  //   \       /     \       /                                                           
  //    \_____/ 0, +1 \_____/                                                           
  //          \       /                                                               
  //           \_____/                                                                
  //                                                                            
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

  HexMap.prototype.getCoordinate = function(q, r, direction) {
    var dir = neighbors[direction];
    return { q: q + dir[0], r: r + dir[1] };
  }

  return HexMap;
})();
