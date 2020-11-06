
import HTML from './pub-sub-view.ts.html';
import { core } from '../../lib/core';
import pubSub from '../../lib/core.pub-sub';
import { addEventListeners } from '../../lib/core.declarative';
import { Command, CommandManager } from '../../lib/core.commands';
import { Constants } from '../../app.constants';

export class PubSubView {

  private _config = core.config(Constants.APP_CONFIG_NAME);
  private _content:HTMLElement;
  // ============================================================
  // Constructor
  // ============================================================
  constructor() {
     this._config.write('PubSubView', Date.now.toString());
  }
  // ============================================================
  // Render
  // ============================================================
  render(target: HTMLElement) {
    this._content = core.build('div', { innerHTML : HTML}, true);
    target.innerHTML = '';
    target.appendChild(this._content);
    addEventListeners(target, {
      doPublish : function(){
        pubSub.publish(pubSub.TOPICS.NOTIFICATION, 'Botón doPublish'); 
          setTimeout( function(){
            pubSub.publish(pubSub.TOPICS.NOTIFICATION, ''); 
          }, 2000);
        }
    },{});
  }
 
}


//pubSub.subscribe( pubSub.TOPICS.NOTIFICATION, (a:any, b:any, c:any) => {
//  console.log(a, b, c);
//  console.log(core.getValue('location'));
//  console.log('Resultado: {0|toUpperCase}'.format('hola'));
//  include('js/rafa.js').then(() => {
//    var __lib = (window as any).__rafa;
//    __lib.write('55544');
//  });
//});

//  pubSub.publish(pubSub.TOPICS.NOTIFICATION, 'Hola Caracola from app-component', 25);