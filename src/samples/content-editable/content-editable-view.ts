
import HTML from './content-editable-view.ts.html';
import { core} from '@src/core';
import { addEventListeners } from '@src/core.declarative';
import { Command, CommandManager } from '@src/core.commands';
import { Constants } from '@src/../app.constants';
import { fillTemplate } from '@src/core.templates';
import include from '@src/core.include'; 
import pubSub from '@src/core.pub-sub';

export class ContentEditableView {

  private _config = core.config(Constants.APP_CONFIG_NAME);
  private _content:HTMLElement; 
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
  }
  // ============================================================
  // Render
  // ============================================================
  render(target: HTMLElement) {
    this._content = core.build('div', { innerHTML : HTML}, true); 
    target.innerHTML = '';
    target.appendChild(this._content);

    let __context = {
      data : this._data,
      onblur: () => {
        return (e:FocusEvent) => {
          let td = e.currentTarget as HTMLElement;
          td.style.fontStyle = '';
          pubSub.publish(
            'msg/log', 
            'onblur: {index}, {bak}'.format(td.dataset)
          );
        }  
      },
      onfocus: () => {
        return (e:FocusEvent) => {
          let td = e.currentTarget as HTMLElement;
          td.style.fontStyle = 'italic';
          td.style.outline   = '0px solid transparent';
          pubSub.publish(
            'msg/log', 
            'onfocus: {index}, {bak}'.format(td.dataset)
          );
        }  
      },
      onkeypress: () => {
        return (e:KeyboardEvent) => {
          if(e.keyCode==13){                   
            e.preventDefault();
            return false;      
          } 
        }
      }
    }

    fillTemplate(target, __context);

    addEventListeners(target, {
      doSave: () => {
        let size = 2;
        let data = target.querySelectorAll<HTMLTableCellElement>('td[data-index]')
                         .toArray()
                         .map( c => c.textContent)
                         .reduce((acc, curr, i, self) => {
                            if(!(i % size)) return [...acc, self.slice(i, i + size)];
                            return acc;
                         }, [])
                         .map( (cells, i) => {
                           return { source : this._data[i],
                                    edit   : { id          : cells[0],
                                               descripcion : cells[1]}}});
        pubSub.publish('msg/log', JSON.stringify(data, null, 2));

      }
    },{});

  }

}
