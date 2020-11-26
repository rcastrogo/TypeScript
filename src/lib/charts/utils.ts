
import { Random } from '@src/math';

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
