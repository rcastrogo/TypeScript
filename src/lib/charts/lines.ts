import { createColors, PathBuilder, niceScale } from './utils';
import { Box, Rectangle, Vector2 } from '../math';
import { core } from '../core';
import pubsub from '../core.pub-sub';

const STEPS_SCALE_Y = 8;
const COLORS = createColors(30); 

export interface LineChartOptions {
  padding?:Box;
}

export default class LineChart {

  private document:any;
  private mouse:any;

  private width:number;
  private height:number;
  private bounds:Rectangle;
  private padding:Box;

  private svg:SVGElement;
  private layer:SVGRectElement;
  private ratio:Vector2;

  public getControl     = () => this.svg;
  public worldToScreenX = (x:number) => this.bounds.left + (x * this.ratio.x * this.bounds.width / 100);
  public worldToScreenY = (y:number) => this.bounds.top + this.bounds.height - ((y - this.document.view.y.min)  * this.ratio.y * this.bounds.height / 100);
  public screenToWorldX = (x:number) => {
    var __x = x * (this.width / this.svg.clientWidth);
    return this.document.view.x.min + (__x - this.bounds.left) * 100 / (this.bounds.width *  this.ratio.x );
  }
  public indexPoinAt    = (distance:number) => {
                            var __i = -1;
                            this.document.distances.forEach( function(d:number){ if(d > distance) return; __i++; });
                            return __i;
                          };

  public constructor(width:number, 
                     height:number, 
                     document:any, 
                     o:LineChartOptions) {
    // ====================================================================
    // Comportamiento
    // ====================================================================
    //
    // ====================================================================
    // Inicializar posición y tamaño
    // ====================================================================
    this.mouse   = {};
    this.width   = width;
    this.height  = height;
    this.padding = (o && o.padding) ? o.padding : new Box(0, 0, 0, 0);
    this.bounds  = new Rectangle(
      this.padding.left, 
      this.padding.top, 
      this.width  - this.padding.left - this.padding.right,
      this.height - this.padding.top - this.padding.bottom);
    // ====================================================================
    // Crear el elemento SVG
    // ====================================================================
    var __html = ('<svg viewbox ="0 0 {width} {height}">' +
                  '  <defs>' +
                  '    <clipPath id="JJJ">' +
                  '      <rect y="0"' + 
                  '            x="{bounds.left}"' + 
                  '            width="{bounds.width}"' + 
                  '            height="{0}" />' +
                  '     </clipPath>' +
                  '  </defs>' +
                  '  <g class="lines"></g>' +
                  '  <g class="data" style="clip-path:url(#JJJ)"></g>' +
                  '  <g class="layer" style="clip-path:url(#JJJ)">' + 
                  '    <rect x="0" y="0" width="0" height="{0}" stroke="none"' + 
                  '       fill="rgb(0,0,200,.5)" />' +
                  '  </g>' +
                  '  <g class="text"></g>' +
                  '</svg>').format(this.bounds.height + this.bounds.top - 1, this)
    this.svg = (core.build('div', __html, true) as unknown) as SVGElement;
    this.svg.onmousemove  = this.onMouseMove;
    this.svg.onmouseup    = this.onMouseUp;
    this.svg.onmousedown  = this.onMouseDown;
    this.svg.onmouseleave = this.onMouseLeave;
    this.svg.ontouchstart = this.onTouchStart;
    this.svg.ontouchend   = this.onTouchEnd;
    this.svg.ontouchmove  = this.onTouchMove;
    this.layer = core.element<SVGRectElement>('g.layer rect', this.svg as any);
    // ==========================================================================
    // Inicializar los datos
    // ==========================================================================
    this.document = document;
    this.ratio = new Vector2(100.0 / this.document.view.x.range, 
                             100.0 / this.document.view.y.range);    
    this.draw();
  } 

  // =====================================================================
  // draw
  // =====================================================================
  private draw(){    
    this.drawScaleY();
    this.drawScaleX();
    this.drawAxes();
    this.drawLines();
  }

  // ===============================================================================================
  // drawAxes
  // ===============================================================================================
  private drawAxes() {
    let __h_tmp = '<line x1="{0}" y1="{1}" x2="{2}" y2="{1}" stroke="black" stroke-width="2" />';
    let __v_tmp = '<line x1="{0}" y1="{1}" x2="{0}" y2="{2}" stroke="black" stroke-width="2" />';
    let __html = __h_tmp.format(this.bounds.left - 4,  
                                this.bounds.top + this.bounds.height,
                                this.bounds.left + this.bounds.width + 4) +
                 __v_tmp.format(this.bounds.left, 
                                this.bounds.top - 2,
                                this.bounds.top + this.bounds.height + 4);
    this.svg
        .querySelector<SVGGElement>('g.lines')
        .insertAdjacentHTML("beforeend", __html);
  }

  // ===============================================================================================
  // drawScaleY
  // ===============================================================================================
  private drawScaleY() {
    let __html     = '';
    let __template = '<line x1="{0}" y1="{1}" x2="{2}" y2="{1}" stroke="silver" stroke-width="1"/>';
    let __right = this.bounds.left + this.bounds.width;
    this.saveContext();
    this.currentFont.fontSize = '9px';
    this.currentFont.textAnchor = 'end';
    var __serie = this.document.series[0];
    var __scale = niceScale(__serie.view.min, __serie.view.max, STEPS_SCALE_Y);
    __scale.values
           .forEach( value => {
        let __y = __serie.transform ? __serie.transform(this, value) : this.worldToScreenY(value);
        if(__y < this.bounds.top) return;
        __html += __template.format(this.bounds.left - 4, __y, __right);
        let __text = '{0} {1}'.format(value.toFixed(0), (__serie.unit || 'm'));
        this.appendText(this.bounds.left - 6, __y + 3, __text);
    });
    if (this.document.series[1]) {
      this.currentFont.textAnchor = 'start';
      __serie = this.document.series[1];
      __scale = niceScale(__serie.view.min, __serie.view.max, STEPS_SCALE_Y);
      __scale.values
             .forEach( value => {
          let __y = __serie.transform ? __serie.transform(this, value) : this.worldToScreenY(value);
          if(__y < this.bounds.top ||
             __y > this.bounds.top + this.bounds.height) return; 
          __html += __template.format(__right - 4, __y, __right);
          let __text = '{0} {1}'.format(value.toFixed(0), (__serie.unit || 'm'));
          this.appendText(__right + 2, __y + 3, __text);
      });       
    }
    this.restoreContext();

    this.svg
        .querySelector<SVGGElement>('g.lines')
        .insertAdjacentHTML("beforeend", __html);
  }

  // ===============================================================================================
  // drawScaleX
  // ===============================================================================================
  private drawScaleX() {

    this.saveContext();

    let __v_tmp   = '<line x1="{0}" y1="{1}" x2="{0}" y2="{2}" stroke="gray" stroke-width="1" />';
    var __offsetX = this.worldToScreenX(this.document.view.x.min) - this.bounds.left;
    let __html  = '';
    var __scale = niceScale(this.document.view.x.min, 
                            this.document.view.x.max,
                            Math.floor(this.bounds.width / 50));
    this.currentFont.fontSize = '9px';
    __scale.values
           .forEach( value => { 
             var __x_pos  = this.worldToScreenX(value) - __offsetX;
             if(__x_pos < this.bounds.left ||
                __x_pos > this.bounds.left + this.bounds.width ) return;
             __html += __v_tmp.format(__x_pos, 
                                      this.bounds.top - 4, 
                                      this.bounds.top + this.bounds.height + 4); 
             this.appendText(__x_pos, 
                             this.bounds.top + this.bounds.height + 12, 
                             '{0} km'.format((value / 1000).toFixed(1)));
           });
    this.svg
        .querySelector<SVGGElement>('g.lines')
        .insertAdjacentHTML("beforeend", __html); 
    
    this.restoreContext();
  }

  // ========================================================================================
  // drawLines
  // ========================================================================================
  private drawLines(){

    let __offsetX       = this.worldToScreenX(this.document.view.x.min) - this.bounds.left ;
    let __html          = '';
    let __dots_template = '<circle cx="{0}" cy="{1}" r="3" ' + 
                          '        stroke="black"' + 
                          '        stroke-width="1" ' + 
                          '        fill="white" />';
    this.document
        .series
        .forEach( (serie:any, i:number) => {
          // ================================================================================
          // Puntos 
          // ================================================================================
          let __points = this.document[serie.name]
                             .map((v:number, i:number) => { 
                                let x = this.worldToScreenX(this.document.distances[i]);
                                let y = serie.transform ? serie.transform (this, v)
                                                        : this.worldToScreenY(v);
                                return new Vector2(x - __offsetX, y); 
                              });
          let __points_html = __points.reduce((html:string, item:any, i:number, self:[]) => {
                return html += __dots_template.format(item.x, item.y, 'white'); 
          }, ''); 
          // ================================================================================
          // Linea
          // ================================================================================
          var __y = this.worldToScreenY(serie.view.min);
          var __x_min = this.worldToScreenX(this.document.view.x.min) - __offsetX;
          var __x_max = this.worldToScreenX(this.document.view.x.max) - __offsetX;
          __points = __points.concat(serie.closeLine ? [new Vector2(__x_max, __y),
                                                        new Vector2(__x_min, __y)] 
                                                     : []);
          let __path = PathBuilder.createPath(__points, .1, serie.closeLine)
          let __line_html = ('<path d="{0}" fill="{1}" ' + 
                             '      stroke-dasharray="" ' + 
                             '      stroke="{2}" ' + 
                             '      stroke-width="{3}" />'
                            ).format(
                              __path, 
                              serie.closeLine ? serie.fillStyle || COLORS.next() : 'none', 
                              serie.strokeStyle || 'black',
                              serie.lineWidth   || 1
                            ); 
          __html += __line_html + __points_html;     
    });

    this.svg
        .querySelector<SVGGElement>('g.data')
        .insertAdjacentHTML("beforeend", __html);
  }

  private onMouseLeave = (eventArg:MouseEvent) => {
    if(this.mouse.mouseDown){
      this.mouse.mouseDown = false;
      this.mouse.drag = false;
      this.clearLayer();     
    }
  }

  private onTouchEnd = (eventArg:TouchEvent) => {
    var __reset = () => {
      this.mouse.mouseDown = false;
      this.mouse.drag = false; 
      this.clearLayer(); 
      eventArg.preventDefault();
    }

    if(this.mouse.drag){
      pubsub.publish('msg/line_chart/range', {
        sender : this,
        start  : this.mouse.dragStart < 0 ? 0 : this.mouse.dragStart,
        end    : this.mouse.dragEnd
      });
      __reset();
      this.updateLayer();
      return;
    }   
    pubsub.publish('msg/line_chart/tap', {
      sender : this,
      x : this.screenToWorldX(this.mouse.mouseDownPosition.x)
    });
    __reset();
  }

  private onMouseUp = (eventArg:MouseEvent) => {
    var __pos   = { x :  eventArg.offsetX, y : eventArg.offsetY };
    var __reset = () => {
      this.mouse.mouseDown = false;
      this.mouse.drag = false; 
      this.clearLayer();
      eventArg.preventDefault();
    }
    // ====================================================================
    // 1 - Tap
    // ====================================================================
    if(this.mouse.mouseDown && this.mouse.mouseDownPosition.x == __pos.x 
                            && this.mouse.mouseDownPosition.y == __pos.y){ 
      pubsub.publish('msg/line_chart/tap', {
        sender : this,
        position : __pos,
        x : this.screenToWorldX(__pos.x)
      });
      return __reset();
    }
    // ====================================================================
    // 2 - Drag
    // ====================================================================
    if(this.mouse.drag){
      pubsub.publish('msg/line_chart/range', {
        sender : this,
        start  : this.mouse.dragStart < 0 ? 0 : this.mouse.dragStart,
        end    : this.mouse.dragEnd
      });
      __reset();
      this.updateLayer();
      return;
    }
    __reset();
  }

  private onTouchStart = (eventArg:TouchEvent) => {
    var event = window.document.createEvent("MouseEvent");
    let touch = eventArg.touches[0];
    event.initMouseEvent('mousedown', true, true, window, 1, 
                         touch.screenX, touch.screenY, 
                         touch.clientX, touch.clientY, false, 
                         false, false, false, 0, null);
    touch.target.dispatchEvent(event);
    eventArg.preventDefault();
  }

  private onMouseDown = (eventArg:MouseEvent) => {      
    this.mouse.mouseDown = true;
    this.mouse.mouseDownPosition = { x : eventArg.offsetX, y : eventArg.offsetY };       
    this.mouse.dragStart = this.mouse.dragEnd = this.indexPoinAt(this.screenToWorldX(this.mouse.mouseDownPosition.x));
    if (this.mouse.dragStart == -1) this.mouse.dragStart = 0;
    eventArg.preventDefault();
  } 
 
  private onTouchMove = (eventArg:TouchEvent) => {
    var event = window.document.createEvent("MouseEvent");
    let touch = eventArg.touches[0];
    event.initMouseEvent('mousemove', true, true, window, 1, 
                         touch.screenX, touch.screenY, 
                         touch.clientX, touch.clientY, false, 
                         false, false, false, 0, null);
    touch.target.dispatchEvent(event);
    eventArg.preventDefault();
  }

  private onMouseMove = (eventArg:MouseEvent) => {
    var __pos = { x : eventArg.offsetX, y : eventArg.offsetY };
    this.mouse.drag = this.mouse.mouseDown;// && __chart.bounds.contains(__pos);
    if(this.mouse.drag){
      this.mouse.dragEnd = this.indexPoinAt(this.screenToWorldX(__pos.x));
      if (this.mouse.dragEnd == -1) this.mouse.dragEnd = 0;
      this.updateLayerDrag(__pos);
    } 
    eventArg.preventDefault();
  }

  private updateLayerDrag(pos:any) {
    let x0 = (this.width / this.svg.clientWidth) * Math.min(pos.x, this.mouse.mouseDownPosition.x);
    let x1 = (this.width / this.svg.clientWidth) * Math.max(pos.x, this.mouse.mouseDownPosition.x);
    this.layer.setAttribute('x', x0.toString());
    this.layer.setAttribute('width', (x1 - x0).toString());
  }

  private updateLayer() {
    let x0 = this.worldToScreenX(this.document.distances[Math.min(this.mouse.dragStart, this.mouse.dragEnd)]);
    let x1 = this.worldToScreenX(this.document.distances[Math.max(this.mouse.dragStart, this.mouse.dragEnd)]);
    this.layer.setAttribute('x', x0.toString());
    this.layer.setAttribute('width', (x1 - x0).toString());
  }
  private clearLayer() {
    this.layer.setAttribute('width', "0");
  }

  private states:Array<any> = [];
  private currentFont = { fontFamily : 'Verdana', 
                          fontSize   : '11px',
                          textAnchor : 'middle' };

  private saveContext() {
    this.states.push(core.clone(this.currentFont));
  }

  private restoreContext() {
    if(this.states.length) this.currentFont = this.states.pop();
  }

  private appendText(x:any, y:any, text:string) {
    let __template = '<text x="{0}" y="{1}"' +
                     ' font-family="{fontFamily}" ' +
                     ' font-size="{fontSize}"' +
                     ' text-anchor="{textAnchor}">{2}</text>';
    this.svg
        .querySelector<SVGGElement>('g.text')
        .insertAdjacentHTML("beforeend", __template.format(x, y, text, this.currentFont));
  }
} 

export function createDocument(dataset:any){

    function __getRange(array:[], start:number, end:number){
      var __res = {
        min   : Number.POSITIVE_INFINITY, 
        max   : Number.NEGATIVE_INFINITY,
        range : undefined as number
      }; 
      var __current = start
      while(__current <= end){
        __res.min = Math.min(__res.min, array[__current]);
        __res.max = Math.max(__res.max, array[__current]);
        __current++;
      }
      __res.min   = __res.min;
      __res.range = __res.max - __res.min;
      return __res;
    }

    let document = { 
      series     : [] as any[],
      length     : dataset.streams.distance.data.length,
      distances  : dataset.streams.distance.data,
      altitude   : dataset.streams.altitude.data,
      s2         : dataset.streams.s2.data,
      offset     : 0.0,
      view       : {} as any,
      getRange   : __getRange,
      configureView : function (start:number, end:number){
        document.view.start   = start;
        document.view.end     = end; 
        document.view.x       = {}; 
        document.view.x.max   = document.distances[end] * 1.005;
        document.view.x.min   = document.distances[start];
        document.view.x.range = document.view.x.max - document.view.x.min; // Distancia
        document.view.y       = __getRange(document.altitude, start, end); // Altitud
        document.view.h       = __getRange(document.s2, start, end);       // Frecuencia cardiaca
        //document.view.spedd = __getRange(document.s3, start, end);       // Velocidad por ejemplo
        // ===============================================================================================
        // Configurar distintas series de datos
        // ===============================================================================================
        // TODO: Posibilitar mostrar un numero indeterminado de series. 
        document.series = [];
        document.series.push({ name        : 'altitude',
                               closeLine   : true,
                               showDots    : true,
                               unit        : 'm',
                               view        : document.view.y,
                               fillStyle   : 'rgba(225,125,125,.8)', 
                               lineWidth   : 1, 
                               strokeStyle : 'rgba(0,0,0,.8)',
                               ratio       : 100.0 / document.view.y.range });
        document.series.push({ name        : 's2',
                               closeLine   : false,
                               showDots    : false,
                               unit        : 'ppm',
                               view        : document.view.h,
                               fillStyle   : 'rgba(150,0,0,.8)', 
                               lineWidth   : 3, 
                               strokeStyle : 'rgba(00,0,250,.9)',
                               ratio       : 100.0 / document.view.h.range,
                               transform   : function(sender:any, v:number){
                                 return sender.bounds.top + 
                                        sender.bounds.height - 
                                        ((v - sender.document.view.h.min) * 
                                        this.ratio * sender.bounds.height / 120);
                               }});      
        return document;
      },
      resetView: function () {
        return document.configureView(0, document.length - 1);
      }
    };

    return document.resetView();

  }