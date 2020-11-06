
import { Constants } from '../../app.constants';
import { core } from '../../lib/core';
import { ajax } from '../../lib/core.ajax';
import { addEventListeners } from '../../lib/core.declarative';
import { ReportEngine as reportEngine } from '../../lib/core.tabbly.engine';
import { loader as reportLoader } from '../../lib/core.tabbly.loader';
import HTML from './tabbly-reports-view.ts.html';

export class TabblyReportsView {

  private _config = core.config(Constants.APP_CONFIG_NAME);
  private _content:HTMLElement;
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
    this._config.write('TabblyReportsView', Date.now.toString());
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
    // ==========================================================================
    // Definición del informe
    // ==========================================================================
    ajax.get('./js/pro-0001.txt')
        .then((res:string) => {
          var __rd = reportLoader.load(res);
          // ====================================================================
          // Datos del informe
          // ====================================================================
          ajax.get('./js/data/proveedores.json')
              .then((res:string) => {

                new reportEngine()
                  .fromReportDefinition(__rd, JSON.parse(res), (html:string) => { 
                    target.append(core.build('div', { innerHTML : html }, true));
                    addEventListeners(target, {}, __rd.getContext());                       
                  });
                
              });              
        });      
  }

}