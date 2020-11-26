
import { Constants } from '../app.constants';
import { core } from '@src/core';
import { ajax } from '@src/core.ajax';
import pubSub from '@src/core.pub-sub';
import { fillTemplate, executeTemplate } from '../lib/core.templates';
import { TreeUtils } from '../lib/core.tree';
import * as g from '@src/math';
import { BarChart } from '@src/charts/charts';

export class SvgBarChartAction {
 
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
  }

  // ============================================================
  // Render
  // ============================================================
  run() {
    let __max = 100;

    let __data = [
      [~~g.Random(__max, 0), "Ovino", "Toledo", ''],
      [~~g.Random(__max, 0), "Caprino", "Toledo", ''],
      [~~g.Random(__max, 0), "Bovino", "Toledo"],
      [~~g.Random(__max, 0), "Otros", "Toledo"],
      [~~g.Random(__max, 0), "Ovino", "Madrid"],
      [~~g.Random(__max, 0), "Caprino", "Madrid"],
      [~~g.Random(__max, 0), "Bovino", "Madrid"],
      [~~g.Random(__max, 0), "Ovino", "Sevilla"],
      [~~g.Random(__max, 0), "Caprino", "Sevilla"],
      [~~g.Random(__max, 0), "Bovino", "Sevilla"],
      [~~g.Random(__max, 0), "Ovino", "Ávila"],
      [~~g.Random(__max, 0), "Caprino", "Ávila"],
      [~~g.Random(__max, 0), "Bovino", "Ávila"]
    ];

    //let __data = [[~~g.Random(__max, 0), "lunes 4", "", "red"],
    //              [~~g.Random(__max, 0), "martes 5", ""],
    //              [~~g.Random(__max, 0), "miércoles 6", ""], 
    //              [~~g.Random(__max, 0), "jueves 7", ""], 
    //              [~~g.Random(__max, 0), "viernes 8", ""], 
    //              [~~g.Random(__max, 0), "lunes 11", ""], 
    //              [~~g.Random(__max, 0), "martes 12", ""], 
    //              [~~g.Random(__max, 0), "miércoles 13", ""], 
    //              [~~g.Random(__max, 0), "lunes 18", ""], 
    //              [~~g.Random(__max, 0), "lunes 25", ""]];

    pubSub.publish(
      'msg/main-page/test/content',
      new BarChart(1200, 
                   300, 
                   __data, 
                   new g.Box(20, 20, 40, 40),  
                   true, 
                   true, 
                   true, 
                   true)
        .getControl()
        .outerHTML
    );

    setTimeout(() => {
      core.element('svg g.data')
          .onclick = (event:MouseEvent) => {
            console.log((event.target as HTMLElement).dataset.index);
          }
    }, 1000);

  }
}


export class BarChartAction {
 
  private _books:any[];
  private _books_tree:any[];
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
  }

  // ============================================================
  // Render
  // ============================================================
  run() {
    this.loadData();
  }

  private loadData() {   
    ajax.get('js/data/libros.json')
        .then((res:string) => {
          this._books = JSON.parse(res).sortBy('publisher_date,language,publisher,ID');
          this.createBarChart();
        });
  }

  private createBarChart(){
    let __data = TreeUtils.createTree(this._books, ['publisher_date']);
    var __template = core.build('div', 
                                { className : 'w3-margin-bottom w3-border',
                                  innerHTML : '<svg width="500"' + 
                                              '     height="200">' +
                                              '  <g transform="translate(0,200) scale(1,-1)">' +
                                              '    <rect xfor="value in values"' +
                                              '          xbind="id:fn.calc=>all" ' +
                                              '          style="transition: height .51s ease-out;fill:rgb(0,0,255);stroke-width:2;stroke:rgb(0,0,0)" >' +
                                              '    </rect>' + 
                                              '  </g>' +
                                              '</svg>'
                                });
    var __context = { 
      values : Object.keys(__data)
                     .map( (year:string) => __data[year].rows.length ),
      fn     : {
        calc: function (acction:string, target:SVGRectElement) {
          let __width = 500 /__context.values.length;
          let __margin = __width * .1;
          let __value = this as any;
          target.setAttribute('x', '' + (__margin + (this.index * __width)));
          target.setAttribute('width', (__width - __margin).toString());
          target.setAttribute('height', '0');
          return 'bar-{0}'.format(__value.index);
        }
      }
    };

    setTimeout(() => {
      let __ratio = 100 / Math.max.apply(null, __context.values);
      core.elements<SVGRectElement>('rect')
          .forEach( (r, i) => {
            r.setAttribute('height', '{0}%'.format(__context.values[i] * __ratio));
          });

    }, 200);
       
    pubSub.publish(
      'msg/main-page/test/content',
      '<p>Generación de gráficos de barras</p>' +
      executeTemplate(__template, [__context])
    );
  }

}

export class PieChartAction {
 
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
  }

  // ============================================================
  // Render
  // ============================================================
  run() {
    this.loadData();
  }

  private loadData() {   
    this.createPieChart();
  }

  private createPieChart() {

     var __template = core.build('div', 
                                { className : 'w3-margin-bottom w3-border',
                                  innerHTML : '<svg width="500"' + 
                                              '     height="500">' +
                                              '  <g transform="translate(250,250)">' +
                                              '    <circle cx="0" cy="0" r="149" stroke="black" stroke-width="0" fill="silver" />' +
                                              '    <path xfor="value in values"' +
                                              '          xbind="id:fn.calc=>@value" ' +
                                              '    </path >' + 
                                              '  </g>' +
                                              '</svg>'
                                });
    var __colors = ['red', 'yellow', 'green', 'blue', 'orange', 'purple', 'black', 'gray'];
    var __that = this;
    var __toAngle   = (value:number) => value * 3.6;
    var __toRadians = (degrees:number) => degrees * Math.PI / 180;
    var __context = { 
      values : [ 40, 20, 15],
      offset : 0,
      fn     : {
        calc: function (value:number, target:SVGPathElement) {
          let __bindContext = this as any;

          target.setAttribute('stroke-width', '2');
          target.setAttribute('stroke', 'white');
          target.setAttribute('fill', __colors[__bindContext.index % 8]);
          target.setAttribute('d', __that.describeArc(0, 0, 150, __toAngle(__context.offset), __toAngle(value + __context.offset)));
          __context.offset += value;
          return 'sector-{0}'.format(__bindContext.index);
        }
      }
    };

    pubSub.publish(
      'msg/main-page/test/content',
      '<p>Generación de gráficos de barras</p>' +
      executeTemplate(__template, [__context])
    );

  }

  private polarToCartesian(x:number, y:number, r:number, angleInDegrees:number) {
    var __angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    return {
      x: x + (r * Math.cos(__angleInRadians)),
      y: y + (r * Math.sin(__angleInRadians))
    };
  }

  private describeArc(x:number, y:number, radius:number, startAngle:number, endAngle:number){

    var start = this.polarToCartesian(x, y, radius, endAngle);
    var end = this.polarToCartesian(x, y, radius, startAngle);

    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
        "L", x, y,
        "L", start.x, start.y
    ].join(" ");

    return d;       
  }

}