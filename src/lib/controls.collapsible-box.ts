
import {core} from "./core";
import { CoreEvent } from './core.events';

var __template = '<div id="collapsible-box-{0}" class="w3-border">' +
                 '  <button class="w3-block w3-border-0" style="outline-style:none">{1}<i style="margin: 2px;" class="fa fa-chevron-down w3-right"></i></button>' +      
                 '  <div class="w3-hide w3-border-top" style="overflow:auto"></div>' +                          
                 '</div>';
var __counter = 0;

export class CollapsibleBox{

  public loaded    = false;
  public collapsed = true;
  public onexpand  = new CoreEvent('CollapsibleBox.onexpand');

  private _control:HTMLElement;
  private _header:HTMLButtonElement;
  private _body:HTMLDivElement;
  private _onExpand = (sender:CollapsibleBox) => {};

  public constructor(titulo = 'título', 
                     content?: string | HTMLElement,
                     onexpand = (sender:CollapsibleBox) => {},
                     height = '10em'){
    this._control = core.build('div', { innerHTML : __template.format(++__counter, titulo)}, true);
    this._header = this._control.querySelector<HTMLButtonElement>('button');
    this._body = this._control.querySelector<HTMLDivElement>('div');
    this._header.onclick = (event:Event) => {
      this.collapsed ? this.expand() : this.collapse();
    };
    if(height != '-'){
      this._body.style.height = height;
    }
    if(content){
      this.setContent(content);
    }
    this._onExpand = onexpand;
  }

  public static create(titulo = 'título', height = '10em') {
    return new CollapsibleBox(titulo,'', undefined, height);
  }

  public hide(){
    this.collapse();
    this._header.classList.add('w3-hide');
    return this;
  }

  public show(){
    this._header.classList.remove('w3-hide');
    return this;
  }
          
  public appendTo(parent:HTMLElement){
    parent.appendChild(this._control);
    return this;
  }
          
  public collapse(){
    this._body.classList.add('w3-hide')
    let __e = this._header
                  .querySelector<HTMLButtonElement>('i');
    __e.classList.remove('fa-chevron-up');
    __e.classList.add('fa-chevron-down');
    this.collapsed = true;  
    return this;
  }
          
  public expand(){
    this._body.classList.remove('w3-hide');
    let __e = this._header
                  .querySelector<HTMLButtonElement>('i');
    __e.classList.remove('fa-chevron-down');
    __e.classList.add('fa-chevron-up');
    if(this._onExpand) this._onExpand(this);
    this.onexpand.dispatch(this);
    this.collapsed = false; 
    return this;                 
  }             

  public getControl(): HTMLElement { 
    return this._control;
  }

  public getBody(): HTMLElement { 
    return this._body;
  }

  public setContent(value: string | HTMLElement): CollapsibleBox {
    if(core.isString(value)){
      this._body.innerHTML = value as string;
    }else{
      this._body.innerHTML = '';
      this._body.appendChild(value as HTMLElement);
    }
    return this;
  }

}



         

