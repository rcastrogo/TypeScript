
import HTML from './commands-view.ts.html';
import { core} from '../../lib/core';
import { addEventListeners } from '../../lib/core.declarative';
import { Command, CommandManager } from '../../lib/core.commands';
import { Constants } from '../../app.constants';
import include from '../../lib/core.include';

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
        this._document.name = 'Valor inicial';
        let __container = this._content.querySelector<HTMLElement>('[message-container]');
        __container.innerHTML = this._document.name + '<br/>';
        this._commandManager.executeCommad(ToUpperCaseCommand());
        __container.innerHTML += this._document.name + '<br/>';
        this._commandManager.undo();
        __container.innerHTML += this._document.name + '<br/>';
        this._commandManager.redo();
        __container.innerHTML += this._document.name + '<br/>';
        
      }
    },{});

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