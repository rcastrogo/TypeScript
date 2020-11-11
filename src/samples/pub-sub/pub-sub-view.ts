
import { Constants } from '../../app.constants';
import { core } from '../../lib/core';
import { addEventListeners } from '../../lib/core.declarative';
import pubSub from '../../lib/core.pub-sub';
import HTML from './pub-sub-view.ts.html';
import include from '../../lib/core.include';

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