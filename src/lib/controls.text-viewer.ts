
import {core} from "./core";
import {CoreEvent} from "./core.events";
import css from "./controls.text-viewer.ts.css";

var __data_Uri = 'data:text/css;base64,' + window.btoa(css);
var __template = '<div class="scv_Main">' +
                 '  <pre class="scv_LineContainer" id="svc_{0}_line"></pre>' +      
                 '  <pre class="scv_TextContainer" id="svc_{0}_code"></pre>' +                          
                 '</div>';

var __counter = 0;
var __css     = false;

function __initCss() {
  if(__css) return;
  document.querySelector('head')
          .appendChild(core.build('link', { rel  : 'stylesheet', 
                                            type : 'text/css',
                                            href : __data_Uri}));
  __css = true;
}

export class TextViewer {

  public id = 'svc_{0}'.format(++__counter);
  public readonly onclick: CoreEvent;
  private _control:HTMLElement;

  public constructor(){
    __initCss();
    this._control = core.build('div', { className : 'svc_viewer', 
                                        id        : this.id, 
                                        innerHTML : __template.format(__counter) });
    this._control
        .querySelector<HTMLElement>('.scv_Main')
        .onscroll = (event:Event) => {
      let __target = event.target as HTMLElement; 
      this._control
          .querySelector<HTMLElement>('.scv_LineContainer') 
          .style.left = '{0}px'.format(__target.scrollLeft); 
    };
    this.onclick = new CoreEvent('txt-viewer.onclick');
  }

  public setContent(value: string): TextViewer {
    this._control
        .querySelector('.scv_LineContainer')
        .innerHTML = value.replace(/(\r\n|\r|\n)/mg, '\n')
                          .split('\n')
                          .reduce((a, _, i) => a += (i + 1) + '<br/>', ''); 
    let __div = this._control.querySelector<HTMLElement>('.scv_TextContainer');
    __div.textContent = value;
    __div.onclick     = (e) => this.onclick.dispatch(e);
    // onLineClick
    // __div.innerHTML = (__div.innerHTML + '\n').replace(/^(.*)\r\n|\r|\n/gim, '<span>$1</span><br/>')
    return this;
  }

  public getControl(): HTMLElement { 
    return this._control;
  }

}



         

