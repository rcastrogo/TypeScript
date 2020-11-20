
import { Constants } from '../../app.constants';
import { core } from '../../lib/core';
import { ajax } from '../../lib/core.ajax';
import { addEventListeners } from '../../lib/core.declarative';
import { ReportEngine } from '../../lib/core.tabbly.v2.engine';
import { loader } from '../../lib/core.tabbly.v2.loader';
import HTML from './tabbly-reports-v2-view.ts.html';
import include from '../../lib/core.include';
import pubSub from '../../lib/core.pub-sub';

export class TabblyReportsV2View {

  private _config = core.config(Constants.APP_CONFIG_NAME);
  private _content:HTMLElement;
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
    this._config.write('TabblyReportsV2View', Date.now.toString());
    this._content = core.build('div', { innerHTML : HTML}, true);
  }
  // ============================================================
  // Render
  // ============================================================
  render(target: HTMLElement) {
    target.innerHTML = '';
    target.appendChild(this._content);
    addEventListeners(target, {
      localInnerText: (e:HTMLElement, value:string) => {
        e.innerText = value;
        e.innerHTML = w3CodeColorize(e.innerHTML, 'js');
      }
    }, {});
    this.__loadReport(this._content.querySelector('[report-container]'));
    include('./js/w3codecolor.js')
      .then(() => this.__colorize());
  }

  private __colorize() {
    this._content
        .querySelectorAll<Element>('.jsHigh,.htmlHigh')
        .toArray()
        .map( e => ({ e : e, mode : e.classList.contains('jsHigh') ? 'js' : 'html' }))
        .forEach( e => e.e.innerHTML = w3CodeColorize(e.e.innerHTML, e.mode));   
  }

  private __loadReport(target:HTMLElement){
    
    /* ==========================================================================
    // Receptor de mensajes
    // ========================================================================== */
    var __handler = { 
      buffer  : '' ,
      send    : function(data:string){ this.buffer += data; },
      message : function(message:any){ 
        //console.log(message); 
      },
      flush   : function(){ },
      clear   : function(){ this.buffer = ''; }
    };

    // =============================================================================
    // Definición del informe
    // =============================================================================
    ajax.get('./js/pro-0001-v2.txt')
        .then((res:string) => {
          var __rd = loader.load(res);
          pubSub.publish('msg/rpt/definition', res);
          // =======================================================================
          // Datos del informe
          // =======================================================================
          ajax.get('./js/data/proveedores.json')
              .then((res:string) => {
                new ReportEngine().generateReport(__rd, JSON.parse(res), __handler);
                target.appendChild(core.build('div', { innerHTML : __handler.buffer }));

                addEventListeners(target, {}, __rd.getContext()); 
                pubSub.publish('msg/rpt/data', JSON.stringify(JSON.parse(res), null, 2));
              });                          
        });      
  }
 
}

