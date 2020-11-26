import { createColors, niceScale } from '@src/charts/utils';
import { Box, Rectangle } from '@src/math';
import { core } from '@src/core';

const STEPS_SCALE_Y = 25;
const COLORS = createColors(30); 

export default class BarChart {

  private data:Array<any>;
  private legends:Array<any>;
  private series:Array<any>;

  private width:number;
  private height:number;
  private bounds:Rectangle;
  private padding:Box;

  private showBars = true;
  private showDots = true;
  private showLine = true;
  private showValues = true;

  private svg:SVGElement;
  private ratio:number;
  private maxValue:number;
  private worldToScreenY = (y: number) => y * this.ratio * this.bounds.height / 100;

  public getControl = () => this.svg;

  public constructor(width:number, 
                     height:number, 
                     data:Array<Array<any>>, 
                     padding?:Box,
                     showBars = true,
                     showDots = true,
                     showLine = true,
                     showValues = true) {
    // ==========================================================================
    // Comportamiento
    // ==========================================================================
    this.showBars = showBars;
    this.showDots = showDots;
    this.showLine = showLine;
    this.showValues = showValues;
    // ==========================================================================
    // Inicializar posición y tamaño
    // ==========================================================================
    this.width   = width;
    this.height  = height;
    this.padding = padding || new Box(0, 0, 0, 0);
    this.bounds  = new Rectangle(
      this.padding.left, 
      this.padding.top, 
      this.width  - this.padding.left - this.padding.right,
      this.height - this.padding.top - this.padding.bottom);
    // ==========================================================================
    // Crear el elemento SVG
    // ==========================================================================
    var __html = ('<svg width="{width}"' + 
                  '     height="{height}">' +
                  '  <g class="lines"></g>' +
                  '  <g class="data"></g>' +
                  '  <g class="text"></g>' +
                  '</svg>').format(this)
    this.svg = core.build('div', __html, true) as any;
    // ==========================================================================
    // Inicializar los datos
    // ==========================================================================
    this.data = data.map(function(values, i){       
                      return { 
                        value  : values[0],                          
                        legend : values[1] || '',
                        serie  : values[2] || '',                         
                        fill   : values[3] || COLORS.next() };
                    });
    this.maxValue = 1.05 * this.data.reduce((a, d) => Math.max(d.value, a), -Infinity);
    this.ratio    = 100.0 / this.maxValue;
    // ==========================================================================
    // Grupos o series
    // ==========================================================================
    this.series = Object.entries(this.data.groupBy('serie'))
                        .map(function(group){                            
                            return { key  : group[0], 
                                     text : group[0], 
                                     fill : group[1][0].fill,
                                     rows : group[1]};               
                        })
                        .where( (s:any) => s.key );
    // ==========================================================================
    // Textos asociados a los valores
    // ==========================================================================
    this.legends = Object.entries(this.data.groupBy('legend'))
                         .map((group) => {
                           let __rows  = group[1];
                           let __color = __rows[0].fill;
                           // =============================================
                           // Color de los elementos con la misma leyenda
                           // =============================================
                           if (this.series.length) {
                              __rows.forEach( (r:any) => r.fill = __color);
                           }
                           return { key  : group[0], 
                                    text : group[0], 
                                    fill : __color,
                                    rows : __rows};               
                         }); 
    this.calcLayout();
  } 

  // ==============================================================================
  // Calcular la posición de las barras
  // ==============================================================================
  private calcLayout() {

    var __totalBarWidth = this.bounds.width / this.data.length;
    var __margin        = __totalBarWidth * .1;
    var __marginSerie   = __margin * 10;
    var __barWidth      = __totalBarWidth - __margin / this.data.length;
    var __offset        = 0;

    let __createBars = (rows:any[]) => {
      rows.forEach( (value:any, i:number, self) => {
        var __height = this.worldToScreenY(value.value);
        var __top    = this.bounds.top + this.bounds.height - __height;
        var __left   = this.bounds.left + __margin + __offset;;
        value.bar    = new Rectangle(__left, __top, __barWidth - __margin, __height);
        __offset += __barWidth;
      });   
    }
    
    if (this.series.length) {
      __barWidth -= __marginSerie * (this.series.length) / this.data.length;
      this.series
          .forEach((serie) => {
            serie.left = this.bounds.left + __offset;
            __createBars(serie.rows);
            __offset += __marginSerie;
            serie.width = this.bounds.left + __offset - serie.left;
      });
    } else {
      __createBars(this.data);  
    }  
    this.draw();
  }

  // =====================================================================
  // draw
  // =====================================================================
  private draw(){    
    this.drawVerticalLines();
    this.drawAxisX();
    this.drawAxisY();
    this.drawBars(); 
    this.drawLine();
    this.drawSeries();
  }

  // =====================================================================
  // drawAxisX
  // =====================================================================
  private drawAxisX() {
    let __html = (
      '<line x1="{0}" y1="{1}" x2="{2}" y2="{1}"' +
      '      stroke="black"' + 
      '      stroke-width="2" />'
      ).format(this.bounds.left - 4,  
               this.bounds.top + this.bounds.height,
               this.bounds.left + this.bounds.width + 4);
    this.svg
        .querySelector<SVGGElement>('g.lines')
        .insertAdjacentHTML("beforeend", __html);
  }

  // =====================================================================
  // drawAxisY
  // =====================================================================
  private drawAxisY() {
    let __html = '<line x1="{0}" y1="{1}" x2="{0}" y2="{2}"' + 
                 '      stroke="black"' + 
                 '      stroke-width="2" />';
    __html = __html.format(this.bounds.left, 
                           this.bounds.top - 2, 
                           this.bounds.top + this.bounds.height + 4);
    let __template = '<line x1="{0}" y1="{1}" x2="{2}" y2="{1}"' + 
                     '      stroke="silver"' + 
                     '      stroke-width="1"/>';
    this.saveContext();
    this.currentFont.textAnchor = 'end';
    niceScale(0, this.maxValue, STEPS_SCALE_Y)
      .values
      .forEach( value => {
        let __height = this.worldToScreenY(value);
        let __top    = this.bounds.top + this.bounds.height - __height;
        if(__top < this.bounds.top) return;
        __html += __template.format(this.bounds.left, 
                                    __top, 
                                    this.bounds.left + this.bounds.width);

        this.appendText(this.bounds.left - 6, __top + 4, value.toFixed(0));
    });
    this.restoreContext();
    this.svg
        .querySelector<SVGGElement>('g.lines')
        .insertAdjacentHTML("beforeend", __html);
  }

  // =========================================================================================
  // drawVerticalLines
  // =========================================================================================
  private drawVerticalLines(){
    let __template = '<line x1="{0}" y1="{1}" x2="{0}" y2="{2}"' + 
                     '      stroke="{3}"' + 
                     '      stroke-width="1" />';
    let __html = this.data
                     .reduce((html:string, item:any, i:number) => {  
                        var __point = (item.bar as Rectangle).centerPoint();
                        return html += __template.format(__point.x, 
                                                         this.bounds.top - 4,
                                                         this.bounds.top + this.bounds.height 
                                                                         + 4,
                                                         'silver');        
                     }, '') +
                 this.series
                     .reduce((html:string, serie:any, i:number, self) => {
                       if(i == self.length - 1) return html;
                       return html += __template.format(serie.left + serie.width, 
                                                        this.bounds.top - 4,
                                                        this.bounds.top + this.bounds.height,
                                                        'black');        
                     }, '');
    this.svg
        .querySelector<SVGGElement>('g.lines')
        .insertAdjacentHTML("beforeend", __html);
  }

  // =========================================================================================
  // drawBars
  // =========================================================================================
  private drawBars(){
    let __template = '<rect x="{0}" y="{1}" width="{2}" height="{3}"' + 
                     '      stroke="black"' + 
                     '      stroke-width="2"' + 
                     '      fill="{4}"' + 
                     '      data-index="{5}" />';
    let __html = this.data
                     .reduce((html:string, item:any, i:number) => {  
                        var rec = item.bar as Rectangle;
                        // Leyenda ===============================================
                        this.appendText(rec.centerPoint().x,
                                        this.bounds.top + this.bounds.height + 14,
                                        item.legend);
                        if (this.showBars) {
                          // Valor ===============================================      
                          if (this.showValues) this.appendText(rec.centerPoint().x,
                                                               rec.centerPoint().y,
                                                               item.value);
                          // Barra ===============================================
                          return html += __template.format(rec.left, 
                                                           rec.top, 
                                                           rec.width,
                                                           rec.height,
                                                           item.fill,
                                                           i);   
                        }
     
                     }, '');
    this.svg
        .querySelector<SVGGElement>('g.data')
        .insertAdjacentHTML("beforeend", __html);
  }

  // =========================================================================================
  // drawSeries
  // =========================================================================================
  private drawSeries(){
    this.saveContext();
    this.currentFont.fontSize   = '20px';
    this.currentFont.textAnchor = 'middle';
    this.series
        .forEach((serie:any, i:number) => {    
          this.appendText(serie.left + serie.width / 2,
                          this.bounds.top + this.bounds.height + 40,
                          serie.text)      
        });
    this.restoreContext();
  }

  // =========================================================================================
  // drawDots
  // =========================================================================================
  private drawLine(){

    let __template = '<circle cx="{0}" cy="{1}" r="5" ' + 
                     '        stroke="black"' + 
                     '        stroke-width="2" ' + 
                     '        fill="white" />';

    let __createDots = (values:Array<any>) => {
      // Valores ============================================================================
      if (this.showLine && this.showValues) {
        values.forEach((item:any, i:number) => {  
                        var rec = item.bar as Rectangle;
                        this.appendText(rec.centerPoint().x, rec.top - 12, item.value);      
                      });
      }
      // Linea ==============================================================================
      let __line = values.reduce((path:string, item:any, i:number) => {
                            var rec = item.bar as Rectangle;
                            return path += '{0}{1},{2}'.format(i == 0 ? 'M' : 'L',
                                                               rec.centerPoint().x, 
                                                               rec.top);
                          }, '<path d="') + 
                          '" fill="none"' + 
                          '  stroke-dasharray="5,5"' + 
                          '  stroke="gray"' + 
                          '  stroke-width="2"/>';
      // Puntos =============================================================================
      let __points = values.reduce((html:string, item:any, i:number) => {  
                              var rec = item.bar as Rectangle;                            
                              return html += __template.format(rec.centerPoint().x, 
                                                               rec.top,
                                                               item.fill);        
                            }, '');
      return (this.showLine ? __line : '') + 
             (this.showDots ? __points : '');
    }

    let __html = '';
    if (this.series.length) {
      __html = this.series
                   .map((serie) => __createDots(serie.rows))
                   .join('');     
    } else {
      __html =  __createDots(this.data);  
    } 

    this.svg
        .querySelector<SVGGElement>('g.data')
        .insertAdjacentHTML("beforeend", __html);
  }

  private fonts:Array<any> = [];
  private currentFont = { fontFamily : 'Verdana', 
                          fontSize   : '11px',
                          textAnchor : 'middle' };
  private saveContext() {
    this.fonts.push(core.clone(this.currentFont));
  }
  private restoreContext() {
    if(this.fonts.length) this.currentFont = this.fonts.pop();
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
 