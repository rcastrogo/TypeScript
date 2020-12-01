
import { Random, Vector2, polarToCartesian } from '../math';

export const createColors = (v:number) => {
  var __v = [0, 51, 102, 153, 204, 255];
  var __l = __v.length - 1;
  var __c:string[] = [];
  var __x = 0;
  while(__x < v){
    __c.add('rgba({0},{1},{2},.9)'.format(__v[~~Random(__l, 0)],
                                          __v[~~Random(__l, 0)],
                                          __v[~~Random(__l, 0)]));
    __x++;
  }
  return {
    current : -1,
    values  : __c,
    next: function(){
      this.current = ++this.current % this.values.length;
      return this.values[this.current];
    }
  };
}

export const niceScale = (min:number, max:number, steps:number) => {
  var range       = __niceNum(max - min, false);
  var tickSpacing = __niceNum(range / (steps - 1), true)
  var niceMin     = Math.floor(min / tickSpacing) * tickSpacing;
  var niceMax     = Math.ceil (max / tickSpacing) * tickSpacing;
  var result      = { range       : range, 
                      min         : niceMin, 
                      max         : niceMax, 
                      tickSpacing : tickSpacing,
                      values      : Array<number>()};

  function __niceNum(range:number, round:boolean) {
    var exponent     = Math.floor(Math.log10(range)); 
    var fraction     = range / Math.pow(10, exponent);
    var niceFraction ;
    if (round) {
      if (fraction < 1.5)
        return Math.pow(10, exponent);
      else if (fraction < 3)
        return 2 * Math.pow(10, exponent);
      else if (fraction < 7)
        return 5 * Math.pow(10, exponent);
      else
        return 10 * Math.pow(10, exponent);
    } 
      if (fraction <= 1)
        return Math.pow(10, exponent);
      else if (fraction <= 2)
        return 2 * Math.pow(10, exponent);
      else if (fraction <= 5)
        return 5 * Math.pow(10, exponent);
      else
        return 10 * Math.pow(10, exponent); 
  }

  for(var x = result.max; x > result.min; x -= result.tickSpacing){
    result.values.push(x);
  }
  return result;
}

export class PathBuilder {

  private static line = (a:Vector2, b:Vector2) => {
    const lengthX = b.x - a.x;
    const lengthY = b.y - a.y;
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    }
  }

  private static controlPoint = (line:Function, smooth:number) => (current:Vector2, previous:Vector2, next:Vector2, reverse:boolean) => {
    const p = previous || current
    const n = next || current
    const l = line(p, n)
    const angle = l.angle + (reverse ? Math.PI : 0)
    const length = l.length * smooth
    const x = current.x + Math.cos(angle) * length
    const y = current.y + Math.sin(angle) * length
    return new Vector2(x, y);
  }

  private static bezierCommand = (controlPoint:Function) => (point:Vector2, i:number, a:Vector2[]) => {
    const cps = controlPoint(a[i - 1], a[i - 2], point)
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true)
    return 'C {0},{1} {2},{3} {x},{y}'.format(cps.x, cps.y, cpe.x, cpe.y, point);
  }

  private static svgPath = (points:Vector2[], command:Function, closePath:boolean) => {
    return points.reduce((acc:string, e:Vector2, i:number, a:Vector2[]) => { 
             //if (i == 0 && h) return `M ${a[a.length - 1].x},${h} L ${e.x},${h} L ${e.x},${e.y}`;
             if (i == 0) return 'M {x},{y}'.format(e);
             if(closePath && i == a.length - 2 ||
                closePath && i == a.length - 1) return acc += ' L {x},{y}'.format(e); 
             return  acc += ' ' + command(e, i, a);
           }, '') + (closePath ? ' z' : '');
  }

  public static createPath = (points:Vector2[], smoothing:number, closePath:boolean = true) => {
    const bezierCommandCalc = PathBuilder.bezierCommand(PathBuilder.controlPoint(PathBuilder.line, smoothing)) 
    return PathBuilder.svgPath(points, bezierCommandCalc, closePath);
  }

}


export const describeArc = (x:number, y:number, radius:number, startAngle:number, endAngle:number) => {

  var start = polarToCartesian(x, y, radius, endAngle - 90);
  var end = polarToCartesian(x, y, radius, startAngle - 90);

  var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
      "M", start.x, start.y, 
      "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
      "L", x, y,
      "L", start.x, start.y
  ].join(" ");

  return d;       
}






