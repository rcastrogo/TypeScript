
import HTML from './tabbly-reports-js-view.ts.html';
import { Constants } from '../../app.constants';
import { core } from '../../lib/core';
import { ajax } from '../../lib/core.ajax';
import { addEventListeners } from '../../lib/core.declarative';
import { ReportEngine } from '../../lib/core.tabbly.v2.engine';
import { loader } from '../../lib/core.tabbly.v2.loader';
import include from '../../lib/core.include';

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
    addEventListeners(target, {}, {});
    this.__loadReport(this._content.querySelector('[report-container]'));
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
      var __rd = (window as any).__reportDefinition(loader, core);
      // =======================================================================
      // Cargar los datos
      // =======================================================================
      ajax.get('./js/data/proveedores.json')
          .then((res:string) => {
            __handler.clear()
            new ReportEngine().generateReport(__rd, JSON.parse(res), __handler);
            target.append(core.build('div', { innerHTML : __handler.buffer }));
            addEventListeners(target, {}, __rd.getContext());
            cancel();      
      });
    });
  }

}

