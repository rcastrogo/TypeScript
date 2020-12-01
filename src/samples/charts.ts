
import { Constants } from '../app.constants';
import { core } from '@src/core';
import { ajax } from '@src/core.ajax';
import pubSub from '@src/core.pub-sub';
import { fillTemplate, executeTemplate } from '../lib/core.templates';
import { TreeUtils } from '../lib/core.tree';
import * as g from '@src/math';
import { BarChart } from '@src/charts/charts';
import { createColors, describeArc } from '../lib/charts/utils';
import LineChart, { createDocument } from '../lib/charts/lines';

const COLORS = createColors(30);

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

    let __max = 60;

    let __data1 = [
      [~~g.Random(__max, 10), "Ovino", "Toledo", ''],
      [~~g.Random(__max, 10), "Caprino", "Toledo", ''],
      [~~g.Random(__max, 10), "Bovino", "Toledo"],
      [~~g.Random(__max, 10), "Otros", "Toledo"],
      [~~g.Random(__max, 10), "Ovino", "Madrid"],
      [~~g.Random(__max, 10), "Caprino", "Madrid"],
      [~~g.Random(__max, 10), "Bovino", "Madrid"],
      [~~g.Random(__max, 10), "Ovino", "Sevilla"],
      [~~g.Random(__max, 10), "Caprino", "Sevilla"],
      [~~g.Random(__max, 10), "Bovino", "Sevilla"],
      [~~g.Random(__max, 10), "Ovino", "Ávila"],
      [~~g.Random(__max, 10), "Caprino", "Ávila"],
      [~~g.Random(__max, 10), "Bovino", "Ávila"]
    ];

    let __data2 = 
      [[~~g.Random(__max, 40), "lunes 4", "", "red"],
      [~~g.Random(__max, 4), "martes 5", ""],
      [~~g.Random(__max, 4), "miércoles 6", ""], 
      [~~g.Random(__max, 4), "jueves 7", ""], 
      [~~g.Random(__max, 4), "viernes 8", ""], 
      [~~g.Random(__max, 4), "lunes 11", ""], 
      [~~g.Random(__max, 4), "martes 12", ""], 
      [~~g.Random(__max, 4), "miércoles 13", ""], 
      [~~g.Random(__max, 4), "lunes 18", ""], 
      [~~g.Random(__max, 4), "lunes 25", ""]];

    let __data3 = [
      [~~g.Random(__max, 4), '00:00'],
      [~~g.Random(__max, 4), '01:00'],
      [~~g.Random(__max, 4), '02:00'],
      [~~g.Random(__max, 4), '03:00'],
      [~~g.Random(__max, 4), '04:00'],
      [~~g.Random(__max, 4), '05:00'],
      [~~g.Random(__max, 4), '06:00'],
      [~~g.Random(__max, 4), '07:00'],
      [~~g.Random(__max, 4), '08:00'],
      [~~g.Random(__max, 4), '09:00'],
      [~~g.Random(__max, 4), '10:00'],
      [~~g.Random(__max, 4), '11:00'],
      [~~g.Random(__max, 4), '12:00']
    ];

    pubSub.publish(
      'msg/main-page/test/content',
          '<p>Control de gráficos de barras (svg)</p>' +
          new BarChart(650, 230, __data1, {
                       padding    : new g.Box(20, 20, 40, 40),
                       showBars   : true,
                       showDots   : false,
                       showLine   : false,
                       showValues : true
                      })
                      .getControl()
                      .outerHTML 
          + 
          new BarChart(650, 230, __data1, {
                       padding    : new g.Box(20, 20, 40, 40),
                       showBars   : false,
                       showDots   : true,
                       showLine   : true,
                       showValues : true,
                       closeLines : true
                      })
                      .getControl()
                      .outerHTML 
          + 
          new BarChart(650, 230, __data2, {
                       padding    : new g.Box(20, 20, 40, 40),
                       showBars   : false,
                       showDots   : true,
                       showLine   : true,
                       showValues : true
                      })
                      .getControl()
                      .outerHTML
          + 
          new BarChart(650, 230, __data3, {
                       padding    : new g.Box(20, 20, 40, 40),
                       showBars   : false,
                       showDots   : true,
                       showLine   : true,
                       showValues : true,
                       closeLines : false
                      })
                      .getControl()
                      .outerHTML
          + 
          new BarChart(650, 230, __data3, {
                       padding    : new g.Box(20, 20, 40, 40),
                       showBars   : false,
                       showDots   : false,
                       showLine   : true,
                       showValues : false,
                       closeLines : false
                      })
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
      '<p>Generación de gráficos de barras (svg + executeTemplate)</p>' +
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
                                { className : 'w3-margin-bottom w3-border w3-center',
                                  innerHTML : '<svg viewbox ="-200 -200 400 400">' +
                                              '  <circle cx="0" cy="0" r="149" stroke="black" stroke-width="1" fill="antiquewhite" />' +
                                              '  <g xfor="value in values">' +
                                              '    <path stroke-width="1" ' + 
                                              '          stroke="gray" ' + 
                                              '          fill="silver" ' +
                                              '          xbind="id:fn.calc=>@value" >' +
                                              '    </path>' + 
                                              '    <text text-anchor="middle" font-size="12px" ' + 
                                              '          stroke-width="0" ' + 
                                              '          stroke="white" ' + 
                                              '          fill="black" ' + 
                                              '          xbind="id:fn.calcLine=>@value">{value.text}</text>' + 
                                              '  </g>' +
                                              '</svg>',
                                  style : { width : '50%' }
                                });

    function __computeValues(values: number[]):any[] {
      let __total  = values.reduce((acc, v) => acc += v );
      let __offset = 0;
      return values.sort((a, b) => b - a).map((v, i, self) => {
        let __percent = v * 100 /__total;
        let __value   = {
          index      : i,
          value      : v,
          percent    : __percent,
          text       : '{0}%'.format(__percent.toFixed(1)),
          offset     : __offset,
          arc_start  : __offset * 3.6,
          arc_center : (__offset + __percent / 2) * 3.6,
          arc_end    : (__offset + __percent) * 3.6,
          angle      : g.Radians(-90 + ((__offset + __percent / 2) * 3.6)),
          direction  : new g.Vector2(0, 0)
        }
        __value.direction = new g.Vector2(Math.cos(__value.angle), Math.sin(__value.angle))
        __offset += __percent;
        return __value;
      });
    }

    var __values = [
      ~~g.Random(345, ~~g.Random(100,50)),
      ~~g.Random(345, ~~g.Random(100,50)),
      ~~g.Random(345, ~~g.Random(100,50)),
      ~~g.Random(345, ~~g.Random(100,50)),
      ~~g.Random(345, ~~g.Random(100,50)),
      ~~g.Random(345, ~~g.Random(100,50)),
      ~~g.Random(345, ~~g.Random(100,50)),
      ~~g.Random(345, ~~g.Random(100,50)),
      ~~g.Random(345, ~~g.Random(100,50))
    ].slice(0, ~~g.Random(9, 2));

    var __context = { 
      values  : __computeValues(__values),
      fn      : {
        calc: function (value:any, target:SVGPathElement) {

          var __trans = value.direction.clone().mul(4);
          target.setAttribute('d', describeArc(0, 0, 150, value.arc_start, value.arc_end));
          target.setAttribute('transform', 'translate({x},{y})'.format(__trans));
          target.setAttribute('fill', COLORS.next());
          return 'sector-{0}'.format(value.index);

        },
        calcLine: function (value:any, target:SVGTextElement) {
          
          var __textPoint =  value.direction.clone().mul(150 * 1.07);
          target.setAttribute('x', __textPoint.x.toString());
          target.setAttribute('y', __textPoint.y.toString());
          target.setAttribute('transform', 'rotate({0},{x},{y})'.format(value.arc_center, __textPoint));

          return 'text-{0}'.format(value.index);

        }
      }
    };

    pubSub.publish(
      'msg/main-page/test/content',
      '<p>Generación de gráficos de tarta (svg + executeTemplate)</p>' +
      executeTemplate(__template, [__context])
    );

  }

}

export class LineChartAction {
 
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
  }

  // ============================================================
  // Render
  // ============================================================
  run() {
 let __max = 60;

    //  [~~g.Random(__max, 10), "", ""]
    let __document = createDocument({ 
      streams : {
        distance : { data : [0, 100, 200, 300, 500, 800, 900, 950]},
        altitude : { data : [150, 50, 26, 155, 60, 45, 40, 0]},
        s2       : { data : [150, 50, 200, 185, 160, 145, 120, 0]}
      }
    });   

    pubSub.publish(
      'msg/main-page/test/content',
      '<p>Control de gráficos de lineas (svg)</p>' +
      '<div class="jjj-5"></div>'
    );

    setTimeout(() => {
      let __svg = new LineChart(750, 
                                300, 
                                __document, {
                                  padding    : new g.Box(20, 40, 40, 40)
                                }).getControl();
      core.element('.jjj-5').appendChild(__svg);
      pubSub.subscribe('msg/line_chart/range', (name: string, value: any) => {
        console.log(value);
      });

      pubSub.subscribe('msg/line_chart/tap', (name: string, value: any) => {
        console.log(value);
      });

    }, 100);
  }

}