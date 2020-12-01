
 //==================================================================================================== 
 // Vector2
 //====================================================================================================
class Vector2 {
  
  public x:number;
  public y:number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static readonly Vector2_ZERO            = new Vector2(0.0, 0.0);
  public static readonly Vector2_UNIT_X          = new Vector2(1.0, 0.0);
  public static readonly Vector2_UNIT_Y          = new Vector2(0.0, 1.0);
  public static readonly Vector2_NEGATIVE_UNIT_X = new Vector2(-1.0, 0.0);
  public static readonly Vector2_NEGATIVE_UNIT_Y = new Vector2(0.0, -1.0);
  public static readonly Vector2_UNIT_SCALE      = new Vector2(1.0, 1.0);

  public static fromArrayi(values:number[]){ return new Vector2(~~values[0], ~~values[1]);};
  public static sum(a:Vector2, b:Vector2)  { return new Vector2(a.x + b.x, a.y + b.y); };
  public static difference(a:Vector2, b:Vector2) { return new Vector2(a.x - b.x, a.y - b.y);};
  public static dot(a:Vector2, b:Vector2)   { return a.x * b.x + a.y * b.y;};
  public static cross(a:Vector2, b:Vector2) { return a.x * b.y - a.y * b.x;};
  public static distance(a:Vector2, b:Vector2) { var dx = a.x - b.x; var dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy);};
  public static distanceSquared(a:Vector2, b:Vector2) { var dx = a.x - b.x; var dy = a.y - b.y; return dx * dx + dy * dy; };
  public static equals(a:Vector2, b:Vector2) { return a.x == b.x && a.y == b.y; };
  public static lerp(a:Vector2, b:Vector2, f:number, resultVec:Vector2) {
    var x = a.x, y = a.y;
    resultVec.x = (b.x - x) * f + x;
    resultVec.y = (b.y - y) * f + y;
    return resultVec;
  }
  public static rotateAroundPoint = function(v:Vector2, axisPoint:Vector2, angle:number) { 
    return v.clone()
            .subtract(axisPoint)
            .rotate(angle)
            .add(axisPoint);
  };
  
  public set            (x:number,y:number)   { this.x=x; this.y=y; return this;};
  public clone          (){ return new Vector2(this.x, this.y); };
  public length         (){ return Math.sqrt(this.x * this.x + this.y * this.y);};
  public lengthSquared  (){ return this.x * this.x + this.y * this.y; };
  public invert         (){ this.x = -this.x; this.y = -this.y; return this; };
  public cross          (vector:Vector2){ return this.x * vector.y - this.y * vector.x;}
  public dot            (vector:Vector2){ return this.x * vector.x + this.y * vector.y;};
  public scale          (sx:number, sy:number){ this.x *= sx; this.y *= sy; return this; };
  public normalize      (){ var _d = 1 / this.length(); return this.scale(_d, _d); };
  public normalisedCopy (){ return new Vector2(this.x,this.y).normalize(); };
  public add            (vector:Vector2){ this.x += vector.x; this.y += vector.y; return this; };
  public subtract       (vector:Vector2){ this.x -= vector.x; this.y -= vector.y; return this;};
  public mul            (scalar:number){ this.x *= scalar; this.y *= scalar; return this;};
  public divide         (scalar:number){ this.x /= scalar; this.y /= scalar; return this;};
  public equals         (vector:Vector2){ return this == vector || !!vector && this.x == vector.x && this.y == vector.y; };
  public rotate         (angle:number) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var newX = this.x * cos - this.y * sin;
    var newY = this.y * cos + this.x * sin;
    this.x = newX;
    this.y = newY;
    return this;
  };

}

// ======================================================================================================================================= 
// Box
// ======================================================================================================================================= 
class Box {
  
  public left:number; 
  public top:number; 
  public right:number; 
  public bottom:number;
  
  public constructor(top:number, right:number, bottom:number, left:number) { 
    this.left = left; 
    this.top = top; 
    this.right = right; 
    this.bottom = bottom;
  }

  public clone       () { return new Box(this.top, this.right, this.bottom, this.left); };
  public toRect      () { return new Rectangle(this.left, this.top, this.right - this.left, this.bottom - this.top); };
  public centerPoint () { return new Vector2( this.left + ((this.right - this.left) >> 1), this.top + ((this.bottom - this.top) >> 1)); };

}

// ======================================================================================================================================= 
// Rectangle
// =======================================================================================================================================
class Rectangle {
  
  public left:number; 
  public top:number; 
  public width:number; 
  public height:number;
  
  public constructor(left:number, top:number, width:number, height:number) { 
    //  if(arguments.length==1){
    //    var __a = x.split(',');
    //    this.left = ~~__a[0];
    //    this.top = ~~__a[1];
    //    this.width = ~~__a[2];
    //    this.height = ~~__a[3];  
    //    return;
    //  }
    this.left = left; 
    this.top = top; 
    this.width = width; 
    this.height = height;
  }

  public clone()            { return new Rectangle(this.left, this.top, this.width, this.height); };
  public toBox()            { return new Box(this.top, this.left + this.width, this.top + this.height, this.left); };
  public centerPoint()      { return new Vector2( this.left + (this.width >> 1), this.top + (this.height >> 1));};
  public contains(other: Rectangle|Vector2) {
    if (other instanceof Rectangle) {
      return this.left <= other.left &&
             this.left + this.width >= other.left + other.width &&
             this.top <= other.top &&
             this.top + this.height >= other.top + other.height;
    } else { 
      return other.x >= this.left &&
             other.x <= this.left + this.width &&
             other.y >= this.top &&
             other.y <= this.top + this.height;
    }
  };

}

function Random(max:number, min:number)        { return Math.random() * (max - min + 1) + min; }
function Clamp(value:number, min:number, max:number) { return Math.min(Math.max(value, min), max);};
function Radians(degrees:number) { return degrees * Math.PI / 180; };
function Degrees(radians:number) { return radians * 180 / Math.PI; };
function IsPowerOfTwo(value:number){ return value > 0 && (value & (value - 1)) == 0; };
function NextPowerOfTwo(value:number){  var k = 1; while (k < value) k *= 2;  return k; };
function polarToCartesian(x:number, y:number, r:number, angleInDegrees:number){
  var __angleInRadians = Radians(angleInDegrees);
  return {
    x: x + (r * Math.cos(__angleInRadians)),
    y: y + (r * Math.sin(__angleInRadians))
  };
}


export {
  Vector2,
  Box,
  Rectangle,
  Random,
  Clamp,
  Radians,
  Degrees,
  polarToCartesian,
  IsPowerOfTwo,
  NextPowerOfTwo
}