
import { Constants } from '../../app.constants';
import { core } from '../../lib/core';
import { addEventListeners } from '../../lib/core.declarative';
import { ProveedoresPageComponent } from './table-component';
import HTML from './tables-view.ts.html';

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

    addEventListeners(target, {}, {});

    let __container = this._content
                          .querySelector<HTMLElement>('[table-container]');
    new ProveedoresPageComponent()
      .renderTo(__container)
      .loadData();
  }
 
}