
import {core} from "./core";

var __css_code = '.svc_viewer{overflow:hidden;}' +
                 '.scv_Main  {position:absolute;top:0;left:0;right:0;bottom:0;overflow:auto;padding:0;}' +        
                 '.scv_TextContainer{ position:absolute;top:0;left:4.4em;right:0;height:auto;z-index:4;margin:0;user-select: text; }' +
                 '.scv_TextContainer{ padding:.4em;white-space:pre;overflow:initial;font-family:Monospace;tab-size:4;} ' +
                 '.scv_LineContainer{ padding:.4em;position:absolute;top:0;left:0;height:auto;margin:0;z-index:5;overflow:hidden;background-color:lightyellow;border-right:solid 1px silver;}' +
                 '.scv_LineContainer{ font-weight:bold;font-family:Monospace;color:Gray;text-align:right;width:3.5em;box-sizing:border-box;user-select:none }';

var __data_Uri = 'data:text/css;base64,LnN2Y192aWV3ZXJ7b3ZlcmZsb3c6aGlkZGVuO30NCi5zY3ZfTWFpbiAge3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowO292ZXJmbG93OmF1dG87cGFkZGluZzowO30gICAgICAgIA0KLnNjdl9UZXh0Q29udGFpbmVyeyBwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjQuNGVtO3JpZ2h0OjA7aGVpZ2h0OmF1dG87ei1pbmRleDo0O21hcmdpbjowO3VzZXItc2VsZWN0OiB0ZXh0OyB9DQouc2N2X1RleHRDb250YWluZXJ7IHBhZGRpbmc6LjRlbTt3aGl0ZS1zcGFjZTpwcmU7b3ZlcmZsb3c6aW5pdGlhbDtmb250LWZhbWlseTpNb25vc3BhY2U7dGFiLXNpemU6NDt9IA0KLnNjdl9MaW5lQ29udGFpbmVyeyBwYWRkaW5nOi40ZW07cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO2hlaWdodDphdXRvO21hcmdpbjowO3otaW5kZXg6NTtvdmVyZmxvdzpoaWRkZW47YmFja2dyb3VuZC1jb2xvcjpsaWdodHllbGxvdztib3JkZXItcmlnaHQ6c29saWQgMXB4IHNpbHZlcjt9DQouc2N2X0xpbmVDb250YWluZXJ7IGZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6TW9ub3NwYWNlO2NvbG9yOkdyYXk7dGV4dC1hbGlnbjpyaWdodDt3aWR0aDozLjVlbTtib3gtc2l6aW5nOmJvcmRlci1ib3g7dXNlci1zZWxlY3Q6bm9uZSB9';
var __data_Uri_2 = 'data:text/css;base64,' + window.btoa(__css_code);
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
                                            href : __data_Uri_2}));
  __css = true;
}

export class TextViewer {

  public id = 'svc_{0}'.format(++__counter);
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
  }

  public setContent(value: string): TextViewer {
    var __i=0;
    this._control
        .querySelector('.scv_LineContainer')
        .innerHTML = (value + '\r\n').replace(/.*\r\n|\r|\n/mg, function(){ return ++__i + '<br/>';} ); 
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



         

