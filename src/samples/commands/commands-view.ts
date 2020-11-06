
import HTML from './commands-view.ts.html';
import { core} from '../../lib/core';
import { addEventListeners } from '../../lib/core.declarative';
import { Command, CommandManager } from '../../lib/core.commands';
import { Constants } from '../../app.constants';

export class CommandsView {

  private _config = core.config(Constants.APP_CONFIG_NAME);
  private _content:HTMLElement;

  private _document = { name : 'Valor inicial' };
  private _commandManager = CommandManager(this._document);

  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
     this._config.write('CommandsView', Date.now.toString());
  }
  // ============================================================
  // Render
  // ============================================================
  render(target: HTMLElement) {
    this._content = core.build('div', { innerHTML : HTML}, true);
    target.innerHTML = '';
    target.appendChild(this._content);
    addEventListeners(target, {
      doCommand : () => {

        console.log(this._document.name);
        this._commandManager.executeCommad(ToUpperCaseCommand());
        console.log(this._document.name);
        this._commandManager.undo();
        console.log(this._document.name);
        this._commandManager.redo();
        console.log(this._document.name);
        
      }
    },{});
  }
 
}

function ToUpperCaseCommand(): Command {

  let __command = {
    bak     : '',
    execute : function (doc:any): Command {
      this.bak = doc.name;
      doc.name = doc.name.toUpperCase();
      return __command;
    },
    undo    : function (doc:any): Command {
      doc.name = this.bak;
      return __command;
    }
  }

  return __command;

}