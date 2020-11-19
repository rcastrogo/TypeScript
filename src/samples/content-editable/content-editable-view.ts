
import { Constants } from '@src/../app.constants';
import { CollapsibleBox } from '@src/controls.collapsible-box';
import * as grid from '@src/controls.editable-grid';
import { TextViewer } from '@src/controls.text-viewer';
import { core } from '@src/core';
import { ajax } from '@src/core.ajax';
import { addEventListeners } from '@src/core.declarative';
import pubSub from '@src/core.pub-sub';
import { fillTemplate } from '@src/core.templates';
import HTML from './content-editable-view.ts.html';


export class ContentEditableView {

  private _config = core.config(Constants.APP_CONFIG_NAME);
  private _content:HTMLElement; 
  private _editableGrid:grid.EditableGrid;
  private _textViewer:TextViewer;
  private _data = [ 
    { id: 1, descripcion: 'Descripción 1'},
    { id: 2, descripcion: 'Descripción 2'},
    { id: 3, descripcion: 'Descripción 3'}
  ]
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
    this._config.write('ContentEditableView', Date.now.toString());
    this._textViewer = new TextViewer();
  }
  // ============================================================
  // Render
  // ============================================================
  render(target: HTMLElement) {
    // ====================================================================
    // Crear UI
    // ====================================================================
    this._content = core.build('div', { innerHTML : HTML}, true); 
    target.innerHTML = '';
    target.appendChild(this._content);
    fillTemplate(target, { data : this._data });
    // ====================================================================
    // Enlazar eventos declarados en el html
    // ====================================================================
    addEventListeners(target, {
      writeLog : (e:HTMLElement, value:string, mode:string) => {
        if (mode && mode == 'append') return e.innerHTML += value + '<br/>'; 
        e.innerHTML = value;
      },
      doSave: () => {
        let data = target.querySelectorAll<HTMLTableCellElement>('td[data-index]')
                         .toArray()
                         .map(c => c.textContent)
                         .split(2)
                         .map((cells, i) => {
                           return { source : this._data[i],
                                    edit   : { id          : cells[0],
                                               descripcion : cells[1]}}});
        pubSub.publish('msg/log', JSON.stringify(data, null, 2));

      }
    },{});
    // ====================================================================
    // Inicializar la edición de la tabla
    // ====================================================================
    let __table = target.querySelector<HTMLTableElement>('table');
    this._editableGrid = new grid.EditableGrid(
      __table,
      // ===========================================================================
      // onFocus
      // ===========================================================================
      (sender, event) => {
        event.td.style.outline   = '0px solid transparent';
        let message = 'onfocus -> [{td.dataset.index}, {td.cellIndex}] id: {tr.id}';
        pubSub.publish('msg/log', message.format(event));
      },
      // ===========================================================================
      // onChange
      // ===========================================================================
      (sender, event) => {
        let message = 'onChange -> [{td.dataset.index}, {td.cellIndex}] ' +
                      'id: {tr.id} [ {previous} -> {current}]';
        pubSub.publish('msg/log', message.format(event));  
      });
    // ====================================================================
    // Inicializar el visor de texto
    // ====================================================================
    target.querySelector('[text-viewer]')
          .appendChild(this._textViewer.getControl());
    ajax.get('./js/pro-0001.txt')
        .then((res:string) => {
          this._textViewer.setContent(res);
          this._textViewer.onclick.add( (sender:string, args:any) => {
            console.log(sender, args);
          });
        });
    // ================================================================================================
    // Ejemplo de collapsibleBox
    // ================================================================================================
    let c = new CollapsibleBox('Mensajes').appendTo(this._content)
                                          .setContent(this._content
                                                          .querySelector<HTMLElement>('[log]'));
    c.onexpand.add( (eventName:string, sender:CollapsibleBox) => {
      //sender.setContent('');
    });
    c.getControl().classList.add('w3-margin');

    setTimeout(() => c.expand(), 5000);

  }

}
