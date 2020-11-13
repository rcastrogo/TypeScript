
import {core} from "./core";

var __template = '<div class="scv_overlayText"></div><div class="scv_overlayLine"></div>' + 
                  '<div class="scv_Main">' +
                  '  <pre class="scv_LineContainer" id="svc_{0}_line"></pre>' +      
                  '  <pre class="scv_TextContainer" id="svc_{0}_code"></pre>' +                          
                  '</div>';

var __counter = 0;

export class TextViewer {

  private _control:HTMLElement;

  public constructor(){
    this._control = core.build('div', { className : 'svc_viewer', 
                                        id        : 'svc_{0}'.format(++__counter), 
                                        innerHTML : __template.format(__counter) });
    this._control
        .querySelector<HTMLElement>('.scv_Main')
        .onscroll = (event:Event) => {
      let __target = event.target as HTMLElement;
      this._control
          .querySelector<HTMLElement>('.scv_overlayText')
          .style.left = '-{0}px'.format(__target.scrollLeft);  
      this._control
          .querySelector<HTMLElement>('.scv_overlayLine')
          .style.left = '-{0}px'.format(__target.scrollLeft);
    };
  }

  public setContent(value: string): TextViewer {
    var __i=0;
    this._control
        .querySelector('.scv_LineContainer')
        .innerHTML = (value + '\r\n').replace(/(.*)\r\n|\r|\n/mg, function(){ return ++__i + '<br/>';} ); 
    let __div = this._control.querySelector('.scv_TextContainer');
    __div.textContent = value;
    // onLineClick
    // __div.innerHTML = (__div.innerHTML + '\n').replace(/^(.*)\r\n|\r|\n/gim, '<span>$1</span><br/>')
    return this;
  }

  public getControl(): HTMLElement { 
    return this._control;
  }

}



         

