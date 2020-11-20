
import { Constants } from '../../app.constants';
import { core } from '../../lib/core';
import { ajax } from '../../lib/core.ajax';
import { addEventListeners } from '../../lib/core.declarative';
import include from '../../lib/core.include';
import { ReportEngine } from '../../lib/core.tabbly.v2.engine';
import { loader } from '../../lib/core.tabbly.v2.loader';
import HTML from './tabbly-reports-js-view.ts.html';
import pubSub from '../../lib/core.pub-sub';


export class TabblyReportsJsView {

  private _config = core.config(Constants.APP_CONFIG_NAME);
  private _content:HTMLElement;
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
    this._config.write('TabblyReportsJsView', Date.now.toString());
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
    // =========================================================================
    // Receptor de mensajes
    // =========================================================================
    var __handler = { 
      buffer  : '' ,
      send    : function(data:string){ this.buffer += data; },
      message : function(message:any){ 
        //console.log(message); 
      },
      flush   : function(){ },
      clear   : function(){ this.buffer = ''; }
    };
    // =========================================================================
    // Cargar el informe
    // =========================================================================
    include('./js/pro-0001.js').then((cancel:Function) => {
      var __rd = __reportDefinition(loader, core);
      // =======================================================================
      // Cargar los datos
      // =======================================================================
      ajax.get('./js/data/proveedores.json')
          .then((res:string) => {
            __handler.clear()
            new ReportEngine().generateReport(__rd, JSON.parse(res), __handler);
            target.appendChild(core.build('div', { innerHTML : __handler.buffer }));
            addEventListeners(target, {}, __rd.getContext());
            cancel();
            pubSub.publish('msg/rpt/data', JSON.stringify(JSON.parse(res), null, 2));
      });
    });
     ajax.get('./js/pro-0001.js')
         .then((res:string) => { 
           pubSub.publish('msg/rpt/definition', res);
         });
  }

}

