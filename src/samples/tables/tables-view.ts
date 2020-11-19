
import { Constants } from '../../app.constants';
import { core } from '../../lib/core';
import { addEventListeners } from '../../lib/core.declarative';
import { ProveedoresPageComponent } from './table-component';
import HTML from './tables-view.ts.html';
import include from '../../lib/core.include';
import { CollapsibleBox } from '../../lib/controls.collapsible-box';
import { ListViewComponent } from './list-view-component';

export class TablesView {

  private _config = core.config(Constants.APP_CONFIG_NAME);
  private _content:HTMLElement;
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
    this._config.write('TablesView', Date.now.toString());
    this._content = core.build('div', { innerHTML : HTML}, true);
  }
  // ============================================================
  // Render
  // ============================================================
  render(target: HTMLElement) {

    target.innerHTML = '';
    target.appendChild(this._content);

    addEventListeners(target, {
      localInnerText: (e:HTMLElement, value:string, mode: string) => {
        e.innerText = value;
        include('./js/w3codecolor.js')
          .then(() => e.innerHTML = w3CodeColorize(e.innerHTML, mode) );       
      }
    }, {});

    // ==========================================================================
    // Edición de tablas
    // ==========================================================================
    new ProveedoresPageComponent()
      .renderTo(core.element('[table-container]', this._content))
      .loadData();

    // ==========================================================================
    // ListView
    // ==========================================================================
    CollapsibleBox.create('Listview', '-')
                  .appendTo(core.element('[list-view-container]', this._content))
                  .onexpand.add(this.__loadListview);

    include('./js/w3codecolor.js')
      .then(() => this.__colorize());
  }

  __loadListview(event:string, sender:CollapsibleBox){
    if(sender.loaded) return;
    sender.loaded = true;
    new ListViewComponent()
          .renderTo(sender.getBody())
          .loadData();
  }

  private __colorize() {
    this._content
        .querySelectorAll<Element>('.js')
        .toArray()
        .forEach( e => e.innerHTML = w3CodeColorize(e.innerHTML, 'js'));   
  }
 
}